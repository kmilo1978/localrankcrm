# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

---

## [2026-07-20]

### Agregado
- **Módulo Acortador de URL** (`/url-shortener`): Crea enlaces cortos con tracking de clicks, etiquetas y botón copiar.
- **Módulo Enriquecimiento de datos** (`/enrichment`): 8 templates (Email Finder, Company Info, Social Profiles, Phone Verification, Tech Stack, Domain Analysis, Lead Scoring, Full Contact). Conecta con Composio/Snov.io/Apollo.
- **Módulo Constructor IA** (`/ai-builder`): Interfaz de lenguaje natural que auto-detecta módulo y ejecuta (tareas, notas, emails, pipeline, calendario, propuestas, automatizaciones). Historial de acciones.
- **Drag-and-drop sortable** (`src/components/sortable-list.tsx`): Componente reutilizable con @dnd-kit. Integrado en Tareas y Notas.
- **Módulo Focus** (`/focus`): Timer Pomodoro (15/25/45/60 min), progreso circular, tareas de enfoque, historial de sesiones.
- **Módulo Archivos & IA** (`/files`): Importar archivos, visualizar inline, preguntar a la IA sobre contenido.
- **Menú personalizable**: Agregar/quitar módulos del menú principal con persistencia.
- **Dark mode**: Override CSS global para compatibilidad completa en modo oscuro.
- **Workspace — Eliminación segura**: Modal que pide escribir nombre en MAYÚSCULAS para confirmar.
- **Workspace — Claves por espacio**: Bóveda de credenciales por workspace.
- **Workspace — Renombrar, copiar info, límite configurable (10 max)**.
- **Admin — Control de módulos por miembro**: Activar/desactivar funcionalidades por usuario.
- **ViewToggle**: Selector de vistas (Lista/Kanban/Calendario/Tablero) reutilizable.
- **Tareas**: 4 vistas + drag-and-drop en lista.
- **Notas**: 3 vistas + drag-and-drop en grid + enviar a recordatorio + etiquetas compartidas.
- **Contactos**: Detección de duplicados con fusión + transferencia a Prospección.
- **Checklists**: Bloqueo, paginación, categorías, etiquetas, proyectos, ↑↓ reordenar.
- **Calendario**: Sincronización via Composio (valida API key).
- **Radar**: Editable (email/phone/notas), exportar a pipeline, reabrir páginas.
- **ToDo**: Clonar, mover entre periodos, enviar a recordatorio.
- **Bóveda**: Generador de claves seguras (crypto) + modal cambiar clave.
- **Sistema de etiquetas compartido** (`src/lib/tags.ts`): Importable entre todos los módulos.
- **Email Tools mejorado** (`/email-finder`): 4 tabs — Finder (genera emails por nombre+dominio), Verificador (formato+dominio+typos), Escritor IA (genera borradores por tipo/tono: cold-outreach, follow-up, reunión, propuesta, agradecimiento), Limpiar lista (elimina duplicados, inválidos, temporales, marca personales).
- **Social Outreach** (`/social-outreach`): Gestión de outreach multicanal — LinkedIn, Twitter/X, Instagram, Facebook, TikTok. Agregar perfiles, enviar mensajes con templates personalizados, tracking de estado (draft/enviado/aceptado/respondido), exportar a CSV. Templates por plataforma (connection, message, InMail, DM, comment).
- **Lead Finder B2B** (`/lead-finder`): Localizador de leads estilo Snov.io — búsqueda por filtros + búsqueda IA en lenguaje natural. Leads verificados con score. Exportar CSV, enviar a Pipeline o Contactos.
- **Workspace aislados**: Cada workspace tiene sus propios datos (contactos, notas, tareas, etc.). Los datos globales (equipo, bóveda, etiquetas) siguen compartidos. Migración automática de datos viejos.

### Corregido
- **Buscador global mejorado** (Ctrl+K): 17 módulos buscables, 35 páginas, acciones rápidas, búsquedas recientes, workspace-aware, iconos.
- **Papelera** (`/trash`): Items eliminados se guardan 30 días con opción de restaurar. Auto-limpieza. Vaciar papelera con confirmación.
- **Meeting Reminders** (`/meeting-reminders`): Recordatorios automáticos multicanal (email/SMS/WhatsApp) para reuniones. IA genera mensajes + sugiere timing.
- **Módulo Suscripciones** (`/subscriptions`): Control de pagos recurrentes personales y profesionales. KPIs, alertas vencimiento, análisis de ahorro.
- **Cotizador IA** (`/ai-quoter`): Genera propuestas comerciales desde prompt. Secciones editables, copiar/exportar.
- **Banner de actualizaciones**: Popup con novedades de cada versión, dismiss persistente.
- **Backup completo** (Ajustes → Cuenta): Exportar JSON + Importar/Restaurar desde archivo con recarga automática.
- **robots.txt + noindex**: Protección contra indexación en motores de búsqueda (robots.txt Disallow all, meta noindex, header X-Robots-Tag).
- **Auditoría de seguridad**: Verificado 0 API keys expuestas en el código. .env protegido por gitignore y nunca commiteado.
- **Página Sugerencias** (Ajustes): Formulario para enviar feedback/bugs/ideas a jkbotero78@gmail.com.
- **Documentación completa** (Ajustes): Guía paso a paso de cada módulo con "Cómo usar" + "Tips". Buscador integrado.
- **Toggle tema** en sidebar: Ícono sol/luna para cambiar claro/oscuro con un clic.
- Build Vercel: localStorage en render, NodeJS.Timeout, email/phone en radar, JSX workspaces, prefix duplicado app-nav.
- Bóveda: prompt() → modal propio.
- Calendario: botón sincronizar → modal con opciones y feedback.
