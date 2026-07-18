"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  Calendar,
  CheckSquare,
  CircleCheckBig,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  FolderOpen,
  Heart,
  Inbox,
  Kanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  StickyNote,
  Tag,
  Target,
  Thermometer,
  Users,
  UsersRound,
} from "lucide-react";
import type { Branding } from "@/lib/branding";
import { cn, initials } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { useEvents } from "@/components/use-events";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/omnichannel", label: "Omnicanal", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/inbox", label: "Bandeja", icon: Inbox, badge: true },
  { href: "/social", label: "Social", icon: Heart },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/cold-contacts", label: "Contactos Fríos", icon: Thermometer },
  { href: "/companies", label: "Compañías", icon: Building2 },
  { href: "/opportunities", label: "Oportunidades", icon: Target },
  { href: "/proposals", label: "Propuestas", icon: FileText },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/forms", label: "Formularios", icon: ClipboardList },
  { href: "/import", label: "Importar", icon: Database },
  { href: "/workspaces", label: "Espacios", icon: FolderOpen },
  { href: "/team", label: "Equipo", icon: UsersRound },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/todo", label: "To-Do", icon: CircleCheckBig },
  { href: "/notes", label: "Notas", icon: StickyNote },
  { href: "/labels", label: "Etiquetas", icon: Tag },
  { href: "/agent", label: "Agente IA", icon: Sparkles },
  { href: "/lab", label: "Laboratorio", icon: FlaskConical },
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
        <span
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-lg bg-white/10 text-[16px] font-bold text-white"
          aria-hidden
        >
          {branding.name.charAt(0).toUpperCase()}
        </span>
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
    </aside>
  );
}
