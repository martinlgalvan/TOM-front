import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as DayServices from '../../../services/day.services.js'
import * as WeekService from '../../../services/week.services.js'

function ModalViewWarmup({showWarmup, handleClose, user_id,day_id}) {

  const [warmup, setWarmup] = useState([])

  useEffect(() => {
        
    WeekService.findRoutineByUserId(user_id)
        .then(data => {
            let indexWarmup = data[0].routine.findIndex(dia => dia._id === day_id)
            let exists = data[0].routine[indexWarmup].warmup
            
            setWarmup(exists)

         })
},[])

    
  return (
    <>
    

      <Modal size="m" centered show={showWarmup} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          <h3 className='FontTitles py-2'>Entrada en calor específica</h3>
          
          <table className='table table-bordered align-items'>
            <thead>
              <tr>
                <th scope='col'>#</th>
                <th scope='col'>Ejercicio</th>
                <th scope='col'>#</th>
                <th scope='col'>#</th>
              </tr>
            </thead>
            <tbody>
              {warmup != null0 ? warmup.map(exercise =>
              <tr key={exercise.warmup_id}>
                <td>{exercise.numberWarmup}</td>
                <td>
                  <span>{exercise.name}</span>
                  <span>{exercise.sets} x {exercise.reps} - {exercise.peso}</span>
                </td>
                <td></td>
                <td></td>
              </tr>
               ) : <tr><td colSpan={4}>No hay entrada en calor para este día</td></tr>}
            </tbody>

          </table>

          <button type='submit' className='col-7 my-2 btn border btn-outline' onClick={handleClose}>Cerrar</button>
          
  
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalViewWarmup