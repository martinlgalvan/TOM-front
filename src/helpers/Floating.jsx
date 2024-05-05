import React from 'react';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const Floating = ({link}) => {
  return (
    <Link
      className="whatsapp-button navbar-transition"
      to={link}
      rel="noopener noreferrer"
    >
      <IconButton aria-label="video" className="p-1"  >
          <ArrowBackIosIcon className="arrowStyle" />
      </IconButton>
      </Link>
  );
};

export default Floating;