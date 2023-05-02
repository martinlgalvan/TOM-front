import { useState,useRef } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import * as WeekService from '../../services/week.services.js'
import * as WarmupServices from "../../services/warmup.services.js";
//import * as JsonExercises from "../../services/jsonExercises.services.js";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useEffect } from "react";
import { confirmDialog } from 'primereact/confirmdialog';

import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from "primereact/autocomplete";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ModalCreateWarmup({showCreateWarmup, handleClose, week_id, day_id}) {

  const [status, setStatus] = useState()
  const [confirm, setConfirm] = useState()
  const toastId = useRef();
  const [warmup, setWarmup] = useState()

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
        
    WeekService.findByWeekId(week_id)
        .then(data => {
            let indexWarmup = data[0].routine.findIndex(dia => dia._id === day_id)
            let exists = data[0].routine[indexWarmup].warmup
            
            setWarmup(exists)

            if(exists != undefined){

                setConfirm(1)
            } else{
                setConfirm(null)
            }

         })
},[status])

  //---variables para la carga

  const [name, setName] = useState("");
  const [sets, setSets] = useState(1);
  const [reps, setReps] = useState(1);
  const [peso, setPeso] = useState(); //Si peso es 0, al alumno no le aparecera este apartado. (TO DO)
  const [video, setVideo] = useState();
  const [notas, setNotas] = useState("");

  function changeNameWarmup(e) {
    setName(e.target.value);
  }

  function changeVideoWarmup(e) {
    setVideo(e.target.value);
  }

  function changePesoWarmup(e) {
    setPeso(e.target.value);

  }

  function onSubmit(e) {
      e.preventDefault()
	    WarmupServices.createWarmup(week_id, day_id, { name, sets, reps, peso, video })
        .then(() => {
          setStatus(idRefresh)
        })
  }

function changeNameWarmup(e){
  setName(e.target.value)
}

function changePesoWarmup(e){
  setPeso(e.target.value)
}

function changeVideoWarmup(e){
  setVideo(e.target.value)
}

function changeNotasWarmup(e){
  setNotas(e.target.value)
}


function editWarmup(warmup_id, name, sets, reps,peso, video, notas, numberWarmup){

  WarmupServices.editWarmup(week_id, day_id, warmup_id, {name, sets, reps, peso, video, notas, numberWarmup})
    .then(() => {
      notify(name)
      setStatus(idRefresh)
    })

}
  

  function acceptDeleteWarmup(id) {
    WarmupServices.deleteWarmup(week_id, day_id, id)
      .then(() => {
        setStatus(idRefresh)
      })
  };


  const reject = () => {};

  const deleteWarmup = (event,id,name) => {
        
    confirmDialog({
        trigger: event.currentTarget,
        message: `¿Estás seguro de que querés eliminar el ejercicio ${name}`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {acceptDeleteWarmup(id), setStatus(id)},
        reject,
        acceptLabel:"Sí, eliminar",
        acceptClassName: "p-button-danger",
        rejectLabel: "No",
        rejectClassName: "p-button-secondary",
        appendTo:"self"

    });
};

  const options = [
    {value:1, name: 1, extras: [{value: 1, name: "1-A"},{value: 1, name: "1-B"},{value: 1, name: "1-C"},{value: 1, name: "1-D"},{value: 1, name: "1-F"}]},
    {value:2, name: 2, extras: [{value: 2, name: "2-A"},{value: 2, name: "2-B"},{value: 2, name: "2-C"},{value: 2, name: "2-D"},{value: 2, name: "2-F"}]},
    {value:3, name: 3, extras: [{value: 3, name: "3-A"},{value: 3, name: "3-B"},{value: 3, name: "3-C"},{value: 3, name: "3-D"},{value: 3, name: "3-F"}]},
    {value:4, name: 4, extras: [{value: 4, name: "4-A"},{value: 4, name: "4-B"},{value: 4, name: "4-C"},{value: 4, name: "4-D"},{value: 4, name: "4-F"}]},
    {value:5, name: 5, extras: [{value: 5, name: "5-A"},{value: 5, name: "5-B"},{value: 5, name: "5-C"},{value: 5, name: "5-D"},{value: 5, name: "5-F"}]},
    {value:6, name: 6, extras: [{value: 6, name: "6-A"},{value: 6, name: "6-B"},{value: 6, name: "6-C"},{value: 6, name: "6-D"},{value: 6, name: "6-F"}]},
    {value:7, name: 7, extras: [{value: 7, name: "7-A"},{value: 7, name: "7-B"},{value: 7, name: "7-C"},{value: 7, name: "7-D"},{value: 7, name: "7-F"}]},
    {value:8, name: 8, extras: [{value: 8, name: "8-A"},{value: 8, name: "8-B"},{value: 8, name: "8-C"},{value: 8, name: "8-D"},{value: 8, name: "8-F"}]},
    {value:9, name: 9, extras: [{value: 9, name: "9-A"},{value: 9, name: "9-B"},{value: 9, name: "9-C"},{value: 9, name: "9-D"},{value: 9, name: "9-F"}]},
    {value:10, name: 10, extras: [{value: 10, name: "10-A"},{value: 10, name: "10-B"},{value: 10, name: "10-C"},{value: 10, name: "10-D"},{value: 10, name: "10-F"}]},
    {value:11, name: 11, extras: [{value: 11, name: "11-A"},{value: 11, name: "11-B"},{value: 11, name: "11-C"},{value: 11, name: "11-D"},{value: 11, name: "11-F"}]},
    {value:12, name: 12, extras: [{value: 12, name: "12-A"},{value: 12, name: "12-B"},{value: 12, name: "12-C"},{value: 12, name: "12-D"},{value: 12, name: "12-F"}]},
    {value:13, name: 13, extras: [{value: 13, name: "13-A"},{value: 13, name: "13-B"},{value: 13, name: "13-C"},{value: 13, name: "13-D"},{value: 13, name: "13-F"}]},
    {value:14, name: 14, extras: [{value: 14, name: "14-A"},{value: 14, name: "14-B"},{value: 14, name: "14-C"},{value: 14, name: "14-D"},{value: 14, name: "14-F"}]},
    {value:15, name: 15, extras: [{value: 15, name: "15-A"},{value: 15, name: "15-B"},{value: 15, name: "15-C"},{value: 15, name: "15-D"},{value: 15, name: "15-F"}]}

]

const notify = (name) => {
  if(! toast.isActive(toastId.current)) {
      toastId.current = toast.success(`${name} editado con éxito!`, {
  
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

  return (

    <Modal size="xl" centered show={showCreateWarmup} onHide={handleClose} scrollable>
        <Modal.Header className='' closeButton>
          <Modal.Title className='text-center'></Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
        <section className="row justify-content-center">
          <article className="col-10 col-lg-6 pb-3">
            <form className="row justify-content-center align-items-center" onSubmit={onSubmit}>
              <h2 className="text-center my-3">Agregar warmup</h2>
              <div className="col-10 col-xl-6 mb-3">
                <label htmlFor="video" className="form-label visually-hidden">
                  Nombre
                </label>
                <input
                  type="text"
                  className="form-control rounded-0"
                  id="name"
                  name="name"
                  onChange={changeNameWarmup}
                  placeholder="Nombre"
                />
              </div>

              <div className="col-10 col-xl-6 mb-1">
                <label htmlFor="video" className="form-label visually-hidden">
                  Video
                </label>
                <input
                  type="text"
                  className="form-control rounded-0"
                  id="video"
                  name="video"
                  onChange={changeVideoWarmup}
                  placeholder="Video"
                />
              </div>

              <div className="col-10 col-xl-4 text-center my-2">
                <label htmlFor="series" className="form-label d-block">
                  Series
                </label>
                  <InputNumber 
                      value={sets} 
                      onChange={(e) => setSets(e.value)} 
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

              <div className="col-10 col-xl-4 my-2 text-center">
                <label htmlFor="reps" className="form-label d-block">
                  Reps
                </label>
                    <InputNumber 
                      value={reps} 
                      onChange={(e) => setReps(e.value)} 
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

              <div className="col-10 col-xl-4 my-2 text-center">
                <label htmlFor="peso" className="form-label d-block">
                  Peso
                </label>
                  <input
                    type="text"
                    className="form-control rounded-0"
                    id="peso"
                    name="peso"
                    onChange={changePesoWarmup}
                    placeholder="Kg / RPE / etc"
                  />
              </div>
              <div>
                <button className="btn BlackBGtextWhite mt-4">Crear</button>
              </div>

            </form>
          </article>
        </section>

        {confirm != null  && 
                <article className="table-responsive border-bottom mb-5 pb-4">
                    <table className="table align-middle table-bordered caption-top">
                        <caption>Entrada en calor</caption>
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Ejercicio</th>
                                <th scope="col">Series</th>
                                <th scope="col">Reps</th>
                                <th scope="col">Peso</th>
                                <th scope="col">Video</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                        <TransitionGroup component={null} className="todo-list">
                        {warmup != null && warmup.map((elemento, index) =>
                         <CSSTransition
                         key={elemento.warmup_id}
                         timeout={500}
                         classNames="item"
                         >
                            <tr key={elemento.warmup_id}>
                            <th scope="row">
                            <select 
                            defaultValue={elemento.numberWarmup === null ? options[index].name : elemento.numberWarmup} 
                            onChange={(e) => {editWarmup(elemento.warmup_id, elemento.name, elemento.sets, elemento.reps, elemento.peso, elemento.video,elemento.notas, e.target.value)}}>
                                {options.map(option =>
                                <optgroup key={option.value} label={option.name} >
                                    <option value={option.name}>{option.name}</option>

                                    {option.extras.map(element => 

                                        <option key={element.name} >{element.name}</option>

                                    )}

                                </optgroup>
                                )}
                                </select>
                               </th>
                            <td>
                                <input 
                                id='name' 
                                className='form-control border-0' 
                                type="text" 
                                defaultValue={elemento.name} 
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        editWarmup(elemento.warmup_id, event.target.value, elemento.sets, elemento.reps, elemento.peso, elemento.video, elemento.notas, elemento.numberWarmup)
                                    }}} 
                                onChange={changeNameWarmup}/>
                            </td>
                            <td><InputNumber 
                                    value={elemento.sets} 
                                    onValueChange={(e) => editWarmup(elemento.warmup_id, elemento.name, e.value, elemento.reps, elemento.peso, elemento.video, elemento.notas, elemento.numberWarmup)} 
                                    showButtons 
                                    buttonLayout={"horizontal"} 
                                    size={1} 
                                    min={1} 
                                    decrementButtonClassName="p-button-secondary p-button-outlined" 
                                    incrementButtonClassName="p-button-secondary p-button-outlined" 
                                    incrementButtonIcon="pi pi-plus" 
                                    decrementButtonIcon="pi pi-minus" 
                                />      
                            </td>
                            <td>
                                <InputNumber 
                                    value={elemento.reps} 
                                    onValueChange={(e) => editWarmup(elemento.warmup_id, elemento.name, elemento.sets, e.value, elemento.peso, elemento.video, elemento.notas, elemento.numberWarmup)} 
                                    showButtons 
                                    buttonLayout="horizontal" 
                                    size={1} 
                                    min={1} 
                                    decrementButtonClassName="p-button-secondary p-button-outlined aa" 
                                    incrementButtonClassName="p-button-secondary p-button-outlined aa" 
                                    incrementButtonIcon="pi pi-plus" 
                                    decrementButtonIcon="pi pi-minus" 
                                /> 
                            </td>
                            <td>
                                <input 
                                className='form-control border-0' 
                                type="text" 
                                defaultValue={elemento.peso}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        editWarmup(elemento.warmup_id, elemento.name, elemento.sets, elemento.reps, event.target.value, elemento.video, elemento.notas, elemento.numberWarmup)
                                    }}}  
                                onChange={changePesoWarmup}/>
                            </td>
                            <td>
                                <input 
                                className='form-control border-0' 
                                type="text" 
                                defaultValue={elemento.video}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        editWarmup(elemento.warmup_id, elemento.name, elemento.sets, elemento.reps, elemento.peso, event.target.value, elemento.notas, elemento.numberWarmup)
                                    }}}  
                                onChange={changeVideoWarmup}/>
                            </td>
                            <td>
                                <button onClick={(e) => deleteWarmup(e,elemento.warmup_id,elemento.name) } className="btn ">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-trash3" viewBox="0 0 16 16">
                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                    </svg>
                                </button>
                                

                            </td>
                            </tr>
                        </CSSTransition>
                        )}
                        </TransitionGroup>
                        </tbody>
                    </table>
                </article>}
        </Modal.Body>
      </Modal>
  );
}

export default ModalCreateWarmup;
