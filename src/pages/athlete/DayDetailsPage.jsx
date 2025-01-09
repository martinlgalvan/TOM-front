import { useEffect, useState, useRef, useCallback } from "react";
import { Fragment } from 'react';
import { Link, useParams } from "react-router-dom";
import { Tour } from 'antd'; // Importamos el componente Tour

import * as WeekService from "../../services/week.services.js";
import * as UserService from "../../services/users.services.js";
import * as ExercisesService from "../../services/exercises.services.js"; 
import * as Notify from './../../helpers/notify.js'

import Logo from "../../components/Logo.jsx";
import EditExercise from '../../components/EditExercise.jsx'; // (Si fuera necesario, según tu estructura)
import Contador from "../../helpers/Contador.jsx";
import Floating from "../../helpers/Floating.jsx";

import ReactPlayer from 'react-player';
import * as _ from "lodash";

import { Carousel } from 'primereact/carousel';
import { Sidebar } from 'primereact/sidebar';
import { Segmented } from 'antd';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import CommitIcon from '@mui/icons-material/Commit';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PercentIcon from '@mui/icons-material/Percent';
import PercentageCalculator from "../../components/PercentageCalculator.jsx";
import CountdownTimer from "../../components/CountdownTimer.jsx";
import ImageIcon from '@mui/icons-material/Image';


//QUE PUEDA SER PERSONALIZABLE PARA CADA ENTRENADOR
//Crear botón que permita actualizar y luego de confirmar??? (thomas)
//Confirmación al escribir de eliminación de usuario

function DayDetailsPage() {
    const { id, week_id, index } = useParams();
    const op = useRef(null);

    const [day_id, setDay_id] = useState();             // Carga del array principal de ejercicios
    const [allDays, setAllDays] = useState([]); 
    const [modifiedDay, setModifiedDay] = useState([]); // Array donde se copia la nueva rutina
    const [nameWeek, setNameWeek] = useState();
    const [firstValue, setFirstValue] = useState();
    const [status, setStatus] = useState(false); // <--- Inicializamos en false (siempre)

    const [currentDay, setCurrentDay] = useState(null);

    // Modal para edición de ejercicio en versión mobile/desktop
    const [editExerciseMobile, setEditExerciseMobile] = useState(false);

    // Este estado guardará los datos del ejercicio que se está editando
    const [completeExercise, setCompleteExercise] = useState();
    
    // Estados para calculadora y dialog de videos
    const [showCalculator, setShowCalculator] = useState(false);
    const [showUploadVideos, SetShowUploadVideos] = useState(false);

    const [expanded, setExpanded] = useState(false);
    const [isRendered, setIsRendered] = useState();
    const [tourSteps, setTourSteps] = useState([]);
    const [tourVisible, setTourVisible] = useState(false);

    const contadorRef = useRef(null);
    // Refs para las Cards (si necesitas hacer scroll u otras interacciones)
    const cardRefs = useRef([]);

    // Dialog de edición de ejercicio
    const [indexOfExercise, setIndexOfExercise] = useState();

    // Visibilidad del Sidebar de videos
    const [visible, setVisible] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);

    const [drive, setDrive] = useState(localStorage.getItem('drive'));

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const toggleUploadVideos = () => {
        SetShowUploadVideos(false);
    };

    // Función para alternar la visibilidad de la calculadora
    const toggleCalculator = () => {
        setShowCalculator(!showCalculator);
    };

    // CHANGES: 1er useEffect para obtener la rutina, pero sin forzar 'currentDay' a 0
    useEffect(() => {
      if (!week_id) return; // Pequeña verificación
      WeekService.findByWeekId(week_id).then((data) => {
        if (!data?.length) return;
        setAllDays(data[0].routine);
        setNameWeek(data[0].name);

        // Si 'currentDay' nunca se definió (null), arrancamos en 0
        // Si ya tenía valor, lo dejamos.
        setCurrentDay(prev => (prev === null ? 0 : prev));
      });
    }, [week_id, status]); 

    // CHANGES: 2do useEffect para setear day_id, modifiedDay, etc. en base al currentDay
    useEffect(() => {
      if (allDays.length && currentDay !== null) {
        setDay_id(allDays[currentDay]._id);
        setModifiedDay(allDays[currentDay].exercises);
        setFirstValue(allDays[currentDay].name);
      }
    }, [allDays, currentDay]);

    // Cargar URL del drive si no está en localStorage
    useEffect(() => {
        if (!localStorage.getItem('drive')) {
            UserService.findUserById(localStorage.getItem('entrenador_id')).then((data) => {
              if(data.drive){
                localStorage.setItem('drive', data.drive);
              }
            });
        }
    }, [drive]);

    // Configurar pasos para el Tour
    useEffect(() => {
        setTourSteps([
            {
                title: 'Número de serie',
                description: 'Este número indica el orden de los ejercicios. También puede haber super series (3-A, por ejemplo)',
                target: () => document.getElementById('numeroSerie'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Nombre del ejercicio',
                description: 'Este es el ejercicio a realizar.',
                target: () => document.getElementById('nombre'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Contador de series',
                description: 'Este contador te servirá para no perderte entre tus series! Simplemente presionalo y llevá un conteo.',
                target: () => document.getElementById('contador'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Series',
                description: 'Número de series a realizar',
                target: () => document.getElementById('series'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Repeticiones',
                description: 'Número de repeticiones a realizar. También pueden ser segundos.',
                target: () => document.getElementById('reps'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Peso',
                description: 'Kilos ( o libras ) para realizar las series.',
                target: () => document.getElementById('peso'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Descanso',
                description: 'Descanso indicado por el entrenador entre series. El temporizador está con el tiempo correspondiente a cada ejercicio. ( indicado por el entrenador )',
                target: () => document.getElementById('descanso'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Video/imagen',
                description: 'Acá podes encontrar una imagen o video representativo del ejercicio',
                target: () => document.getElementById('video'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: 'Siguiente »' }
            },
            {
                title: 'Edición',
                description: 'Esta es la forma de comunicarle a tu entrenador las cosas: tanto el peso, observaciones, o subir videos a su drive.',
                target: () => document.getElementById('edicion'),
                placement: 'top',
                prevButtonProps: { children: '« Anterior' },
                nextButtonProps: { children: '¡Finalizar!' }
            },
        ]);
    }, []);

    const playerOptions = {
        playerVars: {
            controls: 1,
            disablekb: 1,
            modestbranding: 1,
            showinfo: 1,
            rel: 1,
        }
    };

    // Función de refresco (la usas cuando editas, etc.)
    const refreshEdit = (refresh) => {
        setStatus(prev => !prev); // <--- CAMBIO: dispara el useEffect que recarga la data
    };

    // Cierra el Dialog de edición
    const hideDialogEditExercises = () => {
        setEditExerciseMobile(false);
    };

    // Maneja la apertura del Sidebar con video/imagen
    const handleButtonClick = (object) => {
        setSelectedObject(object);
        setVisible(true);
    };

    // Abre el Dialog con los datos del ejercicio a editar
    function handleEditMobileExercise(elementsExercise, index){
        setIndexOfExercise(index);
        setCompleteExercise(elementsExercise);
        setEditExerciseMobile(true);
    }

    // Al dar clic en "Guardar" dentro del Dialog, se hace la petición para editar
    const handleUpdateExercise = () => {
        const newExercises = [...modifiedDay];
        newExercises[indexOfExercise] = completeExercise; // Actualiza en memoria local
        setModifiedDay(newExercises);

        // Ahora llama a tu servicio para persistir el cambio en BD
        ExercisesService.editExercise(week_id, day_id, newExercises)
          .then((data) => {
            refreshEdit(newExercises); // <--- conserva la lógica de refresco
            setEditExerciseMobile(false); // cierra el Dialog

            Notify.instantToast('Rutina actualizada con éxito!')
          })
          .catch((err) => {
            console.error('Error al actualizar rutina', err);
            Notify.instantToast('Hubo un error al actualizar la rutina');
          });
    };

    // Template para carrousel de "warmup"
    const productTemplate = useCallback((exercise) => {
        return (
            <div className="border-1 surface-border border-round m-2  mb-0 text-center py-3 ">
                <div>
                    <span>{exercise.numberWarmup}</span>
                    <h4 className="">{exercise.name}</h4>
                    <p className="">{exercise.sets} series x {exercise.reps} repeticiones</p>
                    <p>{exercise.peso}</p>
                    <p>{exercise.rest}</p>
                    {exercise.notas && (
                      <div>
                        <p className="titleObservaciones">Observaciones</p>
                        <p className="paraphObservaciones">{exercise.notas}</p>
                      </div>
                    )}
                    <div className="">
                        <IconButton
                            aria-label="video"
                            className="p-0"
                            disabled={!exercise.video}
                            onClick={() => handleButtonClick(exercise)}
                        >
                            <YouTubeIcon className={exercise.video ? 'ytColor' : 'ytColor-disabled'} />
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }, []); 

    // CHANGES: El handleDayChange solo setea 'currentDay' según el valor que eligieron
    const handleDayChange = (value) => {
        const actualDay = allDays.find(item => item._id === value);
        const idx = allDays.findIndex(item => item._id === actualDay._id);
        setCurrentDay(idx);
    };

    return (
        <>
            <div className="container-fluid p-0 ">
                <Logo />
            </div>

            <section className="container-fluid ">
                <h2 className="my-5 text-center">{nameWeek}</h2>

                <div className="text-center">
                    <Segmented
                        options={allDays.map((day) => ({
                            label: day.name,
                            value: day._id
                        }))}
                        className="stylesSegmented"
                        // value = day_id? 
                        // Ojo: podemos usar day_id directamente
                        value={day_id}
                        onChange={handleDayChange}
                    />
                </div>

                {currentDay !== null && (
                <div className="row justify-content-center align-items-center text-center m-0 px-0 my-5">
                    <h2 className="text-center mb-4">
                        {allDays[currentDay]?.name}
                    </h2>

                    {allDays[currentDay]?.warmup != null ? (
                        <div className="card">
                            <h3 className="mt-3">Entrada en calor</h3>
                            <Carousel
                                className="mx-0"
                                value={allDays[currentDay].warmup}
                                numVisible={1}
                                numScroll={1}
                                responsiveOptions={[
                                  { breakpoint: '1400px', numVisible: 2, numScroll: 1 },
                                  { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
                                  { breakpoint: '767px', numVisible: 2, numScroll: 1 },
                                  { breakpoint: '575px', numVisible: 1, numScroll: 1 }
                                ]}
                                itemTemplate={productTemplate}
                            />
                        </div>
                    ) : (
                        <p>No hay entrada en calor para este día.</p>
                    )}

                    {/* Encabezado Rutina del día + botón del Tour */}
                    <div className="row justify-content-center text-center p-0">
                        <div className="row justify-content-center">
                            <div className="col-12 col-md-8 position-relative text-center">
                                <h2 className="mt-4">Rutina del día</h2>
                                {/* 
                                  // Si quisieras un botón para iniciar el tour:
                                  // <button
                                  //   className="btn btn-warning"
                                  //   style={{ position: 'absolute', top: '20px', right: 0 }}
                                  //   onClick={() => setTourVisible(true)}
                                  // >
                                  //   Info
                                  // </button>
                                */}
                            </div>
                        </div>

                        {/* Mapeo de ejercicios */}
                        {allDays[currentDay]?.exercises.map((element, idx) => {
                            return (
                              <Fragment key={`${element.exercise_id}-${idx}`}>
                                {element.type === 'exercise' ? (
                                  <Card
                                    key={element.exercise_id}
                                    ref={(el) => (cardRefs.current[idx] = el)}
                                    className={`my-3 p-0 cardShadow titleCard`}
                                  >
                                    <CardHeader
                                      avatar={
                                        <Avatar
                                          id={idx === 0 ? 'numeroSerie' : null}
                                          aria-label="recipe"
                                          className="avatarSize avatarColor"
                                        >
                                          {element.numberExercise}
                                        </Avatar>
                                      }
                                      action={
                                        <Avatar
                                          id={idx === 0 ? 'contador' : null}
                                          aria-label="recipe"
                                          className=" avatarSize bg-dark "
                                        >
                                          <Contador className={'p-2'} max={element.sets} />
                                        </Avatar>
                                      }
                                      title={
                                        <span id={idx === 0 ? 'nombre' : null}>{element.name}</span>
                                      }
                                    />

                                    <CardContent className="p-0">
                                      <div className="card border-0">
                                        <table className="table border-0 p-0">
                                          <thead>
                                            <tr className="border-0">
                                              <th id={idx === 0 ? 'series' : null} className="border-0">
                                                Sets
                                              </th>
                                              <th id={idx === 0 ? 'reps' : null} className="border-0">
                                                Reps
                                              </th>
                                              <th id={idx === 0 ? 'peso' : null} className="border-0">
                                                Peso
                                              </th>
                                              <th id={idx === 0 ? 'descanso' : null} className="border-0">
                                                Descanso x serie
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="border-0">
                                            <tr className="border-0">
                                              <td className="border-0">{element.sets}</td>
                                              <td className="border-0">{element.reps}</td>
                                              <td className="border-0">{element.peso}</td>
                                              <td className="border-0">
                                                <CountdownTimer initialTime={element.rest} />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      {element.notas && (
                                        <div>
                                          <p className="titleObservaciones">Observaciones</p>
                                          <p className="paraphObservaciones">{element.notas}</p>
                                        </div>
                                      )}
                                    </CardContent>

                                    <CardActions className="p-0 row justify-content-between">
                                      <IconButton
                                        id={idx === 0 ? 'video' : null}
                                        aria-label="video"
                                        className="p-0 col-3 mb-2"
                                        disabled={!element.video}
                                        onClick={() => handleButtonClick(element)}
                                      >
                                        {element.isImage ? (
                                          <ImageIcon className={` ${!element.video ? 'imageIconDisabled' : 'imageIcon'}`} />
                                        ) : (
                                          <YouTubeIcon
                                            className={
                                              element.video ? 'ytColor' : 'ytColor-disabled'
                                            }
                                          />
                                        )}
                                      </IconButton>

                                      <IconButton
                                        id={idx === 0 ? 'edicion' : null}
                                        aria-label="video"
                                        className="p-0 col-3 mb-2"
                                        onClick={() => handleEditMobileExercise(element, idx)}
                                      >
                                        <EditNoteIcon className="editStyle p-0" />
                                      </IconButton>
                                    </CardActions>
                                  </Card>
                                ) : (
                                  // Caso "circuit"
                                  <Card
                                    key={`circuit-${element.exercise_id}-${idx}`}
                                    ref={(el) => (cardRefs.current[idx] = el)}
                                    className={`my-3 cardShadow titleCard`}
                                  >
                                    <CardHeader
                                      className="me-4 ps-1"
                                      avatar={
                                        <Avatar aria-label="recipe" className="avatarSize avatarColor">
                                          {element.numberExercise}
                                        </Avatar>
                                      }
                                      title={element.type}
                                    />

                                    <CardContent className="p-0">
                                      <div className="card border-0">
                                        <p className="border-0"><b>{element.typeOfSets} series</b></p>

                                        <table className="table border-0">
                                          <thead>
                                            <tr className="border-0">
                                              <th className="border-0">Nombre</th>
                                              <th className="border-0">Reps</th>
                                              <th className="border-0">Peso</th>
                                            </tr>
                                          </thead>
                                          {element.circuit.map((circuit) => (
                                            <tbody key={circuit.idRefresh} className="border-0">
                                              <tr className="border-0">
                                                <td className="border-0">{circuit.name}</td>
                                                <td className="border-0">{circuit.reps}</td>
                                                <td className="border-0">{circuit.peso}</td>
                                              </tr>
                                            </tbody>
                                          ))}
                                        </table>
                                      </div>

                                      {element.notas && (
                                        <div>
                                          <p className="titleObservaciones">Observaciones</p>
                                          <p className="paraphObservaciones">{element.notas}</p>
                                        </div>
                                      )}
                                    </CardContent>

                                    <CardActions className="p-0 row justify-content-center">
                                      <IconButton
                                        aria-label="video"
                                        className="p-0 col-3 mb-2"
                                        disabled={!element.video}
                                        onClick={() => handleButtonClick(element)}
                                      >
                                        <YouTubeIcon
                                          className={
                                            element.video ? 'ytColor' : 'ytColor-disabled'
                                          }
                                        />
                                      </IconButton>
                                    </CardActions>
                                  </Card>
                                )}
                              </Fragment>
                            );
                        })}
                    </div>
                </div>
                )}

                {/* SIDEBAR para reproducir video/imagen */}
                <div className="row justify-content-center">
                    <Sidebar
                        visible={visible}
                        onHide={() => setVisible(false)}
                        position="bottom"
                        className="h-75"
                    >
                        {selectedObject && (
                            <div className="row justify-content-center">
                                <h3 className="text-center border-top border-bottom py-2 mb-2">
                                    {selectedObject.name}
                                </h3>
                                <div className="col-12 col-md-6 text-center mt-5">
                                    {selectedObject.isImage === true ? (
                                        <div>
                                            <img
                                              src={selectedObject.video}
                                              alt=""
                                              className="imgModal"
                                            />
                                        </div>
                                    ) : (
                                        <ReactPlayer
                                            url={selectedObject.video}
                                            controls={true}
                                            width="100%"
                                            height="450px"
                                            config={playerOptions}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </Sidebar>
                </div>

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

                {/* DIALOG para la calculadora de porcentaje */}
                <Dialog
                  header="Calculadora de Porcentaje"
                  visible={showCalculator}
                  style={{ width: '80vw' }}
                  onHide={toggleCalculator}
                  draggable={true}
                >
                  <PercentageCalculator />
                </Dialog>

                {/* DIALOG para subir videos */}
                <Dialog
                  header="Subir videos al drive"
                  visible={showUploadVideos}
                  style={{ width: '80vw' }}
                  onHide={toggleUploadVideos}
                  draggable={true}
                >
                  <div className="container-fluid">
                    <div className="row justify-content-center text-center">
                      <div className="col-10">
                        <p>
                          Acá podes subir los videos al drive de tu entrenador. Buscá la carpeta
                          con tu nombre y subílos! En caso de no encontrar la carpeta, comunicate con tu entrenador.
                        </p>
                        <Link
                          to={localStorage.getItem('drive')}
                          target="blank"
                          className="btn btn-warning"
                        >
                          Subir videos
                        </Link>
                      </div>
                    </div>
                  </div>
                </Dialog>

                {/* DIALOG de edición de ejercicio */}
                <Dialog
                  header="Editar Ejercicio"
                  visible={editExerciseMobile}
                  style={{ width: '90vw', maxWidth: '600px' }}
                  onHide={hideDialogEditExercises}
                  draggable={true}
                >
                  {completeExercise && (
                    <div className="container-fluid">
                      <div className="row">
                        {/* Form de ejemplo: ajusta los campos a tus necesidades */}
                        <div className="col-12 mb-3">
                          <label>Nombre</label>
                          <input
                            type="text"
                            className="form-control"
                            value={completeExercise.name || ''}
                            disabled={true}
                          />
                        </div>

                        <div className="col-4 mb-3">
                          <label>Sets</label>
                          <input
                            type="number"
                            className="form-control"
                            value={completeExercise.sets || ''}
                            disabled={true}
                          />
                        </div>

                        <div className="col-4 mb-3">
                          <label>Reps</label>
                          <input
                            type="number"
                            className="form-control"
                            value={completeExercise.reps || ''}
                            disabled={true}
                          />
                        </div>

                        <div className="col-4 mb-3">
                          <label>Peso</label>
                          <input
                            type="text"
                            className="form-control"
                            value={completeExercise.peso || ''}
                            onChange={(e) =>
                              setCompleteExercise({
                                ...completeExercise,
                                peso: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-12 mb-3">
                          <label>Notas</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={completeExercise.notas || ''}
                            onChange={(e) =>
                              setCompleteExercise({
                                ...completeExercise,
                                notas: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-12 text-center">
                          <button
                            className="btn btn-secondary me-3"
                            onClick={hideDialogEditExercises}
                          >
                            Cancelar
                          </button>
                          <button
                            className="btn BlackBGtextWhite"
                            onClick={handleUpdateExercise}
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Dialog>

                {/* Barra inferior fija */}
                <nav className="fixed-bottom colorNavBottom d-flex justify-content-around py-2 stylesNavBarBottom">
                  <div className="row justify-content-center text-center">
                    <Link to={`/routine/${id}`} className="positionIconsNavBar">
                      <IconButton className="buttonsNav fs-1">
                        <ArrowBackIcon />
                      </IconButton>
                    </Link>
                    <span className="col-12 text-light pt-4">Ir atrás</span>
                  </div>

                  {localStorage.getItem('drive') != undefined && 
                    <div className="row justify-content-center text-center">
                      <div className="positionIconsNavBar">
                        <IconButton className="buttonsNav fs-1" onClick={() => SetShowUploadVideos(true)}>
                          <AddToDriveIcon />
                        </IconButton>
                      </div>
                      <span className="col-12 text-light pt-4">Drive</span>
                    </div>
                  }

                  <div className="row justify-content-center text-center">
                    <div className="positionIconsNavBar">
                      <IconButton className="buttonsNav fs-1" onClick={() => setShowCalculator(true)}>
                        <PercentIcon />
                      </IconButton>
                    </div>
                    <span className="col-12 text-light pt-4">Cálculo</span>
                  </div>
                </nav>
            </section>
        </>
    );
}

export default DayDetailsPage;
