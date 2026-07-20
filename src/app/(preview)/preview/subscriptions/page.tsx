"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Bell, Calendar, CreditCard, DollarSign, Edit3, Plus, RefreshCw, Trash2, TrendingDown, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Subscription = {
  id: string;
  name: string;
  category: "personal" | "profesional" | "cliente";
  amount: number;
  currency: string;
  cycle: "mensual" | "anual" | "trimestral" | "semanal";
  nextBilling: string;
  paymentMethod: string;
  cardLast4: string;
  status: "activa" | "pausada" | "cancelada" | "por_vencer";
  notes: string;
  createdAt: string;
};

const CATEGORIES = {
  personal: { label: "Personal", color: "bg-blue-100 text-blue-700" },
  profesional: { label: "Profesional", color: "bg-purple-100 text-purple-700" },
  cliente: { label: "Cliente", color: "bg-green-100 text-green-700" },
};

const STATUS_STYLES = {
  activa: "bg-green-100 text-green-700",
  pausada: "bg-amber-100 text-amber-700",
  cancelada: "bg-gray-100 text-gray-500",
  por_vencer: "bg-red-100 text-red-700",
};

const SEED: Subscription[] = [
  { id: "sub1", name: "OpenRouter API", category: "profesional", amount: 50, currency: "USD", cycle: "mensual", nextBilling: "2026-08-01", paymentMethod: "Visa", cardLast4: "4532", status: "activa", notes: "API principal para IA del CRM", createdAt: "2026-01-15" },
  { id: "sub2", name: "Vercel Pro", category: "profesional", amount: 20, currency: "USD", cycle: "mensual", nextBilling: "2026-08-05", paymentMethod: "Mastercard", cardLast4: "8721", status: "activa", notes: "Deploy del CRM", createdAt: "2026-03-01" },
  { id: "sub3", name: "Supabase Pro", category: "profesional", amount: 25, currency: "USD", cycle: "mensual", nextBilling: "2026-08-01", paymentMethod: "Visa", cardLast4: "4532", status: "activa", notes: "Base de datos PostgreSQL", createdAt: "2026-02-10" },
  { id: "sub4", name: "Ahrefs (SEO)", category: "profesional", amount: 99, currency: "USD", cycle: "mensual", nextBilling: "2026-07-28", paymentMethod: "Mastercard", cardLast4: "8721", status: "por_vencer", notes: "Herramienta SEO para clientes", createdAt: "2025-11-01" },
  { id: "sub5", name: "Spotify Premium", category: "personal", amount: 17900, currency: "COP", cycle: "mensual", nextBilling: "2026-08-10", paymentMethod: "Nequi", cardLast4: "", status: "activa", notes: "", createdAt: "2024-06-01" },
  { id: "sub6", name: "Netflix", category: "personal", amount: 38900, currency: "COP", cycle: "mensual", nextBilling: "2026-08-03", paymentMethod: "Visa", cardLast4: "4532", status: "activa", notes: "", createdAt: "2023-01-15" },
  { id: "sub7", name: "Hosting cliente Dentart", category: "cliente", amount: 150000, currency: "COP", cycle: "anual", nextBilling: "2027-01-15", paymentMethod: "Transferencia", cardLast4: "", status: "activa", notes: "Facturar al cliente antes de renovar", createdAt: "2026-01-15" },
];

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({ name: "", category: "profesional" as Subscription["category"], amount: "", currency: "USD", cycle: "mensual" as Subscription["cycle"], nextBilling: "", paymentMethod: "", cardLast4: "", notes: "" });
  const [toast, setToast] = useState("");

  useEffect(() => { setSubs(loadFromStorage("subscriptions", SEED)); }, []);
  function save(u: Subscription[]) { setSubs(u); saveToStorage("subscriptions", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function addSub() {
    if (!form.name.trim() || !form.amount) return;
    save([{ id: generateId(), ...form, amount: Number(form.amount), status: "activa", createdAt: new Date().toISOString().split("T")[0]! }, ...subs]);
    resetForm(); setShowForm(false); notify("Suscripción agregada");
  }

  function updateSub() {
    if (!editSub) return;
    save(subs.map(s => s.id === editSub.id ? { ...editSub } : s));
    setEditSub(null); notify("Actualizada");
  }

  function toggleStatus(id: string) {
    save(subs.map(s => s.id === id ? { ...s, status: s.status === "activa" ? "pausada" : s.status === "pausada" ? "activa" : s.status } : s));
  }

  function cancelSub(id: string) { save(subs.map(s => s.id === id ? { ...s, status: "cancelada" as const } : s)); }
  function deleteSub(id: string) { save(subs.filter(s => s.id !== id)); }
  function resetForm() { setForm({ name: "", category: "profesional", amount: "", currency: "USD", cycle: "mensual", nextBilling: "", paymentMethod: "", cardLast4: "", notes: "" }); }

  const filtered = filterCat === "all" ? subs : subs.filter(s => s.category === filterCat);
  const active = subs.filter(s => s.status === "activa" || s.status === "por_vencer");
  const totalUSD = active.filter(s => s.currency === "USD").reduce((sum, s) => sum + (s.cycle === "anual" ? s.amount / 12 : s.cycle === "trimestral" ? s.amount / 3 : s.amount), 0);
  const totalCOP = active.filter(s => s.currency === "COP").reduce((sum, s) => sum + (s.cycle === "anual" ? s.amount / 12 : s.cycle === "trimestral" ? s.amount / 3 : s.amount), 0);
  const expiring = subs.filter(s => s.status === "por_vencer").length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-brand" />Suscripciones</h1>
            <p className="text-sm text-muted-foreground">{active.length} activas · Control de pagos recurrentes personales y profesionales</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva suscripción</button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg border bg-white p-4 text-center">
            <p className="text-2xl font-bold text-brand">${totalUSD.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">USD / mes</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-center">
            <p className="text-2xl font-bold text-brand">${totalCOP.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">COP / mes</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-center">
            <p className="text-2xl font-bold">{active.length}</p>
            <p className="text-[10px] text-muted-foreground">Activas</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-center">
            <p className={`text-2xl font-bold ${expiring > 0 ? "text-red-600" : "text-green-600"}`}>{expiring}</p>
            <p className="text-[10px] text-muted-foreground">Por vencer</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilterCat("all")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filterCat === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todas ({subs.length})</button>
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <button key={key} onClick={() => setFilterCat(key)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filterCat === key ? val.color + " font-bold" : "border hover:bg-gray-50"}`}>{val.label} ({subs.filter(s => s.category === key).length})</button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map(sub => (
            <div key={sub.id} className={`group rounded-lg border bg-white p-4 hover:shadow-sm ${sub.status === "cancelada" ? "opacity-50" : sub.status === "por_vencer" ? "border-red-200" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold">{sub.name}</h4>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${CATEGORIES[sub.category].color}`}>{CATEGORIES[sub.category].label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${STATUS_STYLES[sub.status]}`}>{sub.status === "por_vencer" ? "⚠ Por vencer" : sub.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-foreground"><DollarSign className="h-3 w-3" />{sub.currency === "COP" ? sub.amount.toLocaleString("es-CO") : sub.amount} {sub.currency} / {sub.cycle}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Próximo: {sub.nextBilling}</span>
                    {sub.paymentMethod && <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{sub.paymentMethod}{sub.cardLast4 && ` ••${sub.cardLast4}`}</span>}
                  </div>
                  {sub.notes && <p className="mt-1 text-[10px] text-muted-foreground">{sub.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setEditSub({...sub})} className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground hover:text-brand"><Edit3 className="h-3.5 w-3.5" /></button>
                  {sub.status !== "cancelada" && <button onClick={() => toggleStatus(sub.id)} className="rounded p-1.5 hover:bg-amber-50 text-muted-foreground hover:text-amber-600" title="Pausar/Activar"><RefreshCw className="h-3.5 w-3.5" /></button>}
                  {sub.status !== "cancelada" && <button onClick={() => cancelSub(sub.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Cancelar"><X className="h-3.5 w-3.5" /></button>}
                  <button onClick={() => deleteSub(sub.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Sin suscripciones. Agrega una.</p></div>}

        {/* Savings insight */}
        {subs.filter(s => s.status === "activa" && s.category === "personal").length > 3 && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">💡 Oportunidad de ahorro</p>
              <p className="text-xs text-amber-700 mt-0.5">Tienes {subs.filter(s => s.status === "activa" && s.category === "personal").length} suscripciones personales activas. Revisa si todas son necesarias — podrías ahorrar cancelando las que no uses.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showForm || editSub) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowForm(false); setEditSub(null); }}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{editSub ? "Editar suscripción" : "Nueva suscripción"}</h3>
              <button onClick={() => { setShowForm(false); setEditSub(null); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={editSub ? editSub.name : form.name} onChange={e => editSub ? setEditSub({...editSub, name: e.target.value}) : setForm({...form, name: e.target.value})} placeholder="Nombre del servicio *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-3 gap-2">
                <input value={editSub ? String(editSub.amount) : form.amount} onChange={e => editSub ? setEditSub({...editSub, amount: Number(e.target.value)}) : setForm({...form, amount: e.target.value})} placeholder="Monto *" type="number" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <select value={editSub ? editSub.currency : form.currency} onChange={e => editSub ? setEditSub({...editSub, currency: e.target.value}) : setForm({...form, currency: e.target.value})} className="rounded border px-3 py-2 text-sm">
                  <option value="USD">USD</option><option value="COP">COP</option><option value="EUR">EUR</option><option value="MXN">MXN</option>
                </select>
                <select value={editSub ? editSub.cycle : form.cycle} onChange={e => editSub ? setEditSub({...editSub, cycle: e.target.value as Subscription["cycle"]}) : setForm({...form, cycle: e.target.value as Subscription["cycle"]})} className="rounded border px-3 py-2 text-sm">
                  <option value="semanal">Semanal</option><option value="mensual">Mensual</option><option value="trimestral">Trimestral</option><option value="anual">Anual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={editSub ? editSub.category : form.category} onChange={e => editSub ? setEditSub({...editSub, category: e.target.value as Subscription["category"]}) : setForm({...form, category: e.target.value as Subscription["category"]})} className="rounded border px-3 py-2 text-sm">
                  <option value="personal">Personal</option><option value="profesional">Profesional</option><option value="cliente">Cliente</option>
                </select>
                <input value={editSub ? editSub.nextBilling : form.nextBilling} onChange={e => editSub ? setEditSub({...editSub, nextBilling: e.target.value}) : setForm({...form, nextBilling: e.target.value})} type="date" placeholder="Próximo cobro" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={editSub ? editSub.paymentMethod : form.paymentMethod} onChange={e => editSub ? setEditSub({...editSub, paymentMethod: e.target.value}) : setForm({...form, paymentMethod: e.target.value})} placeholder="Método (Visa, Nequi...)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={editSub ? editSub.cardLast4 : form.cardLast4} onChange={e => editSub ? setEditSub({...editSub, cardLast4: e.target.value}) : setForm({...form, cardLast4: e.target.value})} placeholder="Últimos 4 dígitos" maxLength={4} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <input value={editSub ? editSub.notes : form.notes} onChange={e => editSub ? setEditSub({...editSub, notes: e.target.value}) : setForm({...form, notes: e.target.value})} placeholder="Notas (opcional)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <button onClick={editSub ? updateSub : addSub} disabled={editSub ? !editSub.name.trim() : !form.name.trim() || !form.amount} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{editSub ? "Guardar cambios" : "Agregar suscripción"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
