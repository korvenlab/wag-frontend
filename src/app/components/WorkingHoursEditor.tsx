import type { ReactNode } from "react";
import { Coffee, Copy, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

export const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

export type DayHours = {
  startTime: string;
  endTime: string;
  isTurno1Active: boolean;
  startTime2: string;
  endTime2: string;
  isTurno2Active: boolean;
  startTime3: string;
  endTime3: string;
  isTurno3Active: boolean;
};

export type WorkingHoursMap = Record<string, DayHours>;

const defaultDay = (): DayHours => ({
  startTime: "08:00",
  endTime: "12:00",
  isTurno1Active: true,
  startTime2: "14:00",
  endTime2: "18:00",
  isTurno2Active: true,
  startTime3: "19:00",
  endTime3: "22:00",
  isTurno3Active: false,
});

export function createDefaultWorkingHours(): WorkingHoursMap {
  return DAYS_OF_WEEK.reduce<WorkingHoursMap>((acc, day) => {
    if (day === "Domingo") {
      acc[day] = {
        ...defaultDay(),
        isTurno1Active: false,
        isTurno2Active: false,
        isTurno3Active: false,
      };
    } else if (day === "Sábado") {
      acc[day] = { ...defaultDay(), endTime2: "17:00", isTurno3Active: false };
    } else {
      acc[day] = defaultDay();
    }
    return acc;
  }, {});
}

export function normalizeWorkingHours(raw: unknown): WorkingHoursMap {
  const base = createDefaultWorkingHours();
  if (!raw || typeof raw !== "object") return base;
  const src = raw as Record<string, Partial<DayHours>>;
  for (const day of DAYS_OF_WEEK) {
    const d = src[day];
    if (!d || typeof d !== "object") continue;
    base[day] = {
      ...base[day],
      ...d,
      startTime: d.startTime || base[day].startTime,
      endTime: d.endTime || base[day].endTime,
      startTime2: d.startTime2 || base[day].startTime2,
      endTime2: d.endTime2 || base[day].endTime2,
      startTime3: d.startTime3 || base[day].startTime3,
      endTime3: d.endTime3 || base[day].endTime3,
      isTurno1Active: d.isTurno1Active ?? base[day].isTurno1Active,
      isTurno2Active: d.isTurno2Active ?? base[day].isTurno2Active,
      isTurno3Active: d.isTurno3Active ?? base[day].isTurno3Active,
    };
  }
  return base;
}

export function hasAnyOpenWindow(hours: WorkingHoursMap): boolean {
  return DAYS_OF_WEEK.some((day) => {
    const d = hours[day];
    return Boolean(d?.isTurno1Active || d?.isTurno2Active || d?.isTurno3Active);
  });
}

function TurnoCard({
  title,
  icon,
  active,
  onToggle,
  start,
  end,
  onStart,
  onEnd,
  compact,
}: {
  title: string;
  icon: ReactNode;
  active: boolean;
  onToggle: (v: boolean) => void;
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 transition-all ${
        compact ? "p-4" : "p-5"
      } ${
        active
          ? "bg-white border-[#64b34d]/25 shadow-sm"
          : "bg-slate-50/70 border-transparent opacity-70"
      }`}
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              active ? "bg-green-50 text-[#64b34d]" : "bg-slate-100 text-slate-400"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 text-sm tracking-tight">{title}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {active ? "Aberto" : "Fechado"}
            </p>
          </div>
        </div>
        <Switch checked={active} onCheckedChange={onToggle} className="data-[state=checked]:bg-[#64b34d]" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-0.5">Início</p>
          <Input
            type="time"
            value={start}
            onChange={(e) => onStart(e.target.value)}
            disabled={!active}
            className="h-10 bg-slate-50 border-none rounded-xl font-bold text-center text-sm"
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-0.5">Fim</p>
          <Input
            type="time"
            value={end}
            onChange={(e) => onEnd(e.target.value)}
            disabled={!active}
            className="h-10 bg-slate-50 border-none rounded-xl font-bold text-center text-sm"
          />
        </div>
      </div>
    </div>
  );
}

type WorkingHoursEditorProps = {
  value: WorkingHoursMap;
  onChange: (next: WorkingHoursMap) => void;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  compact?: boolean;
};

export function WorkingHoursEditor({
  value,
  onChange,
  selectedDay,
  onSelectDay,
  compact = false,
}: WorkingHoursEditorProps) {
  const day = value[selectedDay] || defaultDay();

  const updateField = (field: keyof DayHours, next: string | boolean) => {
    onChange({
      ...value,
      [selectedDay]: { ...day, [field]: next },
    });
  };

  const copyToAllDays = () => {
    const current = { ...day };
    onChange(
      DAYS_OF_WEEK.reduce<WorkingHoursMap>((acc, d) => {
        acc[d] = { ...current };
        return acc;
      }, {}),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Defina quando o cliente pode marcar. Dias sem turno ativo ficam fechados.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToAllDays}
          className="rounded-xl border-slate-200 text-xs font-bold gap-2 shrink-0"
        >
          <Copy size={14} /> Replicar dia em todos
        </Button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1">
        {DAYS_OF_WEEK.map((d) => {
          const open = Boolean(
            value[d]?.isTurno1Active || value[d]?.isTurno2Active || value[d]?.isTurno3Active,
          );
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDay(d)}
              className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedDay === d
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              {d.replace("-feira", "")}
              {!open ? (
                <span className={selectedDay === d ? " text-white/50" : " text-slate-300"}> · off</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
        <TurnoCard
          title="Manhã"
          icon={<Sun size={18} />}
          active={!!day.isTurno1Active}
          onToggle={(v) => updateField("isTurno1Active", v)}
          start={day.startTime || "08:00"}
          end={day.endTime || "12:00"}
          onStart={(v) => updateField("startTime", v)}
          onEnd={(v) => updateField("endTime", v)}
          compact={compact}
        />
        <TurnoCard
          title="Tarde"
          icon={<Coffee size={18} />}
          active={!!day.isTurno2Active}
          onToggle={(v) => updateField("isTurno2Active", v)}
          start={day.startTime2 || "14:00"}
          end={day.endTime2 || "18:00"}
          onStart={(v) => updateField("startTime2", v)}
          onEnd={(v) => updateField("endTime2", v)}
          compact={compact}
        />
        <TurnoCard
          title="Noite"
          icon={<Moon size={18} />}
          active={!!day.isTurno3Active}
          onToggle={(v) => updateField("isTurno3Active", v)}
          start={day.startTime3 || "19:00"}
          end={day.endTime3 || "22:00"}
          onStart={(v) => updateField("startTime3", v)}
          onEnd={(v) => updateField("endTime3", v)}
          compact={compact}
        />
      </div>
    </div>
  );
}
