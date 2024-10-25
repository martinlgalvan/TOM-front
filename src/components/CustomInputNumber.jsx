import React, { useState, useEffect } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import IconButton from '@mui/material/IconButton';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CustomInputNumber = React.forwardRef(
  ({ initialValue, onChange, disabled, isRep }, ref) => {
    const hasNonNumber = !/^\d+$/.test(String(initialValue));
    const [value, setValue] = useState(initialValue);
    const [isTextMode, setIsTextMode] = useState(hasNonNumber);
    const [firstWidth, setFirstWidth] = useState();

    useEffect(() => {
      setFirstWidth(window.innerWidth)

      if (isTextMode && initialValue !== value) {
        setValue(initialValue);
      }
    }, [initialValue, isTextMode]);

    const handleInputChange = (newValue) => {
      if (!disabled) {
        if (!isTextMode) {
          newValue = parseInt(newValue, 10) || 0;
        }
        setValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (!disabled && !isTextMode) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          handleInputChange(value + 1);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          if (value > 0) {
            handleInputChange(value - 1);
          }
        }
      }
    };

    const handleSelectChange = (e) => {
      setIsTextMode(e.value === 'text');
      setValue('');  // Reset value when switching modes
    };

    return (
      <>
      <div className={`row justify-content-center text-center aa ${isRep && firstWidth > 992 && ''} ${isRep && 'mb-2'}`}>
          <div className="input-number-container">

              <IconButton               
              className={`buttonRight ${isTextMode && 'd-none'}`}
              onClick={() => handleInputChange(value - 1)}
              disabled={disabled || isTextMode}>
                  <ChevronLeftIcon  />
              </IconButton>

            <input
              type={isTextMode ? 'text' : 'number'}
              value={value}
              onChange={(e) => {
                handleInputChange(e.target.value);
              }}
              disabled={disabled}
              onKeyDown={handleKeyDown}
              className={`form-control rounded-0 inp text-center inputFontSize ${isTextMode && 'w-100'}`}
              ref={ref}
            />

              <IconButton               
              className={`buttonLeft ${isTextMode && 'd-none'}`}
              onClick={() => handleInputChange(value + 1)}
              disabled={disabled || isTextMode}>
                  <ChevronRightIcon  />
              </IconButton>

          </div>
        </div>

              {isRep && (
                <div className='styleSelectButton text-center'>
                  <SelectButton
                    className='styleSelectButton '
                    value={isTextMode ? 'text' : 'number'}
                    onChange={handleSelectChange}
                    options={[
                      { label: 'Modo texto', value: 'text' }
                    ]}
                  />
                </div>
              )}
              </>
    );
  }
  
);

export default CustomInputNumber;
