import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { MercadoPagoBrick } from "../components/MercadoPagoBrick";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://wag-backend.onrender.com";

type PaySession = {
  store_name: string | null;
  slug: string | null;
  public_key: string | null;
  appointment: {
    id: string;
    client_name: string;
    starts_at: string;
    status: string;
    payment_status: string;
    price_brl: number;
    deposit_amount_brl: number;
    payment_expires_at: string | null;
    paid: boolean;
  };
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PublicBookingPaymentPage() {
  const { slug = "", appointmentId = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PaySession | null>(null);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/mercadopago/public/booking/${encodeURIComponent(slug)}/appointments/${encodeURIComponent(appointmentId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar pagamento.");
      setSession(data as PaySession);
      if (data.appointment?.paid) setStatus("approved");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [slug, appointmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status === "approved" || !session || session.appointment.paid) return;
    const t = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(t);
  }, [status, session, load]);

  const expiresLabel = useMemo(() => {
    if (!session?.appointment.payment_expires_at) return null;
    return new Date(session.appointment.payment_expires_at).toLocaleString("pt-BR");
  }, [session]);

  const paid = status === "approved" || Boolean(session?.appointment.paid);

  if (error && !session) {
    return (
      <div className="mx-auto max-w-md p-6 font-sans text-sm text-red-600">{error}</div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex max-w-md items-center gap-2 p-10 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando pagamento…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Wagoo · pagamento
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {session.store_name || "Agendamento"}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Sinal de {session.appointment.client_name} · total do serviço{" "}
          {money(Number(session.appointment.price_brl) || 0)}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-neutral-400">Valor a pagar agora</p>
          <p className="mt-1 text-3xl font-semibold">
            {money(Number(session.appointment.deposit_amount_brl) || 0)}
          </p>
          {expiresLabel ? (
            <p className="mt-2 text-xs text-amber-200/80">
              Reserve até {expiresLabel}
            </p>
          ) : null}

          {paid ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 p-4 text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Pagamento confirmado</p>
                <p className="mt-1 text-sm text-emerald-200/80">
                  Seu horário está garantido.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/a/${encodeURIComponent(slug)}?pago=1`)}
                >
                  Voltar à agenda
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-xs text-neutral-400">
                Pague com PIX ou cartão no checkout seguro do Mercado Pago.
              </p>
              {session.public_key ? (
                <MercadoPagoBrick
                  publicKey={session.public_key}
                  amount={Number(session.appointment.deposit_amount_brl) || 0}
                  mode="payment"
                  onError={setError}
                  onPaid={(result) => {
                    setStatus(String(result.status || ""));
                    setQrCode(result.qr_code ? String(result.qr_code) : null);
                    setQrImg(
                      result.qr_code_base64 ? String(result.qr_code_base64) : null,
                    );
                    if (
                      result.status === "approved" ||
                      result.status === "authorized"
                    ) {
                      setStatus("approved");
                      void load();
                    }
                  }}
                  submit={async (formData) => {
                    const res = await fetch(
                      `${API_URL}/api/mercadopago/public/booking/${encodeURIComponent(slug)}/appointments/${encodeURIComponent(appointmentId)}/pay`,
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
              ) : (
                <p className="text-sm text-amber-200">
                  Checkout indisponível (sem public key).
                </p>
              )}
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              {qrImg ? (
                <img
                  alt="QR Code PIX"
                  className="mx-auto mt-2 h-56 w-56 rounded-xl bg-white p-2"
                  src={`data:image/png;base64,${qrImg}`}
                />
              ) : null}
              {qrCode ? (
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                    PIX copia e cola
                  </p>
                  <p className="mt-2 break-all font-mono text-[11px] text-neutral-300">
                    {qrCode}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void navigator.clipboard.writeText(qrCode)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copiar código
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
