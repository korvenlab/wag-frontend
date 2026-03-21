import { motion } from "motion/react";
import { ArrowRight, Calendar, MessageCircle, Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 px-6 bg-white overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-green-50 blur-[100px] rounded-full -z-10 opacity-60" />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LADO ESQUERDO: A MENSAGEM CLARA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
               <Sparkles size={14} className="text-[#64b34d]" />
               <span className="text-[10px] font-black text-[#4d8f3b] uppercase tracking-[0.2em]">Tecnologia Simples</span>
            </div>

            <h1 className="text-6xl lg:text-[84px] font-black text-slate-900 tracking-tighter leading-[0.85]">
              Recupere seu <br /> 
              <span className="text-[#64b34d]">tempo de volta.</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              Enquanto você atende seus clientes ou descansa, o <strong className="text-slate-900">Wagoo</strong> responde o seu WhatsApp e marca os horários na sua agenda. <span className="text-[#64b34d] font-bold">Simples assim.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all shadow-2xl hover:shadow-green-100 group">
              Quero automatizar meu negócio
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex flex-col">
               <span className="text-slate-900 font-black text-lg">R$60/mês</span>
               <span className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center sm:text-left">Sem taxas ocultas</span>
            </div>
          </div>

          {/* Benefícios "Pé no Chão" */}
          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Check size={18} className="text-[#64b34d]" strokeWidth={3} />
                Funciona 24h por dia
             </div>
             <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Check size={18} className="text-[#64b34d]" strokeWidth={3} />
                Zero configuração difícil
             </div>
          </div>
        </motion.div>

        {/* LADO DIREITO: O VISUAL "QUASE REAL" */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full max-w-[550px] aspect-square flex items-center justify-center"
        >
          {/* Card Central Estilo Glass */}
          <div className="relative w-full bg-white rounded-[48px] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden flex flex-col p-8 lg:p-12">
            
            <div className="flex items-center justify-between mb-10">
               <div className="w-12 h-12 rounded-2xl bg-[#64b34d] flex items-center justify-center text-white shadow-lg shadow-green-100">
                  <MessageCircle size={24} fill="currentColor" />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status do Wagoo</p>
                  <p className="text-sm font-black text-green-500 flex items-center justify-end gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     Atendendo agora
                  </p>
               </div>
            </div>

            <div className="space-y-6 flex-1">
               {/* Simulação de conversa ultra limpa */}
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cliente</p>
                  <div className="bg-slate-50 p-4 rounded-3xl rounded-tl-none text-sm text-slate-600 font-medium border border-slate-100">
                    "Oi! Você tem algum horário livre amanhã à tarde?"
                  </div>
               </div>

               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="space-y-2"
               >
                  <p className="text-[10px] font-bold text-[#64b34d] uppercase ml-1 text-right">Wagoo (Seu Assistente)</p>
                  <div className="bg-[#64b34d] p-4 rounded-3xl rounded-tr-none text-sm text-white font-bold shadow-xl shadow-green-100">
                    "Olá! Tenho às <span className="underline">15:30</span> disponível. Quer que eu reserve para você?"
                  </div>
               </motion.div>
            </div>

            {/* O "Grand Finale" na base do card */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 2.5 }}
               className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4285F4]">
                     <Calendar size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-xs font-black text-slate-900 leading-none">Agenda Atualizada</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Google Calendar</p>
                  </div>
               </div>
               <Check size={24} className="text-green-500" strokeWidth={4} />
            </motion.div>
          </div>

          {/* Badge de "Liberdade" flutuante */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 top-10 bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl z-30"
          >
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Seu novo foco</p>
             <p className="text-xl font-black text-white">Crescer seu negócio 🚀</p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
