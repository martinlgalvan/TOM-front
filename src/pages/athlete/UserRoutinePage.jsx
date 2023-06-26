
import { useEffect, useState } from 'react';
import {Link, useParams} from 'react-router-dom';
import * as WeekService from '../../services/week.services.js';
import Logo from '../../components/Logo.jsx'

function UserRoutinePage(){
    const {id} = useParams()

    const [routine, setRoutine] = useState([])
    const [days, setDays] = useState([])
    const [warmup, setWarmup] = useState([])
    const [exercises, setExercises] = useState([])

    useEffect(() => {
        WeekService.findRoutineByUserId(id)
        .then(data => {     
            setRoutine(data)
        })
    }, [])


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
                            {week.routine.map((day, index) => 
                                <ul key={index} className="list-group  rounded-0">
                                    <Link className='list-group-item border-0 border-bottom text-center m-0 p-3 ClassBGHover' to={`/routine/${id}/day/${day._id}/${indexWeek}`}>{day.name}</Link>
                                </ul>)}
                            </div>
                            
                        </div>
                    </div>)}
                </div>
                }
            </article>

        </section>
    )
}

export default UserRoutinePage