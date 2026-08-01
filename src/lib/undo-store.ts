/**
 * Global undo store — no React Context needed.
 * Works as a singleton: any module calls pushUndo() before a destructive action.
 * The UndoToast component subscribes and renders the toast.
 *
 * Usage in any module:
 *   import { pushUndo } from "@/lib/undo-store";
 *
 *   function deleteItem(id: string) {
 *     pushUndo({
 *       label: "Tarea eliminada",
 *       undo: () => save([...items, deletedItem]),  // restore
 *     });
 *     save(items.filter(i => i.id !== id));
 *   }
 */

export type UndoEntry = {
  label: string;       // shown in toast: "Tarea eliminada"
  undo: () => void;    // function to call when user clicks Deshacer
};

type Listener = (entry: UndoEntry | null) => void;

// Singleton state
let current: UndoEntry | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();
const STACK: UndoEntry[] = [];
const MAX_STACK = 20;

/** Push a new undoable action. Replaces the current toast. */
export function pushUndo(entry: UndoEntry): void {
  // Push to stack for Ctrl+Z
  STACK.push(entry);
  if (STACK.length > MAX_STACK) STACK.shift();

  // Show toast
  if (timer) clearTimeout(timer);
  current = entry;
  notify(entry);

  // Auto-dismiss after 4 s
  timer = setTimeout(() => {
    current = null;
    notify(null);
  }, 4000);
}

/** Undo the most recent action (called by Ctrl+Z or toast button). */
export function undo(): void {
  const entry = STACK.pop();
  if (!entry) return;
  entry.undo();
  // Dismiss toast if it was for this entry
  if (current === entry) {
    if (timer) clearTimeout(timer);
    current = null;
    notify(null);
  }
}

/** Subscribe to toast visibility changes. Returns unsubscribe fn. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(entry: UndoEntry | null) {
  listeners.forEach((l) => l(entry));
}
