import { motion, useInView } from "framer-motion";
import { Calendar, MessageCircle, ShieldCheck } from "lucide-react";
import { useRef, type ReactNode } from "react";

const CARDS: {
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    title: "Comunicação Oficial",
    description:
      "O Wagoo opera através da API Oficial da Meta, garantindo estabilidade e o selo de segurança no WhatsApp dos seus clientes.",
    icon: <MessageCircle className="w-7 h-7" strokeWidth={2.25} />,
  },
  {
    title: "Sincronização Validada",
    description:
      "Autenticação segura através do Google OAuth. Gerenciamos os horários solicitando apenas as permissões estritamente necessárias.",
    icon: <Calendar className="w-7 h-7" strokeWidth={2.25} />,
  },
  {
    title: "Privacidade de Dados",
    description:
      "Nenhuma informação sensível dos seus clientes é exposta. Conexão ponta a ponta criptografada.",
    icon: <ShieldCheck className="w-7 h-7" strokeWidth={2.25} />,
  },
];

export function TrustSafety() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section
      id="seguranca"
      ref={ref}
      className="relative py-24 md:py-28 bg-[#F8FAFC] overflow-hidden"
    >
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-green-50/60 blur-[120px] rounded-full -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14 space-y-5"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-white border border-slate-200 shadow-wg-subtle">
            <span className="text-sm text-[#64b34d] font-bold uppercase tracking-widest">
              Confiança e segurança
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.95]">
            Conexões que seus clientes{" "}
            <span className="text-[#64b34d]">já reconhecem</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            WhatsApp, Google e criptografia — o essencial para operar com tranquilidade.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 * index }}
              className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-wg-subtle hover:border-slate-300 hover:shadow-wg-card transition-[box-shadow,border-color]"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#64b34d] border border-green-100">
                {card.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {card.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
