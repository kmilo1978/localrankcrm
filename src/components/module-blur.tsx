"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";

type Props = {
  moduleId: string;
  children: React.ReactNode;
  label?: string;
  reason?: "premium" | "privacy" | "coming_soon" | "locked";
};

const REASONS = {
  premium: { title: "Modulo Premium", desc: "Activa tu plan para desbloquear esta funcionalidad", icon: Lock, action: "Desbloquear" },
  privacy: { title: "Modo privacidad", desc: "El contenido esta oculto. Click para revelar.", icon: EyeOff, action: "Mostrar" },
  coming_soon: { title: "Proximamente", desc: "Este modulo esta en desarrollo y estara disponible pronto.", icon: Lock, action: "Notificarme" },
  locked: { title: "Bloqueado", desc: "No tienes permisos para ver este modulo.", icon: Lock, action: "Solicitar acceso" },
};

export function ModuleBlur({ moduleId, children, label, reason = "privacy" }: Props) {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      setBlurred(stored[moduleId] === true);
    }
  }, [moduleId]);

  function toggle() {
    const next = !blurred;
    setBlurred(next);
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      stored[moduleId] = next;
      localStorage.setItem("module_blur_config", JSON.stringify(stored));
    }
  }

  const reasonData = REASONS[reason];

  if (!blurred) {
    return (
      <div className="relative">
        {children}
        {/* Toggle button */}
        <button
          onClick={toggle}
          className="fixed bottom-20 right-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/80 text-white shadow-lg hover:bg-gray-900 transition-colors md:bottom-20 md:right-20"
          title="Activar blur (privacidad)"
        >
          <EyeOff className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Blurred content */}
      <div className="h-full blur-md pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="rounded-xl bg-white/95 backdrop-blur-sm border shadow-xl p-8 text-center max-w-sm mx-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
            <reasonData.icon className="h-6 w-6 text-brand" />
          </div>
          <h3 className="text-lg font-bold mb-1">{label || reasonData.title}</h3>
          <p className="text-sm text-muted-foreground mb-5">{reasonData.desc}</p>
          <button
            onClick={toggle}
            className="flex items-center justify-center gap-2 mx-auto rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
          >
            <Eye className="h-4 w-4" />{reason === "privacy" ? "Mostrar contenido" : reasonData.action}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone blur toggle button — can be placed in any page header
 * to let users blur/unblur the current module content.
 */
export function BlurToggle({ moduleId, className }: { moduleId: string; className?: string }) {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      setBlurred(stored[moduleId] === true);
    }
  }, [moduleId]);

  function toggle() {
    const next = !blurred;
    setBlurred(next);
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("module_blur_config") || "{}");
      stored[moduleId] = next;
      localStorage.setItem("module_blur_config", JSON.stringify(stored));
      // Force page re-render
      window.dispatchEvent(new Event("blur-toggle"));
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${blurred ? "bg-amber-50 border-amber-200 text-amber-700" : "hover:bg-gray-50 text-muted-foreground"} ${className || ""}`}
      title={blurred ? "Mostrar contenido" : "Ocultar contenido (privacidad)"}
    >
      {blurred ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {blurred ? "Blur activo" : "Blur"}
    </button>
  );
}
