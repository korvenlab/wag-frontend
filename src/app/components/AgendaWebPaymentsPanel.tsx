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

/** Pagamentos e sinal antecipado — copy focado no que o dono precisa decidir. */
export function AgendaWebPaymentsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [balance, setBalance] = useState<ConnectBalance | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [payoutBusy, setPayoutBusy] = useState(false);
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
      setBalance(data as ConnectBalance);
      setBalanceError(null);
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
          ? "Cadastro atualizado. Se ainda faltar algum passo, use Continuar cadastro."
          : "Cadastro incompleto — abra Continuar cadastro para terminar documentos e conta.",
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

  async function transferAvailable() {
    if (!balance || balance.available_brl < 1) return;
    setPayoutBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/stripe/connect/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_brl: balance.available_brl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível transferir agora.");
        return;
      }
      if (data.balance) setBalance(data.balance as ConnectBalance);
      else void loadBalance();
      setMsg(
        data.message ||
          `Transferência de ${moneyBrl(Number(data.amount_brl) || 0)} solicitada para sua conta bancária.`,
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
            Em cerca de 10 minutos você libera cobrança de sinal, clube e saque para o seu banco.
            É um cadastro único: documentos + conta bancária (ou chave PIX).
          </p>
          <ol className="text-xs text-slate-500 font-medium space-y-1.5 mt-3 list-decimal list-inside">
            <li>
              <strong className="text-slate-700">Criar conta</strong> — um clique, abre a página
              segura do parceiro de pagamentos.
            </li>
            <li>
              <strong className="text-slate-700">Enviar dados</strong> — CNPJ ou CPF, documento e
              conta onde você quer receber.
            </li>
            <li>
              <strong className="text-slate-700">Pronto</strong> — o saldo aparece aqui e você
              transfere quando quiser, sem sair do Wagoo.
            </li>
          </ol>
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
                1 · Conta criada
              </li>
              <li className="flex items-center gap-2">
                {status?.details_submitted ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                2 · Documentos e banco enviados
              </li>
              <li className="flex items-center gap-2">
                {status?.charges_enabled ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                3 · Já pode cobrar clientes
              </li>
              <li className="flex items-center gap-2">
                {status?.payouts_enabled ? (
                  <CheckCircle2 size={14} className="text-[#64b34d]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
                4 · Saque para o banco liberado
              </li>
            </ul>
          </div>

          {!status?.connected ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-2">
              <p className="text-sm font-black text-amber-900">Falta liberar os recebimentos</p>
              <p className="text-sm text-amber-800 font-medium leading-relaxed">
                Sem isso, sinal, clube e saque ficam desligados. O cadastro é feito uma vez — depois
                o dinheiro dos clientes cai no seu saldo aqui no Wagoo.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#64b34d]/25 bg-[#64b34d]/5 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wallet className="text-[#64b34d]" size={18} />
                  <p className="text-sm font-black text-slate-900">Saldo na conta</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-bold text-slate-500"
                  disabled={busy || balanceLoading || payoutBusy}
                  onClick={() => void loadBalance()}
                >
                  {balanceLoading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Atualizar"
                  )}
                </Button>
              </div>

              {balanceError ? (
                <p className="text-xs font-semibold text-amber-700">{balanceError}</p>
              ) : balance ? (
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Disponível
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {moneyBrl(balance.available_brl)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      A caminho
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {moneyBrl(balance.pending_brl)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-100 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Total
                    </p>
                    <p className="text-xl font-black text-[#4d8f3b] mt-1">
                      {moneyBrl(balance.total_brl)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Carregando saldo…
                </p>
              )}

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Disponível já pode ir para sua conta bancária. A caminho ainda está processando.
              </p>

              {!status.payouts_enabled ? (
                <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Quase lá: falta concluir documentos e conta bancária para liberar o saque. Use
                  “Continuar cadastro” abaixo — leva poucos minutos.
                </p>
              ) : null}

              <Button
                type="button"
                className="w-full sm:w-auto bg-[#64b34d] hover:bg-[#58a344] text-white font-bold rounded-2xl"
                disabled={
                  busy ||
                  payoutBusy ||
                  !status.payouts_enabled ||
                  !balance ||
                  balance.available_brl < 1
                }
                onClick={() => void transferAvailable()}
              >
                {payoutBusy ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Wallet className="mr-2" size={16} />
                )}
                {balance && balance.available_brl >= 1
                  ? `Transferir ${moneyBrl(balance.available_brl)} para o banco`
                  : "Transferir para o banco"}
              </Button>
            </div>
          )}

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
                  ? "Atualizar dados de recebimento"
                  : "Continuar cadastro"
                : "Liberar recebimentos (~10 min)"}
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
                  ? "Gerenciar banco e documentos"
                  : "Enviar documentos e conta"}
              </Button>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Os dados sensíveis ficam numa página segura do parceiro de pagamentos (não pedimos senha
            do banco aqui). Depois disso, você acompanha saldo e saque neste painel.
          </p>
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
              <strong className="text-slate-700">Desligado:</strong> o cliente agenda sem pagar
              (salvo se você liberar o pagamento adiantado opcional abaixo).
            </li>
            <li>
              <strong className="text-slate-700">Ligado:</strong> ele precisa pagar o sinal para
              confirmar; a IA confirma no WhatsApp depois do pagamento.
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
                agendar sem pagar. Com o sinal ligado, esta opção não se aplica.
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
