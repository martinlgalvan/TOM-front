import React from "react";
import {
  OPENERS_ATTEMPTS,
  OPENERS_EQUIPMENT_OPTIONS,
  OPENERS_LIFTS,
  normalizeOpenersPlan,
} from "../helpers/openersPlanner.js";

const parseNumericWeight = (value) => {
  const normalized = String(value || "").replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatWeight = (value) => {
  if (value == null) return '-';
  const fixed = Number(value.toFixed(2));
  return Number.isInteger(fixed) ? `${fixed}` : `${fixed}`;
};

function OpenersPlanEditor({
  value,
  onChange,
  readOnly = false,
  title = 'Plan de openers',
  className = "",
}) {
  const plan = React.useMemo(() => normalizeOpenersPlan(value), [value]);

  const emit = (nextPlan) => {
    if (readOnly || typeof onChange !== 'function') return;
    onChange(normalizeOpenersPlan({ ...nextPlan, updated_at: new Date().toISOString() }));
  };

  const updateTop = (field, fieldValue) => {
    emit({ ...plan, [field]: fieldValue });
  };

  const updateAttempt = (liftKey, attemptKey, field, fieldValue) => {
    emit({
      ...plan,
      lifts: {
        ...plan.lifts,
        [liftKey]: {
          ...plan.lifts[liftKey],
          [attemptKey]: {
            ...plan.lifts[liftKey][attemptKey],
            [field]: fieldValue,
          },
        },
      },
    });
  };

  const updateLiftNotes = (liftKey, fieldValue) => {
    emit({
      ...plan,
      lifts: {
        ...plan.lifts,
        [liftKey]: {
          ...plan.lifts[liftKey],
          notes: fieldValue,
        },
      },
    });
  };

  const bestByLift = React.useMemo(() => {
    const out = {};
    OPENERS_LIFTS.forEach(({ key }) => {
      const values = OPENERS_ATTEMPTS
        .map(({ key: attemptKey }) => parseNumericWeight(plan?.lifts?.[key]?.[attemptKey]?.weight))
        .filter((v) => v != null);
      out[key] = values.length ? Math.max(...values) : null;
    });
    return out;
  }, [plan]);

  const totalBest = React.useMemo(
    () => OPENERS_LIFTS.reduce((sum, lift) => sum + (bestByLift[lift.key] || 0), 0),
    [bestByLift]
  );

  return (
    <div className={`border rounded-3 p-3 bg-white ${className}`}>
      <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2'>
        <strong>{title}</strong>
        <span className="badge text-bg-light border">Total potencial: {formatWeight(totalBest)} kg</span>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-7">
          <label className="form-label mb-1 small">Competencia</label>
          <input
            className="form-control form-control-sm"
            value={plan.meetName}
            onChange={(e) => updateTop("meetName", e.target.value)}
            placeholder="Ej: Nacional Open"
            disabled={readOnly}
          />
        </div>
        <div className="col-12 col-md-5">
          <label className="form-label mb-1 small">Fecha</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={plan.meetDate}
            onChange={(e) => updateTop("meetDate", e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="col-12">
          <label className="form-label mb-1 small">Notas generales</label>
          <textarea
            className="form-control form-control-sm"
            rows={2}
            value={plan.notes}
            onChange={(e) => updateTop("notes", e.target.value)}
            placeholder="Estrategia de competencia y observaciones."
            disabled={readOnly}
          />
        </div>
      </div>

      {OPENERS_LIFTS.map((lift) => (
        <div key={lift.key} className="border rounded-3 p-2 mb-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <strong>{lift.label}</strong>
            <span className="badge text-bg-secondary">
              Mejor intento: {formatWeight(bestByLift[lift.key])} kg
            </span>
          </div>

          {OPENERS_ATTEMPTS.map((attempt) => {
            const attemptData = plan.lifts[lift.key][attempt.key];
            return (
              <div key={attempt.key} className="row g-2 align-items-center mb-2">
                <div className="col-12 col-sm-2">
                  <span className="small fw-semibold">{attempt.label}</span>
                </div>
                <div className="col-12 col-sm-3">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Peso"
                    value={attemptData.weight}
                    onChange={(e) => updateAttempt(lift.key, attempt.key, "weight", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="col-12 col-sm-3">
                  <select
                    className="form-select form-select-sm"
                    value={attemptData.result}
                    onChange={(e) => updateAttempt(lift.key, attempt.key, "result", e.target.value)}
                    disabled={readOnly}
                  >
                    {OPENERS_EQUIPMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-4">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Nota del intento"
                    value={attemptData.note}
                    onChange={(e) => updateAttempt(lift.key, attempt.key, "note", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            );
          })}

          <div>
            <label className="form-label mb-1 small">Notas del levantamiento</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={plan.lifts[lift.key].notes}
              onChange={(e) => updateLiftNotes(lift.key, e.target.value)}
              placeholder="Cue tecnico y ajustes."
              disabled={readOnly}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default OpenersPlanEditor;
