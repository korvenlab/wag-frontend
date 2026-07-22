import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { animate, createTimeline, stagger } from "animejs";
import { ArrowRight, Calendar, MessageCircle, Check } from "lucide-react";
import { Button } from "./ui/button";

const HERO_HIGHLIGHT = "automático";

function TypingDots({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-3.5 py-3 rounded-2xl bg-slate-100 border border-slate-200 ${className}`}
      aria-hidden
    >
      <span className="hero-typing-dot w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span className="hero-typing-dot w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span className="hero-typing-dot w-1.5 h-1.5 rounded-full bg-slate-400" />
    </div>
  );
}

export const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const letterBaseDelay = 0.42;
  const letterStagger = 0.042;
  const underlineDelay =
    letterBaseDelay + HERO_HIGHLIGHT.length * letterStagger + 0.2;

  const typingClientRef = useRef<HTMLDivElement>(null);
  const bubbleClientRef = useRef<HTMLDivElement>(null);
  const typingBotRef = useRef<HTMLDivElement>(null);
  const bubbleBotRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<HTMLDivElement>(null);
  const typingDotsAnimRef = useRef<{ pause: () => void; cancel?: () => void } | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const typingClient = typingClientRef.current;
    const bubbleClient = bubbleClientRef.current;
    const typingBot = typingBotRef.current;
    const bubbleBot = bubbleBotRef.current;
    const calendar = calendarRef.current;
    const sync = syncRef.current;
    if (!typingClient || !bubbleClient || !typingBot || !bubbleBot || !calendar || !sync) {
      return;
    }

    const chatEls = [typingClient, bubbleClient, typingBot, bubbleBot, calendar, sync];
    for (const el of chatEls) {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px) scale(0.96)";
      el.style.pointerEvents = "none";
    }

    const startTypingPulse = (root: HTMLElement) => {
      typingDotsAnimRef.current?.pause();
      typingDotsAnimRef.current?.cancel?.();
      const dots = root.querySelectorAll(".hero-typing-dot");
      typingDotsAnimRef.current = animate(dots, {
        translateY: [
          { to: -3, ease: "inOut(2)", duration: 280 },
          { to: 0, ease: "inOut(2)", duration: 280 },
        ],
        delay: stagger(90),
        loop: true,
      });
    };

    const stopTypingPulse = () => {
      typingDotsAnimRef.current?.pause();
      typingDotsAnimRef.current?.cancel?.();
      typingDotsAnimRef.current = null;
    };

    const show = {
      opacity: 1,
      translateY: 0,
      scale: 1,
      duration: 420,
      ease: "out(3)",
    } as const;

    const hideQuick = {
      opacity: 0,
      translateY: 6,
      scale: 0.96,
      duration: 220,
      ease: "in(2)",
    } as const;

    const tl = createTimeline({
      loop: true,
      loopDelay: 1400,
      defaults: { ease: "out(3)" },
    });

    tl.call(() => {
      for (const el of chatEls) {
        el.style.opacity = "0";
        el.style.transform = "translateY(10px) scale(0.96)";
      }
      stopTypingPulse();
    }, 0)
      .add(typingClient, { ...show }, 200)
      .call(() => startTypingPulse(typingClient), 200)
      .add(typingClient, { ...hideQuick }, "+=1100")
      .call(stopTypingPulse, "<")
      .add(bubbleClient, { ...show }, "+=80")
      .add(typingBot, { ...show }, "+=650")
      .call(() => startTypingPulse(typingBot), "<<")
      .add(typingBot, { ...hideQuick }, "+=950")
      .call(stopTypingPulse, "<")
      .add(bubbleBot, { ...show }, "+=80")
      .add(
        calendar,
        {
          opacity: 1,
          translateY: 0,
          scale: [0.88, 1.03, 1],
          duration: 650,
          ease: "out(3)",
        },
        "+=380",
      )
      .add(sync, { ...show, duration: 380 }, "-=180")
      .add(
        [bubbleClient, bubbleBot, calendar, sync],
        {
          opacity: 0,
          translateY: -6,
          scale: 0.98,
          duration: 420,
          ease: "in(2)",
          delay: stagger(40),
        },
        "+=2200",
      );

    return () => {
      stopTypingPulse();
      tl.pause();
      tl.cancel();
    };
  }, [reduceMotion]);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center pt-20 pb-10 px-6 bg-[var(--wagoo-paper)] overflow-hidden"
    >
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#64b34d]/12 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-300/25 blur-[120px] rounded-full -z-10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] -z-10"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(to bottom, black 40%, transparent 95%)",
        }}
      />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: reduceMotion ? 0 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4 text-left">
            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-slate-900 tracking-tighter leading-[0.95] sm:leading-[0.9]"
            >
              Sua agenda <br />
              <span className="text-[#4d8f3b]">
                no{" "}
                <span className="relative inline-block">
                  {reduceMotion ? (
                    <>{HERO_HIGHLIGHT}.</>
                  ) : (
                    <>
                      {HERO_HIGHLIGHT.split("").map((letter, i) => (
                        <motion.span
                          key={`${letter}-${i}`}
                          className="inline-block"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: letterBaseDelay + i * letterStagger,
                            duration: 0.48,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {letter}
                        </motion.span>
                      ))}
                      <motion.span
                        className="inline-block"
                        initial={{ opacity: 0, scale: 0.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: letterBaseDelay + HERO_HIGHLIGHT.length * letterStagger,
                          type: "spring",
                          stiffness: 420,
                          damping: 20,
                        }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute left-0 bottom-0.5 h-[3px] w-full max-w-full origin-left rounded-full bg-[#64b34d]/50"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: underlineDelay,
                          duration: 0.65,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </>
                  )}
                </span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              Transforme conversas de WhatsApp em horários no Google Calendar — 24h, sem você
              perder tempo no celular. Um investimento que se paga no primeiro horário recuperado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              asChild
              className="h-14 min-h-[48px] sm:h-16 px-8 sm:px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-[box-shadow,background-color] shadow-wg-cta group border border-slate-700 focus-visible:ring-2 focus-visible:ring-[#64b34d] focus-visible:ring-offset-2"
            >
              <a href="/login">
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform inline" />
              </a>
            </Button>
            <a
              href="#precos"
              className="text-slate-600 font-bold underline-offset-4 hover:underline hover:text-slate-900"
            >
              Ver planos
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 1, ease: "easeOut" }}
          className="relative w-full max-w-[550px] min-h-[280px] sm:min-h-0 sm:aspect-[4/3] perspective-1000"
          aria-hidden
        >
          <div className="relative w-full h-full bg-white rounded-[40px] shadow-wg-device border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-14 border-b border-slate-200 flex items-center px-6 justify-between bg-slate-50/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Wagoo
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2">
              <div className="p-6 sm:p-8 border-r border-slate-200 space-y-4">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#64b34d] flex items-center justify-center text-white shadow-wg-icon-green border border-slate-200">
                    <MessageCircle size={14} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">
                    Whatsapp
                  </span>
                </div>

                <div className="relative min-h-[128px]">
                  {reduceMotion ? (
                    <div className="space-y-3">
                      <div className="bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-700 border border-slate-200">
                        &quot;Pode ser amanhã às 14h?&quot;
                      </div>
                      <div className="bg-[#64b34d] p-3.5 rounded-2xl rounded-tr-none text-xs text-white font-bold shadow-wg-bubble border border-[#4d8f3b] ml-auto max-w-[95%]">
                        &quot;Claro! Horário reservado.&quot;
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative min-h-[46px]">
                        <div
                          ref={typingClientRef}
                          className="absolute left-0 top-0 will-change-transform"
                        >
                          <TypingDots className="rounded-tl-none" />
                        </div>
                        <div
                          ref={bubbleClientRef}
                          className="bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-700 border border-slate-200 will-change-transform"
                        >
                          &quot;Pode ser amanhã às 14h?&quot;
                        </div>
                      </div>
                      <div className="relative min-h-[46px] flex justify-end">
                        <div
                          ref={typingBotRef}
                          className="absolute right-0 top-0 will-change-transform"
                        >
                          <TypingDots className="rounded-tr-none bg-[#e8f6e3] border-[#cfe9c6]" />
                        </div>
                        <div
                          ref={bubbleBotRef}
                          className="bg-[#64b34d] p-3.5 rounded-2xl rounded-tr-none text-xs text-white font-bold shadow-wg-bubble border border-[#4d8f3b] will-change-transform max-w-[95%]"
                        >
                          &quot;Claro! Horário reservado.&quot;
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50/30 flex flex-col justify-center items-center text-center">
                <div
                  ref={calendarRef}
                  className={`w-full bg-white p-6 rounded-[32px] shadow-wg-inner border border-slate-200 will-change-transform ${
                    reduceMotion ? "" : "opacity-0"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#4285F4] flex items-center justify-center text-white mx-auto mb-4 shadow-wg-icon-blue border border-slate-200">
                    <Calendar size={22} />
                  </div>
                  <p className="text-[11px] font-black text-blue-600 uppercase mb-1 tracking-widest">
                    Agendado
                  </p>
                  <p className="text-sm font-black text-slate-900">Maria Silva</p>
                  <p className="text-xs text-slate-600 font-bold">Terça • 14:00</p>

                  <div
                    ref={syncRef}
                    className={`mt-5 flex items-center justify-center gap-1.5 text-[#4d8f3b] text-[11px] font-black uppercase will-change-transform ${
                      reduceMotion ? "" : "opacity-0"
                    }`}
                  >
                    <Check size={12} strokeWidth={4} />
                    Sincronizado
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-wg-badge z-10 border border-slate-600">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Mais tempo livre
            </p>
            <p className="text-lg font-black text-green-400 leading-none mt-1">+40h / mês</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
