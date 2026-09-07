import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  ChevronRight,
  Clock,
  Download,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Trophy,
  Users
} from "lucide-react";

const STORAGE_KEY = "tomMeetPrototype:v1";

const defaultCategories = [
  "Mujeres -43 kg (Sub-Junior/Junior)",
  "Mujeres -47 kg",
  "Mujeres -52 kg",
  "Mujeres -57 kg",
  "Mujeres -63 kg",
  "Mujeres -69 kg",
  "Mujeres -76 kg",
  "Mujeres -84 kg",
  "Mujeres +84 kg",
  "Hombres -53 kg (Sub-Junior/Junior)",
  "Hombres -59 kg",
  "Hombres -66 kg",
  "Hombres -74 kg",
  "Hombres -83 kg",
  "Hombres -93 kg",
  "Hombres -105 kg",
  "Hombres -120 kg",
  "Hombres +120 kg"
];

const defaultTeams = ["TOM Barbell", "Fuerza Sur", "Independiente"];
const rackOptions = Array.from({ length: 25 }, (_, index) => String(index + 1));
const platformOptions = ["Plataforma 1", "Plataforma 2", "Plataforma 3", "Plataforma 4"];
const judgeIds = ["judge1", "judge2", "judge3"];
const judgeLabels = {
  judge1: "Juez 1",
  judge2: "Juez 2",
  judge3: "Juez 3"
};

const defaultAthletes = [
  {
    id: "athlete-1",
    name: "Juan Perez",
    team: "TOM Barbell",
    flight: "A",
    lot: 1,
    bodyweight: "82.4",
    division: "Open",
    weightClass: "83",
    rackSquat: "12",
    rackBench: "8",
    attempts: {
      squat: [{ weight: "180", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }],
      bench: [{ weight: "115", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }],
      deadlift: [{ weight: "220", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }]
    }
  },
  {
    id: "athlete-2",
    name: "Martin Gomez",
    team: "Fuerza Sur",
    flight: "A",
    lot: 2,
    bodyweight: "89.1",
    division: "Open",
    weightClass: "93",
    rackSquat: "14",
    rackBench: "9",
    attempts: {
      squat: [{ weight: "200", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }],
      bench: [{ weight: "130", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }],
      deadlift: [{ weight: "250", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }]
    }
  }
];

const liftLabels = {
  squat: "Sentadilla",
  bench: "Banco",
  deadlift: "Peso muerto"
};

const resultLabels = {
  pending: "Pendiente",
  good: "Válido",
  noLift: "Nulo"
};

const emptyAttempts = () => ({
  squat: [{ weight: "", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }],
  bench: [{ weight: "", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }],
  deadlift: [{ weight: "", result: "pending" }, { weight: "", result: "pending" }, { weight: "", result: "pending" }]
});

const createAthlete = () => ({
  id: `athlete-${Date.now()}`,
  name: "",
  team: "",
  flight: "A",
  lot: "",
  bodyweight: "",
  division: "Open",
  weightClass: "",
  rackSquat: "",
  rackBench: "",
  attempts: emptyAttempts()
});

const initialMeet = {
  name: "TOM Meet",
  federation: "TOM Rules",
  date: new Date().toISOString().slice(0, 10),
  platform: "Plataforma 1",
  unit: "kg",
  judgeMode: "single",
  categories: defaultCategories,
  teams: defaultTeams,
  judgeDecisions: {},
  activeLift: "squat",
  activeRound: 0,
  athletes: defaultAthletes
};

const normalizeMeet = (meet = initialMeet) => ({
  ...initialMeet,
  ...meet,
  platform: platformOptions.includes(meet.platform) ? meet.platform : "Plataforma 1",
  judgeMode: meet.judgeMode || "single",
  categories: Array.isArray(meet.categories) && meet.categories.length ? meet.categories : defaultCategories,
  teams: Array.isArray(meet.teams) && meet.teams.length ? meet.teams : defaultTeams,
  judgeDecisions: meet.judgeDecisions || {},
  athletes: Array.isArray(meet.athletes) ? meet.athletes : []
});

const toNumber = (value) => {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortAttemptOrder = (athletes, lift, round) => {
  return [...athletes]
    .filter((athlete) => athlete.attempts?.[lift]?.[round]?.weight)
    .sort((a, b) => {
      const weightDiff = toNumber(a.attempts[lift][round].weight) - toNumber(b.attempts[lift][round].weight);
      if (weightDiff !== 0) return weightDiff;
      return toNumber(a.lot) - toNumber(b.lot);
    });
};

const bestLift = (athlete, lift) => {
  return Math.max(
    0,
    ...(athlete.attempts?.[lift] || [])
      .filter((attempt) => attempt.result === "good")
      .map((attempt) => toNumber(attempt.weight))
  );
};

const total = (athlete) => bestLift(athlete, "squat") + bestLift(athlete, "bench") + bestLift(athlete, "deadlift");

const formatSeconds = (seconds) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

function TomMeetSuggestField({ label, value, options, onChange, onCommit, placeholder }) {
  const [open, setOpen] = useState(false);
  const normalizedValue = String(value || "").trim().toLowerCase();
  const visibleOptions = options.filter((option) => String(option).toLowerCase().includes(normalizedValue)).slice(0, 12);

  return (
    <label className="tomMeetSuggestLabel">
      {label}
      <div className="tomMeetSuggestField">
        <input
          value={value || ""}
          placeholder={placeholder}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
            onCommit?.();
          }}
        />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setOpen((current) => !current)}>
          ▾
        </button>
        {open && visibleOptions.length > 0 && (
          <div className="tomMeetSuggestMenu">
            {visibleOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  onCommit?.(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}

function TomMeetPage() {
  const [meet, setMeet] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return normalizeMeet(saved ? JSON.parse(saved) : initialMeet);
    } catch {
      return normalizeMeet(initialMeet);
    }
  });
  const [selectedAthleteId, setSelectedAthleteId] = useState(meet.athletes?.[0]?.id || "");
  const [timer, setTimer] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTeam, setNewTeam] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meet));
  }, [meet]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => {
      setTimer((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const orderedAttempts = useMemo(
    () => sortAttemptOrder(meet.athletes, meet.activeLift, meet.activeRound),
    [meet.athletes, meet.activeLift, meet.activeRound]
  );

  const currentAttempt = orderedAttempts.find(
    (athlete) => athlete.attempts[meet.activeLift][meet.activeRound].result === "pending"
  ) || orderedAttempts[0];

  const selectedAthlete = meet.athletes.find((athlete) => athlete.id === selectedAthleteId) || meet.athletes[0];
  const currentAttemptKey = currentAttempt ? `${currentAttempt.id}:${meet.activeLift}:${meet.activeRound}` : "";
  const currentJudgeDecisions = meet.judgeDecisions?.[currentAttemptKey] || {};
  const judgeGoodCount = judgeIds.filter((judgeId) => currentJudgeDecisions[judgeId] === "good").length;
  const judgeNoLiftCount = judgeIds.filter((judgeId) => currentJudgeDecisions[judgeId] === "noLift").length;

  const checklist = [
    { label: "Competencia configurada", done: Boolean(meet.name && meet.date && meet.platform) },
    { label: "Atletas cargados", done: meet.athletes.length > 0 },
    { label: "Todos tienen flight y lote", done: meet.athletes.every((athlete) => athlete.flight && athlete.lot) },
    { label: "Pesajes cargados", done: meet.athletes.every((athlete) => athlete.bodyweight) },
    { label: "Openers cargados", done: meet.athletes.every((athlete) => athlete.attempts.squat[0].weight && athlete.attempts.bench[0].weight && athlete.attempts.deadlift[0].weight) }
  ];

  const updateMeetField = (field, value) => {
    setMeet((current) => ({ ...current, [field]: value }));
  };

  const updateAthlete = (athleteId, field, value) => {
    setMeet((current) => ({
      ...current,
      athletes: current.athletes.map((athlete) =>
        athlete.id === athleteId ? { ...athlete, [field]: value } : athlete
      )
    }));
  };

  const updateAttempt = (athleteId, lift, index, field, value) => {
    setMeet((current) => ({
      ...current,
      athletes: current.athletes.map((athlete) => {
        if (athlete.id !== athleteId) return athlete;
        const nextAttempts = { ...athlete.attempts, [lift]: [...athlete.attempts[lift]] };
        nextAttempts[lift][index] = { ...nextAttempts[lift][index], [field]: value };
        return { ...athlete, attempts: nextAttempts };
      })
    }));
  };

  const addAthlete = () => {
    const athlete = createAthlete();
    setMeet((current) => ({ ...current, athletes: [...current.athletes, athlete] }));
    setSelectedAthleteId(athlete.id);
  };

  const removeAthlete = (athleteId) => {
    setMeet((current) => ({ ...current, athletes: current.athletes.filter((athlete) => athlete.id !== athleteId) }));
    if (selectedAthleteId === athleteId) setSelectedAthleteId("");
  };

  const resetTimer = () => {
    setTimer(60);
    setTimerRunning(false);
  };

  const setAttemptResult = (athleteId, lift, index, result) => {
    updateAttempt(athleteId, lift, index, "result", result);
    resetTimer();
  };

  const setJudgeDecision = (judgeId, result) => {
    if (!currentAttempt || !currentAttemptKey) return;

    setMeet((current) => {
      const nextDecisionsForAttempt = {
        ...(current.judgeDecisions?.[currentAttemptKey] || {}),
        [judgeId]: result
      };
      const goodCount = judgeIds.filter((id) => nextDecisionsForAttempt[id] === "good").length;
      const noLiftCount = judgeIds.filter((id) => nextDecisionsForAttempt[id] === "noLift").length;
      const finalResult = goodCount >= 2 ? "good" : noLiftCount >= 2 ? "noLift" : "pending";

      return {
        ...current,
        judgeDecisions: {
          ...(current.judgeDecisions || {}),
          [currentAttemptKey]: nextDecisionsForAttempt
        },
        athletes: current.athletes.map((athlete) => {
          if (athlete.id !== currentAttempt.id) return athlete;
          const nextAttempts = { ...athlete.attempts, [current.activeLift]: [...athlete.attempts[current.activeLift]] };
          nextAttempts[current.activeLift][current.activeRound] = {
            ...nextAttempts[current.activeLift][current.activeRound],
            result: finalResult
          };
          return { ...athlete, attempts: nextAttempts };
        })
      };
    });

    const nextDecisions = { ...currentJudgeDecisions, [judgeId]: result };
    const goodCount = judgeIds.filter((id) => nextDecisions[id] === "good").length;
    const noLiftCount = judgeIds.filter((id) => nextDecisions[id] === "noLift").length;
    if (goodCount >= 2 || noLiftCount >= 2) resetTimer();
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed || meet.categories.includes(trimmed)) return;
    setMeet((current) => ({ ...current, categories: [...current.categories, trimmed] }));
    setNewCategory("");
  };

  const removeCategory = (category) => {
    setMeet((current) => ({ ...current, categories: current.categories.filter((item) => item !== category) }));
  };

  const addTeam = () => {
    const trimmed = newTeam.trim();
    if (!trimmed || meet.teams.includes(trimmed)) return;
    setMeet((current) => ({ ...current, teams: [...current.teams, trimmed] }));
    setNewTeam("");
  };

  const ensureCategory = (value = selectedAthlete?.weightClass) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    setMeet((current) => current.categories.includes(trimmed)
      ? current
      : { ...current, categories: [...current.categories, trimmed] });
  };

  const ensureTeam = (value = selectedAthlete?.team) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    setMeet((current) => current.teams.includes(trimmed)
      ? current
      : { ...current, teams: [...current.teams, trimmed] });
  };

  const exportCsv = () => {
    const header = ["Nombre", "Equipo", "Flight", "Lote", "Peso corporal", "División", "Categoría", "SQ1", "SQ2", "SQ3", "BP1", "BP2", "BP3", "DL1", "DL2", "DL3", "Total"];
    const rows = meet.athletes.map((athlete) => [
      athlete.name,
      athlete.team,
      athlete.flight,
      athlete.lot,
      athlete.bodyweight,
      athlete.division,
      athlete.weightClass,
      ...athlete.attempts.squat.map((attempt) => `${attempt.weight || ""} ${resultLabels[attempt.result]}`.trim()),
      ...athlete.attempts.bench.map((attempt) => `${attempt.weight || ""} ${resultLabels[attempt.result]}`.trim()),
      ...athlete.attempts.deadlift.map((attempt) => `${attempt.weight || ""} ${resultLabels[attempt.result]}`.trim()),
      total(athlete)
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meet.name || "tom-meet"}-resultados.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tomMeetPage">
      <section className="tomMeetToolbar">
        <div>
          <p className="tomMeetEyebrow">TOM Meet</p>
          <h1>Gestor de competencias</h1>
        </div>
        <div className="tomMeetToolbarActions">
          <button type="button" onClick={exportCsv}>
            <Download size={17} /> Exportar CSV
          </button>
          <button type="button" onClick={() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meet))}>
            <Save size={17} /> Guardar local
          </button>
        </div>
      </section>

      <section className="tomMeetGrid">
        <div className="tomMeetPanel tomMeetSetupPanel">
          <div className="tomMeetPanelHeader">
            <ShieldCheck size={20} />
            <h2>Preparación</h2>
          </div>
          <div className="tomMeetFormGrid">
            <label>
              Competencia
              <input value={meet.name} onChange={(e) => updateMeetField("name", e.target.value)} />
            </label>
            <label>
              Federacion
              <input value={meet.federation} onChange={(e) => updateMeetField("federation", e.target.value)} />
            </label>
            <label>
              Fecha
              <input type="date" value={meet.date} onChange={(e) => updateMeetField("date", e.target.value)} />
            </label>
            <label>
              Plataforma
              <select value={meet.platform} onChange={(e) => updateMeetField("platform", e.target.value)}>
                {platformOptions.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
              </select>
            </label>
            <label>
              Modo de jueces
              <select value={meet.judgeMode} onChange={(e) => updateMeetField("judgeMode", e.target.value)}>
                <option value="single">Modo unico</option>
                <option value="three">3 jueces</option>
              </select>
            </label>
          </div>
          <div className="tomMeetSetupActions">
            <button type="button" onClick={() => setShowCategoriesDialog(true)}>
              Gestionar categorias
            </button>
          </div>
          <div className="tomMeetChecklist">
            {checklist.map((item) => (
              <div key={item.label} className={item.done ? "isDone" : ""}>
                <span>{item.done ? <Check size={15} /> : <ChevronRight size={15} />}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="tomMeetPanel tomMeetRunPanel">
          <div className="tomMeetPanelHeader">
            <Activity size={20} />
            <h2>Plataforma</h2>
          </div>
          <div className="tomMeetRunControls">
            <select value={meet.activeLift} onChange={(e) => updateMeetField("activeLift", e.target.value)}>
              {Object.entries(liftLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={meet.activeRound} onChange={(e) => updateMeetField("activeRound", Number(e.target.value))}>
              <option value={0}>1 intento</option>
              <option value={1}>2 intento</option>
              <option value={2}>3 intento</option>
            </select>
          </div>

          <div className="tomMeetCurrentAttempt">
            <div>
              <span>En plataforma</span>
              <strong>{currentAttempt?.name || "Sin intento cargado"}</strong>
              <small>{currentAttempt ? `${currentAttempt.team || "Sin equipo"} - Flight ${currentAttempt.flight}` : "Carga openers para iniciar"}</small>
            </div>
            <div className="tomMeetAttemptWeight">
              {currentAttempt?.attempts?.[meet.activeLift]?.[meet.activeRound]?.weight || "-"}
              <span>{meet.unit}</span>
            </div>
          </div>

          <div className="tomMeetTimerRow">
            <div className="tomMeetTimer">
              <Clock size={18} /> {formatSeconds(timer)}
            </div>
            <button type="button" onClick={() => setTimerRunning((value) => !value)}>
              {timerRunning ? "Pausar" : "Iniciar"}
            </button>
            <button type="button" onClick={resetTimer} className="tomMeetGhostBtn">
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          {currentAttempt && (
            <div className="tomMeetDecisionRow">
              {meet.judgeMode === "single" ? (
                <>
                  <button type="button" className="tomMeetGoodBtn" onClick={() => setAttemptResult(currentAttempt.id, meet.activeLift, meet.activeRound, "good")}>
                    Valido
                  </button>
                  <button type="button" className="tomMeetNoLiftBtn" onClick={() => setAttemptResult(currentAttempt.id, meet.activeLift, meet.activeRound, "noLift")}>
                    Nulo
                  </button>
                </>
              ) : (
                <div className="tomMeetJudgesPanel">
                  {judgeIds.map((judgeId) => {
                    const decision = currentJudgeDecisions[judgeId] || "pending";
                    return (
                      <div key={judgeId} className="tomMeetJudgeCard">
                        <span>{judgeLabels[judgeId]}</span>
                        <div className={`tomMeetJudgeLight ${decision}`} />
                        <div className="tomMeetJudgeActions">
                          <button type="button" className="tomMeetGoodBtn" onClick={() => setJudgeDecision(judgeId, "good")}>V</button>
                          <button type="button" className="tomMeetNoLiftBtn" onClick={() => setJudgeDecision(judgeId, "noLift")}>N</button>
                        </div>
                      </div>
                    );
                  })}
                  <strong className={judgeGoodCount >= 2 ? "isGood" : judgeNoLiftCount >= 2 ? "isNoLift" : ""}>
                    {judgeGoodCount >= 2 ? "Intento válido" : judgeNoLiftCount >= 2 ? "Intento nulo" : "Esperando luces"}
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="tomMeetPanel tomMeetPublicPanel">
          <div className="tomMeetPanelHeader">
            <Monitor size={20} />
            <h2>Pantalla publica</h2>
          </div>
          <div className="tomMeetDisplayCard">
            <span>{liftLabels[meet.activeLift]} - intento {Number(meet.activeRound) + 1}</span>
            <strong>{currentAttempt?.name || "Esperando atleta"}</strong>
            <div>{currentAttempt?.attempts?.[meet.activeLift]?.[meet.activeRound]?.weight || "-"} {meet.unit}</div>
            {meet.judgeMode === "three" && (
              <div className="tomMeetDisplayLights">
                {judgeIds.map((judgeId) => (
                  <span key={judgeId} className={currentJudgeDecisions[judgeId] || "pending"} />
                ))}
              </div>
            )}
            <small>Proximo: {orderedAttempts[1]?.name || "-"}</small>
          </div>
        </div>
      </section>

      <section className="tomMeetLowerGrid">
        <div className="tomMeetPanel">
          <div className="tomMeetPanelHeader">
            <Users size={20} />
            <h2>Atletas</h2>
            <button type="button" className="tomMeetSmallBtn" onClick={addAthlete}>
              <Plus size={16} /> Agregar
            </button>
          </div>
          <div className="tomMeetAthleteList">
            {meet.athletes.map((athlete) => (
              <button
                key={athlete.id}
                type="button"
                className={athlete.id === selectedAthlete?.id ? "isSelected" : ""}
                onClick={() => setSelectedAthleteId(athlete.id)}
              >
                <span>{athlete.name || "Atleta sin nombre"}</span>
                <small>Flight {athlete.flight || "-"} - lote {athlete.lot || "-"}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="tomMeetPanel tomMeetAthleteEditor">
          <div className="tomMeetPanelHeader">
            <Trophy size={20} />
            <h2>Ficha del atleta</h2>
            {selectedAthlete && (
              <button type="button" className="tomMeetDangerIcon" onClick={() => removeAthlete(selectedAthlete.id)}>
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {selectedAthlete ? (
            <>
              <div className="tomMeetFormGrid tomMeetAthleteFields">
                <label>
                  Nombre
                  <input value={selectedAthlete.name || ""} onChange={(e) => updateAthlete(selectedAthlete.id, "name", e.target.value)} />
                </label>
                <TomMeetSuggestField
                  label="Equipo"
                  value={selectedAthlete.team || ""}
                  options={meet.teams}
                  onChange={(value) => updateAthlete(selectedAthlete.id, "team", value)}
                  onCommit={ensureTeam}
                  placeholder="Club o equipo"
                />
                <label>
                  Flight
                  <input value={selectedAthlete.flight || ""} onChange={(e) => updateAthlete(selectedAthlete.id, "flight", e.target.value)} />
                </label>
                <label>
                  Lote
                  <input value={selectedAthlete.lot || ""} onChange={(e) => updateAthlete(selectedAthlete.id, "lot", e.target.value)} />
                </label>
                <label>
                  Peso corporal
                  <input value={selectedAthlete.bodyweight || ""} onChange={(e) => updateAthlete(selectedAthlete.id, "bodyweight", e.target.value)} />
                </label>
                <label>
                  Division
                  <input value={selectedAthlete.division || ""} onChange={(e) => updateAthlete(selectedAthlete.id, "division", e.target.value)} />
                </label>
                <TomMeetSuggestField
                  label="Categoría"
                  value={selectedAthlete.weightClass || ""}
                  options={meet.categories}
                  onChange={(value) => updateAthlete(selectedAthlete.id, "weightClass", value)}
                  onCommit={ensureCategory}
                  placeholder="Categoría"
                />
                <label>
                  Rack SQ
                  <input
                    list="tomMeetRacks"
                    value={selectedAthlete.rackSquat || ""}
                    onChange={(e) => updateAthlete(selectedAthlete.id, "rackSquat", e.target.value)}
                  />
                </label>
                <label>
                  Rack BP
                  <input
                    list="tomMeetRacks"
                    value={selectedAthlete.rackBench || ""}
                    onChange={(e) => updateAthlete(selectedAthlete.id, "rackBench", e.target.value)}
                  />
                </label>
              </div>
              <datalist id="tomMeetRacks">
                {rackOptions.map((rack) => <option key={rack} value={rack} />)}
              </datalist>

              <div className="tomMeetAttemptsTableWrap">
                <table className="tomMeetAttemptsTable">
                  <thead>
                    <tr>
                      <th>Levantamiento</th>
                      <th>1</th>
                      <th>2</th>
                      <th>3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(liftLabels).map(([lift, label]) => (
                      <tr key={lift}>
                        <td>{label}</td>
                        {[0, 1, 2].map((index) => (
                          <td key={`${lift}-${index}`}>
                            <input
                              value={selectedAthlete.attempts[lift][index].weight}
                              onChange={(e) => updateAttempt(selectedAthlete.id, lift, index, "weight", e.target.value)}
                              placeholder="kg"
                            />
                            <select
                              value={selectedAthlete.attempts[lift][index].result}
                              onChange={(e) => updateAttempt(selectedAthlete.id, lift, index, "result", e.target.value)}
                            >
                              <option value="pending">Pend.</option>
                              <option value="good">Válido</option>
                              <option value="noLift">Nulo</option>
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="tomMeetEmptyState">Agrega un atleta para empezar.</div>
          )}
        </div>

        <div className="tomMeetPanel">
          <div className="tomMeetPanelHeader">
            <Activity size={20} />
            <h2>Orden de salida</h2>
          </div>
          <div className="tomMeetAttemptOrder">
            {orderedAttempts.length ? orderedAttempts.map((athlete) => {
              const attempt = athlete.attempts[meet.activeLift][meet.activeRound];
              return (
                <div key={athlete.id} className={attempt.result !== "pending" ? `is${attempt.result}` : ""}>
                  <span>{athlete.name || "Atleta sin nombre"}</span>
                  <strong>{attempt.weight} {meet.unit}</strong>
                  <small>{resultLabels[attempt.result]}</small>
                </div>
              );
            }) : (
              <div className="tomMeetEmptyState">No hay intentos cargados para esta ronda.</div>
            )}
          </div>
        </div>
      </section>

      {showCategoriesDialog && (
        <div className="tomMeetModalBackdrop" role="presentation" onMouseDown={() => setShowCategoriesDialog(false)}>
          <div className="tomMeetModal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="tomMeetModalHeader">
              <div>
                <p className="tomMeetEyebrow">Categorías</p>
                <h2>Configurar categorías y equipos</h2>
              </div>
              <button type="button" onClick={() => setShowCategoriesDialog(false)}>Cerrar</button>
            </div>

            <div className="tomMeetModalGrid">
              <div>
                <h3>Categorías disponibles</h3>
                <div className="tomMeetAddRow">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ej: Mujeres -90 kg"
                  />
                  <button type="button" onClick={addCategory}>Agregar</button>
                </div>
                <div className="tomMeetPillList">
                  {meet.categories.map((category) => (
                    <button key={category} type="button" onClick={() => removeCategory(category)}>
                      {category} <span>x</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3>Equipos frecuentes</h3>
                <div className="tomMeetAddRow">
                  <input
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="Ej: Club de fuerza"
                  />
                  <button type="button" onClick={addTeam}>Agregar</button>
                </div>
                <div className="tomMeetPillList">
                  {meet.teams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => setMeet((current) => ({ ...current, teams: current.teams.filter((item) => item !== team) }))}
                    >
                      {team} <span>x</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TomMeetPage;
