"use client";

import { useRef, useCallback, useEffect } from "react";
import { Bold, Code, Italic, Link, Strikethrough, Type, Underline } from "lucide-react";

type RichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlurSave?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Lightweight rich text editor using contentEditable + execCommand.
 * Supports: Bold, Italic, Underline, Strikethrough, Code, Links, Headings.
 *
 * KEY FIX: We NEVER use dangerouslySetInnerHTML after mount.
 * Initial HTML is set once via useEffect. Subsequent `value` prop changes
 * from outside are ignored while the editor has focus (user is typing).
 * This preserves cursor position, text selection, and Ctrl+Z undo history.
 */
export function RichEditor({
  value,
  onChange,
  onBlurSave,
  placeholder = "Escribe aquí...",
  className = "",
  minHeight = "100px",
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);
  // Track the last value we pushed into the DOM so we can detect
  // external changes (e.g. switching to a different record) vs. our own edits.
  const lastExternalValue = useRef<string | null>(null);

  // On mount: set initial content once.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
      lastExternalValue.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When `value` changes from outside (e.g. parent switches to a different
  // section/record), update the DOM — but ONLY when not focused, and only
  // when it's genuinely a different value than what we last wrote.
  useEffect(() => {
    if (!editorRef.current) return;
    if (isFocused.current) return; // user is typing — don't clobber
    if (value === lastExternalValue.current) return; // same content — skip
    editorRef.current.innerHTML = value;
    lastExternalValue.current = value;
  }, [value]);

  const exec = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        lastExternalValue.current = html;
        onChange(html);
      }
    },
    [onChange],
  );

  function handleLink() {
    const url = prompt("URL del enlace:");
    if (url) exec("createLink", url);
  }

  function handleInput() {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastExternalValue.current = html;
      onChange(html);
    }
  }

  return (
    <div className={`rounded-md border bg-white overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b px-2 py-1.5 bg-gray-50 flex-wrap">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Negrita"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Itálica"><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Subrayado"><Underline className="h-3.5 w-3.5" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("strikethrough")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Tachado"><Strikethrough className="h-3.5 w-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("formatBlock", "h2")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Título"><Type className="h-3.5 w-3.5" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertHTML", "<code>" + (window.getSelection()?.toString() || "código") + "</code>")} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Código"><Code className="h-3.5 w-3.5" /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleLink} className="rounded p-1.5 hover:bg-gray-200 text-muted-foreground hover:text-foreground" title="Enlace"><Link className="h-3.5 w-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")} className="rounded px-1.5 py-1 hover:bg-gray-200 text-[10px] text-muted-foreground hover:text-foreground" title="Lista">• Lista</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")} className="rounded px-1.5 py-1 hover:bg-gray-200 text-[10px] text-muted-foreground hover:text-foreground" title="Lista numerada">1. Lista</button>
      </div>

      {/* Editor — no dangerouslySetInnerHTML after mount */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => {
          isFocused.current = false;
          handleInput();
          if (onBlurSave && editorRef.current) onBlurSave(editorRef.current.innerHTML);
        }}
        onInput={handleInput}
        data-placeholder={placeholder}
        className="px-3 py-2 text-sm outline-none prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        style={{ minHeight }}
      />
    </div>
  );
}
