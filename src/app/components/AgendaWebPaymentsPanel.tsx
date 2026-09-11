import { useCallback, useEffect, useState } from "react";
import {
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

type MpStatus = {
  connected: boolean;
  ready_to_charge: boolean;
  mp_user_id: string | null;
  deposit_enabled: boolean;
  deposit_percent: number;
  advance_pay_enabled: boolean;
  wagoo_fee_percent: number;
  hold_minutes: number;
  tip: string;
  fees?: { wagoo_percent: number; summary: string };
};

type FeePreview = {
  deposit_brl: number;
  wagoo?: { percent: number; fee_brl: number; label: string };
  stripe?: {
    pix: { percent: number; fee_brl: number; shop_receives_brl: number; label: string };
    card: { percent: number; fee_brl: number; shop_receives_brl: number; label: string };
  };
  summary?: string;
};

function moneyBrl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
      {ok ? (
        <CheckCircle2 size={14} className="text-[#64b34d] shrink-0" />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" />
      )}
      {label}
    </li>
  );
}

/** Pagamentos Mercado Pago (sinal + clube). Assinatura Wagoo continua no Stripe. */
export function AgendaWebPaymentsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<MpStatus | null>(null);
  const [preview, setPreview] = useState<FeePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [advancePayEnabled, setAdvancePayEnabled] = useState(false);
  const [exampleTotal, setExampleTotal] = useState("100");

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/mercadopago/status");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Não foi possível carregar os pagamentos.");
        return;
      }
      setStatus(data as MpStatus);
      setDepositEnabled(Boolean(data.deposit_enabled));
      setDepositPercent(Number(data.deposit_percent) || 30);
      setAdvancePayEnabled(Boolean(data.advance_pay_enabled));
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
        `/api/mercadopago/fee-preview?total_brl=${encodeURIComponent(String(total))}&deposit_percent=${encodeURIComponent(String(percent))}`,
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
    const mp = searchParams.get("mp");
    if (mp === "connected") {
      setMsg("Mercado Pago vinculado com sucesso.");
      void load().then(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("mp");
        next.delete("reason");
        setSearchParams(next, { replace: true });
      });
    } else if (mp === "error") {
      setError(searchParams.get("reason") || "Falha ao vincular Mercado Pago.");
      const next = new URLSearchParams(searchParams);
      next.delete("mp");
      next.delete("reason");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, load]);

  useEffect(() => {
    const total = Math.max(0, Number(exampleTotal.replace(",", ".")) || 0);
    void loadPreview(total || 100, depositPercent);
  }, [exampleTotal, depositPercent, loadPreview]);

  async function startOAuth() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/api/mercadopago/oauth/start");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível abrir o Mercado Pago.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erro de rede ao abrir o Mercado Pago.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!window.confirm("Desvincular Mercado Pago? Sinais e clube deixam de cobrar online.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch("/api/mercadopago/disconnect", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Falha ao desvincular.");
        return;
      }
      setMsg("Conta desvinculada.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveDepositSettings(patch: {
    deposit_enabled?: boolean;
    deposit_percent?: number;
    advance_pay_enabled?: boolean;
  }) {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/api/mercadopago/deposit-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }
      setDepositEnabled(Boolean(data.deposit_enabled));
      setDepositPercent(Number(data.deposit_percent) || 30);
      setAdvancePayEnabled(Boolean(data.advance_pay_enabled));
      setMsg("Configuração salva.");
      await load();
    } catch {
      setError("Erro de rede ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={16} /> Carregando pagamentos…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {msg}
        </p>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
            <Wallet className="text-[#64b34d]" size={20} />
            Conta Mercado Pago
          </CardTitle>
          <p className="text-sm font-medium leading-relaxed text-slate-500">
            {status?.tip}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <ChecklistItem ok={!!status?.connected} label="Conta vinculada" />
            <ChecklistItem ok={!!status?.ready_to_charge} label="Pronto para receber" />
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="rounded-2xl bg-slate-900 font-bold text-white hover:bg-[#64b34d]"
              disabled={busy}
              onClick={() => void startOAuth()}
            >
              {busy ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <CreditCard className="mr-2" size={16} />
              )}
              {status?.connected ? "Reconectar Mercado Pago" : "Vincular Mercado Pago"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl font-bold"
              disabled={busy}
              onClick={() => void load()}
            >
              <RefreshCw className="mr-2" size={16} /> Atualizar
            </Button>
            {status?.connected ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-2xl font-bold text-red-600"
                disabled={busy}
                onClick={() => void disconnect()}
              >
                Desvincular
              </Button>
            ) : null}
          </div>

          <a
            href="https://www.mercadopago.com.br/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#64b34d]"
          >
            Abrir Mercado Pago <ExternalLink size={12} />
          </a>
          <p className="text-[11px] leading-relaxed text-slate-400">
            A assinatura dos planos Wagoo continua no Stripe. Sinais e clube usam
            Mercado Pago (taxa Wagoo {status?.wagoo_fee_percent ?? 2}%).
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[28px] border-slate-200 shadow-wg-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-extrabold">Sinal / pagamento adiantado</CardTitle>
          <p className="text-sm text-slate-500">
            Cliente paga na tela Wagoo (PIX). Reserva por{" "}
            {status?.hold_minutes ?? 30} minutos.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold text-slate-700">Exigir sinal</span>
            <input
              type="checkbox"
              checked={depositEnabled}
              disabled={busy || (!status?.ready_to_charge && !depositEnabled)}
              onChange={(e) => {
                const on = e.target.checked;
                setDepositEnabled(on);
                void saveDepositSettings({ deposit_enabled: on });
              }}
            />
          </label>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Percentual do sinal
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                value={depositPercent}
                disabled={busy || !status?.ready_to_charge}
                onChange={(e) => setDepositPercent(Number(e.target.value) || 30)}
                className="h-11 rounded-2xl"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl font-bold"
                disabled={busy || !status?.ready_to_charge}
                onClick={() =>
                  void saveDepositSettings({ deposit_percent: depositPercent })
                }
              >
                Salvar %
              </Button>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold text-slate-700">
              Permitir pagar 100% adiantado (sem sinal obrigatório)
            </span>
            <input
              type="checkbox"
              checked={advancePayEnabled}
              disabled={busy || (!status?.ready_to_charge && !advancePayEnabled) || depositEnabled}
              onChange={(e) => {
                const on = e.target.checked;
                setAdvancePayEnabled(on);
                void saveDepositSettings({ advance_pay_enabled: on });
              }}
            />
          </label>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Simulação (serviço R$)
            </p>
            <Input
              value={exampleTotal}
              onChange={(e) => setExampleTotal(e.target.value)}
              className="mt-2 h-11 rounded-2xl"
            />
            {preview ? (
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  Sinal: <strong>{moneyBrl(preview.deposit_brl)}</strong>
                </p>
                {preview.wagoo ? (
                  <p>
                    Wagoo ({preview.wagoo.percent}%):{" "}
                    {moneyBrl(preview.wagoo.fee_brl)}
                  </p>
                ) : null}
                {preview.stripe?.pix ? (
                  <p>
                    PIX estimado — você recebe ~{" "}
                    {moneyBrl(preview.stripe.pix.shop_receives_brl)}
                  </p>
                ) : null}
                {preview.summary ? (
                  <p className="pt-1 text-xs text-slate-400">{preview.summary}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
