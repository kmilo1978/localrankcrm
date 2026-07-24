# Scout API — Wrapper para LocalRank CRM

API REST que conecta [Scout](https://github.com/kiryano/Scout) con tu CRM.
Scrapea perfiles de Instagram, TikTok, LinkedIn, GitHub, YouTube, Twitch, Pinterest y Linktree.

---

## Paso a paso completo

### 1. Crear el repositorio

```bash
# Opción A: Clonar Scout y agregar los archivos de esta carpeta
git clone https://github.com/kiryano/Scout.git scout-api
cd scout-api
```

Luego copia estos archivos dentro del repo clonado:
- `main.py` (el wrapper FastAPI)
- `requirements.txt` (ya incluye deps de Scout + FastAPI)
- `.env.example`
- `Procfile`
- `railway.toml`
- `render.yaml`
- `Dockerfile`

```bash
# Opción B: Crear repo nuevo y copiar todo
mkdir scout-api && cd scout-api
git init
# Copia el contenido de Scout (carpeta app/) + estos archivos
```

### 2. Estructura final del proyecto

```
scout-api/
├── app/                    ← carpeta de Scout (scrapers)
│   ├── scrapers/
│   │   ├── instagram.py
│   │   ├── tiktok.py
│   │   ├── linkedin.py
│   │   ├── github.py
│   │   ├── youtube.py
│   │   ├── twitch.py
│   │   ├── pinterest.py
│   │   └── linktree.py
│   ├── enrichment/         ← email enrichment de Scout
│   └── utils/              ← utilidades compartidas
├── main.py                 ← FastAPI wrapper (este archivo)
├── requirements.txt
├── .env.example
├── .env                    ← tu config (no se sube a git)
├── Procfile                ← para Railway/Heroku
├── railway.toml            ← config Railway
├── render.yaml             ← config Render
├── Dockerfile              ← para Docker/Fly.io
└── .gitignore
```

### 3. Probar en local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Copiar config
cp .env.example .env
# Editar .env si quieres LinkedIn cookie o proxy

# Ejecutar
uvicorn main:app --reload --port 8000
```

Abre `http://localhost:8000/docs` para ver la documentación interactiva (Swagger).

### 4. Probar el endpoint

```bash
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"platform": "instagram", "usernames": ["carlosruiz.dev"]}'
```

---

## Deploy (elige uno)

### Railway (recomendado, gratis)

1. Sube tu repo a GitHub
2. Ve a [railway.app](https://railway.app) → Sign in con GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecciona tu repo `scout-api`
5. Railway detecta Python automáticamente
6. En **Variables**, agrega:
   - `ALLOWED_ORIGINS` = `https://localrank.com.co` (tu dominio)
   - `LINKEDIN_COOKIE` = tu cookie (opcional)
7. Haz clic en **Deploy**
8. Railway te da URL: `https://scout-api-production-xxxx.up.railway.app`
9. **Esa URL la pegas en tu CRM → Scout → Configurar API**

### Render (gratis, se duerme tras 15min sin uso)

1. Sube tu repo a GitHub
2. Ve a [render.com](https://render.com) → New Web Service
3. Conecta tu repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (LINKEDIN_COOKIE, ALLOWED_ORIGINS)
7. Deploy
8. URL: `https://scout-api-xxxx.onrender.com`

### Docker (VPS propio)

```bash
docker build -t scout-api .
docker run -p 8000:8000 --env-file .env scout-api
```

### Tu propia PC (solo para pruebas)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
Tu API queda en `http://TU-IP:8000` (solo funciona mientras tu PC esté encendida).

---

## Conectar al CRM

1. Abre tu CRM → sidebar → **Prospección → Scout Scraper**
2. Clic en **Configurar API**
3. En "URL del servidor Scout" pega: `https://tu-url.railway.app`
4. (Opcional) LinkedIn cookie, proxy, Hunter.io key
5. Guardar
6. Ahora las búsquedas van contra tu servidor real

---

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Info del servidor |
| GET | `/health` | Health check |
| GET | `/platforms` | Lista de plataformas |
| POST | `/scrape` | Scrapear perfiles |
| GET | `/docs` | Documentación Swagger |

### POST /scrape

**Request:**
```json
{
  "platform": "instagram",
  "usernames": ["usuario1", "usuario2"],
  "linkedin_cookie": "AQEDAxxx...",
  "proxy": "http://user:pass@host:port"
}
```

**Response:**
```json
{
  "results": [
    {
      "username": "usuario1",
      "name": "Carlos Ruiz",
      "bio": "CTO at TechCorp · Fullstack dev",
      "followers": 12400,
      "email": "carlos@techcorp.io",
      "phone": "+57 300 123 4567",
      "website": "techcorp.io",
      "company": "TechCorp",
      "score": 92,
      "verified": true,
      "links": ["https://techcorp.io", "https://linkedin.com/in/carlosruiz"]
    }
  ],
  "platform": "instagram",
  "count": 1
}
```

---

## Plataformas soportadas

| Plataforma | Auth requerida | Datos |
|---|---|---|
| Instagram | Ninguno | perfil, bio, seguidores, email, phone, links |
| TikTok | Ninguno | perfil, bio, seguidores, likes, email |
| LinkedIn | Cookie `li_at` | perfil, headline, bio, email |
| GitHub | Ninguno | perfil, bio, repos, email, website |
| YouTube | Ninguno | canal, descripción, suscriptores, email, links |
| Twitch | Ninguno | perfil, bio, seguidores, partner status, social |
| Pinterest | Ninguno | perfil, bio, seguidores, pins, website |
| Linktree | Ninguno | todos los link-in-bio (Stan, Linkr, Bio.link) |

---

## Limitaciones

- Instagram: puede requerir reintentos según IP/región
- TikTok: puede mostrar CAPTCHA según IP
- LinkedIn: cookies expiran cada ~30 días
- GitHub: 60 requests/hora sin token
- SMTP verification: algunos mail servers lo bloquean
- Free proxies: poco confiables

---

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `LINKEDIN_COOKIE` | No | Cookie `li_at` para LinkedIn |
| `SCOUT_PROXY` | No | Proxy HTTP(S) |
| `SCOUT_PROXY_FILE` | No | Archivo con proxies (uno por línea) |
| `SCOUT_FREE_PROXY` | No | Usar proxies gratuitos anónimos |
| `HUNTER_API_KEY` | No | Hunter.io para emails extra |
| `ALLOWED_ORIGINS` | No | Dominios CORS (separados por coma) |
| `PORT` | No | Puerto del servidor (default: 8000) |
