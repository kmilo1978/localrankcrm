"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, Save, User } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type AccountConfig = {
  name: string;
  email: string;
  role: string;
  loggedIn: boolean;
  lastLogin: string;
};

const DEFAULT: AccountConfig = { name: "Admin", email: "", role: "owner", loggedIn: false, lastLogin: "" };

export default function AccountPage() {
  const [account, setAccount] = useState<AccountConfig>(DEFAULT);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setAccount(loadFromStorage("account_config", DEFAULT)); }, []);

  function handleLogin() {
    if (!loginForm.email.trim()) return;
    const acc: AccountConfig = { name: loginForm.name || loginForm.email.split("@")[0] || "Admin", email: loginForm.email, role: "owner", loggedIn: true, lastLogin: new Date().toLocaleString("es") };
    setAccount(acc);
    saveToStorage("account_config", acc);
    setLoginForm({ email: "", password: "", name: "" });
  }

  function handleLogout() {
    const acc: AccountConfig = { ...DEFAULT, loggedIn: false };
    setAccount(acc);
    saveToStorage("account_config", acc);
  }

  function handleSave() {
    saveToStorage("account_config", account);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><User className="h-5 w-5 text-brand" />Cuenta</h3>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tu sesión y perfil.</p>
      </div>

      {account.loggedIn ? (
        <>
          {/* Profile */}
          <div className="rounded-lg border bg-white p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-xl font-bold text-brand">
                {account.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Rol: {account.role === "owner" ? "Propietario" : "Miembro"} · Último login: {account.lastLogin}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <input value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">
              <Save className="h-4 w-4" />{saved ? "✓ Guardado" : "Guardar perfil"}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />Cerrar sesión
            </button>
          </div>
        </>
      ) : (
        /* Login form */
        <div className="rounded-lg border bg-white p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2"><LogIn className="h-4 w-4 text-brand" />Iniciar sesión</h4>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input value={loginForm.name} onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })} placeholder="Tu nombre" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="tu@email.com" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <button onClick={handleLogin} className="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">
              <LogIn className="h-4 w-4" />Iniciar sesión
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">La sesión se guarda localmente. Tus datos persisten en este navegador.</p>
        </div>
      )}
    </div>
  );
}
