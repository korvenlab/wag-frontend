import { motion } from "motion/react";
import { ArrowRight, Check, Calendar, MessageCircle, Bell } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center pt-32 pb-20 px-6 bg-white overflow-hidden">
      
      {/* Glows de fundo orgânicos */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-50/50 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50/40 blur-[100px] rounded-full -z-10" />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LADO ESQUERDO: TEXTO (Mantido conforme o que você gostou) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
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

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all shadow-2xl shadow-slate-200 group">
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-3 text-slate-500 font-medium">
               <span className="text-slate-900 font-bold">R$60/mês</span>
               <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
               <span>Setup em 2 min</span>
            </div>
          </div>
        </motion.div>

        {/* LADO DIREITO: COMPOSIÇÃO "INTERFACE PREMIUM" */}
        <div className="relative h-[500px] w-full flex items-center justify-center">
          
          {/* Card Principal: Notificação do Celular (A Prova de Valor) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white"
          >
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
                    <MessageCircle size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp</p>
                    <p className="font-bold text-slate-900">Agendamento Realizado</p>
                  </div>
               </div>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            
            <div className="space-y-4">
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    "Oi! Gostaria de marcar para amanhã às <strong className="text-slate-900">14:00</strong>"
                  </p>
               </div>
               <div className="flex items-center gap-3 p-3 rounded-2xl bg-green-50 text-green-700 text-xs font-bold">
                  <Check size={16} strokeWidth={3} />
                  Horário confirmado no Google Calendar!
               </div>
            </div>
          </motion.div>

          {/* Widget Flutuante 1: Google Calendar (O Resultado) */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-4 z-20 w-[200px] bg-white p-4 rounded-3xl shadow-2xl shadow-blue-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center text-white">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-bold text-slate-800">Próximo</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ duration: 2, delay: 1 }}
                className="h-full bg-[#4285F4]" 
               />
            </div>
          </motion.div>

          {/* Widget Flutuante 2: Notificação de Venda/Lucro */}
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-4 left-4 z-40 w-[220px] bg-slate-900 p-4 rounded-3xl shadow-2xl flex items-center gap-4"
          >
             <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <Bell size={20} />
             </div>
             <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Notificação</p>
                <p className="text-sm text-white font-bold">Agenda Cheia! 🚀</p>
             </div>
          </motion.div>

          {/* Elementos Decorativos de Fundo */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
             <div className="w-[400px] h-[400px] border border-dashed border-slate-300 rounded-full animate-spin-slow" />
          </div>

        </div>
      </div>
    </section>
  );
};
