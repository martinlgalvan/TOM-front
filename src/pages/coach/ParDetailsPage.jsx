import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

// Servicios PAR
import * as PARService from "../../services/par.services.js";
import * as BlockService from "../../services/blocks.services.js";

// DB local, si la usas
import * as UserServices from "../../services/users.services.js";
import * as DatabaseExercises from "../../services/jsonExercises.services.js";
import * as DatabaseUtils from "../../helpers/variables.js";
import Exercises from "../../assets/json/NEW_EXERCISES.json";
import Options from "../../assets/json/options.json";

import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";

import { TimePicker, CustomProvider } from "rsuite";
import esES from "rsuite/locales/es_ES";

// react-pro-sidebar
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";

// Components / Iconos
import LogoChico from "../../components/LogoChico.jsx";
import ModalCreateWarmup from "../../components/Bootstrap/ModalCreateWarmup.jsx";
import CustomInputNumber from "../../components/CustomInputNumber.jsx";
import AutoComplete from "../../components/Autocomplete.jsx";
import ModalCreateMovility from "../../components/Bootstrap/ModalCreateMovility.jsx";

import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Segmented } from "antd";
import { MultiSelect } from 'primereact/multiselect';

import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import Looks4Icon from "@mui/icons-material/Looks4";
import Looks5Icon from "@mui/icons-material/Looks5";
import Looks6Icon from "@mui/icons-material/Looks6";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import Tooltip from '@mui/material/Tooltip';
import CircleIcon from '@mui/icons-material/Circle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';

import ObjectId from "bson-objectid";

// Importamos DragDropContext
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import BlocksListPage from "../../components/BlocksListPage.jsx";

function ParDetailsPage() {
  // useParams: id = user_id, week_id = par_id
  const { id } = useParams();       // user_id
  const { week_id } = useParams();  // _id del PAR
  const { day_id } = useParams();   // si se usa
  const { username } = useParams(); // si se usa
  const [users, setUsers] = useState([]);
  const [parent_id, setParent_id] = useState(localStorage.getItem('_id'));
  const [user_id, setUser_id] = useState(localStorage.getItem('_id'));  // El PAR completo
  const navigate = useNavigate();
  // Estado principal
  const [routine, setRoutine] = useState(null);  // El PAR completo
  const [weekName, setWeekName] = useState("");
  const [isEditingWeekName, setIsEditingWeekName] = useState(false);
  const [newWeekName, setNewWeekName] = useState("");

  // Días del PAR
  const [allDays, setAllDays] = useState([]);
  const [day, setDay] = useState([]);
  const [modifiedDay, setModifiedDay] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);

  // Indices
  const [indexDay, setIndexDay] = useState(0);

  // Manejo general
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Warmup
  const [warmup, setWarmup] = useState(false);

  // Confirms / Diálogos
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDayDialog, setShowDeleteDayDialog] = useState(false);

  // Editar nombre del día
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDayName, setNewDayName] = useState("");
  const [dayToEdit, setDayToEdit] = useState(null);

  // Eliminar ejercicio
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  const [showDeleteParDialog, setShowDeleteParDialog] = useState(false);

  // Others
  const [glowVideo, setGlowVideo] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  // Input Refs
  const inputRefs = useRef([]);
  const productRefsSimple = useRef([]);
  const productRefsCircuit = useRef([]);

  // Local DB
  const [databaseUser, setDatabaseUser] = useState(null);
  const [exercisesDatabase, setExercisesDatabase] = useState([]);

  // Manejo del ancho
  const [firstWidth, setFirstWidth] = useState(window.innerWidth);

  // Para refrescar
  const [status, setStatus] = useState(1);
  const [statusCancel, setStatusCancel] = useState(1);
  const idRefresh = RefreshFunction.generateUUID();

  // Options (Dropdown)
  const [options, setOptions] = useState([]);
  const [actualUser, setActualUser] = useState(null);

  const [movilityVisible, setMovilityVisible] = useState(false);

  // Backoff refs y estados
  const backoffOverlayRef = useRef(null);
  const [editingBackoffIndex, setEditingBackoffIndex] = useState(null);
  const [backoffData, setBackoffData] = useState([{ sets: "", reps: "", peso: "" }]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showManageProgressionsDialog, setShowManageProgressionsDialog] = useState(false);

  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null); // Bloque actual
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [trainer_id, setTrainer_id] = useState(localStorage.getItem("_id"));
  

  const allCategories = [
    "Alumno casual",
    "Alumno dedicado",
    "Atleta iniciante",
    "Atleta avanzado"
  ];


    // Agrupar usuarios por categoría, en el orden deseado
  const [groupedOptions, setGroupedOptions] = useState([]);

  useEffect(() => {
    const groups = allCategories.map((category) => ({
      label: category,
      items: users.filter((u) => u.category === category)
    }));
    setGroupedOptions(groups);
  }, [users]);

  const [currentPAR, setCurrentPAR] = useState(null);
  const [progressions, setProgressions] = useState([]);
  const [isProgression, setIsProgression] = useState(null);

  useEffect(() => {
    BlockService.getBlocks(trainer_id).then(setBlocks);
  }, [trainer_id]);


   // Crear nueva progresión
   function handleCreateProgression() {
    PARService.createProgressionFromPAR(id)
      .then(newProg => {
        setProgressions([...progressions, newProg]);
      });
  }

  
  useEffect(() => {
    UserServices.find(parent_id).then(data => {
          setUsers(data);
      });
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Notify.notifyA("Cargando");
    PARService.getPAR(user_id).then((allPars) => {
      // 2) Buscamos el que tenga _id = week_id
      const found = allPars.find((p) => p._id === id);
      if (!found) {
        Notify.instantToast("No se encontró el PAR seleccionado");
        setLoading(false);
        return;
      }
      found.parent_par_id && setIsProgression(true)

      setProgressions(allPars.filter(p => p.parent_par_id === id))
      setRoutine(found);
      setWeekName(found.name || "PAR sin nombre");
      setModifiedDay(found.routine);
      setAllDays(found.routine);
      setDay(found.routine);
      setSelectedBlock(found.block || null);
      console.log(found)

      // Tomamos el primer día si existe
      if (found.routine && found.routine.length > 0) {
        setCurrentDay(found.routine[0]);
      }

      Notify.updateToast();
      setLoading(false);
    });
  }, [id, week_id, statusCancel, status]);

  // Eliminar progresión
  function handleDeleteProgression(progId) {
    PARService.deletePAR(progId).then(() => {
      setProgressions(progressions.filter(p => p._id !== progId));
    });
  }
  
  const handleCategoryCheckbox = (e, category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    let newSelected;
    if (e.target.checked) {
      newSelected = [...selectedCategories, category];
    } else {
      newSelected = selectedCategories.filter((cat) => cat !== category);
    }
    setSelectedCategories(newSelected);
    
    // Actualizamos la lista de alumnos a seleccionar:
    // Si hay alguna categoría marcada, filtramos; si no, volvemos a la lista completa (users)
    if (newSelected.length > 0) {
      const filtered = users.filter(u => newSelected.includes(u.category));
      setSelectedStudents(filtered);
    } else {
      setSelectedStudents([]);
    }
  };

  const optionGroupTemplate = (group) => {
    // Comprueba si todos los items del grupo están ya seleccionados
    const allSelected =
      group.items.length > 0 &&
      group.items.every((item) =>
        selectedStudents.some((selected) => String(selected._id) === String(item._id))
      );
  
    // Función que al togglear el checkbox del grupo, agrega o quita todos los items del grupo a la selección
    const toggleGroupSelection = () => {
      if (allSelected) {
        // Quitar todos los items del grupo de la selección
        const newSelection = selectedStudents.filter(
          (selected) =>
            !group.items.some(
              (item) => String(item._id) === String(selected._id)
            )
        );
        setSelectedStudents(newSelection);
      } else {
        // Agregar todos los items del grupo a la selección (evitando duplicados)
        const newSelection = [
          ...selectedStudents,
          ...group.items.filter(
            (item) =>
              !selectedStudents.some(
                (selected) => String(selected._id) === String(item._id)
              )
          )
        ];
        setSelectedStudents(newSelection);
      }
    };
  
    return (
      <div className="p-multiselect-option-group" style={{ display: 'flex', alignItems: 'center' }}>
        <label style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
          <input type="checkbox" checked={allSelected} onChange={toggleGroupSelection} /> 
        </label>
        <strong>{group.label}</strong>
      </div>
    );
  };

  

  // DB local
 /* useEffect(() => {
    const local = localStorage.getItem("DATABASE_USER");
    if (local != null) {
      setDatabaseUser(local);
      setExercisesDatabase(databaseUser);
    } else {
      setExercisesDatabase(Exercises);
    }
  }, [databaseUser]);*/

  // Manejo del ancho
  useEffect(() => {
    const handleResize = () => setFirstWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Por si recargamos el status
  useEffect(() => {
    setCurrentDay(null);
  }, [statusCancel]);

  // Mapeo de Options
  useEffect(() => {
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

  // Cuando day[indexDay] exista, lo asignamos
  useEffect(() => {
    if (day[indexDay]) {
      setCurrentDay({ ...day[indexDay] });
    }
  }, [day, indexDay]);

  // -- BACKOFF FUNCTIONS --
  const hasBackoff = exercise => (
    exercise && typeof exercise.name === 'object' &&
    Array.isArray(exercise.name.backoff) &&
    exercise.name.backoff.some(b => b.sets || b.reps || b.peso)
  );

  const handleOpenBackoffOverlay = (e, idx) => {
    setEditingBackoffIndex(idx);
    let lines = [{ sets: "", reps: "", peso: "" }];
    const ex = day[indexDay]?.exercises[idx];
    if (ex && typeof ex.name === 'object' && Array.isArray(ex.name.backoff)) {
      lines = ex.name.backoff;
    }
    setBackoffData(lines);
    backoffOverlayRef.current.toggle(e);
  };

  const handleSaveBackoff = () => {
    saveBackoffInternally(backoffData);
    backoffOverlayRef.current.hide();
    setEditingBackoffIndex(null);
    setBackoffData([{ sets: "", reps: "", peso: "" }]);
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


    const removeBackoffLine = (index) => {
    const updated = [...backoffData];
    updated.splice(index, 1);
    setBackoffData(updated);
    saveBackoffInternally(updated);
  };

  // -- END BACKOFF --

  /* ------------------------------------------------------------------
   * DRAG & DROP
   * ------------------------------------------------------------------*/
  const reorderExercises = (exercisesArray) => {
    return exercisesArray.map((ex, idx) => ({ ...ex, numberExercise: idx + 1 }));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const updatedDays = [...day];
    const exercisesArray = Array.from(updatedDays[indexDay].exercises);

    const [reorderedItem] = exercisesArray.splice(result.source.index, 1);
    exercisesArray.splice(result.destination.index, 0, reorderedItem);

    updatedDays[indexDay].exercises = reorderExercises(exercisesArray);

    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setIsEditing(true);
  };

  /* ------------------------------------------------------------------
   * Warmup
   * ------------------------------------------------------------------*/
  const handleShowWarmup = () => {
    setWarmup(true);
    setIsEditing(false);
  };
  const hideDialogWarmup = () => setWarmup(false);

  const editAndClose = () => {
    setWarmup(false);
    setMovilityVisible(false)
    setIsEditing(true)
  };

  const handleShowMovility = () => {
    setMovilityVisible(true);
    setIsEditing(false);
  };

  /* ------------------------------------------------------------------
   * Edición de datos
   * ------------------------------------------------------------------*/
  const parseTimeStringToDate = (timeString) => {
    if (typeof timeString === "string" && /^\d{2}:\d{2}$/.test(timeString)) {
      const [minutes, seconds] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(0, minutes, seconds, 0);
      return date;
    }
    return new Date(0, 0, 0, 0, 0);
  };

  const customLocale = {
    ...esES,
    TimePicker: {
      ...esES.TimePicker,
      hours: "Horas",
      minutes: "Minutos",
      seconds: "Segundos",
    },
  };

          const handleDropdownChange = useCallback((selectedOption) => {
          setActualUser(selectedOption);
      }, []);

  const changeModifiedData = (index, value, field) => {
    setIsEditing(true);
    const updatedDays = [...day];
    updatedDays[indexDay].exercises[index] = {
      ...updatedDays[indexDay].exercises[index],
      [field]: value,
    };
    // glow en video
    if (field === "video" && value) {
      setGlowVideo((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setGlowVideo((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    }

    updatedDays[indexDay].lastEdited = new Date().toISOString();
    setDay(updatedDays);
    setModifiedDay(updatedDays);

  };


  const handleDeleteClick = (exercise) => {
    setExerciseToDelete(exercise);
    setShowDeleteDialog(true);
  };

  const acceptDeleteExercise = (id) => {
    setIsEditing(true);
    const updatedDays = [...day];
    updatedDays[indexDay].exercises = updatedDays[indexDay].exercises.filter(
      (ex) => ex.exercise_id !== id
    );
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast("Ejercicio eliminado con éxito");
  };

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

  /* ------------------------------------------------------------------
   * Agregar / Eliminar Ejercicio
   * ------------------------------------------------------------------*/
  const AddNewExercise = () => {
    const updatedDays = [...allDays];
    const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;

    const newExercise = {
      exercise_id: new ObjectId().toString(),
      type: "exercise",
      numberExercise: nextNumberExercise,
      name: "",
      reps: 1,
      sets: 1,
      peso: "",
      rest: "",
      video: "",
      notas: "",
    };

    updatedDays[indexDay].exercises.push(newExercise);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Ejercicio creado con éxito!");
  };

  /* ------------------------------------------------------------------
   * Guardar / Cancelar
   * ------------------------------------------------------------------*/
  const applyChanges = () => {
    if (!routine) return;
    // Construimos el updated PAR
    const updatedPar = {
      ...routine,
      name: weekName,
      routine: modifiedDay,
      block: selectedBlock
    };
    // Llamamos a update
    PARService.updatePAR(routine._id, updatedPar).then(() => {
      Notify.instantToast("Rutina guardada con éxito (PAR)!");
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStatusCancel(idRefresh); // forzar recarga
  };
  const confirmCancel = () => {
    setShowCancelDialog(true);
  };

  /* ------------------------------------------------------------------
   * Manejo de Días
   * ------------------------------------------------------------------*/
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
          type: "exercise",
          numberExercise: 1,
          name: "",
          reps: 1,
          sets: 1,
          peso: "",
          rest: "",
          video: "",
          notas: "",
        },
      ],
    };

    updatedDays.push(newDay);
    setAllDays(updatedDays);
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast("Día creado con éxito");
  };

  // Eliminar día
  const handleDeleteDayClick = () => setShowDeleteDayDialog(true);

  const confirmDeleteDay = () => {
    setIsEditing(true);
    if (!currentDay) return;

    const updatedDays = [...allDays];
    const dayIndex = updatedDays.findIndex((d) => d._id === currentDay._id);

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

  // Editar nombre de día
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

  /* ------------------------------------------------------------------
   * Manejo de circuitos
   * ------------------------------------------------------------------*/
  const AddNewCircuit = () => {
    const updatedDays = [...allDays];
    const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;

    const newCircuit = {
      exercise_id: new ObjectId().toString(),
      type: "",
      name: "",
      typeOfSets: "",
      notas: "",
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

  // Para type, typeOfSets, notas => similar a tu snippet
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

  const changeExerciseInCircuit = (circuitIndex, exerciseIndex, field, repsValue) => {
    setIsEditing(true);
    const updatedDays = [...day];
    let value = "";

    if (field !== "name") {
      value = inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`].value;
    }
    const updatedCircuitExercise = {
      ...updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex],
      [field]: field === "reps" || field === "name" ? repsValue : value,
    };
    updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex] = updatedCircuitExercise;
    setDay(updatedDays);
    setModifiedDay(updatedDays);
  };

  // Sumar sets/reps a todos los exercises
  const incrementAllSeries = () => {
    const updatedDays = day.map((dayItem, idx) => {
      if (idx === indexDay) {
        return {
          ...dayItem,
          exercises: dayItem.exercises.map((ex) => {
            if (ex.type === "exercise") {
              return { ...ex, sets: (ex.sets || 0) + 1 };
            }
            return ex;
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
    setCurrentDay(null);
  };

  const incrementAllReps = () => {
    const updatedDays = day.map((dayItem, idx) => {
      if (idx === indexDay) {
        return {
          ...dayItem,
          exercises: dayItem.exercises.map((ex) => {
            if (ex.type === "exercise") {
              return { ...ex, reps: (ex.reps || 0) + 1 };
            }
            return ex;
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
    setCurrentDay(null);
  };

  /* ------------------------------------------------------------------
   * customInputEditDay y customInputEditCircuit
   * ------------------------------------------------------------------*/
  const customInputEditDay = (data, index, field) => {
    if (field === "sets" || field === "reps") {
      return (
        <CustomInputNumber
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          initialValue={data}
          onChange={(val) => changeModifiedData(index, val, field)}
          isRep={field === "reps"}
          className="mt-5"
        />
      );
    } else if (field === "video") {
      const shouldGlow = glowVideo[index];
      return (
        <>
          <IconButton
            aria-label="video"
            className={`w-100 ${shouldGlow ? "glowing-icon" : ""}`}
            onClick={(e) => {
              if (productRefsSimple.current[index]) {
                productRefsSimple.current[index].toggle(e);
              }
            }}
          >
            <YouTubeIcon className="colorIconYoutube" />
          </IconButton>
          <OverlayPanel ref={(el) => (productRefsSimple.current[index] = el)}>
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
    }
    // default
    return (
      <input
        ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
        className={`form-control ${firstWidth ? "border" : "border-0"} ellipsis-input text-center`}
        type="text"
        defaultValue={data}
        onChange={(e) => changeModifiedData(index, e.target.value, field)}
      />
    );
  };

  const customInputEditCircuit = (data, circuitIndex, field) => {
    if (field === "notas") {
      return (
        <InputTextarea
          ref={(el) => (inputRefs.current[`${circuitIndex}-${field}`] = el)}
          className="w-100"
          autoResize
          defaultValue={data}
          onChange={() => changeCircuitData(circuitIndex, field)}
        />
      );
    }
    return (
      <input
        ref={(el) => (inputRefs.current[`${circuitIndex}-${field}`] = el)}
        className="form-control ellipsis-input text-center"
        type="text"
        defaultValue={data}
        onChange={() => changeCircuitData(circuitIndex, field)}
      />
    );
  };

  const customInputEditExerciseInCircuit = (
    data,
    circuitIndex,
    exerciseIndex,
    field,
    repsValue
  ) => {
    // Similar a snippet original
    if (field === "video") {
      return (
        <>
          <IconButton
            aria-label="video"
            className="w-100"
            onClick={(e) => {
              if (productRefsCircuit.current[exerciseIndex]) {
                productRefsCircuit.current[exerciseIndex].toggle(e);
              }
            }}
          >
            <YouTubeIcon className="colorIconYoutube" />
          </IconButton>
          <OverlayPanel
            ref={(el) => (productRefsCircuit.current[exerciseIndex] = el)}
          >
            <input
              ref={(el) => (inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el)}
              className="form-control ellipsis-input text-center"
              type="text"
              defaultValue={data}
              onChange={() => changeExerciseInCircuit(circuitIndex, exerciseIndex, field)}
            />
          </OverlayPanel>
        </>
      );
    } else if (field === "reps") {
      return (
        <CustomInputNumber
          ref={(el) => (inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el)}
          initialValue={data}
          onChange={(val) => changeExerciseInCircuit(circuitIndex, exerciseIndex, field, val)}
          isRep={true}
          className="mt-5"
        />
      );
    } else if (field === "name") {
      return (
        <AutoComplete
          defaultValue={data}
          onChange={(val) => changeExerciseInCircuit(circuitIndex, exerciseIndex, field, val)}
        />
      );
    }
    // default
    return (
      <input
        ref={(el) => (inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el)}
        className="form-control ellipsis-input text-center"
        type="text"
        defaultValue={data}
        onChange={() => changeExerciseInCircuit(circuitIndex, exerciseIndex, field)}
      />
    );
  };

  

  const designWeekToUsers = (template, userIds, name) => {

    if(routine.parent_par_id){
        PARService.createProgressionsPARToUsers(template, userIds)
          .then(() => {
            Notify.instantToast(`Rutina asignada a usuario con éxito`);
          })
          .catch((err) => {
            console.error(`Error asignando a usuario :`, err);
            Notify.instantToast(`Error asignando a usuario `);
          });


    } else{

      userIds.forEach(userId => {
        PARService.createPARroutine(template, userId)
          .then(() => {
            Notify.instantToast(`Rutina asignada a ${name} con éxito`);
          })
          .catch((err) => {
            console.error(`Error asignando a usuario ${name}:`, err);
            Notify.instantToast(`Error asignando a usuario ${name}`);
          });
      });

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

  const handleBlockDropdownChange = (value) => {
    if (value === 'add-new-block') {
      setShowBlockDialog(true);
      return;
    }
    
    const selected = blocks.find(block => block._id === value) || null;
    setSelectedBlock(selected);
    setIsEditing(true); // Marca que hay edición pendiente
  };

// NUEVO tableMobile adaptado a tu ParDetailsPage.jsx
const tableMobile = () => {
  return (
    <div className="p-1">
      {currentDay && (
        <div className="row justify-content-center text-center mb-3 p-0">
          <div className="col-6 mb-3 px-0">
            <button
              aria-label="sumar-series"
              className="btn btn-outline-dark me-2 p-2"
              onClick={() => incrementAllSeries()}
            >
              <UpgradeIcon /> Sumar 1 serie
            </button>
          </div>

          <div className="col-6 mb-3 px-0">
            <button
              aria-label="sumar-reps"
              className="btn btn-outline-dark me-2 p-2"
              onClick={() => incrementAllReps()}
            >
              <UpgradeIcon /> Sumar 1 rep
            </button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="exercises-mobile">
          {(provided) => (
            <div
              className="div div-bordered p-0"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {currentDay &&
                currentDay.exercises.map((exercise, i) => (
                  <Draggable
                    key={exercise.exercise_id}
                    draggableId={exercise.exercise_id}
                    index={i}
                  >
                    {(providedDrag) => (
                      <div
                        ref={providedDrag.innerRef}
                        {...providedDrag.dragHandleProps}
                        className="mb-4 shadowCards p-2"
                      >
                        {/* Ejercicio simple */}
                        {exercise.type === "exercise" ? (
                          <>
                            <div className="row justify-content-center">
                              <div className="col-10 text-start">
                                <AutoComplete
                                  defaultValue={typeof exercise.name === 'object' ? exercise.name.name : exercise.name}
                                  isProgression={routine.parent_par_id}
                                  onChange={(name, video) => {
                                    if (typeof exercise.name === 'object') {
                                      changeModifiedData(i, { ...exercise.name, name }, 'name');
                                    } else {
                                      changeModifiedData(i, name, 'name');
                                    }
                                    changeModifiedData(i, video, 'video');
                                  }}
                                />
                                <div className="d-flex align-items-center mt-1">
                                  <button
                                    className="btn btn-outline-dark py-0 px-1"
                                    onClick={(e) => handleOpenBackoffOverlay(e, i)}
                                  >
                                    <AddIcon fontSize="small" /> Back off
                                  </button>
                                  <Tooltip title={hasBackoff(exercise) ? "Tiene backoff" : "No tiene backoff"}>
                                    {hasBackoff(exercise) ? (
                                      <CircleIcon color="success" className="ms-2" />
                                    ) : (
                                      <PanoramaFishEyeIcon className="ms-2" />
                                    )}
                                  </Tooltip>
                                </div>
                              </div>
                              <div className="col-1 text-start me-3">
                                {customInputEditDay(exercise.video, i, 'video')}
                              </div>
                            </div>

                            <div className="row justify-content-center mt-2 ms-2 me-4">
                              <div className="col-6 text-start">
                                <span className="styleInputsSpan ms-1">Peso</span>
                                <div className="largoInput">{customInputEditDay(exercise.peso, i, 'peso')}</div>
                              </div>
                              <div className="col-6 text-start">
                                <span className="styleInputsSpan ms-1">Rest</span>
                                <div className="largoInput">{customInputEditDay(exercise.rest, i, 'rest')}</div>
                              </div>
                            </div>

                            <div className="row justify-content-center mt-2 ms-2 me-4">
                              <div className="col-6 text-start">
                                <span className="styleInputsSpan">Series</span>
                                <div className="largoInput">{customInputEditDay(exercise.sets, i, 'sets')}</div>
                              </div>
                              <div className="col-6 text-start">
                                <span className="styleInputsSpan">Reps</span>
                                <div className="largoInput">{customInputEditDay(exercise.reps, i, 'reps')}</div>
                              </div>
                            </div>

                            <div className="row justify-content-center my-2">
                              <div className="col-11 text-start">
                                <span className="styleInputsSpan">Notas</span>
                                {customInputEditDay(exercise.notas, i, 'notas')}
                              </div>
                            </div>

                            <div className="row justify-content-center marginDropDown">
                              <div className="col-6">
                                <Dropdown
                                  value={exercise.numberExercise}
                                  options={options}
                                  onChange={(e) => changeModifiedData(i, e.target.value, 'numberExercise')}
                                  placeholder="#"
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
                                      onClick={() => handleDeleteClick({ exercise_id: exercise.exercise_id, name: exercise.name })}
                                    >
                                      <CancelIcon className="colorIconDeleteExercise" />
                                    </IconButton>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                        /* CIRCULOS (CIRCUITOS) */
                          <div className="row">
                            {/* tipo y vueltas */}
                            <div className="col-8">
                              <span className="styleInputsSpan">Nombre</span>
                              {customInputEditCircuit(exercise.type, i, 'type')}
                            </div>
                            <div className="col-4">
                              <span className="styleInputsSpan">Min / vueltas</span>
                              {customInputEditCircuit(exercise.typeOfSets, i, 'typeOfSets')}
                            </div>

                            {/* ejercicios del circuito */}
                            {exercise.circuit.map((item, j) => (
                              <div key={item.idRefresh} className="row justify-content-center text-center">
                                <div className="col-11 my-2">
                                  {customInputEditExerciseInCircuit(item.name, i, j, 'name')}
                                </div>
                                <div className="col-5 text-start">
                                  <span className="styleInputsSpan">Peso</span>
                                  <div className="largoInput">{customInputEditExerciseInCircuit(item.peso, i, j, 'peso')}</div>
                                </div>
                                <div className="col-5 text-start">
                                  <span className="styleInputsSpan">Reps</span>
                                  <div className="largoInput">{customInputEditExerciseInCircuit(item.reps, i, j, 'reps')}</div>
                                </div>
                              </div>
                            ))}

                            {/* Botón agregar ejercicio al circuito */}
                            <div className="row justify-content-center my-3">
                              <div className="col-8">
                                <IconButton
                                  aria-label="add-exercise-circuit"
                                  className="bgColor rounded-2 text-light"
                                  onClick={() => AddExerciseToCircuit(i)}
                                >
                                  <AddIcon /> Añadir ejercicio
                                </IconButton>
                              </div>
                            </div>

                            {/* notas del circuito */}
                            <div className="col-11">
                              <span className="styleInputsSpan">Notas</span>
                              {customInputEditCircuit(exercise.notas, i, 'notas')}
                            </div>

                            {/* acciones: eliminar circuito y ordenar */}
                            <div className="row justify-content-center mt-3">
                              <div className="col-4">
                                <Dropdown
                                  value={exercise.numberExercise}
                                  options={options}
                                  onChange={(e) => changeModifiedData(i, e.target.value, 'numberExercise')}
                                  placeholder="#"
                                  optionLabel="label"
                                  className="p-dropdown-group w-100"
                                />
                              </div>
                              <div className="col-7">
                                <div className="row justify-content-around">
                                  <IconButton
                                    className="col-8 bg-danger rounded-2 text-light"
                                    onClick={() => deleteCircuit(exercise.name, i)}
                                  >
                                    <DeleteIcon /> Eliminar
                                  </IconButton>
                                  <IconButton className="col-3">
                                    <DragIndicatorIcon />
                                  </IconButton>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};


  const deletePAR = (idToDelete) => {
    return PARService.deletePAR(idToDelete).then(() => {
      Notify.instantToast("PAR eliminado con éxito");
      setTimeout(() => {
        window.location.href = `/planificator/${parent_id}`;
      }, 1000);
    });
  };

  const confirmDeletePAR = () => {
    setShowDeleteParDialog(true);
  };

  function openManageProgressionsDialog() {
    setShowManageProgressionsDialog(true);
  }
  function closeManageProgressionsDialog() {
    setShowManageProgressionsDialog(false);
  }

  function enterProgression(id) {
    setShowManageProgressionsDialog(false);
    navigate(`/par/${id}`);
  }

  function cleanRoutineFields(routine) {
    if (!Array.isArray(routine?.routine)) return routine;
  
    const isEmpty = (val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'string') return val.trim() === '';
      if (Array.isArray(val)) return val.length === 0;
      if (typeof val === 'object') return Object.keys(val).length === 0;
      return false;
    };
  
    const cleaned = JSON.parse(JSON.stringify(routine)); // deep copy
  
    cleaned.routine.forEach(day => {
      // Exercises
      day.exercises?.forEach(ex => {
        ['name', 'reps', 'sets', 'peso', 'rest', 'video', 'notas'].forEach(field => {
          if (isEmpty(ex[field])) ex[field] = '';
        });
  
        // Circuit
        if (Array.isArray(ex.circuit)) {
          ex.circuit.forEach(c => {
            ['name', 'reps', 'peso', 'video'].forEach(f => {
              if (isEmpty(c[f])) c[f] = '';
            });
          });
        }
  
        // Backoff (opcional)
        if (typeof ex.name === 'object' && Array.isArray(ex.name.backoff)) {
          ex.name.backoff = ex.name.backoff.filter(b =>
            !isEmpty(b.sets) || !isEmpty(b.reps) || !isEmpty(b.peso)
          );
        }
      });
  
      // Warmup
      day.warmup?.forEach(w => {
        ['name', 'sets', 'reps', 'peso', 'video', 'notas'].forEach(field => {
          if (isEmpty(w[field])) w[field] = '';
        });
      });
  
      // Movility
      day.movility?.forEach(m => {
        ['name', 'sets', 'reps', 'peso', 'video', 'notas'].forEach(field => {
          if (isEmpty(m[field])) m[field] = '';
        });
      });
    });
  
    return cleaned;
  }


  return (
    <>
      {/* Sidebar fijo a la izquierda */}
      <div className="sidebarProExercises">
        <Sidebar
          collapsed={collapsed}
          collapsedWidth="85px"
          width="200px"
          backgroundColor="colorMain"
          rootStyles={{
            color: "white",
            border: "none",
          }}
        >
          <Menu>
            <MenuItem
              onClick={() => setCollapsed(!collapsed)}
              className="mt-3 mb-5"
              icon={<ViewHeadlineIcon />}
              style={{ height: "auto", whiteSpace: "normal" }}
            >
              <span>Ocultar barra</span>
            </MenuItem>

            {/* Segmento vertical con días */}
            <MenuItem style={{ height: "auto", whiteSpace: "normal" }}>
              <div style={{ padding: "1rem 0" }}>
                <Segmented
                  className="w-100 stylesSegmented"
                  size="large"
                  vertical
                  options={allDays.map((d, index) => ({
                    label: d.name,
                    value: d._id,
                    icon:
                      index === 0 ? (
                        <LooksOneIcon />
                      ) : index === 1 ? (
                        <LooksTwoIcon />
                      ) : index === 2 ? (
                        <Looks3Icon />
                      ) : index === 3 ? (
                        <Looks4Icon />
                      ) : index === 4 ? (
                        <Looks5Icon />
                      ) : index === 5 ? (
                        <Looks6Icon />
                      ) : (
                        <CalendarTodayIcon />
                      ),
                  }))}
                  value={currentDay ? currentDay._id : ""}
                  onChange={(value) => {
                    const selectedDay = allDays.find((day) => day._id === value);
                    if (selectedDay) {
                      const selectedIndex = allDays.findIndex(
                        (dd) => dd._id === selectedDay._id
                      );
                      setIndexDay(selectedIndex);
                      setCurrentDay(allDays[selectedIndex]);
                    }
                  }}
                />
              </div>
            </MenuItem>

            <MenuItem onClick={addNewDay} icon={<AddIcon />}>
              Agregar día
            </MenuItem>

            <MenuItem
              onClick={() => openEditNameDialog(currentDay)}
              icon={<EditIcon />}
            >
              Editar nombre
            </MenuItem>

            <MenuItem onClick={handleDeleteDayClick} icon={<DeleteIcon />}>
              Eliminar Día
            </MenuItem>

            <MenuItem disabled className="margenLogoDay ">
              <LogoChico />
            </MenuItem>

            <MenuItem className="text-center marginHelpDays ">
              <IconButton className="p-2 bg-light">
                <HelpOutlineIcon className="text-dark" />
              </IconButton>
              <span className="ms-2">Ayuda</span>
            </MenuItem>
          </Menu>
        </Sidebar>
      </div>

              {/* Contenido principal, respetando el espacio del sidebar */}
              <div className={` totalHeight ${collapsed ? "marginSidebarClosed" : " marginSidebarOpen"}`}>
                <section className="container-fluid ">
                  <div className="row text-center mb-5 justify-content-center pb-3 align-items-center">
                    <div className="col-10">
                      <p className="fs-5 mb-0 pb-0 ">Rutina <strong>{weekName}</strong></p>       
                    </div>

                    <div className="text-center mt-1">
                      <button className="btn btn-danger" onClick={confirmDeletePAR}>
                        <DeleteIcon className="text-light fs-5" /> Eliminar
                      </button>
                    </div>
                          <div className="col-12 col-lg-6 my-3">

                            <p>Actualmente te encontrás en esta rutina pre-armada. Podés asignarla a tus usuarios.</p>

                          </div>
                        <div className="col-10">
                          <div className="row justify-content-center">
                          
                            <div className="col-12">
                              <h5>Asignar a:</h5>
                            
                              {allCategories.map(category => {
                                const isChecked = selectedCategories.includes(category)
                                return (
                                  <>
                                    <div class="form-check form-check-inline"
                                    style={{
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                      padding: '0.5rem 1rem',
                                      margin: '0.25rem',
                                      cursor: 'pointer',
                                      userSelect: 'none',
                                      backgroundColor: isChecked ? '#0d6efd' : 'transparent',
                                      color: isChecked ? '#fff' : '#000',
                                      transition: 'background-color .2s, color .2s'
                                    }}>
                                      <div key={category} class="" onChange={(e) => handleCategoryCheckbox(e, category)} >
                                        <input class="form-check-input d-none" type="checkbox" value="" id={`${category}`}  checked={selectedCategories.includes(category)}
                                            />
                                        <label style={{ cursor: 'pointer' }} class="form-check-label" for={`${category}`}>
                                        {category}
                                        </label>
                                      </div>
                                    </div>
                                  </>)
                                })}
                              
                            </div>
                            <div className="col-12">
                              <div className="row justify-content-center align-items-center mt-2">

                                <div className="col-12 col-md-3 p-0 ">
                                  <button 
                                    className="btn btn-primary w-100 rounded-0 sss" 
                                    type="button" 
                                    onClick={openManageProgressionsDialog}
                                  >
                                    Administrar progresiones
                                  </button>
                                </div>

                                <div className="col-12 col-md-4  p-0">
                                  <MultiSelect 
                                    value={selectedStudents} 
                                    className="w-100 rounded-0"
                                    options={groupedOptions}
                                    optionGroupLabel="label"
                                    optionGroupChildren="items"
                                    optionGroupTemplate={optionGroupTemplate}
                                    optionLabel="name"
                                    placeholder="Seleccioná alumnos..."
                                    filter
                                    display="chip"
                                    onChange={(e) => setSelectedStudents(e.value)}
                                  />
                                </div>

                                <div className="col-12 col-md-3 text-start p-0 ">
                                  <button
                                    className="btn btn-primary w-100 rounded-0 buttonAsingRight"
                                    disabled={selectedStudents.length === 0}
                                    onClick={() => designWeekToUsers(routine, selectedStudents.map(u => u._id), selectedStudents.map(u => u.name))}
                                  >
                                    Asignar rutina a {selectedStudents.length} alumno{selectedStudents.length !== 1 ? "s" : ""}
                                  </button>
                                </div>

                              </div>
                            </div>

                    </div>

                  </div>
                    

          </div>

          <div  className={`row text-center ${firstWidth > 992 && 'mb-5'} justify-content-center pb-3 align-middle align-center align-items-center`}>


                <div className="col-11 mb-3">
                  <div className="row justify-content-around align-items-center py-2">

                    <div id="warmup" className={`col-10 col-lg-4 ${ firstWidth > 992 ? 'me-3 ' : 'mb-4'} pt-4  btn boxDataWarmup`} onClick={handleShowMovility}>
                      <EditIcon  className="me-2" />
                      Administrar bloque de activación <strong className="d-block">{currentDay && currentDay.name}</strong>
                    </div>
                
    
                    <div id="warmup" className={`col-10 col-lg-4 ${ firstWidth > 992 && 'ms-3'} pt-4  btn boxDataWarmup`} onClick={handleShowWarmup}>
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
          <div className="row justify-content-center">
            <div className="col-6">
           
              <p className="styleInputsSpan">Asignar bloque</p>
              <Dropdown
                value={selectedBlock?._id || null}
                options={[
                  { name: 'Añadir/editar bloques', _id: 'add-new-block' },
                  { name: 'Sin bloque', _id: null },
                  ...blocks,
                ]}
                onChange={(e) => handleBlockDropdownChange(e.value)}
                optionLabel="name"
                optionValue="_id"
                placeholder="Seleccionar bloque"
                className="mb-4"
                style={{ width: '100%' }}
              />
            </div>
          </div>
         

          {/* Tabla principal */}
          <div className="row justify-content-center align-middle text-center mb-5 pb-5">
            {firstWidth > 992 ? (
              // Escritorio con Drag&Drop
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="exercises-desktop">
                  {(provided) => (
                    <div
                      className="table-responsive col-12 col-xl-11 altoTable"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {/* Cabecera de tabla */}
                      <table
                        className={`table table-hover totalHeightTable align-middle fontTable text-center ${
                          isEditing && "table-light"
                        }`}
                      >
                        <thead>
                          <tr>
                            {propiedades.map((p, idx) => (
                              <th key={idx} className={`td-${idx}`} scope="col">
                                {p}
                              </th>
                            ))}
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
                                  <tr ref={providedDrag.innerRef} {...providedDrag.draggableProps}>
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
                                        onChange={(e) =>
                                          changeModifiedData(i, e.target.value, "numberExercise")
                                        }
                                        placeholder="#"
                                        optionLabel="label"
                                        className="p-dropdown-group w-100"
                                      />
                                    </td>
                                    {exercise.type === "exercise" ? (
                                      <>
                                        <td className="td-2">
                                             <AutoComplete
                                                defaultValue={typeof exercise.name==='object'?exercise.name.name:exercise.name}
                                                isProgression={routine.parent_par_id}
                                                onChange={(name,video)=>{
                                                  changeModifiedData(i,name,'name');
                                                  changeModifiedData(i,video,'video');
                                                }}
                                              />
                                              {/* Backoff */}
                                              <div className="d-flex align-items-center mt-1">
                                                <button className="btn btn-outline-dark btn-sm" onClick={(e)=>handleOpenBackoffOverlay(e,i)}>
                                                  <AddIcon fontSize="small" /> Back off
                                                </button>
                                                <Tooltip title={hasBackoff(exercise)?"Tiene back off":"No tiene back off"}>                                      
                                                  {hasBackoff(exercise)?<CircleIcon color="success"/>:<PanoramaFishEyeIcon/>}
                                                </Tooltip>
                                              </div>
                                        </td>
                                        <td className="td-3">
                                          {customInputEditDay(exercise.sets, i, "sets")}
                                        </td>
                                        <td className="td-4 ">
                                         <div className='marginRepsNew'>{customInputEditDay(exercise.reps, i, "reps")}</div> 
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
                                              aria-label="delete-exercise"
                                              className="col-12"
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
                                        </td>
                                      </>
                                    ) : (
                                      // Circuit sub-tabla
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
                                                  {customInputEditCircuit(exercise.type, i, "type")}
                                                </td>
                                                <td>
                                                  {customInputEditCircuit(
                                                    exercise.typeOfSets,
                                                    i,
                                                    "typeOfSets"
                                                  )}
                                                </td>
                                                <td>
                                                  {customInputEditCircuit(exercise.notas, i, "notas")}
                                                </td>
                                                <td>
                                                  <IconButton
                                                    aria-label="delete-circuit"
                                                    className="text-center"
                                                    onClick={() => deleteCircuit(exercise.name, i)}
                                                  >
                                                    <CancelIcon className="colorIconDeleteExercise" />
                                                  </IconButton>
                                                </td>
                                              </tr>
                                              <tr>
                                                <th>Nombre</th>
                                                <th>Reps</th>
                                                <th>Peso</th>
                                                <th>Video</th>
                                                <th></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {exercise.circuit.map((cx, j) => (
                                                <tr key={cx.idRefresh}>
                                                  <td>
                                                    {customInputEditExerciseInCircuit(
                                                      cx.name,
                                                      i,
                                                      j,
                                                      "name"
                                                    )}
                                                  </td>
                                                  <td>
                                                    {customInputEditExerciseInCircuit(
                                                      cx.reps,
                                                      i,
                                                      j,
                                                      "reps"
                                                    )}
                                                  </td>
                                                  <td>
                                                    {customInputEditExerciseInCircuit(
                                                      cx.peso,
                                                      i,
                                                      j,
                                                      "peso"
                                                    )}
                                                  </td>
                                                  <td>
                                                    {customInputEditExerciseInCircuit(
                                                      cx.video,
                                                      i,
                                                      j,
                                                      "video"
                                                    )}
                                                  </td>
                                                  <td>
                                                    <IconButton
                                                      aria-label="delete-ex-circuit-ex"
                                                      onClick={() => {
                                                        setIsEditing(true);
                                                        const updatedDays = [...day];
                                                        updatedDays[indexDay].exercises[
                                                          i
                                                        ].circuit.splice(j, 1);
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
                                                    aria-label="add-ex-to-circuit"
                                                    className="btn btn-outline-dark my-4"
                                                    onClick={() => AddExerciseToCircuit(i)}
                                                  >
                                                    <AddIcon />
                                                    <span className="me-1">
                                                      Añadir Ejercicio al Circuito
                                                    </span>
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

          {/* Botones flotantes Guardar/Cancelar si hay edición */}
          {isEditing && (
            <div className="floating-button index-up">
              <button className="px-5 btn colorRed py-2 my-4" onClick={applyChanges}>
                Guardar
              </button>
              <button className="px-5 btn colorCancel py-2 my-4" onClick={confirmCancel}>
                Cancelar
              </button>
            </div>
          )}

          {/* Dialogos de confirmación */}
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
            reject={() => setShowDeleteDayDialog(false)}
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
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

          <Dialog
            header={`${exerciseToDelete?.name || ""}`}
            className={`dialogDeleteExercise ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showDeleteDialog}
            footer={
              <div className="row justify-content-center">
                <div className="col-lg-12 me-3">
                  <button className="btn btn-outlined-secondary" onClick={handleDeleteCancel}>
                    No
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                    Sí, eliminar
                  </button>
                </div>
              </div>
            }
            onHide={handleDeleteCancel}
          >
            <p className="p-4">
              ¡Cuidado! Estás por eliminar <b>"{exerciseToDelete?.name}"</b>. ¿Estás seguro?
            </p>
          </Dialog>

          {/* Warmup */}
          <Dialog
            className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
            contentClassName="colorDialog"
            headerClassName="colorDialog"
            header="Entrada en calor"
            visible={warmup}
            modal={false}
            onHide={hideDialogWarmup}
          >
            <ModalCreateWarmup
              week={modifiedDay}
              week_id={week_id}
              day_id={currentDay && currentDay._id}
              editAndClose={editAndClose}
            />
          </Dialog>

          <Dialog
              className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}
              contentClassName="colorDialog"
              headerClassName="colorDialog"
              header="Bloque de Activación"
              visible={movilityVisible}
              modal={false}
              onHide={() => setMovilityVisible(false)}

            >
              <ModalCreateMovility
                week={modifiedDay}
                week_id={week_id}
                day_id={currentDay && currentDay._id}
                editAndClose={editAndClose}
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
                <button className="btn btn-secondary mx-2 mt-2" onClick={() => setIsEditingName(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </Dialog>

          {/* Editar nombre de la Semana (PAR) */}
          <Dialog
            header="Editar Nombre de la Semana"
            className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={isEditingWeekName}
            style={{
              ...(firstWidth > 968 ? { width: "35vw" } : { width: "75vw" })
            }}
            onHide={() => setIsEditingWeekName(false)}
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
                  onClick={() => {
                    setWeekName(newWeekName);
                    setIsEditing(true); // Marcar que hay edición pendiente
                    setIsEditingWeekName(false);
                    Notify.instantToast("Nombre de la semana editado localmente");
                  }}
                >
                  Confirmar
                </button>
                <button
                  className="btn btn-secondary mx-2 mt-2"
                  onClick={() => setIsEditingWeekName(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Dialog>

          <ConfirmDialog
              visible={showDeleteParDialog}
              className={`${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
              onHide={() => setShowDeleteParDialog(false)}
              message="¿Estás seguro de que deseas eliminar este PAR? Esta acción no se puede deshacer."
              header="Eliminar PAR"
              icon="pi pi-exclamation-triangle"
              acceptLabel="Sí, eliminar"
              rejectLabel="Cancelar"
              accept={() => {
                deletePAR(id);
                setShowDeleteParDialog(false);
              }}
              reject={() => setShowDeleteParDialog(false)}
            />



          {firstWidth < 992 && (
            <nav className="fixed-bottom colorNavBottom d-flex justify-content-around pb-4 " >
              
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
                  <IconButton className={`text-light align-self-bottom `} onClick={() => setEditMode(!editMode)}>
                    <EditIcon />
                  </IconButton>
                </div>
                <span className={`col-12 text-light fontTextNavBar ${editMode && "activeButton"}`} >Modo edición</span>
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

{/* Dialogo: Administrar Progresiones */}
          <Dialog
            header="Administrar Progresiones"
            visible={showManageProgressionsDialog}
            style={{ width: '50vw' }}
            onHide={closeManageProgressionsDialog}
          >
            <div>
              {progressions && progressions.length > 0 ? (
                progressions.map((prog, idx) => (
                  
                  <button key={prog._id} className="p-2 btn btn-outline-dark mx-2" onClick={() => enterProgression(prog._id)  }>
                    {`Progresión ${idx + 1}`}
                  </button>
                )) 
               
              ) : (
                <p>No hay progresiones creadas.</p>
              )}
               <button  className="p-2 btn btn-outline-dark mx-2" onClick={() => handleCreateProgression()}>
                    Crear progresión <AddIcon />
                  </button>
            </div>
            <div className="p-dialog-footer">
              <button
                className="btn btn-secondary"
                onClick={closeManageProgressionsDialog}
              >
                Cerrar
              </button>
            </div>
          </Dialog>

          <Dialog
            header="Gestión de bloques"
            visible={showBlockDialog}
            style={{ width: '50vw' }}
            onHide={() => setShowBlockDialog(false)}
          >
            <BlocksListPage id={trainer_id} />
          </Dialog>


        </section>
      </div>
    </>
  );
}

export default ParDetailsPage;
