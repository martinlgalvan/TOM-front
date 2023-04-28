import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { InputNumber } from 'primereact/inputnumber';

import * as WarmupServices from '../../../services/warmup.services.js';

function ModalEditWarmup({showEditWarmup, handleClose, nameWarmup, setsWarmup, repsWarmup, pesoWarmup, videoWarmup, notasWarmup, week_id, day_id, warmup_id}) {

  const [status, setStatus] = useState(0)

  const [name, setNameEdit] = useState()
  const [sets, setSetsEdit] = useState()
  const [reps, setRepsEdit] = useState()
  const [peso, setPesoEdit] = useState()
  const [video, setVideoEdit] = useState()
  const [notas, setNotasEdit] = useState()

  useEffect(() => {

    setNameEdit(nameWarmup)
    setSetsEdit(setsWarmup)
    setRepsEdit(repsWarmup)
    setPesoEdit(pesoWarmup)
    setVideoEdit(videoWarmup)
    setNotasEdit(notasWarmup)

}, [showEditWarmup])

function changeNameEdit(e){
    setStatus(status + 1)
    setNameEdit(e.target.value)

}

function changeVideoEdit(e){
    setStatus(status + 1)
    setVideoEdit(e.target.value)
    
}

function changePesoEdit(e){
  setStatus(status + 1)
  setPesoEdit(e.target.value)
  
}

function changeNotasEdit(e){
  setStatus(status + 1)
  setNotasEdit(e.target.value)
  
}


function editWarmup(){

    WarmupServices.editWarmup(week_id, day_id, warmup_id, {name, sets, reps, peso, video, notas})
    setStatus(status + 1)
    handleClose()
}


    
  return (
    <>
      <Modal size="lg" centered show={showEditWarmup} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><h2 className='text-center'>Editar entrada en calor</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>

          <div className='row justify-content-center'>
            <article className='col-10'>

              <div className='row justify-content-center'>
                <div className='col-10'>
                  <label htmlFor="name" className='p-2 d-block'>Nombre</label>
                  <input id='name' className='form-control' type="text" defaultValue={nameWarmup} onChange={changeNameEdit}/>
                </div>

                <div className='col-10 col-lg-5 mb-3'>
                  <label htmlFor="sets" className='p-2 d-block'>Series</label>
                  <InputNumber 
                    inputId='sets'
                    value={sets} 
                    onValueChange={(e) => setSetsEdit(e.value)} 
                    showButtons 
                    buttonLayout="horizontal" 
                    size={1} 
                    min={1} 
                    decrementButtonClassName="p-button-secondary p-button-outlined" 
                    incrementButtonClassName="p-button-secondary p-button-outlined" 
                    incrementButtonIcon="pi pi-plus" 
                    decrementButtonIcon="pi pi-minus" 
                  />    
                </div>

                <div className='col-10 col-lg-5 mb-3'>
                <label htmlFor="reps" className='p-2 d-block'>Reps</label>
                  <InputNumber 
                    inputId='reps'
                    value={reps} 
                    onValueChange={(e) => setRepsEdit(e.value)} 
                    showButtons 
                    buttonLayout="horizontal" 
                    size={1} 
                    min={1} 
                    decrementButtonClassName="p-button-secondary p-button-outlined " 
                    incrementButtonClassName="p-button-secondary p-button-outlined" 
                    incrementButtonIcon="pi pi-plus" 
                    decrementButtonIcon="pi pi-minus" 
                  /> 
                </div>

                <div className='col-10 col-lg-5 mb-3'>
                  <label htmlFor="peso" className='p-2 d-block'>Peso</label>
                    <input 
                      className='form-control' 
                      type="text" 
                      defaultValue={peso} 
                      onChange={changePesoEdit}/>
                </div>

                <div className='col-10'>
                  <label htmlFor="video" className='p-2 d-block'>Video</label>
                  <input id='video' className='form-control' type="text" defaultValue={videoWarmup} onChange={changeVideoEdit}/>
                </div>

                <div className='col-10'>
                  <label htmlFor="notas" className='pt-3 pb-2 d-block'>Notas</label>
                  <textarea id='notas' className='form-control' type="text" defaultValue={notasWarmup} onChange={changeNotasEdit}/>
                </div>

              </div>

            </article>

          </div>
                       
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="warning" onClick={editWarmup}>
            Editar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEditWarmup
