"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Clock, Search, Sparkles, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchResult = { title: string; description: string; href: string; module: string; icon?: string };

const MODULES: { key: string; label: string; href: string; storageKey?: string; nameField?: string; icon: string }[] = [
  { key: "contacts", label: "Contactos", href: "/preview/contacts", storageKey: "contacts", nameField: "name", icon: "👥" },
  { key: "cold_contacts", label: "Prospección", href: "/preview/cold-contacts", storageKey: "cold_contacts", nameField: "name", icon: "🌡️" },
  { key: "companies", label: "Compañías", href: "/preview/companies", storageKey: "companies", nameField: "name", icon: "🏢" },
  { key: "pipeline", label: "Pipeline", href: "/preview/pipeline", storageKey: "pipeline_leads", nameField: "name", icon: "📊" },
  { key: "opportunities", label: "Oportunidades", href: "/preview/opportunities", storageKey: "opportunities", nameField: "name", icon: "🎯" },
  { key: "tasks", label: "Tareas", href: "/preview/tasks", storageKey: "tasks", nameField: "title", icon: "✅" },
  { key: "notes", label: "Notas", href: "/preview/notes", storageKey: "notes", nameField: "title", icon: "📝" },
  { key: "projects", label: "Proyectos", href: "/preview/projects", storageKey: "projects_v3", nameField: "name", icon: "📁" },
  { key: "suppliers", label: "Proveedores", href: "/preview/suppliers", storageKey: "suppliers", nameField: "name", icon: "🏭" },
  { key: "invoices", label: "Cartera", href: "/preview/cartera", storageKey: "cartera_invoices", nameField: "client", icon: "💳" },
  { key: "radar", label: "Radar", href: "/preview/radar", storageKey: "radar_clips", nameField: "title", icon: "📡" },
  { key: "checklists", label: "Checklists", href: "/preview/checklists", storageKey: "checklists_v2", nameField: "title", icon: "☑️" },
  { key: "reminders", label: "Recordatorios", href: "/preview/reminders", storageKey: "reminders_v2", nameField: "title", icon: "🔔" },
  { key: "subscriptions", label: "Suscripciones", href: "/preview/subscriptions", storageKey: "subscriptions", nameField: "name", icon: "💰" },
  { key: "social", label: "Social Outreach", href: "/preview/social-outreach", storageKey: "social_profiles", nameField: "name", icon: "💼" },
  { key: "files", label: "Archivos", href: "/preview/files", storageKey: "crm_files", nameField: "name", icon: "📄" },
  { key: "short_urls", label: "URLs", href: "/preview/url-shortener", storageKey: "short_urls", nameField: "label", icon: "🔗" },
];

const NAV_PAGES: SearchResult[] = [
  // Prospección
  { title: "Dashboard", description: "Vista general del CRM", href: "/preview/dashboard", module: "General", icon: "📊" },
  { title: "Radar", description: "Captura web + extensión", href: "/preview/radar", module: "Prospección", icon: "📡" },
  { title: "Lead Finder B2B", description: "Buscar leads con IA", href: "/preview/lead-finder", module: "Prospección", icon: "🔍" },
  { title: "Email Finder", description: "Encontrar y verificar emails", href: "/preview/email-finder", module: "Prospección", icon: "📧" },
  { title: "Enriquecimiento", description: "Templates de datos", href: "/preview/enrichment", module: "Prospección", icon: "⚡" },
  { title: "Social Outreach", description: "LinkedIn, Twitter, Instagram", href: "/preview/social-outreach", module: "Prospección", icon: "💼" },
  // CRM
  { title: "Contactos", description: "Base de contactos", href: "/preview/contacts", module: "CRM", icon: "👥" },
  { title: "Compañías", description: "Empresas", href: "/preview/companies", module: "CRM", icon: "🏢" },
  { title: "Pipeline", description: "Kanban de ventas", href: "/preview/pipeline", module: "CRM", icon: "📊" },
  { title: "Oportunidades", description: "Deals y negociaciones", href: "/preview/opportunities", module: "CRM", icon: "🎯" },
  { title: "Tareas", description: "Gestión de tareas", href: "/preview/tasks", module: "CRM", icon: "✅" },
  { title: "Calendario", description: "Citas y eventos", href: "/preview/calendar", module: "CRM", icon: "📅" },
  { title: "Focus", description: "Modo Pomodoro", href: "/preview/focus", module: "CRM", icon: "🧠" },
  { title: "Propuestas", description: "Editor de propuestas", href: "/preview/proposals", module: "CRM", icon: "📄" },
  { title: "Cartera", description: "Facturación y cobros", href: "/preview/cartera", module: "CRM", icon: "💳" },
  { title: "Suscripciones", description: "Pagos recurrentes", href: "/preview/subscriptions", module: "CRM", icon: "💰" },
  // Conversaciones
  { title: "Conversaciones", description: "Inbox omnicanal", href: "/preview/inbox", module: "Conversaciones", icon: "💬" },
  { title: "Meeting Reminders", description: "Recordatorios de reunión", href: "/preview/meeting-reminders", module: "Conversaciones", icon: "🔔" },
  { title: "Plantillas", description: "Templates de mensajes", href: "/preview/templates", module: "Conversaciones", icon: "📋" },
  // IA
  { title: "Constructor IA", description: "Ejecutar con lenguaje natural", href: "/preview/ai-builder", module: "IA", icon: "🤖" },
  { title: "Cotizador IA", description: "Propuestas con IA", href: "/preview/ai-quoter", module: "IA", icon: "📄" },
  { title: "IA & Automatización", description: "Agente IA y scoring", href: "/preview/ai-hub", module: "IA", icon: "🧠" },
  { title: "Automatizaciones", description: "Reglas y triggers", href: "/preview/automations", module: "IA", icon: "⚡" },
  // Operación
  { title: "Notas", description: "Con etiquetas y vistas", href: "/preview/notes", module: "Operación", icon: "📝" },
  { title: "Checklists", description: "Listas de verificación", href: "/preview/checklists", module: "Operación", icon: "☑️" },
  { title: "To-Do", description: "Diario/semanal/mensual", href: "/preview/todo", module: "Operación", icon: "📋" },
  { title: "Recordatorios", description: "Alertas programadas", href: "/preview/reminders", module: "Operación", icon: "🔔" },
  // Equipo
  { title: "Workspace", description: "Espacios de trabajo", href: "/preview/workspaces", module: "Equipo", icon: "📂" },
  { title: "Bóveda", description: "Contraseñas y claves", href: "/preview/vault", module: "Equipo", icon: "🔒" },
  { title: "Equipo", description: "Miembros y permisos", href: "/preview/team", module: "Equipo", icon: "👥" },
  // Datos
  { title: "Analytics", description: "KPIs y métricas", href: "/preview/analytics", module: "Datos", icon: "📈" },
  { title: "Archivos & IA", description: "Importar y preguntar", href: "/preview/files", module: "Datos", icon: "📁" },
  { title: "Acortador URL", description: "Links cortos + tracking", href: "/preview/url-shortener", module: "Datos", icon: "🔗" },
  // Config
  { title: "Ajustes", description: "Configuración general", href: "/preview/settings/whatsapp", module: "Config", icon: "⚙️" },
  { title: "Documentación", description: "Guía de uso", href: "/preview/settings/docs", module: "Ayuda", icon: "📖" },
  { title: "Sugerencias", description: "Enviar feedback", href: "/preview/settings/suggestions", module: "Ayuda", icon: "💡" },
];

// Quick actions
const QUICK_ACTIONS: SearchResult[] = [
  { title: "Nuevo contacto", description: "Crear contacto rápido", href: "/preview/contacts", module: "Acción", icon: "➕" },
  { title: "Nueva tarea", description: "Crear tarea", href: "/preview/tasks", module: "Acción", icon: "➕" },
  { title: "Nueva nota", description: "Crear nota", href: "/preview/notes", module: "Acción", icon: "➕" },
  { title: "Buscar leads", description: "Lead Finder B2B", href: "/preview/lead-finder", module: "Acción", icon: "🔍" },
  { title: "Preguntar a IA", description: "Constructor IA", href: "/preview/ai-builder", module: "Acción", icon: "🤖" },
  { title: "Generar propuesta", description: "Cotizador IA", href: "/preview/ai-quoter", module: "Acción", icon: "📄" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
    if (open) {
      inputRef.current?.focus();
      try { setRecentSearches(JSON.parse(localStorage.getItem("localrank_recent_searches") || "[]")); } catch { setRecentSearches([]); }
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    // Search navigation pages
    NAV_PAGES.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.module.toLowerCase().includes(q)) found.push(p);
    });

    // Search quick actions
    QUICK_ACTIONS.forEach(a => {
      if (a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) found.push(a);
    });

    // Search localStorage data
    MODULES.forEach(mod => {
      if (!mod.storageKey || !mod.nameField) return;
      try {
        // Check workspace-scoped key first, then global
        const wsId = localStorage.getItem("localrank_active_workspace") || "default";
        const wsKey = `localrank_ws_${wsId}_${mod.storageKey}`;
        const globalKey = `localrank_${mod.storageKey}`;
        const raw = localStorage.getItem(wsKey) || localStorage.getItem(globalKey) || localStorage.getItem(mod.storageKey);
        if (!raw) return;
        const data = JSON.parse(raw);
        (data as Record<string, unknown>[]).forEach(item => {
          const name = (item[mod.nameField!] as string) || "";
          const extra = (item.description as string) || (item.content as string) || (item.company as string) || "";
          if (name.toLowerCase().includes(q) || extra.toLowerCase().includes(q)) {
            found.push({ title: name, description: `${mod.label}${extra ? " · " + extra.slice(0, 40) : ""}`, href: mod.href, module: mod.label, icon: mod.icon });
          }
        });
      } catch {}
    });

    setResults(found.slice(0, 12));
  }, [query]);

  function navigate(href: string) {
    // Save recent search
    if (query.trim()) {
      const recent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
      setRecentSearches(recent);
      localStorage.setItem("localrank_recent_searches", JSON.stringify(recent));
    }
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="hidden md:flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:border-brand hover:text-brand transition-colors fixed top-3 right-4 z-[45] shadow-sm">
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="rounded border bg-gray-50 px-1.5 py-0.5 text-[9px] font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 bg-black/40" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && results.length > 0) navigate(results[0]!.href); }} placeholder="Buscar contactos, módulos, tareas, acciones..." className="flex-1 text-sm outline-none placeholder:text-muted-foreground" autoFocus />
          {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
          <button onClick={() => setOpen(false)} className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:bg-gray-100">Esc</button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No se encontraron resultados para "{query}"</p>
          )}

          {results.length > 0 && (
            <div className="py-1">
              {results.map((r, i) => (
                <button key={i} onClick={() => navigate(r.href)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-base shrink-0">{r.icon || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{r.description}</p>
                  </div>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-600 shrink-0">{r.module}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Empty state — quick actions + recents */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="h-3 w-3" />Recientes</p>
                  <div className="flex flex-wrap gap-1">
                    {recentSearches.map((r, i) => (
                      <button key={i} onClick={() => setQuery(r)} className="rounded-full border px-2.5 py-1 text-[10px] hover:bg-gray-50">{r}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1"><Zap className="h-3 w-3" />Acciones rápidas</p>
                <div className="grid grid-cols-2 gap-1">
                  {QUICK_ACTIONS.map(a => (
                    <button key={a.href + a.title} onClick={() => navigate(a.href)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50">
                      <span>{a.icon}</span><span>{a.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="flex items-center gap-2 rounded-lg bg-brand/5 px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 text-brand shrink-0" />
                <p className="text-[10px] text-muted-foreground">Busca por nombre de contacto, empresa, módulo, o escribe una acción ("nueva tarea", "buscar leads")</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
