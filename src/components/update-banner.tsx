"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

const CURRENT_VERSION = "2.1.0";
const UPDATES = [
  { version: "2.1.0", date: "20 Jul 2026", title: "Suscripciones, Meeting Reminders IA, Cotizador IA", highlights: ["Módulo de suscripciones y pagos recurrentes", "Meeting Reminders con IA (genera mensajes + sugiere timing)", "Cotizador de propuestas con IA", "Menú reorganizado por categorías colapsables", "50+ módulos disponibles"] },
  { version: "2.0.5", date: "20 Jul 2026", title: "Lead Finder B2B, Email Tools, Social Outreach", highlights: ["Localizador de leads con búsqueda IA", "Email Finder + Verificador + Escritor IA + Limpiar listas", "Social Outreach multicanal (LinkedIn/Twitter/Instagram/FB/TikTok)"] },
  { version: "2.0.4", date: "20 Jul 2026", title: "Workspace aislados, Archivos & IA, Focus", highlights: ["Cada workspace tiene datos independientes", "Importar archivos y preguntarle a la IA", "Modo Pomodoro con timer y estadísticas"] },
];

export function UpdateBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("localrank_update_dismissed");
    if (dismissed !== CURRENT_VERSION) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem("localrank_update_dismissed", CURRENT_VERSION);
  }

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed top-3 left-16 md:left-[260px] z-[60] max-w-sm animate-in slide-in-from-top">
        <div className="rounded-lg border bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 shrink-0">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Actualización v{CURRENT_VERSION}</p>
              <p className="text-[10px] text-muted-foreground truncate">{UPDATES[0]?.title}</p>
            </div>
            <button onClick={() => setShowDetails(true)} className="rounded px-2 py-1 text-[10px] font-medium text-brand hover:bg-brand/5 shrink-0">Ver</button>
            <button onClick={dismiss} className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-gray-100 shrink-0"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Details modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 bg-black/30" onClick={() => setShowDetails(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand" />Novedades</h3>
              <button onClick={() => { setShowDetails(false); dismiss(); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              {UPDATES.map(update => (
                <div key={update.version} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand">v{update.version}</span>
                    <span className="text-[10px] text-muted-foreground">{update.date}</span>
                  </div>
                  <p className="text-xs font-medium mb-2">{update.title}</p>
                  <ul className="space-y-1">
                    {update.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="text-green-500 shrink-0 mt-0.5">✓</span>{h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowDetails(false); dismiss(); }} className="w-full mt-4 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}
