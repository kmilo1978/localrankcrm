# INSTALL-IA.md — Instalación de Vocero CRM guiada por IA

> **Para el asistente de IA** (Claude Code u otro agente con acceso a
> herramientas): este archivo ES tu guion de instalación. Síguelo de arriba a
> abajo y NO le pidas al usuario nada que puedas hacer o generar tú.
>
> **Para el humano**: abre tu asistente de IA (p. ej. Claude Code con el MCP de
> Coolify configurado) en una carpeta vacía, pégale este archivo (o su URL) y
> responde las 3 preguntas que te hará. **No necesitas clonar el repo ni crear
> ningún otro archivo**: Coolify construye directo desde GitHub y los secretos
> viven como variables de la plataforma.

**Repositorio**: `https://github.com/kevinrivm/vocero-crm` (público, rama `main`,
`Dockerfile` en la raíz).

## Reglas para el asistente

1. Pregunta al usuario ÚNICAMENTE estas tres cosas, en un solo mensaje:
   - **Dominio** donde vivirá el CRM (obligatorio, ej. `crm.sunegocio.com`).
     Debe apuntar ya a la IP del VPS (registro A).
   - **Token de OpenRouter** (opcional — sin él, el CRM funciona completo
     excepto el agente de IA y el Laboratorio; se puede agregar después).
   - **Ruta A o B**: A = el VPS tiene panel Coolify · B = el VPS solo tiene
     Docker.
2. **Genera tú mismo todos los secretos** (no se los pidas):

   ```bash
   openssl rand -base64 32   # BETTER_AUTH_SECRET
   openssl rand -base64 32   # ENCRYPTION_KEY (exactamente 32 bytes base64)
   openssl rand -hex 32      # META_WEBHOOK_VERIFY_TOKEN
   openssl rand -hex 24      # POSTGRES_PASSWORD
   ```

3. La conexión de WhatsApp NO es parte del despliegue: al terminar, dile al
   usuario que se hace desde la app.

## Variables de entorno (ambas rutas)

| Variable | Valor |
|---|---|
| `APP_BASE_URL` | `https://<dominio>` |
| `DATABASE_URL` | `postgresql://postgres:<POSTGRES_PASSWORD>@<host-postgres>:5432/vocero` |
| `POSTGRES_PASSWORD` | generado |
| `BETTER_AUTH_SECRET` | generado |
| `ENCRYPTION_KEY` | generado (base64, 44 caracteres) |
| `META_WEBHOOK_VERIFY_TOKEN` | generado |
| `META_GRAPH_API_VERSION` | `v25.0` |
| `OPENROUTER_API_TOKEN` | del usuario (si lo dio) |
| `OPENROUTER_MODEL` | si hay token: sugiere `anthropic/claude-sonnet-4.5` u otro a elección |

`DOMAIN` solo aplica en la Ruta B (para Caddy).

## Ruta A — Coolify (con el MCP de Coolify)

1. **Base de datos**: crea un servicio PostgreSQL 16 en el proyecto
   (`database` tipo `postgresql`), con la contraseña generada y base `vocero`.
   Anota su host interno (algo como `<uuid>:5432`).
2. **Aplicación**: crea una app tipo **repositorio público** apuntando a
   `https://github.com/kevinrivm/vocero-crm` (rama `main`, build pack
   `dockerfile`, puerto expuesto `3000`) — no requiere GitHub App ni deploy
   keys. Asigna el dominio del usuario con HTTPS.
3. **Variables**: configura las variables de la tabla en la app (runtime, no
   build). `DATABASE_URL` apunta al host interno del paso 1.
4. **Sin Pre-Deployment Command**: las migraciones corren solas al arrancar el
   contenedor (`node migrate.mjs && node server.js`).
5. **Despliega** y espera el healthcheck verde (`/api/health`; el start-period
   cubre las migraciones).
6. **Verifica**: `https://<dominio>/api/health` responde `{"ok":true}` y
   `https://<dominio>/login` carga.

## Ruta B — docker compose (VPS con Docker)

```bash
git clone https://github.com/kevinrivm/vocero-crm.git vocero && cd vocero
cp .env.example .env
# rellena .env con el dominio del usuario y los secretos generados
docker compose up -d --build
```

- Caddy emite el certificado HTTPS automáticamente con `DOMAIN`.
- Verifica: `docker compose ps` (tres servicios healthy) y
  `https://<dominio>/api/health` → `{"ok":true}`.

## Cierre (obligatorio decirlo al usuario)

> ✅ Vocero quedó instalado en `https://<dominio>`.
>
> 1. Entra y **regístrate**: el primer registro crea tu organización (después
>    el registro público se cierra solo).
> 2. Pulsa **"Cargar datos de demostración"** si quieres explorar con la
>    Ferretería El Martillo.
> 3. Para conectar tu WhatsApp entra a **Configuración → WhatsApp**: ahí está
>    el wizard y la URL exacta del webhook para el panel de Meta o para tu
>    backend de agencia. La conexión del número NO es parte de esta
>    instalación.

## Diagnóstico rápido

- App unhealthy al arrancar → revisa logs del contenedor: casi siempre es una
  variable faltante (la validación de entorno lista cuál) o la BD inaccesible.
- `ENCRYPTION_KEY` inválida → debe ser EXACTAMENTE 32 bytes en base64
  (44 caracteres): regénérala con `openssl rand -base64 32`.
- Webhook "no verificado" en Meta → el dominio aún no resuelve o no es https.
