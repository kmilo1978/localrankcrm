"use client";
import { useState, useEffect } from "react";
import { Check, Code, Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type McpServer = { id: string; name: string; command: string; args: string; env: string; enabled: boolean; status: "running" | "stopped" | "error" };

const SEED: McpServer[] = [
  { id: "mcp1", name: "supabase", command: "npx", args: "supabase-mcp-server@latest", env: "SUPABASE_URL=https://oixeaagftrigalcazvst.supabase.co", enabled: true, status: "running" },
  { id: "mcp2", name: "filesystem", command: "npx", args: "@anthropic/mcp-filesystem-server /workspace", env: "", enabled: false, status: "stopped" },
];

const POPULAR_SERVERS = [
  { name: "supabase", command: "npx", args: "supabase-mcp-server@latest", desc: "Acceso a tu base de datos Supabase", envKeys: [{ key: "SUPABASE_URL", placeholder: "https://xxx.supabase.co", required: true }, { key: "SUPABASE_KEY", placeholder: "eyJhbGci...", required: true }] },
  { name: "obsidian", command: "npx", args: "obsidian-mcp-server@latest", desc: "Obsidian Vault — Super cerebro: notas, knowledge base, procesos", envKeys: [{ key: "OBSIDIAN_VAULT_PATH", placeholder: "C:/Users/tu-user/Obsidian/MiVault", required: true }, { key: "OBSIDIAN_API_PORT", placeholder: "27123", required: false }] },
  { name: "hermes-agent", command: "npx", args: "hermes-mcp@latest", desc: "Hermes Agent — Agente IA multicanal (Telegram, Discord, Slack)", envKeys: [{ key: "HERMES_API_URL", placeholder: "http://localhost:3001", required: true }, { key: "HERMES_API_KEY", placeholder: "tu-api-key", required: true }] },
  { name: "openclaw", command: "npx", args: "openclaw-mcp-server@latest", desc: "OpenClaw — Gateway agentes IA (WhatsApp, Teams, Discord)", envKeys: [{ key: "OPENCLAW_URL", placeholder: "http://localhost:4000", required: true }, { key: "OPENCLAW_TOKEN", placeholder: "tu-token", required: true }] },
  { name: "github", command: "npx", args: "@anthropic/mcp-github-server", desc: "Integración con GitHub repos", envKeys: [{ key: "GITHUB_PERSONAL_ACCESS_TOKEN", placeholder: "ghp_xxxxxxxxxxxx", required: true }] },
  { name: "slack", command: "npx", args: "@anthropic/mcp-slack-server", desc: "Enviar y leer mensajes de Slack", envKeys: [{ key: "SLACK_BOT_TOKEN", placeholder: "xoxb-xxxxxxxxx", required: true }] },
  { name: "google-drive", command: "npx", args: "google-drive-mcp-server", desc: "Acceso a Google Drive", envKeys: [{ key: "GOOGLE_CLIENT_ID", placeholder: "tu-id.apps.googleusercontent.com", required: true }, { key: "GOOGLE_CLIENT_SECRET", placeholder: "tu-secret", required: true }] },
  { name: "notion", command: "npx", args: "notion-mcp-server", desc: "Leer/escribir en Notion", envKeys: [{ key: "NOTION_API_KEY", placeholder: "ntn_xxxxxxxxxxxx", required: true }] },
  { name: "web-search", command: "npx", args: "@anthropic/mcp-web-search-server", desc: "Búsqueda web en tiempo real", envKeys: [{ key: "BRAVE_API_KEY", placeholder: "BSAxxxxxxxxx (opcional)", required: false }] },
  { name: "postgres", command: "npx", args: "postgres-mcp-server", desc: "Consultas SQL directas", envKeys: [{ key: "DATABASE_URL", placeholder: "postgresql://user:pass@host:5432/db", required: true }] },
  { name: "composio", command: "npx", args: "composio-mcp-server@latest", desc: "Composio — 250+ integraciones (Gmail, Calendar, HubSpot)", envKeys: [{ key: "COMPOSIO_API_KEY", placeholder: "comp_xxxxxxxxxxxx", required: true }] },
];

export default function McpSettingsPage() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", command: "npx", args: "", env: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => { setServers(loadFromStorage("mcp_servers", SEED)); }, []);
  function save(u: McpServer[]) { setServers(u); saveToStorage("mcp_servers", u); }

  function addServer() {
    if (!form.name.trim()) return;
    save([...servers, { id: generateId(), name: form.name, command: form.command, args: form.args, env: form.env, enabled: true, status: "stopped" }]);
    setForm({ name: "", command: "npx", args: "", env: "" }); setShowAdd(false);
  }
  function toggleServer(id: string) { save(servers.map((s) => s.id === id ? { ...s, enabled: !s.enabled, status: (!s.enabled ? "running" : "stopped") as McpServer["status"] } : s)); }
  function deleteServer(id: string) { save(servers.filter((s) => s.id !== id)); }
  function addFromPopular(p: typeof POPULAR_SERVERS[0], envValues: Record<string, string>) {
    const envStr = Object.entries(envValues).filter(([,v]) => v.trim()).map(([k,v]) => `${k}=${v}`).join(",");
    save([...servers, { id: generateId(), name: p.name, command: p.command, args: p.args, env: envStr, enabled: true, status: "running" }]);
    setConfiguring(null);
  }
  function updateServerEnv(id: string, env: string) { save(servers.map(s => s.id === id ? { ...s, env } : s)); }
  function handleSave() { saveToStorage("mcp_servers", servers); setSaved(true); setTimeout(() => setSaved(false), 2000); }

  const [configuring, setConfiguring] = useState<typeof POPULAR_SERVERS[0] | null>(null);
  const [envInputs, setEnvInputs] = useState<Record<string, string>>({});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-brand" />MCP (Model Context Protocol)</h3>
        <p className="mt-1 text-sm text-muted-foreground">Configura servidores MCP para extender las capacidades de la IA con herramientas externas.</p>
      </div>

      {/* Active servers */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Servidores configurados</h4>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Agregar</button>
        </div>

        {showAdd && (
          <div className="mb-4 rounded border p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre (ej: supabase)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={form.command} onChange={(e) => setForm({ ...form, command: e.target.value })} placeholder="Comando (npx, uvx)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            </div>
            <input value={form.args} onChange={(e) => setForm({ ...form, args: e.target.value })} placeholder="Argumentos (ej: @package/server@latest)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <input value={form.env} onChange={(e) => setForm({ ...form, env: e.target.value })} placeholder="Variables de entorno: KEY=value,KEY2=value2" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="flex gap-2"><button onClick={addServer} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Agregar</button><button onClick={() => setShowAdd(false)} className="rounded border px-3 py-1.5 text-xs">Cancelar</button></div>
          </div>
        )}

        <div className="space-y-2">
          {servers.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded border px-4 py-3">
              <span className={`h-2.5 w-2.5 rounded-full ${s.status === "running" ? "bg-green-400" : s.status === "error" ? "bg-red-400" : "bg-gray-300"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.name}</p>
                <code className="text-[10px] text-muted-foreground">{s.command} {s.args}</code>
                {s.env && <p className="text-[10px] text-muted-foreground mt-0.5">env: {s.env}</p>}
              </div>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={s.enabled} onChange={() => toggleServer(s.id)} className="accent-[var(--accent)]" />
                {s.enabled ? "ON" : "OFF"}
              </label>
              <button onClick={() => deleteServer(s.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {servers.length === 0 && <p className="text-center py-4 text-xs text-muted-foreground">Sin servidores MCP configurados.</p>}
        </div>
      </div>

      {/* Popular servers */}
      <div className="rounded-lg border bg-white p-5">
        <h4 className="font-medium mb-3">Servidores populares</h4>
        <div className="grid grid-cols-1 gap-2">
          {POPULAR_SERVERS.map((p) => {
            const exists = servers.some((s) => s.name === p.name);
            const isConfiguring = configuring?.name === p.name;
            return (
              <div key={p.name} className={`rounded-lg border px-4 py-3 ${isConfiguring ? "border-brand bg-brand/5" : exists ? "border-green-200 bg-green-50/30" : ""}`}>
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4 text-brand shrink-0" />
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium">{p.name}</p><p className="text-[10px] text-muted-foreground">{p.desc}</p></div>
                  {exists ? (
                    <span className="text-[10px] text-green-600 flex items-center gap-0.5"><Check className="h-3 w-3" />Conectado</span>
                  ) : (
                    <button onClick={() => { setConfiguring(isConfiguring ? null : p); setEnvInputs({}); }} className="rounded-md bg-brand px-3 py-1.5 text-[10px] font-medium text-white hover:bg-brand-hover">{isConfiguring ? "Cancelar" : "Configurar"}</button>
                  )}
                </div>
                {/* Credential form */}
                {isConfiguring && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground">Credenciales necesarias:</p>
                    {p.envKeys.map(ek => (
                      <div key={ek.key} className="flex items-center gap-2">
                        <label className="text-[10px] font-mono w-40 shrink-0 text-muted-foreground">{ek.key}{ek.required && " *"}</label>
                        <input value={envInputs[ek.key] || ""} onChange={e => setEnvInputs({...envInputs, [ek.key]: e.target.value})} placeholder={ek.placeholder} type={ek.key.includes("KEY") || ek.key.includes("SECRET") || ek.key.includes("TOKEN") ? "password" : "text"} className="flex-1 rounded border px-2 py-1.5 text-xs font-mono focus:border-brand focus:outline-none" />
                      </div>
                    ))}
                    <button onClick={() => addFromPopular(p, envInputs)} disabled={p.envKeys.filter(ek => ek.required).some(ek => !envInputs[ek.key]?.trim())} className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50 mt-2">Conectar {p.name}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Config format */}
      <div className="rounded-lg border border-dashed bg-gray-50 p-4">
        <p className="text-xs font-medium mb-2">Formato de configuración (mcp.json):</p>
        <pre className="text-[10px] bg-white rounded border p-3 overflow-x-auto">{`{
  "mcpServers": {
    "${servers[0]?.name || "example"}": {
      "command": "${servers[0]?.command || "npx"}",
      "args": ["${servers[0]?.args || "package@latest"}"],
      "env": { "API_KEY": "..." }
    }
  }
}`}</pre>
      </div>

      <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar configuración"}</button>
    </div>
  );
}
