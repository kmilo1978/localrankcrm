"use client";
import { useState, useEffect } from "react";
import { Copy, Edit3, Eye, EyeOff, Key, Lock, Plus, Search, Shield, Trash2, Unlock, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type VaultItem = {
  id: string; title: string; username: string; password: string; url: string;
  category: "servicio" | "api" | "red_social" | "email" | "hosting" | "banco" | "otro";
  notes: string; createdAt: string;
};

const CATEGORIES: Record<string, { label: string; color: string }> = {
  servicio: { label: "Servicio", color: "bg-blue-100 text-blue-700" },
  api: { label: "API Key", color: "bg-purple-100 text-purple-700" },
  red_social: { label: "Red social", color: "bg-pink-100 text-pink-700" },
  email: { label: "Email", color: "bg-amber-100 text-amber-700" },
  hosting: { label: "Hosting", color: "bg-green-100 text-green-700" },
  banco: { label: "Banco/Pagos", color: "bg-emerald-100 text-emerald-700" },
  otro: { label: "Otro", color: "bg-gray-100 text-gray-700" },
};

const SEED: VaultItem[] = [
  { id: "v1", title: "OpenRouter API", username: "localrankmedellin@gmail.com", password: "sk-or-v1-xxxx...xxxx", url: "https://openrouter.ai", category: "api", notes: "API principal para IA del CRM", createdAt: "2026-07-17" },
  { id: "v2", title: "Supabase Project", username: "localrankmedellin@gmail.com", password: "••••••••", url: "https://supabase.com/dashboard", category: "hosting", notes: "Proyecto oixeaagftrigalcazvst", createdAt: "2026-07-15" },
  { id: "v3", title: "Vercel Deploy", username: "kmilo1978", password: "••••••••", url: "https://vercel.com", category: "hosting", notes: "Deploy automatico desde GitHub", createdAt: "2026-07-10" },
];

export default function VaultPage() {
  const [locked, setLocked] = useState(true);
  const [masterPass, setMasterPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<VaultItem | null>(null);
  const [form, setForm] = useState({ title: "", username: "", password: "", url: "", category: "servicio" as VaultItem["category"], notes: "" });
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");

  useEffect(() => {
    // Check if vault has a master password set
    const storedHash = localStorage.getItem("vault_master_hash");
    if (!storedHash) setLocked(false); // First time: no password yet
  }, []);

  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function unlock() {
    const storedHash = localStorage.getItem("vault_master_hash");
    if (!storedHash) { setLocked(false); return; }
    // Simple hash comparison
    if (simpleHash(masterPass) === storedHash) {
      setLocked(false); setPassError(false); setMasterPass("");
      setItems(loadFromStorage("vault_items", SEED));
    } else {
      setPassError(true);
    }
  }

  function setMasterPassword(pass: string) {
    localStorage.setItem("vault_master_hash", simpleHash(pass));
    notify("Clave maestra configurada");
  }

  function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return "vh_" + Math.abs(hash).toString(36);
  }

  // Load items once unlocked
  useEffect(() => {
    if (!locked) setItems(loadFromStorage("vault_items", SEED));
  }, [locked]);

  function save(u: VaultItem[]) { setItems(u); saveToStorage("vault_items", u); }

  function addItem() {
    if (!form.title.trim()) return;
    const item: VaultItem = { id: generateId(), ...form, createdAt: new Date().toISOString().split("T")[0]! };
    save([item, ...items]); resetForm(); setShowForm(false); notify("Guardado en boveda");
  }

  function openEdit(item: VaultItem) {
    setEditItem(item);
    setForm({ title: item.title, username: item.username, password: item.password, url: item.url, category: item.category, notes: item.notes });
  }

  function handleUpdate() {
    if (!editItem) return;
    save(items.map(i => i.id === editItem.id ? { ...i, ...form } : i));
    setEditItem(null); resetForm(); notify("Actualizado");
  }

  function resetForm() { setForm({ title: "", username: "", password: "", url: "", category: "servicio", notes: "" }); }
  function deleteItem(id: string) { save(items.filter(i => i.id !== id)); }
  function togglePasswordVisible(id: string) {
    const next = new Set(visiblePasswords);
    if (next.has(id)) next.delete(id); else next.add(id);
    setVisiblePasswords(next);
  }
  function copyToClipboard(text: string, label: string) { navigator.clipboard.writeText(text); notify(label + " copiado"); }

  function lockVault() { setLocked(true); setItems([]); setVisiblePasswords(new Set()); }

  const filtered = items
    .filter(i => filterCat === "all" || i.category === filterCat)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.username.toLowerCase().includes(search.toLowerCase()));

  // LOCKED STATE
  if (locked) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Lock className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-xl font-bold mb-1">Boveda</h1>
          <p className="text-sm text-muted-foreground mb-6">Ingresa tu clave maestra para acceder a tus credenciales guardadas.</p>
          <div className="space-y-3">
            <input type="password" value={masterPass} onChange={e => { setMasterPass(e.target.value); setPassError(false); }} onKeyDown={e => { if (e.key === "Enter") unlock(); }} placeholder="Clave maestra" className={`w-full rounded-lg border px-4 py-3 text-center text-sm focus:border-brand focus:outline-none ${passError ? "border-red-400 bg-red-50" : ""}`} autoFocus />
            {passError && <p className="text-xs text-red-500">Clave incorrecta</p>}
            <button onClick={unlock} className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover">Desbloquear</button>
            {!localStorage.getItem("vault_master_hash") && (
              <p className="text-[10px] text-muted-foreground">Primera vez? Escribe una clave y se configurara como tu clave maestra.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-brand" />Boveda</h1>
            <p className="text-xs text-muted-foreground">{items.length} credenciales guardadas · Protegida con clave maestra</p>
          </div>
          <div className="flex gap-2">
            <button onClick={lockVault} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 text-amber-700 border-amber-200 bg-amber-50"><Lock className="h-3.5 w-3.5" />Bloquear</button>
            <button onClick={() => { const p = prompt("Nueva clave maestra:"); if (p) setMasterPassword(p); }} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Key className="h-3.5 w-3.5" />Cambiar clave</button>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Agregar</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-44 rounded border bg-white py-1.5 pl-8 pr-3 text-xs focus:border-brand focus:outline-none" /></div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setFilterCat("all")} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterCat === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todas</button>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <button key={k} onClick={() => setFilterCat(k)} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterCat === k ? v.color + " font-bold" : "border hover:bg-gray-50"}`}>{v.label}</button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="group rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 shrink-0"><Key className="h-4 w-4 text-brand" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${CATEGORIES[item.category]?.color}`}>{CATEGORIES[item.category]?.label}</span>
                    </div>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand hover:underline">{item.url}</a>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-brand"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteItem(item.id)} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {/* Credentials */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2">
                  <span className="text-[10px] text-muted-foreground w-14 shrink-0">Usuario</span>
                  <span className="text-xs font-mono flex-1 truncate">{item.username}</span>
                  <button onClick={() => copyToClipboard(item.username, "Usuario")} className="text-muted-foreground hover:text-brand shrink-0"><Copy className="h-3 w-3" /></button>
                </div>
                <div className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2">
                  <span className="text-[10px] text-muted-foreground w-14 shrink-0">Clave</span>
                  <span className="text-xs font-mono flex-1 truncate">{visiblePasswords.has(item.id) ? item.password : "••••••••••••"}</span>
                  <button onClick={() => togglePasswordVisible(item.id)} className="text-muted-foreground hover:text-brand shrink-0">{visiblePasswords.has(item.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                  <button onClick={() => copyToClipboard(item.password, "Clave")} className="text-muted-foreground hover:text-brand shrink-0"><Copy className="h-3 w-3" /></button>
                </div>
              </div>
              {item.notes && <p className="mt-2 text-[10px] text-muted-foreground">{item.notes}</p>}
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground text-sm">Sin credenciales. Agrega una con el boton "Agregar".</div>}
      </div>

      {/* Add/Edit Modal */}
      {(showForm || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex justify-between mb-4"><h3 className="text-sm font-bold">{editItem ? "Editar credencial" : "Nueva credencial"}</h3><button onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Titulo (ej: OpenRouter, Gmail, Vercel) *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Usuario / Email" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Contraseña / API Key" type="text" className="rounded border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
              </div>
              <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="URL del servicio (opcional)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value as VaultItem["category"]})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none">
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notas" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <button onClick={editItem ? handleUpdate : addItem} disabled={!form.title.trim()} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{editItem ? "Guardar cambios" : "Guardar en boveda"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
