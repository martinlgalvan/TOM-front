import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

// CHANGES: Se elimina import de ExercisesService, ya que no deseamos usar la función para eliminar desde el service
// import * as ExercisesService from "../../services/exercises.services.js";

import * as UserService from '../../services/users.services.js';
import * as WeekService from "../../services/week.services.js";
import * as DatabaseExercises from "../../services/jsonExercises.services.js";
import * as PARService from '../../services/par.services.js';
import * as DatabaseUtils from "../../helpers/variables.js";
import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";


import Options from "../../assets/json/options.json";
import Exercises from "../../assets/json/NEW_EXERCISES.json";

import { TimePicker, CustomProvider } from 'rsuite';
import esES from 'rsuite/locales/es_ES'; 

// Components
import Logo from "../../components/Logo.jsx";
import ModalCreateWarmup from "../../components/Bootstrap/ModalCreateWarmup.jsx";
import CustomInputNumber from "../../components/CustomInputNumber.jsx";
import AutoComplete from "../../components/Autocomplete.jsx";


// MUI Icons
import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from "@mui/icons-material/Cancel";
import UpgradeIcon from '@mui/icons-material/Upgrade';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RemoveIcon from '@mui/icons-material/Remove';

// PrimeReact
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Menu } from "primereact/menu";
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';

// antd
import { Segmented } from "antd";

// CHANGES: importamos los componentes de react-beautiful-dnd para arrastrar y soltar ejercicios
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// react-pro-sidebar
// CHANGES: Usamos "react-pro-sidebar" en lugar de "primereact/sidebar" para adaptarlo al estilo del primer código
import { Sidebar, Menu as ProSidebarMenu, MenuItem } from "react-pro-sidebar";

import ObjectId from 'bson-objectid';

function Randomizer() {
  // Parámetros de ruta
  const { week_id } = useParams();
  const { id } = useParams();
  const { username } = useParams();

  // Estados generales
  const [options, setOptions] = useState([]); 
  const inputRefs = useRef([]);
  const productRefs = useRef([]);
  let idRefresh = RefreshFunction.generateUUID();

  // Lógica para traer usuarios y su PAR
  const [users, setUsers] = useState([]);
  const [actualUser, setActualUser] = useState(null);
  const [allWeeks, setAllWeeks] = useState([]);

  // Base de datos de ejercicios
  const [databaseUser, setDatabaseUser] = useState();
  const [exercisesDatabase, setExercisesDatabase] = useState([]); 
  const navigate = useNavigate()
  // Lógica de la rutina / days
  const [routine, setRoutine] = useState();
  const [allDays, setAllDays] = useState([
    {
      _id: new ObjectId().toString(),
      name: "Día 1",
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
    },
  ]);
  const [day, setDay] = useState([...allDays]);
  const [modifiedDay, setModifiedDay] = useState([...allDays]);

  // Manejo de estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Manejo de warmup
  const [warmup, setWarmup] = useState(false);

  // Manejo del ancho para responsive
  const [firstWidth, setFirstWidth] = useState();

  // Indices y días actuales
  const [indexDay, setIndexDay] = useState(0);
  const [currentDay, setCurrentDay] = useState(allDays[0]);

  // Manejo de confirmaciones
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDayDialog, setShowDeleteDayDialog] = useState(false);

  // Editar nombre del día
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDayName, setNewDayName] = useState("");
  const [dayToEdit, setDayToEdit] = useState(null);

  // Edición del nombre de la semana
  const [weekName, setWeekName] = useState("Semana PAR");
  const [isEditingWeekName, setIsEditingWeekName] = useState(false);
  const [newWeekName, setNewWeekName] = useState(weekName);

  // Glow para alertar uso de video
  const [glowVideo, setGlowVideo] = useState({});

  // Manejo de colapso de Sidebar
  const [collapsed, setCollapsed] = useState(false);

    const [renderInputSets, setRenderInputSets] = useState(true);
    const [renderInputReps, setRenderInputReps] = useState(true);

  // CHANGES: Referencia para los menús (uno por cada "week")
  const menuRefs = useRef({});

  /* --------------------------------------
   * useEffects de carga de datos 
   * -------------------------------------*/
  useEffect(() => {
    // Cargamos ancho de ventana para comportamientos responsive
    setFirstWidth(window.innerWidth);

    // Preparamos las options para el dropdown, unificando el JSON
    const groupedOptions = Options.reduce((acc, group) => {
      acc.push({ label: group.label, value: group.value, disabled: null });
      acc.push(...group.items);
      return acc;
    }, []);
    setOptions(groupedOptions);

    

    // Cargamos la BD local
    const local = localStorage.getItem("DATABASE_USER");
    if (local != null) {
      setExercisesDatabase(databaseUser);
    } else {
      setExercisesDatabase(Exercises);
    }
  }, [databaseUser]);

  useEffect(() => {
    setDatabaseUser(localStorage.getItem("DATABASE_USER"));
    if (DatabaseUtils.DATABASE_EXERCISES != null) {
      DatabaseExercises.findExercises(DatabaseUtils.USER_ID).then(
        (data) => setDatabaseUser(data)
      );
    }
  }, []);

  // Simulamos la rutina local, solo para adaptarlo: 
  useEffect(() => {
    setRoutine({
      name: newWeekName,
      user_id: id,
      routine: allDays
    });
  }, [allDays, newWeekName, id]);

  // Cargamos PARs
  useEffect(() => {
    PARService.getPAR(id).then((data) => {
      setAllWeeks(data);
    });
  }, [id]);

  // Cargamos usuarios
  useEffect(() => {
    UserService.find(id).then(data => {
      setUsers(data);
    });
  }, [id]);

  useEffect(() => {
    if (day[indexDay]) {
      setCurrentDay({ ...day[indexDay] });
      setRenderInputSets(true)
      setRenderInputReps(true)
    }
  }, [day, indexDay]);      

  /* --------------------------------------
   * Funciones relacionadas con PAR
   * -------------------------------------*/
  const handleDropdownChange = useCallback((selectedOption) => {
    setActualUser(selectedOption);
  }, []);

  const designWeekToUser = useCallback((weekData, userId) => {
    // Asigna un PAR a un usuario
    PARService.createPARroutine(weekData, userId)
      .then(() => {
        Notify.instantToast('PAR creado con éxito');
        PARService.getPAR(id).then((newData) => {
          setAllWeeks(newData);
        });
      });
  }, [id]);


  const savePARChanges = (data) => {
    // Actualiza un PAR existente
    PARService.updatePAR(data._id, data)
      .then(() => {
        PARService.getPAR(id).then((newData) => {
          setAllWeeks(newData);
        });
      })
      .catch((error) => console.log(error.message));
  };

  /* --------------------------------------
   * Manejo de arrastrar y soltar
   * -------------------------------------*/
  // Re-enumerar ejercicios:
  const reorderExercises = (exercisesArray) => {
    return exercisesArray.map((ex, idx) => ({
      ...ex,
      numberExercise: idx + 1
    }));
  };

  // CHANGES: Función que se llama cuando se termina de arrastrar
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    // Copiamos array
    const updatedDays = [...day];
    const exercisesArray = Array.from(updatedDays[indexDay].exercises);

    // Sacamos de la posición original
    const [reorderedItem] = exercisesArray.splice(result.source.index, 1);
    // Lo insertamos en la posición final
    exercisesArray.splice(result.destination.index, 0, reorderedItem);

    // Re-enumeramos
    updatedDays[indexDay].exercises = reorderExercises(exercisesArray);

    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setIsEditing(true);
  };

  /* --------------------------------------
   * Manejo de Warmup
   * -------------------------------------*/
  const handleShowWarmup = () => {
    if (!currentDay) {
      // Si no existe un día actual, creamos el día 1 vacío
      const defaultDay = {
        _id: new ObjectId().toString(),
        name: "Día 1",
        lastEdited: new Date().toISOString(),
        exercises: [],
      };
      setAllDays([defaultDay]);
      setDay([defaultDay]);
      setModifiedDay([defaultDay]);
      setCurrentDay(defaultDay);
    }
    setWarmup(true);
    setIsEditing(false);
  };

  const hideDialogWarmup = () => {
    setWarmup(false);
  };

  const editAndClose = () => {
    setWarmup(false);
    setIsEditing(true);
  };

  /* --------------------------------------
   * Manejo de datos en la tabla (ejercicios)
   * -------------------------------------*/
  const changeModifiedData = (index, value, field) => {
    setIsEditing(true);
    const updatedDays = [...day];

    updatedDays[indexDay].exercises[index] = {
      ...updatedDays[indexDay].exercises[index],
      [field]: value,
    };

    // Efecto glow cuando se agrega video
    if (field === "video" && value) {
      setGlowVideo(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setGlowVideo(prev => ({ ...prev, [index]: false }));
      }, 2000);
    }

    updatedDays[indexDay].lastEdited = new Date().toISOString();
    setModifiedDay(updatedDays);
  };

  // Lógica para la entrada de tiempo
  function parseTimeStringToDate(timeString) {
    if (typeof timeString === 'string' && /^\d{2}:\d{2}$/.test(timeString)) {
      const [minutes, seconds] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(0, minutes, seconds, 0);
      return date;
    }
    return new Date(0, 0, 0, 0, 0, 0);
  }

  const customLocale = {
    ...esES,
    TimePicker: {
      ...esES.TimePicker,
      hours: 'Horas',
      minutes: 'Minutos',
      seconds: 'Segundos'
    }
  };

  // CHANGES: Eliminamos la llamada a ExercisesService para borrar en backend
  //          Borramos localmente y si el user cancela, vuelve a la data de BD original
  const deleteExerciseFromArray = (exerciseIndex) => {
    setIsEditing(true);
    const updatedDays = [...day];
    updatedDays[indexDay].exercises.splice(exerciseIndex, 1);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
  };

  // Creación y edición
  const AddNewExercise = () => {
    if (!allDays[indexDay]) return;
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
    setAllDays(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Ejercicio creado con éxito!");
  };

  // Circuitos
  const AddNewCircuit = () => {
    const updatedDays = [...day];
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
      reps: 1,
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

  const deleteCircuit = (name, circuitIndex) => {
    setIsEditing(true);
    const updatedDays = [...day];
    updatedDays[indexDay].exercises.splice(circuitIndex, 1);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast(`${name} Eliminado con éxito`);
  };

  // Funciones de input para exercise normal
  const customInputEditDay = (data, index, field) => {
    console.log(data, index, field)
    if (field === "sets" ) {
      return (
        <>
        {renderInputSets ? 
        <CustomInputNumber
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          initialValue={data}
          onChange={(val) => changeModifiedData(index, val, field)}
          isRep={field === "reps"}
          className={`mt-5`}

        /> :
        <>
          <div className={`row justify-content-center text-center aa ${field == 'reps' && 'mb-2 '}`}>
            <div className="input-number-container">
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
          onChange={(val) => changeModifiedData(index, val, field)}
          isRep={field === "reps"}
          className={`mt-5`}
          onActivate={() => onActivateTextMode()}
        /> :
        <>
          <div className={`row justify-content-center text-center aa ${field == 'reps' && 'mb-2 marginReps'}`}>
            <div className="input-number-container">
            <IconButton               
                className={`buttonRight `}
                >
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

            {field == 'reps' && (
              <div className='styleSelectButton text-center '>
                <SelectButton
                  className='styleSelectButton '
                  options={[
                    { label: 'Modo texto', value: 'text' }
                  ]}
                />
              </div>
            )}
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
            className={`w-100 ${shouldGlow ? 'glowing-icon' : ''}`}
            onClick={(e) => {
              productRefs.current[index].toggle(e);
            }}
          >
            <YouTubeIcon className="colorIconYoutube" />
          </IconButton>
          <OverlayPanel ref={(el) => (productRefs.current[index] = el)}>
            <input
              ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
              className="form-control ellipsis-input text-center"
              type="text"
              defaultValue={data}
              onChange={(e) => changeModifiedData(index, e.target.value, field)}
            />
          </OverlayPanel>
        </>
      );
    } else if (field === "notas") {
      return (
        <InputTextarea
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          className="w-100"
          autoResize
          defaultValue={data}
          onChange={(e) => changeModifiedData(index, e.target.value, field)}
        />
      );
    } else if (field === "rest") {
      return (
        <CustomProvider locale={customLocale}>
          <TimePicker
            format="mm:ss"
            defaultValue={parseTimeStringToDate(data)}
            ranges={[]}
            placeholder="min..."
            editable
            onChange={(val) => {
              const minutes = String(val.getMinutes()).padStart(2, "0");
              const seconds = String(val.getSeconds()).padStart(2, "0");
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
          placeholder={field === 'rest' ? `2...` : "kg..."}
          type="text"
          defaultValue={data}
          onChange={(e) => changeModifiedData(index, e.target.value, field)}
        />
      );
    }
  };

  // Input para circuitos
  const customInputEditCircuit = (data, circuitIndex, field) => {
    if (field === "notas") {
      return (
        <div className="row">
          <InputTextarea
            ref={(el) => (inputRefs.current[`${circuitIndex}-${field}`] = el)}
            className={`textAreaResize ${firstWidth < 600 && 'col-11'}`}
            autoResize
            defaultValue={data}
            onChange={() => {
              const val = inputRefs.current[`${circuitIndex}-${field}`].value;
              setIsEditing(true);
              const updatedDays = [...day];
              updatedDays[indexDay].exercises[circuitIndex].notas = val;
              setDay(updatedDays);
              setModifiedDay(updatedDays);
            }}
          />
        </div>
      );
    } else {
      return (
        <input
          ref={(el) => (inputRefs.current[`${circuitIndex}-${field}`] = el)}
          placeholder={ field === 'type' ? `Amrap / emom ...` : " 3 / 10' ..."}
          className="form-control ellipsis-input text-center"
          type="text"
          defaultValue={data}
          onChange={() => {
            const val = inputRefs.current[`${circuitIndex}-${field}`].value;
            setIsEditing(true);
            const updatedDays = [...day];
            updatedDays[indexDay].exercises[circuitIndex][field] = val;
            setDay(updatedDays);
            setModifiedDay(updatedDays);
          }}
        />
      );
    }
  };

  const customInputEditExerciseInCircuit = (data, circuitIndex, exerciseIndex, field) => {
    if (field === "video") {
      return (
        <>
          <IconButton
            aria-label="video"
            className="w-100"
            onClick={(e) => {
              productRefs.current[`${circuitIndex}-${exerciseIndex}`]?.toggle(e);
            }}
          >
            <YouTubeIcon className="colorIconYoutube" />
          </IconButton>
          <OverlayPanel
            ref={(el) => (productRefs.current[`${circuitIndex}-${exerciseIndex}`] = el)}
          >
            <input
              className="form-control ellipsis-input text-center"
              type="text"
              defaultValue={data}
              onChange={(e) => {
                setIsEditing(true);
                const updatedDays = [...day];
                updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex].video = e.target.value;
                setDay(updatedDays);
                setModifiedDay(updatedDays);
              }}
            />
          </OverlayPanel>
        </>
      );
    } else if (field === "reps") {
      return (
        <CustomInputNumber
          initialValue={data}
          onChange={(val) => {
            setIsEditing(true);
            const updatedDays = [...day];
            updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex].reps = val;
            setDay(updatedDays);
            setModifiedDay(updatedDays);
          }}
          isRep={true}
          className="mt-5"
        />
      );
    } else if (field === "name") {
      return (
        <AutoComplete
          defaultValue={data}
          onChange={(val /*, video */) => {
            setIsEditing(true);
            const updatedDays = [...day];
            updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex].name = val;
            // Si quisiéramos setear video automático, lo haríamos acá
            setDay(updatedDays);
            setModifiedDay(updatedDays);
          }}
        />
      );
    } else {
      return (
        <input
          className="form-control ellipsis-input text-center"
          type="text"
          defaultValue={data}
          onChange={(e) => {
            setIsEditing(true);
            const updatedDays = [...day];
            updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex][field] = e.target.value;
            setDay(updatedDays);
            setModifiedDay(updatedDays);
          }}
        />
      );
    }
  };

  /* --------------------------------------
   * Funciones de sumar sets/reps a todos
   * -------------------------------------*/
  const incrementAllSeries = () => {
    const updatedDays = day.map((dayItem, i) => {
      if (i === indexDay) {
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
    const updatedDays = day.map((dayItem, i) => {
      if (i === indexDay) {
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

  /* --------------------------------------
   * Manejo de días
   * -------------------------------------*/
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

  const handleDeleteDayClick = () => {
    setShowDeleteDayDialog(true);
  };

  const confirmDeleteDay = () => {
    setIsEditing(true);
    if (!currentDay) return;

    const updatedDays = [...allDays];
    const dayIndexToDelete = updatedDays.findIndex(d => d._id === currentDay._id);

    updatedDays.splice(dayIndexToDelete, 1);

    if (updatedDays.length === 0) {
      setAllDays([]);
      setCurrentDay(null);
      setIndexDay(0);
      return;
    }

    const newDayIndex = dayIndexToDelete === 0 ? 0 : dayIndexToDelete - 1;
    setAllDays(updatedDays);
    setCurrentDay(updatedDays[newDayIndex]);
    setIndexDay(newDayIndex);
    setModifiedDay(updatedDays);
  };

  const openEditNameDialog = (day) => {
    setDayToEdit(day);
    setNewDayName(day.name);
    setIsEditingName(true);
  };

  const saveNewDayName = () => {
    setIsEditing(true);
    const updatedDays = [...allDays];
    const dayIndexFound = updatedDays.findIndex((d) => d._id === dayToEdit._id);
    if (dayIndexFound !== -1) {
      updatedDays[dayIndexFound].name = newDayName;
      setAllDays(updatedDays);
      setModifiedDay(updatedDays);
    }
    setIsEditingName(false);
  };

  /* --------------------------------------
   * Manejo de "semana" (PAR) 
   * -------------------------------------*/
  const openEditWeekNameDialog = () => {
    setNewWeekName(weekName);
    setIsEditingWeekName(true);
  };

  const closeEditWeekNameDialog = () => {
    setIsEditingWeekName(false);
  };

  const saveNewWeekName = () => {
    setWeekName(newWeekName);
    setIsEditingWeekName(false);
    Notify.instantToast("Nombre de la semana editado con éxito!");
  };

  /* --------------------------------------
   * Guardar / Cancelar
   * -------------------------------------*/
  const applyChanges = () => {
    const newRoutine = {
      name: weekName,
      user_id: id,
      routine: modifiedDay
    };
    PARService.createPAR(newRoutine, id).then(() => {
      setIsEditing(false);
      Notify.instantToast("Rutina guardada con éxito (PAR)!");
      // Recargamos la data
      PARService.getPAR(id).then((newData) => {
        setAllWeeks(newData);
      });
    });
  };

  const handleCancel = () => {
    setCurrentDay(null);
    setIsEditing(false);
    setShowCancelDialog(false);
    Notify.instantToast("Cambios cancelados");
    // Si quisiéramos recargar la data desde BD, lo haríamos:
    // PARService.getPAR(id).then(...);
  };

  const confirmCancel = () => {
    setShowCancelDialog(true);
  };

  /* --------------------------------------
   * Tabla responsive
   * -------------------------------------*/
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

  // Versión móvil
  const tableMobile = () => {
    return (
      <div className="table-responsiveCss">
        <div className="row justify-content-center text-center mb-3">
          <div className="col-6 mb-3">
            <button className="btn btn-outline-dark me-2" onClick={() => incrementAllSeries()}>
              <UpgradeIcon /> Sumar 1 serie
            </button>
          </div>
          <div className="col-6 mb-3">
            <button className="btn btn-outline-dark me-2" onClick={() => incrementAllReps()}>
              <UpgradeIcon /> Sumar 1 rep
            </button>
          </div>
          <div className="col-6">
            <button className="btn btn-outline-dark" onClick={AddNewExercise}>
              <AddIcon />
              <span className="me-1">Añadir ejercicio</span>
            </button>
          </div>
          <div className="col-6">
            <button className="btn btn-outline-dark" onClick={AddNewCircuit}>
              <AddIcon />
              <span className="me-1">Añadir circuito</span>
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="exercises-mobile">
            {(provided) => (
              <table
                className="table table-bordered"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Peso</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    {editMode && <th>Rest</th>}
                    <th>Notas</th>
                    {editMode && <th>Video</th>}
                    <th>Reordenar / Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDay &&
                    currentDay.exercises.map((exercise, i) => (
                      <Draggable
                        key={exercise.exercise_id}
                        draggableId={exercise.exercise_id}
                        index={i}
                      >
                        {(providedDrag) => (
                          <tr
                            ref={providedDrag.innerRef}
                            {...providedDrag.draggableProps}
                            {...providedDrag.dragHandleProps}
                            className="shadowCards"
                          >
                            {exercise.type === "exercise" ? (
                              <>
                                <td data-th="Nombre" className="text-center">
                                  {editMode ? (
                                    <AutoComplete
                                      defaultValue={exercise.name}
                                      onChange={(name, video) => {
                                        changeModifiedData(i, name, "name");
                                        changeModifiedData(i, video, "video");
                                      }}
                                    />
                                  ) : (
                                    <span>
                                      {exercise.name === "" ? "Nombre" : exercise.name}
                                    </span>
                                  )}
                                </td>
                                <td data-th="Peso" className="text-center">
                                  {customInputEditDay(exercise.peso, i, "peso")}
                                </td>
                                <td data-th="Sets" className="text-center">
                                  {customInputEditDay(exercise.sets, i, "sets")}
                                </td>
                                <td data-th="Reps" className="text-center">
                                  {customInputEditDay(exercise.reps, i, "reps")}
                                </td>
                                {editMode && (
                                  <td data-th="Rest" className="text-center">
                                    {customInputEditDay(exercise.rest, i, "rest")}
                                  </td>
                                )}
                                {editMode ? (
                                  <td data-th="Notas" className="text-center">
                                    {customInputEditDay(exercise.notas, i, "notas")}
                                  </td>
                                ) : (
                                  <td className="text-center">
                                    {exercise.notas ? exercise.notas : ""}
                                  </td>
                                )}
                                {editMode && (
                                  <td data-th="Video" className="text-center">
                                    {customInputEditDay(exercise.video, i, "video")}
                                  </td>
                                )}
                                <td className="notStyle">
                                  <div className="row justify-content-center">
                                    <div className="col-6">
                                      <Dropdown
                                        value={exercise.numberExercise}
                                        options={options}
                                        onChange={(e) =>
                                          changeModifiedData(
                                            i,
                                            e.target.value,
                                            "numberExercise"
                                          )
                                        }
                                        placeholder="#"
                                        optionLabel="label"
                                        className="p-dropdown-group w-100"
                                      />
                                    </div>
                                    <div className="col-6">
                                      <div className="row justify-content-around">
                                        <div className="col-5">
                                          <IconButton>
                                            <DragIndicatorIcon />
                                          </IconButton>
                                        </div>
                                        <div className="col-5">
                                          <IconButton
                                            aria-label="delete"
                                            onClick={() =>
                                              handleDeleteClick({
                                                exercise_id: exercise.exercise_id,
                                                name: exercise.name,
                                              })
                                            }
                                          >
                                            <CancelIcon className="colorIconDeleteExercise" />
                                          </IconButton>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </>
                            ) : (
                              // Circuit en mobile
                              <>
                                {editMode ? (
                                  <>
                                    <td className="text-center">
                                      {customInputEditCircuit(exercise.type, i, "type")}
                                    </td>
                                    <td className="text-center">
                                      {customInputEditCircuit(exercise.typeOfSets, i, "typeOfSets")}
                                    </td>
                                    <td className="notStyle">
                                      {exercise.circuit.map((item, j) => (
                                        <div
                                          key={item.idRefresh}
                                          className="row justify-content-center text-center"
                                        >
                                          <div className="mt-4">
                                            <b className="mt-4 mb-2">Ejercicio {j + 1}</b>
                                            <span className="text-end ps-5">
                                              <IconButton
                                                aria-label="delete-ex-circuit"
                                                className="text-light"
                                                onClick={() => {
                                                  setIsEditing(true);
                                                  const updatedDays = [...day];
                                                  updatedDays[indexDay].exercises[i].circuit.splice(
                                                    j,
                                                    1
                                                  );
                                                  setDay(updatedDays);
                                                  setModifiedDay(updatedDays);
                                                }}
                                              >
                                                <CancelIcon className="colorIconDeleteExercise" />
                                              </IconButton>
                                            </span>
                                          </div>
                                          <span className="col-11 my-1 mb-2">
                                            {customInputEditExerciseInCircuit(
                                              item.name,
                                              i,
                                              j,
                                              "name"
                                            )}
                                          </span>
                                          <span className="col-6 my-1">
                                            {customInputEditExerciseInCircuit(
                                              item.reps,
                                              i,
                                              j,
                                              "reps"
                                            )}
                                          </span>
                                          <span className="col-5 my-1">
                                            {customInputEditExerciseInCircuit(
                                              item.peso,
                                              i,
                                              j,
                                              "peso"
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                    </td>
                                    <td className="notStyle">
                                      <IconButton
                                        aria-label="add-ex-circuit"
                                        className="bgColor rounded-2 text-light text-center my-4"
                                        onClick={() => AddExerciseToCircuit(i)}
                                      >
                                        <AddIcon />
                                        <span className="font-icons me-1">
                                          Añadir Ejercicio al Circuito
                                        </span>
                                      </IconButton>
                                    </td>
                                    <td className="text-center my-4">
                                      {customInputEditCircuit(exercise.notas, i, "notas")}
                                    </td>
                                    <td className="notStyle">
                                      <div className="row justify-content-between">
                                        <div className="col-5">
                                          <Dropdown
                                            value={exercise.numberExercise}
                                            options={options}
                                            onChange={(e) =>
                                              changeModifiedData(
                                                i,
                                                e.target.value,
                                                "numberExercise"
                                              )
                                            }
                                            placeholder="#"
                                            optionLabel="label"
                                            className="p-dropdown-group w-100"
                                          />
                                        </div>
                                        <div className="col-7 mb-3">
                                          <div className="row justify-content-between">
                                            <IconButton
                                              aria-label="delete-circuit"
                                              className="bg-danger col-9 fontDeleteCircuit rounded-2 text-light"
                                              onClick={() => deleteCircuit(exercise.name, i)}
                                            >
                                              <DeleteIcon />
                                              Eliminar circuito
                                            </IconButton>
                                            <IconButton className="col-2">
                                              <DragIndicatorIcon />
                                            </IconButton>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  // Circuit modo lectura
                                  <>
                                    <td className="text-center">
                                      {exercise.type === "" ? "Nombre" : exercise.type}
                                    </td>
                                    <td className="text-center">
                                      {exercise.typeOfSets === ""
                                        ? "Nombre"
                                        : exercise.typeOfSets}
                                    </td>
                                    <td className="notStyle">
                                      <div className="row justify-content-center">
                                        <b className="col-5 my-3">Ejercicio</b>
                                        <b className="col-3 my-3">Reps</b>
                                        <b className="col-3 my-3">Peso</b>
                                        {exercise.circuit.map((item) => (
                                          <div
                                            key={item.idRefresh}
                                            className="row justify-content-center"
                                          >
                                            <span className="col-5 my-1">
                                              {item.name === "" ? "Nombre" : item.name}
                                            </span>
                                            <span className="col-3 my-1">
                                              {item.reps === "" ? "Reps" : item.reps}
                                            </span>
                                            <span className="col-3 my-1">
                                              {item.peso === "" ? "Peso" : item.peso}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="text-center my-4 me-3">
                                      {exercise.notas === "" ? "Nombre" : exercise.notas}
                                    </td>
                                    <td>
                                      <IconButton>
                                        <DragIndicatorIcon />
                                      </IconButton>
                                    </td>
                                  </>
                                )}
                              </>
                            )}
                          </tr>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>

        <div className="row justify-content-center text-center mb-3">
          <div className="col-6">
            <button className="btn btn-outline-dark" onClick={AddNewExercise}>
              <AddIcon />
              <span className="me-1">Añadir ejercicio</span>
            </button>
          </div>
          <div className="col-6">
            <button className="btn btn-outline-dark" onClick={AddNewCircuit}>
              <AddIcon />
              <span className="me-1">Añadir circuito</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* --------------------------------------
   * Render
   * -------------------------------------*/
  
  // CHANGES: Acciones para el menú de cada "week"
  const handleUsuario = (week) => {
    Notify.instantToast(`Clic en 'usuario' para la semana: ${week.name}`);
    // Aquí podrías hacer navigate a donde corresponda, por ejemplo:
    // navigate(`/user/${week.user_id}`);
  };

  const handleEditar = (week) => {
    Notify.instantToast(`Clic en 'editar' para la semana: ${week.name}`);
    // Aquí podrías abrir un modal o lo que necesites para editar
  };





  return (
    <>
      {/* Render de PARs: card con las semanas y usuarios */}

      {/* Sidebar con react-pro-sidebar al estilo del primer código */}
      <div className="sidebarProExercises">
        <Sidebar 
          collapsed={collapsed}
          collapsedWidth={'85px'}
          width="200px"
          backgroundColor="colorMain"
          rootStyles={{
            color: 'white',
            border: 'none'
          }}
        >
          <ProSidebarMenu>
            <MenuItem
              onClick={() => setCollapsed(!collapsed)}
              className="mt-3 mb-2"
              icon={<ViewHeadlineIcon />}
              style={{ height: 'auto', whiteSpace: 'normal' }}
            >
              <span>Ocultar barra</span>
            </MenuItem>

            <MenuItem disabled className="text-center">
              Lista de rutinas
            </MenuItem>

            {allWeeks &&
              allWeeks.map((week) => (
                <MenuItem key={week._id} icon={collapsed ? <EditIcon /> : ''}>
                  <div
                    onClick={() => navigate(`/par/${week._id}`)}
                    className=" "
                  >
                    <div className="">
                      <div className="">
                        <p className="m-0 text-light">{week.name}</p>
                      </div>
                    </div>
                  </div>
                </MenuItem>
              ))
            }

            <MenuItem className="text-center marginHelpDays">
              <IconButton className="p-2 bg-light">
                <HelpOutlineIcon className="text-dark" /> 
              </IconButton> 
              <span className="ms-2">Ayuda</span>
            </MenuItem>
          </ProSidebarMenu>
        </Sidebar>
      </div>

      {/* Contenido principal (respetando espacio del sidebar) */}
      <div className={` ${collapsed ? "marginSidebarClosed" : " marginSidebarOpen"}`}>
        <section className="container-fluid totalHeight">

          <div className="row justify-content-center">

            <div className="col-10 col-lg-6 text-center">

              <h2>Bienvenido a tu planificador.</h2>
              <h3 className="fs-4 my-3">Acá podrás armar - ver - editar tus rutinas pre-armadas.</h3>

              <p className="m-0 pb-3 pt-1">
                Esta herramienta, sirve para que cargues las bases de tus entrenamientos, ya sea estructuras para distintos tipos de atletas, o niveles. Por ejemplo:
                Rutina para principiantes hombres, rutina para para principiantes mujeres, etc.
              </p>

            </div>

          </div>

          <div  className={`row text-center ${firstWidth > 992 && 'mb-5'} justify-content-center pb-3 align-middle align-center align-items-center`}>
              <div className="col-12 mb-3">
                <div className="row justify-content-center align-items-center py-2">
                  <div id="warmup" className="col-10 col-lg-6 pt-4 btn boxDataWarmup " onClick={handleShowWarmup}>
                    <EditIcon  className="me-2" />
                    <span className=" me-1">Administrar entrada en calor <strong className="d-block">{currentDay && currentDay.name}</strong></span>
                  </div>
                </div>
              </div>

              {firstWidth > 992 && <div id="addEjercicio" className="col-3 btn mx-2 mb-4 boxData" onClick={() => AddNewExercise()}>
                <button
                  className="btn p-2"
                >
                  <AddIcon  className="me-2" />
                  <span className=" me-1">Añadir ejercicio</span>
                </button>
              </div>}

              <div id="nameWeek" className="col-10 col-lg-3 btn mx-2 mb-4 boxData" onClick={() => setIsEditingWeekName(true)}>
                <button className="btn p-2" >
                 <EditIcon className="me-2" />
                  <strong>{weekName}</strong>
                </button>
              </div>

              {firstWidth > 992 &&
               <div id="addCircuit" className="col-3 btn mx-2 mb-4 boxData" onClick={() => AddNewCircuit()}>
                <button className="btn p-2 ">
                  <AddIcon  className="me-2" />
                  <span className=" me-1">Añadir circuito</span>
                </button>
              </div>}

              {firstWidth > 992 && <div id="addSets" className="col-3 btn mx-2 boxData" onClick={() => incrementAllSeries()}>
                <button
                  className="btn p-2"
                >
                  <AddIcon  className="me-2" />
                  <span className=" me-1">Sumar 1 serie</span>
                </button>
              </div>}

              <div id="diaActual" className="col-10 col-lg-3 mx-2 ">
                <h4  className=" m-0 p-2" >
                  <strong>{currentDay && currentDay.name}</strong>
                </h4>
              </div>

              {firstWidth > 992 && <div id="addReps" className="col-3 btn mx-2 boxData" onClick={() => incrementAllReps()}>
                <button
                  className="btn p-2 "
                >
                  <AddIcon  className="me-2" />
                  <span className=" me-1">Sumar 1 rep</span>
                </button>
              </div> 
              }

              {firstWidth < 992 ?
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
                :
                <>
              <div className={`col-10 col-sm-6 text-end mt-5`}>
                    
                    <Segmented
                        options={allDays.map((day) => ({
                            label: day.name,
                            value: day._id,
                        }))}
                        className="stylesSegmented text-end"
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
                <div className={`col-9 col-sm-6 text-start mt-5`}>
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

          {/* Tabla principal */}
          <div className="row justify-content-center align-middle text-center mb-5 pb-5">
            {firstWidth > 992 ? (
              // Versión de escritorio
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="exercises-desktop">
                  {(provided) => (
                    <div
                      className="table-responsive col-12 col-xl-11 altoTable"
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
                            {propiedades.map((propiedad, index) => (
                              <th key={index} className={`td-${index}`} scope="col">
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
                                      <IconButton {...providedDrag.dragHandleProps}>
                                        <DragIndicatorIcon />
                                      </IconButton>
                                    </div>
                                  </td>
                                  <td className="td-1">
                                    <Dropdown
                                      value={exercise.numberExercise}
                                      options={options}
                                      onChange={(e) => {
                                        changeModifiedData(i, e.target.value, "numberExercise");
                                      }}
                                      placeholder="Seleccionar numero"
                                      optionLabel="label"
                                      className="p-dropdown-group w-100"
                                    />
                                  </td>
                                  {exercise.type === "exercise" ? (
                                    <>
                                      <td className="td-2">
                                        <AutoComplete
                                          defaultValue={exercise.name}
                                          onChange={(name, video) => {
                                            changeModifiedData(i, name, 'name');
                                            changeModifiedData(i, video, 'video');
                                          }}
                                        />
                                      </td>
                                      <td className="td-3">
                                        {customInputEditDay(exercise.sets, i, "sets")}
                                      </td>
                                      <td className="td-4 ">
                                        {customInputEditDay(exercise.reps, i, "reps")}
                                      </td>
                                      <td className="td-5">
                                        {customInputEditDay(exercise.peso, i, "peso")}
                                      </td>
                                      <td className="td-6">
                                        {customInputEditDay(exercise.rest, i, "rest")}
                                      </td>
                                      <td className="td-7">
                                        {customInputEditDay(exercise.video, i, "video")}
                                      </td>
                                      <td className="td-8">
                                        {customInputEditDay(exercise.notas, i, "notas")}
                                      </td>
                                      <td className="td-9">
                                        <div className="row justify-content-center mt-2">
                                          <IconButton
                                            aria-label="video"
                                            className="col-12"
                                            onClick={() => deleteExerciseFromArray(i)}
                                          >
                                            <CancelIcon className="colorIconDeleteExercise" />
                                          </IconButton>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    // Circuito
                                    <>
                                      <td colSpan="8">
                                        <table className="table text-center">
                                          <thead>
                                            <tr>
                                              <th colSpan={2}>Nombre</th>
                                              <th>Sets/mins</th>
                                              <th>Notas</th>
                                              <th>#</th>
                                            </tr>
                                            <tr>
                                              <td colSpan={2}>
                                                {customInputEditCircuit(exercise.type, i, 'type')}
                                              </td>
                                              <td>
                                                {customInputEditCircuit(exercise.typeOfSets, i, 'typeOfSets')}
                                              </td>
                                              <td>
                                                {customInputEditCircuit(exercise.notas, i, 'notas')}
                                              </td>
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
                                            <tr>
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
                                                <td>
                                                  {customInputEditExerciseInCircuit(circuitExercise.name, i, j, 'name')}
                                                </td>
                                                <td>
                                                  {customInputEditExerciseInCircuit(circuitExercise.reps, i, j, 'reps')}
                                                </td>
                                                <td>
                                                  {customInputEditExerciseInCircuit(circuitExercise.peso, i, j, 'peso')}
                                                </td>
                                                <td>
                                                  {customInputEditExerciseInCircuit(circuitExercise.video, i, j, 'video')}
                                                </td>
                                                <td>
                                                  <IconButton
                                                    aria-label="video"
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
                                                  <span className="me-1">Añadir ejercicio</span>
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
                          {provided.placeholder}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              // Versión móvil
              tableMobile()
            )}
          </div>

          {/* Botones de guardar/cancelar si está editando */}
          {isEditing && (
            <div className="floating-button index-up">
              <button
                className="px-5 btn colorRed py-2 my-4"
                onClick={applyChanges}
              >
                Guardar
              </button>
              <button
                className="px-5 btn colorCancel py-2 my-4"
                onClick={confirmCancel}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Confirm Dialogs */}
          <ConfirmDialog
            visible={showDeleteDayDialog}
            onHide={() => setShowDeleteDayDialog(false)}
            message="¿Querés eliminar este día? Podrás cancelar después y revertir esta acción."
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
            accept={handleCancel}
            reject={() => setShowCancelDialog(false)}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          {/* Warmup */}
          <Dialog
            className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}
            contentClassName={"colorDialog"}
            headerClassName={"colorDialog"}
            header="Entrada en calor"
            visible={warmup}
            scrollable={"true"}
            modal={false}
            onHide={hideDialogWarmup}
            blockScroll={window.innerWidth > 600 ? false : true}
          >
            <ModalCreateWarmup
              week={modifiedDay}
              isPAR={true}
              editAndClose={editAndClose}
              user_id={id}
              day_id={currentDay && currentDay._id}
            />
          </Dialog>

          {/* Editar nombre del día */}
          <Dialog
            header="Editar Nombre del Día"
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={isEditingName}
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

          {/* Editar nombre de la semana */}
          <Dialog
            header="Editar Nombre de la Semana"
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={isEditingWeekName}
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
                <button
                  className="btn btn-primary mx-2 mt-2"
                  onClick={saveNewWeekName}
                >
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



          {/* Footer móvil */}
          {firstWidth < 992 && (
            <nav className="fixed-bottom colorNavBottom d-flex justify-content-around py-2 stylesNavBarBottom">
              <div className="row justify-content-center text-center">
                <Link to={`/user/routine/${id}/${username}`} className="positionIconsNavBar">
                  <IconButton className="buttonsNav fs-1">
                    <ArrowBackIcon />
                  </IconButton>
                </Link>
                <span className="col-12 text-light pt-4">Ir atrás</span>
              </div>

              <div className="row justify-content-center text-center">
                <div className={`positionIconsNavBar ${editMode && "activeButton"}`}>
                  <IconButton className="buttonsNav fs-1" onClick={() => setEditMode(!editMode)}>
                    <EditIcon />
                  </IconButton>
                </div>
                <span className={`col-12 text-light pt-4 ${editMode && "activeSpan"}`}>
                  Modo edición
                </span>
              </div>

              <div className="row justify-content-center text-center">
                <div className="positionIconsNavBar">
                  <IconButton className="buttonsNav fs-1" onClick={() => setIsEditing(true)}>
                    <SaveIcon />
                  </IconButton>
                </div>
                <span className="col-12 text-light pt-4">Guardar</span>
              </div>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}

export default Randomizer;
