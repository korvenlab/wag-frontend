import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Calendar, Check, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

const HERO_HIGHLIGHT = "automático";

type ChatPhase =
  | "typingClient"
  | "bubbleClient"
  | "typingBot"
  | "bubbleBot"
  | "calendar"
  | "hold"
  | "clear";

/** Sequência do mock: tempos em ms (visível → próximo passo). */
const CHAT_SCRIPT: { phase: ChatPhase; ms: number }[] = [
  { phase: "typingClient", ms: 1100 },
  { phase: "bubbleClient", ms: 700 },
  { phase: "typingBot", ms: 1000 },
  { phase: "bubbleBot", ms: 500 },
  { phase: "calendar", ms: 2200 },
  { phase: "hold", ms: 400 },
  { phase: "clear", ms: 900 },
];

function visibilityFor(phase: ChatPhase) {
  return {
    typingClient: phase === "typingClient",
    bubbleClient:
      phase === "bubbleClient" ||
      phase === "typingBot" ||
      phase === "bubbleBot" ||
      phase === "calendar" ||
      phase === "hold",
    typingBot: phase === "typingBot",
    bubbleBot: phase === "bubbleBot" || phase === "calendar" || phase === "hold",
    calendar: phase === "calendar" || phase === "hold",
  };
}

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

function FadeSlide({
  show,
  className = "",
  children,
}: {
  show: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        "will-change-transform transition-[opacity,transform] duration-300 ease-out " +
        (show
          ? "opacity-100 translate-y-0 scale-100 "
          : "opacity-0 translate-y-2 scale-95 pointer-events-none ") +
        className
      }
      aria-hidden={!show}
    >
      {children}
    </div>
  );
}

export const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const letterBaseDelay = 0.42;
  const letterStagger = 0.042;
  const underlineDelay =
    letterBaseDelay + HERO_HIGHLIGHT.length * letterStagger + 0.2;

  const [phase, setPhase] = useState<ChatPhase>("typingClient");

  useEffect(() => {
    let i = 0;
    let timer = 0;

    const tick = () => {
      const step = CHAT_SCRIPT[i % CHAT_SCRIPT.length];
      setPhase(step.phase);
      i += 1;
      timer = window.setTimeout(tick, step.ms);
    };

    tick();
    return () => window.clearTimeout(timer);
  }, []);

  const {
    typingClient: showTypingClient,
    bubbleClient: showBubbleClient,
    typingBot: showTypingBot,
    bubbleBot: showBubbleBot,
    calendar: showCalendar,
  } = visibilityFor(phase);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center pt-20 pb-10 px-6 overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(165deg, var(--wagoo-paper) 0%, #e8f3e4 42%, #d4ebcc 100%)",
        }}
      />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#64b34d]/12 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-300/25 blur-[120px] rounded-full -z-10" />

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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] sm:leading-[0.9]"
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
          className="relative w-full max-w-[550px] lg:max-w-none mx-auto"
          aria-hidden
        >
          <div className="relative grid sm:grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-4 items-stretch">
            <div className="rounded-[28px] bg-white/90 backdrop-blur-sm border border-slate-200/80 p-5 sm:p-6 text-left shadow-wg-device">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#64b34d] flex items-center justify-center text-white border border-[#4d8f3b]/30">
                  <MessageCircle size={15} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    WhatsApp
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">Cliente · agora</p>
                </div>
              </div>

              <div className="relative min-h-[132px]">
                <div className="space-y-3">
                  <div className="relative min-h-[46px]">
                    <FadeSlide show={showTypingClient} className="absolute left-0 top-0 z-10">
                      <TypingDots className="rounded-tl-none" />
                    </FadeSlide>
                    <FadeSlide show={showBubbleClient}>
                      <div className="bg-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-700 border border-slate-200 max-w-[92%]">
                        &quot;Pode ser amanhã às 14h?&quot;
                      </div>
                    </FadeSlide>
                  </div>
                  <div className="relative min-h-[46px] flex justify-end">
                    <FadeSlide show={showTypingBot} className="absolute right-0 top-0 z-10">
                      <TypingDots className="rounded-tr-none bg-[#e8f6e3] border-[#cfe9c6]" />
                    </FadeSlide>
                    <FadeSlide show={showBubbleBot} className="w-full flex justify-end">
                      <div className="bg-[#64b34d] p-3.5 rounded-2xl rounded-tr-none text-xs text-white font-bold shadow-wg-bubble border border-[#4d8f3b] max-w-[95%]">
                        &quot;Claro! Horário reservado.&quot;
                      </div>
                    </FadeSlide>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-white/90 backdrop-blur-sm border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-center shadow-wg-device">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#4285F4] flex items-center justify-center text-white">
                  <Calendar size={16} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em]">
                  Google Calendar
                </p>
              </div>

              <div className="relative min-h-[112px]">
                <FadeSlide
                  show={!showCalendar}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-full rounded-2xl border border-dashed border-slate-200 p-4 min-h-[112px] flex items-center justify-center">
                    <p className="text-xs text-slate-400 font-semibold">Aguardando confirmação…</p>
                  </div>
                </FadeSlide>
                <FadeSlide show={showCalendar} className="w-full">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                        Agendado
                      </p>
                      <span className="inline-flex items-center gap-1 text-[#4d8f3b] text-[10px] font-black uppercase">
                        <Check size={11} strokeWidth={4} />
                        Sync
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900">Maria Silva</p>
                    <p className="text-xs text-slate-600 font-bold">Terça · 14:00</p>
                    <div className="mt-2 h-1.5 rounded-full bg-[#4285F4]/20 overflow-hidden">
                      <div className="h-full w-3/5 rounded-full bg-[#4285F4]" />
                    </div>
                  </div>
                </FadeSlide>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
