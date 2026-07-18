"use client";

import { useState, useEffect, useRef } from "react";
import { Hash, Lock, Plus, Search, Send, Paperclip, Users, UserPlus, X, FileText, Image, Trash2, Settings, Bell, Pin } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Member = { id: string; name: string; avatar: string; role: "admin" | "member"; online: boolean };
type Attachment = { id: string; name: string; size: string; type: "doc" | "image" | "file" };
type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  attachments: Attachment[];
  pinned: boolean;
};
type Channel = {
  id: string;
  name: string;
  type: "public" | "private" | "dm";
  members: string[];
  messages: ChatMessage[];
  description: string;
  unread: number;
};

const SEED_MEMBERS: Member[] = [
  { id: "m1", name: "Admin", avatar: "AD", role: "admin", online: true },
  { id: "m2", name: "María López", avatar: "ML", role: "member", online: true },
  { id: "m3", name: "Carlos Ruiz", avatar: "CR", role: "member", online: false },
  { id: "m4", name: "Ana García", avatar: "AG", role: "member", online: true },
  { id: "m5", name: "Pedro Sánchez", avatar: "PS", role: "member", online: false },
];

const SEED_CHANNELS: Channel[] = [
  { id: "ch1", name: "general", type: "public", members: ["m1","m2","m3","m4","m5"], description: "Canal general del equipo — anuncios y novedades", unread: 0, messages: [
    { id: "msg1", senderId: "m1", text: "Bienvenidos al chat interno del equipo. Aquí pueden comunicarse en tiempo real.", timestamp: "2026-07-17 09:00", attachments: [], pinned: true },
    { id: "msg2", senderId: "m2", text: "Perfecto! Ya tenemos la propuesta lista para el cliente Dentart.", timestamp: "2026-07-17 09:15", attachments: [], pinned: false },
    { id: "msg3", senderId: "m4", text: "Les comparto el documento actualizado del pipeline Q3", timestamp: "2026-07-17 09:30", attachments: [{ id: "a1", name: "Pipeline_Q3.pdf", size: "2.4 MB", type: "doc" }], pinned: false },
    { id: "msg4", senderId: "m3", text: "Voy a estar en reunión de 10 a 11. Si necesitan algo urgente escríbanme DM.", timestamp: "2026-07-17 09:45", attachments: [], pinned: false },
  ]},
  { id: "ch2", name: "ventas", type: "public", members: ["m1","m2","m3"], description: "Pipeline, leads y cierres", unread: 2, messages: [
    { id: "msg5", senderId: "m2", text: "Cerramos el deal con TechCorp! $15,000 ARR", timestamp: "2026-07-16 16:00", attachments: [], pinned: true },
    { id: "msg6", senderId: "m1", text: "Excelente María! Comparte los detalles del contrato aquí", timestamp: "2026-07-16 16:10", attachments: [], pinned: false },
  ]},
  { id: "ch3", name: "marketing", type: "public", members: ["m1","m4","m5"], description: "Campañas, contenido y redes", unread: 0, messages: [
    { id: "msg7", senderId: "m4", text: "La campaña de email de junio tuvo 38% de apertura", timestamp: "2026-07-15 11:00", attachments: [], pinned: false },
  ]},
  { id: "ch4", name: "proyecto-cliente-x", type: "private", members: ["m1","m2"], description: "Solo Admin y María — proyecto confidencial", unread: 1, messages: [
    { id: "msg8", senderId: "m1", text: "Este canal es privado. Solo nosotros podemos ver los mensajes.", timestamp: "2026-07-17 08:00", attachments: [], pinned: false },
    { id: "msg9", senderId: "m2", text: "Entendido. Aquí dejo el NDA firmado.", timestamp: "2026-07-17 08:30", attachments: [{ id: "a2", name: "NDA_ClienteX.pdf", size: "1.1 MB", type: "doc" }], pinned: false },
  ]},
  { id: "ch5", name: "María López", type: "dm", members: ["m1","m2"], description: "Mensaje directo", unread: 0, messages: [
    { id: "msg10", senderId: "m2", text: "Hola, tienes un momento para revisar la propuesta?", timestamp: "2026-07-17 10:00", attachments: [], pinned: false },
    { id: "msg11", senderId: "m1", text: "Sí, dame 5 minutos y la reviso", timestamp: "2026-07-17 10:02", attachments: [], pinned: false },
  ]},
];

export default function TeamChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>("ch1");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", type: "public" as "public"|"private", description: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChannels(loadFromStorage("team_channels", SEED_CHANNELS));
    setMembers(loadFromStorage("team_members", SEED_MEMBERS));
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, channels]);

  function saveChannels(c: Channel[]) { setChannels(c); saveToStorage("team_channels", c); }
  function saveMembers(m: Member[]) { setMembers(m); saveToStorage("team_members", m); }

  const channel = channels.find(c => c.id === activeChannel);
  const channelMembers = members.filter(m => channel?.members.includes(m.id));

  function sendMessage() {
    if (!message.trim() || !channel) return;
    const msg: ChatMessage = { id: generateId(), senderId: "m1", text: message, timestamp: new Date().toLocaleString("es-CO", { hour12: false }), attachments: [], pinned: false };
    saveChannels(channels.map(c => c.id === activeChannel ? { ...c, messages: [...c.messages, msg] } : c));
    setMessage("");
  }

  function sendWithAttachment() {
    if (!channel) return;
    const name = prompt("Nombre del archivo (ej: reporte.pdf):");
    if (!name) return;
    const msg: ChatMessage = { id: generateId(), senderId: "m1", text: message || `📎 ${name}`, timestamp: new Date().toLocaleString("es-CO", { hour12: false }), attachments: [{ id: generateId(), name, size: "1.2 MB", type: name.endsWith(".pdf") ? "doc" : name.match(/\.(png|jpg|gif)/) ? "image" : "file" }], pinned: false };
    saveChannels(channels.map(c => c.id === activeChannel ? { ...c, messages: [...c.messages, msg] } : c));
    setMessage("");
  }

  function createChannel() {
    if (!newChannel.name.trim()) return;
    const ch: Channel = { id: generateId(), name: newChannel.name.toLowerCase().replace(/\s+/g, "-"), type: newChannel.type, members: ["m1"], description: newChannel.description, unread: 0, messages: [] };
    saveChannels([...channels, ch]);
    setActiveChannel(ch.id);
    setShowNewChannel(false);
    setNewChannel({ name: "", type: "public", description: "" });
  }

  function inviteMember() {
    if (!inviteEmail.trim()) return;
    const name = inviteEmail.split("@")[0] || "Nuevo";
    const m: Member = { id: generateId(), name: name.charAt(0).toUpperCase() + name.slice(1), avatar: name.slice(0,2).toUpperCase(), role: "member", online: false };
    saveMembers([...members, m]);
    if (channel) {
      saveChannels(channels.map(c => c.id === activeChannel ? { ...c, members: [...c.members, m.id] } : c));
    }
    setInviteEmail("");
    setShowInvite(false);
  }

  function deleteMessage(msgId: string) {
    saveChannels(channels.map(c => c.id === activeChannel ? { ...c, messages: c.messages.filter(m => m.id !== msgId) } : c));
  }

  function togglePin(msgId: string) {
    saveChannels(channels.map(c => c.id === activeChannel ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m) } : c));
  }

  function deleteChannel(chId: string) {
    if (!confirm("Eliminar este canal y todos sus mensajes?")) return;
    const updated = channels.filter(c => c.id !== chId);
    saveChannels(updated);
    if (activeChannel === chId) setActiveChannel(updated[0]?.id || "");
  }

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar: Channels */}
      <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r bg-gray-50 flex flex-col max-h-48 md:max-h-none overflow-y-auto md:overflow-y-visible">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Chat Equipo</h2>
            <button onClick={() => setShowNewChannel(true)} className="rounded p-1 hover:bg-gray-200" title="Nuevo canal"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar canal..." className="w-full rounded border pl-7 pr-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Canales</p>
          {filteredChannels.filter(c => c.type !== "dm").map(c => (
            <button key={c.id} onClick={() => { setActiveChannel(c.id); saveChannels(channels.map(ch => ch.id === c.id ? { ...ch, unread: 0 } : ch)); }} className={`w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs text-left transition-colors ${activeChannel === c.id ? "bg-brand/10 text-brand font-medium" : "hover:bg-gray-100 text-gray-700"}`}>
              {c.type === "private" ? <Lock className="h-3.5 w-3.5 shrink-0" /> : <Hash className="h-3.5 w-3.5 shrink-0" />}
              <span className="flex-1 truncate">{c.name}</span>
              {c.unread > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand text-[9px] text-white px-1">{c.unread}</span>}
            </button>
          ))}

          <p className="px-2 py-1 mt-3 text-[10px] font-semibold uppercase text-muted-foreground">Mensajes directos</p>
          {filteredChannels.filter(c => c.type === "dm").map(c => {
            const other = members.find(m => c.members.includes(m.id) && m.id !== "m1");
            return (
              <button key={c.id} onClick={() => { setActiveChannel(c.id); saveChannels(channels.map(ch => ch.id === c.id ? { ...ch, unread: 0 } : ch)); }} className={`w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs text-left transition-colors ${activeChannel === c.id ? "bg-brand/10 text-brand font-medium" : "hover:bg-gray-100 text-gray-700"}`}>
                <span className={`h-2 w-2 rounded-full shrink-0 ${other?.online ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="flex-1 truncate">{c.name}</span>
                {c.unread > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand text-[9px] text-white px-1">{c.unread}</span>}
              </button>
            );
          })}
        </div>

        {/* Online members */}
        <div className="border-t p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">En línea ({members.filter(m => m.online).length})</p>
          <div className="space-y-1">
            {members.filter(m => m.online).map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-[8px] font-bold text-brand">{m.avatar}</span>
                <span className="truncate">{m.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {channel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="flex items-center gap-2">
                {channel.type === "private" ? <Lock className="h-4 w-4 text-amber-600" /> : channel.type === "dm" ? <Users className="h-4 w-4 text-brand" /> : <Hash className="h-4 w-4 text-brand" />}
                <div>
                  <h3 className="text-sm font-semibold">{channel.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{channel.description} — {channelMembers.length} miembros</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowInvite(true)} className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"><UserPlus className="h-3 w-3" />Invitar</button>
                {channel.type !== "dm" && <button onClick={() => deleteChannel(channel.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>}
              </div>
            </div>

            {/* Private channel notice */}
            {channel.type === "private" && (
              <div className="mx-5 mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Canal privado — solo los miembros invitados pueden ver estos mensajes
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {channel.messages.map(msg => {
                const sender = members.find(m => m.id === msg.senderId);
                const isMe = msg.senderId === "m1";
                return (
                  <div key={msg.id} className={`group flex gap-3 ${msg.pinned ? "bg-amber-50 -mx-2 px-2 py-1 rounded border border-amber-100" : ""}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isMe ? "bg-brand text-white" : "bg-gray-200 text-gray-700"}`}>{sender?.avatar || "??"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{sender?.name || "Desconocido"}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                        {msg.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                      </div>
                      <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{msg.text}</p>
                      {msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map(att => (
                            <div key={att.id} className="inline-flex items-center gap-2 rounded border bg-gray-50 px-3 py-1.5 text-xs">
                              {att.type === "doc" ? <FileText className="h-3.5 w-3.5 text-blue-600" /> : att.type === "image" ? <Image className="h-3.5 w-3.5 text-green-600" /> : <Paperclip className="h-3.5 w-3.5 text-gray-600" />}
                              <span className="font-medium">{att.name}</span>
                              <span className="text-muted-foreground">{att.size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => togglePin(msg.id)} className="rounded p-1 text-muted-foreground hover:text-amber-500" title="Fijar"><Pin className="h-3 w-3" /></button>
                      {isMe && <button onClick={() => deleteMessage(msg.id)} className="rounded p-1 text-muted-foreground hover:text-red-500" title="Eliminar"><Trash2 className="h-3 w-3" /></button>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <button onClick={sendWithAttachment} className="rounded-md border p-2 text-muted-foreground hover:text-brand hover:border-brand" title="Adjuntar archivo"><Paperclip className="h-4 w-4" /></button>
                <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder={`Mensaje en #${channel.name}...`} className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <button onClick={sendMessage} disabled={!message.trim()} className="rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-hover disabled:opacity-50"><Send className="h-4 w-4" /></button>
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">Enter para enviar · Adjunta documentos, imágenes y archivos · Solo los miembros del canal pueden ver</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Selecciona un canal para empezar</div>
        )}
      </div>

      {/* New Channel Modal */}
      {showNewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Crear canal</h3>
              <button onClick={() => setShowNewChannel(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <input value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} placeholder="ej: proyecto-nuevo" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setNewChannel({...newChannel, type: "public"})} className={`flex-1 flex items-center justify-center gap-2 rounded border px-3 py-2 text-xs ${newChannel.type === "public" ? "border-brand bg-brand/5 text-brand" : ""}`}><Hash className="h-3.5 w-3.5" />Público</button>
                  <button onClick={() => setNewChannel({...newChannel, type: "private"})} className={`flex-1 flex items-center justify-center gap-2 rounded border px-3 py-2 text-xs ${newChannel.type === "private" ? "border-brand bg-brand/5 text-brand" : ""}`}><Lock className="h-3.5 w-3.5" />Privado</button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{newChannel.type === "private" ? "Solo los miembros invitados podrán ver y escribir" : "Todos los miembros del equipo pueden ver"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Descripción</label>
                <input value={newChannel.description} onChange={e => setNewChannel({...newChannel, description: e.target.value})} placeholder="De qué trata este canal..." className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
              </div>
              <button onClick={createChannel} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Crear canal</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Invitar miembro</h3>
              <button onClick={() => setShowInvite(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email del miembro</label>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="correo@empresa.com" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
              </div>
              <p className="text-[10px] text-muted-foreground">El miembro recibirá una invitación para unirse al canal <strong>#{channel?.name}</strong>.</p>
              <button onClick={inviteMember} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Enviar invitación</button>
            </div>
            {channelMembers.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">Miembros actuales ({channelMembers.length})</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {channelMembers.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-[8px] font-bold text-brand">{m.avatar}</span>
                      <span>{m.name}</span>
                      <span className="text-[9px] text-muted-foreground ml-auto">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
