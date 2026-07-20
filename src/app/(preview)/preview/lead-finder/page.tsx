"use client";
import { useState } from "react";
import { Bot, Building2, CheckCircle2, ClipboardCopy, Download, Filter, Globe, Linkedin, Mail, MapPin, Phone, Plus, Search, Sparkles, Users, Zap } from "lucide-react";
import { generateId } from "@/lib/local-storage";
import { exportToCSV } from "@/lib/email-tools";

type Lead = {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  verified: boolean;
  score: number;
};

// Simulated B2B database
const LEAD_DATABASE: Lead[] = [
  { id: "lf1", name: "Carlos Ruiz", title: "CTO", company: "TechCorp Solutions", industry: "Software", location: "Medellín, Colombia", email: "carlos@techcorp.com", phone: "+52 55 1234 5678", linkedin: "linkedin.com/in/cruiz", verified: true, score: 95 },
  { id: "lf2", name: "María García", title: "VP Operations", company: "LogiNext International", industry: "Logística", location: "Miami, USA", email: "maria@loginext.io", phone: "+1 305 555 0123", linkedin: "linkedin.com/in/mgarcia", verified: true, score: 82 },
  { id: "lf3", name: "Roberto Méndez", title: "Director Marketing", company: "MediaGroup Digital", industry: "Marketing", location: "Guadalajara, México", email: "roberto@mediagroup.mx", phone: "+52 33 9876 5432", linkedin: "linkedin.com/in/rmendez", verified: true, score: 78 },
  { id: "lf4", name: "Ana Torres", title: "CEO", company: "InnovateLab", industry: "Tecnología", location: "Bogotá, Colombia", email: "ana@innovatelab.co", phone: "+57 310 555 1234", linkedin: "linkedin.com/in/atorres", verified: true, score: 88 },
  { id: "lf5", name: "Diego Morales", title: "Sales Director", company: "RetailMax", industry: "Retail", location: "Ciudad de México", email: "diego@retailmax.com.mx", phone: "+52 55 4321 8765", linkedin: "linkedin.com/in/dmorales", verified: false, score: 65 },
  { id: "lf6", name: "Laura Vega", title: "Head of Growth", company: "FinServ Partners", industry: "Fintech", location: "Buenos Aires, Argentina", email: "laura@finserv.com.ar", phone: "+54 11 5555 4321", linkedin: "linkedin.com/in/lvega", verified: true, score: 91 },
  { id: "lf7", name: "Andrés Castillo", title: "CTO", company: "CloudNative Labs", industry: "Cloud Computing", location: "Medellín, Colombia", email: "andres@cloudnative.io", phone: "+57 300 123 4567", linkedin: "linkedin.com/in/acastillo", verified: true, score: 87 },
  { id: "lf8", name: "Patricia Rojas", title: "VP Sales", company: "DataPulse AI", industry: "Inteligencia Artificial", location: "Santiago, Chile", email: "patricia@datapulse.ai", phone: "+56 9 8765 4321", linkedin: "linkedin.com/in/projas", verified: true, score: 93 },
  { id: "lf9", name: "Fernando López", title: "Founder & CEO", company: "GreenTech Solutions", industry: "Sostenibilidad", location: "Lima, Perú", email: "fernando@greentech.pe", phone: "+51 999 888 777", linkedin: "linkedin.com/in/flopez", verified: false, score: 72 },
  { id: "lf10", name: "Valentina Herrera", title: "Marketing Manager", company: "EduTech Pro", industry: "Educación", location: "Cali, Colombia", email: "valentina@edutechpro.co", phone: "+57 315 222 3333", linkedin: "linkedin.com/in/vherrera", verified: true, score: 76 },
  { id: "lf11", name: "Santiago Muñoz", title: "Director Comercial", company: "Dental Group IPS", industry: "Salud", location: "Sabaneta, Colombia", email: "santiago@dentalgroup.co", phone: "+57 312 217 7371", linkedin: "linkedin.com/in/smunoz", verified: true, score: 84 },
  { id: "lf12", name: "Camila Ríos", title: "Head of Product", company: "PropTech Latam", industry: "Real Estate Tech", location: "Medellín, Colombia", email: "camila@proptechlatam.com", phone: "+57 301 444 5555", linkedin: "linkedin.com/in/crios", verified: true, score: 89 },
];

const INDUSTRIES = ["Todos", "Software", "Logística", "Marketing", "Tecnología", "Retail", "Fintech", "Cloud Computing", "Inteligencia Artificial", "Salud", "Educación", "Real Estate Tech", "Sostenibilidad"];
const LOCATIONS = ["Todos", "Colombia", "México", "USA", "Argentina", "Chile", "Perú"];
const TITLES = ["Todos", "CEO", "CTO", "VP", "Director", "Head of", "Manager", "Founder"];

export default function LeadFinderPage() {
  const [aiQuery, setAiQuery] = useState("");
  const [industry, setIndustry] = useState("Todos");
  const [location, setLocation] = useState("Todos");
  const [title, setTitle] = useState("Todos");
  const [company, setCompany] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState("");
  const [searching, setSearching] = useState(false);

  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function searchByFilters() {
    setSearching(true);
    setTimeout(() => {
      let filtered = [...LEAD_DATABASE];
      if (industry !== "Todos") filtered = filtered.filter(l => l.industry.toLowerCase().includes(industry.toLowerCase()));
      if (location !== "Todos") filtered = filtered.filter(l => l.location.toLowerCase().includes(location.toLowerCase()));
      if (title !== "Todos") filtered = filtered.filter(l => l.title.toLowerCase().includes(title.toLowerCase()));
      if (company.trim()) filtered = filtered.filter(l => l.company.toLowerCase().includes(company.toLowerCase()));
      setResults(filtered);
      setSearching(false);
    }, 800);
  }

  function searchByAI() {
    if (!aiQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const q = aiQuery.toLowerCase();
      let filtered = [...LEAD_DATABASE];
      // AI-like natural language parsing
      if (q.includes("cto") || q.includes("tecn")) filtered = filtered.filter(l => l.title.includes("CTO") || l.industry.includes("Tech") || l.industry.includes("Software"));
      else if (q.includes("vp") || q.includes("director") || q.includes("ventas") || q.includes("sales")) filtered = filtered.filter(l => l.title.includes("VP") || l.title.includes("Director") || l.title.includes("Sales"));
      else if (q.includes("ceo") || q.includes("founder") || q.includes("fundador")) filtered = filtered.filter(l => l.title.includes("CEO") || l.title.includes("Founder"));
      else if (q.includes("marketing") || q.includes("growth")) filtered = filtered.filter(l => l.title.includes("Marketing") || l.title.includes("Growth") || l.industry.includes("Marketing"));

      if (q.includes("colombia") || q.includes("medellín") || q.includes("medellin") || q.includes("bogotá")) filtered = filtered.filter(l => l.location.includes("Colombia"));
      else if (q.includes("méxico") || q.includes("mexico")) filtered = filtered.filter(l => l.location.includes("México"));
      else if (q.includes("latam") || q.includes("latinoam")) { /* keep all latam */ }

      if (q.includes("verificad")) filtered = filtered.filter(l => l.verified);
      if (q.includes("alto score") || q.includes("caliente")) filtered = filtered.filter(l => l.score >= 85);

      if (filtered.length === 0) filtered = LEAD_DATABASE.slice(0, 5); // Fallback
      setResults(filtered.sort((a, b) => b.score - a.score));
      setSearching(false);
    }, 1200);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function selectAll() { setSelected(new Set(results.map(r => r.id))); }
  function deselectAll() { setSelected(new Set()); }

  function exportSelected() {
    const data = results.filter(r => selected.has(r.id));
    if (data.length === 0) { notify("Selecciona leads para exportar"); return; }
    exportToCSV(data.map(l => ({ nombre: l.name, cargo: l.title, empresa: l.company, industria: l.industry, ubicacion: l.location, email: l.email, telefono: l.phone, linkedin: l.linkedin, verificado: l.verified ? "Sí" : "No", score: l.score })), "leads-exportados");
    notify(`${data.length} leads exportados como CSV`);
  }

  function sendToPipeline() {
    const data = results.filter(r => selected.has(r.id));
    if (data.length === 0) { notify("Selecciona leads primero"); return; }
    const leads = JSON.parse(localStorage.getItem("localrank_pipeline_leads") || localStorage.getItem("pipeline_leads") || "[]");
    data.forEach(l => {
      if (!leads.some((x: { name: string }) => x.name === l.name)) {
        leads.unshift({ id: generateId(), name: l.name, company: l.company, value: "$0", stageId: "s1" });
      }
    });
    localStorage.setItem("pipeline_leads", JSON.stringify(leads));
    notify(`${data.length} leads enviados al Pipeline`);
  }

  function sendToContacts() {
    const data = results.filter(r => selected.has(r.id));
    if (data.length === 0) { notify("Selecciona leads primero"); return; }
    const contacts = JSON.parse(localStorage.getItem("localrank_contacts") || localStorage.getItem("contacts") || "[]");
    data.forEach(l => {
      if (!contacts.some((x: { email: string }) => x.email === l.email)) {
        contacts.unshift({ id: generateId(), name: l.name, phone: l.phone, email: l.email, company: l.company, role: l.title, image: "", archived: false, createdAt: new Date().toISOString().split("T")[0]!, customFields: [{ id: generateId(), label: "LinkedIn", value: l.linkedin }], notes: [{ id: generateId(), content: `Importado desde Lead Finder. Score: ${l.score}. Industria: ${l.industry}`, createdAt: new Date().toISOString().split("T")[0]! }], reminders: [] });
      }
    });
    localStorage.setItem("contacts", JSON.stringify(contacts));
    notify(`${data.length} leads enviados a Contactos`);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-brand" />Localizador de Leads B2B</h1>
          <p className="text-sm text-muted-foreground">Encuentra leads verificados por cargo, industria, ubicación o con búsqueda IA en lenguaje natural.</p>
        </div>

        {/* AI Search */}
        <div className="mb-4 rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-purple-800">Búsqueda IA — Lenguaje natural</h3>
          </div>
          <div className="flex gap-2">
            <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") searchByAI(); }} placeholder='Ej: "CTOs de empresas de tecnología en Colombia con alto score"' className="flex-1 rounded-lg border border-purple-200 px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white" />
            <button onClick={searchByAI} disabled={!aiQuery.trim() || searching} className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              {searching ? <Sparkles className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Buscar con IA
            </button>
          </div>
          <p className="mt-2 text-[10px] text-purple-600">Describe tu lead ideal: cargo, industria, ubicación, tamaño de empresa. La IA interpreta y filtra.</p>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-2"><Filter className="h-3.5 w-3.5" />{showFilters ? "Ocultar filtros" : "Filtros avanzados"}</button>
          {showFilters && (
            <div className="rounded-lg border bg-white p-4 flex flex-wrap gap-3 items-end">
              <div className="w-36"><label className="text-[10px] font-medium text-muted-foreground">Industria</label><select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs mt-1">{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
              <div className="w-36"><label className="text-[10px] font-medium text-muted-foreground">Ubicación</label><select value={location} onChange={e => setLocation(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs mt-1">{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div className="w-36"><label className="text-[10px] font-medium text-muted-foreground">Cargo</label><select value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs mt-1">{TITLES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="w-40"><label className="text-[10px] font-medium text-muted-foreground">Empresa</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Nombre empresa" className="w-full rounded border px-2 py-1.5 text-xs mt-1 focus:border-brand focus:outline-none" /></div>
              <button onClick={searchByFilters} disabled={searching} className="rounded bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50">Buscar</button>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Actions bar */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-muted-foreground">{results.length} leads encontrados · {selected.size} seleccionados</span>
              <button onClick={selectAll} className="text-[10px] text-brand hover:underline">Seleccionar todos</button>
              <button onClick={deselectAll} className="text-[10px] text-muted-foreground hover:underline">Deseleccionar</button>
              <div className="flex-1" />
              <button onClick={sendToContacts} disabled={selected.size === 0} className="flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-medium hover:bg-gray-50 disabled:opacity-40"><Users className="h-3 w-3" />→ Contactos</button>
              <button onClick={sendToPipeline} disabled={selected.size === 0} className="flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-medium hover:bg-gray-50 disabled:opacity-40"><Zap className="h-3 w-3" />→ Pipeline</button>
              <button onClick={exportSelected} disabled={selected.size === 0} className="flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-medium hover:bg-gray-50 disabled:opacity-40"><Download className="h-3 w-3" />Exportar CSV</button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left w-8"><input type="checkbox" checked={selected.size === results.length} onChange={() => selected.size === results.length ? deselectAll() : selectAll()} className="accent-brand" /></th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase text-muted-foreground">Lead</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase text-muted-foreground">Empresa</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase text-muted-foreground">Contacto</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium uppercase text-muted-foreground">Score</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium uppercase text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5"><input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="accent-brand" /></td>
                      <td className="px-3 py-2.5">
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-[10px] text-muted-foreground">{lead.title}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">{lead.company}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{lead.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          <p className="text-[10px] flex items-center gap-1 text-blue-600"><Mail className="h-2.5 w-2.5" />{lead.email}</p>
                          {lead.phone && <p className="text-[10px] flex items-center gap-1 text-green-600"><Phone className="h-2.5 w-2.5" />{lead.phone}</p>}
                          {lead.linkedin && <p className="text-[10px] flex items-center gap-1 text-[#0A66C2]"><Linkedin className="h-2.5 w-2.5" />{lead.linkedin}</p>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${lead.score >= 85 ? "bg-green-100 text-green-700" : lead.score >= 70 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{lead.score}</span></td>
                      <td className="px-3 py-2.5 text-center">{lead.verified ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-[9px] text-muted-foreground">Sin verificar</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {results.length === 0 && !searching && (
          <div className="text-center py-16 rounded-lg border border-dashed">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-2">Usa la búsqueda IA o los filtros para encontrar leads</p>
            <p className="text-xs text-muted-foreground">Prueba: "VP de ventas en empresas SaaS de Colombia"</p>
          </div>
        )}

        {searching && (
          <div className="text-center py-16">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-400 animate-spin" />
            <p className="text-sm text-muted-foreground">Buscando leads...</p>
          </div>
        )}
      </div>
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
