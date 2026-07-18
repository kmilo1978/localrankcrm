"use client";

import { Heart, MessageCircle, Repeat2, Share, ThumbsUp, TrendingUp } from "lucide-react";

const ENGAGEMENT_DATA = [
  { platform: "Instagram", icon: Heart, color: "text-pink-500", comments: 48, likes: 325, dms: 12, shares: 18, period: "Últimos 7 días" },
  { platform: "Facebook", icon: ThumbsUp, color: "text-indigo-500", comments: 32, likes: 180, dms: 8, shares: 24, period: "Últimos 7 días" },
  { platform: "LinkedIn", icon: ThumbsUp, color: "text-sky-600", comments: 15, likes: 92, dms: 22, shares: 8, period: "Últimos 7 días" },
  { platform: "X (Twitter)", icon: Heart, color: "text-gray-800", comments: 28, likes: 156, dms: 5, shares: 42, period: "Últimos 7 días" },
  { platform: "Telegram", icon: MessageCircle, color: "text-cyan-500", comments: 0, likes: 0, dms: 35, shares: 0, period: "Últimos 7 días" },
];

const RECENT_INTERACTIONS = [
  { id: "1", platform: "Instagram", type: "comment", user: "@maria.garcia", content: "¡Excelente servicio! Los recomiendo 💯", time: "Hace 2h", responded: true },
  { id: "2", platform: "Facebook", type: "comment", user: "Roberto Méndez", content: "¿Tienen disponibilidad esta semana?", time: "Hace 3h", responded: false },
  { id: "3", platform: "LinkedIn", type: "dm", user: "Ana Torres", content: "Me interesa una reunión para discutir...", time: "Hace 4h", responded: true },
  { id: "4", platform: "X", type: "mention", user: "@techstartup_co", content: "@LocalRank Gran herramienta para equipos de ventas", time: "Hace 5h", responded: false },
  { id: "5", platform: "Instagram", type: "dm", user: "@carlos.ruiz", content: "Vi su story, ¿cómo funciona el CRM?", time: "Hace 6h", responded: true },
  { id: "6", platform: "Facebook", type: "like", user: "15 personas", content: "les gustó tu publicación sobre automatización", time: "Hace 8h", responded: false },
  { id: "7", platform: "LinkedIn", type: "comment", user: "Diego Morales", content: "Interesante artículo sobre ventas B2B", time: "Ayer", responded: false },
];

const TYPE_ICONS = { comment: MessageCircle, dm: MessageCircle, like: Heart, mention: Repeat2, share: Share };
const TYPE_LABELS = { comment: "Comentario", dm: "DM", like: "Like", mention: "Mención", share: "Compartido" };

export default function SocialPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-brand" />Social Engagement</h1>
          <p className="text-sm text-muted-foreground">Comentarios, likes, DMs y menciones de todas tus redes</p>
        </div>

        {/* Platform cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ENGAGEMENT_DATA.map((p) => (
            <div key={p.platform} className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <p.icon className={`h-4 w-4 ${p.color}`} />
                <span className="text-sm font-medium">{p.platform}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div><p className="text-lg font-bold">{p.likes}</p><p className="text-[10px] text-muted-foreground">Likes</p></div>
                <div><p className="text-lg font-bold">{p.comments}</p><p className="text-[10px] text-muted-foreground">Comentarios</p></div>
                <div><p className="text-lg font-bold">{p.dms}</p><p className="text-[10px] text-muted-foreground">DMs</p></div>
                <div><p className="text-lg font-bold">{p.shares}</p><p className="text-[10px] text-muted-foreground">Shares</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent interactions */}
        <div className="rounded-lg border bg-white p-5">
          <h3 className="mb-4 font-semibold">Interacciones recientes</h3>
          <div className="space-y-2">
            {RECENT_INTERACTIONS.map((item) => {
              const Icon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] || MessageCircle;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded border px-4 py-3 hover:bg-gray-50/50">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.user}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">{item.platform}</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">{TYPE_LABELS[item.type as keyof typeof TYPE_LABELS]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${item.responded ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.responded ? "Respondido" : "Pendiente"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
