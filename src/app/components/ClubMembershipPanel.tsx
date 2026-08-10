import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type ClubPlan = {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  active: boolean;
  payment_link_url: string | null;
};

type ClubMember = {
  id: string;
  client_name: string;
  client_phone: string;
  status: string;
  current_period_end: string | null;
};

type ClubMe = {
  plan: ClubPlan | null;
  members: ClubMember[];
  client_portal_url: string | null;
  payment_link_url: string | null;
  connect_ready: boolean;
  payments_ready?: boolean;
  provider?: string;
  wagoo_fee_percent: number;
  ledger_balance_brl?: number;
  payout_pix_key?: string | null;
  payout_pix_key_type?: string | null;
};

type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";

function memberStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Ativo";
    case "pending":
      return "Pendente";
    case "past_due":
      return "Em atraso";
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
}

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Configuração do Clube mensal (Asaas — conta Wagoo + saque PIX). */
export function ClubMembershipPanel() {
  const [data, setData] = useState<ClubMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [pixBusy, setPixBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("Clube Ilimitado");
  const [description, setDescription] = useState(
    "Mensalidade com cortes ilimitados neste salão.",
  );
  const [price, setPrice] = useState("149");
  const [active, setActive] = useState(true);
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState<PixKeyType>("CPF");

  const paymentsReady = Boolean(data?.payments_ready ?? data?.connect_ready);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/club/me");
      const body = (await res.json().catch(() => null)) as ClubMe & {
        error?: string;
      };
      if (!res.ok) {
        setError(body?.error || "Não foi possível carregar o clube.");
        return;
      }
      setData(body);
      if (body.plan) {
        setName(body.plan.name);
        setDescription(body.plan.description);
        setPrice(String(body.plan.price_brl));
        setActive(body.plan.active);
      }
      if (body.payout_pix_key) setPixKey(body.payout_pix_key);
      if (body.payout_pix_key_type) {
        setPixType(body.payout_pix_key_type as PixKeyType);
      }
    } catch {
      setError("Erro de rede ao carregar o clube.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/club/me", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price_brl: Number(String(price).replace(",", ".")),
          active,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Não foi possível salvar o clube.");
        return;
      }
      setMsg(active ? "Clube ativo — clientes já podem assinar pelo link." : "Clube desativado.");
      await load();
    } catch {
      setError("Erro de rede ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const savePix = async () => {
    setPixBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/club/me/payout-pix", {
        method: "PUT",
        body: JSON.stringify({
          pix_key: pixKey.trim(),
          pix_key_type: pixType,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Não foi possível salvar a chave PIX.");
        return;
      }
      setMsg("Chave PIX salva. Você já pode sacar o saldo do clube.");
      await load();
    } catch {
      setError("Erro de rede ao salvar PIX.");
    } finally {
      setPixBusy(false);
    }
  };

  const requestPayout = async () => {
    setPayoutBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/club/me/payout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Não foi possível sacar agora.");
        return;
      }
      setMsg(body.message || "Saque enviado.");
      await load();
    } catch {
      setError("Erro de rede ao sacar.");
    } finally {
      setPayoutBusy(false);
    }
  };

  const portalUrl = data?.client_portal_url;
  const balance = Number(data?.ledger_balance_brl || 0);
  const fee = data?.wagoo_fee_percent ?? 2;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-[#64b34d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Sparkles className="text-[#64b34d]" size={20} />
            Clube
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            O cliente paga a mensalidade pelo link. O valor líquido cai no seu saldo aqui — você
            saca para o PIX quando quiser. Taxa Wagoo: {fee}%.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {!paymentsReady && (
            <p className="text-amber-800 text-sm font-medium bg-amber-50 rounded-xl px-4 py-3 leading-relaxed">
              Pagamentos do clube ainda estão em configuração no Wagoo. Você já pode montar o plano;
              a cobrança libera assim que o sistema estiver pronto.
            </p>
          )}

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {active ? "Clube ativo" : "Clube desativado"}
              </p>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
              className="data-[state=checked]:bg-[#64b34d]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nome
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 border-none font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Valor mensal (R$)
              </Label>
              <Input
                type="number"
                min={1}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 border-none font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Descrição
            </Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 rounded-xl bg-slate-50 border-none font-semibold"
            />
          </div>

          <Button
            type="button"
            onClick={() => void save()}
            disabled={saving || !paymentsReady}
            className="h-12 px-6 rounded-xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : "Salvar"}
          </Button>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {msg && (
            <p className="text-emerald-700 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> {msg}
            </p>
          )}
        </CardContent>
      </Card>

      {portalUrl && (
        <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black">Link do cliente</CardTitle>
            <p className="text-sm text-slate-500 font-medium">
              Envie este link para o cliente assinar o clube (WhatsApp + pagamento).
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <code className="block text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl break-all">
              {portalUrl}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
                onClick={() => {
                  void navigator.clipboard.writeText(portalUrl);
                  setMsg("Link copiado.");
                }}
              >
                <Copy size={14} className="mr-1" /> Copiar
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={portalUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} className="mr-1" /> Abrir
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Wallet className="text-[#64b34d]" size={20} />
            Saldo e saque
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Cadastre sua chave PIX uma vez. Quando houver saldo de mensalidades, clique em sacar —
            o dinheiro vai direto, sem esperar o Wagoo.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl bg-[#64b34d]/10 border border-[#64b34d]/20 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Disponível
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{money(balance)}</p>
          </div>

          <div className="grid sm:grid-cols-[1fr_140px] gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Chave PIX
              </Label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="h-11 rounded-xl bg-slate-50 border-none font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tipo
              </Label>
              <select
                value={pixType}
                onChange={(e) => setPixType(e.target.value as PixKeyType)}
                className="h-11 w-full rounded-xl bg-slate-50 border-none font-semibold px-3 text-sm"
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
              onClick={() => void savePix()}
              disabled={pixBusy}
              className="rounded-xl font-bold"
            >
              {pixBusy ? <Loader2 className="animate-spin" size={16} /> : "Salvar PIX"}
            </Button>
            <Button
              type="button"
              onClick={() => void requestPayout()}
              disabled={payoutBusy || balance < 1 || !data?.payout_pix_key}
              className="rounded-xl bg-slate-900 hover:bg-[#64b34d] text-white font-bold"
            >
              {payoutBusy ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                `Sacar ${money(balance)}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Users className="text-[#64b34d]" size={20} />
            Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.members?.length ?? 0) === 0 ? (
            <p className="text-slate-400 text-sm font-medium text-center py-6">
              Nenhum membro ainda.
            </p>
          ) : (
            data!.members.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">{m.client_name}</p>
                  <p className="text-xs text-slate-500 font-medium">{m.client_phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {memberStatusLabel(m.status)}
                  </p>
                  {m.current_period_end && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      até{" "}
                      {new Date(m.current_period_end).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
