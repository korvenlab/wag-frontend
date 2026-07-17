import { hasSupabaseConfig } from "../lib/supabase";

/** Aviso visível quando o build da Vercel não embutiu URL/chave do Auth. */
export function SupabaseConfigBanner() {
  if (hasSupabaseConfig) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-0 inset-x-0 z-[200] bg-red-600 text-white px-4 py-3 text-center text-sm font-bold shadow-lg"
    >
      [Wagoo] Auth sem config no build — confira no console (F12) e as envs VITE_* /
      NEXT_PUBLIC_* na Vercel + Redeploy. Login pode falhar.
    </div>
  );
}
