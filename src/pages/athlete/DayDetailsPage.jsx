import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Fragment } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom"; // Se agrego useNavigate
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
import PercentageCalculator from "../../components/PercentageCalculator.jsx";
import Formulas from "../../components/Formulas.jsx";
import CountdownTimer from "../../components/CountdownTimer.jsx";
import ExerciseComparisonChart from "../../components/ExerciseComparisonChart.jsx";
import PlateCounterTool from "../../components/PlateCounterTool.jsx";
import AttemptPlannerTool from "../../components/AttemptPlannerTool.jsx";
import TechnicalLogTool from "../../components/TechnicalLogTool.jsx";
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

import {
  Video,
  NotebookText,
  Pencil,
  ArrowUp10,
  Ellipsis
} from 'lucide-react';
import { normalizeOpenersPlans } from "../../helpers/openersPlanner.js";

const ATHLETE_TOOL_OPTIONS = [
  { label: "Calculadora", value: "calculator" },
  { label: "Contador de discos", value: "plates" },
  { label: "Estadisticas", value: "stats" },
  { label: "1RM estimado", value: "pr" },
  { label: "Plan de competencia", value: "openers" },
  { label: "Bitacora tecnica", value: "technical_log" },
];

const parseColorToRgb = (color) => {
  if (!color || typeof color !== 'string') return null;
  const value = color.trim();

  const hex = value.replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return hex.split('').map((part) => parseInt(`${part}${part}`, 16));
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }

  const rgbMatch = value.match(/rgba?\(\s*(\d+)(?:,|\s)+(\d+)(?:,|\s)+(\d+)/i);
  if (rgbMatch) {
    return [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map((part) =>
      Math.max(0, Math.min(255, Number(part)))
    );
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const probe = document.createElement('span');
    probe.style.color = value;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const computed = window.getComputedStyle(probe).color;
    document.body.removeChild(probe);

    const computedMatch = computed.match(/rgba?\(\s*(\d+)(?:,|\s)+(\d+)(?:,|\s)+(\d+)/i);
    if (computedMatch) {
      return [computedMatch[1], computedMatch[2], computedMatch[3]].map((part) =>
        Math.max(0, Math.min(255, Number(part)))
      );
    }
  }

  return null;
};

const getReadableTextColor = (backgroundColor, fallback = '#0f172a') => {
  const rgb = parseColorToRgb(backgroundColor);
  if (!rgb) return fallback;

  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.48 ? '#0f172a' : '#ffffff';
};

// Mantener pantalla despierta mientras el timer este abierto
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
      // Puede fallar sin gesto del usuario o si el doc no esta visible: reintentamos en los listeners de abajo
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

    const [idxDay, setIdxDay] = useState();
    const [day_id, setDay_id] = useState();
    const [allDays, setAllDays] = useState([]); 
    const [modifiedDay, setModifiedDay] = useState([]);
    const [nameWeek, setNameWeek] = useState();
    const [firstValue, setFirstValue] = useState();
    const [status, setStatus] = useState(false);
    const [currentDay, setCurrentDay] = useState(0);
    const [editExerciseMobile, setEditExerciseMobile] = useState(false);
    const [completeExercise, setCompleteExercise] = useState();
    const [showToolsDialog, setShowToolsDialog] = useState(false);
    const [selectedTool, setSelectedTool] = useState("calculator");
    const [selectedOpenersPlanId, setSelectedOpenersPlanId] = useState("");
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
    useScreenWakeLock(showTimerDialog);
    const [dismissUnsavedBanner, setDismissUnsavedBanner] = useState(false);
    // â¬‡ï¸Ž NUEVO: dialogo informativo de circuitos
    const [showCircuitInfo, setShowCircuitInfo] = useState(false);
    const [circuitInfoTitle, setCircuitInfoTitle] = useState('');
    const [circuitInfoText, setCircuitInfoText] = useState('');

    const [modeLight, setModeLight] = useState('');

    const athleteOpenersPlans = useMemo(
      () =>
        normalizeOpenersPlans(
          userProfile?.openers_plans || userProfile?.openersPlans || []
        ),
      [userProfile]
    );

    const selectedOpenersPlan = useMemo(() => {
      if (!athleteOpenersPlans.length) return null;
      return (
        athleteOpenersPlans.find((plan) => plan.id === selectedOpenersPlanId) ||
        athleteOpenersPlans[0]
      );
    }, [athleteOpenersPlans, selectedOpenersPlanId]);


    const weeklySnapshotRef = useRef(null);
    const [weeklyDialogNonce, setWeeklyDialogNonce] = useState(0);
    const isXS = typeof window !== 'undefined' && window.innerWidth < 576;
    const openNextFrame = (fn) => (typeof window !== 'undefined'
      ? requestAnimationFrame(() => setTimeout(fn, 0))
      : fn());
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 576; 

    const serverExercisesRef = useRef(null);
    const serverWeeklyRef = useRef(null);
    const serverDriveRef = useRef(null);
    const serverTechnicalLogRef = useRef([]);
    const technicalLogSaveTimeoutRef = useRef(null);
    const offlineFlushInFlightRef = useRef(false);

    const [exercisesPending, setExercisesPending] = useState(false);
    const [weeklyPending, setWeeklyPending] = useState(false);
    const [drivePending, setDrivePending] = useState(false);
    const [technicalLogPending, setTechnicalLogPending] = useState(false);

    const [exercisesLastFail, setExercisesLastFail] = useState('');
    const [weeklyLastFail, setWeeklyLastFail] = useState('');
    const [driveLastFail, setDriveLastFail] = useState('');
    const [technicalLogLastFail, setTechnicalLogLastFail] = useState('');
    const [technicalLogEntries, setTechnicalLogEntries] = useState([]);

    const THEME_KEY = "theme"; // "dark" | "light"

// lee: localStorage > prefers-color-scheme
const readTheme = () => {
  try {
    const saved = (localStorage.getItem(THEME_KEY) || "").toLowerCase().trim();
    if (saved === "dark") return true;
    if (saved === "light") return false;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
};

const [isDark, setIsDark] = useState(() => {
  if (typeof window === "undefined") return false;
  return readTheme();
});
const athleteDialogClass = isDark ? "athlete-dialog-dark" : "";

useEffect(() => {
  if (!athleteOpenersPlans.length) {
    setSelectedOpenersPlanId("");
    return;
  }
  setSelectedOpenersPlanId((prev) => {
    if (prev && athleteOpenersPlans.some((plan) => plan.id === prev)) return prev;
    return athleteOpenersPlans[0].id;
  });
}, [athleteOpenersPlans]);

useEffect(() => {
  const apply = () => setIsDark(readTheme());

  apply();

  // Si cambias el theme en otra pestana
  const onStorage = (e) => {
    if (!e || e.key === THEME_KEY) apply();
  };

  // Si cambia el prefers-color-scheme del SO
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onMQ = () => apply();

  window.addEventListener("storage", onStorage);
  mq?.addEventListener?.("change", onMQ);

  return () => {
    window.removeEventListener("storage", onStorage);
    mq?.removeEventListener?.("change", onMQ);
  };
}, []);

    useEffect(() => {
      const read = () => {
        const enabled = localStorage.getItem("mobileDarkMode") === "true";
        const isMobile = window.matchMedia("(max-width: 991px)").matches; // si queres mobile-only
        setIsDark(enabled /* && isMobile */);
      };

      read();
      window.addEventListener("mobileDarkModeChange", read);
      window.addEventListener("resize", read);

      return () => {
        window.removeEventListener("mobileDarkModeChange", read);
        window.removeEventListener("resize", read);
      };
    }, []);

    const exercisesDraftKey = React.useMemo(() => {
      if (!id || !week_id || !day_id) return null;
      return `draft:exercises:${id}:${week_id}:${day_id}`;
    }, [id, week_id, day_id]);

    const weeklyDraftKey = React.useMemo(() => {
      if (!id) return null;
      return `draft:weeklySummary:${id}`;
    }, [id]);

    const driveDraftKey = React.useMemo(() => {
      if (!id) return null;
      return `draft:driveLink:${id}`;
    }, [id]);

    const technicalLogDraftKey = React.useMemo(() => {
      if (!id) return null;
      return `draft:technicalLog:${id}`;
    }, [id]);

     // Config de circuito libre (ajustable por el alumno)
  const [freeTimerConfig, setFreeTimerConfig] = useState({
    mode: 'timer',          // 'timer' (cuenta regresiva) | 'chrono' (cuenta ascendente)
    schema: 'intermitente', // 'intermitente' (work/rest x rondas) | 'amrap' (duracion continua)
    workSec: 30,
    restSec: 30,
    totalRounds: 10,
    totalMinutes: 12
  });
  const [showFreeTimerSetup, setShowFreeTimerSetup] = useState(false);

useEffect(() => {
  if (!(exercisesPending || weeklyPending || drivePending || technicalLogPending)) {
    setDismissUnsavedBanner(false);
  }
}, [exercisesPending, weeklyPending, drivePending, technicalLogPending]);

useEffect(() => {
  return () => {
    if (technicalLogSaveTimeoutRef.current) {
      clearTimeout(technicalLogSaveTimeoutRef.current);
    }
  };
}, []);

const CIRCUIT_EXPLANATIONS = {
  Libre: (
    <div>
      <div className="mb-2">
        <span className="badge text-bg-dark me-2">LIBRE</span>
        Trabajo <b>libre</b> sin estructura fija de intervalos.
      </div>
      <ul className="mb-2 ps-3">
        <li>Segui las indicaciones del entrenador sobre <b>series</b>, <b>reps</b> y <b>descansos</b>.</li>
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
        <li><b>Ejemplo:</b> En caso de que tengas 3 ejercicios, completa el ejercicio A, B, C, y luego, vuelve a empezar hasta cumplir el tiempo.</li>
      </ul>
    </div>
  ),

  EMOM: (
    <div>
      <div className="mb-2 text-center">
        <b className="d-block">Every Minute On the Minute</b><b>Cada minuto en el minuto</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li>Al inicio de <b>cada minuto</b> haces lo indicado; <b>descansas</b> con el tiempo restante.</li>
        <li><b>Ejemplo:</b> Tenes 2 ejercicios. Logras realizar el ejercicio A y B en 30s, por lo tanto te quedan 30s de descanso.</li>
      </ul>
    </div>
  ),

  E2MOM: (
        <div>
      <div className="mb-2 text-center">
        <b className="d-block">Every 2 Minutes On the Minute</b><b>Cada 2 minutos en el minuto</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li>Al inicio de <b>cada 2 minutos</b> haces lo indicado; <b>descansas</b> con el tiempo restante.</li>
        <li><b>Ejemplo:</b> Tenes 2 ejercicios. Logras realizar el ejercicio A y B en 1min, por lo tanto te queda 1min de descanso.</li>
      </ul>
    </div>
  ),

  E3MOM: (
        <div>
      <div className="mb-2 text-center">
        <b className="d-block">Every 3 Minutes On the Minute</b><b>Cada 3 minutos en el minuto</b>.
      </div>
      <ul className="mb-2 ps-3">
        <li>Al inicio de <b>cada 3 minutos</b> haces lo indicado; <b>descansas</b> con el tiempo restante.</li>
        <li><b>Ejemplo:</b> Tenes 2 ejercicios. Logras realizar el ejercicio A y B en 2min, por lo tanto te queda 1min de descanso.</li>
      </ul>
    </div>
  ),

  Intermitentes: (
    <div>
      <div className="mb-2 text-center">
        Alternancia de <b>trabajo</b> (<b>WORK</b>) y <b>descanso</b> (<b>REST</b>) por tiempo.
      </div>
      <ul className="mb-2 ps-3">
        <li>En <b>WORK</b> ejecutas; en <b>REST</b> recuperas y te preparas para el siguiente bloque.</li>
                <li className="mt-2"><b>Ejemplo:</b> En el caso de tener 30s de trabajo x 30s de descanso en 8 rondas, y tener 2 ejercicios, <b>debes realizar el ejercicio A durante 30s</b>, luego, <b>descansar 30s.</b> Al terminar el descanso, <b>continuas con el ejercicio B, hasta completar 8 rondas.</b></li>
      </ul>
    </div>
  ),

  'Por tiempo': (
    <div>
      <div className="mb-2">
        <span className="badge text-bg-dark me-2">FOR TIME</span>
        Trabajo <b>contra reloj</b> hasta completar un objetivo, con posible <b>time cap</b> (limite).
      </div>
      <ul className="mb-2 ps-3">
        <li><b>Objetivo:</b> terminar todas las reps/metros en el menor tiempo posible.</li>
        <li>Si hay <b>time cap</b>, debes completar antes del limite; si no, el tiempo final es tu <b>marca</b>.</li>
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


const readPrepSeconds = () => {
  try {
    if (!safeHasLS()) return 10;
    const raw = window.localStorage.getItem(SAFE_PREP_KEY);

    // Si no hay valor guardado (null/""), usar 10 por defecto
    if (raw == null || String(raw).trim() === '') return 10;

    const n = Math.floor(Number(raw));

    // Si no es valido o es menor a 1, volver a 10 (default)
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
            // Resetea al dia 0 al navegar
            navigate(`/routine/${id}/day/0/${newWeek._id}/${newIndex}`);
        }
    };

  // === Superseries (parsing robusto) ===
// Acepta: "12.1" (â†’ 12-A), "12-a", "12A", "12 a", "12,a", "12-A)", y "12" solo
const parseSupersetTag = (val) => {
  if (val == null) return null;
  const str = String(val).trim();

  // 1) Formato decimal puro: "12.1", "4.2", "3.10"
  let m = str.match(/^(\d+)\.(\d+)$/);
  if (m) {
    const base = parseInt(m[1], 10);
    const dec  = parseInt(m[2], 10); // 1â†’A, 2â†’B, 3â†’C...
    const letter = dec > 0 && dec <= 26 ? String.fromCharCode(64 + dec) : null;
    return { base, suffix: letter };
  }

  // 2) Formato alfabetico / separadores: "12-a", "12A", "12 a", "12,a", "12-A)"
  m = str.match(/^(\d+)\s*[--.,\s]?\s*([A-Za-z])?\)?$/);
  if (!m) return null;
  const base = parseInt(m[1], 10);
  const suffix = m[2] ? m[2].toUpperCase() : null; // puede ser null (solo "12")
  return { base, suffix };
};

/**
 * Agrupa ejercicios consecutivos con el mismo numero base.
 * - Acepta decimales (1.1â†’A, 1.2â†’B...) y letras (1-a, 1b, 1,c...)
 * - Si el primero no trae letra/decimal y hay mas con el mismo base, asigna A/B/C...
 * - No crea "superserie" si queda un unico ejercicio.
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
      out.push(group.exercises[0] ?? el); // si fue unico, no mostrar como superserie
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
return <span className={`btn p-1 fontNumberE m-0 ${isDark ? "ddp-pill" : "bg-light"}`}>{n}</span>;
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
      pesoCorporal: "",     // â† nuevo campo
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
        ); // ultima primero
        // â¬‡ï¸ Mostrar solo semanas visibles (si no existe la prop, se considera visible)
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
          // Si la semana actual esta oculta, redirigimos a la primera visible
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
        setAllDays(data[0].routine);
        setNameWeek(data[0].name);
        setCurrentDay(prev => (prev === null ? 0 : prev));
      });
    }, [week_id, status]); // ESTO NO ESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS

   /* useeffect borrado "duplicado" useEffect(() => {
      if (allDays.length && currentDay !== null) {
        setDay_id(allDays[currentDay]._id);
        setModifiedDay(allDays[currentDay].exercises);
        setFirstValue(allDays[currentDay].name);
      }
    }, [allDays, currentDay]);*/

useEffect(() => {
  const week = allWeeks[currentWeekIndex];
  if (!week) return;

  setNameWeek(week.name);

  const currentRoutine = week.routine || [];

  // 2) Si hay semana previa, alineamos ejercicios (sin forzar dia 0)
  const prevWeek = allWeeks[currentWeekIndex + 1];
  const finalRoutine = prevWeek
    ? currentRoutine.map((day, idx) => {
        const previousDay = prevWeek.routine?.[idx];
        if (!previousDay) return day;
        return {
          ...day,
          exercises: compareExercises(day.exercises, previousDay.exercises),
        };
      })
    : currentRoutine;

  setAllDays(finalRoutine);



      
}, [allWeeks, currentWeekIndex, index]);





useEffect(() => {
  UserService.getProfileById(id)
    .then((data) => {
      setUserProfile(data);

      // ===== Drive snapshot + draft =====
      const serverDrive = data?.drive_link || '';
      serverDriveRef.current = serverDrive;

      const driveDraft = driveDraftKey ? lsGetJSON(driveDraftKey, null) : null;
      if (driveDraft?.data && typeof driveDraft.data === 'string' && driveDraft.data.trim() !== '' && driveDraft.data !== serverDrive) {
        setDriveLink(driveDraft.data);
        setDrivePending(true);
        setDriveLastFail(driveDraft?.lastFail || '');
      } else {
        setDriveLink(serverDrive);
        setDrivePending(false);
        setDriveLastFail('');
        if (driveDraftKey) lsRemove(driveDraftKey);
      }

      // ===== Weekly snapshot + draft =====
      const serverWeekly = data?.resumen_semanal || {};
      serverWeeklyRef.current = serverWeekly;

      const weeklyDraft = weeklyDraftKey ? lsGetJSON(weeklyDraftKey, null) : null;
      if (weeklyDraft?.data && typeof weeklyDraft.data === 'object' && !deepEqual(weeklyDraft.data, serverWeekly)) {
        setWeeklySummary(weeklyDraft.data);
        setWeeklyPending(true);
        setWeeklyLastFail(weeklyDraft?.lastFail || '');
      } else {
        if (data?.resumen_semanal) setWeeklySummary(data.resumen_semanal);
        setWeeklyPending(false);
        setWeeklyLastFail('');
        if (weeklyDraftKey) lsRemove(weeklyDraftKey);
      }

      const serverTechnicalLog = Array.isArray(data?.technical_log) ? data.technical_log : [];
      serverTechnicalLogRef.current = serverTechnicalLog;

      const technicalLogDraft = technicalLogDraftKey ? lsGetJSON(technicalLogDraftKey, null) : null;
      if (
        technicalLogDraft?.data &&
        Array.isArray(technicalLogDraft.data) &&
        !deepEqual(technicalLogDraft.data, serverTechnicalLog)
      ) {
        setTechnicalLogEntries(technicalLogDraft.data);
        setTechnicalLogPending(true);
        setTechnicalLogLastFail(technicalLogDraft?.lastFail || '');
      } else {
        setTechnicalLogEntries(serverTechnicalLog);
        setTechnicalLogPending(false);
        setTechnicalLogLastFail('');
        if (technicalLogDraftKey) lsRemove(technicalLogDraftKey);
      }
    })
    .catch(() => setShowProfileMissingModal(true));
}, [id, weeklyDraftKey, driveDraftKey, technicalLogDraftKey]);
    
const saveDriveLink = async () => {
  if (!driveLink.startsWith("https://drive.google.com")) {
    Notify.instantToast("Debe ser un link valido de Google Drive");
    return;
  }

  try {
    const currentProfile = await UserService.getProfileById(id);

    const {
      _id,
      id: ignoredId,
      user_id, // ðŸ‘ˆ evitar reenviar esto
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

    serverDriveRef.current = driveLink;
    setDrivePending(false);
    setDriveLastFail('');
    if (driveDraftKey) lsRemove(driveDraftKey);

    Notify.instantToast("Link de Drive actualizado");
    setEditingDriveLink(false);
    setShowDriveDialog(false);
  } catch (error) {
      console.error("Error al guardar el link de Drive", error);
      Notify.instantToast("No se pudo guardar. El link quedo guardado localmente.");

      setDrivePending(true);
      setDriveLastFail(new Date().toISOString());

      if (driveDraftKey) {
        lsSetJSON(driveDraftKey, {
          data: driveLink,
          lastFail: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
};

const persistTechnicalLog = React.useCallback(async (entries) => {
  const safeEntries = Array.isArray(entries) ? entries : [];

  try {
    await UserService.editProfile(id, { technical_log: safeEntries });

    setUserProfile((prev) => ({
      ...(prev || {}),
      technical_log: safeEntries
    }));
    setTechnicalLogEntries(safeEntries);
    serverTechnicalLogRef.current = safeEntries;
    setTechnicalLogPending(false);
    setTechnicalLogLastFail('');
    if (technicalLogDraftKey) lsRemove(technicalLogDraftKey);
  } catch (error) {
    console.error('Error al guardar la bitacora tecnica', error);
    setTechnicalLogEntries(safeEntries);
    setTechnicalLogPending(true);
    const failAt = new Date().toISOString();
    setTechnicalLogLastFail(failAt);

    if (technicalLogDraftKey) {
      lsSetJSON(technicalLogDraftKey, {
        data: safeEntries,
        lastFail: failAt,
        updatedAt: failAt
      });
    }
  }
}, [id, technicalLogDraftKey]);

const handleTechnicalLogChange = React.useCallback((entries) => {
  const safeEntries = Array.isArray(entries) ? entries : [];
  setTechnicalLogEntries(safeEntries);

  if (technicalLogSaveTimeoutRef.current) {
    clearTimeout(technicalLogSaveTimeoutRef.current);
  }

  technicalLogSaveTimeoutRef.current = setTimeout(() => {
    persistTechnicalLog(safeEntries);
  }, 450);
}, [persistTechnicalLog]);

    useEffect(() => {
        setTourSteps([
            {
                title: 'Numero de serie',
                description: 'Este numero indica el orden de los ejercicios. Tambien puede haber super series (3-A, por ejemplo)',
                target: () => document.getElementById('numeroSerie'),
                placement: 'top',
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Nombre del ejercicio',
                description: 'Este es el ejercicio a realizar.',
                target: () => document.getElementById('nombre'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Contador de series',
                description: 'Este contador te servira para no perderte entre tus series! Simplemente presionalo y lleva un conteo.',
                target: () => document.getElementById('contador'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Series',
                description: 'Numero de series a realizar',
                target: () => document.getElementById('series'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Repeticiones',
                description: 'Numero de repeticiones a realizar. Tambien pueden ser segundos.',
                target: () => document.getElementById('reps'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Peso',
                description: 'Kilos ( o libras ) para realizar las series.',
                target: () => document.getElementById('peso'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Descanso',
                description: 'Descanso indicado por el entrenador entre series. El temporizador esta con el tiempo correspondiente a cada ejercicio. ( indicado por el entrenador )',
                target: () => document.getElementById('descanso'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Video/imagen',
                description: 'Aca podes encontrar una imagen o video representativo del ejercicio',
                target: () => document.getElementById('video'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: 'Siguiente >>' }
            },
            {
                title: 'Edicion',
                description: 'Esta es la forma de comunicarle a tu entrenador las cosas: tanto el peso, observaciones, o subir videos a su drive.',
                target: () => document.getElementById('edicion'),
                placement: 'top',
                prevButtonProps: { children: '<< Anterior' },
                nextButtonProps: { children: '!Finalizar!' }
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
            <span>{cleanUiText(nameData.name)}</span>
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
      return <span>{cleanUiText(nameData)}</span>;
    };

    const getPlainName = (nameData) => {
      if (typeof nameData === 'object' && nameData !== null) {
        return cleanUiText(nameData.name ?? '');
      }
      return cleanUiText(nameData ?? '');
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

  const patch = {
    peso: completeExercise?.peso ?? '',
    notas: completeExercise?.notas ?? ''
  };

  if (blockEditIndices.blockIndex !== null) {
    // === DENTRO DE BLOQUE ===
    const b = blockEditIndices.blockIndex;

    newExercises[b] = { ...newExercises[b], exercises: [...(newExercises[b].exercises || [])] };

    const innerIdx = newExercises[b].exercises.findIndex(
      (ex) => ex?.exercise_id === completeExercise?.exercise_id
    );

    if (innerIdx >= 0) {
      newExercises[b].exercises[innerIdx] = { ...newExercises[b].exercises[innerIdx], ...patch };
    } else if (Number.isInteger(blockEditIndices.exerciseIndex)) {
      newExercises[b].exercises[blockEditIndices.exerciseIndex] = {
        ...newExercises[b].exercises[blockEditIndices.exerciseIndex],
        ...patch
      };
    }
  } else {
    // === NIVEL TOP ===
    const realIdx = newExercises.findIndex(
      (ex) => ex?.exercise_id === completeExercise?.exercise_id
    );

    if (realIdx >= 0) {
      newExercises[realIdx] = { ...newExercises[realIdx], ...patch };
    } else if (Number.isInteger(indexOfExercise)) {
      newExercises[indexOfExercise] = { ...newExercises[indexOfExercise], ...patch };
    }
  }

  setModifiedDay(newExercises);

  // âœ… SIEMPRE limpiar UI antes de enviar/guardar draft
  const payload = cleanExercisesPayload(newExercises);

  // âœ… Key correcta del dia actual (robusta)
  const draftKey = getExercisesDraftKey();

  ExercisesService
    // âœ… ENVIAR PAYLOAD LIMPIO, NO newExercises
    .editExercise(week_id, day_id, payload)
    .then(() => {
      Notify.instantToast('Rutina actualizada con exito!');
      setEditExerciseMobile(false);
      setBlockEditIndices({ blockIndex: null, exerciseIndex: null });

      // âœ… Confirmado en server â†’ snapshot = payload
      serverExercisesRef.current = payload;

      // âœ… Limpiar pending + lastFail
      setExercisesPending(false);
      setExercisesLastFail('');

      // âœ… Borrar draft si existia (ya guardo)
      if (draftKey) lsRemove(draftKey);

      // âœ… (Opcional pero recomendado) mantener allDays coherente para evitar re-hidrataciones raras
      setAllDays((prev) => {
        const copy = [...(prev || [])];
        const idx = currentDay ?? 0;
        if (copy[idx]) copy[idx] = { ...copy[idx], exercises: payload };
        return copy;
      });
    })
    .catch((err) => {
      console.error('Error al actualizar rutina', err);

      const failAt = new Date().toISOString();
      setExercisesPending(true);
      setExercisesLastFail(failAt);

      Notify.instantToast(
        'No se pudo guardar (sin conexion o error). Tus cambios quedaron guardados localmente.'
      );

      // âœ… Guardar draft con el payload limpio
      if (draftKey) {
        lsSetJSON(draftKey, {
          data: payload,
          lastFail: failAt,
          updatedAt: failAt
        });
        console.log('[draft saved]', draftKey, lsGetJSON(draftKey));
      } else {
        console.warn('No se pudo generar key de draft (faltan id/week_id/dayId)', {
          id,
          week_id,
          day_id,
          currentDay
        });
      }
    });
};


    const productTemplate = useCallback((exercise, idx, isWarmup) => {
        const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 450;
        const cardMaxWidth = isSmallScreen ? '380px' : '400px';
        const isMovility = Boolean(isWarmup);
        const headerClass = isMovility ? 'colorMovility' : 'colorWarmup';
        const exerciseNumber = isMovility ? exercise.numberMovility : exercise.numberWarmup;

        return (
            <div >
                <div 
                    className="text-center pt-3 pb-4" 
                >
                  <div className={`row justify-content-center backgroundCardsWarmMov shadow rounded-2 m-1 mb-3 ddp-card ${isDark ? "ddp-surface" : "bg-light"}`}>

                    <div className={`col-12 ${headerClass} py-2 `}>
                                      <div className="row justify-content-center">

                                        <div className={`col-1 m-auto ${isDark ? "text-light" : "text-dark"} `}>
                                          {exerciseNumber != null && (
                                            <span className="ddp-warmmov-number">{exerciseNumber}</span>
                                          )}
                                        </div>
                                        
                                        <div className="col-8 m-auto text-start">
                                          <p className={`stylesNameExercise mb-0 ${isDark ? "text-light" : "text-dark"}`} id={idx === 0 ? 'nombre' : null}>
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
                                            <Video className={exercise.video ? 'ytColor' : 'ytColor-disabled'} />
                                        </IconButton>
  
                                      </div>
                                       </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row justify-content-center my-3 ">
                                          <div className="col-4  ">
                                            <div>
                                              <p className="fontStylesSpan">Sets</p>
                                            </div>
                                          </div>
                                          <div className="col-4 ">
                                            <div>
                                                <p className="fontStylesSpan ">Reps</p>
                                            </div>
                                          </div>
                                          <div className="col-4 ">
                                            <div>
                                              <p className="fontStylesSpan ">Peso</p>
                                            </div>
                                          </div>
                                          <div className="col-4 backItemsExercises ">
                                            <div>
                                              <span className="mt-1 d-block">{exercise.sets}</span>
                                            </div>
                                          </div>
                                          <div className="col-4 backItemsExercises ">
                                            <div>
                                              <span className="mt-1 border-1 d-block">{exercise.reps}</span>
                                            </div>
                                          </div>
                                          <div className="col-4  backItemsExercises">
                                            <div>
                                              <span className="mt-1 d-block">{exercise.peso ? cleanUiText(exercise.peso) : '-'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {exercise.notas && exercise.notas.trim().length > 0 ? (
                                       <>
                                        <span className="styleInputsNote-back text-start">
                                          Notas / otros
                                        </span>
                                        <div
                                          className={`mb-2 py-2 rounded-1 col-11 largoCarddds ${isDark ? "ddp-note" : "border"}`}
                                          style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                          <p className={`pb-0 mb-0 ${isDark ? "text-light" : ""}`}>{cleanUiText(exercise.notas)}</p>
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
      return { title: 'AMRAP', meta: cleanUiText(d) };
    }
    case 'EMOM': {
      const rounds = c.totalRounds || Math.max(1, Math.round((c.totalMinutes || 0) / (c.intervalMin || 1)));
      return { title: 'EMOM', meta: cleanUiText(`${c.intervalMin || 1}:00 x ${rounds} min`) };
    }
    case 'E2MOM':
      return { title: 'E2MOM', meta: cleanUiText(`2:00 x ${c.totalRounds || 0} min`) };
    case 'E3MOM':
      return { title: 'E3MOM', meta: cleanUiText(`3:00 x ${c.totalRounds || 0} min`) };
    case 'Por tiempo': {
      const cap = fmtMMSS(getDurationSec(c) || 0);
      return { title: 'For time', meta: cleanUiText(`CAP ${cap}`) };
    }
    case 'Intermitentes': {
      const work = c.workSec ?? 30;
      const rest = c.restSec ?? 30;
      const rounds = c.totalRounds ?? 10;
      return { title: 'Intermitente', meta: cleanUiText(`${work}s / ${rest}s x ${rounds} rondas`) };
    }
    case 'Tabata': {
      const work = c.workSec ?? 20;
      const rest = c.restSec ?? 10;
      const rounds = c.totalRounds ?? 8;
      return { title: 'Tabata', meta: cleanUiText(`${work}s / ${rest}s x ${rounds} rondas`) };
    }
    default: {
      const title = cleanUiText((c.type && String(c.type).trim()) || c.typeOfSets || 'Libre');
      const fc = c.freeConfig;
      if (fc) {
        if (fc.mode === 'chrono') return { title, meta: 'Cronometro' };
        if (fc.schema === 'amrap') return { title, meta: cleanUiText(`AMRAP - ${String(fc.totalMinutes).padStart(2, '0')}:00`) };
        return { title, meta: cleanUiText(`${fc.workSec}s / ${fc.restSec}s x ${fc.totalRounds}`) };
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
          x
        </button>
      </div>
    </div>
  );
};

const renderExerciseHeader = () => (
  <div className={`row justify-content-center text-uppercase small fw-semibold mb-2 timer-ex-header ${isDark ? 'timer-ex-header-dark' : ''}`}>
    <div className="col-6">Nombre</div>
    <div className="col-2 text-center">Reps</div>
    <div className="col-2 text-center">Peso</div>
    <div className="col-2 text-center">Notas</div>
  </div>
);

// REEMPLAZAR COMPLETO
const renderExerciseRow = (ex, i) => {
  const repsText  = Array.isArray(ex?.reps) ? ex.reps.join(' - ') : (ex?.reps ?? '-');
  const pesoText  = cleanUiText(ex?.peso ?? '-');
  const notesText = (ex?.notas && String(ex.notas).trim()) || '-';

  return (
    <div
      key={i}
      className={`row justify-content-center align-items-center rounded-3 mb-2 py-2 timer-ex-row ${isDark ? "ddp-surface timer-ex-row-dark" : "bg-white"}`}
    >

      <div className="col-6 d-flex align-items-center">
        <span className="badge rounded-pill text-bg-dark me-3 px-2 py-2">{i + 1}</span>
        <span className="fw-semibold timer-ex-name">{cleanUiText(ex?.name || '-')}</span>
      </div>
      <div className="col-2 text-center fw-bold timer-ex-value">{repsText}</div>
      <div className="col-2 text-center fw-bold timer-ex-value">{pesoText}</div>
      <div
        className="col-2 text-center small timer-ex-note"
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
  // Soporta: 14' | 14" | 14Â´ | 14m | 14 min | 14.5' | 14,5' | 14MIN
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:['"Â´m]|min(?:utos)?)?$/i);
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

const cleanUiText = (value) =>
  String(value ?? "")
    .replace(/DÃ­a|DÃa/gi, "Dia")
    .replace(/Ã¡/g, "a")
    .replace(/Ã©/g, "e")
    .replace(/Ã­/g, "i")
    .replace(/Ã³/g, "o")
    .replace(/Ãº/g, "u")
    .replace(/Ã±/g, "n")
    .replace(/Ã‘/g, "N")
    .replace(/Ã—/g, " x ")
    .replace(/×/g, " x ")
    .replace(/Â·|·/g, " - ")
    .replace(/Â´|´/g, "'")
    .replace(/â€¢/g, "-")
    .replace(/âœ…/g, "")
    .replace(/â€“|–/g, "-")
    .replace(/â€”|—/g, "-")
    .replace(/â€˜|â€™|‘|’/g, "'")
    .replace(/â€œ|â€�|“|”/g, '"')
    .replace(/Ã/g, "A")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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

// ==== Subtitulo corto ====
const circuitSubtitle = (c = {}) => {
  const k = c?.circuitKind || c?.type || 'Libre';
  switch (k) {
    case 'AMRAP':
      return cleanUiText(`AMRAP - ${fmtMMSS(getDurationSec(c) || 0)}`);
    case 'EMOM':
      return cleanUiText(`EMOM - ${(c.intervalMin || 1)}:00 x ${(c.totalRounds || Math.max(1, Math.round((c.totalMinutes || 0) / (c.intervalMin || 1))))}`);
    case 'E2MOM':
      return cleanUiText(`E2MOM - 2:00 x ${(c.totalRounds || 0)}`);
    case 'E3MOM':
      return cleanUiText(`E3MOM - 3:00 x ${(c.totalRounds || 0)}`);
    case 'Intermitentes':
      return cleanUiText(`Intermitente - ${(c.workSec || 30)}s / ${(c.restSec || 30)}s x ${(c.totalRounds || 10)}`);
    case 'Por tiempo':
      return cleanUiText(`For time - CAP ${fmtMMSS(getDurationSec(c) || 0)}`);
    case 'Tabata':
      return cleanUiText(`Tabata - ${(c.workSec ?? 20)}s / ${(c.restSec ?? 10)}s x ${(c.totalRounds ?? 8)}`);
    default: {
      const libreLabel = cleanUiText(c?.type?.trim() ? c.type : 'Libre');
      const fc = c.freeConfig;
      if (fc) {
        if (fc.mode === 'chrono') return `${libreLabel} - Cronometro`;
        if (fc.schema === 'amrap') return cleanUiText(`${libreLabel} - AMRAP - ${String(fc.totalMinutes).padStart(2, '0')}:00`);
        return cleanUiText(`${libreLabel} - ${fc.workSec}s / ${fc.restSec}s x ${fc.totalRounds}`);
      }
      return cleanUiText(libreLabel + (c.typeOfSets ? ` - ${c.typeOfSets}` : ''));
    }
  }
};

const CircuitHeader = ({ circuit, onStart, onAdjust }) => {
  const isLibre = normalizeCircuit(circuit).circuitKind === 'Libre';
  return (
  <div className={`ddp-circuit-header d-flex flex-wrap align-items-center justify-content-between border rounded-2 px-3 py-2 mb-0 ${isDark ? "ddp-surface" : "bg-white"}`}>
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

const ensureAudio = React.useCallback(async () => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  if (!audioCtxRef.current) {
    audioCtxRef.current = new Ctx({ latencyHint: 'interactive' });
  }
  const ctx = audioCtxRef.current;

  if (ctx.state !== 'running') {
    try { await ctx.resume(); } catch {}
  }
  return ctx;
}, []);

// === Desbloqueo (unlock) de audio en el primer gesto ===
function useUnlockAudioOnGesture(unlock, ensureAudioFn) {
  React.useEffect(() => {
    if (!unlock) return;

    const ua = navigator.userAgent || '';
    const isiOS = /iPad|iPhone|iPod/.test(ua);

    const unlockAudio = async () => {
      const ctx = await ensureAudioFn?.();
      if (!ctx) return;
      try {
        // 1 frame silencioso: iOS marca el contexto como "habilitado"
        const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      } catch {}
    };

    const opts = { once: true, passive: true, capture: true };

    // En iOS es critico, pero tambien lo hacemos cross-browser; no molesta.
    window.addEventListener('pointerdown', unlockAudio, opts);
    window.addEventListener('touchend',   unlockAudio, opts);
    window.addEventListener('keydown',    unlockAudio, opts);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio, opts);
      window.removeEventListener('touchend',   unlockAudio, opts);
      window.removeEventListener('keydown',    unlockAudio, opts);
    };
  }, [unlock, ensureAudioFn]);
}

const getCurrentDayId = React.useCallback(() => {
  // prioridad: state day_id, si no existe, sacar desde allDays/currentDay
  return day_id || allDays?.[currentDay ?? 0]?._id || null;
}, [day_id, allDays, currentDay]);

const getExercisesDraftKey = React.useCallback((overrideDayId) => {
  const dId = overrideDayId || getCurrentDayId();
  if (!id || !week_id || !dId) return null;
  return `draft:exercises:${id}:${week_id}:${dId}`;
}, [id, week_id, getCurrentDayId]);

const audioCtxRef = React.useRef(null);

const TimerDialog = ({ circuit, onClose, prepSeconds = 10, onOpenInfo  }) => {

  useUnlockAudioOnGesture(true, ensureAudio);


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
          // â¬‡ï¸ NO rotamos ejercicios: cada minuto muestra la lista completa
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
          // Cronometro: sin plan de cuenta regresiva
          return [{ phase: 'chrono', duration: 0, label: 'Cronometro' }];
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


  // ---------- AUDIO (habilita en el toque de "Iniciar") ----------

  const lastBeepRef = React.useRef({ key: '', val: -1 });
  // NUEVO: referencias para tiempos absolutos (no dependen del tick del navegador)
const prepEndAtRef = React.useRef(0);        // ms absolutos fin de preparacion
const segEndAtRef = React.useRef(0);         // ms absolutos fin del segmento actual
const chronoStartAtRef = React.useRef(0);    // ms cuando arranco el cronometro
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

// === AudioContext unico y robusto para iOS ===
 const metronomeClick = React.useCallback(async (type = 'tick', long = false) => {
   const ctx = await ensureAudio();
   if (!ctx || ctx.state !== 'running') return;

   // Master
   const master = ctx.createGain();
   master.gain.value = 4;                  // volumen general (alto)
   master.connect(ctx.destination);

   const now = ctx.currentTime;
   const dur = long ? 5 : 0.5;           // el ultimo suena el doble de largo

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
   hp.frequency.value = type === 'tock' ? 3333 : 2200; // tock mas grave
   noise.connect(hp);
   hp.connect(master);
   noise.start(now);
   noise.stop(now + 0.04);

   // 2) Cuerpo: oscilador con envolvente corta
   const osc = ctx.createOscillator();
   osc.type = 'triangle';
   osc.frequency.value = type === 'tock' ? 1000 : 800; // tock mas bajo; tick mas agudo

   const og = ctx.createGain();
   og.gain.setValueAtTime(0.0001, now);
   og.gain.exponentialRampToValueAtTime(type === 'tock' ? 0.7 : 0.6, now + 0.012); // pico alto
   og.gain.exponentialRampToValueAtTime(0.0001, now + dur);

   osc.connect(og);
   og.connect(master);
   osc.start(now);
   osc.stop(now + dur);
 }, [ensureAudio]);

  // â¬†ï¸ volumen (mas fuerte): mayor gain y dos tonos leves para "cuerpo"
  const beep = React.useCallback(async (freq = 880, duration = 140, long = false) => {
    const ctx = await ensureAudio();
    if (!ctx || ctx.state !== 'running') return;
    const main = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    main.type = 'sine';
    main.frequency.value = freq;
    overtone.type = 'sine';
    overtone.frequency.value = Math.round(freq * 1.5);

    // volumen mas alto (antes ~0.15)
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


React.useEffect(() => {
  const onVis = async () => {
    if (document.visibilityState === 'visible') {
      const ctx = await ensureAudio();
      if (ctx && ctx.state !== 'running') {
        try { await ctx.resume(); } catch {}
      }
    }
  };

  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('focus', onVis);

  return () => {
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('focus', onVis);
  };
}, [ensureAudio]);

// NUEVO: heartbeat anti-atrasos (250ms), usa Date.now()
React.useEffect(() => {
  let intId;
  const TICK_MS = 250;

  const tick = () => {
    const now = Date.now();

    // === PREPARACION (respeta prepSeconds) ===
    if (isPreparing) {
      const left = Math.ceil((prepEndAtRef.current - now) / 1000);
      const safeLeft = Math.max(0, left);
      setPrepLeft(safeLeft);

      // beeps 5-2 cortos, 1 largo (misma logica que tenias)
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

      // Fin de preparacion -> arranca primer segmento
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

    // Si no esta corriendo, no hacemos nada
    if (!running) return;

    // === CRONOMETRO (Libre/chrono) ===
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

    // Si se consumieron varios segmentos (por throttling), los "saltamos"
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



  

  // ---------- TIEMPO / PRESENTACION ----------
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
 // En work uso el indice del segmento; en rest uso el ultimo indice de work
 const currExIndex = showCurrent
   ? (currentSeg.exerciseIndex ?? 0)
   : lastWorkExRef.current;
 const currEx = showCurrent ? list[currExIndex] : null;

 // "Proximo": si estoy en rest, parte desde el ultimo work; si estoy en work, desde el actual
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
  // REEMPLAZAR la funcion completa
const handleStartPause = async () => {
  try {
    await ensureAudio();
    const prep = Math.max(1, Number(prepSeconds) || safePrep);

    if (phase === 'done') {
      setIdx(0);
      setPhase(plan[0]?.phase || 'idle');
      setLeft(plan[0]?.duration || 0);
      segDurationRef.current = plan[0]?.duration || 60;
      setRunning(false);
      setPrepLeft(prep);
      setPrep(true);
      prepEndAtRef.current = Date.now() + prep * 1000;
      lastBeepRef.current = { key: '', val: -1 };
      segEndAtRef.current = 0;
      chronoStartAtRef.current = 0;
      pauseStartedAtRef.current = 0;
      pausedAccumRef.current = 0;
      return;
    }

    if (running) {
      setRunning(false);
      if (isChrono) pauseStartedAtRef.current = Date.now();
      return;
    }

    if (isPreparing) {
      setPrep(false);
      setPrepLeft(prep);
      prepEndAtRef.current = 0;
      return;
    }

    const atStart = idx === 0 && (isChrono ? (chronoElapsed === 0) : (timeLeft === (plan[0]?.duration || 0)));
    if (!isChrono && atStart) {
      setPrepLeft(prep);
      prepEndAtRef.current = Date.now() + prep * 1000;
      setPrep(true);
      return;
    }

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
  } catch (error) {
    console.error('Timer start/pause error', error);
    Notify.instantToast('No se pudo iniciar el timer.');
  }
};

const reset = () => {
  setIdx(0);
  setPhase(plan[0]?.phase || 'idle');
  setLeft(plan[0]?.duration || 0);
  segDurationRef.current = plan[0]?.duration || 60;
  setRunning(false);
  setPrep(false);
  setChronoElapsed(0);
  setPrepLeft(safePrep);
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
    <div className={`container-fluid px-0 timer-dialog-body ${isDark ? 'timer-dialog-body-dark' : ''}`}>
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

      {/* ===== CONTENIDO SEGUN TIPO ===== */}

      {kind === 'AMRAP' && (
        <>
          <div className="d-flex align-items-center mb-2 timer-section-title">
            <span className="rounded-circle bg-primary me-2" style={{ width: 8, height: 8 }} />
            <div className="fw-bold text-uppercase small">Ejercicios </div>
          </div>
          <div className="mb-3">
            {renderExerciseHeader()}
            {list.length ? list.map((ex, i) => renderExerciseRow(ex, i)) : (
              <div className="text-muted small">-</div>
            )}
          </div>
        </>
      )}

      {isLibre && (
         <>
           <div className="d-flex align-items-center mb-2 timer-section-title">
             <span className="rounded-circle bg-primary me-2" style={{ width: 8, height: 8 }} />
             <div className="fw-bold text-uppercase small">Ejercicios</div>
           </div>
           <div className="mb-3">
             {renderExerciseHeader()}
             {list.length ? list.map((ex, i) => renderExerciseRow(ex, i)) : (
               <div className="text-muted small">-</div>
             )}
           </div>
         </>
       )}

      {isEMOMLike && (
        <>
          <div className="d-flex align-items-center mb-2 timer-section-title">
            <span className="rounded-circle bg-primary me-2" style={{ width: 8, height: 8 }} />
            <div className="fw-bold text-uppercase small">Ejercicios a realizar</div>
          </div>
          <div className="mb-3">
             {renderExerciseHeader()}
            {list.length ? list.map((ex, i) => renderExerciseRow(ex, i)) : (
              <div className="text-muted small">-</div>
            )}
          </div>
        </>
      )}

      {/* Intermitentes / Tabata: EJERCICIO ACTUAL + PROXIMO */}
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
                  <div className="fw-bold fs-5">{cleanUiText(currEx?.name)}</div>
                   <span className={`badge rounded-pill ${phase === 'work' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                     {phase === 'work' ? 'WORK' : 'REST'}
                   </span>
                 </div>
            
                 <div className="d-flex flex-wrap gap-2 mt-3">
                   <span className="badge text-bg-dark px-3 py-2">
                     Reps: {Array.isArray(currEx?.reps) ? cleanUiText(currEx.reps.join(' - ')) : cleanUiText(currEx?.reps ?? '-')}
                   </span>
                   <span className="badge text-bg-dark px-3 py-2">
                     Peso: {cleanUiText(currEx?.peso ?? '-')}
                   </span>
                 </div>
            
                 {currEx?.notas ? (
                   <div className="text-muted small mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                    {cleanUiText(currEx.notas)}
                   </div>
                 ) : null}
               </>
             ) : (
               <div className="text-muted d-flex align-items-center justify-content-center" style={{ minHeight: 74 }}>
                 {phase === 'rest' ? 'Descanso' : '-'}
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
          aria-label="Que es este formato?"
          title={`Que es un ${kind}?`}
        >
          <HelpOutlineIcon className="me-1" />
          Que es un {kind}?
        </button>
        <button className="btn btn-outline-secondary rounded-3" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};


    const handleDayChange = (value) => {
      

      const actualDay = allDays.find(item => item._id === value);
      const idx = allDays.findIndex(item => item._id === actualDay?._id);
      if (idx < 0) return;
      setCurrentDay(idx);
      const wk = allWeeks[currentWeekIndex];
      if (wk?._id) {
        navigate(`/routine/${id}/day/${idx}/${wk._id}/${currentWeekIndex}`, { replace: true });
      }
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

// FUNCIONES PARA LOCALSTORAGE DE DATOS ----------------------------------------------------------//


// ===== Draft / Offline helpers (localStorage) =====


const lsGetJSON = (key, fallback = null) => {
  try {
    if (!safeHasLS()) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const lsSetJSON = (key, value) => {
  try {
    if (!safeHasLS()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
};

const lsRemove = (key) => {
  try {
    if (!safeHasLS()) return;
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
};

// lodash ya esta importado como _, usamos _.isEqual
const deepEqual = (a, b) => {
  try { return _.isEqual(a, b); } catch { return false; }
};

// âœ… Limpia campos SOLO de UI para no enviarlos al backend
const stripUI = (ex) => {
  if (!ex || typeof ex !== 'object') return ex;
  const { changed, supSuffix, _origIndex, _origIndexInBlock, ...rest } = ex;
  return rest;
};

// âœ… Limpia todo el array de ejercicios (incluye blocks y circuitos)
const cleanExercisesPayload = (arr = []) => {
  return (arr || []).map((it) => {
    if (!it || typeof it !== 'object') return it;

    // Bloque con ejercicios internos
    if (it?.type === 'block' && Array.isArray(it.exercises)) {
      return { ...it, exercises: it.exercises.map(stripUI) };
    }

    // Circuito (si existiera)
    if (Array.isArray(it?.circuit)) {
      return { ...it, circuit: it.circuit.map(stripUI) };
    }

    // Ejercicio normal
    return stripUI(it);
  });
};

const getExerciseDraftEntries = React.useCallback(() => {
  if (!safeHasLS() || !id || !week_id) return [];

  const prefix = `draft:exercises:${id}:${week_id}:`;
  const entries = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;

    const draft = lsGetJSON(key, null);
    const dayIdFromKey = key.slice(prefix.length);
    if (draft?.data && Array.isArray(draft.data) && dayIdFromKey) {
      entries.push({ key, dayId: dayIdFromKey, draft });
    }
  }

  return entries;
}, [id, week_id]);

const flushPendingDrafts = React.useCallback(async ({ notify = false } = {}) => {
  if (!id || offlineFlushInFlightRef.current) return;

  offlineFlushInFlightRef.current = true;
  const saved = [];

  try {
    if (weeklyDraftKey) {
      const draft = lsGetJSON(weeklyDraftKey, null);
      if (draft?.data && typeof draft.data === 'object' && !Array.isArray(draft.data)) {
        try {
          await UserService.editProfile(id, { resumen_semanal: draft.data });
          serverWeeklyRef.current = draft.data;
          setWeeklySummary(draft.data);
          setUserProfile((prev) => ({ ...(prev || {}), resumen_semanal: draft.data }));
          setWeeklyPending(false);
          setWeeklyLastFail('');
          lsRemove(weeklyDraftKey);
          saved.push('resumen');
        } catch {
          setWeeklyPending(true);
          setWeeklyLastFail(draft?.lastFail || new Date().toISOString());
        }
      }
    }

    if (driveDraftKey) {
      const draft = lsGetJSON(driveDraftKey, null);
      if (draft?.data && typeof draft.data === 'string') {
        try {
          const currentProfile = await UserService.getProfileById(id);
          const { _id, id: ignoredId, user_id, ...safeProfile } = currentProfile || {};
          const updatedProfile = { ...safeProfile, drive_link: draft.data };

          await UserService.editProfile(id, updatedProfile);
          serverDriveRef.current = draft.data;
          setDriveLink(draft.data);
          setUserProfile((prev) => ({ ...(prev || {}), drive_link: draft.data }));
          setDrivePending(false);
          setDriveLastFail('');
          lsRemove(driveDraftKey);
          saved.push('drive');
        } catch {
          setDrivePending(true);
          setDriveLastFail(draft?.lastFail || new Date().toISOString());
        }
      }
    }

    if (technicalLogDraftKey) {
      const draft = lsGetJSON(technicalLogDraftKey, null);
      if (draft?.data && Array.isArray(draft.data)) {
        try {
          await UserService.editProfile(id, { technical_log: draft.data });
          serverTechnicalLogRef.current = draft.data;
          setTechnicalLogEntries(draft.data);
          setUserProfile((prev) => ({ ...(prev || {}), technical_log: draft.data }));
          setTechnicalLogPending(false);
          setTechnicalLogLastFail('');
          lsRemove(technicalLogDraftKey);
          saved.push('bitacora');
        } catch {
          setTechnicalLogPending(true);
          setTechnicalLogLastFail(draft?.lastFail || new Date().toISOString());
        }
      }
    }

    const exerciseDrafts = getExerciseDraftEntries();
    if (exerciseDrafts.length) {
      let failed = 0;

      for (const { key, dayId: draftDayId, draft } of exerciseDrafts) {
        try {
          const cleaned = cleanExercisesPayload(draft.data);
          await ExercisesService.editExercise(week_id, draftDayId, cleaned);

          lsRemove(key);
          saved.push(`dia:${draftDayId}`);

          setAllDays((prev) =>
            (prev || []).map((day) =>
              String(day?._id) === String(draftDayId)
                ? { ...day, exercises: cleaned }
                : day
            )
          );

          if (String(draftDayId) === String(getCurrentDayId())) {
            serverExercisesRef.current = cleaned;
            setModifiedDay(cleaned);
          }
        } catch {
          failed += 1;
          setExercisesLastFail(draft?.lastFail || new Date().toISOString());
        }
      }

      setExercisesPending(failed > 0);
      if (failed === 0) setExercisesLastFail('');
    }

    if (notify && saved.length) {
      Notify.instantToast('Cambios pendientes guardados automatico');
    }
  } finally {
    offlineFlushInFlightRef.current = false;
  }
}, [
  id,
  week_id,
  weeklyDraftKey,
  driveDraftKey,
  technicalLogDraftKey,
  getExerciseDraftEntries,
  getCurrentDayId
]);


useEffect(() => {
  if (allDays.length && currentDay !== null) {
    const d = allDays[currentDay];
    if (!d) return;

    setDay_id(d._id);
    setFirstValue(d.name);

    const serverExercises = d.exercises || [];
    serverExercisesRef.current = serverExercises;

    // draft local por dia (si existe)
    const key = (typeof window !== 'undefined') ? `draft:exercises:${id}:${week_id}:${d._id}` : null;
    const draft = key ? lsGetJSON(key, null) : null;

    if (draft?.data && Array.isArray(draft.data) && !deepEqual(draft.data, serverExercises)) {
      setModifiedDay(draft.data);
      setExercisesPending(true);
      setExercisesLastFail(draft?.lastFail || '');
    } else {
      setModifiedDay(serverExercises);
      setExercisesLastFail('');
      if (key) lsRemove(key); // si era igual o invalido, limpiamos
      setExercisesPending(getExerciseDraftEntries().length > 0);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [allDays, currentDay]);

useEffect(() => {
  if (typeof window === 'undefined') return undefined;

  const onOnline = () => flushPendingDrafts({ notify: true });
  window.addEventListener('online', onOnline);

  // Si el alumno reabre la pagina ya con internet, el evento online no se dispara.
  if (window.navigator?.onLine !== false) {
    flushPendingDrafts({ notify: true });
  }

  return () => window.removeEventListener('online', onOnline);
}, [flushPendingDrafts]);



const safeHasLS = () => {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.localStorage) return false;

    // test write (algunos navegadores o modos lo bloquean)
    const k = '__ls_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
};


const renderMetricValue = (value) => {
  if (Array.isArray(value)) {
    return (
      <span className="textWeightCards border-1 d-block">
        {value.map((v, i) => (
          <React.Fragment key={i}>
            <span className="textWeightCards arrayBadge">{v}</span>
            {i < value.length - 1 && <span>-</span>}
          </React.Fragment>
        ))}
      </span>
    );
  }

  return <span className="textWeightCards border-1 d-block">{value ?? '-'}</span>;
};

const renderMetricBox = (label, value, colClass, extraClass = '') => (
  <div
    className={`${colClass} p-0 ${extraClass} mt-4 pt-2 mb-2 d-flex flex-column ${
      isDark ? "StyleDarkBox" : "StyleLightBox"
    }`}
  >
    <div>
      <p className="fontStylesSpan">{label}</p>
    </div>
    <div>{renderMetricValue(value)}</div>
  </div>
);


const currentDayData = currentDay !== null ? allDays[currentDay] : null;
const currentMovility = Array.isArray(currentDayData?.movility) ? currentDayData.movility : [];
const currentWarmup = Array.isArray(currentDayData?.warmup) ? currentDayData.warmup : [];














    










    return (
        <>
    <div className="container-fluid p-0 ">
        <Logo />
    </div>

    <section className={`container-fluid p-0 ddp ${isDark ? "ddp-dark" : "ddp-light"}`}>

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
              <span className=" shadow rounded-1 p-2 d-block mx-5 mb-2">Atencion!</span> Para que no te confundas, te avisamos que estas en una semana anterior. 
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
                className="stylesSegmented ddp-segmented"
                value={day_id}
                onChange={handleDayChange}
              />
            </div>
          )}

        {currentDay !== null && (
        <div className="row align-items-center text-center m-0 px-1 my-5">
            <h2 className={`text-center mb-4 rounded-2 fs-5 py-2 ${isDark ? "ddp-dayTitle-dark" : "ddp-dayTitle-light"}`}>
                {allDays[currentDay]?.name}
            </h2>

            {currentMovility.length > 0 && (
            <>
              <div className="text-start"><span>Activacion / movilidad</span></div>
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
                    {currentMovility.map((exercise, idx) => (
                      <SwiperSlide key={idx}>
                        {productTemplate(exercise, idx, true)}
                      </SwiperSlide>
                    ))}
                  </Swiper>
            
                  </>
              )}

            {currentWarmup.length > 0 && (
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
                    {currentWarmup.map((exercise, idx) => (
                      <SwiperSlide key={idx}>
                        {productTemplate(exercise, idx, false)}
                      </SwiperSlide>
                    ))}
                  </Swiper>
          
              </>
            )}

            
              <div className="row m-auto px-0 ">
                
                <h2 className=" p-2 mb-0 text-start ">Rutina del dia</h2>
              
                {groupSupersets(modifiedDay).map((element, idx) => {
  
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
    const blockBgColor = isBlock && element.color ? element.color : null;
    const blockTextColor = blockBgColor
      ? getReadableTextColor(blockBgColor, '#ffffff')
      : null;
    const blockHeaderStyle = blockBgColor
      ? {
          backgroundColor: blockBgColor,
          color: blockTextColor,
          '--ddp-block-text-color': blockTextColor
        }
      : undefined;
    const themedTextClass = blockTextColor ? '' : (isDark ? "text-light" : "text-dark");
  console.log(element)      
  return (
    <div
      key={isSuperset ? `sup-${element.baseNumber}-${idx}` : `${element.exercise_id || element._id || idx}-${idx}`}
      ref={el => (cardRefs.current[idx] = el)}
      className="px-0 mb-3"
    >
      <div className={`row justify-content-center border rounded-2 m-0 mb-3 ddp-card ${isDark ? "ddp-surface" : "bg-light"}`}>
        <div 
          className={`col-12 ${blockBgColor ? 'ddp-block-colored-header' : ''}`}
          style={blockHeaderStyle}
        > 
          <div className="row justify-content-center border-bottom">
            <div className="col-1 m-auto colorIndexPrimarys" style={blockTextColor ? { color: blockTextColor } : undefined}>
              {renderNumberIcon(number)}
            </div>

            <div className="col-9 m-auto">
              <p
                className={`stylesNameExercise text-start mb-0 py-2 ${themedTextClass}`}
                style={blockTextColor ? { color: blockTextColor } : undefined}
                id={idx === 0 ? 'nombre' : null}
              >
                {isExercise
                  ? cleanUiText(name)
                  : isBlock
                    ? <span>{cleanUiText(element.name)}</span>
                    : isSuperset
                      ? (
                        <span>
                          Superserie
                          <small className="ms-2">
                            ({element.exercises.map(e => e.supSuffix).join(' - ')})
                          </small>
                        </span>
                      )
                      : <span>Circuito</span>}
              </p>
            </div>

              {isExercise && 
              <div className="col-2">

              <IconButton
                id={idx === 0 ? 'edicion' : null}
                aria-label="editar"
                style={blockTextColor ? { color: blockTextColor } : undefined}
                 
                onClick={() => handleEditMobileExercise(element, idx)}
              >
                <Ellipsis size={23} />
              </IconButton>
              </div>
            }
          </div>
        </div>

{isExercise ? (
  <>
    <div className={`${setsCol} p-0 mt-4 pt-2 mb-2 d-flex flex-column ${isDark ? "StyleDarkBox" : "StyleLightBox"} `}>
      <div>
        <p className="fontStylesSpan ">Sets</p>
      </div>
      <div>
      {Array.isArray(element.sets) ? (
        <span className="textWeightCards border-1 d-block ">
          {element.sets.map((setValue, i) => (
            <React.Fragment key={i}>
              <span className="textWeightCards arrayBadge">{cleanUiText(setValue)}</span>
              {i < element.sets.length - 1 && <span>-</span>}
            </React.Fragment>
          ))}
        </span>
      ) : (
        <span className="textWeightCards border-1 d-block">{cleanUiText(element.sets)}</span>
      )}
      </div>
    </div>

    <div className={`${repsCol} p-0 mx-1 mt-4 pt-2 mb-2 ${isDark ? "StyleDarkBox" : "StyleLightBox"}`}>
      <div>
         <p className="fontStylesSpan">Reps</p>
      </div>
      <div>
      {Array.isArray(element.reps) ? (
        <span className="textWeightCards border-1 d-block">
          {element.reps.map((r, i) => (
            <React.Fragment key={i}>
              <span className="textWeightCards arrayBadge">{r}</span>
              {i < element.reps.length - 1 && <span>-</span>}
            </React.Fragment>
          ))}
        </span>
      ) : (
        <span className="textWeightCards border-1 d-block">{element.reps}</span>
      )}
      </div>
    </div>

    <div className={`${pesoCol} p-0 me-1 mt-4 pt-2 mb-2 ${isDark ? "StyleDarkBox" : "StyleLightBox"}`}>
     <div>
         <p className="fontStylesSpan ">Peso</p>
      </div>
      <div>
        <span className="textWeightCards d-block">{element.peso ? cleanUiText(element.peso) : '-'}</span>
      </div>
    </div>

    <div className={`${restCol} p-0 me-1 mt-4  mb-2 ${isDark ? "StyleDarkBox" : "StyleLightBox"}`}>
      
       <div>
         <p className="fontStylesSpan mt-2 ">Descanso</p>
      </div>
      <div>
        <CountdownTimer darkMode={isDark} initialTime={element.rest} />      
        </div>
    </div>
  </>
) : isSuperset ? (
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
              <div className="col-2 text-center">
                <span className="badge text-light border bg-dark">{ex.supSuffix}</span>
              </div>
              <div className="col-8 text-start ">{innerName}</div>
              <div className="col-2 text-center">
                <IconButton aria-label="editar" onClick={() => handleEditMobileExercise(ex, ex._origIndex)}>
                  <EditNoteIcon />
                </IconButton>
              </div>

              {renderMetricBox("Sets", ex.sets, cols.setsCol)}
              {renderMetricBox("Reps", ex.reps, cols.repsCol, "mx-1")}
              {renderMetricBox("Peso", ex.peso ? ex.peso : "-", cols.pesoCol, "me-1")}

              <div className={`${cols.restCol} p-0 me-1 mt-4 mb-2 ${isDark ? "StyleDarkBox" : "StyleLightBox"}`}>
                <div>
                  <p className="fontStylesSpan mt-2">Descanso</p>
                </div>
                <div>
                  <CountdownTimer darkMode={isDark} initialTime={ex.rest} />
                </div>
              </div>
            </div>

            {ex.name?.approximations?.length > 0 && (
              <>
                <span className="styleInputsNote-back">{cleanUiText(ex.name.approxTitle ?? 'Aproximaciones')}</span>
                <div className="colorNote3 py-2 rounded-1">
                  {ex.name.approximations.map((ap, i) => (
                    <div className="row my-1" key={i}>
                      <span className="fs07em text-muted col-6">
                        <b>{i + 1}</b> aproximacion -
                      </span>
                      <p className="mb-0 col-5 text-start">
                        {cleanUiText(ap.reps)} reps / {cleanUiText(ap.peso)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {ex.name?.backoff?.length > 0 && (
              <>
                <span className="styleInputsNote-back text-center">{cleanUiText(blockBackoffLabel)}</span>
                <div className="colorNote2 py-2 rounded-1 mb-2">
                  {ex.name.backoff.map((line, i) => (
                    <p key={i} className="mb-0">
                      {line.sets}x{line.reps} / {line.peso}
                    </p>
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

            <div className="row justify-content-between align-items-center mt-2 px-2">
              <div className="col-auto">
                <Contador
                  key={`cnt:${day_id}:${element.exercise_id || element._id || idx}:${j}`}
                  storageKey={`counter:sup:${id}:${week_id}:${day_id}:${element.exercise_id || element._id || idx}:${j}:${ex.exercise_id || ex._id || j}`}
                  max={ex.sets}
                />
              </div>
              <div className="col-auto">
                <IconButton aria-label="video" disabled={!ex.video} onClick={() => handleButtonClick(ex)}>
                  <YouTubeIcon className={ex.video ? 'ytColor' : 'ytColor-disabled'} />
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
    const innerNumber = ex.numberExercise ?? ex.numberCircuit ?? ex.number;
    const innerName = isInnerExercise
      ? (typeof ex.name === 'object' ? ex.name.name : ex.name)
      : (ex.type || 'Circuito');
  // ðŸ‘‡ Detecta si este item es un CIRCUITO dentro del bloque
  const nc = normalizeCircuit(ex);                // normaliza AMRAP/EMOM/.../Libre
  const kind = nc.circuitKind;
  const isInnerCircuit =
    !isInnerExercise &&
    !isInnerSuperset &&
    (
      Array.isArray(ex?.circuit) ||               // trae lista de ejercicios
      ['AMRAP','EMOM','E2MOM','E3MOM','Intermitentes','Tabata','Por tiempo','Libre'].includes(kind)
    );

    // ðŸ‘‡ Si es circuito dentro del bloque, lo pinto similar al "circuito suelto"
        if (isInnerSuperset) {
      return (
        <div key={`blksup-${idx}-${j}`} className="col-12 mb-2 mb-4 shadow-personalized">
          <div className="row justify-content-between align-items-center mb-2 px-2">
            <div className="col text-start fw-semibold mt-2 widgetNumberSuperSet py-1 text-light rounded-1">
              Superserie
              <small className="ms-2">({ex.exercises.map(s => s.supSuffix).join(' - ')})</small>
            </div>
          </div>

          {ex.exercises.map((s, k) => {
            const cols = getCols(s.peso);
            const blockBackoffLabel =
              (s?.name?.titleName && s.name.titleName.trim() !== "") ? s.name.titleName : "Back off";
            const supName = typeof s.name === 'object' ? s.name.name : s.name;

            return (
              <div key={`blksup-${idx}-${j}-${k}`} className="row justify-content-center rounded-2 py-2 align-items-center mb-2">
                <div className="col-1 text-center">
                  <span className="badge rounded-1 bg-dark">{s.supSuffix}</span>
                </div>

                <div className="col-9 text-start">{cleanUiText(supName)}</div>

                <div className="col-2 text-end">
                  <IconButton aria-label="editar" onClick={() => handleEditMobileBlockExercise(s, idx, s._origIndexInBlock)}>
                    <EditNoteIcon />
                  </IconButton>
                </div>

                {renderMetricBox("Sets", s.sets, cols.setsCol)}
                {renderMetricBox("Reps", s.reps, cols.repsCol, "mx-1")}
                {renderMetricBox("Peso", s.peso || "-", cols.pesoCol, "me-1")}

                <div className={`${cols.restCol} p-0 me-1 mt-4 mb-2 ${isDark ? "StyleDarkBox" : "StyleLightBox"}`}>
                  <div>
                    <p className="fontStylesSpan mt-2">Descanso</p>
                  </div>
                  <div>
                    <CountdownTimer darkMode={isDark} initialTime={s.rest} />
                  </div>
                </div>

                {s.name?.approximations?.length > 0 && (
                  <>
                    <span className="styleInputsNote-back">{cleanUiText(s.name.approxTitle ?? 'Aproximaciones')}</span>
                    <div className="colorNote3 py-2 rounded-1">
                      {s.name.approximations.map((ap, i) => (
                        <div className="row my-1" key={i}>
                          <span className="fs07em text-muted col-6">
                            <b>{i + 1}</b> aproximacion -
                          </span>
                          <p className="mb-0 col-5 text-start">{cleanUiText(ap.reps)} reps / {cleanUiText(ap.peso)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {s.name?.backoff?.length > 0 && (
                  <>
                    <span className="styleInputsNote-back m-auto">{cleanUiText(blockBackoffLabel)}</span>
                    <div className="colorNote2 py-2 rounded-1 mb-2">
                      {s.name.backoff.map((line, i) => (
                        <p key={i} className="mb-0">{cleanUiText(line.sets)}x{cleanUiText(line.reps)} / {cleanUiText(line.peso)}</p>
                      ))}
                    </div>
                  </>
                )}

{s.notas && (   
          <>
          <span className={`${isDark ? "styleInputsNote-backDark" : "styleInputsNote-back"}  text-center  my-1`}>Notas</span>
      
            <div
              className=" col-12 mb-2"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              <div className={`row justify-content-center ${isDark ? "colorNoteDark " : "colorNote"} `}>
               
                <div className="col-10">
                  <p className={`pb-0 mb-0 ${isDark ? "text-light " : "text-dark"}`}>{cleanUiText(s.notas)}</p>
                </div>

              </div>
              
            </div>
        </>
        )}

                <div className="row justify-content-between align-items-center mt-2 px-2">
                  <div className="col-auto">
                    <Contador
                      key={`cnt:block:${day_id}:${idx}:${j}:${k}:${s._origIndexInBlock ?? k}`}
                      storageKey={`counter:blocksup:${id}:${week_id}:${day_id}:${idx}:${j}:${k}:${s.exercise_id || s._id || s._origIndexInBlock || k}`}
                      max={s.sets}
                    />
                  </div>
                  <div className="col-auto">
                    <IconButton aria-label="video" disabled={!s.video} onClick={() => handleButtonClick(s)}>
                      {s.isImage
                        ? <ImageIcon className={s.video ? 'imageIcon' : 'imageIconDisabled'} />
                        : <YouTubeIcon className={s.video ? 'ytColor' : 'ytColor-disabled'} />}
                    </IconButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

if (isInnerCircuit) {
  const circuitItems = Array.isArray(nc.circuit) ? nc.circuit : [];

  return (
    <div key={`blkcirc-${idx}-${j}`} className="col-12 p-0 mt-2 mb-3">
      <div className={`row justify-content-center border rounded-2 m-0 mb-3 ddp-card ddp-circuit-card ${isDark ? "ddp-surface" : "bg-light"}`}>
        <div className="col-12">
          <div className="row justify-content-center border-bottom align-items-center ddp-circuit-header">
            <div className="col-1 m-auto colorIndexPrimarys">
              {renderNumberIcon(innerNumber)}
            </div>

            <div className="col-8 m-auto">
              <p className={`stylesNameExercise text-start mb-0 py-2 ${isDark ? "text-light" : "text-dark"}`}>
                {cleanUiText(circuitSubtitle(nc))}
              </p>
            </div>

            <div className="col-3 text-end py-2">
              <button
                className="btn btn-sm btn-dark"
                onClick={() => openTimerForCircuit({ ...nc, freeConfig: { ...freeTimerConfig } })}
              >
                Iniciar
              </button>
            </div>
          </div>

          <table className={`table border-0 mb-0 ddp-circuit-table ${isDark ? "ddp-table ddp-surface" : ""}`}>
            <thead>
              <tr>
                <th className="border-0 tableDark  text-start">Nombre</th>
                <th className="border-0 tableDark ">Reps</th>
                <th className="border-0 tableDark ">Peso</th>
                <th className="border-0 tableDark ">Video</th>
              </tr>
            </thead>
            <tbody>
              {circuitItems.map((cItem, k) => (
                <tr key={cItem.idRefresh || cItem.exercise_id || `${idx}-${j}-${k}`}>
                  <td className="border-0 text-start tableDark ">
                    {cleanUiText(getPlainName(cItem.name) || '-')}
                  </td>
                  <td className="border-0 tableDark ">
                    {Array.isArray(cItem.reps)
                      ? cleanUiText(cItem.reps.join(' - '))
                      : cleanUiText(cItem.reps ?? '-')}
                  </td>
                  <td className="border-0 tableDark ">{cleanUiText(cItem.peso ?? '-')}</td>
                  <td className="border-0 pt-0 pb-3 tableDark ">
                    <IconButton
                      aria-label="video"
                      disabled={!cItem.video}
                      className="p-0"
                      onClick={() => handleButtonClick(cItem)}
                    >
                      {cItem.isImage
                        ? <ImageIcon className={!cItem.video ? 'imageIconDisabled' : 'imageIcon'} />
                        : <YouTubeIcon className={cItem.video ? 'ytColor' : 'ytColor-disabled'} />}
                    </IconButton>
                  </td>
                </tr>
              ))}

              {ex.notas && (
                <tr>
                  <td colSpan={4} className="border-0">
                    <div className="rounded-2">
                      <span className="text-start mb-2 pb-2 d-block">Notas / otros</span>
                      <div
                        className="colorNote py-2 mb-2 pb-2 rounded-1"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        <p className="pb-0 mb-0">{ex.notas}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!circuitItems.length && (
                <tr>
                  <td colSpan={4} className="border-0 text-center text-muted py-3">
                    Este circuito no tiene ejercicios cargados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
            <div className="col-9 text-start">{cleanUiText(innerName)}</div>

            <div className="col-2 text-end">
              <IconButton aria-label="editar" onClick={() => handleEditMobileBlockExercise(ex, idx, j)}>
                <EditNoteIcon />
              </IconButton>
            </div>

            {isInnerExercise && (
              <>
                {renderMetricBox("Sets", ex.sets, cols.setsCol)}
                {renderMetricBox("Reps", ex.reps, cols.repsCol, "mx-1")}
                {renderMetricBox("Peso", ex.peso || "-", cols.pesoCol, "me-1")}

                <div className={`${cols.restCol} p-0 me-1 mt-4 mb-2 ${isDark ? "StyleDarkBox" : "StyleLightBox"}`}>
                  <div>
                    <p className="fontStylesSpan mt-2">Descanso</p>
                  </div>
                  <div>
                    <CountdownTimer darkMode={isDark} initialTime={ex.rest} />
                  </div>
                </div>
              </>
            )}
          </div>

          {isInnerExercise && ex.name?.approximations?.length > 0 && (
            <>
              <span className="styleInputsNote-back">{cleanUiText(ex.name.approxTitle ?? 'Aproximaciones')}</span>
              <div className="colorNote3 py-2 rounded-1">
                {ex.name.approximations.map((ap, i) => (
                  <div className="row my-1" key={i}>
                    <span className="fs07em text-muted col-6">
                      <b>{i + 1}</b> aproximacion -
                    </span>
                    <p className="mb-0 col-5 text-start">
                      {cleanUiText(ap.reps)} reps / {cleanUiText(ap.peso)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {isInnerExercise && ex.name?.backoff?.length > 0 && (
            <>
              <span className="styleInputsNote-back m-auto">{cleanUiText(blockBackoffLabel)}</span>
              <div className="colorNote2 py-2 rounded-1 mb-2">
                {ex.name.backoff.map((line, i) => (
                  <p key={i} className="mb-0">
                    {cleanUiText(line.sets)}x{cleanUiText(line.reps)} / {cleanUiText(line.peso)}
                  </p>
                ))}
              </div>
            </>
          )}

          {isInnerExercise && ex.notas && (
            <>
              <span className="styleInputsNote-back text-start">Notas / otros</span>
              <div className="colorNote py-2 rounded-1" style={{ whiteSpace: 'pre-wrap' }}>
                  <p className="pb-0 mb-0">{cleanUiText(ex.notas)}</p>
              </div>
            </>
          )}

          {isInnerExercise && (
            <div className="row justify-content-between align-items-center mt-2 px-2">
              <div className="col-auto">
                <Contador
                  key={`cnt:block:${day_id}:${idx}:${j}:${ex.exercise_id || ex._id || 'exercise'}`}
                  storageKey={`counter:block:${id}:${week_id}:${day_id}:${idx}:${j}:${ex.exercise_id || ex._id || 'exercise'}`}
                  max={ex.sets}
                />
              </div>
              <div className="col-auto">
                <IconButton aria-label="video" disabled={!ex.video} onClick={() => handleButtonClick(ex)}>
                  {ex.isImage
                    ? <ImageIcon className={ex.video ? 'imageIcon' : 'imageIconDisabled'} />
                    : <YouTubeIcon className={ex.video ? 'ytColor' : 'ytColor-disabled'} />}
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
  <div className={`col-12 p-0 mt-4 mb-2 ddp-circuit-card ${isDark ? "ddp-surface" : ""}`}>
    <CircuitHeader
     circuit={normalizeCircuit(element)}
     onAdjust={() => setShowFreeTimerSetup(true)}
     onStart={(c) => openTimerForCircuit({ ...c, freeConfig: { ...freeTimerConfig } })} />
    <table className={`table border-0 mb-0 ddp-circuit-table ${isDark ? "ddp-table ddp-surface " : ""}`}>
      <thead >
        <tr >
          <th className="border-0 text-start tableDark">Nombre</th>
          <th className="border-0 tableDark">Reps</th>
          <th className="border-0 tableDark">Peso</th>
          <th className="border-0 tableDark">Video</th>
        </tr>
      </thead>
      <tbody >
        {element.circuit.map(c => (
          <tr key={c.idRefresh}>
            <td className="border-0 tableDark text-start">{cleanUiText(c.name)}</td>
            <td className="border-0 tableDark px-0">{cleanUiText(c.reps)}</td>
            <td className="border-0 tableDark">{cleanUiText(c.peso)}</td>
            <td className="border-0 tableDark pt-0 pb-3"> 
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
            <span className={`${isDark ? "styleInputsNote-backDark" : "styleInputsNote-back"}  text-center mt-3`}>
              {cleanUiText(element.name.approxTitle ?? "Aproximaciones")}
            </span>
            <div className=" col-12 mb-2">
              {element.name.approximations.map((ap, i) => (
                <div className={`row justify-content-around ${isDark ? "colorNote3Dark" : "colorNote3"} my-1`} key={i}>
                  <span className="fs08em  text-start col-6">
                    <b>{i + 1}</b> aproximacion
                  </span>
                  <p className={`pb-0 mb-0 fs08em col-5 ${isDark ? "text-light " : "text-dark"}`}>
                    {cleanUiText(ap.reps)} reps / {cleanUiText(ap.peso)}
                  </p>
                </div>

                
              ))}
            </div>
          </>
        )}

        {/* - BACKOFF y NOTAS (identico en ambos casos top-level) - */}
        {element.name?.backoff?.length > 0 && (
          <>
            <span className={`${isDark ? "styleInputsNote-backDark" : "styleInputsNote-back"}  text-center my-1`}>{cleanUiText(backoffLabel)}</span>
            <div className=" col-12 mb-2">
              {element.name.backoff.map((line, i) => (
                <div className={`row justify-content-around ${isDark ? "colorNote2Dark" : "colorNote2"}  my-1`} key={i}>
                <span className="fs08em  text-start col-6">
                    <b>{i + 1}</b> back off
                  </span>
                  <p className={`pb-0 mb-0 fs08em col-5 ${isDark ? "text-light " : "text-dark"}`}>
                    {cleanUiText(line.sets)}x{cleanUiText(line.reps)} / {cleanUiText(line.peso)}
                  </p>
                  </div>
              ))}
            </div>
          </>
        )}

        {element.notas && (   
          <>
          <span className={`${isDark ? "styleInputsNote-backDark" : "styleInputsNote-back"}  text-center  my-1`}>Notas</span>
      
            <div
              className=" col-12 mb-2"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              <div className={`row justify-content-center ${isDark ? "colorNoteDark " : "colorNote"} `}>
               
                <div className="col-10">
                  <p className={`pb-0 mb-0 ${isDark ? "text-light " : "text-dark"}`}>{cleanUiText(element.notas)}</p>
                </div>

              </div>
              
            </div>
        </>
        )}

        {/* - FOOTER: Contador + botones - */}
        {isExercise ? (
          <>
            <div className="row justify-content-between mt-3 mb-1">
              <div className="col-6 ">
                <Contador 
                storageKey={`counter:${id}:${week_id}:${day_id}:${element.exercise_id || element._id || idx}`}
                max={element.sets} />
              </div>
                <IconButton
                  id={idx === 0 ? 'video' : null}
                  aria-label="video"
                  disabled={!element.video}
                  className="col-2 pt-0"
                  onClick={() => handleButtonClick(element)}
                >

                  <YouTubeIcon className={element.video && isDark ? 'ytColor ' : element.video && !isDark ? "ytColorWhite" : 'ytColor-disabled '} />
                
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

                <Dialog
                  header={getPlainName(selectedObject?.name) || "Video"}
                  visible={visible}
                  onHide={() => {
                    setVisible(false);
                    setSelectedObject(null);
                  }}
                  modal
                  dismissableMask
                  blockScroll
                  draggable={false}
                  style={{ width: isSmallScreen ? '94vw' : '720px' }}
                  className={`athleteVideoDialog ${athleteDialogClass}`}
                >
                  {selectedObject && (
                    <div className="athlete-video-shell">
                      {selectedObject.isImage === true ? (
                        <div className="athlete-video-frame athlete-video-image-frame">
                          <img
                            src={selectedObject.video}
                            alt={getPlainName(selectedObject.name) || "Imagen del ejercicio"}
                            className="athlete-video-image"
                          />
                        </div>
                      ) : (
                        <div className="athlete-video-frame">
                          <ReactPlayer
                            url={selectedObject.video}
                            controls={true}
                            width="100%"
                            height={isSmallScreen ? "240px" : "405px"}
                            config={playerOptions}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Dialog>

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
          className={`DialogCalculator ${athleteDialogClass}`}
          onHide={() => setShowToolsDialog(false)}
          draggable={true}
        >
          <div className="mb-4">
            <div className={`tools-grid ${isDark ? "tools-grid-dark" : ""}`}>
              {ATHLETE_TOOL_OPTIONS.map((tool) => (
                <button
                  key={tool.value}
                  type="button"
                  onClick={() => setSelectedTool(tool.value)}
                  className={`tools-grid-item ${
                    selectedTool === tool.value ? "tools-grid-item-active" : ""
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            {selectedTool === "calculator" && <PercentageCalculator isDark={isDark} />}
            {selectedTool === "plates" && <PlateCounterTool isDark={isDark} />}
            {selectedTool === "stats" && (
              <ExerciseComparisonChart
                currentWeek={allWeeks[currentWeekIndex]}
                previousWeek={allWeeks[currentWeekIndex + 1]}
                isDark={isDark}
              />
            )}
            {selectedTool === "pr" && (
              <div className="text-center">
                <Formulas isDark={isDark} />
              </div>
            )}
            {selectedTool === "openers" && (
              <div className="d-flex flex-column gap-2">
                {athleteOpenersPlans.length > 1 ? (
                  <select
                    className="form-select form-select-sm"
                    value={selectedOpenersPlanId}
                    onChange={(e) => setSelectedOpenersPlanId(e.target.value)}
                    style={{
                      background: isDark ? "#111827" : "#ffffff",
                      color: isDark ? "#e5e7eb" : "#111827",
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
                    }}
                  >
                    {athleteOpenersPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {(plan.meetName || "Plan sin nombre")}{" "}
                        {plan.meetDate ? `- ${new Date(plan.meetDate).toLocaleDateString()}` : ""}
                      </option>
                    ))}
                  </select>
                ) : null}
                <AttemptPlannerTool
                  athleteId={id}
                  isDark={isDark}
                  initialData={selectedOpenersPlan}
                  readOnly
                />
              </div>
            )}
            {selectedTool === "technical_log" && (
              <TechnicalLogTool
                athleteId={id}
                isDark={isDark}
                initialEntries={technicalLogEntries}
                onChange={handleTechnicalLogChange}
                saveState={{ pending: technicalLogPending, lastFail: technicalLogLastFail }}
              />
            )}
          </div>
        </Dialog>

                <Dialog
                  header="Subir videos al drive"
                  visible={showUploadVideos}
                  style={{ width: '80vw' }}
                  className={athleteDialogClass}
                  onHide={toggleUploadVideos}
                  draggable={true}
                >
                  <div className="container-fluid">
                    <div className="row justify-content-center ">
                      <div className="col-10">
                        <p>
                          Este es tu drive para subir los videos, una vez que los subas, marca la casilla para avisarle a tu entrenador que ya estan cargados.
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
                  className={athleteDialogClass}
                  onHide={hideDialogEditExercises}
                  draggable={true}
                >
                  {completeExercise && (
                    <div className="container-fluid">
                      {!isCurrentWeek && (
                        <div className="alert alert-warning text-center shadow">
                          Recorda que estas en una semana anterior. No estas en la ultima semana designada por tu entrenador.
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

         {/* ===== Banner cambios sin guardar (cerrable) ===== */}
{(exercisesPending || weeklyPending || drivePending || technicalLogPending) && !dismissUnsavedBanner && (
  <div
    className="alert alert-warning m-0 rounded-0 border-top border-warning"
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 72,
      zIndex: 1200
    }}
  >
    <div className="d-flex align-items-start justify-content-between gap-3">
      <div>
        <div className="fw-semibold">Tenes cambios sin guardar.</div>
        <div className="small">
          {exercisesPending ? '- Rutina del dia (peso/notas) ' : ''}
          {weeklyPending ? '- Resumen semanal ' : ''}
          {drivePending ? '- Link de Drive ' : ''}
          {technicalLogPending ? '- Bitacora tecnica ' : ''}
        </div>
        <div className="small text-muted mt-1">
          Si fallo por conexion, tus cambios quedaron guardados localmente. Cuando puedas, volve a guardar.
        </div>
      </div>

      <div className="d-flex flex-column align-items-end gap-2">
        <button
          className="btn btn-sm btn-outline-dark"
          onClick={() => {
            if (weeklyPending) setShowWeeklySummaryModal(true);
            else if (drivePending) setShowDriveDialog(true);
            else if (technicalLogPending) {
              setSelectedTool('technical_log');
              setShowToolsDialog(true);
            }
            else Notify.instantToast('Abri un ejercicio y toca "Guardar" para confirmar cambios.');
          }}
        >
          Revisar
        </button>

        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setDismissUnsavedBanner(true)}
          title="Cerrar"
          aria-label="Cerrar aviso"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}



                <nav
                  className="fixed-bottom d-flex justify-content-around align-items-center py-2 colorMainAll"
                >
                  <button
                    className="nav-item btn-bottom-nav d-flex flex-column align-items-center border-0 bg-transparent"
                    onClick={() => setShowToolsDialog(true)}
                  >
                    <IconButton className="fs-1">
                      <SettingsIcon className="text-light small" />
                    </IconButton>
                    <span className="text-light small">Herramientas</span>
                  </button>
                  <button
                    className="nav-item btn-bottom-nav d-flex flex-column align-items-center border-0 bg-transparent"
                    onClick={() => {
                      const pendingDraft = weeklyDraftKey ? lsGetJSON(weeklyDraftKey, null) : null;
                      const source =
                        pendingDraft?.data && typeof pendingDraft.data === 'object' && !Array.isArray(pendingDraft.data)
                          ? { ...pendingDraft.data }
                          : userProfile?.resumen_semanal
                            ? { ...userProfile.resumen_semanal }
                            : {};

                      weeklySnapshotRef.current = source;
                      setWeeklySummary(source);
                      // 3) forzar remount para limpiar posicion y estado interno del Dialog
                      setWeeklyDialogNonce(n => n + 1);
                      // 4) abrir en el proximo frame (evita calculos con layout viejo tras editar)
                      openNextFrame(() => {
                        // opcional: centrar viewport por si quedo scrolleado por el teclado
                        window.scrollTo?.({ top: 0, behavior: 'instant' });
                        setShowWeeklySummaryModal(true);
                      });
                    }}
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
                    className={athleteDialogClass}
                    modal
                    dismissableMask={true}
                    onHide={() => setShowProfileMissingModal(false)}
                    footer={
                      <div className="row justify-content-center">
                       <div  className="col-6 text-center">
                            <Button label="Mas tarde" onClick={() => setShowProfileMissingModal(false)} className="p-button-primary text-light " />
                        </div>
                        <div className="col-6 text-center">
                            <Button label="Ir al perfil " onClick={redirectToPerfil} className="p-button-primary text-light " />
                        </div>
                      </div>
                    }
                >
                    <p>Hola! {username}, por favor completa tu perfil asi tu entrenador tiene mas datos sobre vos.</p>
                </Dialog>


                <Dialog header="Tu carpeta de Google Drive" visible={showDriveDialog} style={{ width: '90vw' }} className={athleteDialogClass} onHide={() => setShowDriveDialog(false)}>
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
                    <strong>?Como obtener tu link?</strong>
                    <ul className="mb-2 list-group list-group-flush">
                      <li className="list-group-item bg-transparent">Ingresa a tu<button className="py-0 btn btn-primary ms-2 py-1"><AddToDriveIcon className="text-light" /> <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Google Drive</a></button></li>
                      <li className="list-group-item bg-transparent">Crea una carpeta con tu nombre y apellido</li>
                      <li className="list-group-item bg-transparent">Entra a tu carpeta, presiona en este icono <IconButton className="py-0"><MoreVertIcon /></IconButton>y hace click en "Compartir"</li>
                      <li className="list-group-item bg-transparent">Presiona en administrar/gestionar acceso, luego, en acceso general y, si esta en restringido, cambialo a "Cualquier persona que tenga el vinculo/enlace"</li>
                      <li className="list-group-item bg-transparent">Lo importante es que no sea privado, asi tu entrenador puede ver tu carpeta.</li>
                      <li className="list-group-item bg-transparent">Apreta en el icono <IconButton className="py-0"><LinkIcon /></IconButton> copia el vinculo, y pegalo aca.</li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button className="btn btn-outline-light" onClick={() => setShowDriveDialog(false)} >Cancelar</button>
                    <button className="btn  text-light" style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}  onClick={saveDriveLink} >Guardar</button>
                  </div>
                </Dialog>


               <Dialog
                  key={weeklyDialogNonce}              // ðŸ‘‰ remount en cada apertura
                  header="Resumen Semanal"
                  className={`paddingDialog ${athleteDialogClass}`}
                  visible={showWeeklySummaryModal}
                  modal                                  // aseguro modal
                  blockScroll                            // evita scroll del body al abrir
                  appendTo={document.body}               // saca el dialogo del flujo del contenedor
                  baseZIndex={1100}                      // por si compite con Sidebar/Tour
                  draggable={!isSmallScreen}             // ðŸ‘‰ sin draggable en movil (evita que se "pierda")
                  style={{ width: '95vw' }}
                    onHide={() => {
                      // Restaura lo que habia al abrir (o vacio si no habia nada)
                      setWeeklySummary(weeklySnapshotRef.current ?? {});
                      setShowWeeklySummaryModal(false);
                    }}
            
                >
                  <div className={`weekly-summary-shell ${isDark ? "weekly-summary-shell-dark" : ""}`}>
                    <div className="weekly-summary-updated text-center">
                      <span className="fs09em">
                        <strong>Ultima actualizacion:</strong>{" "}
                        {weeklySummary.lastSaved ? new Date(weeklySummary.lastSaved).toLocaleString() : "-"}
                      </span>
                    </div>

                    <div className="weekly-summary-grid">
                      {[
                        { label: "Alimentacion", key: "selection1" },
                        {
                          label: "NEAT",
                          key: "selection2",
                          tooltip:
                            "NEAT se refiere a la energia que gastas en tus actividades cotidianas.",
                        },
                        { label: "Sensaciones", key: "selection3" },
                        { label: "Descanso / sueno", key: "selection4" },
                        { label: "Niveles de estres", key: "selection5" },
                      ].map(({ label, key, tooltip }) => (
                        <div key={key} className="weekly-summary-card">
                          <label className="weekly-summary-label">
                            {label}
                            {tooltip && (
                              <Tooltip title={tooltip} arrow enterTouchDelay={0} leaveTouchDelay={8000}>
                                <IconButton size="small" className="ms-2 py-0">
                                  <HelpOutlineIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </label>
                          <select
                            value={weeklySummary[key]}
                            onChange={(e) => setWeeklySummary((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="form-select fs09em"
                          >
                            <option value="form-options">Seleccionar...</option>
                            {["Muy mal", "Mal", "Regular", "Bien", "Muy bien"].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}

                      <div className="weekly-summary-card">
                        <label className="weekly-summary-label">Peso corporal (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control fs09em"
                          value={weeklySummary.pesoCorporal}
                          onChange={(e) =>
                            setWeeklySummary((prev) => ({
                              ...prev,
                              pesoCorporal: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="weekly-summary-label mb-2">Comentarios sobre la semana</label>
                      <InputTextarea
                        autoResize
                        value={weeklySummary.comments || ""}
                        onChange={(e) => setWeeklySummary((prev) => ({ ...prev, comments: e.target.value }))}
                        className="form-control fs09em weekly-summary-textarea"
                        placeholder="Escribi aca tus comentarios..."
                      />
                      <div className="weekly-summary-actions">
                        <Button
                          label="Vaciar comentarios"
                          icon="pi pi-trash"
                          className="btn btn-outline-dark fs09em"
                          onClick={() => setWeeklySummary((prev) => ({ ...prev, comments: "" }))}
                        />
                      </div>
                    </div>

                    <div className="row justify-content-center mt-3">
                      <div className="col-12">
                        <Button
                          label="Guardar resumen semanal"
                          className="btn modeWhite-Button py-2 w-100"
                          onClick={() => {
                            const updatedSummary = { ...weeklySummary, lastSaved: new Date().toISOString() };

                            UserService.editProfile(id, { resumen_semanal: updatedSummary })
                              .then(() => {
                                setWeeklySummary(updatedSummary);
                                setUserProfile((prev) => ({
                                  ...(prev || {}),
                                  resumen_semanal: updatedSummary,
                                }));
                                setShowWeeklySummaryModal(false);
                                Notify.instantToast("Resumen semanal guardado");

                                serverWeeklyRef.current = updatedSummary;
                                weeklySnapshotRef.current = updatedSummary;
                                setWeeklyPending(false);
                                setWeeklyLastFail('');
                                if (weeklyDraftKey) lsRemove(weeklyDraftKey);
                              })
                              .catch((err) => {
                                console.error("Error al guardar el resumen semanal", err);

                                setWeeklyPending(true);
                                setWeeklyLastFail(new Date().toISOString());
                                Notify.instantToast("No se pudo guardar. Se mantuvieron tus cambios y quedaron guardados localmente.");

                                if (weeklyDraftKey) {
                                  lsSetJSON(weeklyDraftKey, {
                                    data: updatedSummary,
                                    lastFail: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                  });
                                }
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
                      className={`timerDialog ${athleteDialogClass}`}
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
  className={`timerSettingsDialog ${athleteDialogClass}`}
  modal
  onHide={() => setShowPrepSettings(false)}
  draggable
>
  <div className="mb-3">
    <label className="form-label">Segundos de preparacion</label>
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
    <small className="text-muted d-block mt-1">Por defecto: 10s. Rango permitido: 1-300s.</small>
  </div>

  { (activeCircuit?.circuitKind === 'Libre') && (
      <>
        <hr />
        <div className="mb-2 fw-semibold">Libre - Ajustar valores</div>

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
            >Cronometro</button>
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
                >AMRAP (duracion)</button>
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
  header={`Que es un ${circuitInfoTitle}?`}
  visible={showCircuitInfo}
  style={{ width: '90vw', maxWidth: 520 }}
  className={athleteDialogClass}
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
    className={athleteDialogClass}
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
          Cronometro
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
              AMRAP (duracion)
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

