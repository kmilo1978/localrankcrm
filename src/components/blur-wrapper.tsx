"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldOff } from "lucide-react";
import { usePathname } from "next/navigation";

// Modules that are blurred by DEFAULT (sensitive data)
const DEFAULT_BLURRED_MODULES = ["vault", "cartera", "contacts", "pipeline", "proposals"];

/**
 * BlurWrapper — wraps the main content area and applies blur based on
 * the current route + module_blur_config in localStorage.
 * Sensitive modules (vault, cartera, etc.) are blurred by default until user reveals them.
 */
export function BlurWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [blurred, setBlurred] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      // If explicitly set, use that value
      if (moduleId in config) {
        setBlurred(config[moduleId] === true);
      } else {
        // Otherwise check if it's a default-blurred module
        setBlurred(DEFAULT_BLURRED_MODULES.includes(moduleId));
      }
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

  function restoreAll() {
    localStorage.setItem("module_blur_config", JSON.stringify({}));
    setBlurred(false);
    window.dispatchEvent(new Event("blur-toggle"));
  }

  if (!mounted) return <>{children}</>;

  const moduleId = getModuleId(pathname);
  if (!moduleId || moduleId === "settings" || moduleId === "dashboard") return <>{children}</>;

  return (
    <div className="relative h-full">
      {blurred ? (
        <>
          <div className="sticky top-0 z-[80] flex items-center justify-center gap-3 bg-brand py-3 px-4 shadow-lg flex-wrap">
            <Eye className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Contenido oculto (módulo sensible)</span>
            <button onClick={toggle} className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand hover:bg-gray-100">Mostrar este</button>
            <button onClick={restoreAll} className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1"><ShieldOff className="h-3 w-3" />Restaurar todo</button>
          </div>
          <div className="h-full blur-md pointer-events-none select-none opacity-50">{children}</div>
        </>
      ) : (
        <>
          {children}
          <button onClick={toggle} className="fixed bottom-20 right-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/70 text-white shadow hover:bg-gray-900 transition-colors md:right-20" title="Activar blur">
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
