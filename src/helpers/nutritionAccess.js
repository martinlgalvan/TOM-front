const NUTRITION_TESTER_IDS = new Set([
  '63e7f02b3649482a65953d5c',
  '68b720931a6600c8359c6cf3',
]);

const NUTRITION_TESTER_EMAILS = new Set([
  'camibeneitez.fitness@gmail.com',
]);

export function canAccessNutrition({ id, email, role } = {}) {
  if (role !== 'admin') return false;

  const normalizedId = String(id || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  return NUTRITION_TESTER_IDS.has(normalizedId) || NUTRITION_TESTER_EMAILS.has(normalizedEmail);
}

const COMPETITIONS_TESTER_IDS = new Set([
  '63e7f02b3649482a65953d5c',
]);

export function canAccessCompetitions({ id, role } = {}) {
  if (role !== 'admin') return false;

  const normalizedId = String(id || '').trim();
  return COMPETITIONS_TESTER_IDS.has(normalizedId);
}
