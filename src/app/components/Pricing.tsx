import { motion, useInView } from "framer-motion";
import { Check, Shield, Loader2, Sparkles, Users, MessageCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  WAGOO_PLAN_CARDS,
  WAGOO_SHARED_FEATURES,
  WAGOO_BASIC_EXCLUSIONS,
  type WagooPlanTier,
} from "../lib/wagooPlans";

const SUPPORT_WHATSAPP_URL = "https://wa.me/5582999450453";

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<WagooPlanTier | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ? { id: u.id, email: u.email } : null);
    };
    void getUser();
  }, []);

  const handleCheckout = async (planTier: WagooPlanTier) => {
    if (!user) return navigate("/login");
    setLoadingTier(planTier);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { navigate("/login"); return; }
      const apiBase = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://wag-backend.onrender.com";
      const response = await fetch(apiBase + "/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ email: user.email, userId: user.id, planTier }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Checkout indisponível.");
    } catch {
      alert("Erro de conexão. Verifique se o servidor está online.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section id="precos" ref={ref} className="relative py-24 md:py-32 bg-white overflow-hidden">
      <motion.div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-green-50/50 rounded-full blur-[120px] -z-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-slate-200">
            <Sparkles size={14} className="text-[#64b34d]" />
            <span className="text-xs font-black text-[#4d8f3b] uppercase tracking-widest">Planos Wagoo</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
            Mesma IA e integrações. <span className="text-[#64b34d]">Escale quando precisar.</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Todos os planos incluem WhatsApp, Google Agenda, IA e estilo de conversa personalizado.
            No Pro e Pro+ você ganha lembretes, export CSV e equipe.
          </p>
        </motion.div>
        <motion.div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {WAGOO_PLAN_CARDS.map((plan, index) => (
            <motion.article key={plan.tier} initial={{ opacity: 0, y: 32 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 * index }} className={"relative flex flex-col rounded-[32px] border p-8 md:p-10 bg-white shadow-wg-elevated " + (plan.highlight ? "border-[#64b34d] ring-2 ring-[#64b34d]/20 md:scale-[1.02] z-10" : "border-slate-200")}>
              {plan.highlight ? <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mais popular</div> : null}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{plan.description}</p>
              </div>
              <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900">R$</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.priceBrl}</span>
                  <span className="text-slate-400 font-bold">/mês</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[#4d8f3b] font-black text-xs uppercase tracking-wider">
                  <Users size={14} /> Até {plan.maxUsers} {plan.maxUsers === 1 ? "usuário" : "usuários"}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {WAGOO_SHARED_FEATURES.map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <Check className="w-4 h-4 text-[#64b34d] shrink-0 mt-0.5" strokeWidth={3} />{text}
                  </li>
                ))}
                {plan.extras.map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                    <Check className="w-4 h-4 text-[#64b34d] shrink-0 mt-0.5" strokeWidth={3} />
                    <span>
                      {text}
                      <span className="ml-1.5 inline-block text-[10px] font-black uppercase tracking-wider text-[#4d8f3b] bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md align-middle">
                        Exclusivo
                      </span>
                    </span>
                  </li>
                ))}
                {plan.tier === "basic" ? (
                  <>
                    {WAGOO_BASIC_EXCLUSIONS.map((text) => (
                      <li
                        key={text}
                        className="flex items-start gap-3 text-sm font-medium text-slate-400"
                      >
                        <span className="w-4 h-4 shrink-0 mt-0.5 text-center leading-none">–</span>
                        {text}
                      </li>
                    ))}
                  </>
                ) : null}
              </ul>
              <button type="button" onClick={() => void handleCheckout(plan.tier)} disabled={loadingTier !== null} className={"w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-70 " + (plan.highlight ? "bg-gradient-to-r from-[#64b34d] to-[#4d8f3b] text-white shadow-wg-green-cta" : "bg-slate-900 text-white hover:bg-[#64b34d]")}>
                {loadingTier === plan.tier ? <Loader2 className="animate-spin w-5 h-5" /> : "Assinar " + plan.name}
              </button>
            </motion.article>
          ))}
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 rounded-[28px] border border-slate-200 bg-slate-900 text-white shadow-wg-elevated overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 md:px-10 md:py-9">
            <div className="space-y-2 max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64b34d]">
                Sob medida
              </p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                Plano Personalizado
              </h3>
              <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
                Precisa de mais usuários, condições especiais ou uma estrutura diferente? Fale com a gente e montamos a solução ideal para o seu negócio.
              </p>
            </div>
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 shrink-0 h-14 px-8 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black text-base shadow-wg-green-cta transition-[background-color]"
            >
              <MessageCircle size={20} strokeWidth={2.5} />
              Entrar em contato
            </a>
          </div>
        </motion.article>

        <p className="mt-12 flex flex-col items-center gap-2 text-center">
          <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"><Shield size={12} /> Pagamento seguro via Stripe</span>
          <span className="text-xs text-slate-400 font-medium">Cancele quando quiser · Sem fidelidade</span>
        </p>
      </div>
    </section>
  );
}
