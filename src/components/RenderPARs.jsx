import React, { useEffect, useState, useRef, useCallback,  } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Segmented } from "antd";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Options from "../assets/json/options.json";

import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { OverlayPanel } from "primereact/overlaypanel";
import { CustomProvider, TimePicker } from "rsuite";
import esES from "rsuite/locales/es_ES";

import AutoComplete from "../components/Autocomplete.jsx";
import CustomInputNumber from "../components/CustomInputNumber.jsx";

import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Supongamos que tienes funciones que generan IDs
import ObjectId from "bson-objectid";
import * as UserService from "../services/users.services.js";
import * as Notify from "../helpers/notify.js";
import * as PARService from "../services/par.services.js";

function RenderPARs({
  allWeeks,
  savePARChanges,
  deletePAR,
}) {

  // ===== Estados principales =====
  const [editableWeek, setEditableWeek] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newWeekName, setNewWeekName] = useState("");
  const [currentDay, setCurrentDay] = useState(null);
  const [indexDay, setIndexDay] = useState(null);
  const [id, set_id] = useState(localStorage.getItem('_id'));
  const [users, setUsers] = useState([]);

  const navigate = useNavigate()
  // Array de días (en la PAR) => editableWeek.routine
  // Ejercicios => day.exercises

  const [options, setOptions] = useState([]);

  // Al igual que Randomizer, "editMode" y "isEditing" para cambiar el diseño mobile
  const [editMode, setEditMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actualUser, setActualUser] = useState(null);
  // Refs para OverlayPanel
  const productRefs = useRef([]);
  const inputRefs = useRef([]);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

useEffect(() => {
  const handleResize = () => setScreenWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

    useEffect(() => {
        UserService.find(id).then(data => {
            setUsers(data);
        });
    }, [id]);


        const handleDropdownChange = useCallback((selectedOption) => {
        setActualUser(selectedOption);
    }, []);

    // ADDED: Creamos la función designWeekToUser para asignar un PAR a un usuario 
    //        y refrescar la lista de PAR
    const designWeekToUser = useCallback((weekData, userId) => {
        PARService.createPARroutine(weekData, userId)
            .then((data) => {
                Notify.instantToast('PAR creado con éxito');
                console.log(data)
            })
    }, [id]);

  // ========== Setup RSuite locale ==========
  const customLocale = {
    ...esES,
    TimePicker: {
      ...esES.TimePicker,
      hours: "Horas",
      minutes: "Minutos",
      seconds: "Segundos"
    }
  };












  // ========== tableMobile (igual diseño que randomizer) ==========
  const tableMobile = () => {
    if (!currentDay) return null;
    return (
      <div className="table-responsiveCss">
        {/* Fila superior con All sets / All reps / Add exercise / Add circuit */}
        <div className="row justify-content-between align-items-center py-2">
          <div className="col-6 text-start">
            <button
              aria-label="video"
              className="btn btn-outline-dark me-2 my-2"
              onClick={incrementAllSeries}
            >
              <UpgradeIcon /> All sets
            </button>
            <button
              aria-label="video"
              className="btn btn-outline-dark me-2 my-2"
              onClick={incrementAllReps}
            >
              <UpgradeIcon /> All reps
            </button>
          </div>
          <div className="col-6 text-end">
            <button
              aria-label="video"
              className="btn btn-outline-dark  my-2"
              onClick={AddNewExercise}
            >
              <AddIcon /> Añadir ejercicio
            </button>
            <button
              aria-label="video"
              className="btn btn-outline-dark  my-2"
              onClick={AddNewCircuit}
            >
              <AddIcon /> Añadir circuito
            </button>
          </div>
        </div>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Peso</th>
              <th>Sets</th>
              <th>Reps</th>
              {editMode && <th>Rest</th>}
              <th>Notas</th>
              {editMode && <th>Video</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDay.exercises.map((exercise, i) => (
              <tr key={exercise.exercise_id} className="shadowCards">
                {exercise.type === "exercise" ? (
                  <>
                    {/* Nombre */}
                    <td data-th="Nombre" className="text-center">
                      {editMode ? (
                        <AutoComplete
                          defaultValue={exercise.name}
                          onChange={(name, video) => {
                            changeModifiedData(i, name, "name");
                            changeModifiedData(i, video, "video");
                          }}
                        />
                      ) : (
                        <span>{exercise.name === "" ? "Nombre" : exercise.name}</span>
                      )}
                    </td>

                    {/* Peso */}
                    <td data-th="Peso" className="text-center">
                      {customInputEditDay(exercise.peso, i, "peso")}
                    </td>

                    {/* Sets */}
                    <td data-th="Sets" className="text-center">
                      {customInputEditDay(exercise.sets, i, "sets")}
                    </td>

                    {/* Reps */}
                    <td data-th="Reps" className="text-center">
                      {customInputEditDay(exercise.reps, i, "reps")}
                    </td>

                    {/* Rest => SOLO si editMode */}
                    {editMode && (
                      <td data-th="Rest" className="text-center">
                        {customInputEditDay(exercise.rest, i, "rest")}
                      </td>
                    )}

                    {/* Notas (siempre se muestra) */}
                    <td data-th="Notas" className="text-center">
                      {customInputEditDay(exercise.notas, i, "notas")}
                    </td>

                    {/* Video => SOLO si editMode */}
                    {editMode && (
                      <td data-th="Video" className="text-center">
                        {customInputEditDay(exercise.video, i, "video")}
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="notStyle">
                      <div className="row justify-content-center mt-2">
                        {editMode ? (
                          <>
                            <div className="col-6">
                              <Dropdown
                                value={exercise.numberExercise}
                                options={options}
                                onChange={(e) =>
                                  changeModifiedData(i, e.target.value, "numberExercise")
                                }
                                placeholder="Select an item"
                                optionLabel="label"
                                className="p-dropdown-group w-100"
                              />
                            </div>
                            <div className="col-6">
                              <IconButton
                                aria-label="delete-exercise"
                                className="styleButtonsEdit rounded-0"
                                onClick={() => deleteExerciseFromArray(i)}
                              >
                                <CancelIcon className="bbbbb" />
                              </IconButton>
                            </div>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                  </>
                ) : (
                  // type === 'circuit'
                  <>
                    {editMode ? (
                      <>
                        <td className="text-center" data-th="Nombre">
                          {/* Ej "Amrap / Emom" */}
                          {customInputEditCircuit(exercise.type, i, "type")}
                        </td>
                        <td className="text-center" data-th="Series">
                          {customInputEditCircuit(exercise.typeOfSets, i, "typeOfSets")}
                        </td>
                        {/* Render circuit array */}
                        <td className="notStyle">
                          {exercise.circuit.map((item, j) => (
                            <div
                              key={item.idRefresh}
                              className="row justify-content-center text-center"
                            >
                              <div className="mt-4 ">
                                <b className="mt-4 mb-2">Ejercicio {j + 1}</b>
                                <span className="text-end ps-5 ">
                                  <IconButton
                                    aria-label="video"
                                    className="text-light"
                                    onClick={() => {
                                      setIsEditing(true);
                                      const updatedWeek = { ...editableWeek };
                                      updatedWeek.routine[indexDay].exercises[i].circuit.splice(
                                        j,
                                        1
                                      );
                                      setEditableWeek(updatedWeek);
                                      setCurrentDay(updatedWeek.routine[indexDay]);
                                    }}
                                  >
                                    <CancelIcon className="colorIconDeleteExercise" />
                                  </IconButton>
                                </span>
                              </div>
                              {/* Nombre */}
                              <span className="col-11 my-1 mb-2">
                                {/* réplica de "customInputEditExerciseInCircuit" */}
                                <AutoComplete
                                  defaultValue={item.name}
                                  onChange={(val, video) => {
                                    const upd = { ...editableWeek };
                                    upd.routine[indexDay].exercises[i].circuit[j].name = val;
                                    // si quieres, actualiza el video: 
                                    //upd.routine[indexDay].exercises[i].circuit[j].video = video;
                                    setEditableWeek(upd);
                                    setCurrentDay(upd.routine[indexDay]);
                                    setIsEditing(true);
                                  }}
                                />
                              </span>
                              {/* Reps */}
                              <span className="col-6 my-1">
                                <CustomInputNumber
                                  initialValue={item.reps}
                                  onChange={(val) => {
                                    const upd = { ...editableWeek };
                                    upd.routine[indexDay].exercises[i].circuit[j].reps = val;
                                    setEditableWeek(upd);
                                    setCurrentDay(upd.routine[indexDay]);
                                    setIsEditing(true);
                                  }}
                                  isRep={true}
                                  className="mt-5"
                                />
                              </span>
                              {/* Peso */}
                              <span className="col-5 my-1">
                                <input
                                  className="form-control ellipsis-input text-center"
                                  type="text"
                                  defaultValue={item.peso}
                                  onChange={(e) => {
                                    const upd = { ...editableWeek };
                                    upd.routine[indexDay].exercises[i].circuit[j].peso =
                                      e.target.value;
                                    setEditableWeek(upd);
                                    setCurrentDay(upd.routine[indexDay]);
                                    setIsEditing(true);
                                  }}
                                />
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="text-center my-4" data-th="Notas">
                          {customInputEditCircuit(exercise.notas, i, "notas")}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-center" data-th="Nombre">
                          {exercise.type === "" ? "Nombre" : exercise.type}
                        </td>
                        <td className="text-center" data-th="Series">
                          {exercise.typeOfSets === "" ? "Sets" : exercise.typeOfSets}
                        </td>
                        <td className="notStyle">
                          <div className="row justify-content-center">
                            <b className="col-5 my-3">Ejercicio</b>
                            <b className="col-3 my-3">Reps</b>
                            <b className="col-3 my-3">Peso</b>
                            {exercise.circuit.map((item) => (
                              <div
                                key={item.idRefresh}
                                className="row justify-content-center"
                              >
                                <span className="col-5 my-1">
                                  {item.name === "" ? "Nombre" : item.name}
                                </span>
                                <span className="col-3 my-1">
                                  {item.reps === "" ? "Reps" : item.reps}
                                </span>
                                <span className="col-3 my-1">
                                  {item.peso === "" ? "Peso" : item.peso}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="text-center my-4 me-3" data-th="Notas">
                          {exercise.notas === "" ? "Notas" : exercise.notas}
                        </td>
                      </>
                    )}

                    {editMode && (
                      <td className="notStyle">
                        <div className="row justify-content-center mt-2">
                          <div className="col-6">
                            <Dropdown
                              value={exercise.numberExercise}
                              options={options}
                              onChange={(e) =>
                                changeModifiedData(i, e.target.value, "numberExercise")
                              }
                              placeholder="Seleccioanr numero"
                              optionLabel="label"
                              className="p-dropdown-group w-100"
                            />
                          </div>
                          <div className="col-6">
                            <button
                              aria-label="video"
                              className="btn btn-danger rounded-2"
                              onClick={() => deleteCircuit(exercise.name, i)}
                            >
                              Eliminar circuito
                            </button>
                          </div>
                        </div>
                        <div>
                          <IconButton
                            aria-label="video"
                            className="bgColor rounded-2 text-light my-4"
                            onClick={() => AddExerciseToCircuit(i)}
                          >
                            <AddIcon />
                            <span className="font-icons me-1">
                              Añadir Ejercicio al Circuito
                            </span>
                          </IconButton>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Fila inferior con All sets / All reps / Add exercise / Add circuit */}
        <div className="row justify-content-between align-items-center py-2">
          <div className="col-6 text-start">
            <button
              aria-label="video"
              className="btn btn-outline-dark me-2 my-2 "
              onClick={incrementAllSeries}
            >
              <UpgradeIcon /> All sets
            </button>
            <button
              aria-label="video"
              className="btn btn-outline-dark me-2 my-2 "
              onClick={incrementAllReps}
            >
              <UpgradeIcon /> All reps
            </button>
          </div>
          <div className="col-6 text-end">
            <button
              aria-label="video"
              className="btn btn-outline-dark  my-2 "
              onClick={AddNewExercise}
            >
              <AddIcon /> Añadir ejercicio
            </button>
            <button
              aria-label="video"
              className="btn btn-outline-dark  my-2 "
              onClick={AddNewCircuit}
            >
              <AddIcon /> Añadir circuito
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== Guardar / Eliminar PAR ==========
  const handleSavePar = () => {
    // Guardar cambios
    savePARChanges(editableWeek);
    setDialogVisible(false);
    setIsEditing(false);
  };
  const handleDeletePar = () => {
    deletePAR(editableWeek._id).then(() => {
      setDialogVisible(false);
    });
  };

  return (
    <div className="row justify-content-center">
      {/* Mapeo de PARs existentes */}
      {allWeeks &&
        allWeeks.map((week) => (
          <div
            key={week._id}
            onClick={() => navigate(`/par/${week._id}`)}
            className="col-10 col-lg-3 mb-4 pointerClick py-3"
          >
            <div className="card p-3 shadow">
              <div className=" d-flex justify-content-center align-items-center py-3">
                <h5>{week.name}</h5>
              </div>
            </div>
          </div>
        ))}

      {/* Dialog para editar PAR */}
      {editableWeek && (
        <Dialog
          className="col-12 col-lg-10"
          header={
            <div className="row justify-content-center">
              <div className="col-10">
                <input
                  type="text"
                  className="form-control"
                  value={newWeekName}
                  onChange={(e) => setNewWeekName(e.target.value)}
                  onBlur={handleWeekNameChange}
                  placeholder="Nombre de la Semana"
                />
              </div>
            </div>
          }
          visible={dialogVisible}
          
          footer={
            <div className="row mt-3">

              {isEditing && (
              <div className="text-center py-4 ">
                <button
                  className="btn BlackBGtextWhite me-3"
                  onClick={handleSavePar}
                >
                  Guardar
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => {
                    // Al "cancelar," recargamos la PAR original
                    setDialogVisible(false);
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}


              <div className="col-4">
                  <div className='text-center'>
                    {users && <Dropdown
                        value={actualUser}
                        options={users}
                        optionLabel="name"
                        placeholder="Seleccioná un alumno"
                        onChange={(e) => handleDropdownChange(e.value)}
                        className=""
                        filter
                        scrollHeight={"360px"}
                        filterPlaceholder={"Buscar alumno"}
                        emptyFilterMessage={"No se encontró ningún alumno"}
                        emptyMessage={"No se encontró ningún alumno"}
                    />}
                </div>


                <button
                  className="btn btn-primary w-100"
                  disabled={!actualUser}
                  onClick={() => designWeekToUser(editableWeek, actualUser?._id)}
                >
                  Asignación
                </button>
              </div>
              <div className="col-4">
                <button className="btn BlackBGtextWhite " onClick={handleSavePar}>
                <SaveIcon className="" />
                  Guardar
                  
                </button>
              </div>
              <div className="col-4">
                <button
                    aria-label="delete"
                    onClick={() => handleDeletePar()}
                    className="btn btn-danger "
                >
                    <DeleteIcon className="" />
                    Eliminar
                </button>

              </div>
            </div>
          }
          onHide={() => setDialogVisible(false)}
        >
          {/* Segmented con los días */}
          {editableWeek.routine && editableWeek.routine.length > 0 && (
            <Segmented
              options={editableWeek.routine.map((day) => ({
                label: day.name,
                value: day._id,
              }))}
              className="stylesSegmented my-2"
              onChange={handleDayChange}
            />
          )}

          {/* Nombre del día */}
          {currentDay && (
            <div className="my-3 text-center">
              <h4>{currentDay.name}</h4>
            </div>
          )}

          {/* BOTONES "editMode" al estilo randomizer */}
          <div className="text-end mb-3">
            <button
              className={`btn ${editMode ? "btn-secondary" : "btn-outline-secondary"} me-2`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Ver Menos" : "Editar +" }
            </button>
          </div>

          {/* Render Table Mobile */}
          {screenWidth < 982 ? tableMobile() : tableDesktop()}

          
        </Dialog>
      )}
    </div>
  );
}

export default RenderPARs;
