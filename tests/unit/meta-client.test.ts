import { describe, expect, it } from "vitest";
import { MetaApiError, normalizeRecipient } from "@/lib/meta/client";

describe("normalizeRecipient", () => {
  it("México móvil legado: 521 + 10 dígitos → 52 + 10 dígitos", () => {
    expect(normalizeRecipient("5215512345678")).toBe("525512345678");
  });

  it("México ya normalizado queda intacto", () => {
    expect(normalizeRecipient("525512345678")).toBe("525512345678");
  });

  it("otros países quedan intactos", () => {
    expect(normalizeRecipient("14155552671")).toBe("14155552671");
    expect(normalizeRecipient("5491122334455")).toBe("5491122334455");
  });

  it("no confunde números que empiezan en 521 pero con otra longitud", () => {
    expect(normalizeRecipient("521123")).toBe("521123");
  });
});

describe("MetaApiError.isAuthError", () => {
  it("status 401 es error de auth", () => {
    expect(new MetaApiError("x", { status: 401 }).isAuthError).toBe(true);
  });

  it("code 190 es error de auth (token vencido)", () => {
    expect(new MetaApiError("x", { status: 400, code: 190 }).isAuthError).toBe(
      true
    );
  });

  it("OAuthException es error de auth", () => {
    expect(
      new MetaApiError("x", { status: 400, type: "OAuthException" }).isAuthError
    ).toBe(true);
  });

  it("un 500 cualquiera NO es error de auth", () => {
    expect(new MetaApiError("x", { status: 500 }).isAuthError).toBe(false);
  });
});
