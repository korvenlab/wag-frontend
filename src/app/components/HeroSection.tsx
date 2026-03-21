import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Calendar, MessageSquare, Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center pt-32 pb-20 px-6 bg-white overflow-hidden">
      
      {/* Background Dinâmico */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-50/40 blur-[150px] rounded-full -z-10 animate-pulse" />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        
        {/* LADO ESQUERDO: TEXTO (Mantido o estilo que você gostou) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 relative z-20"
        >
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-[#4d8f3b] text-xs font-black tracking-widest uppercase">
              <Sparkles size={14} /> Tecnologia Exclusiva
            </span>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">
              Sua agenda <br /> 
              <span className="text-[#64b34d]">no automático.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              O cérebro que conecta seu WhatsApp ao Google Calendar. Atendimento 24h sem você tocar no celular.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all shadow-2xl hover:shadow-[#64b34d]/20 group">
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-3 text-slate-400 font-bold italic">
               <span className="text-slate-900 not-italic">R$60/mês</span>
               <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
               <span>Setup em 2 min</span>
            </div>
          </div>
        </motion.div>

        {/* LADO DIREITO: ORBITAL FLOW (O Diferencial) */}
        <div className="relative h-[600px] w-full flex items-center justify-center">
          
          {/* Núcleo Central: O Wagoo */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative z-30 w-48 h-48 bg-white rounded-[60px] shadow-[0_0_100px_rgba(100,179,77,0.2)] border border-green-50 flex items-center justify-center"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] rounded-[45px] flex items-center justify-center shadow-inner">
               <img src="/logo.png" className="w-20 h-20 brightness-200" alt="Logo" />
            </div>
            
            {/* Anéis de energia */}
            <div className="absolute inset-[-20px] border border-green-100 rounded-[80px] animate-ping opacity-20" />
            <div className="absolute inset-[-40px] border border-green-50 rounded-[100px] animate-pulse opacity-40" />
          </motion.div>

          {/* MENSAGENS ENTRANDO (Caos) */}
          <AnimatePresence>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, x: -200, scale: 0.5 }}
                animate={{ opacity: 1, x: -80, y: (i - 1) * 100, scale: 1 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1.5, ease: "easeInOut" }}
                className="absolute z-40 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <MessageSquare size={14} />
                </div>
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: [-80, 80] }} 
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1/2 h-full bg-green-300" 
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AGENDAMENTOS SAINDO (Ordem) */}
          <AnimatePresence>
            {[0, 1].map((i) => (
              <motion.div
                key={`cal-${i}`}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: [0, 1, 0], x: 250, y: (i - 0.5) * 150, scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 2, ease: "easeOut" }}
                className="absolute z-40 bg-white p-5 rounded-3xl shadow-2xl border border-blue-50 flex flex-col gap-2 w-40"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="text-[#4285F4]" size={16} />
                  <span className="text-[10px] font-black text-blue-500 uppercase">Confirmado</span>
                </div>
                <div className="w-full h-3 bg-blue-50 rounded-md" />
                <div className="flex justify-between">
                   <Check size={12} className="text-green-500" />
                   <div className="w-10 h-2 bg-slate-100 rounded-full" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Partículas de Conexão */}
          <svg className="absolute inset-0 w-full h-full -z-10">
            <defs>
              <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64b34d" stopOpacity="0" />
                <stop offset="50%" stopColor="#64b34d" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="50%" cy="50%" r="220" stroke="url(#grad-line)" strokeWidth="1" strokeDasharray="10 20" className="animate-spin-slow" />
          </svg>

        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
      `}</style>
    </section>
  );
};
