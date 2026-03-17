import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { supabase } from "../lib/supabase"; 

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Função isolada para sincronizar, garantindo que o fetch termine antes de mudar de página
    const syncData = async (session: any) => {
      if (!session?.provider_token || !session.user?.email) return;

      try {
        console.log("🔄 Iniciando sincronização com o backend...");
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${apiUrl}/api/auth/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.user.email,
            accessToken: session.provider_token,
            refreshToken: session.provider_refresh_token || null,
            expiresAt: session.expires_at
          })
        });

        if (response.ok) {
          console.log("✅ Dados salvos no banco. Redirecionando...");
          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          console.error("❌ O servidor recusou a sincronização:", errorData);
          // Mesmo com erro no sync, levamos o usuário para dentro, mas avisamos no log
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("❌ Erro de conexão com o Backend (CORS ou URL):", err);
        navigate("/dashboard");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Evento Auth:", event);
      
      if (event === "SIGNED_IN" && session) {
        await syncData(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      // Limpar sessão antiga antes de novo login para garantir novos tokens
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // IMPORTANTE: Não mande direto para o /dashboard aqui, 
          // deixe o LoginPage processar o evento primeiro
          redirectTo: window.location.origin + "/login", 
          scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Erro durante o login:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-100/20 blur-3xl" />
      </div>

      <motion.button
        onClick={() => navigate("/")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Voltar</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent mb-3">
              WAG BOT
            </h1>
            <p className="text-gray-600">Entre com sua conta Google</p>
          </div>

          <motion.button
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continuar com Google</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
