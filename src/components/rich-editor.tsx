"use client";

import { useRef, useCallback } from "react";
import { Bold, Code, Italic, Link, Strikethrough, Type, Underline } from "lucide-react";

type RichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Lightweight rich text editor using contentEditable + execCommand.
 * Supports: Bold, Italic, Underline, Strikethrough, Code, Links, Headings.
 * No external dependencies required.
 */
export function RichEditor({ value, onChange, placeholder = "Escribe aquí...", className = "", minHeight = "100px" }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  function handleLink() {
    const url = prompt("URL del enlace:");
    if (url) exec("createLink", url);
  }

  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  return (
    <div className={`rounded-md border bg-white overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b px-2 py-1.5 bg-gray-50 flex-wrap">
        <button type="button" onClick={() => exec("bold")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Negrita"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("italic")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Itálica"><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("underline")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Subrayado"><Underline className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("strikethrough")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Tachado"><Strikethrough className="h-3.5 w-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => exec("formatBlock", "h2")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Título"><Type className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => exec("insertHTML", "<code>" + (window.getSelection()?.toString() || "código") + "</code>")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Código"><Code className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={handleLink} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Enlace"><Link className="h-3.5 w-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className="rounded px-1.5 py-1 hover:bg-gray-200 text-[10px] text-muted-foreground hover:text-foreground" title="Lista">• Lista</button>
        <button type="button" onClick={() => exec("insertOrderedList")} className="rounded px-1.5 py-1 hover:bg-gray-200 text-[10px] text-muted-foreground hover:text-foreground" title="Lista numerada">1. Lista</button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className="px-3 py-2 text-sm outline-none prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        style={{ minHeight }}
      />
    </div>
  );
}
