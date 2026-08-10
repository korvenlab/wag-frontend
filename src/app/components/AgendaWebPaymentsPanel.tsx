import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type PaymentsMe = {
  payments_ready: boolean;
  provider: string;
  wagoo_fee_percent: number;
  hold_minutes: number;
  ledger_balance_brl: number;
  payout_pix_key: string | null;
  payout_pix_key_type: string | null;
  deposit_enabled: boolean;
  deposit_percent: number;
  advance_pay_enabled: boolean;
  tip: string;
};

type FeePreview = {
  total_brl: number;
  deposit_brl: number;
  wagoo_fee_brl: number;
  shop_receives_brl: number;
  note: string;
};

type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";

function moneyBrl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Pagamentos Asaas: saldo, PIX, sinal e saque. */
export function AgendaWebPaymentsPanel() {
  const [me, setMe] = useState<PaymentsMe | null>(null);
  const [preview, setPreview] = useState<FeePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [pixBusy, setPixBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [advancePayEnabled, setAdvancePayEnabled] = useState(false);
  const [exampleTotal, setExampleTotal] = useState("100");
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState<PixKeyType>("CPF");

  const loadPreview = useCallback(async (total: number, percent: number) => {
    try {
      const res = await apiFetch(
        `/api/payments/me/fee-preview?total_brl=${encodeURIComponent(String(total))}&deposit_percent=${encodeURIComponent(String(percent))}`,
      );
      const data = await res.json().catch(() => null);
      if (res.ok) setPreview(data as FeePreview);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/payments/me");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Não foi possível carregar os pagamentos.");
        return;
      }
      const body = data as PaymentsMe;
      setMe(body);
      setDepositEnabled(Boolean(body.deposit_enabled));
      setDepositPercent(Number(body.deposit_percent) || 30);
      setAdvancePayEnabled(Boolean(body.advance_pay_enabled));
      if (body.payout_pix_key) setPixKey(body.payout_pix_key);
      if (body.payout_pix_key_type) setPixType(body.payout_pix_key_type as PixKeyType);
      setError(null);
    } catch {
      setError("Erro de rede ao carregar pagamentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const total = Math.max(0, Number(exampleTotal.replace(",", ".")) || 0);
    void loadPreview(total || 100, depositPercent);
  }, [exampleTotal, depositPercent, loadPreview]);

  async function saveDepositSettings() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/payments/me/deposit-settings", {
        method: "PATCH",
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

  async function savePix() {
    setPixBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/payments/me/payout-pix", {
        method: "PUT",
        body: JSON.stringify({ pix_key: pixKey.trim(), pix_key_type: pixType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar a chave PIX.");
        return;
      }
      setMsg("Chave PIX salva.");
      void load();
    } catch {
      setError("Erro de rede ao salvar PIX.");
    } finally {
      setPixBusy(false);
    }
  }

  async function requestPayout() {
    setPayoutBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/payments/me/payout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível sacar agora.");
        return;
      }
      setMsg(data.message || "Saque enviado.");
      void load();
    } catch {
      setError("Erro de rede ao sacar.");
    } finally {
      setPayoutBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Carregando…
      </div>
    );
  }

  const ready = Boolean(me?.payments_ready);
  const balance = Number(me?.ledger_balance_brl || 0);
  const fee = me?.wagoo_fee_percent ?? 2;

  return (
    <div className="space-y-5">
      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <Wallet className="text-[#64b34d]" size={22} />
            Receber via PIX
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Clientes pagam sinal e mensalidade do clube na conta Wagoo. O líquido (após {fee}%)
            entra no seu saldo — você saca para sua chave PIX quando quiser.
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

          <p className="text-sm font-bold text-slate-800">{me?.tip}</p>

          {!ready ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-black text-amber-900">Pagamentos em configuração</p>
              <p className="text-sm text-amber-800 font-medium mt-1">
                Em breve você libera sinal e saque aqui. O clube e o sinal usam o mesmo saldo PIX.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#64b34d]/25 bg-[#64b34d]/5 p-5 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Saldo disponível
                </p>
                <p className="text-3xl font-black text-slate-900 mt-1">{moneyBrl(balance)}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Inclui sinais e mensalidades do clube já pagas.
                </p>
              </div>

              <div className="grid sm:grid-cols-[1fr_140px] gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Sua chave PIX
                  </Label>
                  <Input
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, e-mail, telefone ou aleatória"
                    className="h-11 rounded-xl bg-white border-slate-200 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tipo
                  </Label>
                  <select
                    value={pixType}
                    onChange={(e) => setPixType(e.target.value as PixKeyType)}
                    className="h-11 w-full rounded-xl bg-white border border-slate-200 font-semibold px-3 text-sm"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                    <option value="EVP">Aleatória</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl font-bold"
                  disabled={pixBusy}
                  onClick={() => void savePix()}
                >
                  {pixBusy ? <Loader2 className="animate-spin" size={16} /> : "Salvar PIX"}
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl bg-[#64b34d] hover:bg-[#58a344] text-white font-bold"
                  disabled={payoutBusy || balance < 1 || !me?.payout_pix_key}
                  onClick={() => void requestPayout()}
                >
                  {payoutBusy ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  Sacar {moneyBrl(balance)}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold">Sinal antecipado</CardTitle>
          <p className="text-sm text-slate-500 font-medium">
            Pedir uma parte do serviço na hora de marcar. O horário só confirma depois do
            pagamento — no WhatsApp e no link da Agenda Web.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 accent-[#64b34d]"
              checked={depositEnabled}
              disabled={!ready}
              onChange={(e) => {
                setDepositEnabled(e.target.checked);
                if (e.target.checked) setAdvancePayEnabled(false);
              }}
            />
            <span className="text-sm font-bold text-slate-800">Exigir sinal para confirmar</span>
          </label>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Percentual do sinal
            </Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={depositPercent}
              disabled={!ready || !depositEnabled}
              onChange={(e) => setDepositPercent(Number(e.target.value) || 30)}
              className="h-11 rounded-xl bg-slate-50 border-none font-semibold max-w-[140px]"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 accent-[#64b34d]"
              checked={advancePayEnabled}
              disabled={!ready || depositEnabled}
              onChange={(e) => setAdvancePayEnabled(e.target.checked)}
            />
            <span className="text-sm font-bold text-slate-800">
              Permitir pagamento adiantado opcional (100%)
            </span>
          </label>
          <p className="text-xs text-slate-500 font-medium">
            Só com o sinal desligado. O cliente pode escolher pagar tudo na hora de marcar.
          </p>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Simulação
            </p>
            <div className="flex items-center gap-3">
              <Label className="text-xs font-bold text-slate-500 shrink-0">Total do serviço</Label>
              <Input
                value={exampleTotal}
                onChange={(e) => setExampleTotal(e.target.value)}
                className="h-9 rounded-xl bg-white border-slate-200 font-semibold max-w-[120px]"
              />
            </div>
            {preview ? (
              <ul className="text-sm text-slate-600 font-medium space-y-1">
                <li>Sinal: {moneyBrl(preview.deposit_brl)}</li>
                <li>Taxa Wagoo ({fee}%): {moneyBrl(preview.wagoo_fee_brl)}</li>
                <li className="font-black text-slate-900">
                  Você recebe no saldo: {moneyBrl(preview.shop_receives_brl)}
                </li>
              </ul>
            ) : null}
            {preview?.note ? (
              <p className="text-xs text-slate-500 font-medium">{preview.note}</p>
            ) : null}
          </div>

          <Button
            type="button"
            className="bg-slate-900 hover:bg-[#64b34d] text-white font-bold rounded-2xl"
            disabled={busy || !ready}
            onClick={() => void saveDepositSettings()}
          >
            {busy ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Salvar sinal
          </Button>

          {ready ? (
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} className="text-[#64b34d]" />
              Hold do horário: {me?.hold_minutes ?? 30} min até o pagamento.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
