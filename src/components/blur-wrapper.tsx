"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * BlurWrapper — wraps the main content area and applies blur based on
 * the current route + module_blur_config in localStorage.
 * Drop this in the layout around {children} to enable per-module blur.
 */
export function BlurWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [blurred, setBlurred] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Map routes to module IDs
  function getModuleId(path: string): string | null {
    const clean = path.replace("/preview", "");
    const segments = clean.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    return segments[0] || null;
  }

  useEffect(() => {
    setMounted(true);
    checkBlur();
    window.addEventListener("blur-toggle", checkBlur);
    return () => window.removeEventListener("blur-toggle", checkBlur);
  }, [pathname]);

  function checkBlur() {
    const moduleId = getModuleId(pathname);
    if (!moduleId) { setBlurred(false); return; }
    try {
      const config = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      setBlurred(config[moduleId] === true);
    } catch { setBlurred(false); }
  }

  function toggle() {
    const moduleId = getModuleId(pathname);
    if (!moduleId) return;
    const config = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
    config[moduleId] = !blurred;
    localStorage.setItem("module_blur_config", JSON.stringify(config));
    setBlurred(!blurred);
    window.dispatchEvent(new Event("blur-toggle"));
  }

  if (!mounted) return <>{children}</>;

  const moduleId = getModuleId(pathname);
  // Don't blur settings or dashboard
  if (!moduleId || moduleId === "settings" || moduleId === "dashboard") return <>{children}</>;

  return (
    <div className="relative h-full">
      {blurred ? (
        <>
          {/* TOP BANNER — impossible to miss */}
          <div className="sticky top-0 z-[80] flex items-center justify-center gap-3 bg-brand py-3 px-4 shadow-lg">
            <Eye className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Contenido oculto (blur activo)</span>
            <button onClick={toggle} className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand hover:bg-gray-100">Mostrar</button>
          </div>
          <div className="h-full blur-md pointer-events-none select-none opacity-50">{children}</div>
        </>
      ) : (
        <>
          {children}
          {/* Small blur toggle */}
          <button onClick={toggle} className="fixed bottom-20 right-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/70 text-white shadow hover:bg-gray-900 transition-colors md:right-20" title="Activar blur">
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
