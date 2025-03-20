import { useEffect, useState, useRef, useCallback } from "react";
import { Fragment } from 'react';
import { Link, useParams } from "react-router-dom";
import { Tour } from 'antd';

import * as WeekService from "../../services/week.services.js";
import * as UserService from "../../services/users.services.js";
import * as ExercisesService from "../../services/exercises.services.js"; 
import * as Notify from './../../helpers/notify.js'

import Logo from "../../components/Logo.jsx";
import EditExercise from '../../components/EditExercise.jsx';
import Contador from "../../helpers/Contador.jsx";
import Floating from "../../helpers/Floating.jsx";

import ReactPlayer from 'react-player';
import * as _ from "lodash";

// Eliminamos la importación del Carousel de PrimeReact y usamos react-slick
import Slider from "react-slick";


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

function DayDetailsPage() {
    const { id, week_id, index } = useParams();
    const op = useRef(null);

    const [day_id, setDay_id] = useState();
    const [allDays, setAllDays] = useState([]); 
    const [modifiedDay, setModifiedDay] = useState([]);
    const [nameWeek, setNameWeek] = useState();
    const [firstValue, setFirstValue] = useState();
    const [status, setStatus] = useState(false);
    const [currentDay, setCurrentDay] = useState(null);
    const [editExerciseMobile, setEditExerciseMobile] = useState(false);
    const [completeExercise, setCompleteExercise] = useState();
    const [showCalculator, setShowCalculator] = useState(false);
    const [showUploadVideos, SetShowUploadVideos] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [isRendered, setIsRendered] = useState();
    const [tourSteps, setTourSteps] = useState([]);
    const [tourVisible, setTourVisible] = useState(false);
    const contadorRef = useRef(null);
    const cardRefs = useRef([]);
    const [indexOfExercise, setIndexOfExercise] = useState();
    const [visible, setVisible] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    const [drive, setDrive] = useState(localStorage.getItem('drive'));

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const toggleUploadVideos = () => {
        SetShowUploadVideos(false);
    };

    const toggleCalculator = () => {
        setShowCalculator(!showCalculator);
    };

    useEffect(() => {
      if (!week_id) return;
      WeekService.findByWeekId(week_id).then((data) => {
        if (!data?.length) return;
        setAllDays(data[0].routine);
        setNameWeek(data[0].name);
        setCurrentDay(prev => (prev === null ? 0 : prev));
      });
    }, [week_id, status]); 

    useEffect(() => {
      if (allDays.length && currentDay !== null) {
        setDay_id(allDays[currentDay]._id);
        setModifiedDay(allDays[currentDay].exercises);
        setFirstValue(allDays[currentDay].name);
      }
    }, [allDays, currentDay]);

    useEffect(() => {
        if (!localStorage.getItem('drive')) {
            UserService.findUserById(localStorage.getItem('entrenador_id')).then((data) => {
              if(data.drive){
                localStorage.setItem('drive', data.drive);
              }
            });
        }
    }, [drive]);

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

    const refreshEdit = (refresh) => {
        setStatus(prev => !prev);
    };

    const hideDialogEditExercises = () => {
        setEditExerciseMobile(false);
    };

    const handleButtonClick = (object) => {
        setSelectedObject(object);
        setVisible(true);
    };

    function handleEditMobileExercise(elementsExercise, index){
        setIndexOfExercise(index);
        setCompleteExercise(elementsExercise);
        setEditExerciseMobile(true);
    }

    const handleUpdateExercise = () => {
        const newExercises = [...modifiedDay];
        newExercises[indexOfExercise] = completeExercise;
        setModifiedDay(newExercises);

        ExercisesService.editExercise(week_id, day_id, newExercises)
          .then((data) => {
            refreshEdit(newExercises);
            setEditExerciseMobile(false);
            Notify.instantToast('Rutina actualizada con éxito!')
          })
          .catch((err) => {
            console.error('Error al actualizar rutina', err);
            Notify.instantToast('Hubo un error al actualizar la rutina');
          });
    };

    const productTemplate = useCallback((exercise) => {
        const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 450;
        const cardMaxWidth = isSmallScreen ? '380px' : '400px';
        
        return (
            <div 
                style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    padding: '0 5px' 
                }}
            >
                <div 
                    className="border-1 surface-border border-round text-center py-3" 
                    style={{ width: '90%', maxWidth: cardMaxWidth, boxSizing: 'border-box' }}
                >
                    <span>{exercise.numberWarmup}</span>
                    <h4>{exercise.name}</h4>
                    <p>{exercise.sets} series x {exercise.reps} repeticiones</p>
                    <p>{exercise.peso}</p>
                    <p>{exercise.rest}</p>
                    {exercise.notas && (
                        <div>
                            <p className="titleObservaciones">Observaciones</p>
                            <p className="paraphObservaciones">{exercise.notas}</p>
                        </div>
                    )}
                    <div>
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

    // Configuración de react-slick para el carrusel de entrada en calor
    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
              breakpoint: 1400,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 1199,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 767,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 575,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
        ]
    };

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
                        <div className="card mb-4">
                            <h3 className="mt-3">Entrada en calor</h3>
                            <Slider {...sliderSettings} className="mx-0">
                                {allDays[currentDay].warmup.map((exercise, idx) => (
                                    <div key={idx}>
                                        {productTemplate(exercise)}
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    ) : (
                        <p>No hay entrada en calor para este día.</p>
                    )}

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
                                        className={element.video ? 'ytColor' : 'ytColor-disabled'}
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
                                      className={element.video ? 'ytColor' : 'ytColor-disabled'}
                                    />
                                  </IconButton>
                                </CardActions>
                              </Card>
                            )}
                          </Fragment>
                        );
                    })}
                </div>
                )}

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

                <Dialog
                  header="Calculadora de Porcentaje"
                  visible={showCalculator}
                  style={{ width: '80vw' }}
                  onHide={toggleCalculator}
                  draggable={true}
                >
                  <PercentageCalculator />
                </Dialog>

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

                <nav
                  className="fixed-bottom d-flex justify-content-around align-items-center py-2"
                  style={{ backgroundColor: '#000' }}
                >
                  <Link
                    to={`/routine/${id}`}
                    className="nav-item d-flex flex-column align-items-center text-decoration-none"
                  >
                    <IconButton className="fs-1">
                      <ArrowBackIcon className="text-light small" />
                    </IconButton>
                    <span className="text-light small">Ir atrás</span>
                  </Link>

                  {localStorage.getItem('drive') !== null && (
                    <button
                      className="nav-item d-flex flex-column align-items-center border-0 bg-transparent"
                      onClick={() => SetShowUploadVideos(true)}
                    >
                      <IconButton className="fs-1">
                        <AddToDriveIcon />
                      </IconButton>
                      <span className="text-light small">Drive</span>
                    </button>
                  )}

                  <button
                    className="nav-item d-flex flex-column align-items-center border-0 bg-transparent"
                    onClick={() => setShowCalculator(true)}
                  >
                    <IconButton className="fs-1">
                      <PercentIcon />
                    </IconButton>
                    <span className="text-light small">Cálculo</span>
                  </button>
                </nav>
            </section>
        </>
    );
}

export default DayDetailsPage;
