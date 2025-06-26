import React, { useState } from 'react';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { IconButton } from '@mui/material';

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
      <div className='row justify-content-center text-center ' onClick={() => handleClick()}>
               <button className=" btn colorButonContador col-12 text-start">
                  Contador de series<strong className='bordeContador shadow p-1 rounded-1 ms-2'>{count}</strong>

              </button>
      </div>
 
  );
}

export default Contador