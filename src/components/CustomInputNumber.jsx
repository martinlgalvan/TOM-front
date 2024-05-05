import React, { useState, useRef } from 'react';
import { BsPlus, BsDash } from 'react-icons/bs';
import { SelectButton } from 'primereact/selectbutton';

const CustomInputNumber = React.forwardRef(
  ({ initialValue, onChange, onValueChange, disabled }, ref) => {
    const hasNonNumber = !/^\d+$/.test(String(initialValue));

    const [value, setValue] = useState(initialValue);
    const [isTextMode, setIsTextMode] = useState(hasNonNumber);
    const [textValue, setTextValue] = useState('');

    const handleInputChange = (newValue) => {
      if (!disabled) {
        if (!isTextMode) {
          newValue = parseInt(newValue, 10) || 0;
        }
        setValue(newValue);
        onChange(newValue);
        if (onValueChange) {
          onValueChange();
        }

      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleInputChange(value + 1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (value > 0) {
          handleInputChange(value - 1);
        }
      }
    };

    const handleSelectChange = (e) => {
      setIsTextMode(e.value === 'text');
    };

    return (
      <div className='row justify-content-center mx-2'>
        <div className='col-12 text-center m-0 p-0'>
          <div className="input-number-container">
            <button
              type="button"
              className='buttonLeft px-2'
              onClick={() => handleInputChange(value - 1)}
              disabled={disabled || isTextMode}
            >
              <BsDash size={'1.8em'} />
            </button>
            <input
              type={'text'}
              value={value}
              onChange={(e) => {
                if (isTextMode) {
                  handleInputChange(e.target.value);
                }
              }}
              readOnly={!isTextMode}
              disabled={disabled}
              onKeyDown={handleKeyDown}
              className="form-control rounded-0 inp text-center"
              ref={ref}
            />
            <button
              type="button"
              className="buttonRight px-2"
              onClick={() => handleInputChange(value + 1)}
              disabled={disabled || isTextMode}
            >
              <BsPlus size={'1.8em'} />
            </button>
          </div>
        </div>
        <div className='col-12 mt-2 p-0'>
              <SelectButton  className='styleSelectButton' value={isTextMode ? 'text' : 'number'} onChange={handleSelectChange} options={[
                { label: 'Texto', value: 'text' },
                { label: 'Número', value: 'number' }
              ]} />
            </div>

      </div>
    );
  }
);

export default CustomInputNumber;
