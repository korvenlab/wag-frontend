import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Users,
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
  wagoo_fee_percent: number;
};

/** Configuração do Clube mensal (assinatura do cliente via cartão). */
export function ClubMembershipPanel() {
  const [data, setData] = useState<ClubMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("Clube Ilimitado");
  const [description, setDescription] = useState(
    "Mensalidade com cortes ilimitados neste salão.",
  );
  const [price, setPrice] = useState("149");
  const [active, setActive] = useState(true);

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
      setMsg("Clube salvo. Link do cliente e Payment Link atualizados.");
      await load();
    } catch {
      setError("Erro de rede ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const portalUrl = data?.client_portal_url;
  const payLink = data?.payment_link_url || data?.plan?.payment_link_url;

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
            <CreditCard className="text-[#64b34d]" size={20} />
            Clube mensal
          </CardTitle>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Cliente paga todo mês no cartão e usa o salão. Taxa Wagoo:{" "}
            {data?.wagoo_fee_percent ?? 2}% sobre a mensalidade. Link da loja:{" "}
            <code className="text-xs">/a/seu-slug/cliente</code>
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {!data?.connect_ready && (
            <p className="text-amber-700 text-sm font-bold bg-amber-50 rounded-xl px-4 py-3">
              Conecte a conta em Pagamentos e termine o cadastro Stripe antes de
              ativar o clube.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nome do clube
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

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <p className="font-bold text-slate-800 text-sm">Clube ativo</p>
              <p className="text-xs text-slate-500 font-medium">
                Aparece em /a/…/cliente quando ligado
              </p>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
              className="data-[state=checked]:bg-[#64b34d]"
            />
          </div>

          <Button
            type="button"
            onClick={() => void save()}
            disabled={saving || !data?.connect_ready}
            className="h-12 px-6 rounded-xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : "Salvar e gerar links"}
          </Button>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {msg && (
            <p className="text-emerald-700 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> {msg}
            </p>
          )}
        </CardContent>
      </Card>

      {(portalUrl || payLink) && (
        <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-black">Links do clube</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {portalUrl && (
              <div className="rounded-2xl border-2 border-[#64b34d]/30 bg-[#64b34d]/5 p-5 space-y-3">
                <p className="text-sm font-black text-slate-900">
                  Página do cliente (marque no Instagram / WhatsApp)
                </p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  O cliente confirma o número com um código enviado no WhatsApp do salão
                  (zap precisa estar conectado). Assim ninguém usa o WhatsApp de outra
                  pessoa para ver o clube ou pular o sinal.
                </p>
                <code className="block text-xs font-bold text-slate-700 bg-white/80 px-3 py-2 rounded-xl break-all">
                  {portalUrl}
                </code>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
                    onClick={() => {
                      void navigator.clipboard.writeText(portalUrl);
                      setMsg("Link do cliente copiado.");
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
              </div>
            )}
            {payLink && (
              <div className="rounded-2xl border border-slate-200 p-5 space-y-2">
                <p className="text-sm font-black text-slate-900">
                  Payment Link Stripe (só pagamento)
                </p>
                <code className="block text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl break-all">
                  {payLink}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(payLink);
                    setMsg("Payment Link copiado.");
                  }}
                >
                  <Copy size={14} className="mr-1" /> Copiar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                    {m.status}
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
