import React, { useState } from "react";
import { useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { InputNumber } from "primereact/inputnumber";

import * as ExercisesService from "../../../services/exercises.services.js";

function ModalEditExercise({ showEditExercise, handleClose,closeModal, week_id, day_id, exercise_id, nameModal, setsModal, repsModal, pesoModal, videoModal, notasModal, numberExerciseModal, valueExerciseModal, }) {

  const [name, setNameEdit] = useState();
  const [sets, setSetsEdit] = useState();
  const [reps, setRepsEdit] = useState();
  const [peso, setPesoEdit] = useState();
  const [video, setVideoEdit] = useState();
  const [notas, setNotasEdit] = useState();
  const [numberExercise, setNumberExerciseEdit] = useState();
  const [valueExercise, setValueExerciseEdit] = useState();

  useEffect(() => {

    setNameEdit(nameModal);
    setSetsEdit(setsModal);
    setRepsEdit(repsModal);
    setPesoEdit(pesoModal);
    setVideoEdit(videoModal);
    setNotasEdit(notasModal);
    setNumberExerciseEdit(numberExerciseModal);
    setValueExerciseEdit(valueExerciseModal);
    
  }, [showEditExercise]);

  function changeNameEdit(e) {
    setNameEdit(e.target.value);
  }

  function changeVideoEdit(e) {
    setVideoEdit(e.target.value);
  }

  function changePesoEdit(e) {
    setPesoEdit(e.target.value);
  }

  function changeNotasEdit(e) {
    setNotasEdit(e.target.value);
  }

  function edit() {
    ExercisesService.editExercise(week_id, day_id, exercise_id, { type: "exercise", name, sets, reps, peso, video, notas, numberExercise, valueExercise })
      .then(() => {
        handleClose();
      });

  }

  return (
    <>
      <Modal size="m" centered show={showEditExercise} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h2 className="text-center">Editar ejecicio</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="row justify-content-center">
            <div className="col-10">
              <label htmlFor="name" className="p-2 d-block">
                Nombre
              </label>
              <input
                id="name"
                className="form-control"
                type="text"
                defaultValue={nameModal}
                onChange={changeNameEdit}
              />
            </div>

            <div className="col-10 col-lg-5 mb-3">
              <label htmlFor="sets" className="p-2 d-block">
                Series
              </label>
              <InputNumber
                inputId="sets"
                value={sets}
                onValueChange={(e) => setSetsEdit(e.value)}
                showButtons
                buttonLayout="horizontal"
                size={1}
                min={1}
                decrementButtonClassName="ButtonsInputNumber"
                incrementButtonClassName="ButtonsInputNumber"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className="InputButtonsColor"
              />
            </div>

            <div className="col-10 col-lg-5 mb-3">
              <label htmlFor="reps" className="p-2 d-block">
                Reps
              </label>
              <InputNumber
                inputId="reps"
                value={reps}
                onValueChange={(e) => setRepsEdit(e.value)}
                showButtons
                buttonLayout="horizontal"
                size={1}
                min={1}
                decrementButtonClassName="ButtonsInputNumber "
                incrementButtonClassName="ButtonsInputNumber"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className="InputButtonsColor"
              />
            </div>

            <div className="col-10 col-lg-5 mb-3">
              <label htmlFor="peso" className="p-2 d-block">
                Peso
              </label>
              <input
                className="form-control"
                type="text"
                defaultValue={peso}
                onChange={changePesoEdit}
              />
            </div>

            <div className="col-10">
              <label htmlFor="video" className="p-2 d-block">
                Video
              </label>
              <input
                id="video"
                className="form-control"
                type="text"
                defaultValue={videoModal}
                onChange={changeVideoEdit}
              />
            </div>

            <div className="col-10">
              <label htmlFor="notas" className="pt-3 pb-2 d-block">
                Notas
              </label>
              <textarea
                id="notas"
                className="form-control"
                type="text"
                defaultValue={notasModal}
                onChange={changeNotasEdit}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
          <button className="btn BlackBGtextWhite" onClick={edit}>
            Editar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEditExercise;
