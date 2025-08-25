import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import * as WeekService from '../../services/week.services.js';
import * as UserServices from './../../services/users.services.js';
import * as NotifyHelper from './../../helpers/notify.js';

import Logo from '../../components/Logo.jsx';
import ActionAreaCard from '../../components/MUI/ActionAreaCard.jsx';
import { UserLock, Dumbbell, Calendar, Bolt} from 'lucide-react';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CircleIcon from '@mui/icons-material/Circle';
import ViewStreamIcon from '@mui/icons-material/ViewStream';

function UserRoutinePage() {
    const { id } = useParams();
    const username = localStorage.getItem('name');

    const navigate = useNavigate()
    const [routine, setRoutine] = useState([]);
    const [pressedRoutine, setPressedRoutine] = useState([]);
    const [indexRoutine, setIndexRoutine] = useState([]);
    const [visibleEdit, setVisibleEdit] = useState(false);
    // Nuevo estado para controlar el modal cuando no existe perfil
    const [showProfileMissingModal, setShowProfileMissingModal] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const isPaid = localStorage.getItem('state');
    const puedeVerRutina = isPaid === 'permitir' || isPaid === 'true' || isPaid === null || isPaid === undefined;

    // Crear un array vacío para referencias múltiples
    const weekRefs = useRef([]);

    const handleCloseDialog = () => setVisibleEdit(false);

    // ==== Helpers de fecha para orden y display ====
    const parseDDMMYYYY = (fechaStr = '', horaStr = '') => {
        try {
            const [d, m, y] = (fechaStr || '').split('/').map(n => parseInt(n, 10));
            const [hh = 0, mm = 0] = (horaStr || '00:00').split(':').map(n => parseInt(n, 10));
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d, hh, mm, 0, 0);
        } catch {
            return null;
        }
    };

    const toTimestampSafe = (value) => {
        if (!value) return 0;
        if (value instanceof Date) return value.getTime();
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const t = new Date(value).getTime();
            return Number.isFinite(t) ? t : 0;
        }
        if (typeof value === 'object') {
            // Soporta { fecha: 'dd/MM/yyyy', hora: 'HH:mm' }
            const maybe = parseDDMMYYYY(value.fecha, value.hora);
            return maybe ? maybe.getTime() : 0;
        }
        return 0;
    };

    // ⬇⬇⬇ CAMBIO: ordenar SIEMPRE por created_at (DESC)
    const getSortTime = (week) => {
        return toTimestampSafe(week?.created_at);
    };
    // ⬆⬆⬆

    // Etiqueta a mostrar en la UI: visible_at (si existe) o created_at
    const getWeekDateLabel = (week) => {
        if (week?.visible_at) {
            const ts = toTimestampSafe(week.visible_at);
            if (ts) return new Date(ts).toLocaleDateString('es-AR');
        }
        const ca = week?.created_at;
        if (ca && typeof ca === 'object' && 'fecha' in ca) {
            return ca.fecha || '—';
        }
        const ts = toTimestampSafe(ca);
        return ts ? new Date(ts).toLocaleDateString('es-AR') : '—';
    };
    // ===============================================

    useEffect(() => {
        WeekService.findRoutineByUserId(id)
            .then(data => {
                // Mostrar solo semanas visibles: si no existe la prop, se considera visible
                const visibleWeeks = Array.isArray(data)
                  ? data.filter(w => !w?.visibility || w.visibility === 'visible')
                  : [];

                // ⬇⬇⬇ CAMBIO: Ordenar SOLO por created_at; DESC (más reciente primero)
                const sorted = [...visibleWeeks].sort((a, b) => getSortTime(b) - getSortTime(a));
                // ⬆⬆⬆

                setRoutine(sorted);
                NotifyHelper.instantToast('Semanas cargadas con éxito');
            });
    }, [id]);

    // useEffect para observar la visibilidad de las semanas
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    } else {
                        entry.target.classList.remove('in-view');
                    }
                });
            },
            {
                threshold: 0.1, // Solo observa cuando el 10% del elemento está visible
            }
        );

        // Observa cada uno de los elementos referenciados
        weekRefs.current.forEach(ref => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            // Limpia el observador cuando el componente se desmonta
            weekRefs.current.forEach(ref => {
                if (ref) {
                    observer.unobserve(ref);
                }
            });
        };
    }, [routine]);

    useEffect(() => {
        UserServices.getProfileById(id)
        .then((data) => {
            setUserProfile(data);
        })
        .catch((error) => {
            console.error("Error al obtener el perfil del alumno:", error);
        });
    }, [id]);

    const seeRoutine = (i) => {
        setPressedRoutine(routine[i].routine);
        setIndexRoutine(routine[i]);
        setVisibleEdit(true);
    };

    const redirectToPerfil = (i) => {
        setShowProfileMissingModal(false)
        navigate(`/perfil/${id}`)
    };

    const navigateToPage = (week_id, index_week) => {
        navigate(`/routine/${id}/day/0/${week_id}/${index_week}`)
    };

    return (
        <>
            <section className='container-fluid p-0'>
                <Logo />
            </section>

            
                <section className='container'>
            {puedeVerRutina ? ( <>
                <div className='transition-rigth-to-medium'>
                    <h2 className='text-center mt-4 mb-3'>Hola {username}!</h2>
                    <p className='my-3 text-center'>
                        Debajo, verás todas las semanas que tu entrenador cargó.
                    </p>
                </div>

                {userProfile && userProfile.devolucion && (
                    <div className="card p-3 my-3">
                        <h5 className="card-title">Correcciones / Devolución</h5>
                        {userProfile.devolucionFecha && (
                        <p className="text-muted">
                            Fecha: {new Date(userProfile.devolucionFecha).toLocaleString()}
                        </p>
                        )}
                        <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {userProfile.devolucion ? userProfile.devolucion : "No se han cargado correcciones."}
                        </p>
                    </div>
                )}


                {routine != null && (
                    <article className='row justify-content-center mb-4 mt-4'>
                    
                            {routine.map((week, indexWeek) => {
                                // Alternar clases dinámicas para cada entrada según su posición
                                const animationClass = indexWeek % 3 === 0
                                    ? 'from-left'
                                    : indexWeek % 3 === 1
                                    ? 'from-center'
                                    : 'from-right';

                                return (
                                    <div
                                        ref={el => (weekRefs.current[indexWeek] = el)}  // Asignar ref dinámicamente a cada elemento
                                        key={indexWeek}
                                        className={`col-11 stylesBoxWeeks box pt-2 pb-1 mt-2 ${animationClass} mb-4 rounded-3`} // Clases dinámicas añadidas
                                        onClick={() => navigateToPage(week._id, indexWeek)}
                                        >
                                        <div className='row'>
                                            <div className='col-1'>
                                                <CircleIcon className='fs07em text-primary' />
                                            </div>
                                            <div className='col-11'>
                                                <p className='m-0'>{week.name}</p>
                                            </div>

                                            <div className='col-5 mt-3 mb-2'>
                                                <div className='row badgeFecha rounded-2 py-1 m-auto'>
                                                    <div className='col-3 ps-1 m-auto'><CalendarTodayIcon className='fs08em text-primary' /></div>
                                                    {/* Muestra visible_at si existe; si no, created_at */}
                                                    <div className='col-8 ps-0 fs07em m-auto'>
                                                        {getWeekDateLabel(week)}
                                                    </div>
                                                </div>
                                            </div>

                                            {week.block && week.block.name && <div className='col-7 mt-3 mb-2' >
                                                <div className='row badgeFecha rounded-2 py-1 m-auto' style={{backgroundColor: `${week.block.color}`}}>
                                                    <div className='col-2 ps-1 m-auto'><ViewStreamIcon className='fs07em'/></div>
                                                    <div className='col-10 fs07em m-auto px-0'>{week.block.name}</div>
                                                </div>
                                            </div> }
                                        
                                            
                                        </div>
                                    </div>
                                );
                            })}
                     
                   
                </article> )}

                </> ) : 
                (
               <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5 px-4 card shadow-sm bg-light">
                    <UserLock />
                    <h4 className="mb-3 text-danger fw-bold">Acceso restringido</h4>
                    <p className="text-muted text-center" style={{ maxWidth: '500px' }}>
                        Para poder visualizar tu rutina de entrenamiento, es necesario que tengas la mensualidad al día.
                    </p>
                    <p className="text-muted text-center" style={{ maxWidth: '500px' }}>
                        Si creés que esto es un error, por favor <strong>contactá con tu entrenador</strong>.
                    </p>
                </div>
                )}
                {routine && (
                    <Dialog
                        className='col-12 col-md-10 col-xxl-8'
                        contentClassName={'colorDialog'}
                        headerClassName={'colorDialog'}
                        header={indexRoutine.name}
                        visible={visibleEdit}
                        modal={false}
                        onHide={() => setVisibleEdit(false)}>
                        <section>
                            <div className="table-responsive">
                                {pressedRoutine.length > 0 && pressedRoutine.map(day => (
                                    <table className="table table-bordered align-middle text-center table-md" key={day.name}>
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
                                                    <td className="text-center"><b>{exercise.numberExercise}</b></td>
                                                    <td className="text-center">{exercise.name}</td>
                                                    <td className="text-center">{exercise.sets}</td>
                                                    <td className="text-center">{exercise.reps}</td>
                                                    <td className="text-center">{exercise.rest ? exercise.rest : "-"}</td>
                                                    <td className="text-center">{exercise.peso}</td>
                                                    <td className="text-center">{exercise.video ? (
                                                        <a target='_blank' rel="noreferrer" href={exercise.video}>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                fill="currentColor"
                                                                className="bi bi-camera-video"
                                                                viewBox="0 0 16 16">
                                                                <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z" />
                                                            </svg>
                                                        </a>
                                                    ) : '-'}</td>
                                                    <td className="text-center">{exercise.notas || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ))}
                            </div>
                        </section>
                    </Dialog>
                )}

                {/* Nuevo Dialog para mostrar el mensaje cuando no existe el perfil */}
                <Dialog
                    header={`Completa tu perfil`}
                    visible={showProfileMissingModal}
                    style={{ width: '90vw' }}
                    modal
                    onHide={() => setShowProfileMissingModal(false)}
                    footer={
                                <div className="row justify-content-center mt-2">
                                               <div  className="col-6 text-center">
                                                    <Button label="Más tarde" onClick={() => setShowProfileMissingModal(false)} className="p-button-secondary text-light " />
                                                </div>
                                                <div className="col-6 text-center">
                                                    <Button label="Ir al perfil " onClick={redirectToPerfil} className="p-button-primary text-light " />
                                                </div>
                                              </div>
                    }
                >
                    <p>Hola {username}!, por favor completá tu perfil, así tu entrenador tiene tu información.</p>
                </Dialog>
            </section>
        </>
    );
}

export default UserRoutinePage;
