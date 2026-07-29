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
    { title: "Contactos", description: "Gestiona tu base de contactos con campos personalizados, notas, recordatorios, etiquetas y detección de duplicados. Paginación automática (15 por página).", howTo: ["Crea contactos con el botón '+ Nuevo' o el botón flotante azul", "Expande un contacto para ver/editar todos sus datos", "Agrega campos personalizados para información extra", "Asigna etiquetas al crear o editando (Enter para agregar)", "Filtra por etiqueta con el dropdown del header", "Usa 'Duplicados' para detectar y fusionar registros repetidos", "Transfiere contactos a Prospección con el botón ↔", "Archiva contactos y restáuralos en lote con checkboxes"], tips: ["Los recordatorios se disparan automáticamente a la hora programada", "Puedes subir foto de perfil para cada contacto", "La búsqueda también encuentra por etiqueta", "Contactos archivados se pueden seleccionar y restaurar en lote"] },
    { title: "Pipeline", description: "Kanban drag-and-drop para gestionar tu embudo de ventas. Muestra máx 8 leads por columna con opción de expandir.", howTo: ["Arrastra leads entre columnas para moverlos de etapa", "Crea leads con el botón 'Nuevo lead'", "Edita haciendo clic en cualquier tarjeta (abre editor completo)", "Duplica o copia leads con los botones de hover", "Si hay más de 8 leads en una etapa, usa 'mostrar más'"], tips: ["Las etapas son personalizables", "Los leads importados desde Radar/Prospección llegan a 'Nuevo'", "Puedes cambiar la etapa desde el editor del lead"] },
    { title: "Compañías", description: "Directorio de empresas con campos personalizados, notas y contactos asociados.", howTo: ["Crea una compañía con nombre, industria, web y datos de contacto", "Expande para ver/editar campos, agregar notas", "Asocia contactos a compañías para ver relaciones"], tips: ["Útil para agrupar leads de la misma organización", "Las notas de empresa se comparten entre contactos asociados"] },
    { title: "Tareas", description: "Gestión de tareas con 4 vistas: Lista (con drag-and-drop), Kanban, Calendario y Tablero.", howTo: ["Cambia de vista con los botones superiores", "En vista Lista puedes arrastrar para reordenar", "En vista Kanban las columnas son por estado", "En vista Calendario las tareas aparecen por fecha", "Asigna prioridad, fecha límite y etiquetas a cada tarea"], tips: ["Las tareas se pueden pegar desde el portapapeles (JSON)", "El botón 'Duplicar' crea una copia rápida", "El agente IA puede ver y responder sobre tus tareas pendientes"] },
    { title: "Cartera / Facturación", description: "Gestión completa de facturación, cobranza, acuerdos de pago, recordatorios, historial y cancelaciones. Cada elemento tiene acciones: duplicar, editar, subir archivos y eliminar.", howTo: ["Tab Facturas: crea, edita, duplica, marca como pagada, sube comprobantes", "Tab Cobrar: vista de facturas pendientes/vencidas con botón 'Cobrar'", "Tab Vencimientos: solo facturas vencidas con alerta visual roja", "Tab Pagos: historial de pagos recibidos", "Tab Recordatorios: programa recordatorios por WhatsApp/Email/SMS/Llamada", "Tab Acuerdos: crea acuerdos de pago en cuotas con seguimiento de estado", "Tab Historial: registro de todas las gestiones de cobranza realizadas", "Tab Cancelaciones: servicios cancelados por mora con opción de reactivar", "En cada elemento: menú ▼ con Editar, Duplicar, Subir archivo y Eliminar"], tips: ["Las facturas vencidas se resaltan en rojo automáticamente", "Puedes adjuntar comprobantes/PDFs a cualquier elemento", "Los recordatorios se pueden enviar por múltiples canales", "Los acuerdos trackean estado: Activo, Completado o Incumplido", "El historial registra cada gestión con canal y resultado"] },
  ]},
  { category: "💬 Conversaciones", modules: [
    { title: "Inbox", description: "Centro de conversaciones omnicanal. Todos los mensajes en un solo lugar.", howTo: ["Selecciona una conversación de la lista izquierda", "Escribe tu mensaje y envía", "El badge rojo muestra mensajes sin leer", "Usa plantillas para respuestas rápidas"], tips: ["La IA puede responder automáticamente si está configurada", "Las conversaciones se ordenan por última actividad"] },
    { title: "Plantillas", description: "Templates predefinidos para WhatsApp, Email y otros canales.", howTo: ["Crea plantillas con variables dinámicas", "Asigna botones de acción (URL, teléfono, respuesta)", "Envía plantillas desde cualquier conversación"], tips: ["Las plantillas de WhatsApp requieren aprobación de Meta", "Usa variables como {nombre} para personalizar"] },
  ]},
  { category: "🤖 Automatización & IA", modules: [
    { title: "Asistente IA", description: "Chat inteligente con acceso a TODOS los datos del CRM. Soporta entrada por voz (Web Speech API). Pregunta sobre contactos, leads, tareas, facturas, proyectos y más.", howTo: ["Haz clic en el botón ✨ (esquina inferior derecha)", "Escribe tu pregunta o usa el botón 🎙️ para hablar", "El micrófono transcribe tu voz y envía automáticamente", "El asistente busca en tus datos reales y responde", "Tiene acceso a: contactos, leads, pipeline, tareas, notas, to-do, checklists, proyectos, propuestas, facturas, proveedores, social outreach, recordatorios, formularios", "La conversación mantiene contexto (puedes hacer preguntas de seguimiento)"], tips: ["El micrófono funciona en Chrome y Edge (requiere HTTPS en producción)", "Acepta el permiso del micrófono cuando el navegador lo pida", "Ante la duda, pregunta — la IA busca en todo el CRM", "No inventa datos: si no encuentra algo, te lo dice", "Preguntas fuera del CRM (recetas, política, etc.) son rechazadas"] },
    { title: "Constructor IA", description: "Dile a la IA qué hacer en lenguaje natural y lo ejecuta en el módulo correcto.", howTo: ["Escribe lo que quieres hacer (ej: 'Crea una tarea para llamar a Carlos mañana')", "La IA detecta automáticamente si es una tarea, nota, email, etc.", "Selecciona un agente específico (Ventas, Soporte, Marketing...)", "Si tienes OpenRouter configurado, usa modelos reales"], tips: ["Sé específico en tus instrucciones para mejores resultados", "Los agentes tienen personalidades distintas — elige el adecuado", "Sin API key funciona en modo local (respuestas predefinidas)"] },
    { title: "Automatizaciones", description: "Reglas automáticas: cuando pasa X → ejecuta Y. Paginación de 8 por página con editor visual.", howTo: ["Crea una automatización con nombre y trigger", "Agrega condiciones (si lead_score > 80...)", "Agrega acciones (enviar WhatsApp, crear tarea, mover etapa...)", "Activa/desactiva con el toggle ON/OFF", "Ve el flujo visual en la parte inferior del editor"], tips: ["Revisa los logs para ver ejecuciones y errores", "Combina múltiples acciones en secuencia", "Puedes tener acciones condicionales (IF/ELSE)"] },
    { title: "Social Outreach", description: "Gestión de outreach en LinkedIn, Instagram, Twitter, Facebook y TikTok. Importa CSV, edita perfiles, paginación.", howTo: ["Agrega perfiles manualmente o importa un CSV", "Importar CSV: sube tu archivo → previsualiza → edita → importa", "Edita cualquier perfil con el ícono de lápiz", "Envía mensajes personalizados con templates por plataforma", "Filtra por plataforma con los botones de color", "Exporta tus perfiles a CSV"], tips: ["El importador detecta automáticamente la plataforma por la URL", "Puedes editar los datos del CSV antes de importar", "Los templates usan variables {name}, {title}, {company}"] },
  ]},
  { category: "📋 Operación", modules: [
    { title: "Calendario", description: "Calendario con 3 vistas: Mes, Semana y Día. Perfecto para planificación micro y macro. Gestiona citas, cobros y recordatorios con múltiples calendarios de colores.", howTo: ["Cambia entre vistas Mes/Semana/Día con los botones del header", "Vista Mes: cuadrícula mensual, click en un día para ver detalles", "Vista Semana: grilla de 7 días por hora (7am-8pm), ideal para ver carga semanal", "Vista Día: timeline detallado hora por hora con tarjetas expandidas", "Crea citas con título, tipo (cita/cobro/recordatorio), fecha, hora, duración y contacto", "Crea múltiples calendarios con colores para categorizar eventos", "Filtra calendarios con los checkboxes del sidebar", "El sidebar muestra próximos 7 días para referencia rápida", "Conecta Google Calendar, Outlook o Apple Calendar via Composio"], tips: ["Vista Semana: click en un día abre automáticamente la vista Día", "Vista Día: navega con flechas ← → entre días", "Los recordatorios de cobro muestran el monto pendiente en verde", "El botón 'Hoy' te lleva siempre al día actual", "Composio maneja OAuth automáticamente — solo necesitas tu API key"] },
    { title: "Notas", description: "Notas con editor de texto enriquecido (negrita, itálica, links, listas, código), etiquetas compartidas y múltiples vistas.", howTo: ["Crea notas con el editor rico: negrita, itálica, subrayado, listas, enlaces, código", "Asigna etiquetas del sistema compartido", "Cambia entre vistas: Grid, Lista o Board (por categoría)", "Usa el botón 'Recordatorio' para programar un aviso", "Fija notas importantes con el pin 📌"], tips: ["El editor soporta formato sin dependencias externas", "Puedes buscar notas por título o contenido", "El agente IA puede buscar en tus notas"] },
    { title: "To-Do", description: "Listas de pendientes organizadas en 5 periodos: Diario, Semanal, Mensual, 6 Meses y Anual. Grid de 5 columnas para planificación micro y macro.", howTo: ["Los 5 periodos se muestran en columnas simultáneas", "Escribe un item y presiona Enter para agregar en cualquier periodo", "Marca como completado con el checkbox", "Reordena items con las flechas ↑↓ (hover)", "Clona items o muévelos entre periodos con los botones de acción", "Crea periodos personalizados con el botón '+ Agregar periodo'", "Envía items a Recordatorios con el botón 🔔"], tips: ["Diario = tareas del día, Semanal = meta de la semana, Mensual = objetivos del mes", "6 Meses = metas de semestre, Anual = visión a largo plazo", "El agente IA puede decirte qué tienes pendiente en cada periodo", "Puedes crear periodos personalizados (ej: Q3, Proyecto X, Sprint 4)"] },
    { title: "Checklists", description: "Listas de verificación con bloqueo, etiquetas, reordenamiento de items y cards por prioridad. Paginación de 8 por página.", howTo: ["Crea un checklist con título, cliente y categoría", "Agrega items uno a uno o pega una lista completa", "Reordena items con flechas ↑↓ (hover sobre cada item)", "Reordena cards completas con ↑↓ en la esquina superior", "Bloquea con el candado para evitar cambios accidentales"], tips: ["Puedes clonar checklists para reutilizar con otros clientes", "Las etiquetas del CRM se pueden asignar al crear", "El reorden se guarda automáticamente"] },
    { title: "Proyectos", description: "Gestión de proyectos con sub-proyectos, tareas reordenables, editor rico en secciones, equipo y archivos. Edición inline.", howTo: ["Crea un proyecto con nombre, descripción y color", "Agrega sub-proyectos para dividir en fases", "Agrega secciones con editor de texto enriquecido (negrita, links, listas)", "Reordena tareas con flechas ↑↓ para cambiar prioridad", "Asigna miembros del equipo con rol", "Edita nombre/descripción del proyecto con el ícono de lápiz", "Busca proyectos en el sidebar con el buscador"], tips: ["Cada sub-proyecto tiene sus propias tareas y notas", "La barra de progreso muestra % de tareas completadas", "Puedes duplicar proyectos completos"] },
    { title: "Propuestas", description: "Crea propuestas comerciales con secciones reordenables, branding, firma digital y tracking de vistas. Paginación y búsqueda.", howTo: ["Crea desde template o desde cero", "Edita secciones con editor de texto", "Reordena secciones con flechas ↑↓ para reorganizar la propuesta", "Agrega logo, banner y firma del cliente", "Configura contraseña para proteger acceso", "Marca como enviada y trackea cuántas veces la vieron", "Busca propuestas por nombre o cliente en el sidebar"], tips: ["Los templates te ahorran tiempo en propuestas recurrentes", "El tracking de vistas te dice si el cliente abrió la propuesta", "Las secciones se pueden mover libremente de posición"] },
    { title: "Proveedores", description: "Directorio de proveedores con categorías, rating, etiquetas y paginación.", howTo: ["Agrega proveedores con nombre, categoría, contacto y datos", "Asigna rating de 1-5 estrellas", "Filtra por categoría o etiqueta", "Busca por nombre o datos de contacto"], tips: ["Útil para trackear a quién le compras qué", "El agente IA puede buscar proveedores por categoría"] },
    { title: "Focus", description: "Modo Pomodoro para concentrarte en una tarea a la vez.", howTo: ["Selecciona duración (15/25/45/60 min)", "Escribe en qué te enfocas", "Presiona 'Iniciar' para arrancar el timer", "Agrega tareas de enfoque y usa 'Enfocar' para vincularlas al timer"], tips: ["El historial muestra cuántas sesiones completaste hoy", "Marca tareas como completadas cuando termines"] },
  ]},
  { category: "👥 Equipo & Espacios", modules: [
    { title: "Workspace", description: "Espacios de trabajo aislados. Cada uno tiene sus propios datos, carpetas y claves.", howTo: ["Crea un workspace nuevo con nombre y cliente", "Selecciona un workspace para activarlo (los datos cambian)", "Usa la bóveda de claves (🔑) para guardar API keys por espacio", "Renombra con el botón ✏️", "Para eliminar, escribe el nombre en MAYÚSCULAS"], tips: ["Cada workspace tiene datos independientes (contactos, notas, etc.)", "Las etiquetas y equipo son globales (compartidos)", "Hay un límite configurable de espacios (default: 10)"] },
    { title: "Bóveda", description: "Gestor de credenciales protegido con clave maestra.", howTo: ["Configura tu clave maestra la primera vez", "Agrega credenciales con título, usuario y contraseña", "Usa el generador de claves para crear passwords seguros", "Copia con un clic sin mostrar la contraseña completa"], tips: ["La bóveda se bloquea automáticamente", "El generador usa crypto.getRandomValues (criptográficamente seguro)", "Se activa blur por defecto para proteger la pantalla"] },
  ]},
  { category: "⚙️ Configuración", modules: [
    { title: "Búsqueda global", description: "Busca en todo el CRM con un solo atajo: contactos, módulos, tareas, notas, facturas y acciones rápidas.", howTo: ["Presiona ⌘K (Mac) o Ctrl+K (Windows) para abrir", "O haz clic en el botón 'Buscar...' centrado en la parte superior", "Escribe un nombre de contacto, empresa, módulo o acción", "La búsqueda indexa: contactos, compañías, leads, tareas, notas, proyectos, facturas, proveedores, checklists, recordatorios, URLs, archivos, perfiles sociales", "Usa las acciones rápidas: 'Nuevo contacto', 'Nueva tarea', 'Buscar leads', etc.", "Navega con Enter al primer resultado"], tips: ["La búsqueda busca tanto en navegación/módulos como en TUS datos (localStorage)", "Las búsquedas recientes se guardan para acceso rápido", "Si no sabes cómo llegar a un módulo, búscalo aquí", "Escribe 'nueva' para ver todas las acciones de creación rápida"] },
    { title: "Tema claro/oscuro", description: "Cambia entre tema claro y oscuro con un solo clic.", howTo: ["Usa el ícono de sol/luna en la parte superior del sidebar", "O ve a Ajustes → Apariencia para más opciones"], tips: ["También puedes usar 'Sistema' para que siga tu preferencia del SO"] },
    { title: "MCP (IA externa)", description: "Conecta herramientas de IA externas. Soporta Supabase, Obsidian, Hermes, OpenClaw, GitHub, Slack, Google Drive, Notion, Postgres y Composio.", howTo: ["Ve a Ajustes → MCP", "Selecciona un servidor popular de la lista y configúralo", "O agrega uno personalizado con comando, argumentos y variables de entorno", "Activa/desactiva servidores con el toggle", "Guarda la configuración con el botón 'Guardar configuración'"], tips: ["Composio conecta 250+ apps (Gmail, Calendar, HubSpot, Stripe, etc.) con UNA sola API key", "Hermes Agent conecta Telegram, Discord, Slack como agentes de IA", "OpenClaw Gateway conecta WhatsApp, Teams, iMessage", "Obsidian MCP conecta tu vault como knowledge base del agente", "Supabase MCP da acceso SQL directo a tu base de datos", "Cada servidor muestra su estado: running/stopped/error"] },
    { title: "Proveedores de IA", description: "Configura qué modelo de IA usa el agente del CRM.", howTo: ["Ve a Ajustes → Proveedores IA", "Configura tu API key de OpenRouter, Gemini, NVIDIA o 9Router", "Selecciona el modelo preferido", "El agente usará ese modelo para responder en el chat y WhatsApp"], tips: ["Gemini es gratis y funciona bien para español", "OpenRouter da acceso a Claude, GPT-4, Llama y más", "Sin API key configurada, el agente no funciona"] },
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
