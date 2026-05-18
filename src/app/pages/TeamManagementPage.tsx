import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  Plus,
  Sparkles,
  Mail,
  UserRound,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { FeedbackFab } from "../components/FeedbackFab";
import { supabase } from "../lib/supabase";
import { planLabel, type WagooPlanTier } from "../lib/wagooPlans";

type Barbeiro = {
  id: string;
  nome: string;
  google_calendar_email: string;
  ativo: boolean;
};

export function TeamManagementPage() {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://wag-backend.onrender.com";

  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [subscriptionTier, setSubscriptionTier] = useState<WagooPlanTier | null>(null);
  const [maxTeamUsers, setMaxTeamUsers] = useState(0);
  const [teamUsersUsed, setTeamUsersUsed] = useState(0);
  const [canAddTeamMember, setCanAddTeamMember] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState<WagooPlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const loadTeam = useCallback(async () => {
    setLoadingTeam(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${backendUrl}/api/barbeiros`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) {
        setError("Não foi possível carregar a equipe.");
        return;
      }
      const data = await res.json();
      setBarbeiros(data.barbeiros ?? []);
      setSubscriptionTier(data.subscription_tier ?? null);
      setMaxTeamUsers(data.max_team_users ?? 0);
      setTeamUsersUsed(data.team_users_used ?? 0);
      setCanAddTeamMember(!!data.can_add_team_member);
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoadingTeam(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (loading || !user) return;
    if (!user.hasPaid) {
      navigate("/#precos");
      return;
    }
    void loadTeam();
  }, [user, loading, navigate, loadTeam]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success" || params.get("checkout") === "multi_barber_success") {
      void refreshProfile();
      void loadTeam();
      window.history.replaceState({}, "", "/dashboard/equipe");
    }
  }, [refreshProfile, loadTeam]);

  const handleUpgradeCheckout = async (targetTier: WagooPlanTier) => {
    if (!user) return;
    setUpgrading(targetTier);
    try {
      const token = await getToken();
      if (!token) return navigate("/login");

      const res = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          planTier: targetTier,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Checkout indisponível no momento.");
    } catch {
      setError("Erro ao iniciar upgrade.");
    } finally {
      setUpgrading(null);
    }
  };

  const handleAdd = async () => {
    if (!canAddTeamMember) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/barbeiros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nome.trim(), google_calendar_email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "team_limit_reached") {
          setError(data.message || "Limite de usuários do plano atingido.");
        } else {
          setError(data.message || data.error || "Não foi possível cadastrar.");
        }
        return;
      }
      setNome("");
      setEmail("");
      await loadTeam();
      void refreshProfile();
    } catch {
      setError("Erro ao cadastrar profissional.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (b: Barbeiro, ativo: boolean) => {
    if (!subscriptionTier) return;
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/barbeiros/${b.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativo }),
      });
      if (res.ok) {
        setBarbeiros((prev) => prev.map((x) => (x.id === b.id ? { ...x, ativo } : x)));
      }
    } catch {
      setError("Erro ao atualizar status.");
    }
  };

  if (loading || !user?.hasPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" />
      </div>
    );
  }

  const showNoPlanPaywall = !subscriptionTier;
  const atLimit = subscriptionTier !== null && teamUsersUsed >= maxTeamUsers;
  const upgradeTarget: WagooPlanTier | null =
    subscriptionTier === "basic" ? "pro" : subscriptionTier === "pro" ? "pro_plus" : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />

      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            className="rounded-xl gap-2 font-bold text-slate-600"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={18} />
            Voltar
          </Button>
          <img src="/logo.png" alt="Wagoo" className="w-10 h-10 object-contain lg:hidden" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 pb-24">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Equipe &amp; Agendas
              </h1>
              {subscriptionTier ? (
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 border-0 font-black uppercase tracking-wider text-[10px] px-3 py-1 gap-1">
                  <Crown size={12} />
                  {planLabel(subscriptionTier)}
                </Badge>
              ) : null}
            </div>
            <p className="text-slate-500 font-medium">
              Cadastre profissionais e a IA direciona agendamentos com convite no Google Agenda.
            </p>
            {subscriptionTier ? (
              <p className="text-sm font-bold text-slate-700">
                Usuários: {teamUsersUsed} / {maxTeamUsers}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <div
            className={`space-y-6 transition-all duration-300 ${
              showNoPlanPaywall ? "blur-md pointer-events-none select-none" : ""
            }`}
          >
            <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Plus className="text-[#64b34d]" size={20} />
                  Novo profissional
                </CardTitle>
                <CardDescription className="font-medium">
                  {canAddTeamMember
                    ? "Nome e e-mail do Google Agenda que receberá o convite do compromisso."
                    : atLimit
                      ? `Limite do plano ${planLabel(subscriptionTier)} atingido (${maxTeamUsers} usuário(s)).`
                      : "Assine um plano para cadastrar profissionais."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Nome do barbeiro
                    </Label>
                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <Input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: João Silva"
                        className="h-12 pl-11 rounded-xl bg-slate-50 border-none font-semibold"
                        disabled={!canAddTeamMember}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      E-mail do Google Agenda
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="barbeiro@gmail.com"
                        className="h-12 pl-11 rounded-xl bg-slate-50 border-none font-semibold"
                        disabled={!canAddTeamMember}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={saving || !canAddTeamMember || !nome.trim() || !email.trim()}
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#64b34d] hover:bg-[#4d8f3b] font-black"
                >
                  {saving ? <Loader2 className="animate-spin" /> : "Adicionar à equipe"}
                </Button>
                {atLimit && upgradeTarget ? (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-8 rounded-xl font-black border-amber-400 text-amber-700"
                    disabled={upgrading !== null}
                    onClick={() => void handleUpgradeCheckout(upgradeTarget)}
                  >
                    {upgrading === upgradeTarget ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      `Upgrade para ${planLabel(upgradeTarget)}`
                    )}
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Users className="text-[#64b34d]" size={20} />
                  Profissionais cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                {loadingTeam ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[#64b34d]" />
                  </div>
                ) : barbeiros.length === 0 ? (
                  <p className="text-slate-400 font-medium text-center py-8">
                    Nenhum profissional cadastrado ainda.
                  </p>
                ) : (
                  barbeiros.map((b, i) => (
                    <div
                      key={b.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border-2 transition-all ${
                        b.ativo
                          ? "bg-white border-[#64b34d]/15 shadow-wg-subtle"
                          : "bg-slate-50/80 border-transparent opacity-75"
                      }`}
                    >
                      <div>
                        <p className="font-black text-slate-900 text-lg">{b.nome}</p>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                          {b.google_calendar_email}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                          {b.ativo ? "Ativo na IA" : "Pausado na IA"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">Ativo</span>
                        <Switch
                          checked={b.ativo}
                          onCheckedChange={(v) => handleToggle(b, v)}
                          className="data-[state=checked]:bg-[#64b34d]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {error && !showNoPlanPaywall ? (
              <p className="text-red-500 text-sm font-bold text-center">{error}</p>
            ) : null}
          </div>

          {showNoPlanPaywall ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
              <Card className="max-w-md w-full rounded-[32px] border-none shadow-2xl bg-white/95 backdrop-blur-sm p-8 text-center space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
                  <Sparkles className="text-[#64b34d] w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Escolha um plano Wagoo
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Basic (1 usuário), Pro (até 3) ou Pro+ (até 5). Todos incluem as mesmas funções
                    de IA e integrações.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/#precos")}
                  className="w-full h-14 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] font-black text-base shadow-wg-green-cta"
                >
                  Ver planos
                </Button>
              </Card>
            </div>
          ) : null}
        </div>
      </main>

      <FeedbackFab />
    </div>
  );
}
