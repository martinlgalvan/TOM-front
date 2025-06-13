import React, { useState, useEffect } from 'react';
import { SelectButton } from 'primereact/selectbutton';

const PercentageCalculator = () => {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [barra, setBarra] = useState(20);
  const [result, setResult] = useState(null);
  const [modoCompetencia, setModoCompetencia] = useState(false);

  useEffect(() => {
    const val = parseFloat(value);
    const perc = parseFloat(percentage);
    if (val && perc) {
      const res = (val * perc) / 100;
      setResult(res);
    } else if (val && !perc) {
      setResult(0);
    } else {
      setResult(null);
    }
  }, [value, percentage]);

  const generatePlateLoading = (weightPerSide) => {
    const plateSizes = modoCompetencia
      ? [25, 20, 15, 10, 5, 2.5, 1.25]
      : [20, 15, 10, 5, 2.5, 1.25];

    const plateMap = new Map();

    for (let plate of plateSizes) {
      while (weightPerSide >= plate - 0.001) {
        plateMap.set(plate, (plateMap.get(plate) || 0) + 1);
        weightPerSide -= plate;
      }
    }

    return Array.from(plateMap.entries())
      .sort((a, b) => a[0] - b[0])
      .flatMap(([plate, count]) => Array(count).fill(plate));
  };

  const val = parseFloat(value) || 0;
  const perc = parseFloat(percentage) || 0;
  const bar = parseFloat(barra) || 0;
  const topes = modoCompetencia ? 5 : 0;

  const workingWeight = val - (val * perc / 100);
  const plateWeight = Math.max(workingWeight - bar - topes, 0);
  const weightPerSide = plateWeight / 2;
  const renderedWeight = generatePlateLoading(weightPerSide).reduce((acc, curr) => acc + curr, 0);

  const sideWeight = () => renderedWeight;

  const modeOptions = [
    { label: 'Competencia', value: true },
    { label: 'Normal', value: false }
  ];

  return (
    <div className="calc-container">

      <div className="card-dark row justify-content-center">
        <div className='col-6'>
          <label className="label">Peso</label>
        
          <input
            type="number"
            className="input-dark"
            placeholder="Ej: 100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
           
        </div>
        <div className='col-6'>
          <label className="label">Barra</label>
          <input
            type="number"
            className="input-dark"
            placeholder="Ej: 20"
            value={barra}
            onChange={(e) => setBarra(e.target.value)}
          />
        </div>
      </div>

      <div className="card-dark">
        <label className="label">Porcentaje</label>
        <div className="percentage-buttons text-center ">
          {[10, 15, 20, 25].map((p) => (
            <button
              key={p}
              className={`perc-btn  ${percentage == p ? 'active' : ''}`}
              onClick={() => setPercentage(p)}
            >
              {p}%
            </button>
          ))}
        </div>
        <input
          type="number"
          className="input-dark mt-2"
          placeholder="%"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />
      </div>

      {result !== null ? (
        <div className="result-card">
          <strong>Tu levantamiento es con</strong>
          <div className="big-result">{(value - result)} kg</div>
          {percentage > 0 && <p className="small-text m-0">el <b>{percentage || 0}%</b> de <b>{value} kg</b> es <b>{result} kg</b></p>}
        </div>
      ) : (
        <div>
        <p className="text-light text-center mt-4">Ingresá los valores para calcular el peso.</p>

        </div>
      )}

      {result !== null && weightPerSide > 0 && (
        <>
          <div className="card flex justify-content-center mt-2 bg-transparent">
            <SelectButton 
              value={modoCompetencia} 
              className='d-flex mx-2 gap-2 stylesCalculator'
              options={modeOptions} 
              onChange={(e) => setModoCompetencia(e.value)} 
              optionLabel="label"
              optionValue="value"
              allowEmpty={false}
            />
          </div>
          <p className="side-text">
            <strong className='d-block text-light small text-center'>Por lado: {sideWeight()} kg  {modoCompetencia && '+ tope de 2.5kg'} </strong>
          </p>
          <div className="bar-simulation mt-4">
            <div className="plates-container">
              {generatePlateLoading(weightPerSide).map((plate, index) => (
                <div key={`left-${index}`} className={`plate plate-${plate.toString().replace('.', '_')}`} title={`${plate} kg`}>
                  {plate}
                </div>
              ))}
              {modoCompetencia && (
                <div className="tope" title="Tope 2.5 kg">2.5</div>
              )}
            </div>
            <div className="bar-line" />
          </div>
        </>
      )}
    </div>
  );
};

export default PercentageCalculator;
