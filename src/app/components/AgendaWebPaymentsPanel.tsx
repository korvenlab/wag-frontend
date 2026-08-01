import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type ConnectStatus = {
  connected: boolean;
  account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  ready_to_charge: boolean;
  deposit_enabled: boolean;
  deposit_percent: number;
  wagoo_fee_percent: number;
  hold_minutes: number;
  tip: string;
};

type FeePreview = {
  total_brl: number;
  deposit_brl: number;
  wagoo_fee_brl: number;
  shop_receives_brl: number;
  note: string;
};

/**
 * Onboarding Connect Express + configuração do sinal (2% Wagoo + taxa Stripe).
 * Gestão de saldo/saques/disputas: Express Dashboard via login link.
 */
export function AgendaWebPaymentsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [preview, setPreview] = useState<FeePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [exampleTotal, setExampleTotal] = useState("100");

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/stripe/connect/status");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Não foi possível carregar status Stripe.");
        return;
      }
      setStatus(data as ConnectStatus);
      setDepositEnabled(Boolean(data.deposit_enabled));
      setDepositPercent(Number(data.deposit_percent) || 30);
      setError(null);
    } catch {
      setError("Erro de rede ao carregar Stripe Connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreview = useCallback(async (total: number, percent: number) => {
    try {
      const res = await apiFetch(
        `/api/stripe/connect/fee-preview?total_brl=${encodeURIComponent(String(total))}&deposit_percent=${encodeURIComponent(String(percent))}`,
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data) setPreview(data as FeePreview);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const connectFlag = searchParams.get("connect");
    if (connectFlag === "return" || connectFlag === "refresh") {
      setMsg(
        connectFlag === "return"
          ? "Retorno do cadastro Stripe. Atualizando status…"
          : "Link de cadastro expirado — abra novamente se ainda faltar verificação.",
      );
      void load().then(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("connect");
        setSearchParams(next, { replace: true });
      });
    }
  }, [searchParams, setSearchParams, load]);

  useEffect(() => {
    const total = Math.max(0, Number(exampleTotal.replace(",", ".")) || 0);
    void loadPreview(total || 100, depositPercent);
  }, [exampleTotal, depositPercent, loadPreview]);

  useEffect(() => {
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  async function startOnboard() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível iniciar o cadastro Stripe.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erro de rede ao abrir onboarding Stripe.");
    } finally {
      setBusy(false);
    }
  }

  async function openDashboard() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/api/stripe/connect/dashboard", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível abrir o painel Stripe.");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Erro de rede ao abrir Express Dashboard.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDepositSettings() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/stripe/connect/deposit-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deposit_enabled: depositEnabled,
          deposit_percent: depositPercent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }
      setMsg("Configuração do sinal salva.");
      void load();
    } catch {
      setError("Erro de rede ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Carregando pagamentos…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <Wallet className="text-[#64b34d]" size={22} />
            Receber pagamentos
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Conecte a Stripe se quiser receber pagamentos. O sinal antecipado é{' '}
            <strong className="text-slate-800 font-bold">opcional</strong>: você escolhe se o
            cliente agenda de graça ou só confirma depois de pagar.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-2xl px-4 py-3">
              {error}
            </p>
          ) : null}
          {msg ? (
            <p className="text-sm font-semibold text-[#64b34d] bg-[#64b34d]/10 rounded-2xl px-4 py-3">
              {msg}
            </p>
          ) : null}

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
            <p className="text-sm font-bold text-slate-800">{status?.tip}</p>
            <ul className="text-xs text-slate-500 font-medium space-y-1">
              <li className="flex items-center gap-2">
                {status?.connected ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Conta Connect criada
              </li>
              <li className="flex items-center gap-2">
                {status?.details_submitted ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Dados e verificação enviados
              </li>
              <li className="flex items-center gap-2">
                {status?.charges_enabled ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Cobranças liberadas
              </li>
              <li className="flex items-center gap-2">
                {status?.payouts_enabled ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Saques liberados
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              className="bg-[#64b34d] hover:bg-[#58a344] text-white font-bold rounded-2xl"
              disabled={busy}
              onClick={() => void startOnboard()}
            >
              {busy ? <Loader2 className="animate-spin mr-2" size={16} /> : <CreditCard className="mr-2" size={16} />}
              {status?.connected ? "Continuar verificação Stripe" : "Conectar Stripe"}
            </Button>
            {status?.connected ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl font-bold"
                disabled={busy}
                onClick={() => void openDashboard()}
              >
                <ExternalLink className="mr-2" size={16} />
                Abrir painel Stripe
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed flex gap-2">
            <Shield size={14} className="shrink-0 mt-0.5" />
            No painel Express você gerencia saldo, saques, reembolsos, disputas e dados da conta.
            A Stripe coleta CPF/CNPJ e documentos exigidos no Brasil.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold">Sinal antecipado (opcional)</CardTitle>
          <p className="text-sm text-slate-500 font-medium">
            Desligado por padrão. Se você ligar, o horário{' '}
            <strong className="text-slate-800 font-bold">só confirma depois do pagamento</strong>.
            Se deixar desligado, o cliente agenda normalmente sem pagar. Com o sinal ligado, o slot
            fica reservado por {status?.hold_minutes ?? 30} min até o Checkout; Google/WhatsApp só
            disparam após o pagamento.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded accent-[#64b34d]"
              checked={depositEnabled}
              disabled={!status?.ready_to_charge}
              onChange={(e) => setDepositEnabled(e.target.checked)}
            />
            <span className="text-sm font-bold text-slate-800">
              Ativar sinal antecipado neste link
            </span>
          </label>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Percentual do sinal ({depositPercent}%)
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              className="w-full mt-2 accent-[#64b34d]"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Simulação (serviço de R$)
            </p>
            <input
              type="text"
              inputMode="decimal"
              value={exampleTotal}
              onChange={(e) => setExampleTotal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
            />
            {preview ? (
              <ul className="text-sm text-slate-600 font-medium space-y-1 pt-1">
                <li>
                  Cliente paga agora:{" "}
                  <strong className="text-slate-900">
                    R$ {preview.deposit_brl.toFixed(2)}
                  </strong>
                </li>
                <li>
                  Taxa Wagoo ({status?.wagoo_fee_percent ?? 2}%):{" "}
                  <strong className="text-slate-900">
                    R$ {preview.wagoo_fee_brl.toFixed(2)}
                  </strong>
                </li>
                <li>
                  Você recebe do sinal (antes da taxa Stripe):{" "}
                  <strong className="text-slate-900">
                    R$ {preview.shop_receives_brl.toFixed(2)}
                  </strong>
                </li>
                <li className="text-xs text-slate-400 pt-1">{preview.note}</li>
              </ul>
            ) : null}
          </div>

          <Button
            type="button"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl"
            disabled={busy || (!status?.ready_to_charge && depositEnabled)}
            onClick={() => void saveDepositSettings()}
          >
            {busy ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Salvar sinal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
