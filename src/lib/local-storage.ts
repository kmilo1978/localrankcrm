/**
 * localStorage persistence for CRM modules — workspace-scoped.
 * Each workspace gets its own isolated data namespace.
 * Global data (shared across workspaces) uses the "global" prefix.
 */

const GLOBAL_KEYS = [
  "workspaces_v2", "workspace_clients", "workspace_max_limit",
  "appearance_config", "crm_integrations", "mcp_servers",
  "team_members", "team_invitations", "team_module_access",
  "vault_items", "vault_master_hash", "crm_tags",
  "localrank_nav_main", "localrank_save_session", "localrank_session_saved_at",
  "module_blur_config",
];

/** Get the active workspace ID */
function getActiveWorkspace(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem("localrank_active_workspace") || "default";
}

/** Set the active workspace */
export function setActiveWorkspace(wsId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("localrank_active_workspace", wsId);
}

/** Get active workspace ID (exposed for components) */
export function getActiveWorkspaceId(): string {
  return getActiveWorkspace();
}

/** Build the storage key with workspace prefix */
function buildKey(key: string): string {
  // Global keys are NOT workspace-scoped
  if (GLOBAL_KEYS.includes(key)) return `localrank_${key}`;
  // Everything else is scoped to the active workspace
  const ws = getActiveWorkspace();
  return `localrank_ws_${ws}_${key}`;
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const fullKey = buildKey(key);
    const stored = localStorage.getItem(fullKey);
    if (!stored) {
      // Migration: check if data exists in old (non-scoped) format
      const oldKey = `localrank_${key}`;
      const oldData = localStorage.getItem(oldKey);
      if (oldData && !GLOBAL_KEYS.includes(key)) {
        // Migrate old data to current workspace
        localStorage.setItem(fullKey, oldData);
        return JSON.parse(oldData) as T;
      }
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Get all workspace IDs that have data */
export function getWorkspaceIds(): string[] {
  if (typeof window === "undefined") return [];
  const ids = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("localrank_ws_")) {
      const wsId = key.split("_")[2];
      if (wsId) ids.add(wsId);
    }
  }
  return [...ids];
}

/** Export all data for backup */
export function exportAllData(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("localrank_")) {
      try { data[key] = JSON.parse(localStorage.getItem(key) || "null"); } catch { data[key] = localStorage.getItem(key); }
    }
  }
  return data;
}

/** Import backup data */
export function importAllData(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith("localrank_")) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
}
