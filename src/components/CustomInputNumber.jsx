import { Pyramid } from 'lucide-react';
import React, { useState, useEffect } from 'react';
// Eliminado: import { SelectButton } from 'primereact/selectbutton';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CustomInputNumber = React.forwardRef(
  (
    // allowMultiple: los bloques de activacion/movilidad y entrada en calor no
    // usan series piramidales, solo texto/numerico. Va como prop propia y no
    // reusando isRep porque isRep tambien decide margenes y layout de reps.
    { initialValue, onChange, disabled, isRep, onActivate, currentDay, isNotNeedProp, allowMultiple = true },
    ref
  ) => {
    const [firstWidth, setFirstWidth] = useState(window.innerWidth);
    useEffect(() => {
      const handleResize = () => setFirstWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 🔧 NUEVO: funcion helper para soltar el foco actual (el que puede estar "anclado" arriba)
    const blurActiveElement = () => {
      if (
        typeof document !== 'undefined' &&
        document.activeElement instanceof HTMLElement
      ) {
        document.activeElement.blur();
      }
    };

    // Default mode:
    // - Reps: 'multiple' si array, 'text' si string, si no null (numerico)
    // - Sets: 'text' si string, si no null (numerico). Nunca 'multiple' en sets.
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

    // Sincronizacion al cambiar initialValue o mode
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

    // 🔧 CAMBIO: anadimos segundo parametro opcional { blurActive }
    const handleSingleChange = (newVal, { blurActive } = {}) => {
      if (disabled) return;

      // 🔧 NUEVO: si viene desde botones + / -, soltamos el foco previo
      if (blurActive) {
        blurActiveElement();
      }

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
      // 🔧 NUEVO: si sumas una rep en modo Multiple, tambien soltamos foco del input anterior
      blurActiveElement();

      const newList = [...repsList, { reps: 0 }];
      setRepsList(newList);
      onChange && onChange(newList.map(o => o.reps));
    };

    const handleRemoveLast = () => {
      if (disabled || repsList.length <= 1) return;
      // 🔧 NUEVO: idem, soltamos foco antes de modificar
      blurActiveElement();

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
      // Defensa: 'multiple' solo donde corresponde (reps y con la piramide habilitada)
      if ((!isRep || !allowMultiple) && nextMode === 'multiple') nextMode = 'text';

      // Si clickean el modo activo, volvemos a null (numerico)
      const finalMode = (mode === nextMode) ? null : nextMode;
      setMode(finalMode);
      onActivate && onActivate(true);

      if (finalMode === 'text') {
        onChange && onChange(textValue);
      } else if (finalMode === 'multiple') {
        onChange && onChange(repsList.map(o => o.reps));
      } else {
        onChange && onChange(value); // numerico
      }
    };

    // UI del selector (manual, chico y consistente)
    const ModeSelector = () => {
      return (isRep && allowMultiple) ? (
        <div className="seg customInputModeSelector customInputModeSelectorReps" role="group" aria-label="Modo reps">
          {/* Con la piramide activa escondemos "Texto" para darle ese ancho a
              las celdas. No se pierde la salida: tocar la piramide de nuevo
              vuelve al stepper numerico. */}
          {mode !== 'multiple' && (
          <button
            type="button"
            className={`seg-btn ${mode === 'text' ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => handleModeToggle('text')}
          >
            Texto
          </button>
          )}
          <button
            type="button"
            className={`seg-btn seg-btn-icon ${mode === 'multiple' ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => handleModeToggle('multiple')}
            title="Reps multiples (piramide)"
            aria-label="Reps multiples"
          >
            {/* El icono reemplaza la palabra "Multiple": ocupa mucho menos y le
                devuelve ancho al campo de sets/reps. El nombre sigue disponible
                para lectores de pantalla via aria-label. */}
            <Pyramid size={13} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="seg customInputModeSelector" role="group" aria-label="Modo sets">
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
          /* Ojo: `cond && 'clase'` mete la string "false" en el className
             cuando la condicion es falsa. Con ternario a '' no pasa. */
          className={`row customInputNumberRoot justify-content-center text-center align-middle mt-4 align-center ${
            isRep && !isNotNeedProp && firstWidth < 992 ? 'mb-2' : ''
          } ${isRep && firstWidth > 992 ? 'mt-4' : ''}`}
        >
          {/* Render segun modo */}
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
            <div className="customInputMultiple">
              {/* Serie piramidal: una fila de celdas angostas (2 caracteres) con
                  los botones + / - como una celda mas al final. Antes eran inputs
                  apilados a lo ancho, con width:20px y height:2px inline. */}
              {repsList.map((item, idx) => (
                <input
                  key={idx}
                  type="number"
                  inputMode="numeric"
                  value={item.reps}
                  onChange={e => handleRepChange(idx, e.target.value)}
                  disabled={disabled}
                  className="customInputMultipleCell"
                  aria-label={`Serie ${idx + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="input-number-container">
              <IconButton
                className="buttonRight"
                // 🔧 CAMBIO: pasamos { blurActive: true } para soltar foco del campo anterior
                onClick={() => handleSingleChange(value - 1, { blurActive: true })}
                disabled={disabled || value <= 0}
              >
                <RemoveIcon className="fontIconsButtonsInputNumber" />
              </IconButton>
              <input
                ref={ref}
                type="number"
                value={value}
                // 🔧 OJO: aqui NO pasamos blurActive, para no romper la experiencia al tipear
                onChange={e => handleSingleChange(e.target.value)}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                className="form-control rounded-0 fontInputCustomNumber text-center "
              />
              <IconButton
                className="buttonLeft"
                // 🔧 CAMBIO: idem, blurActive solo cuando usamos el boton +
                onClick={() => handleSingleChange(value + 1, { blurActive: true })}
                disabled={disabled}
              >
                <AddIcon className="fontIconsButtonsInputNumber" />
              </IconButton>
            </div>
          )}

          {/* Selector de modo manual, centrado */}
          <div className={`${!isRep ? 'w-100 d-flex justify-content-center' : 'text-center'} customInputModeSelectorWrap mt-1 px-0`}>
            {/* Los +/- viven al lado de la piramide, no dentro de la fila de
                celdas: con mas de 3 series la fila se quedaba sin lugar y los
                botones se caian a otro renglon. Aca ocupan un lugar fijo. */}
            {mode === 'multiple' && (
              <span className="customInputMultipleActions">
                <button
                  type="button"
                  onClick={handleAddRep}
                  disabled={disabled}
                  className="customInputMultipleBtn"
                  title="Agregar serie"
                  aria-label="Agregar serie"
                >
                  <AddIcon className="fontAddIconMultiple" />
                </button>
                {repsList.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRemoveLast}
                    disabled={disabled}
                    className="customInputMultipleBtn"
                    title="Quitar ultima serie"
                    aria-label="Quitar ultima serie"
                  >
                    <RemoveIcon className="fontAddIconMultiple" />
                  </button>
                )}
              </span>
            )}
            <ModeSelector />
          </div>
        </div>
      </>
    );
  }
);

export default CustomInputNumber;

