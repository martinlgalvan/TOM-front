import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

//.............................. SERVICES ..............................//
import * as WeekService from '../../services/week.services.js';
import * as ParService from '../../services/par.services.js';
import * as UserServices from '../../services/users.services.js';

//.............................. HELPERS ..............................//
import * as NotifyHelper from './../../helpers/notify.js';
import * as RefreshFunction from './../../helpers/generateUUID.js';

//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { Tour } from 'antd';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';

//.............................. COMPONENTES ..............................//
import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';
import LogoChico from '../../components/LogoChico.jsx';

//.............................. ICONOS MUI ..............................//
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';


function UserRoutineEditPage() {

    const { id } = useParams();
    const { username } = useParams();

    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(false);
    const [routine, setRoutine] = useState([]);
    const [weekNumber, setWeekNumber] = useState(0);
    const [weekClipboardLocalStorage, setWeekClipboardLocalStorage] = useState();
    const [collapsed, setCollapsed] = useState(false);
    const [tourSteps, setTourSteps] = useState([]);
    const [tourVisible, setTourVisible] = useState(false);
    const [firstWidth, setFirstWidth] = useState();

    const [profile, setProfile] = useState(true); // NUEVO ESTADO

    const [weekDate, setWeekDate] = useState(() => {
        return localStorage.getItem("weekDate") || "";
    });

    const [useDate, setUseDate] = useState(() => {
        const saved = localStorage.getItem("useDate");
        return saved === "true";
    });
    
    // NUEVO ESTADO PARA isEditable
    const [isEditable, setIsEditable] = useState(() => {
        const saved = localStorage.getItem("isEditable");
        return saved === "true";
    });

    useEffect(() => {
        setTourSteps([
            {
                title: 'Alumno actual',
                description: `Este es el nombre del alumno en el que te encontrás. Las semanas pertecenen a ${username}`,
                target: () => document.getElementById('alumno'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
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
    }, [username]);

    useEffect(() => {
        setLoading(true);
        setFirstWidth(window.innerWidth);
        NotifyHelper.notifyA("Cargando semanas...");

        WeekService.findRoutineByUserId(id)
            .then(data => {
                console.log(data)
                setRoutine(data);
                setWeekNumber(data.length + 1);
                setLoading(false);
                NotifyHelper.updateToast();
            });
    }, [status, id]);

    useEffect(() => {
        UserServices.getProfileById(id)
            .then((data) => {
                setProfile(data);
            })
            .catch((error) => {
                console.error("Error al obtener el perfil del usuario:", error);
            });
    }, [id]);

    const copyRoutine = (data) => {
        setWeekClipboardLocalStorage(data);
    };

    useEffect(() => {
        setWeekClipboardLocalStorage(localStorage.getItem('userWeek'));
    }, [copyRoutine]);

    const handleToggleUseDate = () => {
        const newValue = !useDate;
        setUseDate(newValue);
        localStorage.setItem("useDate", newValue.toString());
    };



    function createWeek() {
        setLoading(true);

        let name;
        if (useDate) {
            const currentDate = new Date().toLocaleDateString();
            localStorage.setItem("weekDate", currentDate);
            setWeekDate(currentDate);
            name = `Semana del ${currentDate}`;
        } else {
            name = `Semana ${weekNumber}`;
        }

        // Se envía la propiedad isEditable en el objeto a crear
        WeekService.createWeek({ name }, id)
            .then(() => setStatus(RefreshFunction.generateUUID()));
    }

    function createWeekCopyLastWeek() {
        setLoading(true);
        WeekService.createClonWeek(id, { fecha: useDate ? 'isDate' : 'noDate' })
            .then(() => {
                setStatus(RefreshFunction.generateUUID());
            });
    }

    const loadFromLocalStorage = () => {
        try {
            if (weekClipboardLocalStorage) {
                const parsedData = JSON.parse(weekClipboardLocalStorage);
                ParService.createPARroutine(parsedData, id)
                    .then(() => {
                        setLoading(false);
                        setStatus(RefreshFunction.generateUUID());
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
            <div className="sidebarPro">
                <Sidebar
                    collapsed={collapsed}
                    collapsedWidth={'85px'}
                    width="200px"
                    backgroundColor="colorMain"
                    rootStyles={{ color: 'white', border: 'none' }}
                >
                    <Menu>
                        <MenuItem
                            onClick={() => setCollapsed(!collapsed)}
                            className="mt-3"
                            icon={<ViewHeadlineIcon />}
                            style={{ height: 'auto', whiteSpace: 'normal' }}
                        >
                            <span>Ocultar barra</span>
                        </MenuItem>

                        <MenuItem id={'alumno'} icon={collapsed ? <PersonIcon /> : ''} disabled={!collapsed} className="mt-3 ">
                            <div className="bg-light rounded-2 text-center">
                                <p className="m-0">Alumno <strong className="d-block">{username}</strong></p>
                            </div>
                        </MenuItem>

                        <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} id='switchWeek' className="mt-4">
                            <div className="bg-light rounded-2 text-center ">
                                <div className="d-flex align-items-center justify-content-center flex-column ">
                                    <p className='mt-1 mb-0'>{useDate ? "Modo fecha" : "Modo numérico"}</p>
                                    <label className="switch mb-2">
                                        <input type="checkbox" checked={useDate} onChange={handleToggleUseDate} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </MenuItem>



                        {profile && 
                        <>
                        <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} disabled={!collapsed} id='switchWeek' className="mt-4">
                            <div className='row justify-content-around'>
                                <div className='col-6'>
                                    <p className='text-light text-start p-1'>Edad</p> 
                                </div>
                                <div className='col-6 '>
                                    <p className='text-dark rounded-2 colorItems text-center p-1'>{profile.edad || '-'}</p>
                                </div>
                            </div>
                        </MenuItem>

                        <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} disabled={!collapsed} id='switchWeek' className="">
                            <div className='row justify-content-around'>
                                <div className='col-6'>
                                    <p className='text-light text-start p-1'>Peso</p> 
                                </div>
                                <div className='col-6  '>
                                    <p className='text-dark rounded-2 colorItems text-center p-1'>{profile.peso || '-'}kg</p>
                                </div>
                            </div>
                        </MenuItem>

                        <MenuItem icon={collapsed ? <ToggleOnIcon /> : ''} disabled={!collapsed} id='switchWeek' className="">
                            <div className='row justify-content-around '>
                                <div className='col-6 '>
                                    <p className='text-light text-start p-1'>Altura</p> 
                                </div>
                                <div className='col-6 '>
                                    <p className='text-dark colorItems rounded-2 text-center p-1'>{profile.altura || '-'}cm</p>
                                </div>
                            </div>
                        </MenuItem>
                        </>}

                        <MenuItem disabled className="margenLogoUserRoutine ">
                            <LogoChico />
                        </MenuItem>

                        <MenuItem className="mt-3 text-center botonHelpEdit" onClick={() => setTourVisible(true)}>
                            <IconButton className="p-2 bg-light ">
                                <HelpOutlineIcon className="text-dark" />
                            </IconButton>
                            <span className="ms-2">Ayuda</span>
                        </MenuItem>
                    </Menu>
                </Sidebar>
            </div>

            <section className='container-fluid totalHeight'>

                <article className={`row justify-content-center ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>

                    {!profile &&
                        <div className="col-10 col-sm-6 col-xl-4 mb-4">
                            <div className="alert alert-warning text-center p-3">
                                <strong>Este alumno aún no cargó su perfil.</strong><br />
                                Se le notificará para que lo llene.
                            </div>
                        </div>
                    }
                
                    {firstWidth < 983 && <div>

                    {profile && (
                        <div className="col-12">
                            <div className=" p-3 ">
                                <h5 className="text-center mb-3">{username}</h5>
                                <div className="row justify-content-center">
                                    <div className="row justify-content-center">

                                        <div className='col-6 my-2'>
                                            <b className='bg-dark text-light p-2'>Peso</b> 
                                            <b className='text-dark colorItems p-2'>{profile.peso || '-'} kg</b>
                                        </div>

                                        <div className='col-6 my-2'>
                                            <b className='bg-dark text-light p-2'>Altura</b> 
                                            <b className='text-dark colorItems p-2'>{profile.altura || '-'} cm</b>
                                        </div>
                                        
                                        <div className='col-6 my-2'>
                                            <b className='bg-dark text-light p-2'>Modalidad</b> 
                                            <b className='text-dark colorItems p-2'>{profile.modalidad || '-'}</b>
                                        </div>

                                    </div>
                                    <div className="col-12 mt-3"><strong>Resumen semanal:</strong><p className="mt-2">{profile.resumen_semanal || 'Sin información.'}</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                    </div>}

                    <div className="row text-center justify-content-center marginTableRoutine align-middle align-center align-items-center ">

                        {firstWidth < 983 && (
                            <>
                                <div className="col-10 col-lg-3 mx-2 mb-4 boxData">
                                    <div className="bg-light rounded-2 text-center ">
                                        <div className="d-flex align-items-center justify-content-center flex-column ">
                                            <p className='mt-1 mb-0'>{useDate ? "Modo fecha" : "Modo numérico"}</p>
                                            <label className="switch mb-2">
                                                <input type="checkbox" checked={useDate} onChange={handleToggleUseDate} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </>
                        )}

                        <div className="col-10 col-lg-3 mx-2 mb-4 boxData">
                            <button id={'week0'} className="btn p-3" onClick={createWeek}>
                                <AddIcon className="me-2" />
                                <span className=" me-1">Nueva semana</span>
                            </button>
                        </div>

                        <div id='continueWeek' className="col-10 col-lg-3 mx-2 mb-4 boxData" onClick={createWeekCopyLastWeek}>
                            <button disabled={routine.length === 0} className="btn p-3 disabledButton">
                                <LibraryAddIcon className="me-2" />
                                Seguir semana
                            </button>
                        </div>

                        <div id='paste' className="col-10 col-lg-3 mx-2 mb-4 boxData">
                            <button className="btn p-3 " onClick={loadFromLocalStorage}>
                                <ContentCopyIcon className="me-2" />
                                <span className=" me-1">Pegar rutina</span>
                            </button>
                        </div>
                    </div>

                    <div className='col-12'>
                        <div className='row justify-content-center'>
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

                {tourVisible && (
                    <Tour
                        open={tourVisible}
                        steps={tourSteps}
                        onClose={() => setTourVisible(false)}
                        onFinish={() => setTourVisible(false)}
                        scrollIntoViewOptions={true}
                    />
                )}
            </section>
        </>
    );
}

export default UserRoutineEditPage;
