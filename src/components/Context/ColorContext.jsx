// ColorContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

const ColorContext = createContext();

export const useColor = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [color, setColor] = useState("#000000");
  const [textColor, setTextColor] = useState(false);

  useEffect(()=>{
    if(localStorage.getItem('color')){
      setColor(localStorage.getItem('color'))
    } else{
      setColor("#1a1a1a")
    }

    if(localStorage.getItem('textColor')){
      if(localStorage.getItem('textColor') == 'true'){
        setTextColor(true)
      }  else{
        setTextColor(false)
        

      }
    }
  },[])
  
  const changeColor = (newColor) => {
    setColor(newColor);
  };

  const changeTextColor = (newColor) => {
    setTextColor(newColor);
  };

  return (
    <ColorContext.Provider value={{ color, textColor, changeColor, changeTextColor }}>
      {children}
    </ColorContext.Provider>
  );
};

