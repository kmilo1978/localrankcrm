"use client";
import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Ban, Calendar, CheckCircle2, Clock, Copy, CreditCard, DollarSign, Edit3, FileText, HandCoins, History, Plus, Trash2, Upload, X, ChevronDown } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

/* ─── Types ─── */
type InvoiceStatus = "paid" | "pending" | "overdue" | "cancelled";
type Invoice = { id: string; number: string; client: string; amount: number; currency: string; status: InvoiceStatus; issuedAt: string; dueDate: string; paidAt?: string; notes?: string; attachments?: AttachedFile[] };
type PaymentAgreement = { id: string; client: string; totalDebt: number; installments: number; monthlyAmount: number; startDate: string; status: "active" | "defaulted" | "completed"; notes?: string; attachments?: AttachedFile[] };
type CollectionEntry = { id: string; client: string; action: string; channel: string; date: string; result: string; attachments?: AttachedFile[] };
type Reminder = { id: string; client: string; message: string; channel: string; date: string; status: "pending" | "sent" | "done"; attachments?: AttachedFile[] };
type AttachedFile = { id: string; name: string; data: string; type: string; uploadedAt: string };
type Tab = "facturas" | "por_cobrar" | "vencimientos" | "pagos" | "recordatorios" | "acuerdos" | "historial" | "cancelaciones";

/* ─── Constants ─── */
const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "facturas", label: "Facturas", icon: FileText },
  { key: "por_cobrar", label: "Cobrar", icon: DollarSign },
  { key: "vencimientos", label: "Vencimientos", icon: Clock },
  { key: "pagos", label: "Pagos", icon: CheckCircle2 },
  { key: "recordatorios", label: "Recordatorios", icon: Calendar },
  { key: "acuerdos", label: "Acuerdos", icon: HandCoins },
  { key: "historial", label: "Historial", icon: History },
  { key: "cancelaciones", label: "Cancelaciones", icon: Ban },
];

const STATUS_STYLES: Record<string, string> = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", overdue: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-600" };
const STATUS_LABELS: Record<string, string> = { paid: "Pagada", pending: "Pendiente", overdue: "Vencida", cancelled: "Cancelada" };

const SEED_INVOICES: Invoice[] = [
  { id: "inv1", number: "FAC-1045", client: "TechCorp Solutions", amount: 12500, currency: "USD", status: "pending", issuedAt: "2026-07-05", dueDate: "2026-07-20", attachments: [] },
  { id: "inv2", number: "FAC-1044", client: "MediaGroup Digital", amount: 4500, currency: "USD", status: "overdue", issuedAt: "2026-06-15", dueDate: "2026-07-01", attachments: [] },
  { id: "inv3", number: "FAC-1043", client: "LogiNext International", amount: 8000, currency: "USD", status: "paid", issuedAt: "2026-06-01", dueDate: "2026-06-15", paidAt: "2026-06-14", attachments: [] },
  { id: "inv4", number: "FAC-1042", client: "InnovateLab", amount: 3200, currency: "USD", status: "paid", issuedAt: "2026-05-20", dueDate: "2026-06-05", paidAt: "2026-06-03", attachments: [] },
  { id: "inv5", number: "FAC-1041", client: "RetailMax", amount: 15000, currency: "USD", status: "overdue", issuedAt: "2026-06-01", dueDate: "2026-06-30", attachments: [] },
  { id: "inv6", number: "FAC-1040", client: "FinServ Partners", amount: 6800, currency: "USD", status: "cancelled", issuedAt: "2026-05-10", dueDate: "2026-05-25", attachments: [] },
];

const SEED_AGREEMENTS: PaymentAgreement[] = [
  { id: "pa1", client: "MediaGroup Digital", totalDebt: 4500, installments: 3, monthlyAmount: 1500, startDate: "2026-07-15", status: "active", attachments: [] },
  { id: "pa2", client: "RetailMax", totalDebt: 15000, installments: 6, monthlyAmount: 2500, startDate: "2026-08-01", status: "active", attachments: [] },
];

const SEED_HISTORY: CollectionEntry[] = [
  { id: "ch1", client: "MediaGroup Digital", action: "Recordatorio enviado", channel: "WhatsApp", date: "2026-07-17", result: "Leído, sin respuesta", attachments: [] },
  { id: "ch2", client: "RetailMax", action: "Llamada de cobranza", channel: "Teléfono", date: "2026-07-16", result: "Acordó pago en 6 cuotas", attachments: [] },
  { id: "ch3", client: "MediaGroup Digital", action: "Email de cobranza", channel: "Email", date: "2026-07-10", result: "No abierto", attachments: [] },
  { id: "ch4", client: "RetailMax", action: "Primer recordatorio", channel: "WhatsApp", date: "2026-07-05", result: "Pidió más tiempo", attachments: [] },
  { id: "ch5", client: "FinServ Partners", action: "Notificación de cancelación", channel: "Email", date: "2026-06-25", result: "Servicio cancelado por mora", attachments: [] },
];

const SEED_REMINDERS: Reminder[] = [
  { id: "rem1", client: "MediaGroup Digital", message: "Recordar pago factura FAC-1044", channel: "WhatsApp", date: "2026-07-20", status: "pending", attachments: [] },
  { id: "rem2", client: "RetailMax", message: "Primera cuota acuerdo de pago", channel: "Email", date: "2026-08-01", status: "pending", attachments: [] },
  { id: "rem3", client: "TechCorp Solutions", message: "Factura FAC-1045 vence pronto", channel: "WhatsApp", date: "2026-07-18", status: "sent", attachments: [] },
];

/* ─── Action Menu Component ─── */
function ActionMenu({ onDuplicate, onEdit, onUpload, onDelete, extra }: { onDuplicate: () => void; onEdit: () => void; onUpload: () => void; onDelete: () => void; extra?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler); }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100" title="Acciones"><ChevronDown className="h-3.5 w-3.5" /></button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
          {extra}
          <button onClick={() => { onEdit(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50"><Edit3 className="h-3 w-3" />Editar</button>
          <button onClick={() => { onDuplicate(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50"><Copy className="h-3 w-3" />Duplicar</button>
          <button onClick={() => { onUpload(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50"><Upload className="h-3 w-3" />Subir archivo</button>
          <hr className="my-1" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3 w-3" />Eliminar</button>
        </div>
      )}
    </div>
  );
}

/* ─── Attachments Inline ─── */
function AttachmentBadges({ files }: { files?: AttachedFile[] }) {
  if (!files || files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {files.map(f => (
        <span key={f.id} className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-700">
          <FileText className="h-2.5 w-2.5" />{f.name.length > 20 ? f.name.slice(0, 20) + "…" : f.name}
        </span>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CarteraPage() {
  const [tab, setTab] = useState<Tab>("facturas");
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [agreements, setAgreements] = useState<PaymentAgreement[]>(SEED_AGREEMENTS);
  const [history, setHistory] = useState<CollectionEntry[]>(SEED_HISTORY);
  const [reminders, setReminders] = useState<Reminder[]>(SEED_REMINDERS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ type: string; id: string } | null>(null);

  /* ─── Forms state ─── */
  const [showNew, setShowNew] = useState(false);
  const [showNewAgreement, setShowNewAgreement] = useState(false);
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [showNewHistory, setShowNewHistory] = useState(false);
  const [form, setForm] = useState({ number: "", client: "", amount: "", dueDate: "" });
  const [agreementForm, setAgreementForm] = useState({ client: "", totalDebt: "", installments: "3", monthlyAmount: "", startDate: "" });
  const [reminderForm, setReminderForm] = useState({ client: "", message: "", channel: "WhatsApp", date: "" });
  const [historyForm, setHistoryForm] = useState({ client: "", action: "", channel: "WhatsApp", result: "" });

  /* ─── Edit modals ─── */
  const [editInv, setEditInv] = useState<Invoice | null>(null);
  const [editForm, setEditForm] = useState({ client: "", amount: "", dueDate: "", status: "pending" as InvoiceStatus, notes: "" });
  const [editAgr, setEditAgr] = useState<PaymentAgreement | null>(null);
  const [editAgrForm, setEditAgrForm] = useState({ client: "", totalDebt: "", installments: "", monthlyAmount: "", startDate: "", status: "active" as PaymentAgreement["status"] });
  const [editRem, setEditRem] = useState<Reminder | null>(null);
  const [editRemForm, setEditRemForm] = useState({ client: "", message: "", channel: "WhatsApp", date: "", status: "pending" as Reminder["status"] });
  const [editHist, setEditHist] = useState<CollectionEntry | null>(null);
  const [editHistForm, setEditHistForm] = useState({ client: "", action: "", channel: "", result: "" });

  /* ─── Load from storage ─── */
  useEffect(() => {
    setInvoices(loadFromStorage("cartera_invoices", SEED_INVOICES));
    setAgreements(loadFromStorage("cartera_agreements", SEED_AGREEMENTS));
    setHistory(loadFromStorage("cartera_history", SEED_HISTORY));
    setReminders(loadFromStorage("cartera_reminders_v2", SEED_REMINDERS));
  }, []);

  /* ─── Save helpers ─── */
  function saveInv(u: Invoice[]) { setInvoices(u); saveToStorage("cartera_invoices", u); }
  function saveAgr(u: PaymentAgreement[]) { setAgreements(u); saveToStorage("cartera_agreements", u); }
  function saveHist(u: CollectionEntry[]) { setHistory(u); saveToStorage("cartera_history", u); }
  function saveRem(u: Reminder[]) { setReminders(u); saveToStorage("cartera_reminders_v2", u); }
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  /* ─── Invoice CRUD ─── */
  function createInvoice() {
    if (!form.client.trim()) return;
    saveInv([{ id: generateId(), number: `FAC-${1046 + invoices.length}`, client: form.client, amount: Number(form.amount) || 0, currency: "USD", status: "pending", issuedAt: new Date().toISOString().split("T")[0]!, dueDate: form.dueDate || "", attachments: [] }, ...invoices]);
    setForm({ number: "", client: "", amount: "", dueDate: "" }); setShowNew(false);
  }
  function markPaid(id: string) { saveInv(invoices.map((i) => i.id === id ? { ...i, status: "paid" as const, paidAt: new Date().toISOString().split("T")[0]! } : i)); }
  function deleteInv(id: string) { saveInv(invoices.filter((i) => i.id !== id)); }
  function duplicateInv(inv: Invoice) { saveInv([{ ...inv, id: generateId(), number: `FAC-${1046 + invoices.length}`, status: "pending", paidAt: undefined, attachments: [...(inv.attachments || [])] }, ...invoices]); }
  function openEditInv(inv: Invoice) { setEditInv(inv); setEditForm({ client: inv.client, amount: String(inv.amount), dueDate: inv.dueDate, status: inv.status, notes: inv.notes || "" }); }
  function handleEditInv() { if (!editInv) return; saveInv(invoices.map(i => i.id === editInv.id ? { ...i, client: editForm.client, amount: Number(editForm.amount) || 0, dueDate: editForm.dueDate, status: editForm.status, notes: editForm.notes } : i)); setEditInv(null); }

  /* ─── Agreement CRUD ─── */
  function createAgreement() {
    if (!agreementForm.client.trim()) return;
    const a: PaymentAgreement = { id: generateId(), client: agreementForm.client, totalDebt: Number(agreementForm.totalDebt) || 0, installments: Number(agreementForm.installments) || 3, monthlyAmount: Number(agreementForm.monthlyAmount) || 0, startDate: agreementForm.startDate || new Date().toISOString().split("T")[0]!, status: "active", attachments: [] };
    saveAgr([a, ...agreements]);
    setAgreementForm({ client: "", totalDebt: "", installments: "3", monthlyAmount: "", startDate: "" }); setShowNewAgreement(false);
  }
  function deleteAgreement(id: string) { saveAgr(agreements.filter(a => a.id !== id)); }
  function duplicateAgreement(a: PaymentAgreement) { saveAgr([{ ...a, id: generateId(), status: "active", attachments: [...(a.attachments || [])] }, ...agreements]); }
  function openEditAgr(a: PaymentAgreement) { setEditAgr(a); setEditAgrForm({ client: a.client, totalDebt: String(a.totalDebt), installments: String(a.installments), monthlyAmount: String(a.monthlyAmount), startDate: a.startDate, status: a.status }); }
  function handleEditAgr() { if (!editAgr) return; saveAgr(agreements.map(a => a.id === editAgr.id ? { ...a, client: editAgrForm.client, totalDebt: Number(editAgrForm.totalDebt) || 0, installments: Number(editAgrForm.installments) || 3, monthlyAmount: Number(editAgrForm.monthlyAmount) || 0, startDate: editAgrForm.startDate, status: editAgrForm.status } : a)); setEditAgr(null); }

  /* ─── Reminder CRUD ─── */
  function createReminder() {
    if (!reminderForm.client.trim()) return;
    const r: Reminder = { id: generateId(), client: reminderForm.client, message: reminderForm.message, channel: reminderForm.channel, date: reminderForm.date || new Date().toISOString().split("T")[0]!, status: "pending", attachments: [] };
    saveRem([r, ...reminders]);
    setReminderForm({ client: "", message: "", channel: "WhatsApp", date: "" }); setShowNewReminder(false);
  }
  function deleteReminder(id: string) { saveRem(reminders.filter(r => r.id !== id)); }
  function duplicateReminder(r: Reminder) { saveRem([{ ...r, id: generateId(), status: "pending", attachments: [...(r.attachments || [])] }, ...reminders]); }
  function openEditRem(r: Reminder) { setEditRem(r); setEditRemForm({ client: r.client, message: r.message, channel: r.channel, date: r.date, status: r.status }); }
  function handleEditRem() { if (!editRem) return; saveRem(reminders.map(r => r.id === editRem.id ? { ...r, client: editRemForm.client, message: editRemForm.message, channel: editRemForm.channel, date: editRemForm.date, status: editRemForm.status } : r)); setEditRem(null); }
  function markReminderSent(id: string) { saveRem(reminders.map(r => r.id === id ? { ...r, status: "sent" } : r)); }

  /* ─── History CRUD ─── */
  function createHistoryEntry() {
    if (!historyForm.client.trim()) return;
    const h: CollectionEntry = { id: generateId(), client: historyForm.client, action: historyForm.action, channel: historyForm.channel, date: new Date().toISOString().split("T")[0]!, result: historyForm.result, attachments: [] };
    saveHist([h, ...history]);
    setHistoryForm({ client: "", action: "", channel: "WhatsApp", result: "" }); setShowNewHistory(false);
  }
  function deleteHistory(id: string) { saveHist(history.filter(h => h.id !== id)); }
  function duplicateHistory(h: CollectionEntry) { saveHist([{ ...h, id: generateId(), date: new Date().toISOString().split("T")[0]!, attachments: [...(h.attachments || [])] }, ...history]); }
  function openEditHist(h: CollectionEntry) { setEditHist(h); setEditHistForm({ client: h.client, action: h.action, channel: h.channel, result: h.result }); }
  function handleEditHist() { if (!editHist) return; saveHist(history.map(h => h.id === editHist.id ? { ...h, client: editHistForm.client, action: editHistForm.action, channel: editHistForm.channel, result: editHistForm.result } : h)); setEditHist(null); }

  /* ─── File upload handler ─── */
  function triggerUpload(type: string, id: string) {
    setUploadTarget({ type, id });
    fileInputRef.current?.click();
  }
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !uploadTarget) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        const attachment: AttachedFile = { id: generateId(), name: file.name, data, type: file.type, uploadedAt: new Date().toISOString().split("T")[0]! };
        if (uploadTarget.type === "invoice") {
          saveInv(invoices.map(i => i.id === uploadTarget.id ? { ...i, attachments: [...(i.attachments || []), attachment] } : i));
        } else if (uploadTarget.type === "agreement") {
          saveAgr(agreements.map(a => a.id === uploadTarget.id ? { ...a, attachments: [...(a.attachments || []), attachment] } : a));
        } else if (uploadTarget.type === "reminder") {
          saveRem(reminders.map(r => r.id === uploadTarget.id ? { ...r, attachments: [...(r.attachments || []), attachment] } : r));
        } else if (uploadTarget.type === "history") {
          saveHist(history.map(h => h.id === uploadTarget.id ? { ...h, attachments: [...(h.attachments || []), attachment] } : h));
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadTarget(null);
  }

  /* ─── Computed values ─── */
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" multiple onChange={handleFileUpload} className="hidden" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-brand" />Cartera</h1>
          <p className="text-sm text-muted-foreground">Gestión de facturación, cobranza, pagos y cuentas por cobrar.</p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Pendiente</p><p className="text-xl font-bold text-amber-600">{fmt(totalPending)}</p></div>
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Vencido</p><p className="text-xl font-bold text-red-600">{fmt(totalOverdue)}</p></div>
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Cobrado</p><p className="text-xl font-bold text-green-600">{fmt(totalPaid)}</p></div>
          <div className="rounded-lg border bg-white p-4"><p className="text-xs text-muted-foreground">Acuerdos activos</p><p className="text-xl font-bold">{agreements.filter(a => a.status === "active").length}</p></div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 border-b pb-3">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${tab === key ? "bg-brand text-white" : "hover:bg-gray-100"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: Facturas ═══ */}
        {tab === "facturas" && (
          <div>
            <div className="mb-3 flex justify-end"><button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nueva factura</button></div>
            {showNew && (
              <div className="mb-3 flex gap-2 rounded border bg-white p-3 flex-wrap">
                <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Cliente *" className="flex-1 min-w-[120px] rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Monto" type="number" className="w-24 rounded border px-2 py-1.5 text-xs" />
                <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" className="rounded border px-2 py-1.5 text-xs" />
                <button onClick={createInvoice} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button>
                <button onClick={() => setShowNew(false)} className="text-xs text-muted-foreground">✕</button>
              </div>
            )}
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className={`rounded-lg border bg-white p-4 ${inv.status === "overdue" ? "border-red-200" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{inv.client}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[inv.status]}`}>{STATUS_LABELS[inv.status]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{inv.number} · {fmt(inv.amount)} · Vence: {inv.dueDate}</p>
                        <AttachmentBadges files={inv.attachments} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {inv.status !== "paid" && inv.status !== "cancelled" && <button onClick={() => markPaid(inv.id)} className="rounded px-2 py-1 text-[10px] font-medium text-green-600 hover:bg-green-50 border border-green-200">✓ Pagada</button>}
                      <ActionMenu onEdit={() => openEditInv(inv)} onDuplicate={() => duplicateInv(inv)} onUpload={() => triggerUpload("invoice", inv.id)} onDelete={() => deleteInv(inv.id)} />
                    </div>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin facturas registradas.</p>}
            </div>
          </div>
        )}

        {/* ═══ TAB: Cobrar ═══ */}
        {tab === "por_cobrar" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Facturas pendientes y vencidas que necesitan gestión de cobro:</p>
            {invoices.filter(i => i.status === "pending" || i.status === "overdue").map((inv) => (
              <div key={inv.id} className={`rounded-lg border bg-white p-4 ${inv.status === "overdue" ? "border-red-200 bg-red-50/20" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{inv.client}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[inv.status]}`}>{STATUS_LABELS[inv.status]}</span>
                      {inv.status === "overdue" && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.number} · Emitida: {inv.issuedAt} · Vence: {inv.dueDate}</p>
                    <AttachmentBadges files={inv.attachments} />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold">{fmt(inv.amount)}</p>
                    <button onClick={() => markPaid(inv.id)} className="rounded bg-green-600 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-green-700">Cobrar</button>
                    <ActionMenu onEdit={() => openEditInv(inv)} onDuplicate={() => duplicateInv(inv)} onUpload={() => triggerUpload("invoice", inv.id)} onDelete={() => deleteInv(inv.id)} />
                  </div>
                </div>
              </div>
            ))}
            {invoices.filter(i => i.status === "pending" || i.status === "overdue").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin cuentas por cobrar pendientes.</p>}
          </div>
        )}

        {/* ═══ TAB: Vencimientos ═══ */}
        {tab === "vencimientos" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Facturas vencidas que requieren acción inmediata:</p>
            {invoices.filter(i => i.status === "overdue").map((inv) => (
              <div key={inv.id} className="rounded-lg border border-red-200 bg-red-50/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{inv.client}</p>
                      <p className="text-xs text-muted-foreground">{inv.number} · Venció: {inv.dueDate} · Emitida: {inv.issuedAt}</p>
                      <AttachmentBadges files={inv.attachments} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-red-600">{fmt(inv.amount)}</p>
                    <button onClick={() => markPaid(inv.id)} className="rounded bg-green-600 px-3 py-1.5 text-[10px] font-medium text-white">Registrar pago</button>
                    <ActionMenu onEdit={() => openEditInv(inv)} onDuplicate={() => duplicateInv(inv)} onUpload={() => triggerUpload("invoice", inv.id)} onDelete={() => deleteInv(inv.id)} />
                  </div>
                </div>
              </div>
            ))}
            {invoices.filter(i => i.status === "overdue").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin facturas vencidas. ¡Excelente!</p>}
          </div>
        )}

        {/* ═══ TAB: Pagos ═══ */}
        {tab === "pagos" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Pagos recibidos:</p>
            {invoices.filter(i => i.status === "paid").map((inv) => (
              <div key={inv.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{inv.client}</p>
                      <p className="text-xs text-muted-foreground">{inv.number} · Pagada: {inv.paidAt || "—"}</p>
                      <AttachmentBadges files={inv.attachments} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-green-600">{fmt(inv.amount)}</p>
                    <ActionMenu onEdit={() => openEditInv(inv)} onDuplicate={() => duplicateInv(inv)} onUpload={() => triggerUpload("invoice", inv.id)} onDelete={() => deleteInv(inv.id)} />
                  </div>
                </div>
              </div>
            ))}
            {invoices.filter(i => i.status === "paid").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin pagos registrados.</p>}
          </div>
        )}

        {/* ═══ TAB: Recordatorios ═══ */}
        {tab === "recordatorios" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Recordatorios de cobro programados:</p>
              <button onClick={() => setShowNewReminder(true)} className="flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover"><Plus className="h-3 w-3" />Nuevo</button>
            </div>
            {showNewReminder && (
              <div className="rounded border bg-white p-3 flex gap-2 flex-wrap">
                <input value={reminderForm.client} onChange={e => setReminderForm({...reminderForm, client: e.target.value})} placeholder="Cliente *" className="flex-1 min-w-[120px] rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <input value={reminderForm.message} onChange={e => setReminderForm({...reminderForm, message: e.target.value})} placeholder="Mensaje" className="flex-1 min-w-[120px] rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <select value={reminderForm.channel} onChange={e => setReminderForm({...reminderForm, channel: e.target.value})} className="rounded border px-2 py-1.5 text-xs"><option>WhatsApp</option><option>Email</option><option>SMS</option><option>Llamada</option></select>
                <input value={reminderForm.date} onChange={e => setReminderForm({...reminderForm, date: e.target.value})} type="date" className="rounded border px-2 py-1.5 text-xs" />
                <button onClick={createReminder} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button>
                <button onClick={() => setShowNewReminder(false)} className="text-xs text-muted-foreground">✕</button>
              </div>
            )}
            {reminders.map((rem) => (
              <div key={rem.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{rem.client}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rem.status === "pending" ? "bg-amber-100 text-amber-700" : rem.status === "sent" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{rem.status === "pending" ? "Pendiente" : rem.status === "sent" ? "Enviado" : "Completado"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rem.message} · {rem.channel} · {rem.date}</p>
                    <AttachmentBadges files={rem.attachments} />
                  </div>
                  <div className="flex items-center gap-1">
                    {rem.status === "pending" && <button onClick={() => markReminderSent(rem.id)} className="rounded px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 border border-blue-200">Enviar</button>}
                    <ActionMenu onEdit={() => openEditRem(rem)} onDuplicate={() => duplicateReminder(rem)} onUpload={() => triggerUpload("reminder", rem.id)} onDelete={() => deleteReminder(rem.id)} />
                  </div>
                </div>
              </div>
            ))}
            {reminders.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin recordatorios.</p>}
          </div>
        )}

        {/* ═══ TAB: Acuerdos ═══ */}
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
                  <input value={agreementForm.totalDebt} onChange={e => setAgreementForm({...agreementForm, totalDebt: e.target.value})} placeholder="Deuda total" type="number" className="rounded border px-2 py-1.5 text-xs" />
                  <input value={agreementForm.installments} onChange={e => setAgreementForm({...agreementForm, installments: e.target.value})} placeholder="# Cuotas" type="number" className="rounded border px-2 py-1.5 text-xs" />
                  <input value={agreementForm.monthlyAmount} onChange={e => setAgreementForm({...agreementForm, monthlyAmount: e.target.value})} placeholder="Monto mensual" type="number" className="rounded border px-2 py-1.5 text-xs" />
                  <input value={agreementForm.startDate} onChange={e => setAgreementForm({...agreementForm, startDate: e.target.value})} type="date" className="rounded border px-2 py-1.5 text-xs" />
                  <div className="flex gap-1"><button onClick={createAgreement} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button><button onClick={() => setShowNewAgreement(false)} className="text-xs text-muted-foreground px-2">✕</button></div>
                </div>
              </div>
            )}
            {agreements.map((a) => (
              <div key={a.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{a.client}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.status === "active" ? "bg-blue-100 text-blue-700" : a.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{a.status === "active" ? "Activo" : a.status === "completed" ? "Completado" : "Incumplido"}</span>
                    </div>
                    <AttachmentBadges files={a.attachments} />
                  </div>
                  <div className="flex items-center gap-1">
                    <select value={a.status} onChange={e => saveAgr(agreements.map(ag => ag.id === a.id ? { ...ag, status: e.target.value as PaymentAgreement["status"] } : ag))} className="rounded border px-1.5 py-1 text-[10px] focus:outline-none"><option value="active">Activo</option><option value="completed">Completado</option><option value="defaulted">Incumplido</option></select>
                    <ActionMenu onEdit={() => openEditAgr(a)} onDuplicate={() => duplicateAgreement(a)} onUpload={() => triggerUpload("agreement", a.id)} onDelete={() => deleteAgreement(a.id)} />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Deuda:</span><p className="font-semibold">{fmt(a.totalDebt)}</p></div>
                  <div><span className="text-muted-foreground">Cuotas:</span><p className="font-semibold">{a.installments}</p></div>
                  <div><span className="text-muted-foreground">Mensual:</span><p className="font-semibold">{fmt(a.monthlyAmount)}</p></div>
                  <div><span className="text-muted-foreground">Inicio:</span><p className="font-semibold">{a.startDate}</p></div>
                </div>
              </div>
            ))}
            {agreements.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin acuerdos de pago.</p>}
          </div>
        )}

        {/* ═══ TAB: Historial ═══ */}
        {tab === "historial" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Historial de gestiones de cobranza:</p>
              <button onClick={() => setShowNewHistory(true)} className="flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover"><Plus className="h-3 w-3" />Registrar gestión</button>
            </div>
            {showNewHistory && (
              <div className="rounded border bg-white p-3 flex gap-2 flex-wrap mb-2">
                <input value={historyForm.client} onChange={e => setHistoryForm({...historyForm, client: e.target.value})} placeholder="Cliente *" className="flex-1 min-w-[100px] rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <input value={historyForm.action} onChange={e => setHistoryForm({...historyForm, action: e.target.value})} placeholder="Acción realizada" className="flex-1 min-w-[100px] rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <select value={historyForm.channel} onChange={e => setHistoryForm({...historyForm, channel: e.target.value})} className="rounded border px-2 py-1.5 text-xs"><option>WhatsApp</option><option>Email</option><option>Teléfono</option><option>Visita</option></select>
                <input value={historyForm.result} onChange={e => setHistoryForm({...historyForm, result: e.target.value})} placeholder="Resultado" className="flex-1 min-w-[100px] rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <button onClick={createHistoryEntry} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button>
                <button onClick={() => setShowNewHistory(false)} className="text-xs text-muted-foreground">✕</button>
              </div>
            )}
            {history.map((h) => (
              <div key={h.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{h.client} — {h.action}</p>
                      <p className="text-xs text-muted-foreground">{h.channel} · {h.result} · {h.date}</p>
                      <AttachmentBadges files={h.attachments} />
                    </div>
                  </div>
                  <ActionMenu onEdit={() => openEditHist(h)} onDuplicate={() => duplicateHistory(h)} onUpload={() => triggerUpload("history", h.id)} onDelete={() => deleteHistory(h.id)} />
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin historial de cobranza.</p>}
          </div>
        )}

        {/* ═══ TAB: Cancelaciones ═══ */}
        {tab === "cancelaciones" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Servicios cancelados por falta de pago:</p>
              <button onClick={() => { const client = prompt("Cliente a cancelar:"); if (client) { const inv = invoices.find(i => i.client.toLowerCase().includes(client.toLowerCase()) && i.status !== "cancelled"); if (inv) { saveInv(invoices.map(i => i.id === inv.id ? { ...i, status: "cancelled" as const } : i)); } else { saveInv([{ id: generateId(), number: "FAC-" + (1046 + invoices.length), client, amount: 0, currency: "USD", status: "cancelled", issuedAt: new Date().toISOString().split("T")[0]!, dueDate: "", attachments: [] }, ...invoices]); } } }} className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"><Ban className="h-3 w-3" />Cancelar servicio</button>
            </div>
            {invoices.filter(i => i.status === "cancelled").map((inv) => (
              <div key={inv.id} className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ban className="h-5 w-5 text-gray-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold line-through text-muted-foreground">{inv.client}</p>
                      <p className="text-xs text-muted-foreground">{inv.number} · Cancelado por mora</p>
                      <AttachmentBadges files={inv.attachments} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-500">{fmt(inv.amount)}</p>
                    <button onClick={() => saveInv(invoices.map(i => i.id === inv.id ? { ...i, status: "pending" as const } : i))} className="rounded border px-2 py-1 text-[9px] text-blue-600 hover:bg-blue-50">Reactivar</button>
                    <ActionMenu onEdit={() => openEditInv(inv)} onDuplicate={() => duplicateInv(inv)} onUpload={() => triggerUpload("invoice", inv.id)} onDelete={() => deleteInv(inv.id)} />
                  </div>
                </div>
              </div>
            ))}
            {invoices.filter(i => i.status === "cancelled").length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Sin cancelaciones.</p>}
          </div>
        )}
      </div>

      {/* ═══ MODAL: Edit Invoice ═══ */}
      {editInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Editar factura {editInv.number}</h3><button onClick={() => setEditInv(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Cliente</label><input value={editForm.client} onChange={e => setEditForm({...editForm, client: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Monto</label><input value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} type="number" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Fecha vencimiento</label><input value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Estado</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as InvoiceStatus})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                  <option value="pending">Pendiente</option><option value="overdue">Vencida</option><option value="paid">Pagada</option><option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Notas</label><textarea value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" rows={2} /></div>
              <button onClick={handleEditInv} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Edit Agreement ═══ */}
      {editAgr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Editar acuerdo — {editAgr.client}</h3><button onClick={() => setEditAgr(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Cliente</label><input value={editAgrForm.client} onChange={e => setEditAgrForm({...editAgrForm, client: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Deuda total</label><input value={editAgrForm.totalDebt} onChange={e => setEditAgrForm({...editAgrForm, totalDebt: e.target.value})} type="number" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Cuotas</label><input value={editAgrForm.installments} onChange={e => setEditAgrForm({...editAgrForm, installments: e.target.value})} type="number" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Monto mensual</label><input value={editAgrForm.monthlyAmount} onChange={e => setEditAgrForm({...editAgrForm, monthlyAmount: e.target.value})} type="number" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Fecha inicio</label><input value={editAgrForm.startDate} onChange={e => setEditAgrForm({...editAgrForm, startDate: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Estado</label>
                <select value={editAgrForm.status} onChange={e => setEditAgrForm({...editAgrForm, status: e.target.value as PaymentAgreement["status"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                  <option value="active">Activo</option><option value="completed">Completado</option><option value="defaulted">Incumplido</option>
                </select>
              </div>
              <button onClick={handleEditAgr} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Edit Reminder ═══ */}
      {editRem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Editar recordatorio</h3><button onClick={() => setEditRem(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Cliente</label><input value={editRemForm.client} onChange={e => setEditRemForm({...editRemForm, client: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Mensaje</label><input value={editRemForm.message} onChange={e => setEditRemForm({...editRemForm, message: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Canal</label>
                <select value={editRemForm.channel} onChange={e => setEditRemForm({...editRemForm, channel: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                  <option>WhatsApp</option><option>Email</option><option>SMS</option><option>Llamada</option>
                </select>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Fecha</label><input value={editRemForm.date} onChange={e => setEditRemForm({...editRemForm, date: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Estado</label>
                <select value={editRemForm.status} onChange={e => setEditRemForm({...editRemForm, status: e.target.value as Reminder["status"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                  <option value="pending">Pendiente</option><option value="sent">Enviado</option><option value="done">Completado</option>
                </select>
              </div>
              <button onClick={handleEditRem} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Edit History ═══ */}
      {editHist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Editar gestión</h3><button onClick={() => setEditHist(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Cliente</label><input value={editHistForm.client} onChange={e => setEditHistForm({...editHistForm, client: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Acción</label><input value={editHistForm.action} onChange={e => setEditHistForm({...editHistForm, action: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Canal</label>
                <select value={editHistForm.channel} onChange={e => setEditHistForm({...editHistForm, channel: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                  <option>WhatsApp</option><option>Email</option><option>Teléfono</option><option>Visita</option>
                </select>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Resultado</label><input value={editHistForm.result} onChange={e => setEditHistForm({...editHistForm, result: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <button onClick={handleEditHist} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
