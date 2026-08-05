import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Loader2, Wallet } from "lucide-react";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://wag-backend.onrender.com";

type CommissionPayload = {
  profissional: string;
  store_name: string | null;
  period: { year: number; month: number; label: string };
  commission_percent: number;
  paid_appointments_count: number;
  faturamento_brl: number;
  auto_commission_brl: number;
  manual_amount_brl: number | null;
  final_amount_brl: number;
  source: "automatic" | "manual" | "none";
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Página pública: ganhos do mês de um profissional (token secreto no URL). */
export function PublicCommissionPage() {
  const { token = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CommissionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = Number(searchParams.get("year")) || undefined;
  const month = Number(searchParams.get("month")) || undefined;

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (year && month) {
      p.set("year", String(year));
      p.set("month", String(month));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [year, month]);

  const load = useCallback(async () => {
    if (!token) {
      setError("Link inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/api/barbeiros/public/commission/${encodeURIComponent(token)}${qs}`,
      );
      const json = (await res.json().catch(() => ({}))) as CommissionPayload & {
        error?: string;
      };
      if (!res.ok) {
        setData(null);
        setError(json.error || "Não foi possível carregar a comissão.");
        return;
      }
      setData(json);
    } catch {
      setData(null);
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [token, qs]);

  useEffect(() => {
    void load();
  }, [load]);

  const goMonth = (delta: number) => {
    if (!data) return;
    const next = shiftMonth(data.period.year, data.period.month, delta);
    setSearchParams({ year: String(next.year), month: String(next.month) });
  };

  const sourceLabel =
    data?.source === "manual"
      ? "Valor da planilha / lançamento do salão"
      : data?.source === "automatic"
        ? `Comissão automática (${data.commission_percent}%)`
        : "Sem movimento neste mês";

  return (
    <div className="min-h-screen bg-[#0c1210] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(100,179,77,0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(100,179,77,0.12), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-lg px-5 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
        >
          Wagoo
        </Link>

        {loading ? (
          <div className="mt-24 flex flex-col items-center gap-3 text-white/60">
            <Loader2 className="h-8 w-8 animate-spin text-[#64b34d]" />
            <p className="text-sm font-medium">Carregando seus ganhos…</p>
          </div>
        ) : error ? (
          <div className="mt-20 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <p className="text-lg font-bold text-white">{error}</p>
            <p className="mt-2 text-sm text-white/50">
              Peça um novo link ao administrador do salão.
            </p>
          </div>
        ) : data ? (
          <div className="mt-10 space-y-8">
            <header className="space-y-2">
              {data.store_name ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64b34d]/90">
                  {data.store_name}
                </p>
              ) : null}
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {data.profissional}
              </h1>
              <p className="text-white/55 font-medium">
                Seus ganhos do mês — só você vê este link.
              </p>
            </header>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-center text-sm font-bold uppercase tracking-widest text-white/70">
                {data.period.label}
              </p>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-[28px] border border-[#64b34d]/25 bg-gradient-to-b from-[#64b34d]/15 to-transparent p-8 shadow-[0_0_60px_-20px_rgba(100,179,77,0.5)]">
              <div className="flex items-center gap-2 text-[#64b34d]">
                <Wallet className="h-5 w-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Ganho do mês
                </span>
              </div>
              <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {money(data.final_amount_brl)}
              </p>
              <p className="mt-2 text-sm text-white/50 font-medium">{sourceLabel}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Atendimentos pagos
                </dt>
                <dd className="mt-1 text-2xl font-black">
                  {data.paid_appointments_count}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Faturamento dos seus serviços
                </dt>
                <dd className="mt-1 text-2xl font-black">
                  {money(data.faturamento_brl)}
                </dd>
              </div>
              {data.source !== "manual" ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 sm:col-span-2">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Comissão calculada ({data.commission_percent}%)
                  </dt>
                  <dd className="mt-1 text-2xl font-black">
                    {money(data.auto_commission_brl)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
