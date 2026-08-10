import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

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
  advance_pay_enabled: boolean;
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

type ConnectBalance = {
  currency: string;
  available_brl: number;
  pending_brl: number;
  total_brl: number;
  payouts_enabled: boolean;
  charges_enabled?: boolean;
};

function moneyBrl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBrlInput(raw: string): number | null {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
      {ok ? (
        <CheckCircle2 size={14} className="text-[#64b34d] shrink-0" />
      ) : (
        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
      )}
      {label}
    </li>
  );
}

/** Pagamentos Stripe Connect: saldo + saque no Wagoo + sinal. */
export function AgendaWebPaymentsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [balance, setBalance] = useState<ConnectBalance | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [preview, setPreview] = useState<FeePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [advancePayEnabled, setAdvancePayEnabled] = useState(false);
  const [exampleTotal, setExampleTotal] = useState("100");

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await apiFetch("/api/stripe/connect/balance");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setBalance(null);
        setBalanceError(data?.error || "Não foi possível carregar o saldo.");
        return;
      }
      const body = data as ConnectBalance;
      setBalance(body);
      setBalanceError(null);
      setPayoutAmount((prev) => {
        if (prev.trim()) return prev;
        return body.available_brl > 0
          ? body.available_brl.toFixed(2).replace(".", ",")
          : "";
      });
    } catch {
      setBalance(null);
      setBalanceError("Erro de rede ao carregar o saldo.");
    } finally {
      setBalanceLoading(false);
    }
  }, []);

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
      setAdvancePayEnabled(Boolean(data.advance_pay_enabled));
      setError(null);
      if (data.connected) {
        void loadBalance();
      } else {
        setBalance(null);
        setBalanceError(null);
      }
    } catch {
      setError("Erro de rede ao carregar pagamentos.");
    } finally {
      setLoading(false);
    }
  }, [loadBalance]);

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
          ? "Cadastro atualizado. Se a Stripe já liberou, o saldo aparece abaixo."
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
        setError(data.error || "Não foi possível abrir a gestão da conta.");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Erro de rede ao abrir a gestão da conta.");
    } finally {
      setBusy(false);
    }
  }

  async function transferToBank(full = false) {
    if (!balance || balance.available_brl < 1) return;
    const amount = full
      ? balance.available_brl
      : parseBrlInput(payoutAmount) ?? balance.available_brl;

    if (amount < 1) {
      setError("Valor mínimo para transferir: R$ 1,00.");
      return;
    }
    if (amount > balance.available_brl + 0.001) {
      setError("O valor pedido é maior que o saldo disponível.");
      return;
    }

    setPayoutBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/stripe/connect/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_brl: amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível transferir agora.");
        return;
      }
      if (data.balance) {
        setBalance(data.balance as ConnectBalance);
        const nextAvail = Number(data.balance.available_brl) || 0;
        setPayoutAmount(
          nextAvail > 0 ? nextAvail.toFixed(2).replace(".", ",") : "",
        );
      } else {
        void loadBalance();
      }
      setMsg(
        data.message ||
          `Transferência de ${moneyBrl(Number(data.amount_brl) || amount)} solicitada. O valor vai para a conta bancária cadastrada.`,
      );
    } catch {
      setError("Erro de rede ao transferir.");
    } finally {
      setPayoutBusy(false);
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
          advance_pay_enabled: advancePayEnabled,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }
      setMsg("Configurações de sinal salvas.");
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

  const canPayout =
    Boolean(status?.payouts_enabled) &&
    Boolean(balance) &&
    (balance?.available_brl ?? 0) >= 1;

  return (
    <div className="space-y-6 max-w-3xl">
      {error ? (
        <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-2xl px-4 py-3">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="text-sm font-semibold text-[#4d8f3b] bg-[#64b34d]/10 rounded-2xl px-4 py-3">
          {msg}
        </p>
      ) : null}

      {/* Hero saldo */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1a3d1a] text-white shadow-wg-elevated">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#64b34d]/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#64b34d]/10 blur-3xl" />
        <div className="relative p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                Seu saldo
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">
                {!status?.connected
                  ? "—"
                  : balanceLoading && !balance
                    ? "…"
                    : moneyBrl(balance?.available_brl ?? 0)}
              </h2>
              <p className="mt-1 text-sm text-white/60 font-medium">
                Disponível para transferir ao banco
              </p>
            </div>
            <button
              type="button"
              aria-label="Atualizar saldo"
              disabled={!status?.connected || balanceLoading || busy || payoutBusy}
              onClick={() => void loadBalance()}
              className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <RefreshCw
                size={16}
                className={balanceLoading ? "animate-spin text-white/80" : "text-white/80"}
              />
            </button>
          </div>

          {status?.connected && balance ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  A caminho
                </p>
                <p className="text-lg font-black mt-1">{moneyBrl(balance.pending_brl)}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  Total
                </p>
                <p className="text-lg font-black mt-1 text-[#9fd48a]">
                  {moneyBrl(balance.total_brl)}
                </p>
              </div>
            </div>
          ) : null}

          {!status?.connected ? (
            <div className="rounded-2xl bg-amber-400/15 border border-amber-300/20 px-4 py-3">
              <p className="text-sm font-bold text-amber-100">
                Cadastre a conta de recebimentos para ver saldo e sacar pelo Wagoo.
              </p>
            </div>
          ) : balanceError ? (
            <p className="text-sm font-semibold text-amber-200">{balanceError}</p>
          ) : null}

          {status?.connected ? (
            <div className="space-y-3 pt-1">
              {!status.payouts_enabled ? (
                <p className="text-xs font-semibold text-amber-100/90 bg-amber-400/10 border border-amber-300/20 rounded-xl px-3 py-2">
                  Saque bloqueado até terminar documentos e conta bancária no cadastro.
                </p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">
                        R$
                      </span>
                      <Input
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="0,00"
                        className="h-12 pl-10 rounded-2xl bg-white/10 border-white/15 text-white font-bold placeholder:text-white/30 focus-visible:ring-[#64b34d]"
                        disabled={payoutBusy || !canPayout}
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-12 rounded-2xl bg-[#64b34d] hover:bg-[#58a344] text-white font-black px-5 shrink-0"
                      disabled={payoutBusy || !canPayout}
                      onClick={() => void transferToBank(false)}
                    >
                      {payoutBusy ? (
                        <Loader2 className="animate-spin mr-2" size={16} />
                      ) : (
                        <ArrowDownToLine className="mr-2" size={16} />
                      )}
                      Sacar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!canPayout || payoutBusy}
                      onClick={() =>
                        setPayoutAmount(
                          balance!.available_brl.toFixed(2).replace(".", ","),
                        )
                      }
                      className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 disabled:opacity-40"
                    >
                      Todo o disponível
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                      disabled={payoutBusy || !canPayout}
                      onClick={() => void transferToBank(true)}
                    >
                      <Banknote className="mr-1.5" size={14} />
                      Sacar tudo agora
                    </Button>
                  </div>
                  <p className="text-[11px] text-white/45 font-medium leading-relaxed">
                    O saque vai direto para a conta bancária cadastrada — sem abrir a Stripe.
                    Pode levar 1–2 dias úteis para cair no banco.
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* Conta / onboarding */}
      <Card className="rounded-[28px] border-slate-200 shadow-wg-subtle overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold flex items-center gap-2">
            <Wallet className="text-[#64b34d]" size={20} />
            Conta de recebimentos
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {status?.tip}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid sm:grid-cols-2 gap-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <ChecklistItem ok={!!status?.connected} label="Conta criada" />
            <ChecklistItem ok={!!status?.details_submitted} label="Dados enviados" />
            <ChecklistItem ok={!!status?.charges_enabled} label="Pronto para receber" />
            <ChecklistItem
              ok={!!status?.payouts_enabled}
              label="Saque para o banco liberado"
            />
          </ul>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              className="bg-slate-900 hover:bg-[#64b34d] text-white font-bold rounded-2xl"
              disabled={busy}
              onClick={() => void startOnboard()}
            >
              {busy ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <CreditCard className="mr-2" size={16} />
              )}
              {status?.connected
                ? status.payouts_enabled && status.charges_enabled
                  ? "Atualizar cadastro"
                  : "Continuar cadastro"
                : "Criar conta de recebimentos"}
            </Button>
            {status?.connected ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl font-bold"
                disabled={busy}
                onClick={() => {
                  if (status.details_submitted) void openDashboard();
                  else void startOnboard();
                }}
              >
                <ExternalLink className="mr-2" size={16} />
                {status.details_submitted
                  ? "Conta bancária e documentos"
                  : "Continuar documentos"}
              </Button>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            O cadastro (KYC e conta bancária) é feito em página segura da Stripe. Depois disso,
            saldo e saque ficam neste painel do Wagoo.
          </p>
        </CardContent>
      </Card>

      {/* Sinal */}
      <Card className="rounded-[28px] border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold">Sinal antecipado (opcional)</CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Pedir uma parte do serviço na hora de marcar. O horário só confirma depois do
            pagamento — no WhatsApp e no link da Agenda Web.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded accent-[#64b34d]"
              checked={depositEnabled}
              disabled={!status?.ready_to_charge}
              onChange={(e) => {
                const on = e.target.checked;
                setDepositEnabled(on);
                if (on) setAdvancePayEnabled(false);
              }}
            />
            <span className="text-sm font-bold text-slate-800">
              Pedir sinal para confirmar o horário
            </span>
          </label>

          <label
            className={`flex items-start gap-3 ${
              !status?.ready_to_charge || depositEnabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5 w-5 h-5 rounded accent-[#64b34d] shrink-0"
              checked={advancePayEnabled && !depositEnabled}
              disabled={!status?.ready_to_charge || depositEnabled}
              onChange={(e) => setAdvancePayEnabled(e.target.checked)}
            />
            <span className="text-sm font-bold text-slate-800 space-y-1">
              <span className="block">Permitir pagamento adiantado (100% do serviço)</span>
              <span className="block text-xs text-slate-500 font-medium leading-relaxed">
                Com o sinal desligado: o cliente pode marcar e pagar o valor inteiro se quiser, ou
                agendar sem pagar.
              </span>
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
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold bg-white"
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
                    Você recebe (estimado)
                  </p>
                  <p>
                    Pix: ~R${" "}
                    <strong className="text-slate-900">
                      {(
                        preview.stripe?.pix.shop_receives_brl ?? preview.shop_receives_brl
                      ).toFixed(2)}
                    </strong>
                  </p>
                  <p>
                    Cartão: ~R${" "}
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
            Salvar sinal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
