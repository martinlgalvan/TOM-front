import React, { useState, useEffect } from 'react';
// Eliminado: import { SelectButton } from 'primereact/selectbutton';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CustomInputNumber = React.forwardRef(
  (
    { initialValue, onChange, disabled, isRep, onActivate, currentDay, isNotNeedProp },
    ref
  ) => {
    const [firstWidth, setFirstWidth] = useState(window.innerWidth);
    useEffect(() => {
      const handleResize = () => setFirstWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Default mode:
    // - Reps: 'multiple' si array, 'text' si string, si no null (numérico)
    // - Sets: 'text' si string, si no null (numérico). Nunca 'multiple' en sets.
    const defaultMode = isRep
      ? (Array.isArray(initialValue) ? 'multiple'
        : (typeof initialValue === 'string' ? 'text' : null))
      : (typeof initialValue === 'string' ? 'text' : null);

    const [mode, setMode] = useState(defaultMode);

    // Estados por modo
    const [textValue, setTextValue] = useState(
      typeof initialValue === 'string' ? initialValue : ''
    );
    const [value, setValue] = useState(
      typeof initialValue === 'number' ? initialValue : 0
    );
    const [repsList, setRepsList] = useState(
      Array.isArray(initialValue)
        ? initialValue.map(v => ({ reps: v }))
        : [{ reps: typeof initialValue === 'number' ? initialValue : 0 }]
    );

    // Sincronización al cambiar initialValue o mode
    useEffect(() => {
      if (mode === 'text') {
        setTextValue(typeof initialValue === 'string' ? initialValue : '');
      }
      if (mode === 'multiple') {
        setRepsList(
          Array.isArray(initialValue)
            ? initialValue.map(v => ({ reps: v }))
            : [{ reps: typeof initialValue === 'number' ? initialValue : 0 }]
        );
      }
      if (mode === null) {
        setValue(typeof initialValue === 'number' ? initialValue : 0);
      }
    }, [initialValue, mode]);

    // Handlers
    const handleTextChange = raw => {
      if (disabled) return;
      setTextValue(raw);
      onChange && onChange(raw);
    };

    const handleSingleChange = newVal => {
      if (disabled) return;
      const n = parseInt(newVal, 10) || 0;
      setValue(n);
      onChange && onChange(n);
    };

    const handleKeyDown = e => {
      if (mode === null && !disabled) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleSingleChange(value + 1);
        } else if (e.key === 'ArrowDown' && value > 0) {
          e.preventDefault();
          handleSingleChange(value - 1);
        }
      }
    };

    const handleAddRep = () => {
      if (disabled) return;
      const newList = [...repsList, { reps: 0 }];
      setRepsList(newList);
      onChange && onChange(newList.map(o => o.reps));
    };

    const handleRemoveLast = () => {
      if (disabled || repsList.length <= 1) return;
      const newList = repsList.slice(0, -1);
      setRepsList(newList);
      onChange && onChange(newList.map(o => o.reps));
    };

    const handleRepChange = (index, raw) => {
      if (disabled) return;
      const n = parseInt(raw, 10) || 0;
      const newList = repsList.map((item, i) =>
        i === index ? { reps: n } : item
      );
      setRepsList(newList);
      onChange && onChange(newList.map(o => o.reps));
    };

    // Toggle universal para nuestro segmented manual
    const handleModeToggle = (nextMode) => {
      // Defensa sets: nunca permitir 'multiple'
      if (!isRep && nextMode === 'multiple') nextMode = 'text';

      // Si clickean el modo activo, volvemos a null (numérico)
      const finalMode = (mode === nextMode) ? null : nextMode;
      setMode(finalMode);
      onActivate && onActivate(true);

      if (finalMode === 'text') {
        onChange && onChange(textValue);
      } else if (finalMode === 'multiple') {
        onChange && onChange(repsList.map(o => o.reps));
      } else {
        onChange && onChange(value); // numérico
      }
    };

    // UI del selector (manual, chico y consistente)
    const ModeSelector = () => {
      return isRep ? (
        <div className="seg " role="group" aria-label="Modo reps">
          <button
            type="button"
            className={`seg-btn ${mode === 'text' ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => handleModeToggle('text')}
          >
            Texto
          </button>
          <button
            type="button"
            className={`seg-btn ${mode === 'multiple' ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => handleModeToggle('multiple')}
          >
            Múltiple
          </button>
        </div>
      ) : (
        <div className="seg" role="group" aria-label="Modo sets">
          <button
            type="button"
            className={`seg-btn ${mode === 'text' ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => handleModeToggle('text')}
          >
            Texto
          </button>
        </div>
      );
    };

    return (
      <>
        <div
          className={`row justify-content-center text-center align-middle mt-4 align-center ${
            isRep && !isNotNeedProp && firstWidth < 992 && 'mb-2'
          } ${isRep && firstWidth > 992 && 'mt-4'}`}
        >
          {/* Render según modo */}
          {mode === 'text' ? (
            <div className={`largoTextMode ${!isRep ? 'mx-auto' : ''}`}>
              <input
                ref={ref}
                type="text"
                value={textValue}
                onChange={e => handleTextChange(e.target.value)}
                disabled={disabled}
                className="form-control rounded-2 py-2 inp text-center inputFontSize"
              />
            </div>
          ) : mode === 'multiple' ? (
            <div className="row justify-content-center py-1 px-0 rounded text-center">
              {repsList.map((item, idx) => (
                <input
                  key={idx}
                  type="number"
                  value={item.reps}
                  onChange={e => handleRepChange(idx, e.target.value)}
                  disabled={disabled}
                  className="form-control form-control-sm text-center me-2"
                  style={{ width: '20px', height: '2px', margin: 'auto 0', fontSize: '0.8em', padding: '0 0px' }}
                />
              ))}
              <IconButton
                onClick={handleAddRep}
                disabled={disabled}
                size="small"
                className="col-1 text-end"
              >
                <AddIcon className="fontAddIconMultiple" />
              </IconButton>
              {repsList.length > 1 && (
                <IconButton
                  onClick={handleRemoveLast}
                  className="col-1 ms-2 text-end"
                  disabled={disabled}
                  size="small"
                >
                  <RemoveIcon className="fontAddIconMultiple" />
                </IconButton>
              )}
            </div>
          ) : (
            <div className="input-number-container">
              <IconButton
                className="buttonRight"
                onClick={() => handleSingleChange(value - 1)}
                disabled={disabled || value <= 0}
              >
                <RemoveIcon className="fontIconsButtonsInputNumber" />
              </IconButton>
              <input
                ref={ref}
                type="number"
                value={value}
                onChange={e => handleSingleChange(e.target.value)}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                className="form-control rounded-0 fontInputCustomNumber text-center "
              />
              <IconButton
                className="buttonLeft"
                onClick={() => handleSingleChange(value + 1)}
                disabled={disabled}
              >
                <AddIcon className="fontIconsButtonsInputNumber" />
              </IconButton>
            </div>
          )}

          {/* Selector de modo manual, centrado */}
          <div className={`${!isRep ? 'w-100 d-flex justify-content-center' : 'text-center'} mt-1 px-0`}>
            <ModeSelector />
          </div>
        </div>
      </>
    );
  }
);

export default CustomInputNumber;
