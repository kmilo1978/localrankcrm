"use client";
import { useState, useEffect } from "react";
import { BarChart3, Check, Copy, Globe, Plus, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type PixelConfig = { id: string; platform: string; pixelId: string; enabled: boolean };
type UtmLink = { id: string; url: string; source: string; medium: string; campaign: string; content: string; generated: string };

const SEED_PIXELS: PixelConfig[] = [
  { id: "px1", platform: "meta_pixel", pixelId: "", enabled: false },
  { id: "px2", platform: "google_analytics", pixelId: "", enabled: false },
  { id: "px3", platform: "google_ads", pixelId: "", enabled: false },
  { id: "px4", platform: "google_search_console", pixelId: "", enabled: false },
];

const PLATFORMS: Record<string, { name: string; placeholder: string; color: string; docs: string }> = {
  meta_pixel: { name: "Meta Pixel (Facebook)", placeholder: "Pixel ID: 123456789012345", color: "bg-blue-100 text-blue-700", docs: "https://www.facebook.com/business/help/952192354843755" },
  google_analytics: { name: "Google Analytics 4", placeholder: "Measurement ID: G-XXXXXXXXXX", color: "bg-amber-100 text-amber-700", docs: "https://support.google.com/analytics/answer/9304153" },
  google_ads: { name: "Google Ads", placeholder: "Conversion ID: AW-XXXXXXXXX", color: "bg-green-100 text-green-700", docs: "https://support.google.com/google-ads/answer/6095821" },
  google_search_console: { name: "Google Search Console", placeholder: "Verification: google-site-verification=xxx", color: "bg-red-100 text-red-700", docs: "https://search.google.com/search-console" },
  tiktok_pixel: { name: "TikTok Pixel", placeholder: "Pixel ID: CXXXXXXXXXXXXXXXXX", color: "bg-gray-900 text-white", docs: "https://ads.tiktok.com/help/article/tiktok-pixel" },
  linkedin_insight: { name: "LinkedIn Insight Tag", placeholder: "Partner ID: 1234567", color: "bg-sky-100 text-sky-700", docs: "https://www.linkedin.com/help/lms/answer/a418880" },
};

export default function TrackingPage() {
  const [pixels, setPixels] = useState<PixelConfig[]>([]);
  const [utmLinks, setUtmLinks] = useState<UtmLink[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [utmForm, setUtmForm] = useState({ url: "", source: "", medium: "", campaign: "", content: "" });
  const [showAddPixel, setShowAddPixel] = useState(false);
  const [newPixelPlatform, setNewPixelPlatform] = useState("tiktok_pixel");

  useEffect(() => {
    setPixels(loadFromStorage("tracking_pixels", SEED_PIXELS));
    setUtmLinks(loadFromStorage("utm_links", []));
  }, []);
  function savePixels(u: PixelConfig[]) { setPixels(u); saveToStorage("tracking_pixels", u); }
  function saveUtm(u: UtmLink[]) { setUtmLinks(u); saveToStorage("utm_links", u); }

  function handleSave() { savePixels(pixels); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function updatePixel(id: string, field: "pixelId" | "enabled", value: string | boolean) { savePixels(pixels.map((p) => p.id === id ? { ...p, [field]: value } : p)); }
  function addPixel() { savePixels([...pixels, { id: generateId(), platform: newPixelPlatform, pixelId: "", enabled: false }]); setShowAddPixel(false); }
  function removePixel(id: string) { savePixels(pixels.filter((p) => p.id !== id)); }

  function generateUtm() {
    if (!utmForm.url.trim() || !utmForm.source.trim()) return;
    const params = new URLSearchParams();
    if (utmForm.source) params.set("utm_source", utmForm.source);
    if (utmForm.medium) params.set("utm_medium", utmForm.medium);
    if (utmForm.campaign) params.set("utm_campaign", utmForm.campaign);
    if (utmForm.content) params.set("utm_content", utmForm.content);
    const base = utmForm.url.includes("?") ? `${utmForm.url}&` : `${utmForm.url}?`;
    const generated = `${base}${params.toString()}`;
    saveUtm([{ id: generateId(), ...utmForm, generated }, ...utmLinks]);
    setUtmForm({ url: "", source: "", medium: "", campaign: "", content: "" });
  }

  function copy(text: string, id: string) { navigator.clipboard.writeText(text).catch(() => {}); setCopied(id); setTimeout(() => setCopied(null), 2000); }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-brand" />Tracking & Pixels</h3>
        <p className="mt-1 text-sm text-muted-foreground">Configura píxeles de seguimiento, analytics y generador de UTMs.</p>
      </div>

      {/* Pixels */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Píxeles y Tags</h4>
          <button onClick={() => setShowAddPixel(!showAddPixel)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Agregar</button>
        </div>
        {showAddPixel && (
          <div className="mb-3 flex gap-2 items-center">
            <select value={newPixelPlatform} onChange={(e) => setNewPixelPlatform(e.target.value)} className="rounded border px-3 py-2 text-sm flex-1">
              {Object.entries(PLATFORMS).filter(([k]) => !pixels.some((p) => p.platform === k)).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
            <button onClick={addPixel} className="rounded bg-brand px-3 py-2 text-xs text-white">Agregar</button>
            <button onClick={() => setShowAddPixel(false)} className="text-xs text-muted-foreground">✕</button>
          </div>
        )}
        <div className="space-y-3">
          {pixels.map((px) => {
            const platform = PLATFORMS[px.platform];
            if (!platform) return null;
            return (
              <div key={px.id} className={`rounded-lg border p-4 ${px.enabled && px.pixelId ? "border-green-200 bg-green-50/30" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${platform.color}`}>{platform.name}</span>
                    {px.enabled && px.pixelId && <Check className="h-3.5 w-3.5 text-green-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={px.enabled} onChange={(e) => updatePixel(px.id, "enabled", e.target.checked)} className="accent-[var(--accent)]" />{px.enabled ? "Activo" : "OFF"}</label>
                    <button onClick={() => removePixel(px.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <input value={px.pixelId} onChange={(e) => updatePixel(px.id, "pixelId", e.target.value)} placeholder={platform.placeholder} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                <a href={platform.docs} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[10px] text-brand hover:underline">Ver documentación →</a>
              </div>
            );
          })}
        </div>
      </div>

      {/* UTM Builder */}
      <div className="rounded-lg border bg-white p-5">
        <h4 className="font-medium flex items-center gap-2 mb-4"><Globe className="h-4 w-4" />Generador de UTMs</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="col-span-full"><label className="mb-1 block text-xs font-medium">URL destino *</label><input value={utmForm.url} onChange={(e) => setUtmForm({ ...utmForm, url: e.target.value })} placeholder="https://tusitio.com/landing" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs font-medium">utm_source *</label><input value={utmForm.source} onChange={(e) => setUtmForm({ ...utmForm, source: e.target.value })} placeholder="facebook, google, whatsapp" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs font-medium">utm_medium</label><input value={utmForm.medium} onChange={(e) => setUtmForm({ ...utmForm, medium: e.target.value })} placeholder="cpc, email, social, organic" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs font-medium">utm_campaign</label><input value={utmForm.campaign} onChange={(e) => setUtmForm({ ...utmForm, campaign: e.target.value })} placeholder="promo_julio, black_friday" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
          <div><label className="mb-1 block text-xs font-medium">utm_content</label><input value={utmForm.content} onChange={(e) => setUtmForm({ ...utmForm, content: e.target.value })} placeholder="banner_hero, cta_footer" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
        </div>
        <button onClick={generateUtm} className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Generar URL</button>

        {utmLinks.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">URLs generadas:</p>
            {utmLinks.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-2 rounded border bg-gray-50 px-3 py-2">
                <code className="flex-1 text-[10px] truncate">{u.generated}</code>
                <button onClick={() => copy(u.generated, u.id)} className="shrink-0 rounded border bg-white px-2 py-1 text-[10px] hover:bg-gray-50">{copied === u.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</button>
                <button onClick={() => saveUtm(utmLinks.filter((x) => x.id !== u.id))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar configuración"}</button>
    </div>
  );
}
