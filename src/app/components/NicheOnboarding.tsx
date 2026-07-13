import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BUSINESS_NICHE_OPTIONS, type BusinessNicheId } from "../lib/businessNiche";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { apiFetch } from "../lib/apiFetch";

export function NicheOnboarding() {
  const { user, refreshProfile } = useAuth();
  const [niche, setNiche] = useState<BusinessNicheId | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [storeName, setStoreName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    niche !== null &&
    (niche !== "outro" || customLabel.trim().length >= 2);

  const handleSubmit = async () => {
    if (!user?.email || !canSubmit || !niche) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/settings/store", {
        method: "POST",
        body: JSON.stringify({
          storeName: storeName.trim() || undefined,
          businessNiche: niche,
          businessNicheCustom: niche === "outro" ? customLabel.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error || "Não foi possível salvar. Tente de novo.");
        return;
      }

      await refreshProfile({ force: true });
    } catch {
      setError("Erro de rede. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-[32px] shadow-wg-elevated border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] px-8 py-9 text-white text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Configuração inicial
            </div>
            <h1 className="text-2xl font-black tracking-tight">Qual é o nicho do seu negócio?</h1>
            <p className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
              Assim a IA fala a língua certa com seus clientes — sem chamar manicure de barbeiro.
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {BUSINESS_NICHE_OPTIONS.map((opt) => {
                const active = niche === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNiche(opt.id)}
                    className={`text-left rounded-2xl border-2 px-4 py-4 transition-all ${
                      active
                        ? "border-[#64b34d] bg-green-50/60 shadow-wg-subtle"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <p className="font-black text-slate-900 text-sm tracking-tight">{opt.label}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {niche === "outro" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Descreva o negócio
                </Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Ex.: Studio de sobrancelhas"
                  className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Nome de exibição (opcional)
              </Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Como a IA deve se apresentar"
                className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <Button
              type="button"
              disabled={!canSubmit || saving}
              onClick={() => void handleSubmit()}
              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-base hover:bg-slate-800"
            >
              {saving ? <Loader2 className="animate-spin" /> : "Continuar para o Dashboard"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
