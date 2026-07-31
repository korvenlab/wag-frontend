import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Upload,
  Check,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FeedbackFab } from "../components/FeedbackFab";

type BookingService = {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  duration_minutes: number;
  image_url: string | null;
  active: boolean;
};

type BookingAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  client_name: string;
  client_phone: string;
  booking_services?: { name: string; price_brl: number; duration_minutes: number } | null;
};

type SiteProfile = {
  store_name: string | null;
  booking_slug: string | null;
  booking_logo_url: string | null;
  booking_tagline: string | null;
  booking_phone: string | null;
  booking_address: string | null;
  booking_published: boolean;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export function AgendaWebDashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [services, setServices] = useState<BookingService[]>([]);
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [published, setPublished] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("30");
  const [newDuration, setNewDuration] = useState("30");
  const [newImage, setNewImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/booking/me");
      if (res.status === 403) {
        navigate("/dashboard");
        return;
      }
      if (!res.ok) throw new Error("Falha ao carregar");
      const data = await res.json();
      setProfile(data.profile);
      setServices(data.services ?? []);
      setAppointments(data.appointments ?? []);
      setPublicUrl(data.publicUrl);
      setStoreName(data.profile?.store_name ?? "");
      setTagline(data.profile?.booking_tagline ?? "");
      setPhone(data.profile?.booking_phone ?? "");
      setAddress(data.profile?.booking_address ?? "");
      setPublished(!!data.profile?.booking_published);
      setLogoUrl(data.profile?.booking_logo_url ?? null);
    } catch {
      setMsg("Não foi possível carregar a Agenda Web.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSite() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiFetch("/api/booking/me", {
        method: "PATCH",
        body: JSON.stringify({
          store_name: storeName,
          booking_tagline: tagline,
          booking_phone: phone,
          booking_address: address,
          booking_logo_url: logoUrl,
          booking_published: published,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setProfile(data.profile);
      setPublicUrl(data.publicUrl);
      setMsg("Configurações salvas.");
      await refreshProfile({ force: true });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, kind: "logo" | "service") {
    const dataUrl = await fileToDataUrl(file);
    const res = await apiFetch("/api/booking/upload", {
      method: "POST",
      body: JSON.stringify({ dataUrl, kind }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload falhou");
    return data.url as string;
  }

  async function onLogoFile(file: File | null) {
    if (!file) return;
    try {
      const url = await uploadImage(file, "logo");
      setLogoUrl(url);
      setMsg("Logo enviada.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload falhou");
    }
  }

  async function addService() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiFetch("/api/booking/services", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          price_brl: Number(newPrice),
          duration_minutes: Number(newDuration),
          image_url: newImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setServices((s) => [...s, data]);
      setNewName("");
      setNewDesc("");
      setNewPrice("30");
      setNewDuration("30");
      setNewImage(null);
      setMsg("Serviço adicionado.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function removeService(id: string) {
    if (!confirm("Remover este serviço?")) return;
    const res = await apiFetch(`/api/booking/services/${id}`, { method: "DELETE" });
    if (res.ok) setServices((s) => s.filter((x) => x.id !== id));
  }

  async function cancelAppointment(id: string) {
    const res = await apiFetch(`/api/booking/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) {
      setAppointments((list) =>
        list.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#64b34d]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Wagoo" className="h-8 w-auto" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-[#64b34d]">Agenda Web</p>
              <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <LogOut size={16} className="mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {msg ? (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-[#4d8f3b]">
            {msg}
          </div>
        ) : null}

        <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold">Sua página pública</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <code className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl break-all">
                {publicUrl || "Salve o nome da barbearia para gerar o link"}
              </code>
              {publicUrl ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicUrl);
                      setMsg("Link copiado.");
                    }}
                  >
                    <Copy size={14} className="mr-1" /> Copiar
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-1" /> Abrir
                    </a>
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Publicar agenda</p>
                <p className="text-xs text-slate-500">Clientes só agendam se estiver publicado.</p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold">Barbearia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-slate-300" />
                )}
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Logo</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="mt-1"
                  onChange={(e) => void onLogoFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome da barbearia</Label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Slogan</Label>
                <Input value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>WhatsApp / telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void saveSite()}
              disabled={saving}
              className="bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
            >
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
              Salvar configurações
            </Button>
            <p className="text-xs text-slate-500">
              Horário de funcionamento: use o mesmo formato do painel Wagoo (configure após publicar;
              por padrão Seg–Sex 08–12 / 14–18).
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold">Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              {services.map((s) => (
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
                  <Button type="button" variant="ghost" size="icon" onClick={() => void removeService(s.id)}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <p className="text-sm font-bold text-slate-800">Novo serviço</p>
              <div className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input
                  placeholder="Preço (R$)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <Input
                  placeholder="Duração (min)"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                />
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void uploadImage(f, "service")
                      .then(setNewImage)
                      .catch((err) => setMsg(err instanceof Error ? err.message : "Upload falhou"));
                  }}
                />
              </div>
              <Textarea
                placeholder="Descrição"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => void addService()}
                disabled={saving || newName.trim().length < 2}
                className="font-bold"
              >
                <Plus size={16} className="mr-2" /> Adicionar serviço
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-wg-subtle">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold flex items-center gap-2">
              <CalendarDays size={20} className="text-[#64b34d]" /> Próximos agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.filter((a) => a.status === "confirmed").length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum horário marcado ainda.</p>
            ) : (
              appointments
                .filter((a) => a.status === "confirmed")
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{a.client_name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(a.starts_at).toLocaleString("pt-BR")} ·{" "}
                        {a.booking_services?.name || "Serviço"} · {a.client_phone}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => void cancelAppointment(a.id)}>
                      Cancelar
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {!profile ? null : (
          <p className="text-center text-xs text-slate-400 pb-8">
            Slug: {profile.booking_slug || "—"} · Plano Agenda Web R$ 20
          </p>
        )}
      </main>
      <FeedbackFab />
    </div>
  );
}
