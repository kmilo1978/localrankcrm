/**
 * Herramientas de email para el CRM — verificación y generación.
 * No requiere APIs externas — usa lógica local + DNS MX check cuando sea posible.
 */

/** Patrones comunes de email corporativo */
const EMAIL_PATTERNS = [
  "{first}@{domain}",
  "{last}@{domain}",
  "{first}.{last}@{domain}",
  "{first}{last}@{domain}",
  "{f}{last}@{domain}",
  "{first}.{f2}@{domain}",
  "{first}_{last}@{domain}",
  "{f}.{last}@{domain}",
];

/** Genera emails probables a partir de nombre + dominio */
export function generateProbableEmails(fullName: string, domain: string): { email: string; pattern: string; confidence: number }[] {
  if (!fullName.trim() || !domain.trim()) return [];

  const parts = fullName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);
  const first = parts[0] || "";
  const last = parts[parts.length - 1] || "";
  const f = first.charAt(0);
  const f2 = last.charAt(0);

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]!.toLowerCase();

  const results = EMAIL_PATTERNS.map((pattern, i) => {
    const email = pattern
      .replace("{first}", first)
      .replace("{last}", last)
      .replace("{f}", f)
      .replace("{f2}", f2)
      .replace("{domain}", cleanDomain);
    // Higher confidence for common patterns
    const confidence = i === 0 ? 35 : i === 2 ? 30 : i === 1 ? 15 : i === 3 ? 10 : 5;
    return { email, pattern, confidence };
  });

  return results.sort((a, b) => b.confidence - a.confidence);
}

/** Valida formato de email */
export function validateEmailFormat(email: string): { valid: boolean; reason: string } {
  if (!email) return { valid: false, reason: "Email vacío" };
  const trimmed = email.trim().toLowerCase();

  // Basic format check
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!regex.test(trimmed)) return { valid: false, reason: "Formato inválido" };

  // Check domain has at least one dot
  const domain = trimmed.split("@")[1];
  if (!domain || !domain.includes(".")) return { valid: false, reason: "Dominio sin TLD" };

  // Check TLD length
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) return { valid: false, reason: "TLD muy corto" };

  // Check for disposable domains
  const disposable = ["tempmail.com", "guerrillamail.com", "throwaway.email", "yopmail.com", "mailinator.com", "10minutemail.com", "trashmail.com"];
  if (disposable.some(d => domain.endsWith(d))) return { valid: false, reason: "Email temporal/desechable" };

  // Check for common typos in popular domains
  const typos: Record<string, string> = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "hotmal.com": "hotmail.com", "outlok.com": "outlook.com", "yahooo.com": "yahoo.com" };
  if (typos[domain]) return { valid: false, reason: `Posible typo: ¿quisiste decir ${typos[domain]}?` };

  return { valid: true, reason: "Formato válido" };
}

/** Verifica dominio MX (requiere API en producción, aquí simulamos con lógica) */
export function checkDomainReputation(domain: string): { score: number; type: string; details: string } {
  if (!domain) return { score: 0, type: "unknown", details: "Sin dominio" };

  const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]!.toLowerCase();

  // Free email providers
  const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "icloud.com", "aol.com", "protonmail.com", "mail.com"];
  if (freeProviders.includes(clean)) return { score: 60, type: "free", details: "Proveedor de email gratuito — probablemente personal, no corporativo" };

  // Known business domains (common TLDs)
  if (clean.endsWith(".com") || clean.endsWith(".io") || clean.endsWith(".co") || clean.endsWith(".com.co")) {
    return { score: 85, type: "business", details: "Dominio corporativo — alta probabilidad de email válido" };
  }

  if (clean.endsWith(".edu") || clean.endsWith(".gov")) {
    return { score: 95, type: "institutional", details: "Dominio institucional/gubernamental" };
  }

  return { score: 70, type: "other", details: "Dominio personalizado" };
}

/** Exportar datos como CSV */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]!);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      const str = val === null || val === undefined ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Exportar datos como JSON */
export function exportToJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
