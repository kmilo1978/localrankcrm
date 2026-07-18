"use client";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { category: "Navegacion", items: [
    { keys: ["Ctrl", "1"], action: "Ir al Dashboard" }, { keys: ["Ctrl", "2"], action: "Ir a Contactos" },
    { keys: ["Ctrl", "3"], action: "Ir a Pipeline" }, { keys: ["Ctrl", "4"], action: "Ir a Tareas" },
    { keys: ["Ctrl", "5"], action: "Ir a Conversaciones" }, { keys: ["Ctrl", ","], action: "Abrir Configuracion" },
  ]},
  { category: "Acciones rapidas", items: [
    { keys: ["Ctrl", "N"], action: "Nuevo contacto / tarea / nota (segun pagina)" },
    { keys: ["Ctrl", "K"], action: "Busqueda global (Command Palette)" },
    { keys: ["Ctrl", "Shift", "N"], action: "Nueva nota rapida" },
    { keys: ["Ctrl", "Enter"], action: "Guardar formulario actual" },
    { keys: ["Escape"], action: "Cerrar modal / cancelar" },
  ]},
  { category: "Edicion", items: [
    { keys: ["Ctrl", "C"], action: "Copiar elemento seleccionado" },
    { keys: ["Ctrl", "V"], action: "Pegar desde portapapeles" },
    { keys: ["Ctrl", "D"], action: "Duplicar elemento" },
    { keys: ["Ctrl", "Z"], action: "Deshacer ultimo cambio" },
    { keys: ["Delete"], action: "Eliminar elemento seleccionado" },
  ]},
  { category: "Vista", items: [
    { keys: ["Ctrl", "Shift", "D"], action: "Alternar modo oscuro/claro" },
    { keys: ["Ctrl", "B"], action: "Colapsar/expandir sidebar" },
    { keys: ["Ctrl", "+"], action: "Zoom in" },
    { keys: ["Ctrl", "-"], action: "Zoom out" },
  ]},
];

export default function ShortcutsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2"><Keyboard className="h-5 w-5 text-brand" />Atajos de teclado</h3>
        <p className="text-sm text-muted-foreground">Usa estos atajos para navegar y operar el CRM mas rapido.</p>
      </div>

      <div className="space-y-6">
        {SHORTCUTS.map(section => (
          <div key={section.category} className="rounded-lg border p-4">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">{section.category}</h4>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm">{item.action}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((key, ki) => (
                      <span key={ki}>
                        <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border bg-gray-50 px-1.5 text-[10px] font-medium text-gray-700 shadow-sm">{key}</kbd>
                        {ki < item.keys.length - 1 && <span className="mx-0.5 text-xs text-muted-foreground">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed bg-gray-50 p-4 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Nota:</p>
        <p>En Mac reemplaza Ctrl por Cmd. Los atajos se activan cuando no hay un campo de texto enfocado.</p>
      </div>
    </div>
  );
}
