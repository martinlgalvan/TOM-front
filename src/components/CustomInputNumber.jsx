import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { BsPlus, BsDash  } from 'react-icons/bs'; 

const CustomInputNumber = React.forwardRef(
  ({ initialValue,onChange, onValueChange, disabled }, ref) => {
    const [value, setValue] = useState(initialValue);

    const handleInputChange = () => {}

    const handleIncrement = () => {
      setValue(value + 1);
      onChange(value + 1);
      if(onValueChange != null){
        onValueChange();

      }
      
      handleInputChange(value + 1);
    };

    const handleDecrement = () => {
      if (value > 0) {
        setValue(value - 1);
        onChange(value - 1);
        if(onValueChange != null){
          onValueChange();
        }
        
        handleInputChange(value - 1); // Llama a la función onChange del componente principal
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleIncrement();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleDecrement();
      }
    };

    return (
      <div className='row justify-content-center'>
        <div className='col-12 text-center'>
          <div className="input-number-container">
            <button type="button" className={'buttonLeft px-2'} onClick={handleDecrement} disabled={disabled}>
            <BsDash size={'1.8em'} /> {/* Agrega el icono de Bootstrap */}

            </button>
            <input
              type="text"
              value={value}
              readOnly
              disabled={disabled}
              onKeyDown={handleKeyDown}
              className="form-control rounded-0 m-0 inp text-center"
              ref={ref}
            />

            <button type="button" className="buttonRight px-2" onClick={handleIncrement} disabled={disabled}>
              <BsPlus size={'1.8em'} /> {/* Agrega el icono de Bootstrap */}
            </button>
          </div>
        </div>
      </div>
      
    );
  }
);

export default CustomInputNumber