
import { useEffect, useState } from 'react';
import {Link, useParams} from 'react-router-dom';
import * as WeekService from '../../services/week.services.js';
import Logo from '../../components/Logo'

import * as _ from 'lodash'


import { Steps, Panel, Placeholder, ButtonGroup, Button } from 'rsuite';
import ModalViewWarmup from '../../components/Bootstrap/ModalAthletes/ModalViewWarmup.jsx';

function DayDetailsPage(){
    const {id} = useParams()
    const {day_id} = useParams()
    const {index} = useParams()

    let numberStep = localStorage.getItem('step')
    let parsed = parseInt(numberStep)

    const [step, setStep] = useState(parsed);
    const [maxStep, setMaxStep] = useState();

    const [day, setDay] = useState([])
    const [valuesUniqs, setValuesUniqs] = useState([])

    const [showWarmup, setShowWarmup] = useState(false)

    useEffect(() => {
        WeekService.findRoutineByUserId(id)
        .then(data => { 
            
            let indexDay = data[index].routine.findIndex(dia => dia._id === day_id)
            let exercise = data[index].routine[indexDay].exercises
            let filtrado = exercise.filter(exe => exe.valueExercise == step + 1)

            setDay(filtrado)

            let values= []

            for (let i = 0; i < exercise.length; i++) {
                values.push(exercise[i].valueExercise)
            }

            let valuesUniqs = _.uniq(values);
            setValuesUniqs(valuesUniqs)
            setMaxStep(valuesUniqs.length)
          
        })
    }, [step])

  const onChange = nextStep => {
    localStorage.setItem('step', nextStep)
    setStep(nextStep < 0 ? 0 : nextStep > maxStep - 1 ? maxStep - 1 : nextStep);
    
  };

  const onNext = () => onChange(step + 1);
  const onPrevious = () => onChange(step - 1);

//Modal show warmup
function handleShowWarmup(){
    setShowWarmup(true)
}

const handleClose = () => {
    setShowWarmup(false);

} 

    return (

        <section className='container-fluid'>

            <Logo />

            <div className='row justify-content-center'>
                <button className='col-8 col-md-4 btn BlackBGtextWhite text-center' onClick={handleShowWarmup}>Entrada en calor</button>
            </div>

            <h2 className='text-center my-5'>Bloque {step + 1}</h2>

                <Panel>

                        <div className='row justify-content-center altoResponsive text-center m-0 p-0'>
                            <div className='col-12 col-md-10'>
                                <div className='table align-middle'>
                                    <table className='table table-bordered align-middle'>
                                        <thead>
                                            <tr>
                                                <th scope='col'>#</th>
                                                <th scope='col'>Ejercicio</th>
                                                <th scope='col'>#</th>
                                                <th scope='col'>#</th>
                                            </tr>
                                        </thead>
                                    
                                        <tbody className=''>

                                        {day.map(element =>
                                            <tr key={element.exercise_id}>
                                                <th>{element.numberExercise}</th>
                                                <td>
                                                    <span className='responsiveBlock'>{element.name} </span>
                                                    <span> {element.sets} x {element.reps} - {element.peso}</span>
                                                </td>
                                                <td>
                                                    <a href={element.video} target="blank">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera-video" viewBox="0 0 16 16">
                                                            <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                                                        </svg>    
                                                    </a>
                                                </td>
                                                <td>
                                                    <a href={element.video} target="blank">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-journal-text" viewBox="0 0 16 16">
                                                            <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                                                            <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
                                                            <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
                                                        </svg> 
                                                    </a>
                                                </td>
                                            </tr>
                                            )}
                                        </tbody>    

                                    </table>
                                </div>
                            </div>
                        </div>



                </Panel>
                <div className='row  justify-content-around'>
                        <Button onClick={onPrevious} className='col-5 col-md-1 BlackBGtextWhite btn text-center' disabled={step === 0}>
                                Izquierda
                        </Button>

                        <Button  disabled={step == maxStep - 1} onClick={onNext} className='col-5 BlackBGtextWhite btn col-md-1 text-center'>
                            Derecha
                        </Button>
                    </div>       
            


            


            


                        
            <div className='d-flex justify-content-center'>
                <Link className="btn BlackBGtextWhite text-center my-5" to={"/"}>Volver al inicio</Link>
            </div>

        <ModalViewWarmup showWarmup={showWarmup} handleClose={handleClose} user_id={id} day_id={day_id} />

        </section>


    )
}

export default DayDetailsPage