import React, { useState, useEffect } from 'react';

import * as WeekService from './../../services/week.services.js';
import * as Notify from './../../helpers/notify.js'

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';



function DeleteWeek({ visible, onHide, week_id, name, onDelete }) {

  const handleAccept = () => {
    Notify.notifyA("Eliminando semana...")

      WeekService.deleteWeek(week_id)
        .then(() => {
          onDelete()
          onHide('delete')
          Notify.updateToast()
          
        })
   
  };

  const handleCancel = () => {
    onHide();
  };

  return (

    <Dialog visible={visible} onHide={handleCancel} header={`Eliminar ${name}`}>
      <div className='row justify-content-center'>

        <div className='col-10 mb-3 text-center'>
          <p>¿Estás seguro de eliminar <b>"{name}"</b>?</p>
        </div>

        <div className='col-12 text-center'>
          <button className="btn buttonCancelDialog me-2" onClick={handleCancel}>Cancelar</button>
          <button className='btn btn-danger ms-2' onClick={handleAccept}>Eliminar</button>
        </div>

      </div>
    </Dialog>
    
  );
  }
export default DeleteWeek