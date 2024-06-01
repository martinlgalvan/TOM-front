import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import CustomInputNumber from '../../CustomInputNumber.jsx';
import * as ExercisesService from './../../../services/exercises.services.js'

function ModalEditCircuit({ showEditCircuit, handleClose, closeModal, week_id, day_id, exercise_id, circuit }) {
  const [status, setStatus] = useState(0);
  const [notas, setNotas] = useState("");
  const [updatedModifiedCircuit, setUpdatedModifiedCircuit] = useState(circuit);
  const [copia, setCopia] = useState([]);
  const [color, setColor] = useState(localStorage.getItem('color'));
  const [textColor, setTextColor] = useState(localStorage.getItem('textColor'));
  const [firstWidth, setIsFirstWidth] = useState()
  useEffect(() => {
    setIsFirstWidth(window.innerWidth)
  },[])


  const editName = (index, value) => {
    const updatedCircuit = { ...updatedModifiedCircuit };
    updatedCircuit.circuit[index].name = value;
    setUpdatedModifiedCircuit(updatedCircuit);
  };

  const editReps = (index, value) => {
    const updatedCircuit = { ...updatedModifiedCircuit };
    updatedCircuit.circuit[index].reps = value;
    setUpdatedModifiedCircuit(updatedCircuit);
  };

  const editPeso = (index, value) => {
    const updatedCircuit = { ...updatedModifiedCircuit };
    updatedCircuit.circuit[index].peso = value;
    setUpdatedModifiedCircuit(updatedCircuit);
  };

  const editVideo = (index, value) => {
    const updatedCircuit = { ...updatedModifiedCircuit };
    updatedCircuit.circuit[index].video = value;
    setUpdatedModifiedCircuit(updatedCircuit);
  };

  function editAmrap(){

    console.log(week_id, day_id, updatedModifiedCircuit.exercise_id, updatedModifiedCircuit )
   ExercisesService.editExerciseAmrap(week_id, day_id, updatedModifiedCircuit.exercise_id, updatedModifiedCircuit )
      .then(() => {
        handleClose()
      })
  }

  return (
    <>
    <Modal size="lg" centered show={showEditCircuit} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h2 className="text-center">Editar {circuit.type}</h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div className={`${firstWidth > 992 ? 'table-responsive' : 'table-responsiveCss'}`}>
        <table className="table align-middle table-bordered table-hover ">
          <thead>
            <tr>
              <th>#</th>
              <th >Nombre</th>
              <th>Peso</th>
              <th>Reps</th>
              <th>Video</th>
            </tr>
          </thead>
          <tbody>
            {updatedModifiedCircuit.circuit.map((exercise, index) => (
              <tr key={exercise.idRefresh}>
                <td data-th={'#'} className='text-center'>
                  <span >{index + 1}</span>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={exercise.name}
                    onChange={(e) => editName(index, e.target.value)}
                  />
                </td>
                <td data-th={'Nombre'}>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={exercise.peso}
                    onChange={(e) => editPeso(index, e.target.value)}
                  />
                </td>
                <td data-th={'Repeticiones'}>
                <CustomInputNumber 
                  initialValue={exercise.reps}
                  onChange={(e) => editReps(index, e)}
                  value={exercise.reps} 
                  isRep={true}/>

                </td>
                <td data-th={'Video'}>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={exercise.video}
                    onChange={(e) => editVideo(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Modal.Body>
      <Modal.Footer className="sticky-footer">

        <button
          className={`btn ${'BlackBGtextWhite'}`}
          onClick={editAmrap}
        >
          Editar
        </button>
        <button className="btn btn-secondary" onClick={closeModal}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
    </>
  );
}

export default ModalEditCircuit;
