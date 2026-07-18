# LocalRank CRM — Guía para Claude

LocalRank CRM es una plataforma de ventas, prospección y automatización
inteligente — White-Label & Multi-Tenant. Este archivo guía a Claude Code
(u otro asistente) para operar y **modificar** este repositorio.

## Stack

**Next.js 15 (App Router) + React 19** en monolito · TypeScript
· Tailwind CSS (tema enterprise blue `#00288e`, soporte dark mode)
· **PostgreSQL + Drizzle ORM** (migraciones en `drizzle/`)
· **Better Auth** + plugin organization · **Zod** en todo input externo
· nanoid con prefijos (`ct_`, `cv_`, `msg_`…) · pnpm
· Docker multi-stage (standalone, healthcheck `/api/health`)
· Deploy en Vercel (producción) o Docker (self-hosted).

## Mapa del código

| Quieres cambiar… | Toca… |
|---|---|
| El cerebro/proveedor LLM | `src/lib/ai/` |
| El canal WhatsApp (Graph API) | `src/lib/meta/` + `src/server/whatsapp/` |
| Campos/tablas | `src/lib/db/schema.ts` → `pnpm db:generate` |
| UI de módulos | `src/app/(preview)/preview/` (funcionales) + re-exports en `src/app/(app)/` |
| Extensión Chrome | `extension/` (Manifest V3, content script + popup) |
| Settings | `src/app/(preview)/preview/settings/` |

## Reglas clave

- **Multi-tenancy**: `organization_id` NOT NULL en toda tabla; queries via `scoped()`.
- **localStorage**: módulos nuevos usan `loadFromStorage`/`saveToStorage` para persistencia sin DB.
- **Seguridad**: secretos cifrados (AES-256-GCM, `lib/crypto`), jamás al cliente.
- **Build**: `eslint: { ignoreDuringBuilds: true }` en `next.config.ts`.
- **Sin auth obligatorio**: el layout funciona sin login (localStorage persistence).

## Variables de entorno

Ver `.env.example`. Las claves: `APP_BASE_URL`, `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `ENCRYPTION_KEY` (32 bytes base64),
`OPENROUTER_API_TOKEN`, `EXTENSION_API_KEY` (para autenticar la extensión Chrome).

## Gate técnico

```bash
pnpm typecheck && pnpm build
```

## Contacto

- Website: localrank.com.co
- Email: localrankmedellin@gmail.com
