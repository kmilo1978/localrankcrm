"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportToCSV, exportToJSON } from "@/lib/email-tools";

type ExportButtonProps = {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
};

export function ExportButton({ data, filename, label = "Exportar" }: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  if (data.length === 0) return null;

  return (
    <div className="relative">
      <button onClick={() => setShowOptions(!showOptions)} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
        <Download className="h-3.5 w-3.5" />{label}
      </button>
      {showOptions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 rounded-lg border bg-white shadow-lg p-1 min-w-[140px]">
            <button onClick={() => { exportToCSV(data, filename); setShowOptions(false); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs hover:bg-gray-50">
              📊 CSV
            </button>
            <button onClick={() => { exportToJSON(data, filename); setShowOptions(false); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs hover:bg-gray-50">
              📋 JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
