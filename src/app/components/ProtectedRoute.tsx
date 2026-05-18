import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Loader2, Lock, LogOut, Sparkles } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

export function ProtectedRoute({ children, requirePayment = false }: ProtectedRouteProps) {
  const { user, loading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutSuccess =
    searchParams.get("checkout") === "success" || searchParams.get("success") === "true";
  const [pollTick, setPollTick] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!requirePayment || !user || user.hasPaid || !checkoutSuccess) return;

    const id = window.setInterval(() => {
      void refreshProfile();
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
              onClick={() => void refreshProfile()}
              className="w-full py-4 rounded-2xl bg-[#64b34d] text-white font-black text-sm shadow-wg-green-cta hover:bg-[#4d8f3b] transition-[box-shadow,background-color]"
            >
              Já concluí no Stripe — atualizar agora
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
          {pollTick >= 20 ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-4 font-medium">
              Ainda não liberou? Abra o e-mail do Stripe ou aguarde o webhook. Se já pagou, use
              &quot;atualizar agora&quot; ou entre em contato com o suporte — não inicie um segundo pagamento.
            </p>
          ) : null}
        </motion.div>
      </div>
    );
  }

  if (requirePayment && !user.hasPaid) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white rounded-[32px] shadow-wg-elevated border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] px-8 py-10 text-white text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Plano Pro
              </div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Dashboard exclusivo para assinantes</h1>
              <p className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
                Conecte o WhatsApp e a IA só depois de ativar o plano — assim sua conta fica segura e
                alinhada ao Stripe.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-slate-600 text-sm font-medium leading-relaxed text-center">
                Você está logado como{" "}
                <span className="font-bold text-slate-900">{user.email}</span>. Ative o Plano Pro para
                continuar ou saia e use outra conta.
              </p>

              <button
                type="button"
                onClick={() => {
                  navigate("/");
                  window.setTimeout(() => {
                    document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-[box-shadow,background-color] shadow-wg-cta"
              >
                Ver Plano Pro e ativar
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard?checkout=success", { replace: true })
                }
                className="w-full py-3 rounded-2xl border-2 border-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Já paguei — verificar acesso
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair e entrar com outra conta
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
