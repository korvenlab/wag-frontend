import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import type { WagooPlanTier } from "../lib/wagooPlans";

/** Checkout Stripe por plano — landing e página /precos. */
export function usePlanCheckout() {
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<WagooPlanTier | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);

  useEffect(() => {
    void (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u ? { id: u.id, email: u.email } : null);
    })();
  }, []);

  const handleCheckout = useCallback(
    async (planTier: WagooPlanTier) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setLoadingTier(planTier);
      setCheckoutError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          navigate("/login");
          return;
        }
        const apiBase =
          import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
          "https://wag-backend.onrender.com";
        const response = await fetch(apiBase + "/api/stripe/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ email: user.email, userId: user.id, planTier }),
        });
        const data = await response.json();
        if (data.url) window.location.href = data.url;
        else setCheckoutError(data.error || "Checkout indisponível.");
      } catch {
        setCheckoutError("Erro de conexão. Tente de novo em alguns segundos.");
      } finally {
        setLoadingTier(null);
      }
    },
    [navigate, user],
  );

  return { loadingTier, checkoutError, handleCheckout };
}
