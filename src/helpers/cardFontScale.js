/* Tamano de letra de las cards del alumno.
   Toda la tipografia de la card se mide contra una sola base (--ddp-card-fs).
   Aca vive el factor que la multiplica, para que la persona pueda agrandarla o
   achicarla desde Herramientas sin que se desarme la jerarquia: al ser un
   factor unico, todo sube o baja en la misma proporcion. */

const CLAVE = 'athleteCardFontScale';
const POR_DEFECTO = 1;

export const CARD_FONT_STEPS = [
  { label: 'Chica', value: 0.92 },
  { label: 'Normal', value: 1 },
  { label: 'Grande', value: 1.12 },
  { label: 'Muy grande', value: 1.28 },
];

const esValido = (v) =>
  Number.isFinite(v) && CARD_FONT_STEPS.some((p) => Math.abs(p.value - v) < 0.001);

export function readCardFontScale() {
  try {
    const guardado = parseFloat(localStorage.getItem(CLAVE));
    return esValido(guardado) ? guardado : POR_DEFECTO;
  } catch {
    return POR_DEFECTO;
  }
}

export function applyCardFontScale(valor) {
  const v = esValido(valor) ? valor : POR_DEFECTO;
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--ddp-card-scale', String(v));
  }
  try {
    localStorage.setItem(CLAVE, String(v));
  } catch {
    /* Modo privado o almacenamiento bloqueado: la eleccion vale para esta
       sesion y no se guarda. No hay nada que avisar. */
  }
  return v;
}
