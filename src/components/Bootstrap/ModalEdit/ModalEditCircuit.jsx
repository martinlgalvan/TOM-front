import React, { useState } from 'react';
import { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { InputNumber } from 'primereact/inputnumber';

import * as ExercisesService from '../../../services/exercises.services.js';

function ModalEditCircuit({showEditCircuit, handleClose, refresh, week_id, day_id, exercise_id, type, typeOfSets, circuitExercises, numberExercise }) {

  const [status, setStatus] = useState(0)
  const [name, setName] = useState("")
  const [circuit, setCircuit] = useState([])
  const [copia, setCopia] = useState([])
  
  function generateUUID() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

let idRefresh = generateUUID()
  

  useEffect(() => {
    setCircuit(circuitExercises)
    setCopia(circuitExercises)

}, [showEditCircuit, copia, status])


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
  setStatus(idRefresh)

}

function editPeso(id, peso){
  let indexExercise = circuit.findIndex(exercise => exercise.idAmrap === id)
  circuit[indexExercise].peso = peso
  setCopia(circuit)
 
}

function editAmrap(){

  ExercisesService.editExerciseAmrap(week_id, day_id, exercise_id, {exercise_id, type, typeOfSets, circuit: copia, numberExercise })
    .then(() => {
      handleClose()
    })
}
    
  return (
    <>
      <Modal size="lg" centered show={showEditCircuit} onHide={handleClose}>
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

export default ModalEditCircuit