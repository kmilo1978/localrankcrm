import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocero CRM",
  description:
    "CRM de WhatsApp self-hosted con agente de IA y Laboratorio de auto-evaluación",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
