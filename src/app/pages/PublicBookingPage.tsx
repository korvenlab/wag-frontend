import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  Loader2,
  Check,
  X,
  MapPin,
  Copy,
  MessageCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
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

type DayHours = {
  startTime?: string;
  endTime?: string;
  isTurno1Active?: boolean;
  startTime2?: string;
  endTime2?: string;
  isTurno2Active?: boolean;
  startTime3?: string;
  endTime3?: string;
  isTurno3Active?: boolean;
};

type WorkingHours = Record<string, DayHours>;

type Site = {
  store_name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  tagline: string;
  phone: string | null;
  address: string | null;
  working_hours: WorkingHours | null;
  services: Service[];
  providers: Provider[];
  deposit?: {
    required: boolean;
    percent: number;
    wagoo_fee_percent: number;
    hold_minutes: number;
  };
};

type MyAppointment = {
  id: string;
  starts_at: string;
  booking_services?: { name: string } | null;
  booking_providers?: { name: string } | null;
};

/** Segunda→Domingo, mesma ordem usada no editor de horários do dashboard. */
const DAYS_ORDER = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

/** Índice de Date.getDay() (0=Domingo) → chave do dia. */
const WEEKDAY_KEYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

function windowsFromDayHours(day?: DayHours): Array<{ start: string; end: string }> {
  if (!day) return [];
  const out: Array<{ start: string; end: string }> = [];
  if ((day.isTurno1Active ?? true) && day.startTime && day.endTime) {
    out.push({ start: day.startTime, end: day.endTime });
  }
  if ((day.isTurno2Active ?? true) && day.startTime2 && day.endTime2) {
    out.push({ start: day.startTime2, end: day.endTime2 });
  }
  if (day.isTurno3Active && day.startTime3 && day.endTime3) {
    out.push({ start: day.startTime3, end: day.endTime3 });
  }
  return out;
}

function windowsForDayKey(
  hours: WorkingHours | null | undefined,
  dayKey: string,
): Array<{ start: string; end: string }> {
  if (!hours) return [];
  return windowsFromDayHours(hours[dayKey]);
}

function windowsForDate(
  hours: WorkingHours | null | undefined,
  date: Date,
): Array<{ start: string; end: string }> {
  return windowsForDayKey(hours, WEEKDAY_KEYS[date.getDay()]);
}

/** Aberto agora? Usa o horário local convertido para America/Sao_Paulo. */
function isShopOpenNow(hours: WorkingHours | null | undefined): boolean {
  if (!hours) return false;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const windows = windowsForDate(hours, now);
  if (!windows.length) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return windows.some(({ start, end }) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false;
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    return minutes >= s && minutes <= e;
  });
}

export function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [site, setSite] = useState<Site | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerPicked, setProviderPicked] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<{
    startsAt: string;
    servicesLabel: string;
    provider: string | null;
    depositPaid?: boolean;
  } | null>(null);
  const [paymentBanner, setPaymentBanner] = useState<string | null>(null);

  const [addressCopied, setAddressCopied] = useState(false);

  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [myPhone, setMyPhone] = useState("");
  const [myList, setMyList] = useState<MyAppointment[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myChecked, setMyChecked] = useState(false);

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
        setSite({ ...data, providers: data.providers ?? [], services: data.services ?? [] });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const pago = searchParams.get("pago");
    const cancelado = searchParams.get("pagamento");
    const appointmentId = searchParams.get("appointment");

    if (cancelado === "cancelado") {
      setPaymentBanner("Pagamento cancelado. Você pode agendar de novo quando quiser.");
      if (appointmentId) {
        void fetch(
          `${API}/api/booking/public/${encodeURIComponent(slug)}/appointments/${encodeURIComponent(appointmentId)}/cancel-payment`,
          { method: "POST" },
        );
      }
      const next = new URLSearchParams(searchParams);
      next.delete("pagamento");
      next.delete("appointment");
      setSearchParams(next, { replace: true });
      return;
    }

    if (pago === "1" && appointmentId) {
      void (async () => {
        try {
          const res = await fetch(
            `${API}/api/booking/public/${encodeURIComponent(slug)}/appointments/${encodeURIComponent(appointmentId)}/payment-status`,
          );
          const data = await res.json().catch(() => null);
          if (res.ok && data?.paid) {
            setConfirmedAppointment({
              startsAt: data.appointment?.starts_at || "",
              servicesLabel: "Agendamento confirmado",
              provider: null,
              depositPaid: true,
            });
            setPaymentBanner(null);
          } else if (res.ok) {
            setPaymentBanner(
              "Recebemos seu retorno. Se o pagamento ainda estiver processando, aguarde um instante e atualize a página.",
            );
          }
        } catch {
          setPaymentBanner(
            "Não foi possível confirmar o pagamento agora. Se você pagou, o salão já recebe a confirmação.",
          );
        } finally {
          const next = new URLSearchParams(searchParams);
          next.delete("pago");
          next.delete("appointment");
          setSearchParams(next, { replace: true });
        }
      })();
    }
  }, [slug, searchParams, setSearchParams]);

  const anyOverlayOpen = bookingOpen || myBookingsOpen;

  useEffect(() => {
    if (anyOverlayOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [anyOverlayOpen]);

  const hasProviders = (site?.providers?.length ?? 0) > 0;
  const totalSteps = hasProviders ? 5 : 4;

  const selectedServices = useMemo(
    () => (site?.services ?? []).filter((s) => selectedServiceIds.includes(s.id)),
    [site, selectedServiceIds],
  );
  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + Number(s.duration_minutes || 0), 0),
    [selectedServices],
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + Number(s.price_brl || 0), 0),
    [selectedServices],
  );
  const depositPreview = useMemo(() => {
    if (!site?.deposit?.required || totalPrice <= 0) return null;
    const pct = site.deposit.percent || 30;
    const deposit = Math.round(((totalPrice * pct) / 100) * 100) / 100;
    return { percent: pct, deposit: deposit < 1 && totalPrice > 0 ? 1 : deposit };
  }, [site, totalPrice]);
  const selectedProvider = useMemo(
    () => (providerId ? site?.providers.find((p) => p.id === providerId) ?? null : null),
    [site, providerId],
  );

  const calendarCells = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const canGoPrevMonth = isAfter(calendarMonth, startOfMonth(new Date()));

  const loadSlots = useCallback(
    async (serviceIds: string[], dayYmd: string, provId: string | null) => {
      if (!slug || serviceIds.length === 0) return;
      setSlotsLoading(true);
      setSlots([]);
      setSelectedSlot(null);
      try {
        const q = new URLSearchParams({ serviceIds: serviceIds.join(","), day: dayYmd });
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

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function resetWizard() {
    setStep(1);
    setSelectedServiceIds([]);
    setProviderId(null);
    setProviderPicked(false);
    setCalendarMonth(startOfMonth(new Date()));
    setSelectedDay(null);
    setSlots([]);
    setSelectedSlot(null);
    setClientName("");
    setClientPhone("");
    setError(null);
    setSubmitting(false);
    setConfirmedAppointment(null);
  }

  function openWizard(preselectServiceId?: string) {
    resetWizard();
    if (preselectServiceId) setSelectedServiceIds([preselectServiceId]);
    setBookingOpen(true);
  }

  function closeWizard() {
    setBookingOpen(false);
  }

  const isServiceStep = step === 1;
  const isProviderStep = hasProviders && step === 2;
  const isDateStep = hasProviders ? step === 3 : step === 2;
  const isTimeStep = hasProviders ? step === 4 : step === 3;
  const isConfirmStep = hasProviders ? step === 5 : step === 4;

  async function confirmBooking() {
    if (!slug || !selectedDay || !selectedSlot || selectedServiceIds.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/api/booking/public/${encodeURIComponent(slug)}/appointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceIds: selectedServiceIds,
            providerId: providerId || undefined,
            startsAt: selectedSlot,
            clientName,
            clientPhone,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível agendar");

      if (data.requires_payment && data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      setConfirmedAppointment({
        startsAt: data.appointment?.starts_at || selectedSlot,
        servicesLabel: data.service?.name || selectedServices.map((s) => s.name).join(", "),
        provider: data.provider?.name || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao agendar");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (isServiceStep) {
      if (selectedServiceIds.length === 0) return;
      setStep((s) => s + 1);
      return;
    }
    if (isProviderStep) {
      if (!providerPicked) return;
      setStep((s) => s + 1);
      return;
    }
    if (isDateStep) {
      if (!selectedDay) return;
      void loadSlots(selectedServiceIds, selectedDay, providerId);
      setStep((s) => s + 1);
      return;
    }
    if (isTimeStep) {
      if (!selectedSlot) return;
      setStep((s) => s + 1);
      return;
    }
    if (isConfirmStep) {
      void confirmBooking();
    }
  }

  const nextDisabled =
    submitting ||
    (isServiceStep && selectedServiceIds.length === 0) ||
    (isProviderStep && !providerPicked) ||
    (isDateStep && !selectedDay) ||
    (isTimeStep && !selectedSlot) ||
    (isConfirmStep &&
      (clientName.trim().length < 2 || clientPhone.replace(/\D/g, "").length < 10));

  function copyAddress() {
    if (!site?.address) return;
    void navigator.clipboard.writeText(site.address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  }

  function closeMyBookings() {
    setMyBookingsOpen(false);
    setMyPhone("");
    setMyList([]);
    setMyChecked(false);
  }

  async function fetchMine() {
    if (!slug) return;
    const digits = myPhone.replace(/\D/g, "");
    if (digits.length < 10) return;
    setMyLoading(true);
    try {
      const res = await fetch(
        `${API}/api/booking/public/${encodeURIComponent(slug)}/my?phone=${encodeURIComponent(digits)}`,
      );
      const data = await res.json();
      setMyList(data.appointments ?? []);
    } catch {
      setMyList([]);
    } finally {
      setMyLoading(false);
      setMyChecked(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#64b34d]" size={28} />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center text-white p-6">
        <div className="text-center space-y-2">
          <p className="text-xl font-black">Agenda indisponível</p>
          <p className="text-white/50 text-sm">Este link não está publicado.</p>
        </div>
      </div>
    );
  }

  const open = isShopOpenNow(site.working_hours);
  const whatsappHref = site.phone
    ? `https://wa.me/55${site.phone.replace(/\D/g, "")}`
    : null;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white overflow-x-hidden">
      {paymentBanner ? (
        <div className="relative z-50 bg-[#64b34d]/20 border-b border-[#64b34d]/40 px-4 py-3 text-center text-sm font-semibold text-[#9ae07f]">
          {paymentBanner}
          <button
            type="button"
            className="ml-2 underline text-white/70"
            onClick={() => setPaymentBanner(null)}
          >
            Fechar
          </button>
        </div>
      ) : null}
      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0">
          {site.cover_url ? (
            <img src={site.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#101a10] via-[#0a0a0a] to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/50" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-20 pb-40 md:pb-20 text-center space-y-6 w-full">
          {site.logo_url ? (
            <img
              src={site.logo_url}
              alt=""
              className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-white/15 shadow-lg"
            />
          ) : null}

          <span
            className={
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border " +
              (open
                ? "bg-[#64b34d]/15 border-[#64b34d]/40 text-[#9ae07f]"
                : "bg-white/5 border-white/15 text-white/50")
            }
          >
            <span
              className={"w-1.5 h-1.5 rounded-full " + (open ? "bg-[#64b34d]" : "bg-white/30")}
            />
            {open ? "Aberto agora" : "Fechado"}
          </span>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{site.store_name}</h1>
          {site.tagline ? (
            <p className="text-white/60 font-medium text-lg max-w-xl mx-auto">{site.tagline}</p>
          ) : null}

          {/* CTAs — inline on desktop, sticky bar on mobile (below) */}
          <div className="hidden md:flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => openWizard()}
              className="min-h-12 px-8 py-4 rounded-2xl bg-[#64b34d] text-white font-black text-sm uppercase tracking-wide hover:bg-[#579c42] transition"
            >
              Agendar agora
            </button>
            <button
              type="button"
              onClick={() => setMyBookingsOpen(true)}
              className="min-h-12 px-8 py-4 rounded-2xl border border-white/20 text-white font-black text-sm uppercase tracking-wide hover:bg-white/10 transition"
            >
              Meus agendamentos
            </button>
          </div>

          {slug ? (
            <div>
              <Link
                to={`/a/${slug}/agenda`}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/45 hover:text-white/75 transition"
              >
                <CalendarDays size={14} /> Ver agenda pública
              </Link>
            </div>
          ) : null}
        </div>

        {/* CTAs — sticky bottom bar on mobile */}
        {!anyOverlayOpen ? (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black via-black/95 to-black/0">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openWizard()}
                className="w-full min-h-12 h-12 rounded-2xl bg-[#64b34d] text-white font-black text-sm uppercase tracking-wide active:bg-[#579c42] transition"
              >
                Agendar agora
              </button>
              <button
                type="button"
                onClick={() => setMyBookingsOpen(true)}
                className="w-full min-h-12 h-12 rounded-2xl border border-white/20 text-white font-black text-sm uppercase tracking-wide active:bg-white/10 transition"
              >
                Meus agendamentos
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Serviços */}
      {site.services.length > 0 ? (
        <section id="servicos" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <h2 className="text-2xl font-black mb-8 text-center">Serviços</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {site.services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openWizard(s.id)}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-[#64b34d]/50 hover:bg-white/[0.07] active:bg-white/[0.09] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black truncate">{s.name}</p>
                    {s.description ? (
                      <p className="text-sm text-white/50 mt-1 line-clamp-2">{s.description}</p>
                    ) : null}
                  </div>
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : null}
                </div>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-white/40 font-semibold">{s.duration_minutes} min</span>
                  <span className="text-[#64b34d] font-black">
                    R$ {Number(s.price_brl).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Local */}
      {site.address ? (
        <section id="local" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 border-t border-white/5">
          <h2 className="text-2xl font-black mb-6 text-center">Localização</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <MapPin className="text-[#64b34d] shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-white/70">{site.address}</p>
            </div>
            <button
              type="button"
              onClick={copyAddress}
              className="shrink-0 p-3 rounded-xl border border-white/15 hover:bg-white/10 active:bg-white/15 transition"
              aria-label="Copiar endereço"
            >
              {addressCopied ? (
                <Check size={16} className="text-[#64b34d]" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </section>
      ) : null}

      {/* Funcionamento */}
      {site.working_hours ? (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 border-t border-white/5">
          <h2 className="text-2xl font-black mb-6 text-center">Funcionamento</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 divide-y divide-white/5">
            {DAYS_ORDER.map((dayKey) => {
              const windows = windowsForDayKey(site.working_hours, dayKey);
              return (
                <div key={dayKey} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-white/70 font-medium">{dayKey}</span>
                  <span className={windows.length ? "font-bold" : "text-white/35 font-medium"}>
                    {windows.length
                      ? windows.map((w) => `${w.start}–${w.end}`).join(" · ")
                      : "Fechado"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <footer className="text-center text-xs text-white/30 py-10 border-t border-white/5">
        <p>Powered by Wagoo</p>
      </footer>

      {/* WhatsApp flutuante */}
      {whatsappHref && !anyOverlayOpen ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="fixed right-5 md:right-6 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 w-14 h-14 rounded-full bg-[#64b34d] flex items-center justify-center shadow-lg shadow-black/40 hover:scale-105 active:scale-95 transition"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="text-white" size={26} />
        </a>
      ) : null}

      {/* Modal: Meus agendamentos */}
      {myBookingsOpen ? (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-4">
          <div className="w-full h-[100dvh] md:h-auto md:max-h-[92vh] max-w-none md:max-w-md rounded-none md:rounded-3xl bg-[#0f0f0f] border-0 md:border md:border-white/10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <p className="font-black">Meus agendamentos</p>
              <button
                type="button"
                onClick={closeMyBookings}
                className="p-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-white/50">Informe o WhatsApp usado no agendamento.</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 min-w-0 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base focus:outline-none focus:border-[#64b34d]/50"
                  value={myPhone}
                  onChange={(e) => setMyPhone(e.target.value)}
                  placeholder="(82) 99999-9999"
                  inputMode="tel"
                  type="tel"
                />
                <button
                  type="button"
                  onClick={() => void fetchMine()}
                  disabled={myLoading || myPhone.replace(/\D/g, "").length < 10}
                  className="min-h-12 px-5 rounded-xl bg-[#64b34d] font-black shrink-0 disabled:opacity-40"
                >
                  {myLoading ? <Loader2 className="animate-spin" size={18} /> : "Buscar"}
                </button>
              </div>
              {myList.length > 0 ? (
                <div className="space-y-2">
                  {myList.map((a) => (
                    <div key={a.id} className="rounded-xl border border-white/10 p-3 text-sm">
                      <p className="font-bold">{a.booking_services?.name || "Serviço"}</p>
                      {a.booking_providers?.name ? (
                        <p className="text-white/40 text-xs">{a.booking_providers.name}</p>
                      ) : null}
                      <p className="text-white/50">
                        {new Date(a.starts_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : myChecked ? (
                <p className="text-sm text-white/40 text-center py-4">
                  Nenhum agendamento encontrado.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Wizard de agendamento */}
      {bookingOpen ? (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-4">
          <div className="w-full h-[100dvh] md:h-auto md:max-h-[92vh] max-w-none md:max-w-lg rounded-none md:rounded-3xl bg-[#0f0f0f] border-0 md:border md:border-white/10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <p className="font-black text-sm">Agendar horário</p>
                {!confirmedAppointment ? (
                  <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">
                    Etapa {step} de {totalSteps}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeWizard}
                className="p-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {!confirmedAppointment ? (
              <div className="h-1 bg-white/5 shrink-0">
                <div
                  className="h-full bg-[#64b34d] transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            ) : null}

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {confirmedAppointment ? (
                <div className="text-center space-y-3 py-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#64b34d]/15 border border-[#64b34d]/40 flex items-center justify-center">
                    <Check className="text-[#64b34d]" size={32} />
                  </div>
                  <p className="text-2xl font-black">Agendado!</p>
                  {confirmedAppointment.depositPaid ? (
                    <p className="text-[#9ae07f] text-sm font-bold">Sinal pago com sucesso</p>
                  ) : null}
                  <p className="text-white/70 text-sm">
                    {confirmedAppointment.servicesLabel}
                    {confirmedAppointment.provider ? (
                      <>
                        <br />
                        com {confirmedAppointment.provider}
                      </>
                    ) : null}
                    <br />
                    {confirmedAppointment.startsAt
                      ? format(
                          new Date(confirmedAppointment.startsAt),
                          "dd 'de' MMMM 'às' HH:mm",
                          { locale: ptBR },
                        )
                      : null}
                  </p>
                </div>
              ) : (
                <>
                  {isServiceStep ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black">Escolha os serviços</h2>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#64b34d]">
                          {selectedServiceIds.length}{" "}
                          {selectedServiceIds.length === 1
                            ? "item selecionado"
                            : "itens selecionados"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {site.services.map((s) => {
                          const checked = selectedServiceIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleService(s.id)}
                              className={
                                "w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition " +
                                (checked
                                  ? "border-[#64b34d] bg-[#64b34d]/15"
                                  : "border-white/10 hover:border-white/25")
                              }
                            >
                              <div
                                className={
                                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 " +
                                  (checked
                                    ? "bg-[#64b34d] border-[#64b34d]"
                                    : "border-white/25")
                                }
                              >
                                {checked ? <Check size={13} className="text-white" /> : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold truncate">{s.name}</p>
                                {s.description ? (
                                  <p className="text-xs text-white/40 truncate">
                                    {s.description}
                                  </p>
                                ) : null}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs text-white/45">{s.duration_minutes} min</p>
                                <p className="text-sm font-black text-[#64b34d]">
                                  R$ {Number(s.price_brl).toFixed(2)}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {isProviderStep ? (
                    <>
                      <h2 className="text-lg font-black">Profissional</h2>
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
                              : "border-white/10 hover:border-white/25")
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
                              "w-full text-left rounded-2xl border p-3 flex gap-3 items-center " +
                              (providerId === p.id
                                ? "border-[#64b34d] bg-[#64b34d]/15"
                                : "border-white/10 hover:border-white/25")
                            }
                          >
                            <div className="w-12 h-12 rounded-full bg-black/40 overflow-hidden shrink-0">
                              {p.photo_url ? (
                                <img
                                  src={p.photo_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-white/30">
                                  {p.name.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold truncate">{p.name}</p>
                              {p.bio ? (
                                <p className="text-xs text-white/45 truncate">{p.bio}</p>
                              ) : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {isDateStep ? (
                    <>
                      <h2 className="text-lg font-black">Escolha a data</h2>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={!canGoPrevMonth}
                          onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                          className="p-3 rounded-xl border border-white/10 disabled:opacity-30"
                          aria-label="Mês anterior"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <p className="font-black capitalize">
                          {format(calendarMonth, "MMMM yyyy", { locale: ptBR })}
                        </p>
                        <button
                          type="button"
                          onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                          className="p-3 rounded-xl border border-white/10"
                          aria-label="Próximo mês"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-white/35">
                        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                          <div key={`${d}-${i}`}>{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarCells.map((d) => {
                          const ymd = format(d, "yyyy-MM-dd");
                          const inMonth = isSameMonth(d, calendarMonth);
                          const isPast = isBefore(startOfDay(d), startOfDay(new Date()));
                          const hasWindows = windowsForDate(site.working_hours, d).length > 0;
                          const disabled = !inMonth || isPast || !hasWindows;
                          const active = selectedDay === ymd;
                          return (
                            <button
                              key={ymd}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedDay(ymd)}
                              className={
                                "aspect-square min-h-10 rounded-xl text-sm font-bold transition flex items-center justify-center " +
                                (!inMonth
                                  ? "text-white/10"
                                  : disabled
                                    ? "text-white/20"
                                    : active
                                      ? "bg-[#64b34d] text-white"
                                      : "border border-white/10 hover:border-[#64b34d]/50")
                              }
                            >
                              {format(d, "d")}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {isTimeStep ? (
                    <>
                      <h2 className="text-lg font-black">Escolha o horário</h2>
                      <p className="text-xs text-white/45 font-semibold">
                        Tempo total estimado: {totalDuration} min
                      </p>
                      {slotsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="animate-spin text-[#64b34d]" />
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-white/50 text-center py-4">
                          Nenhum horário livre neste dia.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedSlot(s)}
                              className={
                                "rounded-xl border py-3 min-h-12 font-bold text-sm transition " +
                                (selectedSlot === s
                                  ? "border-[#64b34d] bg-[#64b34d]/15"
                                  : "border-white/10 hover:border-white/25")
                              }
                            >
                              {format(new Date(s), "HH:mm")}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}

                  {isConfirmStep ? (
                    <>
                      <h2 className="text-lg font-black">Confirmar</h2>
                      <input
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base focus:outline-none focus:border-[#64b34d]/50"
                        placeholder="SEU NOME"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                      <input
                        className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base focus:outline-none focus:border-[#64b34d]/50"
                        placeholder="WHATSAPP"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        inputMode="tel"
                        type="tel"
                      />
                      <div className="rounded-2xl border border-white/10 p-4 text-sm space-y-2">
                        <div className="space-y-1">
                          {selectedServices.map((s) => (
                            <div key={s.id} className="flex items-center justify-between">
                              <span className="text-white/70">{s.name}</span>
                              <span className="text-white/50 font-semibold">
                                R$ {Number(s.price_brl).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/10 font-black">
                          <span>Total</span>
                          <span className="text-[#64b34d]">R$ {totalPrice.toFixed(2)}</span>
                        </div>
                        {depositPreview ? (
                          <div className="rounded-xl bg-[#64b34d]/15 border border-[#64b34d]/30 px-3 py-2 text-xs font-semibold text-[#9ae07f] space-y-1">
                            <p>
                              Sinal agora ({depositPreview.percent}%): R${" "}
                              {depositPreview.deposit.toFixed(2)}
                            </p>
                            <p className="text-white/45 font-medium">
                              O horário só fica confirmado depois do pagamento.
                            </p>
                          </div>
                        ) : null}
                        {hasProviders ? (
                          <p className="text-white/50 pt-1">
                            <span className="text-white/35">Profissional:</span>{" "}
                            {selectedProvider?.name || "Sem preferência"}
                          </p>
                        ) : null}
                        <p className="text-white/50">
                          <span className="text-white/35">Quando:</span>{" "}
                          {selectedSlot
                            ? format(new Date(selectedSlot), "dd 'de' MMMM 'às' HH:mm", {
                                locale: ptBR,
                              })
                            : "—"}
                        </p>
                      </div>
                      {error ? (
                        <p className="text-sm text-red-400 font-semibold">{error}</p>
                      ) : null}
                    </>
                  ) : null}
                </>
              )}
            </div>

            {!confirmedAppointment ? (
              <div className="px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/10 flex gap-2 shrink-0">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className="min-h-12 px-4 py-3 rounded-xl border border-white/15 font-bold flex items-center gap-1 hover:bg-white/5 active:bg-white/10 transition"
                  >
                    <ChevronLeft size={16} /> Voltar
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={nextDisabled}
                  onClick={handleNext}
                  className="flex-1 min-h-12 py-3 rounded-xl bg-[#64b34d] font-black disabled:opacity-40 hover:bg-[#579c42] active:bg-[#4c8938] transition"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : isConfirmStep ? (
                    depositPreview ? "Pagar sinal e confirmar" : "Confirmar Agendamento"
                  ) : (
                    "Próximo"
                  )}
                </button>
              </div>
            ) : (
              <div className="px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={closeWizard}
                  className="w-full min-h-12 py-3 rounded-xl bg-[#64b34d] font-black hover:bg-[#579c42] active:bg-[#4c8938] transition"
                >
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
