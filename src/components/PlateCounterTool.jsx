import React from "react";

const COMPETITION_PLATES = [25, 15, 10, 5, 2.5, 1.25];
const NORMAL_PLATES = [20, 15, 10, 5, 2.5, 1.25];

const plateColorCompetition = (plate) => {
  if (plate === 25) return "#d32f2f";
  if (plate === 15) return "#fbc02d";
  if (plate === 10) return "#388e3c";
  if (plate === 5) return "#9ca3af";
  return "#e5e7eb";
};

const plateColorNormal = (plate, idx) => {
  const shades = ["#6b7280", "#52525b", "#71717a", "#4b5563", "#9ca3af"];
  return shades[idx % shades.length];
};

const formatKg = (value) => {
  if (value == null || Number.isNaN(value)) return "-";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
};

const parseNum = (value) => {
  const normalized = String(value ?? "").replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const getPerSidePlates = (targetWeight, barWeight, plates) => {
  const remainingRaw = targetWeight - barWeight;
  if (remainingRaw <= 0) return { perSide: 0, loadedPerSide: 0, list: [] };

  let remainingPerSide = remainingRaw / 2;
  const out = [];

  plates.forEach((plate) => {
    while (remainingPerSide >= plate - 0.0001) {
      out.push(plate);
      remainingPerSide -= plate;
    }
  });

  const loadedPerSide = out.reduce((acc, p) => acc + p, 0);
  return {
    perSide: remainingRaw / 2,
    loadedPerSide,
    list: out,
  };
};

const getPlateVisualWidth = (plate) => Math.max(14, 7 + plate * 0.39);
const getPlateVisualHeight = (plate) => Math.max(34, 30 + plate * 1.08);
const getPlateLabelColor = (plate, isCompetition) => {
  if (!isCompetition) return "#f8fafc";
  return plate <= 5 ? "#111827" : "#f8fafc";
};
const getPlateLabelSize = (plate) => {
  if (plate <= 1.25) return 5.5;
  if (plate <= 2.5) return 6.5;
  if (plate <= 5) return 7;
  if (plate < 15) return 8;
  return 9;
};

function PlateCounterTool({ isDark = false }) {
  const [target, setTarget] = React.useState("");
  const [mode, setMode] = React.useState("normal");
  const [barWeight, setBarWeight] = React.useState("20");

  const isCompetition = mode === "competition";
  const plates = isCompetition ? COMPETITION_PLATES : NORMAL_PLATES;
  const barOptions = isCompetition ? ["20", "25"] : ["20", "15", "10"];

  React.useEffect(() => {
    if (!barOptions.includes(String(barWeight))) {
      setBarWeight(barOptions[0]);
    }
  }, [barOptions, barWeight]);

  const targetNum = parseNum(target);
  const barNum = parseNum(barWeight) || 0;

  const result = React.useMemo(
    () =>
      targetNum != null
        ? getPerSidePlates(targetNum, barNum, plates)
        : { perSide: 0, loadedPerSide: 0, list: [] },
    [targetNum, barNum, plates]
  );

  const cannotRepresent =
    targetNum != null && targetNum > barNum && result.loadedPerSide < result.perSide - 0.0001;
  const visualPlates = result.list.slice(0, 12);
  const leftVisualPlates = [...visualPlates].reverse();
  const rightVisualPlates = [...visualPlates];

  const shellStyle = isDark
    ? { background: "#0f172a", border: "1px solid rgba(255,255,255,0.14)", color: "#e5e7eb" }
    : { background: "#fff", border: "1px solid #dbe3ef", color: "#111827" };

  const softStyle = isDark
    ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }
    : { background: "#f8fafc", border: "1px solid #e2e8f0" };

  const inputStyle = isDark
    ? {
        background: "#111827",
        borderColor: "rgba(255,255,255,0.18)",
        color: "#e5e7eb",
      }
    : undefined;

  const helperTextStyle = isDark ? { color: "#cbd5e1" } : { color: "#475569" };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="rounded-3 p-3" style={shellStyle}>
        <div className="row g-2">
          <div className="col-12 col-md-4">
            <label className="form-label small mb-1">Peso objetivo (kg)</label>
            <input
              className="form-control form-control-sm"
              placeholder="Ej: 180"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small mb-1">Modo</label>
            <select
              className="form-select form-select-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={inputStyle}
            >
              <option value="normal">Normal</option>
              <option value="competition">Competencia</option>
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small mb-1">Barra (kg)</label>
            <select
              className="form-select form-select-sm"
              value={barWeight}
              onChange={(e) => setBarWeight(e.target.value)}
              style={inputStyle}
            >
              {barOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} kg
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3 p-3" style={shellStyle}>
        {targetNum == null ? (
          <p className="mb-0 small" style={helperTextStyle}>Ingresa un peso objetivo para calcular los discos por lado.</p>
        ) : targetNum <= barNum ? (
          <p className="mb-0 small" style={helperTextStyle}>El peso objetivo es menor o igual al peso de la barra.</p>
        ) : (
          <>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge text-bg-secondary">
                Cargado por lado: {formatKg(result.loadedPerSide)} kg
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {result.list.length === 0 ? (
                <span className="small">No hacen falta discos.</span>
              ) : (
                result.list.map((plate, idx) => (
                  <span
                    key={`${plate}-${idx}`}
                    className="badge"
                    style={{
                      background: isCompetition
                        ? plateColorCompetition(plate)
                        : plateColorNormal(plate, idx),
                      color: plate <= 5 || !isCompetition ? "#f8fafc" : "#111827",
                    }}
                  >
                    {plate} kg
                  </span>
                ))
              )}
            </div>

            <div className="rounded-3 p-3 mb-2" style={softStyle}>
              <div
                style={{
                  position: "relative",
                  minHeight: 132,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 20,
                    right: 20,
                    top: "50%",
                    height: 8,
                    transform: "translateY(-50%)",
                    borderRadius: 999,
                    background: isDark
                      ? "linear-gradient(90deg, #475569 0%, #cbd5e1 24%, #94a3b8 50%, #cbd5e1 76%, #475569 100%)"
                      : "linear-gradient(90deg, #94a3b8 0%, #f1f5f9 24%, #cbd5e1 50%, #f1f5f9 76%, #94a3b8 100%)",
                    boxShadow:
                      "inset 0 1px 2px rgba(255,255,255,0.32), inset 0 -1px 2px rgba(15,23,42,0.25)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 92,
                    height: 14,
                    transform: "translate(-50%, -50%)",
                    borderRadius: 999,
                    background: isDark
                      ? "linear-gradient(180deg, #334155 0%, #475569 50%, #334155 100%)"
                      : "linear-gradient(180deg, #cbd5e1 0%, #94a3b8 50%, #cbd5e1 100%)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -1px 1px rgba(15,23,42,0.18)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "calc(50% - 58px)",
                    top: "50%",
                    width: 16,
                    height: 12,
                    transform: "translateY(-50%)",
                    borderRadius: 999,
                    background: isDark ? "#e2e8f0" : "#94a3b8",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.24)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "calc(50% + 42px)",
                    top: "50%",
                    width: 16,
                    height: 12,
                    transform: "translateY(-50%)",
                    borderRadius: 999,
                    background: isDark ? "#e2e8f0" : "#94a3b8",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.24)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: "50%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    paddingRight: 22,
                  }}
                >
                  {leftVisualPlates.map((plate, idx) => (
                    <div
                      key={`vis-${plate}-${idx}`}
                      title={`${plate} kg`}
                      style={{
                        width: getPlateVisualWidth(plate),
                        height: getPlateVisualHeight(plate),
                        borderRadius: 6,
                        border: "1px solid rgba(15,23,42,0.22)",
                        background: isCompetition
                          ? plateColorCompetition(plate)
                          : plateColorNormal(plate, idx),
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: getPlateLabelSize(plate),
                          fontWeight: 700,
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                          color: getPlateLabelColor(plate, isCompetition),
                          userSelect: "none",
                          whiteSpace: "nowrap",
                          textShadow:
                            plate <= 5 && isCompetition
                              ? "0 1px 0 rgba(255,255,255,0.24)"
                              : "0 1px 1px rgba(15,23,42,0.28)",
                        }}
                      >
                        {formatKg(plate)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      width: 8,
                      height: 54,
                      borderRadius: 999,
                      background: isDark
                        ? "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)"
                        : "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)",
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    paddingLeft: 22,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 54,
                      borderRadius: 999,
                      background: isDark
                        ? "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)"
                        : "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)",
                    }}
                  />
                  {rightVisualPlates.map((plate, idx) => (
                    <div
                      key={`vis-r-${plate}-${idx}`}
                      title={`${plate} kg`}
                      style={{
                        width: getPlateVisualWidth(plate),
                        height: getPlateVisualHeight(plate),
                        borderRadius: 6,
                        border: "1px solid rgba(15,23,42,0.22)",
                        background: isCompetition
                          ? plateColorCompetition(plate)
                          : plateColorNormal(plate, idx),
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: getPlateLabelSize(plate),
                          fontWeight: 700,
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                          color: getPlateLabelColor(plate, isCompetition),
                          userSelect: "none",
                          whiteSpace: "nowrap",
                          textShadow:
                            plate <= 5 && isCompetition
                              ? "0 1px 0 rgba(255,255,255,0.24)"
                              : "0 1px 1px rgba(15,23,42,0.28)",
                        }}
                      >
                        {formatKg(plate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {cannotRepresent ? (
              <small className="text-warning">
                El peso no se puede representar exacto con los discos disponibles en este modo.
              </small>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default PlateCounterTool;
