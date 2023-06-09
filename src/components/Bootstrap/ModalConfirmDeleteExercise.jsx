import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import * as WeekService from '../../services/week.services.js';
import * as ExercisesService from '../../services/exercises.services.js';


function ModalConfirmDeleteExercise({show, handleClose, closeModal, week_id, day_id, exercise_id, name}) {

    function deleteExercise() {

      ExercisesService.deleteExercise(week_id, day_id, exercise_id)
          .then(() => {
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
          <Button variant="secondary" onClick={closeModal}>
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
