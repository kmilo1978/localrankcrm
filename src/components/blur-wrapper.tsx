"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, ShieldOff } from "lucide-react";
import { usePathname } from "next/navigation";

// Modules that are blurred by DEFAULT (sensitive data)
const DEFAULT_BLURRED_MODULES = ["vault", "cartera", "contacts", "pipeline", "proposals"];

// Modules that REQUIRE PIN to access (highest security)
const PIN_PROTECTED_MODULES = ["vault", "cartera"];

export function BlurWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [blurred, setBlurred] = useState(false);
  const [pinLocked, setPinLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
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
    checkPinLock();
    window.addEventListener("blur-toggle", checkBlur);
    return () => window.removeEventListener("blur-toggle", checkBlur);
  }, [pathname]);

  function checkBlur() {
    const moduleId = getModuleId(pathname);
    if (!moduleId) { setBlurred(false); return; }
    try {
      const config = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      if (moduleId in config) {
        setBlurred(config[moduleId] === true);
      } else {
        setBlurred(DEFAULT_BLURRED_MODULES.includes(moduleId));
      }
    } catch { setBlurred(false); }
  }

  function checkPinLock() {
    const moduleId = getModuleId(pathname);
    if (!moduleId || !PIN_PROTECTED_MODULES.includes(moduleId)) {
      setPinLocked(false);
      return;
    }
    // Check if PIN is set and if session is unlocked
    const pin = localStorage.getItem("localrank_module_pin");
    if (!pin) { setPinLocked(false); return; } // No PIN set = no lock
    const unlocked = sessionStorage.getItem(`localrank_unlocked_${moduleId}`);
    setPinLocked(!unlocked);
  }

  function verifyPin() {
    const storedPin = localStorage.getItem("localrank_module_pin");
    if (pinInput === storedPin) {
      const moduleId = getModuleId(pathname);
      if (moduleId) sessionStorage.setItem(`localrank_unlocked_${moduleId}`, "true");
      setPinLocked(false);
      setPinInput("");
      setPinError(false);
      // Also unblur
      setBlurred(false);
      const config = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      if (moduleId) config[moduleId] = false;
      localStorage.setItem("module_blur_config", JSON.stringify(config));
    } else {
      setPinError(true);
      setPinInput("");
    }
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

  // PIN LOCK — requires PIN to access
  if (pinLocked) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="w-full max-w-xs text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold mb-1">Módulo protegido</h2>
          <p className="text-sm text-muted-foreground mb-4">Este módulo requiere PIN de acceso para ver su contenido.</p>
          <div className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={e => { if (e.key === "Enter") verifyPin(); }}
              placeholder="Ingresa tu PIN"
              maxLength={6}
              className={`w-full rounded-lg border px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-brand focus:outline-none ${pinError ? "border-red-400 bg-red-50" : ""}`}
              autoFocus
            />
            {pinError && <p className="text-xs text-red-500">PIN incorrecto</p>}
            <button onClick={verifyPin} className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover">Desbloquear</button>
            <p className="text-[10px] text-muted-foreground">Configura tu PIN en Ajustes → Cuenta. Sin PIN configurado, el módulo se abre sin restricción.</p>
          </div>
        </div>
      </div>
    );
  }

  // BLUR — visual protection
  if (blurred) {
    return (
      <div className="relative h-full">
        <div className="sticky top-0 z-[80] flex items-center justify-center gap-3 bg-brand py-3 px-4 shadow-lg flex-wrap">
          <Eye className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">Contenido oculto (módulo sensible)</span>
          <button onClick={toggle} className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand hover:bg-gray-100">Mostrar este</button>
          <button onClick={restoreAll} className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1"><ShieldOff className="h-3 w-3" />Restaurar todo</button>
        </div>
        <div className="h-full blur-md pointer-events-none select-none opacity-50">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {children}
      <button onClick={toggle} className="fixed bottom-20 right-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/70 text-white shadow hover:bg-gray-900 transition-colors md:right-20" title="Activar blur">
        <EyeOff className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
