import { useState,useRef } from "react";
import * as ExercisesServices from "../services/exercises.services.js";
import * as JsonExercises from "../services/jsonExercises.services.js";

import { useEffect } from "react";
import { useParams } from "react-router-dom";


import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from "primereact/autocomplete";
import { ToastContainer, toast } from 'react-toastify';
import Formulas from "./Formulas.jsx";

// PUEDE QUE EL PROBLEMA DE QUE NO RECARGE SEA EL NOTIFY ****************


function AddExercise({refresh, closeDialog}) {
  //---variables para la carga
  const { week_id } = useParams();
  const { day_id } = useParams();
  const toastId = useRef();

  const [name, setName] = useState("");
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState(1);
  const [peso, setPeso] = useState(0); //Si peso es 0, al alumno no le aparecera este apartado. (TO DO)
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

  function onSubmit(e) {
  e.preventDefault()

	ExercisesServices.addExerciseToDay(week_id, day_id, { name, sets, reps, peso, video })
    .then(() => {
      notify(name)
      refresh(idRefresh)
      closeDialog(false)
    })
  }

  const notify = (name) => {
    if(! toast.isActive(toastId.current)) {
        toastId.current = toast.success(`El ejercicio ${name} se creó con éxito!`, {
    
            position: "bottom-center",
            autoClose: 300,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            limit: 1,
            draggable: true,
            progress: undefined,
            theme: "light",
            })
      }
    }

  //-----------------------------------------------------//


  useEffect(() => {
    JsonExercises.findJsonExercises().then((data) => setExercises(data));
}, []);

  const search = (event) => {

    setTimeout(() => {
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

    }, 100);
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
          <h2 className="text-center mt-3 mb-5">Agregar ejercicio</h2>

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
              <InputNumber 
                  value={sets} 
                  onValueChange={(e) => setSets(e.value)} 
                  showButtons 
                  buttonLayout="horizontal" 
                  size={1} 
                  min={1} 
                  decrementButtonClassName="ButtonsInputNumber" 
                  incrementButtonClassName="ButtonsInputNumber" 
                  incrementButtonIcon="pi pi-plus" 
                  decrementButtonIcon="pi pi-minus" 
                 
              />   
          </div>

          <div className="col-6  text-center">
            <label htmlFor="reps" className="form-label d-block">
              Reps
            </label>
                <InputNumber 
                  value={reps} 
                  onValueChange={(e) => setReps(e.value)} 
                  showButtons 
                  buttonLayout="horizontal" 
                  size={1} 
                  min={0} 
                  decrementButtonClassName="ButtonsInputNumber" 
                  incrementButtonClassName="ButtonsInputNumber" 
                  incrementButtonIcon="pi pi-plus" 
                  decrementButtonIcon="pi pi-minus" 
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

          <div className="col-12 col-md-10 my-2 text-center">
            <button className="btn BlackBGtextWhite border input-group-text">Crear</button>
          </div>

        </form>
      </article>
                  <ToastContainer
                    position="bottom-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    />

    </section>
  );
}

export default AddExercise;
