"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/whatsapp", label: "WhatsApp" },
  { href: "/settings/ai-providers", label: "IA / APIs" },
  { href: "/settings/branding", label: "Marca" },
  { href: "/settings/templates", label: "Plantillas" },
  { href: "/settings/team", label: "Equipo" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="w-44 shrink-0 space-y-1 border-r p-3">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(t.href)
              ? "bg-brand-tint text-brand-text"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
