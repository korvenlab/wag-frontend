import { motion } from "motion/react";
import { ArrowRight, Calendar, MessageCircle, Check } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 px-6 bg-white overflow-hidden">
      {/* Luzes de fundo orgânicas para profundidade */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-50 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        
        {/* LADO ESQUERDO: TEXTO */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4 text-left">
            <span className="px-4 py-1.5 rounded-full bg-green-100 text-[#4d8f3b] text-xs font-black tracking-widest uppercase inline-block">
              Tecnologia Exclusiva
            </span>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Sua agenda <br /> 
              <span className="text-[#64b34d]">no automático.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              O Wagoo transforma conversas de WhatsApp em clientes agendados no seu Google Calendar. Sem esforço, 24h por dia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all shadow-2xl group">
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-3 text-slate-400 font-bold">
               <span className="text-slate-900">R$60/mês</span>
               <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
               <span>Setup em 2 min</span>
            </div>
          </div>
        </motion.div>

        {/* LADO DIREITO: O "IPAD" FLUTUANTE PREMIUM */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-[550px] aspect-[4/3] perspective-1000"
        >
          {/* Corpo do Tablet / Dashboard */}
          <div className="relative w-full h-full bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden flex flex-col">
            
            {/* Header do App */}
            <div className="h-14 border-b border-slate-50 flex items-center px-6 justify-between bg-slate-50/50">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wagoo</div>
            </div>

            {/* Conteúdo Splitted */}
            <div className="flex-1 grid grid-cols-2">
               
               {/* Coluna Chat (Whatsapp) */}
               <div className="p-8 border-r border-slate-50 space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                     <div className="w-8 h-8 rounded-full bg-[#64b34d] flex items-center justify-center text-white shadow-lg shadow-green-100">
                        <MessageCircle size={14} fill="currentColor" />
                     </div>
                     <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Whatsapp</span>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-[11px] text-slate-600 animate-pulse">
                        "Pode ser amanhã às 14h?"
                     </div>
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="bg-[#64b34d] p-3.5 rounded-2xl rounded-tr-none text-[11px] text-white font-bold shadow-md shadow-green-100"
                      >
                        "Claro! Horário reservado."
                     </motion.div>
                  </div>
               </div>

               {/* Coluna Calendário (Google) */}
               <div className="p-8 bg-slate-50/30 flex flex-col justify-center items-center text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="w-full bg-white p-6 rounded-[32px] shadow-2xl shadow-blue-100/50 border border-blue-50"
                  >
                     <div className="w-12 h-12 rounded-2xl bg-[#4285F4] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
                        <Calendar size={22} />
                     </div>
                     <p className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Agendado</p>
                     <p className="text-sm font-black text-slate-900">Maria Silva</p>
                     <p className="text-[10px] text-slate-400 font-bold">Terça • 14:00</p>
                     
                     <div className="mt-5 flex items-center justify-center gap-1.5 text-[#64b34d] text-[10px] font-black uppercase">
                        <Check size={12} strokeWidth={4} />
                        Sincronizado
                     </div>
                  </motion.div>
               </div>
            </div>
          </div>

          {/* Badge Flutuante de Valor */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 -bottom-6 bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl flex items-center gap-4 z-40"
          >
             <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resultado</p>
                <p className="text-2xl font-black text-green-400 leading-none">+40h / mês</p>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
