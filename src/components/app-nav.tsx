"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
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

// All nav items (combined pool)
const ALL_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cold-contacts", label: "Prospección", icon: Thermometer },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/companies", label: "Compañías", icon: Building2 },
  { href: "/opportunities", label: "Oportunidades", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/inbox", label: "Conversaciones", icon: MessageSquare, badge: true },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/focus", label: "Focus", icon: Target },
  { href: "/ai-hub", label: "IA & Automatización", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/files", label: "Archivos & IA", icon: FileText },
  { href: "/templates", label: "Plantillas", icon: Send },
  { href: "/proposals", label: "Propuestas", icon: FileText },
  { href: "/cartera", label: "Cartera", icon: CreditCard },
  { href: "/checklists", label: "Checklists", icon: CircleCheckBig },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/reminders", label: "Recordatorios", icon: Clock },
  { href: "/todo", label: "To-Do", icon: CircleCheckBig },
  { href: "/automations", label: "Automatizaciones", icon: Zap },
  { href: "/sequences", label: "Secuencias", icon: GitBranch },
  { href: "/scheduler", label: "Scheduler", icon: Clock },
  { href: "/lead-routing", label: "Lead Routing", icon: GitBranch },
  { href: "/scoring", label: "Scoring", icon: Star },
  { href: "/omnichannel", label: "Omnicanal", icon: Activity },
  { href: "/social", label: "Social", icon: Heart },
  { href: "/radar", label: "Radar", icon: Bookmark },
  { href: "/forms", label: "Formularios", icon: ClipboardList },
  { href: "/import", label: "Importar", icon: Database },
  { href: "/suppliers", label: "Proveedores", icon: Building2 },
  { href: "/notes", label: "Notas", icon: StickyNote },
  { href: "/labels", label: "Etiquetas", icon: Tag },
  { href: "/team", label: "Equipo", icon: UsersRound },
  { href: "/team-chat", label: "Chat interno", icon: MessageSquare },
  { href: "/vault", label: "Bóveda", icon: Database },
  { href: "/workspaces", label: "Workspace", icon: FolderOpen },
  { href: "/audit", label: "Auditoría", icon: History },
  { href: "/lab", label: "Laboratorio", icon: FlaskConical },
  { href: "/url-shortener", label: "Acortador URL", icon: Link2 },
  { href: "/enrichment", label: "Enriquecimiento", icon: Database },
  { href: "/ai-builder", label: "Constructor IA", icon: Bot },
  { href: "/email-finder", label: "Email Finder", icon: Mail },
  { href: "/lead-finder", label: "Lead Finder B2B", icon: Users },
] as const;

const DEFAULT_MAIN_HREFS = ["/dashboard", "/cold-contacts", "/contacts", "/companies", "/opportunities", "/pipeline", "/inbox", "/tasks", "/calendar", "/focus", "/ai-hub", "/analytics", "/files"];

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
  const [activeWsName, setActiveWsName] = useState("");
  const isPreview = pathname.startsWith("/preview");
  const prefix = isPreview ? "/preview" : "";

  // Load custom menu and workspace name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("localrank_nav_main");
      if (stored) { try { setMainHrefs(JSON.parse(stored)); } catch {} }
      // Get active workspace name
      const wsId = getActiveWorkspaceId();
      if (wsId && wsId !== "default") {
        const workspaces = loadFromStorage<Array<{id: string; name: string}>>("workspaces_v2", []);
        const ws = workspaces.find(w => w.id === wsId);
        if (ws) setActiveWsName(ws.name);
      }
    }
  }, []);

  function saveMainHrefs(hrefs: string[]) {
    setMainHrefs(hrefs);
    localStorage.setItem("localrank_nav_main", JSON.stringify(hrefs));
  }

  function toggleMainItem(href: string) {
    const next = mainHrefs.includes(href) ? mainHrefs.filter(h => h !== href) : [...mainHrefs, href];
    saveMainHrefs(next);
  }

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
      {/* Brand white-label */}
      <div className="mb-6 flex items-center gap-2.5 px-3">
        <img src="/icon.svg" alt={branding.name} className="h-[32px] w-[32px] shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-[700] leading-tight tracking-tight text-white">
            {branding.name}
          </span>
          <span className="block text-[11px] text-white/60">{activeWsName || "Enterprise CRM"}</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {navMain.map((item) => {
          const href = `${prefix}${item.href}`;
          const active =
            pathname === href || pathname.startsWith(`${href}/`) ||
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.href} className="flex items-center">
              <Link
                href={href}
                className={cn(
                  "flex flex-1 items-center gap-[11px] rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--sidebar-active)] border-l-[3px] border-[var(--sidebar-active-text)] text-[var(--sidebar-active-text)]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon
                  className={cn("h-[18px] w-[18px]", active ? "text-[var(--sidebar-active-text)]" : "text-white/70")}
                  strokeWidth={1.7}
                />
                <span className="flex-1">{item.label}</span>
                {"badge" in item && item.badge && unread > 0 && (
                  <span className={cn("flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold", active ? "bg-white text-[var(--sidebar-bg)]" : "bg-white/20 text-white")}>{unread}</span>
                )}
              </Link>
              {customizing && (
                <button onClick={() => toggleMainItem(item.href)} className="rounded p-1 text-white/40 hover:text-red-400 shrink-0" title="Quitar del menú principal"><X className="h-3 w-3" /></button>
              )}
            </div>
          );
        })}

        {/* Customize + Collapse toggle */}
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-1 items-center gap-[11px] rounded-lg px-3 py-2 text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <ChevronDown className={cn("h-[14px] w-[14px] transition-transform", moreOpen && "rotate-180")} strokeWidth={1.7} />
            <span className="flex-1 text-left">{moreOpen ? "Menos" : "Más módulos"}</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px]">{navMore.length}</span>
          </button>
          <button onClick={() => setCustomizing(!customizing)} className={cn("rounded p-1.5 transition-colors", customizing ? "bg-white/20 text-white" : "text-white/30 hover:text-white/60")} title="Personalizar menú">
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {moreOpen && (
          <div className="space-y-0.5 pl-1">
            {navMore.map((item) => {
              const href = `${prefix}${item.href}`;
              const active =
                pathname === href || pathname.startsWith(`${href}/`) ||
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <div key={item.href} className="flex items-center">
                  <Link
                    href={href}
                    className={cn(
                      "flex flex-1 items-center gap-[10px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("h-[14px] w-[14px]", active ? "text-[var(--sidebar-active-text)]" : "text-white/50")} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                  {customizing && (
                    <button onClick={() => toggleMainItem(item.href)} className="rounded p-1 text-white/40 hover:text-green-400 shrink-0" title="Agregar al menú principal"><Pin className="h-3 w-3" /></button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      <div className="flex-1" />

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
