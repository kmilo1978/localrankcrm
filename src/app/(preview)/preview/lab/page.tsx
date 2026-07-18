"use client";

import { FlaskConical } from "lucide-react";

export default function PreviewLabPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">Laboratorio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Requiere conexión a base de datos y un proveedor de IA configurado.
        </p>
      </div>
    </div>
  );
}
