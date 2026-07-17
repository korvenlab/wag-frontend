import { Crown, type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type PlanFeatureGateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onUpgrade?: () => void;
  upgrading?: boolean;
};

/** Tela de bloqueio para recursos exclusivos Pro / Pro+ (plano Basic). */
export function PlanFeatureGate({
  icon: Icon,
  title,
  description,
  onUpgrade,
  upgrading,
}: PlanFeatureGateProps) {
  return (
    <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-10 md:p-14 text-center max-w-xl mx-auto">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
        <Icon className="w-8 h-8" strokeWidth={2.25} />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-4">
        <Crown className="w-3 h-3 text-amber-300" />
        Pro e Pro+
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
        {title}
      </h2>
      <p className="text-slate-500 font-medium leading-relaxed mb-8">{description}</p>
      {onUpgrade ? (
        <Button
          type="button"
          onClick={onUpgrade}
          disabled={upgrading}
          className="h-12 px-8 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
        >
          {upgrading ? "Abrindo checkout…" : "Fazer upgrade para Pro"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => {
            window.location.href = "/#precos";
          }}
          className="h-12 px-8 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black shadow-wg-green-cta"
        >
          Ver planos Pro e Pro+
        </Button>
      )}
    </Card>
  );
}
