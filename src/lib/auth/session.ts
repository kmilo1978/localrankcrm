import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { resolveActiveOrganizationId } from "@/server/auth/on-signup";

export type SessionContext = {
  userId: string;
  organizationId: string;
  role: string;
};

export class UnauthorizedError extends Error {
  constructor(message = "No autenticado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Sesión + organización activa para route handlers y server components.
 * Lanza UnauthorizedError si no hay sesión u organización.
 */
export async function requireSession(): Promise<SessionContext> {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError();
  let organizationId = (
    session.session as { activeOrganizationId?: string | null }
  ).activeOrganizationId;
  if (!organizationId) {
    // La sesión del registro inicial se crea antes de que el hook de alta
    // termine de sembrar la organización: se resuelve por membresía.
    organizationId = await resolveActiveOrganizationId(session.user.id);
  }
  if (!organizationId) {
    throw new UnauthorizedError("Sesión sin organización activa");
  }
  return {
    userId: session.user.id,
    organizationId,
    role: "member",
  };
}

/** Igual que requireSession pero devuelve null en vez de lanzar. */
export async function getSessionOrNull(): Promise<SessionContext | null> {
  try {
    return await requireSession();
  } catch {
    return null;
  }
}
