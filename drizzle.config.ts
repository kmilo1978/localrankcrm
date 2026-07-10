import { readFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit corre fuera de Next: carga .env manualmente si hace falta.
function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(".env", "utf8");
    const line = env
      .split(/\r?\n/)
      .find((l) => l.startsWith("DATABASE_URL="));
    if (line) return line.slice("DATABASE_URL=".length).trim();
  } catch {
    // sin .env: se devolverá vacío y drizzle-kit dará un error claro
  }
  return "";
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: loadDatabaseUrl(),
  },
});
