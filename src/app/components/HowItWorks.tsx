import { motion, useInView } from "motion/react";
import { MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="relative py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#64b34d] rounded-full opacity-[0.03] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Title */}
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
            className="inline-block px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6"
          >
            <span className="text-sm text-[#64b34d] font-semibold">
              Processo Automatizado
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Seu Cliente Agenda em{" "}
            <span className="text-[#64b34d]">
              Segundos
            </span>
            ,<br />
            Sem Você Fazer Nada
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma experiência perfeita que transforma mensagens em agendamentos
            confirmados automaticamente
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <TiltCard
            delay={0.2}
            icon={<MessageCircle className="w-12 h-12" />}
            step="1"
            title="Cliente Manda Mensagem"
            description="Seu cliente envia uma mensagem simples no WhatsApp solicitando um agendamento. Natural e familiar."
            isInView={isInView}
          />

          <Step
            step="2"
            title="Bot Consulta o Calendar"
            description="O WAG BOT acessa seu Google Calendar em tempo real e identifica todos os horários disponíveis."
            isInView={isInView}
          />

          <TiltCard
            delay={0.6}
            icon={<CheckCircle2 className="w-12 h-12" />}
            step="3"
            title="Confirmado e Sincronizado"
            description="O horário é confirmado instantaneamente e sincronizado no Google Calendar. Seu cliente e você recebem confirmação."
            isInView={isInView}
          />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Economize até 10 horas por semana com automação inteligente
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(100, 179, 77, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-white border border-gray-300 text-gray-900 font-semibold hover:border-[#64b34d] hover:text-[#64b34d] transition-all shadow-sm"
          >
            Ver Todos os Recursos
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

interface TiltCardProps {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
  delay: number;
  isInView: boolean;
}

function TiltCard({
  icon,
  step,
  title,
  description,
  delay,
  isInView,
}: TiltCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease-out",
      }}
      className="group relative"
    >
      {/* Card Glow Effect - Agora Verde */}
      <div className="absolute -inset-0.5 bg-[#64b34d] rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

      {/* Card Content */}
      <div className="relative h-full bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#64b34d]/50 hover:shadow-xl transition-all duration-300">
        {/* Step Number */}
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-100">
          {step}
        </div>

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-[#64b34d] shadow-sm"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

interface StepProps {
  step: string;
  title: string;
  description: string;
  delay?: number;
  isInView: boolean;
}

function Step({
  step,
  title,
  description,
  delay = 0.4,
  isInView,
}: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      {/* Card Glow Effect */}
      <div className="absolute -inset-0.5 bg-[#64b34d] rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

      {/* Card Content */}
      <div className="relative h-full bg-white border border-gray-200 rounded-3xl p-8 hover:border-[#64b34d]/50 hover:shadow-xl transition-all duration-300">
        {/* Step Number */}
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-100">
          {step}
        </div>

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-[#64b34d] shadow-sm"
        >
          <Calendar className="w-12 h-12" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
