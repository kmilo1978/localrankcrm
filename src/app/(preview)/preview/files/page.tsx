"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, Download, Eye, FileText, ImageIcon, Plus, Search, Send, Trash2, Upload, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type CrmFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // base64 or text content
  textContent: string; // extracted text for AI
  uploadedAt: string;
};

type AiMessage = { role: "user" | "assistant"; content: string };

export default function FilesPage() {
  const [files, setFiles] = useState<CrmFile[]>([]);
  const [search, setSearch] = useState("");
  const [viewFile, setViewFile] = useState<CrmFile | null>(null);
  const [aiChat, setAiChat] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiFile, setAiFile] = useState<CrmFile | null>(null);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFiles(loadFromStorage("crm_files", [])); }, []);
  function save(u: CrmFile[]) { setFiles(u); saveToStorage("crm_files", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      if (file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".json") || file.name.endsWith(".md")) {
        reader.onload = () => {
          const text = reader.result as string;
          save([{ id: generateId(), name: file.name, type: file.type || "text/plain", size: file.size, content: "", textContent: text.slice(0, 50000), uploadedAt: new Date().toISOString() }, ...files]);
          notify(`"${file.name}" importado`);
        };
        reader.readAsText(file);
      } else {
        reader.onload = () => {
          const base64 = reader.result as string;
          save([{ id: generateId(), name: file.name, type: file.type, size: file.size, content: base64, textContent: `[Archivo binario: ${file.name}, ${formatSize(file.size)}]`, uploadedAt: new Date().toISOString() }, ...files]);
          notify(`"${file.name}" importado`);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  }

  function deleteFile(id: string) { save(files.filter(f => f.id !== id)); if (viewFile?.id === id) setViewFile(null); }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function getFileIcon(type: string, name: string) {
    if (type.startsWith("image/")) return "🖼️";
    if (name.endsWith(".pdf")) return "📄";
    if (name.endsWith(".csv") || name.endsWith(".xlsx")) return "📊";
    if (name.endsWith(".json")) return "📋";
    if (name.endsWith(".md")) return "📝";
    return "📁";
  }

  // Simple AI responses based on file content
  function askAI() {
    if (!aiInput.trim()) return;
    const userMsg: AiMessage = { role: "user", content: aiInput };
    setAiChat(prev => [...prev, userMsg]);
    setAiInput("");

    // Generate response based on context
    const fileContext = aiFile?.textContent || "";
    const question = aiInput.toLowerCase();
    let response = "";

    if (!aiFile) {
      response = "Selecciona un archivo primero para que pueda analizarlo. Haz clic en el ícono 🤖 de cualquier archivo.";
    } else if (fileContext.length < 10) {
      response = `El archivo "${aiFile.name}" es binario o está vacío. Solo puedo analizar archivos de texto, CSV, JSON o Markdown.`;
    } else {
      const lines = fileContext.split("\n").filter(l => l.trim());
      const wordCount = fileContext.split(/\s+/).length;

      if (question.includes("resumen") || question.includes("resume") || question.includes("qué contiene") || question.includes("que contiene")) {
        response = `📄 **${aiFile.name}**\n\n• ${lines.length} líneas, ~${wordCount} palabras\n• Primeras líneas:\n\`\`\`\n${lines.slice(0, 5).join("\n")}\n\`\`\`\n\n${lines.length > 20 ? "Es un archivo extenso. Puedes preguntarme sobre contenido específico." : "Es un archivo corto que puedo analizar completamente."}`;
      } else if (question.includes("email") || question.includes("correo")) {
        const emails = fileContext.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
        response = emails.length > 0 ? `📧 Encontré ${emails.length} email(s):\n${emails.slice(0, 10).map(e => `• ${e}`).join("\n")}${emails.length > 10 ? `\n...y ${emails.length - 10} más` : ""}` : "No encontré emails en este archivo.";
      } else if (question.includes("teléfono") || question.includes("telefono") || question.includes("phone")) {
        const phones = fileContext.match(/[\+]?[\d\s\-\(\)]{7,15}/g) || [];
        const unique = [...new Set(phones.map(p => p.trim()).filter(p => p.length > 6))];
        response = unique.length > 0 ? `📞 Encontré ${unique.length} teléfono(s):\n${unique.slice(0, 10).map(p => `• ${p}`).join("\n")}` : "No encontré números de teléfono en este archivo.";
      } else if (question.includes("cuántas") || question.includes("cuantas") || question.includes("cuántos") || question.includes("cuantos") || question.includes("total")) {
        response = `📊 Estadísticas de "${aiFile.name}":\n• Líneas: ${lines.length}\n• Palabras: ~${wordCount}\n• Caracteres: ${fileContext.length}\n• Tamaño: ${formatSize(aiFile.size)}`;
      } else {
        // Search in content
        const matches = lines.filter(l => l.toLowerCase().includes(question.replace(/[?¿!¡]/g, "").trim().split(" ").slice(-2).join(" ")));
        if (matches.length > 0) {
          response = `Encontré ${matches.length} coincidencia(s) relacionadas:\n\n${matches.slice(0, 5).map(m => `> ${m.trim()}`).join("\n\n")}`;
        } else {
          response = `No encontré información específica sobre "${aiInput}" en este archivo. Intenta preguntar:\n• "Resumen del archivo"\n• "¿Hay emails?"\n• "¿Cuántas líneas tiene?"\n• O busca un término específico`;
        }
      }
    }

    setTimeout(() => {
      setAiChat(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);
  }

  function openAiForFile(file: CrmFile) {
    setAiFile(file);
    setAiChat([{ role: "assistant", content: `📂 Archivo cargado: **${file.name}** (${formatSize(file.size)})\n\n¿Qué quieres saber? Puedes preguntar:\n• "Resúmelo"\n• "¿Tiene emails o teléfonos?"\n• "¿Cuántas líneas tiene?"\n• Cualquier búsqueda sobre el contenido` }]);
  }

  const filtered = files.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-brand" />Archivos & IA</h1>
            <p className="text-sm text-muted-foreground">{files.length} archivos · Importa, visualiza y pregúntale a la IA sobre su contenido</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" multiple accept=".txt,.csv,.json,.md,.pdf,.png,.jpg,.jpeg,.xlsx,.docx" onChange={handleUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Upload className="h-4 w-4" />Importar archivos</button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar archivos..." className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:outline-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File list */}
          <div className="lg:col-span-2">
            {filtered.length === 0 && files.length === 0 && (
              <div className="text-center py-16 rounded-lg border border-dashed">
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-muted-foreground mb-2">Sin archivos. Importa tu primer archivo.</p>
                <button onClick={() => fileInputRef.current?.click()} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Importar</button>
              </div>
            )}
            <div className="space-y-2">
              {filtered.map(file => (
                <div key={file.id} className="group flex items-center gap-3 rounded-lg border bg-white px-4 py-3 hover:shadow-sm">
                  <span className="text-xl">{getFileIcon(file.type, file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatSize(file.size)} · {new Date(file.uploadedAt).toLocaleDateString("es-CO")}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => setViewFile(file)} className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground hover:text-brand" title="Ver"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => openAiForFile(file)} className="rounded p-1.5 hover:bg-purple-50 text-muted-foreground hover:text-purple-600" title="Preguntar a IA"><Bot className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteFile(file.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat panel */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-white flex flex-col h-[500px]">
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold">Asistente IA</span>
                {aiFile && <span className="text-[9px] bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 truncate max-w-[120px]">{aiFile.name}</span>}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {aiChat.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-purple-300" />
                    <p>Selecciona un archivo (🤖) para empezar a preguntar</p>
                  </div>
                )}
                {aiChat.map((msg, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 text-xs whitespace-pre-wrap ${msg.role === "user" ? "bg-brand/10 text-brand ml-6" : "bg-gray-50 mr-6"}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="border-t p-3 flex gap-2">
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askAI(); }} placeholder={aiFile ? "Pregunta sobre el archivo..." : "Selecciona un archivo primero"} className="flex-1 rounded-lg border px-3 py-2 text-xs focus:border-brand focus:outline-none" />
                <button onClick={askAI} disabled={!aiInput.trim()} className="rounded-lg bg-purple-600 px-3 py-2 text-white hover:bg-purple-700 disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View File Modal */}
      {viewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewFile(null)}>
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><span>{getFileIcon(viewFile.type, viewFile.name)}</span>{viewFile.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openAiForFile(viewFile)} className="flex items-center gap-1 rounded-md bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200"><Bot className="h-3.5 w-3.5" />Preguntar a IA</button>
                <button onClick={() => setViewFile(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
              </div>
            </div>
            {viewFile.type.startsWith("image/") && viewFile.content ? (
              <img src={viewFile.content} alt={viewFile.name} className="w-full rounded-lg border" />
            ) : viewFile.textContent ? (
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 rounded-lg p-4 border max-h-[60vh] overflow-y-auto font-mono">{viewFile.textContent}</pre>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No se puede previsualizar este tipo de archivo.</p>
            )}
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
