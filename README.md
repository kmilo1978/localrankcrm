# LocalRank CRM

> **Plataforma de Ventas, Prospección y Automatización Inteligente — White-Label & Multi-Tenant**

LocalRank CRM es un sistema todo-en-uno diseñado para equipos comerciales que necesitan gestionar prospección outbound, pipeline de ventas, conversaciones omnicanal, propuestas, facturación y automatización con IA — todo desde una sola plataforma, sin depender de 10 herramientas diferentes.

Construido con Next.js 15, React 19, TypeScript y Tailwind CSS. Desplegable en Vercel con base de datos en Supabase (PostgreSQL).

🌐 **Website:** [localrank.com.co](https://localrank.com.co)  
📧 **Contacto para desarrollos a la medida:** localrankmedellin@gmail.com  
📦 **Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase · Drizzle ORM  
🔌 **Extensión Chrome:** Incluida en `/extension` — analiza webs, extrae datos y sincroniza con el CRM

---

## ¿Para quién es LocalRank CRM?

- **Agencias de marketing** que gestionan múltiples clientes y necesitan un CRM white-label.
- **Equipos de ventas B2B** que prospectan en frío y necesitan secuencias multicanal.
- **Freelancers y consultores** que quieren centralizar contactos, propuestas y cobranza.
- **Startups SaaS** que necesitan un CRM propio sin pagar $200/mes por usuario en HubSpot o Salesforce.
- **Empresas que revenden software** — con white-label completo pueden ofrecer el CRM como producto propio.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 15)              │
│  React 19 · Tailwind CSS · Lucide Icons · localStorage │
├─────────────────────────────────────────────────────┤
│                   BACKEND (API Routes)              │
│  Better Auth · Drizzle ORM · Multi-provider AI     │
├─────────────────────────────────────────────────────┤
│               BASE DE DATOS (Supabase)             │
│  PostgreSQL · Migrations · Row Level Security      │
├─────────────────────────────────────────────────────┤
│              INTEGRACIONES EXTERNAS                 │
│  OpenRouter · NVIDIA · Gemini · Composio · n8n     │
│  WhatsApp API · Telegram · Gmail · Twilio · etc.   │
└─────────────────────────────────────────────────────┘
```

---

## Módulos principales

### Revenue Operations
| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | KPIs, actividad reciente, oportunidades top, tareas pendientes |
| **Prospección** | Contactos fríos con scoring, import CSV, filtros avanzados (web/verificación/GMB), canal de outreach, follow-ups |
| **Contactos** | Campos personalizados ilimitados, notas, recordatorios, etiquetas, detección de duplicados con fusión, transferencia de leads a prospección |
| **Compañías** | Empresas con campos custom, notas por empresa, subcarpetas |
| **Oportunidades** | Deals con valor/probabilidad, vista lista + board kanban |
| **Pipeline** | Kanban drag-and-drop con 6+ etapas personalizables |
| **Conversaciones** | Omnicanal: WhatsApp (×3 líneas + coexistencia), Email, Instagram, Facebook, LinkedIn, X, Telegram, TikTok, Gmail, Reddit, Quora |
| **Plantillas** | Templates con scheduling, secuencias, botones (URL/Phone/Reply), media, pre-aprobación, métricas de éxito |
| **Propuestas** | Editor de secciones con logo, firma, imágenes, audio, video, embed (Cal.com, YouTube, scripts), exportación PDF |
| **Cartera** | Facturas, cuentas por cobrar, vencimientos, pagos, recordatorios de cobro, acuerdos de pago, historial de cobranza, cancelaciones |

### Automatización & IA
| Módulo | Descripción |
|--------|-------------|
| **IA & Automatización** | Agente conversacional, resúmenes automáticos por contacto, drafts IA con confianza %, scoring predictivo |
| **Automatizaciones** | Constructor visual: 10 triggers × 12 tipos de acción × condiciones. Logs de ejecución |
| **Secuencias** | Cadenas multicanal (Email→WhatsApp→LinkedIn→SMS→Llamada) con delays y stop-on-reply |
| **Lead Routing** | Asignación automática: Round Robin, menos cargado, por reglas de fuente/score/canal |
| **Scoring** | Motor de puntuación: ICP match, engagement, completitud de datos, señales de intención |
| **Scheduler** | Tareas programadas: follow-ups, re-engagement, recordatorios, limpieza, reportes |

### Operaciones
| Módulo | Descripción |
|--------|-------------|
| **Tareas** | Gestión por prioridad/estado con filtros, vistas múltiples (lista/kanban/calendario/tablero) |
| **To-Do** | Diario, semanal, mensual con barras de progreso |
| **Focus** | Modo enfoque Pomodoro (15/25/45/60 min), timer circular, tareas de enfoque con prioridad, historial de sesiones |
| **Calendario** | Múltiples calendarios con colores, citas, cobros, recordatorios |
| **Formularios** | Conectar Tally/Typeform/JotForm + builder manual + generador IA |
| **Importar & Enriquecer** | Upload CSV → enriquecimiento (email, social, tech, empresa, dominio) → exportar |
| **Workspaces** | Multi-cliente con carpetas/subcarpetas, archivos, responsable por carpeta |
| **Equipo** | Roles (owner/admin/manager/member/viewer), 20 permisos granulares, invitaciones, delegación |
| **Chat Interno** | Conversaciones entre miembros: canales públicos/privados, mensajes directos, documentos compartidos, invitar miembros |
| **Analytics** | KPIs 30d, funnel de ventas, rendimiento por rep, conversaciones por canal |
| **Social** | Engagement: likes, comments, DMs, mentions por plataforma |
| **Omnicanal** | Dashboard unificado con status de cada canal + actividad |
| **Etiquetas** | Sistema compartido: ilimitadas con colores personalizados + hex custom, descripción, asignables a múltiples módulos (notas, contactos, tareas, oportunidades), importación cruzada entre módulos |
| **Notas** | Etiquetas compartidas con colores, múltiples tags por nota, filtros, fijadas, importación de etiquetas del CRM |
| **Bóveda** | Gestor de credenciales con clave maestra, generador de contraseñas seguras (crypto), categorías por servicio |
| **Auditoría** | Logs: quién hizo qué, workflows, errores, logins |

---

## Configuración (15 secciones)

| Setting | Descripción |
|---------|-------------|
| **WhatsApp** | Cloud API + Coexistencia QR, webhook config |
| **IA / APIs** | 15 proveedores: OpenRouter, NVIDIA, Claude, Gemini, Grok, Mistral, DeepSeek, Cohere, Groq, Together, Fireworks, Perplexity, OmniRouter, 9Router |
| **Marca (White-Label)** | Logo principal/compacto/favicon, paleta HEX (6 presets), tipografías, custom domain, subdominios por tenant, ocultar branding, legal |
| **Plantillas** | Templates con secuencias, botones, media, stats |
| **Resp. Rápidas** | Shortcuts con media, programación, secuencias, round robin |
| **SMS** | Twilio, Vonage, MessageBird, Plivo |
| **Email Marketing** | Resend, SendGrid, Mailgun, SES, Postmark, Brevo, Mailchimp + DNS (SPF/DKIM) |
| **MCP** | Servidores Model Context Protocol (7 populares one-click) |
| **Conectores** | Composio.dev (250+ apps) + WithOne.ai |
| **Flows** | Estrategia multicanal visual con triggers y steps |
| **Webhooks & APIs** | API keys + webhooks + n8n integration |
| **Pixels & UTM** | Meta Pixel, GA4, Google Ads, Search Console, TikTok, LinkedIn + generador UTM |
| **OCR** | Reconocimiento de texto (Tesseract, Google Vision, AWS Textract, Azure, OpenAI Vision) |
| **Moneda** | 10 monedas (USD, COP, EUR, MXN...) + formato |
| **Apariencia** | Tema claro/oscuro/sistema + idioma (6 idiomas) |
| **Cuenta** | Login/logout, perfil |

---

## Seguridad

- Middleware Next.js con headers HSTS, X-Frame-Options, XSS Protection, nosniff
- API keys **nunca** expuestas al cliente (server-only env vars)
- Rate limiting por IP (100 req/min)
- Redacción automática de secrets en logs
- Source maps bloqueados en producción
- Validación Zod en todas las variables de entorno

---

## Desarrollo local

```bash
git clone <URL_DEL_REPOSITORIO>
cd localrankcrm
pnpm install
cp .env.example .env  # Configura tus variables
pnpm dev -- -p 3001
```

Accede a `http://localhost:3001/dashboard` — no requiere login.

---

## Deploy

El proyecto está optimizado para **Vercel** con Supabase como base de datos:

1. Fork este repo
2. Importa en Vercel
3. Agrega las env vars (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
4. Deploy automático en cada push

---

## Desarrollos a la medida

¿Necesitas personalización, módulos adicionales, integraciones específicas o deployment en tu propia infraestructura?

📧 **localrankmedellin@gmail.com**  
🌐 **[localrank.com.co](https://localrank.com.co)**

Ofrecemos:
- White-label completo para revender como tu propio producto
- Integraciones custom (ERP, facturación electrónica, CRM legacy)
- Deployment self-hosted con Docker
- Soporte técnico y mantenimiento
- Capacitación para equipos comerciales

---

## Créditos

Desarrollado por **[LocalRank](https://localrank.com.co)** — Agencia de marketing digital, desarrollo de software y automatización en Medellín, Colombia.

© 2024-2026 LocalRank. Todos los derechos reservados.
