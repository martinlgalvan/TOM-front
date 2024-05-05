import React, { useState } from 'react';

function Contador({max}) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    if (count < max) {
      setCount(count + 1);
    } else {
      setCount(0);
    }
  };

  return (

      <button className='bg-dark  p-3' onClick={handleClick}>
      {count}
      </button>
 
  );
}

export default Contador