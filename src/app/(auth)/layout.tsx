export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Vocero</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            CRM de WhatsApp con agente de IA
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
