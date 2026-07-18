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
      <header className="border-b px-4 py-3 md:px-6 md:py-4">
        <h2 className="font-semibold text-sm md:text-base">Configuración</h2>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav className="shrink-0 space-y-0.5 border-b md:border-b-0 md:border-r p-2 md:p-3 md:w-44 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
          <div className="flex md:flex-col gap-1 md:gap-0.5">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "block whitespace-nowrap rounded-md px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium transition-colors",
                  pathname.startsWith(t.href)
                    ? "bg-[var(--accent-tint)] text-[var(--accent-text)]"
                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
