import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import type { WagooPlanTier } from "../lib/wagooPlans";

export type AppUser = User & {
  hasPaid: boolean;
  multiBarberPlan: boolean;
  subscriptionTier: WagooPlanTier | null;
  maxTeamUsers: number;
  teamUsersUsed: number;
};

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  /** Recarrega perfil via API. Use `force: true` após checkout ou alterações críticas. */
  refreshProfile: (options?: { force?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let globalSyncedToken: string | null = null;

const WAGOO_PROMO_STORAGE_KEY = "wagoo_promo_code";

/** Evita refetch ao trocar de aba/janela a cada foco. */
const VISIBILITY_REFRESH_MIN_MS = 2 * 60 * 1000;

type ProfileSnapshot = Pick<
  AppUser,
  "hasPaid" | "multiBarberPlan" | "subscriptionTier" | "maxTeamUsers" | "teamUsersUsed"
>;

function sameProfileFields(a: ProfileSnapshot | null, b: ProfileSnapshot): boolean {
  if (!a) return false;
  return (
    a.hasPaid === b.hasPaid &&
    a.multiBarberPlan === b.multiBarberPlan &&
    a.subscriptionTier === b.subscriptionTier &&
    a.maxTeamUsers === b.maxTeamUsers &&
    a.teamUsersUsed === b.teamUsersUsed
  );
}

async function tryRedeemPendingPromo(accessToken: string, backendUrl: string): Promise<void> {
  const code = sessionStorage.getItem(WAGOO_PROMO_STORAGE_KEY)?.trim().toLowerCase();
  if (!code) return;
  try {
    const res = await fetch(`${backendUrl}/api/promo/redeem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if (res.ok || res.status === 404 || res.status === 409) {
      sessionStorage.removeItem(WAGOO_PROMO_STORAGE_KEY);
      return;
    }
    const body = await res.text();
    console.warn("[wagoo promo] resgate não concluído:", res.status, body);
  } catch (e) {
    console.warn("[wagoo promo] resgate:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const lastVisibilityRefreshRef = useRef(0);

  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://wag-backend.onrender.com";

  const fetchProfileAndSetUser = useCallback(
    async (authUser: User, session: Session | null) => {
      const token = session?.access_token;
      if (!token) {
        setUser({
          ...authUser,
          hasPaid: false,
          multiBarberPlan: false,
          subscriptionTier: null,
          maxTeamUsers: 0,
          teamUsersUsed: 0,
        });
        return;
      }

      const response = await fetch(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setUser({
          ...authUser,
          hasPaid: false,
          multiBarberPlan: false,
          subscriptionTier: null,
          maxTeamUsers: 0,
          teamUsersUsed: 0,
        });
        return;
      }

      const profileData = (await response.json()) as {
        has_paid?: boolean;
        has_access?: boolean;
        multi_barber_plan?: boolean;
        subscription_tier?: WagooPlanTier | null;
        max_team_users?: number;
        team_users_used?: number;
      };
      const hasPaid =
        typeof profileData.has_access === "boolean"
          ? profileData.has_access
          : !!profileData.has_paid;
      const tier = profileData.subscription_tier ?? null;
      const nextProfile: ProfileSnapshot = {
        hasPaid,
        subscriptionTier: tier,
        maxTeamUsers: profileData.max_team_users ?? 0,
        teamUsersUsed: profileData.team_users_used ?? 0,
        multiBarberPlan:
          !!profileData.multi_barber_plan || tier === "pro" || tier === "pro_plus",
      };

      setUser((prev) => {
        const next: AppUser = { ...authUser, ...nextProfile };
        if (prev?.id === authUser.id && sameProfileFields(prev, nextProfile)) {
          return prev;
        }
        return next;
      });
    },
    [backendUrl],
  );

  const refreshProfile = useCallback(
    async (options?: { force?: boolean }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user || !session.access_token) return;

      if (!options?.force) {
        const elapsed = Date.now() - lastVisibilityRefreshRef.current;
        if (elapsed < VISIBILITY_REFRESH_MIN_MS) return;
      }
      lastVisibilityRefreshRef.current = Date.now();

      await tryRedeemPendingPromo(session.access_token, backendUrl);
      await fetchProfileAndSetUser(session.user, session);
    },
    [fetchProfileAndSetUser, backendUrl],
  );

  useEffect(() => {
    const processUserSession = async (authUser: User, session: Session | null) => {
      try {
        if (session?.provider_token) {
          if (globalSyncedToken !== session.provider_token) {
            globalSyncedToken = session.provider_token;
            try {
              await fetch(`${backendUrl}/api/auth/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: authUser.id,
                  email: authUser.email,
                  accessToken: session.provider_token,
                  refreshToken: session.provider_refresh_token,
                  expiresAt: session.expires_at,
                }),
              });
            } catch (err) {
              console.error("Erro no sync:", err);
            }
          }
        }

        if (session.access_token) {
          await tryRedeemPendingPromo(session.access_token, backendUrl);
        }
        await fetchProfileAndSetUser(authUser, session);
      } catch (error) {
        console.error("❌ Erro ao carregar perfil:", error);
        setUser({
          ...authUser,
          hasPaid: false,
          multiBarberPlan: false,
          subscriptionTier: null,
          maxTeamUsers: 0,
          teamUsersUsed: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") {
          if (event === "SIGNED_OUT") {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        if (session?.user) {
          void processUserSession(session.user, session);
        } else {
          setUser(null);
          setLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [backendUrl, fetchProfileAndSetUser]);

  const logout = async () => {
    globalSyncedToken = null;
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      void refreshProfile();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
