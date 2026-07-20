"use client";

import { Calendar, Columns3, LayoutGrid, LayoutList, Network } from "lucide-react";

export type ViewMode = "list" | "board" | "calendar" | "mindmap" | "grid";

type ViewOption = {
  key: ViewMode;
  label: string;
  icon: React.ReactNode;
};

const ALL_VIEWS: ViewOption[] = [
  { key: "list", label: "Lista", icon: <LayoutList className="h-3.5 w-3.5" /> },
  { key: "board", label: "Kanban", icon: <Columns3 className="h-3.5 w-3.5" /> },
  { key: "grid", label: "Tablero", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { key: "calendar", label: "Calendario", icon: <Calendar className="h-3.5 w-3.5" /> },
  { key: "mindmap", label: "Mapa", icon: <Network className="h-3.5 w-3.5" /> },
];

type ViewToggleProps = {
  current: ViewMode;
  onChange: (view: ViewMode) => void;
  views?: ViewMode[];
};

export function ViewToggle({ current, onChange, views }: ViewToggleProps) {
  const available = views
    ? ALL_VIEWS.filter((v) => views.includes(v.key))
    : ALL_VIEWS;

  return (
    <div className="flex rounded-md border bg-white overflow-hidden">
      {available.map((v) => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            current === v.key
              ? "bg-brand text-white"
              : "text-muted-foreground hover:bg-gray-50 hover:text-gray-700"
          }`}
          title={v.label}
        >
          {v.icon}
          <span className="hidden sm:inline">{v.label}</span>
        </button>
      ))}
    </div>
  );
}
