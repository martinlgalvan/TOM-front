
import { useEffect, useState } from 'react';
import {Link, useParams, useNavigate} from 'react-router-dom';



import * as WeekService from '../../services/week.services.js';
import * as UserService from '../../services/users.services.js';
import * as ParService from '../../services/par.services.js';
import * as DayService from '../../services/day.services.js';
import * as NotifyHelper from './../../helpers/notify.js'
import * as RefreshFunction from './../../helpers/generateUUID.js'


import Logo from '../../components/Logo.jsx'
import ModalEditDay from '../../components/Bootstrap/ModalEdit/ModalEditDay.jsx';
import DeleteWeek from '../../components/DeleteActions/DeleteWeek.jsx';
import EditWeek from '../../components/EditActions/EditWeek.jsx';

import Floating from '../../helpers/Floating.jsx';

import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';



function UserRoutineEditPage(){
    const {id} = useParams()
    const {username} = useParams()
    const [status, setStatus] = useState()
    const [loading, setLoading] = useState(false)



    const [routine, setRoutine] = useState([])
    const [weekNumber, setWeekNumber] = useState(0)



    const [show, setShow] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showEditWeek, setShowEditWeek] = useState(false);
    
    const [weekName, setWeekName] = useState("")
    const [week_id, setWeek_id] = useState("")
    const [dayID, setDayID] = useState("")
    const user_id = localStorage.getItem("_id")


    const [copyWeek, setCopyWeek] = useState();
    const [weekClipboardLocalStorage, setWeekClipboardLocalStorage] = useState();

    let idRefresh = RefreshFunction.generateUUID()

    const [visible, setVisible] = useState(false);




    // PROFILE DATA --------------------------------------------------  //


    //--------- GET ITEM FROM LOCALSTORAGE  ---------------

    const copyRoutine = (data) =>{
        setWeekClipboardLocalStorage(data)
    }

    useEffect(() => {
        setWeekClipboardLocalStorage(localStorage.getItem('userWeek'))
    }, [copyRoutine]);


    
    // Routine data main ------------------------------------------------ //

    useEffect(() => {
        setLoading(true)
        NotifyHelper.notifyA("Cargando semanas...")
        
        WeekService.findRoutineByUserId(id)
            .then(data => {   
        
                setRoutine(data)
                setWeekNumber(data.length + 1)

                if(data.length == 0) { 
                    setCopyWeek(false) 
                } else if(data.length > 0) { 
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
        WeekService.createWeek({name: number}, id)
            .then(() => setStatus(idRefresh))
    }

    function createWeekCopyLastWeek(){
        setLoading(true)
        WeekService.createClonWeek(id)
            .then((data) => {
                setStatus(idRefresh)
            })
    }

    function addDayToWeek(week_id,number){
        setLoading(true)

        DayService.createDay({name: `Día ${number + 1}`}, week_id)
            .then(() => setStatus(idRefresh))

    }

    const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState()
    const [showEditWeekDialog, setShowEditWeekDialog] = useState()
    const [selectedDay, setSelectedDay] = useState(null);

    const deleteWeek = (week_id, name) => {
        setWeekName(name)
        setWeek_id(week_id)
        setShowDeleteWeekDialog(true);
      };
    
    const editWeek = (week_id, name) => {
        setWeekName(name)
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
        setWeekName(name)

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


    const openDialog = () => {
        setVisible(true);
    };

    const closeDialog = () => {
        setVisible(false);
    };




// COPY PASTE THINGS  ------------------------------------------- //

  const loadFromLocalStorage = () => {
    try {
      if (weekClipboardLocalStorage) {
        const parsedData = JSON.parse(weekClipboardLocalStorage);
        ParService.createPARroutine(parsedData, id)
            .then((data) => {
                setLoading(idRefresh)
                setStatus(idRefresh)
                NotifyHelper.updateToast()
            })
      } else {
        alert('No hay datos en localStorage!');
      }
    } catch (err) {
      console.error('Error al cargar desde localStorage: ', err);
    }
  };








    return (
    <>
        <div className='container-fluid p-0'>
            <Logo />
        </div>

        <section className='container'>

            <div className='row justify-content-center mt-2 mb-5'>

                <h2 className='col-10 text-center mb-2'>Administración de semanas</h2>

                <p className='col-10 text-center mt-2'>Estás en la planificación de <b>{username}</b> </p>

                    <p className='text-center'>Acá tendrás el perfil de tu alumno, toda la información necesaria para mejorar la calidad de tus planificaciones.</p>

                    <button className='btn colorProfile text-light col-4 my-3' onClick={openDialog}>Ver perfil</button>

                    <p className='col-10 text-center mb-2'>
                        <b>Para comenzar, por favor, creá una semana. Vas a poder</b>
                    </p>

                    <ul className="list-group list-group-flush text-center">
                        <li className="list-group-item">Añadir días de entrenamiento</li>
                        <li className="list-group-item">Dentro de los días, vas a poder añadir tanto su entrada en calor, como su planificación.</li>
                    </ul>

                

            </div>

            <article className='row justify-content-center'>

                <div className='col-12'>

                    <div className='row justify-content-center'>


                    
                        <div className="row justify-content-center align-items-center" >
                            
                                <button className='col-10 col-lg-3 py-2 border card-shadow m-4' onClick={createWeek}>
                                    <div className='py-3'>
                                  
                                        <AddIcon />
                                    
                                    <p className='m-0'>Crear nueva semana</p>
                                    </div>
                                </button>

                                {routine.length > 0 && <button className='col-10 col-lg-3 py-2 border card-shadow m-3' onClick={() => createWeekCopyLastWeek()}>
                                    <div className='py-3'>
                                    
                                        <LibraryAddIcon />
                                    
                                    <p className='m-0'>Continuar con la rutina</p>
                                    </div>
                                </button> }

                                <button className='col-10 col-lg-3 py-2 border card-shadow m-4' onClick={loadFromLocalStorage}>
                                    <div className='py-3'>
                                    
                                        <ContentCopyIcon />
                                    
                                    <p className='m-0'>Pegar rutina del portapapeles</p>
                                    </div>
                                </button>
                        
                        </div>

                    <article className='row justify-content-center'>

                        


                    </article>

                    <PrimeReactTable_Routines id={id} username={username} routine={routine} setRoutine={setRoutine} copyRoutine={copyRoutine}/>


                    </div>

                </div> 

            </article>

            <Floating link={`/users/${user_id}`} />

            
            <ModalEditDay showEdit={showEdit} handleClose={handleClose} actionConfirm={actionConfirm} week_id={week_id} dayID={dayID} nameExercise={weekName}/>
            <EditWeek visible={showEditWeekDialog} onHide={hideDialog} week_id={week_id} defaultName={weekName}  />
            
            <DeleteWeek visible={showDeleteWeekDialog} onHide={hideDialog} week_id={week_id} name={weekName} />



        </section>
    </>    
)
}

export default UserRoutineEditPage