"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Image, Palette, Type, Upload } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type BrandingConfig = {
  name: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  borderRadius: string;
  darkMode: boolean;
};

const DEFAULT: BrandingConfig = {
  name: "LocalRank",
  tagline: "CRM Inteligente",
  logoUrl: "",
  primaryColor: "#e91e8c",
  secondaryColor: "#3b82f6",
  accentColor: "#10b981",
  font: "Inter",
  borderRadius: "8px",
  darkMode: false,
};

const FONTS = ["Inter", "Geist", "Poppins", "Roboto", "Open Sans", "Montserrat", "Lato", "Nunito", "DM Sans", "Plus Jakarta Sans"];
const RADIUS_OPTIONS = ["0px", "4px", "8px", "12px", "16px", "9999px"];

const COLOR_PRESETS = [
  { name: "Rosa LocalRank", primary: "#e91e8c", secondary: "#3b82f6", accent: "#10b981" },
  { name: "Azul Corporativo", primary: "#1e40af", secondary: "#6366f1", accent: "#f59e0b" },
  { name: "Verde Moderno", primary: "#059669", secondary: "#0ea5e9", accent: "#f43f5e" },
  { name: "Púrpura Elegante", primary: "#7c3aed", secondary: "#ec4899", accent: "#f59e0b" },
  { name: "Naranja Energía", primary: "#ea580c", secondary: "#0891b2", accent: "#16a34a" },
  { name: "Gris Minimalista", primary: "#374151", secondary: "#6b7280", accent: "#e91e8c" },
];

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setConfig(loadFromStorage("branding_config", DEFAULT)); }, []);

  function handleSave() {
    saveToStorage("branding_config", config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setConfig({ ...config, logoUrl: url });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function applyPreset(preset: typeof COLOR_PRESETS[0]) {
    setConfig({ ...config, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Palette className="h-5 w-5 text-brand" />Marca y Personalización</h3>
        <p className="mt-1 text-sm text-muted-foreground">Personaliza la apariencia del CRM con tu marca, colores y tipografía.</p>
      </div>

      {/* Logo + Name */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h4 className="font-medium flex items-center gap-2"><Image className="h-4 w-4" />Identidad</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre del CRM</label>
            <input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tagline / Subtítulo</label>
            <input value={config.tagline} onChange={(e) => setConfig({ ...config, tagline: e.target.value })} placeholder="CRM Inteligente" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Logo</label>
          <div className="flex items-center gap-4">
            {config.logoUrl ? (
              <div className="relative h-16 w-16 rounded-lg border overflow-hidden">
                <img src={config.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                <button onClick={() => setConfig({ ...config, logoUrl: "" })} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white text-xs">✕</button>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed bg-gray-50 text-2xl font-bold text-brand">
                {config.name.charAt(0)}
              </div>
            )}
            <div>
              <input type="file" ref={fileRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                <Upload className="h-4 w-4" />Subir logo
              </button>
              <p className="mt-1 text-xs text-muted-foreground">PNG, SVG o JPG. Recomendado 200x200px</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h4 className="font-medium flex items-center gap-2"><Palette className="h-4 w-4" />Colores</h4>
        
        {/* Presets */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase">Presets de color</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COLOR_PRESETS.map((p) => (
              <button key={p.name} onClick={() => applyPreset(p)} className="flex items-center gap-2 rounded-md border p-2 hover:bg-gray-50 text-left">
                <div className="flex gap-1">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: p.primary }} />
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: p.secondary }} />
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="text-xs">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom colors */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Color primario</label>
            <div className="flex items-center gap-2">
              <input type="color" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="h-9 w-9 rounded border cursor-pointer" />
              <input value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="flex-1 rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Color secundario</label>
            <div className="flex items-center gap-2">
              <input type="color" value={config.secondaryColor} onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })} className="h-9 w-9 rounded border cursor-pointer" />
              <input value={config.secondaryColor} onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })} className="flex-1 rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Color acento</label>
            <div className="flex items-center gap-2">
              <input type="color" value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} className="h-9 w-9 rounded border cursor-pointer" />
              <input value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} className="flex-1 rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded text-sm font-bold text-white" style={{ backgroundColor: config.primaryColor }}>{config.name.charAt(0)}</div>
            <span className="font-semibold" style={{ color: config.primaryColor }}>{config.name}</span>
            <button className="rounded-md px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: config.primaryColor }}>Botón primario</button>
            <button className="rounded-md px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: config.secondaryColor }}>Secundario</button>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: config.accentColor }}>Badge</span>
          </div>
        </div>
      </div>

      {/* Typography + Style */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h4 className="font-medium flex items-center gap-2"><Type className="h-4 w-4" />Tipografía y Estilo</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Fuente</label>
            <select value={config.font} onChange={(e) => setConfig({ ...config, font: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="mt-1 text-xs text-muted-foreground" style={{ fontFamily: config.font }}>Así se ve: {config.font}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Border radius</label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button key={r} onClick={() => setConfig({ ...config, borderRadius: r })} className={`flex h-9 w-9 items-center justify-center border text-xs ${config.borderRadius === r ? "border-brand bg-brand-tint" : "hover:bg-gray-50"}`} style={{ borderRadius: r }}>
                  Aa
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
          {saved ? "✓ Guardado" : "Guardar marca"}
        </button>
        <button onClick={() => setConfig(DEFAULT)} className="rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-gray-50">Restaurar defaults</button>
      </div>
    </div>
  );
}
