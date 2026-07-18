"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, Chrome, KeyRound, Link2, LogIn, Mail, RefreshCw, Shield, Smartphone, Trash2, Unlock } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type Connection = {
  id: string;
  provider: "google" | "microsoft" | "apple" | "github";
  email: string;
  connectedAt: string;
  status: "active" | "expired" | "revoked";
  scopes: string[];
};

type Session = {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  current: boolean;
};

const SEED_CONNECTIONS: Connection[] = [
  { id: "c1", provider: "google", email: "localrankmedellin@gmail.com", connectedAt: "2026-07-10", status: "active", scopes: ["email", "profile", "calendar", "contacts"] },
];

const SEED_SESSIONS: Session[] = [
  { id: "s1", device: "Windows 11 PC", browser: "Chrome 127", ip: "181.52.xxx.xxx", lastActive: "Ahora", current: true },
  { id: "s2", device: "iPhone 15", browser: "Safari 18", ip: "181.52.xxx.xxx", lastActive: "Hace 2 horas", current: false },
];

export default function CredentialsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showGoogleConnect, setShowGoogleConnect] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    setConnections(loadFromStorage("crm_connections", SEED_CONNECTIONS));
    setSessions(loadFromStorage("crm_sessions", SEED_SESSIONS));
    setTwoFactor(loadFromStorage("crm_2fa", false));
  }, []);

  function saveConnections(c: Connection[]) { setConnections(c); saveToStorage("crm_connections", c); }

  function connectGoogle() {
    if (!googleEmail.trim()) return;
    const conn: Connection = {
      id: Date.now().toString(),
      provider: "google",
      email: googleEmail,
      connectedAt: new Date().toISOString().split("T")[0]!,
      status: "active",
      scopes: ["email", "profile", "calendar", "contacts"],
    };
    saveConnections([...connections, conn]);
    setGoogleEmail("");
    setShowGoogleConnect(false);
  }

  function disconnectProvider(id: string) {
    saveConnections(connections.filter(c => c.id !== id));
  }

  function reconnect(id: string) {
    saveConnections(connections.map(c => c.id === id ? { ...c, status: "active" as const, connectedAt: new Date().toISOString().split("T")[0]! } : c));
  }

  function recoverConnections() {
    if (!recoveryEmail.trim()) return;
    // Simulate recovery: reactivate all expired connections
    saveConnections(connections.map(c => c.status === "expired" ? { ...c, status: "active" as const } : c));
    setRecoveryMsg("Se ha enviado un enlace de recuperación a " + recoveryEmail + ". Tus conexiones han sido restauradas.");
    setTimeout(() => setRecoveryMsg(""), 5000);
    setShowRecovery(false);
    setRecoveryEmail("");
  }

  function revokeSession(id: string) {
    setSessions(sessions.filter(s => s.id !== id));
    saveToStorage("crm_sessions", sessions.filter(s => s.id !== id));
  }

  function toggle2FA() {
    const next = !twoFactor;
    setTwoFactor(next);
    saveToStorage("crm_2fa", next);
  }

  const PROVIDERS = [
    { key: "google" as const, label: "Google", icon: Chrome, color: "text-red-500 bg-red-50", desc: "Accede con tu cuenta de Google. Sincroniza calendario, contactos y email." },
    { key: "microsoft" as const, label: "Microsoft", icon: Mail, color: "text-blue-600 bg-blue-50", desc: "Accede con Outlook/Microsoft 365. Sincroniza email y calendario." },
    { key: "github" as const, label: "GitHub", icon: KeyRound, color: "text-gray-900 bg-gray-100", desc: "Para desarrolladores — vincula tu cuenta de GitHub." },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-bold">Credenciales y Acceso</h3>
        <p className="text-sm text-muted-foreground">Gestiona cómo inicias sesión, conecta cuentas de Google y recupera tus conexiones.</p>
      </div>

      {/* Recovery message */}
      {recoveryMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
          <Check className="h-4 w-4" />{recoveryMsg}
        </div>
      )}

      {/* Google / Social Login */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><LogIn className="h-4 w-4 text-brand" />Iniciar sesión con proveedor</h4>
        <p className="text-xs text-muted-foreground mb-4">Conecta una cuenta para acceder sin contraseña y sincronizar datos automáticamente.</p>

        <div className="space-y-3">
          {PROVIDERS.map(p => {
            const connected = connections.filter(c => c.provider === p.key);
            return (
              <div key={p.key} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${p.color}`}><p.icon className="h-4 w-4" /></span>
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                  {connected.length === 0 ? (
                    <button onClick={() => { setShowGoogleConnect(true); }} className="rounded-md border border-brand bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10">Conectar</button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3.5 w-3.5" />Conectado</span>
                  )}
                </div>
                {connected.map(conn => (
                  <div key={conn.id} className="mt-3 flex items-center justify-between rounded border bg-gray-50 px-3 py-2">
                    <div className="text-xs">
                      <p className="font-medium">{conn.email}</p>
                      <p className="text-muted-foreground">Conectado: {conn.connectedAt} · Scopes: {conn.scopes.join(", ")}</p>
                    </div>
                    <div className="flex gap-1">
                      {conn.status === "expired" && <button onClick={() => reconnect(conn.id)} className="rounded border px-2 py-1 text-[10px] font-medium text-amber-600 hover:bg-amber-50"><RefreshCw className="h-3 w-3 inline mr-1" />Reconectar</button>}
                      <button onClick={() => disconnectProvider(conn.id)} className="rounded border px-2 py-1 text-[10px] text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3 inline" /></button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recover Connections */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><RefreshCw className="h-4 w-4 text-amber-600" />Recuperar conexiones</h4>
        <p className="text-xs text-muted-foreground mb-4">Si perdiste acceso a tus canales conectados (WhatsApp, email, redes sociales), puedes recuperarlos aquí.</p>

        {!showRecovery ? (
          <button onClick={() => setShowRecovery(true)} className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100">Recuperar mis conexiones</button>
        ) : (
          <div className="space-y-3 rounded border bg-amber-50/50 p-4">
            <p className="text-xs text-amber-800">Ingresa el email asociado a tu cuenta para restaurar todas las conexiones previas.</p>
            <input value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} placeholder="tu@email.com" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={recoverConnections} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Enviar enlace de recuperación</button>
              <button onClick={() => setShowRecovery(false)} className="rounded-md border px-3 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        )}

        <div className="mt-4 rounded border bg-gray-50 p-3">
          <p className="text-xs font-medium mb-2">Conexiones que se pueden recuperar:</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Link2 className="h-3 w-3" />Canales de WhatsApp (API + Coexistencia)</li>
            <li className="flex items-center gap-2"><Link2 className="h-3 w-3" />Cuentas de Email / SMTP</li>
            <li className="flex items-center gap-2"><Link2 className="h-3 w-3" />Redes sociales (Instagram, Facebook, LinkedIn, X, TikTok)</li>
            <li className="flex items-center gap-2"><Link2 className="h-3 w-3" />Integraciones (Composio, n8n, Webhooks)</li>
            <li className="flex items-center gap-2"><Link2 className="h-3 w-3" />Calendario de Google / Outlook</li>
            <li className="flex items-center gap-2"><Link2 className="h-3 w-3" />Proveedores de IA (API keys)</li>
          </ul>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border p-5">
        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" />Seguridad</h4>
        <p className="text-xs text-muted-foreground mb-4">Protege tu cuenta con autenticación de dos factores y revisa las sesiones activas.</p>

        <div className="flex items-center justify-between rounded border p-3 mb-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Autenticación de dos factores (2FA)</p>
              <p className="text-[11px] text-muted-foreground">Añade una capa extra de seguridad con código de verificación</p>
            </div>
          </div>
          <button onClick={toggle2FA} className={`relative h-6 w-11 rounded-full transition-colors ${twoFactor ? "bg-green-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${twoFactor ? "translate-x-5 left-0.5" : "left-0.5"}`} />
          </button>
        </div>

        <div>
          <p className="text-xs font-medium mb-2">Sesiones activas</p>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded border px-3 py-2">
                <div className="text-xs">
                  <p className="font-medium">{s.device} · {s.browser} {s.current && <span className="text-green-600 ml-1">(actual)</span>}</p>
                  <p className="text-muted-foreground">{s.ip} · {s.lastActive}</p>
                </div>
                {!s.current && <button onClick={() => revokeSession(s.id)} className="rounded border px-2 py-1 text-[10px] text-red-500 hover:bg-red-50">Revocar</button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Connect Modal */}
      {showGoogleConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-xl bg-white p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Chrome className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-sm font-bold">Conectar con Google</h3>
              <p className="text-xs text-muted-foreground mt-1">Vincula tu cuenta de Google para acceder sin contraseña y sincronizar calendario, contactos y email.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email de Google</label>
                <input value={googleEmail} onChange={e => setGoogleEmail(e.target.value)} placeholder="tu@gmail.com" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
              </div>
              <div className="rounded bg-blue-50 p-3 text-[11px] text-blue-800">
                <p className="font-medium mb-1">Permisos solicitados:</p>
                <ul className="space-y-0.5">
                  <li>• Ver tu email y perfil</li>
                  <li>• Acceso a Google Calendar</li>
                  <li>• Leer contactos de Google</li>
                  <li>• Enviar emails vía Gmail</li>
                </ul>
              </div>
              <button onClick={connectGoogle} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover flex items-center justify-center gap-2"><Chrome className="h-4 w-4" />Conectar con Google</button>
              <button onClick={() => setShowGoogleConnect(false)} className="w-full rounded-md border py-2 text-sm text-muted-foreground hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
