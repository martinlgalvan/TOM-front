import React, { useState } from 'react';
import { useEffect } from 'react';
import CustomInputNumber from './CustomInputNumber.jsx'
import * as Notify from './../helpers/notify.js'
import Options from '../assets/json/options.json';
import * as ExercisesService from '../services/exercises.services.js';

import { ToastContainer } from './../helpers/notify.js';
import { Dropdown } from 'primereact/dropdown';

function EditExercise({refreshEdit, indexOfExercise, completeExercise, week_id, day_id, isAthlete}) {

const [options, setOptions] = useState()  

const [completeName, setCompleteName] = useState()
const [modifiedDay, setModifiedDay] = useState([])

const [completeSets, setCompleteSets] = useState()
const [completeReps, setCompleteReps] = useState()
const [completePeso, setCompletePeso] = useState()
const [completeVideo, setCompleteVideo] = useState()
const [completeNotas, setCompleteNotas] = useState()

const [color, setColor] = useState(localStorage.getItem('color'))
const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))


useEffect(() => {
  const groupedOptions = Options.reduce((acc, group) => {
    acc.push({ label: group.label, value: group.value, disabled: null });
    acc.push(...group.items);
    return acc;
  }, [])
  
  setOptions(groupedOptions)

  setModifiedDay(completeExercise)

}, []);

useEffect(() => {
 console.log(completeExercise)

}, []);


    // EDIT EXERCISES

    const changeNumberExercise = (index, e) => {

      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].numberExercise = e.target.value;
      setModifiedDay(updatedModifiedDay);
    };

    const changeNameEdit = (index, e) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].name = e.target.value;
      setModifiedDay(updatedModifiedDay);
    };
    
    const changePesoEdit = (index, e) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].peso = e.target.value;
      setModifiedDay(updatedModifiedDay);
    };

    const changeSetEdit = (index, newValue) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].sets = newValue;
      setModifiedDay(updatedModifiedDay);
    };
    
    const changeRepEdit = (index, newValue) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].reps = newValue;
      setModifiedDay(updatedModifiedDay);
    };

    const changeRestEdit = (index, e) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].rest = e.target.value;
      setModifiedDay(updatedModifiedDay);
    };
    
    const changeVideoEdit = (index, e) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].video = e.target.value;
      setModifiedDay(updatedModifiedDay);
    };
    
    const changeNotasEdit = (index, e) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].notas = e.target.value;
      setModifiedDay(updatedModifiedDay);
    };
    
    // Resto de funciones de cambio...


// Resto de funciones de cambio...


function onSubmit(e){
  console.log(modifiedDay)
  e.preventDefault()
  Notify.notifyA("Cargando")
  ExercisesService.editExercise(week_id, day_id, modifiedDay)
      .then(() => {
        refreshEdit(false)
        Notify.updateToast()
      } )
  
  
 
}
    
  return (
    <>
    <form className='row justify-content-center' onSubmit={onSubmit}>
    {isAthlete && <p className='fs-5'>{completeExercise[indexOfExercise].name}</p>}
    {!isAthlete &&  
        <div  className='col-6 mb-3'>
          <Dropdown 
            value={completeExercise[indexOfExercise].numberExercise} 
            options={options} 
            onChange={(e) => {changeNumberExercise(indexOfExercise,e)}}
            placeholder="Select an item"
            optionLabel="label"
            className="p-dropdown-group w-100"
          />
        </div>}
        
      {!isAthlete && <div className="mb-3 col-11">
        <label htmlFor="name" className="visually-hidden">Nombre</label>
        <input disabled={isAthlete} type="text" className="form-control" id="name" placeholder="Nombre" defaultValue={completeExercise[indexOfExercise].name} onChange={(e) => changeNameEdit(indexOfExercise, e)}  />
      </div>}

      {!isAthlete && <div className="mb-3 col-6  text-center">
        <label htmlFor="peso" className="text-center mb-2">Series</label>
        <CustomInputNumber
                disabled={isAthlete} 
                initialValue={completeExercise[indexOfExercise].sets}
                onChange={(value) => changeSetEdit(indexOfExercise, value)}
                />
      </div>}

      {!isAthlete && <div className="mb-3 col-6 text-center">
        <label htmlFor="peso" className=" mb-2">Reps</label>
        <CustomInputNumber 
                disabled={isAthlete}
                initialValue={completeExercise[indexOfExercise].reps}
                onChange={(value) => changeRepEdit(indexOfExercise, value)}
                />
      </div>}

      <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Peso</label>
        {isAthlete && <p>Peso</p>}
        <input type="text" className="form-control" id="peso" placeholder="Peso" defaultValue={completeExercise[indexOfExercise].peso} onChange={(e) => changePesoEdit(indexOfExercise, e)}   />
      </div>

      {!isAthlete && <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Rest</label>
        <input disabled={isAthlete} type="text" className="form-control" id="rest" placeholder="Descanso" defaultValue={completeExercise[indexOfExercise].rest} onChange={(e) => changeRestEdit(indexOfExercise, e)}   />
      </div>}

      {!isAthlete && <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Video</label>
        <input disabled={isAthlete} type="text" className="form-control" id="peso" placeholder="Video" defaultValue={completeExercise[indexOfExercise].video} onChange={(e) => changeVideoEdit(indexOfExercise, e)}   />
      </div>}

      <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Notas</label>
        <textarea type="text" className="form-control" id="peso" placeholder="Notas" defaultValue={completeExercise[indexOfExercise].notas} onChange={(e) => changeNotasEdit(indexOfExercise, e)}   />
      </div>

      <div className='mb-3 text-center'>
        <button type='submit' className={`btn ${textColor == 'false' ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }}>Editar</button>
      </div>

  </form>

    <ToastContainer
        position="bottom-center"
        autoClose={200}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
     />

    </>
  );
}

export default EditExercise
