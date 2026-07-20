/**
 * Papelera del CRM — guarda items eliminados para restaurar.
 * Los items se guardan por 30 días antes de eliminarse definitivamente.
 */

import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

export type TrashItem = {
  id: string;
  module: string;
  title: string;
  data: unknown;
  deletedAt: string;
};

const STORAGE_KEY = "crm_trash";
const MAX_DAYS = 30;

export function getTrash(): TrashItem[] {
  const items = loadFromStorage<TrashItem[]>(STORAGE_KEY, []);
  // Auto-clean items older than 30 days
  const now = Date.now();
  const valid = items.filter(i => (now - new Date(i.deletedAt).getTime()) < MAX_DAYS * 86400000);
  if (valid.length !== items.length) saveToStorage(STORAGE_KEY, valid);
  return valid;
}

export function addToTrash(module: string, title: string, data: unknown): void {
  const trash = getTrash();
  trash.unshift({ id: generateId(), module, title, data, deletedAt: new Date().toISOString() });
  // Keep max 100 items
  saveToStorage(STORAGE_KEY, trash.slice(0, 100));
}

export function restoreFromTrash(id: string): TrashItem | null {
  const trash = getTrash();
  const item = trash.find(i => i.id === id);
  if (!item) return null;
  saveToStorage(STORAGE_KEY, trash.filter(i => i.id !== id));
  return item;
}

export function permanentDelete(id: string): void {
  const trash = getTrash();
  saveToStorage(STORAGE_KEY, trash.filter(i => i.id !== id));
}

export function emptyTrash(): void {
  saveToStorage(STORAGE_KEY, []);
}
