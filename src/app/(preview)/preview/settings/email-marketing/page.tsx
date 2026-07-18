"use client";
import { useState, useEffect } from "react";
import { Check, Mail, RefreshCw, Shield } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type EmailConfig = { provider: string; apiKey: string; fromEmail: string; fromName: string; replyTo: string; domain: string; dkim: boolean; spf: boolean; connected: boolean };
const DEFAULT: EmailConfig = { provider: "resend", apiKey: "", fromEmail: "", fromName: "", replyTo: "", domain: "", dkim: false, spf: false, connected: false };
const PROVIDERS = [
  { id: "resend", name: "Resend", docs: "https://resend.com/docs", desc: "Moderno, API simple, buen free tier" },
  { id: "sendgrid", name: "SendGrid (Twilio)", docs: "https://docs.sendgrid.com", desc: "Enterprise, alto volumen" },
  { id: "mailgun", name: "Mailgun", docs: "https://documentation.mailgun.com", desc: "Desarrolladores, API potente" },
  { id: "ses", name: "Amazon SES", docs: "https://docs.aws.amazon.com/ses", desc: "Más barato a escala, requiere AWS" },
  { id: "postmark", name: "Postmark", docs: "https://postmarkapp.com/developer", desc: "Alta entregabilidad transaccional" },
  { id: "brevo", name: "Brevo (Sendinblue)", docs: "https://developers.brevo.com", desc: "CRM + Email, plan gratis generoso" },
  { id: "mailchimp", name: "Mailchimp", docs: "https://mailchimp.com/developer", desc: "Popular para newsletters" },
];

export default function EmailMarketingPage() {
  const [config, setConfig] = useState<EmailConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  useEffect(() => { setConfig(loadFromStorage("email_marketing_config", DEFAULT)); }, []);
  function handleSave() { saveToStorage("email_marketing_config", { ...config, connected: !!(config.apiKey && config.fromEmail) }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function handleTest() { setTesting(true); setTimeout(() => setTesting(false), 1500); }
  const prov = PROVIDERS.find((p) => p.id === config.provider);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Mail className="h-5 w-5 text-brand" />Email Marketing</h3>
        <p className="mt-1 text-sm text-muted-foreground">Configura tu proveedor de email para campañas, secuencias y transaccionales.</p>
      </div>

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <div><label className="mb-1 block text-sm font-medium">Proveedor de email</label>
          <select value={config.provider} onChange={(e) => setConfig({ ...config, provider: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.desc}</option>)}
          </select>
        </div>
        <div><label className="mb-1 block text-sm font-medium">API Key</label><input type="password" value={config.apiKey} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })} placeholder={`API Key de ${prov?.name}`} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Email de envío (From)</label><input value={config.fromEmail} onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })} placeholder="hola@tudominio.com" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
          <div><label className="mb-1 block text-sm font-medium">Nombre del remitente</label><input value={config.fromName} onChange={(e) => setConfig({ ...config, fromName: e.target.value })} placeholder="LocalRank CRM" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
          <div><label className="mb-1 block text-sm font-medium">Reply-To</label><input value={config.replyTo} onChange={(e) => setConfig({ ...config, replyTo: e.target.value })} placeholder="soporte@tudominio.com" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
          <div><label className="mb-1 block text-sm font-medium">Dominio verificado</label><input value={config.domain} onChange={(e) => setConfig({ ...config, domain: e.target.value })} placeholder="tudominio.com" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
        </div>
      </div>

      {/* DNS / Authentication */}
      <div className="rounded-lg border bg-white p-5">
        <h4 className="font-medium flex items-center gap-2 mb-3"><Shield className="h-4 w-4" />Autenticación de dominio (DNS)</h4>
        <p className="text-xs text-muted-foreground mb-3">Configura estos registros DNS para mejorar la entregabilidad.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded border px-3 py-2">
            <span className={`h-3 w-3 rounded-full ${config.spf ? "bg-green-400" : "bg-gray-300"}`} />
            <div className="flex-1"><p className="text-sm font-medium">SPF</p><p className="text-xs text-muted-foreground">Registro TXT: v=spf1 include:{prov?.name.toLowerCase()}.com ~all</p></div>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={config.spf} onChange={(e) => setConfig({ ...config, spf: e.target.checked })} className="accent-[var(--accent)]" />Verificado</label>
          </div>
          <div className="flex items-center gap-3 rounded border px-3 py-2">
            <span className={`h-3 w-3 rounded-full ${config.dkim ? "bg-green-400" : "bg-gray-300"}`} />
            <div className="flex-1"><p className="text-sm font-medium">DKIM</p><p className="text-xs text-muted-foreground">Registro CNAME: mail._domainkey → dkim.{prov?.name.toLowerCase()}.com</p></div>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={config.dkim} onChange={(e) => setConfig({ ...config, dkim: e.target.checked })} className="accent-[var(--accent)]" />Verificado</label>
          </div>
        </div>
      </div>

      {/* How to configure */}
      <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Guía rápida — {prov?.name}:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Crea cuenta en <a href={prov?.docs} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">{prov?.name}</a></li>
          <li>Verifica tu dominio (agrega registros DNS: SPF + DKIM)</li>
          <li>Genera una API Key desde el dashboard</li>
          <li>Pega la API Key arriba y configura el email de envío</li>
          <li>Envía un email de prueba para confirmar</li>
        </ol>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar"}</button>
        <button onClick={handleTest} className="flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-gray-50">{testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Enviar email de prueba</button>
      </div>
    </div>
  );
}
