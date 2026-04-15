import { test, expect } from "@playwright/test";

const coachId = "67f84082c3514ac86837bddf";
const weekId = "6991c35bb65af844b98823ce";
const dayId = "6991c35bb65af844b98823cf";
const username = "e2e-user";

function createIdFactory() {
  let n = 1;
  return () => (n++).toString(16).padStart(24, "0");
}

function buildWeekFixture() {
  const nextId = createIdFactory();

  const day1Exercises = [
    {
      exercise_id: nextId(),
      type: "exercise",
      numberExercise: 1,
      name: "Bench Press",
      reps: 5,
      sets: 5,
      peso: "75%",
      rest: "03:00",
      notas: "",
    },
    {
      exercise_id: nextId(),
      type: "exercise",
      numberExercise: 2,
      name: "Row",
      reps: 8,
      sets: 4,
      peso: "RIR 2",
      rest: "02:00",
      notas: "",
    },
  ];

  const day2Circuits = [
    {
      exercise_id: nextId(),
      numberExercise: 1,
      circuitKind: "Tabata",
      type: "INTERMITENTE",
      notas: "",
      circuit: [
        { name: "Rope", reps: "", peso: "0", video: "", idRefresh: "circuit-a-1" },
        { name: "Sit-up", reps: "", peso: "0", video: "", idRefresh: "circuit-a-2" },
      ],
    },
    {
      exercise_id: nextId(),
      numberExercise: 2,
      circuitKind: "EMOM",
      type: "EMOM",
      notas: "",
      circuit: [
        { name: "Bike", reps: "", peso: "BW", video: "", idRefresh: "circuit-b-1" },
        { name: "Burpee", reps: "", peso: "BW", video: "", idRefresh: "circuit-b-2" },
      ],
    },
  ];

  const day3Supersets = [
    {
      exercise_id: nextId(),
      type: "exercise",
      numberExercise: 1,
      supSuffix: "A",
      name: "SQ",
      reps: 6,
      sets: 3,
      peso: "70%",
      rest: "00:00",
      notas: "",
      changed: false,
    },
    {
      exercise_id: nextId(),
      type: "exercise",
      numberExercise: 1,
      supSuffix: "B",
      name: "BP",
      reps: 6,
      sets: 3,
      peso: "70%",
      rest: "00:00",
      notas: "",
      changed: false,
    },
    {
      exercise_id: nextId(),
      type: "exercise",
      numberExercise: 2,
      supSuffix: "A",
      name: "DL",
      reps: 5,
      sets: 3,
      peso: "75%",
      rest: "00:00",
      notas: "",
      changed: false,
    },
    {
      exercise_id: nextId(),
      type: "exercise",
      numberExercise: 2,
      supSuffix: "B",
      name: "OHP",
      reps: 8,
      sets: 3,
      peso: "RIR 2",
      rest: "00:00",
      notas: "",
      changed: false,
    },
  ];

  return {
    _id: weekId,
    name: "Semana E2E",
    routine: [
      {
        _id: dayId,
        name: "Dia 1",
        lastEdited: "2026-03-01T13:12:31.949Z",
        exercises: day1Exercises,
        warmup: [],
        movility: [],
      },
      {
        _id: nextId(),
        name: "Dia 2",
        lastEdited: "2026-03-01T13:12:48.311Z",
        exercises: day2Circuits,
        warmup: [],
        movility: [],
      },
      {
        _id: nextId(),
        name: "Dia 3",
        lastEdited: "2026-03-01T13:13:23.854Z",
        exercises: day3Supersets,
        warmup: [],
        movility: [],
      },
    ],
    category: "Powerlifting",
    user_id: coachId,
    created_at: "2026-02-15T13:00:11.235Z",
    timestamp: 1771160411235,
    block: null,
    updated_at: "2026-03-01T13:15:15.127Z",
    parent_par_id: "697f4b0e1dc6877c3a5720b1",
  };
}

function collectExerciseIdsFromDay(day) {
  const ids = [];

  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "exercise" && node.exercise_id) {
      ids.push(String(node.exercise_id));
      return;
    }
    if (node.type === "block") {
      for (const inner of node.exercises || []) walk(inner);
      return;
    }
    if (Array.isArray(node.circuit) && node.exercise_id) {
      ids.push(String(node.exercise_id));
      return;
    }
  };

  for (const ex of day?.exercises || []) walk(ex);
  return ids;
}

async function bootstrapAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem("token", "e2e-token");
    localStorage.setItem("role", "admin");
    localStorage.setItem("_id", "coach-e2e");
    localStorage.setItem("name", "coach-e2e");
    localStorage.setItem("DATABASE_USER", "[]");
    localStorage.setItem("color", "#111111");
  });
}

async function mockApi(page, weekDoc, savedPayloads) {
  const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,PATCH,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "Content-Type, auth-token",
  };

  await page.route("http://localhost:2022/api/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }

    if (url === `http://localhost:2022/api/week/${weekId}` && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify([weekDoc]),
      });
    }

    if (url === `http://localhost:2022/api/week/${weekId}` && method === "PATCH") {
      const body = request.postDataJSON();
      savedPayloads.push(body);
      weekDoc.routine = Array.isArray(body) ? body : weekDoc.routine;
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      });
    }

    if (url.includes("/api/announcements/")) {
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify([]),
      });
    }

    return route.fulfill({
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
      body: JSON.stringify({ ok: true }),
    });
  });
}

async function goToPlanner(page) {
  await page.goto(`/routine/user/${coachId}/week/${weekId}/day/${dayId}/${username}`);
  await expect(page.getByText(/Semana E2E/i)).toBeVisible();
  await expect(page.locator("#dias")).toBeVisible();
}

test("complex planner workflow keeps payload valid after mixed operations", async ({ page }) => {
  const weekDoc = buildWeekFixture();
  const savedPayloads = [];
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, savedPayloads);
  await goToPlanner(page);

  await page.locator("#dias").getByText(/Dia 2/i).first().click();
  await page.locator("#addCircuit").click();

  await page.locator("#dias").getByText(/Dia 1/i).first().click();
  await page.locator("#addEjercicio").click();
  await page.getByText(/Agregar bloque de entrenamiento/i).first().click();
  await page.getByRole("button", { name: /A(?:ñ|n)adir ejercicio al bloque/i }).first().click();
  await page.getByRole("button", { name: /A(?:ñ|n)adir circuito al bloque/i }).first().click();

  await page.locator("#dias").getByText(/Dia 3/i).first().click();
  await page.locator("#copiarDia").click();
  await page.locator("#eliminarDia").click();
  const deleteDialog = page.locator(".p-confirm-dialog:visible");
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: /S[iÃ­]/i }).click();
  await page.locator("#pegarDia").click();

  await page.locator("#movility").click();
  const movilityDialog = page.locator(".p-dialog:has-text('movilidad'):visible");
  await expect(movilityDialog).toBeVisible();
  await movilityDialog.locator("button.bgColor").first().click();
  await movilityDialog.getByRole("button", { name: /Continuar editando/i }).click();

  await page.locator("#warmup").click();
  const warmupDialog = page.locator(".p-dialog:has-text('entrada en calor'):visible");
  await expect(warmupDialog).toBeVisible();
  await warmupDialog.locator("button.bgColor").first().click();
  await warmupDialog.getByRole("button", { name: /Continuar editando/i }).click();

  await expect(page.getByText(/cambios sin guardar/i)).toBeVisible();
  await page.getByRole("button", { name: /^Guardar$/i }).first().click();

  await expect.poll(() => savedPayloads.length).toBeGreaterThan(0);
  const payload = savedPayloads.at(-1);

  expect(Array.isArray(payload)).toBeTruthy();
  expect(payload.length).toBeGreaterThanOrEqual(3);

  const allBlocks = payload.flatMap((d) => (d.exercises || []).filter((e) => e?.type === "block"));
  const hasBlock = allBlocks.length > 0;
  const hasRootCircuit = payload.some((d) => (d.exercises || []).some((e) => Array.isArray(e?.circuit)));
  const hasSupersets = payload.some((d) =>
    (d.exercises || []).some((e) => e?.type === "exercise" && typeof e?.supSuffix === "string")
  );
  const hasWarmup = payload.some((d) => Array.isArray(d?.warmup) && d.warmup.length > 0);
  const hasMovility = payload.some((d) => Array.isArray(d?.movility) && d.movility.length > 0);
  const hasExerciseInsideBlock = allBlocks.some((block) => (block.exercises || []).some((e) => e?.type === "exercise"));
  const hasCircuitInsideBlock = allBlocks.some((block) => (block.exercises || []).some((e) => Array.isArray(e?.circuit)));

  expect(hasBlock).toBeTruthy();
  expect(hasRootCircuit).toBeTruthy();
  expect(hasSupersets).toBeTruthy();
  expect(hasWarmup).toBeTruthy();
  expect(hasMovility).toBeTruthy();
  expect(hasExerciseInsideBlock).toBeTruthy();
  expect(hasCircuitInsideBlock).toBeTruthy();

  for (const day of payload) {
    const ids = collectExerciseIdsFromDay(day);
    expect(new Set(ids).size).toBe(ids.length);
  }

  expect(pageErrors).toEqual([]);
});

test("switching between day archetypes remains stable and save still works", async ({ page }) => {
  const weekDoc = buildWeekFixture();
  const savedPayloads = [];
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, savedPayloads);
  await goToPlanner(page);

  for (let i = 0; i < 3; i++) {
    await page.locator("#dias").getByText(/Dia 1/i).first().click();
    await expect(page.locator("table")).toBeVisible();
    await page.locator("#dias").getByText(/Dia 2/i).first().click();
    await page.locator("#dias").getByText(/Dia 3/i).first().click();
  }

  await page.locator("#dias").getByText(/Dia 1/i).first().click();
  await page.locator("#addEjercicio").click();
  await page.locator("#dias").getByText(/Dia 2/i).first().click();
  await page.locator("#addCircuit").click();
  await page.locator("#dias").getByText(/Dia 3/i).first().click();
  await page.locator("#copiarDia").click();
  await page.locator("#pegarDia").click();

  await page.getByRole("button", { name: /^Guardar$/i }).first().click();
  await expect.poll(() => savedPayloads.length).toBeGreaterThan(0);
  const payload = savedPayloads.at(-1);

  expect(Array.isArray(payload)).toBeTruthy();
  expect(payload.length).toBeGreaterThanOrEqual(4);
  for (const day of payload) {
    expect(typeof day?._id).toBe("string");
  }
  expect(pageErrors).toEqual([]);
});
test("day actions and normal circuit delete confirmation keep state coherent", async ({ page }) => {
  const weekDoc = buildWeekFixture();
  const savedPayloads = [];
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, savedPayloads);
  await goToPlanner(page);

  await page.locator("#agregarDia").click();
  await expect(page.locator("#dias")).toContainText(/Dia 4/i);

  await page.locator("#editarDia").click();
  const renameDialog = page.locator(".p-dialog:has-text('Editar nombre del dia'):visible");
  await expect(renameDialog).toBeVisible();
  await renameDialog.locator("#dayName").fill("Dia 4 Editado");
  await renameDialog.getByRole("button", { name: /Confirmar/i }).click();
  await expect(page.locator("#dias")).toContainText(/Dia 4 Editado/i);

  await page.locator("#copiarDia").click();
  await page.locator("#pegarDia").click();
  await expect(page.locator("#dias")).toContainText(/Dia 5/i);

  await page.locator("#eliminarDia").click();
  const deleteDayDialog = page.locator(".p-confirm-dialog:visible");
  await expect(deleteDayDialog).toBeVisible();
  await deleteDayDialog.getByRole("button", { name: /^Si$/i }).click();
  await expect(page.locator("#dias")).not.toContainText(/Dia 5/i);

  await page.locator("#reordenarDias").click();
  const reorderDialog = page.locator(".p-dialog:has-text('Reordenar dias'):visible");
  await expect(reorderDialog).toBeVisible();
  await reorderDialog.getByRole("button", { name: /Aplicar/i }).click();

  await page.getByText(/Ver semanas anteriores/i).first().click();
  const previousWeeksDialog = page.locator(".p-dialog:has-text('Semanas anteriores'):visible");
  await expect(previousWeeksDialog).toBeVisible();
  await previousWeeksDialog.getByRole("button", { name: /Close/i }).click();

  await page.locator("#dias").getByText(/Dia 2/i).first().click();
  const rootCircuitRows = page.locator(".dayEditCircuitNestedTable thead tr").filter({ hasText: /Tipo de circuito/i });
  const rootCircuitCountBefore = await rootCircuitRows.count();
  const rootCircuitDelete = rootCircuitRows.locator("[aria-label='delete']").first();
  await rootCircuitDelete.click();
  const deleteCircuitDialog = page.locator(".p-confirm-dialog:has-text('Eliminar circuito'):visible");
  await expect(deleteCircuitDialog).toBeVisible();
  await deleteCircuitDialog.getByRole("button", { name: /^No$/i }).click();
  await expect(rootCircuitRows).toHaveCount(rootCircuitCountBefore);

  await rootCircuitDelete.click();
  await deleteCircuitDialog.getByRole("button", { name: /^Si$/i }).click();
  await expect(rootCircuitRows).toHaveCount(rootCircuitCountBefore - 1);

  await page.getByRole("button", { name: /^Guardar$/i }).first().click();
  await expect.poll(() => savedPayloads.length).toBeGreaterThan(0);

  const payload = savedPayloads.at(-1);
  expect(Array.isArray(payload)).toBeTruthy();
  expect(payload.length).toBeGreaterThanOrEqual(4);
  expect(payload[1].exercises.filter((ex) => Array.isArray(ex?.circuit)).length).toBe(1);
  expect(pageErrors).toEqual([]);
});





