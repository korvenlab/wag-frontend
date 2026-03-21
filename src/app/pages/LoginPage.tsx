import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 

export function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verificando sessão...");

  useEffect(() => {
    const syncSessionWithBackend = async (session: any) => {
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("Sessão detetada no carregamento!");
        syncSessionWithBackend(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[EVENTO SUPABASE]: ${event}`);
      
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-10 max-w-sm w-full"
      >
        {/* Logo centralizada e com proporção preservada */}
        <div className="flex justify-center">
          <img 
            src="/logo.png" 
            className="w-32 h-auto object-contain" 
            alt="Wag Logo" 
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">WAG BOT</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold">Sua assistente inteligente</p>
        </div>
        
        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
          <p className="text-sm font-medium text-gray-500">{status}</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Entrar com Google
        </button>
      </motion.div>
    </div>
  );
}
