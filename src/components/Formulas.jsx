import { useState } from 'react';

const Formulas = () => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const parseInput = (val) => parseFloat(val.replace(',', '.')) || 0;

  const w = parseInput(weight);
  const r = parseInput(reps);

  const epley = w * (1 + r / 30);
  const brzycki = w * (36 / (37 - r));
  const lombardi = w * Math.pow(r, 0.10);
  const oconner = w * (1 + 0.025 * r);
  const lander = w / (1.013 - 0.0267123 * r);

  const isValid = w > 0 && r > 0 && r < 37;

  return (
    <div className="calc-container">
      <h2 className="title">
        🧮 <span className="highlight">1RM Estimado</span><br />
        <small className="subtitle">Fórmulas más utilizadas</small>
      </h2>

      <div className="card-dark">
        <label className="label">Peso levantado</label>
        <input
          type="number"
          className="input-dark"
          placeholder="Ej: 80"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      <div className="card-dark">
        <label className="label">Repeticiones</label>
        <input
          type="number"
          className="input-dark"
          placeholder="Ej: 5"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>

      {isValid ? (
        <div className="result-card">
          <h3>Resultados estimados</h3>
          <div className="result-grid">
            <div className="result-row">
              <span className="result-name">Epley</span>
              <span className="result-value">{epley.toFixed(1)} kg</span>
            </div>
            <div className="result-row">
              <span className="result-name">Brzycki</span>
              <span className="result-value">{brzycki.toFixed(1)} kg</span>
            </div>
            <div className="result-row">
              <span className="result-name">Lombardi</span>
              <span className="result-value">{lombardi.toFixed(1)} kg</span>
            </div>
            <div className="result-row">
              <span className="result-name">O'Conner</span>
              <span className="result-value">{oconner.toFixed(1)} kg</span>
            </div>
            <div className="result-row">
              <span className="result-name">Lander</span>
              <span className="result-value">{lander.toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-light text-center mt-4">Ingresá un peso y repeticiones válidas (1-36).</p>
      )}
    </div>
  );
};

export default Formulas;
