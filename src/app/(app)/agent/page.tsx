"use client";
import { Bot } from "lucide-react";
export default function AgentPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Bot className="mx-auto h-12 w-12 text-brand/40" />
        <h2 className="mt-4 text-lg font-semibold">IA & Automatización</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configura proveedores de IA en Ajustes → IA / APIs para activar el agente.</p>
        <a href="/settings" className="mt-3 inline-block text-sm text-brand hover:underline">Ir a Ajustes →</a>
      </div>
    </div>
  );
}
