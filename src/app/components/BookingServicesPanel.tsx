import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type BookingService = {
  id: string;
  name: string;
  description?: string;
  price_brl: number;
  duration_minutes: number;
  image_url?: string | null;
  active?: boolean;
};

type BookingServicesPanelProps = {
  /** Texto curto sob o título — o que configurar / para que serve */
  subtitle?: string;
};

/**
 * Cadastro de serviços (booking_services) — usado na Agenda Web e nos planos com IA.
 */
export function BookingServicesPanel({
  subtitle = "Único lugar para cadastrar o que você oferece, com preço e duração. A IA usa essa lista no WhatsApp (valores e, se o sinal estiver ligado, cobrança).",
}: BookingServicesPanelProps) {
  const [services, setServices] = useState<BookingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/booking/me");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Não foi possível carregar os serviços.");
        return;
      }
      setServices(data.services ?? []);
      setError(null);
    } catch {
      setError("Erro de rede ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadServiceImage(file: File) {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Falha ao ler imagem"));
      reader.readAsDataURL(file);
    });
    const res = await apiFetch("/api/booking/upload", {
      method: "POST",
      body: JSON.stringify({ dataUrl, kind: "service" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || "Upload falhou");
    return String(data.url);
  }

  async function addService() {
    if (newName.trim().length < 2) {
      setError("Informe o nome do serviço.");
      return;
    }
    if (!newPrice.trim()) {
      setError("Informe o preço (R$).");
      return;
    }
    if (!newDuration.trim()) {
      setError("Informe a duração (minutos).");
      return;
    }
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/booking/services", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          price_brl: Number(newPrice) || 0,
          duration_minutes: Number(newDuration) || 30,
          image_url: newImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adicionar");
      setServices((s) => [...s, data]);
      setNewName("");
      setNewDesc("");
      setNewPrice("");
      setNewDuration("");
      setNewImage(null);
      setMsg("Serviço adicionado.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao adicionar");
    } finally {
      setSaving(false);
    }
  }

  async function removeService(id: string) {
    if (!confirm("Remover este serviço?")) return;
    const res = await apiFetch(`/api/booking/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((s) => s.filter((x) => x.id !== id));
      setMsg("Serviço removido.");
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
    <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold">Serviços</CardTitle>
        <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{subtitle}</p>
        <ul className="text-xs text-slate-500 font-medium space-y-1 mt-3">
          <li>
            <strong className="text-slate-700">Se não cadastrar:</strong> a IA não tem lista clara de
            preços para passar ao cliente.
          </li>
          <li>
            <strong className="text-slate-700">Se cadastrar:</strong> a IA informa os valores no
            WhatsApp; com o sinal ligado, também cobra com base nesse preço.
          </li>
        </ul>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {services.filter((s) => s.active !== false).length === 0 ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 font-medium">
            Ainda não há serviços. Adicione o primeiro abaixo.
          </p>
        ) : (
          <div className="grid gap-3">
            {services
              .filter((s) => s.active !== false)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {s.image_url ? (
                      <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.duration_minutes} min · R$ {Number(s.price_brl).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void removeService(s.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-slate-200 p-4 space-y-4 bg-slate-50/50">
          <p className="text-sm font-bold text-slate-800">Adicionar serviço</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nome
              </Label>
              <Input
                placeholder="Ex.: Corte"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Preço (R$)
              </Label>
              <Input
                placeholder="Ex.: 50"
                inputMode="decimal"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Duração (minutos)
              </Label>
              <Input
                placeholder="Ex.: 30"
                inputMode="numeric"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Foto (opcional)
              </Label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  void uploadServiceImage(f)
                    .then(setNewImage)
                    .catch((err) =>
                      setError(err instanceof Error ? err.message : "Upload falhou"),
                    );
                }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Descrição (opcional)
            </Label>
            <Textarea
              placeholder="Detalhe curto do serviço"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => void addService()}
            disabled={saving}
            className="font-bold bg-[#64b34d] hover:bg-[#58a344] text-white"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
