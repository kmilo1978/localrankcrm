"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

/**
 * Reusable help tooltip — shows a "?" button that opens a popup with
 * instructions about what the section does and how to use it.
 */
export function HelpTooltip({ title, description, steps }: { title: string; description: string; steps?: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground hover:border-brand hover:text-brand transition-colors" title="¿Qué es esto?">
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-50 w-72 rounded-lg border bg-white p-4 shadow-lg animate-in fade-in slide-in-from-top-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <button onClick={() => setOpen(false)} className="rounded p-0.5 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            {steps && steps.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Cómo usar:</p>
                {steps.map((step, i) => (
                  <p key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[9px] font-bold text-brand">{i + 1}</span>
                    {step}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
