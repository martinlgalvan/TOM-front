
import { useEffect, useState } from 'react';
import {Link, useParams} from 'react-router-dom';
import * as WeekService from '../../services/week.services.js';
import Logo from '../../components/Logo.jsx'
import { Dialog } from 'primereact/dialog';

function UserRoutinePage(){
    const {id} = useParams()

    const [routine, setRoutine] = useState([])
    const [pressedRoutine, setPressedRoutine] = useState([])
    const [indexRoutine, setIndexRoutine] = useState([])

    const [days, setDays] = useState([])
    const [warmup, setWarmup] = useState([])
    const [exercises, setExercises] = useState([])
    const [visibleEdit, setVisibleEdit] = useState(false);              //-------------------*

    const handleCloseDialog = () => setVisibleEdit(false)

    useEffect(() => {
        WeekService.findRoutineByUserId(id)
        .then(data => {     
            console.log(data)
            setRoutine(data)
        })
    }, [])

    const seeRoutine = (i) => {
        setPressedRoutine(routine[i].routine)
        setIndexRoutine(routine[i])
        setVisibleEdit(true)
        // abrir modal con el objeto entero, y luego seppararlo dentro de la modal.
    }

    const openRoutine = () => {

       
    }


    return (
        
        <section className='container'>

            <Logo />

            <h2 className='text-center mt-4 mb-3'>Ver rutina</h2>

            <p className='my-3 text-center'>Acá vas a encontrar todas las semanas de tu planificación. Desplega la semana y accedé al día de entrenamiento que te corresponde!</p>

            <article className='row justify-content-center mb-4'>
                {routine != null && 
                <div className="accordion col-10 col-md-4" id="Routine">
                    {routine.map((week,indexWeek) =>
                    <div key={week._id} className="accordion-item mb-3 border-0 border-top border-bottom">
                        <h2 className="accordion-header border-0">
                            <button className="accordion-button collapsed colorAccordion rounded-0 "  type="button" data-bs-toggle="collapse" data-bs-target={`#${week._id}`} aria-expanded="false" aria-controls="collapseOne">
                                <div className='row justify-content-center text-center'>
                                    <span className='fs-5'>{week.name}</span> 
                                    <span className='textCreated'> {week.created_at.fecha}</span>
                                </div>

                            </button>
                        </h2>
                        <div id={week._id} className="accordion-collapse collapse" data-bs-parent="#Routine">
                            
                            <div className="accordion-body ">
                                <ul className='list-group'>
                                    <li className='list-group-item border-1 border-bottom text-center m-0 p-2   '><button onClick={() => seeRoutine(indexWeek)} className='btn '>Ver semana completa</button></li>
                                </ul>
                            {week.routine.map((day, index) => 
                                <ul key={index} className="list-group  rounded-0">
                                    <Link className='list-group-item border-0 border-bottom text-center m-0 p-3 ClassBGHover' to={`/routine/${id}/day/${day._id}/${week._id}/${indexWeek}`}>{day.name}</Link>
                                </ul>)}
                            </div>
                            
                        </div>

                    </div>)}
                </div>
                }
            </article>

            {routine && <Dialog 
                    className='col-12 col-md-10 col-xxl-8' 
                    contentClassName={'colorDialog'} 
                    headerClassName={'colorDialog'} 
                    header={indexRoutine.name}
                    visible={visibleEdit} 
                    modal={false} 
                    onHide={() => setVisibleEdit(false)}>

                        <section>
                            <div className="table-responsive">
                            {pressedRoutine.length > 0 && pressedRoutine.map(day => 
                            <>     
                            <table className="table table-bordered align-middle text-center table-md">
                                <thead>
                                    <tr>
                                        <th colSpan={8}>{day.name}</th>
                                    </tr>
                                </thead>
                                <thead>
                                    <tr>
                                        <th className="text-center">#</th>
                                        <th className="text-center">Nombre</th>
                                        <th className="text-center">Sets</th>
                                        <th className="text-center">Reps</th>
                                        <th className="text-center">Rest</th>
                                        <th className="text-center">Peso</th>
                                        <th className="text-center">Video</th>
                                        <th className="text-center">Notas</th>
                                    </tr>
                                </thead>
                                <tbody>

                                        {day.exercises.map(exercise => (
                                            <tr key={exercise.exercise_id}>
                                                <td className="text-center "><b>{exercise.numberExercise}</b></td>
                                                <td className="text-center ">{exercise.name}</td>
                                                <td className="text-center ">{exercise.sets}</td>
                                                <td className="text-center ">{exercise.reps}</td>
                                                <td className="text-center ">-</td>
                                                <td className="text-center ">{exercise.peso}</td>
                                                <td className="text-center ">{exercise.video ? <a target='_blank' href={exercise.video}>
                                                <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-camera-video"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"
                                                        />
                                                    </svg>
                                                </a> : '-'}</td>
                                                <td className="text-center ">{exercise.notas || '-'}</td>
                                            </tr>
                                        ))}
                                    
                                    
                                </tbody>
                            </table></>)}
                            </div>
                        </section>

                </Dialog>}
        </section>
    )
}

export default UserRoutinePage