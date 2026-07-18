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
          <div className="h-full blur-md pointer-events-none select-none opacity-50">{children}</div>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="rounded-xl bg-white/95 backdrop-blur-sm border shadow-xl p-8 text-center max-w-xs mx-4">
              <EyeOff className="h-10 w-10 text-brand mx-auto mb-3" />
              <h3 className="text-sm font-bold mb-1">Contenido oculto</h3>
              <p className="text-xs text-muted-foreground mb-4">El modulo esta en modo privacidad</p>
              <button onClick={toggle} className="flex items-center justify-center gap-2 mx-auto rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover">
                <Eye className="h-4 w-4" />Mostrar
              </button>
            </div>
          </div>
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
