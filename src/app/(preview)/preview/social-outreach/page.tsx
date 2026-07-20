"use client";
import { useState, useEffect } from "react";
import { ClipboardCopy, ExternalLink, Linkedin, MessageSquare, Plus, Send, Trash2, Twitter, Users } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { exportToCSV } from "@/lib/email-tools";

type SocialProfile = {
  id: string;
  platform: "linkedin" | "twitter" | "instagram" | "facebook" | "tiktok";
  profileUrl: string;
  name: string;
  title: string;
  company: string;
  followers: number;
  connected: boolean;
  notes: string;
  lastAction: string;
  addedAt: string;
};

type OutreachMessage = {
  id: string;
  profileId: string;
  type: "connection" | "message" | "inmail" | "comment" | "dm";
  content: string;
  status: "draft" | "sent" | "accepted" | "replied";
  sentAt: string;
};

const PLATFORMS = {
  linkedin: { label: "LinkedIn", icon: "💼", color: "#0A66C2" },
  twitter: { label: "Twitter/X", icon: "🐦", color: "#1DA1F2" },
  instagram: { label: "Instagram", icon: "📸", color: "#E4405F" },
  facebook: { label: "Facebook", icon: "📘", color: "#1877F2" },
  tiktok: { label: "TikTok", icon: "🎵", color: "#000000" },
};

const SEED_PROFILES: SocialProfile[] = [
  { id: "sp1", platform: "linkedin", profileUrl: "https://linkedin.com/in/carlos-ruiz-cto", name: "Carlos Ruiz", title: "CTO", company: "TechCorp", followers: 2500, connected: true, notes: "Decisor técnico. Interesado en cloud.", lastAction: "Mensaje enviado", addedAt: "2026-07-17" },
  { id: "sp2", platform: "linkedin", profileUrl: "https://linkedin.com/in/maria-garcia-ops", name: "María García", title: "VP Operations", company: "LogiNext", followers: 1800, connected: false, notes: "Enviar invitación con nota personalizada", lastAction: "Perfil visitado", addedAt: "2026-07-16" },
  { id: "sp3", platform: "twitter", profileUrl: "https://twitter.com/robertomendez", name: "Roberto Méndez", title: "Director Marketing", company: "MediaGroup", followers: 5200, connected: false, notes: "Activo en contenido de marketing digital", lastAction: "", addedAt: "2026-07-15" },
  { id: "sp4", platform: "instagram", profileUrl: "https://instagram.com/dentart.odontology", name: "Dentart Odontology", title: "Clínica dental", company: "Dentart", followers: 3400, connected: false, notes: "Lead caliente. Tiene web propia.", lastAction: "", addedAt: "2026-07-14" },
];

const SEED_MESSAGES: OutreachMessage[] = [
  { id: "om1", profileId: "sp1", type: "message", content: "Hola Carlos, vi que están migrando a cloud. En LocalRank podemos ayudarles con la parte de CRM...", status: "sent", sentAt: "2026-07-17" },
  { id: "om2", profileId: "sp2", type: "connection", content: "Hola María, me gustaría conectar contigo. Vi tu trabajo en LogiNext y creo que podemos colaborar.", status: "draft", sentAt: "" },
];

const MESSAGE_TEMPLATES = {
  linkedin: {
    connection: "Hola {name}, me gustaría conectar contigo. Vi tu perfil como {title} en {company} y creo que podemos generar sinergias interesantes.",
    message: "Hola {name}, espero que estés bien. Quería compartirte algo que puede interesarte dado tu rol en {company}...",
    inmail: "Estimado/a {name},\n\nMe tomo la libertad de escribirte porque tu perfil como {title} en {company} coincide exactamente con el tipo de profesional que buscamos como partner.\n\n¿Podríamos agendar 15 minutos esta semana?",
  },
  twitter: {
    dm: "Hola @{name}! Vi tu contenido sobre {title} y me pareció genial. ¿Te interesaría explorar una colaboración?",
    comment: "Excelente punto sobre esto, @{name}. En nuestra experiencia con {company}s similares, hemos visto que...",
  },
  instagram: {
    dm: "Hola {name}! 👋 Vi su perfil y el trabajo que hacen en {company} es increíble. ¿Les gustaría mejorar su presencia digital?",
  },
};

export default function SocialOutreachPage() {
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showCompose, setShowCompose] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ platform: "linkedin" as SocialProfile["platform"], profileUrl: "", name: "", title: "", company: "", notes: "" });
  const [composeForm, setComposeForm] = useState({ type: "connection" as OutreachMessage["type"], content: "" });
  const [toast, setToast] = useState("");

  useEffect(() => {
    setProfiles(loadFromStorage("social_profiles", SEED_PROFILES));
    setMessages(loadFromStorage("social_messages", SEED_MESSAGES));
  }, []);

  function saveProfiles(u: SocialProfile[]) { setProfiles(u); saveToStorage("social_profiles", u); }
  function saveMessages(u: OutreachMessage[]) { setMessages(u); saveToStorage("social_messages", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function addProfile() {
    if (!addForm.name.trim()) return;
    saveProfiles([{ id: generateId(), ...addForm, followers: 0, connected: false, lastAction: "", addedAt: new Date().toISOString().split("T")[0]! }, ...profiles]);
    setAddForm({ platform: "linkedin", profileUrl: "", name: "", title: "", company: "", notes: "" });
    setShowAdd(false); notify("Perfil agregado");
  }

  function deleteProfile(id: string) { saveProfiles(profiles.filter(p => p.id !== id)); }

  function openCompose(profileId: string) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    const platform = profile.platform;
    const templates = MESSAGE_TEMPLATES[platform as keyof typeof MESSAGE_TEMPLATES];
    const firstType = Object.keys(templates || {})[0] as OutreachMessage["type"] || "message";
    const template = (templates as Record<string, string>)?.[firstType] || "";
    setComposeForm({ type: firstType, content: template.replace(/{name}/g, profile.name).replace(/{title}/g, profile.title).replace(/{company}/g, profile.company) });
    setShowCompose(profileId);
  }

  function sendMessage() {
    if (!showCompose || !composeForm.content.trim()) return;
    saveMessages([{ id: generateId(), profileId: showCompose, type: composeForm.type, content: composeForm.content, status: "sent", sentAt: new Date().toISOString().split("T")[0]! }, ...messages]);
    saveProfiles(profiles.map(p => p.id === showCompose ? { ...p, lastAction: `${composeForm.type} enviado` } : p));
    setShowCompose(null); notify("Mensaje enviado");
  }

  function exportProfiles() {
    exportToCSV(profiles.map(p => ({ nombre: p.name, plataforma: p.platform, cargo: p.title, empresa: p.company, url: p.profileUrl, seguidores: p.followers, conectado: p.connected ? "Sí" : "No", notas: p.notes })), "social-profiles");
    notify("Exportado");
  }

  const filtered = filterPlatform === "all" ? profiles : profiles.filter(p => p.platform === filterPlatform);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-brand" />Social Outreach</h1>
            <p className="text-sm text-muted-foreground">{profiles.length} perfiles · Gestiona outreach en LinkedIn, Twitter, Instagram, Facebook y TikTok</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportProfiles} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">📊 Exportar</button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Agregar perfil</button>
          </div>
        </div>

        {/* Platform filters */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <button onClick={() => setFilterPlatform("all")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filterPlatform === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todos ({profiles.length})</button>
          {Object.entries(PLATFORMS).map(([key, p]) => {
            const count = profiles.filter(pr => pr.platform === key).length;
            return <button key={key} onClick={() => setFilterPlatform(key)} className={`rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${filterPlatform === key ? "text-white" : "border hover:bg-gray-50"}`} style={filterPlatform === key ? { backgroundColor: p.color } : {}}>{p.icon} {p.label} ({count})</button>;
          })}
        </div>

        {/* Profiles list */}
        <div className="space-y-2">
          {filtered.map(profile => {
            const platform = PLATFORMS[profile.platform];
            const profileMessages = messages.filter(m => m.profileId === profile.id);
            return (
              <div key={profile.id} className="group rounded-lg border bg-white p-4 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{platform.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{profile.name}</h4>
                      {profile.connected && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-medium text-green-700">Conectado</span>}
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: platform.color + "15", color: platform.color }}>{platform.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{profile.title} · {profile.company} · {profile.followers.toLocaleString()} seguidores</p>
                    {profile.notes && <p className="text-xs mt-1 text-amber-700 bg-amber-50 rounded px-2 py-0.5 inline-block">{profile.notes}</p>}
                    {profile.lastAction && <p className="text-[10px] text-muted-foreground mt-1">Última acción: {profile.lastAction}</p>}
                    {profileMessages.length > 0 && <p className="text-[10px] text-brand mt-0.5">{profileMessages.length} mensaje(s) enviados</p>}
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openCompose(profile.id)} className="rounded p-1.5 hover:bg-blue-50 text-muted-foreground hover:text-blue-600" title="Enviar mensaje"><Send className="h-3.5 w-3.5" /></button>
                    <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground hover:text-brand" title="Abrir perfil"><ExternalLink className="h-3.5 w-3.5" /></a>
                    <button onClick={() => { navigator.clipboard.writeText(profile.profileUrl); notify("URL copiada"); }} className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground"><ClipboardCopy className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteProfile(profile.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Sin perfiles. Agrega uno para empezar.</p></div>}
      </div>

      {/* Add Profile Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-4">Agregar perfil social</h3>
            <div className="space-y-3">
              <div className="flex gap-2">{Object.entries(PLATFORMS).map(([key, p]) => <button key={key} onClick={() => setAddForm({...addForm, platform: key as SocialProfile["platform"]})} className={`rounded-lg border px-3 py-2 text-xs ${addForm.platform === key ? "border-brand bg-brand/5 font-medium" : ""}`}>{p.icon} {p.label}</button>)}</div>
              <input value={addForm.profileUrl} onChange={e => setAddForm({...addForm, profileUrl: e.target.value})} placeholder="URL del perfil" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder="Nombre *" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} placeholder="Cargo" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <input value={addForm.company} onChange={e => setAddForm({...addForm, company: e.target.value})} placeholder="Empresa" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={addForm.notes} onChange={e => setAddForm({...addForm, notes: e.target.value})} placeholder="Notas" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <button onClick={addProfile} disabled={!addForm.name.trim()} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCompose(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-4">Componer mensaje</h3>
            <div className="space-y-3">
              <select value={composeForm.type} onChange={e => setComposeForm({...composeForm, type: e.target.value as OutreachMessage["type"]})} className="w-full rounded border px-3 py-2 text-sm">
                <option value="connection">Invitación a conectar</option>
                <option value="message">Mensaje directo</option>
                <option value="inmail">InMail</option>
                <option value="dm">DM</option>
                <option value="comment">Comentario</option>
              </select>
              <textarea value={composeForm.content} onChange={e => setComposeForm({...composeForm, content: e.target.value})} rows={6} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={sendMessage} className="flex-1 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover flex items-center justify-center gap-2"><Send className="h-4 w-4" />Enviar</button>
                <button onClick={() => setShowCompose(null)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
