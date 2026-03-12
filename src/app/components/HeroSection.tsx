import { motion } from "motion/react";
import { ArrowRight, Check, Calendar } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-fit md:min-h-[100dvh] flex items-center justify-center pt-32 sm:pt-36 md:pt-24 lg:py-32 pb-12 sm:pb-16 md:pb-24 px-4 md:px-6 bg-white overflow-visible max-w-[100vw]">
      
      {/* Background sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-50/30 blur-3xl" />
      </div>

      <div className="w-full max-w-7xl xl:max-w-[1400px] mx-auto relative z-10">
        
        {/* Layout Assimétrico 60/40 */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-x-16 items-center">
          
          {/* Lado Esquerdo - Problema e Solução */}
          <motion.div 
            className="flex flex-col gap-6 sm:gap-6 md:gap-8 lg:gap-10 max-w-full sm:max-w-2xl order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Título de impacto */}
            <div className="space-y-4 sm:space-y-4 md:space-y-6">
              {/* Badge de destaque */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/50">
                <span className="text-sm sm:text-base font-semibold text-slate-900">Preço mais baixo do mercado !</span>
              </div>
              
              <h1 className="text-[2rem] [@media(min-width:380px)]:text-[2.5rem] sm:text-[2.75rem] md:text-5xl lg:text-6xl font-black tracking-tighter text-[#0f172a] leading-[1.1]">
                Sua agenda se preenche sozinha. Enquanto você foca no que{" "}
                <span className="text-[#4285F4]">lucra</span>.
              </h1>
              
              {/* Subtítulo com custo-benefício */}
              <p className="[@media(min-width:380px)]:text-[0.95rem] text-slate-600 leading-snug sm:leading-relaxed max-w-xl text-left text-[16px]">
                Chega de perder horas no 'oi, tem horário?'. O WAG BOT é o cérebro que conecta seu WhatsApp ao Google Calendar. Atendimento instantâneo,{" "}
                <span className="font-semibold text-slate-900">24 horas por dia</span>, sem erros humanos e sem pausas.
              </p>
            </div>

            {/* CTA com preço */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 items-center sm:items-start mt-8 sm:mt-6 md:mt-0">
              <div className="w-full sm:w-auto sm:min-w-[280px]">
                <Button
                  size="lg"
                  className="text-sm sm:text-base font-semibold px-8 sm:px-12 py-3 sm:py-4 rounded-2xl cta-black-premium group w-full mx-auto sm:mx-0 animate-float-button"
                >
                  Assinar Agora
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 ml-1 text-center sm:text-left animate-float-button">
                  A partir de <span className="font-bold text-slate-900">R$60/mês</span>
                </p>
              </div>

              {/* Comparativo rápido */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 sm:gap-x-3 gap-y-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4285F4] flex-shrink-0" strokeWidth={2.5} />
                  <span className="font-medium">Recupere 10h da sua semana</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4285F4] flex-shrink-0" strokeWidth={2.5} />
                  <span className="font-medium">Sincronização em tempo real</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4285F4] flex-shrink-0" strokeWidth={2.5} />
                  <span className="font-medium">Setup em menos de 2 minutos</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lado Direito - A Prova Técnica "O Fluxo" */}
          {/* Mobile/Tablet: Widgets Sobrepostos */}
          <motion.div
            className="relative h-[340px] sm:h-[460px] md:h-[500px] lg:hidden w-full max-w-[340px] mx-auto order-2 mt-4 sm:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            
            {/* Mockup WhatsApp - Esquerda */}
            <motion.div
              className="absolute left-0 top-[12%] sm:top-[15%] z-20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="glass-widget rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 w-[160px] [@media(min-width:380px)]:w-[180px] [@media(min-width:400px)]:w-[220px] sm:w-[260px] md:w-[280px] shadow-xl ml-0 sm:-ml-4 md:-ml-8">
                {/* Header WhatsApp */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">WB</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">Whatsapp</p>
                    <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-600 flex-shrink-0"></span>
                      online
                    </p>
                  </div>
                </div>

                {/* Conversa */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Mensagem cliente */}
                  <div className="flex justify-end">
                    <div className="bg-emerald-100 rounded-xl sm:rounded-2xl rounded-tr-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 max-w-[130px] sm:max-w-[200px]">
                      <p className="text-[11px] sm:text-sm text-slate-800 break-words">Oi, tem horário para amanhã?</p>
                      <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 text-right">14:32</p>
                    </div>
                  </div>

                  {/* Mensagem bot */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-xl sm:rounded-2xl rounded-tl-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 max-w-[140px] sm:max-w-[220px] shadow-sm border border-slate-100">
                      <p className="text-[11px] sm:text-sm text-slate-800 leading-snug">
                        Consultando agenda... ✓
                      </p>
                      <p className="text-[11px] sm:text-sm text-slate-800 leading-snug mt-1 sm:mt-1.5 font-medium">
                        Tenho disponível às <span className="text-[#4285F4]">15:30</span>. Confirmar?
                      </p>
                      <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">14:32</p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.4 }}
                  >
                    <div className="bg-white rounded-xl sm:rounded-2xl rounded-tl-sm px-2.5 sm:px-4 py-2 sm:py-3 shadow-sm border border-slate-100">
                      <div className="flex gap-1 sm:gap-1.5">
                        <motion.div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Linha de Conexão Animada - SVG Path */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
              style={{ overflow: 'visible' }}
            >
              <motion.path
                d="M 240 260 Q 320 260, 360 300"
                stroke="#4285F4"
                strokeWidth="3"
                fill="none"
                className="animate-dash-flow"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.5, delay: 0.8 }}
              />
              {/* Partículas fluindo */}
              <motion.circle
                cx="240"
                cy="260"
                r="4"
                fill="#4285F4"
                initial={{ cx: 240, cy: 260, opacity: 0 }}
                animate={{ 
                  cx: [240, 280, 320, 360],
                  cy: [260, 260, 280, 300],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </svg>

            {/* Widget Google Calendar - Direita */}
            <motion.div
              className="absolute right-0 top-[28%] sm:top-[30%] z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="glass-widget rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 md:p-5 w-[180px] [@media(min-width:380px)]:w-[200px] [@media(min-width:400px)]:w-[240px] sm:w-[280px] md:w-[300px] shadow-xl mr-0">
                {/* Header Calendar */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#4285F4] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">Google Calendario</p>
                    <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-600 flex-shrink-0"></span>
                      online
                    </p>
                  </div>
                </div>

                {/* Mini Calendário */}
                <div className="bg-white/60 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 border border-slate-100">
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[9px] sm:text-xs mb-1.5 sm:mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                      <div key={i} className="text-slate-500 font-medium">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[9px] sm:text-xs">
                    {Array.from({ length: 14 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`py-0.5 sm:py-1 rounded ${i === 8 ? 'bg-[#4285F4] text-white font-bold' : 'text-slate-600'}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card de Evento sendo criado com Glow */}
                <motion.div
                  className="bg-gradient-to-br from-[#4285F4] to-[#5a97f6] rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-white relative overflow-hidden animate-pulse-glow"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-300, 300] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <p className="text-[9px] sm:text-xs font-medium opacity-90">Novo Agendamento</p>
                      <motion.div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    <p className="font-bold text-xs sm:text-base mb-0.5 sm:mb-1 truncate">Cliente: Maria Silva</p>
                    <p className="text-[10px] sm:text-sm opacity-90">🕒 Amanhã, 15:30 - 16:00</p>
                    <p className="text-[9px] sm:text-xs opacity-75 mt-1 sm:mt-2">✓ Confirmado automaticamente</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>

          {/* Desktop: Cards Isométricos Lado a Lado */}
          <div className="hidden lg:block order-2 relative w-full max-w-[500px] mx-auto h-[400px]">
            
            {/* Card WhatsApp - Mais à esquerda */}
            <motion.div
              className="absolute left-0 top-[10%] z-20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div 
                className="bg-white rounded-2xl border-3 border-slate-200 transform perspective-1000 transition-all duration-500 animate-float-whatsapp shadow-[0_8px_16px_rgba(0,0,0,0.04),0_16px_32px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.8)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.08),0_32px_64px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.8)] w-[220px] p-[25px] bg-[#ffffff]"
                style={{ 
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Header WhatsApp */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">WhatsApp</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      online
                    </p>
                  </div>
                </div>

                {/* Conversa */}
                <div className="space-y-2.5">
                  {/* Mensagem cliente */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl rounded-tr-sm px-3 py-2 max-w-[160px]">
                      <p className="text-xs text-slate-800">Oi, tem horário para amanhã?</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 text-right">14:32</p>
                    </div>
                  </div>

                  {/* Mensagem bot */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[180px] shadow-sm border border-slate-100">
                      <p className="text-xs text-slate-800 leading-snug">
                        Consultando agenda... ✓
                      </p>
                      <p className="text-xs text-slate-800 leading-snug mt-1.5 font-semibold">
                        Tenho disponível às <span className="text-[#4285F4]">15:30</span>. Confirmar?
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">14:32</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card Google Calendar - Mais à direita */}
            <motion.div
              className="absolute right-0 top-[35%] z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div 
                className="bg-white rounded-2xl border-3 border-slate-200 transform perspective-1000 hover:shadow-[0_25px_70px_rgba(0,0,0,0.15)] transition-all duration-500 animate-float-calendar w-[240px] p-[25px] bg-[#ffffff]"
                style={{ 
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Header Calendar */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-[#4285F4] flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Google Calendar</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      sincronizado
                    </p>
                  </div>
                </div>

                {/* Novo Agendamento Card */}
                <motion.div
                  className="bg-gradient-to-br from-[#4285F4] to-[#5a97f6] rounded-xl p-3.5 text-white relative overflow-hidden shadow-lg"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-300, 300] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold opacity-90">Novo Agendamento</p>
                      <div className="flex items-center gap-1 bg-green-500/20 rounded-full px-2 py-0.5">
                        <Check className="w-3 h-3 text-green-300" strokeWidth={3} />
                        <span className="text-[10px] font-medium text-green-100">OK</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-base mb-1.5">Maria Silva</h4>
                    <p className="text-sm opacity-95 flex items-center gap-1.5 mb-0.5">
                      <span>📅</span>
                      Amanhã, 15:30 - 16:00
                    </p>
                    <p className="text-xs opacity-80 mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                      Confirmado automaticamente
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};