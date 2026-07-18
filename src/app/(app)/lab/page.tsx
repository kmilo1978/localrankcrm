"use client";
import { FlaskConical } from "lucide-react";
export default function LabPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <FlaskConical className="mx-auto h-12 w-12 text-brand/40" />
        <h2 className="mt-4 text-lg font-semibold">Laboratorio</h2>
        <p className="mt-1 text-sm text-muted-foreground">Módulo de pruebas y experimentación de IA. Requiere proveedor configurado.</p>
      </div>
    </div>
  );
}
