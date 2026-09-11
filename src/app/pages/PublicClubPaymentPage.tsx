import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Copy, Loader2, QrCode } from "lucide-react";
import { Button } from "../components/ui/button";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://wag-backend.onrender.com";

type ClubPaySession = {
  store_name: string | null;
  slug: string | null;
  member: { id: string; client_name: string; status: string; active: boolean };
  plan: { id: string; name: string; description: string | null; price_brl: number } | null;
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PublicClubPaymentPage() {
  const { slug = "", memberId = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ClubPaySession | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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

  async function payPix() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/mercadopago/public/club/${encodeURIComponent(slug)}/members/${encodeURIComponent(memberId)}/pay`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method: "pix" }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no PIX.");
      setStatus(String(data.status || ""));
      setQrCode(data.qr_code ? String(data.qr_code) : null);
      setQrImg(data.qr_code_base64 ? String(data.qr_code_base64) : null);
      if (data.status === "approved" || data.already_paid) setStatus("approved");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

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

  const paid = status === "approved" || session.member.active;
  const price = Number(session.plan?.price_brl) || 0;

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
            <div className="mt-6 space-y-3">
              <Button className="w-full" disabled={busy} onClick={() => void payPix()}>
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="mr-2 h-4 w-4" />
                )}
                Pagar mensalidade com PIX
              </Button>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
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
