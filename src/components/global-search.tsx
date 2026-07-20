"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchResult = { title: string; description: string; href: string; module: string };

const MODULES: { key: string; label: string; href: string; storageKey?: string; nameField?: string }[] = [
  { key: "contacts", label: "Contactos", href: "/preview/contacts", storageKey: "contacts", nameField: "name" },
  { key: "cold_contacts", label: "Prospeccion", href: "/preview/cold-contacts", storageKey: "cold_contacts", nameField: "name" },
  { key: "companies", label: "Companias", href: "/preview/companies", storageKey: "companies", nameField: "name" },
  { key: "pipeline", label: "Pipeline", href: "/preview/pipeline", storageKey: "pipeline_leads", nameField: "name" },
  { key: "opportunities", label: "Oportunidades", href: "/preview/opportunities", storageKey: "opportunities", nameField: "name" },
  { key: "tasks", label: "Tareas", href: "/preview/tasks", storageKey: "tasks", nameField: "title" },
  { key: "notes", label: "Notas", href: "/preview/notes", storageKey: "notes", nameField: "title" },
  { key: "projects", label: "Proyectos", href: "/preview/projects", storageKey: "projects_v3", nameField: "name" },
  { key: "suppliers", label: "Proveedores", href: "/preview/suppliers", storageKey: "suppliers", nameField: "name" },
  { key: "invoices", label: "Facturas", href: "/preview/cartera", storageKey: "cartera_invoices", nameField: "client" },
  { key: "radar", label: "Radar", href: "/preview/radar", storageKey: "radar_clips", nameField: "title" },
];

const NAV_PAGES: SearchResult[] = [
  { title: "Dashboard", description: "Vista general", href: "/preview/dashboard", module: "Navegacion" },
  { title: "Conversaciones", description: "Bandeja omnicanal", href: "/preview/inbox", module: "Navegacion" },
  { title: "Plantillas", description: "Templates de mensajes", href: "/preview/templates", module: "Navegacion" },
  { title: "Propuestas", description: "Editor de propuestas", href: "/preview/proposals", module: "Navegacion" },
  { title: "Calendario", description: "Citas y eventos", href: "/preview/calendar", module: "Navegacion" },
  { title: "Analytics", description: "KPIs y metricas", href: "/preview/analytics", module: "Navegacion" },
  { title: "Automatizaciones", description: "Reglas y triggers", href: "/preview/automations", module: "Navegacion" },
  { title: "Configuracion", description: "Ajustes del CRM", href: "/preview/settings/ai-providers", module: "Navegacion" },
  { title: "Recordatorios", description: "Alertas programadas", href: "/preview/reminders", module: "Navegacion" },
  { title: "Boveda", description: "Contrasenas y credenciales", href: "/preview/vault", module: "Navegacion" },
  { title: "Equipo", description: "Miembros y roles", href: "/preview/team", module: "Navegacion" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    // Search navigation pages
    NAV_PAGES.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) found.push(p);
    });

    // Search localStorage data
    MODULES.forEach(mod => {
      if (!mod.storageKey || !mod.nameField) return;
      try {
        const data = JSON.parse(localStorage.getItem(mod.storageKey) || "[]");
        (data as Record<string, unknown>[]).forEach(item => {
          const name = (item[mod.nameField!] as string) || "";
          if (name.toLowerCase().includes(q)) {
            found.push({ title: name, description: mod.label, href: mod.href, module: mod.label });
          }
        });
      } catch {}
    });

    setResults(found.slice(0, 10));
  }, [query]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="hidden md:flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:border-brand hover:text-brand transition-colors fixed top-3 right-4 z-30 shadow-sm">
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="rounded border bg-gray-50 px-1.5 py-0.5 text-[9px] font-mono">Ctrl+K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/40" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar contactos, tareas, modulos, notas..." className="flex-1 text-sm outline-none placeholder:text-muted-foreground" autoFocus />
          <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No se encontraron resultados para "{query}"</p>
          )}
          {results.map((r, i) => (
            <button key={i} onClick={() => navigate(r.href)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.title}</p>
                <p className="text-[10px] text-muted-foreground">{r.description}</p>
              </div>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-600 shrink-0">{r.module}</span>
            </button>
          ))}
          {!query.trim() && (
            <div className="px-4 py-4">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">Acceso rapido</p>
              <div className="grid grid-cols-2 gap-1">
                {NAV_PAGES.slice(0, 8).map(p => (
                  <button key={p.href} onClick={() => navigate(p.href)} className="rounded px-2 py-1.5 text-left text-xs hover:bg-gray-50">{p.title}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
