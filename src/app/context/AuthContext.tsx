import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

// Juntamos os dados oficiais do Supabase com a nossa regra de negócio (hasPaid)
export type AppUser = User & {
  hasPaid: boolean;
};

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🛑 VARIÁVEIS GLOBAIS (Imortais)
// Estas variáveis vivem fora do React. Sobrevivem a re-renderizações e redirecionamentos.
let globalSyncedToken: string | null = null;
let globalProfileFetched = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || "https://wag-backend.onrender.com";

    const processUserSession = async (authUser: User, session: Session | null, event: string) => {
      try {
        // 1. SINCRONIZAÇÃO DO GOOGLE
        if (session?.provider_token) {
          
          // O Escudo Global: Bloqueia se a chave já foi enviada nesta sessão do navegador
          if (globalSyncedToken === session.provider_token) {
             // Ignora silenciosamente. Fim do loop.
          } else {
             globalSyncedToken = session.provider_token;
             console.log(`🚀 Enviando tokens do Google (Evento: ${event})...`);
             
             // Executa a chamada HTTP sem travar a interface
             fetch(`${backendUrl}/api/auth/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: authUser.id,
                  email: authUser.email,
                  accessToken: session.provider_token,
                  refreshToken: session.provider_refresh_token,
                  expiresAt: session.expires_at
                })
             }).catch(err => console.error("Erro no sync:", err));
          }
        }

        // 2. LEITURA DE PERFIL
        // Só precisamos buscar o perfil na primeira vez que o site carrega ou quando há um login novo
        if (!globalProfileFetched || event === "SIGNED_IN") {
          globalProfileFetched = true;
          console.log("🔍 Verificando perfil no Backend...");
          
          const response = await fetch(`${backendUrl}/api/user/profile?email=${authUser.email}`);
          
          if (response.ok) {
            const profileData = await response.json();
            setUser({ ...authUser, hasPaid: profileData.has_paid || false });
          } else {
            setUser({ ...authUser, hasPaid: false });
          }
        } else {
          // Se já buscou antes, apenas atualiza o estado para não gerar travamentos na tela
          setUser(prev => prev ? { ...prev } : { ...authUser, hasPaid: false });
        }

      } catch (error) {
        console.error("❌ Erro de comunicação com o Backend:", error);
        setUser({ ...authUser, hasPaid: false });
      } finally {
        setLoading(false);
      }
    };

    // Fica a ouvir as mudanças de estado da sessão do utilizador
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Filtramos apenas os eventos que realmente importam para não gerar loops
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          processUserSession(session.user, session, event);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    // Ao sair, limpamos as variáveis globais para o próximo utilizador
    globalSyncedToken = null;
    globalProfileFetched = false;
    
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook de utilização
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
