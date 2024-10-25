import React, { useState, useEffect } from 'react';

import Exercises from './../assets/json/NEW_EXERCISES.json'

const AutoComplete = ({ defaultValue = '', onChange }) => {

    const [exercisesDatabase, setExercisesDatabase] = useState([]); // Carga del array principal de ejercicios

    useEffect(() => {
        const local = localStorage.getItem("DATABASE_USER");

        if (local != null) {
            setExercisesDatabase(databaseUser);
        } else {
            setExercisesDatabase(Exercises);
        }
    }, []);

    const [inputValue, setInputValue] = useState(defaultValue);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setInputValue(defaultValue);
    }, [defaultValue]);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (onChange) {
            onChange(value);
        }

        if (value) {
            const filtered = exercisesDatabase
                .map((group) => ({
                    label: group.label,
                    items: group.items.filter((item) =>
                        item.label.toLowerCase().includes(value.toLowerCase())
                    ),
                }))
                .filter((group) => group.items.length > 0);

            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleClick = (itemLabel) => {
        setInputValue(itemLabel);
        setShowSuggestions(false);

        if (onChange) {
            onChange(itemLabel);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 300); // Ajusta el tiempo según sea necesario
    };
    

    return (
        <div className="autocomplete">
            <input
                type="text"
                value={inputValue}
                onBlur={handleBlur}
                onChange={handleChange}
                className='form-control'
                placeholder="Sentadilla..."
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className=" suggestions-list text-start">
                    {filteredSuggestions.length > 0 && (
                        filteredSuggestions.map((group, index) => (
                            <li key={index}>
                                <span className='ms-1 p-1'>{group.label}</span>
                                <ul>
                                    {group.items.map((item, itemIndex) => (
                                        <li
                                            key={itemIndex}
                                            onClick={() => handleClick(item.label)}
                                            className='ms-3 p-1'
                                        >
                                            {item.label}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))
                    ) }
                </ul>
            )}
        </div>
    );
};

export default AutoComplete;
