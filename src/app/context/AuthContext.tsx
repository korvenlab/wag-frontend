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
        // 🛑 A CURA DA TROCA DE ABAS: O Supabase dispara eventos ao focar na aba, 
        // mas nós só deixamos passar se for a PRIMEIRA vez absoluta.
        if (!globalProfileFetched) {
          globalProfileFetched = true;
          console.log("🔍 Verificando perfil no Backend...");
          
          // FEATURE: ID injetado na URL para evitar o erro de 'not-null constraint' na criação de perfil
          const response = await fetch(`${backendUrl}/api/user/profile?email=${authUser.email}&id=${authUser.id}`);
          
          if (response.ok) {
            const profileData = await response.json();
            setUser({ ...authUser, hasPaid: profileData.has_paid || false });
          } else {
            setUser({ ...authUser, hasPaid: false });
          }
        } else {
          // Apenas mantém o estado se trocar de aba, sem fazer requisições ao Render
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
