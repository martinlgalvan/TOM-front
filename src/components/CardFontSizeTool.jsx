import React from 'react';
import { CARD_FONT_STEPS } from '../helpers/cardFontScale.js';

/* Elegir el tamano de letra de las cards. La muestra de abajo usa las mismas
   clases que la card real, asi que lo que se ve aca es exactamente lo que se
   va a ver en la rutina. */
function CardFontSizeTool({ value, onChange, isDark }) {
  return (
    <div className={`cardFontTool ${isDark ? 'cardFontTool-dark' : ''}`}>
      <p className="cardFontToolHint">
        Ajusta el tamaño del texto de los ejercicios. Se guarda en este dispositivo.
      </p>

      <div className="cardFontToolSteps" role="radiogroup" aria-label="Tamaño de letra">
        {CARD_FONT_STEPS.map((paso) => {
          const activo = Math.abs(paso.value - value) < 0.001;
          return (
            <button
              key={paso.value}
              type="button"
              role="radio"
              aria-checked={activo}
              className={`cardFontToolStep ${activo ? 'cardFontToolStep-active' : ''}`}
              onClick={() => onChange(paso.value)}
            >
              <span className="cardFontToolStepA" style={{ fontSize: `${1.15 * paso.value}rem` }}>A</span>
              <span className="cardFontToolStepLabel">{paso.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`ddp ${isDark ? 'ddp-dark' : 'ddp-light'} cardFontToolPreview`}>
        <span className="cardFontToolPreviewLabel">Vista previa</span>
        <div className="ddp-card cardFontToolCard">
          <p className="stylesNameExercise mb-2">Sentadilla con barra</p>
          <div className="athleteMetrics">
            <div className="athleteMetric">
              <span className="athleteMetricLabel">Series y reps</span>
              <span className="athleteMetricValue">
                3<span className="athleteMetricPor">&times;</span>8
              </span>
            </div>
            <div className="athleteMetric">
              <span className="athleteMetricLabel">Peso</span>
              <span className="athleteMetricValue">80kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardFontSizeTool;
