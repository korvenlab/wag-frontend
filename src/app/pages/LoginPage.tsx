import { motion } from "motion/react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  buildLoginRedirectWithPromo,
  persistWagooPromoCode,
  readWagooPromoCode,
  redeemPendingWagooPromo,
} from "../lib/wagooPromo";

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
      cache: "no-store",
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
    const promo = readWagooPromoCode(searchParams);
    if (promo) persistWagooPromoCode(promo);
    setPromoActive(!!readWagooPromoCode(searchParams));
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
        // Garante que o código da URL ainda esteja persistido após o redirect OAuth.
        const promo = readWagooPromoCode(searchParams);
        if (promo) persistWagooPromoCode(promo);

        if (session.provider_token) {
          setStatus("Sincronizando sua conta...");
          await syncProviderTokens(session, apiBase);
        }

        setStatus("Aplicando link de cortesia...");
        const redeem = await redeemPendingWagooPromo(session.access_token, apiBase);
        if (!redeem.ok && !("skipped" in redeem && redeem.skipped)) {
          setStatus(redeem.error || "Não foi possível aplicar a cortesia.");
          // Segue para checar acesso — pode já ter plano; senão mostra preços com aviso.
        }

        setStatus("Verificando seu plano...");
        let hasAccess = await userHasWagooAccess(session.access_token, apiBase);
        if (!hasAccess && redeem.ok) {
          // Perfil pode atrasar um instante após o update.
          await new Promise((r) => setTimeout(r, 600));
          hasAccess = await userHasWagooAccess(session.access_token, apiBase);
        }

        if (hasAccess) {
          setStatus("Tudo certo! Entrando...");
          navigate("/dashboard", { replace: true });
          return;
        }

        if (!redeem.ok && !("skipped" in redeem && redeem.skipped)) {
          setShowLoginButton(true);
          syncProcessed.current = false;
          setStatus(
            `${redeem.error} Você pode tentar de novo com o mesmo link ou escolher um plano.`,
          );
          return;
        }

        setStatus("Escolha um plano para continuar...");
        navigate("/planos", { replace: true });
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
  }, [navigate, apiBase, searchParams]);

  const handleGoogleLogin = async () => {
    syncProcessed.current = false;
    setShowLoginButton(false);
    setStatus("Redirecionando para o Google...");

    const promo = readWagooPromoCode(searchParams);
    if (promo) persistWagooPromoCode(promo);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Mantém ?wagoo_promo= no retorno do Google (sessionStorage sozinho falha em www/apex).
        redirectTo: buildLoginRedirectWithPromo(window.location.origin, promo),
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
          <Link to="/" title="Wagoo — página inicial" aria-label="Ir para a página inicial do Wagoo">
            <img src="/logo.png" className="w-56 h-auto object-contain" alt="Wagoo" />
          </Link>
        </div>

        {promoActive ? (
          <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-semibold text-center leading-relaxed">
            Link promocional ativo: depois de entrar com Google, o período de cortesia é aplicado
            na sua conta.
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
