"use client";
import { useState } from "react";
import { CheckCircle2, ClipboardCopy, Download, Mail, Pen, Search, ShieldCheck, Sparkles, Trash2, XCircle } from "lucide-react";
import { generateProbableEmails, validateEmailFormat, checkDomainReputation, exportToCSV } from "@/lib/email-tools";

type VerifiedEmail = { email: string; status: "valid" | "invalid" | "risky"; reason: string };

export default function EmailFinderPage() {
  const [tab, setTab] = useState<"find" | "verify" | "writer" | "clean">("find");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<{ email: string; pattern: string; confidence: number }[]>([]);
  const [domainInfo, setDomainInfo] = useState<{ score: number; type: string; details: string } | null>(null);
  const [emailsToVerify, setEmailsToVerify] = useState("");
  const [verified, setVerified] = useState<VerifiedEmail[]>([]);
  const [toast, setToast] = useState("");

  // Writer state
  const [writerTo, setWriterTo] = useState("");
  const [writerSubject, setWriterSubject] = useState("");
  const [writerContext, setWriterContext] = useState("");
  const [writerTone, setWriterTone] = useState("profesional");
  const [writerType, setWriterType] = useState("cold-outreach");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generating, setGenerating] = useState(false);

  // Clean state
  const [cleanList, setCleanList] = useState("");
  const [cleanResults, setCleanResults] = useState<{ email: string; status: string; action: string }[]>([]);

  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function findEmails() {
    if (!name.trim() || !domain.trim()) return;
    setResults(generateProbableEmails(name, domain));
    setDomainInfo(checkDomainReputation(domain));
  }

  function verifyEmails() {
    const emails = emailsToVerify.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    setVerified(emails.map(email => {
      const format = validateEmailFormat(email);
      if (!format.valid) return { email, status: "invalid" as const, reason: format.reason };
      const d = email.split("@")[1]!;
      const rep = checkDomainReputation(d);
      if (rep.score >= 80) return { email, status: "valid" as const, reason: `${rep.details} (${rep.score})` };
      if (rep.score >= 50) return { email, status: "risky" as const, reason: `${rep.details} (${rep.score})` };
      return { email, status: "invalid" as const, reason: rep.details };
    }));
  }

  function generateEmailDraft() {
    if (!writerTo.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const templates: Record<string, string> = {
        "cold-outreach": `Hola ${writerTo.split("@")[0] || ""},\n\nMe pongo en contacto porque ${writerContext || "creo que podemos generar valor para tu empresa"}.\n\nEn LocalRank ayudamos a empresas como la tuya a ${writerContext || "optimizar su presencia digital y generar más leads calificados"}.\n\n¿Te parece si agendamos una llamada de 15 minutos esta semana para explorar si hay fit?\n\nQuedo atento.\n\nSaludos,\n[Tu nombre]`,
        "follow-up": `Hola ${writerTo.split("@")[0] || ""},\n\nEspero que estés bien. Te escribo para dar seguimiento a mi mensaje anterior.\n\n${writerContext || "Entiendo que estás ocupado, pero quería confirmar si tuviste oportunidad de revisar mi propuesta."}\n\n¿Hay un mejor momento para conectar? Puedo ajustarme a tu agenda.\n\nSaludos,\n[Tu nombre]`,
        "meeting-request": `Hola ${writerTo.split("@")[0] || ""},\n\n${writerContext || "Me gustaría agendar una reunión para discutir cómo podemos colaborar."}\n\n¿Tienes disponibilidad esta semana? Propongo:\n- Martes 10:00 AM\n- Miércoles 3:00 PM\n- Jueves 11:00 AM\n\nLa reunión sería de máximo 20 minutos.\n\nQuedo pendiente.\n\nSaludos,\n[Tu nombre]`,
        "proposal": `Hola ${writerTo.split("@")[0] || ""},\n\nGracias por tu interés. Adjunto la propuesta que acordamos:\n\n${writerContext || "— Alcance del proyecto\n— Timeline de implementación\n— Inversión y condiciones"}\n\nEstoy disponible para resolver cualquier duda. ¿Podemos agendar una llamada para revisarla juntos?\n\nSaludos,\n[Tu nombre]`,
        "thank-you": `Hola ${writerTo.split("@")[0] || ""},\n\nQuiero agradecerte por ${writerContext || "la reunión de hoy. Fue muy productiva"}.\n\nComo siguiente paso, voy a ${writerContext ? "preparar lo acordado" : "enviarte el resumen de lo conversado y los próximos pasos"}.\n\nCualquier cosa que necesites, no dudes en escribirme.\n\n¡Saludos!`,
      };
      const toneAdjust = writerTone === "casual" ? "\n\n(PD: Sin presión, solo quería dejarlo en tu radar 😊)" : writerTone === "urgente" ? "\n\n⚠️ Esto es sensible al tiempo — agradezco respuesta pronto." : "";
      setGeneratedEmail((templates[writerType] || templates["cold-outreach"]!) + toneAdjust);
      setGenerating(false);
    }, 1000);
  }

  function cleanEmailList() {
    const emails = cleanList.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    const seen = new Set<string>();
    const results = emails.map(email => {
      const lower = email.toLowerCase();
      if (seen.has(lower)) return { email, status: "duplicado", action: "Eliminado" };
      seen.add(lower);
      const format = validateEmailFormat(email);
      if (!format.valid) return { email, status: format.reason, action: "Eliminado" };
      const d = email.split("@")[1]!;
      const rep = checkDomainReputation(d);
      if (rep.type === "free") return { email, status: "Email personal (gratuito)", action: "Marcado" };
      if (rep.score < 50) return { email, status: "Dominio sospechoso", action: "Eliminado" };
      return { email, status: "Válido ✓", action: "Conservado" };
    });
    setCleanResults(results);
  }

  function copyEmail(text: string) { navigator.clipboard.writeText(text); notify("Copiado"); }

  function exportTab() {
    if (tab === "find" && results.length > 0) exportToCSV(results.map(r => ({ email: r.email, patron: r.pattern, confianza: r.confidence + "%" })), "emails-encontrados");
    else if (tab === "verify" && verified.length > 0) exportToCSV(verified.map(v => ({ email: v.email, estado: v.status, razon: v.reason })), "emails-verificados");
    else if (tab === "clean" && cleanResults.length > 0) exportToCSV(cleanResults.filter(r => r.action === "Conservado").map(r => ({ email: r.email })), "lista-limpia");
    notify("Exportado");
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6 text-brand" />Email Tools</h1>
          <p className="text-sm text-muted-foreground">Encuentra, verifica, genera y limpia emails para prospección.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {([["find", "🔍 Finder", Search], ["verify", "✓ Verificar", ShieldCheck], ["writer", "✍️ Escritor IA", Pen], ["clean", "🧹 Limpiar lista", Trash2]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as typeof tab)} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === key ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{label}</button>
          ))}
          <button onClick={exportTab} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 ml-auto"><Download className="h-3.5 w-3.5" />Exportar</button>
        </div>

        {/* FIND TAB */}
        {tab === "find" && (
          <div>
            <div className="rounded-lg border bg-white p-5 mb-4">
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[180px]"><label className="text-xs font-medium text-muted-foreground">Nombre completo</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Carlos Ruiz" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div className="flex-1 min-w-[180px]"><label className="text-xs font-medium text-muted-foreground">Dominio / Website</label><input value={domain} onChange={e => setDomain(e.target.value)} placeholder="techcorp.com" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" onKeyDown={e => { if (e.key === "Enter") findEmails(); }} /></div>
                <button onClick={findEmails} disabled={!name.trim() || !domain.trim()} className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Buscar</button>
              </div>
            </div>
            {domainInfo && (
              <div className={`mb-4 rounded-lg border p-3 ${domainInfo.score >= 80 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                <span className="text-xs font-medium">{domain}</span> — <span className="text-xs text-muted-foreground">{domainInfo.details} (Score: {domainInfo.score})</span>
              </div>
            )}
            {results.length > 0 && (
              <div className="rounded-lg border bg-white divide-y">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <Mail className="h-4 w-4 text-brand shrink-0" />
                    <span className="text-sm font-mono flex-1">{r.email}</span>
                    <span className="text-[10px] text-muted-foreground">{r.pattern}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.confidence >= 30 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{r.confidence}%</span>
                    <button onClick={() => copyEmail(r.email)} className="rounded p-1 hover:bg-gray-100"><ClipboardCopy className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VERIFY TAB */}
        {tab === "verify" && (
          <div>
            <div className="rounded-lg border bg-white p-5 mb-4">
              <textarea value={emailsToVerify} onChange={e => setEmailsToVerify(e.target.value)} placeholder="Pega emails (uno por línea o separados por coma)" rows={4} className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none mb-3" />
              <button onClick={verifyEmails} disabled={!emailsToVerify.trim()} className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Verificar</button>
            </div>
            {verified.length > 0 && (
              <div className="rounded-lg border bg-white divide-y">
                {verified.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    {v.status === "valid" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : v.status === "risky" ? <ShieldCheck className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm font-mono flex-1">{v.email}</span>
                    <span className="text-xs text-muted-foreground">{v.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WRITER TAB */}
        {tab === "writer" && (
          <div>
            <div className="rounded-lg border bg-white p-5 mb-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" />Escritor de emails IA</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs font-medium text-muted-foreground">Para (email o nombre)</label><input value={writerTo} onChange={e => setWriterTo(e.target.value)} placeholder="carlos@techcorp.com" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Asunto</label><input value={writerSubject} onChange={e => setWriterSubject(e.target.value)} placeholder="Propuesta de colaboración" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Tipo de email</label>
                  <select value={writerType} onChange={e => setWriterType(e.target.value)} className="w-full rounded border px-3 py-2 text-sm mt-1">
                    <option value="cold-outreach">Cold outreach</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="meeting-request">Solicitar reunión</option>
                    <option value="proposal">Enviar propuesta</option>
                    <option value="thank-you">Agradecimiento</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Tono</label>
                  <select value={writerTone} onChange={e => setWriterTone(e.target.value)} className="w-full rounded border px-3 py-2 text-sm mt-1">
                    <option value="profesional">Profesional</option>
                    <option value="casual">Casual / Amigable</option>
                    <option value="urgente">Urgente</option>
                    <option value="formal">Formal / Corporativo</option>
                  </select>
                </div>
              </div>
              <div className="mb-3"><label className="text-xs font-medium text-muted-foreground">Contexto / Qué quieres decir</label><textarea value={writerContext} onChange={e => setWriterContext(e.target.value)} placeholder="Ej: Ofrecemos servicios de marketing digital para clínicas dentales..." rows={2} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <button onClick={generateEmailDraft} disabled={!writerTo.trim() || generating} className="rounded-md bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                {generating ? <Sparkles className="h-4 w-4 animate-spin" /> : <Pen className="h-4 w-4" />}Generar email
              </button>
            </div>
            {generatedEmail && (
              <div className="rounded-lg border bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold">Borrador generado</h4>
                  <button onClick={() => copyEmail(generatedEmail)} className="flex items-center gap-1 text-xs text-brand hover:underline"><ClipboardCopy className="h-3 w-3" />Copiar</button>
                </div>
                {writerSubject && <p className="text-xs font-medium mb-2 text-muted-foreground">Asunto: {writerSubject}</p>}
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded-lg p-4 border font-sans">{generatedEmail}</pre>
              </div>
            )}
          </div>
        )}

        {/* CLEAN TAB */}
        {tab === "clean" && (
          <div>
            <div className="rounded-lg border bg-white p-5 mb-4">
              <h3 className="text-sm font-semibold mb-2">Limpiar lista de emails</h3>
              <p className="text-xs text-muted-foreground mb-3">Pega tu lista y eliminaremos: duplicados, emails inválidos, temporales y personales (Gmail/Hotmail).</p>
              <textarea value={cleanList} onChange={e => setCleanList(e.target.value)} placeholder="Pega tu lista de emails aquí..." rows={6} className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none mb-3" />
              <button onClick={cleanEmailList} disabled={!cleanList.trim()} className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Limpiar lista ({cleanList.split(/[\n,;]+/).filter(e => e.trim()).length} emails)</button>
            </div>
            {cleanResults.length > 0 && (
              <div>
                <div className="flex gap-3 mb-3 text-xs">
                  <span className="text-green-700">✓ {cleanResults.filter(r => r.action === "Conservado").length} conservados</span>
                  <span className="text-amber-700">⚠ {cleanResults.filter(r => r.action === "Marcado").length} marcados</span>
                  <span className="text-red-700">✕ {cleanResults.filter(r => r.action === "Eliminado").length} eliminados</span>
                </div>
                <div className="rounded-lg border bg-white divide-y max-h-96 overflow-y-auto">
                  {cleanResults.map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2 text-xs ${r.action === "Eliminado" ? "opacity-40 line-through" : r.action === "Marcado" ? "bg-amber-50" : ""}`}>
                      <span className={`h-2 w-2 rounded-full ${r.action === "Conservado" ? "bg-green-500" : r.action === "Marcado" ? "bg-amber-500" : "bg-red-500"}`} />
                      <span className="font-mono flex-1">{r.email}</span>
                      <span className="text-muted-foreground">{r.status}</span>
                      <span className="font-medium">{r.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
