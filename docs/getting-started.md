# Getting Started — LocalRank CRM

## 0. Requisitos

- **Kiro.dev** o cualquier IDE con asistente IA.
- **git** + **pnpm** (Node.js 22+).
- **PowerShell** (Windows) o **bash** (Linux/Mac).

## 1. Clonar y configurar

```bash
git clone <URL_DEL_REPOSITORIO>
cd localrankcrm
pnpm install
cp .env.example .env
```

## 2. Desarrollo local

```bash
pnpm dev -- -p 3001
```

Accede a `http://localhost:3001/dashboard` — no requiere login.

## 3. Personaliza `KIRO.md`

Este archivo contiene la guía del proyecto para el asistente IA.
Actualízalo cuando cambies el stack, features o configuración.

## 4. Deploy

- **Vercel**: push a `main` → deploy automático
- **Docker**: `docker compose up -d --build`

## Contacto

- Juan Camilo Botero
- localrankmedellin@gmail.com
- localrank.com.co
