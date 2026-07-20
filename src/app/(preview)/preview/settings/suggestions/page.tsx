"use client";
import { useState } from "react";
import { CheckCircle2, Lightbulb, Mail, MessageSquare, Send } from "lucide-react";

export default function SuggestionsPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "feature", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!form.message.trim()) return;
    // In production this would send an email via API
    // For now, open mailto link
    const subject = encodeURIComponent(`[LocalRank CRM] ${form.type === "feature" ? "Sugerencia" : form.type === "bug" ? "Bug report" : "Feedback"}: ${form.message.slice(0, 50)}`);
    const body = encodeURIComponent(`Nombre: ${form.name || "Anónimo"}\nEmail: ${form.email || "No proporcionado"}\nTipo: ${form.type}\n\nMensaje:\n${form.message}`);
    window.open(`mailto:jkbotero78@gmail.com?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: "", email: "", type: "feature", message: "" }); }, 3000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" />Sugerencias & Feedback</h3>
        <p className="mt-1 text-sm text-muted-foreground">¿Tienes una idea, encontraste un bug o quieres darnos feedback? Tu opinión nos ayuda a mejorar.</p>
      </div>

      {sent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <h4 className="text-lg font-semibold text-green-800">¡Gracias por tu sugerencia!</h4>
          <p className="text-sm text-green-700 mt-1">La revisaremos pronto. Tu feedback nos importa.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tu nombre (opcional)</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Juan Pérez" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tu email (opcional)</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="tu@email.com" type="email" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Tipo</label>
            <div className="flex gap-2 mt-1">
              {[
                { id: "feature", label: "💡 Sugerencia", desc: "Nueva funcionalidad" },
                { id: "bug", label: "🐛 Bug", desc: "Algo no funciona" },
                { id: "feedback", label: "💬 Feedback", desc: "Opinión general" },
                { id: "ux", label: "🎨 UX/Diseño", desc: "Mejora visual" },
              ].map(t => (
                <button key={t.id} onClick={() => setForm({...form, type: t.id})} className={`flex-1 rounded-lg border p-3 text-center text-xs ${form.type === t.id ? "border-brand bg-brand/5 font-medium" : "hover:bg-gray-50"}`}>
                  <span className="block text-base mb-0.5">{t.label.split(" ")[0]}</span>
                  <span className="block text-[10px] text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Mensaje *</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Describe tu sugerencia, bug o feedback con el mayor detalle posible..." rows={5} className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
          </div>

          <button onClick={handleSubmit} disabled={!form.message.trim()} className="w-full rounded-md bg-brand py-3 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50 flex items-center justify-center gap-2">
            <Send className="h-4 w-4" />Enviar sugerencia
          </button>

          <p className="text-[10px] text-muted-foreground text-center">Se abrirá tu cliente de email para enviar a jkbotero78@gmail.com</p>
        </div>
      )}

      {/* Contact info */}
      <div className="rounded-lg border bg-gray-50 p-5">
        <h4 className="text-sm font-semibold mb-3">Otras formas de contacto</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><a href="mailto:jkbotero78@gmail.com" className="text-brand hover:underline">jkbotero78@gmail.com</a></p>
          <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><a href="mailto:localrankmedellin@gmail.com" className="text-brand hover:underline">localrankmedellin@gmail.com</a></p>
          <p className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /><a href="https://localrank.com.co" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">localrank.com.co</a></p>
        </div>
      </div>
    </div>
  );
}
