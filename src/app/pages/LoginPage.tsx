useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Log para debug no console do navegador
      console.log("Evento Auth detectado:", event);

      if (event === "SIGNED_IN" && session?.provider_token) {
        try {
          console.log("🔄 Iniciando sincronização obrigatória...");
          
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
            console.log("✅ Dados sincronizados no Render. Indo para Dashboard.");
            navigate("/dashboard");
          } else {
            console.error("❌ O Backend recusou os tokens. Verifique os logs do Render.");
            // Opcional: navigate("/dashboard") mesmo assim ou mostrar erro
          }
        } catch (err) {
          console.error("❌ Erro de rede: O Frontend não conseguiu alcançar o Backend no Render.", err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    // IMPORTANTE: Mude o redirectTo para a própria página de login 
    // ou remova-o para que o useEffect acima processe o retorno do Google.
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
