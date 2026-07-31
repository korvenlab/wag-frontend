import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Loader2, ChevronLeft, Check } from "lucide-react";
import {
  addDays,
  format,
  isBefore,
  startOfDay,
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

type Site = {
  store_name: string;
  slug: string;
  logo_url: string | null;
  tagline: string;
  phone: string | null;
  address: string | null;
  services: Service[];
};

export function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ starts_at: string; service: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myPhone, setMyPhone] = useState("");
  const [myList, setMyList] = useState<
    Array<{ id: string; starts_at: string; booking_services?: { name: string } | null }>
  >([]);
  const [showMine, setShowMine] = useState(false);

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
        setSite(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const days = useMemo(() => {
    const out: Date[] = [];
    let d = startOfDay(new Date());
    for (let i = 0; i < 21; i++) {
      const cur = addDays(d, i);
      if (!isBefore(cur, startOfDay(new Date()))) out.push(cur);
    }
    return out;
  }, []);

  const loadSlots = useCallback(
    async (serviceId: string, dayYmd: string) => {
      if (!slug) return;
      setSlotsLoading(true);
      setSlots([]);
      setSlot(null);
      try {
        const res = await fetch(
          `${API}/api/booking/public/${encodeURIComponent(slug)}/slots?serviceId=${encodeURIComponent(serviceId)}&day=${encodeURIComponent(dayYmd)}`,
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
      });
      setStep(5);
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
          <button
            type="button"
            className="text-xs font-bold uppercase tracking-widest text-[#64b34d]"
            onClick={() => setShowMine((v) => !v)}
          >
            {showMine ? "Voltar ao agendamento" : "Meus agendamentos"}
          </button>
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
                <p className="text-white/50">{new Date(a.starts_at).toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        ) : done && step === 5 ? (
          <div className="rounded-3xl border border-[#64b34d]/40 bg-[#64b34d]/10 p-6 text-center space-y-3">
            <Check className="mx-auto text-[#64b34d]" size={36} />
            <p className="text-2xl font-black">Agendado!</p>
            <p className="text-white/70 text-sm">
              {done.service}
              <br />
              {new Date(done.starts_at).toLocaleString("pt-BR")}
            </p>
            {site.phone ? (
              <a
                className="inline-block mt-2 text-sm font-bold text-[#64b34d]"
                href={`https://wa.me/55${site.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-black">Agendamento</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                Etapa {step} de 4
              </p>
            </div>

            <div className="p-5 space-y-4">
              {step === 1 ? (
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

              {step === 2 ? (
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
                          <div className="text-[10px] text-white/40">{format(d, "MMM", { locale: ptBR })}</div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {step === 3 ? (
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

              {step === 4 ? (
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
                  (step === 1 && !service) ||
                  (step === 2 && !day) ||
                  (step === 3 && !slot) ||
                  (step === 4 && (name.trim().length < 2 || phone.replace(/\D/g, "").length < 10))
                }
                className="flex-1 py-3 rounded-xl bg-[#64b34d] font-black disabled:opacity-40"
                onClick={() => {
                  if (step === 1 && service) {
                    setStep(2);
                    return;
                  }
                  if (step === 2 && day && service) {
                    void loadSlots(service.id, day);
                    setStep(3);
                    return;
                  }
                  if (step === 3 && slot) {
                    setStep(4);
                    return;
                  }
                  if (step === 4) void confirm();
                }}
              >
                {submitting ? (
                  <Loader2 className="animate-spin inline" size={18} />
                ) : step === 4 ? (
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
