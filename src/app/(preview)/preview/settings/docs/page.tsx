"use client";
import { useState } from "react";
import { Book, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

type DocEntry = { title: string; description: string; features: string[]; href: string; category: string };

const DOCS: DocEntry[] = [
  // --- Context ---
  { title: "Dashboard", description: "Vista general del CRM con KPIs, actividad reciente y oportunidades top.", features: ["KPIs de ventas", "Actividad reciente", "Oportunidades top", "Tareas pendientes"], href: "/preview/dashboard", category: "General" },
  { title: "Workspaces", description: "Organiza proyectos por cliente con carpetas, subcarpetas y archivos.", features: ["Crear clientes", "Workspaces por cliente", "Carpetas y subcarpetas", "Asignar responsable", "Subir archivos"], href: "/preview/workspaces", category: "General" },
  // --- Revenue ---
  { title: "Prospeccion", description: "Contactos frios con scoring, import CSV, filtros avanzados y canales de outreach.", features: ["Import CSV", "Score automatico", "Filtros por web/verificacion/GMB", "Canal de outreach", "Follow-ups"], href: "/preview/cold-contacts", category: "Revenue" },
  { title: "Contactos", description: "Base de contactos con campos personalizados ilimitados, notas, recordatorios y edicion inline.", features: ["Campos custom ilimitados", "Notas por contacto", "Recordatorios con fecha", "Edicion inline", "Archivar/Restaurar"], href: "/preview/contacts", category: "Revenue" },
  { title: "Companias", description: "Empresas con campos custom, notas y subcarpetas organizativas.", features: ["Campos personalizados", "Notas por empresa", "Busqueda rapida"], href: "/preview/companies", category: "Revenue" },
  { title: "Oportunidades", description: "Deals con valor y probabilidad. Vista board kanban + lista. Drag-and-drop entre etapas.", features: ["Vista Board (Kanban)", "Vista Lista", "Drag & drop entre etapas", "Mover con flechas", "Editar modal", "Duplicar", "Copiar datos"], href: "/preview/opportunities", category: "Revenue" },
  { title: "Pipeline", description: "Kanban drag-and-drop con 6+ etapas personalizables para leads.", features: ["Drag & drop", "Agregar leads", "Editar en modal", "Mover de etapa", "Duplicar lead"], href: "/preview/pipeline", category: "Revenue" },
  { title: "Conversaciones", description: "Bandeja omnicanal: WhatsApp (x3), Email, Instagram, Facebook, LinkedIn, Telegram, TikTok y mas.", features: ["WhatsApp x3 lineas + Coexistencia", "Email, Instagram, Facebook", "LinkedIn, X, Telegram, TikTok", "SMS, Gmail, Reddit, Quora", "Adjuntos", "Toggle IA"], href: "/preview/inbox", category: "Revenue" },
  { title: "Plantillas", description: "Templates con scheduling, secuencias, botones, media, pre-aprobacion y metricas.", features: ["Variables {{nombre}}", "Programar envio", "Secuencias automaticas", "Pre-aprobacion", "Media (imagen/video/audio)", "Metricas de exito", "Subir base de datos CSV"], href: "/preview/templates", category: "Revenue" },
  { title: "Propuestas", description: "Editor de secciones con logo, firma, media, embed, exportacion PDF y UTM.", features: ["Editor por secciones", "Logo y firma", "Imagenes, video, audio", "Embed (Cal.com, YouTube)", "Exportar PDF", "UTM y contrasena", "Canales de envio"], href: "/preview/proposals", category: "Revenue" },
  { title: "Cartera", description: "Facturas, cuentas por cobrar, vencimientos, pagos, recordatorios y acuerdos.", features: ["Facturas", "Cuentas por cobrar", "Vencimientos", "Pagos recibidos", "Recordatorios de cobro", "Acuerdos de pago", "Historial de cobranza"], href: "/preview/cartera", category: "Revenue" },
  // --- Execution ---
  { title: "Tareas", description: "Gestion por prioridad y estado con modal de edicion, duplicar, copiar/pegar.", features: ["Crear tareas", "Editar en modal", "Cambiar estado/prioridad", "Duplicar tarea", "Copiar como JSON", "Pegar desde portapapeles"], href: "/preview/tasks", category: "Ejecucion" },
  { title: "Proyectos", description: "Project Tracker con hitos, tareas, progreso, equipo y colores.", features: ["Crear proyectos", "Hitos con fecha", "Tareas por proyecto", "Barra de progreso automatica", "Asignar equipo", "Editar estado"], href: "/preview/projects", category: "Ejecucion" },
  { title: "Checklists", description: "Listas reutilizables con items. Pega texto y se convierte en checklist automaticamente.", features: ["Pegar lista (auto-split por ' - ' o lineas)", "Asignar a cliente", "Duplicar para otro cliente", "Copiar como texto", "Reiniciar items", "Progreso visual"], href: "/preview/checklists", category: "Ejecucion" },
  { title: "To-Do", description: "Organizacion diaria, semanal y mensual con barras de progreso.", features: ["3 columnas (hoy/semana/mes)", "Barras de progreso", "Marcar completadas", "Limpiar completadas"], href: "/preview/todo", category: "Ejecucion" },
  { title: "Calendario", description: "Agenda con multiples calendarios, citas, cobros y vista mensual.", features: ["Multiples calendarios con colores", "Vista mensual", "Citas y recordatorios", "Cobros programados"], href: "/preview/calendar", category: "Ejecucion" },
  // --- Intelligence ---
  { title: "Analytics", description: "KPIs de ventas, embudo de conversion, rendimiento por representante y canal.", features: ["KPIs 30 dias", "Funnel de ventas", "Rendimiento por rep", "Actividad por canal"], href: "/preview/analytics", category: "Inteligencia" },
  { title: "IA & Automatizacion", description: "Agente conversacional, resumenes automaticos, drafts IA y scoring predictivo.", features: ["Agente IA", "Resumenes por contacto", "Drafts con confianza %", "Scoring predictivo"], href: "/preview/ai-hub", category: "Inteligencia" },
  { title: "Automatizaciones", description: "Constructor visual: 10 triggers x 12 acciones x condiciones. Logs de ejecucion.", features: ["Constructor visual", "10 tipos de trigger", "12 tipos de accion", "Condiciones con operadores", "Logs de ejecucion", "Activar/Desactivar"], href: "/preview/automations", category: "Inteligencia" },
  { title: "Secuencias", description: "Cadenas multicanal (Email, WhatsApp, LinkedIn, SMS, Llamada) con delays y stop-on-reply.", features: ["Multi-canal", "Delays configurables", "Stop on reply", "Ramificaciones", "Metricas por paso"], href: "/preview/sequences", category: "Inteligencia" },
  { title: "Lead Routing", description: "Asignacion automatica: Round Robin, menos cargado, por reglas.", features: ["Round Robin", "Menos cargado", "Reglas por fuente/score/canal", "Historial de asignaciones"], href: "/preview/lead-routing", category: "Inteligencia" },
  { title: "Scoring", description: "Motor de puntuacion: ICP match, engagement, completitud y senales de intencion.", features: ["Score ICP", "Score engagement", "Completitud de datos", "Senales de intencion", "Pesos configurables"], href: "/preview/scoring", category: "Inteligencia" },
  { title: "Scheduler", description: "Tareas programadas: follow-ups, re-engagement, recordatorios y limpieza.", features: ["Follow-ups automaticos", "Re-engagement", "Recordatorios", "Limpieza de datos", "Reportes programados"], href: "/preview/scheduler", category: "Inteligencia" },
  { title: "Auditoria", description: "Logs de todo: quien hizo que, workflows ejecutados, errores.", features: ["Historial de cambios", "Workflows ejecutados", "Errores y fallos", "Filtros por tipo/usuario/fecha"], href: "/preview/audit", category: "Inteligencia" },
  // --- Secondary ---
  { title: "Omnicanal", description: "Dashboard unificado de todos los canales de comunicacion con metricas.", features: ["Status por canal", "Mensajes sin leer", "Actividad cross-channel"], href: "/preview/omnichannel", category: "Canales" },
  { title: "Social", description: "Monitoreo de engagement: likes, comments, DMs, menciones por plataforma.", features: ["Metricas por red social", "Interacciones pendientes", "Oportunidades de engagement"], href: "/preview/social", category: "Canales" },
  { title: "Radar", description: "Captura paginas web con la extension, organiza por carpetas y etiquetas.", features: ["Extension Chrome", "Carpetas y etiquetas", "Score de prospeccion", "Copiar/Pegar datos", "Exportar CSV/JSON", "Sync con CRM"], href: "/preview/radar", category: "Canales" },
  { title: "Notas", description: "Notas con categorias, colores, fijadas. Click para ver completa, editar, clonar.", features: ["Categorias con colores", "Fijar notas", "Ver nota completa (modal)", "Editar", "Clonar", "Copiar texto/JSON"], href: "/preview/notes", category: "Herramientas" },
  { title: "Equipo", description: "Miembros, roles, permisos granulares, invitaciones y delegacion.", features: ["Roles (Owner/Admin/Manager/Member/Viewer)", "20 permisos granulares", "Invitar por email", "Delegar tareas"], href: "/preview/team", category: "Herramientas" },
  { title: "Chat Interno", description: "Conversaciones entre miembros: canales publicos/privados, DMs, documentos.", features: ["Canales publicos", "Canales privados", "Mensajes directos", "Adjuntar documentos", "Fijar mensajes", "Invitar miembros"], href: "/preview/team-chat", category: "Herramientas" },
  { title: "Boveda", description: "Almacena contrasenas, API keys y credenciales protegidas con clave maestra.", features: ["Clave maestra", "Categorias (API, Servicio, Hosting...)", "Mostrar/ocultar clave", "Copiar con un click", "Bloquear boveda"], href: "/preview/vault", category: "Herramientas" },
  { title: "Formularios", description: "Conecta formularios externos o crea los tuyos. Respuestas organizadas.", features: ["Conectar Tally/Typeform/JotForm", "Builder manual", "Generador IA", "Respuestas organizadas"], href: "/preview/forms", category: "Herramientas" },
  { title: "Importar", description: "Sube CSV para importar datos y enriquecelos con email, redes y mas.", features: ["Upload CSV/TSV", "Enriquecimiento automatico", "Email, social, tech", "Exportar a Contactos"], href: "/preview/import", category: "Herramientas" },
  { title: "Etiquetas", description: "Etiquetas ilimitadas con colores para organizar contactos y oportunidades.", features: ["Colores personalizados", "Hex custom", "Asignar a contactos/pipeline"], href: "/preview/labels", category: "Herramientas" },
  // --- Extension ---
  { title: "Extension Chrome (Radar)", description: "Analiza paginas web, extrae datos de negocios y sincroniza con el CRM.", features: ["Analisis automatico de paginas", "Extraer nombre/telefono/email/redes", "Score de prospeccion", "Auto-fill formularios", "Copiar datos", "Sync con CRM", "IA de prospeccion"], href: "/preview/radar", category: "Extension" },
];

const CATEGORIES_ORDER = ["General", "Revenue", "Ejecucion", "Inteligencia", "Canales", "Herramientas", "Extension"];

export default function DocsPage() {
  const [search, setSearch] = useState("");

  const filtered = DOCS.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.features.some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = CATEGORIES_ORDER.map(cat => ({
    category: cat,
    items: filtered.filter(d => d.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2"><Book className="h-5 w-5 text-brand" />Documentacion</h3>
        <p className="text-sm text-muted-foreground">Biblioteca completa de todos los modulos y funcionalidades del CRM. Busca por nombre o caracteristica.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar modulo, funcion o caracteristica..." className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>

      {/* Grouped modules */}
      <div className="space-y-8">
        {grouped.map(group => (
          <div key={group.category}>
            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 border-b pb-2">{group.category}</h4>
            <div className="space-y-3">
              {group.items.map(doc => (
                <div key={doc.href} className="rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-semibold">{doc.title}</h5>
                        <Link href={doc.href} className="flex items-center gap-1 text-[10px] text-brand hover:underline"><ExternalLink className="h-2.5 w-2.5" />Ir al modulo</Link>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.features.map((f, i) => (
                          <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-[9px] text-gray-600">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">No se encontraron resultados para "{search}"</div>
      )}

      {/* Stats */}
      <div className="mt-8 rounded-lg border border-dashed bg-gray-50 p-4 text-center">
        <p className="text-xs text-muted-foreground">{DOCS.length} modulos documentados · {DOCS.reduce((s, d) => s + d.features.length, 0)} funcionalidades · Busca por nombre o caracteristica</p>
      </div>
    </div>
  );
}
