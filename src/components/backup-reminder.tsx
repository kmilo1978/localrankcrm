"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

/**
 * Shows a backup reminder notification daily at 7:00 PM.
 * Dismissed for the day once user exports or clicks dismiss.
 */
export function BackupReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function checkTime() {
      const now = new Date();
      const hour = now.getHours();
      const today = now.toISOString().split("T")[0];
      const dismissed = localStorage.getItem("localrank_backup_reminder_dismissed");

      // Show at 7pm (19:00) if not dismissed today
      if (hour >= 19 && dismissed !== today) {
        setShow(true);
        // Also try browser notification
        if (Notification.permission === "granted") {
          new Notification("LocalRank CRM - Backup", {
            body: "Recuerda hacer backup de tu CRM y subirlo a Google Drive",
            icon: "/icon.svg",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    }

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  function dismiss() {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("localrank_backup_reminder_dismissed", today!);
    setShow(false);
  }

  function doBackup() {
    // Export all localStorage data
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("localrank_")) {
        try { data[key] = JSON.parse(localStorage.getItem(key) || "null"); } catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `localrank-crm-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 rounded-xl border bg-white p-4 shadow-2xl animate-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
          <Download className="h-5 w-5 text-brand" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Backup diario</p>
          <p className="text-xs text-muted-foreground mt-0.5">Recuerda exportar tu CRM y subirlo a Google Drive.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={doBackup} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover">
              Exportar ahora
            </button>
            <button onClick={dismiss} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
              Ya lo hice
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
