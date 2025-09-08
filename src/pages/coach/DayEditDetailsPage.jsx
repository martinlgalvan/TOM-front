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
import { AutoComplete as PrimeAutoComplete } from 'primereact/autocomplete';


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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ImageIcon from '@mui/icons-material/Image';


import {
  User,
  CalendarPlus,
  Repeat,
  ClipboardCopy,
  HelpCircle,
  ToggleLeft,
  SquarePlus,
  Info,
  Badge,
  BadgePlus,
  InfoIcon,
  RectangleEllipsis
} from 'lucide-react';
import { Add, PlusOneOutlined } from "@mui/icons-material";

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

  //Aproximaciones
  const [approxData, setApproxData] = useState([{ reps: "", peso: "" }]);
  const [useCustomApproxTitle, setUseCustomApproxTitle] = useState(false);
  const [approxTitleName, setApproxTitleName] = useState("");
  const editingApproxIndex = useRef(null);
  const approxOverlayRef    = useRef(null);

  const [renderInputSets, setRenderInputSets] = useState(true);
  const [renderInputReps, setRenderInputReps] = useState(true);

  const editingBackoffIndex = useRef({ blockIndex: null, exIndex: null });
  const [backoffData, setBackoffData] = useState([{ sets: "", reps: "", peso: "" }]);
  const backoffOverlayRef = useRef(null);
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [backoffTitleName, setBackoffTitleName] = useState("");

  const productRefsSimple = useRef({});
  const productRefsCircuit = useRef([]);

  const [circuitToDelete, setCircuitToDelete] = useState(null);
const [showDeleteCircuitDialog, setShowDeleteCircuitDialog] = useState(false);
const [showDeleteBlockDialog, setShowDeleteBlockDialog] = useState(false);
const [blockToDelete, setBlockToDelete] = useState({ index: null, name: "" });

const [exerciseToDeleteInCircuit, setExerciseToDeleteInCircuit] = useState(null);
const [showDeleteExerciseInCircuitDialog, setShowDeleteExerciseInCircuitDialog] = useState(false);

const [dayClipboard, setDayClipboard] = useState(() => localStorage.getItem('copiedDay') || null);
const hasDayClipboard = Boolean(dayClipboard || localStorage.getItem("copiedDay"));

// Lista fija de nombres de bloque
const BLOCK_NAME_OPTIONS = [
  'Bloque de fuerza',
  'Bloque de hipertrofia',
  'Bloque de volumen',
  'Bloque de recuperación',
  'Bloque de pliometria'
];
// Estado para manejar las sugerencias del Autocomplete
const [blockNameSuggestions, setBlockNameSuggestions] = useState(BLOCK_NAME_OPTIONS);

  const [tempColor, setTempColor] = useState();

  useEffect(() => {
  setLoading(true);
  Notify.notifyA("Cargando");

  WeekService.findByWeekId(week_id).then((data) => {
    const w = data[0];
    const upgraded = upgradeWeekShape(w.routine || []);
    setRoutine(w);
    setWeekName(w.name);
    console.log(upgraded)
    setModifiedDay(upgraded);
    setAllDays(upgraded);
    setDay(upgraded);
    setCurrentDay(upgraded[0] || null);
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
        title: 'Nombre de la semana.',
        description: 'Ademas de ser el nombre, podés editarlo apretando el botón.',
        target: () => document.getElementById('nameWeek'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Días de la semana',
        description: 'Estos son los dias que contiene la semana. Podes navegar entre ellos apretando en el día correspondiente.',
        target: () => document.getElementById('dias'),
        placement: 'right',
        prevButtonProps: { children: '« Anterior' },
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
        nextButtonProps: { children: 'Siguiente »' }
      },
        {
        title: 'Añadir ejercicio',
        description: 'Podes agregar un ejercicio para luego completarlo.',
        target: () => document.getElementById('addEjercicio'),
        placement: 'right',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Añadir circuito',
        description: 'Podes agregar la estructura de un circuito, para luego completarlo.',
        target: () => document.getElementById('addCircuit'),
        placement: 'right',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Bloque de movilidad/activación',
        description: 'Ingresá al bloque de activación/movilidad de tu alumno. ',
        target: () => document.getElementById('movility'),
        placement: 'bottom',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: 'Siguiente »' }
      },
      {
        title: 'Bloque de entrada en calor',
        description: 'Ingresá al bloque de entrada en calor de tu alumno. ',
        target: () => document.getElementById('warmup'),
        placement: 'bottom',
        prevButtonProps: { children: '« Anterior' },
        nextButtonProps: { children: 'Finalizar' }
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


  // ================= FUNCIONES PARA APROXIMAR ====================

  const handleOpenApprox = (e, blockIndex, exIndex = null) => {
  editingApproxIndex.current = { blockIndex, exIndex };
  const currentEx = exIndex != null
     ? day[indexDay].exercises[blockIndex].exercises[exIndex]
     : day[indexDay].exercises[blockIndex];
  // Si ya existe approx guardada, la tomamos; si no, inicializamos
  let currentApprox = [{ reps: "", peso: "" }];
  if (currentEx && currentEx.name?.approximations) {
    currentApprox = [...currentEx.name.approximations];
    if (currentEx.name.approxTitle) {
      setUseCustomApproxTitle(true);
      setApproxTitleName(currentEx.name.approxTitle);
    }
  }
  setApproxData(currentApprox);
  approxOverlayRef.current.toggle(e);
};

// Guarda en el state interno y en el ejercicio
const saveApproxInternally = (lines) => {
  const { blockIndex, exIndex } = editingApproxIndex.current || {};
  if (blockIndex == null) return;

  // 1) clonamos el día y la lista de ejercicios
  const updatedDays = [...day];
  const dayCopy = { ...updatedDays[indexDay] };
  let exercisesCopy = [...dayCopy.exercises];

  // 2) preparamos el nameObj en base a las líneas limpias
  const cleaned = lines.filter(l => l.reps || l.peso);
  const buildNameObj = rawName => {
    const base = typeof rawName === 'object' ? { ...rawName } : { name: rawName };
    if (cleaned.length)      base.approximations = cleaned;
    else                      delete base.approximations;
    if (useCustomApproxTitle && approxTitleName.trim()) base.approxTitle = approxTitleName.trim();
    else                                              delete base.approxTitle;
    return base;
  };

  if (exIndex != null) {
    // === ejercicio DENTRO de un bloque ===
    const blockCopy   = { ...exercisesCopy[blockIndex] };
    let   innerCopy   = [...blockCopy.exercises];
    const rawExercise = innerCopy[exIndex];

    // 3) clonar y actualizar sólo ese ejercicio
    const exCopy = { ...rawExercise, name: buildNameObj(rawExercise.name) };
    innerCopy[exIndex] = exCopy;
    blockCopy.exercises = innerCopy;
    exercisesCopy[blockIndex] = blockCopy;

  } else {
    // === ejercicio a nivel raíz ===
    const rawExercise = exercisesCopy[blockIndex];
    const exCopy     = { ...rawExercise, name: buildNameObj(rawExercise.name) };
    exercisesCopy[blockIndex] = exCopy;
  }

  // 4) reensamblamos estado
  dayCopy.exercises = exercisesCopy;
  updatedDays[indexDay] = dayCopy;
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setCurrentDay(dayCopy);
  setIsEditing(true);
};

const handleSaveApprox = () => {
  saveApproxInternally(approxData);
  approxOverlayRef.current.hide();
  editingApproxIndex.current = null;
  setApproxData([{ reps: "", peso: "" }]);
  setUseCustomApproxTitle(false);
  setApproxTitleName("");
};

const removeApproxLine = i => {
  const arr = [...approxData];
  arr.splice(i,1);
  setApproxData(arr);
  saveApproxInternally(arr);
};

const hasApproximation = ex =>
  Array.isArray(ex.name?.approximations) &&
  ex.name.approximations.some(a => a.reps || a.peso);


  const handleShowMovility = () => {
    setMovilityVisible(true);
    setIsEditing(false);
  };

  // =================== FUNCIONES PARA BACK OFF ===================
 const handleOpenBackoffOverlay = (e, blockIndex, exIndex = null) => {
  // ahora editingBackoffIndex es un ref
  editingBackoffIndex.current = { blockIndex, exIndex };

  const currentExercise = exIndex != null
    ? day[indexDay].exercises[blockIndex].exercises[exIndex]
    : day[indexDay].exercises[blockIndex];

  // … resto exactamente igual …
  let currentBackoff = [{ sets: "", reps: "", peso: "" }];
  if (currentExercise && typeof currentExercise.name === 'object') {
    currentBackoff = Array.isArray(currentExercise.name.backoff)
      ? currentExercise.name.backoff
      : currentBackoff;
    if (currentExercise.name.titleName) {
      setUseCustomTitle(true);
      setBackoffTitleName(currentExercise.name.titleName);
    } else {
      setUseCustomTitle(false);
      setBackoffTitleName("");
    }
  }
  setBackoffData(currentBackoff);
  backoffOverlayRef.current.toggle(e);
};

const saveBackoffInternally = (lines) => {
  // 1) Sacamos blockIndex y exIndex de la ref
  const { blockIndex, exIndex } = editingBackoffIndex.current || {};
  if (blockIndex == null) return;

  // 2) Clonamos el día completo
  const updated = [...day];

  // 3) Dependiendo de exIndex escogemos el array correcto
  const targetArray = exIndex != null
    ? updated[indexDay].exercises[blockIndex].exercises   // dentro de un bloque
    : updated[indexDay].exercises;                        // al nivel raíz

  // 4) El índice concreto del ejercicio que editamos
  const idx = exIndex != null ? exIndex : blockIndex;
  const ex = targetArray[idx];

  // 5) Filtramos líneas vacías y construimos nameObj
  const cleaned = lines.filter(l => l.sets || l.reps || l.peso);
  let nameObj = typeof ex.name === 'object'
    ? { ...ex.name }
    : { name: ex.name };

  if (cleaned.length)      nameObj.backoff = cleaned;
  else                      delete nameObj.backoff;
  if (useCustomTitle && backoffTitleName.trim()) {
    nameObj.titleName = backoffTitleName.trim();
  } else {
    delete nameObj.titleName;
  }

  // 6) Asignamos al ejercicio
  ex.name = nameObj;

  // 7) Volvemos a escribir ese ejercicio en su sitio
  if (exIndex != null) {
    updated[indexDay].exercises[blockIndex].exercises[exIndex] = ex;
  } else {
    updated[indexDay].exercises[blockIndex] = ex;
  }

  // 8) Guardamos el estado
  setDay(updated);
  setModifiedDay(updated);
  setCurrentDay({ ...updated[indexDay] });
  setIsEditing(true);
};

const handleSaveBackoff = () => {
   // 1) guardo los cambios
   saveBackoffInternally(backoffData);
   // 2) cierro el panel
   backoffOverlayRef.current.hide();
   // 3) reseteo el índice de edición en el ref
   editingBackoffIndex.current = { blockIndex: null, exIndex: null };
   // 4) limpio los datos temporales del overlay
   setBackoffData([{ sets: "", reps: "", peso: "" }]);
   setUseCustomTitle(false);
   setBackoffTitleName("");
 };
  const removeBackoffLine = (index) => {
    const updated = [...backoffData];
    updated.splice(index, 1);
    setBackoffData(updated);
    saveBackoffInternally(updated);
  };

const hasBackoff = ex =>
  Array.isArray(ex.name?.backoff) &&
  ex.name.backoff.some(b => b.sets || b.reps || b.peso);


  /**  re-enumerar los ejercicios después de arrastrar y soltar. **/
  const reorderExercises = (exercisesArray) => {
    return exercisesArray.map((ex, idx) => {
      return { ...ex, numberExercise: idx + 1 };
    });
  };

  /** Función que se llama cuando el drag termina. Reordena la lista y actualiza el estado. */
  

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

function RestInputDropdown({ value = "03:15", onChange }) {
  const minutes = Array.from({ length: 10 }, (_, i) => i + 1);
  const seconds = [15, 30, 45];
  const options = minutes.flatMap(m =>
    seconds.map(s => `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
  );

  const [val, setVal] = useState(() => formatForDisplay(value));
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setVal(formatForDisplay(value));
  }, [value]);

  function formatForDisplay(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    const mm = digits.slice(0,2);
    const ss = digits.slice(2,4);
    return `${mm}:${ss}`;
  }

  const onInputChange = e => {
    setVal(formatForDisplay(e.target.value));
  };

  const onComplete = e => {
    const q = e.query.trim();
    setSuggestions(
      q === "" 
        ? options 
        : options.filter(opt => opt.startsWith(q))
    );
  };

  const formatAndEmit = raw => {
    let [m='', s=''] = raw.split(':');
    m = m.replace(/\D/g,''); s = s.replace(/\D/g,'');
    if (!m) m = '00'; if (m.length===1) m = '0'+m;
    if (!s) s = '00'; if (s.length===1) s = '0'+s;
    const formatted = `${m}:${s}`;
    setVal(formatted);
    onChange(formatted);
  };

  return (
    <PrimeAutoComplete
      dropdown
      value={val}
      suggestions={suggestions}
      completeMethod={onComplete}
      onChange={e => setVal(e.value)}
      onSelect={e => formatAndEmit(e.value)}
      onBlur={() => formatAndEmit(val)}
      placeholder="MM:SS"
      className="form-control form-control-sm"
    />
  );
}

const restOptions = Array.from({ length: 10 }, (_, i) => i + 1)
  .flatMap(m => [15,30,45].map(s => {
    const mm = String(m).padStart(2,'0');
    const ss = String(s).padStart(2,'0');
    return { label: `${mm}:${ss}`, value: `${mm}:${ss}` };
  }));

  const customInputEditDay = (data, index, field, blockIndex = null) => {

      const applyChange = (value) => {
        blockIndex != null
          ? changeBlockExerciseData(blockIndex, index, field, value)
          : changeModifiedData(index, value, field);
      };

   if (field === "sets" ) {
      return (
        <>
        {renderInputSets ? 
        <CustomInputNumber
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          initialValue={data}
          onChange={value => applyChange(value)}
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
          onChange={value => applyChange(value)}
          isRep={field === "reps"}
          className={`mt-5`}
          onActivate={() => onActivateTextMode()}
        /> :
        <>
          <div className={`row justify-content-center text-center aa ${field == 'reps' && 'mt-4 '}`}>
            <div className={`input-number-container mb-1`}>
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

             <div className={`text-center px-0`}>
                              <SelectButton
                                className={`styleSelectButton px-0`}
                                options={[
                                  { label: 'Texto', value: 'text' },
                                  { label: 'Múltiple', value: 'multiple' }
                                ]}
                              />
                            </div> 
                    
          </div>

          </>
        }
        </>
      );}
       else if (field === "video") {
  // clave única por bloque+ejercicio o por ejercicio simple
  const refKey = blockIndex != null ? `b-${blockIndex}-e-${index}` : `s-${index}`;

  // setter exclusivo para isImage
  const setIsImage = (checked) => {
    if (blockIndex != null) {
      changeBlockExerciseData(blockIndex, index, "isImage", checked);
    } else {
      changeModifiedData(index, checked, "isImage");
    }
  };

  // valor actual de isImage según sea bloque o ejercicio simple
  const currentIsImage =
    blockIndex != null
      ? !!day[indexDay]?.exercises?.[blockIndex]?.exercises?.[index]?.isImage
      : !!day[indexDay]?.exercises?.[index]?.isImage;

  return (
    <>
      <IconButton
        aria-label="video"
        className={`w-100 ${glowVideo[refKey] ? "glowing-icon" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          productRefsSimple.current[refKey]?.toggle(e);
        }}
      >
        <YouTubeIcon className="colorIconYoutube largoIconYt" />
      </IconButton>

      <OverlayPanel ref={(el) => (productRefsSimple.current[refKey] = el)}>
        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={`checkbox-image-${refKey}`}
              checked={currentIsImage}
              onChange={(e) => setIsImage(e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`checkbox-image-${refKey}`}>
              ¿Es una imagen?
            </label>
            <span className="d-block textSpanVideo">
              Si tildás esta opción, e ingresas un link de una imagen, tu alumno la verá.
            </span>
          </div>
        </div>

        <input
          ref={(el) => (inputRefs.current[`${refKey}-${field}`] = el)}
          className="form-control ellipsis-input text-center"
          type="text"
          defaultValue={data}
          onChange={(e) => {
            if (blockIndex != null) {
              // 🔧 dentro de bloque: actualiza SOLO ese ejercicio
              changeBlockExerciseData(blockIndex, index, "video", e.target.value);
            } else {
              // ejercicio simple
              changeModifiedData(index, e.target.value, "video");
            }
          }}
        />
      </OverlayPanel>
    </>
  );
} else if (field === "notas") {
      return (
        <InputTextarea
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          className={`w-100 mt-2 pt-1`}
          autoResize
          defaultValue={data}
          onChange={e => applyChange(e.target.value)}
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
            className={'text-center'}
            hideSeconds={seconds => seconds % 15 !== 0}
            onChange={e => {
              const mm = String(e.getMinutes()).padStart(2, "0");
              const ss = String(e.getSeconds()).padStart(2, "0");
              applyChange(`${mm}:${ss}`);                    // <— y también aquí
            }}
          />
        </CustomProvider>
      );
    } else {
      return (
        <div className="row justify-content-center text-center">
        <input
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          className={`form-control ${firstWidth > 992 ? 'stylePesoInput' : 'stylePesoInputMobile'} text-center`}
          placeholder={ field === 'rest' ? `2...`: "kg..."}
          type="text"
          defaultValue={data}
          onChange={e => applyChange(e.target.value)}
        />
        </div>
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
   const nameString = typeof exercise.name === 'object'
     ? exercise.name.name
     : exercise.name;
   setExerciseToDelete({ exercise_id: exercise.exercise_id, name: nameString })
    setShowDeleteDialog(true)
}

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

  const BLOCK_PALETTE = [
  '#e74c3c', '#9b0101ff', '#8f0b84ff', '#1d8122ff',
  '#007585ff', '#3f51b5', '#673ab7', '#3e5058ff'
];

const BlockColorDot = ({ color, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="border-0 p-0 me-2"
    style={{
      width: 18, height: 18, borderRadius: '50%',
      background: color,
      outline: active ? '2px solid #fff' : '2px solid rgba(255,255,255,.7)',
      boxShadow: active ? '0 0 0 2px rgba(0,0,0,.15)' : 'none',
      cursor: 'pointer'
    }}
    aria-label={`Color ${color}`}
  />
);

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
    const updatedDays = [...modifiedDay];  
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
    setAllDays(updatedDays);
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

   // ======== COPY / PASTE DÍA ========
 const copyDayToClipboard = () => {
   const src = day?.[indexDay];
   if (!src) {
     Notify.instantToast("No hay día seleccionado");
     return;
   }
   try {
     const json = JSON.stringify(src);
     localStorage.setItem("copiedDay", json);
     setDayClipboard(json);
     Notify.instantToast("Día copiado con éxito!");
   } catch (e) {
     console.error("Error al copiar día:", e);
     Notify.instantToast("Error al copiar el día");
   }
 };

 // Clona un ejercicio simple (suelto)
 const cloneSimpleExercise = (ex) => {
   const { exercise_id, ...rest } = ex || {};
   return { ...rest, exercise_id: new ObjectId().toString() };
 };

 // Clona un objeto de circuito (raíz o dentro de bloque)
 const cloneCircuit = (ex) => {
   const { exercise_id, circuit = [], ...rest } = ex || {};
   const newCircuit = Array.isArray(circuit)
     ? circuit.map(item => ({ ...item, idRefresh: RefreshFunction.generateUUID() }))
     : [];
   return { ...rest, exercise_id: new ObjectId().toString(), circuit: newCircuit };
 };

 // Decide cómo clonar un elemento (bloque / ejercicio / circuito)
 const cloneAnyExerciseOrStructure = (el) => {
   if (!el) return el;
   if (el.type === 'block') return cloneBlock(el);
   if (Array.isArray(el.circuit)) return cloneCircuit(el);
   return cloneSimpleExercise(el);
 };

 // Clona un bloque con todos sus ejercicios internos
const cloneBlock = (block) => {
  const { block_id, numberExercise, exercises = [], ...rest } = block || {};
  const clonedInner = exercises.map(inner => cloneAnyExerciseOrStructure(inner));

  // Re-enumerar sólo los hijos del bloque, no el bloque en sí
  clonedInner.forEach((it, idx) => {
    if (it.numberExercise == null || it.numberExercise === '') {
      it.numberExercise = `${idx + 1}`;
    }
  });

  return {
    ...rest,                 // conserva color, nombre, etc.
    type: 'block',           // asegura el tipo
    block_id: new ObjectId().toString(),
    exercises: clonedInner
  };
};

const sanitizeDayForPaste = (srcDay, nextIndexNumber) => {
  const { _id: _omit, exercises = [] } = srcDay || {};
  const clonedExercises = exercises.map(el => cloneAnyExerciseOrStructure(el));

  // 👉 No numerar bloques
  clonedExercises.forEach((it, idx) => {
    if (it?.type === 'block') {
      delete it.numberExercise;      // por si venía con número
    } else if (!it?.numberExercise) {
      it.numberExercise = `${idx + 1}`;
    }
  });

  return {
    _id: new ObjectId().toString(),
    name: `Día ${nextIndexNumber}`,
    lastEdited: new Date().toISOString(),
    exercises: clonedExercises
  };
};

 const pasteDayFromClipboard = () => {
   const raw = dayClipboard || localStorage.getItem("copiedDay");
   if (!raw) {
     Notify.instantToast("No hay un día copiado");
     return;
   }
   try {
     const src = typeof raw === "string" ? JSON.parse(raw) : raw;
     const updatedDays = [...modifiedDay];
     const newDay = sanitizeDayForPaste(src, updatedDays.length + 1);
     updatedDays.push(newDay);
     setAllDays(updatedDays);
     setDay(updatedDays);
     setModifiedDay(updatedDays);
     setCurrentDay(newDay);
     setIndexDay(updatedDays.length - 1);
     setIsEditing(true);
     Notify.instantToast("Día pegado con éxito!");
   } catch (e) {
     console.error("Error al pegar día:", e);
     Notify.instantToast("Contenido copiado inválido");
   }
 };
 // ======== FIN COPY / PASTE DÍA ========

  const addNewDay = () => {
  // ⇨ Partimos de modifiedDay (no de allDays)
  const updatedDays = [...modifiedDay];

  const nextDayIndex = updatedDays.length + 1;
  const newDay = {
    _id: new ObjectId().toString(),
    name: `Día ${nextDayIndex}`,
    lastEdited: new Date().toISOString(),
    exercises: [],
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


// Borra un ejercicio particular dentro de un circuito en un bloque
const removeExerciseFromBlockCircuit = (blockIndex, circuitIndex, exIndex) => {
  setIsEditing(true);
  const updated = [...day];
  const block = updated[indexDay].exercises[blockIndex];
  block.exercises[circuitIndex].circuit.splice(exIndex, 1);
  updated[indexDay].lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
};

function handleDeleteCircuitInBlock(blockIndex, circuitIndex, name) {
  setCircuitToDelete({ blockIndex, circuitIndex, name });
  setShowDeleteCircuitDialog(true);
}

function confirmDeleteCircuitInBlock() {
  const { blockIndex, circuitIndex } = circuitToDelete;
  const updated = [...day];
  const block = updated[indexDay].exercises[blockIndex];
  block.exercises.splice(circuitIndex, 1);
  updated[indexDay].lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
  setShowDeleteCircuitDialog(false);
  Notify.instantToast(`${circuitToDelete.name} eliminado con éxito`);
  setCircuitToDelete(null);
}

const handleDeleteBlockClick = (blockIndex, blockName) => {
  setBlockToDelete({ index: blockIndex, name: blockName });
  setShowDeleteBlockDialog(true);
};

// Cuando el usuario confirma que quiere borrar
const confirmDeleteBlock = () => {
  setIsEditing(true);
  const updatedDays = [...day];
  // filtrar el bloque por índice
  updatedDays[indexDay].exercises = updatedDays[indexDay].exercises.filter(
    (_, i) => i !== blockToDelete.index
  );
  updatedDays[indexDay].lastEdited = new Date().toISOString();

  // sincronizar todos los estados
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setAllDays(updatedDays);

  Notify.instantToast(`Bloque "${blockToDelete.name}" eliminado con éxito`);

  // limpiar diálogo
  setShowDeleteBlockDialog(false);
  setBlockToDelete({ index: null, name: "" });
};

const AddNewCircuit = (blockIndex = null, kind = 'Libre') => {
  setIsEditing(true);
  const base = circuitDefaults(kind);
  const updated = [...day];
  const newCircuit = {
    exercise_id: new ObjectId().toString(),
    numberExercise: 0, // se setea abajo
    circuitKind: kind,
    type: '',          // sigue disponible para "Libre" (título)
    typeOfSets: '',
    notas: '',
    circuit: [{ name: "", reps: 1, peso: "0", video: "", idRefresh: RefreshFunction.generateUUID() }],
    ...base
  };

  if (blockIndex == null) {
    const nextNumber = updated[indexDay].exercises.length + 1;
    updated[indexDay].exercises.push({ ...newCircuit, numberExercise: nextNumber });
  } else {
    const block = updated[indexDay].exercises[blockIndex];
    const nextNumber = (block.exercises?.length || 0) + 1;
    block.exercises.push({ ...newCircuit, numberExercise: nextNumber });
  }

  updated[indexDay].lastEdited = new Date().toISOString();
  setDay(updated); setModifiedDay(updated); setCurrentDay(updated[indexDay]);
  Notify.instantToast(kind === 'Libre' ? "Circuito (Libre) añadido" : `Circuito ${kind} añadido`);
};

function handleDeleteExerciseInCircuit(blockIndex, circuitIndex, exerciseIndex, exerciseName) {
  setExerciseToDeleteInCircuit({ blockIndex, circuitIndex, exerciseIndex, exerciseName });
  setShowDeleteExerciseInCircuitDialog(true);
}

function confirmDeleteExerciseInCircuit() {
const { blockIndex, circuitIndex, exerciseIndex } = exerciseToDeleteInCircuit;
const updated = [...day];
const block = updated[indexDay].exercises[blockIndex];
block.exercises[circuitIndex].circuit.splice(exerciseIndex, 1);
updated[indexDay].lastEdited = new Date().toISOString();
setDay(updated);
setModifiedDay(updated);
Notify.instantToast(`${exerciseToDeleteInCircuit.exerciseName} eliminado con éxito`);
setShowDeleteExerciseInCircuitDialog(false);
setExerciseToDeleteInCircuit(null);
}

const CircuitHeaderEditor = ({
  circuit,
  onField,
  showNumber = false,
  numberValue,
  onNumberChange,
  numberOptions = []
}) => {
  const kind = circuit?.circuitKind ?? 'Libre';
  const set = (k, v) => onField(k, v);

  // Compacta mm:ss
  const MMSS = ({ valueSec = 0, onChange }) => (
    <CustomProvider locale={customLocale}>
      <TimePicker
        format="mm:ss"
        defaultValue={parseToDateForTimePicker(fmtMMSS(valueSec))}
        ranges={[]}
        editable
        hideSeconds={() => false}
        className="form-control form-control-sm p-0 border-0"
        onChange={(date) => {
          if (!date) return onChange(0);
          onChange(toSec(date.getMinutes(), date.getSeconds()));
        }}
      />
    </CustomProvider>
  );

  // ============= Inline editors (compactos) =============
  const DesktopInline = () => {
    // inputs cortos reutilizables
    const SmallNum = ({ value, onChange, min = 1, title }) => (
      <input
        type="number"
        min={min}
        className="form-control form-control-sm text-center"
        style={{ width: 64 }}
        value={value}
        title={title}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value || `${min}`, 10)))}
      />
    );

    switch (kind) {
      case 'AMRAP':
        return (
                    <div>
            <div>
            <span className="small fs07em text-muted">Mins</span>
            <MMSS valueSec={circuit.durationSec || 0} onChange={(v) => set('durationSec', v)} />
          </div></div>
        )

      case 'EMOM':
      case 'E2MOM':
      case 'E3MOM': {
        // Mostramos “Total (min)” como en el mockup
        const interval =
          kind === 'EMOM' ? (circuit.intervalMin || 1) : (kind === 'E2MOM' ? 2 : 3);
        return (
          <div className="d-flex align-items-center gap-2">
            {kind === 'EMOM' && (
              <>
            <div>
              <span className="small text-muted fs07em">Intervalo</span>
                  <SmallNum
                    value={interval}
                    onChange={(v) => set('intervalMin', v)}
                    min={1}
                    title="Intervalo (min)"
                  />
              </div>
              <span className="small text-muted fs07em mt-3">x</span>
              </>
            )}
            <div>
              <span className="small text-muted fs07em">Mins</span>
              <SmallNum
                value={circuit.totalMinutes || interval * (circuit.totalRounds || 1)}
                onChange={(tot) => {
                  set('totalMinutes', tot);
                  set('totalRounds', Math.max(1, Math.round(tot / interval)));
                }}
                min={1}
                title="Total (min)"
              />
            </div>
          </div>
        );
      }

      case 'Intermitentes':
        return (
          <div className="d-flex align-items-center gap-2 m-auto">
            <div className="m-auto">
              
            <span className="small fs07em text-muted">Work</span>
            <SmallNum
              value={circuit.workSec || 30}
              onChange={(v) => set('workSec', v)}
              title="Trabajo (s)"
            />
            
            </div>
            <span className="mt-3">/</span>
            <div>
              <span className="small fs07em text-muted">Rest</span>
              <SmallNum
                value={circuit.restSec || 30}
                onChange={(v) => set('restSec', v)}
                title="Descanso (s)"
              />
               </div>
            <span className="small text-muted mt-3">×</span>
            <div>
              <span className="small fs07em text-muted">Rounds</span>
              <SmallNum
                value={circuit.totalRounds || 10}
                onChange={(v) => set('totalRounds', v)}
                title="Rondas"
              />
             </div>
          </div>
        );

      case 'Por tiempo':
        return (
          <div>
            <div>
            <span className="small fs07em text-muted">Mins</span>
            <MMSS valueSec={circuit.timeCapSec || 0} onChange={(v) => set('timeCapSec', v)} />
          </div></div>
        )

      case 'Tabata':
        return (
          <div className="d-flex align-items-center gap-2">
           <div>
            <span className="small text-muted fs07em">Work</span>
              <SmallNum
                value={circuit.workSec ?? 20}
                onChange={(v) => set('workSec', v)}
                title="Trabajo (s)"
              />
            </div>
            <span className="mt-3">/</span>
            <div>
            <span className="small text-muted fs07em">Rest</span>
              <SmallNum
                value={circuit.restSec ?? 10}
                onChange={(v) => set('restSec', v)}
                title="Descanso (s)"
              />
            </div>
            <span className="small text-muted mt-3">×</span>
            <div>
            <span className="small text-muted fs07em">Rounds</span>
              <SmallNum
                value={circuit.totalRounds ?? 8}
                onChange={(v) => set('totalRounds', v)}
                title="Rondas"
              />
            </div>
          </div>
        );

      default: // Libre
        return (
          <div>
            <span className="small text-muted fs07em">Mins / vueltas</span>
          <input
            className="form-control form-control-sm"
            defaultValue={circuit.typeOfSets || ''}
            onBlur={(e) => set('typeOfSets', e.target.value)}
            style={{ width: 160 }}
          />
          </div>
        );
    }
  };

  const MobileInline = () => (
    <div className="d-flex align-items-center gap-2">
      <span>–</span>
      <DesktopInline />
    </div>
  );

  // ============= Render =============
  return (
    <>
      {/* DESKTOP (>= md):  número + select modo + “–” + inline + Notas a la derecha */}
      <div className="d-none d-md-flex align-items-center gap-3">
     
          <div style={{ minWidth: 72 }}>
            <Dropdown
              value={numberValue}
              options={numberOptions}
              optionLabel="label"
              onChange={(e) => onNumberChange(e.value)}
              className="p-dropdown-group w-100"
            />
          </div>
        
       
        <div>
          <span className="small text-muted fs07em">Tipo de circuito</span>
            <select
            className="form-select form-select-sm w-auto"
            value={kind}
            onChange={(e) => set('circuitKind', e.target.value)}
          >
            {CIRCUIT_KINDS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>


        <div className="d-flex align-items-center gap-2">
          <span className="mt-3">–</span>
          <DesktopInline />
        </div>

        <div className="ms-auto mt-3" style={{ minWidth: 280 }}>
          <input
            className="form-control form-control-sm"
            placeholder="Notas"
            defaultValue={circuit.notas || ''}
            onBlur={(e) => onField('notas', e.target.value)}
          />
        </div>
      </div>

      {/* MOBILE (< md): mismo orden, en bloques */}
      <div className="d-md-none">
  <div className="d-flex align-items-center gap-2 mb-2">
    {showNumber && (
      <div style={{ minWidth: 72 }}>
        <Dropdown
          value={numberValue}
          options={numberOptions}
          optionLabel="label"
          onChange={(e) => onNumberChange(e.value)}
          className="p-dropdown-group w-100"
          appendTo={document.body}
        />
      </div>
    )}

    {/* ⬇️ ANTES: dropdown de ejercicios del circuito
        AHORA: dropdown de KIND del circuito */}
    <div style={{ minWidth: 200 }}>
      <Dropdown
        value={kind}                                   // <- usa el kind actual
        options={CIRCUIT_KINDS}                        // <- AMRAP, EMOM, E2MOM, etc
        optionLabel="label"
        optionValue="value"
        onChange={(e) => onField('circuitKind', e.value)} // <- dispara el cambio
        appendTo={document.body}
        className="p-dropdown-group w-100"
        placeholder="Tipo de circuito"
      />
    </div>
  </div>

  <MobileInline />

  <div className="mt-2">
    <InputTextarea
      autoResize
      placeholder="Notas"
      defaultValue={circuit.notas || ''}
      onChange={(e) => onField('notas', e.target.value)}
      className="w-100"
    />
  </div>
</div>
    </>
  );
};


const AddExerciseToCircuit = (circuitIndex, blockIndex = null) => {
  setIsEditing(true);
  const updated = [...day];
  const dayCopy = updated[indexDay];

  const newExercise = { name:"", reps:0, peso:"0", video:"", idRefresh:RefreshFunction.generateUUID() };

  if (blockIndex == null) {
    dayCopy.exercises[circuitIndex].circuit.push(newExercise);
  } else {
    const block = dayCopy.exercises[blockIndex];
    block.exercises[circuitIndex].circuit.push(newExercise);
  }

  dayCopy.lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
  Notify.instantToast("Ejercicio añadido al circuito!");
};


  const customInputEditCircuit = (data, circuitIndex, field, blockIndex = null) => {
  const onChange = (e) => {
    const value = e.target.value;
    if (blockIndex != null) {
      // circuito dentro de un bloque
      changeBlockCircuitData(blockIndex, circuitIndex, field, value);
    } else {
      // circuito a nivel raíz
      changeCircuitData(circuitIndex, field, value);
    }
    setIsEditing(true);
  };

  if(field === "numberExercise"){
    return (
      <Dropdown
        value={data}
        options={options}
        onChange={onChange}
        className="p-dropdown-group w-100"
      />
    )
  } else if (field === "notas") {
    return (
      <div className="row justify-content-center">

      <InputTextarea
        ref={el => inputRefs.current[`${blockIndex ?? ""}-${circuitIndex}-${field}`] = el}
        className="textAreaResize"
        autoResize
        defaultValue={data}
        onChange={onChange}
      />
      
      </div>
    );
  }

  // resto de campos (type, typeOfSets, name...)
  return (
    <input
      ref={el => inputRefs.current[`${blockIndex ?? ""}-${circuitIndex}-${field}`] = el}
      className="form-control ellipsis-input text-center"
      type="text"
      defaultValue={data}
      placeholder={field === 'type' ? 'Amrap / emom ...' : undefined}
      onChange={onChange}
    />
  );
};


const changeCircuitData = (circuitIndex, field, value) => {
  setIsEditing(true);

  const updated = [...day];
  const dayCopy = { ...updated[indexDay] };
  const exs = [...dayCopy.exercises];
  const circuit = { ...exs[circuitIndex] };

  let next = circuit;

  if (field === 'circuitKind') {
    next = applyCircuitKindChange(circuit, value);
  } else {
    next = { ...circuit, [field]: value };
  }

  exs[circuitIndex] = next;
  updated[indexDay] = { ...dayCopy, exercises: exs, lastEdited: new Date().toISOString() };

  setDay(updated);
  setModifiedDay(updated);
  setCurrentDay(updated[indexDay]);
};

const changeBlockCircuitData = (blockIndex, circuitIndex, field, value) => {
  setIsEditing(true);

  const updated = [...day];
  const dayCopy = { ...updated[indexDay] };
  const blocks = [...dayCopy.exercises];
  const block = { ...blocks[blockIndex] };
  const inner = [...block.exercises];
  const circuit = { ...inner[circuitIndex] };

  let next = circuit;

  if (field === 'circuitKind') {
    next = applyCircuitKindChange(circuit, value);
  } else {
    next = { ...circuit, [field]: value };
  }

  inner[circuitIndex] = next;
  block.exercises = inner;
  blocks[blockIndex] = block;

  updated[indexDay] = { ...dayCopy, exercises: blocks, lastEdited: new Date().toISOString() };

  setDay(updated);
  setModifiedDay(updated);
  setCurrentDay(updated[indexDay]);
};

// === CAMPOS ESPECÍFICOS POR MODO ===
const KIND_FIELDS = [
  'durationSec',        // AMRAP
  'intervalMin',        // EMOMs
  'totalRounds',
  'totalMinutes',
  'workSec',            // Intermitentes/Tabata
  'restSec',
  'timeCapSec',         // Por tiempo
  'typeOfSets'          // Libre
];

// Limpia todos los campos específicos antes de aplicar defaults del nuevo modo
const stripKindSpecificFields = (obj = {}) => {
  const clone = { ...obj };
  KIND_FIELDS.forEach(k => { delete clone[k]; });
  return clone;
};

// Aplica cambio de modo: limpia campos + setea defaults del modo nuevo
const applyCircuitKindChange = (circuit = {}, nextKind = 'Libre') => {
  const base = stripKindSpecificFields(circuit);
  return {
    ...base,
    circuitKind: nextKind,
    ...(circuitDefaults(nextKind) || {})
  };
};

  const changeExerciseInBlockCircuit = (blockIndex, circuitIndex, exIndex, field, value) => {
  setIsEditing(true);
  const updated = [...day];
  const block = updated[indexDay].exercises[blockIndex];
  const circuitExercises = block.exercises[circuitIndex].circuit;
  circuitExercises[exIndex] = {
    ...circuitExercises[exIndex],
    [field]: value
  };
  updated[indexDay].lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
};

const changeExerciseInCircuit = (circuitIndex, exIndex, field, value) => {
  setIsEditing(true);
  const updated = [...day];
  const rootCircuit = updated[indexDay].exercises[circuitIndex].circuit;
  rootCircuit[exIndex] = {
    ...rootCircuit[exIndex],
    [field]: value
  };
  updated[indexDay].lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
};


  const customInputEditExerciseInCircuit = (
  data,
  circuitIndex,
  exIndex,
  field,
  repsValue,
  blockIndex = null
) => {
  const apply = (val) => {
    if (blockIndex != null) {
      changeExerciseInBlockCircuit(blockIndex, circuitIndex, exIndex, field, val);
    } else {
      changeExerciseInCircuit(circuitIndex, exIndex, field, val);
    }
    setIsEditing(true);
  };

  const key = `${blockIndex ?? ""}-${circuitIndex}-${exIndex}-${field}`;

  if (field === "video") {
    return (
      <>
        <IconButton onClick={e => {
          productRefsCircuit.current[key].toggle(e);
        }}>
          <YouTubeIcon className="colorIconYoutube" />
        </IconButton>
        <OverlayPanel ref={el => productRefsCircuit.current[key] = el}>
          <input
            ref={el => inputRefs.current[key] = el}
            className="form-control ellipsis-input text-center"
            type="text"
            defaultValue={data}
            onBlur={e => apply(e.target.value)}
          />
        </OverlayPanel>
      </>
    );
  }

  if (field === "reps") {
    return (
      <CustomInputNumber
        ref={el => inputRefs.current[key] = el}
        initialValue={data}
        onChange={apply}
        isRep
        className="mt-0"
      />
    );
  }

  if (field === "name") {
    return (
      <AutoComplete
        defaultValue={data}
        onChange={apply}
      />
    );
  }

  // peso u otros
  return (
    <div className="row justify-content-center text-center">
    <input
      ref={el => inputRefs.current[key] = el}
      className="form-control ellipsis-input text-center stylePesoInput"
      type="text"
      defaultValue={data}
      onBlur={e => apply(e.target.value)}
    />
    </div>
  );
};
  

const deleteCircuit = (circuitIndex) => {
  setIsEditing(true);
  const updatedDays = [...day];
  const removed = updatedDays[indexDay].exercises.splice(circuitIndex, 1)[0];

  setDay(updatedDays);
  setModifiedDay(updatedDays);

  const label = circuitSubtitle(removed || {});
  Notify.instantToast(`${label} eliminado con éxito`);
};

// === NUEVO: tipos de circuito ===
const CIRCUIT_KINDS = [
  { label: 'Libre', value: 'Libre' },
  { label: 'AMRAP', value: 'AMRAP' },
  { label: 'EMOM', value: 'EMOM' },
  { label: 'E2MOM', value: 'E2MOM' },
  { label: 'E3MOM', value: 'E3MOM' },
  { label: 'Intermitentes', value: 'Intermitentes' },
  { label: 'Por tiempo', value: 'Por tiempo' },
  { label: 'Tabata', value: 'Tabata' },
];

const toSec = (mm = 0, ss = 0) => mm * 60 + ss;
const fromSec = (sec = 0) => {
  const m = Math.floor((+sec || 0) / 60);
  const s = (+sec || 0) % 60;
  return { m, s };
};
const fmtMMSS = (sec = 0) => {
  const { m, s } = fromSec(sec);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

// defaults por tipo
const circuitDefaults = kind => {
  switch (kind) {
    case 'AMRAP':         return { durationSec: toSec(12,0) };
    case 'EMOM':          return { intervalMin: 1, totalRounds: 12, totalMinutes: 12 };
    case 'E2MOM':         return { intervalMin: 2, totalRounds: 8,  totalMinutes: 16 };
    case 'E3MOM':         return { intervalMin: 3, totalRounds: 6,  totalMinutes: 18 };
    case 'Intermitentes': return { workSec: 30, restSec: 30, totalRounds: 10 };
    case 'Por tiempo':    return { timeCapSec: toSec(20,0) };
    case 'Tabata':        return { workSec: 20, restSec: 10, totalRounds: 8 };
    default:              return {}; // Libre
  }
};

// Subtítulo UX (se muestra al usuario)
const circuitSubtitle = c => {
  const kind = c?.circuitKind || 'Libre';
  switch (kind) {
    case 'AMRAP':         return `AMRAP – ${fmtMMSS(c.durationSec||0)}`;
    case 'EMOM':          return `EMOM – ${String(c.intervalMin||1)}:00 × ${c.totalRounds||0}`;
    case 'E2MOM':         return `E2MOM – 2:00 × ${c.totalRounds||0}`;
    case 'E3MOM':         return `E3MOM – 3:00 × ${c.totalRounds||0}`;
    case 'Intermitentes': return `Intermitentes – ${(c.workSec||0)}:${String(c.restSec||0).padStart(2,'0')} × ${c.totalRounds||0}`;
    case 'Por tiempo':    return `For time – CAP ${fmtMMSS(c.timeCapSec||0)}`;
    case 'Tabata':        return `Tabata – ${(c.workSec||20)}:${String(c.restSec||10).padStart(2,'0')} × ${c.totalRounds||8}`;
    default:              return `Libre${c.typeOfSets ? ' – ' + c.typeOfSets : ''}`;
  }
};

// Upgrader: deja cualquier circuito viejo en "Libre" y agrega campos faltantes
const upgradeCircuitShape = (c) => {
  if (!Array.isArray(c?.circuit)) return c;
  const upgraded = { circuitKind: 'Libre', ...c };
  return upgraded;
};
const upgradeWeekShape = (days) =>
  (days||[]).map(d => ({
    ...d,
    exercises: (d.exercises||[]).map(el => {
      if (el?.type === 'block') {
        return {
          ...el,
          exercises: (el.exercises||[]).map(x => upgradeCircuitShape(x))
        };
      }
      return upgradeCircuitShape(el);
    })
  }));







  const incrementAllSeries = () => {
      const updatedDays = day.map((dayItem, idx) => {
    if (idx !== indexDay) return dayItem;
    return {
      ...dayItem,
      exercises: dayItem.exercises.map(el => {
        if (el.type === 'exercise') {
          // ejercicio suelto
          return { ...el, sets: (el.sets||0) + 1 };
        }
        if (el.type === 'block') {
          // bloque: actualizamos todos sus ejercicios internos
          return {
            ...el,
            exercises: el.exercises.map(inner => ({
              ...inner,
              sets: (inner.sets||0) + 1
            }))
          };
        }
        return el;
      })
    };
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
  // bump sabe subir reps según su tipo
  const bump = repsVal => {
    // 1) Si es array (modo múltiple), clonar y sumar 1 al último
    if (Array.isArray(repsVal)) {
      const newArr = [...repsVal];
      const last = parseInt(newArr[newArr.length - 1], 10) || 0;
      newArr[newArr.length - 1] = last + 1;
      return newArr;
    }

    // 2) Si es string no numérica (modo texto), devolver tal cual
    if (typeof repsVal === 'string' && isNaN(Number(repsVal))) {
      return repsVal;
    }

    // 3) En cualquier otro caso (número o string numérico), sumar 1
    const n = parseInt(repsVal, 10) || 0;
    return n + 1;
  };

  const updatedDays = day.map((dayItem, idx) => {
    if (idx !== indexDay) return dayItem;
    return {
      ...dayItem,
      exercises: dayItem.exercises.map(ex => {
        if (ex.type === 'exercise') {
          return { ...ex, reps: bump(ex.reps) };
        }
        if (ex.type === 'block') {
          return {
            ...ex,
            exercises: ex.exercises.map(inner => ({
              ...inner,
              reps: bump(inner.reps)
            }))
          };
        }
        return ex;
      })
    };
  });

  setIsEditing(true);
  setDay(updatedDays);
  setModifiedDay(updatedDays);

  // También sincronizamos allDays
  const updatedAllDays = [...allDays];
  updatedAllDays[indexDay] = updatedDays[indexDay];
  setAllDays(updatedAllDays);

  // Forzar re-render de inputs si usas renderInputReps
  setRenderInputReps(false);
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

  
 const changeBlockExerciseData = (blockIndex, exIndex, field, value) => {
   setIsEditing(true);
   // 1) Clone superficial del array de días
   const updatedDays = [...day];
   const block = updatedDays[indexDay].exercises[blockIndex];

   // 2) Clonar el ejercicio a modificar
   const oldEx = block.exercises[exIndex];
   const newEx = { ...oldEx };

   if (field === 'name') {
     // 3) Si el nombre venía como objeto (con aproximaciones/backoff), preservamos esas propiedades:
     if (typeof oldEx.name === 'object' && oldEx.name !== null) {
       newEx.name = { ...oldEx.name, name: value };
     } else {
       newEx.name = value;
     }
   } else {
     // 4) Resto de campos (sets, reps, video, notas, etc.) se asignan normalmente
     newEx[field] = value;
   }

   // 5) Reemplazamos el ejercicio en su sitio
   block.exercises[exIndex] = newEx;

   // 6) Actualizamos el día y el estado global
   updatedDays[indexDay].lastEdited = new Date().toISOString();
   setDay(updatedDays);
   setModifiedDay(updatedDays);
   setCurrentDay(updatedDays[indexDay]);
 };

// Elimina un ejercicio de un bloque
const removeExerciseFromBlock = (blockIndex, exerciseId) => {
  setIsEditing(true);
  const updatedDays = [...day];
  const block = updatedDays[indexDay].exercises[blockIndex];
  block.exercises = block.exercises.filter(ex => ex.exercise_id !== exerciseId);
  updatedDays[indexDay].lastEdited = new Date().toISOString();
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setCurrentDay(updatedDays[indexDay]);
};

  function syncUpdatedExercises(updated) {
  const newDays = [...day];
  newDays[indexDay].exercises = updated;
  setDay(newDays);
  setModifiedDay(newDays);
  setIsEditing(true);
}

// Añade un ejercicio dentro de un bloque dado su índice en el array
const addExerciseToBlock = (blockIndex) => {
  setIsEditing(true);
  const updatedDays = [...day];
  const block = updatedDays[indexDay].exercises[blockIndex];
  const nextNum = block.exercises.length + 1;
  const newEx = {
    exercise_id: new ObjectId().toString(),
    type: 'exercise',
    numberExercise: nextNum,
    name: '',
    reps: 1,
    sets: 1,
    peso: '',
    rest: '',
    video: '',
    notas: '',
  };
  block.exercises.push(newEx);
  updatedDays[indexDay].lastEdited = new Date().toISOString();
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setCurrentDay(updatedDays[indexDay]);
  Notify.instantToast("Ejercicio añadido al bloque");
};

// Edita campo name/color de un bloque
const changeBlockData = (blockIndex, field, value) => {
  setIsEditing(true);
  const updatedDays = [...day];
  const block = updatedDays[indexDay].exercises[blockIndex];
  block[field] = value;
  updatedDays[indexDay].lastEdited = new Date().toISOString();
  setDay(updatedDays);
  setModifiedDay(updatedDays);
};

// Elimina un bloque completo por su ID
const deleteBlock = (blockId) => {
  setIsEditing(true);
  const updatedDays = [...day];
  updatedDays[indexDay].exercises = updatedDays[indexDay].exercises.filter(
    el => el.type !== 'block' || el.block_id !== blockId
  );
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  Notify.instantToast("Bloque eliminado con éxito");
};

const AddBlock = () => {
  // ① Parte de modifiedDay, que sí contiene las aproximaciones actuales
  const updatedDays = [...modifiedDay];

  // ② Crea el bloque
  const newBlock = {
    type: 'block',
    block_id: new ObjectId().toString(),
    name: '',
    color: '#FF5733',
    exercises: []
  };
  updatedDays[indexDay].exercises.push(newBlock);

  // ③ Actualiza todos los estados, incluida la fuente “allDays”
  setAllDays(updatedDays);
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setCurrentDay(updatedDays[indexDay]);

  Notify.instantToast("Bloque creado con éxito");
};

const handleOnDragEnd = (result) => {
  const { source, destination, type } = result;
  if (!destination) return;

  // Reordenar items principales (bloques + ejercicios sueltos)
  if (type === 'MAIN') {
    const updated = Array.from(day[indexDay].exercises);
    const [moved] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, moved);
    updated.forEach((el, idx) => el.numberExercise = idx+1);
    syncUpdatedExercises(updated);
  }

  // Reordenar ejercicios dentro de un bloque
  if (type === 'BLOCK') {
    const blockId = source.droppableId.replace('block-', '');
    const updated = [...day[indexDay].exercises];
    const blockIndex = updated.findIndex(b => b.block_id === blockId);
    const block = updated[blockIndex];
    const inner = Array.from(block.exercises);
    const [moved] = inner.splice(source.index, 1);
    inner.splice(destination.index, 0, moved);
    inner.forEach((el, idx) => el.numberExercise = idx+1);
    block.exercises = inner;
    syncUpdatedExercises(updated);
  }
};

const BLOCK_COLOR_OPTIONS = [
  { label: '', value: '#a13232dc' },
  { label: '', value: '#ff8800d5' },
  { label: '', value: '#f0d435c9' },
  { label: '', value: '#179b38e5' },
  { label: '', value: '#0fcff1af' },
  { label: '', value: '#19269bcc' },
  { label: '', value: '#b935b9dc' },
  { label: "Sunset", value: "linear-gradient(135deg, rgba(255,136,0,0.84) 0%, rgba(240,212,53,0.79) 100%)" },
  { label: "Aqua Blend", value: "linear-gradient(135deg, rgba(15,207,241,0.69) 0%, rgba(25,38,155,0.8) 100%)" },
  { label: "Uva", value: "linear-gradient(135deg, rgba(185,53,185,0.86) 0%, rgba(25,38,155,0.8) 100%)" },
];

function colorItemTemplate(option) {
  return (
    <div
      style={{
        backgroundColor: option.value,
        width: 24,
        height: 24,
        borderRadius: 4,
        border: '1px solid #ccc'
      }}
      className="text-center m-auto"
    />
  );
}

  const tableMobile = () => {
    return (
      <div className="p-1">
        {currentDay && (
       <div className="row justify-content-center text-center mb-3 p-0">
         <div className="col-5 px-1">
           <button className="btn btn-outline-dark w-100 py-2 px-1" onClick={incrementAllSeries}>
             <UpgradeIcon /> Sumar 1 serie
           </button>
         </div>
         <div className="col-5 px-1">
           <button className="btn btn-outline-dark w-100 py-2 px-1" onClick={incrementAllReps}>
             <UpgradeIcon /> Sumar 1 rep
           </button>
         </div>
         <div className="col-10 px-1 mt-3">
           {/* --- AGREGAMOS BOTÓN DE BLOQUE --- */}
           <button className="btn btn-outline-dark py-2" onClick={AddBlock}>
             <AddIcon /> Agregar bloque de entrenamiento
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
              {currentDay?.exercises.map((exercise, i) => (
                <Draggable 
                  key={exercise.type === 'block' ? exercise.block_id : exercise.exercise_id}
                  draggableId={exercise.type === 'block' ? exercise.block_id : exercise.exercise_id}
                  index={i}
                  type={exercise.type === 'block' ? 'MAIN' : 'MAIN'}
                >
                  {(providedDrag) => (
                    <div
                      className="mb-4 shadowCards p-2"
                      ref={providedDrag.innerRef}
                      {...providedDrag.draggableProps}
                      {...providedDrag.dragHandleProps}
                    >
                      {/* --- BLOQUE --- */}
                      {exercise.type === 'block' ? (
                        <>
                          {/* Cabecera del bloque */}
                          <div className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ backgroundColor: exercise.color }}>
                            <PrimeAutoComplete
                              value={exercise.name}
                              suggestions={blockNameSuggestions}
                              dropdown
                              placeholder="Nombre del bloque"
                              className="form-control form-control-sm"
                              completeMethod={(e) => {
                                const q = e.query.toLowerCase();
                                setBlockNameSuggestions(
                                  BLOCK_NAME_OPTIONS.filter(opt =>
                                    opt.toLowerCase().includes(q)
                                  )
                                );
                              }}
                              onChange={(e) => changeBlockData(i, 'name', e.value)}
                            />
                            <IconButton onClick={() => handleDeleteBlockClick(i, exercise.name)}>
                              <CancelIcon />
                            </IconButton>
                          </div>
                          {/* Ejercicios dentro del bloque */}
                          {exercise.exercises.map((ex, j) =>
                            Array.isArray(ex.circuit) ? (
                            <div key={ex.exercise_id} className="row justify-content-center">
<div className="col-12">
<CircuitHeaderEditor
  circuit={ex}
  onField={(field, value) => changeBlockCircuitData(i, j, field, value)}
  showNumber
  numberValue={ex.numberExercise}
  numberOptions={options}
  onNumberChange={(v) => changeBlockCircuitData(i, j, 'numberExercise', v)}
/>
</div>

                              {/* Lista de ejercicios del circuito */}
                              <div className="notStyle">
                                {ex.circuit.map((item, k) => (
                                  <div key={item.idRefresh} className="row justify-content-center text-center">
                                    <div className="mt-4 col-12">
                                      <div className="row justify-content-center">
                                        <div className="col-4 m-auto"><b>Ejercicio {k + 1}</b></div>
                                        <div className="col-4">
                                          {customInputEditExerciseInCircuit(
                                            item.video, j, k, 'video', item.video, i
                                          )}
                                        </div>
                                        <div className="col-4 text-end">
                                          <IconButton
                                            onClick={() => handleDeleteExerciseInCircuit(i, j, k, item.name)}
                                          >
                                            <CancelIcon className="colorIconDeleteExercise" />
                                          </IconButton>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-11 mb-2">
                                      {customInputEditExerciseInCircuit(
                                        item.name, j, k, 'name', item.name, i
                                      )}
                                    </div>
                                    <div className="col-5 text-start">
                                      <span className="styleInputsSpan">Peso</span>
                                      <div className="largoInput">
                                        {customInputEditExerciseInCircuit(
                                          item.peso, j, k, 'peso', item.peso, i
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-5 text-start">
                                      <span className="styleInputsSpan">Reps</span>
                                      <div className="largoInput">
                                        {customInputEditExerciseInCircuit(
                                          item.reps, j, k, 'reps', item.reps, i
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Botón “Añadir ejercicio” y notas */}
                              <div className="row justify-content-center my-4">
                                <div className="col-8 my-3">
                                  <IconButton
                                    className="bgColor rounded-2 text-light text-center"
                                    onClick={() => AddExerciseToCircuit(j, i)}
                                  >
                                    <AddIcon />
                                    <span className="font-icons">Añadir ejercicio</span>
                                  </IconButton>
                                </div>
                                <div className="col-11 me-4 text-center">
                                  <span className="styleInputsSpan text-start">Notas</span>
                                  <div className="text-center">
                                    {customInputEditCircuit(ex.notas, j, 'notas', i)}
                                  </div>
                                </div>
                              </div>

                              {/* Número de circuito + acciones */}
                              <div className="notStyle">
                                <div className="row justify-content-center">
                                  <div className="col-4 ms-4">
                                    <Dropdown
                                      value={ex.numberExercise}
                                      options={options}
                                      onChange={e =>
                                        changeBlockCircuitData(i, j, 'numberExercise', e.target.value)
                                      }
                                      placeholder="Seleccionar número"
                                      optionLabel="label"
                                      className="p-dropdown-group w-100"
                                    />
                                  </div>
                                  <div className="col-7 mb-3">
                                    <div className="row justify-content-center">
                                      <IconButton
                                        className="bg-danger col-7 fontDeleteCircuit rounded-2 text-light"
                                        onClick={() => handleDeleteCircuitInBlock(i, j, ex.type)}
                                      >
                                        <DeleteIcon /> Eliminar
                                      </IconButton>
                                      <IconButton className="col-2">
                                        <DragIndicatorIcon />
                                      </IconButton>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={ex.exercise_id} className="border rounded p-2 mb-2">
                              {/* Número + Nombre + Botones */}
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span>{ex.numberExercise}.</span>
                                <div className="flex-grow-1 mx-2 mb-3">
                                  <div className="d-flex align-items-center mb-1">
                                    <button className="btn colorAproximations py-0 m-0"
                                              onClick={e => handleOpenApprox(e, i, j)}>
                                        <AddIcon className="iconsAproximations" /> <span>Aproximaciones</span>
                                      </button>
                                      <Tooltip title={ hasApproximation(ex) ? "Tiene aproximaciones" : "No tiene aproximaciones" }
                                              enterDelay={0} leaveDelay={0}>
                                        { hasApproximation(ex)
                                          ? <CircleIcon color="success" className="ms-1 iconSuccess" />
                                          : <PanoramaFishEyeIcon className="ms-1 iconSuccess" /> }
                                      </Tooltip>
                                    </div>
                                  <AutoComplete
                                    defaultValue={typeof ex.name === 'object' ? ex.name.name : ex.name}
                                    onChange={(name, video) => {
                                      changeBlockExerciseData(i, j, 'name', name);
                                      changeBlockExerciseData(i, j, 'video', video);
                                    }}
                                  />
                              
                              <div className="d-flex align-items-center mt-1">
                                  <button
                                    className="btn colorBackOff py-0 ps-1 m-0 text-start"
                                    onClick={e => handleOpenBackoffOverlay(e, i, j)}
                                  >
                                    <AddIcon className="iconsAproximations" /> <span>Back off</span>
                                  </button>
                                  <Tooltip
                                    title={hasBackoff(ex) ? "Tiene back off" : "No tiene back off"}
                                    enterDelay={0}
                                    leaveDelay={0}
                                  >
                                    {hasBackoff(ex) ? (
                                      <CircleIcon color="success" className="ms-1 iconSuccess" />
                                    ) : (
                                      <PanoramaFishEyeIcon  className="ms-1 iconSuccess" />
                                    )}
                                  </Tooltip>
                                  
                                </div>
                                </div>
                                
                              </div>
                              {/* Controles sets / reps / peso / rest */}
                              <div className="row justify-content-center text-center">
                               
                                  <div className="col-4 ">
                                    <span className="fs07em text-muted ms-2">Sets</span>
                                    {customInputEditDay(ex.sets, j, 'sets', i)}
                                  </div>
                               
                                <div className={`col-7`}>
                                  <span className="fs07em text-muted me-5 d-block ">Reps</span>
                                    {customInputEditDay(ex.reps, j, 'reps', i)}
                                 
                                </div>
                                <div className="col-4 ">
                                  <span className="fs07em text-muted ms-2">Sets</span>
                                  {customInputEditDay(ex.rest, j, 'rest', i)}
                                </div>
                                <div className="col-7 ">
                                  <span className="fs07em text-muted text-center m-auto">Peso</span>
                                  <div>{customInputEditDay(ex.peso, j, 'peso', i)}</div>
                                </div>

                                  <div className="col-11 ">
                                  <span className="fs07em text-muted text-center m-auto">Notas</span>
                                  <div>{customInputEditDay(ex.notas, j, 'notas', i)}</div>
                                </div>

                              </div>
                              {/* YouTube + Editar */}
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <IconButton disabled={!ex.video} onClick={() => handleButtonClick(ex)}>
                                  {ex.isImage ? 
                                    <ImageIcon /> :
                                    <YouTubeIcon />
                                  }
                                </IconButton>
                                <IconButton onClick={() => handleEditMobileBlockExercise(ex, i, j)}>
                                  <EditIcon />
                                </IconButton>
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn btn-outline-dark w-100"
                            onClick={() => addExerciseToBlock(i)}
                          >
                            <AddIcon /> Añadir ejercicio al bloque
                          </button>
                        </>
                      ) : exercise.type === 'exercise' ? (
                        /* --- EJERCICIO SUELTO --- */
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                    <button className="btn colorAproximations py-0 m-0"
                                              onClick={e => handleOpenApprox(e, i)}>
                                        <AddIcon className="iconsAproximations" /> <span>Aproximaciones</span>
                                      </button>
                                      <Tooltip title={ hasApproximation(exercise) ? "Tiene aproximaciones" : "No tiene aproximaciones" }
                                              enterDelay={0} leaveDelay={0}>
                                        { hasApproximation(exercise)
                                          ? <CircleIcon color="success" className="ms-1 iconSuccess" />
                                          : <PanoramaFishEyeIcon className="ms-1 iconSuccess" /> }
                                      </Tooltip>
                                    </div>

                              <AutoComplete
                                defaultValue={typeof exercise.name === 'object' ? exercise.name.name : exercise.name}
                                onChange={(name, video) => {
                                  changeModifiedData(i, name, 'name');
                                  changeModifiedData(i, video, 'video');
                                }}
                              />
                              <div className="d-flex align-items-center mt-1">
                                  <button
                                    className="btn colorBackOff py-0 ps-1 m-0 text-start"
                                    onClick={(e) => handleOpenBackoffOverlay(e, i)}
                                  >
                                    <AddIcon className="iconsAproximations" /> <span>Back off</span>
                                  </button>
                                  <Tooltip
                                    title={hasBackoff(exercise) ? "Tiene back off" : "No tiene back off"}
                                    enterDelay={0}
                                    leaveDelay={0}
                                  >
                                    {hasBackoff(exercise) ? (
                                      <CircleIcon color="success" className="ms-1 iconSuccess" />
                                    ) : (
                                      <PanoramaFishEyeIcon  className="ms-1 iconSuccess" />
                                    )}
                                  </Tooltip>
                                  
                                </div>
                              </div>
                              </div>
                          {/* Controles sets / reps / peso / rest */}
                          <div className="row justify-content-center">
                              <div className="col-4 mb-2">
                                <span className="fs07em text-muted text-start ">Sets</span>
                                {customInputEditDay(exercise.sets, i, 'sets')}
                              </div>
                            
                            <div className={`col-7 mb-2`}>
                              <span className="fs07em text-muted text-start ">Reps</span>
                              {customInputEditDay(exercise.reps, i, 'reps')}
                            </div>
                            <div className="col-4 ">
                              <span className="fs07em text-muted text-start ">Rest</span>
                              {customInputEditDay(exercise.rest, i, 'rest')}
                            </div>

                            <div className="col-7">
                              <span className="fs07em text-muted text-start ">Peso</span>
                              {customInputEditDay(exercise.peso, i, 'peso')}
                            </div>
                     
                            <div className="col-12 text-start">
                              <span className="fs07em text-muted text-start ">Notas</span>
                              {customInputEditDay(exercise.notas, i, 'notas')}
                            </div>
                          </div>
                          {/* YouTube + Editar */}
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <IconButton disabled={!exercise.video} onClick={() => handleButtonClick(exercise)}>
                              {exercise.isImage ?
                                <ImageIcon /> :
                                <YouTubeIcon />
                              }
                            </IconButton>
                            <IconButton onClick={() => handleEditMobileExercise(exercise, i)}>
                              <EditIcon />
                            </IconButton>
                          </div>
                        </>
                      ) : (
                            <>
                                <div className="row justify-content-center">
                                        <div className="col-12">
                                          <CircuitHeaderEditor
                                            circuit={exercise}
                                            onField={(field, value) => changeCircuitData(i, field, value)}
                                            showNumber
                                            numberValue={exercise.numberExercise}
                                            numberOptions={options}
                                            onNumberChange={(v) => changeCircuitData(i, 'numberExercise', v)}
                                          />

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
                                            onClick={() => deleteCircuit(i)}
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
          )}
        </Droppable>
      </DragDropContext>
       
      </div>
    );
  };

  return (
    <div className="container-fluid ">
      {/**a
       * SIDEBAR: fijo a la izquierda 
       */}
       <div className='sidebarPro colorMainAll'>
                 <div className="d-flex flex-column justify-content-between colorMainAll  shadow-sm" style={{ width: '220px', height: '100vh' }}>
                 <div className="p-3">
                   <h5 className="fw-bold text-center mb-4">TOM</h5>
                    <div id={'nameWeek'} className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3 stylePointer" onClick={openEditWeekNameDialog}>
                     <div className=' col-1'><EditIcon /></div>
                     <div className='text-center col-10'><strong >{weekName}</strong></div>
                   </div>

            
       
                   <div className="d-flex justify-content-between text-light bgItemsDropdown align-items-center mb-3">
                     <Segmented
                     id={'dias'}
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

                    <div
                      id="copiarDia"
                      className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={copyDayToClipboard}
                    >
                      <div className=' col-1'><ContentCopyIcon /></div>
                      <div className='text-center col-10'><strong>Copiar día</strong></div>
                    </div>
                  
                    {/* Pegar día */}
                    <div
                      id="pegarDia"
                      className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={pasteDayFromClipboard}
                      style={{ opacity: hasDayClipboard ? 1 : 0.5, pointerEvents: hasDayClipboard ? 'auto' : 'none' }}
                    >
                      <div className=' col-1'><LibraryAddIcon /></div>
                      <div className='text-center col-10'><strong>Pegar día</strong></div>
                    </div>

                  </div>

                    <div className="text-muted small mt-5">

                      <div id="addEjercicio"  className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => AddNewExercise()}>
                        <div className=' col-1'><AddIcon  className="me-2" /></div>
                        <div className='text-center col-10'><strong >Añadir ejercicio</strong></div>
                      </div>

                      <div id="addCircuit" className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => AddNewCircuit()} >
                        <div className=' col-1'><AddIcon /></div>
                        <div className='text-center col-10'><strong >Añadir circuito</strong></div>
                      </div>


                    </div>

                   <div className="p-3 mb-3 text-center">
                              <button className="btn btn-outline-light btn-sm" onClick={() => setTourVisible(true)}>
                                <HelpCircle size={16} className="me-1" /> Ayuda
                              </button>
                            </div>
                          </div>
       
                 </div>
    </div>


       
      {firstWidth < 992 && <div id={'nameWeek'} className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3 stylePointer" onClick={openEditWeekNameDialog}>
        <div className=' col-1'><EditIcon /></div>
            <div className='text-center col-10'><strong >{weekName}</strong></div>
        </div>
        }

      <div className={` ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>
        <section className=" totalHeight">
          <div  className={`row  ${firstWidth > 992 && 'mb-3'} justify-content-around pb-3 align-middle align-center align-items-center`}>

            <div className=" col-lg-6   mt-3">
                  <div id="movility" className="ps-3  bgItemsDropdown py-3" onClick={handleShowMovility}>
                    <CircleIcon  className="me-2 badgeMovility" />
                    <span className=" me-1 stylesSpanTitles">Bloque de <strong>activación/movilidad</strong> <span className="small">- {currentDay && currentDay.name} </span> </span>
                    <span className="d-block stylesSpanBloqs">Haz click para editar</span>
                  </div>
               
              </div>

              <div className=" col-lg-6  mt-3">
                  <div id="warmup" className="ps-3 bgItemsDropdown py-3" onClick={handleShowWarmup}>
                    <CircleIcon  className="me-2 badgeWarmup" />
                    <span className=" me-1 stylesSpanTitles">Bloque de <strong>entrada en calor</strong> <span className="small">- {currentDay && currentDay.name} </span></span>
                    <span className="d-block stylesSpanBloqs">Haz click para editar</span>
                </div>
              </div>


          
              {firstWidth < 992 && 
              <>
              <div className={`col-10 col-sm-6 text-center mb-4 mt-3`}>
                    
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

                    <p className="text-center mb-4 colorNameAlumno rounded-2 mt-3 py-2">
                        {currentDay && currentDay.name}
                    </p>

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
           
             
       
            {firstWidth > 992 ? (
              /** Tabla de escritorio con Drag&Drop **/
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="exercises-desktop" type="MAIN">
                  {(provided) => (
                    <div 
                      className="table-responsive col-12  altoTable"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <table
                        className={`table  totalHeightTable align-middle fontTable text-center ${
                          isEditing && "table-light"
                        }`}
                      >
                        <thead className=" ">
                          <tr className=" ">
                            <th className="px-0 mx-0 pt-0 bg-transparent" colSpan={2}><div className="btn style1Item w-100">Acciones:</div></th>
                            
                            <th className="pb-1 pb-1 mx-0  ">

                              <button className="rounded-2 text-start " onClick={() => incrementAllSeries()} >
                                <Tooltip placement="top" arrow title={ "Sumarás una serie a todos los ejercicios" } enterDelay={0} leaveDelay={0}>
                                  <div className=" btn  px-0 pe-2  style1Item"><UpgradeIcon className="fontBadgePlus " />Sumar 1 serie</div>
                                </Tooltip>
                              </button>

                            </th>
                              
                          
                            <th className="pb-1 pb-1 mx-0  "  >

                              <button className="rounded-2 text-start " onClick={() => incrementAllReps()} >
                                <Tooltip placement="top" arrow title={ "Sumarás una repetición a todos los ejercicios" } enterDelay={0} leaveDelay={0}>
                                  <div className=" btn  px-0 pe-2 style1Item "><UpgradeIcon className=" fontBadgePlus" />Sumar 1 rep</div> 
                                </Tooltip>
                              </button>

                            </th>

                              <th className="pb-1 pb-1 mx-0  " colSpan={2}  >

                                <button className="rounded-2 text-start " onClick={AddBlock}>
                                  <Tooltip placement="top" arrow title={ "En vez de agregar un ejercicio, primero agregás un bloque, para luego crear los ejercicios que desees dentro de él. Tu alumno verá el bloque. Por ejemplo, podés agregar un bloque de fuerza, luego uno de auxiliares, etc." } enterDelay={0} leaveDelay={0}>
                                    <div className=" btn  px-0 pe-2 style1Item "><AddIcon className=" fontBadgePlus" />Agregar bloque de entrenamiento</div> 
                                  </Tooltip>
                                </button>

                            </th>
                            
                          </tr>
                        </thead>

                        <thead>
                          <tr>
                            {/* CHANGES: Aquí usamos key={index} para evitar duplicados */}
                            {propiedades.map((propiedad, index) => (
                              <th
                                key={index}
                                className={`td-${index} fontThStyles`}
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
                                key={exercise.type === 'block' ? exercise.block_id : exercise.exercise_id}
                                draggableId={exercise.type === 'block' ? exercise.block_id : exercise.exercise_id}
                                index={i}
                                type="MAIN"
                            >
                              {(providedDrag) => (
                                 <React.Fragment>
                                  
                                  {exercise.type === 'block' ? (
                                    <React.Fragment key={exercise.block_id}>
                                      {/* Fila encabezado bloque */}
                                      <tr ref={providedDrag.innerRef} {...providedDrag.draggableProps}>
  <td colSpan={propiedades.length} className="p-0 border-0">
    <div
      className="rounded-3 shadow-sm"
      style={{ overflow: 'hidden', border: '1px solid #ececec' }}
    >
      {/* HEADER ROJO */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ background: exercise.color || '#e74c3c', color: '#fff' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span {...providedDrag.dragHandleProps}>
            <IconButton size="small" className="text-white">
              <DragIndicatorIcon />
            </IconButton>
          </span>

          <span className="fw-semibold">Bloque</span>

          <PrimeAutoComplete
            value={exercise.name}
            suggestions={blockNameSuggestions}
            dropdown
            placeholder="Nombre del bloque"
            className="form-control form-control-sm bg-transparent border-0 text-dark"
            completeMethod={(e) => {
              const q = e.query.toLowerCase();
              setBlockNameSuggestions(
                BLOCK_NAME_OPTIONS.filter(opt =>
                  opt.toLowerCase().includes(q)
                )
              );
            }}
            onChange={(e) => changeBlockData(i, 'name', e.value)}
          />
        </div>

        <div className="d-flex align-items-center">
          {BLOCK_PALETTE.map((c) => (
            <BlockColorDot
              key={c}
              color={c}
              active={exercise.color === c}
              onClick={() => changeBlockData(i, 'color', c)}
            />
          ))}

          <IconButton
            size="small"
            className="text-white"
            onClick={() => handleDeleteBlockClick(i, exercise.name)}
            title="Eliminar bloque"
          >
            <CancelIcon />
          </IconButton>
        </div>
      </div>

      {/* SUB-ENCABEZADO DE COLUMNAS (fondo claro) */}
      <div className="px-3 py-2 small text-muted " style={{ background: '#fffef7' }}>
        <div className="row g-0 fw-semibold">
          <div className="col-1">#</div>
          <div className="col-3 text-start">Ejercicio</div>
          <div className="col-1">Series</div>
          <div className="col-1">Reps</div>
          <div className="col-2">Peso</div>
          <div className="col-1">Rest</div>
          <div className="col-1">Video</div>
          <div className="col-2">Notas</div>
        </div>
      </div>
    </div>
  </td>
</tr>

                             
                              <React.Fragment   
                              >
                                {exercise.exercises.map((ex, j) => {
                                    // EJERCICIOS SUELTOS
                                    if (ex.type === 'exercise') {
                                      return ( <tr 
                                      className="text-danger  shadow "
                                        key={ex.exercise_id}
                                        
                                          >

                                        <td style={{ backgroundColor: exercise.type == 'block' ? exercise.color : exercise.color , transition: 'background-color 0.2s' }} >
                                          <Dropdown
                                            value={ex.numberExercise}
                                            options={options}
                                            onChange={(e) =>
                                              changeBlockExerciseData(
                                                i,
                                                j,
                                                "numberExercise",
                                                e.target.value
                                              )
                                            }
                                            className="p-dropdown-group w-100"
                                          />
                                        </td>
                                        <td colSpan={2}>
                                        <div className="">
                                                          <div className="d-flex align-items-center mb-1">
                                                          <button className="btn colorAproximations py-0 m-0"
                                                                    onClick={e => handleOpenApprox(e, i, j)}>
                                                              <AddIcon className="iconsAproximations" /> <span>Aproximaciones</span>
                                                            </button>
                                                            <Tooltip title={ hasApproximation(ex) ? "Tiene aproximaciones" : "No tiene aproximaciones" }
                                                                    enterDelay={0} leaveDelay={0}>
                                                              { hasApproximation(ex)
                                                                ? <CircleIcon color="success" className="ms-1 iconSuccess" />
                                                                : <PanoramaFishEyeIcon className="ms-1 iconSuccess" /> }
                                                            </Tooltip>
                                                            </div>
                                                          <AutoComplete
                                                                defaultValue={typeof ex.name === 'object' ? ex.name.name : ex.name}
                                                                onChange={(name, video) => {
                                                                  // Usa la función específica para ejercicios de bloque
                                                                  changeBlockExerciseData(i, j, 'name', name);
                                                                  changeBlockExerciseData(i, j, 'video', video);
                                                                }}
                                                              />
                                                          <div className="d-flex align-items-center mt-1">
                                                            <button
                                                              className="btn colorBackOff py-0 ps-1 m-0 text-start"
                                                              onClick={(e) => handleOpenBackoffOverlay(e, i, j)}
                                                            >
                                                              <AddIcon className="iconsAproximations" /> <span>Back off</span>
                                                            </button>
                                                            <Tooltip
                                                              title={hasBackoff(ex) ? "Tiene back off" : "No tiene back off"}
                                                              enterDelay={0}
                                                              leaveDelay={0}
                                                            >
                                                              {hasBackoff(ex) ? (
                                                                <CircleIcon color="success" className="ms-1 iconSuccess" />
                                                              ) : (
                                                                <PanoramaFishEyeIcon  className="ms-1 iconSuccess" />
                                                              )}
                                                            </Tooltip>
                                                            
                                                          </div>
                                                        </div>
                                                        </td>
                                                        <td>
                                                        {customInputEditDay(ex.sets, j, "sets", i)}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(ex.reps, j, "reps", i)}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(ex.peso, j, "peso", i)}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(ex.rest, j, "rest", i)}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(ex.video, j, "video", i)}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(ex.notas, j, "notas", i)}
                                                        </td>
                                                        <td>
                                                          <IconButton
                                                            onClick={() =>
                                                              removeExerciseFromBlock(
                                                                i,
                                                                ex.exercise_id
                                                              )
                                                            }
                                                          >
                                                            <CancelIcon />
                                                          </IconButton>
                                                        </td>
                                                      </tr>
                                )}
                                if (ex.type !== 'block' && ex.type !== 'exercise') {

                                  return (
                                    <React.Fragment key={ex.exercise_id}>
                                      {/* --- Fila de encabezado del circuito dentro del bloque --- */}
                                      <tr style={{ backgroundColor: exercise.color }}>
                                        <td colSpan={8} className="text-start">
                                          <CircuitHeaderEditor
                                            circuit={ex}
                                            onField={(field, value) => changeBlockCircuitData(i, j, field, value)}
                                            showNumber
                                            numberValue={ex.numberExercise}
                                            numberOptions={options}
                                            onNumberChange={(v) => changeBlockCircuitData(i, j, 'numberExercise', v)}
                                          />
                                        </td>
                                        <td>
                                      <IconButton onClick={() => handleDeleteCircuitInBlock(i, j, circuitSubtitle(ex))}>
                                            <CancelIcon />
                                          </IconButton>
                                        </td>
                                      </tr>

                                      {/* --- Cada ejercicio dentro del circuito --- */}
                                      {ex.circuit.map((ce, k) => (
                                        <tr key={ce.idRefresh}>
                                          <td colSpan={1} className="text-center">
                                            <div className="border p-2 bg-light rounded-1">{k}</div>
                                          </td>
                                          <td colSpan={3} className="text-start">
                                            <span className="fs08em">Nombre</span>
                                            {customInputEditExerciseInCircuit(ce.name,j,k,'name',ce.name,i)}
                                          </td>
                                          <td colSpan={1} className="text-center">
                                             <span className="fs08em">Reps</span>
                                            {customInputEditExerciseInCircuit(ce.reps, j, k, 'reps', ce.reps, i)}
                                          </td>
                                          <td  className="text-center" colSpan={3}>
                                             <span className="fs08em">Peso</span>
                                            {customInputEditExerciseInCircuit(ce.peso, j, k, 'peso', ce.peso, i)}
                                          </td>
                                          <td colSpan={1} className="text-center">
                                             <span className="fs08em d-block">Video</span>
                                            {customInputEditExerciseInCircuit(ce.video, j, k, 'video', ce.video, i)}
                                          </td>
                                          <td colSpan={1}>
                                            <IconButton onClick={() => handleDeleteExerciseInCircuit(i, j, k, ce.name)}>
                                              <CancelIcon />
                                            </IconButton>
                                          </td>
                                        </tr>
                                      ))}

                                      {/* --- Botón “Añadir ejercicio” dentro del circuito --- */}
                                      <tr>
                                        <td colSpan={propiedades.length} className="text-center py-5 ">
                                          <button
                                            className="btn btn-outline-dark "
                                            onClick={() => AddExerciseToCircuit(/*circuitIndex=*/ j, /*blockIndex=*/ i)}
                                          >
                                            <AddIcon /> Añadir ejercicio al circuito
                                          </button>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  );
                                }


                              })}
                               
                              </React.Fragment>

                                      {/* Fila para añadir ejercicio al bloque */}
                                      <tr>
                                        <td colSpan={propiedades.length} className="text-center rounded-bottom-3" style={{ backgroundColor: exercise.type == 'block' ? exercise.color : exercise.color , transition: 'background-color 0.2s' }}>
                                          <button
                                            className="btn btn-light mx-3"
                                            onClick={() => addExerciseToBlock(i)}
                                          >
                                            <AddIcon /> Añadir ejercicio al bloque
                                          </button>

                                          <button
                                            className="btn btn-light  mx-3"
                                            onClick={() => AddNewCircuit(i)}
                                          >
                                            <AddIcon /> Añadir circuito al bloque
                                          </button>

                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ) : (
                                                  <tr 
                                                    ref={providedDrag.innerRef}
                                                    {...providedDrag.draggableProps}
                                                    className="GeneralTrExercises"
                                                  >
                                                    <td >
                                                      <div className="row justify-content-center">
                                                        <IconButton
                                                          {...providedDrag.dragHandleProps}
                                                        >
                                                          <DragIndicatorIcon />
                                                        </IconButton>
                                                      </div>
                                                    </td>
                                                    <td>
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
                                                        <td >
                                                        <div className="">
                                                          <div className="d-flex align-items-center mb-1">
                                                          <button className="btn colorAproximations py-0 m-0"
                                                                    onClick={e => handleOpenApprox(e, i)}>
                                                              <AddIcon className="iconsAproximations" /> <span>Aproximaciones</span>
                                                            </button>
                                                            <Tooltip title={ hasApproximation(exercise) ? "Tiene aproximaciones" : "No tiene aproximaciones" }
                                                                    enterDelay={0} leaveDelay={0}>
                                                              { hasApproximation(exercise)
                                                                ? <CircleIcon color="success" className="ms-1 iconSuccess" />
                                                                : <PanoramaFishEyeIcon className="ms-1 iconSuccess" /> }
                                                            </Tooltip>
                                                            </div>
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
                                                              className="btn colorBackOff py-0 ps-1 m-0 text-start"
                                                              onClick={(e) => handleOpenBackoffOverlay(e, i)}
                                                            >
                                                              <AddIcon className="iconsAproximations" /> <span>Back off</span>
                                                            </button>
                                                            <Tooltip
                                                              title={hasBackoff(exercise) ? "Tiene back off" : "No tiene back off"}
                                                              enterDelay={0}
                                                              leaveDelay={0}
                                                            >
                                                              {hasBackoff(exercise) ? (
                                                                <CircleIcon color="success" className="ms-1 iconSuccess" />
                                                              ) : (
                                                                <PanoramaFishEyeIcon  className="ms-1 iconSuccess" />
                                                              )}
                                                            </Tooltip>
                                                            
                                                          </div>
                                                        </div>
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.sets,
                                                            i,
                                                            "sets"
                                                          )}
                                                        </td>
                                                        <td>
                                                          <div className="marginRepsNew">
                                                          {customInputEditDay(
                                                            exercise.reps,
                                                            i,
                                                            "reps"
                                                          )}</div>
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.peso,
                                                            i,
                                                            "peso"
                                                          )}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.rest,
                                                            i,
                                                            "rest"
                                                          )}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.video,
                                                            i,
                                                            "video"
                                                          )}
                                                        </td>
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.notas,
                                                            i,
                                                            "notas"
                                                          )}
                                                        </td>
                                                        <td>
                                                          <div className="row justify-content-center">
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
                                                        <td colSpan={9}>
                                                          <table className="table text-center align-middle">
                                                            <thead>
                                                              <tr>

                                                                <td colSpan={8} className="text-start">
                                                               <CircuitHeaderEditor
                                                                  circuit={exercise}
                                                                  onField={(field, value) => changeCircuitData(i, field, value)}
                                                                  showNumber
                                                                  numberValue={exercise.numberExercise}
                                                                  numberOptions={options}
                                                                  onNumberChange={(v) => changeCircuitData(i, 'numberExercise', v)}
                                                                />
                                                                </td>
                                                                <td>
                                                                  <IconButton
                                                                    aria-label="delete"
                                                                    onClick={() => deleteCircuit(i)}

                                                                  >
                                                                    <CancelIcon />
                                                                  </IconButton>
                                                                </td>
                                                              </tr>

                                                              <tr></tr>
                                                              <tr >
                                                                <th colSpan={3}>Nombre</th>
                                                                <th colSpan={2} >Reps</th>
                                                                <th colSpan={2}>Peso</th>
                                                                <th colSpan={1}>Video</th>
                                                                
                                                              </tr>
                                                            </thead>
                                                            <tbody>
                                                              {exercise.circuit.map((circuitExercise, j) => (
                                                                <tr key={circuitExercise.idRefresh}>
                                                                  <td colSpan={3} className="" >
                                                                    {customInputEditExerciseInCircuit(circuitExercise.name, i, j, 'name')}
                                                                  </td>
                                                                  <td colSpan={2} className="td-3" >
                                                                    <div className="marginRepsNew">
                                                                    {customInputEditExerciseInCircuit(circuitExercise.reps, i, j, 'reps')}
                                                                    </div>
                                                                  </td>
                                                                  <td colSpan={2} className="" >
                                                                    {customInputEditExerciseInCircuit(circuitExercise.peso, i, j, 'peso')}
                                                                  </td>
                                                                  <td colSpan={1} className="">
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
                                                                <td colSpan={6}>
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
                                </React.Fragment>
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
                className="px-5 btn btn-light  my-4"
                onClick={() => applyChanges()}
              >
                Guardar
              </button>
              <button
                className="px-5 btn btn-danger   my-4"
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
            <p className="p-4 text-dark">
              ¡Cuidado! Estás por eliminar{" "}
              <b>"{exerciseToDelete?.name}"</b>. ¿Estás seguro?
            </p>
          </Dialog>

          <Dialog
            className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
            contentClassName={"colorDialog"}
            headerClassName={"colorDialog"}
            header={
              <div className="d-flex align-items-start justify-content-between  border-bottom">
                <div><span className="fs-5">Bloque de entrada en calor</span> - <span className="fs-5">{currentDay && currentDay.name}</span></div>
                
              </div>
            }
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
  className={`col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}
  blockScroll={window.innerWidth > 600 ? false : true}
  /* Header custom para replicar el diseño (titulo izq + X der) */
  header={
    <div className="d-flex align-items-start justify-content-between  border-bottom">
      <div><span className="fs-5">Bloque de activación / movilidad</span> - <span className="fs-5">{currentDay && currentDay.name}</span></div>
      
    </div>
  }
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

      <OverlayPanel ref={backoffOverlayRef} className={firstWidth > 992 ? 'w-25' : 'w-75'}>
        <div className="p-3">

          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="customTitleCheckbox"
              className="form-check-input"
              checked={useCustomTitle}
              onChange={(e) => setUseCustomTitle(e.target.checked)}
            />
            <label htmlFor="customTitleCheckbox" className="form-check-label fontSizeNotBack">
              No es un back off? Personalizá el nombre de la sección.
            </label>
          </div>

          {/* SI ESTÁ TILDADO, MOSTRAMOS EL INPUT */}
          {useCustomTitle && (
            <div className="mb-3">
              <label htmlFor="backoffTitleInput" className="form-label fontSizeNotBack ">Título personalizado</label>
              <input
                id="backoffTitleInput"
                type="text"
                className="form-control"
                value={backoffTitleName}
                onChange={(e) => setBackoffTitleName(e.target.value)}
                placeholder="Ingresá el nombre"
              />
            </div>
          )}

          {/* AQUÍ TU MAP DE backoffData (igual que antes) */}
          {backoffData.map((line, idx) => (
            <div key={idx} className="row mb-2 align-items-end">
              {["sets", "reps", "peso"].map((f) => (
                <div key={f} className="col-3 px-0">
                  <label className={'fs07em'}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input
                    type={f === "peso" || f === "reps" ? "text" : "number"}
                    className="form-control styleInputBackOffs text-center "
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

          {/* Botones de añadir línea, cerrar y guardar */}
          <div className="text-center mb-3">
            <button
              className="btn btn-outline-dark fs09em py-0 px-2"
              onClick={() => setBackoffData([...backoffData, { sets: "", reps: "", peso: "" }])}
            >
              Añadir otro back off
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

    <OverlayPanel ref={approxOverlayRef} className={ firstWidth > 992 ? 'w-25' : 'w-75' }>
      <div className="">

        {/* Cada línea con su número de aproximación */}
        { approxData.map((line, idx) => (
          <div key={idx} className="mb-2">
            <div className="small text-muted fs07em mb-0">
              {`${idx+1}° aproximación`}
            </div>
            <div className="row g-1 align-items-end">
              <div className="col-5">
                <label className="form-label  fs07em mb-0">Reps</label>
                <input type="text" className="form-control text-center styleInputBackOffs"
                      value={line.reps}
                      onChange={e => {
                        const arr = [...approxData];
                        arr[idx].reps = e.target.value;
                        setApproxData(arr);
                        saveApproxInternally(arr);
                      }} />
              </div>
              <div className="col-5">
                <label className="form-label  fs07em mb-0">Peso</label>
                <input type="text" className="form-control text-center styleInputBackOffs"
                      value={line.peso}
                      onChange={e => {
                        const arr = [...approxData];
                        arr[idx].peso = e.target.value;
                        setApproxData(arr);
                        saveApproxInternally(arr);
                      }} />
              </div>
              <div className="col-2 text-end">
                <IconButton size="small"
                            onClick={() => removeApproxLine(idx)}>
                  <CancelIcon fontSize="small" className="text-danger" />
                </IconButton>
              </div>
            </div>
          </div>
        ))}

        {/* Botón añadir línea */}
        <div className="text-center mb-3">
          <button className="btn btn-outline-dark py-0 px-2 fs09em"
                  onClick={() => setApproxData([...approxData, { reps:"", peso:"" }])}>
            Añadir otra aproximación
          </button>
        </div>

        {/* Botones Cerrar / Guardar */}
        <div className="text-center">
          <button className="btn btn-secondary btn-sm me-2"
                  onClick={() => approxOverlayRef.current.hide()}>
            Cerrar
          </button>
          <button className="btn btn-dark btn-sm"
                  onClick={handleSaveApprox}>
            Seguir editando
          </button>
        </div>

      </div>
    </OverlayPanel>

    <ConfirmDialog
      visible={showDeleteCircuitDialog}
      onHide={() => setShowDeleteCircuitDialog(false)}
      message={`¿Estás seguro de que deseas eliminar el circuito "${circuitToDelete?.name}"?`}
      header="Eliminar circuito"
      icon="pi pi-exclamation-triangle"
      acceptLabel="Sí"
      rejectLabel="No"
      accept={confirmDeleteCircuitInBlock}
      reject={() => setShowDeleteCircuitDialog(false)}
    />

      <ConfirmDialog
          visible={showDeleteExerciseInCircuitDialog}
          onHide={() => setShowDeleteExerciseInCircuitDialog(false)}
          message={`¿Estás seguro de que deseas eliminar el ejercicio "${exerciseToDeleteInCircuit?.exerciseName}"?`}
          header="Eliminar ejercicio"
          icon="pi pi-exclamation-triangle"
          acceptLabel="Sí"
          rejectLabel="No"
          accept={confirmDeleteExerciseInCircuit}
          reject={() => setShowDeleteExerciseInCircuitDialog(false)}
        />

        <ConfirmDialog
          visible={showDeleteBlockDialog}
          onHide={() => setShowDeleteBlockDialog(false)}
          message={`¿Estás seguro de que deseas eliminar el bloque "${blockToDelete.name}"?`}
          header="Eliminar bloque"
          icon="pi pi-exclamation-triangle"
          acceptLabel="Sí"
          rejectLabel="No"
          accept={confirmDeleteBlock}
          reject={() => setShowDeleteBlockDialog(false)}
        />

        </section>
      </div>
    </div>
  );
}

export default DayEditDetailsPage;
