import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://wag-backend.onrender.com";

type ScheduleDay = {
  day: string;
  open: boolean;
  slots: string[];
};

type PublicClub = {
  store: {
    name: string;
    slug: string;
    logo_url: string | null;
    cover_url: string | null;
    tagline: string;
    phone: string | null;
    address: string | null;
  };
  schedule: ScheduleDay[];
  club: {
    id: string;
    name: string;
    description: string;
    price_brl: number;
    payment_link_url: string | null;
    available: boolean;
  } | null;
  booking_url: string;
};

type MemberInfo = {
  client_name: string;
  client_phone: string;
  status: string;
  current_period_end: string | null;
  days_left: number | null;
  is_active: boolean;
};

type OtpPurpose = "subscribe" | "member_access";

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function clubTokenKey(slug: string, phone: string, purpose: OtpPurpose) {
  return `wagoo_club_token:${slug}:${phone.replace(/\D/g, "")}:${purpose}`;
}

function readStoredToken(slug: string, phone: string, purpose: OtpPurpose) {
  try {
    const raw = localStorage.getItem(clubTokenKey(slug, phone, purpose));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; expires_at?: string };
    if (!parsed.token || !parsed.expires_at) return null;
    if (new Date(parsed.expires_at).getTime() < Date.now()) {
      localStorage.removeItem(clubTokenKey(slug, phone, purpose));
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

function storeToken(
  slug: string,
  phone: string,
  purpose: OtpPurpose,
  token: string,
  expiresAt: string,
) {
  localStorage.setItem(
    clubTokenKey(slug, phone, purpose),
    JSON.stringify({ token, expires_at: expiresAt }),
  );
}

/** Painel do cliente: clube mensal + horários da loja. */
export function PublicClubClientPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [site, setSite] = useState<PublicClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [subOtpCode, setSubOtpCode] = useState("");
  const [subOtpSent, setSubOtpSent] = useState(false);
  const [subVerified, setSubVerified] = useState(false);
  const [subToken, setSubToken] = useState<string | null>(null);
  const [subOtpBusy, setSubOtpBusy] = useState(false);

  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupOtpCode, setLookupOtpCode] = useState("");
  const [lookupOtpSent, setLookupOtpSent] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);

  const checkoutFlag = searchParams.get("checkout");
  const phoneFromUrl = searchParams.get("phone") || "";

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/club/public/${encodeURIComponent(slug)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Loja não encontrada.");
        setSite(null);
        return;
      }
      setSite(data as PublicClub);
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const sendOtp = async (rawPhone: string, purpose: OtpPurpose) => {
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.length < 10 || !slug) {
      return { ok: false as const, error: "Informe um WhatsApp válido com DDD." };
    }
    const res = await fetch(
      `${API}/api/club/public/${encodeURIComponent(slug)}/otp/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, purpose }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false as const, error: data.error || "Não foi possível enviar o código." };
    }
    return {
      ok: true as const,
      message: String(data.message || "Código enviado."),
      cooldown: data.cooldown_seconds as number | null,
    };
  };

  const verifyOtp = async (rawPhone: string, code: string, purpose: OtpPurpose) => {
    const digits = rawPhone.replace(/\D/g, "");
    const res = await fetch(
      `${API}/api/club/public/${encodeURIComponent(slug)}/otp/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, code, purpose }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false as const, error: data.error || "Código inválido." };
    }
    const token = String(data.club_token || "");
    const expiresAt = String(data.expires_at || "");
    if (!token) return { ok: false as const, error: "Sessão inválida." };
    storeToken(slug, digits, purpose, token, expiresAt);
    return { ok: true as const, token, expiresAt };
  };

  const lookupMember = useCallback(
    async (rawPhone: string, token: string) => {
      const digits = rawPhone.replace(/\D/g, "");
      if (digits.length < 10 || !slug) return;
      setLookupBusy(true);
      setLookupMsg(null);
      try {
        const res = await fetch(
          `${API}/api/club/public/${encodeURIComponent(slug)}/member?phone=${encodeURIComponent(digits)}`,
          { headers: { "X-Club-Token": token } },
        );
        const data = await res.json().catch(() => null);
        if (res.status === 401) {
          setMember(null);
          setLookupMsg("Confirme o WhatsApp com o código enviado.");
          setLookupOtpSent(true);
          return;
        }
        if (!res.ok) {
          setLookupMsg(data?.error || "Não foi possível consultar.");
          setMember(null);
          return;
        }
        if (!data.member) {
          setMember(null);
          setLookupMsg("Nenhuma assinatura encontrada para este telefone.");
          return;
        }
        setMember(data.member as MemberInfo);
        setLookupMsg(null);
      } catch {
        setLookupMsg("Erro de rede na consulta.");
      } finally {
        setLookupBusy(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!phoneFromUrl || !slug) return;
    setLookupPhone(phoneFromUrl);
    setPhone(phoneFromUrl);
    const digits = phoneFromUrl.replace(/\D/g, "");
    const token = readStoredToken(slug, digits, "member_access");
    if (token) {
      void lookupMember(phoneFromUrl, token);
    }
  }, [phoneFromUrl, slug, lookupMember]);

  // Reset verificação se mudar o telefone de assinatura
  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    const stored = digits.length >= 10 ? readStoredToken(slug, digits, "subscribe") : null;
    if (stored) {
      setSubToken(stored);
      setSubVerified(true);
      setSubOtpSent(true);
    } else {
      setSubToken(null);
      setSubVerified(false);
      setSubOtpSent(false);
      setSubOtpCode("");
    }
  }, [phone, slug]);

  const requestSubscribeOtp = async () => {
    setFormError(null);
    setSubOtpBusy(true);
    try {
      const result = await sendOtp(phone, "subscribe");
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSubOtpSent(true);
      setSubVerified(false);
      if (result.cooldown) {
        setFormError(`Aguarde ${result.cooldown}s para pedir outro código.`);
      }
    } catch {
      setFormError("Erro de rede ao enviar o código.");
    } finally {
      setSubOtpBusy(false);
    }
  };

  const confirmSubscribeOtp = async () => {
    setFormError(null);
    setSubOtpBusy(true);
    try {
      const result = await verifyOtp(phone, subOtpCode, "subscribe");
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSubToken(result.token);
      setSubVerified(true);
    } catch {
      setFormError("Erro de rede ao validar o código.");
    } finally {
      setSubOtpBusy(false);
    }
  };

  const requestLookupOtp = async () => {
    setLookupMsg(null);
    setLookupBusy(true);
    setMember(null);
    try {
      const digits = lookupPhone.replace(/\D/g, "");
      const stored = readStoredToken(slug, digits, "member_access");
      if (stored) {
        await lookupMember(lookupPhone, stored);
        return;
      }
      const result = await sendOtp(lookupPhone, "member_access");
      if (!result.ok) {
        setLookupMsg(result.error);
        return;
      }
      setLookupOtpSent(true);
      setLookupMsg(result.message);
    } catch {
      setLookupMsg("Erro de rede ao enviar o código.");
    } finally {
      setLookupBusy(false);
    }
  };

  const confirmLookupOtp = async () => {
    setLookupMsg(null);
    setLookupBusy(true);
    try {
      const result = await verifyOtp(lookupPhone, lookupOtpCode, "member_access");
      if (!result.ok) {
        setLookupMsg(result.error);
        return;
      }
      await lookupMember(lookupPhone, result.token);
    } catch {
      setLookupMsg("Erro de rede ao validar o código.");
    } finally {
      setLookupBusy(false);
    }
  };

  const subscribe = async () => {
    setFormError(null);
    if (!subVerified || !subToken) {
      setFormError("Confirme seu WhatsApp com o código antes de assinar.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `${API}/api/club/public/${encodeURIComponent(slug)}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            club_token: subToken,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Não foi possível iniciar o pagamento.");
        if (data.needs_otp) {
          setSubVerified(false);
          setSubToken(null);
        }
        if (data.already_active) {
          setLookupPhone(phone);
          void requestLookupOtp();
        }
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setFormError("Checkout indisponível.");
    } catch {
      setFormError("Erro de rede.");
    } finally {
      setBusy(false);
    }
  };

  const openDays = useMemo(
    () => (site?.schedule || []).filter((d) => d.open),
    [site],
  );

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#64b34d]" size={32} />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <p className="font-black text-slate-900 text-xl">{error || "Não encontrado"}</p>
        <Link to="/" className="mt-4 text-[#64b34d] font-bold text-sm">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-slate-900">
      {site.store.cover_url ? (
        <div
          className="h-40 md:h-52 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${site.store.cover_url})` }}
        />
      ) : (
        <div className="h-28 bg-gradient-to-br from-[#64b34d] to-[#3d7a2e]" />
      )}

      <main className="max-w-lg mx-auto px-4 -mt-10 pb-16 space-y-5">
        <div className="rounded-[28px] bg-white shadow-wg-elevated p-6 space-y-3">
          <div className="flex items-center gap-3">
            {site.store.logo_url ? (
              <img
                src={site.store.logo_url}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#64b34d]/15 flex items-center justify-center font-black text-[#64b34d]">
                {(site.store.name || "W").slice(0, 1)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight">{site.store.name}</h1>
              {site.store.tagline && (
                <p className="text-sm text-slate-500 font-medium">{site.store.tagline}</p>
              )}
            </div>
          </div>
          {site.store.address && (
            <p className="text-sm text-slate-600 font-medium flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#64b34d]" />
              {site.store.address}
            </p>
          )}
          <Link
            to={`/a/${slug}`}
            className="inline-flex text-sm font-bold text-[#64b34d] hover:underline"
          >
            Ir para agendamento →
          </Link>
        </div>

        {checkoutFlag === "success" && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={18} />
            Clube ativo! No agendamento ou no zap do salão, confirme o WhatsApp com o código
            para marcar sem sinal.
          </div>
        )}
        {checkoutFlag === "cancel" && (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800 text-sm font-bold">
            Pagamento cancelado. Você pode tentar de novo quando quiser.
          </div>
        )}

        {site.club ? (
          <div className="rounded-[28px] bg-white shadow-wg-card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#64b34d]/10 flex items-center justify-center text-[#64b34d]">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="font-black text-lg">{site.club.name}</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {site.club.description}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                  Confirmamos seu WhatsApp com um código no zap do salão. Depois, pague a
                  mensalidade no cartão. Enquanto ativo, agenda sem sinal.
                </p>
                <p className="text-2xl font-black text-[#64b34d] mt-2">
                  {money(site.club.price_brl)}
                  <span className="text-sm text-slate-400 font-bold"> /mês</span>
                </p>
              </div>
            </div>

            {!site.club.available ? (
              <p className="text-amber-700 text-sm font-bold">
                Pagamentos temporariamente indisponíveis neste salão.
              </p>
            ) : (
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp com DDD"
                  inputMode="tel"
                  className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail (para o recibo)"
                  type="email"
                  className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold"
                />

                {!subVerified ? (
                  <div className="rounded-2xl bg-slate-50 p-3 space-y-2">
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#64b34d]" />
                      Confirme que o WhatsApp é seu
                    </p>
                    {!subOtpSent ? (
                      <button
                        type="button"
                        disabled={subOtpBusy || phone.replace(/\D/g, "").length < 10}
                        onClick={() => void requestSubscribeOtp()}
                        className="w-full h-11 rounded-xl bg-slate-900 text-white font-black text-sm disabled:opacity-50"
                      >
                        {subOtpBusy ? (
                          <Loader2 className="animate-spin mx-auto" size={16} />
                        ) : (
                          "Enviar código no WhatsApp"
                        )}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={subOtpCode}
                          onChange={(e) =>
                            setSubOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="Código de 6 dígitos"
                          inputMode="numeric"
                          className="flex-1 h-11 rounded-xl bg-white border border-slate-200 px-3 font-bold tracking-widest"
                        />
                        <button
                          type="button"
                          disabled={subOtpBusy || subOtpCode.length !== 6}
                          onClick={() => void confirmSubscribeOtp()}
                          className="h-11 px-4 rounded-xl bg-[#64b34d] text-white font-black text-sm disabled:opacity-50"
                        >
                          {subOtpBusy ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            "OK"
                          )}
                        </button>
                      </div>
                    )}
                    {subOtpSent && (
                      <button
                        type="button"
                        disabled={subOtpBusy}
                        onClick={() => void requestSubscribeOtp()}
                        className="text-xs font-bold text-[#64b34d] hover:underline"
                      >
                        Reenviar código
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-[#4d8f3b] flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    WhatsApp confirmado
                  </p>
                )}

                <button
                  type="button"
                  disabled={busy || !subVerified}
                  onClick={() => void subscribe()}
                  className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-[#64b34d] text-white font-black transition-colors disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Assinar com cartão"
                  )}
                </button>
                {formError && (
                  <p className="text-red-600 text-xs font-medium">{formError}</p>
                )}
                <p className="text-[11px] text-slate-400 font-medium text-center">
                  Cobrança mensal no cartão. Você pode cancelar depois no Stripe / salão.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white p-6 text-center text-slate-500 font-medium text-sm">
            Este salão ainda não oferece clube mensal.
          </div>
        )}

        <div className="rounded-[28px] bg-white shadow-wg-card p-6 space-y-4">
          <h2 className="font-black text-lg flex items-center gap-2">
            <Search size={18} className="text-[#64b34d]" />
            Já sou membro
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Enviamos um código no WhatsApp do salão para proteger sua assinatura.
          </p>
          <div className="flex gap-2">
            <input
              value={lookupPhone}
              onChange={(e) => {
                setLookupPhone(e.target.value);
                setLookupOtpSent(false);
                setLookupOtpCode("");
                setMember(null);
              }}
              placeholder="Seu WhatsApp"
              inputMode="tel"
              className="flex-1 h-11 rounded-xl bg-slate-50 border-none px-4 font-semibold text-sm"
            />
            <button
              type="button"
              disabled={lookupBusy}
              onClick={() => void requestLookupOtp()}
              className="h-11 px-4 rounded-xl bg-[#64b34d] text-white font-black text-sm"
            >
              {lookupBusy ? <Loader2 className="animate-spin" size={16} /> : "Código"}
            </button>
          </div>
          {lookupOtpSent && !member && (
            <div className="flex gap-2">
              <input
                value={lookupOtpCode}
                onChange={(e) =>
                  setLookupOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Código de 6 dígitos"
                inputMode="numeric"
                className="flex-1 h-11 rounded-xl bg-slate-50 border-none px-4 font-bold tracking-widest text-sm"
              />
              <button
                type="button"
                disabled={lookupBusy || lookupOtpCode.length !== 6}
                onClick={() => void confirmLookupOtp()}
                className="h-11 px-4 rounded-xl bg-slate-900 text-white font-black text-sm disabled:opacity-50"
              >
                Ver
              </button>
            </div>
          )}
          {lookupMsg && (
            <p className="text-sm text-slate-500 font-medium">{lookupMsg}</p>
          )}
          {member && (
            <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
              <p className="font-black text-slate-900">{member.client_name}</p>
              <p className="text-sm font-bold text-slate-600 capitalize">
                Status: {member.status}
              </p>
              {member.is_active && (
                <p className="text-sm font-medium text-[#4d8f3b]">
                  Você pode agendar sem sinal no WhatsApp e em{" "}
                  <Link to={`/a/${slug}`} className="underline font-bold">
                    /a/{slug}
                  </Link>
                  .
                </p>
              )}
              {member.is_active && member.days_left != null && (
                <p className="text-[#64b34d] font-black text-lg flex items-center gap-2">
                  <Clock size={18} />
                  {member.days_left} dia{member.days_left === 1 ? "" : "s"} até a
                  renovação
                </p>
              )}
              {member.current_period_end && (
                <p className="text-xs text-slate-500 font-medium">
                  Válido até{" "}
                  {new Date(member.current_period_end).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-[28px] bg-white shadow-wg-card p-6 space-y-4">
          <h2 className="font-black text-lg flex items-center gap-2">
            <CalendarDays size={18} className="text-[#64b34d]" />
            Horários do salão
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Dias e turnos em que a loja atende — use para saber quando pode marcar.
          </p>
          <ul className="space-y-2">
            {(site.schedule || []).map((d) => (
              <li
                key={d.day}
                className={`flex justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${
                  d.open ? "bg-slate-50" : "bg-slate-50/50 opacity-60"
                }`}
              >
                <span className="font-bold text-slate-800">{d.day}</span>
                <span className="font-medium text-slate-600 text-right">
                  {d.open ? d.slots.join(" · ") : "Fechado"}
                </span>
              </li>
            ))}
          </ul>
          {openDays.length === 0 && (
            <p className="text-xs text-slate-400 font-medium">
              Horários ainda não configurados pelo salão.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
