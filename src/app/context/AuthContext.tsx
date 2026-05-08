import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export type AppUser = User & {
  hasPaid: boolean;
};

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  /** Recarrega `hasPaid` e dados do perfil via API autenticada (Bearer). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let globalSyncedToken: string | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://wag-backend.onrender.com";

  const fetchProfileAndSetUser = useCallback(
    async (authUser: User, session: Session | null) => {
      const token = session?.access_token;
      if (!token) {
        setUser({ ...authUser, hasPaid: false });
        return;
      }

      const response = await fetch(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setUser({ ...authUser, hasPaid: false });
        return;
      }

      const profileData = (await response.json()) as { has_paid?: boolean };
      setUser({ ...authUser, hasPaid: !!profileData.has_paid });
    },
    [backendUrl],
  );

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    await fetchProfileAndSetUser(session.user, session);
  }, [fetchProfileAndSetUser]);

  useEffect(() => {
    const processUserSession = async (authUser: User, session: Session | null) => {
      try {
        if (session?.provider_token) {
          if (globalSyncedToken !== session.provider_token) {
            globalSyncedToken = session.provider_token;
            fetch(`${backendUrl}/api/auth/sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: authUser.id,
                email: authUser.email,
                accessToken: session.provider_token,
                refreshToken: session.provider_refresh_token,
                expiresAt: session.expires_at,
              }),
            }).catch((err) => console.error("Erro no sync:", err));
          }
        }

        await fetchProfileAndSetUser(authUser, session);
      } catch (error) {
        console.error("❌ Erro ao carregar perfil:", error);
        setUser({ ...authUser, hasPaid: false });
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
