"use client";
import { useState } from "react";
import { CheckCircle2, ClipboardCopy, Download, Mail, Search, ShieldCheck, XCircle } from "lucide-react";
import { generateProbableEmails, validateEmailFormat, checkDomainReputation, exportToCSV } from "@/lib/email-tools";

type VerifiedEmail = { email: string; status: "valid" | "invalid" | "risky"; reason: string };

export default function EmailFinderPage() {
  const [tab, setTab] = useState<"find" | "verify">("find");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<{ email: string; pattern: string; confidence: number }[]>([]);
  const [domainInfo, setDomainInfo] = useState<{ score: number; type: string; details: string } | null>(null);

  // Verify tab
  const [emailsToVerify, setEmailsToVerify] = useState("");
  const [verified, setVerified] = useState<VerifiedEmail[]>([]);
  const [toast, setToast] = useState("");

  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function findEmails() {
    if (!name.trim() || !domain.trim()) return;
    const emails = generateProbableEmails(name, domain);
    setResults(emails);
    setDomainInfo(checkDomainReputation(domain));
  }

  function verifyEmails() {
    const emails = emailsToVerify.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return;

    const results: VerifiedEmail[] = emails.map(email => {
      const format = validateEmailFormat(email);
      if (!format.valid) return { email, status: "invalid" as const, reason: format.reason };
      const domain = email.split("@")[1]!;
      const rep = checkDomainReputation(domain);
      if (rep.score >= 80) return { email, status: "valid" as const, reason: `${rep.details} (Score: ${rep.score})` };
      if (rep.score >= 50) return { email, status: "risky" as const, reason: `${rep.details} (Score: ${rep.score})` };
      return { email, status: "invalid" as const, reason: rep.details };
    });

    setVerified(results);
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email);
    notify("Email copiado");
  }

  function exportResults() {
    if (tab === "find" && results.length > 0) {
      exportToCSV(results.map(r => ({ email: r.email, patron: r.pattern, confianza: r.confidence + "%" })), "emails-encontrados");
      notify("CSV exportado");
    } else if (tab === "verify" && verified.length > 0) {
      exportToCSV(verified.map(v => ({ email: v.email, estado: v.status, razon: v.reason })), "emails-verificados");
      notify("CSV exportado");
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6 text-brand" />Email Finder & Verificador</h1>
          <p className="text-sm text-muted-foreground">Genera emails probables por nombre + dominio y verifica formato/reputación de dominios.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab("find")} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${tab === "find" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}><Search className="h-4 w-4" />Encontrar emails</button>
          <button onClick={() => setTab("verify")} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${tab === "verify" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}><ShieldCheck className="h-4 w-4" />Verificar emails</button>
          {(results.length > 0 || verified.length > 0) && (
            <button onClick={exportResults} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 ml-auto"><Download className="h-3.5 w-3.5" />Exportar CSV</button>
          )}
        </div>

        {/* FIND TAB */}
        {tab === "find" && (
          <div>
            <div className="rounded-lg border bg-white p-5 mb-6">
              <h3 className="text-sm font-semibold mb-3">Buscar email por nombre y dominio</h3>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs font-medium text-muted-foreground">Nombre completo</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Carlos Ruiz" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs font-medium text-muted-foreground">Dominio / Website</label>
                  <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="techcorp.com" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" onKeyDown={e => { if (e.key === "Enter") findEmails(); }} />
                </div>
                <button onClick={findEmails} disabled={!name.trim() || !domain.trim()} className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Buscar</button>
              </div>
            </div>

            {/* Domain info */}
            {domainInfo && (
              <div className={`mb-4 rounded-lg border p-4 ${domainInfo.score >= 80 ? "border-green-200 bg-green-50" : domainInfo.score >= 50 ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${domainInfo.score >= 80 ? "text-green-700" : domainInfo.score >= 50 ? "text-amber-700" : "text-red-700"}`}>Dominio: {domain}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-white">{domainInfo.type} · Score {domainInfo.score}/100</span>
                </div>
                <p className="text-xs text-muted-foreground">{domainInfo.details}</p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="rounded-lg border bg-white overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50"><h4 className="text-sm font-semibold">{results.length} emails generados</h4></div>
                <div className="divide-y">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                      <Mail className="h-4 w-4 text-brand shrink-0" />
                      <span className="text-sm font-mono flex-1">{r.email}</span>
                      <span className="text-[10px] text-muted-foreground">{r.pattern}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.confidence >= 30 ? "bg-green-100 text-green-700" : r.confidence >= 10 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{r.confidence}%</span>
                      <button onClick={() => copyEmail(r.email)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-brand"><ClipboardCopy className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VERIFY TAB */}
        {tab === "verify" && (
          <div>
            <div className="rounded-lg border bg-white p-5 mb-6">
              <h3 className="text-sm font-semibold mb-3">Verificar emails (formato + dominio)</h3>
              <textarea value={emailsToVerify} onChange={e => setEmailsToVerify(e.target.value)} placeholder={"Pega uno o varios emails (uno por línea, o separados por coma):\n\ncarlos@techcorp.com\nmaria@loginext.io\nroberto@mediagroup.mx"} rows={5} className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none mb-3" />
              <button onClick={verifyEmails} disabled={!emailsToVerify.trim()} className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Verificar {emailsToVerify.split(/[\n,;]+/).filter(e => e.trim()).length} email(s)</button>
            </div>

            {/* Verification results */}
            {verified.length > 0 && (
              <div className="rounded-lg border bg-white overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Resultados</h4>
                  <div className="flex gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" />{verified.filter(v => v.status === "valid").length} válidos</span>
                    <span className="flex items-center gap-1 text-amber-700">⚠️ {verified.filter(v => v.status === "risky").length} riesgo</span>
                    <span className="flex items-center gap-1 text-red-700"><XCircle className="h-3 w-3" />{verified.filter(v => v.status === "invalid").length} inválidos</span>
                  </div>
                </div>
                <div className="divide-y">
                  {verified.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      {v.status === "valid" ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : v.status === "risky" ? <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      <span className="text-sm font-mono flex-1">{v.email}</span>
                      <span className="text-xs text-muted-foreground">{v.reason}</span>
                      {v.status === "valid" && <button onClick={() => copyEmail(v.email)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-brand"><ClipboardCopy className="h-3.5 w-3.5" /></button>}
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
