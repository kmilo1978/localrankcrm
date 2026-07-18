"use client";

import { useState, useEffect } from "react";
import { Check, Code, Copy, Key, Plus, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Webhook = { id: string; name: string; url: string; events: string[]; active: boolean; createdAt: string };
type ApiKey = { id: string; name: string; key: string; permissions: string[]; createdAt: string; lastUsed: string };

const EVENTS = ["contact.created", "contact.updated", "deal.created", "deal.stage_changed", "deal.won", "deal.lost", "message.received", "message.sent", "form.submitted", "task.completed"];

const SEED_WEBHOOKS: Webhook[] = [
  { id: "wh1", name: "Zapier — Nuevo contacto", url: "https://hooks.zapier.com/hooks/catch/123/abc", events: ["contact.created"], active: true, createdAt: "2026-07-10" },
  { id: "wh2", name: "n8n — Lead scoring", url: "https://n8n.localrank.co/webhook/lead-score", events: ["contact.created", "form.submitted"], active: true, createdAt: "2026-07-15" },
  { id: "wh3", name: "n8n — Notificar equipo", url: "https://n8n.localrank.co/webhook/notify-team", events: ["deal.won", "deal.lost"], active: false, createdAt: "2026-07-12" },
];
const SEED_KEYS: ApiKey[] = [
  { id: "ak1", name: "Integración interna", key: "lr_live_sk_a1b2c3d4e5f6...", permissions: ["read:contacts", "write:contacts", "read:deals"], createdAt: "2026-07-01", lastUsed: "2026-07-17" },
];

const PERMISSIONS = ["read:contacts", "write:contacts", "read:deals", "write:deals", "read:messages", "write:messages", "read:analytics", "admin"];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showWh, setShowWh] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [whForm, setWhForm] = useState({ name: "", url: "", events: [] as string[] });
  const [keyForm, setKeyForm] = useState({ name: "", permissions: [] as string[] });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { setWebhooks(loadFromStorage("webhooks", SEED_WEBHOOKS)); setApiKeys(loadFromStorage("api_keys", SEED_KEYS)); }, []);
  function saveWh(u: Webhook[]) { setWebhooks(u); saveToStorage("webhooks", u); }
  function saveKeys(u: ApiKey[]) { setApiKeys(u); saveToStorage("api_keys", u); }

  function addWebhook() {
    if (!whForm.name || !whForm.url) return;
    saveWh([...webhooks, { id: generateId(), ...whForm, active: true, createdAt: new Date().toISOString().split("T")[0]! }]);
    setWhForm({ name: "", url: "", events: [] }); setShowWh(false);
  }

  function addApiKey() {
    if (!keyForm.name) return;
    const key = `lr_live_sk_${generateId()}${generateId()}`;
    saveKeys([...apiKeys, { id: generateId(), name: keyForm.name, key, permissions: keyForm.permissions, createdAt: new Date().toISOString().split("T")[0]!, lastUsed: "Nunca" }]);
    setKeyForm({ name: "", permissions: [] }); setShowKey(false);
  }

  function copy(text: string, id: string) { navigator.clipboard.writeText(text).catch(() => {}); setCopied(id); setTimeout(() => setCopied(null), 2000); }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Code className="h-5 w-5 text-brand" />Webhooks & APIs</h3>
        <p className="mt-1 text-sm text-muted-foreground">Integra LocalRank CRM con tus herramientas externas.</p>
      </div>

      {/* API Keys */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center gap-2"><Key className="h-4 w-4" />API Keys</h4>
          <button onClick={() => setShowKey(!showKey)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nueva key</button>
        </div>
        {showKey && (
          <div className="mb-4 rounded border p-3 space-y-2">
            <input value={keyForm.name} onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })} placeholder="Nombre (ej: Mi App)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="flex flex-wrap gap-1.5">{PERMISSIONS.map((p) => <button key={p} onClick={() => setKeyForm({ ...keyForm, permissions: keyForm.permissions.includes(p) ? keyForm.permissions.filter((x) => x !== p) : [...keyForm.permissions, p] })} className={`rounded-full px-2 py-0.5 text-xs ${keyForm.permissions.includes(p) ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{p}</button>)}</div>
            <div className="flex gap-2"><button onClick={addApiKey} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">Crear</button><button onClick={() => setShowKey(false)} className="rounded border px-3 py-1.5 text-xs">Cancelar</button></div>
          </div>
        )}
        {apiKeys.map((k) => (
          <div key={k.id} className="flex items-center gap-3 rounded border px-3 py-2 mb-2">
            <Key className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{k.name}</p>
              <code className="text-xs text-muted-foreground">{k.key}</code>
            </div>
            <button onClick={() => copy(k.key, k.id)} className="shrink-0 rounded border px-2 py-1 text-xs hover:bg-gray-50">{copied === k.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</button>
            <button onClick={() => saveKeys(apiKeys.filter((x) => x.id !== k.id))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>

      {/* Webhooks */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Webhooks</h4>
          <button onClick={() => setShowWh(!showWh)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nuevo webhook</button>
        </div>
        {showWh && (
          <div className="mb-4 rounded border p-3 space-y-2">
            <input value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} placeholder="Nombre" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <input value={whForm.url} onChange={(e) => setWhForm({ ...whForm, url: e.target.value })} placeholder="https://tu-endpoint.com/webhook" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="flex flex-wrap gap-1.5">{EVENTS.map((ev) => <button key={ev} onClick={() => setWhForm({ ...whForm, events: whForm.events.includes(ev) ? whForm.events.filter((x) => x !== ev) : [...whForm.events, ev] })} className={`rounded-full px-2 py-0.5 text-[10px] ${whForm.events.includes(ev) ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{ev}</button>)}</div>
            <div className="flex gap-2"><button onClick={addWebhook} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">Crear</button><button onClick={() => setShowWh(false)} className="rounded border px-3 py-1.5 text-xs">Cancelar</button></div>
          </div>
        )}
        {webhooks.map((w) => (
          <div key={w.id} className="flex items-center gap-3 rounded border px-3 py-2 mb-2">
            <span className={`h-2.5 w-2.5 rounded-full ${w.active ? "bg-green-400" : "bg-gray-300"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{w.name}</p>
              <p className="text-xs text-muted-foreground truncate">{w.url}</p>
              <div className="flex gap-1 mt-1">{w.events.map((e) => <span key={e} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px]">{e}</span>)}</div>
            </div>
            <button onClick={() => saveWh(webhooks.map((x) => x.id === w.id ? { ...x, active: !x.active } : x))} className={`rounded px-2 py-1 text-xs ${w.active ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{w.active ? "Activo" : "Inactivo"}</button>
            <button onClick={() => saveWh(webhooks.filter((x) => x.id !== w.id))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>

      {/* n8n Integration */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
            <span className="text-lg font-bold text-orange-600">n8n</span>
          </div>
          <div>
            <h4 className="font-medium">n8n — Automatización</h4>
            <p className="text-xs text-muted-foreground">Conecta LocalRank CRM con n8n para automatizar workflows complejos.</p>
          </div>
        </div>

        <div className="rounded border bg-gray-50 p-4 space-y-3 text-xs">
          <p className="font-medium text-foreground">Guía de conexión con n8n:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>En n8n, agrega un nodo <strong>Webhook</strong> (trigger) o usa el nodo <strong>HTTP Request</strong></li>
            <li>Copia la <strong>Webhook URL</strong> que genera n8n</li>
            <li>Agrégala arriba en la sección &ldquo;Webhooks&rdquo; con los eventos que quieras escuchar</li>
            <li>Para enviar datos a LocalRank desde n8n, usa <strong>HTTP Request</strong> con tu API Key</li>
          </ol>

          <div className="pt-3 border-t space-y-2">
            <p className="font-medium text-foreground">Workflows sugeridos:</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded border bg-white px-3 py-2">
                <p className="font-medium">Lead Scoring automático</p>
                <p className="text-muted-foreground">Trigger: contact.created → Enriquecer datos → Calcular score → Actualizar contacto</p>
              </div>
              <div className="rounded border bg-white px-3 py-2">
                <p className="font-medium">Notificación Slack/Telegram</p>
                <p className="text-muted-foreground">Trigger: deal.won → Enviar mensaje al equipo</p>
              </div>
              <div className="rounded border bg-white px-3 py-2">
                <p className="font-medium">Secuencia Email</p>
                <p className="text-muted-foreground">Trigger: form.submitted → Esperar 1h → Enviar email → Esperar 24h → Follow-up</p>
              </div>
              <div className="rounded border bg-white px-3 py-2">
                <p className="font-medium">Sync con Google Sheets</p>
                <p className="text-muted-foreground">Trigger: contact.created → Agregar fila a spreadsheet</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="font-medium text-foreground mb-1">Endpoints útiles para n8n HTTP Request:</p>
            <div className="space-y-1 font-mono text-[10px]">
              <p><span className="text-green-600">GET</span> /api/contacts — Listar contactos</p>
              <p><span className="text-blue-600">POST</span> /api/contacts — Crear contacto</p>
              <p><span className="text-green-600">GET</span> /api/pipeline/board — Pipeline completo</p>
              <p><span className="text-blue-600">POST</span> /api/conversations/[id]/messages — Enviar mensaje</p>
              <p><span className="text-amber-600">PATCH</span> /api/pipeline/leads/[id] — Mover lead de etapa</p>
            </div>
          </div>
        </div>

        <a href="https://docs.n8n.io/integrations/creating-nodes/build/reference/http-helpers/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-brand hover:underline">Ver documentación de n8n →</a>
      </div>

      {/* API Docs link */}
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">Base URL: <code className="rounded bg-gray-100 px-2 py-0.5 text-brand">https://api.localrankcrm.com/v1</code></p>
        <p className="mt-1 text-xs text-muted-foreground">Endpoints: /contacts, /deals, /conversations, /messages, /tasks, /forms</p>
      </div>
    </div>
  );
}
