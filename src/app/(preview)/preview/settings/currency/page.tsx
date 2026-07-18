"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  { code: "COP", symbol: "$", name: "Peso colombiano" },
  { code: "MXN", symbol: "$", name: "Peso mexicano" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Libra esterlina" },
  { code: "BRL", symbol: "R$", name: "Real brasileño" },
  { code: "ARS", symbol: "$", name: "Peso argentino" },
  { code: "CLP", symbol: "$", name: "Peso chileno" },
  { code: "PEN", symbol: "S/", name: "Sol peruano" },
  { code: "CAD", symbol: "C$", name: "Dólar canadiense" },
];

type CurrencyConfig = { primary: string; secondary: string; showSymbol: boolean; decimals: number; thousandsSep: string };
const DEFAULT: CurrencyConfig = { primary: "USD", secondary: "COP", showSymbol: true, decimals: 2, thousandsSep: "," };

export default function CurrencyPage() {
  const [config, setConfig] = useState<CurrencyConfig>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setConfig(loadFromStorage("currency_config", DEFAULT)); }, []);

  function handleSave() { saveToStorage("currency_config", config); setSaved(true); setTimeout(() => setSaved(false), 2000); }

  const primary = CURRENCIES.find((c) => c.code === config.primary);
  const example = `${config.showSymbol ? primary?.symbol : ""}${config.decimals === 0 ? "12${config.thousandsSep}500" : `12${config.thousandsSep}500${"." + "0".repeat(config.decimals)}`} ${config.primary}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-brand" />Moneda</h3>
        <p className="mt-1 text-sm text-muted-foreground">Configura las monedas para propuestas, oportunidades y reportes.</p>
      </div>

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Moneda principal</label>
            <select value={config.primary} onChange={(e) => setConfig({ ...config, primary: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Moneda secundaria (referencia)</label>
            <select value={config.secondary} onChange={(e) => setConfig({ ...config, secondary: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Decimales</label>
            <select value={config.decimals} onChange={(e) => setConfig({ ...config, decimals: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              <option value={0}>Sin decimales</option>
              <option value={2}>2 decimales</option>
              <option value={3}>3 decimales</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Separador de miles</label>
            <select value={config.thousandsSep} onChange={(e) => setConfig({ ...config, thousandsSep: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              <option value=",">Coma (12,500)</option>
              <option value=".">Punto (12.500)</option>
              <option value=" ">Espacio (12 500)</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.showSymbol} onChange={(e) => setConfig({ ...config, showSymbol: e.target.checked })} className="accent-[var(--accent)]" />Mostrar símbolo de moneda</label>
        <div className="rounded border bg-gray-50 p-3">
          <p className="text-xs text-muted-foreground">Vista previa: <strong className="text-foreground">{example}</strong></p>
        </div>
      </div>

      <button onClick={handleSave} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar"}</button>
    </div>
  );
}
