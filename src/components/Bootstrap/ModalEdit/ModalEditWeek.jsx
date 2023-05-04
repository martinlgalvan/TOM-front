import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as WeekServices from '../../../services/week.services.js'

function ModalEditWeek({showEditWeek, handleClose, actionConfirm, weekID, nameWeek}) {

  const [name, setName] = useState("")

  function changeName(e){
      setName(e.target.value)
  }

  function onSubmit(e){
    e.preventDefault()
    WeekServices.editWeek(weekID, {name: name})
      .then(() => {
        handleClose()
      })
  }
    
  return (
    <>
    
      <Modal size="m" centered show={showEditWeek} onHide={actionConfirm}>
        <Modal.Header className='' closeButton>
          <Modal.Title className='text-center'>Editar semana</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          <form onSubmit={onSubmit} className="row my-4">

            <div className="input-group">

                <input onChange={changeName} className="form-control ms-5" type="text" name="name" id="name" defaultValue={nameWeek} placeholder="Nombre"/>
                <button type='submit' className=' btn border me-5 buttonColor'>Editar</button>
            </div>

          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn BlackBGtextWhite' onClick={actionConfirm}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEditWeek
