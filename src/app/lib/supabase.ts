import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || "";
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || "";

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.error(
    "[Wagoo] Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de build (Vercel → Settings → Environment Variables) e faça Redeploy.",
  );
}

/**
 * Cliente Supabase. Sem env no build, usa placeholder para a landing não quebrar;
 * login/API só funcionam com as variáveis reais.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key-placeholder",
);
