"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  Calendar,
  CheckSquare,
  CircleCheckBig,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  FolderOpen,
  GitBranch,
  Heart,
  History,
  Kanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Send,
  Settings,
  Star,
  StickyNote,
  Tag,
  Target,
  Thermometer,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import type { Branding } from "@/lib/branding";
import { cn, initials } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { useEvents } from "@/components/use-events";

// Navigation organized by: Context → Revenue Ops → Execution → Intelligence → Admin
const NAV = [
  // --- Context ---
  { href: "/workspaces", label: "Workspace", icon: FolderOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  // --- Revenue: Capture & Qualify ---
  { href: "/cold-contacts", label: "Prospección", icon: Thermometer },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/companies", label: "Compañías", icon: Building2 },
  { href: "/opportunities", label: "Oportunidades", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  // --- Revenue: Close ---
  { href: "/inbox", label: "Conversaciones", icon: MessageSquare, badge: true },
  { href: "/templates", label: "Plantillas", icon: Send },
  { href: "/proposals", label: "Propuestas", icon: FileText },
  // --- Execution ---
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/todo", label: "To-Do", icon: CircleCheckBig },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  // --- Intelligence ---
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-hub", label: "IA & Automatización", icon: Bot },
  { href: "/automations", label: "Automatizaciones", icon: Zap },
  { href: "/lead-routing", label: "Lead Routing", icon: GitBranch },
  { href: "/scoring", label: "Scoring", icon: Star },
  { href: "/audit", label: "Auditoría", icon: History },
] as const;

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
  const isPreview = pathname.startsWith("/preview");
  const prefix = isPreview ? "/preview" : "";

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

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-[var(--sidebar-bg)] px-3 pb-3.5 pt-6">
      {/* Brand white-label */}
      <div className="mb-6 flex items-center gap-2.5 px-3">
        <img src="/icon.svg" alt={branding.name} className="h-[32px] w-[32px] shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-[700] leading-tight tracking-tight text-white">
            {branding.name}
          </span>
          <span className="block text-[11px] text-white/60">Enterprise CRM</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const href = `${prefix}${item.href}`;
          const active =
            pathname === href || pathname.startsWith(`${href}/`) ||
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-[11px] rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
                <span
                  className={cn(
                    "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold",
                    active ? "bg-white text-[var(--sidebar-bg)]" : "bg-white/20 text-white"
                  )}
                >
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Secondary modules */}
      <div className="mb-1 border-t border-white/10 pt-2 space-y-0.5">
        {[
          { href: "/omnichannel", label: "Omnicanal", icon: Activity },
          { href: "/social", label: "Social", icon: Heart },
          { href: "/forms", label: "Formularios", icon: ClipboardList },
          { href: "/import", label: "Importar", icon: Database },
          { href: "/notes", label: "Notas", icon: StickyNote },
          { href: "/labels", label: "Etiquetas", icon: Tag },
          { href: "/team", label: "Equipo", icon: UsersRound },
          { href: "/lab", label: "Laboratorio", icon: FlaskConical },
        ].map((item) => {
          const href2 = `${prefix}${item.href}`;
          const active2 = pathname === href2 || pathname.startsWith(`${href2}/`) || pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={href2} className={cn("flex items-center gap-[10px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", active2 ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]" : "text-white/50 hover:text-white/80 hover:bg-white/5")}>
              <item.icon className="h-[14px] w-[14px]" strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
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
  );
}
