import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase"; 
import { ArrowLeft } from "lucide-react"; // Importe um ícone para o botão

export function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verificando sessão...");
  const syncProcessed = useRef(false);

  useEffect(() => {
    const syncSessionWithBackend = async (session: any, retries = 3) => {
      if (syncProcessed.current) return;

      if (!session?.provider_token || !session?.user) {
        setStatus("Aguardando login com Google...");
        return;
      }

      const BACKEND_URL = "https://wag-backend.onrender.com/api/auth/sync";

      for (let i = 0; i < retries; i++) {
        try {
          setStatus(i === 0 ? "🚀 Sincronizando com a Lucy..." : `⏳ Servidor acordando (Tentativa ${i + 1})...`);
          
          const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              accessToken: session.provider_token,
              refreshToken: session.provider_refresh_token,
              expiresAt: session.expires_at
            })
          });

          if (response.ok) {
            syncProcessed.current = true;
            setStatus("✅ Sucesso! Sincronizado.");
            setTimeout(() => navigate("/dashboard"), 1000);
            return;
          } else {
            if (response.status === 400) break;
          }
        } catch (err) {
          if (i < retries - 1) await new Promise(res => setTimeout(res, 3000));
        }
      }
      navigate("/dashboard");
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) syncSessionWithBackend(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (["SIGNED_IN", "INITIAL_SESSION", "TOKEN_REFRESHED"].includes(event) && session) {
        syncSessionWithBackend(session);
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative">
      
      {/* FEATURE: Botão Voltar no Topo Esquerdo */}
      <div className="absolute top-8 left-8">
        <button 
          onClick={() => window.location.href = "https://wagoobot.com"}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-medium transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para o site
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-12 max-w-sm w-full"
      >
        <div className="flex justify-center">
          <img 
            src="/logo.png" 
            className="w-56 h-auto object-contain" 
            alt="Wag Logo" 
          />
        </div>
        
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 min-h-[60px] flex items-center justify-center">
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
