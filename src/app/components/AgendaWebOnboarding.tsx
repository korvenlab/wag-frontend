import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { apiFetch } from "../lib/apiFetch";
import {
  WorkingHoursEditor,
  createDefaultWorkingHours,
  hasAnyOpenWindow,
  normalizeWorkingHours,
  type WorkingHoursMap,
} from "./WorkingHoursEditor";

const DONE_KEY_PREFIX = "wagoo_agenda_web_onboarding_done_";

type Step = 0 | 1 | 2 | 3 | 4;

export function agendaWebOnboardingDoneKey(userId: string) {
  return `${DONE_KEY_PREFIX}${userId}`;
}

export function hasCompletedAgendaWebOnboarding(userId: string): boolean {
  try {
    return localStorage.getItem(agendaWebOnboardingDoneKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markAgendaWebOnboardingDone(userId: string) {
  try {
    localStorage.setItem(agendaWebOnboardingDoneKey(userId), "1");
  } catch {
    /* ignore */
  }
}

type AgendaWebOnboardingProps = {
  onComplete: () => void;
};

export function AgendaWebOnboarding({ onComplete }: AgendaWebOnboardingProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");

  const [workingHours, setWorkingHours] = useState<WorkingHoursMap>(createDefaultWorkingHours);
  const [selectedDay, setSelectedDay] = useState("Segunda-feira");

  const [published, setPublished] = useState(true);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const finish = useCallback(() => {
    if (user?.id) markAgendaWebOnboardingDone(user.id);
    void refreshProfile({ force: true });
    onComplete();
  }, [user?.id, refreshProfile, onComplete]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch("/api/booking/me");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const name = String(data.profile?.store_name || "").trim();
        const services = Array.isArray(data.services) ? data.services : [];
        const hours = normalizeWorkingHours(data.profile?.working_hours);
        setWorkingHours(hours);
        if (name && (services.length > 0 || data.profile?.booking_published)) {
          if (user?.id) markAgendaWebOnboardingDone(user.id);
          onComplete();
          return;
        }
        if (name) setStoreName(name);
        if (data.profile?.booking_tagline) setTagline(String(data.profile.booking_tagline));
        if (data.profile?.booking_phone) setPhone(String(data.profile.booking_phone));
        if (data.publicUrl) setPublicUrl(String(data.publicUrl));
        if (typeof data.profile?.booking_published === "boolean") {
          setPublished(!!data.profile.booking_published);
        }
      } catch {
        /* segue o wizard */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, onComplete]);

  const saveBusiness = async () => {
    const name = storeName.trim();
    if (name.length < 2) {
      setError("Informe o nome do seu negócio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/booking/me", {
        method: "PATCH",
        body: JSON.stringify({
          store_name: name,
          booking_tagline: tagline.trim() || null,
          booking_phone: phone.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      if (data.publicUrl) setPublicUrl(String(data.publicUrl));
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const saveService = async () => {
    const name = serviceName.trim();
    if (name.length < 2) {
      setError("Informe o nome do serviço.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/booking/services", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: "",
          price_brl: Number(servicePrice) || 0,
          duration_minutes: Number(serviceDuration) || 30,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o serviço.");
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar serviço.");
    } finally {
      setSaving(false);
    }
  };

  const saveHours = async () => {
    if (!hasAnyOpenWindow(workingHours)) {
      setError("Ative pelo menos um turno em algum dia.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/booking/me", {
        method: "PATCH",
        body: JSON.stringify({ working_hours: workingHours }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar os horários.");
      if (data.profile?.working_hours) {
        setWorkingHours(normalizeWorkingHours(data.profile.working_hours));
      }
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar horários.");
    } finally {
      setSaving(false);
    }
  };

  const publishAndFinish = async () => {
    if (published && !hasAnyOpenWindow(workingHours)) {
      setError("Defina horários abertos antes de publicar.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/booking/me", {
        method: "PATCH",
        body: JSON.stringify({
          store_name: storeName.trim(),
          booking_published: published,
          working_hours: workingHours,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível publicar.");
      if (data.publicUrl) setPublicUrl(String(data.publicUrl));
      finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao publicar.");
    } finally {
      setSaving(false);
    }
  };

  const titles: Record<Step, { title: string; subtitle: string }> = {
    0: {
      title: "Bem-vindo à Agenda Web",
      subtitle: "Seu cliente marca horário pelo link público da sua agenda.",
    },
    1: {
      title: "Dados do seu negócio",
      subtitle: "Nome, contato e o que aparece na página pública.",
    },
    2: {
      title: "Primeiro serviço",
      subtitle: "Preço e duração que o cliente vê ao marcar horário.",
    },
    3: {
      title: "Horário de funcionamento",
      subtitle: "Só entram no link os dias e turnos que você deixar abertos.",
    },
    4: {
      title: "Publique e compartilhe",
      subtitle: "Com o link no ar, qualquer pessoa pode agendar.",
    },
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" strokeWidth={2.5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-[32px] shadow-wg-elevated border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] px-8 py-9 text-white text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Link2 className="w-3.5 h-3.5" />
              Agenda Web · setup
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-black tracking-tight">{titles[step].title}</h1>
                <p className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
                  {titles[step].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-2">
              {([0, 1, 2, 3, 4] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step
                      ? "w-8 bg-white"
                      : s < step
                        ? "w-4 bg-white/70"
                        : "w-4 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-8 min-h-[280px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <ul className="space-y-3">
                    {[
                      "Você monta a página: logo, serviços e preços.",
                      "Define os horários de funcionamento (manhã, tarde, noite).",
                      "O cliente abre o link, escolhe serviço, data e horário.",
                      "Os agendamentos ficam no painel — e na Google Agenda, se você conectar.",
                      "Opcional: WhatsApp da loja para confirmação e lembretes.",
                    ].map((text) => (
                      <li
                        key={text}
                        className="flex gap-3 items-start text-sm font-medium text-slate-600 leading-snug"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#64b34d] shrink-0 mt-0.5" />
                        {text}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full h-12 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                  >
                    Configurar minha página
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <button
                    type="button"
                    onClick={finish}
                    className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Pular e ir ao painel
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                        Nome do negócio
                      </Label>
                      <Input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Ex.: Studio Ana, Barbearia Norte…"
                        className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                        Slogan (opcional)
                      </Label>
                      <Input
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Uma frase curta na página"
                        className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                        WhatsApp / telefone (opcional)
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Para o cliente falar com você"
                        className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                      />
                    </div>
                  </div>
                  {error ? (
                    <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  ) : null}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setStep(0);
                      }}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveBusiness()}
                      className="h-12 rounded-2xl flex-[2] bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                    >
                      {saving ? <Loader2 className="animate-spin" /> : "Continuar"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                        Nome do serviço
                      </Label>
                      <Input
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Ex.: Corte, Consulta, Manicure…"
                        className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Preço em reais (R$)
                        </Label>
                        <Input
                          value={servicePrice}
                          onChange={(e) => setServicePrice(e.target.value)}
                          inputMode="decimal"
                          placeholder="Ex.: 50"
                          className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Duração em minutos
                        </Label>
                        <Input
                          value={serviceDuration}
                          onChange={(e) => setServiceDuration(e.target.value)}
                          inputMode="numeric"
                          placeholder="Ex.: 30"
                          className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  {error ? (
                    <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  ) : null}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setStep(1);
                      }}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveService()}
                      className="h-12 rounded-2xl flex-[2] bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(3);
                    }}
                    className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Adicionar serviços depois
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <WorkingHoursEditor
                    value={workingHours}
                    onChange={setWorkingHours}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    compact
                  />
                  {error ? (
                    <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  ) : null}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setStep(2);
                      }}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveHours()}
                      className="h-12 rounded-2xl flex-[2] bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
                    >
                      {saving ? <Loader2 className="animate-spin" /> : "Continuar"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="s4"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Publicar agora</p>
                      <p className="text-xs text-slate-500">
                        Com a agenda publicada, o link aceita novos horários.
                      </p>
                    </div>
                    <Switch checked={published} onCheckedChange={setPublished} />
                  </div>

                  {publicUrl ? (
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Seu link
                      </p>
                      <code className="block text-sm font-bold text-slate-700 break-all">
                        {publicUrl}
                      </code>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void navigator.clipboard.writeText(publicUrl);
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 1600);
                          }}
                        >
                          <Copy size={14} className="mr-1" />
                          {copied ? "Copiado" : "Copiar"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" asChild>
                          <a href={publicUrl} target="_blank" rel="noreferrer">
                            <ExternalLink size={14} className="mr-1" /> Abrir
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 font-medium">
                      O link completo aparece após publicar ou no painel.
                    </p>
                  )}

                  {error ? (
                    <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  ) : null}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setStep(3);
                      }}
                      className="h-12 rounded-2xl flex-1 font-bold border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => void publishAndFinish()}
                      className="h-12 rounded-2xl flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black"
                    >
                      {saving ? <Loader2 className="animate-spin" /> : "Ir ao painel"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
