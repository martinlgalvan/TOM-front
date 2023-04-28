import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import * as WeekService from '../../services/week.services';
import * as ExercisesService from '../../services/exercises.services';


function ModalConfirmDeleteExercise({show, handleClose, week_id, day_id, exercise_id, name}) {

    const [status, setStatus] = useState(1)

    function deleteExercise() {

      ExercisesService.deleteExercise(week_id, day_id, exercise_id)
          .then(() => {
            setStatus(status + 1)
          handleClose()
          })
          

    }

// VER POR QUE NO EDITA AHORA LAS SEMANAS, Y POR QUE AL EDITAR 2 VECES SE CRASHEA ((NO TENGO IDEA, ESTUVE PROBANDO EN EL BACK PERO NO ECONTRE NADA CONCRETO))
    
  return (
    <>

      <Modal size="lg" centered show={show} onHide={handleClose}>
        <Modal.Header className='' closeButton>
          <Modal.Title className='text-center'></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>¿Estás seguro que deseas eliminar el ejercicio '<b>{name}</b>'?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={deleteExercise}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalConfirmDeleteExercise
