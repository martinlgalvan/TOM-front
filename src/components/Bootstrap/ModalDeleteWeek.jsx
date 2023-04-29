import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import * as WeekService from '../../services/week.services.js';


function ModalDeleteWeek({show, handleClose, name, weekID,refresh}) {

    const [status, setStatus] = useState(0)

    function deleteWeek() {

        WeekService.deleteWeek(weekID)
        
        refresh(weekID)
        handleClose()

    }

// VER POR QUE NO EDITA AHORA LAS SEMANAS, Y POR QUE AL EDITAR 2 VECES SE CRASHEA ((NO TENGO IDEA, ESTUVE PROBANDO EN EL BACK PERO NO ECONTRE NADA CONCRETO))
    
  return (
    <>

      <Modal size="m" centered show={show} onHide={handleClose}>
        <Modal.Header className='' closeButton>
          <Modal.Title className='text-center'>Eliminar {name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>¡Cuidado! Estás por eliminar <b>"{name}"</b>. ¿Estás seguro?</Modal.Body>
        <Modal.Footer>
          <button className='btn BGmodalClose' onClick={handleClose}>
            Cerrar
          </button>
          <Button variant="danger" onClick={deleteWeek}>
            Eliminar {name}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDeleteWeek
