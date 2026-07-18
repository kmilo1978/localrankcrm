# Arquitectura de Desarrollo — Kiro

El desarrollo de LocalRank CRM se realiza con **Kiro.dev** como asistente principal.
Kiro es un entorno de desarrollo con IA que ayuda a construir, modificar y desplegar
el proyecto de forma autónoma.

## Flujo de trabajo

```
┌──────────────────────────────────────────────┐
│  ASISTENTE: Kiro.dev                          │
│  Gobernado por: KIRO.md                       │
│  Rol: desarrollo autónomo guiado por el user  │
└──────────────────────────────────────────────┘
```

## Cómo trabajar con Kiro

1. Dale instrucciones en español o inglés
2. Kiro lee el código, lo modifica, compila y pushea
3. Vercel deploya automáticamente

## Archivos de configuración

- `KIRO.md` — guía de proyecto para el asistente
- `.kiro/steering/` — instrucciones adicionales (si se configuran)
