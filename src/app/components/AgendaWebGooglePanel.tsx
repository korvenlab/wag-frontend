import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type GoogleCheck = {
  google_connected: boolean;
  wagoo_email: string | null;
  found_on_google: boolean;
  tip: string;
  last_synced_appointment: {
    client_name: string;
    starts_at_br: string;
    google_event_id: string;
  } | null;
  google_event_live: {
    summary: string | null;
    htmlLink: string | null;
    start: string | null;
    status: string | null;
  } | null;
};

/**
 * Conecta Google Calendar para a Agenda Web salvar (e respeitar) horários na agenda do dono.
 */
export function AgendaWebGooglePanel() {
  const { refreshProfile } = useAuth();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [check, setCheck] = useState<GoogleCheck | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/user/profile");
      if (!res.ok) return;
      const data = await res.json();
      setConnected(!!data.google_connected);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const runCheck = useCallback(async () => {
    setChecking(true);
    try {
      const res = await apiFetch("/api/booking/google-check");
      const data = await res.json().catch(() => null);
      if (res.ok && data) setCheck(data as GoogleCheck);
    } catch {
      /* ignore */
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (connected) void runCheck();
  }, [connected, runCheck]);

  useEffect(() => {
    const onFocus = () => {
      void load();
      void refreshProfile({ force: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load, refreshProfile]);

  async function connectGoogle() {
    setConnecting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/auth/google/url");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível abrir a conexão com o Google.");
        return;
      }
      const popup = window.open(data.url, "wagoo-google-calendar", "width=520,height=680");
      if (!popup) {
        window.location.href = data.url;
        return;
      }
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          void load();
          void refreshProfile({ force: true });
          void runCheck();
          setConnecting(false);
        }
      }, 800);
    } catch {
      setError("Erro de rede ao conectar Google.");
      setConnecting(false);
    }
  }

  return (
    <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-extrabold flex items-center gap-2">
          <CalendarDays className="text-[#64b34d]" size={22} />
          Google Agenda
        </CardTitle>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Quando conectada, cada agendamento do link público entra na agenda{" "}
          <strong className="text-slate-700 font-bold">primary</strong> da conta Google que
          autorizar o Wagoo. Horários já ocupados lá também ficam bloqueados no site.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Loader2 className="animate-spin" size={16} /> Carregando…
          </div>
        ) : connected ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#64b34d] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900">Google Agenda conectada</p>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    Conta Wagoo: {check?.wagoo_email || "—"}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => void connectGoogle()}>
                Reconectar
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Último evento sincronizado
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={checking}
                  onClick={() => void runCheck()}
                >
                  {checking ? <Loader2 className="animate-spin" size={14} /> : "Verificar"}
                </Button>
              </div>

              {check?.last_synced_appointment ? (
                <div className="text-sm space-y-1">
                  <p className="font-bold text-slate-900">
                    {check.last_synced_appointment.client_name}
                  </p>
                  <p className="text-slate-600 font-medium">
                    Data na agenda:{" "}
                    <strong className="text-slate-900">
                      {check.last_synced_appointment.starts_at_br}
                    </strong>{" "}
                    (horário de Brasília) — abra este dia no Calendar, não necessariamente hoje.
                  </p>
                  {check.found_on_google ? (
                    <p className="text-emerald-700 font-semibold text-xs">
                      Encontrado na Google Agenda ✓
                    </p>
                  ) : (
                    <p className="text-amber-700 font-semibold text-xs">
                      ID gravado no Wagoo, mas não achamos o evento na agenda atual. Reconecte a
                      mesma conta Google e teste de novo.
                    </p>
                  )}
                  {check.google_event_live?.htmlLink ? (
                    <Button type="button" size="sm" className="mt-2 font-bold" asChild>
                      <a
                        href={check.google_event_live.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={14} className="mr-1" /> Abrir no Google Calendar
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-medium">
                  Ainda não há agendamento sincronizado. Faça um teste pelo link público.
                </p>
              )}
              {check?.tip ? (
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{check.tip}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => void connectGoogle()}
              disabled={connecting}
              className="bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
            >
              {connecting ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <CalendarDays className="mr-2" size={16} />
              )}
              Conectar Google Agenda
            </Button>
            <p className="text-xs text-slate-500 font-medium">
              Sem conexão, os agendamentos continuam só no painel Wagoo.
            </p>
          </div>
        )}
        {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
