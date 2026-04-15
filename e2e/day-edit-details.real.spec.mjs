import { test, expect } from "@playwright/test";

const runReal = process.env.E2E_REAL_API === "1";
const apiBase = process.env.E2E_API_BASE_URL || "http://localhost:2022";
const targetUserId = process.env.E2E_USER_ID || process.env.E2E_COACH_ID || "";
const weekId = process.env.E2E_WEEK_ID || "";
const dayId = process.env.E2E_DAY_ID || "";
const username = process.env.E2E_USERNAME || "e2e-real-user";
const token = process.env.E2E_AUTH_TOKEN || "";
const adminId = process.env.E2E_ADMIN_ID || decodeJwtId(token) || targetUserId;

const missing = [
  ["E2E_COACH_ID or E2E_USER_ID", targetUserId],
  ["E2E_WEEK_ID", weekId],
  ["E2E_DAY_ID", dayId],
  ["E2E_AUTH_TOKEN", token],
].filter(([, v]) => !v).map(([k]) => k);

if (!runReal) {
  // Useful hint in CLI when user forgets to enable real mode.
  // eslint-disable-next-line no-console
  console.log("Skipping real E2E suite. Set E2E_REAL_API=1 to enable.");
} else if (missing.length) {
  // eslint-disable-next-line no-console
  console.log(`Skipping real E2E suite. Missing env vars: ${missing.join(", ")}`);
}

const realDescribe = !runReal || missing.length ? test.describe.skip : test.describe;

function decodeJwtId(jwt) {
  try {
    const [, payload] = String(jwt || "").split(".");
    if (!payload) return "";
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return decoded?.id ? String(decoded.id) : "";
  } catch {
    return "";
  }
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
    }
  };

  for (const ex of day?.exercises || []) walk(ex);
  return ids;
}

async function getWeekDoc(request) {
  const response = await request.get(`${apiBase}/api/week/${weekId}`, {
    headers: { "auth-token": token },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

async function restoreRoutine(request, routine) {
  await request.patch(`${apiBase}/api/week/${weekId}`, {
    headers: {
      "content-type": "application/json",
      "auth-token": token,
    },
    data: routine,
  });
}

async function bootstrapAuth(page) {
  await page.addInitScript(({ authToken, currentAdminId }) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("role", "admin");
    localStorage.setItem("_id", currentAdminId);
    localStorage.setItem("name", "e2e-real-admin");
    localStorage.setItem("DATABASE_USER", "[]");
    localStorage.setItem("color", "#111111");
  }, { authToken: token, currentAdminId: adminId });
}

function getFirstExerciseDisplayName(week) {
  const firstExercise = week?.routine?.[0]?.exercises?.[0];
  const rawName = firstExercise?.name;
  if (rawName && typeof rawName === "object") return rawName.name || "";
  return rawName ? String(rawName) : "";
}

async function goToRealPlanner(page, week) {
  await page.goto(`/routine/user/${targetUserId}/week/${weekId}/day/${dayId}/${username}`);
  await expect(page.locator("#dias")).toBeVisible();

  const firstExerciseName = getFirstExerciseDisplayName(week);
  if (firstExerciseName) {
    await expect(page.locator(`input[value="${firstExerciseName}"]`).first()).toBeVisible({ timeout: 30000 });
  }
}

realDescribe("DayEditDetailsPage real backend", () => {
  test.describe.configure({ mode: "serial" });

  let originalRoutine = null;

  test.beforeEach(async ({ request, page }) => {
    const week = await getWeekDoc(request);
    originalRoutine = structuredClone(week?.routine || []);
    await bootstrapAuth(page);
  });

  test.afterEach(async ({ request }) => {
    if (originalRoutine) {
      await restoreRoutine(request, originalRoutine);
    }
  });

  test("real flow: mixed edits + save + backend payload remains consistent", async ({ page, request }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    const initialWeek = await getWeekDoc(request);
    await goToRealPlanner(page, initialWeek);

    // Mixed flow similar to your real bug scenarios.
    await page.locator("#addEjercicio").click();
    await page.locator("#addCircuit").click();
    await page.getByText(/Agregar bloque de entrenamiento/i).first().click();
    await page.getByRole("button", { name: /A(?:ñ|n)adir ejercicio al bloque/i }).first().click();
    await page.getByRole("button", { name: /A(?:ñ|n)adir circuito al bloque/i }).first().click();

    await page.locator("#copiarDia").click();
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

    const saveResponsePromise = page.waitForResponse((res) => {
      return res.url().includes(`/api/week/${weekId}`) && res.request().method() === "PATCH";
    });
    await page.getByRole("button", { name: /^Guardar$/i }).first().click();
    const saveResponse = await saveResponsePromise;
    expect(saveResponse.ok()).toBeTruthy();

    const updatedWeek = await getWeekDoc(request);
    expect(Array.isArray(updatedWeek?.routine)).toBeTruthy();
    expect(updatedWeek.routine.length).toBeGreaterThan(0);

    for (const day of updatedWeek.routine) {
      const ids = collectExerciseIdsFromDay(day);
      expect(new Set(ids).size).toBe(ids.length);
    }

    const allBlocks = updatedWeek.routine.flatMap((day) => (day.exercises || []).filter((e) => e?.type === "block"));
    expect(allBlocks.length).toBeGreaterThan(0);
    expect(allBlocks.some((block) => (block.exercises || []).some((e) => e?.type === "exercise"))).toBeTruthy();
    expect(allBlocks.some((block) => (block.exercises || []).some((e) => Array.isArray(e?.circuit)))).toBeTruthy();
    expect(updatedWeek.routine.some((day) => (day.exercises || []).some((e) => Array.isArray(e?.circuit)))).toBeTruthy();

    expect(pageErrors).toEqual([]);
  });

  test("real flow: switch days repeatedly and save without white screen", async ({ page, request }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    const initialWeek = await getWeekDoc(request);
    await goToRealPlanner(page, initialWeek);

    const dayButtons = page.locator("#dias label, #dias .ant-segmented-item");
    const count = await dayButtons.count();
    expect(count).toBeGreaterThan(0);

    const loops = Math.min(6, count * 2);
    for (let i = 0; i < loops; i++) {
      const idx = i % count;
      await dayButtons.nth(idx).click();
    }

    await page.locator("#addEjercicio").click();

    const saveResponsePromise = page.waitForResponse((res) => {
      return res.url().includes(`/api/week/${weekId}`) && res.request().method() === "PATCH";
    });
    await page.getByRole("button", { name: /^Guardar$/i }).first().click();
    const saveResponse = await saveResponsePromise;
    expect(saveResponse.ok()).toBeTruthy();

    expect(pageErrors).toEqual([]);
  });
});

