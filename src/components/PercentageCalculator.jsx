import React, { useState, useEffect } from 'react';

const PercentageCalculator = () => {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [barra, setBarra] = useState(20);
  const [result, setResult] = useState(null);

  // UseEffect para hacer la cuenta dinámica
  useEffect(() => {
    if (value && percentage) {
      const result = (value * percentage / 100);
      setResult(result);
    } else {
      setResult(null); // Si no hay valores, no mostrar resultado
    }
  }, [value, percentage]); // Se ejecuta cada vez que 'value' o 'percentage' cambian

    const sideWeight = () => {
    const barraKg = parseFloat(barra) || 0;
    const val = parseFloat(value) || 0;
    return ((val - result - barraKg) / 2);
  };

  return (
    <div>

      <div className="input-group text-center mb-3">
        <span className="form-control largoAddon text-center" id="basic-addon1"> Barra </span>
        <input
          type="text"
          className="input-group-text"
          placeholder="Porcentaje"
          aria-label="Porcentaje"
          aria-describedby="basic-addon1"
          value={barra}
          onChange={(e) => setBarra(e.target.value)}
        />
        <span className="form-control  text-center" id="basic-addon1"> KG </span>
      </div>

      <div className="input-group text-center mb-3">
        <span className="form-control largoAddon text-center" id="basic-addon1">Peso</span>
        <input
          type="text"
          className="input-group-text"
          placeholder="Kilos"
          aria-label="Kilos"
          aria-describedby="basic-addon1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
          <span className="form-control  text-center" id="basic-addon1"> KG </span>
      </div>

      <div className="input-group text-center mb-3">
        <span className="form-control largoAddon text-center" id="basic-addon1"> % </span>
        <input
          type="text"
          className="input-group-text"
          placeholder="Porcentaje"
          aria-label="Porcentaje"
          aria-describedby="basic-addon1"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />
      </div>

 {result !== null && (
        <div className="text-center">
          <p>
            El <span className="badge bg-primary">{percentage}%</span> de <span className="badge bg-secondary">{value}kg</span> es
            <span className="badge bg-success my-2 ms-1">{result}kg</span>
          </p>

          <p>
            El total es <span className="badge bg-warning text-dark">{(value - result)}kg</span>.
          </p>

          <p>
            Por lado: <span className="badge bg-danger">{sideWeight()}kg</span> (suponiendo que la barra es de <span className='badge bg-secondary'>{barra}kg</span>)
          </p>
        </div>
      )}

      {result === null && (
        <p className="text-muted text-center mt-3">Ingresá los valores para ver los resultados.</p>
      )}
    </div>
  );
};

export default PercentageCalculator;
