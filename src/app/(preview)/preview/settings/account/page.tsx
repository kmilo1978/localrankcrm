"use client";
import { useState, useRef } from "react";
import { AlertTriangle, Download, Upload, Trash2, UserX } from "lucide-react";

export default function AccountSettingsPage() {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  function handleImportData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith("localrank_")) localStorage.setItem(key, JSON.stringify(value));
        });
        setImportStatus(`✅ Backup restaurado (${Object.keys(data).length} elementos)`);
        setTimeout(() => { setImportStatus(""); window.location.reload(); }, 2000);
      } catch { setImportStatus("❌ Archivo inválido. Debe ser un backup JSON de LocalRank CRM."); setTimeout(() => setImportStatus(""), 3000); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

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
    <div className="max-w-xl mx-auto space-y-6 p-6">
      <div>
        <h3 className="text-lg font-bold">Cuenta</h3>
        <p className="text-sm text-muted-foreground">Gestiona tu cuenta, exporta datos o elimina todo.</p>
      </div>

      {/* PIN Protection */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">🔐 PIN de seguridad</h4>
        <p className="text-xs text-muted-foreground mb-3">Protege módulos sensibles (Bóveda, Cartera) con un PIN. Se pide al entrar a esos módulos.</p>
        {(() => {
          const hasPin = typeof window !== "undefined" && !!localStorage.getItem("localrank_module_pin");
          return (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">PIN (4-6 dígitos)</label>
                <input id="pin-input" type="password" maxLength={6} placeholder={hasPin ? "••••" : "Ej: 1234"} className="w-full rounded border px-3 py-2 text-sm font-mono mt-1 focus:border-brand focus:outline-none" />
              </div>
              <button onClick={() => { const inp = document.getElementById("pin-input") as HTMLInputElement; if (inp?.value && inp.value.length >= 4) { localStorage.setItem("localrank_module_pin", inp.value); inp.value = ""; alert("PIN configurado ✓"); } }} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">{hasPin ? "Cambiar" : "Configurar"}</button>
              {hasPin && <button onClick={() => { localStorage.removeItem("localrank_module_pin"); alert("PIN eliminado"); }} className="rounded border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Quitar</button>}
            </div>
          );
        })()}
      </div>

      {/* Export & Import Data */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><Download className="h-4 w-4 text-brand" />Copias de seguridad</h4>
        <p className="text-xs text-muted-foreground mb-4">Descarga o restaura un backup completo de todos los datos del CRM. También puedes sincronizar con Google Drive.</p>
        <div className="flex gap-3 flex-wrap mb-4">
          <button onClick={handleExportData} className="flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Download className="h-3.5 w-3.5" />Exportar backup</button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImportData} className="hidden" />
          <button onClick={() => importRef.current?.click()} className="flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"><Upload className="h-3.5 w-3.5" />Restaurar backup</button>
        </div>
        {importStatus && <p className="mt-2 text-xs">{importStatus}</p>}

        {/* Google Drive sync */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📁</span>
            <div>
              <h5 className="text-sm font-medium">Sincronización con Google Drive</h5>
              <p className="text-[10px] text-muted-foreground">Backups automáticos programados + permisos por rol</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Frecuencia de backup automático</label>
            <div className="flex gap-2">
              {[
                { value: "off", label: "Desactivado" },
                { value: "daily", label: "Diario" },
                { value: "weekly", label: "Semanal" },
                { value: "monthly", label: "Mensual" },
              ].map(opt => {
                const current = typeof window !== "undefined" ? localStorage.getItem("localrank_backup_schedule") || "off" : "off";
                return (
                  <button key={opt.value} onClick={() => { localStorage.setItem("localrank_backup_schedule", opt.value); setImportStatus(`Backup ${opt.value === "off" ? "desactivado" : `programado: ${opt.label}`}`); }} className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${current === opt.value ? "bg-blue-600 text-white" : "border border-blue-200 text-blue-700 hover:bg-blue-100"}`}>{opt.label}</button>
                );
              })}
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Permisos de backup</label>
            <div className="space-y-1.5">
              {[
                { key: "export", label: "Exportar datos", desc: "Quién puede descargar backups" },
                { key: "import", label: "Restaurar datos", desc: "Quién puede restaurar un backup (sobreescribe)" },
                { key: "drive", label: "Sincronizar Drive", desc: "Quién puede subir/bajar de Google Drive" },
              ].map(perm => {
                const current = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("localrank_backup_permissions") || "{}") : {};
                return (
                  <div key={perm.key} className="flex items-center justify-between rounded border border-blue-100 px-3 py-2">
                    <div>
                      <p className="text-xs font-medium">{perm.label}</p>
                      <p className="text-[9px] text-muted-foreground">{perm.desc}</p>
                    </div>
                    <select defaultValue={current[perm.key] || "owner"} onChange={e => { const perms = JSON.parse(localStorage.getItem("localrank_backup_permissions") || "{}"); perms[perm.key] = e.target.value; localStorage.setItem("localrank_backup_permissions", JSON.stringify(perms)); }} className="rounded border px-2 py-1 text-[10px]">
                      <option value="owner">Solo propietario</option>
                      <option value="admin">Admin+</option>
                      <option value="manager">Manager+</option>
                      <option value="all">Todos</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { handleExportData(); setImportStatus("✅ Backup exportado. Para subirlo a Drive, conecta Composio."); }} className="flex items-center gap-1.5 rounded border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">📤 Subir a Drive</button>
            <button onClick={() => importRef.current?.click()} className="flex items-center gap-1.5 rounded border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">📥 Restaurar desde Drive</button>
            <button onClick={() => { handleExportData(); setImportStatus("✅ Backup manual creado"); }} className="flex items-center gap-1.5 rounded border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">💾 Backup manual ahora</button>
          </div>
          <p className="mt-2 text-[9px] text-muted-foreground">La sincronización con Google Drive requiere Composio.dev conectado en Ajustes → Conectores.</p>
        </div>
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
