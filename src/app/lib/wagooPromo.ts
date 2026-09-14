const WAGOO_PROMO_STORAGE_KEY = "wagoo_promo_code";

/** Lê código de cortesia (query, sessionStorage ou localStorage). */
export function readWagooPromoCode(
  searchParams?: URLSearchParams | null,
): string | null {
  const fromQuery =
    searchParams?.get("wagoo_promo")?.trim().toLowerCase() ||
    searchParams?.get("promo")?.trim().toLowerCase() ||
    null;
  if (fromQuery) return fromQuery;
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

/** Persiste em session + local para sobreviver ao redirect do Google (e www vs apex). */
export function persistWagooPromoCode(code: string): void {
  const normalized = code.trim().toLowerCase();
  if (!normalized || normalized.length > 64) return;
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
  | { ok: true; status: number; already?: boolean }
  | { ok: false; status: number; error: string }
  | { ok: false; status: 0; error: string; skipped: true };

/**
 * Resgata cortesia pendente. Só limpa o storage em sucesso / já resgatado.
 * Não limpa em 404/5xx para permitir nova tentativa.
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

    if (res.ok) {
      clearWagooPromoCode();
      return { ok: true, status: res.status };
    }

    if (res.status === 409) {
      clearWagooPromoCode();
      return { ok: true, status: 409, already: true };
    }

    let error = `Falha ao resgatar cortesia (${res.status}).`;
    try {
      const body = (await res.json()) as { error?: string };
      if (typeof body.error === "string" && body.error.trim()) error = body.error;
    } catch {
      /* ignore */
    }
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
