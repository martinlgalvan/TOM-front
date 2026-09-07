import React, { useState, useEffect, useRef } from 'react';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';

import Exercises from './../assets/json/NEW_EXERCISES.json';
// Si tienes un "databaseUser" en localStorage, ajusta la logica
// a tu conveniencia

// Los dos modales auxiliares le pasan una ref. Sin forwardRef, React avisaba
// "Function components cannot be given refs" y esa ref quedaba en null.
const AutoComplete = React.forwardRef(({ defaultValue = '', onChange, isProgression }, refExterna) => {
  const [exercisesDatabase, setExercisesDatabase] = useState([]);

  // Estado para el texto del input y la logica de sugerencias
  const [inputValue, setInputValue] = useState(defaultValue);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Referencias para popper
  const inputRef = useRef(null);                // El input
  // La ref que llega desde afuera apunta al input real.
  React.useImperativeHandle(refExterna, () => inputRef.current, []);
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

  // La biblioteca entera, agrupada: 29 grupos con 264 ejercicios. Es lo que se
  // muestra al abrir el desplegable, con scroll dentro del panel.
  const bibliotecaCompleta = () =>
    exercisesDatabase
      .filter((group) => group?.items?.length)
      .map((group) => ({ label: group.label, items: group.items }));

  // Filtra sugerencias al cambiar inputValue
  const filterData = (value) => {
    // Pequena logica para filtrar
    if (!value || value.trim() === '') {
      // Con el campo vacio se muestra la biblioteca completa. Antes esto
      // devolvia una lista vacia, asi que al hacer click el panel se abria sin
      // nada adentro y parecia que el buscador no funcionaba.
      setFilteredSuggestions(bibliotecaCompleta());
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
      // Forzamos popper a actualizar la posicion
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
    // Le damos un pequeno delay para permitir el click
    // en la sugerencia:
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Manejo del click/focus en el input
  const handleFocusOrClick = () => {
    // Al abrirlo se ve la biblioteca completa, se comporte como un select:
    // filtrar por el valor ya cargado dejaba el panel vacio cuando ese nombre
    // no estaba en la biblioteca (por ejemplo un ejercicio escrito a mano).
    // El filtrado sigue funcionando mientras se escribe.
    setFilteredSuggestions(bibliotecaCompleta());
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
        disabled={isProgression}
        onBlur={handleBlur}
        className="form-control styleNameInput"
        placeholder={`${isProgression ? 'Progresión' : 'Selecciona un ejercicio...'}`}
        style={{ zIndex: 1 }}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (

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
          document.body // o algun otro nodo root
        )
      )}
    </div>
  );
});

export default AutoComplete;
