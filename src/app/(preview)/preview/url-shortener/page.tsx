"use client";
import { useState, useEffect } from "react";
import { ClipboardCopy, ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ShortUrl = {
  id: string;
  originalUrl: string;
  shortCode: string;
  label: string;
  clicks: number;
  createdAt: string;
};

export default function UrlShortenerPage() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [form, setForm] = useState({ url: "", label: "" });
  const [toast, setToast] = useState("");

  useEffect(() => { setUrls(loadFromStorage("short_urls", [])); }, []);
  function save(u: ShortUrl[]) { setUrls(u); saveToStorage("short_urls", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function generateShortCode(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  function createShortUrl() {
    if (!form.url.trim()) return;
    let url = form.url.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    const short: ShortUrl = {
      id: generateId(),
      originalUrl: url,
      shortCode: generateShortCode(),
      label: form.label || new URL(url).hostname,
      clicks: 0,
      createdAt: new Date().toISOString().split("T")[0]!,
    };
    save([short, ...urls]);
    setForm({ url: "", label: "" });
    notify("URL acortada");
  }

  function copyShortUrl(code: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${base}/s/${code}`);
    notify("URL copiada");
  }

  function trackClick(id: string) {
    save(urls.map(u => u.id === id ? { ...u, clicks: u.clicks + 1 } : u));
  }

  function deleteUrl(id: string) { save(urls.filter(u => u.id !== id)); }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6 text-brand" />Acortador de URL
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea enlaces cortos para tracking de campañas y propuestas
          </p>
        </div>

        {/* Create form */}
        <div className="mb-6 rounded-lg border bg-white p-5">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">URL original *</label>
              <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://ejemplo.com/pagina-larga" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" onKeyDown={e => { if (e.key === "Enter") createShortUrl(); }} />
            </div>
            <div className="w-40">
              <label className="text-xs font-medium text-muted-foreground">Etiqueta</label>
              <input value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="Mi campaña" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
            </div>
            <button onClick={createShortUrl} disabled={!form.url.trim()} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">
              <Plus className="h-4 w-4 inline mr-1" />Acortar
            </button>
          </div>
        </div>

        {/* URLs list */}
        <div className="space-y-2">
          {urls.map(url => (
            <div key={url.id} className="group rounded-lg border bg-white p-4 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <Link2 className="h-4 w-4 text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{url.label}</span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-mono text-brand">/s/{url.shortCode}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{url.originalUrl}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{url.clicks} clicks</span>
                  <span className="text-[10px] text-muted-foreground">{url.createdAt}</span>
                  <button onClick={() => copyShortUrl(url.shortCode)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-brand" title="Copiar URL corta"><ClipboardCopy className="h-3.5 w-3.5" /></button>
                  <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(url.id)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-brand" title="Abrir"><ExternalLink className="h-3.5 w-3.5" /></a>
                  <button onClick={() => deleteUrl(url.id)} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {urls.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Link2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Sin URLs acortadas. Crea tu primera.</p>
          </div>
        )}
      </div>
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
