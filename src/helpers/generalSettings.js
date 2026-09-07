const DEFAULT_FONT_SIZE = 'normal';
const VALID_FONT_SIZES = new Set(['small', 'normal', 'large']);

const storageKey = (trainerId) => `tomSettings:${trainerId || 'guest'}:general`;

export function getGeneralSettings(trainerId) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(trainerId)) || '{}');
    return {
      fontSize: VALID_FONT_SIZES.has(stored.fontSize) ? stored.fontSize : DEFAULT_FONT_SIZE,
    };
  } catch {
    return { fontSize: DEFAULT_FONT_SIZE };
  }
}

export function applyFontSize(fontSize) {
  const value = VALID_FONT_SIZES.has(fontSize) ? fontSize : DEFAULT_FONT_SIZE;
  document.documentElement.dataset.tomFontSize = value;
}

export function applyStoredGeneralSettings(trainerId) {
  const settings = getGeneralSettings(trainerId);
  applyFontSize(settings.fontSize);
  return settings;
}

export function saveGeneralSettings(trainerId, settings) {
  const next = {
    fontSize: VALID_FONT_SIZES.has(settings?.fontSize) ? settings.fontSize : DEFAULT_FONT_SIZE,
  };
  localStorage.setItem(storageKey(trainerId), JSON.stringify(next));
  applyFontSize(next.fontSize);
  return next;
}
