import { motion, useInView } from "framer-motion";
import { Check, Zap, Shield, Headphones, BarChart, Loader2, Sparkles } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Agendamentos Ilimitados" },
    { icon: <Shield className="w-5 h-5" />, text: "Sincronização em Tempo Real" },
    { icon: <Headphones className="w-5 h-5" />, text: "Suporte Prioritário 24/7" },
    { icon: <BarChart className="w-5 h-5" />, text: "Relatórios e Análises" },
    { icon: <Check className="w-5 h-5" />, text: "Personalização Completa" },
  ];

  const handleCheckout = async () => {
    if (!user) return navigate("/login");
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        navigate("/login");
        return;
      }

      const apiBase =
        import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
        "https://wag-backend.onrender.com";

      const response = await fetch(`${apiBase}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, userId: user.id }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      alert("Erro de conexão. Verifique se o servidor está online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="precos" ref={ref} className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-green-50/50 rounded-full blur-[120px] -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LADO ESQUERDO: TEXTO E ARGUMENTO */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-slate-200">
              <Sparkles size={14} className="text-[#64b34d]" />
              <span className="text-xs font-black text-[#4d8f3b] uppercase tracking-widest">Investimento Inteligente</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Sua nova atendente por <br />
              <span className="text-[#64b34d]">R$ 2,00 por dia.</span>
            </h2>
            
            <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
              Menos que o custo de um café para ter o Wagoo agendando seus clientes 24 horas por dia, 7 dias por semana, sem erros e sem pausas.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-700 font-bold">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[#64b34d] border border-slate-200">
                  <Check size={14} strokeWidth={4} />
                </div>
                Ativação instantânea
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-bold">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[#64b34d] border border-slate-200">
                  <Check size={14} strokeWidth={4} />
                </div>
                Recupere +40h do seu mês
              </div>
            </div>
          </motion.div>

          {/* LADO DIREITO: CARD DE PREÇOS PREMIUM */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Badge de Oferta */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl border border-slate-600">
              🔥 Oferta por Tempo Limitado
            </div>

            <div className="relative bg-white rounded-[48px] p-8 md:p-12 border border-slate-200 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.1),0_50px_100px_-15px_rgba(0,0,0,0.05)]">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-1">Plano Único Pro</h3>
                <p className="text-slate-400 font-medium text-sm">Acesso total a todas as funções</p>
              </div>

              <div className="mb-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg text-slate-300 line-through font-bold">R$ 100</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-black uppercase">40% OFF</span>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">R$</span>
                  <span className="text-7xl font-black text-slate-900 tracking-tighter leading-none">60</span>
                  <span className="text-xl font-bold text-slate-400">/mês</span>
                </div>
                
                <div className="mt-4 inline-block px-3 py-1 rounded-lg bg-green-500 text-white text-[11px] font-black uppercase tracking-wider">
                  Apenas R$ 2,00 por dia
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-[#64b34d] border border-slate-200">
                      {feature.icon}
                    </div>
                    <span className="text-slate-600 font-bold text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleCheckout}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#64b34d] to-[#4d8f3b] text-white font-black text-lg shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 border border-slate-200/40"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Ativar minha atendente 24h"}
              </motion.button>

              <div className="mt-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <Shield size={12} />
                  Pagamento Seguro via Stripe
                </div>
                <p className="text-[10px] text-slate-400 font-medium">✓ Cancele a qualquer momento sem burocracia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
