import { useState } from "react";
import * as ExercisesServices from "../services/exercises.services.js";
import * as JsonExercises from "../services/jsonExercises.services.js";


import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from "primereact/autocomplete";

function AddCircuit({refresh}) {
  //---variables para la carga
  const { week_id } = useParams();
  const { day_id } = useParams();

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [typeOfSets, setTypeOfSets] = useState(1);
  const [reps, setReps] = useState(1);
  const [peso, setPeso] = useState(""); //Si peso es 0, al alumno no le aparecera este apartado. (TO DO)
  const [video, setVideo] = useState("");

  var objectId = new ObjectId()
  let idAmrap = objectId.toHexString();

  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState(null);
  const [exercisesAmrap, setExercisesAmrap] = useState([]);

  const addExerciseToAmrap = (exercise) => {

     setExercisesAmrap([...exercisesAmrap, exercise]); //esto debería de funcionar
     setName('')
     setReps(1)
     setPeso('')
     setVideo('')
  };


  function changeType(e) {
    e.preventDefault()
    setType(e.target.value);

  }

  
  function changeTypeOfSets(e) {
    e.preventDefault()

    setTypeOfSets(e.target.value)
  }

  function changeVideo(e) {
    e.preventDefault()

    setVideo(e.target.value);
  }

  function changePeso(e) {
    e.preventDefault()

    setPeso(e.target.value)
  }

  function createAmrap() {

	ExercisesServices.addAmrap(week_id, day_id, { type,typeOfSets, circuit: exercisesAmrap  });
  refresh(idAmrap)
  setExercisesAmrap([])
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
    <section className="row justify-content-center border-bottom">

      <h2 className="text-center my-3">Agregar circuito</h2>
      <article className="col-10  pb-3 border-bottom">
      
          
          <div className="row justify-content-center">

          <div className="col-12 col-md-6 text-center mb-3">
              <label htmlFor="video" className="form-label">
                Tipo de circuito
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="type"
                name="type"
                value={type}
                onChange={changeType}
                placeholder="Amrap/emom/medley"
              />
            </div>

            <div className="col-10 col-md-6 text-center mb-4">
              <label htmlFor="series" className="form-label">
                Series/minutos
              </label>
              <input 
                className='form-control rounded-0' 
                type="text" 
                defaultValue={typeOfSets}
                onChange={changeTypeOfSets}/>
            </div>

            <div className="col-12 col-md-9 text-center my-4">
              <span className="p-float-label p-fluid">
              <AutoComplete appendTo={null} inputClassName={"rounded-0 w-100"} field="name" value={name} suggestions={filteredExercises} completeMethod={search} onChange={(e) => setSelectedExercise(e.value)} />    

              <label htmlFor="name">Nombre del ejercicio</label>
              </span>
            </div>

            

            <div className="col-12 col-md-9 text-center mb-3">
              <label htmlFor="video" className="form-label visually-hidden">
                Video
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="video"
                name="video"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="Video"
              />
            </div>

            <div className="col-12 col-md-4 text-center mb-3">
              <label htmlFor="peso" className="form-label visually-hidden">
                Peso
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="peso"
                name="peso"
                value={peso}
                onChange={changePeso}
                placeholder="Peso"
              />
            </div>

            <div className="col-10 col-xl-10 col-sm-6 text-center mb-4">
              <label htmlFor="series" className="form-label d-block">
                Repeticiones
              </label>
                <InputNumber 
                    value={reps} 
                    onValueChange={(e) => setReps(e.value)} 
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
            <div className="col-6 text-center">
              <button onClick={(e) => addExerciseToAmrap({name,reps,peso,video, idAmrap})} className='input-group-text btn border BlackBGtextWhite mt-3'>Añadir ejercicio</button>
            </div>      
          </div>

      </article>
      {exercisesAmrap.length > 0 && <article className="col-10">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Video</th>
              <th>Peso</th>
              <th>Reps</th>
            </tr>
          </thead>
          <tbody>
          {exercisesAmrap.map(element=> 
            <tr>
              <td>{element.name}</td>
              <td>{element.video}</td>
              <td>{element.peso}</td>
              <td>{element.reps}</td>
            </tr>)}
          </tbody>
        </table>
      </article>}
      <div className="row justify-content-center my-4  pb-5 mb-5">
      <button className="btn border BlackBGtextWhite col-3" type="submit" onClick={createAmrap}>Crear "{type}"</button>

      </div>
    </section>
  );
}

export default AddCircuit;
