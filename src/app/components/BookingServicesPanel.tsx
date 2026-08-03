import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Scissors, Trash2, X } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type BookingService = {
  id: string;
  name: string;
  description?: string;
  price_brl: number;
  duration_minutes: number;
  image_url?: string | null;
  active?: boolean;
};

type BookingServicesPanelProps = {
  subtitle?: string;
};

const DURATION_PRESETS = [15, 30, 45, 60, 90] as const;

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parsePriceInput(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/**
 * Cadastro de serviços (booking_services) — usado na Agenda Web e nos planos com IA.
 */
export function BookingServicesPanel({
  subtitle = "A IA usa esta lista no WhatsApp para falar preços. Com o sinal ligado, também cobra daqui.",
}: BookingServicesPanelProps) {
  const [services, setServices] = useState<BookingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newImage, setNewImage] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeServices = services.filter((s) => s.active !== false);
  const isEmpty = activeServices.length === 0;

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/booking/me");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Não foi possível carregar os serviços.");
        return;
      }
      setServices(data.services ?? []);
      setError(null);
    } catch {
      setError("Erro de rede ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (isEmpty) setFormOpen(true);
  }, [isEmpty]);

  useEffect(() => {
    if (formOpen) {
      const t = window.setTimeout(() => nameRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [formOpen]);

  function resetForm() {
    setNewName("");
    setNewDesc("");
    setNewPrice("");
    setNewDuration("30");
    setNewImage(null);
    setShowExtras(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadServiceImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Falha ao ler imagem"));
        reader.readAsDataURL(file);
      });
      const res = await apiFetch("/api/booking/upload", {
        method: "POST",
        body: JSON.stringify({ dataUrl, kind: "service" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Upload falhou");
      setNewImage(String(data.url));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload falhou");
    } finally {
      setUploading(false);
    }
  }

  async function addService() {
    const name = newName.trim();
    const price = parsePriceInput(newPrice);
    const duration = Number(newDuration) || 0;

    if (name.length < 2) {
      setError("Digite o nome do serviço.");
      nameRef.current?.focus();
      return;
    }
    if (!newPrice.trim() || price <= 0) {
      setError("Informe um preço válido (ex.: 50 ou 45,90).");
      return;
    }
    if (duration < 5) {
      setError("Escolha a duração (mínimo 5 minutos).");
      return;
    }

    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const res = await apiFetch("/api/booking/services", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: newDesc.trim(),
          price_brl: price,
          duration_minutes: duration,
          image_url: newImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adicionar");
      setServices((s) => [...s, data]);
      resetForm();
      setMsg(`“${name}” adicionado.`);
      if (!isEmpty) setFormOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao adicionar");
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemoveService() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/booking/services/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setServices((s) => s.filter((x) => x.id !== pendingDelete.id));
        setMsg("Serviço removido.");
        setPendingDelete(null);
      } else {
        setError("Não foi possível remover.");
      }
    } catch {
      setError("Erro de rede ao remover.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Carregando…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {subtitle.trim() ? (
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-2xl px-4 py-3">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p className="text-sm font-semibold text-[#64b34d] bg-[#64b34d]/10 rounded-2xl px-4 py-3">
          {msg}
        </p>
      ) : null}

      {/* Lista */}
      {!isEmpty ? (
        <div className="rounded-[28px] border border-slate-100 bg-white shadow-wg-subtle overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-900">
                {activeServices.length}{" "}
                {activeServices.length === 1 ? "serviço" : "serviços"}
              </p>
              <p className="text-xs text-slate-400 font-medium">O que o cliente vê e a IA responde</p>
            </div>
            {!formOpen ? (
              <Button
                type="button"
                onClick={() => {
                  setFormOpen(true);
                  setMsg(null);
                  setError(null);
                }}
                className="h-11 rounded-2xl bg-[#64b34d] hover:bg-[#58a344] text-white font-bold gap-1.5"
              >
                <Plus size={18} />
                Novo
              </Button>
            ) : null}
          </div>
          <ul className="divide-y divide-slate-50">
            {activeServices.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                  {s.image_url ? (
                    <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Scissors size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{s.name}</p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    <span className="text-slate-900 font-bold">{formatBrl(Number(s.price_brl))}</span>
                    <span className="text-slate-300 mx-1.5">·</span>
                    {s.duration_minutes} min
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${s.name}`}
                  onClick={() => setPendingDelete({ id: s.id, name: s.name })}
                  className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Formulário */}
      {formOpen || isEmpty ? (
        <form
          className="rounded-[28px] border border-slate-100 bg-white shadow-wg-subtle p-5 sm:p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void addService();
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black text-slate-900 tracking-tight">
                {isEmpty ? "Primeiro serviço" : "Novo serviço"}
              </p>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Nome, preço e duração — o essencial.
              </p>
            </div>
            {!isEmpty ? (
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => {
                  setFormOpen(false);
                  resetForm();
                  setError(null);
                }}
                className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-50 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-name" className="text-xs font-bold text-slate-600">
              Nome
            </Label>
            <Input
              id="svc-name"
              ref={nameRef}
              placeholder="Ex.: Corte, Barba, Escova…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-14 px-5 rounded-2xl bg-slate-50 border-none font-bold text-base focus-visible:ring-1 focus-visible:ring-[#64b34d]"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-price" className="text-xs font-bold text-slate-600">
                Preço
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                  R$
                </span>
                <Input
                  id="svc-price"
                  placeholder="50"
                  inputMode="decimal"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none font-bold text-base focus-visible:ring-1 focus-visible:ring-[#64b34d]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-duration" className="text-xs font-bold text-slate-600">
                Duração
              </Label>
              <div className="relative">
                <Input
                  id="svc-duration"
                  inputMode="numeric"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className="h-14 px-4 pr-12 rounded-2xl bg-slate-50 border-none font-bold text-base focus-visible:ring-1 focus-visible:ring-[#64b34d]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                  min
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((mins) => {
              const active = Number(newDuration) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setNewDuration(String(mins))}
                  className={`h-9 px-3 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? "bg-[#64b34d] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {mins} min
                </button>
              );
            })}
          </div>

          {!showExtras ? (
            <button
              type="button"
              onClick={() => setShowExtras(true)}
              className="text-sm font-bold text-slate-500 hover:text-[#64b34d] transition-colors"
            >
              + Foto ou descrição (opcional)
            </button>
          ) : (
            <div className="space-y-4 pt-1 border-t border-slate-100">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Foto (opcional)</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadServiceImage(f);
                  }}
                />
                {newImage ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={newImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewImage(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-red-500"
                    >
                      Remover foto
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex flex-col items-center justify-center gap-1.5 text-slate-400 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <ImagePlus size={22} />
                        <span className="text-xs font-bold">Escolher imagem</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-desc" className="text-xs font-bold text-slate-600">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="svc-desc"
                  placeholder="Ex.: inclui lavagem"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="rounded-2xl bg-slate-50 border-none font-medium resize-none focus-visible:ring-1 focus-visible:ring-[#64b34d]"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={saving || uploading}
            className="w-full h-14 rounded-2xl bg-[#64b34d] hover:bg-[#58a344] text-white font-black text-base gap-2"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            {isEmpty ? "Salvar serviço" : "Adicionar à lista"}
          </Button>
        </form>
      ) : null}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-[24px] border-none shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-slate-900">
              Remover serviço?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500 leading-relaxed">
              {pendingDelete ? (
                <>
                  <span className="font-bold text-slate-700">{pendingDelete.name}</span> sai
                  da lista. A IA deixa de informar este preço no WhatsApp.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold" disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 font-black"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmRemoveService();
              }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
