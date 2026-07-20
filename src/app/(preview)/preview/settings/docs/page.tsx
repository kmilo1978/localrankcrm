"use client";
import { useState } from "react";
import { Book, ChevronDown, ExternalLink, HelpCircle, Search } from "lucide-react";

type DocSection = {
  category: string;
  modules: { title: string; description: string; howTo: string[]; tips: string[] }[];
};

const DOCUMENTATION: DocSection[] = [
  { category: "🔍 Prospección", modules: [
    { title: "Radar", description: "Captura páginas web mientras navegas con la extensión de Chrome. Organiza leads por carpetas y etiquetas.", howTo: ["Instala la extensión desde Chrome Web Store", "Navega a una página de interés y haz clic en el ícono de Radar", "Los datos se sincronizan automáticamente al CRM", "Edita cada clip para agregar email, teléfono y notas", "Envía directamente al Pipeline con un clic"], tips: ["Usa carpetas para organizar por tipo de lead", "El botón 'Sync ext' trae los datos más recientes de la extensión"] },
    { title: "Lead Finder B2B", description: "Encuentra leads verificados por cargo, industria y ubicación. Búsqueda con IA en lenguaje natural.", howTo: ["Escribe una descripción de tu lead ideal (ej: 'CTOs de tech en Colombia')", "O usa los filtros avanzados para buscar por industria/cargo/ubicación", "Selecciona los leads que te interesan con los checkboxes", "Exporta a CSV o envía directamente a Contactos/Pipeline"], tips: ["La búsqueda IA entiende lenguaje natural — sé específico", "Los leads con score verde (85+) son los más probables de convertir"] },
    { title: "Email Finder", description: "Encuentra, verifica, genera y limpia emails para prospección.", howTo: ["Tab Finder: ingresa nombre + dominio → genera emails probables", "Tab Verificar: pega una lista de emails → valida formato y dominio", "Tab Escritor IA: selecciona tipo de email y tono → genera borrador", "Tab Limpiar: pega tu lista → elimina duplicados e inválidos"], tips: ["Los emails con confianza 30%+ son los más probables", "El verificador detecta typos comunes (gmial → gmail)"] },
    { title: "Enriquecimiento", description: "Templates para encontrar datos adicionales de empresas y contactos.", howTo: ["Selecciona un template (Email Finder, Company Info, Tech Stack...)", "Llena los campos requeridos", "Haz clic en Ejecutar", "Para resultados reales, conecta Composio en Ajustes → Conectores"], tips: ["Funciona mejor con dominios corporativos", "Combina varios templates para un perfil completo"] },
    { title: "Atribución de Leads", description: "Este módulo es el punto central de atribución: aquí se consolida el origen de cada lead y desde aquí medimos qué canales realmente generan clientes.", howTo: ["Cada lead se crea con campos de origen: utm_source, utm_medium, utm_campaign, utm_content, utm_term y canal limpio (Paid Search, Paid Social, Orgánico, Referral, Directo)", "El CRM mantiene ese origen a lo largo de todo el funnel (Lead → MQL → Oportunidad → Cliente)", "Los cambios de etapa se envían a Google Ads/Meta como conversiones offline", "En Ajustes → Pixels & UTM configura tus IDs de tracking", "El Generador UTM crea links con parámetros para tus campañas"], tips: ["Los campos UTM se capturan automáticamente de formularios y landing pages", "Cuando un lead pasa a Cliente, esa venta se atribuye a su campaña original", "Puedes ver qué campañas generan leads vs cuáles generan clientes reales", "El canal original nunca se pierde aunque el lead vuelva días después"] },
  ]},
  { category: "💼 CRM & Ventas", modules: [
    { title: "Contactos", description: "Gestiona tu base de contactos con campos personalizados, notas, recordatorios y detección de duplicados.", howTo: ["Crea contactos con el botón 'Nuevo'", "Expande un contacto para ver/editar todos sus datos", "Agrega campos personalizados para información extra", "Usa 'Duplicados' para detectar y fusionar registros repetidos", "Transfiere contactos a Prospección con el botón ↔"], tips: ["Los recordatorios se disparan automáticamente a la hora programada", "Puedes subir foto de perfil para cada contacto"] },
    { title: "Pipeline", description: "Kanban drag-and-drop para gestionar tu embudo de ventas.", howTo: ["Arrastra leads entre columnas para moverlos de etapa", "Crea leads con el botón 'Nuevo lead'", "Edita haciendo clic en cualquier tarjeta", "Duplica o copia leads con los botones de hover"], tips: ["Las etapas son personalizables", "Los leads importados desde Radar/Prospección llegan a 'Nuevo'"] },
    { title: "Tareas", description: "Gestión de tareas con 4 vistas: Lista (con drag-and-drop), Kanban, Calendario y Tablero.", howTo: ["Cambia de vista con los botones superiores", "En vista Lista puedes arrastrar para reordenar", "En vista Kanban las columnas son por estado", "En vista Calendario las tareas aparecen por fecha", "Haz clic en una tarea para editarla"], tips: ["Las tareas se pueden pegar desde el portapapeles (JSON)", "El botón 'Duplicar' crea una copia rápida"] },
  ]},
  { category: "💬 Conversaciones", modules: [
    { title: "Inbox", description: "Centro de conversaciones omnicanal. Todos los mensajes en un solo lugar.", howTo: ["Selecciona una conversación de la lista izquierda", "Escribe tu mensaje y envía", "El badge rojo muestra mensajes sin leer", "Usa plantillas para respuestas rápidas"], tips: ["La IA puede responder automáticamente si está configurada", "Las conversaciones se ordenan por última actividad"] },
    { title: "Plantillas", description: "Templates predefinidos para WhatsApp, Email y otros canales.", howTo: ["Crea plantillas con variables dinámicas", "Asigna botones de acción (URL, teléfono, respuesta)", "Envía plantillas desde cualquier conversación"], tips: ["Las plantillas de WhatsApp requieren aprobación de Meta", "Usa variables como {nombre} para personalizar"] },
  ]},
  { category: "🤖 Automatización & IA", modules: [
    { title: "Constructor IA", description: "Dile a la IA qué hacer en lenguaje natural y lo ejecuta en el módulo correcto.", howTo: ["Escribe lo que quieres hacer (ej: 'Crea una tarea para llamar a Carlos mañana')", "La IA detecta automáticamente si es una tarea, nota, email, etc.", "Selecciona un agente específico (Ventas, Soporte, Marketing...)", "Si tienes OpenRouter configurado, usa modelos reales"], tips: ["Sé específico en tus instrucciones para mejores resultados", "Los agentes tienen personalidades distintas — elige el adecuado", "Sin API key funciona en modo local (respuestas predefinidas)"] },
    { title: "Automatizaciones", description: "Reglas automáticas: cuando pasa X → ejecuta Y.", howTo: ["Crea una automatización con nombre y trigger", "Agrega condiciones (si lead_score > 80...)", "Agrega acciones (enviar WhatsApp, crear tarea, mover etapa...)", "Activa/desactiva con el toggle ON/OFF"], tips: ["Revisa los logs para ver ejecuciones y errores", "Combina múltiples acciones en secuencia"] },
  ]},
  { category: "📋 Operación", modules: [
    { title: "Notas", description: "Notas con etiquetas compartidas, múltiples vistas y opción de enviar a recordatorio.", howTo: ["Crea notas con título, contenido e imagen", "Asigna etiquetas del sistema compartido", "Cambia entre vistas: Grid, Lista o Board (por categoría)", "Usa el botón 'Recordatorio' para programar un aviso"], tips: ["Las etiquetas son compartidas con todos los módulos del CRM", "Puedes importar etiquetas de otros módulos"] },
    { title: "Checklists", description: "Listas de verificación con bloqueo, etiquetas, proyectos y reordenamiento.", howTo: ["Crea un checklist con título, cliente y categoría", "Agrega items uno a uno o pega una lista completa", "Bloquea con el candado para evitar cambios accidentales", "Usa ↑↓ para reordenar las cards"], tips: ["Puedes clonar checklists para reutilizar con otros clientes", "Las etiquetas del CRM se pueden asignar al crear"] },
    { title: "Focus", description: "Modo Pomodoro para concentrarte en una tarea a la vez.", howTo: ["Selecciona duración (15/25/45/60 min)", "Escribe en qué te enfocas", "Presiona 'Iniciar' para arrancar el timer", "Agrega tareas de enfoque y usa 'Enfocar' para vincularlas al timer"], tips: ["El historial muestra cuántas sesiones completaste hoy", "Marca tareas como completadas cuando termines"] },
  ]},
  { category: "👥 Equipo & Espacios", modules: [
    { title: "Workspace", description: "Espacios de trabajo aislados. Cada uno tiene sus propios datos, carpetas y claves.", howTo: ["Crea un workspace nuevo con nombre y cliente", "Selecciona un workspace para activarlo (los datos cambian)", "Usa la bóveda de claves (🔑) para guardar API keys por espacio", "Renombra con el botón ✏️", "Para eliminar, escribe el nombre en MAYÚSCULAS"], tips: ["Cada workspace tiene datos independientes (contactos, notas, etc.)", "Las etiquetas y equipo son globales (compartidos)", "Hay un límite configurable de espacios (default: 10)"] },
    { title: "Bóveda", description: "Gestor de credenciales protegido con clave maestra.", howTo: ["Configura tu clave maestra la primera vez", "Agrega credenciales con título, usuario y contraseña", "Usa el generador de claves para crear passwords seguros", "Copia con un clic sin mostrar la contraseña completa"], tips: ["La bóveda se bloquea automáticamente", "El generador usa crypto.getRandomValues (criptográficamente seguro)", "Se activa blur por defecto para proteger la pantalla"] },
  ]},
  { category: "⚙️ Configuración", modules: [
    { title: "Tema claro/oscuro", description: "Cambia entre tema claro y oscuro con un solo clic.", howTo: ["Usa el ícono de sol/luna en la parte superior del sidebar", "O ve a Ajustes → Apariencia para más opciones"], tips: ["También puedes usar 'Sistema' para que siga tu preferencia del SO"] },
    { title: "MCP (IA externa)", description: "Conecta herramientas de IA externas como Hermes, OpenClaw o Composio.", howTo: ["Ve a Ajustes → MCP", "Agrega un servidor de los populares con un clic", "O agrega uno personalizado con comando y argumentos"], tips: ["Hermes Agent conecta Telegram, Discord, Slack", "OpenClaw conecta WhatsApp, Teams, iMessage", "Composio conecta 250+ apps con una sola API key"] },
  ]},
];

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(DOCUMENTATION[0]?.category || null);

  const filtered = search.trim()
    ? DOCUMENTATION.map(s => ({ ...s, modules: s.modules.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase())) })).filter(s => s.modules.length > 0)
    : DOCUMENTATION;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Book className="h-5 w-5 text-brand" />Documentación</h3>
        <p className="mt-1 text-sm text-muted-foreground">Guía completa de cada módulo del CRM. Aprende cómo usar cada funcionalidad.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en documentación..." className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:outline-none" />
      </div>

      {/* Sections */}
      {filtered.map(section => (
        <div key={section.category} className="rounded-lg border bg-white overflow-hidden">
          <button onClick={() => setExpandedCat(expandedCat === section.category ? null : section.category)} className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 text-left">
            <h4 className="text-sm font-bold">{section.category}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{section.modules.length} módulos</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCat === section.category ? "rotate-180" : ""}`} />
            </div>
          </button>
          {expandedCat === section.category && (
            <div className="border-t divide-y">
              {section.modules.map(mod => (
                <div key={mod.title} className="px-5 py-4">
                  <h5 className="text-sm font-semibold mb-1">{mod.title}</h5>
                  <p className="text-xs text-muted-foreground mb-3">{mod.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-brand mb-1.5">Cómo usar</p>
                      <ol className="space-y-1">
                        {mod.howTo.map((step, i) => (
                          <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[9px] font-bold text-brand">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    {mod.tips && mod.tips.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-amber-600 mb-1.5">💡 Tips</p>
                        <ul className="space-y-1">
                          {mod.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                              <span className="text-amber-500 shrink-0">•</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Quick help */}
      <div className="rounded-lg border border-dashed bg-gray-50 p-5 text-center">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-medium mb-1">¿No encuentras lo que buscas?</p>
        <p className="text-xs text-muted-foreground mb-3">Envíanos tu duda y te ayudamos.</p>
        <a href="/preview/settings/suggestions" className="inline-flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Enviar sugerencia</a>
      </div>
    </div>
  );
}
