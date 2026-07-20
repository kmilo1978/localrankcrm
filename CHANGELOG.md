# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

---

## [2026-07-20]

### Agregado
- **Módulo Focus** (`/focus`): Modo enfoque con timer Pomodoro (15/25/45/60 min), progreso circular, tareas de enfoque con prioridad, botón "Enfocar" para vincular tarea al timer, historial de sesiones, estadísticas diarias.
- **Módulo Archivos & IA** (`/files`): Importar archivos (txt, csv, json, md, imágenes, pdf), visualizarlos inline, y preguntarle a la IA sobre su contenido. La IA extrae emails, teléfonos, hace resúmenes y busca dentro del archivo.
- **Menú personalizable**: Botón ⚙️ junto a "Más módulos" activa modo edición. Puedes agregar (📌) o quitar (✕) módulos del menú principal. Se guarda en localStorage.
- **Contactos — Detección de duplicados**: Botón "Duplicados" que escanea contactos por teléfono, email o nombre+empresa coincidente. Modal con opción de fusionar conservando datos de ambos registros.
- **Contactos — Transferencia de leads**: Botón "Transferir a Prospección" en cada contacto para moverlo al módulo de cold-contacts/prospección.
- **Checklists — Etiquetas y proyectos**: Campo "Proyecto" y selector de etiquetas compartidas (tags del CRM) al crear checklists. Las etiquetas se muestran en cada card con su color.
- **Calendario — Modal sincronización**: El botón "Sincronizar" ahora abre un modal con opciones (Google Calendar, Outlook, Apple Calendar), valida API key de Composio antes de conectar, feedback visual y toast de confirmación.
- **Componente ViewToggle** (`src/components/view-toggle.tsx`): Selector de vistas reutilizable para todo el CRM. Soporta: Lista, Kanban, Tablero (grid), Calendario y Mapa mental. Cada módulo elige cuáles mostrar.
- **Tareas — Vistas múltiples**: Lista (original), Kanban (columnas por estado), Calendario (mes con tareas por fecha), Tablero (cards compactas en grid).
- **Notas — Vistas múltiples**: Grid (original, cards), Lista (filas compactas), Board (columnas kanban por categoría/etiqueta).
- **Notas — Enviar a recordatorio**: Botón "Recordatorio" en el modal de nota que crea un recordatorio automático programado a 1 hora desde ahora, con el título y contenido de la nota.
- **Checklists — Bloqueo**: Botón para bloquear/desbloquear checklists. Cuando está bloqueado, no se pueden marcar, agregar ni eliminar items.
- **Checklists — Paginación**: Navegación por páginas (8 checklists por página) con controles anterior/siguiente.
- **Checklists — Categorías**: Cada checklist puede tener una categoría asignada. Filtro por categoría en la barra superior.
- **Checklists — Búsqueda**: Campo de búsqueda por título o cliente.
- **Bóveda — Generador de claves seguras**: Panel colapsable en la parte superior de la bóveda que genera contraseñas criptográficamente seguras (usa `crypto.getRandomValues`). Opciones configurables: longitud (6-64), mayúsculas, minúsculas, números y símbolos. Botón copiar integrado.
- **Sistema de etiquetas compartido** (`src/lib/tags.ts`): Store centralizado para etiquetas del CRM. Tipo `CrmTag` con nombre, color, descripción y módulos asignados. Funciones CRUD exportables: `loadTags`, `saveTags`, `createTag`, `updateTag`, `deleteTag`, `getTagsByModule`, `getTagColor`, `addModuleToTag`.
- **Notas — Etiquetas personalizables**: Las notas ahora usan el sistema compartido de etiquetas. Soporte para múltiples etiquetas por nota, colores personalizados (20 presets + hex custom), descripción, y posibilidad de importar etiquetas desde otros módulos del CRM.
- **Labels — Integración compartida**: El módulo de etiquetas ahora comparte store con todo el CRM. Filtro por módulo (contactos, notas, tareas, oportunidades). Edición con selector de módulos donde aplica cada etiqueta.

### Corregido
- **Radar — Importación email/teléfono**: La sincronización con la extensión ahora importa correctamente email y teléfono (acepta campos `email`, `correo`, `phone`, `telefono`). Los teléfonos se aceptan en cualquier formato con indicativo.
- **Radar — Editable**: Modal completo de edición para cada clip (título, URL, email, teléfono, notas, descripción, carpeta, etiquetas). Botón "Abrir página" para reabrir la URL guardada.
- **Radar — Exportar a Pipeline**: Botón para enviar cualquier clip directamente al Pipeline de ventas.
- **ToDo — Modular**: Cada item ahora tiene botones para clonar, mover entre periodos (diario→semanal→mensual) y enviar a recordatorio.
- **Checklists — Mover cards**: Botones ↑↓ para reorganizar el orden de los checklists (subir/bajar).
- **Menú — Reorganizado**: Módulos principales (12) siempre visibles, el resto (26) en sección colapsable "Más módulos".
- **Bóveda — Modal cambiar clave**: Reemplazado `prompt()` nativo (que causaba popup vacío) por modal propio integrado con input de contraseña y confirmación.
