import { test, expect } from "@playwright/test";

const coachId = "67f84082c3514ac86837bddf";
const weekId = "6991c35bb65af844b98823ce";
const dayId = "6991c35bb65af844b98823cf";
const username = "e2e-user";

function createTestJwt() {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp: Math.floor(Date.now() / 1000) + 86400 })}.e2e`;
}

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
    const encode = (value) => btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    const token = `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp: Math.floor(Date.now() / 1000) + 86400 })}.e2e`;
    localStorage.clear();
    localStorage.setItem("token", token);
    localStorage.setItem("role", "admin");
    localStorage.setItem("_id", "coach-e2e");
    localStorage.setItem("name", "coach-e2e");
    localStorage.setItem("email", "coach-e2e@test.local");
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

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }

    if (pathname === "/api/auth/refresh" && method === "POST") {
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify({
          token: createTestJwt(),
          user: {
            _id: "coach-e2e",
            role: "admin",
            name: "coach-e2e",
            email: "coach-e2e@test.local",
            color: "#111111",
          },
        }),
      });
    }

    if (pathname === `/api/week/${weekId}` && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify([weekDoc]),
      });
    }

    if (pathname === `/api/week/${weekId}` && method === "PATCH") {
      const body = request.postDataJSON();
      savedPayloads.push(body);
      weekDoc.routine = Array.isArray(body) ? body : weekDoc.routine;
      return route.fulfill({
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      });
    }

    if (pathname.includes("/api/announcements/")) {
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

async function addAuxiliaryExercise(dialog) {
  await dialog.getByRole("button", { name: /anadir-ejercicio|adir ejercicio/i }).first().click();
}

test("complex planner workflow keeps payload valid after mixed operations", async ({ page }) => {
  const weekDoc = buildWeekFixture();
  const savedPayloads = [];
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, savedPayloads);
  await goToPlanner(page);

  await page.locator("#dias").getByText(/D[ií]a 2/i).first().click();
  await page.locator("#addCircuit").click();

  await page.locator("#dias").getByText(/D[ií]a 1/i).first().click();
  await page.locator("#addEjercicio").click();
  await page.getByText(/^Bloque de entrenamiento$/i).first().click();
  await page.getByRole("button", { name: /A(?:ñ|n)adir ejercicio al bloque/i }).first().click();
  await page.getByRole("button", { name: /A(?:ñ|n)adir circuito al bloque/i }).first().click();

  await page.locator("#dias").getByText(/D[ií]a 3/i).first().click();
  await page.locator("#copiarDia").click();
  await page.locator("#eliminarDia").click();
  const deleteDialog = page.locator(".p-confirm-dialog:visible");
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: /S[iÃ­]/i }).click();
  await page.locator("#pegarDia").click();

  await page.locator("#movility").click();
  const movilityDialog = page.locator(".p-dialog:has-text('movilidad'):visible");
  await expect(movilityDialog).toBeVisible();
  await addAuxiliaryExercise(movilityDialog);
  await movilityDialog.getByRole("button", { name: /Continuar editando/i }).click();

  await page.locator("#warmup").click();
  const warmupDialog = page.locator(".p-dialog:has-text('entrada en calor'):visible");
  await expect(warmupDialog).toBeVisible();
  await addAuxiliaryExercise(warmupDialog);
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
    await page.locator("#dias").getByText(/D[ií]a 1/i).first().click();
    await expect(page.locator("table")).toBeVisible();
    await page.locator("#dias").getByText(/D[ií]a 2/i).first().click();
    await page.locator("#dias").getByText(/D[ií]a 3/i).first().click();
  }

  await page.locator("#dias").getByText(/D[ií]a 1/i).first().click();
  await page.locator("#addEjercicio").click();
  await page.locator("#dias").getByText(/D[ií]a 2/i).first().click();
  await page.locator("#addCircuit").click();
  await page.locator("#dias").getByText(/D[ií]a 3/i).first().click();
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

test("editor personalization tools open and persist without runtime errors", async ({ page }) => {
  const weekDoc = buildWeekFixture();
  const savedPayloads = [];
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, savedPayloads);
  await goToPlanner(page);

  await page.getByRole("group", { name: /Modo de herramientas/i }).first().getByRole("button", { name: /Libre|^L$/i }).click();
  await expect.poll(() => page.locator(".dayEditSidebarModern.isFreeMode").count()).toBe(1);
  await page.getByRole("button", { name: /Barra|^B$/i }).first().click();
  await expect(page.locator(".dayEditSidebarModern.isSidebarMode")).toBeVisible();
  await page.getByRole("group", { name: /Modo de herramientas/i }).first().getByRole("button", { name: /Simple|^S$/i }).click();
  await expect(page.locator(".dayEditSidebarModern.isSimpleMode")).toBeVisible();
  await page.getByRole("button", { name: /Barra|^B$/i }).first().click();
  await expect(page.locator(".dayEditSidebarModern.isSidebarMode")).toBeVisible();

  await page.getByRole("button", { name: /Columnas/i }).first().click();
  const columnsDialog = page.locator(".p-dialog:has-text('Columnas del planificador'):visible");
  await expect(columnsDialog).toBeVisible();
  await columnsDialog.getByLabel(/Alumno/i).uncheck();
  await columnsDialog.getByRole("button", { name: /Restablecer/i }).click();
  await columnsDialog.getByRole("button", { name: /^Listo$/i }).click();
  await expect(columnsDialog).not.toBeVisible();

  await page.getByRole("button", { name: /Ajustes/i }).first().click();
  const settingsDialog = page.locator(".p-dialog:has-text('Ajustes del editor'):visible");
  await expect(settingsDialog).toBeVisible();
  await settingsDialog.getByRole("group", { name: /Visualizaci[oó]n de notas/i }).getByRole("button", { name: /Abiertas/i }).click();
  await settingsDialog.getByRole("group", { name: /Visualizaci[oó]n de aproximaciones/i }).getByRole("button", { name: /Siempre/i }).click();
  await settingsDialog.getByRole("group", { name: /Densidad visual/i }).getByRole("button", { name: /Compacto/i }).click();
  await settingsDialog.getByRole("group", { name: /Modo reps por defecto/i }).getByRole("button", { name: /Multiple/i }).click();
  await settingsDialog.getByRole("group", { name: /Confirmar antes de eliminar/i }).getByRole("button", { name: /^Si$/i }).click();
  await settingsDialog.getByRole("button", { name: /^Listo$/i }).click();
  await expect(settingsDialog).not.toBeVisible({ timeout: 15000 });

  const stored = await page.evaluate(() => ({
    settings: JSON.parse(localStorage.getItem(Object.keys(localStorage).find((key) => key.startsWith("dayEditSettings:")) || "") || "{}"),
    columns: JSON.parse(localStorage.getItem(Object.keys(localStorage).find((key) => key.startsWith("dayEditColumnConfig:")) || "") || "{}"),
  }));
  expect(stored.settings).toEqual(expect.objectContaining({
    notesVisibility: "open",
    approxBackoffVisibility: "always",
    editorDensity: "compact",
    defaultRepsMode: "multiple",
    confirmBeforeDelete: true,
  }));
  expect(stored.columns).toEqual(expect.objectContaining({ __version: expect.any(Number) }));

  // Tercera opcion de notas: solo se abren las que ya tienen texto.
  await page.getByRole("button", { name: /Ajustes/i }).first().click();
  const settingsAgain = page.locator(".p-dialog:has-text('Ajustes del editor'):visible");
  await expect(settingsAgain).toBeVisible();
  await settingsAgain.getByRole("group", { name: /Visualizaci[oó]n de notas/i })
    .getByRole("button", { name: /Con texto/i }).click();
  await settingsAgain.getByRole("button", { name: /^Listo$/i }).click();
  await expect(settingsAgain).not.toBeVisible({ timeout: 15000 });

  const storedWithContent = await page.evaluate(() =>
    JSON.parse(localStorage.getItem(Object.keys(localStorage).find((key) => key.startsWith("dayEditSettings:")) || "") || "{}"));
  expect(storedWithContent.notesVisibility).toBe("with-content");

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
  await expect(page.locator("#dias")).toContainText(/D[ií]a 4/i);

  await page.locator("#editarDia").click();
  const renameDialog = page.locator(".p-dialog:has-text('Editar nombre del'):visible");
  await expect(renameDialog).toBeVisible();
  await renameDialog.locator("#dayName").fill("Dia 4 Editado");
  await renameDialog.getByRole("button", { name: /Confirmar/i }).click();
  await expect(page.locator("#dias")).toContainText(/D[ií]a 4 Editado/i);

  await page.locator("#copiarDia").click();
  await page.locator("#pegarDia").click();
  await expect(page.locator("#dias")).toContainText(/D[ií]a 5/i);

  await page.locator("#eliminarDia").click();
  const deleteDayDialog = page.locator(".p-confirm-dialog:visible");
  await expect(deleteDayDialog).toBeVisible();
  await deleteDayDialog.getByRole("button", { name: /^Si$/i }).click();
  await expect(page.locator("#dias")).not.toContainText(/D[ií]a 5/i);

  await page.locator("#reordenarDias").click();
  const reorderDialog = page.locator(".p-dialog:has-text('Reordenar'):visible");
  await expect(reorderDialog).toBeVisible();
  await reorderDialog.getByRole("button", { name: /Aplicar/i }).click();

  await page.locator("#dias").getByText(/D[ií]a 1/i).first().click();
  await page.getByRole("button", { name: /Semanas anteriores/i }).first().click();
  const previousWeeksDialog = page.locator(".p-dialog:has-text('Semanas anteriores'):visible");
  await expect(previousWeeksDialog).toBeVisible();
  await previousWeeksDialog.getByRole("button", { name: /Close/i }).click();

  await page.locator("#dias").getByText(/D[ií]a 2/i).first().click();
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

test("mobile day actions are directly below the day segmented", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const weekDoc = buildWeekFixture();

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, []);
  await page.goto(`/routine/user/${coachId}/week/${weekId}/day/${dayId}/${username}`);

  const segmented = page.locator(".dayEditMobileDaySegmented");
  const actions = page.locator(".dayEditMobileDayActions");
  await expect(segmented).toBeVisible();
  await expect(actions).toBeVisible();
  await expect(actions.getByRole("button")).toHaveCount(6);
  await expect(actions.getByRole("button", { name: /Pegar d[ií]a/ })).toBeDisabled();

  const segmentedBox = await segmented.boundingBox();
  const actionsBox = await actions.boundingBox();
  expect(segmentedBox).not.toBeNull();
  expect(actionsBox).not.toBeNull();
  expect(actionsBox.y).toBeGreaterThanOrEqual(segmentedBox.y + segmentedBox.height);

  await actions.getByRole("button", { name: /Editar d[ií]a/ }).click();
  await expect(page.locator(".p-dialog:has-text('Editar nombre del'):visible")).toBeVisible();
});

// Queda en skip mientras MOSTRAR_CREACION_POR_TEXTO este en false en
// DayEditDetailsPage.jsx: el boton no se renderiza. Al reactivar la funcion,
// sacar el .skip — la cobertura sigue siendo valida.
test.skip("simple exercise command creates a validated exercise draft", async ({ page }) => {
  const weekDoc = buildWeekFixture();

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, []);
  await goToPlanner(page);

  await page.getByRole("button", { name: /Crear por texto o voz/i }).click();
  const composer = page.locator(".exerciseCommandComposer");
  await composer.getByLabel("Instrucción para crear ejercicio").fill(
    "Sentadilla al cajón, tres series por cuatro repeticiones, 200 kg y 3 minutos de descanso."
  );
  await composer.getByRole("button", { name: /^Revisar$/i }).click();
  await expect(composer.locator(".exerciseCommandPreview.isValid")).toContainText(/Sentadilla al cajón/i);
  await expect(composer.locator(".exerciseCommandPreview.isValid")).toContainText(/3 series × 4 reps/i);
  await composer.getByRole("button", { name: /Agregar al día/i }).click();
  await expect(page.locator("table.ddp-table input[value='Sentadilla al cajón']")).toHaveCount(1);
});

test("exercise rest and inline notes remain usable after redesign", async ({ page }) => {
  const weekDoc = buildWeekFixture();
  const savedPayloads = [];
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, savedPayloads);
  await goToPlanner(page);

  await page.getByRole("button", { name: /Modo oscuro/i }).click();
  await expect(page.locator(".dayEditDarkPage").first()).toBeVisible();
  await page.getByRole("button", { name: /Modo claro/i }).click();

  const firstExerciseRow = page.locator("table.ddp-table > tbody > tr").filter({ has: page.locator("input[value='Bench Press']") }).first();
  await expect(firstExerciseRow).toBeVisible();

  const restCell = firstExerciseRow.locator("td").nth(7);
  await restCell.getByRole("button").click();
  await expect(page.getByText("00:30").first()).toBeVisible();
  await page.getByText("01:30").first().click();
  await expect(restCell.getByPlaceholder("MM:SS")).toHaveValue("01:30");

  await firstExerciseRow.locator("td").nth(9).getByRole("button").click();
  await expect(page.getByText(/^Notas$/i).first()).toBeVisible();
  const notesField = page.locator("textarea").first();
  await notesField.fill("Nota e2e estable");
  await expect(notesField).toHaveValue("Nota e2e estable");

  await expect(page.getByText(/Cambios sin guardar/i)).toBeVisible();
  await page.getByRole("button", { name: /^Guardar$/i }).first().click();
  await expect.poll(() => savedPayloads.length).toBeGreaterThan(0);
  expect(pageErrors).toEqual([]);
});






/* El editor tenia su propia copia del tema y solo el escuchaba el evento
   "storage". Si el tema cambiaba en otra pestania -o en la app instalada, que
   comparte el mismo localStorage-, el editor se pasaba a claro mientras la barra
   seguia mostrando "Modo claro", es decir, creyendose en oscuro. */
test("el tema del editor sigue al de la barra aunque cambie en otra pestania", async ({ page }) => {
  const weekDoc = buildWeekFixture();

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, []);
  await goToPlanner(page);

  const barra = page.locator(".tomTopNavEditorThemeBtn");
  const editor = page.locator(".ddp").first();

  if (/Modo oscuro/.test(await barra.textContent())) await barra.click();
  await expect(barra).toHaveText(/Modo claro/);
  await expect(editor).toHaveClass(/dayEditEditorTheme-dark/);

  // Lo que hace otra pestania al cambiar el tema.
  await page.evaluate(() => {
    localStorage.setItem("dayEditEditorTheme", "light");
    window.dispatchEvent(new StorageEvent("storage", { key: "dayEditEditorTheme", newValue: "light" }));
  });

  await expect(editor).toHaveClass(/dayEditEditorTheme-light/);
  await expect(barra).toHaveText(/Modo oscuro/);
});

/* En el telefono la hoja de "Mas" ofrecia "Columnas" -que no cambia nada,
   porque ahi la tabla no tiene columnas configurables- y en cambio no habia
   forma de llegar a los ajustes del editor, que en escritorio estan en la barra
   de herramientas. */
test("la hoja de acciones del telefono lleva a los ajustes y no ofrece columnas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const weekDoc = buildWeekFixture();

  await bootstrapAuth(page);
  await mockApi(page, weekDoc, []);
  await page.goto(`/routine/user/${coachId}/week/${weekId}/day/${dayId}/${username}`);

  await page.getByRole("button", { name: /^M[aá]s$/i }).first().click();

  const hoja = page.locator(".dayEditMobileSheet");
  await expect(hoja).toBeVisible();
  await expect(hoja.getByRole("button", { name: /^Columnas$/i })).toHaveCount(0);

  await hoja.getByRole("button", { name: /Ajustes del editor/i }).click();
  await expect(page.locator(".dayEditSettingsDialog:visible")).toBeVisible();
});
