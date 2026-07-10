"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { TemplateDto } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STATUS_BADGE: Record<
  TemplateDto["status"],
  { label: string; variant: "secondary" | "warning" | "success" | "destructive" }
> = {
  draft: { label: "Borrador", variant: "secondary" },
  pending: { label: "Pendiente de Meta", variant: "warning" },
  approved: { label: "Aprobada", variant: "success" },
  rejected: { label: "Rechazada", variant: "destructive" },
};

export function TemplatesClient() {
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/templates").catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json()) as { templates: TemplateDto[] };
    setTemplates(data.templates);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  async function sync() {
    setSyncing(true);
    setSyncMsg(null);
    const res = await fetch("/api/templates/sync", { method: "POST" }).catch(
      () => null
    );
    setSyncing(false);
    if (res?.ok) {
      const data = (await res.json()) as { updated: number };
      setSyncMsg(
        data.updated > 0
          ? `${data.updated} plantilla(s) actualizada(s)`
          : "Todo al día"
      );
      void refetch();
    } else {
      const data = (await res?.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setSyncMsg(data?.error?.message ?? "No se pudo sincronizar");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Las plantillas permiten reabrir conversaciones con la ventana de 24 h
          cerrada. Meta las aprueba en horas o días; el estado se actualiza por
          webhook y con el botón Sincronizar (imprescindible en modo agencia,
          donde los eventos de plantillas no llegan al webhook de la instancia).
        </p>
        <Button variant="outline" size="sm" disabled={syncing} onClick={() => void sync()}>
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          Sincronizar
        </Button>
      </div>
      {syncMsg && <p className="text-xs text-muted-foreground">{syncMsg}</p>}

      <CreateForm onCreated={() => void refetch()} />

      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm font-medium">
                {t.name}{" "}
                <span className="text-muted-foreground">({t.language})</span>
              </p>
              <Badge variant={STATUS_BADGE[t.status].variant}>
                {STATUS_BADGE[t.status].label}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
            {t.status === "rejected" && t.rejectionReason && (
              <p className="mt-2 text-xs text-destructive">
                Razón del rechazo: {t.rejectionReason}
              </p>
            )}
          </div>
        ))}
        {templates.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Sin plantillas todavía. Crea la primera arriba — por ejemplo un
            «seguimos disponibles, ¿retomamos tu cotización?» para
            conversaciones frías.
          </p>
        )}
      </div>
    </div>
  );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("es_MX");
  const [category, setCategory] = useState<"UTILITY" | "MARKETING">("UTILITY");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, language, category, body }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      const data = (await res?.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(data?.error?.message ?? "No se pudo crear la plantilla");
      return;
    }
    setName("");
    setBody("");
    onCreated();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva plantilla</CardTitle>
        <CardDescription>
          Cuerpo con máximo UNA variable <code>{"{{1}}"}</code> (v1). Se envía a
          aprobación de Meta al crearla.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Nombre</Label>
            <Input
              id="tpl-name"
              placeholder="seguimiento_cotizacion"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-lang">Idioma</Label>
            <select
              id="tpl-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="es_MX">es_MX</option>
              <option value="es">es</option>
              <option value="es_AR">es_AR</option>
              <option value="en_US">en_US</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-cat">Categoría</Label>
            <select
              id="tpl-cat"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "UTILITY" | "MARKETING")
              }
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="UTILITY">UTILITY (seguimiento)</option>
              <option value="MARKETING">MARKETING</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tpl-body">Cuerpo</Label>
          <Textarea
            id="tpl-body"
            rows={3}
            placeholder="Hola {{1}}, seguimos disponibles. ¿Retomamos tu cotización?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          disabled={saving || !name.trim() || !body.trim()}
          onClick={() => void create()}
        >
          {saving ? "Enviando a Meta…" : "Crear y enviar a aprobación"}
        </Button>
      </CardContent>
    </Card>
  );
}
