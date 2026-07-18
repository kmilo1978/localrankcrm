"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Database, Download, FileSpreadsheet, Filter, Loader2, Plus, RefreshCw, Search, Sparkles, Trash2, Upload, X, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ImportedRecord = {
  id: string;
  fields: Record<string, string>;
  enriched: boolean;
  enrichedFields: Record<string, string>;
  source: string;
  importedAt: string;
  status: "raw" | "enriched" | "exported";
};

type ImportJob = {
  id: string;
  fileName: string;
  recordCount: number;
  importedAt: string;
  status: "completed" | "processing" | "failed";
};

const SEED_JOBS: ImportJob[] = [
  { id: "j1", fileName: "leads-clasificados.xlsx", recordCount: 10, importedAt: "2026-07-17 14:30", status: "completed" },
  { id: "j2", fileName: "contactos-evento-junio.csv", recordCount: 45, importedAt: "2026-07-10 09:15", status: "completed" },
];

const SEED_RECORDS: ImportedRecord[] = [
  { id: "ir1", fields: { nombre: "Oral Studio", telefono: "312 7093687", web: "oralstudio.com.co", categoria: "Clínica dental", ciudad: "Medellín" }, enriched: true, enrichedFields: { email_estimado: "contacto@oralstudio.com.co", empleados: "15-50", ingresos_est: "$500K-1M", tecnologias: "WordPress, Google Ads", linkedin: "linkedin.com/company/oralstudio" }, source: "leads-clasificados.xlsx", importedAt: "2026-07-17", status: "enriched" },
  { id: "ir2", fields: { nombre: "Dental Expertos", telefono: "300 8938020", web: "instagram.com/dentalexpertos", categoria: "Clínica dental", ciudad: "Medellín" }, enriched: true, enrichedFields: { email_estimado: "info@dentalexpertos.com", empleados: "5-15", seguidores_ig: "12.5K", ultima_publicacion: "Hace 2 días" }, source: "leads-clasificados.xlsx", importedAt: "2026-07-17", status: "enriched" },
  { id: "ir3", fields: { nombre: "Nova Smile", telefono: "301 3951082", web: "novasmile.com.co", categoria: "Clínica dental", ciudad: "Medellín" }, enriched: false, enrichedFields: {}, source: "leads-clasificados.xlsx", importedAt: "2026-07-17", status: "raw" },
  { id: "ir4", fields: { nombre: "Dentart", telefono: "301 6510868", web: "dentartodontology.com", categoria: "Dentista", ciudad: "La Estrella" }, enriched: true, enrichedFields: { email_estimado: "info@dentartodontology.com", empleados: "5-10", google_ads: "No detectado", ssl: "Activo", dominio_edad: "3 años" }, source: "leads-clasificados.xlsx", importedAt: "2026-07-17", status: "enriched" },
  { id: "ir5", fields: { nombre: "360 Dental Group", telefono: "312 2177371", web: "sonrisas360.com", categoria: "Clínica dental", ciudad: "Sabaneta" }, enriched: false, enrichedFields: {}, source: "leads-clasificados.xlsx", importedAt: "2026-07-17", status: "raw" },
];

const ENRICHMENT_OPTIONS = [
  { id: "email", label: "Buscar email", description: "Encuentra emails corporativos por dominio" },
  { id: "social", label: "Redes sociales", description: "LinkedIn, Instagram, Facebook del negocio" },
  { id: "tech", label: "Tecnologías web", description: "CMS, analytics, ads detectados en el sitio" },
  { id: "company", label: "Datos empresa", description: "Empleados, ingresos estimados, industria" },
  { id: "domain", label: "Info dominio", description: "Edad, SSL, hosting, autoridad SEO" },
];

export default function ImportEnrichPage() {
  const [records, setRecords] = useState<ImportedRecord[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "raw" | "enriched" | "exported">("all");
  const [showUpload, setShowUpload] = useState(false);
  const [enriching, setEnriching] = useState<string | null>(null);
  const [enrichAll, setEnrichAll] = useState(false);
  const [selectedEnrichments, setSelectedEnrichments] = useState<Set<string>>(new Set(["email", "social", "company"]));
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecords(loadFromStorage("import_records", SEED_RECORDS));
    setJobs(loadFromStorage("import_jobs", SEED_JOBS));
  }, []);

  function saveRecords(u: ImportedRecord[]) { setRecords(u); saveToStorage("import_records", u); }
  function saveJobs(u: ImportJob[]) { setJobs(u); saveToStorage("import_jobs", u); }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0]!.split(/\t|,/).map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const newRecords: ImportedRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]!.split(/\t|,/);
        const fields: Record<string, string> = {};
        headers.forEach((h, idx) => { if (cols[idx]?.trim()) fields[h] = cols[idx]!.trim().replace(/['"]/g, ""); });
        if (Object.keys(fields).length > 0) {
          newRecords.push({ id: generateId(), fields, enriched: false, enrichedFields: {}, source: file.name, importedAt: new Date().toISOString().split("T")[0]!, status: "raw" });
        }
      }
      if (newRecords.length > 0) {
        saveRecords([...newRecords, ...records]);
        saveJobs([{ id: generateId(), fileName: file.name, recordCount: newRecords.length, importedAt: new Date().toLocaleString("es"), status: "completed" }, ...jobs]);
      }
      setShowUpload(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function simulateEnrich(recordId: string) {
    setEnriching(recordId);
    setTimeout(() => {
      const fakeEnriched: Record<string, string> = {
        email_estimado: "contacto@empresa.com",
        empleados: `${Math.floor(Math.random() * 50) + 5}-${Math.floor(Math.random() * 100) + 50}`,
        tecnologias: ["WordPress", "Shopify", "Custom", "Wix"][Math.floor(Math.random() * 4)]!,
        linkedin: "linkedin.com/company/...",
        dominio_edad: `${Math.floor(Math.random() * 8) + 1} años`,
      };
      saveRecords(records.map((r) => r.id === recordId ? { ...r, enriched: true, enrichedFields: fakeEnriched, status: "enriched" as const } : r));
      setEnriching(null);
    }, 1500);
  }

  function simulateEnrichAll() {
    setEnrichAll(true);
    setTimeout(() => {
      saveRecords(records.map((r) => r.status === "raw" ? { ...r, enriched: true, enrichedFields: { email_estimado: `info@${(r.fields.web || r.fields.nombre || "empresa").split("/").pop()?.replace(/\s/g, "").toLowerCase() || "empresa"}.com`, empleados: "10-50", tecnologias: "Detectando..." }, status: "enriched" as const } : r));
      setEnrichAll(false);
    }, 2500);
  }

  function exportToContacts() {
    // Simulate export
    saveRecords(records.map((r) => r.status === "enriched" ? { ...r, status: "exported" as const } : r));
  }

  function exportToProposals() {
    alert("Los registros enriquecidos se pueden usar como base para generar propuestas personalizadas en el módulo de Propuestas.");
  }

  function deleteRecord(id: string) { saveRecords(records.filter((r) => r.id !== id)); }

  function toggleEnrichOption(id: string) {
    setSelectedEnrichments((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  const filtered = records
    .filter((r) => filterStatus === "all" || r.status === filterStatus)
    .filter((r) => !search || Object.values(r.fields).some((v) => v.toLowerCase().includes(search.toLowerCase())));

  const rawCount = records.filter((r) => r.status === "raw").length;
  const enrichedCount = records.filter((r) => r.status === "enriched").length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-brand" />Importar & Enriquecer</h1>
            <p className="text-sm text-muted-foreground">Importa archivos, enriquece datos automáticamente y exporta a contactos o propuestas</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">
              <Upload className="h-4 w-4" />Importar archivo
            </button>
          </div>
        </div>

        {/* Upload area */}
        {showUpload && (
          <div className="mb-6 rounded-lg border-2 border-dashed bg-gray-50 p-6 text-center">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-brand/50" />
            <p className="mt-2 text-sm font-medium">Arrastra un archivo o haz click para seleccionar</p>
            <p className="text-xs text-muted-foreground">CSV, TSV, TXT — con columnas separadas por coma o tab</p>
            <input type="file" ref={fileRef} onChange={handleFileImport} accept=".csv,.tsv,.txt,.xlsx" className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="mt-3 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">Seleccionar archivo</button>
          </div>
        )}

        {/* Stats + Actions bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 rounded-lg border bg-white px-4 py-2">
            <span className="text-xs text-muted-foreground">Total: <strong>{records.length}</strong></span>
            <span className="text-xs text-muted-foreground">Sin enriquecer: <strong className="text-amber-600">{rawCount}</strong></span>
            <span className="text-xs text-muted-foreground">Enriquecidos: <strong className="text-green-600">{enrichedCount}</strong></span>
          </div>
          <div className="flex-1" />
          {rawCount > 0 && (
            <button onClick={simulateEnrichAll} disabled={enrichAll} className="flex items-center gap-2 rounded-md border border-brand bg-brand-tint px-3 py-2 text-xs font-medium text-brand hover:bg-brand/10 disabled:opacity-50">
              {enrichAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {enrichAll ? "Enriqueciendo..." : `Enriquecer todos (${rawCount})`}
            </button>
          )}
          {enrichedCount > 0 && (
            <>
              <button onClick={exportToContacts} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
                <Download className="h-3.5 w-3.5" />Exportar a Contactos
              </button>
              <button onClick={exportToProposals} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
                <Download className="h-3.5 w-3.5" />Usar en Propuestas
              </button>
            </>
          )}
        </div>

        {/* Enrichment options */}
        <div className="mb-4 rounded-lg border bg-white p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" />Opciones de enriquecimiento</h4>
          <div className="flex flex-wrap gap-2">
            {ENRICHMENT_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => toggleEnrichOption(opt.id)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedEnrichments.has(opt.id) ? "bg-brand text-white" : "border hover:bg-gray-50"}`} title={opt.description}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="all">Todos</option>
            <option value="raw">Sin enriquecer</option>
            <option value="enriched">Enriquecidos</option>
            <option value="exported">Exportados</option>
          </select>
        </div>

        {/* Records list */}
        <div className="space-y-2">
          {filtered.map((record) => {
            const name = record.fields.nombre || record.fields.name || Object.values(record.fields)[0] || "Sin nombre";
            const isExp = expanded === record.id;
            return (
              <div key={record.id} className="rounded-lg border bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(isExp ? null : record.id)}>
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${record.status === "enriched" ? "bg-green-400" : record.status === "exported" ? "bg-blue-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{Object.entries(record.fields).slice(1, 4).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${record.status === "enriched" ? "bg-green-100 text-green-700" : record.status === "exported" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {record.status === "enriched" ? "Enriquecido" : record.status === "exported" ? "Exportado" : "Sin enriquecer"}
                  </span>
                  {record.status === "raw" && (
                    <button onClick={(e) => { e.stopPropagation(); simulateEnrich(record.id); }} disabled={enriching === record.id} className="flex items-center gap-1 rounded bg-brand-tint px-2 py-1 text-xs text-brand hover:bg-brand/10 disabled:opacity-50">
                      {enriching === record.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}Enriquecer
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }} className="rounded p-1 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>

                {isExp && (
                  <div className="border-t px-4 pb-3 pt-2">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div>
                        <h5 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Datos originales</h5>
                        <div className="rounded border divide-y">
                          {Object.entries(record.fields).map(([k, v]) => (
                            <div key={k} className="flex gap-2 px-3 py-1.5 text-xs">
                              <span className="w-24 shrink-0 font-medium text-muted-foreground capitalize">{k}</span>
                              <span className="flex-1">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {record.enriched && Object.keys(record.enrichedFields).length > 0 && (
                        <div>
                          <h5 className="mb-1 text-xs font-semibold text-green-700 uppercase flex items-center gap-1"><Sparkles className="h-3 w-3" />Datos enriquecidos</h5>
                          <div className="rounded border border-green-200 bg-green-50/50 divide-y divide-green-100">
                            {Object.entries(record.enrichedFields).map(([k, v]) => (
                              <div key={k} className="flex gap-2 px-3 py-1.5 text-xs">
                                <span className="w-28 shrink-0 font-medium text-green-700 capitalize">{k.replace(/_/g, " ")}</span>
                                <span className="flex-1">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Sin registros. Importa un archivo para comenzar.</p>}
        </div>

        {/* Import history */}
        {jobs.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold">Historial de importaciones</h3>
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50"><tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Archivo</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase text-muted-foreground">Registros</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Estado</th>
                </tr></thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-muted-foreground" />{j.fileName}</td>
                      <td className="px-4 py-2 text-center text-sm">{j.recordCount}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{j.importedAt}</td>
                      <td className="px-4 py-2"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 flex items-center gap-1 w-fit"><CheckCircle2 className="h-3 w-3" />{j.status === "completed" ? "Completado" : j.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
