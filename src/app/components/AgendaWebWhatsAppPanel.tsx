import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Loader2,
  MessageCircle,
  QrCode,
  Smartphone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const REMIND_PRESETS = [15, 30, 60, 120] as const;

/**
 * WhatsApp da loja (Baileys + QR) + lembretes em script — plano Agenda Web.
 * Sem IA: só confirmação ao agendar e lembrete antes do horário.
 */
export function AgendaWebWhatsAppPanel() {
  const { user, refreshProfile } = useAuth();

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<"idle" | "waiting_qr" | "connecting" | "connected">(
    user?.whatsappConnected ? "connected" : "idle",
  );
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState(60);
  const [isSavingReminders, setIsSavingReminders] = useState(false);
  const [remindersMsg, setRemindersMsg] = useState<string | null>(null);
  const [remindersError, setRemindersError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (user?.whatsappConnected) setWaStatus("connected");
  }, [user?.whatsappConnected]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch("/api/user/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setRemindersEnabled(!!data.reminders_enabled);
        setRemindBeforeMinutes(
          typeof data.remind_before_minutes === "number" ? data.remind_before_minutes : 60,
        );
        if (data.whatsapp_connected) setWaStatus("connected");
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchQr = useCallback(async () => {
    setIsLoadingQR(true);
    setWaError(null);
    try {
      const response = await apiFetch("/api/whatsapp/qr", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        setWaError("Não foi possível gerar o QR. Tente de novo.");
        setWaStatus("idle");
        return;
      }
      const data = await response.json();
      if (data.connected || data.status === "connected") {
        setQrCode(null);
        setWaStatus("connected");
        void refreshProfile({ force: true });
      } else if (data.status === "connecting") {
        setWaStatus("connecting");
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
        setWaStatus("waiting_qr");
      } else {
        setWaError("Aguarde um instante e tente novamente.");
        setWaStatus("idle");
      }
    } catch {
      setWaError("Erro de rede. Verifique sua conexão.");
      setWaStatus("idle");
    } finally {
      setIsLoadingQR(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
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
            void refreshProfile({ force: true });
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
  }, [waStatus, refreshProfile]);

  async function disconnectWa() {
    setWaError(null);
    try {
      const res = await apiFetch("/api/whatsapp/disconnect", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Falha ao desconectar");
      setWaStatus("idle");
      setQrCode(null);
      void refreshProfile({ force: true });
    } catch {
      setWaError("Não foi possível desconectar.");
    }
  }

  async function saveReminders() {
    setIsSavingReminders(true);
    setRemindersError(null);
    setRemindersMsg(null);
    try {
      const res = await apiFetch("/api/settings/reminders", {
        method: "POST",
        body: JSON.stringify({
          remindersEnabled,
          remindBeforeMinutes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRemindersError(data.error || "Não foi possível salvar.");
        return;
      }
      setRemindersEnabled(!!data.reminders_enabled);
      setRemindBeforeMinutes(
        typeof data.remind_before_minutes === "number"
          ? data.remind_before_minutes
          : remindBeforeMinutes,
      );
      setRemindersMsg("Lembretes salvos.");
      void refreshProfile({ force: true });
    } catch {
      setRemindersError("Erro de rede ao salvar.");
    } finally {
      setIsSavingReminders(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <MessageCircle className="text-[#64b34d]" size={22} />
            WhatsApp da loja
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Opcional. Conecte o número do negócio para enviar{" "}
            <strong className="text-slate-700 font-bold">confirmação</strong> na hora do
            agendamento e <strong className="text-slate-700 font-bold">lembretes</strong>{" "}
            automáticos — texto pronto, sem inteligência artificial.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {waStatus === "connected" ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#64b34d] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900">WhatsApp conectado</p>
                  <p className="text-xs text-slate-500 font-medium">
                    Confirmações e lembretes saem deste número.
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => void disconnectWa()}>
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => void fetchQr()}
                  disabled={isLoadingQR}
                  className="bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
                >
                  {isLoadingQR ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    <QrCode className="mr-2" size={16} />
                  )}
                  {waStatus === "connecting" ? "Conectando…" : "Gerar QR Code"}
                </Button>
                <p className="text-xs text-slate-500 self-center font-medium flex items-center gap-1.5">
                  <Smartphone size={14} /> Abra o WhatsApp → Aparelhos conectados → Conectar
                </p>
              </div>

              {waStatus === "connecting" ? (
                <div className="flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                  <Loader2 className="animate-spin" size={16} />
                  Quase lá — aguarde a conexão finalizar…
                </div>
              ) : null}

              {qrCode ? (
                <div className="flex justify-center p-4 rounded-2xl bg-white border border-slate-200">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-56 h-56 object-contain" />
                </div>
              ) : null}

              {waError ? <p className="text-sm text-red-600 font-semibold">{waError}</p> : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl font-extrabold flex items-center gap-2">
              <Bell className="text-[#64b34d]" size={22} />
              Lembretes
            </CardTitle>
            <Switch
              checked={remindersEnabled}
              onCheckedChange={setRemindersEnabled}
              disabled={!hydrated || isSavingReminders}
              className="data-[state=checked]:bg-[#64b34d]"
            />
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Avisa o cliente antes do horário. Ele pode responder SIM/NÃO para confirmar presença —
            ainda sem IA.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Antecedência
            </Label>
            <div className="flex flex-wrap gap-2">
              {REMIND_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={!remindersEnabled || isSavingReminders}
                  onClick={() => setRemindBeforeMinutes(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40 ${
                    remindBeforeMinutes === m
                      ? "bg-[#64b34d] text-white shadow-wg-subtle"
                      : "bg-slate-50 text-slate-600 border border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          {waStatus !== "connected" && remindersEnabled ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 font-medium">
              Conecte o WhatsApp acima para os lembretes serem enviados de fato.
            </p>
          ) : null}

          <Button
            type="button"
            onClick={() => void saveReminders()}
            disabled={isSavingReminders || !hydrated}
            className="bg-slate-900 hover:bg-[#64b34d] text-white font-bold"
          >
            {isSavingReminders ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Salvar lembretes
          </Button>
          {remindersMsg ? (
            <p className="text-xs text-emerald-600 font-black uppercase tracking-wider">
              {remindersMsg}
            </p>
          ) : null}
          {remindersError ? (
            <p className="text-sm text-red-600 font-semibold">{remindersError}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
