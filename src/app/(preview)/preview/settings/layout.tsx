"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  // Canales
  { href: "/preview/settings/whatsapp", label: "WhatsApp" },
  { href: "/preview/settings/sms", label: "SMS" },
  { href: "/preview/settings/email-marketing", label: "Email Marketing" },
  // Integraciones & APIs
  { href: "/preview/settings/ai-providers", label: "IA / APIs" },
  { href: "/preview/settings/mcp", label: "MCP" },
  { href: "/preview/settings/integrations", label: "Conectores" },
  { href: "/preview/settings/webhooks", label: "Webhooks & APIs" },
  // Tracking & Sistema
  { href: "/preview/settings/tracking", label: "Pixels & UTM" },
  { href: "/preview/settings/currency", label: "Moneda" },
  // Personalización
  { href: "/preview/settings/branding", label: "Marca" },
  { href: "/preview/settings/appearance", label: "Apariencia" },
  { href: "/preview/settings/shortcuts", label: "Atajos" },
  // Organización
  { href: "/preview/settings/team", label: "Equipo" },
  { href: "/preview/settings/account", label: "Cuenta" },
  { href: "/preview/settings/credentials", label: "Credenciales" },
] as const;

export default function PreviewSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-4 py-3 md:px-6 md:py-4">
        <h2 className="font-semibold text-sm md:text-base">Configuración</h2>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav className="shrink-0 space-y-0.5 border-b md:border-b-0 md:border-r p-2 md:p-3 md:w-44 overflow-x-auto md:overflow-x-visible">
          <div className="flex md:flex-col gap-1 md:gap-0.5">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "block whitespace-nowrap rounded-md px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium transition-colors",
                  pathname.startsWith(t.href)
                    ? "bg-brand-tint text-brand-text"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
