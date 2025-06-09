import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";



//.............................. SERVICES ..............................//
import * as WeekService from "../../services/week.services.js";
import * as PARService from '../../services/par.services.js';



//.............................. HELPERS ..............................//

import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";


 
//.............................. ARCHIVOS JSON ..............................//
import Options from "../../assets/json/options.json";



//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { TimePicker, CustomProvider } from 'rsuite';
import { Tour } from 'antd';
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { OverlayPanel } from "primereact/overlaypanel";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Segmented } from "antd";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import esES from 'rsuite/locales/es_ES'; 
import ObjectId from 'bson-objectid';
import { SelectButton } from 'primereact/selectbutton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

//.............................. COMPONENTES ..............................//


import LogoChico from "../../components/LogoChico.jsx";
import ModalCreateWarmup from "../../components/Bootstrap/ModalCreateWarmup.jsx";
import ModalCreateMovility from "../../components/Bootstrap/ModalCreateMovility.jsx";
import CustomInputNumber from "../../components/CustomInputNumber.jsx";
import AutoComplete from "../../components/Autocomplete.jsx";



//.............................. ICONOS MUI ..............................//



import SaveIcon from '@mui/icons-material/Save';
import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from "@mui/icons-material/Cancel";
import UpgradeIcon from '@mui/icons-material/Upgrade';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RemoveIcon from '@mui/icons-material/Remove';
import CircleIcon from '@mui/icons-material/Circle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';

import {
  User,
  CalendarPlus,
  Repeat,
  ClipboardCopy,
  HelpCircle,
  ToggleLeft,
  SquarePlus,
  Info
} from 'lucide-react';

function parseToDateForTimePicker(timeData) {
  if (timeData == null || timeData === "") {
    // Por defecto, retornamos 00:00
    return new Date(0, 0, 0, 0, 0, 0);
  }

  // Lo convertimos a string para manipularlo
  let str = String(timeData).trim().replace(",", ".");

  // Separamos minutos/segundos si viene con ":", por ejemplo "03:15"
  if (str.includes(":")) {
    let [minStr, secStr = "0"] = str.split(":");
    let minutes = parseInt(minStr, 10) || 0;
    let seconds = parseInt(secStr, 10) || 0;
    const date = new Date();
    date.setHours(0, minutes, seconds, 0);
    return date;
  }

  // Si no tiene ":", interpretamos todo como minutos (o minutos con decimales)
  let numeric = parseFloat(str);
  if (isNaN(numeric)) {
    // Si definitivamente no se parsea a número, devolvemos 00:00
    return new Date(0, 0, 0, 0, 0, 0);
  }

  // Ej: 2 => "02:00", 2.5 => 2 minutos 30 seg, 3 => "03:00"
  const totalSeconds = Math.round(numeric * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const date = new Date();
  date.setHours(0, minutes, seconds, 0);
  return date;
}

function DayEditDetailsPage() {
  const { week_id } = useParams();
  const { day_id } = useParams();
  const { id } = useParams();
  const { username } = useParams();

  const [routine, setRoutine] = useState();
  const [weekName, setWeekName] = useState();
  const [status, setStatus] = useState(1); 
  const [statusCancel, setStatusCancel] = useState(1); 
  const [loading, setLoading] = useState(null); 

  const [isEditingWeekName, setIsEditingWeekName] = useState(false);
  const [newWeekName, setNewWeekName] = useState(weekName);

  const [options, setOptions] = useState(); 
  const [day, setDay] = useState([]);
  const [modifiedDay, setModifiedDay] = useState([]); 
  const [warmup, setWarmup] = useState(false); 
  const [firstWidth, setFirstWidth] = useState(); 
  const [visibleEdit, setVisibleEdit] = useState(false); 
  const [visible, setVisible] = useState(false);

  let idRefresh = RefreshFunction.generateUUID();

  const [allDays, setAllDays] = useState([]);
  const [indexDay, setIndexDay] = useState(0);
  const [currentDay, setCurrentDay] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDayDialog, setShowDeleteDayDialog] = useState(false); 
  const [isEditingName, setIsEditingName] = useState(false); 
  const [newDayName, setNewDayName] = useState(""); 
  const [dayToEdit, setDayToEdit] = useState(null); 
  const [editMode, setEditMode] = useState(false); 
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [glowVideo, setGlowVideo] = useState({});
  const [tourSteps, setTourSteps] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);
  const [movilityVisible, setMovilityVisible] = useState(false);

  const [renderInputSets, setRenderInputSets] = useState(true);
  const [renderInputReps, setRenderInputReps] = useState(true);

  const [editingBackoffIndex, setEditingBackoffIndex] = useState(null);
  const [backoffData, setBackoffData] = useState([{ sets: "", reps: "", peso: "" }]);
  const backoffOverlayRef = useRef(null);

  const productRefsSimple = useRef([]);
  const productRefsCircuit = useRef([]);

  useEffect(() => {
    setLoading(true);
    Notify.notifyA("Cargando");

    WeekService.findByWeekId(week_id).then((data) => {
      setRoutine(data[0]);
      setWeekName(data[0].name);
      setModifiedDay(data[0].routine);
      setAllDays(data[0].routine);
      setDay(data[0].routine);
      setCurrentDay(data[0].routine[0]);
      console.log(data[0].routine)
      Notify.updateToast();
    });
  }, [statusCancel]);

  useEffect(() => {
    setCurrentDay(null);
  }, [statusCancel]);

  useEffect(() => {
    setFirstWidth(window.innerWidth);

    const groupedOptions = Options.reduce((acc, group) => {
      acc.push({
        label: group.label,
        value: group.value,
        disabled: null,
      });
      acc.push(...group.items);
      return acc;
    }, []);

    setOptions(groupedOptions);
  }, []);


     


  useEffect(() => {
    setTourSteps([
      {
        title: 'Días de la semana',
        description: 'Estos son los dias que contiene la semana. Podes navegar entre ellos apretando en el día correspondiente.',
        target: () => document.getElementById('dias'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Agregar día',
        description: 'Este botón permite agregar un día.',
        target: () => document.getElementById('agregarDia'),
        placement: 'right',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Editar el nombre del día',
        description: 'Acá podes editar el nombre de cada día.',
        target: () => document.getElementById('editarDia'),
        placement: 'right',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Eliminar día',
        description: 'Podes eliminar un día. Esta acción es reversible, si apretas cancelar.',
        target: () => document.getElementById('eliminarDia'),
        placement: 'right',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Bloque de entrada en calor',
        description: 'Ingresá al bloque de entrada en calor de tu alumno. Podes agregar los ejercicios de movilidad / activación que desees.',
        target: () => document.getElementById('warmup'),
        placement: 'bottom',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Añadir ejercicio',
        description: 'Podes agregar un ejercicio para luego completarlo.',
        target: () => document.getElementById('addEjercicio'),
        placement: 'top',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Nombre de la semana.',
        description: 'Ademas de ser el nombre, podés editarlo apretando el botón.',
        target: () => document.getElementById('nameWeek'),
        placement: 'top',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Añadir circuito',
        description: 'Podes agregar la estructura de un circuito, para luego completarlo.',
        target: () => document.getElementById('addCircuit'),
        placement: 'top',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Sumar 1 serie ( general )',
        description: 'Podés sumar una serie a todos los ejercicios del día correspondiente.',
        target: () => document.getElementById('addSets'),
        placement: 'top',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Dia actual',
        description: 'Este es el día en el que te encontrás actualmente. Todo lo que agregues y edites, será de este día.',
        target: () => document.getElementById('diaActual'),
        placement: 'top',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      },
      {
        title: 'Sumar 1 repetición ( general )',
        description: 'Podés sumar una repetición a todos los ejercicios del día correspondiente.',
        target: () => document.getElementById('addReps'),
        placement: 'top',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: '¡Finalizar!' }
      }
    ]);
  }, []);



  useEffect(() => {
    if (day[indexDay]) {
      setCurrentDay({ ...day[indexDay] });
      setRenderInputSets(true)
      setRenderInputReps(true)
    }
  }, [day, indexDay]);      



  const handleShowMovility = () => {
    setMovilityVisible(true);
    setIsEditing(false);
  };

  // =================== FUNCIONES PARA BACK OFF ===================
  const handleOpenBackoffOverlay = (e, index) => {
    setEditingBackoffIndex(index);
    const currentExercise = day[indexDay].exercises[index];
    let currentBackoff = [{ sets: "", reps: "", peso: "" }];
    if (currentExercise && typeof currentExercise.name === 'object') {
      // Si existe el campo backoff y es un array, lo usamos. Sino dejamos el valor por defecto.
      currentBackoff = Array.isArray(currentExercise.name.backoff)
        ? currentExercise.name.backoff
        : currentBackoff;
    }
    setBackoffData(currentBackoff);
    backoffOverlayRef.current.toggle(e);
  };
  
  const saveBackoffInternally = (data) => {
    if (editingBackoffIndex === null) return;

    const updated = [...day];
    const ex = updated[indexDay].exercises[editingBackoffIndex];
    const rawName = ex.name;

    const cleaned = data.filter(b => b.sets || b.reps || b.peso);

    if (cleaned.length === 0) {
      ex.name = typeof rawName === 'object' ? { ...rawName } : { name: rawName };
      delete ex.name.backoff;
    } else {
      ex.name = typeof rawName === 'object'
        ? { ...rawName, backoff: cleaned }
        : { name: rawName, backoff: cleaned };
    }

    updated[indexDay].exercises[editingBackoffIndex] = ex;
    setDay(updated);
    setModifiedDay(updated);
    setCurrentDay({ ...updated[indexDay] });
    setIsEditing(true);
  };

  const handleSaveBackoff = () => {
    saveBackoffInternally(backoffData);
    backoffOverlayRef.current.hide();
    setEditingBackoffIndex(null);
    setBackoffData([{ sets: "", reps: "", peso: "" }]);
  };

  const removeBackoffLine = (index) => {
    const updated = [...backoffData];
    updated.splice(index, 1);
    setBackoffData(updated);
    saveBackoffInternally(updated);
  };

const hasBackoff = exercise => (
    exercise && typeof exercise.name === 'object' &&
    Array.isArray(exercise.name.backoff) &&
    exercise.name.backoff.some(b => b.sets || b.reps || b.peso)
  );


  /**  re-enumerar los ejercicios después de arrastrar y soltar. **/
  const reorderExercises = (exercisesArray) => {
    return exercisesArray.map((ex, idx) => {
      return { ...ex, numberExercise: idx + 1 };
    });
  };

  /** Función que se llama cuando el drag termina. Reordena la lista y actualiza el estado. */
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const updatedDays = [...day];
    // Tomamos la lista de ejercicios del día actual
    const exercisesArray = Array.from(updatedDays[indexDay].exercises);

    // Removemos el ítem de la posición original
    const [reorderedItem] = exercisesArray.splice(result.source.index, 1);
    // Insertamos el ítem en la posición de destino
    exercisesArray.splice(result.destination.index, 0, reorderedItem);

    // Re-enumeramos
    updatedDays[indexDay].exercises = reorderExercises(exercisesArray);

    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setIsEditing(true); 
  };

  const editAndClose = () => {
    setWarmup(false);
    setMovilityVisible(false)
    setIsEditing(true)
  };

  const confirmDelete = () => {
    setVisible(false);
  };

  const hideDialogWarmup = () => {
    setWarmup(false);
    if(allDays == modifiedDay){
      
    }
  };

  const propiedades = [
    "⇄",
    "#",
    "Nombre",
    "Series",
    "Reps",
    "Peso",
    "Rest",
    "Video",
    "Notas",
    "#",
  ];

  const customLocale = {
    ...esES,
    TimePicker: {
      ...esES.TimePicker,
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos'
    }
  };

  const inputRefs = useRef([]);

  // Funcion para editar el dia
  const changeModifiedData = (index, value, field) => {
    setIsEditing(true);
    const updatedDays = [...day];

    updatedDays[indexDay].exercises[index] = {
      ...updatedDays[indexDay].exercises[index],
      [field]: value,
    };

    if (field === "video" && value) { 
      setGlowVideo(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setGlowVideo(prev => ({ ...prev, [index]: false }));
      }, 2000);
    }

    updatedDays[indexDay].lastEdited = new Date().toISOString();
    setModifiedDay(updatedDays);
  };

  const onActivateTextMode = (data) => {

    setIsEditing(true)
  };

  const customInputEditDay = (data, index, field) => {
   if (field === "sets" ) {
      return (
        <>
        {renderInputSets ? 
        <CustomInputNumber
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          initialValue={data}
          onChange={(e) => changeModifiedData(index, e, field)}
          isRep={field === "reps"}
          className={`mt-5`}

        /> :
        <>
          <div className={`row justify-content-center text-center aa ${field == 'reps' && 'mb-2 marginReps'}`}>
            <div className={`input-number-container ${firstWidth < 992 && 'col-8' }`}>
            <IconButton               
                className={`buttonRight `}>
                    <RemoveIcon  />
                </IconButton>

              <input
                className={`form-control rounded-0 inp text-center inputFontSize `}
              />

                <IconButton               
                className={`buttonLeft `}
                >
                    <AddIcon  />
                </IconButton>
            </div>
          </div>



          </>
        }
        </>
      );
    } else if (field === "reps" ) {
      return (
        <>
        {renderInputReps ? 
        <CustomInputNumber
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          initialValue={data}
          onChange={(e) => changeModifiedData(index, e, field)}
          isRep={field === "reps"}
          className={`mt-5`}
          onActivate={() => onActivateTextMode()}
        /> :
        <>
          <div className={`row justify-content-center text-center aa ${field == 'reps' && 'mb-2 '}`}>
            <div className={`input-number-container`}>
            <IconButton               
                className={`buttonRight `}
                >
                    <RemoveIcon />
                </IconButton>

              <input className={`form-control rounded-0 inp text-center inputFontSize `}/>

                <IconButton               
                className={`buttonLeft `}
                >
                    <AddIcon  />
                </IconButton>
            </div>

             <div className={`  ${firstWidth < 992 ? `text-start  col-4 me-1  positionModeText mt-1` : 'mt-2 text-center '}`}>
                              <SelectButton
                                className={`${firstWidth > 992 && 'styleSelectButton'}`}
                                options={[
                                  { label: firstWidth > 992 ? 'Modo Texto' : 'T', value: 'text' }
                                ]}
                              />
                            </div> 
                    
          </div>

          </>
        }
        </>
      );}
       else if (field === "video") {
      const shouldGlow = glowVideo[index];
      return (
        <>
          <IconButton
            aria-label="video"
            className={`w-100  ${shouldGlow ? 'glowing-icon' : ''}`}
            onClick={(e) => {
              productRefsSimple.current[index].toggle(e);
            }}
          >
            <YouTubeIcon className="colorIconYoutube largoIconYt" />
          </IconButton>
          <div>
            <OverlayPanel 
              ref={(el) => (productRefsSimple.current[index] = el)}
            >
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`checkbox-image-${index}`}
                    checked={!!day[indexDay]?.exercises[index]?.isImage} 
                    onChange={(e) => {
                      changeModifiedData(
                        index,
                        e.target.checked,
                        "isImage"
                      );
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`checkbox-image-${index}`}
                  >
                    ¿Es una imagen?
                  </label>
                  <span className="d-block textSpanVideo"> Si tildás esta opción, e ingresas un link de una imagen, tu alumno la verá. </span>
                </div>
              </div>
              <input
                ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
                className="form-control ellipsis-input text-center"
                type="text"
                defaultValue={data}
                onChange={(e) => changeModifiedData(index, e.target.value, field)}
              />
            </OverlayPanel>
          </div>
        </>
      );
    } else if (field === "notas") {
      return (
        <InputTextarea
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          className={`w-100`}
          autoResize
          defaultValue={data}
          onChange={(e) => changeModifiedData(index, e.target.value, field)}
        />
      );
    } else if (field === "rest") {
      // CHANGES: Usamos parseToDateForTimePicker para normalizar la entrada
      // y en onChange guardamos en formato mm:ss
      return (
        <CustomProvider locale={customLocale}>
          <TimePicker
            format="mm:ss"
            defaultValue={parseToDateForTimePicker(data)}
            ranges={[]}
            placeholder="min..."
            editable
            onChange={(e) => {
              const minutes = String(e.getMinutes()).padStart(2, "0");
              const seconds = String(e.getSeconds()).padStart(2, "0");
              changeModifiedData(index, `${minutes}:${seconds}`, field);
            }}
          />
        </CustomProvider>
      );
    } else {
      return (
        <input
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          className={`form-control ${firstWidth ? "border" : "border-0"} ellipsis-input text-center`}
          placeholder={ field === 'rest' ? `2...`: "kg..."}
          type="text"
          defaultValue={data}
          onChange={(e) => changeModifiedData(index, e.target.value, field)}
        />
      );
    }
  };

  const applyChanges = () => {
    WeekService.editWeek(week_id, modifiedDay)
      .then(() => {
        Notify.instantToast("Rutina guardada con éxito!");
        setStatus(idRefresh);
        setIsEditing(false);
      });
  };

  const handleDeleteClick = (exercise) => {
    setExerciseToDelete(exercise);
    setShowDeleteDialog(true);
  };

  function acceptDeleteExercise(id) {
    setIsEditing(true);
    const updatedDays = [...day];
    updatedDays[indexDay].exercises = updatedDays[indexDay].exercises.filter(
      (exercise) => exercise.exercise_id !== id
    );
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast("Ejercicio eliminado con éxito");
  }

  const handleDeleteConfirm = () => {
    if (exerciseToDelete) {
      acceptDeleteExercise(exerciseToDelete.exercise_id);
    }
    setShowDeleteDialog(false);
    setExerciseToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setExerciseToDelete(null);
  };

  const handleShowWarmup = () => {
    setWarmup(true);
    setIsEditing(false);
  };

  const AddNewExercise = () => {
    const updatedDays = [...allDays];
    const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;

    const newExercise = {
      exercise_id: new ObjectId().toString(),
      type: 'exercise',
      numberExercise: nextNumberExercise,
      name: '',
      reps: 1,
      sets: 1,
      peso: '',
      rest: '',
      video: '',
      notas: '',
    };

    updatedDays[indexDay].exercises.push(newExercise);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Ejercicio creado con éxito!");
  };

  const handleCancel = () => {
    setCurrentDay[null];
    setStatusCancel(idRefresh);
    setIsEditing(false);
  };

  const confirmCancel = () => {
    setShowCancelDialog(true);
  };

  const addNewDay = () => {
    const updatedDays = [...allDays];
    const nextDayIndex = updatedDays.length + 1;

    const newDay = {
      _id: new ObjectId().toString(),
      name: `Día ${nextDayIndex}`,
      lastEdited: new Date().toISOString(),
      exercises: [
        {
          exercise_id: new ObjectId().toString(),
          type: 'exercise',
          numberExercise: 1,
          name: '',
          reps: 1,
          sets: 1,
          peso: '',
          rest: '',
          video: '',
          notas: '',
        },
      ],
    };

    updatedDays.push(newDay);
    setAllDays(updatedDays);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast("Día creado con éxito");
  };

  const confirmDeleteDay = () => {
    setIsEditing(true);
    if (!currentDay) return;

    const updatedDays = [...allDays];
    const dayIndex = updatedDays.findIndex(day => day._id === currentDay._id);

    updatedDays.splice(dayIndex, 1);

    if (updatedDays.length === 0) {
      setAllDays([]);
      setCurrentDay(null);
      setIndexDay(0);
      return;
    }

    const newDayIndex = dayIndex === 0 ? 0 : dayIndex - 1;
    setAllDays(updatedDays);
    setCurrentDay(updatedDays[newDayIndex]);
    setIndexDay(newDayIndex);
    setModifiedDay(updatedDays);
  };

  const handleDeleteDayClick = () => {
    setShowDeleteDayDialog(true);
  };

  const openEditNameDialog = (day) => {
    setDayToEdit(day);
    setNewDayName(day.name);
    setIsEditingName(true);
  };

  const saveNewDayName = () => {
    setIsEditing(true);
    const updatedDays = [...allDays];
    const dayIndex = updatedDays.findIndex((d) => d._id === dayToEdit._id);
    if (dayIndex !== -1) {
      updatedDays[dayIndex].name = newDayName;
      setAllDays(updatedDays);
      setModifiedDay(updatedDays);
    }
    setIsEditingName(false);
  };

  const AddNewCircuit = () => {
    const updatedDays = [...allDays];
    const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;

    const newCircuit = {
      name: '',
      typeOfSets: '',
      notas: '',
      circuit: [
        {
          name: "",
          reps: 1,
          peso: "0",
          video: "",
          idRefresh: RefreshFunction.generateUUID(),
        },
      ],
      numberExercise: nextNumberExercise, 
      exercise_id: new ObjectId().toString(),
    };

    updatedDays[indexDay].exercises.push(newCircuit);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Circuito añadido con éxito!");
  };

  const AddExerciseToCircuit = (circuitIndex) => {
    const updatedDays = [...day];

    const newExercise = {
      name: "",
      reps: 0,
      peso: "0",
      video: "",
      idRefresh: RefreshFunction.generateUUID(),
    };

    updatedDays[indexDay].exercises[circuitIndex].circuit.push(newExercise);

    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Ejercicio añadido con éxito!");
  };

  const customInputEditCircuit = (data, circuitIndex, field) => {
    if (field === "reps"){
      return (
        <CustomInputNumber
          ref={(el) => inputRefs.current[`${circuitIndex}-${field}`] = el}
          initialValue={data}
          onChange={() => changeCircuitData(circuitIndex, field)}
          isRep={field === "reps"}
          className={`mt-5`}
        />
      );
    } else if(field === "notas") {
      return(
        <div className="row justify-content-center">
          <InputTextarea
            ref={(el) => inputRefs.current[`${circuitIndex}-${field}`] = el}
            className={`textAreaResize ${firstWidth < 600 && 'col-11'}`}
            autoResize
            defaultValue={data}
            onChange={() => changeCircuitData(circuitIndex, field)}
          />
        </div>
      );
    } else {
      return (
        <input
          ref={(el) => inputRefs.current[`${circuitIndex}-${field}`] = el}
          placeholder={ field === 'type' ? `Amrap / emom ...` : " 3 / 10' ..."}
          className="form-control ellipsis-input text-center"
          type="text"
          defaultValue={data} 
          onChange={() => changeCircuitData(circuitIndex, field)}
        />
      );
    }
  };

  const changeCircuitData = (circuitIndex, field) => {
    setIsEditing(true);
    const value = inputRefs.current[`${circuitIndex}-${field}`].value;

    const updatedDays = [...day];
    const updatedCircuit = {
      ...updatedDays[indexDay].exercises[circuitIndex],
      [field]: value,
    };

    updatedDays[indexDay].exercises[circuitIndex] = updatedCircuit;
    updatedDays[indexDay].lastEdited = new Date().toISOString();

    setDay(updatedDays);
    setModifiedDay(updatedDays);
  };

  const customInputEditExerciseInCircuit = (data, circuitIndex, exerciseIndex, field, repsValue) => {
    if(field === "video") {
      return (
        <>
          <IconButton
            aria-label="video"
            className="w-100"
            onClick={(e) => {
              productRefsCircuit.current[exerciseIndex].toggle(e);
            }}
          >
            <YouTubeIcon className="colorIconYoutube" />
          </IconButton>
          <OverlayPanel
            ref={(el) => (productRefsCircuit.current[exerciseIndex] = el)}
          >
            <input
              ref={(el) => inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el}
              className="form-control ellipsis-input text-center"
              type="text"
              defaultValue={data}
              onChange={() => changeExerciseInCircuit(circuitIndex, exerciseIndex, field)}
            />
          </OverlayPanel>
        </>
      );
    } else if(field === "reps"){
      return (
        <CustomInputNumber
          ref={(el) => inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el}
          initialValue={data}
          onChange={(e) => changeExerciseInCircuit(circuitIndex, exerciseIndex, field, e)}
          isRep={field === 'reps'}
          isNotNeedProp={true}
          className={`mt-0`}
        />
      );
    } else if(field === 'name'){
      return(
        <AutoComplete
          defaultValue={data}
          onChange={(e) => changeExerciseInCircuit(circuitIndex, exerciseIndex, field, e)}
        />
      );
    } else { 
      return (
        <input
          ref={(el) => inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el}
          className="form-control ellipsis-input text-center"
          type="text"
          defaultValue={data}
          onChange={() => changeExerciseInCircuit(circuitIndex, exerciseIndex, field)}
        />
      );
    }
  };

  const changeExerciseInCircuit = (circuitIndex, exerciseIndex, field, repsValue) => {
    setIsEditing(true);
    const updatedDays = [...day];
    let value = '';

    if(field !== 'name'){
      value = inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`].value;
    }

    const updatedCircuitExercise = {
      ...updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex],
      [field]: field === 'reps' || field === 'name' ? repsValue : value,
    };

    updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex] = updatedCircuitExercise;
    setDay(updatedDays);
    setModifiedDay(updatedDays);
  };

  const deleteCircuit = (name, circuitIndex) => {
    setIsEditing(true);
    const updatedDays = [...day];
    updatedDays[indexDay].exercises.splice(circuitIndex, 1);

    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast(`${name} Eliminado con éxito`);
  };

  const incrementAllSeries = () => {
    const updatedDays = day.map((dayItem, index) => {
      if (index === indexDay) {
        return {
          ...dayItem,
          exercises: dayItem.exercises.map((exercise) => {
            if (exercise.type === 'exercise') {
              return {
                ...exercise,
                sets: (exercise.sets || 0) + 1,
              };
            }
            return exercise;
          }),
        };
      }
      return dayItem;
    });

    setIsEditing(true);
    setDay(updatedDays);
    setModifiedDay(updatedDays);

    const updatedAllDays = [...allDays];
    updatedAllDays[indexDay] = updatedDays[indexDay];
    setAllDays(updatedAllDays);
    setRenderInputSets(null)
  };

  const incrementAllReps = () => {
    const updatedDays = day.map((dayItem, index) => {
      if (index === indexDay) {
        return {
          ...dayItem,
          exercises: dayItem.exercises.map((exercise) => {
            if (exercise.type === 'exercise') {
              return {
                ...exercise,
                reps: (exercise.reps || 0) + 1,
              };
            }
            return exercise;
          }),
        };
      }
      return dayItem;
    });

    setIsEditing(true);
    setDay(updatedDays);
    setModifiedDay(updatedDays);

    const updatedAllDays = [...allDays];
    updatedAllDays[indexDay] = updatedDays[indexDay];
    setAllDays(updatedAllDays);
    setRenderInputReps(null)
  };

  const openEditWeekNameDialog = () => {
    setNewWeekName(weekName);
    setIsEditingWeekName(true);
  };

  const closeEditWeekNameDialog = () => {
    setIsEditingWeekName(false);
  };

  const saveNewWeekName = () => {
    WeekService.editNameWeek(routine._id, {name: newWeekName})
      .then(() =>{
        setStatus(idRefresh);
        setWeekName(newWeekName);
        setIsEditingWeekName(false);
        Notify.instantToast("Nombre editado con éxito!");
      });
  };

  const tableMobile = () => {
    return (
      <div className="p-1">
        {currentDay && <div className="row justify-content-center text-center mb-3 p-0">
          <div className="col-6 mb-3 px-0">
            <button
              aria-label="video"
              className="btn btn-outline-dark me-2 p-2"
              onClick={() => incrementAllSeries()}
            >
              <UpgradeIcon className="" /> Sumar 1 serie
            </button>
          </div>

          <div className="col-6 mb-3 px-0">
            <button
              aria-label="video"
              className="btn btn-outline-dark me-2 p-2"
              onClick={() => incrementAllReps()}
            >
              <UpgradeIcon className="" /> Sumar 1 rep
            </button>
          </div>

        </div>}

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="exercises-mobile">
            {(provided) => (
              <div className="div div-bordered p-0"
                     ref={provided.innerRef}
                     {...provided.droppableProps}
              >
                <div>
                  {currentDay && currentDay.exercises.map((exercise, i) => (
                    <Draggable 
                      key={exercise.exercise_id}
                      draggableId={exercise.exercise_id}
                      index={i}
                    >
                      {(providedDrag) => (
                        <div 
                          ref={providedDrag.innerRef}
                          {...providedDrag.draggableProps}
                          {...providedDrag.dragHandleProps}
                          className="mb-4 shadowCards p-2"
                        >
                          {exercise.type === 'exercise' ? (
                            <>
                              <div className="row justify-content-center ">
                                <div className="col-10 text-start ">
                                  <div className="mb-2">
                                    <AutoComplete
                                      defaultValue={typeof exercise.name === 'object' ? exercise.name.name : exercise.name}
                                      onChange={(name, video) => {
                                        const currentName = exercise.name;
                                        if (typeof currentName === 'object') {
                                          changeModifiedData(i, { ...currentName, name }, 'name');
                                        } else {
                                          changeModifiedData(i, name, 'name');
                                        }
                                        // Se mantiene el video
                                        changeModifiedData(i, video, 'video');
                                      }}
                                    />
                                    <div className="d-flex align-items-center mt-1">
                                      <button
                                        className="btn btn-outline-dark py-0 ps-1 m-0"
                                        onClick={(e) => handleOpenBackoffOverlay(e, i)}
                                      >
                                        <AddIcon /> <span>Back off</span>
                                      </button>
                                      <Tooltip
                                        title={hasBackoff(exercise) ? "Tiene back off" : "No tiene back off"}
                                        enterDelay={0}
                                        leaveDelay={0}
                                      >
                                        {hasBackoff(exercise) ? (
                                          <CircleIcon color="success" className="ms-2" />
                                        ) : (
                                          <PanoramaFishEyeIcon className="ms-2" />
                                        )}
                                      </Tooltip>
                                    </div>
                                  </div>
                                </div>
                              <div className="col-1 text-start me-3">
                                  {customInputEditDay(exercise.video, i, 'video')}
                                </div>
                                
                              </div>

                              <div className="row justify-content-center mt-2 ms-2 me-4">

                                <div className="col-6 text-start ">
                                  <span className="styleInputsSpan ms-1 ">Peso</span>
                                  <div className="largoInput ">{customInputEditDay(exercise.peso, i, 'peso')}</div>
                                </div>

                                <div className="col-6 text-start ">
                                  <span className="styleInputsSpan ms-1">Rest</span>
                                  <div className="largoInput ">{customInputEditDay(exercise.rest, i, 'rest')}</div>
                                
                                </div>

                              

                              </div>
                 
                                <div className="row justify-content-center mt-2 ms-2 me-4">

                                  <div className="col-6 text-start">
                                  <span className="styleInputsSpan text-start">Series</span>
                                  <div className="largoInput">{customInputEditDay(exercise.sets, i, 'sets')}</div>
                                  </div>

                                  <div className="col-6 text-start ">
                                  <span className="styleInputsSpan ">Reps</span>
                                  <div className="largoInput">{customInputEditDay(exercise.reps, i, 'reps')}</div>
                                </div>

                              </div>

                              <div className="row justify-content-center my-2">

                                <div className="col-11 text-start">
                                  <span className="styleInputsSpan">Notas</span>
                                  {customInputEditDay(exercise.notas, i, 'notas')}
                                </div>

                            
                               

                              </div>

                             
                              <div className="">
                                <div className="row justify-content-center marginDropDown ">
                                  <div className="col-6 ">
                                    <Dropdown
                                      value={exercise.numberExercise}
                                      options={options}
                                      onChange={(e) => changeModifiedData(i, e.target.value, 'numberExercise')}
                                      placeholder="Select an item"
                                      optionLabel="label"
                                      className="p-dropdown-group w-100"
                                    />
                                  </div>

                                  <div className="col-6">
                                    <div className="row justify-content-around">
                                      <div className="col-6">
                                        <IconButton>
                                          <DragIndicatorIcon />
                                        </IconButton>
                                      </div>

                                      <div className="col-6">
                                        <IconButton
                                          aria-label="delete"
                                          onClick={() => {
                                            const confirmObj = {
                                              exercise_id: exercise.exercise_id,
                                              name: exercise.name
                                            };
                                            handleDeleteClick(confirmObj);
                                          }}
                                        >
                                          <CancelIcon className="colorIconDeleteExercise" />
                                        </IconButton>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                                <div className="row justify-content-center">
                                  <div className="col-8 text-start" >
                                  <span className="styleInputsSpan">Nombre</span>
                                    {customInputEditCircuit(exercise.type, i, 'type')}
                                  </div>
                                  <div className="col-4 text-start" >
                                    <span className="styleInputsSpan">Min / vueltas</span>
                                    {customInputEditCircuit(exercise.typeOfSets, i, 'typeOfSets')}
                                  </div>
                                  <div className="notStyle">
                                    {exercise.circuit.map((item, j) => (
                                      <div key={item.idRefresh} className="row justify-content-center text-center">
                                        <div className="mt-4 col-12">
                                          <div className="row justify-content-center">
                                            <div className="col-4 m-auto"><b>Ejercicio {j + 1}</b></div>
                                            <div className="col-4">{customInputEditExerciseInCircuit(item.video, i, j, 'video')}   </div>
                                            <div className="col-4">
                                              <span className="text-end ">
                                                <IconButton
                                                  aria-label="video"
                                                  className=" text-light "
                                                  onClick={() => {
                                                    setIsEditing(true);
                                                    const updatedDays = [...day];
                                                    updatedDays[indexDay].exercises[i].circuit.splice(j, 1);
                                                    setDay(updatedDays);
                                                    setModifiedDay(updatedDays);
                                                  }}
                                                >
                                                  <CancelIcon className="colorIconDeleteExercise" />
                                                </IconButton>
                                              </span>
                                            </div>
                                          

                                                                                        
                                      
                                        </div>
                                        </div>
                                        <div className="col-11  mb-2">
                                          {customInputEditExerciseInCircuit(item.name, i, j, 'name')}
                                        </div>
                                        <div className="col-5 text-start ">
                                        <span className="styleInputsSpan">Peso</span>
                                          <div className="largoInput">
                                          {customInputEditExerciseInCircuit(item.peso, i, j, 'peso')}
                                          </div>
                                        </div>
                                        <div className="col-5 text-start">
                                          <span className="styleInputsSpan">Reps</span>
                                          <div className="largoInput">
                                            {customInputEditExerciseInCircuit(item.reps, i, j, 'reps')}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="row justify-content-center my-4">
                                    <div className="col-8 my-3">
                                      <IconButton
                                        aria-label="video"
                                        className="bgColor rounded-2 text-light text-center "
                                        onClick={() => AddExerciseToCircuit(i)}
                                      >
                                        <AddIcon className="" />
                                        <span className="font-icons ">Añadir ejercicio</span>
                                      </IconButton>
                                    </div>
                                    <div className="col-11 me-4 text-center">
                                      <span className="styleInputsSpan text-start">Notas</span>
                                      <div className="text-center">{customInputEditCircuit(exercise.notas, i, 'notas')}</div>
                                    </div>
                                    
                                  </div>
                                  
                                  <div className="notStyle">
                                    <div className="row justify-content-center">
                                      <div className="col-4 ms-4 ">
                                        <Dropdown
                                          value={exercise.numberExercise}
                                          options={options}
                                          onChange={(e) => changeModifiedData(i, e.target.value, 'numberExercise')}
                                          placeholder="Seleccioanr numero"
                                          optionLabel="label"
                                          className="p-dropdown-group w-100"
                                        />
                                      </div>
                                      <div className="col-7 mb-3">
                                        <div className="row justify-content-center">
                                          <IconButton
                                            aria-label="video"
                                            className="bg-danger col-7 fontDeleteCircuit rounded-2 text-light"
                                            onClick={() => deleteCircuit(exercise.name, i)}
                                          >
                                            <DeleteIcon />
                                            Eliminar 
                                          </IconButton>
                                          <IconButton className="col-2 ">
                                            <DragIndicatorIcon />
                                          </IconButton>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div> 
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
       
      </div>
    );
  };

  return (
    <>
      {/**
       * SIDEBAR: fijo a la izquierda 
       */}
       <div className='sidebarPro colorMainAll'>
                 <div className="d-flex flex-column justify-content-between colorMainAll  shadow-sm" style={{ width: '220px', height: '100vh' }}>
                 <div className="p-3">
                   <h5 className="fw-bold text-center mb-4">TOM</h5>
       
                   <div className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3">
                     <div className=' col-1'><User /></div>
                     <div className='text-center col-10'><strong >{username}</strong></div>
                   </div>

                    <div className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3 stylePointer" onClick={openEditWeekNameDialog}>
                     <div className=' col-1'><EditIcon /></div>
                     <div className='text-center col-10'><strong >{weekName}</strong></div>
                   </div>

            
       
                   <div className="d-flex justify-content-between text-light bgItemsDropdown align-items-center mb-3">
                     <Segmented
                        className="w-100 stylesSegmented"
                        size="large"
                        vertical
                        options={allDays.map((day, index) => ({
                          label: day.name,
                          value: day._id,
                          icon: 
                            index === 0 ? <LooksOneIcon /> :
                            index === 1 ? <LooksTwoIcon /> :
                            index === 2 ? <Looks3Icon /> :
                            index === 3 ? <Looks4Icon /> :
                            index === 4 ? <Looks5Icon /> :
                            index === 5 ? <Looks6Icon /> :
                            <CalendarTodayIcon />
                        }))}
                        value={currentDay ? currentDay._id : ''}
                        onChange={(value) => {
                          const selectedDay = allDays.find((day) => day._id === value);
                          if (selectedDay) {
                            const selectedIndex = allDays.findIndex((d) => d._id === selectedDay._id);
                            setIndexDay(selectedIndex);
                            setCurrentDay(allDays[selectedIndex]);
                          }
                        }}
                      />
                    
                   </div>        

                  <div className="text-muted small">

                    <div id="agregarDia"  className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={addNewDay}>
                      <div className=' col-1'><AddIcon /></div>
                      <div className='text-center col-10'><strong >Agregar día</strong></div>
                    </div>

                    <div id="editarDia" className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => openEditNameDialog(currentDay)} >
                    
                                <div className=' col-1'><EditIcon /></div>
                      <div className='text-center col-10'><strong >Editar {`${currentDay && currentDay.name}`}</strong></div>
                    </div>

                    <div id="eliminarDia" className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={handleDeleteDayClick} >
                      <span></span>
                         <div className=' col-1'><DeleteIcon /></div>
                      <div className='text-center col-10'><strong >Eliminar {`${currentDay && currentDay.name}`}</strong></div>
                    </div>

                  </div>

                    <div className="text-muted small mt-5">

                      <div id="agregarDia"  className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => AddNewExercise()}>
                        <div className=' col-1'><AddIcon  className="me-2" /></div>
                        <div className='text-center col-10'><strong >Añadir ejercicio</strong></div>
                      </div>

                      <div id="editarDia" className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => AddNewCircuit()} >
                      
                                  <div className=' col-1'><AddIcon /></div>
                        <div className='text-center col-10'><strong >Añadir circuito</strong></div>
                      </div>


                    </div>

                   <div className="p-3 mb-3 text-center">
                              <div className="small text-light mb-2">
                                <strong>TOM</strong><br />Planificación digital
                              </div>
                              <button className="btn btn-outline-light btn-sm" onClick={() => setTourVisible(true)}>
                                <HelpCircle size={16} className="me-1" /> Ayuda
                              </button>
                            </div>
                          </div>
       
                 </div>
    </div>
       
       

      <div className={`${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>
        <section className="container-fluid totalHeight">
          
          <div  className={`row text-center ${firstWidth > 992 && 'mb-3'} justify-content-center pb-3 align-middle align-center align-items-center`}>

            <div className="col-12 col-lg-6 pb-3">
                <div className="row justify-content-center align-items-center m-auto pb-3">
                  <div id="warmup" className="col-10 col-lg-6  btn bgItemsDropdown shadow pt-4" onClick={handleShowMovility}>
                    <EditIcon  className="me-2" />
                    <span className=" me-1">Bloque de <strong>activación/movilidad</strong> <strong className="d-block">{currentDay && currentDay.name}</strong></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6 pb-3">
                <div className="row justify-content-center align-items-center m-auto pb-3">
                  <div id="warmup" className="col-10 col-lg-6 btn bgItemsDropdown shadow pt-4" onClick={handleShowWarmup}>
                    <EditIcon  className="me-2" />
                    <span className=" me-1">Bloque de <strong>entrada en calor</strong> <strong className="d-block">{currentDay && currentDay.name}</strong></span>
                  </div>
                </div>
              </div>


          
              {firstWidth < 992 && 
              <>
              <div className={`col-10 col-sm-6 text-center mb-4`}>
                    
                    <Segmented
                        options={allDays.map((day) => ({
                            label: day.name,
                            value: day._id,
                        }))}
                        className="stylesSegmented"
                        value={currentDay ? currentDay._id : ''}
                        onChange={(value) => {
                            const selectedDay = allDays.find((day) => day._id === value);

                            if (selectedDay) {
                                const selectedIndex = allDays.findIndex(day => day._id === selectedDay._id);
                                setIndexDay(selectedIndex);
                                setCurrentDay(day[selectedIndex]); // Actualizar currentDay con day
                            }
                        }}
                    />

                </div>
                <div className={`col-9 col-sm-6 ${firstWidth > 550 ? 'text-start mb-4' : 'text-center mb-4'}`}>
                    <IconButton
                            aria-label="video"
                            className="bg-primary rounded-2 text-light me-2"
                            onClick={addNewDay}
                        >
                            <AddIcon className="" />
                            <span className="font-icons me-1">Crear día</span>
                        </IconButton>

                        <IconButton
                            aria-label="video"
                            className="bg-secondary rounded-2 text-light me-2"
                            onClick={() => openEditNameDialog(currentDay)}
                            
                        >
                            <EditIcon className="" />
                        </IconButton>
                        <IconButton
                            aria-label="video"
                            className="bg-danger rounded-2 text-light "
                            onClick={handleDeleteDayClick}
                        >
                            <DeleteIcon className="" />
                        </IconButton>

              </div>
              </>
                }
          </div>

          <div className="row justify-content-center align-middle text-center mb-5 pb-5">
            {firstWidth > 992 && (
              <div className="row justify-content-around mb-2 ">

                 <div className="col-3">
                    <div id="addSets" className="bgItemsDropdownUl border-0 rounded-0 m-3 p-2 row justify-content-center"  onClick={() => incrementAllSeries()} >
                      <div className=' col-1'><AddIcon /></div>
                      <div className='text-center col-10'>
                        <strong >Herramientas generales: </strong>
                      </div>
                    </div>
                  </div>

                <div className="col-2 bgItemsDropdownUl stylePointer border-0 rounded-0 p-2 m-3 shadow">
                  <div id="addSets" className=" row justify-content-center"  onClick={() => incrementAllSeries()} >
                    <div className=' col-1'><AddIcon /></div>
                    <div className='text-center col-10'>
                      <strong >Sumar 1 serie</strong>
                    </div>
                  </div>
                </div>
                <div className="col-2 bgItemsDropdownUl stylePointer border-0 rounded-0 p-2 m-3 shadow">
                  <div id="addReps" className=" row justify-content-center"  onClick={() => incrementAllReps()} >
                    <div className=' col-1'><AddIcon /></div>
                    <div className='text-center col-10'><strong >Sumar 1 repetición</strong></div>
                  </div>
                </div>



              </div>
            )}

            {firstWidth > 992 ? (
              /** Tabla de escritorio con Drag&Drop **/
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="exercises-desktop">
                  {(provided) => (
                    <div 
                      className="table-responsive col-12  altoTable"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <table
                        className={`table table-hover totalHeightTable align-middle fontTable text-center ${
                          isEditing && "table-light"
                        }`}
                      >
                        <thead>
                          <tr>
                            {/* CHANGES: Aquí usamos key={index} para evitar duplicados */}
                            {propiedades.map((propiedad, index) => (
                              <th
                                key={index}
                                className={`td-${index}`}
                                scope="col"
                              >
                                {propiedad}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentDay && currentDay.exercises.map((exercise, i) => (
                            <Draggable 
                              key={exercise.exercise_id}
                              draggableId={exercise.exercise_id}
                              index={i}
                            >
                              {(providedDrag) => (
                                <tr 
                                  ref={providedDrag.innerRef}
                                  {...providedDrag.draggableProps}
                                >
                                  <td className="td-0">
                                    <div className="row justify-content-center">
                                      <IconButton
                                        {...providedDrag.dragHandleProps}
                                      >
                                        <DragIndicatorIcon />
                                      </IconButton>
                                    </div>
                                  </td>
                                  <td className="td-1">
                                    <Dropdown
                                      value={exercise.numberExercise}
                                      options={options}
                                      onChange={(e) => {
                                        changeModifiedData(
                                          i,
                                          e.target.value,
                                          "numberExercise"
                                        );
                                      }}
                                      placeholder="Seleccionar numero"
                                      optionLabel="label"
                                      className="p-dropdown-group w-100"
                                    />
                                  </td>
                                  {exercise.type === "exercise" ? (
                                    <>
                                      <td className="td-2">
                                      <div className="mt-4 pt-2">
                                        <AutoComplete
                                          defaultValue={typeof exercise.name === 'object' ? exercise.name.name : exercise.name}
                                          onChange={(name, video) => {
                                            const currentName = exercise.name;
                                            if (typeof currentName === 'object') {
                                              changeModifiedData(i, { ...currentName, name }, 'name');
                                            } else {
                                              changeModifiedData(i, name, 'name');
                                            }
                                            changeModifiedData(i, video, 'video');
                                          }}
                                        />
                                        <div className="d-flex align-items-center mt-1">
                                          <button
                                            className="btn btn-outline-dark fontBackOff py-0 ps-1 m-0 text-start"
                                            onClick={(e) => handleOpenBackoffOverlay(e, i)}
                                          >
                                            <AddIcon className="" /> <span>Back off</span>
                                          </button>
                                          <Tooltip
                                            title={hasBackoff(exercise) ? "Tiene back off" : "No tiene back off"}
                                            enterDelay={0}
                                            leaveDelay={0}
                                          >
                                            {hasBackoff(exercise) ? (
                                              <CircleIcon color="success" className="ms-2" />
                                            ) : (
                                              <PanoramaFishEyeIcon  className="ms-2" />
                                            )}
                                          </Tooltip>
                                        </div>
                                      </div>
                                      </td>
                                      <td className="td-3">
                                        {customInputEditDay(
                                          exercise.sets,
                                          i,
                                          "sets"
                                        )}
                                      </td>
                                      <td className="td-4 ">
                                        <div className="marginRepsNew">
                                        {customInputEditDay(
                                          exercise.reps,
                                          i,
                                          "reps"
                                        )}</div>
                                      </td>
                                      <td className="td-5">
                                        {customInputEditDay(
                                          exercise.peso,
                                          i,
                                          "peso"
                                        )}
                                      </td>
                                      <td className="td-6">
                                        {customInputEditDay(
                                          exercise.rest,
                                          i,
                                          "rest"
                                        )}
                                      </td>
                                      <td className="td-7">
                                        {customInputEditDay(
                                          exercise.video,
                                          i,
                                          "video"
                                        )}
                                      </td>
                                      <td className="td-8">
                                        {customInputEditDay(
                                          exercise.notas,
                                          i,
                                          "notas"
                                        )}
                                      </td>
                                      <td className="td-9">
                                        <div className="row justify-content-center mt-2">
                                          <IconButton
                                            aria-label="video"
                                            className="col-12"
                                            onClick={() => {
                                              const confirmObj = {
                                                exercise_id: exercise.exercise_id,
                                                name: exercise.name
                                              };
                                              handleDeleteClick(confirmObj);
                                            }}
                                          >
                                            <CancelIcon className="colorIconDeleteExercise" />
                                          </IconButton>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td colSpan="8">
                                        <table className="table text-center align-middle">
                                          <thead>
                                            <tr>
                                              <th colSpan={2}>Nombre</th>
                                              <th>Sets/mins</th>
                                              <th>Notas</th>
                                              <th>#</th>
                                            </tr>
                                            <tr>
                                              <td colSpan={2}>{customInputEditCircuit(exercise.type, i, 'type')}</td>
                                              <td>{customInputEditCircuit(exercise.typeOfSets, i, 'typeOfSets')}</td>
                                              <td>{customInputEditCircuit(exercise.notas, i, 'notas')}</td>
                                              <td>
                                                <IconButton
                                                  aria-label="video"
                                                  className="text-center"
                                                  onClick={() => deleteCircuit(exercise.name, i)}
                                                >
                                                  <CancelIcon className="colorIconDeleteExercise" />
                                                </IconButton>
                                              </td>
                                            </tr>
                                            <tr></tr>
                                            <tr colSpan={7}>
                                              <th>Nombre</th>
                                              <th>Reps</th>
                                              <th>Peso</th>
                                              <th>Video</th>
                                              <th></th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {exercise.circuit.map((circuitExercise, j) => (
                                              <tr key={circuitExercise.idRefresh}>
                                                <td className="td-2">
                                                  {customInputEditExerciseInCircuit(circuitExercise.name, i, j, 'name')}
                                                </td>
                                                <td className="td-3">
                                                  <div className="marginRepsNew">
                                                  {customInputEditExerciseInCircuit(circuitExercise.reps, i, j, 'reps')}
                                                  </div>
                                                </td>
                                                <td className="td-4">
                                                  {customInputEditExerciseInCircuit(circuitExercise.peso, i, j, 'peso')}
                                                </td>
                                                <td className="td-3">
                                                  {customInputEditExerciseInCircuit(circuitExercise.video, i, j, 'video')}
                                                </td>
                                                <td>
                                                  <IconButton
                                                    aria-label="video"
                                                    className="col-12"
                                                    onClick={() => {
                                                      setIsEditing(true);
                                                      const updatedDays = [...day];
                                                      updatedDays[indexDay].exercises[i].circuit.splice(j, 1);
                                                      setDay(updatedDays);
                                                      setModifiedDay(updatedDays);
                                                    }}
                                                  >
                                                    <CancelIcon className="colorIconDeleteExercise" />
                                                  </IconButton>
                                                </td>
                                              </tr>
                                            ))}
                                            <tr>
                                              <td colSpan="5">
                                                <button
                                                  aria-label="video"
                                                  className="btn btn-outline-dark my-4"
                                                  onClick={() => AddExerciseToCircuit(i)}
                                                >
                                                  <AddIcon />
                                                  <span className=" me-1">Añadir Ejercicio al Circuito</span>
                                                </button>
                                              </td>
                                            </tr>
                                          </tbody>
                                         
                                        </table>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              )}
                            </Draggable>
                          ))}
                        </tbody>
                        {provided.placeholder}
                      </table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              tableMobile()
            )}
            
               
             
          </div>

          {isEditing && (
            <div className="floating-button-mobile index-up">
              <button
                className="px-5 btn colorCancel  my-4"
                onClick={() => applyChanges()}
              >
                Guardar
              </button>
              <button
                className="px-5 btn colorRed   my-4"
                onClick={() => confirmCancel()}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Ajustamos estilos de dialog para que se desplacen segun collapsed */}
          <ConfirmDialog
            visible={showDeleteDayDialog}
            onHide={() => setShowDeleteDayDialog(false)}
            message="¿Querés eliminar este día? Podes cancelar después y revertir esta acción."
            header="Eliminar día"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Sí"
            rejectLabel="No"
            accept={() => {
              confirmDeleteDay();
              setShowDeleteDayDialog(false);
            }}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            reject={() => setShowDeleteDayDialog(false)}
          />

          <ConfirmDialog
            visible={showCancelDialog}
            onHide={() => setShowCancelDialog(false)}
            message="¿Estás seguro de que deseas cancelar los cambios? Se perderán todos los cambios no guardados."
            header="Confirmación"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Sí"
            rejectLabel="No"
            accept={() => handleCancel()}
            reject={() => setShowCancelDialog(false)}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          <ConfirmDialog
            visible={visible}
            onHide={() => setVisible(false)}
            message="¿Estás seguro de que deseas eliminar este elemento?"
            header="Confirmación"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Eliminar"
            acceptClassName="p-button-danger"
            rejectLabel="Cancelar"
            accept={confirmDelete}
            reject={() => setVisible(false)}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          <Dialog
            className={`col-12 col-md-10 col-xxl-5 ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            contentClassName={"colorDialog"}
            headerClassName={"colorDialog"}
            header="Header"
            visible={visibleEdit}
            modal={false}
            onHide={() => setVisibleEdit(false)}
          ></Dialog>

          <ConfirmDialog 
          className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          <Dialog
            header={`${exerciseToDelete?.name || ""}`}
            className={`dialogDeleteExercise ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showDeleteDialog}
            style={{
              width: `${firstWidth > 991 ? "50vw" : "80vw"}`
            }}
            footer={
              <div className="row justify-content-center ">
                <div className="col-lg-12 me-3">
                  <button
                    className="btn btn-outlined-secondary"
                    onClick={handleDeleteCancel}
                  >
                    No
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            }
            onHide={handleDeleteCancel}
          >
            <p className="p-4">
              ¡Cuidado! Estás por eliminar{" "}
              <b>"{exerciseToDelete?.name}"</b>. ¿Estás seguro?
            </p>
          </Dialog>

          <Dialog
            className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
            contentClassName={"colorDialog"}
            headerClassName={"colorDialog"}
            header="Entrada en calor"
            visible={warmup}
            scrollable={"true"}
            modal={false}
            onHide={() => hideDialogWarmup()}
            blockScroll={window.innerWidth > 600 ? false : true}
          >
            <ModalCreateWarmup
              week={modifiedDay}
              week_id={week_id}
              day_id={currentDay && currentDay._id}
              editAndClose={editAndClose}
            />
          </Dialog>

          <Dialog
            header="Editar Nombre del Día"
            visible={isEditingName}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            style={{
              ...(firstWidth > 968 ? { width: "35vw" } : { width: "75vw" })
            }}
            onHide={() => setIsEditingName(false)}
          >
            <div className="p-fluid">
              <div className="p-field">
                <input
                  type="text"
                  id="dayName"
                  className="form-control my-3"
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value)}
                />
              </div>
              <div className="p-field text-end">
                <button className="btn btn-primary mx-2 mt-2" onClick={saveNewDayName}>
                  Confirmar
                </button>
                <button
                  className="btn btn-secondary mx-2 mt-2"
                  onClick={() => setIsEditingName(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Dialog>

          <Dialog
            header="Editar Nombre de la Semana"
            visible={isEditingWeekName}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            style={{
              ...(firstWidth > 968 ? { width: "35vw" } : { width: "75vw" })
            }}
            onHide={closeEditWeekNameDialog}
          >
            <div className="p-fluid">
              <div className="p-field">
                <input
                  type="text"
                  id="weekName"
                  className="form-control my-3"
                  value={newWeekName}
                  onChange={(e) => setNewWeekName(e.target.value)}
                />
              </div>
              <div className="p-field text-end">
                <button className="btn btn-primary mx-2 mt-2" onClick={saveNewWeekName}>
                  Confirmar
                </button>
                <button
                  className="btn btn-secondary mx-2 mt-2"
                  onClick={closeEditWeekNameDialog}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Dialog>

          {firstWidth < 992 && (
            <nav className="fixed-bottom colorNavBottom d-flex justify-content-around pb-4 pt-1" >
              
              <div className="row justify-content-center text-center ">
                <div className="">
                  <IconButton className="text-light align-self-bottom" onClick={() => AddNewCircuit()}>
                    <AddIcon />
                  </IconButton>
                </div>
                <span className='col-12 text-light fontTextNavBar'>Añadir circuito</span>
              </div>

              <div className="row justify-content-center text-center ">
                <div className="">
                  <IconButton className="text-light align-self-bottom" onClick={() => AddNewExercise()}>
                    <AddIcon />
                  </IconButton>
                </div>
                <span className='col-12 text-light fontTextNavBar'>Añadir ejercicio</span>
                
              </div>


            </nav>
          )}

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
                            />)}

        <Dialog
          className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
          blockScroll={window.innerWidth > 600 ? false : true}
          header="Bloque de Activación"
          visible={movilityVisible}
          onHide={() => setMovilityVisible(false)}
        >
          <ModalCreateMovility
            week={modifiedDay}
            week_id={week_id}
            day_id={currentDay && currentDay._id}
            editAndClose={editAndClose}
          />
        </Dialog>

      <OverlayPanel ref={backoffOverlayRef} className={firstWidth>992?'w-25':'w-75'}>
        <div className="p-3">
          {backoffData.map((line, idx) => (
            <div key={idx} className="row mb-2 align-items-end">
              {["sets", "reps", "peso"].map((f) => (
                <div key={f} className="col-3">
                  <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input
                    type={f === "peso" || f === "reps" ? "text" : "number"}
                    className="form-control"
                    value={line[f]}
                    onChange={(e) => {
                      const arr = [...backoffData];
                      arr[idx][f] = e.target.value;
                      setBackoffData(arr);
                      saveBackoffInternally(arr);
                    }}
                  />
                </div>
              ))}
              <div className="col-3">
                <IconButton
                  aria-label="delete"
                  className="mt-4"
                  onClick={() => removeBackoffLine(idx)}
                >
                  <CancelIcon className="text-danger" />
                </IconButton>
              </div>
            </div>
          ))}

          <div className="text-center mb-3">
            <button
              className="btn btn-outline-dark"
              onClick={() => setBackoffData([...backoffData, { sets: '', reps: '', peso: '' }])}
            >
              Añadir línea
            </button>
          </div>
          <div className="text-center">
            <button
              className="btn btn-secondary me-2"
              onClick={() => backoffOverlayRef.current.hide()}
            >
              Cerrar
            </button>
            <button className="btn btn-dark" onClick={handleSaveBackoff}>
              Seguir editando
            </button>
          </div>
        </div>
      </OverlayPanel>


        </section>
      </div>
    </>
  );
}

export default DayEditDetailsPage;
