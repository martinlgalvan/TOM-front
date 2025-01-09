import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Tour } from 'antd'; // Importamos el componente Tour

import * as WeekService from '../../services/week.services.js';
import * as UserService from '../../services/users.services.js';
import * as ParService from '../../services/par.services.js';
import * as DayService from '../../services/day.services.js';
import * as NotifyHelper from './../../helpers/notify.js';
import * as RefreshFunction from './../../helpers/generateUUID.js';

import Logo from '../../components/Logo.jsx';
import ModalEditDay from '../../components/Bootstrap/ModalEdit/ModalEditDay.jsx';
import DeleteWeek from '../../components/DeleteActions/DeleteWeek.jsx';
import EditWeek from '../../components/EditActions/EditWeek.jsx';

import Floating from '../../helpers/Floating.jsx';

import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';

function UserRoutineEditPage() {
    const { id } = useParams();
    const { username } = useParams();
    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(false);

    const [routine, setRoutine] = useState([]);
    const [weekNumber, setWeekNumber] = useState(0);

    const [show, setShow] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showEditWeek, setShowEditWeek] = useState(false);
    
    const [weekName, setWeekName] = useState("");
    const [week_id, setWeek_id] = useState("");
    const [dayID, setDayID] = useState("");
    const user_id = localStorage.getItem("_id");

    const [copyWeek, setCopyWeek] = useState();
    const [weekClipboardLocalStorage, setWeekClipboardLocalStorage] = useState();
    const [tourSteps, setTourSteps] = useState([]);
    const [tourVisible, setTourVisible] = useState(false);

    let idRefresh = RefreshFunction.generateUUID();

    // Para mostrar la última fecha creada (si se usa la opción de fecha)
    const [weekDate, setWeekDate] = useState(() => {
        return localStorage.getItem("weekDate") || "";
    });


    const [useDate, setUseDate] = useState(() => {
        const saved = localStorage.getItem("useDate");
        return saved === "true";
    });

    // Al cambiar el switch, guardamos la preferencia en localStorage
    const handleToggleUseDate = () => {
        const newValue = !useDate;
        setUseDate(newValue);
        localStorage.setItem("useDate", newValue.toString());
    };

    // GET ITEM FROM LOCALSTORAGE  ---------------
    const copyRoutine = (data) => {
        setWeekClipboardLocalStorage(data);
    };

    useEffect(() => {
        setWeekClipboardLocalStorage(localStorage.getItem('userWeek'));
    }, [copyRoutine]);


    useEffect(() => {
        setTourSteps([
            {
                title: 'Switch de semana',
                description: 'Este switch permite que crees las semanas de manera numérica ( semana 1, semana 2, etc..) o, la creación de semanas a partir de la fecha actual.',
                target: () => document.getElementById('switchWeek'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Crear semana de 0',
                description: 'Este botón crea una semana de 0, ideal para comenzar un nuevo bloque.',
                target: () => document.getElementById('week0'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Continuar con la rutina',
                description: 'Este botón crea una copia de la última semana. Ideal para continuar el bloque de entrenamiento.',
                target: () => document.getElementById('continueWeek'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Pegar rutina del portapapeles',
                description: 'Botón para pegar una rutina, previamente copiada. Puede ser una rutina, tanto de otro alumno, como del que se encuentra.',
                target: () => document.getElementById('paste'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: '¡Finalizar!' }
            }
        ]);
    }, []);

    // Cargar la lista de semanas ------------------------------------------------ //
    useEffect(() => {
        setLoading(true);
        NotifyHelper.notifyA("Cargando semanas...");

        WeekService.findRoutineByUserId(id)
            .then(data => {
                setRoutine(data);
                setWeekNumber(data.length + 1);

                if (data.length === 0) { 
                    setCopyWeek(false); 
                } else { 
                    setCopyWeek(true); 
                }
                
                setLoading(false);
                NotifyHelper.updateToast();
            });
    }, [status, id]);

    // -------------------------------------
    // createWeek() -> crea semana con fecha o número
    // -------------------------------------
    function createWeek() {
        setLoading(true);
        
        let name;
        if (useDate) {
            // Usar fecha
            const currentDate = new Date().toLocaleDateString();
            localStorage.setItem("weekDate", currentDate);
            setWeekDate(currentDate);
            name = `Semana del ${currentDate}`;
        } else {
            // Usar numeración
            name = `Semana ${weekNumber}`;
        }

        WeekService.createWeek({ name }, id)
            .then(() => setStatus(idRefresh));
    }

    // Botón para clonar/continuar la última semana
    function createWeekCopyLastWeek() {
        setLoading(true);
        // Si quieres pasarle algún dato adicional según se use fecha o número:
        WeekService.createClonWeek(id, { fecha: useDate ? 'isDate' : 'noDate' })
            .then(() => {
                setStatus(idRefresh);
            });
    }

    // Botón para añadir día a una semana
    function addDayToWeek(week_id, number) {
        setLoading(true);
        DayService.createDay({ name: `Día ${number + 1}` }, week_id)
            .then(() => setStatus(idRefresh));
    }

    // Diálogos de Eliminar / Editar Semana
    const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState();
    const [showEditWeekDialog, setShowEditWeekDialog] = useState();
    const [selectedDay, setSelectedDay] = useState(null);

    const deleteWeek = (week_id, name) => {
        setWeekName(name);
        setWeek_id(week_id);
        setShowDeleteWeekDialog(true);
    };
    
    const editWeek = (week_id, name) => {
        setWeekName(name);
        setWeek_id(week_id);
        setShowEditWeekDialog(true);
    };
      
    const hideDialog = (load) => {
        if (load != null) setStatus(idRefresh);
        setShowDeleteWeekDialog(false);
        setShowEditWeekDialog(false);
    };

    function handleShowEdit(week_id, day_id, name) {
        setShowEdit(true);
        setWeek_id(week_id);
        setDayID(day_id);
        setWeekName(name);
    }

    const actionConfirm = () => {
        setShow(false);
        setShowEdit(false);
        setShowEditWeek(false);
    };

    const handleClose = () => {
        setShow(false);
        setShowEdit(false);
        setShowEditWeek(false);
        setStatus(idRefresh);
    };


    // COPY PASTE THINGS  ------------------------------------------- //
    const loadFromLocalStorage = () => {
        try {
            if (weekClipboardLocalStorage) {
                const parsedData = JSON.parse(weekClipboardLocalStorage);
                ParService.createPARroutine(parsedData, id)
                    .then(() => {
                        setLoading(idRefresh);
                        setStatus(idRefresh);
                        NotifyHelper.updateToast();
                    });
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
                <div className='row justify-content-center mt-2 '>
                    <h2 className='col-10 text-center mb-2 mt-3'>
                        Administración de semanas
                    </h2>

                    <p className='col-10 text-center mt-2'>
                        Estás en la planificación de <b>{username}</b>
                    </p>

                    <p className='col-10 text-center '>
                        <b>Para comenzar, presioná el botón y verás el funcionamiento. <button className='btn btn-warning' onClick={() => setTourVisible(true)}>Info</button></b>
                    </p>

                </div>

                <article className='row justify-content-center'>
                    <div className='col-12'>
                        <div className='row justify-content-center'>

                            {/* SWITCH: modo numérico / modo fecha */}
                            <div id='switchWeek' className="d-flex align-items-center justify-content-center mb-4 flex-column">
                                {/* Texto dinámico arriba del switch */}
                                <p>
                                    {useDate ? "Creación de semanas en base a la fecha actual" : "Creación de semanas de manera númerica"}
                                </p>
                                <label className="switch ">
                                    <input
                                        type="checkbox"
                                        checked={useDate}
                                        onChange={handleToggleUseDate}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="row justify-content-center align-items-center">
                                {/* Botón para crear semana (usa createWeek) */}
                                <button
                                    id='week0'
                                    className='col-10 col-lg-3 py-2 border card-shadow m-4'
                                    onClick={createWeek}
                                >
                                    <div  className='py-3'>
                                        <AddIcon />
                                        
                                            <p className='m-0'>
                                                Crear semana de 0
                                            </p>
                                        
                                    </div>
                                </button>

                                {/* Botón para clonar/continuar la última semana */}
                                {routine.length > 0 && (
                                    <button
                                        id='continueWeek'
                                        className='col-10 col-lg-3 py-2 border card-shadow m-3'
                                        onClick={createWeekCopyLastWeek}
                                    >
                                        <div className='py-3'>
                                            <LibraryAddIcon />
                                            <p className='m-0'>
                                                Continuar con la rutina
                                            </p>
                                        </div>
                                    </button>
                                )}

                                {/* Botón para pegar rutina del portapapeles */}
                                <button
                                    id='paste'
                                    className='col-10 col-lg-3 py-2 border card-shadow m-4'
                                    onClick={loadFromLocalStorage}
                                >
                                    <div className='py-3'>
                                        <ContentCopyIcon />
                                        <p className='m-0'>
                                            Pegar rutina del portapapeles
                                        </p>
                                    </div>
                                </button>
                            </div>


                            {/* Tabla con las rutinas */}
                            <PrimeReactTable_Routines
                                id={id}
                                username={username}
                                routine={routine}
                                setRoutine={setRoutine}
                                copyRoutine={copyRoutine}
                            />
                        </div>
                    </div> 
                </article>

                <Floating link={`/users/${user_id}`} />

                {/* Modales y diálogos */}
                <ModalEditDay
                    showEdit={showEdit}
                    handleClose={handleClose}
                    actionConfirm={actionConfirm}
                    week_id={week_id}
                    dayID={dayID}
                    nameExercise={weekName}
                />

                <EditWeek
                    visible={showEditWeekDialog}
                    onHide={hideDialog}
                    week_id={week_id}
                    defaultName={weekName}
                />

                <DeleteWeek
                    visible={showDeleteWeekDialog}
                    onHide={hideDialog}
                    week_id={week_id}
                    name={weekName}
                />


                                {/* TOUR */}
                                {tourVisible && (
                  <Tour
                    open={tourVisible}
                    steps={tourSteps}
                    onClose={(currentStep) => {
               
                      setTourVisible(false);
                    }}
                    onFinish={(currentStep) => {
               
                      setTourVisible(false);
                    }}
                    scrollIntoViewOptions={true}
                  />
                )}


            </section>
        </>
    );
}

export default UserRoutineEditPage;
