import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  Loader2,
  Smartphone,
  QrCode,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { apiFetch } from "../lib/apiFetch";

const SKIP_KEY_PREFIX = "wagoo_wa_onboarding_skipped_";

type Step = 0 | 1 | 2 | 3;

export function skipWhatsAppOnboardingKey(userId: string) {
  return `${SKIP_KEY_PREFIX}${userId}`;
}

export function hasSkippedWhatsAppOnboarding(userId: string): boolean {
  try {
    return localStorage.getItem(skipWhatsAppOnboardingKey(userId)) === "1";
  } catch {
    return false;
  }
}

type WhatsAppOnboardingProps = {
  onSkip?: () => void;
};

export function WhatsAppOnboarding({ onSkip }: WhatsAppOnboardingProps) {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<"idle" | "waiting_qr" | "connecting" | "connected">(
    "idle",
  );
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQr = useCallback(async () => {
    setIsLoadingQR(true);
    setError(null);
    try {
      const response = await apiFetch("/api/whatsapp/qr", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        setError("Não foi possível gerar o QR Code. Tente de novo.");
        setWaStatus("idle");
        return;
      }
      const data = await response.json();
      if (data.connected || data.status === "connected") {
        setQrCode(null);
        setWaStatus("connected");
        setStep(3);
      } else if (data.status === "connecting") {
        setWaStatus("connecting");
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
        setWaStatus("waiting_qr");
      } else {
        setError("Aguarde um instante e tente novamente.");
        setWaStatus("idle");
      }
    } catch {
      setError("Erro de rede. Verifique sua conexão.");
      setWaStatus("idle");
    } finally {
      setIsLoadingQR(false);
    }
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    if (waStatus === "idle" && !qrCode) {
      void fetchQr();
    }
  }, [step, waStatus, qrCode, fetchQr]);

  useEffect(() => {
    if (step !== 2) return;
    if (waStatus !== "waiting_qr" && waStatus !== "connecting") return;

    const intervalMs = waStatus === "connecting" ? 2_000 : 15_000;
    const id = window.setInterval(() => {
      void (async () => {
        try {
          const response = await apiFetch("/api/whatsapp/qr", {
            method: "POST",
            body: JSON.stringify({}),
          });
          if (!response.ok) return;
          const data = await response.json();
          if (data.connected || data.status === "connected") {
            setQrCode(null);
            setWaStatus("connected");
            setStep(3);
          } else if (data.status === "connecting") {
            setWaStatus("connecting");
          } else if (typeof data.qrCode === "string") {
            setQrCode(data.qrCode);
            setWaStatus("waiting_qr");
          }
        } catch {
          /* ignore */
        }
      })();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [step, waStatus]);

  useEffect(() => {
    if (step !== 3 || waStatus !== "connected") return;
    const t = window.setTimeout(() => {
      void refreshProfile({ force: true });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [step, waStatus, refreshProfile]);

  const handleSkip = () => {
    onSkip?.();
  };

  const handleFinish = () => {
    void refreshProfile({ force: true });
  };

  const titles: Record<Step, { title: string; subtitle: string }> = {
    0: {
      title: "Conecte seu WhatsApp",
      subtitle: "É o que libera a IA para atender e agendar seus clientes.",
    },
    1: {
      title: "Abra o WhatsApp no celular",
      subtitle: "Vamos vincular este aparelho em poucos toques.",
    },
    2: {
      title: "Escaneie o QR Code",
      subtitle: "Aponte a câmera do celular para a tela do computador.",
    },
    3: {
      title: "WhatsApp conectado!",
      subtitle: "Sua loja já pode receber mensagens pela IA do Wagoo.",
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-[32px] shadow-wg-elevated border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] px-8 py-9 text-white text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              Configuração inicial
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-black tracking-tight">{titles[step].title}</h1>
                <p className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
                  {titles[step].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-2">
              {([0, 1, 2, 3] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? "w-8 bg-white" : s < step ? "w-4 bg-white/70" : "w-4 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-8 min-h-[280px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <ul className="space-y-3">
                    {[
                      "Clientes falam no WhatsApp e a IA responde por você.",
                      "Agendamentos entram direto no seu fluxo (e no Calendar, se ligado).",
                      "É o mesmo vínculo de “Aparelhos conectados” do WhatsApp oficial.",
                    ].map((text) => (
                      <li
                        key={text}
                        className="flex gap-3 items-start text-sm font-medium text-slate-600 leading-snug"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#64b34d] shrink-0 mt-0.5" />
                        {text}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full h-12 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                  >
                    Começar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                    {[
                      {
                        n: "1",
                        t: "Abra o WhatsApp no celular da loja",
                        d: "Use o número que os clientes já conhecem.",
                      },
                      {
                        n: "2",
                        t: "Toque em ⋮ ou Configurações → Aparelhos conectados",
                        d: "No iPhone: Ajustes → Aparelhos conectados.",
                      },
                      {
                        n: "3",
                        t: "Toque em Conectar um aparelho",
                        d: "Na próxima tela vamos mostrar o QR Code.",
                      },
                    ].map((item) => (
                      <div key={item.n} className="flex gap-3 items-start">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#64b34d] text-white text-xs font-black">
                          {item.n}
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">
                            {item.t}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="h-12 rounded-2xl flex-[2] bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                    >
                      Já estou nessa tela
                      <QrCode className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-56 h-56 rounded-3xl border-2 border-slate-100 bg-white shadow-wg-subtle flex items-center justify-center overflow-hidden relative">
                      {waStatus === "connecting" ? (
                        <div className="flex flex-col items-center gap-3 px-4 text-center">
                          <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" />
                          <p className="text-sm font-black text-slate-800">Conectando…</p>
                          <p className="text-xs text-slate-500 font-medium">
                            Não feche esta página.
                          </p>
                        </div>
                      ) : qrCode ? (
                        <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full p-3" />
                      ) : isLoadingQR ? (
                        <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" />
                      ) : (
                        <Smartphone className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                    <p className="text-xs text-center text-slate-500 font-medium max-w-sm leading-relaxed">
                      No celular: Aparelhos conectados → Conectar um aparelho → aponte para este QR.
                    </p>
                    {error && (
                      <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        {error}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep(1);
                        setWaStatus("idle");
                        setQrCode(null);
                      }}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void fetchQr()}
                      disabled={isLoadingQR || waStatus === "connecting"}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      {isLoadingQR ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Gerar novo QR"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-[#64b34d]" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Pronto. Você pode acompanhar o status e a IA no painel a qualquer momento.
                  </p>
                  <Button
                    type="button"
                    onClick={handleFinish}
                    className="w-full h-12 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                  >
                    Ir para o painel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 3 && (
              <button
                type="button"
                onClick={handleSkip}
                className="mt-6 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Fazer depois
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
