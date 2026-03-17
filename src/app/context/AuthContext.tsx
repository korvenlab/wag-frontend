import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

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
  
  // O loading começa como true para "segurar" a tela até o Supabase responder
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função que vai ao banco de dados ler se o utilizador já pagou
    const fetchProfile = async (authUser: User) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_paid')
          .eq('id', authUser.id)
          .maybeSingle(); // <-- CORREÇÃO: Impede o erro 406 (PGRST116)

        if (error) {
          console.error("Erro ao buscar perfil no Supabase:", error);
          setUser({ ...authUser, hasPaid: false });
          return;
        }

        // Atualiza o estado com os dados reais do banco (se data for null, assume false)
        setUser({ ...authUser, hasPaid: data?.has_paid || false });
      } catch (error) {
        console.error("Erro inesperado ao buscar perfil:", error);
        setUser({ ...authUser, hasPaid: false });
      } finally {
        setLoading(false);
      }
    };

    // 1. Quando o site abre, pergunta ao Supabase se há alguém logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // 2. Fica à escuta de mudanças (ex: a pessoa acabou de voltar da tela do Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // A função de logout agora avisa o servidor para destruir a sessão
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {/* O site inteiro só é desenhado DEPOIS que a verificação inicial terminar */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado mantido exatamente como você criou (excelente prática!)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
