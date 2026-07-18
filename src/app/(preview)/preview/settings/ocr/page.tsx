"use client";
import { useState, useRef } from "react";
import { FileText, Image, Loader2, ScanLine, Upload } from "lucide-react";

type OcrResult = { id: string; fileName: string; text: string; processedAt: string };

export default function OcrSettingsPage() {
  const [results, setResults] = useState<OcrResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [provider, setProvider] = useState("browser");
  const [apiKey, setApiKey] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);

    // Simulated OCR — in production would use Tesseract.js or API
    setTimeout(() => {
      const fakeText = file.name.includes("factura")
        ? "FACTURA #1045\nFecha: 15/07/2026\nCliente: TechCorp Solutions\nConcepto: Servicio de consultoría Q3\nSubtotal: $8,500.00\nIVA (19%): $1,615.00\nTotal: $10,115.00\nForma de pago: Transferencia bancaria"
        : file.name.includes("tarjeta") || file.name.includes("card")
        ? "Juan Carlos Méndez\nDirector Comercial\nTechCorp Solutions\nEmail: jc.mendez@techcorp.com\nTel: +52 55 1234 5678\nWeb: www.techcorp.com\nDirección: Cl. 19a #44-25, El Poblado, Medellín"
        : `Texto extraído de: ${file.name}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nNúmero detectado: +57 300 123 4567\nEmail: contacto@ejemplo.com\nFecha: ${new Date().toLocaleDateString("es")}`;

      setResults((prev) => [{ id: Date.now().toString(), fileName: file.name, text: fakeText, processedAt: new Date().toLocaleString("es") }, ...prev]);
      setProcessing(false);
    }, 2000);
    e.target.value = "";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><ScanLine className="h-5 w-5 text-brand" />OCR — Reconocimiento de texto</h3>
        <p className="mt-1 text-sm text-muted-foreground">Extrae texto de imágenes, facturas, tarjetas de presentación y documentos escaneados.</p>
      </div>

      {/* Provider config */}
      <div className="rounded-lg border bg-white p-5 space-y-4">
        <h4 className="font-medium">Proveedor OCR</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Motor de OCR</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              <option value="browser">Tesseract.js (navegador, gratis)</option>
              <option value="google_vision">Google Cloud Vision</option>
              <option value="aws_textract">AWS Textract</option>
              <option value="azure_ocr">Azure Computer Vision</option>
              <option value="openai_vision">OpenAI Vision (GPT-4o)</option>
            </select>
          </div>
          {provider !== "browser" && (
            <div>
              <label className="mb-1 block text-sm font-medium">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Tu API key del proveedor" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
          )}
        </div>
        <div className="rounded border bg-gray-50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Casos de uso:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Escanear tarjetas de presentación → crear contacto automáticamente</li>
            <li>Extraer datos de facturas → registrar en cobros/pipeline</li>
            <li>Digitalizar documentos físicos → guardar en workspace</li>
            <li>Leer capturas de WhatsApp → importar conversaciones</li>
          </ul>
        </div>
      </div>

      {/* Upload & Process */}
      <div className="rounded-lg border bg-white p-5">
        <h4 className="font-medium mb-3">Procesar imagen</h4>
        <div className="flex items-center gap-4">
          <input type="file" ref={fileRef} onChange={handleFile} accept="image/*,.pdf" className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={processing} className="flex items-center gap-2 rounded-md border border-dashed px-6 py-4 text-sm hover:bg-gray-50 disabled:opacity-50">
            {processing ? <Loader2 className="h-5 w-5 animate-spin text-brand" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
            {processing ? "Procesando..." : "Subir imagen o PDF"}
          </button>
          <div className="text-xs text-muted-foreground">
            <p>Formatos: JPG, PNG, PDF, WEBP</p>
            <p>Máx: 10 MB</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-lg border bg-white p-5">
          <h4 className="font-medium mb-3">Resultados ({results.length})</h4>
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.id} className="rounded border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{r.fileName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{r.processedAt}</span>
                </div>
                <pre className="whitespace-pre-wrap rounded bg-gray-50 border p-3 text-xs font-mono">{r.text}</pre>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(r.text)} className="rounded border px-2 py-1 text-[10px] hover:bg-gray-50">Copiar texto</button>
                  <button className="rounded border px-2 py-1 text-[10px] hover:bg-gray-50">→ Crear contacto</button>
                  <button className="rounded border px-2 py-1 text-[10px] hover:bg-gray-50">→ Guardar en workspace</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
