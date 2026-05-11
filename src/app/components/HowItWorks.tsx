import { motion, useInView } from "framer-motion";
import { MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="relative py-32 bg-white overflow-hidden"
    >
      {/* Luzes de fundo para quebrar o "branco total" */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-50/40 blur-[140px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-50/20 blur-[120px] rounded-full -z-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-28"
        >
          <span className="px-4 py-1.5 rounded-full bg-green-100 text-[#4d8f3b] text-xs font-black tracking-widest uppercase inline-block mb-6 border border-slate-200">
            Fluxo Inteligente
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
            Seu Cliente Agenda em <span className="text-[#64b34d]">Segundos</span>,<br />
            Sem Você Fazer Nada
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mt-8 font-medium leading-relaxed">
            Uma experiência perfeita que transforma mensagens em agendamentos confirmados automaticamente.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="relative grid md:grid-cols-3 gap-10 lg:gap-14">
          
          {/* Linha Conectora Minimalista */}
          <div className="hidden md:block absolute top-1/3 left-0 w-full h-0.5 -z-10">
            <div className="w-[80%] mx-auto border-t-2 border-dashed border-slate-100" />
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
            title="Wagoo Consulta o Calendar"
            description="O Wagoo acessa seu Google Calendar em tempo real e identifica todos os horários disponíveis."
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
      </div>
    </section>
  );
}

function StepCard({ icon, step, title, description, delay, isInView }: any) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((e.clientY - rect.top - centerY) / centerY) * -6);
    setRotateY(((e.clientX - rect.left - centerX) / centerX) * 6);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      className="relative group"
    >
      <div className="relative bg-white p-10 lg:p-12 rounded-[48px] border border-slate-200 
        shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05),0_30px_60px_-15px_rgba(0,0,0,0.08)] 
        group-hover:shadow-[0_40px_100px_-20px_rgba(100,179,77,0.15)] 
        transition-all duration-500 h-full flex flex-col items-start"
      >
        <div className="absolute top-10 right-12 text-5xl font-black text-slate-50 group-hover:text-green-50/50 transition-colors pointer-events-none">
          {step}
        </div>

        <div className="w-20 h-20 rounded-[30px] bg-green-50 flex items-center justify-center text-[#64b34d] mb-10 
          group-hover:bg-[#64b34d] group-hover:text-white transition-all duration-500 shadow-inner border border-slate-200">
          {icon}
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
            {title}
          </h3>
          <p className="text-slate-500 leading-relaxed font-medium text-[16px]">
            {description}
          </p>
        </div>

        <div className="absolute bottom-10 left-12 w-12 h-1.5 bg-green-100 rounded-full overflow-hidden">
          <div className="w-0 group-hover:w-full h-full bg-[#64b34d] transition-all duration-700" />
        </div>
      </div>
    </motion.div>
  );
}
