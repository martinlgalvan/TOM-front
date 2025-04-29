import { useEffect, useState, useRef, useCallback } from "react";
import { Fragment } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom"; // Se agregó useNavigate
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
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { NavigateBefore } from "@mui/icons-material";
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { InputTextarea } from "primereact/inputtextarea";


function DayDetailsPage() {
    const { id, week_id, index } = useParams();
    const navigate = useNavigate(); // Se inicializa useNavigate
    const username = localStorage.getItem('name'); // Se obtiene el nombre del usuario

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
    const [userProfile, setUserProfile] = useState(null);
    const [drive, setDrive] = useState(null);
    // Nuevo estado para controlar el modal cuando no existe el perfil
    const [showProfileMissingModal, setShowProfileMissingModal] = useState(false);

    let sliderRef = useRef(null);
    let sliderRef2 = useRef(null);

    // Estado para controlar la visibilidad del modal de resumen semanal
    const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState(false);

    // Estado para almacenar las 5 selecciones del resumen semanal
    const [weeklySummary, setWeeklySummary] = useState({
      selection1: "",
      selection2: "",
      selection3: "",
      selection4: "",
      selection5: ""
});


useEffect(() => {
  UserService.getProfileById(id)
    .then((data) => {
      setUserProfile(data);
      if (data.resumen_semanal) {
        setWeeklySummary(data.resumen_semanal);
      }
    })
    .catch((error) => {
      setShowProfileMissingModal(true);
    });
}, [id]);

const redirectToPerfil = () => {
    setShowProfileMissingModal(false);
    navigate(`/perfil/${id}`);
};

    const next = () => {
      sliderRef.slickNext();
    };
    const previous = () => {
      sliderRef.slickPrev();
    };

    const next2 = () => {
      sliderRef2.slickNext();
    };
    const previous2 = () => {
      sliderRef2.slickPrev();
    };

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
      const driveLocal = localStorage.getItem('drive');
      if (!driveLocal) {
        UserService.findUserById(id)
          .then((data) => {
            if (data.drive) {
              localStorage.setItem('drive', data.drive);
              setDrive(data.drive);
            }
          })
          .catch((err) => {
            console.error("Error al obtener el drive:", err);
          });
      } else {
        setDrive(driveLocal);
      }
    }, []);

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

    const renderExerciseName = (nameData) => {
      if (typeof nameData === 'object' && nameData !== null) {
        return (
          <div>
            <span>{nameData.name}</span>
            {nameData.backoff && (
              <small
                style={{
                  whiteSpace: 'pre-wrap',
                  display: 'block',
                  fontSize: '0.85rem',
                  color: 'gray'
                }}
              >
                {nameData.backoff}
              </small>
            )}
          </div>
        );
      }
      return <span>{nameData}</span>;
    };

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

    const productTemplate = useCallback((exercise, idx, isWarmup) => {
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
                    className="border-1 surface-border border-round text-center pt-3" 
                    style={{ width: '90%', maxWidth: cardMaxWidth, boxSizing: 'border-box' }}
                >
                  <div className="row justify-content-center">
                      <div className="col-2">    
                        <Avatar
                          id={idx === 0 ? 'numeroSerie' : null}
                          aria-label="recipe"
                          className="avatarSize avatarColor"
                        >
                          {exercise.numberWarmup ? exercise.numberWarmup : exercise.numberMovility}
                        </Avatar>
                      </div>
                    <div className="col-8 m-auto">{exercise.name}</div>
                    <div className="col-2">
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
                    <table className="table  border-0 p-0 mt-3 ">
                      <thead className="">
                        <tr className="border-0 ">
                          <th id={idx === 0 ? 'series' : null} className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'} `}>
                            Sets
                          </th>
                          <th id={idx === 0 ? 'reps' : null} className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}>
                            Reps
                          </th>
                          <th id={idx === 0 ? 'peso' : null} className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}>
                            Peso
                          </th>
                         
                        </tr>
                      </thead>
                      <tbody className="border-0 ">
                        <tr className="border-0">
                          <td className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}>{exercise.sets}</td>
                          <td className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}>{exercise.reps}</td>
                          <td className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}>{exercise.peso}</td>
                        
                        </tr>
                      </tbody>
                    </table>
                    <div>

                    {exercise.notas && exercise.notas.trim().length > 0 ? (
                    <table className="table border-0 p-0 mt-3">
                      <thead>
                        <tr className="border-0">
                          <th
                            id={idx === 0 ? 'notas' : null}
                            className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}
                          >
                            Notas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-0">
                        <tr className="border-0">
                          <td className={`border-0 ${exercise.numberWarmup ? 'colorCards' : 'colorCardsActivation'}`}>
                            {exercise.notas}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : null}

                    </div>
                </div>
            </div>
        );
    }, []);

    // Configuración de react-slick para el carrusel de entrada en calor
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 400,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true, // Agregado para que la altura se adapte
        waitForAnimate: false,
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

            <section className="container-fluid p-0">
                <h2 className="mt-1 mb-4 text-center">{nameWeek}</h2>

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
                <div className="row align-items-center text-center m-0 px-1 my-5">
                    <h2 className="text-center mb-4">
                        {allDays[currentDay]?.name}
                    </h2>

                    {allDays[currentDay]?.movility != null &&
                      <>
                        <div className="text-start m-0 p-0">
                          <span className="mt-3 styleInputsSpan ">Activación / movilidad</span>
                        </div>
                        <div className="card mb-4 colorCardsActivation">
                          <Slider
                          ref={slider => {
                            sliderRef = slider;
                          }}
                           {...sliderSettings} 
                           className="mx-0">
                            {allDays[currentDay].movility.map((exercise, idx) => (
                              <div key={idx}>
                                {productTemplate(exercise, 'warmup')}
                              </div>
                            ))}
                          </Slider>
                          
                        </div>
                        <div className="row justify-content-between">

                            <div className="col-6 text-start classSilders3"> 
                                
                                <IconButton onClick={previous}
                                    >
                                      <NavigateBeforeIcon className="editStyle p-0" />
                                    </IconButton>
                                    
                            
                            </div>

                            <div className="col-6 text-end classSilders4">
                                
                                <IconButton onClick={next}
                                    >
                                      <NavigateNextIcon className="editStyle p-0" />
                                    </IconButton>
                            </div>

                            </div>
                      </>
                    }

                    {allDays[currentDay]?.warmup != null &&
                      <>
                      <div className="text-start m-0 p-0">
                        <span className="mt-3 styleInputsSpan ">Entrada en calor</span>
                      </div>
                        <div className={`card mb-4 colorCards`}>
                            
                            <Slider
                            ref={slider => {
                              sliderRef2 = slider;
                            }}
                            {...sliderSettings} 
                            className="mx-0">
                                {allDays[currentDay].warmup.map((exercise, idx) => (
                                    <div key={idx}>
                                        {productTemplate(exercise, 'activation')}
                                    </div>
                                ))}
                            </Slider>
                            <div className="row justify-content-between">

                            <div className="col-6 text-start classSilders"> 
                                
                                <IconButton onClick={previous2}
                                    >
                                      <NavigateBeforeIcon className="editStyle p-0" />
                                    </IconButton>
                                    
                            
                            </div>

                            <div className="col-6 text-end classSilders2">
                                
                                <IconButton onClick={next2}
                                    >
                                      <NavigateNextIcon className="editStyle p-0" />
                                    </IconButton>
                            </div>

                            </div>
                            
                        </div>
                        </>
                    }
                    
                      <div className="text-start m-0 mt-4 p-0">
                        <span className="mt-3 styleInputsSpan ">Rutina del día</span>
                      </div>
                      
                    {allDays[currentDay]?.exercises.map((element, idx) => {
                        return (
                          <Fragment key={`${element.exercise_id}-${idx}`}>
                            {element.type === 'exercise' ? (
                              <>
                                
                                <Card
                                  key={element.exercise_id}
                                  ref={(el) => (cardRefs.current[idx] = el)}
                                  className={`mb-4 p-0 cardShadow titleCard`}
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
                                      <span id={idx === 0 ? 'nombre' : null}>{typeof element.name === 'object' ? element.name.name : element.name}</span>
                                    }
                                  />

                                <CardContent className="p-0">
                                  <div className="card border-0">
                                    <table className="table border-0 p-0">
                                      <thead>
                                        <tr className="border-0">
                                          <th id={idx === 0 ? 'series' : null} className="border-0">Sets</th>
                                          <th id={idx === 0 ? 'reps' : null} className="border-0">Reps</th>
                                          <th id={idx === 0 ? 'peso' : null} className="border-0">Peso</th>
                                          <th id={idx === 0 ? 'descanso' : null} className="border-0">Descanso x serie</th>
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
                                  
                                  {/* Nuevo bloque Back off: se muestra solo si element.name es un objeto con propiedad backoff */}
                                  {element.name && typeof element.name === 'object' && 
                                  Array.isArray(element.name.backoff) && element.name.backoff.length > 0 && (
                                    <div>
                                      <p className="titleObservaciones">Back off</p>
                                      {element.name.backoff.map((line, idx) => (
                                        <p key={idx} className="paraphObservaciones">
                                          {line.sets} Series x {line.reps} Reps / {line.peso}
                                        </p>
                                      ))}
                                    </div>
                                  )}

                                  {element.notas && (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                      <p className="titleObservaciones">Notas / otros</p>
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
                              </>
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
                    <div className="row justify-content-center ">
                      <div className="col-10">
                        <p>
                          Este es tu drive para subir los videos, una vez que los subas, marcá la casilla para avisarle a tu entrenador que ya están cargados.
                        </p>
                        <div>
                          <input type="checkbox" className="d-block text-center form-check mb-3"/>
                        </div>
                        
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
                            value={typeof completeExercise.name === 'object' ? completeExercise.name.name : completeExercise.name || ''}
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
                            disabled={userProfile && userProfile.isEditable}
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
                            disabled={userProfile && userProfile.isEditable}
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
                            disabled={userProfile && userProfile.isEditable}
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
                    <button
                      className="nav-item d-flex flex-column align-items-center border-0 bg-transparent"
                      onClick={() => setShowWeeklySummaryModal(true)}
                    >
                      <IconButton className="fs-1">
                        <CommitIcon className="text-light small" /> 
                      </IconButton>
                      <span className="text-light small">Resumen</span>
                    </button>

                  
                    {drive && <button
                      className="nav-item d-flex flex-column align-items-center border-0 bg-transparent"
                      onClick={() => SetShowUploadVideos(true)}
                    >
                      <IconButton className="fs-1">
                        <AddToDriveIcon className="text-light small" />
                      </IconButton>
                      <span className="text-light small">Drive</span>
                    </button>}
                </nav>

                {/* Nuevo Dialog para mostrar el mensaje cuando no existe el perfil */}
                <Dialog
                    header="Completa tu perfil"
                    visible={showProfileMissingModal}
                    style={{ width: '90vw' }}
                    modal
                    onHide={() => setShowProfileMissingModal(false)}
                    footer={
                      <div className="row justify-content-center">
                       <div  className="col-6 text-center">
                            <Button label="Más tarde" onClick={() => setShowProfileMissingModal(false)} className="p-button-primary text-light " />
                        </div>
                        <div className="col-6 text-center">
                            <Button label="Ir al perfil " onClick={redirectToPerfil} className="p-button-primary text-light " />
                        </div>
                      </div>
                    }
                >
                    <p>Hola! {username}, por favor completa tu perfil asi tu entrenador tiene más datos sobre vos.</p>
                </Dialog>


                <Dialog
  header={`Resumen Semanal`}
  className="paddingDialog"
  visible={showWeeklySummaryModal}
  style={{ width: '85vw' }}
  onHide={() => setShowWeeklySummaryModal(false)}
  draggable={true}
>
  <div className="">
    <div className="text-start mb-3">
    <span className="styleInputsSpan"><b className="me-2">Última actualización:</b>
          {weeklySummary.lastSaved
            ? new Date(weeklySummary.lastSaved).toLocaleString()
            : '-'}
    </span>

    </div>
    <div className="mb-3">
      <span className="styleInputsSpan">Alimentación</span>
      <select
        value={weeklySummary.selection1}
        onChange={(e) =>
          setWeeklySummary(prev => ({ ...prev, selection1: e.target.value }))
        }
        className="form-control"
      >
        <option value="">Seleccionar...</option>
        <option value="Muy mala">Muy mala</option>
        <option value="Mala">Mala</option>
        <option value="Regular">Regular</option>
        <option value="Buena">Buena</option>
        <option value="Muy buena">Muy buena</option>
      </select>
    </div>
    <div className="mb-3">
      <span className="styleInputsSpan">
        NEAT
        <Tooltip 
          title="NEAT se refiere a la energía que gastas en tus actividades cotidianas. Por ejemplo, si tu trabajo es ser mesero 12hs, tu NEAT es alto. Si trabajas de uber u oficina, tu NEAT es bajo."
          arrow
          enterTouchDelay={0}
          leaveTouchDelay={8000}
        >
          <IconButton size="small" style={{ marginLeft: '5px' }}>
            <HelpOutlineIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </span>
      <select
        value={weeklySummary.selection2}
        onChange={(e) =>
          setWeeklySummary(prev => ({ ...prev, selection2: e.target.value }))
        }
        className="form-control"
      >
        <option value="">Seleccionar...</option>
        <option value="Muy malo">Muy malo</option>
        <option value="Malo">Malo</option>
        <option value="Regular">Regular</option>
        <option value="Bueno">Bueno</option>
        <option value="Muy bueno">Muy bueno</option>
      </select>
    </div>
    <div className="mb-3">
      <span className="styleInputsSpan w-100">Sensaciones del entrenamiento</span>
      <select
        value={weeklySummary.selection3}
        onChange={(e) =>
          setWeeklySummary(prev => ({ ...prev, selection3: e.target.value }))
        }
        className="form-control"
      >
        <option value="">Seleccionar...</option>
        <option value="Muy mal">Muy mal</option>
        <option value="Mal">Mal</option>
        <option value="Regular">Regular</option>
        <option value="Bien">Bien</option>
        <option value="Muy bien">Muy bien</option>
      </select>
    </div>
    <div className="mb-3">
      <span className="styleInputsSpan">Descanso / sueño</span>
      <select
        value={weeklySummary.selection4}
        onChange={(e) =>
          setWeeklySummary(prev => ({ ...prev, selection4: e.target.value }))
        }
        className="form-control"
      >
        <option value="">Seleccionar...</option>
        <option value="Muy mal">Muy mal</option>
        <option value="Mal">Mal</option>
        <option value="Regular">Regular</option>
        <option value="Bien">Bien</option>
        <option value="Muy bien">Muy bien</option>
      </select>
    </div>
    <div className="mb-3">
      <span className="styleInputsSpan">Niveles de estrés</span>
      <select
        value={weeklySummary.selection5}
        onChange={(e) =>
          setWeeklySummary(prev => ({ ...prev, selection5: e.target.value }))
        }
        className="form-control"
      >
        <option value="">Seleccionar...</option>
        <option value="Muy mal">Muy mal</option>
        <option value="Mal">Mal</option>
        <option value="Regular">Regular</option>
        <option value="Bien">Bien</option>
        <option value="Muy bien">Muy bien</option>
      </select>
    </div>
    <div className="mb-3">
      <span>Comentarios sobre la semana</span>
      <InputTextarea
        type="text"
        autoResize
        value={weeklySummary.comments || ""}
        onChange={(e) =>
          setWeeklySummary(prev => ({ ...prev, comments: e.target.value }))
        }
        className="form-control"
        placeholder="Escribí acá tus comentarios..."
      />
    </div>
    <div className="row justify-content-end">
      <div className="col-4">
        <Button
          label="Cancelar"
          className="btn btn-outline-dark"
          onClick={() => setShowWeeklySummaryModal(false)}
        />
      </div>
      <div className="col-4">
        <Button
          label="Guardar"
          className="btn BlackBGtextWhite me-2"
          onClick={() => {
            const updatedSummary = { 
              ...weeklySummary, 
              lastSaved: new Date().toISOString()
            };
            UserService.editProfile(id, { resumen_semanal: updatedSummary })
              .then(() => {
                setWeeklySummary(updatedSummary);
                setShowWeeklySummaryModal(false);
                Notify.instantToast("Resumen semanal guardado");
              })
              .catch((err) => {
                console.error("Error al guardar el resumen semanal", err);
                Notify.instantToast("Error al guardar el resumen semanal");
              });
          }}
        />
      </div>
    </div>
  </div>
</Dialog>


            </section>
        </>
    );
}

export default DayDetailsPage;
