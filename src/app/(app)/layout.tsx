import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FlaskConical,
  Inbox,
  Kanban,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { getSessionOrNull } from "@/lib/auth/session";
import { NavLink } from "@/components/nav-link";
import { SignOutButton } from "@/components/sign-out-button";

const NAV = [
  { href: "/inbox", label: "Bandeja", icon: Inbox },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/agent", label: "Agente", icon: Sparkles },
  { href: "/lab", label: "Laboratorio", icon: FlaskConical },
  { href: "/settings", label: "Configuración", icon: Settings },
] as const;

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionOrNull();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card">
        <Link href="/inbox" className="flex items-center gap-2 px-5 py-5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-lg font-bold tracking-tight">Vocero</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label}>
              <item.icon className="h-4 w-4" />
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
