import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const WAGOO_PROMO_STORAGE_KEY = "wagoo_promo_code";

async function redeemPendingPromo(accessToken: string, apiBase: string): Promise<void> {
  const code = sessionStorage.getItem(WAGOO_PROMO_STORAGE_KEY)?.trim().toLowerCase();
  if (!code) return;
  try {
    const res = await fetch(`${apiBase}/api/promo/redeem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if (res.ok || res.status === 404 || res.status === 409) {
      sessionStorage.removeItem(WAGOO_PROMO_STORAGE_KEY);
    }
  } catch {
    /* ignore — AuthContext tenta de novo depois */
  }
}

async function syncProviderTokens(session: Session, apiBase: string): Promise<boolean> {
  if (!session.provider_token) return true;

  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(`${apiBase}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token,
          expiresAt: session.expires_at,
        }),
      });
      if (response.ok) return true;
      if (response.status === 400 || response.status === 401) return false;
    } catch {
      if (i < 2) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return false;
}

async function userHasWagooAccess(accessToken: string, apiBase: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (typeof data.has_access === "boolean") return data.has_access;
    return !!data.has_paid;
  } catch {
    return false;
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verificando sessão...");
  /** Só mostra "Entrar com Google" quando não há sessão em curso de sync. */
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [promoActive, setPromoActive] = useState(false);
  const syncProcessed = useRef(false);

  const apiBase =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://wag-backend.onrender.com";

  useEffect(() => {
    const promo =
      searchParams.get("wagoo_promo")?.trim().toLowerCase() ||
      searchParams.get("promo")?.trim().toLowerCase();
    if (promo) {
      sessionStorage.setItem(WAGOO_PROMO_STORAGE_KEY, promo);
    }
    setPromoActive(!!sessionStorage.getItem(WAGOO_PROMO_STORAGE_KEY));
  }, [searchParams]);

  useEffect(() => {
    const finishLogin = async (session: Session) => {
      if (syncProcessed.current) return;
      if (!session.user) {
        setStatus("Aguardando login com Google...");
        setShowLoginButton(true);
        return;
      }

      setShowLoginButton(false);
      syncProcessed.current = true;

      try {
        if (session.provider_token) {
          setStatus("Sincronizando sua conta...");
          await syncProviderTokens(session, apiBase);
        }

        setStatus("Verificando seu plano...");
        await redeemPendingPromo(session.access_token, apiBase);
        const hasAccess = await userHasWagooAccess(session.access_token, apiBase);

        if (hasAccess) {
          setStatus("Tudo certo! Entrando...");
          navigate("/dashboard", { replace: true });
          return;
        }

        setStatus("Escolha um plano para continuar...");
        navigate("/#precos", { replace: true });
      } catch {
        syncProcessed.current = false;
        setShowLoginButton(true);
        setStatus("Não foi possível verificar a conta. Tente de novo.");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        void finishLogin(session);
      } else {
        setStatus("Aguardando login com Google...");
        setShowLoginButton(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (["SIGNED_IN", "INITIAL_SESSION"].includes(event) && session) {
        setShowLoginButton(false);
        void finishLogin(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, apiBase]);

  const handleGoogleLogin = async () => {
    syncProcessed.current = false;
    setShowLoginButton(false);
    setStatus("Redirecionando para o Google...");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login",
        scopes:
          "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 left-8">
        <button
          onClick={() => (window.location.href = "https://wagoobot.com")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-medium transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para o site
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-12 max-w-sm w-full"
      >
        <div className="flex justify-center">
          <img src="/logo.png" className="w-56 h-auto object-contain" alt="Wagoo" />
        </div>

        {promoActive ? (
          <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-semibold text-center leading-relaxed">
            Link promocional ativo: após o Google liberar o acesso, você ganha o período de cortesia
            no Wagoo (resgate automático).
          </div>
        ) : null}

        {showLoginButton ? (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 min-h-[60px] flex items-center justify-center">
            <p className="text-sm font-medium text-gray-600">{status}</p>
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="px-5 py-6 rounded-2xl border-2 border-[#64b34d]/40 bg-[#64b34d]/10 min-h-[88px] flex flex-col items-center justify-center gap-3"
          >
            <Loader2
              className="w-7 h-7 text-[#64b34d] animate-spin"
              strokeWidth={2.5}
              aria-hidden
            />
            <p className="text-base font-bold text-slate-900 tracking-tight">{status}</p>
            <p className="text-xs font-semibold text-[#4d8f3b] uppercase tracking-widest">
              Sincronizando
            </p>
          </div>
        )}

        {showLoginButton ? (
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-[#64b34d] text-white rounded-2xl font-bold shadow-wg-green-cta hover:bg-[#4d8f3b] active:scale-95 transition-[box-shadow,background-color,transform]"
          >
            Entrar com Google
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}
