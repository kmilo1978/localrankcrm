"use client";

import {
  Building2,
  CheckSquare,
  DollarSign,
  MessageSquare,
  Target,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";

const STATS = [
  { label: "Compañías", value: "24", icon: Building2, change: "+3 esta semana", color: "bg-blue-50 text-blue-600" },
  { label: "Personas", value: "156", icon: UserCircle, change: "+12 este mes", color: "bg-purple-50 text-purple-600" },
  { label: "Oportunidades", value: "18", icon: Target, change: "$245K pipeline", color: "bg-green-50 text-green-600" },
  { label: "Tareas pendientes", value: "7", icon: CheckSquare, change: "3 vencen hoy", color: "bg-amber-50 text-amber-600" },
  { label: "Conversaciones", value: "42", icon: MessageSquare, change: "5 sin responder", color: "bg-pink-50 text-pink-600" },
  { label: "Ingresos mes", value: "$32.5K", icon: DollarSign, change: "+15% vs anterior", color: "bg-emerald-50 text-emerald-600" },
];

const RECENT_ACTIVITY = [
  { type: "deal", text: "Nueva oportunidad: Contrato Enterprise con TechCorp", time: "Hace 2h" },
  { type: "task", text: "Tarea completada: Enviar propuesta a MediaGroup", time: "Hace 3h" },
  { type: "contact", text: "Nuevo contacto: María García — LogiNext", time: "Hace 5h" },
  { type: "message", text: "Mensaje de WhatsApp: Carlos Ruiz respondió a cotización", time: "Hace 6h" },
  { type: "note", text: "Nota añadida: Seguimiento reunión con InnovateLab", time: "Ayer" },
  { type: "deal", text: "Oportunidad cerrada ganada: Paquete Premium — $12K", time: "Ayer" },
];

const TOP_OPPORTUNITIES = [
  { name: "Contrato Enterprise TechCorp", value: "$85,000", stage: "Negociación", probability: 75 },
  { name: "Licencia Anual MediaGroup", value: "$45,000", stage: "Propuesta", probability: 60 },
  { name: "Implementación LogiNext", value: "$32,000", stage: "Calificación", probability: 40 },
  { name: "Consultoría InnovateLab", value: "$28,000", stage: "Descubrimiento", probability: 25 },
];

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen general de tu CRM</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Actividad reciente</h3>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Opportunities */}
          <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4 w-4 text-brand" />
              Top oportunidades
            </h3>
            <div className="space-y-3">
              {TOP_OPPORTUNITIES.map((opp) => (
                <div key={opp.name} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opp.name}</span>
                    <span className="text-sm font-bold text-brand">{opp.value}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{opp.stage}</span>
                    <div className="flex-1">
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-brand"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
