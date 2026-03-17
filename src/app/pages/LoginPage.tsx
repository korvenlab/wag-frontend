import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 

export function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verificando sessão...");

  useEffect(() => {
    // Função separada e agressiva para garantir a sincronização
    const syncSessionWithBackend = async (session: any) => {
      // Se não houver token do Google, ignoramos e esperamos o utilizador clicar no botão
      if (!session?.provider_token || !session?.user) {
        setStatus("Aguardando login com Google...");
        return;
      }

      setStatus("🚀 Enviando credenciais para a Lucy...");
      
      const BACKEND_URL = "https://wag-backend.onrender.com/api/auth/sync";

      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            accessToken: session.provider_token,
            refreshToken: session.provider_refresh_token,
            expiresAt: session.expires_at
          })
        });

        if (response.ok) {
          setStatus("✅ Sucesso! Sincronizado com o banco.");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          const errData = await response.json();
          alert("O servidor recusou os dados: " + JSON.stringify(errData));
          navigate("/dashboard");
        }
      } catch (err) {
        alert("❌ Erro de conexão com o Render. O servidor pode estar offline.");
        navigate("/dashboard");
      }
    };

    // 1. Tenta sincronizar imediatamente com a sessão que já está guardada no navegador
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("Sessão detetada no carregamento!");
        syncSessionWithBackend(session);
      }
    });

    // 2. Fica à escuta de qualquer mudança (Novo Login, Restauro de Sessão, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[EVENTO SUPABASE]: ${event}`);
      
      // Captura qualquer evento que signifique "O utilizador está logado"
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        if (session) {
          syncSessionWithBackend(session);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setStatus("Redirecionando para o Google...");
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + "/login",
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-sm w-full"
      >
        <img src="/logo.png" className="w-24 h-24 mx-auto" alt="Logo" />
        <h1 className="text-4xl font-extrabold tracking-tight">WAG BOT</h1>
        
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm font-medium text-gray-600">{status}</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
        >
          Entrar com Google
        </button>
      </motion.div>
    </div>
  );
}
