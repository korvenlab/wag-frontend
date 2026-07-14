import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { NicheOnboarding } from "./NicheOnboarding";
import {
  hasSkippedWhatsAppOnboarding,
  skipWhatsAppOnboardingKey,
  WhatsAppOnboarding,
} from "./WhatsAppOnboarding";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

export function ProtectedRoute({ children, requirePayment = false }: ProtectedRouteProps) {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutSuccess =
    searchParams.get("checkout") === "success" || searchParams.get("success") === "true";
  const [pollTick, setPollTick] = useState(0);
  const [waOnboardingSkipped, setWaOnboardingSkipped] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setWaOnboardingSkipped(false);
      return;
    }
    setWaOnboardingSkipped(hasSkippedWhatsAppOnboarding(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user?.id, loading, navigate]);

  useEffect(() => {
    if (!requirePayment || !user || user.hasPaid || checkoutSuccess || loading) return;
    navigate("/#precos", { replace: true });
  }, [requirePayment, user?.id, user?.hasPaid, checkoutSuccess, loading, navigate]);

  useEffect(() => {
    if (!requirePayment || !user || user.hasPaid || !checkoutSuccess) return;

    const id = window.setInterval(() => {
      void refreshProfile({ force: true });
      setPollTick((t) => t + 1);
    }, 2500);

    const timeout = window.setTimeout(() => window.clearInterval(id), 90_000);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [requirePayment, user?.id, user?.hasPaid, checkoutSuccess, refreshProfile]);

  useEffect(() => {
    if (user?.hasPaid && checkoutSuccess) {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.hasPaid, checkoutSuccess, navigate]);

  if (loading || !user) return null;

  if (requirePayment && !user.hasPaid && checkoutSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="rounded-full bg-white p-6 shadow-wg-card border border-slate-100">
              <Loader2 className="w-14 h-14 animate-spin text-[#64b34d]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Confirmando seu pagamento
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              O Stripe avisou o servidor e estamos liberando seu acesso. Isso costuma levar poucos
              segundos — você não precisa pagar de novo.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void refreshProfile({ force: true })}
              className="w-full py-4 rounded-2xl bg-[#64b34d] text-white font-black text-sm shadow-wg-green-cta hover:bg-[#4d8f3b] transition-[box-shadow,background-color]"
            >
              Já concluí no Stripe — atualizar agora
            </button>
            <button
              type="button"
              onClick={() => navigate("/#precos")}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Ver planos
            </button>
          </div>
          {pollTick >= 20 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-4 font-medium">
              Ainda não liberou? Abra o e-mail do Stripe ou aguarde o webhook. Se já pagou, use
              &quot;atualizar agora&quot; ou entre em contato com o suporte — não inicie um segundo
              pagamento.
            </p>
          ) : null}
        </motion.div>
      </div>
    );
  }

  if (requirePayment && !user.hasPaid) {
    return null;
  }

  if (requirePayment && user.hasPaid && !user.businessNiche) {
    return <NicheOnboarding />;
  }

  if (
    requirePayment &&
    user.hasPaid &&
    user.businessNiche &&
    !user.whatsappConnected &&
    !waOnboardingSkipped
  ) {
    return (
      <WhatsAppOnboarding
        onSkip={() => {
          try {
            localStorage.setItem(skipWhatsAppOnboardingKey(user.id), "1");
          } catch {
            /* ignore */
          }
          setWaOnboardingSkipped(true);
        }}
      />
    );
  }

  return <>{children}</>;
}
