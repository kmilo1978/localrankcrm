"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
    onHcaptchaLoad?: () => void;
  }
}

type CaptchaProps = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

// Site key: use test key if not configured (always passes)
const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

export function Captcha({ onVerify, onExpire }: CaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load hCaptcha script
    if (typeof window !== "undefined" && !document.getElementById("hcaptcha-script")) {
      const script = document.createElement("script");
      script.id = "hcaptcha-script";
      script.src = "https://js.hcaptcha.com/1/api.js?onload=onHcaptchaLoad&render=explicit";
      script.async = true;
      window.onHcaptchaLoad = () => setLoaded(true);
      document.head.appendChild(script);
    } else if (window.hcaptcha) {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetIdRef.current) return;
    try {
      widgetIdRef.current = window.hcaptcha!.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onExpire?.(),
        theme: "light",
        size: "normal",
      });
    } catch {}
  }, [loaded, onVerify, onExpire]);

  return <div ref={containerRef} className="flex justify-center my-3" />;
}

/** Verify captcha token server-side */
export async function verifyCaptchaToken(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return true; // No secret configured = skip validation (dev mode)

  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${secret}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
