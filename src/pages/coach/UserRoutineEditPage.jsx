
import { useEffect, useState } from 'react';
import {Link, useParams, useNavigate} from 'react-router-dom';

import * as UsersService from '../../services/users.services.js';
import * as WeekService from '../../services/week.services.js';
import * as DayService from '../../services/day.services.js';


import Logo from '../../components/Logo.jsx'
import ModalConfirm from '../../components/Bootstrap/ModalDeleteWeek.jsx';
import ModalEditDay from '../../components/Bootstrap/ModalEdit/ModalEditDay.jsx';
import ModalEditWeek from '../../components/Bootstrap/ModalEdit/ModalEditWeek.jsx';


import { InputSwitch } from "primereact/inputswitch";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

function UserRoutineEditPage(){
    const {id} = useParams()
    const [status, setStatus] = useState(0)
    const navigate = useNavigate()
    

    const [routine, setRoutine] = useState([])
    const [weekNumber, setWeekNumber] = useState(0)

    const [show, setShow] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showEditWeek, setShowEditWeek] = useState(false);
    
    const [name, setName] = useState("")
    const [weekID, setWeekID] = useState("")
    const [dayID, setDayID] = useState("")
    const user_id = localStorage.getItem("_id")

    const [copyWeek, setCopyWeek] = useState();


    let refreshId = 1

    //Routine - API
    useEffect(() => {
        WeekService.findRoutineByUserId(id)
            .then(data => {   
                setRoutine(data)
                setWeekNumber(data.length + 1)
            })
    }, [status])

    useEffect(() => {
        WeekService.findRoutineByUserId(id)
            .then(data => {
                if(data.length == 0){
                    setCopyWeek(false)
                } else if(data.length > 0){
                    setCopyWeek(true)
                }
             })
    },[routine])

    //Botón para clonar semana
    function createWeek(){
        let number = `Semana ${weekNumber}`
        if(copyWeek == true){
            WeekService.createClonWeek(id)
            .then(() => {
                setStatus(weekNumber)

            })
    
        } else {
            WeekService.createWeek({name: number}, id)
            .then(() => {   
                setStatus(weekNumber)

            })
        }
    }
    
    const refresh = (refresh) => {
        setStatus(refresh)
    }

    function addDayToWeek(week_id){
        WeekService.findByWeekId(week_id)
            .then(data => {   
                let dayNumber = data[0].routine.length + 1
                DayService.createDay({name: `Día ${dayNumber}`}, week_id)
                setStatus(dayNumber)

            })
    }

    function handleDeleteWeek(week_id,week_name){

        setShow(true)
        setName(week_name)
        setWeekID(week_id)

    }

    function handleShowEdit(week_id, day_id,name){

        setShowEdit(true)
        setWeekID(week_id)
        setDayID(day_id)
        setName(name)

    }

    function handleShowEditWeek(week_id, name){
        setShowEditWeek(true)
        setWeekID(week_id)
        setName(name)

    }

    const handleClose = () => {
        setShow(false);
        setShowEdit(false)
        setShowEditWeek(false)
    } 

    return (

        <section className='container'>

            <Logo />
            <div className='row justify-content-center'>

                <h2 className='col-10 text-center'>Administrar semanas</h2>
                
            </div>

            <article className='row justify-content-center'>

                <div className='col-10 text-center my-4'>

                    <button onClick={createWeek} className='input-group-text btn BlackBGtextWhite text-center' >Crear semana <b className='fs-6'>{weekNumber}</b></button>
                    {routine.length > 0 &&
                    <div className='mt-3'> 
                        <InputSwitch tooltip="Copiar automaticamente una plantilla de la última semana. ¡Podés desactivarla en cualquier momento y crear una semana de 0!" tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15, style: {width: 20 + 'em'} }}  className='custom' checked={copyWeek} onChange={(e) => setCopyWeek(e.value)} />
                        <span className='displayFlexInMobile'>Copiar automaticamente una plantilla de la última semana. ¡Podés desactivarla en cualquier momento y crear una semana de 0!</span>
                    </div>}
                </div>

                <div className='col-10'>
                    <div className='row justify-content-center'>
                        <TransitionGroup component={null} className="todo-list">
                        {routine.length > 0 && routine.map(elemento =>
                        <CSSTransition
                        key={elemento._id}
                        timeout={500}
                        classNames="item"
                        >
                        <div key={elemento._id} className="card col-12 col-lg-5 text-center m-3">
                            <div className="card-body m-0 p-0">
                                <div className="menuColor py-1 row justify-content-center" >

                                    <h2 className='FontTitles m-0 py-2'>{elemento.name}</h2>
              
                                </div>
                                <TransitionGroup component={null} className="todo-list">
                                    {elemento.routine.map(element => 
                                    <CSSTransition
                                        key={element._id}
                                        timeout={500}
                                        classNames="item"
                                    >
                                        <div key={element._id} className='row justify-content-center mx-0 py-1 border-bottom'>

                                            <Link className='LinkDays col-10 ClassBGHover pt-2' to={`/routine/week/${elemento._id}/day/${element._id}`}>{element.name}</Link>
                                            
                                            <button onClick={() => handleShowEdit(elemento._id,element._id, element.name)} className=' col-2 btn ClassBGHover'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                </svg>
                                            </button>

                                        </div>
                                        </CSSTransition>
                                    )}
                                </TransitionGroup>
                                    <button onClick={(e) => addDayToWeek(elemento._id)} className='input-group-text btn border buttonColor mt-3'>+</button>

                            </div>
                            
                            <div className='row justify-content-between'>
                                <div className='col-5'>
                                    <button onClick={() => handleDeleteWeek(elemento._id, elemento.name)} className='m-1 btn border buttonColor buttonColorDelete'>Eliminar</button>
                                </div>
                                <div className='col-5'>
                                    <button onClick={() => handleShowEditWeek(elemento._id, elemento.name)} className='btn border buttonColor'>Editar</button> 

                                </div>
                            </div>
                            
                        </div>
                        </CSSTransition>
                        )}
                        </TransitionGroup>
                    </div>

                </div> 

            </article>
            
            <div className='d-flex flex-column align-items-center my-5'>
                <Link className='btn BlackBGtextWhite' to={`/users/${user_id}`}>Volver atrás</Link>
            </div>
            
            <ModalEditDay showEdit={showEdit} handleClose={handleClose} weekID={weekID} dayID={dayID} nameExercise={name} refresh={refresh}/>
            <ModalEditWeek showEditWeek={showEditWeek} nameWeek={name} handleClose={handleClose} weekID={weekID} refresh={refresh} />
            <ModalConfirm show={show}  handleClose={handleClose} name={name} weekID={weekID} refresh={refresh}/>

        </section>
    )
}

export default UserRoutineEditPage