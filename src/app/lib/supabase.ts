import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(...keys: string[]): { value: string; source: string | null } {
  for (const key of keys) {
    const raw = import.meta.env[key];
    if (typeof raw === "string" && raw.trim()) {
      return { value: raw.trim(), source: key };
    }
  }
  return { value: "", source: null };
}

const urlKeys = ["VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"] as const;
const keyKeys = [
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const url = readEnv(...urlKeys);
const anon = readEnv(...keyKeys);

export const hasSupabaseConfig = Boolean(url.value && anon.value);

function logSupabaseBoot(): void {
  const tag = "[Wagoo Auth]";
  if (hasSupabaseConfig) {
    console.info(
      `${tag} OK — URL via ${url.source}, chave via ${anon.source}`,
    );
    return;
  }

  const missing: string[] = [];
  if (!url.value) missing.push(`URL (tente: ${urlKeys.join(" | ")})`);
  if (!anon.value) missing.push(`ANON/PUBLISHABLE KEY (tente: ${keyKeys.join(" | ")})`);

  console.error(
    `${tag} CONFIG AUSENTE NO BUILD — login/dashboard vão falhar.`,
    {
      missing,
      tip: "No Vite só entram no bundle variáveis VITE_* ou NEXT_PUBLIC_* (vite.config envPrefix). Faça Redeploy após salvar na Vercel.",
      note: "POSTGRES_* e SUPABASE_SERVICE_ROLE_KEY NÃO devem ir ao frontend.",
    },
  );
}

logSupabaseBoot();

/**
 * Sem env no build: placeholder para a UI não quebrar; Auth real exige URL+chave.
 */
export const supabase: SupabaseClient = createClient(
  url.value || "https://placeholder.supabase.co",
  anon.value || "public-anon-key-placeholder",
);
