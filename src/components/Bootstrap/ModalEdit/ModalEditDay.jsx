import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as DayServices from '../../../services/day.services.js'


function ModalEditDay({showEdit, handleClose, actionConfirm, week_id, dayID,nameExercise, refresh}) {

  const [name, setName] = useState('')


  useEffect(() => {setName(nameExercise)},[nameExercise])

  function changeName(e){
      setName(e.target.value)

  }

  function deleteDay(){
    DayServices.deleteDay(week_id, dayID)
      .then(() => {
        handleClose()
      })

    
}

  function onSubmit(e){
    e.preventDefault()

    DayServices.editDay(week_id, dayID, {name: name})
      .then(() => {
        handleClose()
      })
  }
    
  return (
    <>
      <Modal size="m" centered show={showEdit} onHide={actionConfirm}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          <h3 className='FontTitles py-2 border-bottom'>Editar el nombre del día</h3>
          <form onSubmit={onSubmit} className="row my-4">

            <div className="input-group">
                <input onChange={changeName} className="form-control ms-5" type="text" name="name" id="name" defaultValue={nameExercise} placeholder="Nombre"/>
                <button type='submit' className=' btn border me-5 buttonColor'>Editar</button>
            </div>

          </form>

          <button className='col-5 mx-4 my-2 btn border btn-danger text-center' onClick={deleteDay}>Eliminar dia</button>
          <button type='submit' className='col-5 mx-4 my-2 btn border btn-outline' onClick={actionConfirm}>Cerrar</button>
  
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalEditDay
