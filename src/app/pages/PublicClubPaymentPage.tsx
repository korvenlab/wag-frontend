import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { MercadoPagoBrick } from "../components/MercadoPagoBrick";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://wag-backend.onrender.com";

type ClubPaySession = {
  store_name: string | null;
  slug: string | null;
  public_key: string | null;
  member: { id: string; client_name: string; status: string; active: boolean };
  plan: {
    id: string;
    name: string;
    description: string | null;
    price_brl: number;
  } | null;
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PublicClubPaymentPage() {
  const { slug = "", memberId = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ClubPaySession | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"recurring" | "pix">("pix");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/mercadopago/public/club/${encodeURIComponent(slug)}/members/${encodeURIComponent(memberId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar.");
      setSession(data as ClubPaySession);
      if (data.member?.active) setStatus("approved");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [slug, memberId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status === "approved" || session?.member.active) return;
    const t = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(t);
  }, [status, session, load]);

  const paid = status === "approved" || Boolean(session?.member.active);
  const price = Number(session?.plan?.price_brl) || 0;

  if (error && !session) {
    return (
      <div className="mx-auto max-w-md p-6 text-sm text-red-600">{error}</div>
    );
  }
  if (!session) {
    return (
      <div className="mx-auto flex max-w-md items-center gap-2 p-10 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Wagoo · clube
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          {session.plan?.name || "Clube"} · {session.store_name}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {session.member.client_name}
          {session.plan?.description ? ` · ${session.plan.description}` : ""}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-neutral-400">Mensalidade</p>
          <p className="mt-1 text-3xl font-semibold">{money(price)}</p>

          {paid ? (
            <div className="mt-6 flex gap-3 rounded-xl bg-emerald-500/10 p-4 text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Clube ativo</p>
                <p className="mt-1 text-sm text-emerald-200/80">
                  Cobrança mensal automática quando assinatura recorrente.
                </p>
                <Button
                  className="mt-4"
                  onClick={() =>
                    navigate(`/a/${encodeURIComponent(slug)}/cliente?checkout=success`)
                  }
                >
                  Ir ao portal
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2 rounded-xl bg-black/30 p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                    tab === "pix" ? "bg-white text-neutral-900" : "text-neutral-400"
                  }`}
                  onClick={() => setTab("pix")}
                >
                  PIX (1 mês)
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                    tab === "recurring"
                      ? "bg-white text-neutral-900"
                      : "text-neutral-400"
                  }`}
                  onClick={() => setTab("recurring")}
                >
                  Cartão recorrente
                </button>
              </div>

              {tab === "recurring" ? (
                <>
                  <p className="text-xs text-neutral-400">
                    Assinatura mensal automática no cartão (Mercado Pago
                    Preapproval).
                  </p>
                  {session.public_key ? (
                    <MercadoPagoBrick
                      publicKey={session.public_key}
                      amount={price}
                      mode="card"
                      onError={setError}
                      onPaid={(result) => {
                        if (
                          result.status === "authorized" ||
                          result.status === "approved" ||
                          result.preapproval_id
                        ) {
                          setStatus("approved");
                          void load();
                        }
                      }}
                      submit={async (formData) => {
                        const res = await fetch(
                          `${API_URL}/api/mercadopago/public/club/${encodeURIComponent(slug)}/members/${encodeURIComponent(memberId)}/subscribe`,
                          {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ formData }),
                          },
                        );
                        const data = await res.json();
                        if (!res.ok) {
                          return { error: data.error || "Falha na assinatura." };
                        }
                        return data;
                      }}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-400">
                    Pagamento avulso de 1 mês via PIX ou cartão (sem renovação
                    automática).
                  </p>
                  {session.public_key ? (
                    <MercadoPagoBrick
                      publicKey={session.public_key}
                      amount={price}
                      mode="payment"
                      onError={setError}
                      onPaid={(result) => {
                        setQrCode(result.qr_code ? String(result.qr_code) : null);
                        setQrImg(
                          result.qr_code_base64
                            ? String(result.qr_code_base64)
                            : null,
                        );
                        if (result.status === "approved") {
                          setStatus("approved");
                          void load();
                        }
                      }}
                      submit={async (formData) => {
                        const res = await fetch(
                          `${API_URL}/api/mercadopago/public/club/${encodeURIComponent(slug)}/members/${encodeURIComponent(memberId)}/pay`,
                          {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ method: "brick", formData }),
                          },
                        );
                        const data = await res.json();
                        if (!res.ok) {
                          return { error: data.error || "Falha no pagamento." };
                        }
                        return data;
                      }}
                    />
                  ) : null}
                </>
              )}

              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              {(status === "pending" || status === "in_process") && !paid ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Aguardando confirmação do PIX. Esta página atualiza sozinha.
                </div>
              ) : null}
              {qrImg ? (
                <img
                  alt="QR PIX"
                  className="mx-auto h-56 w-56 rounded-xl bg-white p-2"
                  src={`data:image/png;base64,${qrImg}`}
                />
              ) : null}
              {qrCode ? (
                <div className="rounded-xl border border-white/10 p-3">
                  <p className="break-all font-mono text-[11px]">{qrCode}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void navigator.clipboard.writeText(qrCode)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copiar
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
