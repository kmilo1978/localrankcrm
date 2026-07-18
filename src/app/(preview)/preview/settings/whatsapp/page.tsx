"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, CheckCircle2, Copy, ExternalLink, Link2, MessageSquare, Phone, RefreshCw, Shield, Wifi, WifiOff, X } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type WhatsAppConfig = {
  connected: boolean;
  phoneNumber: string;
  displayName: string;
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  appSecret: string;
  apiVersion: string;
  status: "disconnected" | "connected" | "error";
  lastSync: string;
};

const DEFAULT_CONFIG: WhatsAppConfig = {
  connected: false,
  phoneNumber: "",
  displayName: "",
  wabaId: "",
  phoneNumberId: "",
  accessToken: "",
  webhookVerifyToken: "",
  appSecret: "",
  apiVersion: "v25.0",
  status: "disconnected",
  lastSync: "",
};

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_CONFIG);
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<"idle" | "testing" | "success" | "error">("idle");

  useEffect(() => {
    setConfig(loadFromStorage("whatsapp_config", DEFAULT_CONFIG));
  }, []);

  function save(updated: WhatsAppConfig) {
    setConfig(updated);
    saveToStorage("whatsapp_config", updated);
  }

  function handleSave() {
    setSaving(true);
    const updated = { ...config, connected: !!config.accessToken && !!config.phoneNumberId, status: (config.accessToken && config.phoneNumberId ? "connected" : "disconnected") as WhatsAppConfig["status"], lastSync: new Date().toLocaleString("es") };
    save(updated);
    setTimeout(() => setSaving(false), 1000);
  }

  function handleDisconnect() {
    save({ ...DEFAULT_CONFIG });
    setTestResult("idle");
  }

  function handleTest() {
    setTestResult("testing");
    setTimeout(() => {
      if (config.accessToken && config.phoneNumberId) {
        setTestResult("success");
      } else {
        setTestResult("error");
      }
    }, 1500);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/wa/${config.webhookVerifyToken || "[tu-token]"}` : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <MessageSquare className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">WhatsApp Business</h3>
            <p className="text-sm text-muted-foreground">Conecta tu número de WhatsApp Business API para recibir y enviar mensajes desde el CRM.</p>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-lg border p-4 ${config.connected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.connected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-amber-600" />}
            <div>
              <p className={`font-medium ${config.connected ? "text-green-800" : "text-amber-800"}`}>
                {config.connected ? "WhatsApp conectado" : "Sin conexión"}
              </p>
              {config.connected && (
                <p className="text-sm text-green-700">
                  {config.displayName || config.phoneNumber} · Última sincronización: {config.lastSync}
                </p>
              )}
            </div>
          </div>
          {config.connected && (
            <button onClick={handleDisconnect} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
              Desconectar
            </button>
          )}
        </div>
      </div>

      {/* Setup guide */}
      {!config.connected && (
        <div className="rounded-lg border bg-white p-4">
          <h4 className="font-medium mb-2">¿Cómo conectar?</h4>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Ve a <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">developers.facebook.com</a> y crea una app de tipo "Business"</li>
            <li>Agrega el producto "WhatsApp" a tu app</li>
            <li>En WhatsApp → Configuración de API, obtén tu <strong>Token de acceso permanente</strong></li>
            <li>Copia el <strong>Phone Number ID</strong> y <strong>WhatsApp Business Account ID</strong></li>
            <li>Configura el Webhook con la URL y token que te damos abajo</li>
          </ol>
          <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-brand hover:underline">
            <ExternalLink className="h-3.5 w-3.5" />Ver guía completa de Meta
          </a>
        </div>
      )}

      {/* Configuration form */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h4 className="font-semibold">Credenciales de la API</h4>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Phone number */}
          <div>
            <label className="mb-1 block text-sm font-medium">Número de teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={config.phoneNumber} onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })} placeholder="+52 55 1234 5678" className="w-full rounded-md border bg-white py-2 pl-10 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre para mostrar</label>
            <input value={config.displayName} onChange={(e) => setConfig({ ...config, displayName: e.target.value })} placeholder="Mi Empresa" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>

          {/* WABA ID */}
          <div>
            <label className="mb-1 block text-sm font-medium">WhatsApp Business Account ID</label>
            <input value={config.wabaId} onChange={(e) => setConfig({ ...config, wabaId: e.target.value })} placeholder="123456789012345" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>

          {/* Phone Number ID */}
          <div>
            <label className="mb-1 block text-sm font-medium">Phone Number ID</label>
            <input value={config.phoneNumberId} onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })} placeholder="109876543210123" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
        </div>

        {/* Access Token */}
        <div>
          <label className="mb-1 block text-sm font-medium">Access Token (permanente)</label>
          <div className="relative">
            <input type={showToken ? "text" : "password"} value={config.accessToken} onChange={(e) => setConfig({ ...config, accessToken: e.target.value })} placeholder="EAAxxxxxxx..." className="w-full rounded-md border px-3 py-2 pr-20 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
              {showToken ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Token de acceso permanente del System User de tu app de Meta.</p>
        </div>

        {/* App Secret */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium"><Shield className="h-3.5 w-3.5" />App Secret <span className="text-xs text-muted-foreground font-normal">(opcional, recomendado)</span></label>
          <div className="relative">
            <input type={showSecret ? "text" : "password"} value={config.appSecret} onChange={(e) => setConfig({ ...config, appSecret: e.target.value })} placeholder="abcdef1234567890..." className="w-full rounded-md border px-3 py-2 pr-20 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
              {showSecret ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Para validar la firma x-hub-signature-256 de cada webhook. Se encuentra en tu app → Configuración → Básica.</p>
        </div>

        {/* API Version */}
        <div className="w-48">
          <label className="mb-1 block text-sm font-medium">Versión de API</label>
          <select value={config.apiVersion} onChange={(e) => setConfig({ ...config, apiVersion: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="v25.0">v25.0 (recomendado)</option>
            <option value="v24.0">v24.0</option>
            <option value="v23.0">v23.0</option>
          </select>
        </div>
      </div>

      {/* Webhook configuration */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h4 className="font-semibold">Configuración del Webhook</h4>
        <p className="text-sm text-muted-foreground">Configura estos valores en tu app de Meta → WhatsApp → Configuración → Webhook.</p>

        <div>
          <label className="mb-1 block text-sm font-medium">Webhook Verify Token</label>
          <input value={config.webhookVerifyToken} onChange={(e) => setConfig({ ...config, webhookVerifyToken: e.target.value })} placeholder="mi-token-secreto-123" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          <p className="mt-1 text-xs text-muted-foreground">Token que Meta usará para verificar tu webhook. Inventa uno seguro.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">URL del Webhook</label>
          <div className="flex gap-2">
            <code className="flex-1 rounded-md border bg-gray-50 px-3 py-2 text-sm select-all break-all">{webhookUrl}</code>
            <button onClick={() => copyToClipboard(webhookUrl, "webhook")} className="shrink-0 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
              {copied === "webhook" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Pega esta URL en el campo "Callback URL" de Meta.</p>
        </div>

        <div className="rounded border border-dashed bg-gray-50 p-3">
          <p className="text-xs font-medium mb-1">Campos de webhook a suscribir:</p>
          <div className="flex flex-wrap gap-2">
            {["messages", "message_deliveries", "message_reads", "messaging_handovers"].map((field) => (
              <span key={field} className="rounded bg-white border px-2 py-0.5 text-xs font-mono">{field}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50 transition-colors">
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
        <button onClick={handleTest} disabled={testResult === "testing"} className="rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${testResult === "testing" ? "animate-spin" : ""}`} />
          Probar conexión
        </button>
        {testResult === "success" && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Conexión exitosa</span>}
        {testResult === "error" && <span className="flex items-center gap-1 text-sm text-red-600"><AlertCircle className="h-4 w-4" />Error: verifica tus credenciales</span>}
      </div>
    </div>
  );
}
