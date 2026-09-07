import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ObjectId from "bson-objectid";
import { parseExerciseCommand } from "../src/helpers/exerciseCommandParser.js";

// This suite stress-tests the day planner data-shape logic with random operation
// combinations (exercise, block, circuit, copy/paste, and day deletion).

const newId = () => new ObjectId().toString();
const newUUID = () => {
  // Good-enough deterministic UUID-like token for test data.
  const a = Math.random().toString(16).slice(2, 10);
  const b = Math.random().toString(16).slice(2, 10);
  return `${a}${b}`;
};

test("exercise command parser creates a simple exercise draft without AI", () => {
  const parsed = parseExerciseCommand("Sentadilla al cajón, tres series por cuatro repeticiones, 200 kg y 3 minutos de descanso.");
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.data, {
    name: "Sentadilla al cajón",
    sets: 3,
    reps: 4,
    peso: "200 kg",
    rest: "03:00",
  });
});

test("exercise command parser accepts compact and labeled syntax", () => {
  assert.deepEqual(parseExerciseCommand("Press banca 4x6, 100 kg, descanso 2 minutos.").data, {
    name: "Press banca",
    sets: 4,
    reps: 6,
    peso: "100 kg",
    rest: "02:00",
  });
  assert.equal(parseExerciseCommand("Ejercicio: remo con barra. Series: 3. Reps: 8. Peso: 70 kg. Descanso: 90 segundos.").ok, true);
});

test("exercise command parser reports missing required fields", () => {
  const parsed = parseExerciseCommand("Sentadilla al cajón");
  assert.equal(parsed.ok, false);
  assert.equal(parsed.data, null);
  assert.equal(parsed.errors.length, 2);
});

test("DayEditDetailsPage JSX components are imported or locally declared", () => {
  const source = fs.readFileSync("src/pages/coach/DayEditDetailsPage.jsx", "utf8");
  const declared = new Set();

  const addNamedImports = (body) => {
    body.split(",").forEach((part) => {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) declared.add(name);
    });
  };

  const patterns = [
    /import\s+([A-Za-z_$][\w$]*)\s+from/g,
    /import\s+([A-Za-z_$][\w$]*)\s*,\s*\{/g,
    /import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from/g,
    /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /const\s+([A-Za-z_$][\w$]*)\s*=/g,
    /let\s+([A-Za-z_$][\w$]*)\s*=/g,
    /var\s+([A-Za-z_$][\w$]*)\s*=/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      declared.add(match[1]);
    }
  }

  let importMatch;
  const namedImportPattern = /import\s+\{([^}]+)\}\s+from/g;
  while ((importMatch = namedImportPattern.exec(source))) {
    addNamedImports(importMatch[1]);
  }

  const used = new Set();
  const jsxPattern = /<\s*([A-Z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)?)/g;
  let jsxMatch;
  while ((jsxMatch = jsxPattern.exec(source))) {
    if (source[jsxMatch.index - 1] === "<") continue; // ignores text such as "<< Anterior"
    const tag = jsxMatch[1];
    const base = tag.split(".")[0];
    used.add(base);
  }

  const missing = [...used].filter((name) => !declared.has(name)).sort();
  assert.deepEqual(missing, []);
});

function cloneSimpleExercise(ex) {
  const { exercise_id, ...rest } = ex || {};
  return { ...rest, exercise_id: newId() };
}

function cloneWarmupItem(item) {
  const { warmup_id, ...rest } = item || {};
  return { ...rest, warmup_id: newId() };
}

function cloneMovilityItem(item) {
  const { movility_id, ...rest } = item || {};
  return { ...rest, movility_id: newId() };
}

function cloneCircuit(ex) {
  const { exercise_id, circuit = [], ...rest } = ex || {};
  const newCircuit = Array.isArray(circuit)
    ? circuit.map((item) => ({ ...item, idRefresh: item?.idRefresh || newUUID() }))
    : [];
  return { ...rest, exercise_id: newId(), circuit: newCircuit };
}

function cloneBlock(block) {
  const { block_id, numberExercise, exercises = [], ...rest } = block || {};
  const clonedInner = exercises.map((inner) => cloneAnyExerciseOrStructure(inner));
  clonedInner.forEach((it, idx) => {
    if (it.numberExercise == null || it.numberExercise === "") {
      it.numberExercise = `${idx + 1}`;
    }
  });
  return {
    ...rest,
    type: "block",
    block_id: newId(),
    exercises: clonedInner,
  };
}

function cloneAnyExerciseOrStructure(el) {
  if (!el) return el;
  if (el.type === "block") return cloneBlock(el);
  if (Array.isArray(el.circuit)) return cloneCircuit(el);
  return cloneSimpleExercise(el);
}

function sanitizeDayForPaste(srcDay, nextIndexNumber) {
  const {
    _id: _omit,
    exercises = [],
    warmup = [],
    movility = [],
    movilityName,
  } = srcDay || {};

  const clonedExercises = exercises.map((el) => cloneAnyExerciseOrStructure(el));
  const clonedWarmup = Array.isArray(warmup) ? warmup.map(cloneWarmupItem) : [];
  const clonedMovility = Array.isArray(movility) ? movility.map(cloneMovilityItem) : [];

  clonedExercises.forEach((it, idx) => {
    if (it?.type === "block") {
      delete it.numberExercise;
    } else if (!it?.numberExercise) {
      it.numberExercise = `${idx + 1}`;
    }
  });

  return {
    _id: newId(),
    name: `Dia ${nextIndexNumber}`,
    lastEdited: new Date().toISOString(),
    exercises: clonedExercises,
    warmup: clonedWarmup,
    movility: clonedMovility,
    movilityName: movilityName || undefined,
  };
}

function circuitDefaults(kind) {
  switch (kind) {
    case "AMRAP":
      return { durationSec: 12 * 60 };
    case "EMOM":
      return { intervalMin: 1, totalRounds: 12, totalMinutes: 12 };
    case "E2MOM":
      return { intervalMin: 2, totalRounds: 8, totalMinutes: 16 };
    case "E3MOM":
      return { intervalMin: 3, totalRounds: 6, totalMinutes: 18 };
    case "Intermitentes":
      return { workSec: 30, restSec: 30, totalRounds: 10 };
    case "Por tiempo":
      return { timeCapSec: 20 * 60 };
    case "Tabata":
      return { workSec: 20, restSec: 10, totalRounds: 8 };
    default:
      return {};
  }
}

function makeEmptyDay(idx) {
  return {
    _id: newId(),
    name: `Dia ${idx + 1}`,
    lastEdited: new Date().toISOString(),
    exercises: [],
    warmup: [],
    movility: [],
  };
}

function createState(seedDays = 2) {
  const modifiedDay = Array.from({ length: seedDays }, (_, i) => makeEmptyDay(i));
  return {
    modifiedDay,
    indexDay: 0,
    currentDay: modifiedDay[0],
    clipboard: null,
  };
}

function selectDay(state, nextIndex) {
  if (!state.modifiedDay.length) return;
  const idx = Math.max(0, Math.min(nextIndex, state.modifiedDay.length - 1));
  state.indexDay = idx;
  state.currentDay = state.modifiedDay[idx] || null;
}

function addNewDay(state) {
  const d = makeEmptyDay(state.modifiedDay.length);
  state.modifiedDay.push(d);
  state.indexDay = state.modifiedDay.length - 1;
  state.currentDay = d;
}

function copyDay(state) {
  const src = state.modifiedDay?.[state.indexDay];
  if (!src) return null;
  state.clipboard = JSON.stringify(src);
  return state.clipboard;
}

function pasteDay(state) {
  if (!state.clipboard) return false;
  const src = JSON.parse(state.clipboard);
  const newDay = sanitizeDayForPaste(src, state.modifiedDay.length + 1);
  state.modifiedDay.push(newDay);
  state.indexDay = state.modifiedDay.length - 1;
  state.currentDay = newDay;
  return true;
}

function confirmDeleteDay(state) {
  const updatedDays = [...state.modifiedDay];
  if (updatedDays.length <= 1) return false;

  let idx = -1;
  if (state.currentDay?._id) {
    idx = updatedDays.findIndex((d) => String(d?._id) === String(state.currentDay._id));
  }
  if (idx === -1 && Number.isInteger(state.indexDay) && state.indexDay >= 0 && state.indexDay < updatedDays.length) {
    idx = state.indexDay;
  }
  if (idx === -1) return false;

  updatedDays.splice(idx, 1);
  const newIndex = Math.min(idx, updatedDays.length - 1);
  state.modifiedDay = updatedDays;
  state.indexDay = newIndex;
  state.currentDay = updatedDays[newIndex] || null;
  return true;
}

function addRootExercise(state) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  const nextNum = day.exercises.length + 1;
  day.exercises.push({
    exercise_id: newId(),
    type: "exercise",
    numberExercise: nextNum,
    name: "EX",
    reps: 1,
    sets: 1,
    peso: "",
    rest: "",
    video: "",
    notas: "",
  });
  day.lastEdited = new Date().toISOString();
  return true;
}

function addBlock(state) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  day.exercises.push({
    type: "block",
    block_id: newId(),
    name: "B",
    color: "#FF5733",
    exercises: [],
  });
  day.lastEdited = new Date().toISOString();
  return true;
}

function addExerciseToBlock(state, blockIndex) {
  const day = state.modifiedDay[state.indexDay];
  const block = day?.exercises?.[blockIndex];
  if (!block || block.type !== "block") return false;
  const nextNum = (block.exercises?.length || 0) + 1;
  block.exercises.push({
    exercise_id: newId(),
    type: "exercise",
    numberExercise: nextNum,
    name: "BEX",
    reps: 1,
    sets: 1,
    peso: "",
    rest: "",
    video: "",
    notas: "",
  });
  day.lastEdited = new Date().toISOString();
  return true;
}

function addCircuit(state, blockIndex = null, kind = "Libre") {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  const circuit = {
    exercise_id: newId(),
    numberExercise: 0,
    circuitKind: kind,
    type: "",
    typeOfSets: "",
    notas: "",
    circuit: [{ name: "", reps: 1, peso: "0", video: "", idRefresh: newUUID() }],
    ...circuitDefaults(kind),
  };

  if (blockIndex == null) {
    const nextNumber = day.exercises.length + 1;
    day.exercises.push({ ...circuit, numberExercise: nextNumber });
  } else {
    const block = day.exercises[blockIndex];
    if (!block || block.type !== "block") return false;
    const nextNumber = (block.exercises?.length || 0) + 1;
    block.exercises.push({ ...circuit, numberExercise: nextNumber });
  }
  day.lastEdited = new Date().toISOString();
  return true;
}

function addExerciseToCircuit(state, circuitIndex, blockIndex = null) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  const newExercise = { name: "", reps: 0, peso: "0", video: "", idRefresh: newUUID() };
  if (blockIndex == null) {
    const c = day.exercises[circuitIndex];
    if (!c || !Array.isArray(c.circuit)) return false;
    c.circuit.push(newExercise);
  } else {
    const block = day.exercises[blockIndex];
    const c = block?.exercises?.[circuitIndex];
    if (!c || !Array.isArray(c.circuit)) return false;
    c.circuit.push(newExercise);
  }
  day.lastEdited = new Date().toISOString();
  return true;
}

function removeRootExercise(state, exerciseId) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  const before = day.exercises.length;
  day.exercises = day.exercises.filter((e) => e.exercise_id !== exerciseId);
  day.lastEdited = new Date().toISOString();
  return day.exercises.length < before;
}

function removeExerciseFromBlock(state, blockIndex, exerciseId) {
  const day = state.modifiedDay[state.indexDay];
  const block = day?.exercises?.[blockIndex];
  if (!block || block.type !== "block") return false;
  const before = block.exercises.length;
  block.exercises = block.exercises.filter((e) => e.exercise_id !== exerciseId);
  day.lastEdited = new Date().toISOString();
  return block.exercises.length < before;
}

function removeCircuitItem(state, circuitIndex, exerciseIndex, blockIndex = null) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  let target = null;
  if (blockIndex == null) {
    target = day.exercises[circuitIndex];
  } else {
    target = day.exercises?.[blockIndex]?.exercises?.[circuitIndex];
  }
  if (!target || !Array.isArray(target.circuit) || exerciseIndex < 0 || exerciseIndex >= target.circuit.length) {
    return false;
  }
  target.circuit.splice(exerciseIndex, 1);
  day.lastEdited = new Date().toISOString();
  return true;
}

function removeCircuitHeader(state, circuitIndex, blockIndex = null) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  if (blockIndex == null) {
    if (circuitIndex < 0 || circuitIndex >= day.exercises.length) return false;
    day.exercises.splice(circuitIndex, 1);
  } else {
    const block = day.exercises?.[blockIndex];
    if (!block || block.type !== "block") return false;
    if (circuitIndex < 0 || circuitIndex >= block.exercises.length) return false;
    block.exercises.splice(circuitIndex, 1);
  }
  day.lastEdited = new Date().toISOString();
  return true;
}

function removeBlock(state, blockIndex) {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  if (!day.exercises[blockIndex] || day.exercises[blockIndex].type !== "block") return false;
  day.exercises.splice(blockIndex, 1);
  day.lastEdited = new Date().toISOString();
  return true;
}

function renameBlock(state, blockIndex, name) {
  const day = state.modifiedDay[state.indexDay];
  const block = day?.exercises?.[blockIndex];
  if (!block || block.type !== "block") return false;
  block.name = name;
  day.lastEdited = new Date().toISOString();
  return true;
}

function addWarmupToCurrentDay(state, name = "Warmup") {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  if (!Array.isArray(day.warmup)) day.warmup = [];
  day.warmup.push({ warmup_id: newId(), name, sets: "", reps: "", video: "", peso: "", notas: "" });
  day.lastEdited = new Date().toISOString();
  return true;
}

function addMovilityToCurrentDay(state, name = "Movility") {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  if (!Array.isArray(day.movility)) day.movility = [];
  day.movility.push({ movility_id: newId(), name, sets: "", reps: "", video: "", peso: "", notas: "" });
  day.lastEdited = new Date().toISOString();
  return true;
}

function editRootExerciseName(state, index, name) {
  const day = state.modifiedDay[state.indexDay];
  const ex = day?.exercises?.[index];
  if (!day || !ex || ex.type !== "exercise") return false;
  ex.name = name;
  day.lastEdited = new Date().toISOString();
  return true;
}

function addSupersetExerciseRoot(state, baseNumber, suffix, name = "SUP") {
  const day = state.modifiedDay[state.indexDay];
  if (!day) return false;
  day.exercises.push({
    exercise_id: newId(),
    type: "exercise",
    numberExercise: baseNumber,
    supSuffix: suffix,
    name,
    sets: 3,
    reps: 10,
    peso: "RIR 2",
    rest: "00:00",
    notas: "",
    changed: false,
  });
  day.lastEdited = new Date().toISOString();
  return true;
}

function addSupersetExerciseInBlock(state, blockIndex, baseNumber, suffix, name = "BSUP") {
  const day = state.modifiedDay[state.indexDay];
  const block = day?.exercises?.[blockIndex];
  if (!block || block.type !== "block") return false;
  block.exercises.push({
    exercise_id: newId(),
    type: "exercise",
    numberExercise: baseNumber,
    supSuffix: suffix,
    name,
    sets: 3,
    reps: 10,
    peso: "RIR 2",
    rest: "00:00",
    notas: "",
    changed: false,
  });
  day.lastEdited = new Date().toISOString();
  return true;
}

function collectExerciseIds(node, set, scopeLabel = "day") {
  if (!node || typeof node !== "object") return;
  if (node.type === "exercise") {
    const id = String(node.exercise_id);
    assert.ok(id && id !== "undefined", `exercise_id must exist in ${scopeLabel}`);
    assert.equal(set.has(id), false, `duplicate exercise_id in ${scopeLabel}: ${id}`);
    set.add(id);
    return;
  }
  if (node.type === "block") {
    for (const inner of node.exercises || []) collectExerciseIds(inner, set, "block");
    return;
  }
  if (Array.isArray(node.circuit) && node.exercise_id) {
    const id = String(node.exercise_id);
    assert.equal(set.has(id), false, `duplicate circuit exercise_id in ${scopeLabel}: ${id}`);
    set.add(id);
  }
}

function validateState(state) {
  assert.ok(Array.isArray(state.modifiedDay), "modifiedDay must be array");
  assert.ok(state.modifiedDay.length >= 1, "at least one day must exist");
  assert.ok(state.indexDay >= 0 && state.indexDay < state.modifiedDay.length, "indexDay must be valid");

  for (const day of state.modifiedDay) {
    assert.equal(typeof day._id, "string", "day._id must be string");
    assert.ok(Array.isArray(day.exercises), "day.exercises must be array");
    assert.ok(Array.isArray(day.warmup || []), "day.warmup must be array if present");
    assert.ok(Array.isArray(day.movility || []), "day.movility must be array if present");

    for (const w of day.warmup || []) {
      assert.equal(typeof w.warmup_id, "string", "warmup_id must be string");
    }
    for (const m of day.movility || []) {
      assert.equal(typeof m.movility_id, "string", "movility_id must be string");
    }

    const dayIds = new Set();
    for (const ex of day.exercises) {
      if (ex?.type === "exercise") {
        assert.equal(typeof ex.exercise_id, "string", "exercise.exercise_id must be string");
      }
      if (ex?.type === "block") {
        assert.equal(typeof ex.block_id, "string", "block_id must be string");
        assert.ok(Array.isArray(ex.exercises), "block.exercises must be array");
        for (const inner of ex.exercises) {
          if (inner?.type === "exercise") {
            assert.equal(typeof inner.exercise_id, "string", "inner exercise_id must be string");
          }
          if (Array.isArray(inner?.circuit)) {
            assert.equal(typeof inner.exercise_id, "string", "inner circuit header must have exercise_id");
            for (const item of inner.circuit) {
              assert.equal(typeof item.idRefresh, "string", "inner circuit item idRefresh must be string");
            }
          }
        }
      }
      if (Array.isArray(ex?.circuit)) {
        assert.equal(typeof ex.exercise_id, "string", "root circuit header must have exercise_id");
        for (const item of ex.circuit) {
          assert.equal(typeof item.idRefresh, "string", "root circuit item idRefresh must be string");
        }
      }
      collectExerciseIds(ex, dayIds, "root");
    }
  }
}

function pickRandom(list, rnd) {
  if (!list.length) return null;
  return list[Math.floor(rnd() * list.length)];
}

function seedRandom(seed) {
  let s = seed >>> 0;
  return function rand() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000;
  };
}

function ensureFixtureDayWithCircuitAndWarmups() {
  return {
    _id: newId(),
    name: "Dia 4",
    lastEdited: new Date().toISOString(),
    warmup: [{ warmup_id: newId(), name: "Bike", reps: "", sets: "" }],
    movility: [{ movility_id: newId(), name: "Band pull", reps: "", sets: "" }],
    exercises: [
      { exercise_id: newId(), type: "exercise", numberExercise: 1, name: "Dominadas", sets: 5, reps: 5 },
      { exercise_id: newId(), type: "exercise", numberExercise: 2, name: "Facepulls", sets: 3, reps: 12 },
      {
        name: "",
        typeOfSets: "40 x 20 x 15",
        notas: "3 rondas",
        circuit: [
          { name: "Trineo", reps: "", peso: "BW", video: "", idRefresh: newUUID() },
          { name: "Soga", reps: "", peso: "0", video: "", idRefresh: newUUID() },
        ],
        numberExercise: 3,
        exercise_id: newId(),
        type: "INTERMITENTE",
      },
    ],
  };
}

function countByType(day) {
  const out = { exercise: 0, block: 0, rootCircuit: 0 };
  for (const ex of day?.exercises || []) {
    if (ex?.type === "block") out.block += 1;
    else if (Array.isArray(ex?.circuit)) out.rootCircuit += 1;
    else if (ex?.type === "exercise") out.exercise += 1;
  }
  return out;
}

function assertOnlyRootExercises(day) {
  for (const ex of day?.exercises || []) {
    assert.equal(ex?.type, "exercise", "day must contain only root exercises");
    assert.equal(Array.isArray(ex?.circuit), false, "root exercise cannot have circuit array");
  }
}

function assertOnlyRootCircuits(day) {
  for (const ex of day?.exercises || []) {
    assert.equal(Array.isArray(ex?.circuit), true, "day must contain only root circuits");
  }
}

function assertOnlySupersets(day) {
  for (const ex of day?.exercises || []) {
    assert.equal(ex?.type, "exercise", "superset mode still stores exercises");
    assert.ok(typeof ex?.supSuffix === "string" && ex.supSuffix.length > 0, "superset exercise must have supSuffix");
  }
}

test("copy/paste keeps circuit shape and clones warmup/movility IDs", () => {
  const state = createState(1);
  state.modifiedDay[0] = ensureFixtureDayWithCircuitAndWarmups();
  state.currentDay = state.modifiedDay[0];
  state.indexDay = 0;
  validateState(state);

  copyDay(state);
  const ok = pasteDay(state);
  assert.equal(ok, true);
  validateState(state);

  const pasted = state.modifiedDay[state.modifiedDay.length - 1];
  const rootCircuit = pasted.exercises.find((e) => Array.isArray(e?.circuit));
  assert.ok(rootCircuit, "pasted day must keep circuit header");
  assert.ok(Array.isArray(rootCircuit.circuit), "pasted day must keep circuit array");
  assert.equal(rootCircuit.circuit.length, 2, "pasted circuit item count must be preserved");

  assert.equal(pasted.warmup.length, 1, "warmup should be copied");
  assert.equal(pasted.movility.length, 1, "movility should be copied");
  assert.notEqual(
    pasted.warmup[0].warmup_id,
    state.modifiedDay[0].warmup[0].warmup_id,
    "warmup_id must be remapped"
  );
  assert.notEqual(
    pasted.movility[0].movility_id,
    state.modifiedDay[0].movility[0].movility_id,
    "movility_id must be remapped"
  );
});

test("delete day never removes last remaining day", () => {
  const state = createState(1);
  validateState(state);
  const result = confirmDeleteDay(state);
  assert.equal(result, false);
  assert.equal(state.modifiedDay.length, 1);
  validateState(state);
});

test("routine with only root exercises supports delete/recreate/copy-paste cycle", () => {
  const state = createState(2);
  selectDay(state, 0);

  addWarmupToCurrentDay(state, "Bike");
  addMovilityToCurrentDay(state, "Band pull apart");

  for (let i = 0; i < 10; i++) addRootExercise(state);
  for (let i = 0; i < 10; i++) editRootExerciseName(state, i, `EX-${i + 1}`);
  validateState(state);
  assertOnlyRootExercises(state.modifiedDay[0]);

  // Delete one day, recreate another one, and keep editing.
  selectDay(state, 1);
  const deleted = confirmDeleteDay(state);
  assert.equal(deleted, true);
  validateState(state);
  addNewDay(state);
  selectDay(state, state.modifiedDay.length - 1);
  for (let i = 0; i < 3; i++) addRootExercise(state);
  validateState(state);

  // Copy/paste from the pure-exercise day.
  selectDay(state, 0);
  copyDay(state);
  pasteDay(state);
  const pasted = state.modifiedDay[state.modifiedDay.length - 1];
  assertOnlyRootExercises(pasted);
  assert.equal((pasted.warmup || []).length, 1);
  assert.equal((pasted.movility || []).length, 1);
  validateState(state);
});

test("routine with only circuits covers all circuit kinds and copy-paste", () => {
  const state = createState(1);
  selectDay(state, 0);

  const allKinds = ["Libre", "AMRAP", "EMOM", "E2MOM", "E3MOM", "Intermitentes", "Por tiempo", "Tabata"];
  for (const kind of allKinds) {
    addCircuit(state, null, kind);
  }

  // Add inner items in each circuit to emulate real editing.
  for (let i = 0; i < state.modifiedDay[0].exercises.length; i++) {
    addExerciseToCircuit(state, i, null);
    addExerciseToCircuit(state, i, null);
  }

  assertOnlyRootCircuits(state.modifiedDay[0]);
  validateState(state);

  copyDay(state);
  pasteDay(state);
  const pasted = state.modifiedDay[state.modifiedDay.length - 1];
  assertOnlyRootCircuits(pasted);
  validateState(state);
});

test("routine with only supersets works at root and inside block; block rename and inverse mix", () => {
  const state = createState(1);
  selectDay(state, 0);

  // Root-only supersets: 1A 1B 2A 2B.
  addSupersetExerciseRoot(state, 1, "A", "PUSH");
  addSupersetExerciseRoot(state, 1, "B", "PULL");
  addSupersetExerciseRoot(state, 2, "A", "SQUAT");
  addSupersetExerciseRoot(state, 2, "B", "HINGE");
  assertOnlySupersets(state.modifiedDay[0]);

  // Block supersets + block renaming.
  addBlock(state);
  const blockIndex = state.modifiedDay[0].exercises.findIndex((e) => e?.type === "block");
  assert.ok(blockIndex >= 0);
  renameBlock(state, blockIndex, "TORSO A");
  renameBlock(state, blockIndex, "TORSO B");
  addSupersetExerciseInBlock(state, blockIndex, 1, "A", "ROW");
  addSupersetExerciseInBlock(state, blockIndex, 1, "B", "PRESS");
  addSupersetExerciseInBlock(state, blockIndex, 2, "A", "CURL");
  addSupersetExerciseInBlock(state, blockIndex, 2, "B", "EXT");

  // Inverse transition: from supersets-only to mixed mode with circuits and normal exercises.
  addCircuit(state, null, "EMOM");
  addCircuit(state, blockIndex, "Intermitentes");
  addRootExercise(state);
  addExerciseToBlock(state, blockIndex);
  addWarmupToCurrentDay(state, "Rower");
  addMovilityToCurrentDay(state, "Hip opener");
  validateState(state);

  const counts = countByType(state.modifiedDay[0]);
  assert.ok(counts.exercise >= 5, "must keep root exercises/supersets");
  assert.ok(counts.block >= 1, "must keep at least one block");
  assert.ok(counts.rootCircuit >= 1, "must keep at least one root circuit");

  // Copy/paste + delete + rewrite over another day.
  copyDay(state);
  pasteDay(state);
  validateState(state);
  const lenBeforeDelete = state.modifiedDay.length;
  const removed = confirmDeleteDay(state);
  assert.equal(removed, true);
  assert.equal(state.modifiedDay.length, lenBeforeDelete - 1);
  selectDay(state, 0);
  editRootExerciseName(state, 0, "PUSH UPDATED");
  validateState(state);
});

test("mixed workflow requested: mobility + activation + blocks + circuits + delete + copy/paste across days", () => {
  const state = createState(3);

  // Day 1: movement prep + exercises + block + circuit.
  selectDay(state, 0);
  addMovilityToCurrentDay(state, "Shoulder prep");
  addMovilityToCurrentDay(state, "Hip prep");
  addWarmupToCurrentDay(state, "Bike 8'");
  addRootExercise(state);
  addRootExercise(state);
  editRootExerciseName(state, 0, "Bench");
  editRootExerciseName(state, 1, "Row");
  addBlock(state);
  const b0 = state.modifiedDay[0].exercises.findIndex((e) => e?.type === "block");
  renameBlock(state, b0, "FUERZA");
  addExerciseToBlock(state, b0);
  addCircuit(state, b0, "AMRAP");
  addCircuit(state, null, "Tabata");
  validateState(state);

  // Day 2: start simple, then overwrite via copy/paste from Day 1.
  selectDay(state, 1);
  addRootExercise(state);
  editRootExerciseName(state, 0, "Deadlift");
  copyDay(state); // copy Day 2 first
  selectDay(state, 0);
  copyDay(state); // overwrite clipboard with rich Day 1
  selectDay(state, 1);
  pasteDay(state); // creates Day 4 as cloned Day 1
  validateState(state);

  // Delete original Day 2 and continue creating mixed content.
  selectDay(state, 1);
  confirmDeleteDay(state);
  validateState(state);
  selectDay(state, state.modifiedDay.length - 1);
  addRootExercise(state);
  addCircuit(state, null, "Por tiempo");
  addWarmupToCurrentDay(state, "Jump rope");
  addMovilityToCurrentDay(state, "Ankle mobility");
  validateState(state);
});

test("randomized operation combinations preserve planner invariants", () => {
  const seeds = Array.from({ length: 40 }, (_, i) => (i + 1) * 111);
  const blockNames = [
    "Bloque de fuerza",
    "Bloque de hipertrofia",
    "Bloque de volumen",
    "Bloque de recuperacion",
    "Bloque de pliometria",
  ];

  for (const seed of seeds) {
    const rnd = seedRandom(seed);
    const state = createState(2 + Math.floor(rnd() * 3));
    validateState(state);

    for (let step = 0; step < 350; step++) {
      // random day selection first
      if (rnd() < 0.35) {
        selectDay(state, Math.floor(rnd() * state.modifiedDay.length));
      }

      const day = state.modifiedDay[state.indexDay];
      const roots = day?.exercises || [];
      const blocks = roots
        .map((e, i) => ({ e, i }))
        .filter((x) => x.e?.type === "block");
      const rootCircuits = roots
        .map((e, i) => ({ e, i }))
        .filter((x) => Array.isArray(x.e?.circuit));
      const rootExercises = roots
        .map((e, i) => ({ e, i }))
        .filter((x) => x.e?.type === "exercise");

      const op = Math.floor(rnd() * 27);
      switch (op) {
        case 0:
          addNewDay(state);
          break;
        case 1:
          copyDay(state);
          break;
        case 2:
          pasteDay(state);
          break;
        case 3:
          confirmDeleteDay(state);
          break;
        case 4:
          addRootExercise(state);
          break;
        case 5:
          addBlock(state);
          break;
        case 6: {
          const b = pickRandom(blocks, rnd);
          if (b) addExerciseToBlock(state, b.i);
          break;
        }
        case 7: {
          const kinds = ["Libre", "AMRAP", "EMOM", "E2MOM", "E3MOM", "Intermitentes", "Por tiempo", "Tabata"];
          addCircuit(state, null, pickRandom(kinds, rnd));
          break;
        }
        case 8: {
          const b = pickRandom(blocks, rnd);
          const kinds = ["Libre", "AMRAP", "EMOM", "Intermitentes", "Tabata"];
          if (b) addCircuit(state, b.i, pickRandom(kinds, rnd));
          break;
        }
        case 9: {
          const c = pickRandom(rootCircuits, rnd);
          if (c) addExerciseToCircuit(state, c.i, null);
          break;
        }
        case 10: {
          const b = pickRandom(blocks, rnd);
          if (b) {
            const bc = (b.e.exercises || [])
              .map((e, i) => ({ e, i }))
              .filter((x) => Array.isArray(x.e?.circuit));
            const c = pickRandom(bc, rnd);
            if (c) addExerciseToCircuit(state, c.i, b.i);
          }
          break;
        }
        case 11: {
          const ex = pickRandom(rootExercises, rnd);
          if (ex) removeRootExercise(state, ex.e.exercise_id);
          break;
        }
        case 12: {
          const b = pickRandom(blocks, rnd);
          if (b) {
            const innerExercises = (b.e.exercises || []).filter((e) => e?.type === "exercise");
            const ex = pickRandom(innerExercises, rnd);
            if (ex) removeExerciseFromBlock(state, b.i, ex.exercise_id);
          }
          break;
        }
        case 13: {
          const c = pickRandom(rootCircuits, rnd);
          if (c && c.e.circuit.length) {
            const idx = Math.floor(rnd() * c.e.circuit.length);
            removeCircuitItem(state, c.i, idx, null);
          }
          break;
        }
        case 14: {
          const b = pickRandom(blocks, rnd);
          if (b) {
            const bc = (b.e.exercises || [])
              .map((e, i) => ({ e, i }))
              .filter((x) => Array.isArray(x.e?.circuit));
            const c = pickRandom(bc, rnd);
            if (c && c.e.circuit.length) {
              const idx = Math.floor(rnd() * c.e.circuit.length);
              removeCircuitItem(state, c.i, idx, b.i);
            }
          }
          break;
        }
        case 15: {
          const c = pickRandom(rootCircuits, rnd);
          if (c) removeCircuitHeader(state, c.i, null);
          break;
        }
        case 16: {
          const b = pickRandom(blocks, rnd);
          if (b) {
            const bc = (b.e.exercises || [])
              .map((e, i) => ({ e, i }))
              .filter((x) => Array.isArray(x.e?.circuit));
            const c = pickRandom(bc, rnd);
            if (c) removeCircuitHeader(state, c.i, b.i);
          }
          break;
        }
        case 17: {
          const b = pickRandom(blocks, rnd);
          if (b) removeBlock(state, b.i);
          break;
        }
        case 18: {
          const b = pickRandom(blocks, rnd);
          if (b) renameBlock(state, b.i, pickRandom(blockNames, rnd));
          break;
        }
        case 19:
          addWarmupToCurrentDay(state, `Warmup-${Math.floor(rnd() * 100)}`);
          break;
        case 20:
          addMovilityToCurrentDay(state, `Movility-${Math.floor(rnd() * 100)}`);
          break;
        case 21: {
          const ex = pickRandom(rootExercises, rnd);
          if (ex) editRootExerciseName(state, ex.i, `EX-${seed}-${step}-${ex.i}`);
          break;
        }
        case 22: {
          // Root superset mutation
          const base = 1 + Math.floor(rnd() * 4);
          const suffix = rnd() < 0.5 ? "A" : "B";
          addSupersetExerciseRoot(state, base, suffix, `SUP-${base}${suffix}`);
          break;
        }
        case 23: {
          // Block superset mutation
          const b = pickRandom(blocks, rnd);
          if (b) {
            const base = 1 + Math.floor(rnd() * 4);
            const suffix = rnd() < 0.5 ? "A" : "B";
            addSupersetExerciseInBlock(state, b.i, base, suffix, `BSUP-${base}${suffix}`);
          }
          break;
        }
        case 24: {
          // Add both simple + circuit in same step to force mixed structures.
          addRootExercise(state);
          const kinds = ["Libre", "AMRAP", "EMOM", "E2MOM", "E3MOM", "Intermitentes", "Por tiempo", "Tabata"];
          addCircuit(state, null, pickRandom(kinds, rnd));
          break;
        }
        case 25: {
          // Force copy/paste around current mixed state.
          copyDay(state);
          pasteDay(state);
          break;
        }
        case 26: {
          // Delete and immediately recreate pressure.
          confirmDeleteDay(state);
          addNewDay(state);
          break;
        }
        default:
          break;
      }

      validateState(state);
    }
  }
});
