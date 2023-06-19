import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as DatabaseExercises from '../../../services/jsonExercises.services.js'


function ModalEditDatabase({showEdit, handleClose, actionConfirm, exercise_id, nameExercise, videoExercise, refresh}) {

  const [name, setName] = useState()
  const [video, setVideo] = useState()


  //useEffect(() => {setName(nameExercise)},[nameExercise])

  function changeName(e){
    setName(e.target.value)
  }

  function changeVideo(e){
    setVideo(e.target.value)

}

  function deleteExercise(){
    DatabaseExercises.deleteExercise(exercise_id)
      .then(() => {
        handleClose()
      })

    
}

  function onSubmit(e){
    e.preventDefault()

    DatabaseExercises.editExercise(exercise_id, {name, video})
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
          <h3 className='FontTitles py-2 border-bottom'>Editar ejercicio</h3>
          <form onSubmit={onSubmit} className="row my-4">

            <div class="mb-3">
              <label for="name" class="form-label">Nombre</label>
              <input onChange={changeName} className="form-control text-center" type="text" name="name" id="name" defaultValue={nameExercise}/>
            </div>
            <div class="mb-3">
              <label for="video" class="form-label">Link video</label>
              <input onChange={changeVideo} className="form-control text-center " type="text" name="video" id="video" defaultValue={videoExercise}/>
            </div>

            <div className="mb-3">
                <button type='submit' className='btn border buttonColor'>Editar</button>
            </div>

          </form>

          <button className='col-5 mx-4 my-2 btn border btn-danger text-center' onClick={deleteExercise}>Eliminar ejercicio</button>
          <button type='submit' className='col-5 mx-4 my-2 btn border btn-outline' onClick={actionConfirm}>Cerrar</button>
  
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalEditDatabase
