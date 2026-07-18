"use client";

import { Sparkles } from "lucide-react";

export default function PreviewAgentPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">Agente IA</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura un proveedor de IA en Ajustes → IA / APIs para activar el agente.
        </p>
      </div>
    </div>
  );
}
