import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Loader2, ChevronLeft, Check, CalendarDays } from "lucide-react";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://wag-backend.onrender.com";

type Service = {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  duration_minutes: number;
  image_url: string | null;
};

type Provider = {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string;
};

type Site = {
  store_name: string;
  slug: string;
  logo_url: string | null;
  tagline: string;
  phone: string | null;
  address: string | null;
  services: Service[];
  providers: Provider[];
};

export function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null); // null = sem preferência após escolha
  const [providerPicked, setProviderPicked] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ starts_at: string; service: string; provider?: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [myPhone, setMyPhone] = useState("");
  const [myList, setMyList] = useState<
    Array<{
      id: string;
      starts_at: string;
      booking_services?: { name: string } | null;
      booking_providers?: { name: string } | null;
    }>
  >([]);
  const [showMine, setShowMine] = useState(false);

  const hasProviders = (site?.providers?.length ?? 0) > 0;
  const totalSteps = hasProviders ? 5 : 4;
  const doneStep = hasProviders ? 6 : 5;

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/booking/public/${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        setSite({ ...data, providers: data.providers ?? [] });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = startOfDay(new Date());
    for (let i = 0; i < 21; i++) {
      const cur = addDays(d, i);
      if (!isBefore(cur, startOfDay(new Date()))) out.push(cur);
    }
    return out;
  }, []);

  const loadSlots = useCallback(
    async (serviceId: string, dayYmd: string, provId: string | null) => {
      if (!slug) return;
      setSlotsLoading(true);
      setSlots([]);
      setSlot(null);
      try {
        const q = new URLSearchParams({ serviceId, day: dayYmd });
        if (provId) q.set("providerId", provId);
        const res = await fetch(
          `${API}/api/booking/public/${encodeURIComponent(slug)}/slots?${q.toString()}`,
        );
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [slug],
  );

  async function confirm() {
    if (!slug || !service || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/booking/public/${encodeURIComponent(slug)}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          providerId: providerId || undefined,
          startsAt: slot,
          clientName: name,
          clientPhone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível agendar");
      setDone({
        starts_at: data.appointment.starts_at,
        service: data.service.name,
        provider: data.provider?.name,
      });
      setStep(doneStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchMine() {
    if (!slug || myPhone.replace(/\D/g, "").length < 10) return;
    const res = await fetch(
      `${API}/api/booking/public/${encodeURIComponent(slug)}/my?phone=${encodeURIComponent(myPhone.replace(/\D/g, ""))}`,
    );
    const data = await res.json();
    setMyList(data.appointments ?? []);
  }

  /** Map logical steps when providers exist: 1 svc, 2 prov, 3 day, 4 slot, 5 data */
  /** Without providers: 1 svc, 2 day, 3 slot, 4 data */

  const uiStepLabel = step > totalSteps ? totalSteps : step;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#64b34d]" />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-6">
        <div className="text-center space-y-2">
          <p className="text-xl font-black">Agenda indisponível</p>
          <p className="text-white/50 text-sm">Este link não está publicado.</p>
        </div>
      </div>
    );
  }

  const isServiceStep = step === 1;
  const isProviderStep = hasProviders && step === 2;
  const isDayStep = hasProviders ? step === 3 : step === 2;
  const isSlotStep = hasProviders ? step === 4 : step === 3;
  const isDataStep = hasProviders ? step === 5 : step === 4;
  const isDone = step === doneStep;

  const selectedProvider = providerId
    ? site.providers.find((p) => p.id === providerId)
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <header className="text-center space-y-3">
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt=""
              className="mx-auto h-16 w-16 rounded-full object-cover border border-white/10"
            />
          ) : (
            <img src="/logo.png" alt="Wagoo" className="mx-auto h-10 opacity-80" />
          )}
          <h1 className="text-3xl font-black tracking-tight">{site.store_name}</h1>
          <p className="text-white/55 font-medium">{site.tagline}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-widest text-[#64b34d]"
              onClick={() => setShowMine((v) => !v)}
            >
              {showMine ? "Voltar ao agendamento" : "Meus agendamentos"}
            </button>
            {slug ? (
              <Link
                to={`/a/${slug}/agenda`}
                className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/70 inline-flex items-center gap-1"
              >
                <CalendarDays size={12} /> Ver agenda
              </Link>
            ) : null}
          </div>
        </header>

        {showMine ? (
          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold">Informe o WhatsApp usado no agendamento</p>
            <input
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
              value={myPhone}
              onChange={(e) => setMyPhone(e.target.value)}
              placeholder="(82) 99999-9999"
            />
            <button
              type="button"
              onClick={() => void fetchMine()}
              className="w-full py-3 rounded-xl bg-[#64b34d] font-black"
            >
              Buscar
            </button>
            {myList.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/10 p-3 text-sm">
                <p className="font-bold">{a.booking_services?.name || "Serviço"}</p>
                {a.booking_providers?.name ? (
                  <p className="text-white/40 text-xs">{a.booking_providers.name}</p>
                ) : null}
                <p className="text-white/50">{new Date(a.starts_at).toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        ) : isDone && done ? (
          <div className="rounded-3xl border border-[#64b34d]/40 bg-[#64b34d]/10 p-6 text-center space-y-3">
            <Check className="mx-auto text-[#64b34d]" size={36} />
            <p className="text-2xl font-black">Agendado!</p>
            <p className="text-white/70 text-sm">
              {done.service}
              {done.provider ? (
                <>
                  <br />
                  com {done.provider}
                </>
              ) : null}
              <br />
              {new Date(done.starts_at).toLocaleString("pt-BR")}
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-black">Agendamento</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                Etapa {uiStepLabel} de {totalSteps}
              </p>
            </div>

            <div className="p-5 space-y-4">
              {isServiceStep ? (
                <>
                  <h2 className="text-lg font-black">Escolha o serviço</h2>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {site.services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setService(s)}
                        className={
                          "w-full text-left rounded-2xl border p-3 flex gap-3 transition " +
                          (service?.id === s.id
                            ? "border-[#64b34d] bg-[#64b34d]/15"
                            : "border-white/10 hover:border-white/25")
                        }
                      >
                        <div className="w-14 h-14 rounded-xl bg-black/40 overflow-hidden shrink-0">
                          {s.image_url ? (
                            <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">{s.name}</p>
                          <p className="text-xs text-white/45">
                            {s.duration_minutes} min · R$ {Number(s.price_brl).toFixed(0)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {isProviderStep ? (
                <>
                  <h2 className="text-lg font-black">Escolha o profissional</h2>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProviderId(null);
                        setProviderPicked(true);
                      }}
                      className={
                        "w-full text-left rounded-2xl border p-3 " +
                        (providerPicked && providerId === null
                          ? "border-[#64b34d] bg-[#64b34d]/15"
                          : "border-white/10")
                      }
                    >
                      <p className="font-bold">Sem preferência</p>
                      <p className="text-xs text-white/45">Qualquer profissional disponível</p>
                    </button>
                    {site.providers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProviderId(p.id);
                          setProviderPicked(true);
                        }}
                        className={
                          "w-full text-left rounded-2xl border p-3 flex gap-3 " +
                          (providerId === p.id
                            ? "border-[#64b34d] bg-[#64b34d]/15"
                            : "border-white/10")
                        }
                      >
                        <div className="w-12 h-12 rounded-full bg-black/40 overflow-hidden shrink-0">
                          {p.photo_url ? (
                            <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-white/30">
                              {p.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{p.name}</p>
                          {p.bio ? <p className="text-xs text-white/45">{p.bio}</p> : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {isDayStep ? (
                <>
                  <h2 className="text-lg font-black">Escolha a data</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {days.map((d) => {
                      const ymd = format(d, "yyyy-MM-dd");
                      return (
                        <button
                          key={ymd}
                          type="button"
                          onClick={() => setDay(ymd)}
                          className={
                            "rounded-xl border px-2 py-3 text-center " +
                            (day === ymd
                              ? "border-[#64b34d] bg-[#64b34d]/15"
                              : "border-white/10")
                          }
                        >
                          <div className="text-[10px] uppercase text-white/40 font-bold">
                            {format(d, "EEE", { locale: ptBR })}
                          </div>
                          <div className="text-lg font-black">{format(d, "d")}</div>
                          <div className="text-[10px] text-white/40">
                            {format(d, "MMM", { locale: ptBR })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {isSlotStep ? (
                <>
                  <h2 className="text-lg font-black">Escolha o horário</h2>
                  {slotsLoading ? (
                    <Loader2 className="animate-spin text-[#64b34d]" />
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-white/50">Nenhum horário livre neste dia.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={
                            "rounded-xl border py-3 font-bold text-sm " +
                            (slot === s
                              ? "border-[#64b34d] bg-[#64b34d]/15"
                              : "border-white/10")
                          }
                        >
                          {format(new Date(s), "HH:mm")}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : null}

              {isDataStep ? (
                <>
                  <h2 className="text-lg font-black">Seus dados</h2>
                  <input
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
                    placeholder="WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <div className="rounded-xl border border-white/10 p-3 text-sm text-white/70 space-y-1">
                    <p>
                      <span className="text-white/40">Serviço:</span> {service?.name}
                    </p>
                    {selectedProvider ? (
                      <p>
                        <span className="text-white/40">Profissional:</span> {selectedProvider.name}
                      </p>
                    ) : hasProviders ? (
                      <p>
                        <span className="text-white/40">Profissional:</span> Sem preferência
                      </p>
                    ) : null}
                    <p>
                      <span className="text-white/40">Quando:</span>{" "}
                      {slot ? new Date(slot).toLocaleString("pt-BR") : "—"}
                    </p>
                    <p>
                      <span className="text-white/40">Valor:</span> R${" "}
                      {service ? Number(service.price_brl).toFixed(2) : "—"}
                    </p>
                  </div>
                  {error ? <p className="text-sm text-red-400 font-semibold">{error}</p> : null}
                </>
              ) : null}
            </div>

            <div className="px-5 py-4 border-t border-white/10 flex gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  className="px-4 py-3 rounded-xl border border-white/15 font-bold"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft size={16} className="inline" /> Voltar
                </button>
              ) : null}
              <button
                type="button"
                disabled={
                  submitting ||
                  (isServiceStep && !service) ||
                  (isProviderStep && !providerPicked) ||
                  (isDayStep && !day) ||
                  (isSlotStep && !slot) ||
                  (isDataStep &&
                    (name.trim().length < 2 || phone.replace(/\D/g, "").length < 10))
                }
                className="flex-1 py-3 rounded-xl bg-[#64b34d] font-black disabled:opacity-40"
                onClick={() => {
                  if (isServiceStep && service) {
                    setStep(2);
                    return;
                  }
                  if (isProviderStep && providerPicked) {
                    setStep(3);
                    return;
                  }
                  if (isDayStep && day && service) {
                    void loadSlots(service.id, day, providerId);
                    setStep(hasProviders ? 4 : 3);
                    return;
                  }
                  if (isSlotStep && slot) {
                    setStep(hasProviders ? 5 : 4);
                    return;
                  }
                  if (isDataStep) void confirm();
                }}
              >
                {submitting ? (
                  <Loader2 className="animate-spin inline" size={18} />
                ) : isDataStep ? (
                  "Confirmar"
                ) : (
                  "Próximo"
                )}
              </button>
            </div>
          </div>
        )}

        {(site.address || site.phone) && (
          <footer className="text-center text-xs text-white/35 space-y-1 pb-8">
            {site.address ? <p>{site.address}</p> : null}
            {site.phone ? <p>{site.phone}</p> : null}
            <p className="pt-2">Powered by Wagoo</p>
          </footer>
        )}
      </div>
    </div>
  );
}
