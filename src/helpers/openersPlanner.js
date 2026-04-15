import { generateUUID } from "./generateUUID.js";

export const OPENERS_LIFTS = [
  { key: "squat", label: "Sentadilla" },
  { key: "bench", label: "Banco" },
  { key: "deadlift", label: "Peso muerto" },
];

export const OPENERS_ATTEMPTS = [
  { key: "open", label: "Open" },
  { key: "second", label: "2do" },
  { key: "third", label: "3ro" },
];

export const OPENERS_EQUIPMENT_OPTIONS = [
  { value: "eq_none", label: "Sin equipamiento" },
  { value: "eq_knee_sleeves", label: "Rodilleras" },
  { value: "eq_knee_sleeves_belt", label: "Rodilleras + cinturon" },
  { value: "eq_wraps", label: "Vendas" },
  { value: "eq_wraps_belt", label: "Vendas + cinturon" },
];

const VALID_EQUIPMENT_VALUES = new Set(
  OPENERS_EQUIPMENT_OPTIONS.map((item) => item.value)
);

const LEGACY_EQUIPMENT_MAP = {
  planned: "eq_none",
  done: "eq_none",
  miss: "eq_none",
  skip: "eq_none",
};

const safeText = (value, maxLen = 500) => {
  if (value == null) return "";
  const out = String(value);
  return out.length > maxLen ? out.slice(0, maxLen) : out;
};

const normalizeDateOnly = (value) => {
  if (!value) return "";
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const normalizeAttempt = (node = {}) => {
  const resultRaw = String(node?.result ?? "").trim().toLowerCase();
  const mappedLegacy = LEGACY_EQUIPMENT_MAP[resultRaw];
  const normalizedResult = mappedLegacy || resultRaw;
  const validResult = VALID_EQUIPMENT_VALUES.has(normalizedResult)
    ? normalizedResult
    : "eq_none";
  return {
    weight: safeText(node?.weight, 60),
    result: validResult,
    note: safeText(node?.note, 500),
  };
};

const normalizeLift = (node = {}) => ({
  open: normalizeAttempt(node?.open),
  second: normalizeAttempt(node?.second),
  third: normalizeAttempt(node?.third),
  notes: safeText(node?.notes, 1000),
});

export function normalizeOpenersPlan(plan = {}) {
  const now = new Date().toISOString();
  return {
    id: safeText(plan?.id || plan?._id, 80) || generateUUID(),
    meetName: safeText(plan?.meetName, 160),
    meetDate: normalizeDateOnly(plan?.meetDate),
    notes: safeText(plan?.notes, 2000),
    lifts: {
      squat: normalizeLift(plan?.lifts?.squat),
      bench: normalizeLift(plan?.lifts?.bench),
      deadlift: normalizeLift(plan?.lifts?.deadlift),
    },
    source_template_id: safeText(plan?.source_template_id, 80),
    source_template_name: safeText(plan?.source_template_name, 160),
    created_at: plan?.created_at || now,
    updated_at: plan?.updated_at || now,
  };
}

const planSortTimestamp = (plan) => {
  const meet = plan?.meetDate ? Date.parse(plan.meetDate) : 0;
  if (Number.isFinite(meet) && meet > 0) return meet;
  const created = plan?.created_at ? Date.parse(plan.created_at) : 0;
  return Number.isFinite(created) ? created : 0;
};

export function normalizeOpenersPlans(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => normalizeOpenersPlan(item))
    .sort((a, b) => planSortTimestamp(b) - planSortTimestamp(a));
}

export function createEmptyOpenersPlan(overrides = {}) {
  const now = new Date().toISOString();
  return normalizeOpenersPlan({
    id: generateUUID(),
    meetName: "",
    meetDate: "",
    notes: "",
    lifts: {
      squat: {},
      bench: {},
      deadlift: {},
    },
    created_at: now,
    updated_at: now,
    ...overrides,
  });
}

export function normalizeOpenersTemplate(template = {}) {
  const now = new Date().toISOString();
  const basePlan =
    template?.basePlan && typeof template.basePlan === "object"
      ? template.basePlan
      : template?.plan && typeof template.plan === "object"
      ? template.plan
      : {};

  return {
    id: safeText(template?.id || template?._id, 80) || generateUUID(),
    name: safeText(template?.name || template?.templateName, 160),
    description: safeText(template?.description, 600),
    basePlan: normalizeOpenersPlan(basePlan),
    created_at: template?.created_at || now,
    updated_at: template?.updated_at || now,
  };
}

export function normalizeOpenersTemplates(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => normalizeOpenersTemplate(item))
    .sort((a, b) => Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0));
}

export function createEmptyOpenersTemplate(overrides = {}) {
  const now = new Date().toISOString();
  return normalizeOpenersTemplate({
    id: generateUUID(),
    name: "",
    description: "",
    basePlan: createEmptyOpenersPlan(),
    created_at: now,
    updated_at: now,
    ...overrides,
  });
}

export function clonePlanForAssignment(plan, template = null) {
  const now = new Date().toISOString();
  const normalized = normalizeOpenersPlan(plan);
  return normalizeOpenersPlan({
    ...normalized,
    id: generateUUID(),
    source_template_id: template ? safeText(template.id, 80) : "",
    source_template_name: template ? safeText(template.name, 160) : "",
    created_at: now,
    updated_at: now,
  });
}

export function resolveTargetUserIds(users = [], targetCategories = [], targetUsers = []) {
  const usersByCategory = Array.isArray(users)
    ? users
        .filter((u) => targetCategories.includes(u?.category))
        .map((u) => String(u?._id))
    : [];
  const explicitUsers = Array.isArray(targetUsers) ? targetUsers.map(String) : [];
  return Array.from(new Set([...usersByCategory, ...explicitUsers].filter(Boolean)));
}
