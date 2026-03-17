import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛑 FEATURE: A Trava de Memória (Evita o spam de logs no Render)
  const lastSyncedToken = useRef<string | null>(null);

  useEffect(() => {
    // Aponta para o seu servidor seguro no Render
    const backendUrl = import.meta.env.VITE_API_URL || "https://wag-backend.onrender.com";

    const processUserSession = async (authUser: User, session: Session | null) => {
      try {
        // 1. SINCRONIZAÇÃO DO GOOGLE (Garante que os tokens são salvos)
        if (session?.provider_token) {
          
          // Verifica se a chave atual é exatamente igual à que já enviámos
          if (lastSyncedToken.current === session.provider_token) {
            // Token repetido: Não fazemos nada, ignoramos o envio para não dar spam
          } else {
            // Token novo: Salvamos na memória e enviamos para o Render
            lastSyncedToken.current = session.provider_token;
            
            console.log("🚀 Enviando tokens do Google para o Backend...");
            await fetch(`${backendUrl}/api/auth/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: authUser.id,
                email: authUser.email,
                accessToken: session.provider_token,
                refreshToken: session.provider_refresh_token,
                expiresAt: session.expires_at
              })
            });
          }
        }

        // 2. CRIAÇÃO / LEITURA DE PERFIL (Aciona a criação automática)
        // Fazemos o pedido ao Backend, o que acionará a lógica que fizemos no server.ts
        console.log("🔍 Verificando perfil no Backend...");
        const response = await fetch(`${backendUrl}/api/user/profile?email=${authUser.email}`);
        
        if (response.ok) {
          const profileData = await response.json();
          // Atualiza o estado da aplicação com os dados vindos do banco
          setUser({ ...authUser, hasPaid: profileData.has_paid || false });
        } else {
          console.warn("⚠️ O Backend não conseguiu devolver o perfil.");
          setUser({ ...authUser, hasPaid: false });
        }

      } catch (error) {
        console.error("❌ Erro de comunicação com o Backend:", error);
        setUser({ ...authUser, hasPaid: false });
      } finally {
        setLoading(false);
      }
    };

    // Quando o site abre pela primeira vez
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        processUserSession(session.user, session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Quando o utilizador faz login ou a sessão é atualizada
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        processUserSession(session.user, session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Limpa a memória ao sair para que um novo utilizador possa sincronizar
    lastSyncedToken.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {/* A aplicação só renderiza depois das validações terminarem */}
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
