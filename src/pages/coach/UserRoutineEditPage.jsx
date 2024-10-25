
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

import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from 'primereact/tooltip';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog } from 'primereact/dialog';
import { Segmented } from 'antd';
import { SelectButton } from 'primereact/selectbutton';

import Floating from '../../helpers/Floating.jsx';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';



function UserRoutineEditPage(){
    const {id} = useParams()
    const {username} = useParams()
    const [status, setStatus] = useState()
    const [loading, setLoading] = useState(false)
    const [copyWeekStorage, setCopyWeekStorage] = useState()


    const [routine, setRoutine] = useState([])
    const [weekNumber, setWeekNumber] = useState(0)
    const [days, setDays] = useState("")


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

    const [profileData, setProfileData] = useState(null);
    const [visible, setVisible] = useState(false);

    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))


    // PROFILE DATA --------------------------------------------------  //

    useEffect(() => {
        UserService.getProfileById(id)
            .then((data) => {
                const filteredDetails = filterInvalidDays(data.details);
                setProfileData({ ...data, details: filteredDetails });
                setDays(Object.keys(filteredDetails).map(day => ({ label: day, value: day })));
            })
            .catch((error) => {
            });
    }, [id]);

    useEffect(() => {
        if (profileData && profileData.details) {
            const days = Object.keys(profileData.details);
            if (days.length > 0) {
                setSelectedDay(days[0]);
            }
        }
    }, [profileData]);

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

    const calculateNumericAverage = (details, field) => {
        const validValues = Object.values(details)
            .map(day => day[field])
            .filter(value => value !== undefined && value !== null && value !== 0);
    
        if (validValues.length === 0) return 'N/A';
    
        const total = validValues.reduce((sum, value) => sum + value, 0);
        return (total / validValues.length).toFixed(2);
    };
    
    const calculateCategoricalAverage = (details, field) => {
        const options = [
            { label: 'Muy bajo', value: 1 },
            { label: 'Bajo', value: 2 },
            { label: 'Moderado', value: 3 },
            { label: 'Alto', value: 4 },
            { label: 'Muy alto', value: 5 }
        ];
        const validValues = Object.values(details)
            .map(day => day[field])
            .filter(value => value !== undefined && value !== null && value !== 0);
    
        if (validValues.length === 0) return 'N/A';
    
        const total = validValues.reduce((sum, value) => sum + value, 0);
        const average = total / validValues.length;
        const closestOption = options.reduce((prev, curr) => Math.abs(curr.value - average) < Math.abs(prev.value - average) ? curr : prev);
        return closestOption.label;
    };

    const filterInvalidDays = (details) => {
        return Object.entries(details).reduce((acc, [day, values]) => {
            const validValues = Object.values(values).filter(value => value !== undefined && value !== null && value !== 0);
            if (validValues.length > 0) {
                acc[day] = values;
            }
            return acc;
        }, {});
    };

    const getLabel = (value) => {
        const options = [
            { label: 'Muy bajo', value: 1 },
            { label: 'Bajo', value: 2 },
            { label: 'Moderado', value: 3 },
            { label: 'Alto', value: 4 },
            { label: 'Muy alto', value: 5 }
        ];
        const option = options.find(option => option.value === value);
        return option ? option.label : 'Desconocido';
    };

    const renderProfileData = () => {
        if (!profileData) {
            return  <div className='row justify-content-center'>
                        <div className='col-10 col-lg-4'>

                            <div className=' text-center'>
                                <p>No hay datos disponibles.</p>
                                <p>Estos datos pueden ayudarte a la hora de planificar, por lo tanto, podés pedirle a tus alumnos que lo completen al finalizar su semana de entrenamiento.</p>
                            </div>

                            <div className=' text-center m-3'>
                                <p>Los datos que se analizan, son: <strong>fatiga, horas de sueño, DOMS, NEAT, estrés, nutrición</strong></p>
                                <p>También, pueden añadir datos como su peso corporal, y un resumen semanal sobre como fue su semana.</p>
                            </div>
                        </div>;

                                            
                    </div>

        }

        return (
            <div className="row justify-content-center text-center">

            <div>
                <p>{username} editó esto por última vez el</p>
                <p><b>{profileData.last_edit.fecha}</b> - <b>{profileData.last_edit.hora}</b></p>
                
            </div>


            <div className="col-10">
                <p className='text-center'><strong className='d-block'>Peso Corporal</strong> {profileData.bodyWeight} kg</p>
                <p className='text-center'><strong className='d-block'>Resumen semanal</strong>{profileData.summary}</p>
            </div>

            <div className="col-10 col-lg-6">
                <div className='row justify-content-center'>
                    <div className='col-10 col-lg-6 text-center'>
                        <h4 className='mb-4'>Promedio semanal</h4>
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <td><strong>Fatiga</strong></td>
                                    <td>{calculateNumericAverage(profileData.details, 'fatigueLevel')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Horas de Sueño</strong></td>
                                    <td>{calculateNumericAverage(profileData.details, 'sleepHours')}</td>
                                </tr>
                                <tr>
                                    <td><strong>DOMS</strong></td>
                                    <td>{calculateNumericAverage(profileData.details, 'domsLevel')}</td>
                                </tr>
                                <tr>
                                    <td><strong>NEAT</strong></td>
                                    <td>{calculateCategoricalAverage(profileData.details, 'neatLevel')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Estrés</strong></td>
                                    <td>{calculateCategoricalAverage(profileData.details, 'stressLevel')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Nutrición</strong></td>
                                    <td>{calculateCategoricalAverage(profileData.details, 'nutrition')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className='col-10 col-lg-6'>
                <div className="row ">
                        <SelectButton
                            value={selectedDay}
                            options={days}
                            onChange={(e) => setSelectedDay(e.value)}
                            className='select-button'
                        />
                </div>
                <div className="day-profileData.details mt-4">
                    {selectedDay && (
                        <div className='text-center'>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td><strong>Fatiga</strong></td>
                                        <td>{profileData.details[selectedDay].fatigueLevel == null ? 'Sin datos' : profileData.details[selectedDay].fatigueLevel}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Horas de Sueño</strong></td>
                                        <td>{profileData.details[selectedDay].sleepHours  == null ? 'Sin datos' : profileData.details[selectedDay].sleepHours}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>DOMS</strong></td>
                                        <td>{profileData.details[selectedDay].domsLevel  == null ? 'Sin datos' : profileData.details[selectedDay].domsLevel}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>NEAT</strong></td>
                                        <td>{getLabel(profileData.details[selectedDay].neatLevel) == null ? 'Sin datos' : getLabel(profileData.details[selectedDay].neatLevel)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Estrés</strong></td>
                                        <td>{getLabel(profileData.details[selectedDay].stressLevel) == null ? 'Sin datos' : getLabel(profileData.details[selectedDay].stressLevel)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Nutrición</strong></td>
                                        <td>{getLabel(profileData.details[selectedDay].nutrition) == null ? 'Sin datos' : getLabel(profileData.details[selectedDay].nutrition)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
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

                                {routine.length > 0 && <button className='col-10 col-lg-3 py-2 border card-shadow m-3' onClick={createWeekCopyLastWeek}>
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

            <div className='row justify-content-center'>

                <Dialog header={`Perfil de ${username}`} className='col-10 col-lg-8' visible={visible}  modal onHide={closeDialog}>
                    {renderProfileData()}
                </Dialog>
                           
            </div>
            
            <ModalEditDay showEdit={showEdit} handleClose={handleClose} actionConfirm={actionConfirm} week_id={week_id} dayID={dayID} nameExercise={weekName}/>
            <EditWeek visible={showEditWeekDialog} onHide={hideDialog} week_id={week_id} defaultName={weekName}  />
            
            <DeleteWeek visible={showDeleteWeekDialog} onHide={hideDialog} week_id={week_id} name={weekName} />

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
    </>    
)
}

export default UserRoutineEditPage