import { useState,useRef } from "react";
import * as ExercisesServices from "../services/exercises.services.js";
import Exercises from './../assets/json/exercises.json'
import * as DatabaseExercises from './../services/jsonExercises.services.js'
import CustomInputNumber from './../components/CustomInputNumber.jsx';
import * as DatabaseUtils from './../utils/variables.js'

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from 'primereact/tooltip';
import { AutoComplete } from "primereact/autocomplete";
import Formulas from "./Formulas.jsx";

// PUEDE QUE EL PROBLEMA DE QUE NO RECARGE SEA EL NOTIFY ****************


function AddExercise({refresh, handleCloseDialog,databaseExercises}) {
  //---variables para la carga
  const { week_id } = useParams();
  const { day_id } = useParams();
  const [closeAfterCreate, setCloseAfterCreate] = useState(true);

  const [name, setName] = useState("");
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState(1);
  const [peso, setPeso] = useState(); //Si peso es 0, al alumno no le aparecera este apartado. (TO DO)
  const [notas, setNotas] = useState();
  const [video, setVideo] = useState();

  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState(null);

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

  function changeVideo(e) {
    setVideo(e.target.value);
  }

  function changePeso(e) {
    setPeso(e.target.value);
  }

  function changeNotas(e) {
    setNotas(e.target.value);
  }

  function onSubmit(e) {
  e.preventDefault()

	ExercisesServices.addExerciseToDay(week_id, day_id, { name, sets, reps, peso, video, notas })
    .then(() => {
      refresh(idRefresh)
      if(closeAfterCreate == true){
        handleCloseDialog()
      }
    })
  }

  //-----------------------------------------------------//


  useEffect(() => {
    const local = localStorage.getItem('DATABASE_USER')
    
    if(local != null){
      setExercises(databaseExercises)
    } else{
      setExercises(Exercises);
    }

}, [databaseExercises]);

  const search = (event) => {


        let filteredExercises;

        if (!event.query.trim().length) {
            _filteredExercises = [...exercises];
        }
        else {
            filteredExercises = exercises.filter((exercise) => {
                return exercise.name.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }

        setFilteredExercises(filteredExercises);

}

// Dependiendo el ejercicio elegido, se pone automaticamente el video en el input.
useEffect(() => {
  if(selectedExercise != null && selectedExercise.length == undefined){
    setName(selectedExercise.name)
    setVideo(selectedExercise.video)
  } else{
    setName(selectedExercise)
  }
}, [selectedExercise]);


  return (
    <section className="row justify-content-center ">
      <article className="col-10 border-bottom pb-3">

        <form className="row justify-content-evenly align-items-center" onSubmit={onSubmit}>
          <h2 className="text-center mt-3 mb-4">Agregar ejercicio</h2>
          <div className='row justify-content-center'>

            <div className='col-6 text-end p-0 mb-4 fs-5'>
                <InputSwitch checked={closeAfterCreate} onChange={(e) => setCloseAfterCreate(e.value)} />
            </div>

            <div className='col-6 text-start'>
                <Tooltip target=".custom-target-icon" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                className="bi bi-question-circle custom-target-icon"
                data-pr-tooltip="Predeterminado: Luego de crear un ejercicio, la ventana se cierra."
                data-pr-position="right"
                data-pr-at="right+5 top"
                data-pr-my="left center-20"
                data-pr-classname='largoTooltip p-0 m-0'
                style={{ fontSize: '3rem', cursor: 'pointer' }} viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                </svg>
          </div>
                  
</div>
          <div className="col-12 text-center mb-2">
            <span className="p-float-label p-fluid">
            <AutoComplete appendTo={null} inputClassName={"rounded-0 w-100"} field="name" value={selectedExercise} suggestions={filteredExercises} completeMethod={search} onChange={(e) => setSelectedExercise(e.value)} />    
            <label htmlFor="name">Nombre del ejercicio</label>
            </span>
          </div>

          <div className="col-12 text-center mb-2">
            <label htmlFor="video" className="form-label visually-hidden">
              Video
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="video"
              name="video"
              defaultValue={video}
              onChange={changeVideo}
              placeholder="Video"
            />
          </div>

          <div className="col-6 text-center">
            <label htmlFor="series" className="form-label d-block">
              Series
            </label>
              <CustomInputNumber 
                initialValue={sets}
                onChange={(value) => setSets(value)}
                />
          </div>

          <div className="col-6  text-center">
            <label htmlFor="reps" className="form-label d-block">
              Reps
            </label>
              <CustomInputNumber 
                initialValue={reps}
                onChange={(value) => setReps(value)}
                /> 
          </div>

          <div className="col-12  my-2 text-center">
            <label htmlFor="peso" className="form-label d-block">
              Peso
            </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="peso"
                name="peso"
                defaultValue={peso}
                onChange={changePeso}
                placeholder="Kg / RPE / etc"
              />
          </div>
          <div className="col-12  my-2 text-center">
            <label htmlFor="peso" className="form-label d-block">
              Anotaciones
            </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="notas"
                name="notas"
                defaultValue={notas}
                onChange={changeNotas}
              />
          </div>

          <div className="col-12 col-md-10 my-2 text-center">
            <button className="btn BlackBGtextWhite border input-group-text">Crear</button>
          </div>

        </form>
      </article>

    </section>
  );
}

export default AddExercise;
