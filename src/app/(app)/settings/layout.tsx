"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/whatsapp", label: "WhatsApp" },
  { href: "/settings/ai-providers", label: "IA / APIs" },
  { href: "/settings/branding", label: "Marca" },
  { href: "/settings/templates", label: "Plantillas" },
  { href: "/settings/quick-replies", label: "Resp. Rápidas" },
  { href: "/settings/sms", label: "SMS" },
  { href: "/settings/email-marketing", label: "Email Marketing" },
  { href: "/settings/mcp", label: "MCP" },
  { href: "/settings/integrations", label: "Conectores" },
  { href: "/settings/flows", label: "Flows" },
  { href: "/settings/webhooks", label: "Webhooks" },
  { href: "/settings/tracking", label: "Pixels & UTM" },
  { href: "/settings/ocr", label: "OCR" },
  { href: "/settings/currency", label: "Moneda" },
  { href: "/settings/appearance", label: "Apariencia" },
  { href: "/settings/team", label: "Equipo" },
  { href: "/settings/account", label: "Cuenta" },
] as const;

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 py-4">
        <h2 className="font-semibold">Configuración</h2>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="w-44 shrink-0 space-y-1 border-r p-3 overflow-y-auto">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(t.href)
                  ? "bg-[var(--accent-tint)] text-[var(--accent-text)]"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
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
