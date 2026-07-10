# Guion E2E — US4: Laboratorio (SIEMPRE contra ai-mock, determinista)

> Conducido con Playwright (MCP) contra `pnpm dev` con ai-mock. El KB inicial
> NO cubre garantías/devoluciones (hueco intencional del guion).

## Preparación

1. `DELETE /api/dev/wa-mock/outbox` — el outbox debe seguir VACÍO al final.
2. Agente configurado (US3) y proveedor de IA (mock) activo.

## Corrida 1

3. En `/lab`: pulsar "Correr evaluación".
   ✅ La UI muestra el subtítulo permanente "Sandbox interno — no envía
   mensajes reales", progreso en vivo (n/6) sin bloquear la navegación.
4. Al terminar:
   ✅ Reporte con score global (5 verdes + 1 rojo ≈ 83), tarjeta de la persona
   "Pregunta fuera del conocimiento" con hallazgo `fuera_de_kb`, evidencia y
   sugerencia; transcript visible por persona.
   ✅ La persona "Pide un humano" terminó en handoff (guion cortado).
   ✅ `GET /api/dev/wa-mock/outbox` → VACÍO (ningún mensaje salió a WhatsApp).
   ✅ Las conversaciones de prueba NO aparecen en la bandeja.

## Cerrar el loop

5. En el hallazgo: "Agregar al conocimiento" → editar/confirmar → guardado en
   el KB (visible en `/agent`).
6. Re-correr la evaluación.
   ✅ El historial muestra 2 corridas; la nueva con score 100 y delta +17.

## Caminos infelices

7. Con una corrida en curso, `POST /api/lab/runs` → 409 `run_in_progress`.
8. Corridas huérfanas: cubierto por `src/instrumentation.ts` al boot
   (verificación en el checkpoint de compose, donde el server se reinicia).
