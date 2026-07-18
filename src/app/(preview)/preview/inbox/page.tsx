"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Bot, Facebook, FileText, Instagram, Link2, Linkedin, Mail, MessageSquare, Paperclip, Phone, Plus, Send, Settings, Trash2, Wifi, WifiOff, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Attachment = { id: string; name: string; size: string; type: string };

type Message = {
  id: string;
  direction: "in" | "out";
  text: string;
  timestamp: string;
  aiGenerated?: boolean;
  channel?: string;
  attachments?: Attachment[];
};

type Reminder = { id: string; text: string; date: string; done: boolean };

type Conversation = {
  id: string;
  contactName: string;
  phone: string;
  channel: "whatsapp" | "whatsapp2" | "whatsapp3" | "email" | "instagram" | "facebook" | "linkedin" | "x" | "quora" | "reddit" | "telegram" | "tiktok" | "gmail" | "sms";
  lastMessage: string;
  unread: number;
  messages: Message[];
  aiEnabled: boolean;
  reminders: Reminder[];
};

type ChannelConfig = {
  id: string;
  type: "whatsapp" | "whatsapp2" | "whatsapp3" | "email" | "instagram" | "facebook" | "linkedin" | "x" | "quora" | "reddit" | "telegram" | "tiktok" | "gmail";
  label: string;
  connected: boolean;
  account: string;
};

const CHANNEL_ICONS: Record<string, typeof MessageSquare> = {
  whatsapp: Phone,
  whatsapp2: Phone,
  whatsapp3: Phone,
  email: Mail,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  x: MessageSquare,
  quora: MessageSquare,
  reddit: MessageSquare,
  telegram: Send,
  tiktok: MessageSquare,
  gmail: Mail,
  sms: MessageSquare,
};

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "text-green-600 bg-green-50",
  whatsapp2: "text-green-700 bg-green-100",
  whatsapp3: "text-emerald-600 bg-emerald-50",
  email: "text-blue-600 bg-blue-50",
  instagram: "text-pink-600 bg-pink-50",
  facebook: "text-indigo-600 bg-indigo-50",
  linkedin: "text-sky-700 bg-sky-50",
  x: "text-gray-900 bg-gray-100",
  quora: "text-red-600 bg-red-50",
  reddit: "text-orange-600 bg-orange-50",
  telegram: "text-cyan-600 bg-cyan-50",
  tiktok: "text-gray-900 bg-gray-100",
  gmail: "text-red-500 bg-red-50",
  sms: "text-gray-600 bg-gray-50",
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  whatsapp2: "WhatsApp 2",
  whatsapp3: "WhatsApp 3",
  email: "Email",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  quora: "Quora",
  reddit: "Reddit",
  telegram: "Telegram",
  tiktok: "TikTok",
  gmail: "Gmail",
  sms: "SMS",
};

const SEED_CHANNELS: ChannelConfig[] = [
  { id: "ch1", type: "whatsapp", label: "WhatsApp Business (Principal)", connected: false, account: "" },
  { id: "ch2", type: "whatsapp2", label: "WhatsApp Business (Línea 2)", connected: false, account: "" },
  { id: "ch3", type: "whatsapp3", label: "WhatsApp Business (Línea 3)", connected: false, account: "" },
  { id: "ch4", type: "email", label: "Correo electrónico", connected: false, account: "" },
  { id: "ch5", type: "instagram", label: "Instagram DM", connected: false, account: "" },
  { id: "ch6", type: "facebook", label: "Facebook Messenger", connected: false, account: "" },
  { id: "ch7", type: "linkedin", label: "LinkedIn Messages", connected: false, account: "" },
  { id: "ch8", type: "x", label: "X (Twitter) DM", connected: false, account: "" },
  { id: "ch9", type: "quora", label: "Quora Messages", connected: false, account: "" },
  { id: "ch10", type: "reddit", label: "Reddit Chat", connected: false, account: "" },
  { id: "ch11", type: "telegram", label: "Telegram Bot", connected: false, account: "" },
  { id: "ch12", type: "tiktok", label: "TikTok DM", connected: false, account: "" },
  { id: "ch13", type: "gmail", label: "Gmail (Google)", connected: false, account: "" },
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "cv1", contactName: "Carlos Ruiz", phone: "+52 55 1234 5678", channel: "whatsapp", lastMessage: "Perfecto, les envío la propuesta", unread: 2, aiEnabled: true,
    messages: [
      { id: "m1", direction: "in", text: "Hola, quisiera información sobre el plan Enterprise", timestamp: "10:30", channel: "whatsapp" },
      { id: "m2", direction: "out", text: "¡Hola Carlos! El plan Enterprise incluye acceso ilimitado y soporte dedicado.", timestamp: "10:32", aiGenerated: true, channel: "whatsapp" },
      { id: "m3", direction: "in", text: "¿Cuál es el precio?", timestamp: "10:35", channel: "whatsapp" },
      { id: "m4", direction: "out", text: "El plan tiene un costo de $85,000 USD anuales con SLA 99.9%.", timestamp: "10:36", aiGenerated: true, channel: "whatsapp" },
      { id: "m5", direction: "in", text: "Perfecto, les envío la propuesta", timestamp: "10:45", channel: "whatsapp" },
    ],
    reminders: [{ id: "r1", text: "Seguimiento propuesta Enterprise", date: "2026-07-19", done: false }],
  },
  {
    id: "cv2", contactName: "María García", phone: "maria@loginext.io", channel: "email", lastMessage: "¿Podemos agendar una demo?", unread: 1, aiEnabled: false,
    messages: [
      { id: "m6", direction: "in", text: "Buenos días, vi su producto en una conferencia", timestamp: "09:15", channel: "email" },
      { id: "m7", direction: "out", text: "¡Buenos días María! ¿En qué puedo ayudarla?", timestamp: "09:20", channel: "email" },
      { id: "m8", direction: "in", text: "¿Podemos agendar una demo?", timestamp: "09:25", channel: "email" },
    ],
    reminders: [],
  },
  {
    id: "cv3", contactName: "Roberto Méndez", phone: "@roberto.mz", channel: "instagram", lastMessage: "Vi su última publicación, me interesa", unread: 1, aiEnabled: true,
    messages: [
      { id: "m9", direction: "in", text: "Vi su última publicación, me interesa", timestamp: "Ayer", channel: "instagram" },
    ],
    reminders: [],
  },
  {
    id: "cv4", contactName: "Ana Torres (LinkedIn)", phone: "linkedin.com/in/anatorres", channel: "linkedin", lastMessage: "Me gustaría agendar una reunión", unread: 1, aiEnabled: false,
    messages: [
      { id: "m10", direction: "in", text: "Hola, vi su perfil y me interesa su servicio de consultoría", timestamp: "Ayer", channel: "linkedin" },
      { id: "m11", direction: "out", text: "¡Hola Ana! Con gusto, ¿en qué área necesitas apoyo?", timestamp: "Ayer", channel: "linkedin" },
      { id: "m12", direction: "in", text: "Me gustaría agendar una reunión", timestamp: "Hoy", channel: "linkedin" },
    ],
    reminders: [],
  },
  {
    id: "cv5", contactName: "TechReview_mx", phone: "@techreview_mx", channel: "x", lastMessage: "¿Tienen API pública?", unread: 0, aiEnabled: true,
    messages: [
      { id: "m13", direction: "in", text: "Hola @LocalRank, ¿tienen API pública para integrar con nuestro sistema?", timestamp: "Hace 2h", channel: "x" },
      { id: "m14", direction: "out", text: "¡Hola! Sí, tenemos API REST y webhooks. Te comparto la documentación por DM.", timestamp: "Hace 1h", channel: "x" },
    ],
    reminders: [],
  },
  {
    id: "cv6", contactName: "Soporte Telegram", phone: "@localrank_bot", channel: "telegram", lastMessage: "Bot configurado correctamente ✓", unread: 0, aiEnabled: true,
    messages: [
      { id: "m15", direction: "in", text: "/start", timestamp: "Ayer", channel: "telegram" },
      { id: "m16", direction: "out", text: "¡Bienvenido al bot de LocalRank! ¿En qué puedo ayudarte?", timestamp: "Ayer", channel: "telegram", aiGenerated: true },
      { id: "m17", direction: "in", text: "Quiero información de precios", timestamp: "Ayer", channel: "telegram" },
      { id: "m18", direction: "out", text: "Bot configurado correctamente ✓", timestamp: "Ayer", channel: "telegram", aiGenerated: true },
    ],
    reminders: [],
  },
];

export default function InboxPreviewPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [connectingChannel, setConnectingChannel] = useState<string | null>(null);
  const [connectInput, setConnectInput] = useState("");
  const [showReminders, setShowReminders] = useState(false);
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [newConvoForm, setNewConvoForm] = useState({ name: "", phone: "", channel: "whatsapp" as Conversation["channel"] });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newReminder, setNewReminder] = useState({ text: "", date: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConversations(loadFromStorage("inbox_conversations", SEED_CONVERSATIONS));
    setChannels(loadFromStorage("inbox_channels", SEED_CHANNELS));
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active, conversations]);

  function saveConvos(u: Conversation[]) { setConversations(u); saveToStorage("inbox_conversations", u); }
  function saveChannels(u: ChannelConfig[]) { setChannels(u); saveToStorage("inbox_channels", u); }

  const activeConvo = conversations.find((c) => c.id === active);
  const connectedCount = channels.filter((c) => c.connected).length;
  const allReminders = conversations.flatMap((c) => c.reminders.filter((r) => !r.done).map((r) => ({ ...r, convoName: c.contactName, convoId: c.id })));

  function sendMessage() {
    if (!newMsg.trim() && attachments.length === 0) return;
    if (!active) return;
    const msg: Message = { id: generateId(), direction: "out", text: newMsg, timestamp: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }), attachments: attachments.length > 0 ? [...attachments] : undefined };
    saveConvos(conversations.map((c) => c.id === active ? { ...c, messages: [...c.messages, msg], lastMessage: newMsg || `📎 ${attachments.length} archivo(s)` } : c));
    setNewMsg(""); setAttachments([]);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles: Attachment[] = Array.from(files).map((f) => ({
      id: generateId(),
      name: f.name,
      size: f.size < 1024 ? `${f.size}B` : f.size < 1048576 ? `${(f.size / 1024).toFixed(1)}KB` : `${(f.size / 1048576).toFixed(1)}MB`,
      type: f.type.split("/")[0] || "file",
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeAttachment(id: string) { setAttachments((prev) => prev.filter((a) => a.id !== id)); }

  function toggleChannel(channelId: string, account: string) {
    saveChannels(channels.map((c) => c.id === channelId ? { ...c, connected: !c.connected, account } : c));
  }

  function addConversation() {
    if (!newConvoForm.name.trim()) return;
    const convo: Conversation = { id: generateId(), contactName: newConvoForm.name, phone: newConvoForm.phone, channel: newConvoForm.channel, lastMessage: "", unread: 0, messages: [], aiEnabled: true, reminders: [] };
    saveConvos([convo, ...conversations]);
    setActive(convo.id);
    setShowNewConvo(false);
    setNewConvoForm({ name: "", phone: "", channel: "whatsapp" });
  }

  function deleteConversation(id: string) {
    saveConvos(conversations.filter((c) => c.id !== id));
    if (active === id) setActive(null);
  }

  function markRead(id: string) { saveConvos(conversations.map((c) => c.id === id ? { ...c, unread: 0 } : c)); }
  function toggleAi(id: string) { saveConvos(conversations.map((c) => c.id === id ? { ...c, aiEnabled: !c.aiEnabled } : c)); }

  function addConvoReminder(convoId: string) {
    if (!newReminder.text.trim()) return;
    saveConvos(conversations.map((c) => c.id === convoId ? { ...c, reminders: [...c.reminders, { id: generateId(), text: newReminder.text, date: newReminder.date || "Sin fecha", done: false }] } : c));
    setNewReminder({ text: "", date: "" });
  }

  function toggleConvoReminder(convoId: string, remId: string) {
    saveConvos(conversations.map((c) => c.id === convoId ? { ...c, reminders: c.reminders.map((r) => r.id === remId ? { ...r, done: !r.done } : r) } : c));
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="flex w-80 shrink-0 flex-col border-r">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-sm">Bandeja</h2>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowReminders(!showReminders)} className={`relative rounded p-1.5 ${showReminders ? "bg-amber-100 text-amber-700" : "hover:bg-gray-100 text-muted-foreground"}`} title="Recordatorios">
              <Bell className="h-4 w-4" />
              {allReminders.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-white">{allReminders.length}</span>}
            </button>
            <button onClick={() => setShowConnect(true)} className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${connectedCount > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-muted-foreground"}`}>
              {connectedCount > 0 ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {connectedCount > 0 ? `${connectedCount} canal${connectedCount > 1 ? "es" : ""}` : "Conectar"}
            </button>
            <button onClick={() => setShowNewConvo(true)} className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground" title="Nueva conversación">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reminders panel */}
        {showReminders && (
          <div className="border-b bg-amber-50/50 p-3 max-h-48 overflow-y-auto">
            <h4 className="text-xs font-semibold uppercase text-amber-700 mb-2">Recordatorios pendientes</h4>
            {allReminders.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin recordatorios pendientes</p>
            ) : (
              <div className="space-y-1.5">
                {allReminders.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={r.done} onChange={() => toggleConvoReminder(r.convoId, r.id)} className="accent-[var(--accent)]" />
                    <div className="flex-1">
                      <span className="font-medium">{r.text}</span>
                      <span className="ml-1 text-muted-foreground">— {r.convoName}</span>
                    </div>
                    {r.date !== "Sin fecha" && <span className="text-muted-foreground">{r.date}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New convo form */}
        {showNewConvo && (
          <div className="border-b p-3 space-y-2">
            <input value={newConvoForm.name} onChange={(e) => setNewConvoForm({ ...newConvoForm, name: e.target.value })} placeholder="Nombre *" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <input value={newConvoForm.phone} onChange={(e) => setNewConvoForm({ ...newConvoForm, phone: e.target.value })} placeholder="Teléfono / email / @usuario" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <select value={newConvoForm.channel} onChange={(e) => setNewConvoForm({ ...newConvoForm, channel: e.target.value as Conversation["channel"] })} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none">
              <option value="whatsapp">WhatsApp (Principal)</option>
              <option value="whatsapp2">WhatsApp (Línea 2)</option>
              <option value="whatsapp3">WhatsApp (Línea 3)</option>
              <option value="email">Email</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X (Twitter)</option>
              <option value="quora">Quora</option>
              <option value="reddit">Reddit</option>
              <option value="telegram">Telegram</option>
              <option value="tiktok">TikTok</option>
              <option value="gmail">Gmail</option>
              <option value="sms">SMS</option>
            </select>
            <div className="flex gap-2">
              <button onClick={addConversation} className="rounded bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-hover">Crear</button>
              <button onClick={() => setShowNewConvo(false)} className="rounded border px-3 py-1 text-xs hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const Icon = CHANNEL_ICONS[convo.channel] || MessageSquare;
            const color = CHANNEL_COLORS[convo.channel] || "text-gray-600 bg-gray-50";
            return (
              <div key={convo.id} onClick={() => { setActive(convo.id); markRead(convo.id); }} className={`group flex cursor-pointer items-center gap-3 border-b px-3 py-3 transition-colors ${active === convo.id ? "bg-brand-tint" : "hover:bg-gray-50"}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{convo.contactName}</span>
                    {convo.unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white">{convo.unread}</span>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{convo.lastMessage || "Sin mensajes"}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id); }} className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {activeConvo ? (
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${CHANNEL_COLORS[activeConvo.channel]}`}>
                {(() => { const I = CHANNEL_ICONS[activeConvo.channel] || MessageSquare; return <I className="h-4 w-4" />; })()}
              </div>
              <div>
                <p className="text-sm font-semibold">{activeConvo.contactName}</p>
                <p className="text-xs text-muted-foreground">{activeConvo.phone} · {CHANNEL_LABELS[activeConvo.channel] || activeConvo.channel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAi(activeConvo.id)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${activeConvo.aiEnabled ? "bg-brand-tint text-brand" : "border text-muted-foreground"}`}>
                <Bot className="h-3.5 w-3.5" />IA {activeConvo.aiEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConvo.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg px-3.5 py-2 text-sm ${msg.direction === "out" ? "bg-brand text-white" : "border bg-white"}`}>
                  <p>{msg.text}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {msg.attachments.map((a) => (
                        <div key={a.id} className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs ${msg.direction === "out" ? "bg-white/20" : "bg-gray-50"}`}>
                          <FileText className="h-3 w-3" /><span className="truncate">{a.name}</span><span className="text-[10px] opacity-70">{a.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`mt-1 flex items-center gap-1 text-[10px] ${msg.direction === "out" ? "text-white/70" : "text-muted-foreground"}`}>
                    <span>{msg.timestamp}</span>
                    {msg.aiGenerated && <Bot className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reminders for this convo */}
          {activeConvo.reminders.length > 0 && (
            <div className="border-t bg-amber-50/50 px-4 py-2">
              <div className="flex items-center gap-2 text-xs">
                <Bell className="h-3 w-3 text-amber-600" />
                {activeConvo.reminders.filter((r) => !r.done).map((r) => (
                  <span key={r.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={r.done} onChange={() => toggleConvoReminder(activeConvo.id, r.id)} className="accent-[var(--accent)]" />
                    <span>{r.text}{r.date !== "Sin fecha" ? ` (${r.date})` : ""}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add reminder */}
          <div className="border-t px-4 py-2 flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={newReminder.text} onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })} placeholder="Agregar recordatorio..." className="flex-1 text-xs border-0 bg-transparent focus:outline-none" />
            <input value={newReminder.date} onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })} type="date" className="text-xs border-0 bg-transparent focus:outline-none w-28" />
            {newReminder.text && <button onClick={() => addConvoReminder(activeConvo.id)} className="text-xs text-brand font-medium hover:underline">Agregar</button>}
          </div>

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="border-t px-4 py-2 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-1.5 rounded border bg-gray-50 px-2 py-1 text-xs">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{a.name}</span>
                  <button onClick={() => removeAttachment(a.id)} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="rounded p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground" title="Adjuntar archivo">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-md border bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button onClick={sendMessage} disabled={!newMsg.trim() && attachments.length === 0} className="rounded-md bg-brand p-2.5 text-white hover:bg-brand-hover disabled:opacity-50 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">Selecciona una conversación</p>
          </div>
        </div>
      )}

      {/* Connection modal */}
      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowConnect(false)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint">
                  <Link2 className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold">Canales de comunicación</h3>
                  <p className="text-xs text-muted-foreground">Conecta todos tus canales de comunicación</p>
                </div>
              </div>
              <button onClick={() => setShowConnect(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3">
              {channels.map((ch) => {
                const Icon = CHANNEL_ICONS[ch.type] || MessageSquare;
                const color = CHANNEL_COLORS[ch.type] || "";
                return (
                  <div key={ch.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{ch.label}</p>
                          {ch.connected && ch.account && <p className="text-xs text-muted-foreground">{ch.account}</p>}
                        </div>
                      </div>
                      {ch.connected ? (
                        <button onClick={() => toggleChannel(ch.id, "")} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Desconectar</button>
                      ) : (
                        connectingChannel === ch.id ? (
                          <div className="flex flex-col gap-2">
                            {/* OAuth-style buttons for social platforms */}
                            {(ch.type === "instagram" || ch.type === "facebook") && (
                              <button onClick={() => { toggleChannel(ch.id, `@${ch.type}_connected`); setConnectingChannel(null); }} className="flex items-center gap-2 rounded-md bg-[#1877F2] px-3 py-2 text-xs font-medium text-white hover:opacity-90">
                                <Facebook className="h-3.5 w-3.5" />Conectar con Meta Business
                              </button>
                            )}
                            {ch.type === "linkedin" && (
                              <button onClick={() => { toggleChannel(ch.id, "linkedin_oauth"); setConnectingChannel(null); }} className="flex items-center gap-2 rounded-md bg-[#0A66C2] px-3 py-2 text-xs font-medium text-white hover:opacity-90">
                                <Linkedin className="h-3.5 w-3.5" />Conectar con LinkedIn
                              </button>
                            )}
                            {ch.type === "x" && (
                              <button onClick={() => { toggleChannel(ch.id, "@x_connected"); setConnectingChannel(null); }} className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-xs font-medium text-white hover:opacity-90">
                                <span className="text-sm font-bold">𝕏</span>Conectar con X
                              </button>
                            )}
                            {ch.type === "tiktok" && (
                              <button onClick={() => { toggleChannel(ch.id, "@tiktok_business"); setConnectingChannel(null); }} className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-xs font-medium text-white hover:opacity-90">
                                <span className="text-sm">♪</span>Conectar con TikTok Business
                              </button>
                            )}
                            {ch.type.includes("whatsapp") && (
                              <div className="space-y-2">
                                <button onClick={() => { toggleChannel(ch.id, "Cloud API"); setConnectingChannel(null); }} className="flex w-full items-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-xs font-medium text-white hover:opacity-90">
                                  <Phone className="h-3.5 w-3.5" />Conectar vía Cloud API (Meta)
                                </button>
                                <button onClick={() => { toggleChannel(ch.id, "QR Coexist"); setConnectingChannel(null); }} className="flex w-full items-center gap-2 rounded-md border border-[#25D366] px-3 py-2 text-xs font-medium text-[#25D366] hover:bg-green-50">
                                  <span className="text-sm">📱</span>Vincular dispositivo (QR — Coexistencia)
                                </button>
                                <p className="text-[9px] text-muted-foreground">Coexistencia: usa el mismo número sin cerrar sesión en tu teléfono.</p>
                              </div>
                            )}
                            {(ch.type === "email" || ch.type === "gmail") && (
                              <div className="space-y-2">
                                <button onClick={() => { toggleChannel(ch.id, "gmail_oauth"); setConnectingChannel(null); }} className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
                                  <span className="text-sm">G</span>Conectar con Google (Gmail)
                                </button>
                                <button onClick={() => { toggleChannel(ch.id, "outlook_oauth"); setConnectingChannel(null); }} className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
                                  <Mail className="h-3.5 w-3.5 text-blue-500" />Conectar con Outlook
                                </button>
                              </div>
                            )}
                            {ch.type === "telegram" && (
                              <div className="space-y-1.5">
                                <input value={connectInput} onChange={(e) => setConnectInput(e.target.value)} placeholder="Bot Token de @BotFather" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                                <button onClick={() => { if (connectInput.trim()) { toggleChannel(ch.id, connectInput.trim()); setConnectInput(""); setConnectingChannel(null); } }} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0088cc] px-3 py-2 text-xs font-medium text-white hover:opacity-90">Conectar Bot</button>
                              </div>
                            )}
                            {(ch.type === "quora" || ch.type === "reddit") && (
                              <button onClick={() => { toggleChannel(ch.id, `${ch.type}_connected`); setConnectingChannel(null); }} className="flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover">Autorizar acceso</button>
                            )}
                            <button onClick={() => { setConnectingChannel(null); setConnectInput(""); }} className="text-[10px] text-muted-foreground hover:text-foreground text-center">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => setConnectingChannel(ch.id)} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover">Conectar</button>
                        )
                      )}
                    </div>
                    {ch.type === "whatsapp" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Requiere cuenta de Meta Business con API de WhatsApp habilitada.</p>
                    )}
                    {(ch.type === "whatsapp2" || ch.type === "whatsapp3") && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Línea adicional de WhatsApp Business (requiere otro número).</p>
                    )}
                    {ch.type === "email" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">IMAP/SMTP o integración con Gmail/Outlook.</p>
                    )}
                    {ch.type === "linkedin" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Conecta tu perfil de LinkedIn para gestionar mensajes.</p>
                    )}
                    {ch.type === "x" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Conecta tu cuenta de X para gestionar DMs y menciones.</p>
                    )}
                    {ch.type === "quora" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Monitorea y responde mensajes desde Quora.</p>
                    )}
                    {ch.type === "reddit" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Conecta tu cuenta de Reddit para gestionar chats.</p>
                    )}
                    {ch.type === "telegram" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Crea un bot con @BotFather y pega el token aquí.</p>
                    )}
                    {ch.type === "tiktok" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Conecta tu cuenta de TikTok Business para gestionar DMs y comentarios.</p>
                    )}
                    {ch.type === "gmail" && !ch.connected && (
                      <p className="mt-2 text-xs text-muted-foreground">Conecta tu cuenta de Gmail con OAuth2 para enviar/recibir emails.</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t">
              <a href="/preview/settings/ai-providers" className="flex items-center gap-1 text-xs text-brand hover:underline">
                <Settings className="h-3 w-3" />Configurar IA para respuestas automáticas
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
