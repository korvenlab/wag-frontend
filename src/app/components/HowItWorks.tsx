import { motion, useInView } from "framer-motion";
import { MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

// O "export" aqui DEVE ser exatamente assim para o App.tsx reconhecer
export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="relative py-32 bg-white overflow-hidden"
    >
      {/* Glows de fundo orgânicos */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-24"
        >
          <span className="px-4 py-1.5 rounded-full bg-green-100 text-[#4d8f3b] text-xs font-black tracking-widest uppercase inline-block mb-6">
            Fluxo Inteligente
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
            Três passos para sua <br />
            <span className="text-[#64b34d]">liberdade total.</span>
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="relative grid md:grid-cols-3 gap-12">
          
          {/* Linhas Pontilhadas (Apenas Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 -z-10">
            <svg width="100%" height="2" fill="none" className="opacity-20">
              <line x1="20%" y1="1" x2="80%" y2="1" stroke="#64b34d" strokeWidth="2" strokeDasharray="8 8" />
            </svg>
          </div>

          <StepCard
            delay={0.2}
            icon={<MessageCircle size={32} />}
            step="01"
            title="O cliente chama"
            description="Ele envia uma mensagem natural no WhatsApp. O Wagoo entende o pedido instantaneamente."
            isInView={isInView}
          />

          <StepCard
            delay={0.4}
            icon={<Calendar size={32} />}
            step="02"
            title="O Wagoo organiza"
            description="O bot consulta sua agenda real e oferece apenas os horários que você definiu como livres."
            isInView={isInView}
          />

          <StepCard
            delay={0.6}
            icon={<CheckCircle2 size={32} />}
            step="03"
            title="Tudo pronto"
            description="Agendamento feito e sincronizado. Você só precisa abrir a porta e faturar."
            isInView={isInView}
          />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-20"
        >
          <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all shadow-xl shadow-slate-200">
            Ver demonstração completa
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// Componente interno para os cards
function StepCard({ icon, step, title, description, delay, isInView }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="relative group bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-50"
    >
      <div className="absolute top-8 right-10 text-4xl font-black text-slate-100 group-hover:text-green-50 transition-colors">
        {step}
      </div>

      <div className="w-20 h-20 rounded-[28px] bg-green-50 flex items-center justify-center text-[#64b34d] mb-8 group-hover:scale-110 group-hover:bg-[#64b34d] group-hover:text-white transition-all duration-500 shadow-inner">
        {icon}
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-green-100 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </motion.div>
  );
}
