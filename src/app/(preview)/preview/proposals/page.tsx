"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Download, Edit2, Eye, FileText, Image, Link, Mic, PenTool, Plus, Send, Trash2, Upload, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type MediaItem = { id: string; type: "image" | "audio" | "embed"; url: string; name: string };
type ProposalSection = { id: string; title: string; content: string; media: MediaItem[] };

type Proposal = {
  id: string;
  title: string;
  client: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  sections: ProposalSection[];
  total: string;
  createdAt: string;
  templateId?: string;
  logoUrl: string;
  signatureUrl: string;
  signatureName: string;
  // Tracking & security
  sentVia: string;
  utm: { source: string; medium: string; campaign: string };
  password: string;
  views: number;
  lastViewedAt: string;
  linkEnabled: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string;
  sections: { title: string; content: string }[];
};

const TEMPLATES: Template[] = [
  {
    id: "t1", name: "Servicios Digitales", description: "Para agencias de marketing, diseño web, SEO",
    sections: [
      { title: "Resumen Ejecutivo", content: "Estimado [CLIENTE],\n\nGracias por la oportunidad de presentar nuestra propuesta de servicios digitales. A continuación detallamos nuestra solución personalizada para [EMPRESA]." },
      { title: "Alcance del Proyecto", content: "• Diseño y desarrollo de sitio web responsive\n• Configuración de SEO técnico y on-page\n• Estrategia de contenido (blog + redes)\n• Campañas de Google Ads y Meta Ads\n• Reportes mensuales de rendimiento" },
      { title: "Metodología", content: "Fase 1 — Estrategia (Semana 1-2)\nFase 2 — Diseño y desarrollo (Semana 3-6)\nFase 3 — Lanzamiento y optimización (Semana 7-8)\nFase 4 — Mantenimiento mensual" },
      { title: "Inversión", content: "Setup inicial: $[MONTO]\nMantenimiento mensual: $[MONTO_MENSUAL]\n\nIncluye: Hosting, SSL, soporte prioritario, 2 revisiones mensuales." },
      { title: "Términos y Condiciones", content: "• Forma de pago: 50% inicio, 50% al entregar\n• Vigencia de la propuesta: 15 días\n• Garantía: 30 días post-entrega\n• Cancelación: Con 15 días de anticipación" },
    ],
  },
  {
    id: "t2", name: "Consultoría Empresarial", description: "Para servicios de consultoría y asesoría",
    sections: [
      { title: "Introducción", content: "Estimado [CLIENTE],\n\nEs un placer presentar nuestra propuesta de consultoría para [EMPRESA]. Nuestro equipo cuenta con [X] años de experiencia en [INDUSTRIA]." },
      { title: "Diagnóstico Inicial", content: "Basado en nuestra conversación inicial, identificamos las siguientes áreas de oportunidad:\n\n1. [ÁREA 1]\n2. [ÁREA 2]\n3. [ÁREA 3]" },
      { title: "Plan de Acción", content: "Mes 1: Auditoría y análisis de situación actual\nMes 2: Diseño de estrategia e implementación\nMes 3: Ejecución y seguimiento\nMes 4+: Optimización continua" },
      { title: "Entregables", content: "• Reporte de diagnóstico completo\n• Plan estratégico documentado\n• Sesiones de mentoría (2 por semana)\n• Dashboard de KPIs personalizado\n• Informe de resultados mensual" },
      { title: "Inversión", content: "Paquete completo (4 meses): $[MONTO]\nPago mensual: $[MONTO_MENSUAL]\n\nDescuento por pago de contado: 10%" },
    ],
  },
  {
    id: "t3", name: "Propuesta en Blanco", description: "Empieza desde cero con secciones vacías",
    sections: [
      { title: "Introducción", content: "" },
      { title: "Servicios / Alcance", content: "" },
      { title: "Inversión", content: "" },
      { title: "Términos", content: "" },
    ],
  },
  {
    id: "t4", name: "E-commerce / Tienda Online", description: "Para proyectos de tienda online o marketplace",
    sections: [
      { title: "Resumen", content: "Propuesta para el desarrollo de tienda online para [EMPRESA].\n\nObjetivo: Lanzar un e-commerce profesional que genere ventas desde el día 1." },
      { title: "Funcionalidades", content: "• Catálogo de productos ilimitado\n• Carrito de compras y checkout optimizado\n• Pasarelas de pago (Stripe, PayPal, transferencia)\n• Sistema de inventario\n• Panel de administración\n• Integración con WhatsApp para soporte\n• SEO técnico incluido" },
      { title: "Diseño", content: "• Diseño UI/UX personalizado\n• Mobile-first\n• Velocidad de carga optimizada\n• Compatible con todos los navegadores" },
      { title: "Timeline", content: "Semana 1-2: Wireframes y diseño\nSemana 3-5: Desarrollo frontend + backend\nSemana 6: Testing y QA\nSemana 7: Lanzamiento\nSemana 8: Soporte post-lanzamiento" },
      { title: "Inversión", content: "Desarrollo completo: $[MONTO]\nMantenimiento mensual: $[MONTO_MENSUAL]\n\nIncluye: Hosting primer año, dominio, SSL, capacitación." },
    ],
  },
];

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const STATUS_LABELS = { draft: "Borrador", sent: "Enviada", accepted: "Aceptada", rejected: "Rechazada" };

const SEED_PROPOSALS: Proposal[] = [
  { id: "p1", title: "Propuesta Web + SEO — TechCorp", client: "TechCorp Solutions", status: "sent", total: "$12,500 USD", createdAt: "2026-07-15", templateId: "t1", logoUrl: "", signatureUrl: "", signatureName: "Juan Pérez — Director Comercial", sentVia: "email", utm: { source: "crm", medium: "email", campaign: "propuestas_julio" }, password: "", views: 4, lastViewedAt: "Hace 2h", linkEnabled: true, sections: [
    { id: "s1", title: "Resumen Ejecutivo", content: "Estimado Carlos Ruiz,\n\nGracias por la oportunidad de presentar nuestra propuesta. A continuación detallamos nuestra solución para TechCorp Solutions.", media: [] },
    { id: "s2", title: "Alcance", content: "• Rediseño completo del sitio web\n• SEO técnico + estrategia de contenido\n• Landing pages para campañas\n• Google Ads (setup + 3 meses)", media: [] },
    { id: "s3", title: "Inversión", content: "Setup: $8,500 USD\nMantenimiento mensual: $1,500 USD\nTotal primer año: $12,500 USD", media: [] },
  ]},
  { id: "p2", title: "Consultoría Digital — MediaGroup", client: "MediaGroup Digital", status: "draft", total: "$5,000 USD", createdAt: "2026-07-17", logoUrl: "", signatureUrl: "", signatureName: "", sentVia: "", utm: { source: "", medium: "", campaign: "" }, password: "demo2026", views: 0, lastViewedAt: "", linkEnabled: false, sections: [
    { id: "s4", title: "Introducción", content: "Propuesta de consultoría para optimizar la estrategia digital de MediaGroup.", media: [] },
    { id: "s5", title: "Plan", content: "4 semanas de análisis + implementación.", media: [] },
    { id: "s6", title: "Inversión", content: "$5,000 USD - pago en 2 partes", media: [] },
  ]},
];

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [previewing, setPreviewing] = useState<Proposal | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setProposals(loadFromStorage("proposals", SEED_PROPOSALS)); }, []);
  function save(u: Proposal[]) { setProposals(u); saveToStorage("proposals", u); }

  function createFromTemplate(template: Template) {
    const p: Proposal = {
      id: generateId(),
      title: `Nueva propuesta — ${template.name}`,
      client: "",
      status: "draft",
      total: "",
      createdAt: new Date().toISOString().split("T")[0]!,
      templateId: template.id,
      logoUrl: "",
      signatureUrl: "",
      signatureName: "",
      sentVia: "",
      utm: { source: "", medium: "", campaign: "" },
      password: "",
      views: 0,
      lastViewedAt: "",
      linkEnabled: true,
      sections: template.sections.map((s) => ({ id: generateId(), title: s.title, content: s.content, media: [] })),
    };
    save([p, ...proposals]);
    setEditing(p);
    setShowTemplates(false);
  }

  function updateProposal(updated: Proposal) {
    save(proposals.map((p) => p.id === updated.id ? updated : p));
    setEditing(updated);
  }

  function deleteProposal(id: string) {
    save(proposals.filter((p) => p.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  function duplicateProposal(p: Proposal) {
    const dup: Proposal = { ...p, id: generateId(), title: `${p.title} (copia)`, status: "draft", createdAt: new Date().toISOString().split("T")[0]!, sections: p.sections.map((s) => ({ ...s, id: generateId(), media: [...(s.media || [])] })) };
    save([dup, ...proposals]);
  }

  function addSection() {
    if (!editing) return;
    updateProposal({ ...editing, sections: [...editing.sections, { id: generateId(), title: "Nueva sección", content: "", media: [] }] });
  }

  function removeSection(sectionId: string) {
    if (!editing) return;
    updateProposal({ ...editing, sections: editing.sections.filter((s) => s.id !== sectionId) });
  }

  function updateSection(sectionId: string, field: "title" | "content", value: string) {
    if (!editing) return;
    updateProposal({ ...editing, sections: editing.sections.map((s) => s.id === sectionId ? { ...s, [field]: value } : s) });
  }

  function handleFileUpload(sectionId: string, file: File, type: "image" | "audio") {
    if (!editing) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (!url) return;
      const media: MediaItem = { id: generateId(), type, url, name: file.name };
      updateProposal({ ...editing, sections: editing.sections.map((s) => s.id === sectionId ? { ...s, media: [...(s.media || []), media] } : s) });
    };
    reader.readAsDataURL(file);
  }

  function addEmbed(sectionId: string) {
    if (!editing) return;
    const url = prompt("Pega la URL o script:\n\n• URL de embed (YouTube, Loom, Figma, Google Slides)\n• URL de calendario (Calendly, Cal.com, TidyCal)\n• Código <script> o <iframe> completo");
    if (!url) return;
    const isScript = url.trim().startsWith("<");
    const media: MediaItem = { id: generateId(), type: "embed", url: url.trim(), name: isScript ? "Script embed" : url.split("/").slice(2, 3).join("") || "embed" };
    updateProposal({ ...editing, sections: editing.sections.map((s) => s.id === sectionId ? { ...s, media: [...(s.media || []), media] } : s) });
  }

  function removeMedia(sectionId: string, mediaId: string) {
    if (!editing) return;
    updateProposal({ ...editing, sections: editing.sections.map((s) => s.id === sectionId ? { ...s, media: (s.media || []).filter((m) => m.id !== mediaId) } : s) });
  }

  function handleLogoUpload(file: File) {
    if (!editing) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const url = ev.target?.result as string; if (url) updateProposal({ ...editing, logoUrl: url }); };
    reader.readAsDataURL(file);
  }

  function handleSignatureUpload(file: File) {
    if (!editing) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const url = ev.target?.result as string; if (url) updateProposal({ ...editing, signatureUrl: url }); };
    reader.readAsDataURL(file);
  }

  function exportPDF(proposal: Proposal) {
    const content = `
      <html><head><title>${proposal.title}</title>
      <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1f2937}
      h1{font-size:24px;margin-bottom:4px}h2{font-size:18px;color:#e91e8c;margin-top:32px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
      p{white-space:pre-wrap;line-height:1.6}.meta{color:#6b7280;font-size:14px}.total{font-size:20px;font-weight:bold;color:#e91e8c;margin-top:24px;padding:16px;border:2px solid #e91e8c;border-radius:8px;text-align:center}
      img.logo{height:48px;margin-bottom:16px}img.media{max-height:240px;border-radius:8px;margin-top:12px}img.sig{height:40px;margin-top:24px}
      .signature{border-top:1px solid #e5e7eb;padding-top:16px;margin-top:32px}
      </style></head><body>
      ${proposal.logoUrl ? `<img class="logo" src="${proposal.logoUrl}" />` : ""}
      <h1>${proposal.title}</h1>
      <p class="meta">Cliente: ${proposal.client || "—"} | Fecha: ${proposal.createdAt}</p>
      ${proposal.sections.map((s) => `<h2>${s.title}</h2><p>${s.content}</p>${(s.media || []).filter((m) => m.type === "image").map((m) => `<img class="media" src="${m.url}" />`).join("")}`).join("")}
      ${proposal.total ? `<div class="total">Total: ${proposal.total}</div>` : ""}
      ${proposal.signatureUrl || proposal.signatureName ? `<div class="signature">${proposal.signatureUrl ? `<img class="sig" src="${proposal.signatureUrl}" />` : ""}${proposal.signatureName ? `<p><strong>${proposal.signatureName}</strong></p>` : ""}</div>` : ""}
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(content);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - proposals list */}
      <div className="w-72 shrink-0 border-r flex flex-col overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Propuestas</h2>
          <button onClick={() => setShowTemplates(true)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover">
            <Plus className="h-3.5 w-3.5" />Nueva
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {proposals.map((p) => (
            <div key={p.id} onClick={() => { setEditing(p); setPreviewing(null); }} className={`group cursor-pointer border-b px-4 py-3 hover:bg-gray-50 ${editing?.id === p.id ? "bg-brand-tint" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.client || "Sin cliente"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[p.status]}`}>{STATUS_LABELS[p.status]}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.createdAt}</span>
                <div className="flex items-center gap-2">
                  {p.sentVia && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] text-blue-700">{p.sentVia}</span>}
                  {p.views > 0 && <span className="text-[9px]">👁 {p.views}</span>}
                  {p.total && <span className="font-medium text-brand">{p.total}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editing ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setEditing(null)} className="rounded-md border px-2 py-1.5 text-xs hover:bg-gray-50" title="Volver">← Atrás</button>
                <select value={editing.status} onChange={(e) => updateProposal({ ...editing, status: e.target.value as Proposal["status"] })} className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${STATUS_STYLES[editing.status]}`}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreviewing(previewing ? null : editing)} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <Eye className="h-3.5 w-3.5" />{previewing ? "Editar" : "Vista previa"}
                </button>
                <button onClick={() => exportPDF(editing)} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <Download className="h-3.5 w-3.5" />Exportar PDF
                </button>
                <button onClick={() => duplicateProposal(editing)} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <Copy className="h-3.5 w-3.5" />Duplicar
                </button>
                <button onClick={() => deleteProposal(editing.id)} className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />Eliminar
                </button>
              </div>
            </div>

            {/* Editor or Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewing ? (
                /* Preview mode */
                <div ref={printRef} className="mx-auto max-w-2xl">
                  {editing.logoUrl && <img src={editing.logoUrl} alt="Logo" className="h-12 w-auto mb-4" />}
                  <h1 className="text-2xl font-bold">{editing.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">Cliente: {editing.client || "—"} | {editing.createdAt}</p>
                  {editing.sections.map((s) => (
                    <div key={s.id} className="mt-6">
                      <h2 className="text-lg font-semibold text-brand border-b pb-2">{s.title}</h2>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{s.content}</p>
                      {(s.media || []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {(s.media || []).map((m) => (
                            <div key={m.id}>
                              {m.type === "image" && <img src={m.url} alt={m.name} className="max-h-64 rounded border" />}
                              {m.type === "audio" && <audio src={m.url} controls className="w-full" />}
                              {m.type === "embed" && (
                                m.url.trim().startsWith("<")
                                  ? <div className="rounded border bg-gray-50 p-2" dangerouslySetInnerHTML={{ __html: m.url }} />
                                  : <iframe src={m.url} className="w-full h-64 rounded border" allowFullScreen />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {editing.total && (
                    <div className="mt-8 rounded-lg border-2 border-brand p-4 text-center">
                      <p className="text-xl font-bold text-brand">Total: {editing.total}</p>
                    </div>
                  )}
                  {(editing.signatureUrl || editing.signatureName) && (
                    <div className="mt-8 border-t pt-4">
                      {editing.signatureUrl && <img src={editing.signatureUrl} alt="Firma" className="h-12 w-auto" />}
                      {editing.signatureName && <p className="mt-1 text-sm font-medium">{editing.signatureName}</p>}
                    </div>
                  )}
                </div>
              ) : (
                /* Editor mode */
                <div className="mx-auto max-w-2xl space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Título de la propuesta</label>
                      <input value={editing.title} onChange={(e) => updateProposal({ ...editing, title: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Cliente</label>
                      <input value={editing.client} onChange={(e) => updateProposal({ ...editing, client: e.target.value })} placeholder="Nombre del cliente" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Total / Inversión</label>
                    <input value={editing.total} onChange={(e) => updateProposal({ ...editing, total: e.target.value })} placeholder="$10,000 USD" className="w-48 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>

                  {/* Logo & Signature */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border p-4 bg-gray-50/50">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium flex items-center gap-1"><Image className="h-3.5 w-3.5" />Logo de la propuesta</label>
                      {editing.logoUrl ? (
                        <div className="flex items-center gap-3">
                          <img src={editing.logoUrl} alt="Logo" className="h-12 w-auto rounded border" />
                          <button onClick={() => updateProposal({ ...editing, logoUrl: "" })} className="text-xs text-red-500 hover:underline">Eliminar</button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-white">
                          <Upload className="h-4 w-4" />Subir logo
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ""; }} />
                        </label>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium flex items-center gap-1"><PenTool className="h-3.5 w-3.5" />Firma</label>
                      {editing.signatureUrl ? (
                        <div className="flex items-center gap-3">
                          <img src={editing.signatureUrl} alt="Firma" className="h-10 w-auto rounded border bg-white p-1" />
                          <button onClick={() => updateProposal({ ...editing, signatureUrl: "" })} className="text-xs text-red-500 hover:underline">Eliminar</button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-white">
                          <Upload className="h-4 w-4" />Subir firma (imagen)
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSignatureUpload(f); e.target.value = ""; }} />
                        </label>
                      )}
                      <input value={editing.signatureName} onChange={(e) => updateProposal({ ...editing, signatureName: e.target.value })} placeholder="Nombre y cargo (ej: Juan Pérez — Director)" className="mt-2 w-full rounded-md border px-3 py-1.5 text-xs focus:border-brand focus:outline-none" />
                    </div>
                  </div>

                  {/* Tracking, UTM, Password */}
                  <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Tracking & Seguridad</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium">Enviada por canal</label>
                        <select value={editing.sentVia} onChange={(e) => updateProposal({ ...editing, sentVia: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
                          <option value="">Sin enviar</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="link">Link directo</option>
                          <option value="presencial">Presencial</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">🔒 Contraseña (opcional)</label>
                        <input value={editing.password} onChange={(e) => updateProposal({ ...editing, password: e.target.value })} placeholder="Sin contraseña" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="mb-1 block text-[10px] font-medium">utm_source</label><input value={editing.utm.source} onChange={(e) => updateProposal({ ...editing, utm: { ...editing.utm, source: e.target.value } })} placeholder="crm" className="w-full rounded border px-2 py-1.5 text-xs" /></div>
                      <div><label className="mb-1 block text-[10px] font-medium">utm_medium</label><input value={editing.utm.medium} onChange={(e) => updateProposal({ ...editing, utm: { ...editing.utm, medium: e.target.value } })} placeholder="email" className="w-full rounded border px-2 py-1.5 text-xs" /></div>
                      <div><label className="mb-1 block text-[10px] font-medium">utm_campaign</label><input value={editing.utm.campaign} onChange={(e) => updateProposal({ ...editing, utm: { ...editing.utm, campaign: e.target.value } })} placeholder="propuestas_julio" className="w-full rounded border px-2 py-1.5 text-xs" /></div>
                    </div>
                    {/* Analytics */}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-1.5 text-xs"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-[10px]">{editing.views}</span><span className="text-muted-foreground">vistas</span></div>
                      {editing.lastViewedAt && <span className="text-[10px] text-muted-foreground">Última: {editing.lastViewedAt}</span>}
                      <label className="ml-auto flex items-center gap-1.5 text-xs"><input type="checkbox" checked={editing.linkEnabled} onChange={(e) => updateProposal({ ...editing, linkEnabled: e.target.checked })} className="accent-[var(--accent)]" />Link activo</label>
                    </div>
                  </div>

                  <hr />

                  {/* Sections */}
                  {editing.sections.map((section, idx) => (
                    <div key={section.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <input value={section.title} onChange={(e) => updateSection(section.id, "title", e.target.value)} className="font-medium text-sm border-0 bg-transparent focus:outline-none focus:ring-0 p-0 flex-1" placeholder="Título de sección" />
                        <button onClick={() => removeSection(section.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <textarea value={section.content} onChange={(e) => updateSection(section.id, "content", e.target.value)} rows={6} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" placeholder="Contenido de esta sección..." />
                      {/* Media items */}
                      {(section.media || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(section.media || []).map((m) => (
                            <div key={m.id} className="relative rounded border bg-gray-50 p-1.5">
                              {m.type === "image" && <img src={m.url} alt={m.name} className="h-20 w-20 rounded object-cover" />}
                              {m.type === "audio" && (
                                <div className="flex items-center gap-2 px-2 py-1">
                                  <Mic className="h-4 w-4 text-brand" />
                                  <audio src={m.url} controls className="h-8 w-40" />
                                </div>
                              )}
                              {m.type === "embed" && (
                                <div className="flex items-center gap-2 px-2 py-1 text-xs">
                                  <Link className="h-3.5 w-3.5 text-brand" />
                                  <span className="truncate max-w-[150px]">{m.url.startsWith("<") ? "Script/iframe embed" : m.url}</span>
                                </div>
                              )}
                              <button onClick={() => removeMedia(section.id, m.id)} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Media buttons */}
                      <div className="mt-2 flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground hover:bg-gray-50">
                          <Image className="h-3.5 w-3.5" />Imagen
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(section.id, f, "image"); e.target.value = ""; }} />
                        </label>
                        <label className="flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground hover:bg-gray-50">
                          <Mic className="h-3.5 w-3.5" />Audio
                          <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(section.id, f, "audio"); e.target.value = ""; }} />
                        </label>
                        <button onClick={() => addEmbed(section.id)} className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground hover:bg-gray-50">
                          <Link className="h-3.5 w-3.5" />Embed / Cal / Script
                        </button>
                      </div>
                    </div>
                  ))}

                  <button onClick={addSection} className="w-full rounded-md border border-dashed py-3 text-sm text-muted-foreground hover:bg-gray-50 hover:text-foreground">+ Agregar sección</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Selecciona una propuesta o crea una nueva</p>
            </div>
          </div>
        )}
      </div>

      {/* Template picker modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowTemplates(false)}>
          <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Crear propuesta desde plantilla</h3>
              <button onClick={() => setShowTemplates(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => createFromTemplate(t)} className="rounded-lg border p-4 text-left hover:border-brand hover:bg-brand-tint/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-brand" />
                    <span className="font-medium text-sm">{t.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t.sections.length} secciones predefinidas</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
