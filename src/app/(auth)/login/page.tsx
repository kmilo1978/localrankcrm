"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Captcha } from "@/components/captcha";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(
        err.status === 429
          ? "Demasiados intentos. Espera unos minutos."
          : "Correo o contraseña incorrectos."
      );
      return;
    }
    router.push("/inbox");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      setError("Error al conectar con Google. Verifica la configuración.");
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    try {
      await authClient.forgetPassword({ email: resetEmail, redirectTo: "/login" });
      setResetSent(true);
    } catch {
      setResetSent(true); // Don't reveal if email exists
    }
  }

  if (showReset) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {resetSent ? (
            <div className="text-center space-y-3">
              <p className="text-3xl">📧</p>
              <p className="text-sm text-muted-foreground">Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
              <Button onClick={() => { setShowReset(false); setResetSent(false); }} variant="outline" className="w-full">Volver al login</Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input id="reset-email" type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} autoFocus />
              </div>
              <Button type="submit" className="w-full">Enviar enlace de recuperación</Button>
              <button type="button" onClick={() => setShowReset(false)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">← Volver al login</button>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Google Sign In */}
        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar con Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">o con email</span></div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <button type="button" onClick={() => setShowReset(true)} className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Captcha onVerify={(token) => setCaptchaToken(token)} onExpire={() => setCaptchaToken("")} />
          <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Primera vez aquí?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Crear la cuenta inicial
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
