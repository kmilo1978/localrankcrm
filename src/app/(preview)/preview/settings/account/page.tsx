"use client";
import { useState } from "react";
import { AlertTriangle, Download, Trash2, UserX } from "lucide-react";

export default function AccountSettingsPage() {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);

  function handleExportData() {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) { try { data[key] = JSON.parse(localStorage.getItem(key) || ""); } catch { data[key] = localStorage.getItem(key); } }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "localrank-crm-backup.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteAccount() {
    if (confirmText !== "ELIMINAR") return;
    localStorage.clear();
    setDeleted(true);
    setShowDelete(false);
  }

  function handleDeleteUser(name: string) {
    const members = JSON.parse(localStorage.getItem("team_members") || "[]");
    const filtered = members.filter((m: { name: string }) => m.name !== name);
    localStorage.setItem("team_members", JSON.stringify(filtered));
    alert("Usuario " + name + " eliminado");
  }

  if (deleted) {
    return (
      <div className="max-w-xl flex flex-col items-center justify-center py-20 text-center">
        <UserX className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-lg font-bold mb-2">Cuenta eliminada</h3>
        <p className="text-sm text-muted-foreground mb-4">Todos los datos locales han sido borrados. Puedes cerrar esta ventana o recargar para empezar de nuevo.</p>
        <button onClick={() => window.location.reload()} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Recargar</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h3 className="text-lg font-bold">Cuenta</h3>
        <p className="text-sm text-muted-foreground">Gestiona tu cuenta, exporta datos o elimina todo.</p>
      </div>

      {/* Export Data */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><Download className="h-4 w-4 text-brand" />Exportar datos</h4>
        <p className="text-xs text-muted-foreground mb-3">Descarga un backup completo de todos tus datos del CRM (contactos, tareas, notas, pipeline, configuracion) en formato JSON.</p>
        <button onClick={handleExportData} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Descargar backup (JSON)</button>
      </div>

      {/* Delete Users */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><UserX className="h-4 w-4 text-amber-600" />Eliminar usuarios</h4>
        <p className="text-xs text-muted-foreground mb-3">Elimina un miembro del equipo y revoca su acceso.</p>
        <div className="space-y-2">
          {(() => {
            try {
              const members = JSON.parse(localStorage.getItem("team_members") || "[]") as { id: string; name: string; role: string }[];
              if (members.length === 0) return <p className="text-xs text-muted-foreground">No hay miembros cargados</p>;
              return members.filter((m: { role: string }) => m.role !== "admin").map((m: { id: string; name: string; role: string }) => (
                <div key={m.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div className="text-xs"><span className="font-medium">{m.name}</span> <span className="text-muted-foreground">({m.role})</span></div>
                  <button onClick={() => handleDeleteUser(m.name)} className="rounded px-2 py-1 text-[10px] text-red-500 border border-red-200 hover:bg-red-50">Eliminar</button>
                </div>
              ));
            } catch { return <p className="text-xs text-muted-foreground">Error cargando miembros</p>; }
          })()}
        </div>
      </div>

      {/* Delete Account */}
      <div className="rounded-lg border border-red-200 p-5 bg-red-50/30">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2 text-red-700"><Trash2 className="h-4 w-4" />Zona peligrosa</h4>
        <p className="text-xs text-muted-foreground mb-3">Eliminar la cuenta borra TODOS los datos almacenados en este navegador (contactos, pipeline, tareas, notas, configuracion). Esta accion no se puede deshacer.</p>

        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Eliminar mi cuenta y datos</button>
        ) : (
          <div className="rounded border border-red-200 bg-white p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-700">Confirma escribiendo ELIMINAR</p>
                <p className="text-[10px] text-muted-foreground">Esto borrara permanentemente todos los datos del localStorage.</p>
              </div>
            </div>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Escribe ELIMINAR" className="w-full rounded border border-red-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={confirmText !== "ELIMINAR"} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">Confirmar eliminacion</button>
              <button onClick={() => { setShowDelete(false); setConfirmText(""); }} className="rounded-md border px-3 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
