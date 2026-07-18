"use client";

import { BarChart3, DollarSign, MessageSquare, Target, TrendingDown, TrendingUp, Users } from "lucide-react";

const STATS = [
  { label: "Ingresos (30d)", value: "$48,500", change: "+18%", up: true, icon: DollarSign, color: "bg-green-50 text-green-600" },
  { label: "Deals cerrados", value: "12", change: "+4 vs anterior", up: true, icon: Target, color: "bg-blue-50 text-blue-600" },
  { label: "Conversaciones", value: "156", change: "+23%", up: true, icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
  { label: "Tasa de cierre", value: "34%", change: "-2%", up: false, icon: BarChart3, color: "bg-amber-50 text-amber-600" },
];

const REP_PERFORMANCE = [
  { name: "Juan Pérez", deals: 5, revenue: "$22,000", conversations: 45, responseTime: "8 min", conversionRate: "38%" },
  { name: "Ana López", deals: 4, revenue: "$18,500", conversations: 38, responseTime: "5 min", conversionRate: "42%" },
  { name: "María Gómez", deals: 3, revenue: "$8,000", conversations: 52, responseTime: "12 min", conversionRate: "24%" },
];

const FUNNEL_DATA = [
  { stage: "Leads nuevos", count: 85, pct: 100, color: "bg-gray-200" },
  { stage: "Contactados", count: 62, pct: 73, color: "bg-blue-300" },
  { stage: "Interesados", count: 38, pct: 45, color: "bg-purple-300" },
  { stage: "Propuesta enviada", count: 22, pct: 26, color: "bg-amber-300" },
  { stage: "Negociación", count: 15, pct: 18, color: "bg-pink-300" },
  { stage: "Cerrado ganado", count: 12, pct: 14, color: "bg-green-400" },
];

const ACTIVITY_DAILY = [
  { day: "Lun", msgs: 42, deals: 2 }, { day: "Mar", msgs: 58, deals: 1 },
  { day: "Mié", msgs: 35, deals: 3 }, { day: "Jue", msgs: 67, deals: 2 },
  { day: "Vie", msgs: 51, deals: 4 }, { day: "Sáb", msgs: 18, deals: 0 },
  { day: "Dom", msgs: 8, deals: 0 },
];

const CHANNELS_STATS = [
  { name: "WhatsApp", conversations: 68, percentage: 44 },
  { name: "Email", conversations: 32, percentage: 21 },
  { name: "Instagram", conversations: 24, percentage: 15 },
  { name: "LinkedIn", conversations: 18, percentage: 12 },
  { name: "Telegram", conversations: 8, percentage: 5 },
  { name: "Otros", conversations: 6, percentage: 3 },
];

export default function AnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-brand" />Analytics</h1>
          <p className="text-sm text-muted-foreground">Últimos 30 días · Rendimiento de ventas y actividad</p>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                  <p className={`mt-0.5 text-xs flex items-center gap-0.5 ${s.up ? "text-green-600" : "text-red-500"}`}>
                    {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{s.change}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Funnel */}
          <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Embudo de ventas</h3>
            <div className="space-y-2">
              {FUNNEL_DATA.map((f) => (
                <div key={f.stage} className="flex items-center gap-3">
                  <span className="w-36 text-xs truncate">{f.stage}</span>
                  <div className="flex-1 h-6 rounded bg-gray-100 overflow-hidden">
                    <div className={`h-6 ${f.color} flex items-center px-2 transition-all`} style={{ width: `${f.pct}%` }}>
                      <span className="text-[10px] font-bold text-white">{f.count}</span>
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly activity */}
          <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Actividad semanal</h3>
            <div className="flex items-end gap-2 h-40">
              {ACTIVITY_DAILY.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-t bg-brand/20" style={{ height: `${(d.msgs / 70) * 100}px` }}>
                      <div className="w-full rounded-t bg-brand" style={{ height: `${(d.deals / 4) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  <span className="text-[9px] text-muted-foreground">{d.msgs} msg</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-brand" />Deals</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-brand/20" />Mensajes</span>
            </div>
          </div>

          {/* Rep performance */}
          <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Rendimiento por representante</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Rep</th>
                  <th className="pb-2 text-center text-xs font-medium text-muted-foreground">Deals</th>
                  <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Ingresos</th>
                  <th className="pb-2 text-center text-xs font-medium text-muted-foreground">Convos</th>
                  <th className="pb-2 text-center text-xs font-medium text-muted-foreground">T. Resp</th>
                  <th className="pb-2 text-center text-xs font-medium text-muted-foreground">Conv%</th>
                </tr></thead>
                <tbody>
                  {REP_PERFORMANCE.map((r) => (
                    <tr key={r.name} className="border-b last:border-0">
                      <td className="py-2 text-sm font-medium">{r.name}</td>
                      <td className="py-2 text-center text-sm">{r.deals}</td>
                      <td className="py-2 text-right text-sm font-semibold text-brand">{r.revenue}</td>
                      <td className="py-2 text-center text-sm">{r.conversations}</td>
                      <td className="py-2 text-center text-sm">{r.responseTime}</td>
                      <td className="py-2 text-center text-sm">{r.conversionRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Channels breakdown */}
          <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Conversaciones por canal</h3>
            <div className="space-y-3">
              {CHANNELS_STATS.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-20 text-xs">{c.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100">
                    <div className="h-3 rounded-full bg-brand" style={{ width: `${c.percentage}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs text-muted-foreground">{c.conversations} ({c.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
