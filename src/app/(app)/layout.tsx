import { DEFAULT_BRANDING } from "@/lib/branding";
import { AppNav } from "@/components/app-nav";
import { PageHelp } from "@/components/page-help";
import { AiAssistant } from "@/components/ai-assistant";
import { BlurWrapper } from "@/components/blur-wrapper";
import { GlobalSearch } from "@/components/global-search";
import { UpdateBanner } from "@/components/update-banner";
import { UndoToast } from "@/components/undo-toast";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppNav branding={DEFAULT_BRANDING} userName="Admin" role="owner" />
      <main className="min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0"><BlurWrapper>{children}</BlurWrapper></main>
      <UpdateBanner />
      <GlobalSearch />
      <PageHelp />
      <AiAssistant />
      <UndoToast />
    </div>
  );
}
