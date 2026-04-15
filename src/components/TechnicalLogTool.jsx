import React from 'react';

const DEFAULT_FORM = {
  date: new Date().toISOString().slice(0, 10),
  lift: 'squat',
  exercise: '',
  weight: '',
  reps: '',
  rpe: '',
  status: 'solid',
  mainError: '',
  nextCue: '',
  video: '',
  notes: ''
};

const LIFT_OPTIONS = [
  { value: 'squat', label: 'Sentadilla' },
  { value: 'bench', label: 'Banco' },
  { value: 'deadlift', label: 'Peso muerto' },
  { value: 'other', label: 'Otro' }
];

const STATUS_OPTIONS = [
  { value: 'solid', label: 'Solido' },
  { value: 'doubt', label: 'Dudoso' },
  { value: 'miss', label: 'Fallo' }
];

const STORAGE_KEY_PREFIX = 'athlete:tools:technical_log:';

const getStorageKey = (athleteId) => `${STORAGE_KEY_PREFIX}${athleteId || "unknown"}`;

const formatLift = (value) => {
  const found = LIFT_OPTIONS.find((option) => option.value === value);
  return found ? found.label : value;
};

const formatStatus = (value) => {
  const found = STATUS_OPTIONS.find((option) => option.value === value);
  return found ? found.label : value;
};

const statusClass = (value) => {
  if (value === 'solid') return 'ath-log-status-solid';
  if (value === 'doubt') return 'ath-log-status-doubt';
  return 'ath-log-status-miss';
};

function TechnicalLogTool({
  athleteId,
  isDark = false,
  initialEntries,
  onChange,
  saveState
}) {
  const storageKey = React.useMemo(() => getStorageKey(athleteId), [athleteId]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [entries, setEntries] = React.useState([]);
  const [form, setForm] = React.useState(DEFAULT_FORM);
  const [filterLift, setFilterLift] = React.useState('all');
  const lastExternalHashRef = React.useRef('');
  const currentEntriesHashRef = React.useRef('');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      setEntries(Array.isArray(parsed) ? parsed : []);
    } catch {
      setEntries([]);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (typeof initialEntries === 'undefined') return;
    const normalized = Array.isArray(initialEntries) ? initialEntries : [];
    try {
      const hash = JSON.stringify(normalized);
      if (hash && hash === currentEntriesHashRef.current) {
        lastExternalHashRef.current = hash;
        setIsLoaded(true);
        return;
      }
      if (hash && hash === lastExternalHashRef.current) return;
      lastExternalHashRef.current = hash;
    } catch {
      // noop
    }
    setEntries(normalized);
    setIsLoaded(true);
  }, [initialEntries]);

  React.useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, isLoaded, storageKey]);

  React.useEffect(() => {
    try {
      currentEntriesHashRef.current = JSON.stringify(entries);
    } catch {
      currentEntriesHashRef.current = '';
    }
  }, [entries]);

  const setEntriesAndEmit = (updater) => {
    setEntries((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof onChange === 'function') onChange(next);
      return next;
    });
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addEntry = () => {
    if (!form.date) return;
    const hasAnyNote = form.mainError.trim() || form.nextCue.trim() || form.notes.trim() || form.exercise.trim();
    if (!hasAnyNote) return;

    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      ...form
    };

    setEntriesAndEmit((prev) =>
      [newEntry, ...prev].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))
    );

    setForm((prev) => ({
      ...DEFAULT_FORM,
      date: prev.date || new Date().toISOString().slice(0, 10),
      lift: prev.lift
    }));
  };

  const deleteEntry = (id) => {
    setEntriesAndEmit((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clearAll = () => {
    setEntriesAndEmit([]);
  };

  const visibleEntries = React.useMemo(() => {
    if (filterLift === 'all') return entries;
    return entries.filter((entry) => entry.lift === filterLift);
  }, [entries, filterLift]);

  return (
    <div className={`ath-tool-wrap ${isDark ? "ath-tool-dark" : "ath-tool-light"}`}>
      <div className="ath-tool-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <strong>Bitacora tecnica</strong>
          <small className="ath-tool-muted">{entries.length} registros</small>
        </div>
        <small className="ath-tool-muted d-block mt-1">
          {saveState?.pending
            ? 'Sin sincronizar: se guardo localmente y se reintentara.'
            : 'Registro de errores, cues y sensaciones guardado en perfil.'}
        </small>

        <div className="row g-2 mt-1">
          <div className="col-6 col-md-3">
            <label className="form-label mb-1 small">Fecha</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label mb-1 small">Levantamiento</label>
            <select
              className="form-select form-select-sm"
              value={form.lift}
              onChange={(e) => setField('lift', e.target.value)}
            >
              {LIFT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label mb-1 small">Ejercicio</label>
            <input
              className="form-control form-control-sm"
              value={form.exercise}
              onChange={(e) => setField('exercise', e.target.value)}
              placeholder="Ej: Sentadilla con pausa"
            />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label mb-1 small">Peso</label>
            <input
              className="form-control form-control-sm"
              value={form.weight}
              onChange={(e) => setField('weight', e.target.value)}
              placeholder="kg"
            />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label mb-1 small">Reps</label>
            <input
              className="form-control form-control-sm"
              value={form.reps}
              onChange={(e) => setField('reps', e.target.value)}
              placeholder="x"
            />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label mb-1 small">RPE</label>
            <input
              className="form-control form-control-sm"
              value={form.rpe}
              onChange={(e) => setField('rpe', e.target.value)}
              placeholder="1-10"
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label mb-1 small">Estado del intento</label>
            <select
              className="form-select form-select-sm"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label mb-1 small">Error principal</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={form.mainError}
              onChange={(e) => setField('mainError', e.target.value)}
              placeholder="Ej: Cadera sube primero en el sticking point."
            />
          </div>
          <div className="col-12">
            <label className="form-label mb-1 small">Cue para proximo intento</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={form.nextCue}
              onChange={(e) => setField('nextCue', e.target.value)}
              placeholder="Ej: Empujar piso con medio pie + pecho alto."
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label mb-1 small">Video (opcional)</label>
            <input
              className="form-control form-control-sm"
              value={form.video}
              onChange={(e) => setField('video', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label mb-1 small">Notas</label>
            <input
              className="form-control form-control-sm"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Sensaciones, timing, setup, etc."
            />
          </div>
        </div>

        <div className="d-flex gap-2 mt-3 flex-wrap">
          <button type="button" className="btn btn-sm btn-primary" onClick={addEntry}>
            Agregar registro
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setForm(DEFAULT_FORM)}
          >
            Limpiar formulario
          </button>
        </div>
      </div>

      <div className="ath-tool-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <strong>Historial tecnico</strong>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={filterLift}
              onChange={(e) => setFilterLift(e.target.value)}
            >
              <option value="all">Todos</option>
              {LIFT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={clearAll}>
              Borrar todo
            </button>
          </div>
        </div>

        {visibleEntries.length === 0 ? (
          <p className="ath-tool-muted mt-3 mb-0">No hay registros para el filtro seleccionado.</p>
        ) : (
          <div className="ath-log-list mt-3">
            {visibleEntries.map((entry) => (
              <div key={entry.id} className="ath-log-item">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="ath-tool-pill">{entry.date || '-'}</span>
                    <span className="ath-tool-pill">{formatLift(entry.lift)}</span>
                    <span className={`ath-tool-pill ${statusClass(entry.status)}`}>{formatStatus(entry.status)}</span>
                  </div>
                    <button
                      type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    Borrar
                  </button>
                </div>

                <div className="ath-log-meta mt-2">
                  <span>{entry.exercise || 'Sin ejercicio'}</span>
                  {entry.weight ? <span>{entry.weight} kg</span> : null}
                  {entry.reps ? <span>{entry.reps} reps</span> : null}
                  {entry.rpe ? <span>RPE {entry.rpe}</span> : null}
                </div>

                {entry.mainError ? (
                  <div className="mt-2">
                    <small className="ath-tool-muted d-block">Error principal</small>
                    <div>{entry.mainError}</div>
                  </div>
                ) : null}

                {entry.nextCue ? (
                  <div className="mt-2">
                    <small className="ath-tool-muted d-block">Cue siguiente</small>
                    <div>{entry.nextCue}</div>
                  </div>
                ) : null}

                {entry.notes ? (
                  <div className="mt-2">
                    <small className="ath-tool-muted d-block">Notas</small>
                    <div>{entry.notes}</div>
                  </div>
                ) : null}

                {entry.video ? (
                  <a
                    href={entry.video}
                    target="_blank"
                    rel="noreferrer"
                    className="d-inline-block mt-2"
                  >
                    Ver video
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TechnicalLogTool;
