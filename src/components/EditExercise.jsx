import React, { useState } from 'react';
import { useEffect } from 'react';
import CustomInputNumber from './CustomInputNumber.jsx'
import * as Notify from './../helpers/notify.js'
import Options from '../assets/json/options.json';
import * as ExercisesService from '../services/exercises.services.js';


import { Dropdown } from 'primereact/dropdown';

function EditExercise({refreshEdit,  onHide, indexOfExercise, completeExercise, week_id, day_id, isAthlete}) {

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
  console.log(indexOfExercise, completeExercise, week_id, day_id, isAthlete)

}, []);

    
    const changePesoEdit = (index, e) => {
      const updatedModifiedDay = [...modifiedDay];
      updatedModifiedDay[index].peso = e.target.value;
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
  e.preventDefault()
  ExercisesService.editExercise(week_id, day_id, modifiedDay)
      .then((data) => {
        refreshEdit(false)
        onHide()
        Notify.instantToast('Rutina actualizada con éxito!')
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
        <input type="text" className="form-control" id="peso" placeholder="Peso" value={completeExercise[indexOfExercise].peso}   
        onInput={(e) => {
        changePesoEdit(indexOfExercise, e);
  }} />
      </div>

      {!isAthlete && <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Rest</label>
        <input disabled={isAthlete} type="text" className="form-control" id="rest" placeholder="Descanso" value={completeExercise[indexOfExercise].rest}  />
      </div>}

      {!isAthlete && <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Video</label>
        <input disabled={isAthlete} type="text" className="form-control" id="peso" placeholder="Video" defaultValue={completeExercise[indexOfExercise].video} />
      </div>}

      <div className="mb-3">
        <label htmlFor="peso" className="visually-hidden">Notas</label>
        <textarea type="text" className="form-control" id="peso" placeholder="Notas" defaultValue={completeExercise[indexOfExercise].notas} onChange={(e) => changeNotasEdit(indexOfExercise, e)}   />
      </div>

      <div className='mb-3 text-center'>
        <button type='submit' className={`btn ${textColor == 'false' ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }}>Editar</button>
      </div>

  </form>



    </>
  );
}

export default EditExercise
