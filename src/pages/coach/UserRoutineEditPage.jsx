
import { useEffect, useState } from 'react';
import {Link, useParams, useNavigate} from 'react-router-dom';

import * as WeekService from '../../services/week.services.js';
import * as UserService from '../../services/users.services.js';
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

function UserRoutineEditPage(){
    const {id} = useParams()
    const {username} = useParams()
    const [status, setStatus] = useState()
    const [loading, setLoading] = useState(false)



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

    let idRefresh = RefreshFunction.generateUUID()

    const [profileData, setProfileData] = useState(null);
    const [visible, setVisible] = useState(false);

    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))

    useEffect(() => {
        UserService.getProfileById(id)
            .then((data) => {
                const filteredDetails = filterInvalidDays(data.details);
                setProfileData({ ...data, details: filteredDetails });
                setDays(Object.keys(filteredDetails).map(day => ({ label: day, value: day })));
            })
            .catch((error) => {
                console.error('Error fetching profile data:', error);
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

    
    //Routine - API
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
        if(copyWeek == true){
            WeekService.createClonWeek(id)
                .then((data) => {
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


    const justifyTemplate = (option) => {
        return <div className='col-2'>d</div>;
    }


    const renderProfileData = () => {
        if (!profileData) {
            return <p>No hay datos disponibles.</p>;
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



    return (

        <section className='container'>

            <Logo />
            <div className='row justify-content-center mt-2 mb-5'>

                <h2 className='col-10 text-center mb-2'>Administración de semanas</h2>

                <p className='col-10 text-center mt-2'>Estás en la planificación de <b>{username}</b> </p>

                    <p className='text-center'>Acá tendrás el perfil de tu alumno, toda la información necesaria para mejorar la calidad de tus planificaciones.</p>

                    <button className='btn colorProfile text-light col-4 mb-3' onClick={openDialog}>Ver perfil</button>

                    <p className='col-10 text-center mb-2'>
                        <b>Para comenzar, por favor, creá una semana. Vas a poder</b>
                    </p>

                    <ul className="list-group list-group-flush text-center">
                        <li className="list-group-item">Añadir días de entrenamiento</li>
                        <li className="list-group-item">Dentro de los días, vas a poder añadir tanto su entrada en calor, como su planificación.</li>
                    </ul>

                

            </div>

            <article className='row justify-content-center'>
                <div className='col-12 mx-2 text-center mb-2'>
                    <button onClick={createWeek} className={`input-group-text btn ${textColor == 'false' ? "bbb" : "blackColor"} text-center`} style={{ "backgroundColor": `${color}` }} >Crear semana <b className='fs-6'>{weekNumber}</b></button>
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

                        {routine.length > 0 && routine.map((elemento, index) =>

                        <div key={elemento._id} className="card col-12 col-lg-3 text-center m-3">
                            <div className="card-body m-0 p-0">
                                <div className="menuColor py-1 row justify-content-center titleWeek">

                                    <h2 className='FontTitles m-0 py-2'>{elemento.name}</h2>
              
                                </div>
                                

                                    {elemento.routine.map(element => 

                                        <div key={element._id} className='row justify-content-center mx-0 py-1 border-bottom'>

                                            <Link className='LinkDays col-10 ClassBGHover pt-2' to={`/routine/user/${id}/week/${elemento._id}/day/${element._id}/${username}`}>{element.name}</Link>
                                            
                                            <button onClick={() => handleShowEdit(elemento._id,element._id, element.name)} className=' col-2 btn ClassBGHover'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                </svg>
                                            </button>

                                        </div>
                                  
                                    )}
       
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
          
                        )}

                    </div>

                </div> 

            </article>

            <Floating link={`/users/${user_id}`} />

            <Dialog header={`Perfil de ${username}`} visible={visible} style={{ width: '90vw' }} modal onHide={closeDialog}>
                {renderProfileData()}
            </Dialog>
           
            
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
    )
}

export default UserRoutineEditPage