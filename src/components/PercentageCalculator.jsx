import React, { useState, useEffect } from 'react';

const PercentageCalculator = () => {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
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

  return (
    <div>
      <div className="input-group text-center mb-3">
        <span className="form-control largoAddon text-center" id="basic-addon1">KG</span>
        <input
          type="text"
          className="input-group-text"
          placeholder="Kilos"
          aria-label="Kilos"
          aria-describedby="basic-addon1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
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

      <p className='text-center'>El {percentage} % de {value}kg es : <b>{result}</b></p>
    </div>
  );
};

export default PercentageCalculator;
