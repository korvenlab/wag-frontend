import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Users,
  FileSpreadsheet,
  Wallet,
  Scissors,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { apiFetch } from "../lib/apiFetch";
import { getCachedTeam } from "../lib/dashboardCache";

const COLUMN_LABELS: Record<string, string> = {
  data_inicio: "Data início",
  data_fim: "Data fim",
  cliente: "Cliente",
  telefone: "Telefone",
  profissional: "Profissional",
  titulo: "Título",
  origem: "Origem",
  valor_servico: "Valor serviço",
  status_pagamento: "Status pagamento",
  comissao_percent: "Comissão %",
  comissao_brl: "Comissão R$",
  ganho_manual_brl: "Ganho manual R$",
  ganho_final_brl: "Ganho final R$",
};

type BarberTotal = {
  profissional: string;
  paid_appointments_count: number;
  faturamento_brl: number;
  auto_commission_brl: number;
  manual_amount_brl: number | null;
  final_amount_brl: number;
  source: "manual" | "automatic" | "none";
};

type StoreSummary = {
  barbeiros_equipe: number;
  barbeiros_com_movimento: number;
  paid_appointments: number;
  faturamento_servicos_brl: number;
  bruto_stripe_brl: number;
  taxa_wagoo_brl: number;
  taxa_stripe_brl: number;
  caixa_stripe_brl: number;
  sinais_bruto_brl: number;
  sinais_liquido_brl: number;
  clube_bruto_brl: number;
  clube_liquido_brl: number;
  ganhos_barbeiros_brl: number;
  caixa_loja_brl: number;
  caixa_fonte: "stripe" | "planilha";
  planilha_total_brl: number | null;
  club_payments_count: number;
  stripe_fee_method: "card" | "pix";
};

type EarningsEntry = {
  id: string;
  barbeiro_id: string | null;
  barber_name: string;
  period_year: number;
  period_month: number;
  amount_brl: number;
  note: string;
};

type TeamMember = { id: string; nome: string };

type Props = {
  range: { from: string; to: string };
  onRangeChange: (range: { from: string; to: string }) => void;
  googleConnected: boolean;
  userId?: string;
};

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInputStart(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

function fromDateInputEnd(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

function moneyLabel(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function periodFromRange(fromIso: string): { year: number; month: number } {
  const d = new Date(fromIso);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AnalyticsEarningsPanel({
  range,
  onRangeChange,
  googleConnected,
  userId,
}: Props) {
  const [barbers, setBarbers] = useState<BarberTotal[]>([]);
  const [store, setStore] = useState<StoreSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [columns, setColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [savingColumns, setSavingColumns] = useState(false);

  const [entries, setEntries] = useState<EarningsEntry[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [entryBarberId, setEntryBarberId] = useState("");
  const [entryName, setEntryName] = useState("");
  const [entryAmount, setEntryAmount] = useState("");
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [mergeInfo, setMergeInfo] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);

  const period = useMemo(() => periodFromRange(range.from), [range.from]);
  const monthLabel = `${String(period.month).padStart(2, "0")}/${period.year}`;

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const qs = new URLSearchParams({ from: range.from, to: range.to });
      const res = await apiFetch(`/api/analytics/summary?${qs}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSummaryError(body.error || "Não foi possível carregar totais.");
        return;
      }
      const data = await res.json();
      setBarbers(data.barbers ?? []);
      setStore(data.store ?? null);
    } catch {
      setSummaryError("Erro de rede ao carregar totais.");
    } finally {
      setLoadingSummary(false);
    }
  }, [range.from, range.to]);

  const loadEntries = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        year: String(period.year),
        month: String(period.month),
      });
      const res = await apiFetch(`/api/analytics/earnings-entries?${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      /* ignore */
    }
  }, [period.year, period.month]);

  const loadPrefs = useCallback(async () => {
    const fallback = Object.keys(COLUMN_LABELS);
    try {
      const res = await apiFetch("/api/analytics/export-preferences");
      if (!res.ok) {
        setColumns(fallback);
        setAvailableColumns(fallback);
        return;
      }
      const data = await res.json();
      setColumns(
        Array.isArray(data.columns) && data.columns.length
          ? data.columns
          : fallback,
      );
      setAvailableColumns(data.available_columns ?? fallback);
    } catch {
      setColumns(fallback);
      setAvailableColumns(fallback);
    }
  }, []);

  const loadTeam = useCallback(async () => {
    if (userId) {
      const cached = getCachedTeam(userId);
      if (cached?.length) {
        setTeam(cached.map((b) => ({ id: b.id, nome: b.nome })));
      }
    }
    try {
      const res = await apiFetch("/api/barbeiros");
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.barbeiros ?? []) as TeamMember[];
      setTeam(list.map((b) => ({ id: b.id, nome: b.nome })));
    } catch {
      /* ignore */
    }
  }, [userId]);

  useEffect(() => {
    void loadSummary();
    void loadEntries();
    void loadPrefs();
    void loadTeam();
  }, [loadSummary, loadEntries, loadPrefs, loadTeam]);

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const saveColumns = async () => {
    setSavingColumns(true);
    setExportError(null);
    try {
      const res = await apiFetch("/api/analytics/export-preferences", {
        method: "PUT",
        body: JSON.stringify({ columns }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setExportError(body.error || "Não foi possível salvar colunas.");
        return;
      }
      const data = await res.json();
      setColumns(data.columns ?? columns);
    } catch {
      setExportError("Erro ao salvar preferências.");
    } finally {
      setSavingColumns(false);
    }
  };

  const handleAddEntry = async () => {
    setEntryError(null);
    const amount = Number(String(entryAmount).replace(",", "."));
    if (!Number.isFinite(amount) || amount < 0) {
      setEntryError("Informe um valor válido.");
      return;
    }
    if (!entryBarberId && !entryName.trim()) {
      setEntryError("Selecione ou digite o profissional.");
      return;
    }
    setSavingEntry(true);
    try {
      const body: Record<string, unknown> = {
        period_year: period.year,
        period_month: period.month,
        amount_brl: Math.round(amount * 100) / 100,
      };
      if (entryBarberId) body.barbeiro_id = entryBarberId;
      else body.barber_name = entryName.trim();

      const res = await apiFetch("/api/analytics/earnings-entries", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEntryError(data.error || "Não foi possível salvar.");
        return;
      }
      setEntryAmount("");
      setEntryName("");
      setEntryBarberId("");
      await loadEntries();
      await loadSummary();
    } catch {
      setEntryError("Erro de rede.");
    } finally {
      setSavingEntry(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await apiFetch(`/api/analytics/earnings-entries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadEntries();
        await loadSummary();
      }
    } catch {
      setEntryError("Erro ao excluir lançamento.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      // Garante colunas necessárias para reenviar a planilha
      const exportCols = [...columns];
      for (const need of ["profissional", "ganho_final_brl"]) {
        if (!exportCols.includes(need)) exportCols.push(need);
      }
      if (exportCols.join(",") !== columns.join(",")) {
        setColumns(exportCols);
        await apiFetch("/api/analytics/export-preferences", {
          method: "PUT",
          body: JSON.stringify({ columns: exportCols }),
        });
      } else {
        await saveColumns();
      }
      const qs = new URLSearchParams({
        from: range.from,
        to: range.to,
        columns: exportCols.join(","),
      });
      const res = await apiFetch(`/api/analytics/export?${qs}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setExportError(body.error || "Não foi possível baixar a planilha.");
        return;
      }
      const blob = await res.blob();
      downloadBlob(
        blob,
        `wagoo-planilha-${toDateInputValue(range.from)}_${toDateInputValue(range.to)}.csv`,
      );
    } catch {
      setExportError("Erro de rede ao baixar.");
    } finally {
      setIsExporting(false);
    }
  };

  /** Baixa planilha → preenche no Excel → sobe e grava no banco. */
  const handleUploadSpreadsheet = async (file: File | null) => {
    if (!file) return;
    setMerging(true);
    setExportError(null);
    setMergeInfo(null);
    try {
      const text = await file.text();
      const res = await apiFetch("/api/analytics/earnings-upload", {
        method: "POST",
        body: JSON.stringify({
          csv: text,
          from: range.from,
          period_year: period.year,
          period_month: period.month,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExportError(body.error || "Não foi possível importar a planilha.");
        return;
      }
      const saved = Number(body.saved) || 0;
      setMergeInfo(
        body.store_saved
          ? `${saved} valor(es) salvos no mês ${monthLabel} (inclui caixa da loja).`
          : `${saved} valor(es) salvos no mês ${monthLabel}.`,
      );
      await Promise.all([loadSummary(), loadEntries()]);
    } catch {
      setExportError("Erro ao ler ou enviar o arquivo.");
    } finally {
      setMerging(false);
    }
  };

  const handleClearStoreOverride = async () => {
    try {
      const qs = new URLSearchParams({
        year: String(period.year),
        month: String(period.month),
      });
      const res = await apiFetch(
        `/api/analytics/earnings-store-override?${qs}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setExportError(body.error || "Não foi possível limpar o caixa da planilha.");
        return;
      }
      setMergeInfo("Caixa da loja voltou aos valores dos pagamentos online.");
      await Promise.all([loadSummary(), loadEntries()]);
    } catch {
      setExportError("Erro de rede.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-8 md:p-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#64b34d] shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">
              Faturamento da loja
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
              Caixa = o que sobra no salão depois das taxas. Comissão dos barbeiros é
              outro bloco. Se você enviou a planilha com a linha Loja, o caixa segue
              esse valor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              De
            </Label>
            <Input
              type="date"
              value={toDateInputValue(range.from)}
              onChange={(e) =>
                onRangeChange({
                  ...range,
                  from: fromDateInputStart(e.target.value),
                })
              }
              className="h-11 rounded-xl bg-slate-50 border-none font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Até
            </Label>
            <Input
              type="date"
              value={toDateInputValue(range.to)}
              onChange={(e) =>
                onRangeChange({
                  ...range,
                  to: fromDateInputEnd(e.target.value),
                })
              }
              className="h-11 rounded-xl bg-slate-50 border-none font-bold"
            />
          </div>
        </div>

        {loadingSummary ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#64b34d]" />
          </div>
        ) : summaryError ? (
          <p className="text-red-600 text-sm font-medium">{summaryError}</p>
        ) : store ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border-2 border-[#64b34d]/25 bg-[#64b34d]/5 p-5 space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4d8f3b]">
                  Caixa da loja
                </p>
                <Badge
                  className={`border-0 font-bold text-[10px] ${
                    store.caixa_fonte === "planilha"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {store.caixa_fonte === "planilha" ? "Planilha" : "Online"}
                </Badge>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {moneyLabel(store.caixa_loja_brl)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Bruto {moneyLabel(store.bruto_stripe_brl)} − Wagoo{" "}
                {moneyLabel(store.taxa_wagoo_brl)} − cartão/Pix{" "}
                {moneyLabel(store.taxa_stripe_brl)}
                {store.clube_bruto_brl > 0
                  ? ` · clube líq. ${moneyLabel(store.clube_liquido_brl)}`
                  : ""}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Serviços (valor)
              </p>
              <p className="text-2xl font-black text-slate-900">
                {moneyLabel(store.faturamento_servicos_brl)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {store.paid_appointments} pago(s)
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Scissors size={12} /> Barbeiros
              </p>
              <p className="text-2xl font-black text-slate-900">
                {store.barbeiros_equipe}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Ganhos {moneyLabel(store.ganhos_barbeiros_brl)}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-8 md:p-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#64b34d] shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">
              Ganhos por profissional
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
              Comissão automática, ou o valor da planilha (substitui o automático).
            </p>
          </div>
        </div>

        {loadingSummary ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#64b34d]" />
          </div>
        ) : summaryError ? (
          <p className="text-red-600 text-sm font-medium">{summaryError}</p>
        ) : barbers.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium text-center py-6">
            Sem dados neste período. Envie a planilha ou cadastre a equipe.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {barbers.map((b) => (
              <div
                key={b.profissional}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-slate-900">{b.profissional}</p>
                  {b.source === "manual" ? (
                    <Badge className="bg-amber-100 text-amber-800 border-0 font-bold text-[10px]">
                      Planilha
                    </Badge>
                  ) : b.source === "automatic" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-[10px]">
                      Automático
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-200 text-slate-600 border-0 font-bold text-[10px]">
                      —
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-black text-[#64b34d]">
                  {moneyLabel(b.final_amount_brl)}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {b.paid_appointments_count} pago(s) · auto{" "}
                  {moneyLabel(b.auto_commission_brl)}
                  {b.manual_amount_brl != null
                    ? ` · planilha ${moneyLabel(b.manual_amount_brl)}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-8 md:p-10 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#64b34d] shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">
              Planilha ({monthLabel})
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
              Escolha as colunas, baixe, preencha no Excel o que cada um ganhou (e a linha
              Loja) e envie de volta — os números da loja atualizam na hora.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(availableColumns.length ? availableColumns : Object.keys(COLUMN_LABELS)).map(
            (key) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 cursor-pointer"
              >
                <Checkbox
                  checked={columns.includes(key)}
                  onCheckedChange={() => toggleColumn(key)}
                />
                <span className="text-xs font-bold text-slate-700">
                  {COLUMN_LABELS[key] || key}
                </span>
              </label>
            ),
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => void saveColumns()}
            disabled={savingColumns || columns.length === 0}
            className="rounded-xl h-10 text-xs font-black"
          >
            {savingColumns ? <Loader2 className="animate-spin" /> : "Salvar colunas"}
          </Button>
          <Button
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting || columns.length === 0}
            className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-[#64b34d] text-white font-black gap-2"
          >
            {isExporting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Download size={16} /> Baixar planilha
              </>
            )}
          </Button>
          <label className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#64b34d] text-white font-black text-sm cursor-pointer hover:bg-[#4d8f3b]">
            {merging ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload size={16} />}
            Enviar planilha
            <input
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              className="hidden"
              disabled={merging}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                e.target.value = "";
                void handleUploadSpreadsheet(f);
              }}
            />
          </label>
        </div>

        {!googleConnected && (
          <p className="text-amber-600 text-xs font-bold">
            Sem Google Agenda: a planilha inclui só agendamentos pagos e lançamentos salvos.
          </p>
        )}
        {mergeInfo && (
          <p className="text-emerald-700 text-sm font-bold">{mergeInfo}</p>
        )}
        {store?.caixa_fonte === "planilha" && (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-9 text-xs font-black"
            onClick={() => void handleClearStoreOverride()}
          >
            Usar de novo os valores dos pagamentos online
          </Button>
        )}
        {exportError && (
          <p className="text-red-600 text-sm font-medium">{exportError}</p>
        )}
      </Card>

      <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-8 md:p-10 space-y-5">
        <div>
          <h3 className="font-black text-lg text-slate-900 tracking-tight">
            Lançamento rápido ({monthLabel})
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Ajuste um profissional sem abrir a planilha.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Da equipe
            </Label>
            <select
              value={entryBarberId}
              onChange={(e) => {
                setEntryBarberId(e.target.value);
                if (e.target.value) setEntryName("");
              }}
              className="w-full h-11 rounded-xl bg-slate-50 border-none font-semibold px-3 text-sm"
            >
              <option value="">Nome livre ↓</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Ou nome
            </Label>
            <Input
              value={entryName}
              onChange={(e) => {
                setEntryName(e.target.value);
                if (e.target.value) setEntryBarberId("");
              }}
              placeholder="Ex: João"
              disabled={Boolean(entryBarberId)}
              className="h-11 rounded-xl bg-slate-50 border-none font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Valor R$
            </Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={entryAmount}
              onChange={(e) => setEntryAmount(e.target.value)}
              placeholder="1200"
              className="h-11 rounded-xl bg-slate-50 border-none font-semibold"
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={() => void handleAddEntry()}
          disabled={savingEntry}
          className="h-11 px-6 rounded-xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black gap-2"
        >
          {savingEntry ? <Loader2 className="animate-spin" /> : <Plus size={16} />}
          Salvar lançamento
        </Button>
        {entryError && <p className="text-red-600 text-xs font-medium">{entryError}</p>}
        {entries.length > 0 && (
          <div className="space-y-2 pt-2">
            {entries.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">{e.barber_name}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {moneyLabel(Number(e.amount_brl) || 0)}
                    {e.note === "planilha" ? " · planilha" : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-red-200 text-red-600"
                  onClick={() => void handleDeleteEntry(e.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
