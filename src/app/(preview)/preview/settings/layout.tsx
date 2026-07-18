"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/preview/settings/ai-providers", label: "IA / APIs" },
  { href: "/preview/settings/whatsapp", label: "WhatsApp" },
  { href: "/preview/settings/branding", label: "Marca" },
] as const;

export default function PreviewSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 py-4">
        <h2 className="font-semibold">Configuración</h2>
      </header>
      <div className="flex min-h-0 flex-1">
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
        <div className="min-w-0 flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
