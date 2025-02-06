import React, { useState, useEffect, useRef } from 'react';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';

import Exercises from './../assets/json/NEW_EXERCISES.json';
// Si tienes un "databaseUser" en localStorage, ajusta la lógica
// a tu conveniencia

const AutoComplete = ({ defaultValue = '', onChange }) => {
  const [exercisesDatabase, setExercisesDatabase] = useState([]);

  // Estado para el texto del input y la lógica de sugerencias
  const [inputValue, setInputValue] = useState(defaultValue);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Referencias para popper
  const inputRef = useRef(null);                // El input
  const [popperElement, setPopperElement] = useState(null); 
  const [referenceElement, setReferenceElement] = useState(null);

  // Iniciamos usePopper
  const { styles, attributes, update } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top-start'], 
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
          },
        },
      ],
    }
  );

  // Montamos la base de datos local/ejercicios
  useEffect(() => {
    const local = localStorage.getItem("DATABASE_USER");
    if (local != null) {
      // Ejemplo: si tuvieras un 'databaseUser' parseado
      // setExercisesDatabase(JSON.parse(local) || []);
      // O simplemente, si usas Exercises por defecto
      setExercisesDatabase(Exercises);
    } else {
      setExercisesDatabase(Exercises);
    }
  }, []);

  // Sincronizamos defaultValue en caso de que cambie externamente
  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  // Filtra sugerencias al cambiar inputValue
  const filterData = (value) => {
    // Pequeña lógica para filtrar
    if (!value || value.trim() === '') {
      // Si quieres mostrar *todos* los items al hacer click, aquí
      // podrías poner la lista completa:
      // setFilteredSuggestions( ... );
      setFilteredSuggestions([]);
      return;
    }

    const filtered = exercisesDatabase
      .map((group) => ({
        label: group.label,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(value.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);

    setFilteredSuggestions(filtered);
  };

  // Cada vez que el usuario escribe
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Notificamos al padre
    if (onChange) {
      onChange(value);
    }

    // Filtramos
    filterData(value);

    // Si hay algo, mostramos
    if (value.trim() !== '') {
      setShowSuggestions(true);
      // Forzamos popper a actualizar la posición
      if (update) update();
    } else {
      setShowSuggestions(false);
    }
  };

  // Al hacer click en una sugerencia
  const handleClickSuggestion = (item) => {
    setInputValue(item.label);
    setShowSuggestions(false);

    if (onChange) {
      onChange(item.label, item.video);
    }
  };

  // Para ocultar las sugerencias cuando pierde el foco
  const handleBlur = () => {
    // Le damos un pequeño delay para permitir el click
    // en la sugerencia:
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Manejo del click/focus en el input
  const handleFocusOrClick = () => {
    // Filtra con el valor actual
    filterData(inputValue);
    // Muestra la lista (aunque no se haya escrito)
    setShowSuggestions(true);

    if (update) update();
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        ref={(el) => {
          inputRef.current = el; 
          setReferenceElement(el); // Lo asociamos a Popper
        }}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocusOrClick}
        onClick={handleFocusOrClick}
        onBlur={handleBlur}
        className="form-control"
        placeholder="Sentadilla..."
        style={{ zIndex: 1 }}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        // Opción A: Sin Portal (usa popper pero puede quedar dentro del contenedor)
        // <ul
        //   ref={setPopperElement}
        //   className="suggestions-list text-start"
        //   style={styles.popper}
        //   {...attributes.popper}
        // >
        //   {filteredSuggestions.map((group, index) => (
        //     <li key={index}>
        //       <span className='ms-1 p-1'>{group.label}</span>
        //       <ul>
        //         {group.items.map((item, itemIndex) => (
        //           <li
        //             key={itemIndex}
        //             onClick={() => handleClickSuggestion(item)}
        //             className='ms-3 p-1'
        //           >
        //             {item.label}
        //           </li>
        //         ))}
        //       </ul>
        //     </li>
        //   ))}
        // </ul>

        // Opción B: Con Portal (se renderiza fuera, para no ser recortado por contenedores con overflow)
        createPortal(
          <ul
            ref={setPopperElement}
            className="suggestions-list text-start"
            style={{
              ...styles.popper,
              zIndex: 99999, // Aseguramos alto z-index
            }}
            {...attributes.popper}
          >
            {filteredSuggestions.map((group, index) => (
              <li key={index}>
                <span className='ms-1 p-1'>{group.label}</span>
                <ul>
                  {group.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      onClick={() => handleClickSuggestion(item)}
                      className='ms-3 p-1'
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>,
          document.body // o algún otro nodo root
        )
      )}
    </div>
  );
};

export default AutoComplete;
