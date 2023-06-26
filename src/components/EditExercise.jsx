import React, { useState } from 'react';
import { useEffect } from 'react';
import CustomInputNumber from './CustomInputNumber.jsx'

import * as ExercisesService from '../services/exercises.services.js';

function EditExercise({refreshEdit,functionEdit, completeExercise}) {


const [completeName, setCompleteName] = useState()
const [completeSets, setCompleteSets] = useState()
const [completeReps, setCompleteReps] = useState()
const [completePeso, setCompletePeso] = useState()
const [completeVideo, setCompleteVideo] = useState()
const [completeNotas, setCompleteNotas] = useState()

const changeNameEdit = (e) => setCompleteName(e.target.value)
const changeSetsEdit = (e) => setCompleteSets(e.target.value)
const changeRepsEdit = (e) => setCompleteReps(e.target.value)
const changePesoEdit = (e) => setCompletePeso(e.target.value)
const changeVideoEdit = (e) => setCompleteVideo(e.target.value)
const changeNotasEdit = (e) => setCompleteNotas(e.target.value)

function onSubmit(e){
  e.preventDefault()

  functionEdit(
    completeExercise.exercise_id, 
    completeName == null ? completeExercise.name : completeName, 
    completeSets == null ? completeExercise.sets : completeSets, 
    completeReps == null ? completeExercise.reps : completeReps, 
    completePeso == null ? completeExercise.peso : completePeso, 
    completeVideo == null ? completeExercise.video : completeVideo, 
    completeNotas == null ? completeExercise.notas : completeNotas)
  refreshEdit(e)
 
}
    
  return (
    <>
    <form className='row justify-content-center' onSubmit={onSubmit}>

      <div className="mb-3">
        <label for="name" className="visually-hidden">Nombre</label>
        <input type="text" className="form-control" id="name" placeholder="Example input placeholder" onChange={changeNameEdit} defaultValue={completeExercise.name} />
      </div>

      <div className="mb-3">
        <label for="peso" className="visually-hidden">Series</label>
        <CustomInputNumber 
                initialValue={completeExercise.sets}
                onChange={(value) => setCompleteSets(value)}
                />
      </div>

      <div className="mb-3">
        <label for="peso" className="visually-hidden">Repeticiones</label>
        <CustomInputNumber 
                initialValue={completeExercise.reps}
                onChange={(value) => setCompleteReps(value)}
                />
      </div>

      <div className="mb-3">
        <label for="peso" className="visually-hidden">Peso</label>
        <input type="text" className="form-control" id="peso" placeholder="Another input placeholder" onChange={changePesoEdit} defaultValue={completeExercise.peso}  />
      </div>

      <div className="mb-3">
        <label for="peso" className="visually-hidden">Video</label>
        <input type="text" className="form-control" id="peso" placeholder="Another input placeholder" onChange={changeVideoEdit} defaultValue={completeExercise.video}  />
      </div>

      <div className="mb-3">
        <label for="peso" className="visually-hidden">Notas</label>
        <input type="text" className="form-control" id="peso" placeholder="Another input placeholder" onChange={changeNotasEdit} defaultValue={completeExercise.notas}  />
      </div>

      <div className='mb-3'>
        <button type='submit'>Editar</button>
      </div>

  </form>

    </>
  );
}

export default EditExercise
