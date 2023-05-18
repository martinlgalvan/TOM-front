import { useState } from "react";
import * as ExercisesServices from "../services/exercises.services.js";
import * as JsonExercises from "../services/jsonExercises.services.js";


import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from 'primereact/tooltip';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from "primereact/autocomplete";
import { BarLoader } from 'react-spinners';

function AddCircuit({refresh, handleCloseDialog}) {
  //---variables para la carga
  const { week_id } = useParams();
  const { day_id } = useParams();
  const [loading, setLoading] = useState(false)
  const [closeAfterCreate, setCloseAfterCreate] = useState(true);

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [typeOfSets, setTypeOfSets] = useState(1);
  const [reps, setReps] = useState();
  const [peso, setPeso] = useState(""); //Si peso es 0, al alumno no le aparecera este apartado. (TO DO)
  const [notas, setNotas] = useState(""); //Si peso es 0, al alumno no le aparecera este apartado. (TO DO)
  const [video, setVideo] = useState("");

  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filteredExercises, setFilteredExercises] = useState(null);
  const [exercisesAmrap, setExercisesAmrap] = useState([]);

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

  const addExerciseToAmrap = (exercise) => {
    setLoading(true)

    setTimeout(() => {     
      setExercisesAmrap([...exercisesAmrap, exercise]); //esto debería de funcionar
      setName('')
      setReps(1)
      setPeso('')
      setVideo('')
      setLoading(false)
    },(300))
    
  };


  function changeType(e) {
    e.preventDefault()
    setType(e.target.value);

  }

  
  function changeTypeOfSets(e) {
    setTypeOfSets(e.target.value)
  }

  function changeVideo(e) {
    setVideo(e.target.value);
  }

  function changePeso(e) {
    setPeso(e.target.value)
  }

  function changeNotas(e) {
    setNotas(e.target.value)
  }

  function createAmrap() {

	ExercisesServices.addAmrap(week_id, day_id, { type,typeOfSets, notas, circuit: exercisesAmrap  })
    .then(() => {
      refresh(idRefresh)
      if(closeAfterCreate == true){
        handleCloseDialog()
      } else{
        setExercisesAmrap([])
      }

    })

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

    }, 1);
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
        <div className='row justify-content-center'>

          <div className='col-6 text-end p-0 fs-5'>
              <InputSwitch checked={closeAfterCreate} onChange={(e) => setCloseAfterCreate(e.value)} />
          </div>

          <div className='col-6 text-start'>
              <Tooltip target=".custom-target-icon" />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
              className="bi bi-question-circle custom-target-icon"
              data-pr-tooltip="Predeterminado: Luego de crear un circuito, la ventana se cierra."
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
              <label htmlFor="peso" className="form-label">
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

            <div className="col-12 col-md-9 text-center mb-3">
              <label htmlFor="notas" className="form-label">
                Notas
              </label>
              <input
                type="text"
                className="form-control rounded-0"
                id="notas"
                name="notas"
                value={notas}
                onChange={changeNotas}
                placeholder="Notas"
              />
            </div>

            <div className="col-6 text-center">
              <button onClick={(e) => addExerciseToAmrap({name,reps,peso,video, idRefresh})} className='input-group-text btn border BlackBGtextWhite mt-3'>Añadir ejercicio</button>
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
          {loading == true ? 
          <BarLoader color="#2CBDC7" height={5} width={300} /> :
          <>
          {exercisesAmrap.map(element=> 
            <tr>
              <td>{element.name}</td>
              <td>{element.video}</td>
              <td>{element.peso}</td>
              <td>{element.reps}</td>
            </tr>)}
          </>
          }
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
