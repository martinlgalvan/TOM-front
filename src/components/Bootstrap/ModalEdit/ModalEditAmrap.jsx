import React, { useState } from 'react';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { InputNumber } from 'primereact/inputnumber';
import * as ObjectId from 'bson-objectid';

import * as ExercisesService from '../../../services/exercises.services.js';

function ModalEditAmrap({showEditAmrap, handleClose, refresh, week_id, day_id, exercise_id, type, typeOfSets, circuitExercises, numberExercise }) {

  const [status, setStatus] = useState(0)
  const [name, setName] = useState("")
  const [circuit, setCircuit] = useState([])
  const [copia, setCopia] = useState([])
  let objectId = new ObjectId()
  let refreshId = objectId.toHexString();
  

  useEffect(() => {
    setCircuit(circuitExercises)
    setCopia(circuitExercises)

    console.log(type)


}, [showEditAmrap, copia, status])


//EL problema del touch del celular creo que era por el status, cuando lo hago bien si edita

function editName(id, name){
  let indexExercise = circuit.findIndex(exercise => exercise.idAmrap === id)
  circuit[indexExercise].name = name
  setCopia(circuit)
 
}

function editReps(id, reps){

  let indexExercise = circuit.findIndex(exercise => exercise.idAmrap === id)
  circuit[indexExercise].reps = reps
  setCopia(circuit)
  setStatus(refreshId)

}

function editPeso(id, peso){
  let indexExercise = circuit.findIndex(exercise => exercise.idAmrap === id)
  circuit[indexExercise].peso = peso
  setCopia(circuit)
 
}



function editAmrap(){
// VER PORQUE EL TYPE NO SE GUARDA ( EL NOMBRE DEL CIRCUITO )
  ExercisesService.editExerciseAmrap(week_id, day_id, exercise_id, {exercise_id, type, typeOfSets, circuit: copia, numberExercise })

  refresh(refreshId)
  handleClose()
}
    
  return (
    <>
      <Modal size="lg" centered show={showEditAmrap} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><h2 className='text-center'>Editar ejecicio</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>

          <div className='row justify-content-center'>
            <article className='col-12'>


              <table className='table align-middle'>
                <thead>
                  <tr>
                    <th>Ejercicio</th> 
                    <th>Peso</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {circuit.map(({idAmrap,name,reps,peso}) =>
                  <tr key={idAmrap}>
                    <td><input id='name' className='form-control d-block' type="text" defaultValue={name} onChange={(e) => editName(idAmrap, e.target.value)}/></td>
                    
                    <td>
                      <input 
                      className='form-control' 
                      type="text" 
                      defaultValue={peso} 
                      onChange={(e) => editPeso(idAmrap, e.target.value)}/>
                    </td>
                    <td>
                      <InputNumber 
                          value={reps} 
                          onValueChange={(e) => editReps(idAmrap,e.value)} 
                          showButtons 
                          buttonLayout={window.screen.width > 600 ? "horizontal" : "vertical"} 
                          size={1} 
                          min={1} 
                          decrementButtonClassName="ButtonsInputNumber" 
                          incrementButtonClassName="ButtonsInputNumber" 
                          incrementButtonIcon="pi pi-plus" 
                          decrementButtonIcon="pi pi-minus"
                          className="WidthInputsWhenIsMobile " 
                      />
                      </td>

                  </tr>
                  )}
                </tbody>
              </table>
              
            </article>


          </div>
                       
        </Modal.Body>
        <Modal.Footer>
          <button className='btn BGmodalClose' onClick={handleClose}>
            Cerrar
          </button>
          <button className='btn BlackBGtextWhite' onClick={editAmrap}>
            Editar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEditAmrap
