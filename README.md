# LocalRank CRM

**Plataforma de Ventas y Prospección Inteligente**

CRM todo-en-uno para equipos de ventas: prospección con IA, pipeline visual, conversaciones omnicanal, propuestas profesionales, analytics avanzados y automatización.

🌐 **Website:** [localrank.com.co](https://localrank.com.co)  
🚀 **Demo:** [localrankcrm-livid.vercel.app](https://localrankcrm-livid.vercel.app)  
📦 **Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + Supabase

---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Dashboard | Métricas, actividad, oportunidades top |
| Prospección | Contactos fríos, importar CSV, scoring, pipeline dedicado |
| Contactos | Campos personalizados, notas, recordatorios |
| Compañías | Empresas con campos y notas por compañía |
| Oportunidades | Deals con valor, probabilidad, vista lista/board |
| Pipeline | Kanban drag-and-drop con 6 etapas |
| Conversaciones | Omnicanal: WhatsApp, Email, Instagram, LinkedIn, Telegram, TikTok, X, Facebook, Gmail, Reddit, Quora |
| Plantillas | Templates con scheduling, secuencias, botones, media, stats |
| Propuestas | Editor con secciones, logo, firma, media, embed, PDF export |
| Tareas | Prioridad, estado, filtros |
| To-Do | Diario, semanal, mensual |
| Calendario | Múltiples calendarios, citas, cobros, recordatorios |
| Formularios | Conectar Tally/Typeform + builder manual/IA |
| Analytics | KPIs, funnel, rendimiento por rep, canales |
| IA & Automatización | Agente, resúmenes, drafts IA, scoring predictivo |
| Automatizaciones | Constructor visual: triggers → condiciones → acciones |
| Lead Routing | Asignación automática: Round Robin, menos cargado, por reglas |
| Scoring | Motor de puntuación: ICP, engagement, datos, intención |
| Auditoría | Logs de cambios, workflows, errores |
| Importar & Enriquecer | CSV upload + enriquecimiento de datos |
| Workspaces | Multi-cliente, carpetas, subcarpetas, archivos |
| Equipo | Roles, permisos avanzados, invitaciones, delegación |
| Social | Engagement tracking: likes, comments, DMs, mentions |
| Omnicanal | Dashboard unificado de todos los canales |
| Etiquetas | Ilimitadas con colores personalizados |
| Notas | Categorías personalizables con colores |

## Configuración

| Setting | Descripción |
|---------|-------------|
| WhatsApp | Cloud API + Coexistencia QR |
| IA / APIs | 15 proveedores (OpenRouter, NVIDIA, Claude, Gemini, Grok...) |
| Marca | Logo, colores, fuente, border radius |
| Plantillas | Templates con secuencias y stats |
| Resp. Rápidas | Shortcuts con media, secuencias, round robin |
| SMS | Twilio, Vonage, MessageBird, Plivo |
| Email Marketing | Resend, SendGrid, Mailgun, SES, Postmark, Brevo, Mailchimp |
| MCP | Servidores Model Context Protocol |
| Conectores | Composio.dev, WithOne.ai |
| Flows | Estrategia multicanal visual |
| Webhooks & APIs | API keys, webhooks, n8n integration |
| Pixels & UTM | Meta Pixel, GA4, Google Ads, Search Console, TikTok, LinkedIn |
| OCR | Reconocimiento de texto en imágenes |
| Moneda | USD, COP, EUR, MXN + formato configurable |
| Apariencia | Tema claro/oscuro + idioma (6 idiomas) |
| Cuenta | Login/logout, perfil |

## Seguridad

- Middleware de seguridad (HSTS, X-Frame, XSS, nosniff)
- API keys nunca expuestas al cliente
- Rate limiting en endpoints
- Source maps bloqueados en producción
- Redacción automática de secrets

## Desarrollo

```bash
pnpm install
pnpm dev -- -p 3001
```

## Créditos

Desarrollado por **[LocalRank](https://localrank.com.co)** — Agencia de marketing digital y tecnología en Medellín, Colombia.

© 2024-2026 LocalRank. Todos los derechos reservados.
