const NUMBER_WORDS = {
  cero: 0,
  uno: 1,
  una: 1,
  un: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
};

const NUMBER_TOKEN = String.raw`(?:\d+(?:[.,]\d+)?|[a-záéíóúüñ]+)`;

const normalizeText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

function parseNumber(value) {
  const token = normalizeText(value);
  if (/^\d+(?:[.,]\d+)?$/.test(token)) return Number(token.replace(',', '.'));
  return NUMBER_WORDS[token] ?? null;
}

function parseRest(value, unit) {
  const amount = parseNumber(value);
  if (amount == null) return null;
  return unit.startsWith('seg') || unit === 's'
    ? Math.round(amount)
    : Math.round(amount * 60);
}

function formatRest(seconds) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;
}

function cleanExerciseName(value) {
  return String(value ?? '')
    .replace(/^(?:agregar|añadir|anadir|crear)\s+/i, '')
    .replace(/^ejercicio\s*:?\s+/i, '')
    .replace(/[.,:;\-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Interpreta el formato controlado para crear un ejercicio simple.
 * No usa IA: devuelve un borrador que la UI debe confirmar antes de insertar.
 */
export function parseExerciseCommand(input) {
  const original = String(input ?? '').trim();
  if (!original) return { ok: false, errors: ['Escribí una instrucción para crear el ejercicio.'] };

  let working = original;
  let sets = null;
  let reps = null;
  let weight = '';
  let rest = '';
  const errors = [];
  const consumed = [];

  const mark = (match) => {
    if (match?.index != null) consumed.push([match.index, match.index + match[0].length]);
  };

  const xMatch = working.match(new RegExp(String.raw`\b${NUMBER_TOKEN}\s*[xX]\s*${NUMBER_TOKEN}\b`, 'i'));
  if (xMatch) {
    const [setToken, repToken] = xMatch[0].split(/[xX]/i).map((token) => token.trim());
    sets = parseNumber(setToken);
    reps = parseNumber(repToken);
    mark(xMatch);
  }

  const setsMatch = working.match(new RegExp(String.raw`\b(${NUMBER_TOKEN})\s*(?:series?|sets?)\b`, 'i'))
    || working.match(new RegExp(String.raw`\b(?:series?|sets?)\s*:\s*(${NUMBER_TOKEN})\b`, 'i'));
  if (setsMatch) {
    sets = parseNumber(setsMatch[1]);
    mark(setsMatch);
  }

  const repsMatch = working.match(new RegExp(String.raw`\b(${NUMBER_TOKEN})\s*(?:reps?|repeticiones?)\b`, 'i'))
    || working.match(new RegExp(String.raw`\b(?:reps?|repeticiones?)\s*:\s*(${NUMBER_TOKEN})\b`, 'i'));
  if (repsMatch) {
    reps = parseNumber(repsMatch[1]);
    mark(repsMatch);
  }

  const weightMatch = working.match(new RegExp(String.raw`(?:\b(?:peso)\s*:\s*)?(?:\b(?:a|con|por)\s*)?(${NUMBER_TOKEN})\s*(kg|kilos?|kilogramos?|lb|libras?|%)(?!\w)`, 'i'));
  if (weightMatch) {
    const value = parseNumber(weightMatch[1]);
    const unit = normalizeText(weightMatch[2]);
    if (value != null) {
      const normalizedUnit = unit.startsWith('lb') || unit.startsWith('libra') ? 'lb' : unit === '%' ? '%' : 'kg';
      weight = `${value % 1 === 0 ? value : value.toFixed(2)} ${normalizedUnit}`;
      mark(weightMatch);
    }
  }

  const restMatch = working.match(new RegExp(String.raw`(?:descanso\s*:?\s*)?(${NUMBER_TOKEN})\s*(minutos?|mins?|segundos?|secs?|s)\s*(?:de\s*)?descanso?`, 'i'))
    || working.match(new RegExp(String.raw`descanso\s*:?\s*(?:de\s*)?(${NUMBER_TOKEN})\s*(minutos?|mins?|segundos?|secs?|s)?`, 'i'));
  if (restMatch) {
    const unit = normalizeText(restMatch[2] || 'minutos');
    const seconds = parseRest(restMatch[1], unit);
    if (seconds != null) {
      rest = formatRest(seconds);
      mark(restMatch);
    }
  }

  let name = working;
  consumed
    .sort((a, b) => b[0] - a[0])
    .forEach(([start, end]) => { name = `${name.slice(0, start)} ${name.slice(end)}`; });
  name = cleanExerciseName(name)
    .replace(/\b(?:y|con|a|por|de)\b/gi, ' ')
    .replace(/[.,:;\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!name) errors.push('Falta el nombre del ejercicio.');
  if (!Number.isFinite(sets) || sets <= 0) errors.push('Indicá las series, por ejemplo: 3 series.');
  if (!Number.isFinite(reps) || reps <= 0) errors.push('Indicá las repeticiones, por ejemplo: 4 repeticiones.');

  return {
    ok: errors.length === 0,
    errors,
    data: errors.length === 0 ? { name, sets, reps, peso: weight, rest } : null,
  };
}

export const EXERCISE_COMMAND_EXAMPLES = [
  'Sentadilla al cajón, 3 series por 4 repeticiones, 200 kg y 3 minutos de descanso.',
  'Press banca 4x6, 100 kg, descanso 2 minutos.',
  'Ejercicio: remo con barra. Series: 3. Reps: 8. Peso: 70 kg. Descanso: 90 segundos.',
];
