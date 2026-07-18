"use client";
import { useState, useEffect } from "react";
import { Check, MessageSquare, RefreshCw } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type SmsConfig = { provider: string; accountSid: string; authToken: string; fromNumber: string; connected: boolean };
const DEFAULT: SmsConfig = { provider: "twilio", accountSid: "", authToken: "", fromNumber: "", connected: false };
const PROVIDERS = [
  { id: "twilio", name: "Twilio", docs: "https://www.twilio.com/docs/sms" },
  { id: "vonage", name: "Vonage (Nexmo)", docs: "https://developer.vonage.com/messaging/sms" },
  { id: "messagebird", name: "MessageBird", docs: "https://developers.messagebird.com" },
  { id: "plivo", name: "Plivo", docs: "https://www.plivo.com/docs/sms" },
];

export default function SmsSettingsPage() {
  const [config, setConfig] = useState<SmsConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  useEffect(() => { setConfig(loadFromStorage("sms_config", DEFAULT)); }, []);
  function handleSave() { saveToStorage("sms_config", { ...config, connected: !!(config.accountSid && config.authToken) }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function handleTest() { setTesting(true); setTimeout(() => setTesting(false), 1500); }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-brand" />SMS</h3>
        <p className="mt-1 text-sm text-muted-foreground">Configura el envío de SMS para notificaciones, recordatorios y campañas.</p>
      </div>
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <div><label className="mb-1 block text-sm font-medium">Proveedor</label>
          <select value={config.provider} onChange={(e) => setConfig({ ...config, provider: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Account SID / API Key</label><input value={config.accountSid} onChange={(e) => setConfig({ ...config, accountSid: e.target.value })} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
        <div><label className="mb-1 block text-sm font-medium">Auth Token / API Secret</label><input type="password" value={config.authToken} onChange={(e) => setConfig({ ...config, authToken: e.target.value })} placeholder="Tu token secreto" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
        <div><label className="mb-1 block text-sm font-medium">Número de envío (From)</label><input value={config.fromNumber} onChange={(e) => setConfig({ ...config, fromNumber: e.target.value })} placeholder="+1234567890" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>
        <div className="rounded border bg-gray-50 p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">¿Cómo configurar?</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Crea una cuenta en {PROVIDERS.find((p) => p.id === config.provider)?.name}</li>
            <li>Obtén tu Account SID y Auth Token desde el dashboard</li>
            <li>Compra o configura un número telefónico para envíos</li>
            <li>Pega las credenciales aquí y guarda</li>
          </ol>
          <a href={PROVIDERS.find((p) => p.id === config.provider)?.docs} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-brand hover:underline">Ver documentación →</a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar"}</button>
        <button onClick={handleTest} className="flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-gray-50">{testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Probar SMS</button>
      </div>
    </div>
  );
}
