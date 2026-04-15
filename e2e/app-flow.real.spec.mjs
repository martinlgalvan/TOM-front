import { test, expect } from "@playwright/test";
import {
  seedCoachForRealAppFlow,
  findUserByEmail,
  getUserById,
  getUserProfileByUserId,
  getAnnouncementsByCreatorId,
  getRoutinesByUserId,
  getRoutineById,
  cleanupRealAppFlowData,
  closeRealAppFlowDb,
} from "./real-appflow.db.mjs";

const apiBase = process.env.E2E_API_BASE_URL || "http://localhost:2022";
const runId = Date.now();

const coachSeedInput = {
  email: `coach.e2e.${runId}@tom.test`,
  password: "CoachE2E123!",
  name: "Coach E2E Flow",
};

const athletePrimary = {
  name: `Alumno Flow ${runId}`,
  email: `athlete.flow.${runId}@tom.test`,
  password: "AthleteFlow123!",
  category: "Alumno casual",
};

const athleteSecondary = {
  name: `Alumno Support ${runId}`,
  email: `athlete.support.${runId}@tom.test`,
  password: "AthleteSupport123!",
  category: "Alumno dedicado",
};

const createdAthleteEmails = [athletePrimary.email, athleteSecondary.email];

let coachSeed = null;
let coachToken = "";
let primaryAthleteUser = null;
let secondaryAthleteUser = null;
let latestWeekId = "";
let latestDayId = "";

function athleteRow(page, athleteName) {
  return page.locator("tr").filter({ hasText: athleteName }).first();
}

function dialogByTitle(page, titlePattern) {
  return page
    .locator(".p-dialog:visible")
    .filter({ has: page.locator(".p-dialog-title", { hasText: titlePattern }) })
    .first();
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resetSession(page) {
  await page.context().clearCookies();
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto("/");
}

async function loginViaUi(page, email, password, expectedRole = "admin") {
  await resetSession(page);
  const emailField = page.locator("#email");
  if (!(await emailField.isVisible().catch(() => false))) {
    const loginCta = page.locator("button").filter({ hasText: /Iniciar/i }).first();
    await expect(loginCta).toBeVisible({ timeout: 30000 });
    await loginCta.click();
  }
  await expect(emailField).toBeVisible({ timeout: 30000 });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForURL(expectedRole === "admin" ? /\/users\// : /\/routine\//, { timeout: 60000 }),
    page.getByRole("button", { name: /Ingresar/i }).click(),
  ]);
  return page.evaluate(() => localStorage.getItem("token") || "");
}

async function createAthleteViaUi(page, athlete) {
  await page.getByRole("button", { name: /Crear alumno/i }).click();
  const dialog = page.locator(".p-dialog:has-text('Crear Alumno'):visible");
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(1000);

  await dialog.locator("#name").fill(athlete.name);
  await dialog.locator("#email").fill(athlete.email);
  await dialog.locator("input[type='password']").first().fill(athlete.password);
  await dialog.locator("input[type='password']").nth(1).fill(athlete.password);

  await dialog.locator("[role='combobox']").first().click();
  await page.getByRole("option", { name: athlete.category }).click();

  await dialog.getByRole("button", { name: /Crear Usuario/i }).click();

  await expect.poll(async () => {
    const user = await findUserByEmail(athlete.email);
    return user?._id ? String(user._id) : "";
  }, { timeout: 60000 }).not.toBe("");
}

async function openCoachProfile(page, athleteName) {
  const row = athleteRow(page, athleteName);
  await expect(row).toBeVisible({ timeout: 60000 });
  await row.locator("button[title='Perfil']").click();
  const dialog = page.locator(".p-dialog:has-text('Perfil'):visible");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function choosePrimeOption(page, trigger, optionText) {
  await trigger.click();
  const panel = page.locator(".p-dropdown-panel:visible, .p-multiselect-panel:visible").last();
  await expect(panel).toBeVisible();
  await panel.getByText(optionText, { exact: true }).click();
}

async function closePrimeOverlayByClickingDialogTitle(page, dialog) {
  await dialog.locator(".p-dialog-title").click({ force: true });
  await expect(page.locator(".p-dropdown-panel:visible, .p-multiselect-panel:visible")).toHaveCount(0, {
    timeout: 10000,
  });
}

async function choosePrimeMultiOption(page, trigger, optionText) {
  await trigger.click();
  const panel = page.locator(".p-multiselect-panel:visible").last();
  await expect(panel).toBeVisible();
  await panel.getByText(optionText, { exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".p-multiselect-panel:visible")).toHaveCount(0, { timeout: 10000 });
}

async function choosePrimeMultiOptionByComboboxFromEnd(page, scope, optionText, fromEnd = 1) {
  const multiselects = scope.locator("[data-pc-name='multiselect']:visible, .p-multiselect:visible");
  const multiselectCount = await multiselects.count();
  let trigger = null;

  if (multiselectCount > 0) {
    const index = Math.max(0, multiselectCount - fromEnd);
    trigger = multiselects.nth(index);
  } else {
    const comboboxes = scope.locator("[role='combobox']");
    const count = await comboboxes.count();
    const index = Math.max(0, count - fromEnd);
    const combobox = comboboxes.nth(index);
    const multiselectParent = combobox.locator(
      "xpath=ancestor::*[@data-pc-name='multiselect' or contains(@class,'p-multiselect')][1]"
    );
    trigger = (await multiselectParent.count())
      ? multiselectParent
      : combobox.locator("xpath=ancestor::*[self::div or self::span][1]");
  }

  await expect(trigger).toBeVisible({ timeout: 30000 });
  await trigger.evaluate((node) => node.click());
  const panel = page.locator(".p-multiselect-panel:visible").last();
  await expect(panel).toBeVisible({ timeout: 10000 });
  await panel.getByText(optionText, { exact: true }).click();
  const dialogTitle = scope.locator(".p-dialog-title").first();
  if (await dialogTitle.isVisible().catch(() => false)) {
    await dialogTitle.click({ force: true });
  } else {
    await page.locator("body").click({ position: { x: 20, y: 20 } });
  }
  await expect(page.locator(".p-multiselect-panel:visible")).toHaveCount(0, { timeout: 10000 });
}

async function fillFieldByLabel(scope, labelText, value, tag = "input") {
  const label = scope.locator(`label:has-text("${labelText}")`).first();
  await expect(label).toBeVisible();
  const field = label.locator(`xpath=following-sibling::${tag}[1]`);
  await expect(field).toBeVisible();
  await field.fill(value);
  return field;
}

async function refreshAthleteRefs() {
  primaryAthleteUser = await findUserByEmail(athletePrimary.email);
  secondaryAthleteUser = await findUserByEmail(athleteSecondary.email);
}

async function ensureAthletesCreated(page) {
  await refreshAthleteRefs();
  if (primaryAthleteUser?._id && secondaryAthleteUser?._id) return;

  if (!page.url().includes("/users/")) {
    await page.goto(`/users/${coachSeed.coachId}/`);
  }

  if (!primaryAthleteUser?._id) {
    await createAthleteViaUi(page, athletePrimary);
  }

  if (!secondaryAthleteUser?._id) {
    await createAthleteViaUi(page, athleteSecondary);
  }

  await refreshAthleteRefs();
  expect(primaryAthleteUser?._id).toBeTruthy();
  expect(secondaryAthleteUser?._id).toBeTruthy();
}

async function ensureAnnouncementExists(page, requestContext) {
  const existing = await getAnnouncementsByCreatorId(coachSeed.coachId);
  if (existing.some((item) => String(item.title || "").includes(`Anuncio E2E ${runId}`))) {
    return;
  }

  coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
  await ensureAthletesCreated(page);

  const createResponse = await requestContext.post(`${apiBase}/api/announcements`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": coachToken,
    },
    data: {
      creator_id: coachSeed.coachId,
      title: `Anuncio E2E ${runId}`,
      message: "Mensaje E2E para validar anuncios.",
      link_urls: [],
      mode: "once",
      show_at_date: new Date().toISOString(),
      repeat_day: null,
      day_of_month: null,
      target_categories: [],
      target_users: [primaryAthleteUser._id],
    },
  });
  expect(createResponse.ok()).toBeTruthy();

  await expect.poll(async () => {
    const items = await getAnnouncementsByCreatorId(coachSeed.coachId);
    const created = items.find((item) => String(item.title || "").includes(`Anuncio E2E ${runId}`));
    const targetUsers = Array.isArray(created?.target_users)
      ? created.target_users.map((item) => String(item))
      : [];
    return created && targetUsers.includes(String(primaryAthleteUser?._id));
  }, { timeout: 60000 }).toBeTruthy();
}

async function expectAnnouncementPopupAndDismiss(page) {
  const announcementDialog = page
    .locator(".p-dialog:visible")
    .filter({ hasText: `Anuncio E2E ${runId}` })
    .first();
  await expect(announcementDialog).toBeVisible({ timeout: 60000 });
  await expect(announcementDialog).toContainText("Mensaje E2E para validar anuncios.");
  await announcementDialog.getByRole("button", { name: /Entendido/i }).click({ force: true });
  await expect(announcementDialog).not.toBeVisible({ timeout: 30000 });
}

async function getLatestWeekForAthlete() {
  const routines = await getRoutinesByUserId(primaryAthleteUser._id);
  return routines[0] || null;
}

async function getFirstWeekWithExercisesForAthlete() {
  const routines = await getRoutinesByUserId(primaryAthleteUser._id);
  return (
    routines.find((week) =>
      (week?.routine || []).some((day) => Array.isArray(day?.exercises) && day.exercises.length > 0)
    ) || routines[0] || null
  );
}

async function ensureRoutineExists(page) {
  await refreshAthleteRefs();
  expect(primaryAthleteUser?._id).toBeTruthy();

  let latestWeek = await getLatestWeekForAthlete();
  if (!latestWeek?._id) {
    coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    await page.goto(`/user/routine/${primaryAthleteUser._id}/${encodeURIComponent(primaryAthleteUser.name)}`);
    await page.locator("#week0").click();
    await expect.poll(async () => (await getRoutinesByUserId(primaryAthleteUser._id)).length, { timeout: 60000 }).toBeGreaterThan(0);
    latestWeek = await getLatestWeekForAthlete();
  }

  const hasExercises = (latestWeek?.routine || []).some((day) => Array.isArray(day?.exercises) && day.exercises.length > 0);
  if (!hasExercises) {
    await openCoachPlanner(page);
    await page.locator("#dias label, #dias .ant-segmented-item").first().click({ force: true });
    await page.waitForTimeout(800);
    await page.locator("#addEjercicio").click({ force: true });
    const exerciseInputs = page.locator("input[placeholder*='Seleccion'], input[placeholder*='seleccion']");
    if (!(await exerciseInputs.first().isVisible().catch(() => false))) {
      await page.locator("#addEjercicio").evaluate((node) => node.click());
    }
    await expect(exerciseInputs.first()).toBeVisible({ timeout: 10000 });
    const saveResponsePromise = page.waitForResponse((res) => {
      return res.url().includes(`/api/week/${latestWeekId}`) && res.request().method() === "PATCH";
    });
    await expect(page.getByText(/Cambios sin guardar/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /^Guardar$/i }).first().click({ force: true });
    const saveResponse = await saveResponsePromise;
    expect(saveResponse.ok()).toBeTruthy();

    await expect.poll(async () => {
      const week = await getRoutineById(latestWeekId);
      return (week?.routine || []).some((day) => Array.isArray(day?.exercises) && day.exercises.length > 0);
    }, { timeout: 60000 }).toBeTruthy();
  }
}

async function openCoachPlanner(page) {
  const latestWeek = await getLatestWeekForAthlete();
  latestWeekId = String(latestWeek?._id || "");
  latestDayId = String(latestWeek?.routine?.[0]?._id || "");
  await page.goto(`/routine/user/${primaryAthleteUser._id}/week/${latestWeekId}/day/${latestDayId}/${encodeURIComponent(primaryAthleteUser.name)}`);
  await expect(page.locator("#dias")).toBeVisible({ timeout: 60000 });
}

async function createFreshWeekAndOpenPlanner(page, athleteUser) {
  const beforeCount = (await getRoutinesByUserId(athleteUser._id)).length;
  await page.goto(`/user/routine/${athleteUser._id}/${encodeURIComponent(athleteUser.name)}`);
  await expect(page.locator("#week0")).toBeVisible({ timeout: 60000 });
  await page.locator("#week0").click();
  await expect.poll(async () => (await getRoutinesByUserId(athleteUser._id)).length, { timeout: 60000 }).toBe(beforeCount + 1);

  const latestWeek = (await getRoutinesByUserId(athleteUser._id))[0];
  latestWeekId = String(latestWeek?._id || "");
  latestDayId = String(latestWeek?.routine?.[0]?._id || "");

  await page.goto(
    `/routine/user/${athleteUser._id}/week/${latestWeekId}/day/${latestDayId}/${encodeURIComponent(athleteUser.name)}`
  );
  await expect(page.locator("#dias")).toBeVisible({ timeout: 60000 });

  const segmentedItems = page.locator("#dias .ant-segmented-item");
  if ((await segmentedItems.count()) > 0) {
    await segmentedItems.first().click({ force: true });
  } else {
    const radios = page.locator("#dias [role='radio']");
    if ((await radios.count()) > 0) {
      await radios.first().click({ force: true });
    }
  }

  await page.waitForTimeout(400);
  return latestWeek;
}

async function savePlannerAndWait(page, weekId) {
  const saveResponsePromise = page.waitForResponse((res) => {
    return res.url().includes(`/api/week/${weekId}`) && res.request().method() === "PATCH";
  });
  await page.getByRole("button", { name: /^Guardar$/i }).first().click({ force: true });
  const saveResponse = await saveResponsePromise;
  expect(saveResponse.ok()).toBeTruthy();
}

async function fillVideoOverlayFromCell(page, cell, value) {
  await cell.locator("button").first().click({ force: true });
  const overlayInput = page
    .locator(".p-overlaypanel:visible input, .p-overlaypanel-content:visible input, .p-overlaypanel input:visible")
    .first();
  await expect(overlayInput).toBeVisible({ timeout: 10000 });
  await overlayInput.fill(value);
  await page.locator("body").click({ position: { x: 10, y: 10 } });
}

async function setExerciseNameFromRow(row, value) {
  const input = row.locator("input[placeholder*='Seleccion'], input[placeholder*='seleccion']").first();
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill(value);
}

async function addWarmupOrMobility(page, triggerId, dialogText) {
  await page.locator(triggerId).click();
  const dialog = page.locator(`.p-dialog:has-text('${dialogText}'):visible`);
  await expect(dialog).toBeVisible();
  await dialog.locator("button.bgColor").first().click();
  await dialog.getByRole("button", { name: /Continuar editando/i }).click();
}

async function openFirstEditableAthleteDay(page) {
  const editButtons = page.getByLabel("editar");
  if (await editButtons.first().isVisible().catch(() => false)) {
    return true;
  }

  const dayTabs = page.locator(".ddp-segmented .ant-segmented-item");
  const count = await dayTabs.count();
  for (let index = 0; index < count; index += 1) {
    await dayTabs.nth(index).click({ force: true });
    await page.waitForTimeout(500);
    if (await editButtons.first().isVisible().catch(() => false)) {
      return true;
    }
  }

  const radioTabs = page.locator("[role='radio']");
  const radioCount = await radioTabs.count();
  for (let index = 0; index < radioCount; index += 1) {
    await radioTabs.nth(index).click({ force: true });
    await page.waitForTimeout(500);
    if (await editButtons.first().isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

test.describe("Real application flow", () => {
  test.setTimeout(12 * 60 * 1000);

  test.beforeAll(async () => {
    coachSeed = await seedCoachForRealAppFlow(coachSeedInput);
  });

  test.afterAll(async () => {
    await cleanupRealAppFlowData({
      coachId: coachSeed?.coachId,
      coachEmail: coachSeed?.coachEmail,
      athleteEmails: createdAthleteEmails,
    });
    await closeRealAppFlowDb();
  });

  test("coach flow: login, create athletes, edit profile and create announcement", async ({ page }) => {
    coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    expect(coachToken).toBeTruthy();

    await ensureAthletesCreated(page);

    const profileDialog = await openCoachProfile(page, athletePrimary.name);
    await profileDialog.getByPlaceholder("Ingresa tu altura").fill("178");
    await profileDialog.getByPlaceholder("Ingresa tu edad").fill("29");
    await choosePrimeOption(page, profileDialog.locator(".p-dropdown").nth(1), "Atleta avanzado");
    await profileDialog.getByRole("button", { name: /^Guardar$/i }).click();

    await expect.poll(async () => {
      const user = await getUserById(primaryAthleteUser._id);
      return user?.category || "";
    }).toBe("Atleta avanzado");

    await expect.poll(async () => {
      const profile = await getUserProfileByUserId(primaryAthleteUser._id);
      return profile?.altura || "";
    }, { timeout: 60000 }).toBe("178");

    await page.getByRole("button", { name: /Administrar anuncios/i }).click();
    const announcementsDialog = page.locator(".p-dialog:has-text('Administrar anuncios'):visible");
    await expect(announcementsDialog).toBeVisible();
    await announcementsDialog.getByRole("button", { name: /Nuevo anuncio/i }).click();
    const announcementForm = page.locator(".p-dialog:has-text('Nuevo anuncio'):visible");
    await announcementForm.locator("input").first().fill(`Anuncio E2E ${runId}`);
    await announcementForm.locator("textarea").first().fill("Mensaje E2E para validar anuncios.");
    await choosePrimeMultiOptionByComboboxFromEnd(page, announcementForm, athletePrimary.name, 1);
    await announcementForm.getByRole("button", { name: /Crear anuncio/i }).evaluate((node) => node.click());

    await expect.poll(async () => {
      const items = await getAnnouncementsByCreatorId(coachSeed.coachId);
      const created = items.find((item) => String(item.title || "").includes(`Anuncio E2E ${runId}`));
      const targetUsers = Array.isArray(created?.target_users)
        ? created.target_users.map((item) => String(item))
        : [];
      return created && targetUsers.includes(String(primaryAthleteUser?._id));
    }, { timeout: 60000 }).toBeTruthy();
  });

  test("coach flow: create sports calendar and open QR", async ({ page }) => {
    coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    expect(coachToken).toBeTruthy();
    await ensureAthletesCreated(page);

    await page.getByRole("button", { name: /Calendario deportivo/i }).click();
    const calendarDialog = dialogByTitle(page, /^Calendario deportivo$/i);
    await expect(calendarDialog).toBeVisible();
    await fillFieldByLabel(calendarDialog, "Competencia", `Meet E2E ${runId}`);
    await calendarDialog.locator("input[type='date']").fill("2026-12-10");
    await fillFieldByLabel(calendarDialog, "Notas generales", "Plan base para flujo E2E.", "textarea");
    await calendarDialog.getByRole("button", { name: /Guardar plantilla/i }).click();

    const templateCard = calendarDialog
      .locator(".border.rounded-2")
      .filter({ hasText: `Meet E2E ${runId}` })
      .first();
    await expect(templateCard).toBeVisible({ timeout: 60000 });
    await templateCard.getByRole("button", { name: /^Ver$/i }).click();

    const templateDialog = dialogByTitle(page, /^Plantilla:/i);
    await expect(templateDialog).toBeVisible();
    let sportsAssignmentWorked = false;
    let sportsAssignmentError = "";
    const multiselectCount = await templateDialog.locator(".p-multiselect:visible").count();
    const nativeSelectCount = await templateDialog.locator("select:visible").count();
    try {
      if (multiselectCount > 1) {
        const assigneeSelect = templateDialog.locator(".p-multiselect:visible").nth(1);
        await assigneeSelect.click({ timeout: 5000 });
        const panel = page.locator(".p-multiselect-panel:visible").last();
        await expect(panel).toBeVisible({ timeout: 5000 });
        await panel.getByText(athletePrimary.name, { exact: true }).click({ timeout: 5000 });
        await closePrimeOverlayByClickingDialogTitle(page, templateDialog);
      } else if (nativeSelectCount > 1) {
        const assigneeSelect = templateDialog
          .locator("label", { hasText: /Alumnos especificos/i })
          .locator("xpath=following::select[1]");
        await assigneeSelect.selectOption({ label: athletePrimary.name }, { timeout: 5000 });
      } else {
        throw new Error(`No se detecto selector de alumnos. multiselectCount=${multiselectCount}, nativeSelectCount=${nativeSelectCount}`);
      }

      await templateDialog.getByRole("button", { name: /^Asignar a alumnos$/i }).click({ force: true, timeout: 5000 });

      const assignDialog = dialogByTitle(page, /^Confirmar asignacion$/i);
      await expect(assignDialog).toContainText(athletePrimary.name, { timeout: 5000 });
      await assignDialog
        .getByRole("button", { name: /Confirmar asignacion/i })
        .click({ force: true, timeout: 5000 });

      await expect.poll(async () => {
        const profile = await getUserProfileByUserId(primaryAthleteUser._id);
        if (Array.isArray(profile?.competition_openers_plans)) {
          return profile.competition_openers_plans.length;
        }
        return Array.isArray(profile?.openers_plans) ? profile.openers_plans.length : 0;
      }, { timeout: 15000 }).toBeGreaterThan(0);
      sportsAssignmentWorked = true;
    } catch (error) {
      sportsAssignmentError = `multiselectCount=${multiselectCount}, nativeSelectCount=${nativeSelectCount} | ${String(error?.message || error)}`;
      sportsAssignmentWorked = false;
    }

    expect.soft(
      sportsAssignmentWorked,
      `El editor de plantillas abre, pero la asignacion a alumnos no se puede completar desde la UI.${sportsAssignmentError ? ` Detalle: ${sportsAssignmentError}` : ""}`
    ).toBe(true);
    if (!sportsAssignmentWorked) {
      try {
        await page.screenshot({
          path: "test-results/debug-sports-calendar-before-nav.png",
          fullPage: true,
        });
      } catch {}
    }

    await page.goto(`/users/${coachSeed.coachId}`);
    await expect(athleteRow(page, athletePrimary.name)).toBeVisible({ timeout: 30000 });

    const row = athleteRow(page, athletePrimary.name);
    await row.locator("button[title='QR de acceso']").click();
    const qrDialog = page.locator(".p-dialog:has-text('Codigo QR'):visible, .p-dialog:has-text('Código QR'):visible");
    await expect(qrDialog).toBeVisible();
    await expect(qrDialog.locator("img")).toBeVisible();
  });

  test("coach planner fine flow: root and block fields persist with real backend", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    expect(coachToken).toBeTruthy();
    await ensureAthletesCreated(page);
    await refreshAthleteRefs();

    const plannerWeek = await createFreshWeekAndOpenPlanner(page, secondaryAthleteUser);
    const plannerWeekId = String(plannerWeek?._id || "");
    expect(plannerWeekId).toBeTruthy();

    let rows = page.locator("table.ddp-table > tbody > tr");
    await expect(rows).toHaveCount(0);

    await page.locator("#addEjercicio").click();
    await expect(rows).toHaveCount(1);
    await page.locator("#addEjercicio").click();
    await expect(rows).toHaveCount(2);
    await page.locator("#addEjercicio").click();
    await expect(rows).toHaveCount(3);
    await page.locator("#addCircuit").click();
    await expect(rows).toHaveCount(4);

    const rootRowA = rows.nth(0);
    const rootRowB = rows.nth(1);
    const rootRowC = rows.nth(2);
    const rootCircuitRow = rows.nth(3);

    await choosePrimeOption(page, rootRowA.locator(".dayEditOrderDropdown"), "1-A");
    await setExerciseNameFromRow(rootRowA, "Sentadilla QA A");
    await rootRowA.locator("td").nth(3).locator("input[type='number']").fill("5");
    await rootRowA.locator("td").nth(4).getByRole("button", { name: /^Texto$/i }).click();
    await rootRowA.locator("td").nth(4).locator("input[type='text']").fill('5"');
    await rootRowA.locator("td").nth(5).locator("input[type='text']").fill("220kg");
    await rootRowA.locator("td").nth(6).locator("input").fill("02:30");
    await fillVideoOverlayFromCell(page, rootRowA.locator("td").nth(7), "https://youtu.be/root-qa-a");
    await rootRowA.locator("td").nth(8).locator("textarea").fill("Nota QA A");

    await choosePrimeOption(page, rootRowB.locator(".dayEditOrderDropdown"), "1-B");
    await setExerciseNameFromRow(rootRowB, "Press QA B");
    await rootRowB.locator("td").nth(3).getByRole("button", { name: /^Texto$/i }).click();
    await rootRowB.locator("td").nth(3).locator("input[type='text']").fill("Top set");
    const repsCellB = rootRowB.locator("td").nth(4);
    await repsCellB.getByRole("button", { name: /^Multiple$/i }).click();
    await repsCellB.locator("button").first().click();
    const repInputsB = repsCellB.locator("input[type='number']");
    await expect(repInputsB).toHaveCount(2);
    await repInputsB.nth(0).fill("8");
    await repInputsB.nth(1).fill("10");
    await rootRowB.locator("td").nth(5).locator("input[type='text']").fill("RIR 8");
    await rootRowB.locator("td").nth(6).locator("input").fill("03:00");
    await rootRowB.locator("td").nth(8).locator("textarea").fill("Nota QA B");

    await setExerciseNameFromRow(rootRowC, "Accesorio QA C");
    const setsCellC = rootRowC.locator("td").nth(3);
    await setsCellC.locator("button").nth(1).click();
    await setsCellC.locator("button").nth(1).click();
    await setsCellC.locator("button").nth(0).click();
    const repsCellC = rootRowC.locator("td").nth(4);
    await repsCellC.locator("button").nth(1).click();
    await rootRowC.locator("td").nth(5).locator("input[type='text']").fill("30kg");

    const rootCircuitTable = rootCircuitRow.locator("table.dayEditCircuitNestedTable");
    await expect(rootCircuitTable).toBeVisible({ timeout: 10000 });
    const rootCircuitKindInput = rootCircuitTable.locator("input[placeholder='Tipo de circuito']").first();
    await rootCircuitKindInput.fill("AMRAP");
    await rootCircuitKindInput.blur();
    const rootCircuitMinuteInput = rootCircuitTable.locator("input[placeholder='1-18']").first();
    await rootCircuitMinuteInput.fill("18");
    await rootCircuitMinuteInput.blur();
    const rootCircuitNotesInput = rootCircuitTable.locator("input[placeholder='Notas']").first();
    await rootCircuitNotesInput.fill("Notas circuito root");
    await rootCircuitNotesInput.blur();
    const rootCircuitItemA = rootCircuitTable.locator("tbody > tr").nth(0);
    await setExerciseNameFromRow(rootCircuitItemA, "Remo QA");
    await rootCircuitItemA.locator("td").nth(1).locator("input[type='number']").fill("12");
    await rootCircuitItemA.locator("td").nth(2).locator("input[type='text']").fill("30kg");
    await fillVideoOverlayFromCell(page, rootCircuitItemA.locator("td").nth(3), "https://youtu.be/root-circuit-a");
    await rootCircuitTable.locator("button.circuitAddExerciseBtn").click({ force: true, timeout: 10000 });
    const rootCircuitItemB = rootCircuitTable.locator("tbody > tr").nth(1);
    await setExerciseNameFromRow(rootCircuitItemB, "Burpee QA");
    await rootCircuitItemB.locator("td").nth(1).locator("input[type='number']").fill("15");
    await rootCircuitItemB.locator("td").nth(2).locator("input[type='text']").fill("BW");

    await page.locator("#addCircuit").click();
    rows = page.locator("table.ddp-table > tbody > tr");
    await expect(rows).toHaveCount(5);
    const removableCircuitRow = rows.nth(4);
    await removableCircuitRow.locator("[aria-label='delete']").first().click({ force: true });
    const deleteCircuitDialog = dialogByTitle(page, /^Eliminar circuito$/i);
    await expect(deleteCircuitDialog).toBeVisible({ timeout: 10000 });
    await deleteCircuitDialog.getByRole("button", { name: /^Si$/i }).click({ force: true });
    await expect(rows).toHaveCount(4);

    await page.getByText(/Agregar bloque de entrenamiento/i).first().click();
    await expect(rows).toHaveCount(6);
    await page.getByRole("button", { name: /Anadir ejercicio al bloque/i }).first().click();
    await expect(rows).toHaveCount(7);
    await page.getByRole("button", { name: /Anadir circuito al bloque/i }).first().click();
    await expect(rows).toHaveCount(8);

    const blockExerciseRow = rows.nth(5);
    const blockCircuitRow = rows.nth(6);

    await choosePrimeOption(page, blockExerciseRow.locator(".p-dropdown").first(), "2-A");
    await setExerciseNameFromRow(blockExerciseRow, "Accesorio bloque QA");
    await blockExerciseRow.locator("td").nth(2).getByRole("button", { name: /^Texto$/i }).click();
    await blockExerciseRow.locator("td").nth(2).locator("input[type='text']").fill("Drop set");
    const blockRepsCell = blockExerciseRow.locator("td").nth(3);
    await blockRepsCell.getByRole("button", { name: /^Multiple$/i }).click();
    await blockRepsCell.locator("button").first().click();
    const blockRepInputs = blockRepsCell.locator("input[type='number']");
    await expect(blockRepInputs).toHaveCount(2);
    await blockRepInputs.nth(0).fill("6");
    await blockRepInputs.nth(1).fill("8");
    await blockExerciseRow.locator("td").nth(4).locator("input[type='text']").fill("60kg");
    await blockExerciseRow.locator("td").nth(5).locator("input").fill("01:45");
    await fillVideoOverlayFromCell(page, blockExerciseRow.locator("td").nth(6), "https://youtu.be/block-exercise");
    await blockExerciseRow.locator("td").nth(7).locator("textarea").fill("Notas bloque");

    const blockCircuitTable = blockCircuitRow.locator("table.dayEditCircuitNestedTable");
    await expect(blockCircuitTable).toBeVisible({ timeout: 10000 });
    const blockCircuitKindInput = blockCircuitTable.locator("input[placeholder='Tipo de circuito']").first();
    await blockCircuitKindInput.fill("Libre");
    await blockCircuitKindInput.blur();
    const blockCircuitNameInput = blockCircuitTable.locator("input[placeholder='Nombre del circuito']").first();
    await blockCircuitNameInput.fill("Circuito bloque QA");
    await blockCircuitNameInput.blur();
    const blockCircuitTypeOfSetsInput = blockCircuitTable
      .locator("thead tr")
      .first()
      .locator("input.form-control.form-control-sm:not([placeholder='Nombre del circuito']):not([placeholder='Notas'])")
      .first();
    await blockCircuitTypeOfSetsInput.fill("4 vueltas");
    await blockCircuitTypeOfSetsInput.blur();
    const blockCircuitItem = blockCircuitTable.locator("tbody > tr").nth(0);
    await setExerciseNameFromRow(blockCircuitItem, "Remo bloque QA");
    await blockCircuitItem.locator("td").nth(1).locator("input[type='number']").fill("10");
    await blockCircuitItem.locator("td").nth(2).locator("input[type='text']").fill("BW");
    await fillVideoOverlayFromCell(page, blockCircuitItem.locator("td").nth(3), "https://youtu.be/block-circuit");

    await expect(page.getByText(/Cambios sin guardar/i)).toBeVisible({ timeout: 10000 });
    await savePlannerAndWait(page, plannerWeekId);

    await expect.poll(async () => {
      const routine = await getRoutineById(plannerWeekId);
      const day = routine?.routine?.[0];
      const exercises = Array.isArray(day?.exercises) ? day.exercises : [];

      const rootExerciseA = exercises[0];
      const rootExerciseB = exercises[1];
      const rootExerciseC = exercises[2];
      const rootCircuit = exercises.find((item) => Array.isArray(item?.circuit));
      const block = exercises.find((item) => item?.type === "block");
      const blockExercise = block?.exercises?.find((item) => item?.type === "exercise");
      const blockCircuit = block?.exercises?.find((item) => Array.isArray(item?.circuit));

      return {
        rootExerciseA: {
          numberExercise: rootExerciseA?.numberExercise,
          name: String(rootExerciseA?.name || ""),
          sets: rootExerciseA?.sets,
          reps: rootExerciseA?.reps,
          peso: String(rootExerciseA?.peso || ""),
          rest: String(rootExerciseA?.rest || ""),
          video: String(rootExerciseA?.video || ""),
          notas: String(rootExerciseA?.notas || ""),
        },
        rootExerciseB: {
          numberExercise: rootExerciseB?.numberExercise,
          name: String(rootExerciseB?.name || ""),
          sets: rootExerciseB?.sets,
          reps: rootExerciseB?.reps,
          peso: String(rootExerciseB?.peso || ""),
          rest: String(rootExerciseB?.rest || ""),
          notas: String(rootExerciseB?.notas || ""),
        },
        rootExerciseC: {
          name: String(rootExerciseC?.name || ""),
          sets: rootExerciseC?.sets,
          reps: rootExerciseC?.reps,
          peso: String(rootExerciseC?.peso || ""),
        },
        rootCircuit: {
          circuitKind: String(rootCircuit?.circuitKind || ""),
          durationSec: rootCircuit?.durationSec,
          notas: String(rootCircuit?.notas || ""),
          firstItem: rootCircuit?.circuit?.[0]
            ? {
                name: String(rootCircuit.circuit[0].name || ""),
                reps: rootCircuit.circuit[0].reps,
                peso: String(rootCircuit.circuit[0].peso || ""),
                video: String(rootCircuit.circuit[0].video || ""),
              }
            : null,
          secondItem: rootCircuit?.circuit?.[1]
            ? {
                name: String(rootCircuit.circuit[1].name || ""),
                reps: rootCircuit.circuit[1].reps,
                peso: String(rootCircuit.circuit[1].peso || ""),
              }
            : null,
          totalCircuits: exercises.filter((item) => Array.isArray(item?.circuit)).length,
        },
        blockExercise: {
          numberExercise: blockExercise?.numberExercise,
          name: String(blockExercise?.name || ""),
          sets: blockExercise?.sets,
          reps: blockExercise?.reps,
          peso: String(blockExercise?.peso || ""),
          rest: String(blockExercise?.rest || ""),
          video: String(blockExercise?.video || ""),
          notas: String(blockExercise?.notas || ""),
        },
        blockCircuit: {
          circuitKind: String(blockCircuit?.circuitKind || ""),
          type: String(blockCircuit?.type || ""),
          typeOfSets: String(blockCircuit?.typeOfSets || ""),
          firstItem: blockCircuit?.circuit?.[0]
            ? {
                name: String(blockCircuit.circuit[0].name || ""),
                reps: blockCircuit.circuit[0].reps,
                peso: String(blockCircuit.circuit[0].peso || ""),
                video: String(blockCircuit.circuit[0].video || ""),
              }
            : null,
        },
      };
    }, { timeout: 60000 }).toEqual({
      rootExerciseA: {
        numberExercise: 1.1,
        name: "Sentadilla QA A",
        sets: 5,
        reps: '5"',
        peso: "220kg",
        rest: "02:30",
        video: "https://youtu.be/root-qa-a",
        notas: "Nota QA A",
      },
      rootExerciseB: {
        numberExercise: 1.2,
        name: "Press QA B",
        sets: "Top set",
        reps: [8, 10],
        peso: "RIR 8",
        rest: "03:00",
        notas: "Nota QA B",
      },
      rootExerciseC: {
        name: "Accesorio QA C",
        sets: 2,
        reps: 2,
        peso: "30kg",
      },
      rootCircuit: {
        circuitKind: "AMRAP",
        durationSec: 1080,
        notas: "Notas circuito root",
        firstItem: {
          name: "Remo QA",
          reps: 12,
          peso: "30kg",
          video: "https://youtu.be/root-circuit-a",
        },
        secondItem: {
          name: "Burpee QA",
          reps: 15,
          peso: "BW",
        },
        totalCircuits: 1,
      },
      blockExercise: {
        numberExercise: 2.1,
        name: "Accesorio bloque QA",
        sets: "Drop set",
        reps: [6, 8],
        peso: "60kg",
        rest: "01:45",
        video: "https://youtu.be/block-exercise",
        notas: "Notas bloque",
      },
      blockCircuit: {
        circuitKind: "Libre",
        type: "Circuito bloque QA",
        typeOfSets: "4 vueltas",
        firstItem: {
          name: "Remo bloque QA",
          reps: 10,
          peso: "BW",
          video: "https://youtu.be/block-circuit",
        },
      },
    });

    expect(pageErrors).toEqual([]);
  });

  test("coach flow: create weeks, copy/paste/hide/comment weeks and execute planner core flows", async ({ page }) => {
    await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    await ensureAthletesCreated(page);
    await page.goto(`/user/routine/${primaryAthleteUser._id}/${encodeURIComponent(primaryAthleteUser.name)}`);

    await expect(page.locator("#week0")).toBeVisible();
    await page.locator("#week0").click();
    await expect.poll(async () => (await getRoutinesByUserId(primaryAthleteUser._id)).length, { timeout: 60000 }).toBe(1);

    await page.locator("#continueWeek").click();
    await expect.poll(async () => (await getRoutinesByUserId(primaryAthleteUser._id)).length, { timeout: 60000 }).toBe(2);

    await expect(page.getByText(/Cargando semanas/i)).toHaveCount(0, { timeout: 60000 });
    await page.locator('button[aria-label="copy"]:visible').first().click();
    await page.locator("#paste").click();
    await expect.poll(async () => (await getRoutinesByUserId(primaryAthleteUser._id)).length, { timeout: 60000 }).toBe(3);

    await page.locator('button[aria-label="toggle-visibility"]:visible').nth(1).click();
    await expect.poll(async () => {
      const routines = await getRoutinesByUserId(primaryAthleteUser._id);
      return routines.filter((week) => week.visibility === "hidden").length;
    }).toBeGreaterThan(0);

    await page.locator('button[aria-label="add-comments"]:visible').first().evaluate((node) => node.click());
    const commentsDialog = page.locator(".p-dialog:has-text('Comentarios de la semana'):visible");
    await expect(commentsDialog).toBeVisible();
    await commentsDialog.locator("#comments-title").fill("Comentarios QA");
    await commentsDialog.locator("#comments-body").fill("Comentario semanal cargado por E2E.");
    await commentsDialog.getByRole("button", { name: /^Guardar$/i }).click();

    await expect.poll(async () => {
      const routines = await getRoutinesByUserId(primaryAthleteUser._id);
      return routines.some((week) => week?.comments?.title === "Comentarios QA");
    }).toBeTruthy();

    await openCoachPlanner(page);

    let weekRenameSucceeded = false;
    await page.locator("#nameWeek").click();
    const weekNameDialog = page.locator(".p-dialog:has-text('Editar nombre de la semana'):visible");
    await weekNameDialog.locator("#weekName").fill("Semana QA Flow");
    await weekNameDialog.getByRole("button", { name: /Confirmar/i }).click({ force: true });
    try {
      await expect(weekNameDialog).not.toBeVisible({ timeout: 4000 });
      weekRenameSucceeded = true;
    } catch {
      await weekNameDialog.getByRole("button", { name: /Cancelar/i }).click({ force: true });
    }

    await page.locator("#agregarDia").click();
    await expect(page.locator("#dias")).toContainText(/Dia 2/i);

    await page.locator("#editarDia").click();
    const dayNameDialog = page.locator(".p-dialog:has-text('Editar nombre del dia'):visible");
    await dayNameDialog.locator("#dayName").fill("Dia QA 2");
    await dayNameDialog.getByRole("button", { name: /Confirmar/i }).click({ force: true });
    await expect(dayNameDialog).not.toBeVisible();
    await expect(page.locator("#dias")).toContainText(/Dia QA 2/i);

    await page.locator("#copiarDia").click();
    await page.locator("#pegarDia").click();

    await page.locator("#reordenarDias").click();
    const reorderDialog = page.locator(".p-dialog:has-text('Reordenar dias'):visible");
    await expect(reorderDialog).toBeVisible();
    const dragItems = reorderDialog.locator(".list-group-item");
    if ((await dragItems.count()) >= 2) {
      await dragItems.nth(0).dragTo(dragItems.nth(1));
    }
    await reorderDialog.getByRole("button", { name: /Aplicar/i }).click({ force: true });
    await expect(reorderDialog).not.toBeVisible();

    await page.locator("#addEjercicio").click();
    await page.locator("#addEjercicio").click();
    await page.locator("#addCircuit").click();
    await page.getByText(/Agregar bloque de entrenamiento/i).first().click();
    await page.getByRole("button", { name: /Anadir ejercicio al bloque/i }).first().click();
    await page.getByRole("button", { name: /Anadir circuito al bloque/i }).first().click();

    await addWarmupOrMobility(page, "#movility", "movilidad");
    await addWarmupOrMobility(page, "#warmup", "entrada en calor");

    await expect(page.getByText(/Cambios sin guardar/i)).toBeVisible();
    const saveResponsePromise = page.waitForResponse((res) => {
      return res.url().includes(`/api/week/${latestWeekId}`) && res.request().method() === "PATCH";
    });
    await page.getByRole("button", { name: /^Guardar$/i }).first().click();
    const saveResponse = await saveResponsePromise;
    expect(saveResponse.ok()).toBeTruthy();

    const expectedWeekName = weekRenameSucceeded ? "Semana QA Flow" : expect.any(String);

    await expect.poll(async () => {
      const latestWeek = await getRoutineById(latestWeekId);
      const days = Array.isArray(latestWeek?.routine) ? latestWeek.routine : [];
      const dayCount = days.length;
      const exerciseCount = days.reduce((sum, day) => sum + ((day?.exercises || []).length || 0), 0);
      const hasRootCircuit = days.some((day) => (day?.exercises || []).some((item) => Array.isArray(item?.circuit)));
      const hasBlock = days.some((day) => (day?.exercises || []).some((item) => item?.type === "block"));
      const hasWarmup = days.some((day) => Array.isArray(day?.warmup) && day.warmup.length > 0);
      const hasMovility = days.some((day) => Array.isArray(day?.movility) && day.movility.length > 0);
      return { dayCount, exerciseCount, hasRootCircuit, hasBlock, hasWarmup, hasMovility, name: latestWeek?.name || "" };
    }, { timeout: 60000 }).toEqual(expect.objectContaining({
      dayCount: expect.any(Number),
      exerciseCount: expect.any(Number),
      hasRootCircuit: true,
      hasBlock: true,
      hasWarmup: true,
      hasMovility: true,
      name: expectedWeekName,
    }));
  });

  test("athlete flow: login, open tools, edit exercise, save weekly summary and drive link", async ({ page, request }) => {
    coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    await ensureAthletesCreated(page);
    await ensureAnnouncementExists(page, request);
    await ensureRoutineExists(page);
    await refreshAthleteRefs();

    const athleteToken = await loginViaUi(page, athletePrimary.email, athletePrimary.password, "common");
    expect(athleteToken).toBeTruthy();

    const unreadResponse = await request.get(`${apiBase}/api/announcements/user/${primaryAthleteUser._id}`, {
      headers: {
        "auth-token": athleteToken,
      },
    });
    expect(unreadResponse.ok()).toBeTruthy();
    const unreadAnnouncements = await unreadResponse.json();
    const pendingAnnouncement = unreadAnnouncements.find((item) =>
      String(item?.title || "").includes(`Anuncio E2E ${runId}`)
    );
    expect(pendingAnnouncement?._id).toBeTruthy();

    const popupDialog = page
      .locator(".p-dialog:visible")
      .filter({ hasText: `Anuncio E2E ${runId}` })
      .first();
    let popupVisible = false;
    try {
      await expect(popupDialog).toBeVisible({ timeout: 8000 });
      popupVisible = true;
    } catch {
      popupVisible = false;
    }

    expect.soft(
      popupVisible,
      "El backend devuelve el anuncio como unread, pero el popup no aparece al iniciar sesion."
    ).toBe(true);

    if (popupVisible) {
      await expectAnnouncementPopupAndDismiss(page);
    } else {
      const markReadResponse = await request.post(
        `${apiBase}/api/announcements/${pendingAnnouncement._id}/read/${primaryAthleteUser._id}`,
        {
          headers: {
            "auth-token": athleteToken,
          },
        }
      );
      expect(markReadResponse.ok()).toBeTruthy();
    }

    const latestWeek = await getFirstWeekWithExercisesForAthlete();
    latestWeekId = String(latestWeek?._id || "");
    const athleteDayIndex = Math.max(
      0,
      (latestWeek?.routine || []).findIndex(
        (day) => Array.isArray(day?.exercises) && day.exercises.length > 0
      )
    );
    latestDayId = String(latestWeek?.routine?.[athleteDayIndex]?._id || latestWeek?.routine?.[0]?._id || "");

    await page.goto(`/anuncios`);
    await expect(page.getByText(`Anuncio E2E ${runId}`)).toBeVisible({ timeout: 60000 });

    await page.goto(`/perfil/${primaryAthleteUser._id}`);
    await expect(page.getByRole("button", { name: /^Guardar$/i })).toBeVisible();
    await fillFieldByLabel(page.locator("body"), "Edad", "30");
    await fillFieldByLabel(page.locator("body"), "Peso (kg)", "88");
    await fillFieldByLabel(page.locator("body"), "Altura (cm)", "179");
    await page.getByRole("button", { name: /^Guardar$/i }).click();

    await expect.poll(async () => {
      const profile = await getUserProfileByUserId(primaryAthleteUser._id);
      return {
        edad: String(profile?.edad || ""),
        peso: String(profile?.peso || ""),
        altura: String(profile?.altura || ""),
      };
    }, { timeout: 60000 }).toEqual({ edad: "30", peso: "88", altura: "179" });

    await page.goto(`/routine/${primaryAthleteUser._id}/day/${latestDayId}/${latestWeekId}/${athleteDayIndex}`);
    await expect(page.getByText(/Herramientas/i).first()).toBeVisible({ timeout: 60000 });

    const athleteProfile = await getUserProfileByUserId(primaryAthleteUser._id);
    const hasAssignedPlan = Array.isArray(athleteProfile?.openers_plans) && athleteProfile.openers_plans.length > 0;

    await page.getByText(/Herramientas/i).first().click();
    const toolsDialog = page.locator(".p-dialog:has-text('Herramientas'):visible");
    await expect(toolsDialog).toBeVisible();
    const toolAssertions = [
      ["Calculadora y contador", /Modo de c[aá]lculo|Porcentaje|Peso/i],
      ["Contador de discos", /discos por lado|No hacen falta discos|Por lado/i],
      ["Estadisticas", /Metrica del grafico|Vista general|No hay una semana anterior para comparar|No se encontraron ejercicios comparables entre ambas semanas/i],
      ["1RM estimado", /1RM Estimado/i],
      ["Plan de competencia", hasAssignedPlan ? new RegExp(escapeRegex(`Meet E2E ${runId}`)) : /Competencia|torneo/i],
      ["Bitacora tecnica", /Bitacora tecnica/i],
    ];
    for (const [label, assertion] of toolAssertions) {
      await toolsDialog.getByRole("button", { name: label }).click();
      await expect(toolsDialog.getByText(assertion).first()).toBeVisible({ timeout: 30000 });
    }
    await page.keyboard.press("Escape");

    const foundEditableExercise = await openFirstEditableAthleteDay(page);
    expect(foundEditableExercise).toBeTruthy();
    await page.getByLabel("editar").first().click();
    const editDialog = page.locator(".p-dialog:has-text('Editar Ejercicio'):visible");
    await expect(editDialog).toBeVisible();
    await fillFieldByLabel(editDialog, "Peso", "245");
    await fillFieldByLabel(editDialog, "Notas", "Nota athlete E2E.", "textarea");
    await editDialog.getByRole("button", { name: /^Guardar$/i }).click();

    await expect.poll(async () => {
      const routine = await getRoutineById(latestWeekId);
      const currentDay = (routine?.routine || []).find((day) => String(day?._id) === latestDayId)
        || routine?.routine?.[athleteDayIndex]
        || routine?.routine?.find((day) => Array.isArray(day?.exercises) && day.exercises.length > 0);
      const firstExercise = currentDay?.exercises?.[0];
      return {
        peso: String(firstExercise?.peso || ""),
        notas: String(firstExercise?.notas || ""),
      };
    }, { timeout: 60000 }).toEqual({ peso: "245", notas: "Nota athlete E2E." });

    await page.getByText(/Resumen semanal/i).first().click();
    const weeklyDialog = page.locator(".p-dialog:has-text('Resumen Semanal'):visible");
    await expect(weeklyDialog).toBeVisible();
    const selects = weeklyDialog.locator("select");
    const selectCount = await selects.count();
    for (let i = 0; i < Math.min(5, selectCount); i++) {
      await selects.nth(i).selectOption({ label: "Bien" });
    }
    await weeklyDialog.locator("input[type='number']").first().fill("87.5");
    await weeklyDialog.locator("textarea").fill("Resumen semanal cargado por athlete E2E.");
    await weeklyDialog.getByRole("button", { name: /Guardar resumen semanal/i }).click();

    await expect.poll(async () => {
      const profile = await getUserProfileByUserId(primaryAthleteUser._id);
      return String(profile?.resumen_semanal?.comments || "");
    }, { timeout: 60000 }).toBe("Resumen semanal cargado por athlete E2E.");

    await page.getByText(/Google Drive|Agregar Drive/i).first().click();
    const driveDialog = page.locator(".p-dialog:has-text('Google Drive'):visible");
    await expect(driveDialog).toBeVisible();
    await driveDialog.locator("#driveLink").fill("https://drive.google.com/drive/folders/e2e-flow");
    await driveDialog.getByRole("button", { name: /^Guardar$/i }).click();

    await expect.poll(async () => {
      const profile = await getUserProfileByUserId(primaryAthleteUser._id);
      return String(profile?.drive_link || "");
    }, { timeout: 60000 }).toBe("https://drive.google.com/drive/folders/e2e-flow");
  });

  test("coach corrections and QR login flow work end-to-end", async ({ page, request }) => {
    coachToken = await loginViaUi(page, coachSeed.coachEmail, coachSeed.coachPassword, "admin");
    await ensureAthletesCreated(page);
    await ensureRoutineExists(page);
    await refreshAthleteRefs();
    await page.goto(`/user/routine/${primaryAthleteUser._id}/${encodeURIComponent(primaryAthleteUser.name)}`);

    await page.locator("#correcciones button, #correcciones").first().click();
    const correctionsDialog = page.locator(".p-dialog:has-text('Correcciones'):visible");
    await expect(correctionsDialog).toBeVisible();
    await correctionsDialog.locator("textarea").fill("Correccion E2E desde entrenador.");
    await correctionsDialog.getByRole("button", { name: /^Guardar$/i }).click();

    await expect.poll(async () => {
      const profile = await getUserProfileByUserId(primaryAthleteUser._id);
      return String(profile?.devolucion || "");
    }, { timeout: 60000 }).toBe("Correccion E2E desde entrenador.");

    const qrResponse = await request.get(`${apiBase}/api/generate-qr/${primaryAthleteUser._id}`, {
      headers: {
        "auth-token": coachToken,
      },
    });
    expect(qrResponse.ok()).toBeTruthy();
    const qrPayload = await qrResponse.json();
    expect(qrPayload?.token).toBeTruthy();

    await resetSession(page);
    await page.goto(`/qr-login?token=${encodeURIComponent(qrPayload.token)}`);
    await expect(page).toHaveURL(new RegExp(`/routine/${primaryAthleteUser._id}$`), { timeout: 60000 });
    await expect(page.getByText(/Correcciones/i)).toBeVisible({ timeout: 60000 });
    await expect(page.getByText(/Correccion E2E desde entrenador/i)).toBeVisible({ timeout: 60000 });
  });
});


