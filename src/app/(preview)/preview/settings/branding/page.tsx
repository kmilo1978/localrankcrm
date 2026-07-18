"use client";
import { useState, useEffect, useRef } from "react";
import { Check, Globe, Image, Lock, Palette, Shield, Type, Upload } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type BrandingConfig = {
  // Identity
  name: string; tagline: string; logoUrl: string; logoCompactUrl: string; faviconUrl: string;
  primaryColor: string; secondaryColor: string; accentColor: string; bgColor: string; textColor: string;
  font: string; fontHeading: string;
  // Domain
  customDomain: string; appSubdomain: string; sslEnabled: boolean; loginPageBranding: boolean;
  // White-label UI
  hideProviderBranding: boolean; sidebarLabel: string; productName: string; ctaText: string; footerText: string;
  // Legal
  privacyUrl: string; termsUrl: string; legalName: string; legalFooter: string;
};

const DEFAULT: BrandingConfig = {
  name: "LocalRank", tagline: "Enterprise CRM", logoUrl: "", logoCompactUrl: "", faviconUrl: "",
  primaryColor: "#00288e", secondaryColor: "#3b82f6", accentColor: "#10b981", bgColor: "#f7f9fb", textColor: "#191c1e",
  font: "Inter", fontHeading: "Inter",
  customDomain: "", appSubdomain: "", sslEnabled: true, loginPageBranding: true,
  hideProviderBranding: false, sidebarLabel: "CRM", productName: "LocalRank CRM", ctaText: "Nuevo Registro", footerText: "© 2026 LocalRank. Todos los derechos reservados.",
  privacyUrl: "", termsUrl: "", legalName: "", legalFooter: "",
};

const FONTS = ["Inter", "Geist", "Poppins", "Roboto", "Open Sans", "Montserrat", "Lato", "Nunito", "DM Sans", "Plus Jakarta Sans"];
const PRESET_PALETTES = [
  { name: "Enterprise Blue", colors: ["#00288e", "#3b82f6", "#10b981", "#f7f9fb", "#191c1e"] },
  { name: "Modern Purple", colors: ["#7c3aed", "#a855f7", "#f59e0b", "#faf5ff", "#1f2937"] },
  { name: "Ocean Teal", colors: ["#0d9488", "#06b6d4", "#f43f5e", "#f0fdfa", "#134e4a"] },
  { name: "Coral Energy", colors: ["#e11d48", "#fb923c", "#3b82f6", "#fff1f2", "#1f2937"] },
  { name: "Dark Minimal", colors: ["#1f2937", "#4b5563", "#10b981", "#f9fafb", "#111827"] },
  { name: "LocalRank Pink", colors: ["#e91e8c", "#8b5cf6", "#10b981", "#fef5fa", "#1a1a2e"] },
];

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"identity" | "domain" | "whitelabel" | "legal">("identity");
  const logoRef = useRef<HTMLInputElement>(null);
  const compactRef = useRef<HTMLInputElement>(null);
  const favRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setConfig(loadFromStorage("branding_full_config", DEFAULT)); }, []);
  function handleSave() { saveToStorage("branding_full_config", config); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function handleUpload(field: "logoUrl" | "logoCompactUrl" | "faviconUrl", file: File) {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) setConfig({ ...config, [field]: e.target.result as string }); };
    reader.readAsDataURL(file);
  }
  function applyPalette(colors: string[]) { setConfig({ ...config, primaryColor: colors[0]!, secondaryColor: colors[1]!, accentColor: colors[2]!, bgColor: colors[3]!, textColor: colors[4]! }); }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Palette className="h-5 w-5 text-brand" />Marca & White-Label</h3>
        <p className="mt-1 text-sm text-muted-foreground">Personalización completa: identidad visual, dominio, UI white-label y cumplimiento legal.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {[{ key: "identity", label: "Identidad visual", icon: Image }, { key: "domain", label: "Dominio & Acceso", icon: Globe }, { key: "whitelabel", label: "White-label UI", icon: Palette }, { key: "legal", label: "Legal & Cumplimiento", icon: Shield }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-colors ${tab === key ? "bg-brand text-white" : "hover:bg-gray-100"}`}><Icon className="h-3.5 w-3.5" />{label}</button>
        ))}
      </div>

      {/* IDENTITY */}
      {tab === "identity" && (
        <div className="space-y-5">
          {/* Logos */}
          <div className="rounded-lg border bg-white p-5">
            <h4 className="font-medium mb-4">Logos</h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="mb-2 block text-xs font-medium">Logo principal</label>
                {config.logoUrl ? <div className="relative"><img src={config.logoUrl} alt="Logo" className="h-16 w-auto rounded border p-1" /><button onClick={() => setConfig({ ...config, logoUrl: "" })} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white text-[8px]">✕</button></div> : <label className="flex h-16 cursor-pointer items-center justify-center rounded-lg border border-dashed hover:bg-gray-50"><Upload className="h-5 w-5 text-muted-foreground" /><input type="file" ref={logoRef} className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUpload("logoUrl", e.target.files[0]); }} /></label>}
                <p className="mt-1 text-[9px] text-muted-foreground">SVG o PNG. Mín 200x60px</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium">Logo compacto</label>
                {config.logoCompactUrl ? <div className="relative"><img src={config.logoCompactUrl} alt="Compact" className="h-16 w-16 rounded border p-1 object-contain" /><button onClick={() => setConfig({ ...config, logoCompactUrl: "" })} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white text-[8px]">✕</button></div> : <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed hover:bg-gray-50"><Upload className="h-5 w-5 text-muted-foreground" /><input type="file" ref={compactRef} className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUpload("logoCompactUrl", e.target.files[0]); }} /></label>}
                <p className="mt-1 text-[9px] text-muted-foreground">Cuadrado. Para sidebar</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium">Favicon</label>
                {config.faviconUrl ? <div className="relative"><img src={config.faviconUrl} alt="Favicon" className="h-10 w-10 rounded border p-1" /><button onClick={() => setConfig({ ...config, faviconUrl: "" })} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white text-[8px]">✕</button></div> : <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-dashed hover:bg-gray-50"><Upload className="h-4 w-4 text-muted-foreground" /><input type="file" ref={favRef} className="hidden" accept="image/*,.ico" onChange={(e) => { if (e.target.files?.[0]) handleUpload("faviconUrl", e.target.files[0]); }} /></label>}
                <p className="mt-1 text-[9px] text-muted-foreground">ICO/SVG 32x32</p>
              </div>
            </div>
          </div>

          {/* Palette */}
          <div className="rounded-lg border bg-white p-5">
            <h4 className="font-medium mb-3">Paleta HEX</h4>
            <div className="mb-4 flex flex-wrap gap-2">{PRESET_PALETTES.map((p) => (<button key={p.name} onClick={() => applyPalette(p.colors)} className="flex items-center gap-2 rounded border px-3 py-2 text-xs hover:bg-gray-50"><div className="flex gap-0.5">{p.colors.map((c, i) => <span key={i} className="h-4 w-4 rounded-full border" style={{ backgroundColor: c }} />)}</div>{p.name}</button>))}</div>
            <div className="grid grid-cols-5 gap-3">
              {[{ key: "primaryColor", label: "Primario" }, { key: "secondaryColor", label: "Secundario" }, { key: "accentColor", label: "Acento" }, { key: "bgColor", label: "Fondo" }, { key: "textColor", label: "Texto" }].map(({ key, label }) => (
                <div key={key}><label className="mb-1 block text-[10px] font-medium">{label}</label><div className="flex items-center gap-1"><input type="color" value={(config as unknown as Record<string, string>)[key]} onChange={(e) => setConfig({ ...config, [key]: e.target.value })} className="h-8 w-8 rounded border cursor-pointer" /><input value={(config as unknown as Record<string, string>)[key]} onChange={(e) => setConfig({ ...config, [key]: e.target.value })} className="flex-1 rounded border px-2 py-1 text-[10px] font-mono" /></div></div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="rounded-lg border bg-white p-5">
            <h4 className="font-medium mb-3 flex items-center gap-2"><Type className="h-4 w-4" />Tipografías</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="mb-1 block text-xs font-medium">Fuente body</label><select value={config.font} onChange={(e) => setConfig({ ...config, font: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-medium">Fuente headings</label><select value={config.fontHeading} onChange={(e) => setConfig({ ...config, fontHeading: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
            </div>
          </div>

          {/* Name */}
          <div className="rounded-lg border bg-white p-5 grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs font-medium">Nombre del producto</label><input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
            <div><label className="mb-1 block text-xs font-medium">Tagline</label><input value={config.tagline} onChange={(e) => setConfig({ ...config, tagline: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
          </div>
        </div>
      )}

      {/* DOMAIN */}
      {tab === "domain" && (
        <div className="space-y-5">
          <div className="rounded-lg border bg-white p-5 space-y-4">
            <h4 className="font-medium flex items-center gap-2"><Globe className="h-4 w-4" />Dominio personalizado</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs font-medium">Custom Domain (app)</label><input value={config.customDomain} onChange={(e) => setConfig({ ...config, customDomain: e.target.value })} placeholder="crm.tuempresa.com" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /><p className="mt-1 text-[9px] text-muted-foreground">CNAME → localrankcrm-livid.vercel.app</p></div>
              <div><label className="mb-1 block text-xs font-medium">Subdominio por cliente</label><input value={config.appSubdomain} onChange={(e) => setConfig({ ...config, appSubdomain: e.target.value })} placeholder="cliente.tudominio.com" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /><p className="mt-1 text-[9px] text-muted-foreground">Cada tenant accede desde su subdominio</p></div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.sslEnabled} onChange={(e) => setConfig({ ...config, sslEnabled: e.target.checked })} className="accent-[var(--accent)]" /><Lock className="h-3.5 w-3.5 text-green-600" />SSL/HTTPS automático</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.loginPageBranding} onChange={(e) => setConfig({ ...config, loginPageBranding: e.target.checked })} className="accent-[var(--accent)]" />Login page con branding</label>
            </div>
          </div>
          <div className="rounded border border-dashed bg-gray-50 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Configuración DNS:</p>
            <p>1. Agrega un registro CNAME en tu proveedor de dominio:</p>
            <code className="block mt-1 rounded bg-white border px-3 py-2 font-mono">crm.tuempresa.com → cname.vercel-dns.com</code>
            <p className="mt-2">2. Vercel detectará el dominio y emitirá certificado SSL automáticamente.</p>
          </div>
        </div>
      )}

      {/* WHITE-LABEL */}
      {tab === "whitelabel" && (
        <div className="space-y-5">
          <div className="rounded-lg border bg-white p-5 space-y-4">
            <h4 className="font-medium">Personalización de UI</h4>
            <label className="flex items-center gap-3 rounded border p-3 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={config.hideProviderBranding} onChange={(e) => setConfig({ ...config, hideProviderBranding: e.target.checked })} className="accent-[var(--accent)] h-4 w-4" />
              <div><p className="text-sm font-medium">Ocultar branding del proveedor</p><p className="text-xs text-muted-foreground">Elimina toda referencia a LocalRank. El CRM aparece como tu producto.</p></div>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="mb-1 block text-xs font-medium">Nombre del producto visible</label><input value={config.productName} onChange={(e) => setConfig({ ...config, productName: e.target.value })} placeholder="Mi CRM" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium">Label del sidebar</label><input value={config.sidebarLabel} onChange={(e) => setConfig({ ...config, sidebarLabel: e.target.value })} placeholder="CRM" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium">Texto del botón CTA principal</label><input value={config.ctaText} onChange={(e) => setConfig({ ...config, ctaText: e.target.value })} placeholder="Nuevo Registro" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium">Texto del footer</label><input value={config.footerText} onChange={(e) => setConfig({ ...config, footerText: e.target.value })} placeholder="© 2026 Mi Empresa" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
            </div>
          </div>
          <div className="rounded border bg-gray-50 p-4">
            <p className="text-xs font-medium mb-2">Vista previa del sidebar:</p>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--sidebar-bg)] p-3 w-48">
              {config.logoCompactUrl ? <img src={config.logoCompactUrl} className="h-6 w-6 rounded" alt="" /> : <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-bold text-white">{config.name.charAt(0)}</span>}
              <div><p className="text-xs font-bold text-white">{config.productName || config.name}</p><p className="text-[9px] text-white/60">{config.sidebarLabel}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL */}
      {tab === "legal" && (
        <div className="space-y-5">
          <div className="rounded-lg border bg-white p-5 space-y-4">
            <h4 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4" />Cumplimiento y confianza</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="mb-1 block text-xs font-medium">URL Política de Privacidad</label><input value={config.privacyUrl} onChange={(e) => setConfig({ ...config, privacyUrl: e.target.value })} placeholder="https://tuempresa.com/privacidad" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium">URL Términos y Condiciones</label><input value={config.termsUrl} onChange={(e) => setConfig({ ...config, termsUrl: e.target.value })} placeholder="https://tuempresa.com/terminos" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium">Razón social</label><input value={config.legalName} onChange={(e) => setConfig({ ...config, legalName: e.target.value })} placeholder="Mi Empresa S.A.S." className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs font-medium">Footer legal</label><input value={config.legalFooter} onChange={(e) => setConfig({ ...config, legalFooter: e.target.value })} placeholder="NIT: 900.123.456-7 · Medellín, Colombia" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
            </div>
            <p className="text-[10px] text-muted-foreground">Estos links se mostrarán en la página de login, footer del CRM y emails transaccionales.</p>
          </div>
        </div>
      )}

      <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar configuración"}</button>
    </div>
  );
}
