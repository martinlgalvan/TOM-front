import React from 'react';
import { OPENERS_EQUIPMENT_OPTIONS } from '../helpers/openersPlanner.js';

const ATTEMPTS = [
  { key: 'open', label: 'Open' },
  { key: 'second', label: '2do' },
  { key: 'third', label: '3ro' }
];

const LIFTS = [
  { key: 'squat', label: 'Sentadilla' },
  { key: 'bench', label: 'Banco' },
  { key: 'deadlift', label: 'Peso muerto' }
];

const LEGACY_RESULT_MAP = {
  planned: 'eq_none',
  done: 'eq_none',
  miss: 'eq_none',
  skip: 'eq_none'
};

const normalizeAttemptResult = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (OPENERS_EQUIPMENT_OPTIONS.some((item) => item.value === raw)) return raw;
  return LEGACY_RESULT_MAP[raw] || 'eq_none';
};

const emptyAttempt = () => ({ weight: '', result: 'eq_none', note: '' });

const createDefaultPlan = () => ({
  meetName: '',
  meetDate: '',
  notes: '',
  lifts: {
    squat: { open: emptyAttempt(), second: emptyAttempt(), third: emptyAttempt(), notes: '' },
    bench: { open: emptyAttempt(), second: emptyAttempt(), third: emptyAttempt(), notes: '' },
    deadlift: { open: emptyAttempt(), second: emptyAttempt(), third: emptyAttempt(), notes: '' }
  }
});

const getStorageKey = (athleteId) => `athlete:tools:attempt_planner:${athleteId || "unknown"}`;

const toMergedPlan = (raw) => {
  const base = createDefaultPlan();
  if (!raw || typeof raw !== 'object') return base;

  const out = {
    ...base,
    ...raw,
    lifts: { ...base.lifts, ...(raw.lifts || {}) }
  };

  LIFTS.forEach(({ key }) => {
    const incomingLift = out.lifts[key] || {};
    out.lifts[key] = {
      notes: typeof incomingLift.notes === 'string' ? incomingLift.notes : '',
      open: {
        ...emptyAttempt(),
        ...(incomingLift.open || {}),
        result: normalizeAttemptResult(incomingLift?.open?.result)
      },
      second: {
        ...emptyAttempt(),
        ...(incomingLift.second || {}),
        result: normalizeAttemptResult(incomingLift?.second?.result)
      },
      third: {
        ...emptyAttempt(),
        ...(incomingLift.third || {}),
        result: normalizeAttemptResult(incomingLift?.third?.result)
      }
    };
  });

  return out;
};

const parseWeight = (value) => {
  const normalized = String(value || '').replace(',', '.').trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatWeight = (value) => {
  if (value == null) return '-';
  const fixed = Number(value.toFixed(2));
  return Number.isInteger(fixed) ? `${fixed}` : `${fixed}`;
};

function AttemptPlannerTool({
  athleteId,
  isDark = false,
  initialData,
  onChange,
  saveState,
  readOnly = false
}) {
  const storageKey = React.useMemo(() => getStorageKey(athleteId), [athleteId]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [plan, setPlan] = React.useState(() => createDefaultPlan());
  const lastExternalHashRef = React.useRef('');
  const currentPlanHashRef = React.useRef('');

  React.useEffect(() => {
    if (readOnly) {
      setIsLoaded(true);
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlan(toMergedPlan(parsed));
      } else {
        setPlan(createDefaultPlan());
      }
    } catch {
      setPlan(createDefaultPlan());
    } finally {
      setIsLoaded(true);
    }
  }, [readOnly, storageKey]);

  React.useEffect(() => {
    if (typeof initialData === 'undefined') return;
    const normalized = toMergedPlan(initialData);
    try {
      const hash = JSON.stringify(normalized);
      if (hash && hash === currentPlanHashRef.current) {
        lastExternalHashRef.current = hash;
        setIsLoaded(true);
        return;
      }
      if (hash && hash === lastExternalHashRef.current) return;
      lastExternalHashRef.current = hash;
    } catch {
      // noop
    }
    setPlan(normalized);
    setIsLoaded(true);
  }, [initialData]);

  React.useEffect(() => {
    if (readOnly) return;
    if (!isLoaded || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(plan));
  }, [isLoaded, readOnly, storageKey, plan]);

  React.useEffect(() => {
    try {
      currentPlanHashRef.current = JSON.stringify(plan);
    } catch {
      currentPlanHashRef.current = '';
    }
  }, [plan]);

  const setPlanAndEmit = (updater) => {
    if (readOnly) return;
    setPlan((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof onChange === 'function') onChange(next);
      return next;
    });
  };

  const hasTrainerPlan = React.useMemo(() => {
    if (!plan || typeof plan !== 'object') return false;
    if (String(plan.meetName || '').trim()) return true;
    if (String(plan.meetDate || '').trim()) return true;
    if (String(plan.notes || '').trim()) return true;

    return LIFTS.some(({ key }) => {
      const lift = plan.lifts?.[key];
      if (!lift) return false;
      if (String(lift.notes || '').trim()) return true;
      return ATTEMPTS.some(({ key: attemptKey }) => {
        const item = lift[attemptKey] || {};
        if (String(item.weight || '').trim()) return true;
        if (String(item.note || '').trim()) return true;
        return item.result && item.result !== 'eq_none';
      });
    });
  }, [plan]);

  const updateTop = (field, value) => {
    setPlanAndEmit((prev) => ({ ...prev, [field]: value }));
  };

  const updateAttempt = (liftKey, attemptKey, field, value) => {
    setPlanAndEmit((prev) => ({
      ...prev,
      lifts: {
        ...prev.lifts,
        [liftKey]: {
          ...prev.lifts[liftKey],
          [attemptKey]: {
            ...prev.lifts[liftKey][attemptKey],
            [field]: value
          }
        }
      }
    }));
  };

  const updateLiftNotes = (liftKey, value) => {
    setPlanAndEmit((prev) => ({
      ...prev,
      lifts: {
        ...prev.lifts,
        [liftKey]: {
          ...prev.lifts[liftKey],
          notes: value
        }
      }
    }));
  };

  const bestByLift = React.useMemo(() => {
    const out = {};
    LIFTS.forEach(({ key }) => {
      const values = ATTEMPTS
        .map(({ key: attemptKey }) => parseWeight(plan.lifts[key][attemptKey]?.weight))
        .filter((v) => v != null);
      out[key] = values.length ? Math.max(...values) : null;
    });
    return out;
  }, [plan]);

  const totalBest = React.useMemo(
    () =>
      LIFTS.reduce((sum, lift) => sum + (bestByLift[lift.key] || 0), 0),
    [bestByLift]
  );

  const resetPlan = () => {
    setPlanAndEmit(createDefaultPlan());
  };

  if (readOnly && !hasTrainerPlan) {
    return (
      <div className={`ath-tool-wrap ${isDark ? "ath-tool-dark" : "ath-tool-light"}`}>
        <div className="ath-tool-card">
          <strong>Planificador de intentos</strong>
          <p className='ath-tool-muted mt-2 mb-0'>
            Esta seccion esta dedicada a la competencia, en caso de que tu entrenador ingrese la informacion de tu torneo, aca lo veras.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ath-tool-wrap ${isDark ? "ath-tool-dark" : "ath-tool-light"}`}>
      <div className="ath-tool-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <strong>Planificador de intentos</strong>
          {!readOnly ? (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetPlan}>
              Limpiar
            </button>
          ) : null}
        </div>
        <small className="ath-tool-muted d-block mt-1">
          {readOnly
            ? 'Esta informacion la carga tu entrenador.'
            : saveState?.pending
            ? 'Sin sincronizar: se guardo localmente y se reintentara.'
            : 'Se guarda en tu perfil y en este dispositivo.'}
        </small>

        <div className="row g-2 mt-1">
          <div className="col-12 col-md-7">
            <label className="form-label mb-1 small">Competencia</label>
            <input
              className="form-control form-control-sm"
              value={plan.meetName}
              onChange={(e) => updateTop('meetName', e.target.value)}
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
              onChange={(e) => updateTop('meetDate', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="col-12">
            <label className="form-label mb-1 small">Notas generales</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={plan.notes}
              onChange={(e) => updateTop('notes', e.target.value)}
              placeholder="Estrategia general, orden de prioridades, etc."
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {LIFTS.map((lift) => (
        <div key={lift.key} className="ath-tool-card">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <strong>{lift.label}</strong>
            <span className="ath-tool-pill">
              Mejor intento: {formatWeight(bestByLift[lift.key])} kg
            </span>
          </div>

          {ATTEMPTS.map((attempt) => {
            const attemptData = plan.lifts[lift.key][attempt.key];
            return (
              <div key={attempt.key} className="ath-attempt-row">
                <div className="ath-attempt-label">{attempt.label}</div>
                <input
                  className="form-control form-control-sm"
                  placeholder="kg"
                  value={attemptData.weight}
                  onChange={(e) => updateAttempt(lift.key, attempt.key, 'weight', e.target.value)}
                  disabled={readOnly}
                />
                <select
                  className="form-select form-select-sm"
                  value={attemptData.result}
                  onChange={(e) => updateAttempt(lift.key, attempt.key, 'result', e.target.value)}
                  disabled={readOnly}
                >
                  {OPENERS_EQUIPMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control form-control-sm"
                  placeholder="Nota del intento"
                  value={attemptData.note}
                  onChange={(e) => updateAttempt(lift.key, attempt.key, 'note', e.target.value)}
                  disabled={readOnly}
                />
              </div>
            );
          })}

          <div className="mt-2">
            <label className="form-label mb-1 small">Notas del levantamiento</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={plan.lifts[lift.key].notes}
              onChange={(e) => updateLiftNotes(lift.key, e.target.value)}
              placeholder="Cue tecnico, ajuste de intento, observacion rapida."
              disabled={readOnly}
            />
          </div>
        </div>
      ))}

      <div className="ath-tool-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <strong>Total potencial</strong>
          <span className="ath-tool-pill">{formatWeight(totalBest)} kg</span>
        </div>
        <small className="ath-tool-muted d-block mt-1">
          Se calcula con el mejor peso cargado por lift (solo referencia).
        </small>
      </div>
    </div>
  );
}

export default AttemptPlannerTool;
