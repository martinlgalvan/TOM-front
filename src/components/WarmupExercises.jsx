import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';

import * as WeekService from '../services/week.services.js'

import CustomInputNumber from './CustomInputNumber.jsx'
import Exercises from './../assets/json/exercises.json';
import * as Notify from './../helpers/notify.js'

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import * as ExercisesService from '../services/exercises.services.js';

function WarmupExercises() {

  const [stat, setStat] = useState()
  const [confirm, setConfirm] = useState()
  const [warmup, setWarmup] = useState()
  const [exercises, setExercises] = useState([]);
  const {week_id} = useParams()
  const {day_id} = useParams()


useEffect(() => {
  setExercises(Exercises)
  Notify.notifyA("Cargando...")
  WeekService.findByWeekId(week_id)
      .then(data => {
          let indexWarmup = data[0].routine.findIndex(dia => dia._id === day_id)
          let exists = data[0].routine[indexWarmup].warmup
          
          setWarmup(exists)
          Notify.updateToast()


       })
},[stat])


    
  return (
    <>
                <article className="table-responsive border-bottom mb-5 pb-4">
                    <table className={`table align-middle table-bordered caption-top `}>
                        <caption>Entrada en calor</caption>
                        <thead>
                            <tr className='text-center'>
                                <th scope="col">#</th>
                                <th scope="col">Ejercicio</th>
                                <th scope="col">Series</th>
                                <th scope="col">Reps</th>
                            </tr>
                        </thead>
                        <tbody>

                        {warmup != null && warmup.map(({ warmup_id, name, sets, reps, peso, video, notas, numberWarmup }, index) =>

                            <tr key={warmup_id} className={`oo text-center`}>
                            <th scope="row">
                            
                            {index + 1} 
                           
                               </th>
                            <td>
                                {name}
                            </td>
                            <td>
                                {sets}
                            </td>
                            <td>
                              {reps}
                            </td>

                          </tr>
                        )}
                        </tbody>
                    </table>
                </article>

    </>
  );
}

export default WarmupExercises
