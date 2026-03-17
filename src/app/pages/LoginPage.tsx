import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 

export function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Iniciando...");

  useEffect(() => {
    const processAuth = async () => {
      // 1. Buscamos a sessão ativa imediatamente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro ao buscar sessão:", error);
        setStatus("Erro ao carregar sessão.");
        return;
      }

      if (session?.provider_token) {
        setStatus("🚀 Credenciais Google detectadas! Salvando...");
        
        // URL direta para evitar problemas de .env
        const BACKEND_URL = "https://wag-backend.onrender.com/api/auth/sync";

        try {
          const response = await fetch(BACKEND_URL, {
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
            setStatus("✅ Sucesso! Entrando...");
            setTimeout(() => navigate("/dashboard"), 1000);
          } else {
            const errData = await response.json();
            alert("O servidor Lucy recusou os dados: " + JSON.stringify(errData));
            navigate("/dashboard");
          }
        } catch (err) {
          alert("❌ Erro de conexão com o Render. O servidor pode estar offline.");
          navigate("/dashboard");
        }
      } else {
        setStatus("Aguardando login com Google...");
      }
    };

    processAuth();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setStatus("Redirecionando para o Google...");
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redireciona de volta para esta mesma página para processar o useEffect
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
