import { useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  CalendarDays,
  CalendarCheck,
  Eye,
  CreditCard,
} from "lucide-react";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  WorkingHoursEditor,
  createDefaultWorkingHours,
  hasAnyOpenWindow,
  normalizeWorkingHours,
  type WorkingHoursMap,
} from "./WorkingHoursEditor";

export type PublishMissing = "store_name" | "services" | "working_hours";

type BookingService = {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  duration_minutes: number;
  image_url: string | null;
  active: boolean;
};

type BookingProvider = {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string;
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
  booking_providers?: { id: string; name: string } | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

const MISSING_SECTION: Record<PublishMissing, string> = {
  store_name: "negocio",
  services: "servicos",
  working_hours: "horarios",
};

export type AgendaWebSection =
  | "overview"
  | "negocio"
  | "horarios"
  | "servicos"
  | "profissionais"
  | "agendamentos"
  | "pagamentos"
  | "clube"
  | "whatsapp"
  | "google";

export type AgendaWebSettingsHandle = {
  saveAll: () => Promise<boolean>;
  saving: boolean;
};

type AgendaWebSettingsPanelProps = {
  /** Compacto quando embutido no dashboard IA */
  embedded?: boolean;
  /**
   * Seção do menu. Sem valor (ou `"all"`) mostra tudo — usado no painel IA embutido.
   */
  section?: AgendaWebSection | "all";
  onProfileSaved?: () => void;
  /** Checklist / atalhos para outra seção do menu */
  onNavigateSection?: (section: AgendaWebSection) => void;
  /** Notifica o pai (barra do topo) sobre salvamento / o que falta */
  onSaveStateChange?: (state: {
    saving: boolean;
    dirty: boolean;
    missing: string[];
  }) => void;
  /** Esconde a barra sticky interna (quando o pai já tem o botão no topo) */
  hideStickySaveBar?: boolean;
};

export const AgendaWebSettingsPanel = forwardRef<
  AgendaWebSettingsHandle,
  AgendaWebSettingsPanelProps
>(function AgendaWebSettingsPanel(
  {
    embedded = false,
    section = "all",
    onProfileSaved,
    onNavigateSection,
    onSaveStateChange,
    hideStickySaveBar = false,
  },
  ref,
) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [published, setPublished] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [agendaUrl, setAgendaUrl] = useState<string | null>(null);
  const [clientUrl, setClientUrl] = useState<string | null>(null);

  const [workingHours, setWorkingHours] = useState<WorkingHoursMap>(createDefaultWorkingHours);
  const [selectedDay, setSelectedDay] = useState("Segunda-feira");

  const [services, setServices] = useState<BookingService[]>([]);
  const [providers, setProviders] = useState<BookingProvider[]>([]);
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);

  const [missing, setMissing] = useState<PublishMissing[]>([]);
  const [missingMessages, setMissingMessages] = useState<string[]>([]);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);

  const [provName, setProvName] = useState("");
  const [provBio, setProvBio] = useState("");
  const [provPhoto, setProvPhoto] = useState<string | null>(null);
  const [pendingDeleteService, setPendingDeleteService] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [pendingDeleteProvider, setPendingDeleteProvider] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const localMissing = useMemo(() => {
    const m: PublishMissing[] = [];
    if (storeName.trim().length < 2) m.push("store_name");
    if (services.filter((s) => s.active !== false).length < 1) m.push("services");
    if (!hasAnyOpenWindow(workingHours)) m.push("working_hours");
    return m;
  }, [storeName, services, workingHours]);

  const checklist = useMemo(
    () =>
      localMissing.map((k) =>
        k === "store_name"
          ? "Falta o nome do negócio"
          : k === "services"
            ? "Falta adicionar pelo menos 1 serviço"
            : "Falta definir horário de funcionamento (ative manhã/tarde/noite em algum dia)",
      ),
    [localMissing],
  );

  const canPublish = checklist.length === 0;

  const show = (id: AgendaWebSection) => section === "all" || section === id;

  const scrollToSection = (id: string) => {
    document.getElementById(`aw-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goSection = (id: AgendaWebSection) => {
    if (onNavigateSection) {
      onNavigateSection(id);
      return;
    }
    const map: Record<AgendaWebSection, string> = {
      overview: "links",
      negocio: "negocio",
      horarios: "horarios",
      servicos: "servicos",
      profissionais: "profissionais",
      agendamentos: "agendamentos",
      pagamentos: "links",
      clube: "links",
      whatsapp: "links",
      google: "links",
    };
    scrollToSection(map[id]);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/booking/me");
      if (!res.ok) throw new Error("Falha ao carregar");
      const data = await res.json();
      setStoreName(data.profile?.store_name ?? "");
      setTagline(data.profile?.booking_tagline ?? "");
      setPhone(data.profile?.booking_phone ?? "");
      setAddress(data.profile?.booking_address ?? "");
      setPublished(!!data.profile?.booking_published);
      setLogoUrl(data.profile?.booking_logo_url ?? null);
      setCoverUrl(data.profile?.booking_cover_url ?? null);
      setSlug(data.profile?.booking_slug ?? null);
      setPublicUrl(data.publicUrl ?? null);
      setAgendaUrl(data.agendaUrl ?? null);
      setClientUrl(data.clientUrl ?? null);
      setWorkingHours(normalizeWorkingHours(data.profile?.working_hours));
      setServices(data.services ?? []);
      setProviders(data.providers ?? []);
      setAppointments(data.appointments ?? []);
      setMissing((data.missing as PublishMissing[]) ?? []);
      setMissingMessages(data.missingMessages ?? []);
      setDirty(false);
    } catch {
      setErrorBanner("Não foi possível carregar a Agenda Web.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onSaveStateChange?.({ saving, dirty, missing: checklist });
  }, [saving, dirty, checklist, onSaveStateChange]);

  const markDirty = useCallback(() => setDirty(true), []);

  async function uploadImage(file: File, kind: "logo" | "cover" | "service" | "provider") {
    const dataUrl = await fileToDataUrl(file);
    const res = await apiFetch("/api/booking/upload", {
      method: "POST",
      body: JSON.stringify({ dataUrl, kind }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload falhou");
    return data.url as string;
  }

  async function saveSite(opts?: { forcePublish?: boolean }): Promise<boolean> {
    setSaving(true);
    setMsg(null);
    setErrorBanner(null);
    const wantPublish = opts?.forcePublish ?? published;

    if (wantPublish && !canPublish) {
      setErrorBanner(
        `Não deu para publicar. Ainda falta: ${checklist.join("; ")}.`,
      );
      setPublished(false);
      setSaving(false);
      const first = localMissing[0] || missing[0];
      if (first) scrollToSection(MISSING_SECTION[first]);
      return false;
    }

    try {
      const res = await apiFetch("/api/booking/me", {
        method: "PATCH",
        body: JSON.stringify({
          store_name: storeName,
          booking_tagline: tagline,
          booking_phone: phone,
          booking_address: address,
          booking_logo_url: logoUrl,
          booking_cover_url: coverUrl,
          booking_published: wantPublish,
          working_hours: workingHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: string[] = data.missingMessages ?? [];
        setMissing(data.missing ?? []);
        setMissingMessages(msgs);
        setErrorBanner(
          data.error ||
            (msgs.length
              ? `Não deu para publicar. Ainda falta: ${msgs.join("; ")}.`
              : "Erro ao salvar"),
        );
        if (data.missing?.[0]) scrollToSection(MISSING_SECTION[data.missing[0] as PublishMissing]);
        setPublished(false);
        return false;
      }
      setPublished(!!data.profile?.booking_published);
      setSlug(data.profile?.booking_slug ?? null);
      setPublicUrl(data.publicUrl ?? null);
      setAgendaUrl(data.agendaUrl ?? null);
      setClientUrl(data.clientUrl ?? null);
      setMissing(data.missing ?? []);
      setMissingMessages(data.missingMessages ?? []);
      if (data.profile?.working_hours) {
        setWorkingHours(normalizeWorkingHours(data.profile.working_hours));
      }
      setDirty(false);
      setMsg("Tudo salvo: negócio, horários e imagens.");
      onProfileSaved?.();
      return true;
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : "Erro ao salvar");
      return false;
    } finally {
      setSaving(false);
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      saveAll: () => saveSite(),
      saving,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- saveSite fecha sobre estado atual
    [saving, storeName, tagline, phone, address, logoUrl, coverUrl, published, workingHours, canPublish, checklist],
  );

  async function addService() {
    if (newName.trim().length < 2) {
      setErrorBanner("Falta o nome do serviço.");
      scrollToSection("servicos");
      return;
    }
    if (!newPrice.trim()) {
      setErrorBanner("Falta o preço do serviço (R$).");
      scrollToSection("servicos");
      return;
    }
    if (!newDuration.trim()) {
      setErrorBanner("Falta a duração do serviço (em minutos).");
      scrollToSection("servicos");
      return;
    }
    setSaving(true);
    setErrorBanner(null);
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
      if (!res.ok) throw new Error(data.error || "Erro");
      setServices((s) => [...s, data]);
      setNewName("");
      setNewDesc("");
      setNewPrice("");
      setNewDuration("");
      setNewImage(null);
      setMsg("Serviço adicionado.");
      await load();
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemoveService() {
    if (!pendingDeleteService) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/booking/services/${pendingDeleteService.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setServices((s) => s.filter((x) => x.id !== pendingDeleteService.id));
        setPendingDeleteService(null);
        await load();
      }
    } finally {
      setDeleting(false);
    }
  }

  async function addProvider() {
    if (provName.trim().length < 2) {
      setErrorBanner("Falta o nome do profissional.");
      scrollToSection("profissionais");
      return;
    }
    setSaving(true);
    setErrorBanner(null);
    try {
      const res = await apiFetch("/api/booking/providers", {
        method: "POST",
        body: JSON.stringify({
          name: provName,
          bio: provBio,
          photo_url: provPhoto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setProviders((p) => [...p, data]);
      setProvName("");
      setProvBio("");
      setProvPhoto(null);
      setMsg("Profissional adicionado.");
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemoveProvider() {
    if (!pendingDeleteProvider) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/booking/providers/${pendingDeleteProvider.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProviders((p) => p.filter((x) => x.id !== pendingDeleteProvider.id));
        setPendingDeleteProvider(null);
      }
    } finally {
      setDeleting(false);
    }
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#64b34d]" size={32} />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${embedded ? "" : ""}`}>
      {!hideStickySaveBar ? (
        <div
          className={
            "rounded-2xl border bg-white px-4 py-3 shadow-wg-subtle " +
            (embedded
              ? "sticky top-2 z-20"
              : "sticky top-[4.25rem] z-20") +
            (checklist.length > 0
              ? " border-red-200"
              : dirty
                ? " border-amber-200"
                : " border-slate-200")
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-bold text-slate-900">
                {dirty
                  ? "Há alterações não salvas"
                  : "Nome, horários e imagens"}
              </p>
              {checklist.length > 0 ? (
                <ul className="space-y-0.5">
                  {checklist.map((m) => (
                    <li key={m} className="text-sm font-semibold text-red-600">
                      • {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-medium text-slate-500">
                  Tudo certo para publicar. Serviços e profissionais salvam ao adicionar.
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={() => void saveSite()}
              disabled={saving}
              className="shrink-0 bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Save className="mr-2" size={16} />
              )}
              Salvar tudo
            </Button>
          </div>
        </div>
      ) : null}

      {errorBanner ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex gap-3 items-start">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p>{errorBanner}</p>
            {checklist.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {checklist.map((m) => (
                  <li key={m} className="text-red-600">• {m}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      {msg ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-[#4d8f3b]">
          {msg}
        </div>
      ) : null}

      {/* Checklist + links */}
      {show("overview") ? (
      <Card id="aw-links" className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold">Início · Publicar e links</CardTitle>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Complete a checklist, publique e compartilhe os links certos com cada pessoa.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Checklist para publicar
            </p>
            {(
              [
                ["store_name", "Nome do negócio", "negocio" as AgendaWebSection],
                ["services", "Pelo menos 1 serviço", "servicos" as AgendaWebSection],
                ["working_hours", "Horário de funcionamento", "horarios" as AgendaWebSection],
              ] as const
            ).map(([key, label, target]) => {
              const ok = !localMissing.includes(key) && !missing.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => goSection(target)}
                  className="w-full flex items-center gap-3 text-left text-sm font-semibold"
                >
                  {ok ? (
                    <CheckCircle2 className="text-[#64b34d] shrink-0" size={18} />
                  ) : (
                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                  )}
                  <span className={ok ? "text-slate-700" : "text-amber-800"}>
                    {ok ? label : `Falta: ${label.toLowerCase()}`}
                  </span>
                  <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Ir →
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Publicar agenda</p>
              <p className="text-xs text-slate-500">
                {canPublish
                  ? "Tudo certo — os links abaixo ficam ativos para o cliente."
                  : "Complete a checklist acima para liberar a publicação."}
              </p>
            </div>
            <Switch
              checked={published}
              onCheckedChange={(v) => {
                setPublished(v);
                if (v) void saveSite({ forcePublish: true });
                else void saveSite({ forcePublish: false });
              }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border-2 border-[#64b34d]/30 bg-[#64b34d]/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#64b34d] text-white flex items-center justify-center">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Link para agendar</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#4d8f3b]">
                    Use este no Instagram / WhatsApp
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Página completa da sua loja. O cliente escolhe serviço, profissional, data e
                horário — e confirma o agendamento.
              </p>
              <code className="block text-xs font-bold text-slate-700 bg-white/80 border border-slate-100 px-3 py-2 rounded-xl break-all">
                {publicUrl || (slug ? `/a/${slug}` : "Salve o nome do negócio para gerar")}
              </code>
              {publicUrl ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-bold"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicUrl);
                      setMsg("Link de agendamento copiado.");
                    }}
                  >
                    <Copy size={14} className="mr-1" /> Copiar link
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-1" /> Abrir página
                    </a>
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Link só para ver a agenda</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Consulta · não marca horário
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Mostra o que está livre ou ocupado. Útil para a equipe ou para o cliente só
                olhar disponibilidade — <strong className="font-bold text-slate-800">não agenda</strong>.
              </p>
              <code className="block text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl break-all">
                {agendaUrl || (slug ? `/a/${slug}/agenda` : "Disponível após salvar o negócio")}
              </code>
              {agendaUrl ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(agendaUrl);
                      setMsg("Link da agenda (consulta) copiado.");
                    }}
                  >
                    <Copy size={14} className="mr-1" /> Copiar
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={agendaUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} className="mr-1" /> Abrir
                    </a>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Link do clube</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Para o cliente
                </p>
              </div>
            </div>
            <code className="block text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl break-all">
              {clientUrl || "Salve o negócio para gerar o link"}
            </code>
            {clientUrl ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(clientUrl);
                    setMsg("Link do clube copiado.");
                  }}
                >
                  <Copy size={14} className="mr-1" /> Copiar
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={clientUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} className="mr-1" /> Abrir
                  </a>
                </Button>
                {onNavigateSection ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateSection("clube")}
                  >
                    Abrir Clube
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 flex items-start gap-3 text-sm text-slate-500 font-medium">
            <Link2 className="shrink-0 mt-0.5 text-slate-400" size={16} />
            <p>
              Dica: no bio do Instagram e no status do WhatsApp, use o{" "}
              <strong className="text-slate-800 font-bold">link de agendar</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {show("negocio") ? (
      <Card id="aw-negocio" className="rounded-3xl border-slate-200 shadow-wg-subtle scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold">Seu negócio</CardTitle>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Nome, capa, logo e contatos que aparecem na página pública.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Capa da página pública (opcional)
              </Label>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Foto de fundo do hero — como na vitrine da barbearia. Recomendado: horizontal, ~1200px.
              </p>
              <div className="relative h-36 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                {coverUrl ? (
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Upload size={28} />
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="mt-2"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  void uploadImage(f, "cover")
                    .then((url) => {
                      setCoverUrl(url);
                      markDirty();
                      setMsg("Capa enviada. Clique em Salvar tudo no topo para aplicar.");
                    })
                    .catch((err) =>
                      setErrorBanner(err instanceof Error ? err.message : "Upload falhou"),
                    );
                }}
              />
              {coverUrl ? (
                <button
                  type="button"
                  className="text-xs text-red-600 font-semibold mt-1"
                  onClick={() => {
                    setCoverUrl(null);
                    markDirty();
                  }}
                >
                  Remover capa
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-slate-300" />
                )}
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Logo (opcional)
                </Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="mt-1"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void uploadImage(f, "logo")
                      .then((url) => {
                        setLogoUrl(url);
                        markDirty();
                        setMsg("Logo enviada. Clique em Salvar tudo no topo para aplicar.");
                      })
                      .catch((err) =>
                        setErrorBanner(err instanceof Error ? err.message : "Upload falhou"),
                      );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do negócio</Label>
              <Input
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  markDirty();
                }}
                placeholder="Ex.: Barbearia Norte"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slogan (opcional)</Label>
              <Input
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  markDirty();
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>WhatsApp / telefone (opcional)</Label>
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  markDirty();
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Endereço (opcional)</Label>
              <Input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  markDirty();
                }}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Use <span className="font-bold text-slate-700">Salvar tudo</span> no topo para gravar nome, contatos e imagens.
          </p>
        </CardContent>
      </Card>
      ) : null}

      {show("horarios") ? (
      <Card id="aw-horarios" className="rounded-3xl border-slate-200 shadow-wg-subtle scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <Clock size={20} className="text-[#64b34d]" />
            Horário de funcionamento
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Dias e turnos em que o cliente pode marcar horário.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <WorkingHoursEditor
            value={workingHours}
            onChange={(next) => {
              setWorkingHours(next);
              markDirty();
            }}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            compact={embedded}
          />
          <p className="text-xs font-medium text-slate-500">
            Use <span className="font-bold text-slate-700">Salvar tudo</span> no topo para gravar os horários.
          </p>
        </CardContent>
      </Card>
      ) : null}

      {show("servicos") ? (
      <Card id="aw-servicos" className="rounded-3xl border-slate-200 shadow-wg-subtle scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold">Serviços</CardTitle>
          <p className="text-sm text-slate-500 font-medium mt-1">
            O que o cliente escolhe ao agendar (nome, preço e duração).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {services.length === 0 ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 font-medium">
              Ainda não há serviços. Adicione o primeiro abaixo — sem isso não dá para publicar.
            </p>
          ) : (
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPendingDeleteService({ id: s.id, name: s.name })}
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
                  Nome do serviço
                </Label>
                <Input
                  placeholder="Ex.: Corte, Manicure"
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
                    void uploadImage(f, "service")
                      .then(setNewImage)
                      .catch((err) =>
                        setErrorBanner(err instanceof Error ? err.message : "Upload falhou"),
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
                placeholder="O que o cliente vê ao escolher"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={() => void addService()}
              disabled={saving}
              className="font-bold"
            >
              <Plus size={16} className="mr-2" /> Adicionar serviço
            </Button>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {show("profissionais") ? (
      <Card id="aw-profissionais" className="rounded-3xl border-slate-200 shadow-wg-subtle scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <Users size={20} className="text-[#64b34d]" />
            Profissionais
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Quem atende. O cliente escolhe no link — sem limite e sem login próprio.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {providers.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum profissional ainda. Opcional: sem lista, o cliente agenda sem preferência.
            </p>
          ) : (
            <div className="grid gap-3">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden shrink-0">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">
                        {p.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    {p.bio ? <p className="text-xs text-slate-500 truncate">{p.bio}</p> : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPendingDeleteProvider({ id: p.id, name: p.name })}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-slate-200 p-4 space-y-4 bg-slate-50/50">
            <p className="text-sm font-bold text-slate-800">Adicionar profissional</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nome
                </Label>
                <Input
                  placeholder="Ex.: João, Ana"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
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
                    void uploadImage(f, "provider")
                      .then(setProvPhoto)
                      .catch((err) =>
                        setErrorBanner(err instanceof Error ? err.message : "Upload falhou"),
                      );
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Bio (opcional)
              </Label>
              <Input
                placeholder="Especialidade ou frase curta"
                value={provBio}
                onChange={(e) => setProvBio(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={() => void addProvider()}
              disabled={saving}
              className="font-bold"
            >
              <Plus size={16} className="mr-2" /> Adicionar profissional
            </Button>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {show("agendamentos") ? (
      <Card id="aw-agendamentos" className="rounded-3xl border-slate-200 shadow-wg-subtle">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <CalendarDays size={20} className="text-[#64b34d]" /> Próximos agendamentos
          </CardTitle>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Horários marcados pelo link público. Você pode cancelar daqui.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments.filter((a) => a.status === "confirmed" || a.status === "pending_payment")
            .length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum horário marcado ainda.</p>
          ) : (
            appointments
              .filter((a) => a.status === "confirmed" || a.status === "pending_payment")
              .map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {a.client_name}
                      {a.status === "pending_payment" ? (
                        <span className="ml-2 text-[10px] uppercase tracking-wider font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Aguardando sinal
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(a.starts_at).toLocaleString("pt-BR")} ·{" "}
                      {a.booking_services?.name || "Serviço"}
                      {a.booking_providers?.name ? ` · ${a.booking_providers.name}` : ""} ·{" "}
                      {a.client_phone}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void cancelAppointment(a.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              ))
          )}
        </CardContent>
      </Card>
      ) : null}

      <AlertDialog
        open={pendingDeleteService !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDeleteService(null);
        }}
      >
        <AlertDialogContent className="rounded-[24px] border-none shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-slate-900">
              Remover serviço?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 leading-relaxed">
              {pendingDeleteService ? (
                <>
                  <span className="font-bold text-slate-700">{pendingDeleteService.name}</span>{" "}
                  sai da lista do link de agendamento.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold" disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 font-black"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmRemoveService();
              }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDeleteProvider !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDeleteProvider(null);
        }}
      >
        <AlertDialogContent className="rounded-[24px] border-none shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-slate-900">
              Remover profissional?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 leading-relaxed">
              {pendingDeleteProvider ? (
                <>
                  <span className="font-bold text-slate-700">{pendingDeleteProvider.name}</span>{" "}
                  sai da equipe da Agenda Web.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold" disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 font-black"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmRemoveProvider();
              }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
