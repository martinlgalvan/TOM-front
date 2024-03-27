// ColorContext.js

import React, { createContext, useState, useContext } from 'react';

const ColorContext = createContext();

export const useColor = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [color, setColor] = useState("#ff0000");
  const [textColor, setTextColor] = useState("#ff0000");
  
  const changeColor = (newColor) => {
    setColor(newColor);
  };

  const changeTextColor = (newColor) => {
    setTextColor(newColor);
  };

  return (
    <ColorContext.Provider value={{ color, changeColor }}>
      {children}
    </ColorContext.Provider>
  );
};

