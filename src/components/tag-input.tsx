"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";

/**
 * Reusable tag input with autocomplete.
 * Shows chips for selected tags, suggests from `suggestions` as you type.
 * Use across the CRM anywhere free-text tags are needed (suppliers, contacts, etc.)
 */
export function TagInput({
  value,
  onChange,
  suggestions,
  placeholder = "Escribe y presiona Enter...",
  className = "",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setInput("");
    setShowSuggestions(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  const filteredSuggestions = suggestions
    .filter((t) => !value.includes(t) && (!input || t.toLowerCase().includes(input.toLowerCase())))
    .slice(0, 8);

  return (
    <div className={`relative ${className}`}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {value.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
              <Tag className="h-2.5 w-2.5" />
              {t}
              <button onClick={() => removeTag(t)} className="hover:text-red-500" type="button">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={input}
        onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
          if (e.key === "Backspace" && !input && value.length > 0) removeTag(value[value.length - 1]!);
        }}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-36 overflow-y-auto rounded-md border bg-white shadow-lg">
          {filteredSuggestions.map((t) => (
            <button
              key={t}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(t); }}
              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs hover:bg-brand-tint"
            >
              <Tag className="h-3 w-3 text-brand" />
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
