import { motion } from "motion/react";
import { ArrowRight, Check, Calendar, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center pt-32 pb-20 px-6 bg-[#FAFAFA] overflow-hidden">
      
      {/* Glow de fundo mais sutil */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/30 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LADO ESQUERDO: TEXTO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-green-100 text-[#4d8f3b] text-sm font-bold tracking-wide uppercase">
              Tecnologia Exclusiva
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.95]">
              Sua agenda <br /> 
              <span className="text-[#64b34d]">no automático.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
              O Wagoo transforma conversas de WhatsApp em clientes agendados no seu Google Calendar. Sem esforço, 24h por dia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="h-14 px-10 rounded-2xl bg-[#111] text-white font-bold hover:bg-[#64b34d] transition-all shadow-xl">
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 px-2 text-slate-400">
               <span className="font-semibold text-slate-900">R$60/mês</span>
               <span className="w-1 h-1 rounded-full bg-slate-300" />
               <span>Setup em 2 min</span>
            </div>
          </div>
        </motion.div>

        {/* LADO DIREITO: VISUAL CLEAN */}
        <div className="relative h-[450px] w-full flex items-center justify-center">
          
          {/* CARD WHATSAPP (FLUTUANTE) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 top-10 z-20 w-[260px] bg-white p-5 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#64b34d] flex items-center justify-center text-white">
                <MessageCircle size={20} />
              </div>
              <p className="font-bold text-slate-800">Bot Wagoo</p>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-600 leading-relaxed border border-slate-100">
                Olá Maria! Identifiquei um horário disponível às <strong className="text-[#4285F4]">15:30</strong>. Deseja confirmar?
              </div>
              <div className="bg-[#64b34d] p-3 rounded-2xl rounded-tr-none text-xs text-white self-end ml-8 font-medium">
                Sim, por favor!
              </div>
            </div>
          </motion.div>

          {/* LINHA CONECTORA (ANIMADA) */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none">
               <motion.path 
                d="M150 150 C 250 150, 200 300, 300 300" 
                stroke="#E2E8F0" 
                strokeWidth="3" 
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
               />
            </svg>
          </div>

          {/* CARD GOOGLE CALENDAR (FLUTUANTE) */}
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-0 bottom-10 z-20 w-[280px] bg-white p-6 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-slate-50"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#4285F4] flex items-center justify-center shadow-lg shadow-blue-100">
                <Calendar className="text-white" size={20} />
              </div>
              <p className="font-bold text-slate-800">Confirmado</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
               <h4 className="font-bold text-[#2b6eda]">Maria Silva</h4>
               <p className="text-xs text-[#2b6eda]/70 font-medium">Amanhã • 15:30 - 16:00</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
