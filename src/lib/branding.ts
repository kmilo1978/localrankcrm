/**
 * White-label: nombre del CRM + acento por organización.
 * Presets sobrios del sistema Atlas; para un color personalizado se derivan
 * hover/soft/tint/text y se garantiza contraste con texto blanco.
 */

export type AccentSet = {
  accent: string;
  hover: string;
  soft: string;
  tint: string;
  text: string;
};

export type Branding = {
  name: string;
  accent: string; // hex del acento base elegido
};

export const DEFAULT_BRANDING: Branding = { name: "LocalRank", accent: "#e91e8c" };

/** Presets del handoff (valores exactos). */
export const ACCENT_PRESETS: Record<string, { label: string; set: AccentSet }> = {
  "#e91e8c": {
    label: "LocalRank Rosa",
    set: { accent: "#e91e8c", hover: "#c4186f", soft: "#fce4f3", tint: "#fef5fa", text: "#a01460" },
  },
  "#3f5972": {
    label: "Azul acero",
    set: { accent: "#3f5972", hover: "#334a60", soft: "#dde5ee", tint: "#f3f6f9", text: "#2b4056" },
  },
  "#4b5563": {
    label: "Grafito",
    set: { accent: "#4b5563", hover: "#3b4350", soft: "#e2e5ea", tint: "#f4f5f7", text: "#333a45" },
  },
  "#3f6b66": {
    label: "Verde apagado",
    set: { accent: "#3f6b66", hover: "#335752", soft: "#dcebe8", tint: "#f2f8f6", text: "#2b4a46" },
  },
  "#5f5470": {
    label: "Ciruela",
    set: { accent: "#5f5470", hover: "#4d4459", soft: "#e6e1ec", tint: "#f6f4f8", text: "#443c52" },
  },
};

type Rgb = { r: number; g: number; b: number };

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function hexToRgb(hex: string): Rgb {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mezcla `color` hacia `target` en proporción t (0..1). */
function mix(color: Rgb, target: Rgb, t: number): Rgb {
  return {
    r: color.r + (target.r - color.r) * t,
    g: color.g + (target.g - color.g) * t,
    b: color.b + (target.b - color.b) * t,
  };
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/** Luminancia relativa (WCAG). */
function luminance({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Set completo para cualquier acento: preset exacto si existe; si no, se
 * deriva. Un base demasiado claro (texto blanco ilegible encima) se oscurece
 * hasta contraste ≥ 3:1 con blanco.
 */
export function resolveAccentSet(accentHex: string): AccentSet {
  const preset = ACCENT_PRESETS[accentHex.toLowerCase()];
  if (preset) return preset.set;
  if (!isValidHex(accentHex)) return ACCENT_PRESETS["#3f5972"]!.set;

  let base = hexToRgb(accentHex.toLowerCase());
  // contraste con blanco = (1.05) / (L + 0.05); exigir ≥ 3
  while (1.05 / (luminance(base) + 0.05) < 3 && luminance(base) > 0.005) {
    base = mix(base, BLACK, 0.12);
  }
  return {
    accent: rgbToHex(base),
    hover: rgbToHex(mix(base, BLACK, 0.16)),
    soft: rgbToHex(mix(base, WHITE, 0.82)),
    tint: rgbToHex(mix(base, WHITE, 0.94)),
    text: rgbToHex(mix(base, BLACK, 0.28)),
  };
}

/** CSS de variables para inyectar en el <head> (SSR, sin flash). */
export function accentCssVariables(accentHex: string): string {
  const s = resolveAccentSet(accentHex);
  return `:root{--accent:${s.accent};--accent-hover:${s.hover};--accent-soft:${s.soft};--accent-tint:${s.tint};--accent-text:${s.text};}`;
}

export function normalizeBranding(input: Partial<Branding> | null): Branding {
  const name = input?.name?.trim().slice(0, 30) || DEFAULT_BRANDING.name;
  const accent =
    input?.accent && isValidHex(input.accent)
      ? input.accent.toLowerCase()
      : DEFAULT_BRANDING.accent;
  return { name, accent };
}
