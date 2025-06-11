import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import * as WeekService from '../../services/week.services.js';
import * as UserServices from './../../services/users.services.js';
import * as NotifyHelper from './../../helpers/notify.js';

import Logo from '../../components/Logo.jsx';
import ActionAreaCard from '../../components/MUI/ActionAreaCard.jsx';
import { UserLock} from 'lucide-react';

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

    // useEffect para cargar las rutinas del usuario
    useEffect(() => {
        WeekService.findRoutineByUserId(id)
            .then(data => {
                setRoutine(data);
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

    return (
        <>
            <section className='container-fluid p-0'>
                <Logo />
            </section>

            
                <section className='container'>
            {puedeVerRutina ? ( <>
                <div className='transition-rigth-to-medium'>
                    <h2 className='text-center mt-4 mb-3'>Ver rutina</h2>
                    <p className='my-3 text-center'>
                        Acá vas a encontrar todas las semanas de tu planificación. Desplega la semana y accedé al día de entrenamiento que te corresponde!
                    </p>
                </div>

                {userProfile && (
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


                <article className='row justify-content-center mb-4'>
                    {routine != null && (
                        <div className="accordion col-12 col-md-4" id="Routine">
                            {routine.map((week, indexWeek) => {
                                // Alternar clases dinámicas para cada entrada según su posición
                                const animationClass = indexWeek % 3 === 0
                                    ? 'from-left'
                                    : indexWeek % 3 === 1
                                    ? 'from-center'
                                    : 'from-right';

                                return (
                                    <Link
                                        ref={el => (weekRefs.current[indexWeek] = el)}  // Asignar ref dinámicamente a cada elemento
                                        key={indexWeek}
                                        className={`list-group-item border-0 border-bottom text-center m-0 p-3 ClassBGHover box ${animationClass}`} // Clases dinámicas añadidas
                                        to={`/routine/${id}/day/0/${week._id}/${indexWeek}`}>
                                        <ActionAreaCard title={week.name} body={week.created_at.fecha} />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </article>

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
