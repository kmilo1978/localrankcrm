"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, RotateCcw, Trash2, X } from "lucide-react";
import { getTrash, restoreFromTrash, permanentDelete, emptyTrash, TrashItem } from "@/lib/trash";

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [toast, setToast] = useState("");
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  useEffect(() => { setItems(getTrash()); }, []);
  function reload() { setItems(getTrash()); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function handleRestore(id: string) {
    const item = restoreFromTrash(id);
    if (!item) return;
    // Re-insert into the module's storage
    try {
      const key = getStorageKey(item.module);
      if (key) {
        const current = JSON.parse(localStorage.getItem(key) || "[]");
        current.unshift(item.data);
        localStorage.setItem(key, JSON.stringify(current));
      }
    } catch {}
    reload();
    notify(`"${item.title}" restaurado a ${item.module}`);
  }

  function handlePermanentDelete(id: string) {
    permanentDelete(id);
    reload();
    notify("Eliminado permanentemente");
  }

  function handleEmptyTrash() {
    emptyTrash();
    reload();
    setConfirmEmpty(false);
    notify("Papelera vaciada");
  }

  function getStorageKey(module: string): string | null {
    const map: Record<string, string> = {
      "Contactos": "localrank_contacts",
      "Notas": "localrank_notes",
      "Tareas": "localrank_tasks",
      "Pipeline": "localrank_pipeline_leads",
      "Oportunidades": "localrank_opportunities",
      "Checklists": "localrank_checklists_v2",
      "Radar": "localrank_radar_clips",
      "Suscripciones": "localrank_subscriptions",
      "Recordatorios": "localrank_reminders_v2",
    };
    return map[module] || null;
  }

  function getDaysAgo(date: string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    return `Hace ${diff} días`;
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Trash2 className="h-6 w-6 text-muted-foreground" />Papelera</h1>
            <p className="text-sm text-muted-foreground">{items.length} elementos · Se eliminan automáticamente después de 30 días</p>
          </div>
          {items.length > 0 && (
            <button onClick={() => setConfirmEmpty(true)} className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Vaciar papelera</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-dashed">
            <Trash2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-muted-foreground">La papelera está vacía</p>
            <p className="text-xs text-muted-foreground mt-1">Los elementos eliminados aparecerán aquí por 30 días</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="group flex items-center gap-3 rounded-lg border bg-white px-4 py-3 hover:shadow-sm">
                <Trash2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.module} · {getDaysAgo(item.deletedAt)}</p>
                </div>
                <button onClick={() => handleRestore(item.id)} className="flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5 opacity-0 group-hover:opacity-100"><RotateCcw className="h-3 w-3" />Restaurar</button>
                <button onClick={() => handlePermanentDelete(item.id)} className="rounded p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm empty */}
      {confirmEmpty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmEmpty(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl mx-4 text-center" onClick={e => e.stopPropagation()}>
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-500" />
            <h3 className="text-sm font-bold mb-1">¿Vaciar papelera?</h3>
            <p className="text-xs text-muted-foreground mb-4">Se eliminarán permanentemente {items.length} elementos. Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmEmpty(false)} className="flex-1 rounded-md border py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={handleEmptyTrash} className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700">Vaciar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
