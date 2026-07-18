"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";

const HELP_CONTENT: Record<string, { title: string; desc: string; steps: string[] }> = {
  "/dashboard": { title: "Dashboard", desc: "Vista general de tu CRM con métricas clave, actividad reciente y oportunidades top.", steps: ["Revisa tus KPIs principales", "Mira la actividad reciente", "Identifica las oportunidades más importantes"] },
  "/cold-contacts": { title: "Prospección", desc: "Gestiona contactos fríos importados. Clasifícalos por score, filtra por estado web/verificación, y asigna canales de contacto.", steps: ["Importa un archivo CSV con leads", "Filtra por score, web, o verificación", "Asigna un canal de prospección", "Agrega seguimientos por cada contacto"] },
  "/contacts": { title: "Contactos", desc: "Tu base de contactos con campos personalizados, notas y recordatorios. Expande un contacto para ver todo su detalle.", steps: ["Click en '+' para agregar contacto", "Expande un contacto para ver detalles", "Agrega campos personalizados ilimitados", "Crea recordatorios con fecha"] },
  "/companies": { title: "Compañías", desc: "Empresas con campos personalizados y notas. Expande para ver detalle y agregar información.", steps: ["Crea compañías con el botón 'Nueva'", "Expande para agregar campos y notas", "Usa la búsqueda para filtrar"] },
  "/opportunities": { title: "Oportunidades", desc: "Negocios en curso con valor estimado y probabilidad. Vista de lista o board kanban.", steps: ["Crea oportunidades con valor y probabilidad", "Cambia entre vista Lista y Board", "Mueve oportunidades entre etapas"] },
  "/pipeline": { title: "Pipeline", desc: "Vista kanban de tu pipeline de ventas. Arrastra tarjetas entre columnas para mover leads de etapa.", steps: ["Arrastra leads entre columnas", "Agrega nuevos leads con el botón '+'", "Cada columna representa una etapa del proceso"] },
  "/inbox": { title: "Conversaciones", desc: "Bandeja omnicanal: WhatsApp, Email, Instagram, LinkedIn, Telegram, TikTok y más. Conecta canales y gestiona todas las conversaciones.", steps: ["Click 'Conectar' para vincular canales", "Selecciona una conversación para chatear", "Usa el botón '+' para crear nueva conversación", "Toggle 'IA' para activar respuestas automáticas"] },
  "/proposals": { title: "Propuestas", desc: "Crea propuestas profesionales con plantillas, logo, firma, media y exporta a PDF.", steps: ["Elige una plantilla o crea desde cero", "Agrega secciones, media y botones", "Vista previa antes de enviar", "Exporta como PDF para el cliente"] },
  "/templates": { title: "Plantillas", desc: "Mensajes predefinidos con programación, secuencias automáticas, y métricas de éxito.", steps: ["Crea plantilla con variables {{nombre}}", "Programa envío con fecha y hora", "Activa secuencias para follow-up automático", "Revisa las métricas de cada plantilla"] },
  "/tasks": { title: "Tareas", desc: "Gestiona tareas por prioridad y estado. Click en el ícono circular para cambiar estado.", steps: ["Crea tareas con prioridad y fecha", "Click en ⭕ para cambiar estado", "Filtra por Pendientes, En progreso, Completadas"] },
  "/todo": { title: "To-Do", desc: "Organiza tu trabajo diario, semanal y mensual en 3 columnas con barras de progreso.", steps: ["Agrega tareas en la columna correspondiente", "Marca como completadas con el checkbox", "Usa 'Limpiar ✓' para eliminar las hechas"] },
  "/calendar": { title: "Calendario", desc: "Agenda con múltiples calendarios, citas, recordatorios de cobro y vista mensual.", steps: ["Crea calendarios con colores", "Click en un día para ver/agregar eventos", "Programa citas, cobros y recordatorios", "Usa 'Nueva cita' para el formulario completo"] },
  "/analytics": { title: "Analytics", desc: "KPIs de ventas, embudo de conversión, rendimiento por representante y actividad por canal.", steps: ["Revisa los KPIs principales arriba", "Analiza el embudo de conversión", "Compara rendimiento entre representantes"] },
  "/forms": { title: "Formularios", desc: "Conecta formularios externos (Tally, Typeform) o crea los tuyos. Las respuestas se organizan automáticamente.", steps: ["Conecta un formulario externo con webhook", "O crea uno con el builder (manual o IA)", "Las respuestas llegan organizadas aquí", "Cambia el estado de cada respuesta"] },
  "/import": { title: "Importar & Enriquecer", desc: "Sube archivos CSV para importar datos y enriquécelos automáticamente con email, redes sociales y más.", steps: ["Sube un archivo CSV o TSV", "Selecciona qué datos enriquecer", "Click 'Enriquecer' individual o en batch", "Exporta a Contactos o Propuestas"] },
  "/workspaces": { title: "Espacios de trabajo", desc: "Organiza proyectos por cliente con carpetas, subcarpetas y archivos. Asigna responsables.", steps: ["Crea clientes en el sidebar", "Crea workspaces asignados a un cliente", "Agrega carpetas y subcarpetas", "Sube archivos dentro de cada carpeta"] },
  "/team": { title: "Equipo", desc: "Gestiona miembros, roles, permisos y delega trabajo. Invita por email.", steps: ["Invita miembros por email", "Asigna roles (Admin, Manager, Miembro, Viewer)", "Delega tareas y contactos", "Revisa permisos en la tabla de abajo"] },
  "/team-chat": { title: "Chat del Equipo", desc: "Conversaciones internas entre miembros del equipo. Canales públicos, privados y mensajes directos. Comparte documentos de forma segura.", steps: ["Crea canales públicos o privados", "Invita miembros específicos a cada canal", "Envía mensajes y adjunta documentos", "Los canales privados solo los ven los invitados", "Usa mensajes directos para conversaciones 1:1"] },
  "/social": { title: "Social Engagement", desc: "Monitorea comentarios, likes, DMs y menciones de todas tus redes sociales.", steps: ["Revisa métricas por plataforma", "Responde a las interacciones pendientes", "Identifica oportunidades de engagement"] },
  "/omnichannel": { title: "Omnicanal", desc: "Dashboard unificado de todos tus canales de comunicación con métricas y actividad.", steps: ["Ve el estado de cada canal conectado", "Identifica canales con mensajes sin leer", "Revisa la actividad reciente cross-channel"] },
  "/labels": { title: "Etiquetas", desc: "Crea etiquetas ilimitadas con colores para organizar contactos, empresas y oportunidades.", steps: ["Crea etiquetas con nombre y color", "Usa el color hex para personalizar", "Asigna etiquetas en contactos y pipeline"] },
  "/notes": { title: "Notas", desc: "Notas con categorías personalizadas y colores. Fija las importantes arriba.", steps: ["Crea categorías con colores personalizados", "Agrega notas con categoría y relación", "Fija notas importantes con el pin", "Filtra por categoría"] },
};

export function PageHelp() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Find help for current path (strip /preview prefix)
  const cleanPath = pathname.replace("/preview", "");
  const help = HELP_CONTENT[cleanPath];

  if (!help) return null;

  return (
    <div className="fixed bottom-6 left-[270px] z-50">
      {open && (
        <div className="absolute bottom-14 left-0 w-80 rounded-lg border bg-white p-5 shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold">{help.title}</h4>
            <button onClick={() => setOpen(false)} className="rounded p-0.5 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{help.desc}</p>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Pasos:</p>
            {help.steps.map((step, i) => (
              <p key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">{i + 1}</span>
                {step}
              </p>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${open ? "bg-brand text-white" : "bg-white border text-brand hover:bg-brand/5"}`} title="Ayuda de esta sección">
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
