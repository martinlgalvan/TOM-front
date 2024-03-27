import React, { useState } from 'react';
import { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { InputNumber } from 'primereact/inputnumber';

import * as ExercisesService from '../../../services/exercises.services.js';

function ModalEditCircuit({showEditCircuit, handleClose, closeModal, week_id, day_id, exercise_id, type, typeOfSets,notasCircuit, circuitExercises, numberExercise }) {

  const [status, setStatus] = useState(0)
  const [notas, setNotas] = useState("")
  const [circuit, setCircuit] = useState([])
  const [copia, setCopia] = useState([])
  
  const [color, setColor] = useState(localStorage.getItem('color'))
  const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))
  
  
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

const handleNotas = (e) => {setNotas(e.target.value)}

function editName(id, name){
  let indexExercise = circuit.findIndex(exercise => exercise.idRefresh === id)
  circuit[indexExercise].name = name
  setCopia(circuit)
 
}

function editReps(id, reps){

  let indexExercise = circuit.findIndex(exercise => exercise.idRefresh === id)
  circuit[indexExercise].reps = reps
  setCopia(circuit)
  setStatus(idRefresh)

}

function editPeso(id, peso){
  let indexExercise = circuit.findIndex(exercise => exercise.idRefresh === id)
  circuit[indexExercise].peso = peso
  setCopia(circuit)
 
}

function editAmrap(){

  if(notas == null || notas == undefined){
    setNotas(" ws")
  }

  ExercisesService.editExerciseAmrap(week_id, day_id, exercise_id, {exercise_id, type, typeOfSets, circuit: copia, notas, numberExercise })
    .then(() => {
      handleClose()
    })
}
    
  return (
    <>
      <Modal size="lg" centered show={showEditCircuit} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title><h2 className='text-center'>Editar ejecicio</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>

          <div className='row justify-content-center'>
            <article className='col-12'>
              <table className='table align-middle'>
                <thead>
                  <tr>
                    <th className='w-50'>Ejercicio</th> 
                    <th className='w-25'>Peso</th>
                    <th className='w-25'>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {circuit.map(({idRefresh,name,reps,peso}) =>
                  <tr key={idRefresh}>
                    <td>
                      <input id='name' className='form-control d-block' type="text" defaultValue={name} onChange={(e) => editName(idRefresh, e.target.value)}/>
                    </td>
                    
                    <td>
                      <input 
                      className='form-control' 
                      type="text" 
                      defaultValue={peso} 
                      onChange={(e) => editPeso(idRefresh, e.target.value)}/>
                    </td>
                    <td>
                      <InputNumber 
                          value={reps} 
                          onValueChange={(e) => editReps(idRefresh,e.value)} 
                          showButtons 
                          buttonLayout={"vertical"} 
                          size={1} 
                          min={1} 
                          decrementButtonClassName="ButtonsInputNumber" 
                          incrementButtonClassName="ButtonsInputNumber" 
                          incrementButtonIcon="pi pi-plus" 
                          decrementButtonIcon="pi pi-minus"
                      />
                      </td>

                  </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3}>Notas</th>
                  </tr>
                  <tr>
                    <th colSpan={3}>
                    <input 
                      className='form-control' 
                      type="text" 
                      defaultValue={notasCircuit} 
                      onChange={handleNotas}/>
                    </th>
                  </tr>
                </tfoot>
              </table>
              
            </article>

          </div>
                       
        </Modal.Body>
        <Modal.Footer>
          <button className='btn BGmodalClose' onClick={closeModal}>
            Cerrar
          </button>
          <button className={`btn ${textColor ? "bbb" : "text-light"}`} style={{ "backgroundColor": `black` }} onClick={() => editAmrap()}>
            Editar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEditCircuit
