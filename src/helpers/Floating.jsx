import React from 'react';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Floating = ({link}) => {
  return (
    <Link
      className="whatsapp-button navbar-transition"
      to={link}
      rel="noopener noreferrer"
    >
      <IconButton  className=""  >
          <ArrowBackIcon  />
      </IconButton>
      </Link>
  );
};

export default Floating;