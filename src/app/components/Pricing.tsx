import { motion, useInView } from "framer-motion";
import { Check, Zap, Shield, Headphones, BarChart, Loader2, Sparkles } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <section id="precos" ref={ref} className="relative py-32 bg-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50/50 rounded-full blur-[120px] -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-6">
            <Sparkles size={14} className="text-[#64b34d]" />
            <span className="text-xs font-black text-[#4d8f3b] uppercase tracking-widest">Preço imbatível</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
            Sua nova atendente por <br />
            <span className="text-[#64b34d]">R$ 2,00 por dia.</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Menos que o custo de um café para ter alguém agendando seus clientes 24 horas por dia, 7 dias por semana.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-[500px] mx-auto relative"
        >
          {/* Badge flutuante de "Melhor Escolha" */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
            🔥 Oferta por Tempo Limitado
          </div>

          <div className="relative bg-white rounded-[48px] p-10 md:p-14 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_40px_100px_rgba(0,0,0,0.08)]">
            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Plano Único Pro</h3>
              <p className="text-slate-400 font-medium">Acesso total a todas as funções</p>
            </div>

            <div className="mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl text-slate-300 line-through font-bold">R$ 100</span>
                <span className="px-3 py-1 rounded-md bg-red-50 text-red-500 text-xs font-black uppercase tracking-tighter">40% OFF</span>
              </div>
              
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-slate-900">R$</span>
                <span className="text-8xl font-black text-slate-900 tracking-tighter">60</span>
                <span className="text-xl font-bold text-slate-400">/mês</span>
              </div>
              <p className="text-[#64b34d] font-black text-sm uppercase mt-4 tracking-widest">
                Apenas R$ 2,00 por dia
              </p>
            </div>

            <div className="space-y-5 mb-12 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#64b34d] group-hover:bg-[#64b34d] group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-slate-600 font-bold">{feature.text}</span>
                </div>
              ))}
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-6 rounded-[24px] bg-gradient-to-r from-[#64b34d] to-[#4d8f3b] text-white font-black text-xl shadow-2xl shadow-green-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Ativar minha atendente 24h"}
            </motion.button>

            <div className="mt-8 flex flex-col gap-2">
               <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Shield size={14} />
                  Pagamento Seguro via Stripe
               </div>
               <p className="text-[10px] text-slate-300 font-bold">✓ Cancele a qualquer momento sem burocracia</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
