# Guion E2E — 002: Rediseño Atlas + White-label

> Conducido con Playwright (script) contra `pnpm dev` con mocks.

## Regresión funcional sobre el rediseño (ejecutado ✅)

1. Inbound mock → visible en la bandeja SIN recargar (SSE). ✅
2. Abrir conversación → responder desde el composer nuevo (Enter envía). ✅
3. Colapsar el panel de detalles (chevron) → reabrir desde el header del chat;
   preferencia persistida en localStorage. ✅
4. Conversación con ventana cerrada → aviso + selector de plantilla aprobada. ✅
5. Stepper de etapas en el panel → clic en un paso mueve el lead (PATCH 200)
   y el kanban lo refleja. ✅
6. Filtros Todas/No leídas y búsqueda en la lista. ✅ (visual)

## White-label (ejecutado ✅)

7. PUT nombre "El Martillo" + acento Verde apagado →
   ✅ brand de la nav, `<title>` y variable CSS `--accent: #3f6b66` aplicados
   (SSR, `router.refresh()`); el login PÚBLICO muestra la marca; restaurar a
   defaults funciona.
8. Solo el owner puede cambiar la marca (PUT con rol member → 403).
9. Unit tests: presets exactos, derivación de color personalizado con ajuste
   de contraste, normalización (vacío→default, hex inválido→default). ✅

## Fidelidad visual (juicio humano pendiente)

Capturas en `docs/screenshots/` comparadas contra el handoff: layout 4
columnas, tokens, burbujas, stepper, chips. Revisión estética final: equipo.
