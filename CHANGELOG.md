# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

---

## [2026-07-20]

### Agregado
- **Bóveda — Generador de claves seguras**: Panel colapsable en la parte superior de la bóveda que genera contraseñas criptográficamente seguras (usa `crypto.getRandomValues`). Opciones configurables: longitud (6-64), mayúsculas, minúsculas, números y símbolos. Botón copiar integrado.
- **Sistema de etiquetas compartido** (`src/lib/tags.ts`): Store centralizado para etiquetas del CRM. Tipo `CrmTag` con nombre, color, descripción y módulos asignados. Funciones CRUD exportables: `loadTags`, `saveTags`, `createTag`, `updateTag`, `deleteTag`, `getTagsByModule`, `getTagColor`, `addModuleToTag`.
- **Notas — Etiquetas personalizables**: Las notas ahora usan el sistema compartido de etiquetas. Soporte para múltiples etiquetas por nota, colores personalizados (20 presets + hex custom), descripción, y posibilidad de importar etiquetas desde otros módulos del CRM.
- **Labels — Integración compartida**: El módulo de etiquetas ahora comparte store con todo el CRM. Filtro por módulo (contactos, notas, tareas, oportunidades). Edición con selector de módulos donde aplica cada etiqueta.

### Corregido
- **Bóveda — Modal cambiar clave**: Reemplazado `prompt()` nativo (que causaba popup vacío) por modal propio integrado con input de contraseña y confirmación.
