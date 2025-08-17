import React, { useEffect, useState, useRef, useCallback } from "react";
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


import { Sidebar } from 'primereact/sidebar';
import { Segmented } from 'antd';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import CommitIcon from '@mui/icons-material/Commit';

import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
import Formulas from "../../components/Formulas.jsx";
import CountdownTimer from "../../components/CountdownTimer.jsx";
import ImageIcon from '@mui/icons-material/Image';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { NavigateBefore } from "@mui/icons-material";
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { InputTextarea } from "primereact/inputtextarea";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';

import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import LooksThreeIcon from '@mui/icons-material/Looks3';
import LooksFourIcon from '@mui/icons-material/Looks4';
import LooksFiveIcon from '@mui/icons-material/Looks5';
import LooksSixIcon from '@mui/icons-material/Looks6';


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
    const [showToolsDialog, setShowToolsDialog] = useState(false);
    const [selectedTool, setSelectedTool] = useState("calculator");
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

    const [driveLink, setDriveLink] = useState('');
    const [editingDriveLink, setEditingDriveLink] = useState(false);
    const [showDriveDialog, setShowDriveDialog] = useState(false);
    // Nuevo estado para controlar el modal cuando no existe el perfil
    const [showProfileMissingModal, setShowProfileMissingModal] = useState(false);

    const [blockEditIndices, setBlockEditIndices] = useState({ blockIndex: null, exerciseIndex: null });

    const numberIconMap = {
      1: LooksOneIcon,
      2: LooksTwoIcon,
      3: LooksThreeIcon,
      4: LooksFourIcon,
      5: LooksFiveIcon,
      6: LooksSixIcon,

    };

    const goToWeek = (newIndex) => {
        setCurrentWeekIndex(newIndex);
        const newWeek = allWeeks[newIndex];
        if (newWeek) {
            // Resetea al día 0 al navegar
            navigate(`/routine/${id}/day/0/${newWeek._id}/${newIndex}`);
        }
    };


    function renderNumberIcon(n) {
    // solo si es entero y entre 1 y 8
    if (Number.isInteger(n) && numberIconMap[n]) {
      const IconComp = numberIconMap[n];
      return <IconComp />;
    }
    // caso 1.2, 2.3, etc.
    return <span className="bg-light btn p-1 fontNumberE m-0">{n}</span>;
  }

    let sliderRef = useRef(null);
    let sliderRef2 = useRef(null);

    // sustituye tus `let sliderRef = useRef(null);` por esto:
    const movilitySwiper = useRef(null);
    const warmupSwiper  = useRef(null);

    const nextMovility    = () => movilitySwiper.current?.slideNext();
    const prevMovility    = () => movilitySwiper.current?.slidePrev();
    const nextWarmup      = () => warmupSwiper.current?.slideNext();
    const prevWarmup      = () => warmupSwiper.current?.slidePrev();

    // Estado para controlar la visibilidad del modal de resumen semanal
    const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState(false);

    // Estado para almacenar las 5 selecciones del resumen semanal
    const [weeklySummary, setWeeklySummary] = useState({
      selection1: "",
      selection2: "",
      selection3: "",
      selection4: "",
      selection5: "",
      pesoCorporal: "",     // ← nuevo campo
      comments: "",         // ya usabas comments
      lastSaved: ""         // ya usabas lastSaved
    });

const [allWeeks, setAllWeeks] = useState([]);
const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
const isCurrentWeek = currentWeekIndex === 0;
useEffect(() => {
  const fetchWeeks = async () => {
    try {
      const weeks = await WeekService.findRoutineByUserId(id);
      const sortedWeeks = weeks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // última primero
      setAllWeeks(sortedWeeks);
      
      const selectedIndex = sortedWeeks.findIndex(w => w._id === week_id);
      setCurrentWeekIndex(selectedIndex !== -1 ? selectedIndex : 0);
    } catch (err) {
      console.error("Error al cargar semanas", err);
    }
  };
  fetchWeeks();
}, [id]);

function handleEditMobileBlockExercise(exercise, blockIndex, exerciseIndex) {
  setCompleteExercise(exercise);
  setBlockEditIndices({ blockIndex, exerciseIndex });
  setEditExerciseMobile(true);
}

const redirectToPerfil = () => {
    setShowProfileMissingModal(false);
    navigate(`/perfil/${id}`);
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
  const week = allWeeks[currentWeekIndex];
  if (!week) return;

  setNameWeek(week.name);
  const currentRoutine = week.routine || [];
  setAllDays(currentRoutine);

  const firstDay = currentRoutine[0];
  if (firstDay) {
    setDay_id(firstDay._id);
    setModifiedDay(firstDay.exercises);
    setFirstValue(firstDay.name);
  }

  const prevWeek = allWeeks[currentWeekIndex + 1];
  if (prevWeek) {
    const alignedDays = currentRoutine.map((day, idx) => {
      const previousDay = prevWeek.routine[idx];
      if (!previousDay) return day;
      return {
        ...day,
        exercises: compareExercises(day.exercises, previousDay.exercises)
      };
    });
    setAllDays(alignedDays);
    setModifiedDay(alignedDays[0]?.exercises || []);
  }

  setCurrentDay(0);
}, [allWeeks, currentWeekIndex]);


useEffect(() => {
  UserService.getProfileById(id)
    .then((data) => {
      setUserProfile(data);
      if (data.drive_link) setDriveLink(data.drive_link);
      if (data.resumen_semanal) {
        setWeeklySummary(data.resumen_semanal);
      }
    })
    .catch(() => setShowProfileMissingModal(true));
}, [id]);
    
const saveDriveLink = async () => {
  if (!driveLink.startsWith("https://drive.google.com")) {
    Notify.instantToast("Debe ser un link válido de Google Drive");
    return;
  }

  try {
    const currentProfile = await UserService.getProfileById(id);

    const {
      _id,
      id: ignoredId,
      user_id, // 👈 evitar reenviar esto
      ...safeProfile
    } = currentProfile;

    const updatedProfile = {
      ...safeProfile,
      drive_link: driveLink
    };

    await UserService.editProfile(id, updatedProfile);

    setUserProfile(prev => ({
      ...prev,
      drive_link: driveLink
    }));

    Notify.instantToast("Link de Drive actualizado");
    setEditingDriveLink(false);
    setShowDriveDialog(false);
  } catch (error) {
    console.error("Error al guardar el link de Drive", error);
    Notify.instantToast("Error al guardar el link de Drive");
  }
};

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

    const getCols = peso => {
  // convierto array o valor en string
 const text = peso != null ? String(peso) : '';
  const largo = text.length;
  const isLong = largo > 7;
  return {
    setsCol: isLong ? 'col-1' : 'col-2',
    repsCol: isLong ? 'col-3' : 'col-3',
    pesoCol: isLong ? 'col-4' : 'col-3',
    restCol: isLong ? 'col-3' : 'col-3',
  };
};

    const handleUpdateExercise = () => {
  // clonamos el array de ejercicios del día
  const newExercises = [...modifiedDay];

  if (blockEditIndices.blockIndex !== null) {
    // caso BLOQUE: metemos el completeExercise en newExercises[blockIndex].exercises[exerciseIndex]
    const b = blockEditIndices.blockIndex;
    const e = blockEditIndices.exerciseIndex;

    // inmutabilidad: clonamos también el bloque y su array interno
    newExercises[b] = {
      ...newExercises[b],
      exercises: [...newExercises[b].exercises]
    };
    newExercises[b].exercises[e] = completeExercise;

  } else {
    // caso normal
    newExercises[indexOfExercise] = completeExercise;
  }

  // actualizamos el estado y hacemos la llamada
  setModifiedDay(newExercises);
  ExercisesService
    .editExercise(week_id, day_id, newExercises)
    .then(() => {
      Notify.instantToast('Rutina actualizada con éxito!');
      setEditExerciseMobile(false);
      // reseteamos los índices de bloque
      setBlockEditIndices({ blockIndex: null, exerciseIndex: null });
    })
    .catch(err => {
      console.error('Error al actualizar rutina', err);
      Notify.instantToast('Hubo un error al actualizar la rutina');
    });
};

    const productTemplate = useCallback((exercise, idx, isWarmup) => {
        const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 450;
        const cardMaxWidth = isSmallScreen ? '380px' : '400px';

        return (
            <div cla>
                <div 
                    className="text-center pt-3 pb-4" 
                >
                  <div className="row justify-content-center backgroundCardsWarmMov  rounded-2 m-1 mb-3">

                                    <div className={`col-12 shadow ${exercise.numberWarmup ? 'colorWarmup' : 'colorMovility'} py-2`}>
                                      <div className="row justify-content-center">

                                        <div className="col-1 m-auto text-light">
                                          {renderNumberIcon(exercise.numberWarmup ?? exercise.numberMovility)}
                                        
                                      </div>
                                        <div className="col-8 m-auto text-start">
                                          <p className="stylesNameExercise text-light mb-0" id={idx === 0 ? 'nombre' : null}>
                                            <span className="">{typeof exercise.name === 'object' ? exercise.name.name : exercise.name}</span>
                                          </p>
                                        </div>
                                     
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
                                    </div>
                                      <div className="col-4 pb-3 mt-4 mb-2">
                                        <div>
                                          <span className="stylesBadgesItemsExerciseSpan d-block">{exercise.sets}</span>
                                          <p className="fontStylesSpan">Sets</p>
                                        </div>
                                        
                                      </div>
                                       <div className="col-4  p-0 mt-4 mb-2">
                                        <div>
                                           <span className="stylesBadgesItemsExerciseSpan border-1 d-block">{exercise.reps}</span>
                                            <p className="fontStylesSpan ">Reps</p>
                                        </div>
                                       
                                      </div>
                                       <div className="col-4 p-0  mt-4 mb-2">
                                        <div>
                                          <span className="stylesBadgesItemsExerciseSpan d-block">{exercise.peso ? exercise.peso : '-'}</span>
                                          <p className="fontStylesSpan ">Peso</p>
                                        </div>
                                      </div>

                                      {exercise.notas && exercise.notas.trim().length > 0 ? (
                                       <>
                                        <span className="styleInputsNote-back text-start">
                                          Notas / otros
                                        </span>
                                        <div
                                          className="border mb-2 py-2 rounded-1 col-11 largoCarddds"
                                          style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                          <p className="pb-0 mb-0">{exercise.notas}</p>
                                        </div>
                                      </>
                                      ) : null}
                                      </div>

                                

                    <div>

                    

                    </div>
                </div>
            </div>
        );
    }, []);



    const handleDayChange = (value) => {
        const actualDay = allDays.find(item => item._id === value);
        const idx = allDays.findIndex(item => item._id === actualDay._id);
        setCurrentDay(idx);
    };


    function compareExercises(currentExercises, previousExercises) {
  return currentExercises.map((exercise, index) => {
    const previous = previousExercises[index];
    if (!previous) return { ...exercise, changed: true };

    const isDifferent = (
      exercise.name !== previous.name ||
      exercise.sets !== previous.sets ||
      exercise.reps !== previous.reps ||
      exercise.peso !== previous.peso ||
      JSON.stringify(exercise?.name?.backoff) !== JSON.stringify(previous?.name?.backoff)
    );

    return {
      ...exercise,
      changed: isDifferent
    };
  });
}

    return (
        <>
    <div className="container-fluid p-0 ">
        <Logo />
    </div>

    <section className="container-fluid p-0">

        <div className={`text-center py-2 ${currentWeekIndex !== 0 ? 'alert alert-warning rounded-1 text-dark' : ''}`}>
          <div className="d-flex justify-content-center align-items-center">
            <IconButton
              className="me-2"
                onClick={() => goToWeek(Math.min(currentWeekIndex + 1, allWeeks.length - 1))}
              disabled={currentWeekIndex === allWeeks.length - 1}
            >
              <NavigateBeforeIcon className={`fs-2 ${currentWeekIndex === allWeeks.length - 1 ? 'text-muted' : ''}`} />
            </IconButton>

            <div className="d-flex flex-column align-items-center">
        <h5 className="mb-0">{allWeeks[currentWeekIndex]?.name }</h5>
              <small className="text-muted">
                {allWeeks[currentWeekIndex]?.createdAt 
                  ? new Date(allWeeks[currentWeekIndex].createdAt).toLocaleDateString()
                  : ''}
              </small>
            </div>

            <IconButton
              className="ms-2"
              onClick={() => goToWeek(Math.max(currentWeekIndex - 1, 0))}
              disabled={currentWeekIndex === 0}
            >
              <NavigateNextIcon className={`fs-2 ${currentWeekIndex === 0 ? 'text-muted' : ''}`} />
            </IconButton>
          </div>

          {currentWeekIndex !== 0 && (
            <small className="d-block mt-1 mx-3 text-">
              <span className=" shadow rounded-1 p-2 d-block mx-5 mb-2">Atención!</span> Para que no te confundas, te avisamos que estás en una semana anterior. 
            </small>
          )}
        </div>

          {allDays.length > 0 && (
            <div className="text-center my-3">
              <Segmented
                options={allDays.map(day => {
                  const name = day.name || '';
                  const short = name.length > 6 ? `${name.slice(0, 5)}` : name;
                  return {
                    value: day._id,
                    label: (
                      <span title={name} style={{ display: 'inline-block', maxWidth: '8ch', maxHeight: '2.3ch', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {short}
                      </span>
                    )
                  };
                })}
                className="stylesSegmented"
                value={day_id}
                onChange={handleDayChange}
              />
            </div>
          )}

        {currentDay !== null && (
        <div className="row align-items-center text-center m-0 px-1 my-5">
            <h2 className="text-center mb-4 colorNameAlumno rounded-2 fs-5 py-2">
                {allDays[currentDay]?.name}
            </h2>

            {allDays[currentDay]?.movility && (
            <>
              <div className="text-start"><span>Activación / movilidad</span></div>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                loop
                speed={600}
                pagination={{ clickable: true }}
                autoplay={false}
                slidesPerView={1}
                spaceBetween={20}
                breakpoints={{
                  575:  { slidesPerView: 1 },
                  767:  { slidesPerView: 2 },
                  1199: { slidesPerView: 3 },
                  1400: { slidesPerView: 2 },
                }}
                onSwiper={swiper => (movilitySwiper.current = swiper)}
                className="mx-0 px-0">
                    {allDays[currentDay].movility.map((exercise, idx) => (
                      <SwiperSlide key={idx}>
                        {productTemplate(exercise, idx, true)}
                      </SwiperSlide>
                    ))}
                  </Swiper>
            
                  </>
              )}

            {allDays[currentDay]?.warmup && (
            <>
              <div className="text-start"><span>Entrada en calor</span></div>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                loop
                speed={600}
                pagination={{ clickable: true }}
                autoplay={false}
                slidesPerView={1}
                spaceBetween={20}
                breakpoints={{
                  575:  { slidesPerView: 1 },
                  767:  { slidesPerView: 2 },
                  1199: { slidesPerView: 3 },
                  1400: { slidesPerView: 2 },
                }}
                onSwiper={swiper => (movilitySwiper.current = swiper)}
                className="mx-0 px-0">
                    {allDays[currentDay].warmup.map((exercise, idx) => (
                      <SwiperSlide key={idx}>
                        {productTemplate(exercise, idx, false)}
                      </SwiperSlide>
                    ))}
                  </Swiper>
          
              </>
            )}

            
              <div className="row m-auto px-0 ">
                
                <h2 className=" p-2 mb-0 text-start ">Rutina del día</h2>
              
                    {modifiedDay.map((element, idx) => {
  // ⚠️ Usar el peso del elemento para calcular columnas (antes estaba element.reps)
  const { setsCol, repsCol, pesoCol, restCol } = getCols(element.peso);
  const isExercise = element.type === 'exercise';
  const isBlock = element.type === 'block';
  const number = element.numberExercise || element.numberCircuit;
  const name = typeof element.name === 'object' ? element.name.name : element.name;
  const backoffLabel =
    (element.name?.titleName && element.name.titleName.trim() !== "")
      ? element.name.titleName
      : "Back off";

  return (
    <div
      key={`${element.exercise_id}-${idx}`}
      ref={el => (cardRefs.current[idx] = el)}
      className="px-0 mb-3"
    >
      <div className="row justify-content-center bg-light border rounded-2 m-0 mb-3">
        {/* — CABECERA (número + nombre) — */}
        <div
          className={`col-12 ${element.type !== 'block' && 'widgetNumber'} py-2`}
          style={{ backgroundColor: element.type == 'block' && element.color }}
        >
          <div className="row justify-content-center">
            <div className="col-1 m-auto text-light">
              {renderNumberIcon(number)}
            </div>

            <div className="col-10 m-auto text-start">
              <p
                className="stylesNameExercise text-light mb-0"
                id={idx === 0 ? 'nombre' : null}
              >
                {isExercise
                  ? name
                  : isBlock
                    ? <span>{element.name}</span>
                    : <span>{element.type} - {element.typeOfSets}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* — CUERPO: sets/reps/peso + timer o tabla de circuito — */}
        {isExercise ? (
          <>
            <div className={`${setsCol} p-0 mt-4 pt-2 mb-2`}>
              <span className="stylesBadgesItemsExerciseSpan d-block">
                {element.sets}
              </span>
              <p className="fontStylesSpan">Sets</p>
            </div>

            <div className={`${repsCol} p-0 mt-4 pt-2 mb-2`}>
              {Array.isArray(element.reps) ? (
                <span className="stylesBadgesItemsExerciseSpan border-1 d-block">
                  {element.reps.map((r, i) => (
                    <React.Fragment key={i}>
                      <span className="stylesBadgesItemsExerciseSpan arrayBadge">
                        {r}
                      </span>
                      {i < element.reps.length - 1 && <span>-</span>}
                    </React.Fragment>
                  ))}
                </span>
              ) : (
                <span className="stylesBadgesItemsExerciseSpan border-1 d-block">
                  {element.reps}
                </span>
              )}
              <p className="fontStylesSpan">Reps</p>
            </div>

            <div className={`${pesoCol} p-0 mt-4 pt-2 mb-2`}>
              <span className="stylesBadgesItemsExerciseSpan d-block">
                {element.peso ? element.peso : '-'}
              </span>
              <p className="fontStylesSpan">Peso</p>
            </div>

            <div className={`${restCol} p-0 mt-3 mb-2`}>
              <CountdownTimer initialTime={element.rest} />
              <p className="fontStylesSpan mt-2 mb-1">Descanso</p>
            </div>
          </>
        ) : isBlock ? (
          element.exercises.map((ex, j) => {

            const isInnerExercise = ex.type === 'exercise';
            const isInnerCircuit  = !isInnerExercise;

            const innerNumber = ex.numberExercise ?? ex.numberCircuit;

            const innerName = isInnerExercise
              ? (typeof ex.name === 'object' ? ex.name.name : ex.name)
              : (ex.type || 'Circuito');

            const cols = isInnerExercise ? getCols(ex.peso) : null;

            const blockBackoffLabel =
              (ex?.name?.titleName && ex.name.titleName.trim() !== "")
                ? ex.name.titleName
                : "Back off";

                  // helper para mostrar "type - typeOfSet" en circuitos
            const renderCircuitTitle = (type, typeOfSetLike) => (
              <span>
                {type || 'Circuito'}
                {typeOfSetLike ? <> - {typeOfSetLike}</> : null}
              </span>
            );

            return (
              <React.Fragment key={ex.exercise_id || ex._id || j}>
                <div className="col-12 mb-2 mb-4 shadow-personalized">
                  <div className="row justify-content-around rounded-2 p-2 align-items-center">
                    <div className="col-1 text-center">
                      {renderNumberIcon(innerNumber)}
                    </div>

                    <div className="col-11 text-start">
                      {isInnerExercise
                        ? innerName
                        : renderCircuitTitle(
                            ex.type,
                            ex.typeOfSet ?? ex.typeOfSets
                          )}
                    </div>

                    {isInnerExercise ? (
                      <>
                        <div className={`${cols.setsCol} p-0 mt-4 mb-2`}>
                          <span className="stylesBadgesItemsExerciseSpan d-block">
                            {ex.sets}
                          </span>
                          <div className="fontStylesSpan">Sets</div>
                        </div>

                        <div className={`${cols.repsCol} p-0 mt-4 mb-2`}>
                          {Array.isArray(ex.reps) ? (
                            ex.reps.map((r, k) => (
                              <React.Fragment key={k}>
                                <span className="stylesBadgesItemsExerciseSpan arrayBadge">{r}</span>
                                {k < ex.reps.length - 1 && <span className="">-</span>}
                              </React.Fragment>
                            ))
                          ) : (
                            <span className="stylesBadgesItemsExerciseSpan">{ex.reps}</span>
                          )}
                          <div className="fontStylesSpan">Reps</div>
                        </div>

                        <div className={`${cols.pesoCol} p-0 mt-4 mb-2`}>
                          <span className="stylesBadgesItemsExerciseSpan d-block">
                            {ex.peso || '-'}
                          </span>
                          <div className="fontStylesSpan">Peso</div>
                        </div>

                        <div className={`${cols.restCol} p-0 mt-3 mb-2`}>
                          <CountdownTimer initialTime={ex.rest} />
                          <div className="fontStylesSpan mt-1 mb-1">Descanso</div>
                        </div>
                      </>
                    ) : (
                      // CIRCUITO dentro del bloque (sin type === 'exercise')
                      <div className="col-12 p-0 mt-4 mb-2 ">
                        <table className="table border-0 ">
                          <thead>
                            <tr className="bg-light">
                              <th className="border-0 text-start bg-light">Nombre</th>
                              <th className="border-0 bg-light">Reps</th>
                              <th className="border-0 bg-light">Peso</th>
                            </tr>
                          </thead>
                          <tbody className="bg-light">
                            {ex.circuit?.map((c, k) => (
                              <tr key={c.idRefresh || k}>
                                <td className="border-0 text-start bg-light">{c.name}</td>
                                <td className="border-0 bg-light">{c.reps}</td>
                                <td className="border-0 bg-light">{c.peso}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* — Aproximaciones / Backoff / Notas SOLO para ejercicios internos — */}
                  {isInnerExercise && ex.name?.approximations?.length > 0 && (
                    <>
                      <span className="styleInputsNote-back ">
                        {ex.name.approxTitle ?? 'Aproximaciones'}
                      </span>
                      <div className="colorNote3 py-2 rounded-1 ">
                        {ex.name.approximations.map((ap, i) => (
                          <div className="row my-1" key={i}>
                            <span className="fs07em text-muted col-6">
                              <b>{i + 1}°</b> aproximación -
                            </span>
                            <p className="mb-0 col-5 text-start">
                              {ap.reps} reps / {ap.peso}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {isInnerExercise && ex.name?.backoff?.length > 0 && (
                    <>
                      <span className="styleInputsNote-back m-auto">{blockBackoffLabel}</span>
                      <div className="colorNote2 py-2 rounded-1 mb-2">
                        {ex.name.backoff.map((line, i) => (
                          <p key={i} className="mb-0 ">
                            {line.sets}×{line.reps} / {line.peso}
                          </p>
                        ))}
                      </div>
                    </>
                  )}

                  {isInnerExercise && ex.notas && (
                    <>
                      <span className="styleInputsNote-back text-start">Notas / otros</span>
                      <div className="colorNote py-2 rounded-1" style={{ whiteSpace: 'pre-wrap' }}>
                        <p className="pb-0 mb-0">{ex.notas}</p>
                      </div>
                    </>
                  )}

                  {/* Footer solo para ejercicio interno */}
                  {isInnerExercise && (
                    <div className="row justify-content-between align-items-center mt-2 px-2">
                      <div className="col-auto">
                        <Contador max={ex.sets} />
                      </div>

                      <div className="col-auto">
                        <IconButton
                          aria-label="video"
                          disabled={!ex.video}
                          onClick={() => handleButtonClick(ex)}
                        >
                          {ex.isImage
                            ? <ImageIcon className={ex.video ? 'imageIcon' : 'imageIconDisabled'} />
                            : <YouTubeIcon className={ex.video ? 'ytColor' : 'ytColor-disabled'} />
                          }
                        </IconButton>
                      </div>

                      <div className="col-auto">
                        <IconButton
                          aria-label="editar"
                          onClick={() => handleEditMobileBlockExercise(ex, idx, j)}
                        >
                          <EditNoteIcon />
                        </IconButton>
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <>
            <div className="col-12 p-0 mt-4 mb-2">
              <table className="table border-0">
                <thead>
                  <tr>
                    <th className="border-0 text-start">Nombre</th>
                    <th className="border-0">Reps</th>
                    <th className="border-0">Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {element.circuit.map(c => (
                    <tr key={c.idRefresh}>
                      <td className="border-0 text-start">{c.name}</td>
                      <td className="border-0">{c.reps}</td>
                      <td className="border-0">{c.peso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {element.name?.approximations?.length > 0 && (
          <>
            <span className="styleInputsNote-back">
              {element.name.approxTitle ?? 'Aproximaciones'}
            </span>
            <div className="colorNote3 py-2 rounded-1 col-11">
              {element.name.approximations.map((ap, i) => (
                <div className="row my-1" key={i}>
                  <span className="fs07em text-muted col-6">
                    <b>{i + 1}°</b> aproximación -
                  </span>
                  <p className="mb-0 col-5 text-start">
                    {ap.reps} reps / {ap.peso}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* — BACKOFF y NOTAS (idéntico en ambos casos top-level) — */}
        {element.name?.backoff?.length > 0 && (
          <>
            <span className="styleInputsNote-back">{backoffLabel}</span>
            <div className="colorNote2 py-2 rounded-1 col-11 mb-2">
              {element.name.backoff.map((line, i) => (
                <p key={i} className="mb-0 ms-1">
                  {line.sets}×{line.reps} / {line.peso}
                </p>
              ))}
            </div>
          </>
        )}

        {element.notas && (
          <>
            <span className="styleInputsNote-back text-start">Notas / otros</span>
            <div
              className="colorNote py-2 rounded-1 col-11 largoCarddds"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              <p className="pb-0 mb-0">{element.notas}</p>
            </div>
          </>
        )}

        {/* — FOOTER: Contador + botones — */}
        {isExercise ? (
          <>
            <div className="row justify-content-between">
              <div className="col-6 text-start m-auto">
                <Contador max={element.sets} />
              </div>

              <div className="col-3">
                <IconButton
                  id={idx === 0 ? 'video' : null}
                  aria-label="video"
                  disabled={!element.video}
                  onClick={() => handleButtonClick(element)}
                >
                  {element.isImage
                    ? <ImageIcon className={!element.video ? 'imageIconDisabled' : 'imageIcon'} />
                    : <YouTubeIcon className={element.video ? 'ytColor' : 'ytColor-disabled'} />
                  }
                </IconButton>
              </div>

              <IconButton
                id={idx === 0 ? 'edicion' : null}
                aria-label="editar"
                className="p-0 col-3"
                onClick={() => handleEditMobileExercise(element, idx)}
              >
                <EditNoteIcon className="editStyle p-0" />
              </IconButton>
            </div>
          </>
        ) : (
          <div className={'mb-3'}></div>
        )}
      </div>
    </div>
  );
})}

          
                  </div>
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
          header="Herramientas"
          visible={showToolsDialog}
          style={{ width: '97vw', minHeight: '90%' }}
          className="DialogCalculator"
          onHide={() => setShowToolsDialog(false)}
          draggable={true}
        >
          <div className="mb-4 text-center">
            <Segmented
              block
              options={[
                { label: 'Calculadora & Contador', value: 'calculator' },
                { label: '1RM Estimado', value: 'pr' }
              ]}
              value={selectedTool}
              onChange={setSelectedTool}
            />
          </div>

          <div className="mt-3">
            {selectedTool === "calculator" && <PercentageCalculator />}
            {selectedTool === "pr" && (
              <div className="text-center">
                <Formulas />
              </div>
            )}
          </div>
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
                      {!isCurrentWeek && (
                        <div className="alert alert-warning text-center shadow">
                          Recordá que estás en una semana anterior. No estás en la última semana designada por tu entrenador.
                        </div>
                      )}
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
                          {Array.isArray(completeExercise.reps) ? (
                            <input
                              type="text"
                              className="form-control"
                              value={completeExercise.reps.join(', ')}
                              disabled
                            />
                          ) : (
                            <input
                              type="number"
                              className="form-control"
                              value={completeExercise.reps ?? ''}
                              disabled
                            />
                          )}
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
                            className="btn btn-outline-light me-3"
                            onClick={hideDialogEditExercises}
                          >
                            Cancelar
                          </button>
                          <button
                            className="btn colorMainAll text-light"
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
                  className="fixed-bottom d-flex justify-content-around align-items-center py-2 colorMainAll"
                  style={{ backgroundColor: '#000' }}
                >
                <button
                    className="nav-item btn-bottom-nav d-flex flex-column align-items-center border-0 bg-transparent"
                    onClick={() => setShowToolsDialog(true)}
                  >
                    <IconButton className="fs-1">
                      <PercentIcon className="text-light small" />
                    </IconButton>
                    <span className="text-light small">Calculadora</span>
                  </button>
                  <button
                    className="nav-item btn-bottom-nav d-flex flex-column align-items-center border-0 bg-transparent"
                    onClick={() => setShowWeeklySummaryModal(true)}
                  >
                    <IconButton className="fs-1">
                      <CommitIcon className="text-light small" />
                    </IconButton>
                    <span className="text-light small">Resumen semanal</span>
                  </button>

                  <button
                    className="nav-item btn-bottom-nav d-flex flex-column align-items-center border-0 bg-transparent"
                    onClick={() => setShowDriveDialog(true)}
                  >
                    <IconButton className="fs-1">
                      <AddToDriveIcon className="text-light small" />
                    </IconButton>
                    <span className="text-light small">{driveLink ? 'Google Drive' : 'Agregar Drive'}</span>
                  </button>
                </nav>

                {/* Nuevo Dialog para mostrar el mensaje cuando no existe el perfil */}
                <Dialog
                    header="Completa tu perfil"
                    visible={showProfileMissingModal}
                    style={{ width: '90vw' }}
                    modal
                    dismissableMask={true}
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


                <Dialog header="Tu carpeta de Google Drive" visible={showDriveDialog} style={{ width: '90vw' }} onHide={() => setShowDriveDialog(false)}>
                  <div className="mb-3">
                    <label htmlFor="driveLink" className="form-label">Link de tu carpeta de google drive</label>
                    <input
                      type="text"
                      id="driveLink"
                      className="form-control"
                      placeholder="https://drive.google.com/..."
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                    />
                  </div>

                  <div className="alert alert-info small">
                    <strong>¿Cómo obtener tu link?</strong>
                    <ul className="mb-2 list-group list-group-flush">
                      <li className="list-group-item bg-transparent">Ingresá a tu<button className="py-0 btn btn-primary ms-2 py-1"><AddToDriveIcon className="text-light" /> <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Google Drive</a></button></li>
                      <li className="list-group-item bg-transparent">Creá una carpeta con tu nombre y apellido</li>
                      <li className="list-group-item bg-transparent">Entrá a tu carpeta, presioná en este icono <IconButton className="py-0"><MoreVertIcon /></IconButton>y hacé click en “Compartir”</li>
                      <li className="list-group-item bg-transparent">Presioná en administrar/gestionar acceso, luego, en acceso general y, si está en restringido, cambialo a “Cualquier persona que tenga el vinculo/enlace”</li>
                      <li className="list-group-item bg-transparent">Lo importante es que no sea privado, así tu entrenador puede ver tu carpeta.</li>
                      <li className="list-group-item bg-transparent">Apretá en el icono <IconButton className="py-0"><LinkIcon /></IconButton> copia el vinculo, y pegalo acá.</li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button className="btn btn-outline-light" onClick={() => setShowDriveDialog(false)} >Cancelar</button>
                    <button className="btn  text-light" style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}  onClick={saveDriveLink} >Guardar</button>
                  </div>
                </Dialog>


               <Dialog
                  header="Resumen Semanal"
                  className="paddingDialog"
                  visible={showWeeklySummaryModal}
                  style={{ width: '95vw' }}
                  onHide={() => setShowWeeklySummaryModal(false)}
                  draggable
                >
                  <div className="calc-container">
                    <div className="card-dark mb-3">
                      <span className="label"><strong>Última actualización:</strong> {weeklySummary.lastSaved ? new Date(weeklySummary.lastSaved).toLocaleString() : '-'}</span>
                    </div>

                    {[
                      { label: 'Alimentación', key: 'selection1' },
                      { label: 'NEAT', key: 'selection2', tooltip: 'NEAT se refiere a la energía que gastas en tus actividades cotidianas...' },
                      { label: 'Sensaciones del entrenamiento', key: 'selection3' },
                      { label: 'Descanso / sueño', key: 'selection4' },
                      { label: 'Niveles de estrés', key: 'selection5' }
                    ].map(({ label, key, tooltip }) => (
                      <div key={key} className="card-dark mb-3">
                        <label className="label d-flex align-items-center">
                          {label}
                          {tooltip && (
                            <Tooltip title={tooltip} arrow enterTouchDelay={0} leaveTouchDelay={8000}>
                              <IconButton size="small" className="ms-2 text-light">
                                <HelpOutlineIcon fontSize="inherit" className="text-light" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </label>
                        <select
                          value={weeklySummary[key]}
                          onChange={(e) => setWeeklySummary(prev => ({ ...prev, [key]: e.target.value }))}
                          className="input-dark"
                        >
                          <option value="">Seleccionar...</option>
                          {['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}

                    
                        <div className="card-dark mb-3">
                          <label className="label">Peso corporal (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="input-dark "
                            value={weeklySummary.pesoCorporal}
                            onChange={e =>
                              setWeeklySummary(prev => ({
                                ...prev,
                                pesoCorporal: e.target.value
                              }))
                            }
                          />
                        </div>

                    <div className="card-dark mb-3">
                      <label className="label">Comentarios sobre la semana</label>
                      <InputTextarea
                        autoResize
                        value={weeklySummary.comments || ""}
                        onChange={(e) => setWeeklySummary(prev => ({ ...prev, comments: e.target.value }))}
                        className="input-dark"
                        placeholder="Escribí acá tus comentarios..."
                      />
                      <div className="d-flex justify-content-center mt-3">
                        <Button
                          label="Vaciar comentarios"
                          icon="pi pi-trash"
                          className="btn btn-outline-light"
                          onClick={() =>
                            setWeeklySummary(prev => ({ ...prev, comments: "" }))
                          }
                        />
                      </div>
                    </div>



                    <div className="row justify-content-end">
                      <div className="col-5">
                        <Button
                          label="Cancelar"
                          className="btn btn-outline-light w-100"
                          onClick={() => setShowWeeklySummaryModal(false)}
                        />
                      </div>
                      <div className="col-5">
                        <Button
                          label="Guardar"
                          className="btn text-light w-100"
                          style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}
                          onClick={() => {
                            const updatedSummary = { ...weeklySummary, lastSaved: new Date().toISOString() };
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
