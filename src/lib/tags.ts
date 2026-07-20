/**
 * Sistema de etiquetas compartido para todo el CRM.
 * Cualquier módulo puede importar y usar estas etiquetas.
 * Se persisten en localStorage bajo la clave "crm_tags".
 */

import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

export type CrmTag = {
  id: string;
  name: string;
  color: string;
  description: string;
  /** Módulos donde se usa esta etiqueta */
  modules: string[];
};

export const TAG_PRESET_COLORS = [
  "#e91e8c", "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#f43f5e", "#78716c", "#475569",
];

const STORAGE_KEY = "crm_tags";

const SEED_TAGS: CrmTag[] = [
  { id: "tag1", name: "Cliente VIP", color: "#f59e0b", description: "Clientes de alto valor", modules: ["contactos", "notas"] },
  { id: "tag2", name: "Urgente", color: "#ef4444", description: "Requiere atención inmediata", modules: ["notas", "tareas"] },
  { id: "tag3", name: "Prospecto caliente", color: "#e91e8c", description: "Alta probabilidad de cierre", modules: ["contactos"] },
  { id: "tag4", name: "En negociación", color: "#8b5cf6", description: "En proceso de negociación activa", modules: ["contactos"] },
  { id: "tag5", name: "Renovación", color: "#06b6d4", description: "Contrato próximo a renovar", modules: ["contactos", "tareas"] },
  { id: "tag6", name: "Nuevo lead", color: "#22c55e", description: "Lead recién ingresado", modules: ["contactos"] },
  { id: "tag7", name: "Soporte", color: "#3b82f6", description: "Requiere soporte post-venta", modules: ["contactos", "notas"] },
  { id: "tag8", name: "Inactivo", color: "#78716c", description: "Sin actividad reciente", modules: ["contactos"] },
  { id: "tag9", name: "Reunión", color: "#3b82f6", description: "Relacionado con reuniones", modules: ["notas"] },
  { id: "tag10", name: "Seguimiento", color: "#10b981", description: "Para seguimiento", modules: ["notas", "tareas"] },
  { id: "tag11", name: "Ideas", color: "#8b5cf6", description: "Ideas y brainstorming", modules: ["notas"] },
  { id: "tag12", name: "Producto", color: "#f59e0b", description: "Relacionado con producto", modules: ["notas", "tareas"] },
  { id: "tag13", name: "General", color: "#78716c", description: "Categoría general", modules: ["notas", "tareas", "contactos"] },
];

/** Cargar todas las etiquetas del CRM */
export function loadTags(): CrmTag[] {
  return loadFromStorage<CrmTag[]>(STORAGE_KEY, SEED_TAGS);
}

/** Guardar todas las etiquetas */
export function saveTags(tags: CrmTag[]): void {
  saveToStorage(STORAGE_KEY, tags);
}

/** Obtener etiquetas filtradas por módulo */
export function getTagsByModule(module: string): CrmTag[] {
  return loadTags().filter((t) => t.modules.includes(module));
}

/** Crear una nueva etiqueta */
export function createTag(name: string, color: string, description: string, modules: string[]): CrmTag {
  const tags = loadTags();
  const newTag: CrmTag = { id: generateId(), name, color, description, modules };
  saveTags([...tags, newTag]);
  return newTag;
}

/** Actualizar una etiqueta existente */
export function updateTag(id: string, updates: Partial<Omit<CrmTag, "id">>): void {
  const tags = loadTags();
  saveTags(tags.map((t) => (t.id === id ? { ...t, ...updates } : t)));
}

/** Eliminar una etiqueta */
export function deleteTag(id: string): void {
  const tags = loadTags();
  saveTags(tags.filter((t) => t.id !== id));
}

/** Obtener color de una etiqueta por nombre */
export function getTagColor(name: string): string {
  const tags = loadTags();
  return tags.find((t) => t.name === name)?.color || "#78716c";
}

/** Agregar un módulo a una etiqueta existente */
export function addModuleToTag(tagId: string, module: string): void {
  const tags = loadTags();
  saveTags(
    tags.map((t) =>
      t.id === tagId && !t.modules.includes(module)
        ? { ...t, modules: [...t.modules, module] }
        : t
    )
  );
}

/** Quitar un módulo de una etiqueta */
export function removeModuleFromTag(tagId: string, module: string): void {
  const tags = loadTags();
  saveTags(
    tags.map((t) =>
      t.id === tagId ? { ...t, modules: t.modules.filter((m) => m !== module) } : t
    )
  );
}
