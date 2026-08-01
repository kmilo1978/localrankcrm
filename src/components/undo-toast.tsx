"use client";

import { useEffect, useState } from "react";
import { subscribe, undo, type UndoEntry } from "@/lib/undo-store";
import { RotateCcw, X } from "lucide-react";

/**
 * Global undo toast — mount this once in the root layout.
 * Listens to the undo-store singleton and renders a bottom-center toast
 * whenever a destructive action is pushed.
 *
 * Ctrl+Z anywhere in the app will also trigger the undo.
 */
export function UndoToast() {
  const [entry, setEntry] = useState<UndoEntry | null>(null);

  useEffect(() => {
    // Subscribe to store
    const unsub = subscribe(setEntry);

    // Global Ctrl+Z / Cmd+Z listener
    function handleKey(e: KeyboardEvent) {
      // Only fire if NOT inside an input/textarea/contenteditable
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      if (tag === "input" || tag === "textarea" || isEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      unsub();
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!entry) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 shadow-2xl text-white">
        <span className="text-sm">{entry.label}</span>
        <button
          onClick={() => undo()}
          className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Deshacer
          <kbd className="ml-1 rounded bg-white/20 px-1 py-0.5 text-[9px] font-mono">Ctrl+Z</kbd>
        </button>
        <button
          onClick={() => setEntry(null)}
          className="rounded p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
