import React, { useState, useEffect } from 'react';
import { SelectButton } from 'primereact/selectbutton';

const PercentageCalculator = () => {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [barra, setBarra] = useState(20);
  const [modoCompetencia, setModoCompetencia] = useState(false);
  const [modoCalculo, setModoCalculo] = useState('directo');

  const val = parseFloat(value) || 0;
  const perc = parseFloat(percentage) || 0;
  const bar = parseFloat(barra) || 0;
  const topes = modoCompetencia ? 5 : 0;

  let workingWeight = 0;
  if (modoCalculo === 'restar') {
    workingWeight = val - (val * perc / 100);
  } else {
    workingWeight = (val * perc) / 100;
  }

  const effectiveWeight = modoCalculo === 'restar' ? workingWeight : val - workingWeight;
  const plateWeight = Math.max(effectiveWeight - bar - topes, 0);
  const weightPerSide = plateWeight / 2;

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

  const plateArray = generatePlateLoading(weightPerSide);
  const renderedWeight = plateArray.reduce((acc, curr) => acc + curr, 0);

  const modeOptions = [
    { label: 'Competencia', value: true },
    { label: 'Normal', value: false }
  ];

  const calcModeOptions = [
    { label: 'Usar % del peso', value: 'directo' },
    { label: 'Restar % al peso', value: 'restar' }
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

      <div className="card-dark mt-2">
        <label className="label">Modo de cálculo</label>
        <div className="card flex justify-content-center mt-2 bg-transparent">
        <SelectButton
          value={modoCalculo}
          options={calcModeOptions}
          className='d-flex mx-2 gap-2 stylesCalculator'
          onChange={(e) => setModoCalculo(e.value)}
          allowEmpty={false}
        />
        </div>
      </div>

      {val && perc ? (
        <div className="result-card">
          <p className="small-text m-0">
            {modoCalculo === 'restar'
              ? <span>El <strong>{percentage}%</strong> de <strong>{value} kg</strong> se <strong>descuenta</strong>, dando </span>
              : <span>El <strong>{percentage}%</strong> de <strong>{value} kg</strong> es </span>
              }
          </p>

          <div className="big-result">{workingWeight} kg</div>
            {modoCalculo === 'restar'
              ? <span>Por lo tanto, en la barra, debes tener <strong>{val - workingWeight}kg</strong></span>
              : <span>Por lo tanto, debés sacar <strong>{val - workingWeight}kg</strong> </span>
              }

        </div>
      ) : (
        <p className="text-light text-center mt-4">Ingresá los valores para calcular el peso.</p>
      )}

      {val && perc && weightPerSide > 0 && (
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
            <strong className='d-block text-light small text-center'>Por lado: {renderedWeight} kg {modoCompetencia && '+ tope de 2.5kg'} </strong>
          </p>
          <div className="bar-simulation mt-4">
            <div className="plates-container">
              {plateArray.map((plate, index) => (
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
