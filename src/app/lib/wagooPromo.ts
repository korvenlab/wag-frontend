const WAGOO_PROMO_STORAGE_KEY = "wagoo_promo_code";
const WAGOO_PROMO_COOKIE = "wagoo_promo";

function readCookie(name: string): string | null {
  try {
    const parts = document.cookie.split(";").map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith(`${name}=`)) {
        return decodeURIComponent(part.slice(name.length + 1));
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writePromoCookie(code: string): void {
  try {
    const maxAge = 60 * 60 * 6;
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
    // Domain=.wagoobot.com cobre apex e www
    const host = typeof location !== "undefined" ? location.hostname : "";
    const domain =
      host === "wagoobot.com" || host.endsWith(".wagoobot.com")
        ? "; Domain=.wagoobot.com"
        : "";
    document.cookie = `${WAGOO_PROMO_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${domain}`;
  } catch {
    /* ignore */
  }
}

function clearPromoCookie(): void {
  try {
    const host = typeof location !== "undefined" ? location.hostname : "";
    const domain =
      host === "wagoobot.com" || host.endsWith(".wagoobot.com")
        ? "; Domain=.wagoobot.com"
        : "";
    document.cookie = `${WAGOO_PROMO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${domain}`;
  } catch {
    /* ignore */
  }
}

/** Lê código de cortesia (query, cookie, sessionStorage ou localStorage). */
export function readWagooPromoCode(
  searchParams?: URLSearchParams | null,
): string | null {
  const fromQuery =
    searchParams?.get("wagoo_promo")?.trim().toLowerCase() ||
    searchParams?.get("promo")?.trim().toLowerCase() ||
    null;
  if (fromQuery) return fromQuery;
  const fromCookie = readCookie(WAGOO_PROMO_COOKIE)?.trim().toLowerCase();
  if (fromCookie) return fromCookie;
  try {
    const fromSession = sessionStorage.getItem(WAGOO_PROMO_STORAGE_KEY)?.trim().toLowerCase();
    if (fromSession) return fromSession;
    const fromLocal = localStorage.getItem(WAGOO_PROMO_STORAGE_KEY)?.trim().toLowerCase();
    if (fromLocal) return fromLocal;
  } catch {
    /* private mode */
  }
  return null;
}

/** Persiste em cookie + session + local para sobreviver ao redirect do Google. */
export function persistWagooPromoCode(code: string): void {
  const normalized = code.trim().toLowerCase();
  if (!normalized || normalized.length > 64) return;
  writePromoCookie(normalized);
  try {
    sessionStorage.setItem(WAGOO_PROMO_STORAGE_KEY, normalized);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(WAGOO_PROMO_STORAGE_KEY, normalized);
  } catch {
    /* ignore */
  }
}

export function clearWagooPromoCode(): void {
  clearPromoCookie();
  try {
    sessionStorage.removeItem(WAGOO_PROMO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(WAGOO_PROMO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export type PromoRedeemResult =
  | { ok: true; status: number; already?: boolean; hasAccess?: boolean }
  | { ok: false; status: number; error: string }
  | { ok: false; status: 0; error: string; skipped: true };

/**
 * Resgata cortesia pendente. Só limpa o storage em sucesso / já resgatado com acesso.
 */
export async function redeemPendingWagooPromo(
  accessToken: string,
  apiBase: string,
): Promise<PromoRedeemResult> {
  const code = readWagooPromoCode();
  if (!code) {
    return { ok: false, status: 0, error: "Sem código pendente.", skipped: true };
  }

  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/promo/redeem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
    });

    let body: {
      error?: string;
      has_access?: boolean;
      ok?: boolean;
      already?: boolean;
    } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      /* ignore */
    }

    if (res.ok) {
      clearWagooPromoCode();
      return {
        ok: true,
        status: res.status,
        already: body.already === true,
        hasAccess: body.has_access === true,
      };
    }

    if (res.status === 409) {
      // Legado: alguns deploys ainda devolvem 409
      clearWagooPromoCode();
      return { ok: true, status: 409, already: true, hasAccess: body.has_access === true };
    }

    const error =
      typeof body.error === "string" && body.error.trim()
        ? body.error
        : `Falha ao resgatar cortesia (${res.status}).`;
    console.warn("[wagoo promo] resgate não concluído:", res.status, error);
    return { ok: false, status: res.status, error };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Erro de rede no resgate.";
    console.warn("[wagoo promo] resgate:", error);
    return { ok: false, status: 0, error };
  }
}

export function buildLoginRedirectWithPromo(origin: string, code: string | null): string {
  const base = `${origin.replace(/\/+$/, "")}/login`;
  if (!code) return base;
  return `${base}?wagoo_promo=${encodeURIComponent(code)}`;
}

export { WAGOO_PROMO_STORAGE_KEY };
