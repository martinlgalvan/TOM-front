import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

import * as RandomizerColumns from  './../../services/randomizerColumn.services.js'

function ActionAreaCard({title, body, id}) {

  const editColumn = (name) => {
    
    setLoading(true)
    RandomizerColumns.editColumn(columnId, {name})
        .then(() => {
            setAdministerColumn(false)
        })
  
  }
  
  const deleteColumn = () => {
  
    RandomizerColumns.deleteColumn(id)
        .then(() => {

  
        })
  
  }

  return (
    <Card className='m-0 px-0 nnn'>
      <CardActionArea className='cardActionArea border-0'>
        <CardContent className='row justify-content-center align-items-center text-center py-5' >

            <h4 className='p-0 m-0'>{title}</h4>

        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ActionAreaCard