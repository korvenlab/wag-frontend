import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  UserX,
  Users,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { apiFetch } from "../lib/apiFetch";

type PresenceStatus = "pending" | "confirmed" | "declined";

type PresenceItem = {
  id: string;
  client_name: string | null;
  client_phone: string | null;
  barber_name: string | null;
  starts_at: string;
  presence_status: PresenceStatus;
  presence_replied_at: string | null;
};

type PresencePayload = {
  period: { from: string; to: string; label: string };
  counts: {
    confirmed: number;
    pending: number;
    declined: number;
    total: number;
  };
  items: PresenceItem[];
  reminders_enabled: boolean;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: PresenceStatus) {
  if (status === "confirmed") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
        Confirmou
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge className="bg-rose-50 text-rose-700 border-rose-100 font-bold">
        Não vem
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold">
      Pendente
    </Badge>
  );
}

export function PresencePanel({
  onOpenReminderSettings,
}: {
  onOpenReminderSettings?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PresencePayload | null>(null);
  const [filter, setFilter] = useState<"all" | PresenceStatus>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/reminders/presence");
      if (res.status === 403) {
        setError("Painel disponível nos planos com lembretes.");
        setData(null);
        return;
      }
      if (!res.ok) {
        setError("Não foi possível carregar a presença.");
        return;
      }
      const json = (await res.json()) as PresencePayload;
      setData(json);
    } catch {
      setError("Falha de conexão ao carregar presença.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const items =
    data?.items.filter((i) => (filter === "all" ? true : i.presence_status === filter)) ??
    [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">
            Presença da semana
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {data?.period.label
              ? `Confirmações dos lembretes · ${data.period.label}`
              : "Quem confirmou, quem ainda não respondeu e quem avisou falta."}
          </p>
        </div>
        <div className="flex gap-2">
          {onOpenReminderSettings ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-bold"
              onClick={onOpenReminderSettings}
            >
              Configurar lembretes
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="rounded-xl font-bold"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Atualizar"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-2xl px-4 py-3">
          {error}
        </p>
      ) : null}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#64b34d]" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="rounded-3xl border-none shadow-wg-subtle bg-white p-6">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <CheckCircle2 size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Confirmados
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {data?.counts.confirmed ?? 0}
              </p>
            </Card>
            <Card className="rounded-3xl border-none shadow-wg-subtle bg-white p-6">
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <Clock3 size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Pendentes
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {data?.counts.pending ?? 0}
              </p>
            </Card>
            <Card className="rounded-3xl border-none shadow-wg-subtle bg-white p-6">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <UserX size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Faltas avisadas
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {data?.counts.declined ?? 0}
              </p>
            </Card>
          </div>

          {data && !data.reminders_enabled ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 font-medium">
              Lembretes estão desligados — ligue em Configurar lembretes para pedir
              confirmação de presença no WhatsApp.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Todos"],
                ["confirmed", "Confirmados"],
                ["pending", "Pendentes"],
                ["declined", "Faltas"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  filter === id
                    ? "bg-[#64b34d] text-white shadow-wg-subtle"
                    : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white overflow-hidden">
            {items.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium flex flex-col items-center gap-3">
                <Users size={28} className="text-slate-300" />
                Nenhum lembrete com presença nesta semana ainda.
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-black text-slate-900">
                        {item.client_name || "Cliente"}
                      </p>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {formatWhen(item.starts_at)}
                        {item.barber_name ? ` · ${item.barber_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(item.presence_status)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Bell size={12} />
                        Lembrete
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
