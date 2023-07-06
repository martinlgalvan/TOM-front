
import { useEffect, useState } from 'react';
import {Link, useParams, useNavigate} from 'react-router-dom';

import * as UsersService from '../../services/users.services.js';
import * as WeekService from '../../services/week.services.js';
import * as DayService from '../../services/day.services.js';
import * as NotifyHelper from './../../helpers/notify.js'
import * as RefreshFunction from './../../helpers/generateUUID.js'


import Logo from '../../components/Logo.jsx'
import ModalDeleteWeek from '../../components/DeleteActions/DeleteWeek.jsx';
import ModalEditDay from '../../components/Bootstrap/ModalEdit/ModalEditDay.jsx';
import ModalEditWeek from '../../components/Bootstrap/ModalEdit/ModalEditWeek.jsx';
import SkeletonCard from '../../components/Skeleton/SkeletonCard.jsx';

import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from 'primereact/tooltip';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ToastContainer, toast } from 'react-toastify';
import DeleteWeek from '../../components/DeleteActions/DeleteWeek.jsx';
import EditWeek from '../../components/EditActions/EditWeek.jsx';



function UserRoutineEditPage(){
    const {id} = useParams()
    const [status, setStatus] = useState()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    /*const weeks = sessionStorage.getItem('U4S3R')
    let parsed = JSON.parse(weeks)
    let user = parsed.filter(weeks => weeks._id == id)
    let weeksSession = user[0].rutina*/


    const [routine, setRoutine] = useState([])
    const [weekNumber, setWeekNumber] = useState(0)

    const [show, setShow] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showEditWeek, setShowEditWeek] = useState(false);
    
    const [name, setName] = useState("")
    const [week_id, setWeek_id] = useState("")
    const [dayID, setDayID] = useState("")
    const user_id = localStorage.getItem("_id")



    const [copyWeek, setCopyWeek] = useState();

    let idRefresh = RefreshFunction.generateUUID()
   

    //Routine - API
    useEffect(() => {
        setLoading(true)
        NotifyHelper.notifyA("Cargando semanas...")
        
        /*let jsonDATA = JSON.stringify(parsed);
        sessionStorage.setItem('U4S3R', jsonDATA)*/
        
        WeekService.findRoutineByUserId(id)
            .then(data => {   
 
                setRoutine(data)
                setWeekNumber(data.length + 1)
                if(data.length == 0){
                    setCopyWeek(false)
                } else if(data.length > 0){
                    setCopyWeek(true)
                }
                
                setLoading(false)
                NotifyHelper.updateToast()
            })
    }, [status])


    //Botón para clonar semana
    function createWeek(){
        setLoading(true)
        let number = `Semana ${weekNumber}`
        if(copyWeek == true){
            WeekService.createClonWeek(id)
                .then((data) => {
                    console.log(data)
                    setStatus(idRefresh)
                })
        } else {
            WeekService.createWeek({name: number}, id)
                .then(() => setStatus(idRefresh))
        }
    }

    function addDayToWeek(week_id,number){
        setLoading(true)

        DayService.createDay({name: `Día ${number + 1}`}, week_id).then(() => setStatus(idRefresh))

    }

    const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState()
    const [showEditWeekDialog, setShowEditWeekDialog] = useState()

    const deleteWeek = (week_id, name) => {
        setName(name)
        setWeek_id(week_id)
        setShowDeleteWeekDialog(true);
      };
    
    const editWeek = (week_id, name) => {
        setName(name)
        setWeek_id(week_id)
        setShowEditWeekDialog(true);
    };
      
      const hideDialog = (load) => {
        load != null ? setStatus(idRefresh) : null
        setShowDeleteWeekDialog(false);
        setShowEditWeekDialog(false);
      };



    function handleShowEdit(week_id, day_id,name){

        setShowEdit(true)
        setWeek_id(week_id)
        setDayID(day_id)
        setName(name)

    }

    function handleShowEditWeek(week_id, name){
        setShowEditWeek(true)
        setWeek_id(week_id)
        setName(name)

    }

    const actionConfirm = () => {
        setShow(false);
        setShowEdit(false)
        setShowEditWeek(false)
    } 

    const handleClose = () => {
        setShow(false);
        setShowEdit(false)
        setShowEditWeek(false)
        setStatus(idRefresh)
    } 

    return (

        <section className='container'>

            <Logo />
            <div className='row justify-content-center my-5'>

                <h2 className='col-10 text-center mb-2'>Administración de semanas</h2>
                
            </div>

            <article className='row justify-content-center'>
                <div className='col-12 mx-2 text-center'>
                    <button onClick={createWeek} className='input-group-text btn BlackBGtextWhite text-center' >Crear semana <b className='fs-6'>{weekNumber}</b></button>
                </div>
                    {routine.length > 0 &&
                    
                    <div className='col-3 mt-4'> 
                        <div className='row justify-content-center my-3'>

                            <div className='col-6 text-end p-0 fs-5'>
                                <InputSwitch checked={copyWeek} onChange={(e) => setCopyWeek(e.value)} />
                            </div>

                            <div className='col-6 text-start'>
                                <Tooltip target=".custom-target-icon" />
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                className="bi bi-question-circle custom-target-icon"
                                data-pr-tooltip="Copiar automaticamente una plantilla de la última semana. ¡Podés desactivarla en cualquier momento y crear una semana de 0!"
                                data-pr-position="right"
                                data-pr-at="right+5 top"
                                data-pr-my="left center-20"
                                data-pr-classname='largoTooltip p-0 m-0'
                                style={{ fontSize: '3rem', cursor: 'pointer' }} 
                                viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                                </svg>
                            </div>
                            
                        </div>
                    </div>}


                <div className='col-12'>
                

                    <div className='row justify-content-center'>
                        <TransitionGroup component={null} className="todo-list">
                        {routine.length > 0 && routine.map((elemento, index) =>
                        <CSSTransition
                        key={elemento._id}
                        timeout={500}
                        classNames="item"
                        >
                        <div key={elemento._id} className="card col-12 col-lg-3 text-center m-3">
                            <div className="card-body m-0 p-0">
                                <div className="menuColor py-1 row justify-content-center titleWeek">

                                    <h2 className='FontTitles m-0 py-2'>{elemento.name}</h2>
              
                                </div>
                                
                                <TransitionGroup component={null} className="todo-list">
                                    {elemento.routine.map(element => 
                                    <CSSTransition
                                        key={element._id}
                                        timeout={400}
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
                                    <button disabled={loading} onClick={() => addDayToWeek(elemento._id,elemento.routine.length)} className='input-group-text btn border buttonColor mb-5 mt-3'>Añadir día</button>

                            </div>
                            
                            <div className='row justify-content-between'>
                                <div className='col-5'>
                                    <button onClick={() => deleteWeek(elemento._id, elemento.name)} className='btn border buttonColor buttonColorDelete'>Eliminar</button>
                                </div>
                                <div className='col-5'>
                                    <button onClick={() => editWeek(elemento._id, elemento.name)} className='btn border buttonColor'>Editar</button> 

                                </div>
                                <div className="card-footer textCreated mt-3">
                                {elemento.created_at.fecha} - {elemento.created_at.hora}
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
            
            <ModalEditDay showEdit={showEdit} handleClose={handleClose} actionConfirm={actionConfirm} week_id={week_id} dayID={dayID} nameExercise={name}/>
            <EditWeek visible={showEditWeekDialog} onHide={hideDialog} week_id={week_id} defaultName={name}  />
            
            <DeleteWeek visible={showDeleteWeekDialog} onHide={hideDialog} week_id={week_id} name={name} />

            <ToastContainer
                    position="bottom-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    />

        </section>
    )
}

export default UserRoutineEditPage