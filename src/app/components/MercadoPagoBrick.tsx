import { useEffect, useMemo, useState } from "react";
import { initMercadoPago, Payment, CardPayment } from "@mercadopago/sdk-react";
import { Loader2 } from "lucide-react";

type BrickMode = "payment" | "card";

type Props = {
  publicKey: string;
  amount: number;
  mode?: BrickMode;
  payerEmail?: string | null;
  onPaid: (result: {
    status?: string;
    payment_id?: string;
    preapproval_id?: string;
    qr_code?: string | null;
    qr_code_base64?: string | null;
  }) => void;
  onError: (message: string) => void;
  /** Envia formData do Brick ao backend. */
  submit: (formData: Record<string, unknown>) => Promise<{
    status?: string;
    payment_id?: string;
    preapproval_id?: string;
    already_paid?: boolean;
    already_subscribed?: boolean;
    qr_code?: string | null;
    qr_code_base64?: string | null;
    error?: string;
  }>;
};

/**
 * Payment Brick (PIX + cartão) ou CardPayment Brick (só cartão / assinatura).
 */
export function MercadoPagoBrick({
  publicKey,
  amount,
  mode = "payment",
  payerEmail,
  onPaid,
  onError,
  submit,
}: Props) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    initMercadoPago(publicKey, { locale: "pt-BR" });
    setReady(true);
  }, [publicKey]);

  const initialization = useMemo(
    () => ({
      amount: Math.max(1, Math.round(Number(amount) * 100) / 100),
      ...(payerEmail ? { payer: { email: payerEmail } } : {}),
    }),
    [amount, payerEmail],
  );

  async function handleSubmit(formData: Record<string, unknown>) {
    setBusy(true);
    try {
      const result = await submit(formData);
      if (result.error) {
        onError(result.error);
        return;
      }
      onPaid(result);
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!publicKey) {
    return (
      <p className="text-sm text-amber-200">
        Public key do Mercado Pago ausente. Vincule a conta no painel.
      </p>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Preparando checkout…
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl bg-white p-2 text-neutral-900 ${busy ? "opacity-70" : ""}`}>
      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-700" />
        </div>
      ) : null}
      {mode === "card" ? (
        <CardPayment
          initialization={initialization}
          onSubmit={async (formData) => {
            await handleSubmit(formData as unknown as Record<string, unknown>);
          }}
          onError={(err) =>
            onError(
              (err && typeof err === "object" && "message" in err
                ? String((err as { message: string }).message)
                : null) || "Erro no Brick de cartão.",
            )
          }
        />
      ) : (
        <Payment
          initialization={initialization}
          customization={{
            paymentMethods: {
              // PIX (bankTransfer) primeiro na UI do Brick
              maxInstallments: 12,
              bankTransfer: "all",
              creditCard: "all",
              debitCard: "all",
              ticket: "all",
            },
          }}
          onSubmit={async ({ formData }) => {
            await handleSubmit(formData as unknown as Record<string, unknown>);
          }}
          onError={(err) =>
            onError(
              (err && typeof err === "object" && "message" in err
                ? String((err as { message: string }).message)
                : null) || "Erro no Payment Brick.",
            )
          }
        />
      )}
    </div>
  );
}
