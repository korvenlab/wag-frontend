import { motion, useInView } from "motion/react";
import { Check, Zap, Shield, Headphones, BarChart, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Inicialize o cliente do Supabase (ou use seu hook de Auth)
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

  // Busca o usuário logado ao carregar
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "Agendamentos Ilimitados" },
    { icon: <Shield className="w-5 h-5" />, text: "Sincronização em Tempo Real" },
    { icon: <Headphones className="w-5 h-5" />, text: "Suporte Prioritário 24/7" },
    { icon: <BarChart className="w-5 h-5" />, text: "Relatórios e Análises" },
    { icon: <Check className="w-5 h-5" />, text: "Personalização Completa" },
  ];

  // Função para lidar com o clique no botão de pagamento profissional
  const handleCheckout = async () => {
    if (!user) {
      // Se não houver usuário, manda para o login
      return navigate("/login");
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          priceId: "price_SEU_ID_AQUI", // SUBSTITUA pelo ID do preço no painel do Stripe
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redireciona para a página oficial de pagamento do Stripe
        window.location.href = data.url;
      } else {
        console.error("Erro ao criar sessão de checkout:", data);
        alert("Ocorreu um erro ao processar o pagamento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro técnico:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="precos"
      ref={ref}
      className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#007BFF] to-[#6F42C1] rounded-full opacity-[0.02] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <span className="text-sm text-[#007BFF] font-semibold">
              Oferta Especial
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Investimento que se{" "}
            <span className="bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
              Paga Sozinho
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Menos que um café por dia para economizar horas de trabalho toda semana
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {/* Limited Time Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-sm text-red-400 font-semibold">
                🔥 Oferta por Tempo Limitado - 40% OFF
              </span>
            </div>
          </motion.div>

          {/* Main Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur-2xl opacity-30" />

            <div className="relative bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
              <div className="relative p-10 md:p-12">
                {/* Plan Name */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Plano Único Pro
                  </h3>
                  <p className="text-gray-600">
                    Tudo que você precisa para automatizar seus agendamentos
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-2xl text-gray-400 line-through">
                      R$ 100
                    </span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      className="flex items-baseline gap-2"
                    >
                      <span className="text-xl text-gray-600">R$</span>
                      <span className="text-7xl font-bold bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
                        60
                      </span>
                      <span className="text-xl text-gray-600">/mês</span>
                    </motion.div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-10">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-[#007BFF] flex-shrink-0 shadow-sm">
                        {feature.icon}
                      </div>
                      <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-all">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={handleCheckout}
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.02, boxShadow: "0 20px 40px rgba(0, 123, 255, 0.3)" }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  className="relative w-full py-5 rounded-2xl bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group/button disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                    {loading ? "Processando..." : "Começar Agora"}
                  </span>
                </motion.button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    ✓ Sem contrato de fidelidade • Cancele quando quiser
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
