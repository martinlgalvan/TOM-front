import React, { useState, useEffect } from 'react';
import { SelectButton } from 'primereact/selectbutton';
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

    // Determine default mode based on initialValue
    const defaultMode = Array.isArray(initialValue)
      ? 'multiple'
      : typeof initialValue === 'string'
      ? 'text'
      : null;
    const [mode, setMode] = useState(defaultMode);

    // Text mode state
    const [textValue, setTextValue] = useState(
      typeof initialValue === 'string' ? initialValue : ''
    );
    // Numeric mode state
    const [value, setValue] = useState(
      typeof initialValue === 'number' ? initialValue : 0
    );
    // Multiple mode state
    const [repsList, setRepsList] = useState(
      Array.isArray(initialValue)
        ? initialValue.map(v => ({ reps: v }))
        : [{ reps: typeof initialValue === 'number' ? initialValue : 0 }]
    );

    // Sync when initialValue or mode changes
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
      const newList = [...repsList, { reps: 0 }];
      setRepsList(newList);
      onChange && onChange(newList.map(o => o.reps));
    };
    const handleRemoveLast = () => {
      if (repsList.length <= 1) return;
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

    const handleModeToggle = e => {
      const newMode = e.value;
      setMode(prev => (prev === newMode ? null : newMode));
      onActivate && onActivate(true);
      // notify parent of new mode's value
      if (newMode === 'text') {
        onChange && onChange(textValue);
      } else if (newMode === 'multiple') {
        onChange && onChange(repsList.map(o => o.reps));
      } else {
        onChange && onChange(value);
      }
    };

    return (
      <>
        <div
          className={`row justify-content-center text-center align-middle align-center ${
            isRep && !isNotNeedProp && firstWidth < 992 && 'mb-2'
          } ${isRep && firstWidth > 992 && 'mt-4'}`}
        >
          

          {/* Renderizado según modo */}
          {mode === 'text' ? (
            <div className="largoTextMode">
              <input
                ref={ref}
                type="text"
                value={textValue}
                onChange={e => handleTextChange(e.target.value)}
                disabled={disabled}
                className="form-control rounded-2 py-2 inp  text-center inputFontSize"
              />
            </div>
          ) : mode === 'multiple' ? (
            <div className="row justify-content-center py-1 px-0  rounded text-center">
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
                className='col-1 text-end'
              >
                <AddIcon className='fontAddIconMultiple' />
              </IconButton>
              {repsList.length > 1 && (
                <IconButton
                  onClick={handleRemoveLast}
                  className='col-1 ms-2 text-end'
                  disabled={disabled}
                  size="small"
                >
                  <RemoveIcon className='fontAddIconMultiple' />
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
          {isRep && (
            <div
              className={`text-center mt-1 px-0`}
            >
              <SelectButton
                className={`styleSelectButton px-0 `}
                value={mode}
                onChange={handleModeToggle}
                options={[
                  { label: 'Texto', value: 'text' },
                  { label: 'Múltiple', value: 'multiple' }
                ]}
              />
            </div>
          )}
        </div>
      </>
    );
  }
);

export default CustomInputNumber;