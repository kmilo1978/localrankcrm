"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Ban, Calendar, CheckCircle2, Clock, Copy, CreditCard, DollarSign, Edit3, FileText, HandCoins, History, Plus, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Invoice = { id: string; number: string; client: string; amount: number; currency: string; status: "paid" | "pending" | "overdue" | "cancelled"; issuedAt: string; dueDate: string; paidAt?: string };
type PaymentAgreement = { id: string; client: string; totalDebt: number; installments: number; monthlyAmount: number; startDate: string; status: "active" | "defaulted" | "completed" };
type CollectionEntry = { id: string; client: string; action: string; channel: string; date: string; result: string };

type Tab = "facturas" | "por_cobrar" | "vencimientos" | "pagos" | "recordatorios" | "acuerdos" | "historial" | "cancelaciones";

const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "facturas", label: "Facturas", icon: FileText },
  { key: "por_cobrar", label: "Por cobrar", icon: DollarSign },
  { key: "vencimientos", label: "Vencimientos", icon: Clock },
  { key: "pagos", label: "Pagos", icon: CheckCircle2 },
  { key: "recordatorios", label: "Recordatorios", icon: Calendar },
  { key: "acuerdos", label: "Acuerdos", icon: HandCoins },
  { key: "historial", label: "Historial", icon: History },
  { key: "cancelaciones", label: "Cancelaciones", icon: Ban },
];

const SEED_INVOICES: Invoice[] = [
  { id: "inv1", number: "FAC-1045", client: "TechCorp Solutions", amount: 12500, currency: "USD", status: "pending", issuedAt: "2026-07-05", dueDate: "2026-07-20" },
  { id: "inv2", number: "FAC-1044", client: "MediaGroup Digital", amount: 4500, currency: "USD", status: "overdue", issuedAt: "2026-06-15", dueDate: "2026-07-01" },
  { id: "inv3", number: "FAC-1043", client: "LogiNext International", amount: 8000, currency: "USD", status: "paid", issuedAt: "2026-06-01", dueDate: "2026-06-15", paidAt: "2026-06-14" },
  { id: "inv4", number: "FAC-1042", client: "InnovateLab", amount: 3200, currency: "USD", status: "paid", issuedAt: "2026-05-20", dueDate: "2026-06-05", paidAt: "2026-06-03" },
  { id: "inv5", number: "FAC-1041", client: "RetailMax", amount: 15000, currency: "USD", status: "overdue", issuedAt: "2026-06-01", dueDate: "2026-06-30" },
  { id: "inv6", number: "FAC-1040", client: "FinServ Partners", amount: 6800, currency: "USD", status: "cancelled", issuedAt: "2026-05-10", dueDate: "2026-05-25" },
];

const SEED_AGREEMENTS: PaymentAgreement[] = [
  { id: "pa1", client: "MediaGroup Digital", totalDebt: 4500, installments: 3, monthlyAmount: 1500, startDate: "2026-07-15", status: "active" },
  { id: "pa2", client: "RetailMax", totalDebt: 15000, installments: 6, monthlyAmount: 2500, startDate: "2026-08-01", status: "active" },
];

const SEED_HISTORY: CollectionEntry[] = [
  { id: "ch1", client: "MediaGroup Digital", action: "Recordatorio enviado", channel: "WhatsApp", date: "2026-07-17", result: "Leído, sin respuesta" },
  { id: "ch2", client: "RetailMax", action: "Llamada de cobranza", channel: "Teléfono", date: "2026-07-16", result: "Acordó pago en 6 cuotas" },
  { id: "ch3", client: "MediaGroup Digital", action: "Email de cobranza", channel: "Email", date: "2026-07-10", result: "No abierto" },
  { id: "ch4", client: "RetailMax", action: "Primer recordatorio", channel: "WhatsApp", date: "2026-07-05", result: "Pidió más tiempo" },
  { id: "ch5", client: "FinServ Partners", action: "Notificación de cancelación", channel: "Email", date: "2026-06-25", result: "Servicio cancelado por mora" },
];

const STATUS_STYLES: Record<string, string> = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", overdue: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-600" };
const STATUS_LABELS: Record<string, string> = { paid: "Pagada", pending: "Pendiente", overdue: "Vencida", cancelled: "Cancelada" };

export default function CarteraPage() {
  const [tab, setTab] = useState<Tab>("facturas");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agreements, setAgreements] = useState<PaymentAgreement[]>([]);
  const [history] = useState<CollectionEntry[]>(SEED_HISTORY);
  const [showNew, setShowNew] = useState(false);
  const [showNewAgreement, setShowNewAgreement] = useState(false);
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [agreementForm, setAgreementForm] = useState({ client: "", totalDebt: "", installments: "3", monthlyAmount: "", startDate: "" });
  const [reminderForm, setReminderForm] = useState({ client: "", message: "", channel: "WhatsApp", date: "" });
  const [form, setForm] = useState({ number: "", client: "", amount: "", dueDate: "" });

  useEffect(() => { setInvoices(loadFromStorage("cartera_invoices", SEED_INVOICES)); setAgreements(loadFromStorage("cartera_agreements", SEED_AGREEMENTS)); }, []);
  function saveInv(u: Invoice[]) { setInvoices(u); saveToStorage("cartera_invoices", u); }

  function createInvoice() {
    if (!form.client.trim()) return;
    saveInv([{ id: generateId(), number: `FAC-${1046 + invoices.length}`, client: form.client, amount: Number(form.amount) || 0, currency: "USD", status: "pending", issuedAt: new Date().toISOString().split("T")[0]!, dueDate: form.dueDate || "" }, ...invoices]);
    setForm({ number: "", client: "", amount: "", dueDate: "" }); setShowNew(false);
  }
  function markPaid(id: string) { saveInv(invoices.map((i) => i.id === id ? { ...i, status: "paid" as const, paidAt: new Date().toISOString().split("T")[0]! } : i)); }
  function deleteInv(id: string) { saveInv(invoices.filter((i) => i.id !== id)); }
  function duplicateInv(inv: Invoice) { saveInv([{ ...inv, id: generateId(), number: `FAC-${1046 + invoices.length}`, status: "pending", paidAt: undefined }, ...invoices]); }
  const [editInv, setEditInv] = useState<Invoice | null>(null);
  const [editForm, setEditForm] = useState({ client: "", amount: "", dueDate: "", status: "pending" as Invoice["status"] });
  function openEditInv(inv: Invoice) { setEditInv(inv); setEditForm({ client: inv.client, amount: String(inv.amount), dueDate: inv.dueDate, status: inv.status }); }
  function handleEditInv() { if (!editInv) return; saveInv(invoices.map(i => i.id === editInv.id ? { ...i, client: editForm.client, amount: Number(editForm.amount) || 0, dueDate: editForm.dueDate, status: editForm.status } : i)); setEditInv(null); }

  // Agreements CRUD
  function saveAgr(u: PaymentAgreement[]) { setAgreements(u); saveToStorage("cartera_agreements", u); }
  function createAgreement() {
    if (!agreementForm.client.trim()) return;
    const a: PaymentAgreement = { id: generateId(), client: agreementForm.client, totalDebt: Number(agreementForm.totalDebt) || 0, installments: Number(agreementForm.installments) || 3, monthlyAmount: Number(agreementForm.monthlyAmount) || 0, startDate: agreementForm.startDate || new Date().toISOString().split("T")[0]!, status: "active" };
    saveAgr([a, ...agreements]);
    setAgreementForm({ client: "", totalDebt: "", installments: "3", monthlyAmount: "", startDate: "" }); setShowNewAgreement(false);
  }
  function deleteAgreement(id: string) { saveAgr(agreements.filter(a => a.id !== id)); }
  function toggleAgreementStatus(id: string, status: PaymentAgreement["status"]) { saveAgr(agreements.map(a => a.id === id ? { ...a, status } : a)); }

  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-brand" />Cartera</h1>
          <p className="text-sm text-muted-foreground">Gestión de facturación, cobranza y cuentas por cobrar.</p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Pendiente</p><p className="text-xl font-bold text-amber-600">{fmt(totalPending)}</p></div>
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Vencido</p><p className="text-xl font-bold text-red-600">{fmt(totalOverdue)}</p></div>
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Cobrado (mes)</p><p className="text-xl font-bold text-green-600">{fmt(totalPaid)}</p></div>
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Acuerdos activos</p><p className="text-xl font-bold">{agreements.filter((a) => a.status === "active").length}</p></div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 border-b pb-3">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${tab === key ? "bg-brand text-white" : "hover:bg-gray-100"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Facturas */}
        {tab === "facturas" && (
          <div>
            <div className="mb-3 flex justify-end"><button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nueva factura</button></div>
            {showNew && (
              <div className="mb-3 flex gap-2 rounded border bg-white p-3">
                <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Cliente *" className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Monto" type="number" className="w-24 rounded border px-2 py-1.5 text-xs" />
                <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" className="rounded border px-2 py-1.5 text-xs" />
                <button onClick={createInvoice} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button>
                <button onClick={() => setShowNew(false)} className="text-xs text-muted-foreground">✕</button>
              </div>
            )}
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="w-full"><thead className="border-b bg-gray-50"><tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Factura</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Monto</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Vencimiento</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground"></th>
              </tr></thead><tbody className="divide-y">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium">{inv.number}</td>
                    <td className="px-4 py-3 text-sm">{inv.client}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[inv.status]}`}>{STATUS_LABELS[inv.status]}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== "paid" && inv.status !== "cancelled" && <button onClick={() => markPaid(inv.id)} className="rounded px-2 py-1 text-[10px] text-green-600 hover:bg-green-50">Pagada</button>}
                        <button onClick={() => openEditInv(inv)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100" title="Editar"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => duplicateInv(inv)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100" title="Duplicar"><Copy className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteInv(inv.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          </div>
        )}

        {/* Por cobrar */}
        {tab === "por_cobrar" && (
          <div className="space-y-2">
            {invoices.filter((i) => i.status === "pending" || i.status === "overdue").map((inv) => (
              <div key={inv.id} className={`rounded-lg border bg-white p-4 ${inv.status === "overdue" ? "border-red-200" : ""}`}>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold">{inv.client}</p><p className="text-xs text-muted-foreground">{inv.number} · Emitida: {inv.issuedAt}</p></div>
                  <div className="text-right"><p className="text-lg font-bold">{fmt(inv.amount)}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[inv.status]}`}>{STATUS_LABELS[inv.status]}</span></div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" />Vence: {inv.dueDate}{inv.status === "overdue" && <span className="text-red-500 font-medium flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" />VENCIDA</span>}</div>
              </div>
            ))}
            {invoices.filter((i) => i.status === "pending" || i.status === "overdue").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin cuentas por cobrar pendientes.</p>}
          </div>
        )}

        {/* Vencimientos */}
        {tab === "vencimientos" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Facturas vencidas que requieren acción inmediata:</p>
            {invoices.filter((i) => i.status === "overdue").map((inv) => (
              <div key={inv.id} className="rounded-lg border border-red-200 bg-red-50/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-500" /><div><p className="text-sm font-semibold">{inv.client}</p><p className="text-xs text-muted-foreground">{inv.number} · Venció: {inv.dueDate}</p></div></div>
                <div className="text-right"><p className="text-lg font-bold text-red-600">{fmt(inv.amount)}</p><button onClick={() => markPaid(inv.id)} className="mt-1 rounded bg-green-600 px-3 py-1 text-[10px] text-white">Registrar pago</button></div>
              </div>
            ))}
            {invoices.filter((i) => i.status === "overdue").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin facturas vencidas. ¡Excelente!</p>}
          </div>
        )}

        {/* Pagos recibidos */}
        {tab === "pagos" && (
          <div className="space-y-2">
            {invoices.filter((i) => i.status === "paid").map((inv) => (
              <div key={inv.id} className="rounded-lg border bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-sm font-semibold">{inv.client}</p><p className="text-xs text-muted-foreground">{inv.number} · Pagada: {inv.paidAt}</p></div></div>
                <p className="text-lg font-bold text-green-600">{fmt(inv.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recordatorios */}
        {tab === "recordatorios" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Recordatorios de cobro programados:</p>
              <button onClick={() => setShowNewReminder(true)} className="flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover"><Plus className="h-3 w-3" />Nuevo</button>
            </div>
            {showNewReminder && (
              <div className="rounded border bg-white p-3 flex gap-2 flex-wrap">
                <input value={reminderForm.client} onChange={e => setReminderForm({...reminderForm, client: e.target.value})} placeholder="Cliente *" className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <input value={reminderForm.message} onChange={e => setReminderForm({...reminderForm, message: e.target.value})} placeholder="Mensaje" className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <select value={reminderForm.channel} onChange={e => setReminderForm({...reminderForm, channel: e.target.value})} className="rounded border px-2 py-1.5 text-xs"><option>WhatsApp</option><option>Email</option><option>SMS</option><option>Llamada</option></select>
                <input value={reminderForm.date} onChange={e => setReminderForm({...reminderForm, date: e.target.value})} type="date" className="rounded border px-2 py-1.5 text-xs" />
                <button onClick={() => { if (!reminderForm.client.trim()) return; const reminders = JSON.parse(localStorage.getItem("cartera_reminders") || "[]"); reminders.unshift({ id: generateId(), ...reminderForm }); localStorage.setItem("cartera_reminders", JSON.stringify(reminders)); setReminderForm({ client: "", message: "", channel: "WhatsApp", date: "" }); setShowNewReminder(false); }} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button>
                <button onClick={() => setShowNewReminder(false)} className="text-xs text-muted-foreground">✕</button>
              </div>
            )}
            {invoices.filter((i) => i.status === "pending" || i.status === "overdue").map((inv) => (
              <div key={inv.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{inv.client} — {inv.number}</p><p className="text-xs text-muted-foreground">{fmt(inv.amount)} · Vence: {inv.dueDate}</p></div>
                <div className="flex gap-2"><button className="rounded bg-green-600 px-3 py-1.5 text-[10px] font-medium text-white">WhatsApp</button><button className="rounded border px-3 py-1.5 text-[10px] font-medium">Email</button><button className="rounded border px-3 py-1.5 text-[10px] font-medium">Llamar</button></div></div>
              </div>
            ))}
          </div>
        )}

        {/* Acuerdos de pago */}
        {tab === "acuerdos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Acuerdos de pago</p>
              <button onClick={() => setShowNewAgreement(true)} className="flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover"><Plus className="h-3 w-3" />Nuevo acuerdo</button>
            </div>
            {showNewAgreement && (
              <div className="rounded border bg-white p-4 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input value={agreementForm.client} onChange={e => setAgreementForm({...agreementForm, client: e.target.value})} placeholder="Cliente *" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <input value={agreementForm.totalDebt} onChange={e => setAgreementForm({...agreementForm, totalDebt: e.target.value})} placeholder="Deuda total" type="number" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <input value={agreementForm.installments} onChange={e => setAgreementForm({...agreementForm, installments: e.target.value})} placeholder="# Cuotas" type="number" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <input value={agreementForm.monthlyAmount} onChange={e => setAgreementForm({...agreementForm, monthlyAmount: e.target.value})} placeholder="Monto mensual" type="number" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <input value={agreementForm.startDate} onChange={e => setAgreementForm({...agreementForm, startDate: e.target.value})} type="date" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <div className="flex gap-1"><button onClick={createAgreement} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button><button onClick={() => setShowNewAgreement(false)} className="text-xs text-muted-foreground px-2">✕</button></div>
                </div>
              </div>
            )}
            {agreements.map((a) => (
              <div key={a.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{a.client}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "active" ? "bg-blue-100 text-blue-700" : a.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{a.status === "active" ? "Activo" : a.status === "completed" ? "Completado" : "Incumplido"}</span>
                    <select value={a.status} onChange={e => toggleAgreementStatus(a.id, e.target.value as PaymentAgreement["status"])} className="rounded border px-1 py-0.5 text-[9px] focus:outline-none"><option value="active">Activo</option><option value="completed">Completado</option><option value="defaulted">Incumplido</option></select>
                    <button onClick={() => deleteAgreement(a.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Deuda total:</span><p className="font-semibold">{fmt(a.totalDebt)}</p></div>
                  <div><span className="text-muted-foreground">Cuotas:</span><p className="font-semibold">{a.installments}</p></div>
                  <div><span className="text-muted-foreground">Mensual:</span><p className="font-semibold">{fmt(a.monthlyAmount)}</p></div>
                  <div><span className="text-muted-foreground">Inicio:</span><p className="font-semibold">{a.startDate}</p></div>
                </div>
              </div>
            ))}
            {agreements.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin acuerdos de pago.</p>}
          </div>
        )}

        {/* Historial de cobranza */}
        {tab === "historial" && (
          <div className="rounded-lg border bg-white overflow-hidden">
            <div className="divide-y">{history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                <History className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium">{h.client} — {h.action}</p><p className="text-xs text-muted-foreground">{h.channel} · {h.result}</p></div>
                <span className="text-[10px] text-muted-foreground">{h.date}</span>
              </div>
            ))}</div>
          </div>
        )}

        {/* Cancelaciones */}
        {tab === "cancelaciones" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Servicios cancelados por falta de pago:</p>
              <button onClick={() => { const client = prompt("Cliente a cancelar:"); if (client) { const inv = invoices.find(i => i.client.toLowerCase().includes(client.toLowerCase()) && i.status !== "cancelled"); if (inv) { saveInv(invoices.map(i => i.id === inv.id ? { ...i, status: "cancelled" as const } : i)); } else { saveInv([{ id: generateId(), number: "FAC-" + (1046 + invoices.length), client, amount: 0, currency: "USD", status: "cancelled", issuedAt: new Date().toISOString().split("T")[0]!, dueDate: "" }, ...invoices]); } } }} className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"><Plus className="h-3 w-3" />Cancelar servicio</button>
            </div>
            {invoices.filter((i) => i.status === "cancelled").map((inv) => (
              <div key={inv.id} className="rounded-lg border border-gray-300 bg-gray-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><Ban className="h-5 w-5 text-gray-500" /><div><p className="text-sm font-semibold line-through text-muted-foreground">{inv.client}</p><p className="text-xs text-muted-foreground">{inv.number} · Cancelado por mora</p></div></div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-500">{fmt(inv.amount)}</p>
                  <button onClick={() => saveInv(invoices.map(i => i.id === inv.id ? { ...i, status: "pending" as const } : i))} className="rounded border px-2 py-1 text-[9px] text-blue-600 hover:bg-blue-50">Reactivar</button>
                  <button onClick={() => deleteInv(inv.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {invoices.filter((i) => i.status === "cancelled").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin cancelaciones.</p>}
          </div>
        )}
      </div>

      {/* Edit Invoice Modal */}
      {editInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Editar factura {editInv.number}</h3><button onClick={() => setEditInv(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Cliente</label><input value={editForm.client} onChange={e => setEditForm({...editForm, client: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Monto</label><input value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} type="number" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Fecha vencimiento</label><input value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Estado</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as Invoice["status"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                  <option value="pending">Pendiente</option><option value="overdue">Vencida</option><option value="paid">Pagada</option><option value="cancelled">Cancelada</option>
                </select>
              </div>
              <button onClick={handleEditInv} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
