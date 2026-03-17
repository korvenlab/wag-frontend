import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 

export function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "syncing" | "error">("idle");

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Pega a sessão atual logo que a página carrega após o redirect
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token) {
        setStatus("syncing");
        try {
          console.log("🚀 Sessão detectada! Sincronizando com o backend...");
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              accessToken: session.provider_token,
              refreshToken: session.provider_refresh_token,
              expiresAt: session.expires_at
            })
          });

          if (response.ok) {
            console.log("✅ Sincronização concluída com sucesso.");
            navigate("/dashboard");
          } else {
            console.error("❌ O Backend recusou a sincronização.");
            setStatus("error");
          }
        } catch (err) {
          console.error("❌ Falha de rede ao conectar com o Backend:", err);
          setStatus("error");
        }
      }
    };

    handleAuth();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    // IMPORTANTE: Redireciona para o próprio LOGIN para que o useEffect acima processe
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + "/login", 
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        <img src="/logo.png" className="w-20 h-20 mx-auto mb-6" alt="Logo" />
        <h1 className="text-2xl font-bold mb-2">WAG BOT</h1>
        
        <div className="mb-8">
          {status === "syncing" && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-600 font-medium">Salvando suas credenciais...</p>
            </div>
          )}
          {status === "error" && (
            <p className="text-red-500">Erro ao sincronizar. Tente novamente.</p>
          )}
          {status === "idle" && (
            <p className="text-gray-500">Conecte sua conta Google para continuar.</p>
          )}
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={status === "syncing"}
          className="w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Entrar com Google</span>
        </button>
      </motion.div>
    </div>
  );
}
