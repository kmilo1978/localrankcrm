import { DEFAULT_BRANDING } from "@/lib/branding";
import { AppNav } from "@/components/app-nav";
import { PageHelp } from "@/components/page-help";
import { AiAssistant } from "@/components/ai-assistant";

/**
 * App layout — funciona sin autenticación.
 * Los datos se persisten en localStorage del navegador.
 * Cuando se configure auth correctamente, se puede re-habilitar la validación de sesión.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppNav
        branding={DEFAULT_BRANDING}
        userName="Admin"
        role="owner"
      />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      <PageHelp />
      <AiAssistant />
    </div>
  );
}
