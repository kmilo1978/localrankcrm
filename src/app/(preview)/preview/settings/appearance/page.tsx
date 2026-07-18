"use client";
import { useState, useEffect } from "react";
import { Globe, Moon, Sun } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type AppearanceConfig = { theme: "light" | "dark" | "system"; language: string };
const DEFAULT: AppearanceConfig = { theme: "light", language: "es" };

const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export default function AppearancePage() {
  const [config, setConfig] = useState<AppearanceConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage("appearance_config", DEFAULT);
    setConfig(stored);
    applyTheme(stored.theme);
  }, []);

  function applyTheme(theme: AppearanceConfig["theme"]) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }

  function handleThemeChange(theme: AppearanceConfig["theme"]) {
    setConfig({ ...config, theme });
    applyTheme(theme);
    saveToStorage("appearance_config", { ...config, theme });
  }

  function handleSave() {
    saveToStorage("appearance_config", config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Apariencia & Idioma</h3>
        <p className="mt-1 text-sm text-muted-foreground">Personaliza el tema visual y el idioma de la interfaz.</p>
      </div>

      {/* Theme */}
      <div className="rounded-lg border bg-white p-5 dark:bg-gray-900 dark:border-gray-700">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          {config.theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          Tema
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleThemeChange("light")} className={`rounded-lg border p-4 text-center transition-all ${config.theme === "light" ? "border-brand ring-2 ring-brand/20" : "hover:border-gray-300"}`}>
            <div className="mx-auto mb-2 h-16 w-full rounded border bg-white flex items-end p-2">
              <div className="h-2 w-4 rounded bg-gray-200 mr-1"></div>
              <div className="h-3 w-6 rounded bg-blue-200"></div>
            </div>
            <Sun className="mx-auto h-4 w-4 mb-1" />
            <p className="text-xs font-medium">Claro</p>
          </button>
          <button onClick={() => handleThemeChange("dark")} className={`rounded-lg border p-4 text-center transition-all ${config.theme === "dark" ? "border-brand ring-2 ring-brand/20" : "hover:border-gray-300"}`}>
            <div className="mx-auto mb-2 h-16 w-full rounded border bg-gray-800 flex items-end p-2">
              <div className="h-2 w-4 rounded bg-gray-600 mr-1"></div>
              <div className="h-3 w-6 rounded bg-blue-400"></div>
            </div>
            <Moon className="mx-auto h-4 w-4 mb-1" />
            <p className="text-xs font-medium">Oscuro</p>
          </button>
          <button onClick={() => handleThemeChange("system")} className={`rounded-lg border p-4 text-center transition-all ${config.theme === "system" ? "border-brand ring-2 ring-brand/20" : "hover:border-gray-300"}`}>
            <div className="mx-auto mb-2 h-16 w-full rounded border overflow-hidden flex">
              <div className="w-1/2 bg-white flex items-end p-1"><div className="h-2 w-full rounded bg-gray-200"></div></div>
              <div className="w-1/2 bg-gray-800 flex items-end p-1"><div className="h-2 w-full rounded bg-gray-600"></div></div>
            </div>
            <span className="mx-auto block text-sm mb-1">💻</span>
            <p className="text-xs font-medium">Sistema</p>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-lg border bg-white p-5 dark:bg-gray-900 dark:border-gray-700">
        <h4 className="font-medium mb-4 flex items-center gap-2"><Globe className="h-4 w-4" />Idioma</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((lang) => (
            <button key={lang.code} onClick={() => setConfig({ ...config, language: lang.code })} className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left transition-all ${config.language === lang.code ? "border-brand ring-2 ring-brand/20 bg-brand-tint" : "hover:border-gray-300"}`}>
              <span className="text-lg">{lang.flag}</span>
              <div>
                <p className="text-sm font-medium">{lang.name}</p>
                <p className="text-[10px] text-muted-foreground">{lang.code.toUpperCase()}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">El cambio de idioma se aplicará a toda la interfaz del CRM.</p>
      </div>

      <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar preferencias"}</button>
    </div>
  );
}
