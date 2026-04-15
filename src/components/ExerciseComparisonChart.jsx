import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Circle, Minus, TrendingDown, TrendingUp } from "lucide-react";

const METRIC_OPTIONS = [
  { value: "sets", label: "Sets" },
  { value: "reps", label: "Reps" },
  { value: "peso", label: "Peso" }
];
const ALL_DAYS_KEY = "__all_days__";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeDisplayText = (value) => {
  let text = String(value || "");

  text = text
    .replace(/D\u00C3\u00ADa/gi, "Dia")
    .replace(/D\u00C3a/gi, "Dia")
    .replace(/\u00C3\u00B1/g, "n")
    .replace(/\u00C3\u0091/g, "N")
    .replace(/\u00C3\u00A1/g, "a")
    .replace(/\u00C3\u00A9/g, "e")
    .replace(/\u00C3\u00AD/g, "i")
    .replace(/\u00C3\u00B3/g, "o")
    .replace(/\u00C3\u00BA/g, "u")
    .replace(/\u00C3\u0081/g, "A")
    .replace(/\u00C3\u0089/g, "E")
    .replace(/\u00C3\u008D/g, "I")
    .replace(/\u00C3\u0093/g, "O")
    .replace(/\u00C3\u009A/g, "U");

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const shortText = (value, max = 36) => {
  const raw = sanitizeDisplayText(value);
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 3)}...`;
};

const toDisplay = (value) => {
  if (value == null) return '-';
  if (Array.isArray(value)) return value.map((item) => sanitizeDisplayText(item)).join(", ");
  const out = sanitizeDisplayText(value);
  return out || "-";
};

const toNumeric = (value) => {
  if (value == null) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = toNumeric(item);
      if (parsed != null) return parsed;
    }
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) return value;

  const raw = String(value).replace(",", ".");
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getPesoScale = (value) => {
  const text = normalizeText(value);
  if (!text || text === "-") return "none";
  if (text.includes("rir")) return "rir";
  if (text.includes("rpe") || /\brp\b/.test(text) || text.includes("@")) return "effort";
  if (text.includes("%")) return "percent";
  if (/(kg|kilo|lbs|lb|libras|libra)/.test(text)) return "load";
  return "number";
};

const getExerciseName = (item) => {
  if (!item || typeof item !== "object") return "";
  if (typeof item.name === "string") return sanitizeDisplayText(item.name);
  if (item.name && typeof item.name === "object" && typeof item.name.name === "string") {
    return sanitizeDisplayText(item.name.name);
  }
  return '';
};

const getSupSuffix = (item) => {
  if (!item || typeof item !== "object") return "";
  const raw = item.supSuffix ?? item.sup ?? item.suffix ?? "";
  return String(raw || "").trim();
};

const getStructureTags = (context, supSuffix) => {
  const ctx = String(context || "");
  const tags = [];
  if (ctx.includes("|circuit")) tags.push("Circuito");
  if (ctx.includes("|block")) tags.push("Bloque");
  if (supSuffix) tags.push(`Superserie ${supSuffix}`);
  if (!tags.length) tags.push("Ejercicio");
  return tags;
};

const getDayLabel = (day, idx) => {
  if (day?.name && String(day.name).trim()) return sanitizeDisplayText(day.name);
  return `Dia ${idx + 1}`;
};

const normalizeRirIfNeeded = (scale, numeric) => {
  if (numeric == null) return null;
  if (scale !== 'rir') return numeric;
  return Math.max(1, Math.min(10, numeric));
};

const buildWeekMap = (week) => {
  const routine = Array.isArray(week?.routine) ? week.routine : [];
  const entries = new Map();
  const occurrenceByBase = new Map();

  const pushEntry = ({ dayIndex, dayLabel, context, source, forceSetsNull = false }) => {
    const baseName = getExerciseName(source);
    if (!baseName) return;
    const supSuffix = getSupSuffix(source);
    const displayName = supSuffix ? `${baseName} ${supSuffix}` : baseName;
    const baseKey = `${dayIndex}|${context}|${normalizeText(baseName)}|sup:${normalizeText(supSuffix)}`;
    const occurrence = (occurrenceByBase.get(baseKey) || 0) + 1;
    occurrenceByBase.set(baseKey, occurrence);
    const key = `${baseKey}|${occurrence}`;

    const pesoRaw = toDisplay(source?.peso);
    const pesoScale = getPesoScale(pesoRaw);
    const pesoNum = normalizeRirIfNeeded(pesoScale, toNumeric(source?.peso));

    entries.set(key, {
      key,
      dayIndex,
      dayLabel,
      context,
      exerciseName: displayName,
      supSuffix,
      structureTags: getStructureTags(context, supSuffix),
      setsRaw: toDisplay(source?.sets),
      repsRaw: toDisplay(source?.reps),
      pesoRaw,
      setsNum: forceSetsNull ? null : toNumeric(source?.sets),
      repsNum: toNumeric(source?.reps),
      pesoNum,
      pesoScale
    });
  };

  const walkExercise = ({ dayIndex, dayLabel, exercise, context = "root" }) => {
    if (!exercise || typeof exercise !== 'object') return;

    if (exercise.type === "block" && Array.isArray(exercise.exercises)) {
      exercise.exercises.forEach((inner) => {
        walkExercise({
          dayIndex,
          dayLabel,
          exercise: inner,
          context: `${context}|block`
        });
      });
      return;
    }

    if (Array.isArray(exercise.circuit)) {
      const circuitContext = `${context}|circuit`;
      const circuitSets = exercise?.typeOfSets ?? "";
      exercise.circuit.forEach((item) => {
        const itemSource = {
          ...item,
          sets: item?.sets ?? circuitSets
        };
        pushEntry({
          dayIndex,
          dayLabel,
          context: circuitContext,
          source: itemSource,
          forceSetsNull: true
        });
      });
      return;
    }

    if (!getExerciseName(exercise)) return;

    pushEntry({
      dayIndex,
      dayLabel,
      context,
      source: exercise
    });
  };

  routine.forEach((day, dayIndex) => {
    const dayLabel = getDayLabel(day, dayIndex);
    const exercises = Array.isArray(day?.exercises) ? day.exercises : [];
    exercises.forEach((exercise, rootIdx) => {
      walkExercise({
        dayIndex,
        dayLabel,
        exercise,
        context: `root:${rootIdx}`
      });
    });
  });

  return entries;
};

const buildSignature = (weekMap) => Array.from(weekMap.keys()).sort().join("||");

const getTrendMeta = (delta) => {
  if (delta == null) return { Icon: Circle, color: "#9ca3af", label: "Sin dato comparable" };
  if (delta > 0) return { Icon: TrendingUp, color: "#22c55e", label: "Incremento" };
  if (delta < 0) return { Icon: TrendingDown, color: "#ef4444", label: "Decremento" };
  return { Icon: Minus, color: "#9ca3af", label: "Sin cambio" };
};

function ExerciseComparisonChart({ currentWeek, previousWeek, isDark = false }) {
  const [metric, setMetric] = React.useState("sets");
  const [selectedDayKey, setSelectedDayKey] = React.useState(ALL_DAYS_KEY);

  const currentMap = React.useMemo(() => buildWeekMap(currentWeek), [currentWeek]);
  const previousMap = React.useMemo(() => buildWeekMap(previousWeek), [previousWeek]);

  const sameTrainingBlock = React.useMemo(() => {
    if (!currentWeek || !previousWeek) return false;
    return buildSignature(currentMap) === buildSignature(previousMap);
  }, [currentWeek, previousWeek, currentMap, previousMap]);

  const rows = React.useMemo(() => {
    if (!sameTrainingBlock) return [];

    const out = [];
    currentMap.forEach((currentEntry, key) => {
      const previousEntry = previousMap.get(key);
      if (!previousEntry) return;

      const withDelta = (currentNum, previousNum, canDelta = true) => {
        if (!canDelta) return null;
        if (currentNum == null || previousNum == null) return null;
        return Number((currentNum - previousNum).toFixed(2));
      };

      const samePesoScale = currentEntry.pesoScale === previousEntry.pesoScale;

      out.push({
        key,
        dayIndex: currentEntry.dayIndex,
        dayLabel: currentEntry.dayLabel,
        exerciseName: currentEntry.exerciseName,
        structureTags: currentEntry.structureTags || [],
        sets: {
          previousRaw: previousEntry.setsRaw,
          currentRaw: currentEntry.setsRaw,
          previousNum: previousEntry.setsNum,
          currentNum: currentEntry.setsNum,
          delta: withDelta(currentEntry.setsNum, previousEntry.setsNum, true)
        },
        reps: {
          previousRaw: previousEntry.repsRaw,
          currentRaw: currentEntry.repsRaw,
          previousNum: previousEntry.repsNum,
          currentNum: currentEntry.repsNum,
          delta: withDelta(currentEntry.repsNum, previousEntry.repsNum, true)
        },
        peso: {
          previousRaw: previousEntry.pesoRaw,
          currentRaw: currentEntry.pesoRaw,
          previousNum: previousEntry.pesoNum,
          currentNum: currentEntry.pesoNum,
          previousScale: previousEntry.pesoScale,
          currentScale: currentEntry.pesoScale,
          sameScale: samePesoScale,
          delta: withDelta(currentEntry.pesoNum, previousEntry.pesoNum, samePesoScale)
        }
      });
    });

    out.sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.exerciseName.localeCompare(b.exerciseName);
    });

    return out;
  }, [currentMap, previousMap, sameTrainingBlock]);

  const rowsByDay = React.useMemo(() => {
    const groups = new Map();
    rows.forEach((row) => {
      if (!groups.has(row.dayLabel)) {
        groups.set(row.dayLabel, { dayLabel: row.dayLabel, dayIndex: row.dayIndex, rows: [] });
      }
      groups.get(row.dayLabel).rows.push(row);
    });
    return Array.from(groups.values()).sort((a, b) => a.dayIndex - b.dayIndex);
  }, [rows]);

  React.useEffect(() => {
    if (!rowsByDay.length) {
      setSelectedDayKey("");
      return;
    }
    setSelectedDayKey((prev) => {
      if (String(prev) === ALL_DAYS_KEY) return ALL_DAYS_KEY;
      const hasPrev = rowsByDay.some((group) => String(group.dayIndex) === String(prev));
      return hasPrev ? prev : ALL_DAYS_KEY;
    });
  }, [rowsByDay]);

  React.useEffect(() => {
    setSelectedDayKey(ALL_DAYS_KEY);
  }, [currentWeek?._id, previousWeek?._id]);

  const selectedDayGroup = React.useMemo(() => {
    if (!rowsByDay.length) return null;
    if (String(selectedDayKey) === ALL_DAYS_KEY) return null;
    return (
      rowsByDay.find((group) => String(group.dayIndex) === String(selectedDayKey)) ||
      rowsByDay[0]
    );
  }, [rowsByDay, selectedDayKey]);

  const visibleDayGroups = React.useMemo(() => {
    if (String(selectedDayKey) === ALL_DAYS_KEY) return rowsByDay;
    return selectedDayGroup ? [selectedDayGroup] : [];
  }, [rowsByDay, selectedDayGroup, selectedDayKey]);

  const visibleRows = React.useMemo(() => {
    if (String(selectedDayKey) === ALL_DAYS_KEY) return rows;
    return Array.isArray(selectedDayGroup?.rows) ? selectedDayGroup.rows : [];
  }, [rows, selectedDayGroup, selectedDayKey]);

  const chartData = React.useMemo(() => {
    return visibleRows
      .filter((row) => {
        if (metric === 'peso') {
          return row.peso.sameScale && row.peso.currentNum != null && row.peso.previousNum != null;
        }
        return row[metric].currentNum != null && row[metric].previousNum != null;
      })
      .map((row, idx) => ({
        slot: `E${idx + 1}`,
        fullLabel: `${row.dayLabel} - ${row.exerciseName} (${(row.structureTags || []).join(" | ")})`,
        anterior: metric === 'peso' ? row.peso.previousNum : row[metric].previousNum,
        actual: metric === "peso" ? row.peso.currentNum : row[metric].currentNum
      }));
  }, [visibleRows, metric]);

  const renderTrendIcon = (delta) => {
    const trend = getTrendMeta(delta);
    const Icon = trend.Icon;
    return (
      <span title={trend.label} className="d-inline-flex align-items-center">
        <Icon size={14} color={trend.color} strokeWidth={2.2} />
      </span>
    );
  };

  const renderTransition = (previousRaw, currentRaw, delta) => (
    <div className="d-flex flex-column gap-1">
      <div className="small">
        <span style={{ color: palette.muted, fontWeight: 500 }}>{previousRaw}</span>
        <span style={{ color: palette.muted }}> {"->"} </span>
        <span style={{ color: palette.text, fontWeight: 700 }}>{currentRaw}</span>
      </div>
      <div className="d-flex align-items-center" style={{ lineHeight: 1 }}>
        {renderTrendIcon(delta)}
      </div>
    </div>
  );

  const palette = React.useMemo(
    () =>
      isDark
        ? {
            bg: "#0f172a",
            border: "rgba(255,255,255,0.14)",
            text: "#e5e7eb",
            muted: "#9ca3af",
            grid: "rgba(148,163,184,0.28)",
            tooltipBg: "#111827",
            tooltipBorder: "rgba(255,255,255,0.16)",
            selectBg: "#111827",
            selectBorder: "rgba(255,255,255,0.2)",
            chipBg: "rgba(148,163,184,0.16)",
            chipBorder: "rgba(148,163,184,0.35)",
            chipText: "#d1d5db",
            chipActiveBg: "#2563eb",
            chipActiveBorder: "#2563eb",
            chipActiveText: "#ffffff",
            badgeBg: "#334155",
            panelShadow: "0 14px 30px rgba(2, 6, 23, 0.42)",
            cardBg: "linear-gradient(180deg, rgba(17,24,39,0.95) 0%, rgba(15,23,42,0.95) 100%)",
            cardHeaderBg: "linear-gradient(90deg, rgba(30,41,59,0.95) 0%, rgba(30,41,59,0.7) 100%)",
            headerAccent: "#60a5fa",
            thBg: "rgba(255,255,255,0.04)",
            rowBorder: "rgba(255,255,255,0.08)"
          }
        : {
            bg: "#ffffff",
            border: "#e2e8f0",
            text: "#111827",
            muted: "#64748b",
            grid: "#e2e8f0",
            tooltipBg: "#ffffff",
            tooltipBorder: "#e2e8f0",
            selectBg: "#ffffff",
            selectBorder: "#cbd5e1",
            chipBg: "#f1f5f9",
            chipBorder: "#cbd5e1",
            chipText: "#334155",
            chipActiveBg: "#1d4ed8",
            chipActiveBorder: "#1d4ed8",
            chipActiveText: "#ffffff",
            badgeBg: "#e2e8f0",
            panelShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
            cardBg: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            cardHeaderBg: "linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%)",
            headerAccent: "#2563eb",
            thBg: "#f8fafc",
            rowBorder: "#e2e8f0"
          },
    [isDark]
  );

  const tableCssVars = {
    borderColor: palette.border,
    color: palette.text,
    background: "transparent",
    "--bs-table-bg": "transparent",
    "--bs-table-color": palette.text,
    "--bs-table-border-color": palette.rowBorder,
    "--bs-table-hover-color": palette.text
  };

  const getFilterChipStyle = (active, compact = false) => ({
    borderRadius: 999,
    border: `1px solid ${active ? palette.chipActiveBorder : palette.chipBorder}`,
    background: active ? palette.chipActiveBg : palette.chipBg,
    color: active ? palette.chipActiveText : palette.chipText,
    fontWeight: 600,
    fontSize: compact ? "0.78rem" : "0.82rem",
    padding: compact ? "0.24rem 0.6rem" : "0.3rem 0.75rem",
    transition: "all 0.15s ease"
  });

  const headCellStyle = {
    background: palette.thBg,
    color: palette.text,
    borderColor: palette.rowBorder
  };

  const getTagStyle = (tag) => {
    if (tag.startsWith("Circuito")) {
      return { background: isDark ? "#1e3a8a" : "#dbeafe", color: isDark ? "#bfdbfe" : "#1e40af" };
    }
    if (tag.startsWith("Bloque")) {
      return { background: isDark ? "#3f3f46" : "#e5e7eb", color: isDark ? "#e4e4e7" : "#374151" };
    }
    if (tag.startsWith("Superserie")) {
      return { background: isDark ? "#14532d" : "#dcfce7", color: isDark ? "#bbf7d0" : "#166534" };
    }
    return { background: isDark ? "#334155" : "#e2e8f0", color: isDark ? "#e5e7eb" : "#334155" };
  };

  const bodyCellStyle = {
    background: 'transparent',
    color: palette.text,
    borderColor: palette.rowBorder
  };

  if (!previousWeek) {
    return (
      <div className={`alert ${isDark ? "alert-secondary" : "alert-info"} mb-0`}>
        No hay una semana anterior para comparar.
      </div>
    );
  }

  if (!sameTrainingBlock) {
    return (
      <div className={`alert ${isDark ? "alert-secondary" : "alert-warning"} mb-0`}>
        Se detecto una estructura distinta entre semanas. Para comparar, ambas deben mantener
        la misma estructura (ejercicios, bloques, superseries y circuitos).
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={`alert ${isDark ? "alert-secondary" : "alert-warning"} mb-0`}>
        No se encontraron ejercicios comparables entre ambas semanas.
      </div>
    );
  }

  return (
    <div
      className='rounded-3 p-3'
      style={{
        background: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        boxShadow: palette.panelShadow
      }}
    >
      <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3'>
        <div className="pt-1">
          <div className="fw-semibold fs-5">Progreso semanal</div>
          <small style={{ color: palette.muted }}>
            {previousWeek?.name || "Semana anterior"} vs {currentWeek?.name || "Semana actual"}
          </small>
        </div>
        <div
          className="rounded-3 p-2 p-md-3 d-flex flex-column gap-2"
          style={{
            minWidth: "min(480px, 100%)",
            border: `1px solid ${palette.border}`,
            background: palette.cardBg
          }}
        >
          <div
            className="d-grid gap-2"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", alignItems: "start" }}
          >
            <div style={{ minWidth: 0 }}>
              <label
                className="form-label mb-1"
                style={{ color: palette.muted, fontSize: "0.8rem", fontWeight: 600 }}
              >
                Metrica del grafico
              </label>
              <div className="d-flex flex-wrap gap-1">
                {METRIC_OPTIONS.map((option) => {
                  const active = metric === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setMetric(option.value)}
                      style={getFilterChipStyle(active, true)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <label
                className="form-label mb-1"
                style={{ color: palette.muted, fontSize: "0.8rem", fontWeight: 600 }}
              >
                Dia
              </label>
              <div className="d-flex gap-1 overflow-auto pb-1" style={{ whiteSpace: "nowrap" }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setSelectedDayKey(ALL_DAYS_KEY)}
                  style={getFilterChipStyle(String(selectedDayKey) === ALL_DAYS_KEY, true)}
                >
                  Vista general
                </button>
                {rowsByDay.map((group) => {
                  const dayKey = String(group.dayIndex);
                  const active = String(selectedDayKey) === dayKey;
                  return (
                    <button
                      key={`day-filter-${dayKey}`}
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setSelectedDayKey(dayKey)}
                      style={getFilterChipStyle(active, true)}
                    >
                      {group.dayLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div
              className="badge"
              style={{ background: palette.badgeBg, color: palette.text }}
            >
              {visibleRows.length} ejercicios
            </div>
            {String(selectedDayKey) === ALL_DAYS_KEY ? (
              <div
                className="badge"
                style={{ background: palette.badgeBg, color: palette.text }}
              >
                {rowsByDay.length} dias
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="rounded-3 p-2"
        style={{ width: '100%', height: 256, border: `1px solid ${palette.border}`, background: palette.cardBg }}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray='3 3' stroke={palette.grid} />
              <XAxis dataKey="slot" tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tick={{ fill: palette.muted, fontSize: 12 }} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
                contentStyle={{
                  background: palette.tooltipBg,
                  border: `1px solid ${palette.tooltipBorder}`,
                  color: palette.text
                }}
                labelStyle={{ color: palette.text, fontWeight: 600 }}
                itemStyle={{ color: palette.text }}
                wrapperStyle={{ zIndex: 20 }}
              />
              <Legend />
              <Bar
                dataKey='anterior'
                name="Anterior"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="actual"
                name="Actual"
                fill='#ef4444'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={`alert ${isDark ? "alert-secondary" : "alert-warning"} mb-0`}>
            No hay datos numericos compatibles para graficar esta metrica.
          </div>
        )}
      </div>

      <div className="mt-3 d-flex flex-column gap-3">
        {visibleDayGroups.map((group) => (
          <div
            key={group.dayLabel}
            className='rounded-3 overflow-hidden'
            style={{
              border: `1px solid ${palette.border}`,
              background: palette.cardBg,
              boxShadow: palette.panelShadow
            }}
          >
            <div
              className='d-flex align-items-center justify-content-between px-3 py-2'
              style={{
                background: palette.cardHeaderBg,
                borderBottom: `1px solid ${palette.border}`
              }}
            >
              <div className='d-flex align-items-center gap-2'>
                <span
                  style={{
                    width: 4,
                    height: 18,
                    borderRadius: 999,
                    background: palette.headerAccent
                  }}
                />
                <span className="fw-semibold">{group.dayLabel}</span>
              </div>
              <span
                className="badge"
                style={{ background: palette.badgeBg, color: palette.text }}
              >
                {group.rows.length}
              </span>
            </div>
            <div className="table-responsive">
              <table
                className="table table-sm align-middle mb-0"
                style={tableCssVars}
              >
                <thead>
                  <tr>
                    <th style={{ ...headCellStyle, width: "46%" }}>Ejercicio</th>
                    <th style={{ ...headCellStyle, width: "18%" }}>Sets</th>
                    <th style={{ ...headCellStyle, width: "18%" }}>Reps</th>
                    <th style={{ ...headCellStyle, width: '18%' }}>Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row, rowIdx) => (
                    <tr
                      key={row.key}
                      style={{
                        borderTop: `1px solid ${palette.rowBorder}`,
                        background: rowIdx % 2 === 0 ? 'transparent' : isDark ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)"
                      }}
                    >
                      <td className="small fw-semibold" title={row.exerciseName} style={bodyCellStyle}>
                        <div>{shortText(row.exerciseName, 40)}</div>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {(row.structureTags || []).map((tag, tagIdx) => {
                            const style = getTagStyle(tag);
                            return (
                              <span
                                key={`${row.key}-tag-${tagIdx}`}
                                className="badge"
                                style={{ ...style, fontWeight: 600 }}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={bodyCellStyle}>{renderTransition(row.sets.previousRaw, row.sets.currentRaw, row.sets.delta)}</td>
                      <td style={bodyCellStyle}>{renderTransition(row.reps.previousRaw, row.reps.currentRaw, row.reps.delta)}</td>
                      <td className="small" style={bodyCellStyle}>
                        <div className="d-flex flex-column gap-1">
                          <div className="small">
                            <span style={{ color: palette.muted, fontWeight: 500 }}>{row.peso.previousRaw}</span>
                            <span style={{ color: palette.muted }}> {"->"} </span>
                            <span style={{ color: palette.text, fontWeight: 700 }}>{row.peso.currentRaw}</span>
                          </div>
                          {row.peso.sameScale ? (
                            <div className="d-flex align-items-center" style={{ lineHeight: 1 }}>
                              {renderTrendIcon(row.peso.delta)}
                            </div>
                          ) : null}
                        </div>
                        {row.peso.sameScale ? (
                          null
                        ) : (
                          <small style={{ color: palette.muted }}>Escala distinta</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <small className="d-block mt-2" style={{ color: palette.muted }}>
        El grafico solo usa valores numericos y comparables en la misma escala.
      </small>
      <small className="d-block mt-1" style={{ color: palette.muted }}>
        * E1, E2, E3... representa el orden de ejercicios en el grafico (izquierda a derecha).
      </small>
      <small className="d-block mt-1" style={{ color: palette.muted }}>
        * Pasa o toca una barra para ver su tooltip.
      </small>
    </div>
  );
}

export default ExerciseComparisonChart;
