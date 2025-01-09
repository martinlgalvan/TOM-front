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
      <div className='row justify-content-center text-center p-2' onClick={() => handleClick()}>
               <div className="col-12 ">
                  {count}

              </div>
      </div>
 
  );
}

export default Contador