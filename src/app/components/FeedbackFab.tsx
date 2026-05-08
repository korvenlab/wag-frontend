import { useState } from "react";
import { CircleHelp, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const MIN_LEN = 5;
const MAX_LEN = 8000;

/** Envia feedback para `feedback_messages` (Supabase Wagoo → Korven /feedback/messages). */
export function FeedbackFab() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const resetForm = () => setBody("");

  const submit = async () => {
    const trimmed = body.trim();
    if (!user) {
      toast.error("Faça login para enviar sua mensagem.");
      return;
    }
    if (trimmed.length < MIN_LEN) {
      toast.error(`Descreva com pelo menos ${MIN_LEN} caracteres.`);
      return;
    }
    if (trimmed.length > MAX_LEN) {
      toast.error(`Texto longo demais (máximo ${MAX_LEN} caracteres).`);
      return;
    }

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Sessão expirada. Entre novamente.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("store_name")
        .eq("id", user.id)
        .maybeSingle();

      const metaName =
        typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;

      const { error } = await supabase.from("feedback_messages").insert({
        user_id: user.id,
        organization_id: null,
        user_email: user.email ?? null,
        user_full_name: profile?.store_name ?? metaName,
        body: trimmed,
      });

      if (error) {
        toast.error(error.message || "Não foi possível enviar sua mensagem.");
        return;
      }
      toast.success("Obrigado! Sua mensagem foi enviada.");
      resetForm();
      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Ajuda e feedback"
          className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#64b34d]/30 bg-[#64b34d] text-white shadow-xl shadow-green-900/10 transition hover:bg-[#4d8f3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64b34d] focus-visible:ring-offset-2"
        >
          <CircleHelp className="h-7 w-7" strokeWidth={2} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[min(100vw,26rem)] flex-col gap-0 border-slate-100 bg-white sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="text-slate-900">Ajuda e feedback</SheetTitle>
          <SheetDescription className="text-slate-500">
            Encontrou um bug ou tem uma sugestão? Envie para a equipe Korven — aparece no painel com origem Wagoo.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-1 flex-col gap-4 px-1 pb-6">
          <div className="grid gap-2">
            <Label htmlFor="feedback-body-wagoo" className="text-slate-700">
              Sua mensagem
            </Label>
            <Textarea
              id="feedback-body-wagoo"
              placeholder="Descreva o que aconteceu ou sua ideia…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={MAX_LEN}
              disabled={sending}
              className="min-h-[160px] resize-none rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#64b34d]"
            />
            <p className="text-xs text-slate-400">
              {body.trim().length}/{MAX_LEN} caracteres (mín. {MIN_LEN})
            </p>
          </div>
          <Button
            type="button"
            className="mt-auto h-12 rounded-xl bg-[#64b34d] font-bold text-white hover:bg-[#4d8f3b]"
            disabled={sending || body.trim().length < MIN_LEN}
            onClick={() => void submit()}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
