import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type FeePreview = {
  total_brl: number;
  deposit_brl: number;
  wagoo_fee_brl: number;
  shop_receives_brl: number;
  note: string;
  summary?: string;
  wagoo?: { percent: number; fee_brl: number; label: string };
  stripe?: {
    pix: {
      percent: number;
      fee_brl: number;
      shop_receives_brl: number;
      label: string;
    };
    card: {
      percent: number;
      fixed_brl: number;
      fee_brl: number;
      shop_receives_brl: number;
      label: string;
    };
  };
};

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
  fees?: {
    wagoo_percent: number;
    stripe_pix_percent: number;
    stripe_card_percent: number;
    stripe_card_fixed_brl: number;
    summary: string;
  };
};

/** Pagamentos e sinal antecipado — copy focado no que o dono precisa decidir. */
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
        setError(data?.error || "Não foi possível carregar os pagamentos.");
        return;
      }
      setStatus(data as ConnectStatus);
      setDepositEnabled(Boolean(data.deposit_enabled));
      setDepositPercent(Number(data.deposit_percent) || 30);
      setError(null);
    } catch {
      setError("Erro de rede ao carregar pagamentos.");
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
          ? "Cadastro atualizado."
          : "Abra de novo o cadastro se ainda faltar alguma informação.",
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
        setError(data.error || "Não foi possível abrir o cadastro.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erro de rede ao abrir o cadastro.");
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
        setError(data.error || "Não foi possível abrir o painel.");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Erro de rede ao abrir o painel.");
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
      setMsg("Salvo.");
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
        <Loader2 className="animate-spin mr-2" size={20} /> Carregando…
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
            Cadastre a conta onde o dinheiro cai. Sem isso, o cliente agenda sem pagar pelo app.
          </p>
          <ul className="text-xs text-slate-500 font-medium space-y-1 mt-2">
            <li>
              <strong className="text-slate-700">Se não configurar:</strong> você não recebe pelo
              app — só agenda.
            </li>
            <li>
              <strong className="text-slate-700">Se configurar:</strong> pode pedir sinal; o valor
              cai na sua conta bancária.
            </li>
          </ul>
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
                Conta criada
              </li>
              <li className="flex items-center gap-2">
                {status?.details_submitted ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Dados enviados
              </li>
              <li className="flex items-center gap-2">
                {status?.charges_enabled ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Pronto para receber
              </li>
              <li className="flex items-center gap-2">
                {status?.payouts_enabled ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                Transferência para o banco liberada
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
              {busy ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <CreditCard className="mr-2" size={16} />
              )}
              {status?.connected ? "Continuar cadastro" : "Cadastrar conta"}
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
                Ver saldo e transferências
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold">Sinal antecipado (opcional)</CardTitle>
          <p className="text-sm text-slate-500 font-medium">
            Pedir uma parte do serviço na hora de marcar. O horário só confirma depois do
            pagamento — no WhatsApp e no link da Agenda Web.
          </p>
          <ul className="text-xs text-slate-500 font-medium space-y-1 mt-2">
            <li>
              <strong className="text-slate-700">Desligado:</strong> o cliente agenda sem pagar.
            </li>
            <li>
              <strong className="text-slate-700">Ligado:</strong> ele paga o sinal para confirmar; a
              IA confirma no WhatsApp depois do pagamento.
            </li>
          </ul>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm text-slate-600 font-medium">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Quanto você recebe (simulação)
            </p>
            <p className="text-xs text-slate-500">
              O cliente paga só o sinal. As taxas saem do que você recebe — veja o exemplo abaixo.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded accent-[#64b34d]"
              checked={depositEnabled}
              disabled={!status?.ready_to_charge}
              onChange={(e) => setDepositEnabled(e.target.checked)}
            />
            <span className="text-sm font-bold text-slate-800">
              Pedir sinal para confirmar o horário
            </span>
          </label>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Quanto do serviço cobrar agora ({depositPercent}%)
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
              Exemplo — serviço de R$
            </p>
            <input
              type="text"
              inputMode="decimal"
              value={exampleTotal}
              onChange={(e) => setExampleTotal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
            />
            {preview ? (
              <div className="text-sm text-slate-600 font-medium space-y-3 pt-1">
                <p>
                  Cliente paga agora:{" "}
                  <strong className="text-slate-900">
                    R$ {preview.deposit_brl.toFixed(2)}
                  </strong>
                </p>

                <div className="rounded-xl bg-white border border-slate-100 p-3 space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Taxas (sobre o sinal)
                  </p>
                  <p>
                    Wagoo:{" "}
                    <strong className="text-slate-900">
                      {preview.wagoo?.percent ?? status?.wagoo_fee_percent ?? 2}% = R${" "}
                      {(preview.wagoo?.fee_brl ?? preview.wagoo_fee_brl).toFixed(2)}
                    </strong>
                  </p>
                  <p>
                    No Pix:{" "}
                    <strong className="text-slate-900">
                      {preview.stripe?.pix.percent ?? 1.19}% = R${" "}
                      {(preview.stripe?.pix.fee_brl ?? 0).toFixed(2)}
                    </strong>
                  </p>
                  <p>
                    No cartão:{" "}
                    <strong className="text-slate-900">
                      {preview.stripe?.card.percent ?? 3.99}% + R${" "}
                      {(preview.stripe?.card.fixed_brl ?? 0.39).toFixed(2)} = R${" "}
                      {(preview.stripe?.card.fee_brl ?? 0).toFixed(2)}
                    </strong>
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-slate-100 p-3 space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Você recebe (estimado)
                  </p>
                  <p>
                    Se pagar no Pix: ~R${" "}
                    <strong className="text-slate-900">
                      {(
                        preview.stripe?.pix.shop_receives_brl ?? preview.shop_receives_brl
                      ).toFixed(2)}
                    </strong>
                  </p>
                  <p>
                    Se pagar no cartão: ~R${" "}
                    <strong className="text-slate-900">
                      {(preview.stripe?.card.shop_receives_brl ?? 0).toFixed(2)}
                    </strong>
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {preview.summary ||
                    preview.note ||
                    status?.fees?.summary ||
                    "Wagoo 2%. No Pix 1,19%; no cartão 3,99% + R$ 0,39."}
                </p>
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl"
            disabled={busy || (!status?.ready_to_charge && depositEnabled)}
            onClick={() => void saveDepositSettings()}
          >
            {busy ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
