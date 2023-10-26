import React, { useState, useRef } from 'react';
import { BsPlus, BsDash } from 'react-icons/bs';

import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from 'primereact/tooltip';

const CustomInputNumber = React.forwardRef(
  ({ initialValue, onChange, onValueChange, disabled, isSet }, ref) => {
    const hasNonNumber = !/^\d+$/.test(String(initialValue));

    const [value, setValue] = useState(initialValue);
    const [isTextMode, setIsTextMode] = useState(hasNonNumber);
    const [originalValue, setOriginalValue] = useState(initialValue); // Guardar el valor original
    const [textValue, setTextValue] = useState(''); // Guardar el valor en modo de texto
    const [anchoPagina, setAnchoPagina] = useState(window.innerWidth);

    const handleInputChange = (newValue) => {
      if (!disabled) {
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

    const handleCheckboxChange = () => {
      if (isTextMode) {
        if (textValue !== '') {
          const numericValue = parseInt(textValue, 10);
          setValue(numericValue);
          onChange(numericValue);
          if (onValueChange) {
            onValueChange();
          }
        }
      } else {
        setTextValue(String(value)); // Guardar el valor en modo de texto antes de cambiar al modo numérico
      }
      setIsTextMode(!isTextMode);
    };

    return (
      <div className='row justify-content-center mx-2 '>
        <div className='col-12 text-center m-0 p-0 '>
          <div className="input-number-container ">
            <button
              type="button"
              className='buttonLeft px-2'
              onClick={() => handleInputChange(value - 1)}
              disabled={disabled || isTextMode} // Deshabilita el botón en modo de texto
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
              disabled={disabled || isTextMode} // Deshabilita el botón en modo de texto
            >
              <BsPlus size={'1.8em'} />
            </button>
          </div>
          
        </div>
        <div className='col-9 col-lg-6  m-0 p-0'>

            <div className={`row justify-content-center my-3 ${anchoPagina > 600 ? 'ms-2' : ''}`}>

                            <div className='col-12 col-sm-6 text-center p-0  fs-5'>
                                <InputSwitch checked={isTextMode} onChange={handleCheckboxChange} />
                            </div>

                            <div className='col-12 col-sm-6 text-center p-0 '>
                                <Tooltip target=".custom-target-icon" />
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                className="bi bi-question-circle custom-target-icon"
                                data-pr-tooltip="Permitir escribir texto"
                                data-pr-position="right"
                                data-pr-at="right+5 top"
                                data-pr-my="left center-20"
                                data-pr-classname='largoTooltip p-0 m-0'
                                style={{ fontSize: '3rem', cursor: 'pointer' }} 
                                viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                                </svg>
                            </div>
                            
                        </div>
              </div>
      </div>
    );
  }
);

export default CustomInputNumber;
