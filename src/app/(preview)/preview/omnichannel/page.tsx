"use client";

import { useState, useEffect } from "react";
import { Activity, Facebook, Instagram, Linkedin, Mail, MessageSquare, Phone, TrendingUp } from "lucide-react";
import { loadFromStorage } from "@/lib/local-storage";

type ChannelStat = {
  id: string;
  name: string;
  icon: typeof MessageSquare;
  color: string;
  bgColor: string;
  conversations: number;
  unread: number;
  responseTime: string;
  connected: boolean;
  account: string;
};

const CHANNEL_DEFS: { id: string; name: string; icon: typeof MessageSquare; color: string; bgColor: string }[] = [
  { id: "whatsapp", name: "WhatsApp (Principal)", icon: Phone, color: "text-green-600", bgColor: "bg-green-50" },
  { id: "whatsapp2", name: "WhatsApp (Línea 2)", icon: Phone, color: "text-green-700", bgColor: "bg-green-100" },
  { id: "whatsapp3", name: "WhatsApp (Línea 3)", icon: Phone, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { id: "email", name: "Email", icon: Mail, color: "text-blue-600", bgColor: "bg-blue-50" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600", bgColor: "bg-pink-50" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-sky-700", bgColor: "bg-sky-50" },
  { id: "x", name: "X (Twitter)", icon: MessageSquare, color: "text-gray-900", bgColor: "bg-gray-100" },
  { id: "quora", name: "Quora", icon: MessageSquare, color: "text-red-600", bgColor: "bg-red-50" },
  { id: "reddit", name: "Reddit", icon: MessageSquare, color: "text-orange-600", bgColor: "bg-orange-50" },
  { id: "tiktok", name: "TikTok", icon: MessageSquare, color: "text-gray-900", bgColor: "bg-gray-100" },
];

// Simulated activity feed
const ACTIVITY_FEED = [
  { id: "a1", channel: "whatsapp", text: "Carlos Ruiz envió un mensaje", time: "Hace 5 min", type: "message" },
  { id: "a2", channel: "linkedin", text: "Ana Torres quiere conectar", time: "Hace 15 min", type: "connection" },
  { id: "a3", channel: "email", text: "Nueva respuesta de María García", time: "Hace 30 min", type: "message" },
  { id: "a4", channel: "instagram", text: "Roberto Méndez mencionó tu marca", time: "Hace 1h", type: "mention" },
  { id: "a5", channel: "x", text: "@techreview_mx respondió tu DM", time: "Hace 1h", type: "message" },
  { id: "a6", channel: "whatsapp2", text: "Nuevo mensaje línea soporte", time: "Hace 2h", type: "message" },
  { id: "a7", channel: "facebook", text: "3 comentarios nuevos en tu publicación", time: "Hace 3h", type: "mention" },
  { id: "a8", channel: "reddit", text: "Mención en r/startups", time: "Hace 4h", type: "mention" },
];

export default function OmnichannelPage() {
  const [channels, setChannels] = useState<ChannelStat[]>([]);

  useEffect(() => {
    // Load connected channels from inbox storage
    const stored = loadFromStorage<{ id: string; type: string; connected: boolean; account: string }[]>("inbox_channels", []);
    const conversations = loadFromStorage<{ channel: string; unread: number }[]>("inbox_conversations", []);

    const stats: ChannelStat[] = CHANNEL_DEFS.map((def) => {
      const conn = stored.find((s) => s.type === def.id);
      const convos = conversations.filter((c) => c.channel === def.id);
      return {
        ...def,
        conversations: convos.length,
        unread: convos.reduce((sum, c) => sum + (c.unread || 0), 0),
        responseTime: convos.length > 0 ? `${Math.floor(Math.random() * 30) + 2} min` : "—",
        connected: conn?.connected || false,
        account: conn?.account || "",
      };
    });
    setChannels(stats);
  }, []);

  const totalConvos = channels.reduce((s, c) => s + c.conversations, 0);
  const totalUnread = channels.reduce((s, c) => s + c.unread, 0);
  const connectedCount = channels.filter((c) => c.connected).length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-brand" />Dashboard Omnicanal
          </h1>
          <p className="text-sm text-muted-foreground">Vista unificada de todos tus canales de comunicación</p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Canales conectados</p>
            <p className="mt-1 text-3xl font-bold">{connectedCount}<span className="text-lg text-muted-foreground">/{channels.length}</span></p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Conversaciones activas</p>
            <p className="mt-1 text-3xl font-bold">{totalConvos}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Mensajes sin leer</p>
            <p className="mt-1 text-3xl font-bold text-brand">{totalUnread}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Tiempo resp. promedio</p>
            <p className="mt-1 text-3xl font-bold">8 <span className="text-lg text-muted-foreground">min</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Channels grid */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 font-semibold">Canales</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div key={ch.id} className={`rounded-lg border p-4 ${ch.connected ? "bg-white" : "bg-gray-50 opacity-60"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ch.bgColor}`}>
                          <Icon className={`h-4 w-4 ${ch.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{ch.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ch.connected ? ch.account || "Conectado" : "Sin conectar"}
                          </p>
                        </div>
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${ch.connected ? "bg-green-400" : "bg-gray-300"}`} />
                    </div>
                    {ch.connected && (
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-2">
                        <div className="text-center">
                          <p className="text-lg font-bold">{ch.conversations}</p>
                          <p className="text-[10px] text-muted-foreground">Convos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-brand">{ch.unread}</p>
                          <p className="text-[10px] text-muted-foreground">Sin leer</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{ch.responseTime}</p>
                          <p className="text-[10px] text-muted-foreground">T. resp.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <h3 className="mb-3 font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />Actividad reciente
            </h3>
            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-3">
                {ACTIVITY_FEED.map((a) => {
                  const def = CHANNEL_DEFS.find((d) => d.id === a.channel);
                  const Icon = def?.icon || MessageSquare;
                  return (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${def?.bgColor || "bg-gray-50"}`}>
                        <Icon className={`h-3.5 w-3.5 ${def?.color || "text-gray-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">{a.text}</p>
                        <p className="text-[10px] text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <a href="/preview/inbox" className="mt-4 block text-center text-xs text-brand hover:underline">
                Ver todas las conversaciones →
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-4 rounded-lg border bg-white p-4">
              <h4 className="text-sm font-medium mb-3">Distribución por canal</h4>
              <div className="space-y-2">
                {channels.filter((c) => c.conversations > 0).sort((a, b) => b.conversations - a.conversations).map((ch) => {
                  const pct = totalConvos > 0 ? Math.round((ch.conversations / totalConvos) * 100) : 0;
                  return (
                    <div key={ch.id} className="flex items-center gap-2">
                      <span className="w-20 text-xs truncate">{ch.name.split("(")[0]}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100">
                        <div className={`h-2 rounded-full ${ch.bgColor.replace("50", "400").replace("100", "500")}`} style={{ width: `${pct}%`, backgroundColor: ch.color.includes("green") ? "#22c55e" : ch.color.includes("blue") ? "#3b82f6" : ch.color.includes("pink") ? "#ec4899" : ch.color.includes("indigo") ? "#6366f1" : ch.color.includes("sky") ? "#0ea5e9" : ch.color.includes("orange") ? "#f97316" : "#6b7280" }} />
                      </div>
                      <span className="w-8 text-right text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
