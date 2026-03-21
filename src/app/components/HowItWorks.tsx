import { motion, useInView } from "framer-motion";
import { MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="como-funciona" // ID para o scroll do Header funcionar
      ref={ref}
      className="relative py-32 bg-white overflow-hidden"
    >
      {/* Luzes de fundo orgânicas */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Cabeçalho da Seção */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-24"
        >
          <span className="px-4 py-1.5 rounded-full bg-green-100 text-[#4d8f3b] text-xs font-black tracking-widest uppercase inline-block mb-6">
            Fluxo Inteligente
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
            Seu Cliente Agenda em <span className="text-[#64b34d]">Segundos</span>,<br />
            Sem Você Fazer Nada
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto mt-6">
            Uma experiência perfeita que transforma mensagens em agendamentos confirmados automaticamente.
          </p>
        </motion.div>

        {/* Grid de Cards com Linhas Conectoras */}
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
            title="Cliente Manda Mensagem"
            description="Seu cliente envia uma mensagem simples no WhatsApp solicitando um agendamento. Natural e familiar."
            isInView={isInView}
          />

          <StepCard
            delay={0.4}
            icon={<Calendar size={32} />}
            step="02"
            title="Bot Consulta o Calendar"
            description="O WAG BOT acessa seu Google Calendar em tempo real e identifica todos os horários disponíveis."
            isInView={isInView}
          />

          <StepCard
            delay={0.6}
            icon={<CheckCircle2 size={32} />}
            step="03"
            title="Confirmado e Sincronizado"
            description="O horário é confirmado instantaneamente e sincronizado no Google Calendar. Seu cliente e você recebem confirmação."
            isInView={isInView}
          />
        </div>

        {/* Rodapé da Seção */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-20"
        >
          <p className="text-gray-500 mb-8 font-medium">Economize até 10 horas por semana com automação inteligente</p>
          <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all shadow-xl shadow-slate-200">
            Ver Todos os Recursos
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// Componente de Card com Efeito Tilt (Inclinação)
function StepCard({ icon, step, title, description, delay, isInView }: any) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      className="relative group bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-50"
    >
      {/* Número do Passo */}
      <div className="absolute top-8 right-10 text-4xl font-black text-slate-100 group-hover:text-green-50 transition-colors">
        {step}
      </div>

      {/* Ícone */}
      <div className="w-20 h-20 rounded-[28px] bg-green-50 flex items-center justify-center text-[#64b34d] mb-8 group-hover:scale-110 group-hover:bg-[#64b34d] group-hover:text-white transition-all duration-500 shadow-inner">
        {icon}
      </div>

      {/* Texto */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {/* Detalhe de acento no fundo */}
      <div className="absolute bottom-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-green-100 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </motion.div>
  );
}
