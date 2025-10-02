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

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SettingsIcon from '@mui/icons-material/Settings';



// Mantener pantalla despierta mientras el timer esté abierto
function useScreenWakeLock(enabled = true) {
  const lockRef = React.useRef(null);

  const request = React.useCallback(async () => {
    if (!enabled) return;
    if (!('wakeLock' in navigator)) {
      try { Notify?.instantToast?.('Tu dispositivo no soporta mantener la pantalla activa.'); } catch {}
      return;
    }
    try {
      if (!lockRef.current) {
        const lock = await navigator.wakeLock.request('screen');
        lockRef.current = lock;
        lock.addEventListener?.('release', () => { lockRef.current = null; });
      }
    } catch (err) {
      // Puede fallar sin gesto del usuario o si el doc no está visible: reintentamos en los listeners de abajo
      // console.warn('WakeLock error', err);
    }
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled) return;

    // 1) Intento inmediato
    request();

    // 2) Tras PRIMER gesto del usuario (requisito de iOS/Safari/Chrome)
    const onUserGesture = () => request();
    window.addEventListener('pointerdown', onUserGesture, { once: true, capture: true });
    window.addEventListener('keydown', onUserGesture, { once: true, capture: true });
    window.addEventListener('touchstart', onUserGesture, { once: true, capture: true });

    // 3) Re-adquirir al volver a ser visible o al recuperar foco
    const onVis = () => { if (document.visibilityState === 'visible') request(); };
    const onFocus = () => request();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pointerdown', onUserGesture, { capture: true });
      window.removeEventListener('keydown', onUserGesture, { capture: true });
      window.removeEventListener('touchstart', onUserGesture, { capture: true });
      if (lockRef.current) {
        try { lockRef.current.release(); } catch {}
        lockRef.current = null;
      }
    };
  }, [enabled, request]);
}


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
    const [showTimerDialog, setShowTimerDialog] = useState(false);
    const [activeCircuit, setActiveCircuit] = useState(null);
    const [prepSeconds, setPrepSeconds] = useState(10);
    const [showPrepSettings, setShowPrepSettings] = useState(false);
    const lastWorkExRef = React.useRef(-1);
    const openTimerForCircuit = (c) => { setActiveCircuit(normalizeCircuit(c)); setShowTimerDialog(true); };
      useScreenWakeLock(true);

    // ⬇︎ NUEVO: diálogo informativo de circuitos
    const [showCircuitInfo, setShowCircuitInfo] = useState(false);
    const [circuitInfoTitle, setCircuitInfoTitle] = useState('');
    const [circuitInfoText, setCircuitInfoText] = useState('');

     // Config de circuito libre (ajustable por el alumno)
  const [freeTimerConfig, setFreeTimerConfig] = useState({
    mode: 'timer',          // 'timer' (cuenta regresiva) | 'chrono' (cuenta ascendente)
    schema: 'intermitente', // 'intermitente' (work/rest × rondas) | 'amrap' (duración continua)
    workSec: 30,
    restSec: 30,
    totalRounds: 10,
    totalMinutes: 12
  });
  const [showFreeTimerSetup, setShowFreeTimerSetup] = useState(false);

const CIRCUIT_EXPLANATIONS = {
  Libre: (
    <div>
      <div className="mb-2">
        <span className="badge text-bg-dark me-2">LIBRE</span>
        Trabajo <b>libre</b> sin estructura fija de intervalos.
      </div>
      <ul className="mb-2 ps-3">
        <li>Seguí las indicaciones del entrenador sobre <b>series</b>, <b>reps</b> y <b>descansos</b>.</li>
      </ul>
    </div>
  ),

  AMRAP: (
    <div>
      <div className="mb-2 text-center">
        <b className="d-block">As Many Rounds/Reps As Possible</b> 
        <b className="d-block">Tantas rondas/reps como sea posible</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li><b>Objetivo:</b> completar la mayor cantidad de trabajo dentro del tiempo indicado.</li>
        <li><b>Ejemplo:</b> En caso de que tengas 3 ejercicios, completá el ejercicio A, B, C, y luego, vuelve a empezar hasta cumplir el tiempo.</li>
      </ul>
    </div>
  ),

  EMOM: (
    <div>
      <div className="mb-2 text-center">
        <b className="d-block">Every Minute On the Minute</b><b>Cada minuto en el minuto</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li>Al inicio de <b>cada minuto</b> hacés lo indicado; <b>descansás</b> con el tiempo restante.</li>
        <li><b>Ejemplo:</b> Tenés 2 ejercicios. Logras realizar el ejercicio A y B en 30s, por lo tanto te quedan 30s de descanso.</li>
      </ul>
    </div>
  ),

  E2MOM: (
        <div>
      <div className="mb-2 text-center">
        <b className="d-block">Every 2 Minutes On the Minute</b><b>Cada 2 minutos en el minuto</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li>Al inicio de <b>cada 2 minutos</b> hacés lo indicado; <b>descansás</b> con el tiempo restante.</li>
        <li><b>Ejemplo:</b> Tenés 2 ejercicios. Logras realizar el ejercicio A y B en 1min, por lo tanto te queda 1min de descanso.</li>
      </ul>
    </div>
  ),

  E3MOM: (
        <div>
      <div className="mb-2 text-center">
        <b className="d-block">Every 3 Minutes On the Minute</b><b>Cada 3 minutos en el minuto</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li>Al inicio de <b>cada 3 minutos</b> hacés lo indicado; <b>descansás</b> con el tiempo restante.</li>
        <li><b>Ejemplo:</b> Tenés 2 ejercicios. Logras realizar el ejercicio A y B en 2min, por lo tanto te queda 1min de descanso.</li>
      </ul>
    </div>
  ),

  Intermitentes: (
    <div>
      <div className="mb-2 text-center">
        Alternancia de <b>trabajo</b> (<b>WORK</b>) y <b>descanso</b> (<b>REST</b>) por tiempo.
      </div>
      <ul className="mb-2 ps-3">
        <li>En <b>WORK</b> ejecutás; en <b>REST</b> recuperás y te preparás para el siguiente bloque.</li>
                <li className="mt-2"><b>Ejemplo:</b> En el caso de tener 30s de trabajo x 30s de descanso en 8 rondas, y tener 2 ejercicios, <b>debes realizar el ejercicio A durante 30s</b>, luego, <b>descansar 30s.</b> Al terminar el descanso, <b>continuas con el ejercicio B, hasta completar 8 rondas.</b></li>
      </ul>
    </div>
  ),

  'Por tiempo': (
    <div>
      <div className="mb-2">
        <span className="badge text-bg-dark me-2">FOR TIME</span>
        Trabajo <b>contra reloj</b> hasta completar un objetivo, con posible <b>time cap</b> (límite).
      </div>
      <ul className="mb-2 ps-3">
        <li><b>Objetivo:</b> terminar todas las reps/metros en el menor tiempo posible.</li>
        <li>Si hay <b>time cap</b>, debés completar antes del límite; si no, el tiempo final es tu <b>marca</b>.</li>
      </ul>
    </div>
  ),

  Tabata: (
    <div>
      <div className="mb-2 text-center">
        Entrenamiento de intervalos de alta intensidad.
      </div>
      <ul className="mb-2 ps-3">
        <li><b>Ejemplo:</b> En el caso de tener 20s de trabajo x 10s de descanso en 8 rondas, y tener 2 ejercicios, <b>debes realizar el ejercicio A durante 20s</b>, luego, <b>descansar 10s.</b> Al terminar el descanso, <b>continuas con el ejercicio B, hasta completar 8 rondas.</b></li>
      </ul>
    </div>
  ),
};


const openCircuitInfo = (c) => {
  const kind = normalizeCircuit(c).circuitKind || 'Libre';
  const title = kind === 'Por tiempo' ? 'For time' : kind;
  setCircuitInfoTitle(title);
  setCircuitInfoText(CIRCUIT_EXPLANATIONS[kind] || CIRCUIT_EXPLANATIONS['Libre']);
  setShowCircuitInfo(true);
};
    const [blockEditIndices, setBlockEditIndices] = useState({ blockIndex: null, exerciseIndex: null });

    const numberIconMap = {
      1: LooksOneIcon,
      2: LooksTwoIcon,
      3: LooksThreeIcon,
      4: LooksFourIcon,
      5: LooksFiveIcon,
      6: LooksSixIcon,

    };

    const SAFE_PREP_KEY = 'timerPrepSec';
const safeHasLS = () => (typeof window !== 'undefined' && !!window.localStorage);

const readPrepSeconds = () => {
  try {
    if (!safeHasLS()) return 10;
    const raw = window.localStorage.getItem(SAFE_PREP_KEY);

    // Si no hay valor guardado (null/""), usar 10 por defecto
    if (raw == null || String(raw).trim() === '') return 10;

    const n = Math.floor(Number(raw));

    // Si no es válido o es menor a 1, volver a 10 (default)
    if (!Number.isFinite(n) || n < 1) return 10;

    // Limitar entre 1 y 300
    return Math.min(300, n);
  } catch {
    return 10;
  }
};

const writePrepSeconds = (val) => {
  try {
    if (!safeHasLS()) return;
    const n = Math.max(1, Math.min(300, Math.floor(Number(val))));
    window.localStorage.setItem(SAFE_PREP_KEY, String(n));
  } catch {
    // noop
  }
};



// Inicializar desde localStorage
useEffect(() => {
  setPrepSeconds(readPrepSeconds());
}, []);

    const goToWeek = (newIndex) => {
        setCurrentWeekIndex(newIndex);
        const newWeek = allWeeks[newIndex];
        if (newWeek) {
            // Resetea al día 0 al navegar
            navigate(`/routine/${id}/day/0/${newWeek._id}/${newIndex}`);
        }
    };

  // === Superseries (parsing robusto) ===
// Acepta: "12.1" (→ 12-A), "12-a", "12A", "12 a", "12,a", "12-A)", y "12" solo
const parseSupersetTag = (val) => {
  if (val == null) return null;
  const str = String(val).trim();

  // 1) Formato decimal puro: "12.1", "4.2", "3.10"
  let m = str.match(/^(\d+)\.(\d+)$/);
  if (m) {
    const base = parseInt(m[1], 10);
    const dec  = parseInt(m[2], 10); // 1→A, 2→B, 3→C...
    const letter = dec > 0 && dec <= 26 ? String.fromCharCode(64 + dec) : null;
    return { base, suffix: letter };
  }

  // 2) Formato alfabético / separadores: "12-a", "12A", "12 a", "12,a", "12-A)"
  m = str.match(/^(\d+)\s*[-–.,\s]?\s*([A-Za-z])?\)?$/);
  if (!m) return null;
  const base = parseInt(m[1], 10);
  const suffix = m[2] ? m[2].toUpperCase() : null; // puede ser null (solo "12")
  return { base, suffix };
};

/**
 * Agrupa ejercicios consecutivos con el mismo número base.
 * - Acepta decimales (1.1→A, 1.2→B...) y letras (1-a, 1b, 1,c...)
 * - Si el primero no trae letra/decimal y hay más con el mismo base, asigna A/B/C...
 * - No crea "superserie" si queda un único ejercicio.
 * - Guarda _origIndex / _origIndexInBlock para editar correctamente.
 */
const groupSupersets = (items = [], { forBlock = false } = {}) => {
  const out = [];
  let i = 0;

  while (i < items.length) {
    const el = items[i];

    if (el?.type !== 'exercise') { out.push(el); i++; continue; }

    const tag = parseSupersetTag(el.numberExercise ?? el.number ?? el.numberCircuit);
    if (!tag) { out.push(el); i++; continue; }

    const group = { type: 'superset', baseNumber: tag.base, exercises: [] };

    while (i < items.length) {
      const cur = items[i];
      if (cur?.type !== 'exercise') break;

      const t = parseSupersetTag(cur.numberExercise ?? cur.number ?? cur.numberCircuit);
      if (!t || t.base !== tag.base) break;

      // fallback A/B/C... si no vino sufijo
      const fallbackLetter = String.fromCharCode(65 + group.exercises.length);
      const supSuffix = t.suffix || fallbackLetter;

      group.exercises.push({
        ...cur,
        supSuffix,
        ...(forBlock ? { _origIndexInBlock: i } : { _origIndex: i }),
      });

      i++;
    }

    if (group.exercises.length < 2) {
      out.push(group.exercises[0] ?? el); // si fue único, no mostrar como superserie
    } else {
      out.push(group);
    }
  }

  return out;
};



const renderLetterIcon = (letter) => (
  <Avatar
    variant="rounded"
    sx={{ width: 26, height: 26, fontSize: 14, bgcolor: 'primary.main' }}
  >
    {letter}
  </Avatar>
);


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
        const sortedWeeks = (weeks || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ); // última primero
        // ⬇️ Mostrar solo semanas visibles (si no existe la prop, se considera visible)
        const visibleWeeks = sortedWeeks.filter(
          (w) => !w?.visibility || w.visibility === 'visible'
        );
        console.log(visibleWeeks)
        setAllWeeks(visibleWeeks);
      
        if (visibleWeeks.length === 0) {
          setCurrentWeekIndex(0);
          return;
        }
      
        const selectedIndex = visibleWeeks.findIndex((w) => w._id === week_id);
        if (selectedIndex !== -1) {
          setCurrentWeekIndex(selectedIndex);
        } else {
          // Si la semana actual está oculta, redirigimos a la primera visible
          setCurrentWeekIndex(0);
          navigate(`/routine/${id}/day/0/${visibleWeeks[0]._id}/0`, { replace: true });
        }
      } catch (err) {
        console.error("Error al cargar semanas", err);
      }
    };
    fetchWeeks();
  }, [id, week_id, navigate]);

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
        console.log(data)
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

    const getPlainName = (nameData) => {
      if (typeof nameData === 'object' && nameData !== null) {
        return nameData.name ?? '';
      }
      return nameData ?? '';
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
  const newExercises = [...modifiedDay];

  if (blockEditIndices.blockIndex !== null) {
    // === DENTRO DE BLOQUE ===
    const b = blockEditIndices.blockIndex;

    // Clonar el bloque y su array interno
    newExercises[b] = { ...newExercises[b], exercises: [...(newExercises[b].exercises || [])] };

    // Buscar por ID dentro del bloque (más seguro que usar índice)
    const innerIdx = newExercises[b].exercises.findIndex(
      (ex) => ex?.exercise_id === completeExercise?.exercise_id
    );

    if (innerIdx >= 0) {
      newExercises[b].exercises[innerIdx] = { ...newExercises[b].exercises[innerIdx], ...completeExercise };
    } else if (Number.isInteger(blockEditIndices.exerciseIndex)) {
      // fallback por índice si no hay ID (raro, pero evita romper)
      newExercises[b].exercises[blockEditIndices.exerciseIndex] = completeExercise;
    }

  } else {
    // === NIVEL TOP (normal o parte de superserie) ===
    const realIdx = newExercises.findIndex(
      (ex) => ex?.exercise_id === completeExercise?.exercise_id
    );

    if (realIdx >= 0) {
      newExercises[realIdx] = { ...newExercises[realIdx], ...completeExercise };
    } else if (Number.isInteger(indexOfExercise)) {
      // fallback por índice si no hay ID
      newExercises[indexOfExercise] = completeExercise;
    }
  }

  setModifiedDay(newExercises);
  ExercisesService
    .editExercise(week_id, day_id, newExercises)
    .then(() => {
      Notify.instantToast('Rutina actualizada con éxito!');
      setEditExerciseMobile(false);
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

    // Devuelve { title, meta } para el header del timer
const headerInfo = (c0 = {}) => {
  const c = normalizeCircuit(c0);
  const k = c.circuitKind;

  switch (k) {
case 'AMRAP': {
  const d = fmtMMSS(getDurationSec(c) || 0);
  return { title: 'AMRAP', meta: d };
}
    case 'EMOM': {
      const rounds = c.totalRounds || Math.max(1, Math.round((c.totalMinutes || 0)/(c.intervalMin || 1)));
      return { title: 'EMOM', meta: `${c.intervalMin || 1}:00 × ${rounds} min` };
    }
    case 'E2MOM': return { title: 'E2MOM', meta: `2:00 × ${(c.totalRounds || 0)} min` };
    case 'E3MOM': return { title: 'E3MOM', meta: `3:00 × ${(c.totalRounds || 0)} min` };
    case 'Por tiempo': {
      const cap = fmtMMSS(getDurationSec(c) || 0);
      return { title: 'For time', meta: `CAP ${cap}` };
    }
    case 'Intermitentes': {
      const work = c.workSec ?? 30, rest = c.restSec ?? 30, r = c.totalRounds ?? 10;
      return { title: 'Intermitente', meta: `${work}s / ${rest}s × ${r} rondas` };
    }
    case 'Tabata': {
      const work = c.workSec ?? 20, rest = c.restSec ?? 10, r = c.totalRounds ?? 8;
      return { title: 'Tabata', meta: `${work}s / ${rest}s × ${r} rondas` };
    }
    default: {
     // Libre: priorizar 'type' como título; si no, usar typeOfSets; si no, "Libre"
     const title = (c.type && String(c.type).trim()) || c.typeOfSets || 'Libre';
     const fc = c.freeConfig;
     if (fc) {
       if (fc.mode === 'chrono') return { title, meta: 'Cronómetro' };
       if (fc.schema === 'amrap') return { title, meta: `AMRAP · ${String(fc.totalMinutes).padStart(2,'0')}:00` };
       return { title, meta: `${fc.workSec}s / ${fc.restSec}s × ${fc.totalRounds}` };
     }
     return { title, meta: '' };
   }
  }
};


const TimerHeader = ({ circuit, onClose, onOpenSettings }) => {
  const { title, meta } = headerInfo(circuit || {});
  return (
    <div
      className="d-flex align-items-start justify-content-between rounded-top-1"
      style={{
        background: 'linear-gradient(135deg,rgb(11, 18, 32),rgba(4, 18, 46, 1))',
        color: '#fff', padding: '12px 16px'
      }}
    >
      <div>
        <div className="fw-bold">{title}</div>
        {meta ? <small className="opacity-90">{meta}</small> : null}
      </div>
      <div className="d-flex align-items-center gap-1">
        <button
          className="btn btn-sm text-white border-0"
          style={{ lineHeight: 1, opacity: .9 }}
          onClick={onOpenSettings}
          aria-label="Ajustes"
          title="Ajustes"
        >
          <SettingsIcon />
        </button>
        <button
          className="btn btn-sm text-white border-0"
          style={{ lineHeight: 1, opacity: .9, fontSize: '2em' }}
          onClick={onClose}
          aria-label="Cerrar"
          title="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const renderExerciseHeader = () => (
  <div className="row justify-content-center text-uppercase text-muted small fw-semibold mb-2">
    <div className="col-6">Nombre</div>
    <div className="col-2 text-center">Reps</div>
    <div className="col-2 text-center">Peso</div>
    <div className="col-2 text-center">Notas</div>
  </div>
);

// REEMPLAZAR COMPLETO
const renderExerciseRow = (ex, i) => {
  const repsText  = Array.isArray(ex?.reps) ? ex.reps.join(' - ') : (ex?.reps ?? '-');
  const pesoText  = ex?.peso ?? '-';
  const notesText = (ex?.notas && String(ex.notas).trim()) || '-';

  return (
    <div key={i} className="row justify-content-center align-items-center bg-white rounded-3 mb-2 py-2">
      <div className="col-6 d-flex align-items-center">
        <span className="badge rounded-pill text-bg-dark me-3 px-2 py-2">{i + 1}</span>
        <span className="fw-semibold">{ex?.name || '-'}</span>
      </div>
      <div className="col-2 text-center fw-bold">{repsText}</div>
      <div className="col-2 text-center fw-bold">{pesoText}</div>
      <div
        className="col-2 text-center small text-muted"
        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        title={notesText}
      >
        {notesText}
      </div>
    </div>
  );
};

const parseMinutesFromTypeOfSets = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  // Soporta: 14' | 14" | 14´ | 14m | 14 min | 14.5' | 14,5' | 14MIN
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:['"´m]|min(?:utos)?)?$/i);
  if (!m) return null;
  const num = parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(num) ? num : null; // minutos
};


const toSec = (m = 0, s = 0) => (m || 0) * 60 + (s || 0);
const fmtMMSS = (sec = 0) => {
  const v = Math.max(0, Math.floor(sec));
  const m = Math.floor(v / 60);
  const s = v % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getDurationSec = (c = {}) => {
  // 1) Si ya viene duration/timeCap en segundos, usarlo.
  if (Number.isFinite(c.durationSec) && c.durationSec > 0) return c.durationSec;
  if (Number.isFinite(c.timeCapSec) && c.timeCapSec > 0) return c.timeCapSec;

  // 2) Si viene "14'", "14min", etc. en typeOfSets (o incluso en type), convertir a segundos.
  const mins = parseMinutesFromTypeOfSets(c.typeOfSets ?? c.type);
  return mins != null && mins > 0 ? Math.round(mins * 60) : 0;
};

// ==== Normalizador de circuito ====
const normalizeCircuit = (c = {}) => {
  const rawType = (typeof c.type === 'string' ? c.type.trim() : '');
  const rawKind = (typeof c.circuitKind === 'string' ? c.circuitKind.trim() : '');

  const pick = (v) => {
    const k = v.toLowerCase();
    if (k === 'amrap') return 'AMRAP';
    if (k === 'emom') return 'EMOM';
    if (k === 'e2mom') return 'E2MOM';
    if (k === 'e3mom') return 'E3MOM';
    if (k === 'intermitente' || k === 'intermitentes') return 'Intermitentes';
    if (k === 'tabata') return 'Tabata';
    if (k === 'por tiempo') return 'Por tiempo';
    if (k === 'circuito' || k === 'libre') return 'Libre';
    return null;
  };

  // PRIORIDAD: si `type` nombra un circuito conocido, usarlo aunque circuitKind diga "Libre".
  const fromType = pick(rawType);
  const fromKind = pick(rawKind);

  const kind = fromType || fromKind || 'Libre';
  return { ...c, circuitKind: kind };
};

// ==== Subtítulo corto ====
const circuitSubtitle = (c = {}) => {
  const k = c?.circuitKind || c?.type || 'Libre';
  switch (k) {
    case 'AMRAP':         return `AMRAP · ${fmtMMSS(getDurationSec(c) || 0)}`;
    case 'EMOM':          return `EMOM · ${(c.intervalMin || 1)}:00 × ${(c.totalRounds || Math.max(1, Math.round((c.totalMinutes || 0)/(c.intervalMin || 1))))}`;
    case 'E2MOM':         return `E2MOM · 2:00 × ${(c.totalRounds || 0)}`;
    case 'E3MOM':         return `E3MOM · 3:00 × ${(c.totalRounds || 0)}`;
    case 'Intermitentes': return `Intermitente · ${(c.workSec || 30)}s / ${(c.restSec || 30)}s × ${(c.totalRounds || 10)}`;
    case 'Por tiempo':    return `For time · CAP ${fmtMMSS(getDurationSec(c) || 0)}`;
    case 'Tabata':        return `Tabata · ${(c.workSec ?? 20)}s / ${(c.restSec ?? 10)}s × ${(c.totalRounds ?? 8)}`;
    default: {
    // Libre: si trae 'type', usarlo como etiqueta en lugar de "Libre"
    const libreLabel = c?.type?.trim() ? c.type : 'Libre';
    const fc = c.freeConfig;
    if (fc) {
      if (fc.mode === 'chrono') return `${libreLabel} · Cronómetro`;
      if (fc.schema === 'amrap') return `${libreLabel} · AMRAP · ${String(fc.totalMinutes).padStart(2,'0')}:00`;
      return `${libreLabel} · ${fc.workSec}s / ${fc.restSec}s × ${fc.totalRounds}`;
    }
    return `${libreLabel}${c.typeOfSets ? ` · ${c.typeOfSets}` : ''}`;
  }
  }
};

const CircuitHeader = ({ circuit, onStart, onAdjust }) => {
  const isLibre = normalizeCircuit(circuit).circuitKind === 'Libre';
  return (
  <div className="d-flex flex-wrap align-items-center justify-content-between bg-white border rounded-2 px-3 py-2 mb-3">
    <div className="me-3">
      <div className="fw-semibold">{circuitSubtitle(circuit)}</div>
    </div>
    {!isLibre && ( <div>
      <button className="btn btn-sm btn-dark" onClick={() => onStart(normalizeCircuit(circuit))}>
        Iniciar
      </button>
    </div>)}
  </div>
)};




const TimerDialog = ({ circuit, onClose, prepSeconds = 10, onOpenInfo  }) => {
  const c = normalizeCircuit(circuit);
  const kind = c.circuitKind;
  const list = Array.isArray(c.circuit) ? c.circuit : [];

  const free = c.freeConfig || {};
  const isLibre = kind === 'Libre';
  const isChrono = isLibre && free.mode === 'chrono';

  const isEMOMLike = kind === 'EMOM' || kind === 'E2MOM' || kind === 'E3MOM';
  const isInterTab = kind === 'Intermitentes' || kind === 'Tabata';

  const safePrep = (Number.isFinite(prepSeconds) && prepSeconds >= 1) ? prepSeconds : 10;

  // ---------- PLAN ----------
  const buildPlan = () => {
    switch (kind) {
      case 'AMRAP': {
        const d = getDurationSec(c) || toSec(12, 0);
        return [{ phase: 'work', duration: d, label: 'AMRAP' }];
      }
      case 'EMOM':
      case 'E2MOM':
      case 'E3MOM': {
        const intervalMin =
          kind === 'EMOM' ? (c.intervalMin || 1) : (kind === 'E2MOM' ? 2 : 3);
        const rounds =
          c.totalRounds ||
          Math.max(1, Math.round((c.totalMinutes || intervalMin * 12) / intervalMin));
        const segs = [];
        for (let r = 0; r < rounds; r++) {
          // ⬇️ NO rotamos ejercicios: cada minuto muestra la lista completa
          segs.push({
            phase: 'interval',
            duration: intervalMin * 60,
            label: `Min ${r + 1}/${rounds}`,
            round: r + 1, total: rounds
          });
        }
        return segs;
      }
      case 'Intermitentes':
      case 'Tabata': {
        const rounds = c.totalRounds ?? (kind === 'Tabata' ? 8 : 10);
        const work   = c.workSec   ?? (kind === 'Tabata' ? 20 : 30);
        const rest   = c.restSec   ?? (kind === 'Tabata' ? 10 : 30);
        const n = Math.max(1, list.length);
        const segs = [];
        for (let i = 0; i < rounds; i++) {
          segs.push({ phase: 'work', duration: work, label: `Work ${i + 1}/${rounds}`, exerciseIndex: i % n, round: i + 1, total: rounds });
          segs.push({ phase: 'rest', duration: rest, label: `Rest ${i + 1}/${rounds}`, round: i + 1, total: rounds });
        }
        return segs;
      }
      case 'Por tiempo': {
        const cap = getDurationSec(c) || toSec(20, 0);
        return [{ phase: 'work', duration: cap, label: 'Time cap' }];
      }
      default: {
        // LIBRE
        if (!isLibre) return [];
        if (isChrono) {
          // Cronómetro: sin plan de cuenta regresiva
          return [{ phase: 'chrono', duration: 0, label: 'Cronómetro' }];
        }
        // Temporizador configurable
        if (free.schema === 'amrap') {
          const d = Math.max(1, Number(free.totalMinutes || 12)) * 60;
          return [{ phase: 'work', duration: d, label: 'AMRAP' }];
        }
        // Intermitente por defecto
        const rounds = Math.max(1, Number(free.totalRounds || 10));
        const work   = Math.max(1, Number(free.workSec || 30));
        const rest   = Math.max(1, Number(free.restSec || 30));
        const segs = [];
       for (let i = 0; i < rounds; i++) {
         segs.push({ phase: 'work', duration: work, label: `Work ${i + 1}/${rounds}`, round: i + 1, total: rounds });
         segs.push({ phase: 'rest', duration: rest, label: `Rest ${i + 1}/${rounds}`, round: i + 1, total: rounds });
       }
      return segs;
     }
    }
  };

  const [plan, setPlan]     = React.useState(buildPlan);
  const [idx, setIdx]       = React.useState(0);
  const [phase, setPhase]   = React.useState(plan[0]?.phase || 'idle');
  const [timeLeft, setLeft] = React.useState(plan[0]?.duration || 0);
  const segDurationRef      = React.useRef(plan[0]?.duration || 60);

  const [chronoElapsed, setChronoElapsed] = React.useState(0);

  // ---------- ARRANQUE CONTROLADO + PREP 10s ----------
  const [running, setRunning]   = React.useState(false);
  const [isPreparing, setPrep]  = React.useState(false);
  const [prepLeft, setPrepLeft] = React.useState(safePrep);


  // ---------- AUDIO (habilita en el toque de “Iniciar”) ----------
  const audioRef = React.useRef(null);
  const lastBeepRef = React.useRef({ key: '', val: -1 });
  // NUEVO: referencias para tiempos absolutos (no dependen del tick del navegador)
const prepEndAtRef = React.useRef(0);        // ms absolutos fin de preparación
const segEndAtRef = React.useRef(0);         // ms absolutos fin del segmento actual
const chronoStartAtRef = React.useRef(0);    // ms cuando arrancó el cronómetro
const pauseStartedAtRef = React.useRef(0);   // ms cuando pausaste
const pausedAccumRef = React.useRef(0);      // ms acumulados en pausa
const runTickRef = React.useRef(() => {});   // para forzar un tick en visibilitychange


   React.useEffect(() => {
   if (!isInterTab) return;
   const seg = plan[idx];
   if (seg?.phase === 'work' && Number.isInteger(seg.exerciseIndex)) {
     lastWorkExRef.current = seg.exerciseIndex;
   }
 }, [idx, plan, isInterTab]);

  const ensureAudio = React.useCallback(async () => {
    if (!audioRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioRef.current = new Ctx();
    }
    if (audioRef.current.state === 'suspended') {
      await audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

 const metronomeClick = React.useCallback(async (type = 'tick', long = false) => {
   const ctx = await ensureAudio();
   if (!ctx) return;

   // Master
   const master = ctx.createGain();
   master.gain.value = 4;                  // volumen general (alto)
   master.connect(ctx.destination);

   const now = ctx.currentTime;
   const dur = long ? 5 : 0.5;           // el último suena el doble de largo

   // 1) Ataque: "click" de ruido filtrado (como madera)
   const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
   const ch = noiseBuf.getChannelData(0);
   for (let i = 0; i < ch.length; i++) {
     // decaimiento exponencial para que sea percusivo
     ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (type === 'tock' ? 65 : 50));
   }
   const noise = ctx.createBufferSource();
   noise.buffer = noiseBuf;
   const hp = ctx.createBiquadFilter();
   hp.type = 'highpass';
   hp.frequency.value = type === 'tock' ? 3333 : 2200; // tock más grave
   noise.connect(hp);
   hp.connect(master);
   noise.start(now);
   noise.stop(now + 0.04);

   // 2) Cuerpo: oscilador con envolvente corta
   const osc = ctx.createOscillator();
   osc.type = 'triangle';
   osc.frequency.value = type === 'tock' ? 1000 : 800; // tock más bajo; tick más agudo

   const og = ctx.createGain();
   og.gain.setValueAtTime(0.0001, now);
   og.gain.exponentialRampToValueAtTime(type === 'tock' ? 0.7 : 0.6, now + 0.012); // pico alto
   og.gain.exponentialRampToValueAtTime(0.0001, now + dur);

   osc.connect(og);
   og.connect(master);
   osc.start(now);
   osc.stop(now + dur);
 }, [ensureAudio]);

  // ⬆️ volumen (más fuerte): mayor gain y dos tonos leves para “cuerpo”
  const beep = React.useCallback(async (freq = 880, duration = 140, long = false) => {
    const ctx = await ensureAudio();
    if (!ctx) return;
    const main = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    main.type = 'sine';
    main.frequency.value = freq;
    overtone.type = 'sine';
    overtone.frequency.value = Math.round(freq * 1.5);

    // volumen más alto (antes ~0.15)
    const peak = long ? 0.4 : 0.3;

    gain.gain.value = 0.0001;
    main.connect(gain);
    overtone.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);

    main.start(now);
    overtone.start(now);
    main.stop(now + duration / 1000 + 0.02);
    overtone.stop(now + duration / 1000 + 0.02);
  }, [ensureAudio]);

  // ---------- REBUILD ----------
  React.useEffect(() => {
    const p = buildPlan();
    setPlan(p);
    setIdx(0);
    setPhase(p[0]?.phase || 'idle');
    setLeft(p[0]?.duration || 0);
    segDurationRef.current = p[0]?.duration || 60;
    setChronoElapsed(0);
    setRunning(false);
    setPrep(false);
    setPrepLeft(safePrep);
    lastBeepRef.current = { key: '', val: -1 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(c), prepSeconds]);


// NUEVO: heartbeat anti-atrasos (250ms), usa Date.now()
React.useEffect(() => {
  let intId;
  const TICK_MS = 250;

  const tick = () => {
    const now = Date.now();

    // === PREPARACIÓN (respeta prepSeconds) ===
    if (isPreparing) {
      const left = Math.ceil((prepEndAtRef.current - now) / 1000);
      const safeLeft = Math.max(0, left);
      setPrepLeft(safeLeft);

      // beeps 5-2 cortos, 1 largo (misma lógica que tenías)
      if (safeLeft <= 5 && safeLeft > 1) {
        const key = 'prep-tick';
        if (!(lastBeepRef.current.key === key && lastBeepRef.current.val === safeLeft)) {
          metronomeClick('tick'); lastBeepRef.current = { key, val: safeLeft };
        }
      } else if (safeLeft === 1) {
        const key = 'prep-tock';
        if (!(lastBeepRef.current.key === key && lastBeepRef.current.val === safeLeft)) {
          metronomeClick('tock', true); lastBeepRef.current = { key, val: safeLeft };
        }
      }

      // Fin de preparación → arranca primer segmento
      if (safeLeft <= 0) {
        setPrep(false);
        setRunning(true);
        const dur = segDurationRef.current || (plan[0]?.duration || 60);
        segEndAtRef.current = now + dur * 1000;
        setIdx(0);
        setPhase(plan[0]?.phase || 'idle');
        setLeft(dur);
        lastBeepRef.current = { key: '', val: -1 };
      }
      return;
    }

    // Si no está corriendo, no hacemos nada
    if (!running) return;

    // === CRONÓMETRO (Libre/chrono) ===
    if (isChrono) {
      const ms = now - chronoStartAtRef.current - pausedAccumRef.current;
      setChronoElapsed(Math.max(0, Math.floor(ms / 1000)));
      return;
    }

    // === SEGMENTOS (AMRAP, EMOM/E2MOM/E3MOM, Intermitentes, Tabata, Por tiempo, Libre/timer) ===
    if (!segEndAtRef.current) {
      const baseLeft = timeLeft || segDurationRef.current || plan[idx]?.duration || 60;
      segEndAtRef.current = now + baseLeft * 1000;
    }

    let end = segEndAtRef.current;
    let leftSec = Math.ceil((end - now) / 1000);

    // Si se consumieron varios segmentos (por throttling), los “saltamos”
    if (leftSec <= 0) {
      let next = idx + 1;
      let accEnd = end;

      while (next < plan.length && accEnd <= now) {
        accEnd += (plan[next].duration || 0) * 1000;
        next++;
      }

      if (next >= plan.length && accEnd <= now) {
        setRunning(false); setPhase('done'); setLeft(0); return;
      }

      const newIdx = next - 1;
      setIdx(newIdx);
      setPhase(plan[newIdx].phase);
      segDurationRef.current = plan[newIdx].duration;
      segEndAtRef.current = accEnd;
      leftSec = Math.ceil((accEnd - now) / 1000);
    }

    // beeps 5-2 cortos, 1 largo
    if (leftSec <= 5 && leftSec > 1) {
      const key = `seg-${idx}-tick`;
      if (!(lastBeepRef.current.key === key && lastBeepRef.current.val === leftSec)) {
        metronomeClick('tick'); lastBeepRef.current = { key, val: leftSec };
      }
    } else if (leftSec === 1) {
      const key = `seg-${idx}-tock`;
      if (!(lastBeepRef.current.key === key && lastBeepRef.current.val === leftSec)) {
        metronomeClick('tock', true); lastBeepRef.current = { key, val: leftSec };
      }
    }

    setLeft(leftSec);
  };

  runTickRef.current = tick;

  if (running || isPreparing) {
    intId = setInterval(tick, TICK_MS);
    tick(); // primer tick inmediato
  }

  const onVis = () => runTickRef.current();
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('focus', onVis);

  return () => {
    clearInterval(intId);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('focus', onVis);
  };
}, [running, isPreparing, isChrono, plan, idx, timeLeft, metronomeClick]);



  

  // ---------- TIEMPO / PRESENTACIÓN ----------
  const totalSeconds = isPreparing ? prepLeft : (isChrono ? chronoElapsed : timeLeft);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const segTotal = isPreparing ? prepSeconds : (isChrono ? Math.max(1, totalSeconds) : (segDurationRef.current || 60));
  const secProgress = isChrono ? 0 : ((segTotal - totalSeconds) / segTotal) * 100;
  const currentSeg  = plan[idx] || {};
  const totalRounds = currentSeg.total ?? c.totalRounds ?? 0;
  const roundText   = totalRounds ? `Ronda ${currentSeg.round || 1} de ${totalRounds}` : null;

  // Para Intermitentes/Tabata: ejercicio actual (rota por ronda)
 const showCurrent = isInterTab && phase === 'work' && list.length > 0;
 // En work uso el índice del segmento; en rest uso el último índice de work
 const currExIndex = showCurrent
   ? (currentSeg.exerciseIndex ?? 0)
   : lastWorkExRef.current;
 const currEx = showCurrent ? list[currExIndex] : null;

 // “Próximo”: si estoy en rest, parte desde el último work; si estoy en work, desde el actual
 const nextEx = (isInterTab && list.length && currExIndex >= 0)
   ? list[(currExIndex + 1) % list.length]
   : null;

  // Tema visual
  const restBG = (isInterTab && !isPreparing && phase === 'rest');
  const isPrepTheme = isPreparing;

  const timeCardBase = 'card rounded-4 shadow-sm text-white';
  const timeCardStyle = isPrepTheme
    ? { background: 'linear-gradient(135deg,#1e3a8a,#6366f1)' }
    : (restBG ? { background: 'linear-gradient(135deg,#ef4444,#dc2626)' }
              : { background: '#0b1220' });

  const progressBarClass = isPrepTheme ? 'bg-info' : (restBG ? 'bg-light' : 'bg-success');
  const timeAreaStyle = isPrepTheme
    ? { background: 'rgba(99, 101, 241, 0.26)', borderRadius: 16}
    : (restBG ? { background: 'rgba(239, 68, 68, 0.25)', borderRadius: 16 } : {});

  // ---------- CONTROLES ----------
  // REEMPLAZAR la función completa
const handleStartPause = async () => {
  await ensureAudio();

  // Si terminó: reset + volver a PREP al iniciar
  if (phase === 'done') {
    setIdx(0);
    setPhase(plan[0]?.phase || 'idle');
    setLeft(plan[0]?.duration || 0);
    segDurationRef.current = plan[0]?.duration || 60;
    setRunning(false);
    setPrepLeft(prepSeconds);
    setPrep(true);
    prepEndAtRef.current = Date.now() + Math.max(1, prepSeconds) * 1000; 
    lastBeepRef.current = { key: '', val: -1 };
    // limpiar absolutos
    // NUEVO: limpiar tiempos absolutos al reconstruir
    segEndAtRef.current = 0;
    prepEndAtRef.current = 0;
    chronoStartAtRef.current = 0;
    pauseStartedAtRef.current = 0;
    pausedAccumRef.current = 0;
    return;
  }

  // Pausa / cancelar preparación
  if (running) {
    setRunning(false);
    if (isChrono) pauseStartedAtRef.current = Date.now();
    return;
  }
  if (isPreparing) {
    setPrep(false);
    setPrepLeft(prepSeconds);
    return;
  }

  // Inicio: si estamos al principio, pasar por PREP
  const atStart = idx === 0 && (isChrono ? (chronoElapsed === 0) : (timeLeft === (plan[0]?.duration || 0)));
  if (!isChrono && atStart) {
    const prep = Math.max(1, prepSeconds);
    setPrepLeft(prep);
    prepEndAtRef.current = Date.now() + prep * 1000;
    setPrep(true);
    return;
  }

  // Reanudar
  if (isChrono) {
    if (!chronoStartAtRef.current) chronoStartAtRef.current = Date.now();
    if (pauseStartedAtRef.current) {
      pausedAccumRef.current += Date.now() - pauseStartedAtRef.current;
      pauseStartedAtRef.current = 0;
    }
  } else {
    const baseLeft = timeLeft || segDurationRef.current || plan[idx]?.duration || 60;
    segEndAtRef.current = Date.now() + baseLeft * 1000;
  }
  setRunning(true);
};


const reset = () => {
  setIdx(0);
  setPhase(plan[0]?.phase || 'idle');
  setLeft(plan[0]?.duration || 0);
  segDurationRef.current = plan[0]?.duration || 60;
  setRunning(false);
  setPrep(false);
  setChronoElapsed(0);
  setPrepLeft(prepSeconds);
  lastBeepRef.current = { key: '', val: -1 };

  // limpiar tiempos absolutos
  segEndAtRef.current = 0;
  prepEndAtRef.current = 0;
  chronoStartAtRef.current = 0;
  pauseStartedAtRef.current = 0;
  pausedAccumRef.current = 0;
};

// OPCIONAL
React.useEffect(() => {
  if (running && !isChrono && !isPreparing && !segEndAtRef.current) {
    const baseLeft = timeLeft || segDurationRef.current || plan[idx]?.duration || 60;
    segEndAtRef.current = Date.now() + baseLeft * 1000;
  }
}, [running, isChrono, isPreparing, timeLeft, idx, plan]);

  return (
    <div className="container-fluid px-0">
      {/* TIMER (Min / Sec) */}
      <div className="d-flex justify-content-center align-items-end gap-3 my-2" style={timeAreaStyle}>
        {/* MIN */}
        <div className={timeCardBase} style={{ width: 128, ...timeCardStyle }}>
          <div className="card-body text-center py-3">
            <div className="display-6 fw-bold lh-1">{String(minutes).padStart(2, '0')}</div>
            <div className="small text-uppercase opacity-75 mt-1">MIN</div>
            <div className="progress bg-secondary-subtle mt-2" style={{ height: 6 }}>
              <div className="progress-bar" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* ":" */}
        <div className="d-flex flex-column align-items-center justify-content-center my-auto" style={{ gap: 8 }}>
          <span className="rounded-circle bg-dark" style={{ width: 8, height: 8 }} />
          <span className="rounded-circle bg-dark" style={{ width: 8, height: 8 }} />
        </div>

        {/* SEC */}
        <div className={timeCardBase} style={{ width: 128, ...timeCardStyle }}>
          <div className="card-body text-center py-3">
            <div className="display-6 fw-bold lh-1">{String(seconds).padStart(2, '0')}</div>
            <div className="small text-uppercase opacity-75 mt-1">{isPreparing ? 'PREP' : 'SEC'}</div>
            <div className="progress bg-secondary-subtle mt-2" style={{ height: 6 }}>
              <div className={`progress-bar ${progressBarClass}`} style={{ width: `${secProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* RONDA */}
      {roundText && (
        <div className="d-flex justify-content-center my-2">
          <span className="badge rounded-pill bg-light border text-dark fw-semibold shadow-sm d-inline-flex align-items-center gap-2 px-3 py-2 mt-1">
            <span className="rounded-circle " style={{ width: 8, height: 8,background: 'rgb(11, 18, 32)' }} />
            {roundText}
          </span>
        </div>
      )}

      {/* CONTROLES */}
      <div className="d-flex justify-content-center gap-3 my-3">
        <button
          className="btn btn-success btn-lg rounded-4 d-flex align-items-center justify-content-center shadow"
          style={{ width: 64, height: 64 }}
          onClick={handleStartPause}
          title="Iniciar / Pausa"
        >
          {(running || isPreparing) ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
        <button
          className="btn btn-light btn-lg rounded-4 d-flex align-items-center justify-content-center shadow-sm border"
          style={{ width: 64, height: 64 }}
          onClick={reset}
          title="Reiniciar"
        >
          <RestartAltIcon />
        </button>
      </div>

      {/* ===== CONTENIDO SEGÚN TIPO ===== */}

      {kind === 'AMRAP' && (
        <>
          <div className="d-flex align-items-center mb-2">
            <span className="rounded-circle bg-primary me-2" style={{ width: 8, height: 8 }} />
            <div className="fw-bold text-uppercase small">Ejercicios </div>
          </div>
          <div className="mb-3">
            {renderExerciseHeader()}
            {list.length ? list.map((ex, i) => renderExerciseRow(ex, i)) : (
              <div className="text-muted small">—</div>
            )}
          </div>
        </>
      )}

      {isLibre && (
         <>
           <div className="d-flex align-items-center mb-2">
             <span className="rounded-circle bg-primary me-2" style={{ width: 8, height: 8 }} />
             <div className="fw-bold text-uppercase small">Ejercicios</div>
           </div>
           <div className="mb-3">
             {renderExerciseHeader()}
             {list.length ? list.map((ex, i) => renderExerciseRow(ex, i)) : (
               <div className="text-muted small">—</div>
             )}
           </div>
         </>
       )}

      {isEMOMLike && (
        <>
          <div className="d-flex align-items-center mb-2">
            <span className="rounded-circle bg-primary me-2" style={{ width: 8, height: 8 }} />
            <div className="fw-bold text-uppercase small">Ejercicios a realizar</div>
          </div>
          <div className="mb-3">
             {renderExerciseHeader()}
            {list.length ? list.map((ex, i) => renderExerciseRow(ex, i)) : (
              <div className="text-muted small">—</div>
            )}
          </div>
        </>
      )}

      {/* Intermitentes / Tabata: EJERCICIO ACTUAL + PRÓXIMO */}
      {isInterTab && (
        <>
          <div className="d-flex align-items-center mb-2">
            <span className="rounded-circle me-2" style={{ width: 8, height: 8,background: 'rgb(11, 18, 32)' }} />
            <div className="fw-bold text-uppercase small me-auto">Ejercicio actual</div>
             
            {showCurrent && list.length ? (
              <div className="text-muted small fw-semibold">{(currExIndex + 1)}/{list.length}</div>
            ) : null}
          </div>

          <div className="card rounded-4 shadow-sm mb-3" style={{ border: '1px solid rgba(0,0,0,.05)' }}>
           <div className="card-body">
             {showCurrent ? (
               <>
                 <div className="d-flex align-items-center justify-content-between">
                   <div className="fw-bold fs-5">{currEx?.name}</div>
                   <span className={`badge rounded-pill ${phase === 'work' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                     {phase === 'work' ? 'WORK' : 'REST'}
                   </span>
                 </div>
            
                 <div className="d-flex flex-wrap gap-2 mt-3">
                   <span className="badge text-bg-dark px-3 py-2">
                     Reps: {Array.isArray(currEx?.reps) ? currEx.reps.join(' - ') : (currEx?.reps ?? '-')}
                   </span>
                   <span className="badge text-bg-dark px-3 py-2">
                     Peso: {currEx?.peso ?? '-'}
                   </span>
                 </div>
            
                 {currEx?.notas ? (
                   <div className="text-muted small mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                     {currEx.notas}
                   </div>
                 ) : null}
               </>
             ) : (
               <div className="text-muted d-flex align-items-center justify-content-center" style={{ minHeight: 74 }}>
                 {phase === 'rest' ? 'Descanso' : '—'}
               </div>
             )}
           </div>
         </div>

          {nextEx && (
            <>
              <div className="card rounded-4 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.05)' }}>
               <div className="card-body">
                 <div className="d-flex align-items-center justify-content-between">
                   <div className="fw-semibold">{nextEx.name}</div>
                   <span className="badge" style={{background: 'rgb(11, 18, 32)'}}>Siguiente</span>
                 </div>
                 <div className="text-muted small d-flex gap-3 mt-2">
                   <span>Reps: {Array.isArray(nextEx.reps) ? nextEx.reps.join(' - ') : (nextEx.reps ?? '-')}</span>
                   <span>Peso: {nextEx.peso ?? '-'}</span>
                 </div>
               </div>
             </div>
            </>
          )}
        </>
      )}

      <div className="d-flex justify-content-between mt-3">
          <button
          className="btn btn-outline-secondary rounded-3 "
          style={{ lineHeight: 1, opacity: .95 }}
          onClick={() => onOpenInfo()}
          aria-label="¿Qué es este formato?"
          title={`¿Qué es un ${kind}?`}
        >
          <HelpOutlineIcon className="me-1" />
          ¿Qué es un {kind}?
        </button>
        <button className="btn btn-outline-secondary rounded-3" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};






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
              
                    {groupSupersets(modifiedDay).map((element, idx) => {
  // ⚠️ Usar el peso del elemento para calcular columnas (antes estaba element.reps)
  const { setsCol, repsCol, pesoCol, restCol } = getCols(element.peso);
  const isExercise = element.type === 'exercise';
  const isBlock = element.type === 'block';
  const isSuperset = element.type === 'superset';
const number = isSuperset
  ? element.baseNumber
  : (element.numberExercise || element.numberCircuit);
  const name = typeof element.name === 'object' ? element.name.name : element.name;
  const backoffLabel =
    (element.name?.titleName && element.name.titleName.trim() !== "")
      ? element.name.titleName
      : "Back off";

  return (
    <div
      key={isSuperset ? `sup-${element.baseNumber}-${idx}` : `${element.exercise_id || element._id || idx}-${idx}`}
      ref={el => (cardRefs.current[idx] = el)}
      className="px-0 mb-3"
    >
      <div className="row justify-content-center bg-light border rounded-2 m-0 mb-3">
        {/* — CABECERA (número + nombre) — */}
        <div
          className={`col-12 ${element.type !== 'block' && element.type !== 'superset' ? 'widgetNumber' : 'widgetNumberSuperSet'} py-2`}
          style={{ backgroundColor: element.type == 'block' && element.color }}
        >
          <div className="row justify-content-center">
            <div className="col-1 m-auto text-light">
              {renderNumberIcon(number)}
            </div>

            <div className="col-10 m-auto text-start">
              <p className="stylesNameExercise text-light mb-0" id={idx === 0 ? 'nombre' : null}>
                {isExercise
                  ? name
                  : isBlock
                    ? <span>{element.name}</span>
                    : isSuperset
                      ? (
                        <span>
                          Superserie
                          <small className="ms-2">
                            ({element.exercises.map(e => e.supSuffix).join(' · ')})
                          </small>
                        </span>
                      )
                      : <span>Circuito</span>}
              </p>
            </div>
          </div>
        </div>

{isExercise ? (
  /* ====== EJERCICIO NORMAL (igual que lo tenías) ====== */
  <>
    <div className={`${setsCol} p-0 mt-4 pt-2 mb-2`}>
      <span className="stylesBadgesItemsExerciseSpan d-block">{element.sets}</span>
      <p className="fontStylesSpan">Sets</p>
    </div>

    <div className={`${repsCol} p-0 mt-4 pt-2 mb-2`}>
      {Array.isArray(element.reps) ? (
        <span className="stylesBadgesItemsExerciseSpan border-1 d-block">
          {element.reps.map((r, i) => (
            <React.Fragment key={i}>
              <span className="stylesBadgesItemsExerciseSpan arrayBadge">{r}</span>
              {i < element.reps.length - 1 && <span>-</span>}
            </React.Fragment>
          ))}
        </span>
      ) : (
        <span className="stylesBadgesItemsExerciseSpan border-1 d-block">{element.reps}</span>
      )}
      <p className="fontStylesSpan">Reps</p>
    </div>

    <div className={`${pesoCol} p-0 mt-4 pt-2 mb-2`}>
      <span className="stylesBadgesItemsExerciseSpan d-block">{element.peso ? element.peso : '-'}</span>
      <p className="fontStylesSpan">Peso</p>
    </div>

    <div className={`${restCol} p-0 mt-3 mb-2`}>
      <CountdownTimer initialTime={element.rest} />
      <p className="fontStylesSpan mt-2 mb-1">Descanso</p>
    </div>
  </>
) : isSuperset ? (
  /* ====== SUPERSERIE A NIVEL TOPE ====== */
  <>
    {element.exercises.map((ex, j) => {
      const innerName = typeof ex.name === 'object' ? ex.name.name : ex.name;
      const cols = getCols(ex.peso);
      const blockBackoffLabel =
        (ex?.name?.titleName && ex.name.titleName.trim() !== "") ? ex.name.titleName : "Back off";

      return (
        <React.Fragment key={`sup-${element.baseNumber}-${j}`}>
          <div className="col-12 mb-2 mb-3 shadow-personalized">
            <div className="row justify-content-around rounded-2 p-2 align-items-center">
              <div className="col-1 text-center">
                <span className="badge text-light border bg-dark">{ex.supSuffix}</span>
              </div>
              <div className="col-11 text-start">{innerName}</div>

              <div className={`${cols.setsCol} p-0 mt-3 mb-2`}>
                <span className="stylesBadgesItemsExerciseSpan d-block">{ex.sets}</span>
                <div className="fontStylesSpan">Sets</div>
              </div>

              <div className={`${cols.repsCol} p-0 mt-3 mb-2`}>
                {Array.isArray(ex.reps)
                  ? ex.reps.map((r, k) => (
                      <React.Fragment key={k}>
                        <span className="stylesBadgesItemsExerciseSpan arrayBadge">{r}</span>
                        {k < ex.reps.length - 1 && <span className="">-</span>}
                      </React.Fragment>
                    ))
                  : <span className="stylesBadgesItemsExerciseSpan">{ex.reps}</span>}
                <div className="fontStylesSpan">Reps</div>
              </div>

              <div className={`${cols.pesoCol} p-0 mt-3 mb-2`}>
                <span className="stylesBadgesItemsExerciseSpan d-block">{ex.peso || '-'}</span>
                <div className="fontStylesSpan">Peso</div>
              </div>

              <div className={`${cols.restCol} p-0 mt-3 mb-2`}>
                <CountdownTimer initialTime={ex.rest} />
                <div className="fontStylesSpan mt-1 mb-1">Descanso</div>
              </div>
            </div>

            {ex.name?.approximations?.length > 0 && (
              <>
                <span className="styleInputsNote-back ">{ex.name.approxTitle ?? 'Aproximaciones'}</span>
                <div className="colorNote3 py-2 rounded-1">
                  {ex.name.approximations.map((ap, i) => (
                    <div className="row my-1" key={i}>
                      <span className="fs07em text-muted col-6"><b>{i + 1}°</b> aproximación -</span>
                      <p className="mb-0 col-5 text-start">{ap.reps} reps / {ap.peso}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {ex.name?.backoff?.length > 0 && (
              <>
                <span className="styleInputsNote-back m-auto">{blockBackoffLabel}</span>
                <div className="colorNote2 py-2 rounded-1 mb-2">
                  {ex.name.backoff.map((line, i) => (
                    <p key={i} className="mb-0 ">{line.sets}×{line.reps} / {line.peso}</p>
                  ))}
                </div>
              </>
            )}

            {ex.notas && (
              <>
                <span className="styleInputsNote-back text-start">Notas / otros</span>
                <div className="colorNote py-2 rounded-1" style={{ whiteSpace: 'pre-wrap' }}>
                  <p className="pb-0 mb-0">{ex.notas}</p>
                </div>
              </>
            )}

            {/* Edita usando índice real del array original */}
            <div className="row justify-content-between align-items-center mt-2 px-2">
              <div className="col-auto"><Contador max={ex.sets} /></div>
              <div className="col-auto">
                <IconButton aria-label="video" disabled={!ex.video} onClick={() => handleButtonClick(ex)}>
                  {ex.isImage
                    ? <ImageIcon className={ex.video ? 'imageIcon' : 'imageIconDisabled'} />
                    : <YouTubeIcon className={ex.video ? 'ytColor' : 'ytColor-disabled'} />}
                </IconButton>
              </div>
              <div className="col-auto">
                <IconButton aria-label="editar" onClick={() => handleEditMobileExercise(ex, ex._origIndex)}>
                  <EditNoteIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    })}
  </>
) : isBlock ? (
  /* ====== BLOQUE: soporta superseries internas ====== */
  groupSupersets(element.exercises, { forBlock: true }).map((ex, j) => {
    const isInnerExercise = ex.type === 'exercise';
    const isInnerSuperset = ex.type === 'superset';
    const innerNumber = ex.numberExercise ?? ex.numberCircuit;
    const innerName = isInnerExercise
      ? (typeof ex.name === 'object' ? ex.name.name : ex.name)
      : (ex.type || 'Circuito');
  // 👇 Detecta si este item es un CIRCUITO dentro del bloque
  const nc = normalizeCircuit(ex);                // normaliza AMRAP/EMOM/.../Libre
  const kind = nc.circuitKind;
  const isInnerCircuit =
    !isInnerExercise &&
    !isInnerSuperset &&
    (
      Array.isArray(ex?.circuit) ||               // trae lista de ejercicios
      ['AMRAP','EMOM','E2MOM','E3MOM','Intermitentes','Tabata','Por tiempo','Libre'].includes(kind)
    );

    // 👇 Si es circuito dentro del bloque, lo pinto similar al "circuito suelto"
    if (isInnerCircuit) {
      return (
        <div key={`blkcirc-${idx}-${j}`} className="col-12 mb-2 mb-4 shadow-personalized">
          <div className="row justify-content-around rounded-2 p-2 align-items-center">
            <div className="col-1 text-center">{renderNumberIcon(innerNumber)}</div>
            <div className="col-7 text-start fw-semibold">
              {circuitSubtitle(nc)}
            </div>
            <div className="col-4 text-end">
              <button
                className="btn btn-sm btn-dark"
                onClick={() => openTimerForCircuit({ ...nc, freeConfig: { ...freeTimerConfig } })}
              >
                Iniciar
              </button>
            </div>
          </div>

          <table className="table border-0 mb-0">
            <thead>
              <tr>
                <th className="border-0 text-start">Nombre</th>
                <th className="border-0">Reps</th>
                <th className="border-0">Peso</th>
                <th className="border-0">Video</th>
              </tr>
            </thead>
            <tbody>
              {(ex.circuit || []).map((cItem, k) => (
                <tr key={cItem.idRefresh || k}>
                  <td className="border-0 text-start">{cItem.name || '-'}</td>
                  <td className="border-0">{cItem.reps ?? '-'}</td>
                  <td className="border-0">{cItem.peso ?? '-'}</td>
                  <td className="border-0 pt-0 pb-3">
                  
                      <IconButton
                        id={idx === 0 ? 'video' : null}
                        aria-label="video"
                        disabled={!cItem.video}
                        className="p-0"
                        onClick={() => handleButtonClick(cItem)}
                      >
                        {cItem.isImage
                          ? <ImageIcon className={!cItem.video ? 'imageIconDisabled' : 'imageIcon'} />
                          : <YouTubeIcon className={cItem.video ? 'ytColor' : 'ytColor-disabled'} />
                        }
                      </IconButton>
                   
                  </td>
                </tr>
              ))}
              <tr >
                <td colSpan={3} className="border-0">
                      {ex.notas && (
                      <div className="rounded-2">
                        <span className=" text-start mb-2 pb-2">Notas / otros</span>
                        <div
                          className="colorNote py-2 mb-2 pb-2 rounded-1 "
                          style={{ whiteSpace: 'pre-wrap' }}
                        >
                          <p className="pb-0 mb-0">{ex.notas}</p>
                        </div>
                      </div>
                    )}
                </td>

                </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (isInnerSuperset) {
      // --- Superserie dentro de bloque ---
      return (
        <div key={`blksup-${idx}-${j}`} className="col-12 mb-2 mb-4 shadow-personalized">
          <div className="row justify-content-between align-items-center mb-2 px-2">
            <div className="col text-start fw-semibold mt-2 widgetNumberSuperSet py-1 text-light rounded-1">
              Superserie
              <small className="ms-2">({ex.exercises.map(s => s.supSuffix).join(' · ')})</small>
            </div>
          </div>

          {ex.exercises.map((s, k) => {
            const cols = getCols(s.peso);
            const blockBackoffLabel =
              (s?.name?.titleName && s.name.titleName.trim() !== "") ? s.name.titleName : "Back off";
            return (
              <div key={`blksup-${idx}-${j}-${k}`} className="row justify-content-center rounded-2 py-2 align-items-center mb-2">
                <div className="col-1 text-center">
                  <span className="badge rounded-1 bg-dark">{s.supSuffix}</span>
                </div>

                <div className="col-11  text-start">
                  {typeof s.name === 'object' ? s.name.name : s.name}
                </div>

                <div className={`${cols.setsCol} p-0 mt-3 mb-2`}>
                  <span className="stylesBadgesItemsExerciseSpan d-block">{s.sets}</span>
                  <div className="fontStylesSpan">Sets</div>
                </div>

                <div className={`${cols.repsCol} p-0 mt-3 mb-2`}>
                  {Array.isArray(s.reps)
                    ? s.reps.map((r, kk) => (
                        <React.Fragment key={kk}>
                          <span className="stylesBadgesItemsExerciseSpan arrayBadge">{r}</span>
                          {kk < s.reps.length - 1 && <span className="">-</span>}
                        </React.Fragment>
                      ))
                    : <span className="stylesBadgesItemsExerciseSpan">{s.reps}</span>}
                  <div className="fontStylesSpan">Reps</div>
                </div>

                <div className={`${cols.pesoCol} p-0 mt-3 mb-2`}>
                  <span className="stylesBadgesItemsExerciseSpan d-block">{s.peso || '-'}</span>
                  <div className="fontStylesSpan">Peso</div>
                </div>

                <div className={`${cols.restCol} p-0 mt-3 mb-2`}>
                  <CountdownTimer initialTime={s.rest} />
                  <div className="fontStylesSpan mt-1 mb-1">Descanso</div>
                </div>

                {/* Notas / backoff / aprox */}
                {s.name?.approximations?.length > 0 && (
                  <>
                    <span className="styleInputsNote-back ">{s.name.approxTitle ?? 'Aproximaciones'}</span>
                    <div className="colorNote3 py-2 rounded-1">
                      {s.name.approximations.map((ap, i) => (
                        <div className="row my-1" key={i}>
                          <span className="fs07em text-muted col-6"><b>{i + 1}°</b> aproximación -</span>
                          <p className="mb-0 col-5 text-start">{ap.reps} reps / {ap.peso}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {s.name?.backoff?.length > 0 && (
                  <>
                    <span className="styleInputsNote-back m-auto">{blockBackoffLabel}</span>
                    <div className="colorNote2 py-2 rounded-1 mb-2">
                      {s.name.backoff.map((line, i) => (
                        <p key={i} className="mb-0 ">{line.sets}×{line.reps} / {line.peso}</p>
                      ))}
                    </div>
                  </>
                )}

                {s.notas && (
                  <>
                    <span className="styleInputsNote-back text-start">Notas / otros</span>
                    <div className="colorNote py-2 rounded-1" style={{ whiteSpace: 'pre-wrap' }}>
                      <p className="pb-0 mb-0">{s.notas}</p>
                    </div>
                  </>
                )}

                {/* Edita usando índice real dentro del bloque */}
                <div className="row justify-content-between align-items-center mt-2 px-2">
                  <div className="col-auto"><Contador max={s.sets} /></div>
                  <div className="col-auto">
                    <IconButton aria-label="video" disabled={!s.video} onClick={() => handleButtonClick(s)}>
                      {s.isImage
                        ? <ImageIcon className={s.video ? 'imageIcon' : 'imageIconDisabled'} />
                        : <YouTubeIcon className={s.video ? 'ytColor' : 'ytColor-disabled'} />}
                    </IconButton>
                  </div>
                  <div className="col-auto">
                    <IconButton aria-label="editar" onClick={() => handleEditMobileBlockExercise(s, idx, s._origIndexInBlock)}>
                      <EditNoteIcon />
                    </IconButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // --- Caso ejercicio normal dentro del bloque (lo tuyo de antes) ---
    const cols = isInnerExercise ? getCols(ex.peso) : null;
    const blockBackoffLabel =
      (ex?.name?.titleName && ex.name.titleName.trim() !== "") ? ex.name.titleName : "Back off";

    return (
      <React.Fragment key={ex.exercise_id || ex._id || j}>
        <div className="col-12 mb-2 mb-4 shadow-personalized">
          <div className="row justify-content-around rounded-2 p-2 align-items-center">
            <div className="col-1 text-center">{renderNumberIcon(innerNumber)}</div>
            <div className="col-11 text-start">{innerName}</div>

            {/* métricas */}
            {isInnerExercise && (
              <>
                <div className={`${cols.setsCol} p-0 mt-4 mb-2`}>
                  <span className="stylesBadgesItemsExerciseSpan d-block">{ex.sets}</span>
                  <div className="fontStylesSpan">Sets</div>
                </div>
                <div className={`${cols.repsCol} p-0 mt-4 mb-2`}>
                  {Array.isArray(ex.reps)
                    ? ex.reps.map((r, k) => (
                        <React.Fragment key={k}>
                          <span className="stylesBadgesItemsExerciseSpan arrayBadge">{r}</span>
                          {k < ex.reps.length - 1 && <span className="">-</span>}
                        </React.Fragment>
                      ))
                    : <span className="stylesBadgesItemsExerciseSpan">{ex.reps}</span>}
                  <div className="fontStylesSpan">Reps</div>
                </div>
                <div className={`${cols.pesoCol} p-0 mt-4 mb-2`}>
                  <span className="stylesBadgesItemsExerciseSpan d-block">{ex.peso || '-'}</span>
                  <div className="fontStylesSpan">Peso</div>
                </div>
                <div className={`${cols.restCol} p-0 mt-3 mb-2`}>
                  <CountdownTimer initialTime={ex.rest} />
                  <div className="fontStylesSpan mt-1 mb-1">Descanso</div>
                </div>
              </>
            )}
          </div>

          {/* Aproximaciones / Backoff / Notas */}
          {isInnerExercise && ex.name?.approximations?.length > 0 && (
            <>
              <span className="styleInputsNote-back ">{ex.name.approxTitle ?? 'Aproximaciones'}</span>
              <div className="colorNote3 py-2 rounded-1 ">
                {ex.name.approximations.map((ap, i) => (
                  <div className="row my-1" key={i}>
                    <span className="fs07em text-muted col-6"><b>{i + 1}°</b> aproximación -</span>
                    <p className="mb-0 col-5 text-start">{ap.reps} reps / {ap.peso}</p>
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
                  <p key={i} className="mb-0 ">{line.sets}×{line.reps} / {line.peso}</p>
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

          {isInnerExercise && (
            <div className="row justify-content-between align-items-center mt-2 px-2">
              <div className="col-auto"><Contador max={ex.sets} /></div>
              <div className="col-auto">
                <IconButton aria-label="video" disabled={!ex.video} onClick={() => handleButtonClick(ex)}>
                  {ex.isImage
                    ? <ImageIcon className={ex.video ? 'imageIcon' : 'imageIconDisabled'} />
                    : <YouTubeIcon className={ex.video ? 'ytColor' : 'ytColor-disabled'} />}
                </IconButton>
              </div>
              <div className="col-auto">
                <IconButton aria-label="editar" onClick={() => handleEditMobileBlockExercise(ex, idx, j)}>
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
  /* ====== CIRCUITO SUELTO ====== */
  <div className="col-12 p-0 mt-4 mb-2">
    <CircuitHeader
     circuit={normalizeCircuit(element)}
     onAdjust={() => setShowFreeTimerSetup(true)}
     onStart={(c) => openTimerForCircuit({ ...c, freeConfig: { ...freeTimerConfig } })} />
    <table className="table border-0">
      <thead>
        <tr>
          <th className="border-0 text-start">Nombre</th>
          <th className="border-0">Reps</th>
          <th className="border-0">Peso</th>
          <th className="border-0">Video</th>
        </tr>
      </thead>
      <tbody>
        {element.circuit.map(c => (
          <tr key={c.idRefresh}>
            <td className="border-0 text-start">{c.name}</td>
            <td className="border-0 px-0">{c.reps}</td>
            <td className="border-0">{c.peso}</td>
            <td className="border-0 pt-0 pb-3"> 
                <IconButton
                  id={idx === 0 ? 'video' : null}
                  aria-label="video"
                  disabled={!c.video}
                  className="p-0"
                  onClick={() => handleButtonClick(c)}
                >
                  {c.isImage
                    ? <ImageIcon className={!c.video ? 'imageIconDisabled' : 'imageIcon'} />
                    : <YouTubeIcon className={c.video ? 'ytColor' : 'ytColor-disabled'} />
                  }
                </IconButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
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
                                    {getPlainName(selectedObject.name)}
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

                   <Dialog
                      visible={showTimerDialog}
                      onHide={() => setShowTimerDialog(false)}
                      style={{ width: '95vw', maxWidth: '820px' }}
                      className="timerDialog "
                      closable={false}   // ocultamos la X por defecto: usamos la de TimerHeader
                      draggable
                      header={
                         activeCircuit ? (
                           <TimerHeader
                             circuit={activeCircuit}
                             onClose={() => setShowTimerDialog(false)}
                             onOpenSettings={() => setShowPrepSettings(true)}
                           />
                         ) : null
                       }
                    >
  {activeCircuit && (
    <div className="p-0">
      <TimerDialog
         circuit={activeCircuit}
         prepSeconds={prepSeconds}
         onOpenInfo={() => openCircuitInfo(activeCircuit)}
         onClose={() => setShowTimerDialog(false)}
       />
    </div>
  )}
</Dialog>

<Dialog
  header="Ajustes del temporizador"
  visible={showPrepSettings}
  style={{ width: '90vw', maxWidth: 420 }}
  modal
  onHide={() => setShowPrepSettings(false)}
  draggable
>
  <div className="mb-3">
    <label className="form-label">Segundos de preparación</label>
    <input
      type="number"
      min={1}
      max={300}
      className="form-control"
      defaultValue={prepSeconds}
      onChange={(e) => {
        const v = Math.max(1, Math.min(300, Math.floor(Number(e.target.value))));
        // Actualizo solo el control local; el guardado efectivo va con "Guardar"
        e.target.dataset.pending = String(v);
      }}
      onFocus={(e) => { e.target.dataset.pending = String(prepSeconds); }}
    />
    <small className="text-muted d-block mt-1">Por defecto: 10s. Rango permitido: 1–300s.</small>
  </div>

  { (activeCircuit?.circuitKind === 'Libre') && (
      <>
        <hr />
        <div className="mb-2 fw-semibold">Libre · Ajustar valores</div>

        <div className="mb-3">
          <label className="form-label d-block">Modo</label>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${freeTimerConfig.mode === 'timer' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFreeTimerConfig(v => ({ ...v, mode: 'timer' }))}
            >Temporizador</button>
            <button
              type="button"
              className={`btn btn-sm ${freeTimerConfig.mode === 'chrono' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFreeTimerConfig(v => ({ ...v, mode: 'chrono' }))}
            >Cronómetro</button>
          </div>
        </div>

        {freeTimerConfig.mode === 'timer' && (
          <>
            <div className="mb-3">
              <label className="form-label d-block">Esquema</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${freeTimerConfig.schema === 'intermitente' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setFreeTimerConfig(v => ({ ...v, schema: 'intermitente' }))}
                >Intermitente (Work/Rest)</button>
                <button
                  type="button"
                  className={`btn btn-sm ${freeTimerConfig.schema === 'amrap' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setFreeTimerConfig(v => ({ ...v, schema: 'amrap' }))}
                >AMRAP (duración)</button>
              </div>
            </div>

            {freeTimerConfig.schema === 'intermitente' ? (
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label">Work (s)</label>
                  <input type="number" min={1} className="form-control"
                    value={freeTimerConfig.workSec}
                    onChange={e => setFreeTimerConfig(v => ({ ...v, workSec: Math.max(1, Number(e.target.value||1)) }))}/>
                </div>
                <div className="col-4">
                  <label className="form-label">Rest (s)</label>
                  <input type="number" min={1} className="form-control"
                    value={freeTimerConfig.restSec}
                    onChange={e => setFreeTimerConfig(v => ({ ...v, restSec: Math.max(1, Number(e.target.value||1)) }))}/>
                </div>
                <div className="col-4">
                  <label className="form-label">Rondas</label>
                  <input type="number" min={1} className="form-control"
                    value={freeTimerConfig.totalRounds}
                    onChange={e => setFreeTimerConfig(v => ({ ...v, totalRounds: Math.max(1, Number(e.target.value||1)) }))}/>
                </div>
              </div>
            ) : (
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Minutos</label>
                  <input type="number" min={1} className="form-control"
                    value={freeTimerConfig.totalMinutes}
                    onChange={e => setFreeTimerConfig(v => ({ ...v, totalMinutes: Math.max(1, Number(e.target.value||1)) }))}/>
                </div>
              </div>
            )}
          </>
        )}
      </>
    )}

  <div className="d-flex justify-content-end gap-2">
    <button className="btn btn-outline-light" onClick={() => setShowPrepSettings(false)}>Cancelar</button>
    <button
      className="btn text-light"
      style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}
      onClick={(e) => {
        const input = e.currentTarget.closest('.p-dialog').querySelector('input[type="number"]');
        const pending = Number(input?.dataset?.pending ?? prepSeconds);
        writePrepSeconds(pending);
        if (activeCircuit?.circuitKind === 'Libre') {
          setActiveCircuit(prev => prev ? ({ ...prev, freeConfig: { ...freeTimerConfig } }) : prev);
        }
        setPrepSeconds(readPrepSeconds()); // relee para robustez
        setShowPrepSettings(false);
        try { Notify?.instantToast?.('Ajuste guardado'); } catch {}
      }}
    >
      Guardar
    </button>
  </div>
</Dialog>

<Dialog
  header={`¿Qué es un ${circuitInfoTitle}?`}
  visible={showCircuitInfo}
  style={{ width: '90vw', maxWidth: 520 }}
  modal
  onHide={() => setShowCircuitInfo(false)}
  draggable
>
  <div className="text-body">
    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{circuitInfoText}</p>
  </div>

  <div className="d-flex justify-content-end mt-3">
    <button className="btn btn-outline-light" onClick={() => setShowCircuitInfo(false)}>Entendido</button>
  </div>
</Dialog>


<Dialog
    header="Ajustar valores (Libre)"
    visible={showFreeTimerSetup}
    style={{ width: '90vw', maxWidth: 520 }}
    modal
    onHide={() => setShowFreeTimerSetup(false)}
    draggable
  >
    <div className="mb-3">
      <label className="form-label d-block">Modo</label>
      <div className="d-flex gap-2">
        <button
          className={`btn btn-sm ${freeTimerConfig.mode === 'timer' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setFreeTimerConfig(v => ({ ...v, mode: 'timer' }))}
        >
          Temporizador
        </button>
        <button
          className={`btn btn-sm ${freeTimerConfig.mode === 'chrono' ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => setFreeTimerConfig(v => ({ ...v, mode: 'chrono' }))}
        >
          Cronómetro
        </button>
      </div>
    </div>

    {freeTimerConfig.mode === 'timer' && (
      <>
        <div className="mb-3">
          <label className="form-label d-block">Esquema</label>
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${freeTimerConfig.schema === 'intermitente' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFreeTimerConfig(v => ({ ...v, schema: 'intermitente' }))}
            >
              Intermitente (Work/Rest)
            </button>
            <button
              className={`btn btn-sm ${freeTimerConfig.schema === 'amrap' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFreeTimerConfig(v => ({ ...v, schema: 'amrap' }))}
            >
              AMRAP (duración)
            </button>
          </div>
        </div>

        {freeTimerConfig.schema === 'intermitente' ? (
          <div className="row g-2">
            <div className="col-4">
              <label className="form-label">Work (s)</label>
              <input type="number" min={1} className="form-control"
                value={freeTimerConfig.workSec}
                onChange={e => setFreeTimerConfig(v => ({ ...v, workSec: Math.max(1, Number(e.target.value||1)) }))}/>
            </div>
            <div className="col-4">
              <label className="form-label">Rest (s)</label>
              <input type="number" min={1} className="form-control"
                value={freeTimerConfig.restSec}
                onChange={e => setFreeTimerConfig(v => ({ ...v, restSec: Math.max(1, Number(e.target.value||1)) }))}/>
            </div>
            <div className="col-4">
              <label className="form-label">Rondas</label>
              <input type="number" min={1} className="form-control"
                value={freeTimerConfig.totalRounds}
                onChange={e => setFreeTimerConfig(v => ({ ...v, totalRounds: Math.max(1, Number(e.target.value||1)) }))}/>
            </div>
          </div>
        ) : (
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label">Minutos</label>
              <input type="number" min={1} className="form-control"
                value={freeTimerConfig.totalMinutes}
                onChange={e => setFreeTimerConfig(v => ({ ...v, totalMinutes: Math.max(1, Number(e.target.value||1)) }))}/>
            </div>
          </div>
        )}
      </>
    )}

    <div className="d-flex justify-content-end gap-2 mt-3">
      <button className="btn btn-outline-light" onClick={() => setShowFreeTimerSetup(false)}>Cancelar</button>
      <button
        className="btn text-light"
        style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}
        onClick={() => setShowFreeTimerSetup(false)}
      >
        Guardar
      </button>
    </div>
  </Dialog>

            </section>
        </>
    );
}

export default DayDetailsPage;
