import { useState,useRef, useEffect } from "react";
import * as RandomizerColumns from "../../services/randomizerColumn.services.js";

import Exercises from './../assets/json/exercises.json'

import {  } from "react";



function AddExerciseToColumn({refresh, handleCloseDialog,databaseExercises}) {


  useEffect(() => {
    const local = localStorage.getItem('DATABASE_USER')
    
    if(local != null){
      setExercises(databaseExercises)
    } else{
      setExercises(Exercises);
    }

    // PROBAR GUARDAR UNA PLANTILLA CON LOS SETS Y REPS YA PLANTEADOS, Y SOLO HACER UN RANDOM DE LOS EJERCICIOS

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
    <></>

  );
}

export default AddExerciseToColumn;
