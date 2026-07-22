"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Book,
  Bookmark,
  Bot,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleCheckBig,
  ClipboardList,
  Clock,
  CreditCard,
  Database,
  FileText,
  FlaskConical,
  FolderKanban,
  FolderOpen,
  GitBranch,
  Heart,
  History,
  Kanban,
  LayoutDashboard,
  Lightbulb,
  Link2,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Pin,
  Send,
  Settings,
  Settings2,
  Star,
  StickyNote,
  Tag,
  Target,
  Thermometer,
  Trash2,
  Users,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import type { Branding } from "@/lib/branding";
import { cn, initials } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { getActiveWorkspaceId, loadFromStorage } from "@/lib/local-storage";
import { useEvents } from "@/components/use-events";

// Navigation organized by categories (as per architecture)
type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; badge?: boolean };
type NavCategory = { label: string; items: NavItem[] };

const NAV_CATEGORIES: NavCategory[] = [
  { label: "Prospección", items: [
    { href: "/radar", label: "Radar", icon: Bookmark },
    { href: "/lead-finder", label: "Lead Finder B2B", icon: Users },
    { href: "/cold-contacts", label: "Prospección", icon: Thermometer },
    { href: "/email-finder", label: "Email Finder", icon: Mail },
    { href: "/enrichment", label: "Enriquecimiento", icon: Database },
    { href: "/social-outreach", label: "Social Outreach", icon: MessageSquare },
    { href: "/social", label: "Social Engagement", icon: Heart },
    { href: "/forms", label: "Formularios", icon: ClipboardList },
    { href: "/import", label: "Importar", icon: Database },
    { href: "/suppliers", label: "Proveedores", icon: Building2 },
  ]},
  { label: "CRM & Ventas", items: [
    { href: "/contacts", label: "Contactos", icon: Users },
    { href: "/companies", label: "Compañías", icon: Building2 },
    { href: "/opportunities", label: "Oportunidades", icon: Target },
    { href: "/pipeline", label: "Pipeline", icon: Kanban },
    { href: "/tasks", label: "Tareas", icon: CheckSquare },
    { href: "/calendar", label: "Calendario", icon: Calendar },
    { href: "/focus", label: "Focus", icon: Target },
    { href: "/proposals", label: "Propuestas", icon: FileText },
    { href: "/cartera", label: "Cartera", icon: CreditCard },
    { href: "/subscriptions", label: "Suscripciones", icon: CreditCard },
  ]},
  { label: "Conversaciones", items: [
    { href: "/inbox", label: "Conversaciones", icon: MessageSquare, badge: true },
    { href: "/omnichannel", label: "Omnicanal", icon: Activity },
    { href: "/meeting-reminders", label: "Meeting Reminders", icon: Bell },
    { href: "/templates", label: "Plantillas", icon: Send },
    { href: "/settings/quick-replies", label: "Resp. Rápidas", icon: Send },
    { href: "/scheduler", label: "Scheduler", icon: Clock },
  ]},
  { label: "Automatización & IA", items: [
    { href: "/ai-hub", label: "IA & Automatización", icon: Bot },
    { href: "/automations", label: "Automatizaciones", icon: Zap },
    { href: "/sequences", label: "Secuencias", icon: GitBranch },
    { href: "/settings/flows", label: "Flows", icon: GitBranch },
    { href: "/lead-routing", label: "Lead Routing", icon: GitBranch },
    { href: "/scoring", label: "Scoring", icon: Star },
    { href: "/ai-builder", label: "Constructor IA", icon: Bot },
    { href: "/ai-quoter", label: "Cotizador IA", icon: FileText },
  ]},
  { label: "Operación", items: [
    { href: "/projects", label: "Proyectos", icon: FolderKanban },
    { href: "/checklists", label: "Checklists", icon: CircleCheckBig },
    { href: "/reminders", label: "Recordatorios", icon: Clock },
    { href: "/todo", label: "To-Do", icon: CircleCheckBig },
    { href: "/notes", label: "Notas", icon: StickyNote },
    { href: "/labels", label: "Etiquetas", icon: Tag },
  ]},
  { label: "Equipo & Espacios", items: [
    { href: "/team", label: "Equipo", icon: UsersRound },
    { href: "/team-chat", label: "Chat interno", icon: MessageSquare },
    { href: "/workspaces", label: "Workspace", icon: FolderOpen },
    { href: "/vault", label: "Bóveda", icon: Database },
  ]},
  { label: "Datos & Control", items: [
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/files", label: "Archivos & IA", icon: FileText },
    { href: "/settings/ocr", label: "OCR", icon: FileText },
    { href: "/backup", label: "Backup", icon: Database },
    { href: "/audit", label: "Auditoría", icon: History },
    { href: "/url-shortener", label: "Acortador URL", icon: Link2 },
    { href: "/lab", label: "Laboratorio", icon: FlaskConical },
  ]},
];

// Flat list for customization
const ALL_NAV = NAV_CATEGORIES.flatMap(c => c.items);
const DEFAULT_MAIN_HREFS = ["/dashboard", "/radar", "/lead-finder", "/cold-contacts", "/contacts", "/pipeline", "/inbox", "/tasks", "/ai-hub", "/analytics"];

export function AppNav({
  branding,
  userName,
  role,
}: {
  branding: Branding;
  userName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [mainHrefs, setMainHrefs] = useState<string[]>(DEFAULT_MAIN_HREFS);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [activeWsName, setActiveWsName] = useState("");
  const isPreview = pathname.startsWith("/preview");
  const prefix = isPreview ? "/preview" : "";

  // Load workspace name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get active workspace name
      const wsId = getActiveWorkspaceId();
      if (wsId && wsId !== "default") {
        const workspaces = loadFromStorage<Array<{id: string; name: string}>>("workspaces_v2", []);
        const ws = workspaces.find(w => w.id === wsId);
        if (ws) setActiveWsName(ws.name);
      }
    }
  }, []);

  const navMain = ALL_NAV.filter(item => mainHrefs.includes(item.href));
  const navMore = ALL_NAV.filter(item => !mainHrefs.includes(item.href));

  async function refetchUnread() {
    if (isPreview) return;
    const res = await fetch("/api/conversations").catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json()) as {
      conversations: { unreadCount: number }[];
    };
    setUnread(data.conversations.reduce((a, c) => a + c.unreadCount, 0));
  }

  useEffect(() => {
    void refetchUnread();
  }, []);

  useEvents({
    onMessageNew: () => void refetchUnread(),
    onConversationUpdated: () => void refetchUnread(),
  });

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sidebar-bg)] text-white shadow-lg md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "flex w-60 shrink-0 flex-col border-r bg-[var(--sidebar-bg)] px-3 pb-3.5 pt-6",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile close button */}
        <button onClick={() => setMobileOpen(false)} className="absolute right-2 top-2 rounded p-1 text-white/60 hover:text-white md:hidden"><X className="h-5 w-5" /></button>
      {/* Brand white-label + theme toggle */}
      <div className="mb-6 flex items-center gap-2.5 px-3">
        <img src="/icon.svg" alt={branding.name} className="h-[32px] w-[32px] shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-[700] leading-tight tracking-tight text-white">
            {branding.name}
          </span>
          <span className="block text-[11px] text-white/60">{activeWsName || "Enterprise CRM"}</span>
        </span>
        <button
          onClick={() => {
            const root = document.documentElement;
            const isDark = root.classList.contains("dark");
            if (isDark) { root.classList.remove("dark"); localStorage.setItem("localrank_appearance_config", JSON.stringify({ theme: "light", language: "es" })); }
            else { root.classList.add("dark"); localStorage.setItem("localrank_appearance_config", JSON.stringify({ theme: "dark", language: "es" })); }
          }}
          className="rounded-full p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Cambiar tema claro/oscuro"
        >
          <svg className="h-4 w-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg className="h-4 w-4 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {/* Dashboard — always visible */}
        <Link href={`${prefix}/dashboard`} className={cn("flex items-center gap-[11px] rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", (pathname === `${prefix}/dashboard` || pathname === "/dashboard") ? "bg-[var(--sidebar-active)] border-l-[3px] border-[var(--sidebar-active-text)] text-[var(--sidebar-active-text)]" : "text-white/70 hover:text-white hover:bg-white/10")}>
          <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.7} /><span>Dashboard</span>
        </Link>

        {/* Categories */}
        {NAV_CATEGORIES.map(cat => {
          const isExpanded = expandedCats.has(cat.label);
          const hasActive = cat.items.some(item => pathname === `${prefix}${item.href}` || pathname === item.href || pathname.startsWith(`${prefix}${item.href}/`));
          return (
            <div key={cat.label}>
              <button onClick={() => { const next = new Set(expandedCats); if (next.has(cat.label)) next.delete(cat.label); else next.add(cat.label); setExpandedCats(next); }} className={cn("flex w-full items-center gap-[11px] rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors mt-1", hasActive ? "text-[var(--sidebar-active-text)]" : "text-white/40 hover:text-white/60")}>
                <ChevronDown className={cn("h-3 w-3 transition-transform", !isExpanded && "-rotate-90")} />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className="text-[9px] font-normal opacity-60">{cat.items.length}</span>
              </button>
              {isExpanded && (
                <div className="space-y-0.5 ml-1">
                  {cat.items.map(item => {
                    const href = `${prefix}${item.href}`;
                    const active = pathname === href || pathname.startsWith(`${href}/`) || pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link key={item.href} href={href} className={cn("flex items-center gap-[10px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", active ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]" : "text-white/60 hover:text-white hover:bg-white/8")}>
                        <item.icon className={cn("h-[14px] w-[14px]", active ? "text-[var(--sidebar-active-text)]" : "text-white/50")} strokeWidth={1.5} />
                        <span className="flex-1">{item.label}</span>
                        {"badge" in item && item.badge && unread > 0 && <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-white/20 px-1 text-[9px] font-semibold text-white">{unread}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Help & Support */}
      <div className="mb-1 space-y-0.5 border-t border-white/10 pt-2">
        <Link href={`${prefix}/docs`} className={cn("flex items-center gap-[10px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", pathname === `${prefix}/docs` || pathname === "/docs" ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]" : "text-white/50 hover:text-white/80 hover:bg-white/5")}>
          <Book className="h-[14px] w-[14px]" strokeWidth={1.5} /><span>Documentación</span>
        </Link>
        <Link href={`${prefix}/suggestions`} className={cn("flex items-center gap-[10px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", pathname === `${prefix}/suggestions` || pathname === "/suggestions" ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]" : "text-white/50 hover:text-white/80 hover:bg-white/5")}>
          <Lightbulb className="h-[14px] w-[14px]" strokeWidth={1.5} /><span>Sugerencias</span>
        </Link>
        <Link href={`${prefix}/trash`} className={cn("flex items-center gap-[10px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", pathname.includes("/trash") ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]" : "text-white/50 hover:text-white/80 hover:bg-white/5")}>
          <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.5} /><span>Papelera</span>
        </Link>
      </div>

      <Link
        href={`${prefix}/settings`}
        className={cn(
          "flex items-center gap-[11px] rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          pathname.startsWith("/settings") || pathname.startsWith("/preview/settings")
            ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]"
            : "text-white/70 hover:text-white hover:bg-white/10"
        )}
      >
        <Settings
          className={cn(
            "h-[18px] w-[18px]",
            pathname.startsWith("/settings") || pathname.startsWith("/preview/settings") ? "text-[var(--sidebar-active-text)]" : "text-white/70"
          )}
          strokeWidth={1.7}
        />
        Ajustes
      </Link>

      <div className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-white/10">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
          {initials(userName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-white">{userName}</span>
          <span className="block text-[11px] text-white/60">
            {role === "owner" ? "Propietario" : "Equipo"}
          </span>
        </span>
        <button
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="rounded p-1 text-white/50 hover:text-white"
          onClick={async () => {
            if (!isPreview) await signOut();
            router.push(isPreview ? "/preview/dashboard" : "/login");
            router.refresh();
          }}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>

      {/* Save session checklist */}
      <div className="mx-3 mb-2 mt-1 rounded-lg bg-white/5 px-3 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked={typeof window !== "undefined" && localStorage.getItem("localrank_save_session") === "true"}
            onChange={(e) => {
              if (typeof window !== "undefined") {
                localStorage.setItem("localrank_save_session", String(e.target.checked));
                if (e.target.checked) {
                  localStorage.setItem("localrank_session_saved_at", new Date().toISOString());
                }
              }
            }}
            className="accent-[var(--sidebar-active-text)] h-3.5 w-3.5 rounded"
          />
          <span className="text-[11px] text-white/70">Guardar sesión</span>
        </label>
        <p className="mt-0.5 pl-5.5 text-[9px] text-white/40">Mantiene tus datos entre visitas</p>
      </div>
    </aside>
    </>
  );
}
