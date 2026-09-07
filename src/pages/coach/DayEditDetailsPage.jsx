import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import './DayEditDetailsPage.css';

//.............................. SERVICES ..............................//
import * as WeekService from "../../services/week.services.js";
import * as PARService from '../../services/par.services.js';

//.............................. HELPERS ..............................//

import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";

//.............................. ARCHIVOS JSON ..............................//
import Options from "../../assets/json/options.json";

//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { ConfigProvider, Segmented, Tour, theme as antdTheme } from 'antd';
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { OverlayPanel } from "primereact/overlaypanel";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ObjectId from 'bson-objectid';
import { SelectButton } from 'primereact/selectbutton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AutoComplete as PrimeAutoComplete } from 'primereact/autocomplete';
import { SpeedDial } from 'primereact/speeddial';


//.............................. COMPONENTES ..............................//

import LogoChico from "../../components/LogoChico.jsx";
import ModalCreateWarmup from "../../components/Bootstrap/ModalCreateWarmup.jsx";
import ModalCreateMovility from "../../components/Bootstrap/ModalCreateMovility.jsx";
import CustomInputNumber from "../../components/CustomInputNumber.jsx";
import AutoComplete from "../../components/Autocomplete.jsx";
import ExerciseComparisonChart from "../../components/ExerciseComparisonChart.jsx";
import ExerciseCommandComposer from "../../components/coach/ExerciseCommandComposer.jsx";

/* Creacion por texto/voz: OCULTA por ahora, hasta retomar el trabajo sobre el
   parser. No se borra nada — el componente, su parser y sus tests siguen en el
   repo; poner esto en true la vuelve a mostrar. Se apaga en el render y no en
   el componente para que, mientras este oculta, nada de su logica llegue a
   ejecutarse ni pueda afectar al resto de la pagina. */
const MOSTRAR_CREACION_POR_TEXTO = false;
import FloatingToolPanel from "../../components/coach/FloatingToolPanel.jsx";
import DraggableModeDock from "../../components/coach/DraggableModeDock.jsx";

//.............................. ICONOS MUI ..............................//

import SaveIcon from '@mui/icons-material/Save';
import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from "@mui/icons-material/Cancel";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
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

import {
  User,
  CalendarPlus,
  ClipboardCopy,
  HelpCircle,
  ToggleLeft,
  Plus,
  X,
  Info,
  Badge,
  Save,
  Eye,
  EyeOff,
  BadgePlus,
  InfoIcon,
  RectangleEllipsis,
  MessageSquare,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Lock,
  RotateCcw,
  Unlock,
  Pencil,
  ArrowUpDown,
  Trash2,
  Settings,
  Flame,
  Move,
  MoreHorizontal,
  Dumbbell,
  Repeat,
  Zap,
  X as CloseIcon
} from 'lucide-react';
import { Add, PlusOneOutlined } from "@mui/icons-material";
import { Ban } from "lucide-react";

const dayEditTokenTheme = {
  algorithm: antdTheme.darkAlgorithm
};

const DEFAULT_FLOATING_TOOL_POSITIONS = {
  dock: { x: 7, y: 5 },
  navigation: { x: 18, y: 112 },
  dayActions: { x: 256, y: 112 },
  clipboard: { x: 478, y: 112 },
  content: { x: 700, y: 112 },
};

const DEFAULT_FLOATING_TOOL_VISIBILITY = {
  navigation: true,
  dayActions: true,
  clipboard: true,
  content: true,
};

const dayEditSegmentedTheme = {
  components: {
    Segmented: {
      trackBg: "#eef2f6",
      itemColor: "#111827",
      itemHoverColor: "#111827",
      itemHoverBg: "#f8fafc",
      itemSelectedBg: "#ffffff",
      itemSelectedColor: "#111827",
      itemActiveBg: "#e5e7eb",
      trackPadding: 4
    }
  }
};

const dayEditDarkTokens = antdTheme.getDesignToken(dayEditTokenTheme);

const getStoredDayEditEditorTheme = () => (
  localStorage.getItem("dayEditEditorTheme") === "dark" ? "dark" : "light"
);

const DAY_EDIT_COLUMN_CONFIG_VERSION = 18;

const DAY_EDIT_COLUMNS = [
  { id: "name", label: "Nombre", defaultVisible: true, defaultWidth: 185, minWidth: 150, maxWidth: 420, className: "dayEditColName" },
  { id: "sets", label: "Series", defaultVisible: true, defaultWidth: 64, minWidth: 56, maxWidth: 130, className: "dayEditColSets" },
  { id: "reps", label: "Reps", defaultVisible: true, defaultWidth: 68, minWidth: 58, maxWidth: 150, className: "dayEditColReps" },
  { id: "peso", label: "Peso", defaultVisible: true, defaultWidth: 54, minWidth: 48, maxWidth: 150, className: "dayEditColPeso" },
  { id: "rpeRir", label: "Alumno", defaultVisible: true, defaultWidth: 44, minWidth: 40, maxWidth: 110, className: "dayEditColRpeRir" },
  { id: "rest", label: "Rest", defaultVisible: true, defaultWidth: 50, minWidth: 46, maxWidth: 120, className: "dayEditColRest" },
  { id: "video", label: "Video", defaultVisible: true, defaultWidth: 18, minWidth: 16, maxWidth: 42, className: "dayEditColVideo" },
  { id: "notas", label: "Notas", defaultVisible: true, defaultWidth: 18, minWidth: 16, maxWidth: 42, className: "dayEditColNotes" },
];

const DAY_EDIT_COLUMN_DEFAULTS = DAY_EDIT_COLUMNS.reduce((acc, column) => {
  acc[column.id] = {
    visible: column.defaultVisible,
    width: column.defaultWidth,
  };
  return acc;
}, {});

const DAY_EDIT_CIRCUIT_COLUMN_CLASS = {
  name: "dayEditCircuitColName",
  reps: "dayEditCircuitColReps",
  peso: "dayEditCircuitColPeso",
  rpeRir: "dayEditCircuitColRpeRir",
  video: "dayEditCircuitColVideo",
};

function normalizeDayEditColumnConfig(raw = {}) {
  return DAY_EDIT_COLUMNS.reduce((acc, column) => {
    const current = raw?.[column.id] || {};
    const parsedWidth = Number(current.width);
    const width = Number.isFinite(parsedWidth)
      ? Math.min(column.maxWidth, Math.max(column.minWidth, parsedWidth))
      : column.defaultWidth;

    acc[column.id] = {
      visible: current.visible !== undefined ? Boolean(current.visible) : column.defaultVisible,
      width,
    };
    return acc;
  }, {});
}

// Vive en scope de MODULO a proposito: se declaraba dentro del componente,
// mas abajo que supersetInfoByIndex, y referenciarlo desde ahi tiraba
// "Cannot access before initialization" (TDZ). Es una funcion pura, no usa
// nada del componente, asi que subirla es seguro y saca el problema de orden.
const parseStudentPreviewSupersetTag = (value) => {
  if (value == null) return null;
  const str = String(value).trim();
  let match = str.match(/^(\d+)\.(\d+)$/);
  if (match) {
    const base = parseInt(match[1], 10);
    const decimal = parseInt(match[2], 10);
    const suffix = decimal > 0 && decimal <= 26 ? String.fromCharCode(64 + decimal) : null;
    return { base, suffix };
  }

  match = str.match(/^(\d+)\s*[--.,\s]?\s*([A-Za-z])?\)?$/);
  if (!match) return null;
  return {
    base: parseInt(match[1], 10),
    suffix: match[2] ? match[2].toUpperCase() : null,
  };
};

function DayEditDetailsPage({ editorTheme }) {
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
  const [modifiedDay, setModifiedDay] = useState([]);
  // Fuente unica de verdad para evitar desincronizaciones entre day/allDays/modifiedDay.
  const day = modifiedDay;
  const setDay = setModifiedDay;
  const [warmup, setWarmup] = useState(false);
  const [firstWidth, setFirstWidth] = useState();

  let idRefresh = RefreshFunction.generateUUID();

  const allDays = modifiedDay;
  const setAllDays = setModifiedDay;
  const [indexDay, setIndexDay] = useState(0);
  const [currentDay, setCurrentDay] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDayDialog, setShowDeleteDayDialog] = useState(false); 
  const [showReorderDaysDialog, setShowReorderDaysDialog] = useState(false);
  const [draftDaysOrder, setDraftDaysOrder] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false); 
  const [newDayName, setNewDayName] = useState(""); 
  const [dayToEdit, setDayToEdit] = useState(null); 
  const [editMode, setEditMode] = useState(false); 
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [glowVideo, setGlowVideo] = useState({});
  const [tourSteps, setTourSteps] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileReorderMode, setIsMobileReorderMode] = useState(false);
  // Menu de acciones secundarias en mobile (se abre desde el boton ... de la
  // barra inferior). Antes estas 9 acciones vivian en una grilla suelta en el
  // medio del contenido, con alturas y alineaciones distintas entre si.
  const [showMobileActionsMenu, setShowMobileActionsMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);
  const [movilityVisible, setMovilityVisible] = useState(false);

  const [isToolsDialVisible, setIsToolsDialVisible] = useState(false);

  const [dialogAllWeeks, setDialogAllWeeks] = useState(false);

  const weeksScrollerRef = useRef(null);
  const [colWidth, setColWidth] = useState(260); // ancho por columna semana
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);
  const blockNameOverlayRef = useRef({});

  const toText = (v) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string") return v === "" ? "-" : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(toText).join(", ");
  if (typeof v === "object") {
    try {
      // stringify corto para que no sea enorme
      return JSON.stringify(v);
    } catch {
      return "-";
    }
  }
  return "-";
};

  const currentWeekDisplayName = useMemo(() => toText(weekName) || 'Semana actual', [weekName]);

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
  const mobileVideoRefs = useRef({});

  const [seeAllWeeks, setSeeAllWeeks] = useState(null);
  const [selectedCompareWeekId, setSelectedCompareWeekId] = useState("");

  const currentWeekForComparison = useMemo(() => ({
    _id: routine?._id || week_id || "__current__",
    name: weekName || "Semana actual",
    routine: Array.isArray(modifiedDay) ? modifiedDay : []
  }), [routine, week_id, weekName, modifiedDay]);

  const compareCandidateWeeks = useMemo(() => {
    const source = Array.isArray(seeAllWeeks) ? seeAllWeeks : [];
    const currentId = String(currentWeekForComparison?._id || "");
    const seen = new Set();
    return source.filter((w) => {
      const wid = String(w?._id || "");
      if (!wid || wid === currentId) return false;
      if (seen.has(wid)) return false;
      seen.add(wid);
      return true;
    });
  }, [seeAllWeeks, currentWeekForComparison]);

  const normalizeCompareText = useCallback((value) => {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  const getCompareExerciseName = useCallback((exercise) => {
    if (!exercise || typeof exercise !== "object") return "";
    if (typeof exercise.name === "string") return exercise.name.trim();
    if (exercise.name && typeof exercise.name === "object" && typeof exercise.name.name === "string") {
      return exercise.name.name.trim();
    }
    return "";
  }, []);

  const getCompareSupSuffix = useCallback((exercise) => {
    if (!exercise || typeof exercise !== "object") return "";
    const raw = exercise.supSuffix ?? exercise.sup ?? exercise.suffix ?? "";
    return String(raw || "").trim();
  }, []);

  const buildWeekStructureSignature = useCallback((week) => {
    const tokens = [];
    const days = Array.isArray(week?.routine) ? week.routine : [];

    const walkExercise = (exercise, path) => {
      if (!exercise || typeof exercise !== "object") return;

      if (exercise.type === "block" && Array.isArray(exercise.exercises)) {
        tokens.push(`${path}|block:start`);
        exercise.exercises.forEach((inner, innerIdx) => {
          walkExercise(inner, `${path}|block:${innerIdx}`);
        });
        tokens.push(`${path}|block:end`);
        return;
      }

      if (Array.isArray(exercise.circuit)) {
        tokens.push(`${path}|circuit:start|sets:${normalizeCompareText(exercise?.typeOfSets)}`);
        exercise.circuit.forEach((item, itemIdx) => {
          const itemName = normalizeCompareText(item?.name);
          tokens.push(`${path}|circuit:item:${itemIdx}|name:${itemName}`);
        });
        tokens.push(`${path}|circuit:end`);
        return;
      }

      const exerciseName = normalizeCompareText(getCompareExerciseName(exercise));
      const supSuffix = normalizeCompareText(getCompareSupSuffix(exercise));
      if (!exerciseName) return;
      tokens.push(`${path}|exercise:${exerciseName}|sup:${supSuffix}`);
    };

    days.forEach((day, dayIdx) => {
      const exercises = Array.isArray(day?.exercises) ? day.exercises : [];
      tokens.push(`day:${dayIdx}|count:${exercises.length}`);
      exercises.forEach((exercise, rootIdx) => {
        walkExercise(exercise, `day:${dayIdx}|root:${rootIdx}`);
      });
    });

    return tokens.join("||");
  }, [normalizeCompareText, getCompareExerciseName, getCompareSupSuffix]);

  const currentWeekSignature = useMemo(() => {
    return buildWeekStructureSignature(currentWeekForComparison);
  }, [buildWeekStructureSignature, currentWeekForComparison]);

  const compareWeeksWithMeta = useMemo(() => {
    return compareCandidateWeeks.map((weekItem) => ({
      ...weekItem,
      __isComparable: buildWeekStructureSignature(weekItem) === currentWeekSignature
    }));
  }, [compareCandidateWeeks, buildWeekStructureSignature, currentWeekSignature]);

  const comparableWeeks = useMemo(() => {
    return compareWeeksWithMeta.filter((weekItem) => weekItem.__isComparable);
  }, [compareWeeksWithMeta]);

  const selectedCompareWeek = useMemo(() => {
    if (!comparableWeeks.length) return null;
    return (
      comparableWeeks.find((w) => String(w?._id) === String(selectedCompareWeekId)) ||
      comparableWeeks[0]
    );
  }, [comparableWeeks, selectedCompareWeekId]);

  const getCompareWeekDateLabel = useCallback((week) => {
    const created = week?.created_at;
    if (created && typeof created === "object") {
      const fecha = typeof created?.fecha === "string" ? created.fecha.trim() : "";
      const hora = typeof created?.hora === "string" ? created.hora.trim() : "";
      return [fecha, hora].filter(Boolean).join(" | ");
    }
    const ms = Date.parse(created || "");
    return Number.isFinite(ms) ? new Date(ms).toLocaleString() : "";
  }, []);

  const weeksWithCurrent = useMemo(() => {
    const prev = Array.isArray(seeAllWeeks) ? seeAllWeeks : [];

    const currentWeek = {
      _id: routine?._id || "__current__",
      name: weekName || "Semana actual",
      routine: Array.isArray(modifiedDay) ? modifiedDay : [],
      __isCurrent: true
    };

    return [...prev, currentWeek];
  }, [seeAllWeeks, modifiedDay, weekName, routine]);

  //  Ahora el count sale del nuevo array
  const weeksCount = weeksWithCurrent.length;

  const [compareWithCurrent, setCompareWithCurrent] = useState(false);

  const [circuitToDelete, setCircuitToDelete] = useState(null);
  const [showDeleteCircuitDialog, setShowDeleteCircuitDialog] = useState(false);
  const [showDeleteBlockDialog, setShowDeleteBlockDialog] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState({ index: null, name: "" });

  const [exerciseToDeleteInCircuit, setExerciseToDeleteInCircuit] = useState(null);
  const [showDeleteExerciseInCircuitDialog, setShowDeleteExerciseInCircuitDialog] = useState(false);

  const [dayClipboard, setDayClipboard] = useState(() => localStorage.getItem('copiedDay') || null);
  const hasDayClipboard = Boolean(dayClipboard || localStorage.getItem("copiedDay"));
  const canDeleteDay =
    (Array.isArray(modifiedDay) && modifiedDay.length > 1) ||
    (Array.isArray(allDays) && allDays.length > 1);
  const currentWarmupItemsCount = Array.isArray(currentDay?.warmup) ? currentDay.warmup.length : 0;
  const currentMovilityItemsCount = Array.isArray(currentDay?.movility) ? currentDay.movility.length : 0;
  const hasCurrentWarmup = currentWarmupItemsCount > 0;
  const hasCurrentMovility = currentMovilityItemsCount > 0;
  const columnConfigStorageKey = useMemo(() => {
    const trainerId = localStorage.getItem("_id") || id || "default";
    return `dayEditColumnConfig:${trainerId}`;
  }, [id]);
  const dayEditSettingsStorageKey = useMemo(() => {
    const trainerId = localStorage.getItem("_id") || id || "default";
    return `dayEditSettings:${trainerId}`;
  }, [id]);
  const [showColumnConfigDialog, setShowColumnConfigDialog] = useState(false);
  const [showDayEditSettingsDialog, setShowDayEditSettingsDialog] = useState(false);
  /**
   * Visibilidad por defecto de las notas: 'closed' | 'open' | 'with-content'.
   * 'with-content' abre solo las notas que ya tienen texto y deja cerradas las
   * vacias, que era lo que faltaba: con 'open' se llenaba la pantalla de cajas
   * en blanco y con 'closed' habia que abrir una por una para ver si decian algo.
   */
  const [notesVisibility, setNotesVisibility] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      if (typeof saved.notesVisibility === "string") return saved.notesVisibility;
      // Compatibilidad: antes esto era un booleano notesDefaultOpen.
      return saved.notesDefaultOpen === true ? "open" : "closed";
    } catch {
      return "closed";
    }
  });
  /**
   * Una nota se ve abierta si el entrenador la abrio a mano, o si el ajuste lo
   * pide: 'open' siempre, 'with-content' solo cuando ya tiene texto.
   */
  const isNotesOpenFor = (notas, key) => {
    if (openExerciseNotesKey === key) return true;
    if (notesVisibility === "open") return true;
    if (notesVisibility === "with-content") return Boolean(String(notas ?? "").trim());
    return false;
  };

  const [defaultRestValue, setDefaultRestValue] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return typeof saved.defaultRestValue === "string" ? saved.defaultRestValue : "";
    } catch {
      return "";
    }
  });
  const [defaultSetsValue, setDefaultSetsValue] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return typeof saved.defaultSetsValue === "string" ? saved.defaultSetsValue : "1";
    } catch {
      return "1";
    }
  });
  const [defaultRepsValue, setDefaultRepsValue] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return typeof saved.defaultRepsValue === "string" ? saved.defaultRepsValue : "1";
    } catch {
      return "1";
    }
  });
  const [defaultPesoValue, setDefaultPesoValue] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return typeof saved.defaultPesoValue === "string" ? saved.defaultPesoValue : "";
    } catch {
      return "";
    }
  });
  const [defaultRepsMode, setDefaultRepsMode] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return ["numeric", "text", "multiple"].includes(saved.defaultRepsMode) ? saved.defaultRepsMode : "numeric";
    } catch {
      return "numeric";
    }
  });
  const [approxBackoffVisibility, setApproxBackoffVisibility] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return ["hover", "always", "hidden"].includes(saved.approxBackoffVisibility) ? saved.approxBackoffVisibility : "hover";
    } catch {
      return "hover";
    }
  });
  const [confirmBeforeDelete, setConfirmBeforeDelete] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return saved.confirmBeforeDelete !== false;
    } catch {
      return true;
    }
  });
  const [editorDensity, setEditorDensity] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditSettings:${trainerId}`) || "{}");
      return ["compact", "comfortable"].includes(saved.editorDensity) ? saved.editorDensity : "compact";
    } catch {
      return "compact";
    }
  });
  const [showStudentPreviewDialog, setShowStudentPreviewDialog] = useState(false);
  const [studentPreviewDayId, setStudentPreviewDayId] = useState("");
  const [studentPreviewAuxSlide, setStudentPreviewAuxSlide] = useState({});
  const [openExerciseNotesKey, setOpenExerciseNotesKey] = useState(null);
  /* El tema lo decide App y llega por prop. Se guarda igual en estado local para
     no cambiar las decenas de lugares que lo leen, y porque el editor tiene que
     seguir funcionando si algun dia se lo monta sin la prop. */
  const [dayEditEditorTheme, setDayEditEditorTheme] = useState(
    () => editorTheme || getStoredDayEditEditorTheme()
  );
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(dayEditSettingsStorageKey) || "{}");
      localStorage.setItem(
        dayEditSettingsStorageKey,
        JSON.stringify({
          ...saved,
          notesVisibility,
          defaultRestValue,
          defaultSetsValue,
          defaultRepsValue,
          defaultPesoValue,
          defaultRepsMode,
          approxBackoffVisibility,
          confirmBeforeDelete,
          editorDensity,
        })
      );
    } catch {
      localStorage.setItem(dayEditSettingsStorageKey, JSON.stringify({
        notesVisibility,
        defaultRestValue,
        defaultSetsValue,
        defaultRepsValue,
        defaultPesoValue,
        defaultRepsMode,
        approxBackoffVisibility,
        confirmBeforeDelete,
        editorDensity,
      }));
    }
  }, [
    dayEditSettingsStorageKey,
    notesVisibility,
    defaultRestValue,
    defaultSetsValue,
    defaultRepsValue,
    defaultPesoValue,
    defaultRepsMode,
    approxBackoffVisibility,
    confirmBeforeDelete,
    editorDensity,
  ]);
  useEffect(() => {
    if (!openExerciseNotesKey) return undefined;
    const handleOutsideNotesClick = (event) => {
      if (event.target?.closest?.(".dayEditNotesHoverCell")) return;
      if (event.target?.closest?.(".dayEditInlineNotesRow")) return;
      setOpenExerciseNotesKey(null);
    };
    document.addEventListener("mousedown", handleOutsideNotesClick);
    return () => document.removeEventListener("mousedown", handleOutsideNotesClick);
  }, [openExerciseNotesKey]);
  useEffect(() => {
    if (editorTheme) setDayEditEditorTheme(editorTheme);
  }, [editorTheme]);

  /* Solo hace falta cuando el editor se monta sin la prop: si App la manda, el
     efecto de arriba llega despues y deja el mismo valor. Antes esta pantalla era
     la unica que escuchaba el evento "storage", asi que un cambio de tema en otra
     pestania la pasaba a claro mientras la barra seguia diciendo "Modo claro". */
  useEffect(() => {
    if (editorTheme) return undefined;

    const syncEditorTheme = (event) => {
      setDayEditEditorTheme(event?.detail === "dark" ? "dark" : getStoredDayEditEditorTheme());
    };
    window.addEventListener("dayEditEditorThemeChange", syncEditorTheme);
    window.addEventListener("storage", syncEditorTheme);
    return () => {
      window.removeEventListener("dayEditEditorThemeChange", syncEditorTheme);
      window.removeEventListener("storage", syncEditorTheme);
    };
  }, [editorTheme]);
  const floatingToolsStorageKey = useMemo(() => {
    const trainerId = localStorage.getItem("_id") || "default";
    return `dayEditFloatingTools:${trainerId}`;
  }, []);
  const [desktopToolsMode, setDesktopToolsMode] = useState(() => {
    const trainerId = localStorage.getItem("_id") || "default";
    const savedMode = localStorage.getItem(`dayEditToolsMode:${trainerId}`);
    return ["sidebar", "simple", "free"].includes(savedMode) ? savedMode : "sidebar";
  });
  const [floatingToolsLocked, setFloatingToolsLocked] = useState(false);
  const [showFloatingVisibilityMenu, setShowFloatingVisibilityMenu] = useState(false);
  const [activeFloatingPanel, setActiveFloatingPanel] = useState("navigation");
  const [floatingToolPositions, setFloatingToolPositions] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditFloatingTools:${trainerId}`) || "null");
      return saved && typeof saved === "object"
        ? { ...DEFAULT_FLOATING_TOOL_POSITIONS, ...saved }
        : DEFAULT_FLOATING_TOOL_POSITIONS;
    } catch {
      return DEFAULT_FLOATING_TOOL_POSITIONS;
    }
  });
  const [floatingToolVisibility, setFloatingToolVisibility] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || "default";
      const saved = JSON.parse(localStorage.getItem(`dayEditFloatingVisibility:${trainerId}`) || "null");
      return saved && typeof saved === "object"
        ? { ...DEFAULT_FLOATING_TOOL_VISIBILITY, ...saved }
        : DEFAULT_FLOATING_TOOL_VISIBILITY;
    } catch {
      return DEFAULT_FLOATING_TOOL_VISIBILITY;
    }
  });

  const changeDesktopToolsMode = useCallback((mode) => {
    const nextMode = ["sidebar", "simple", "free"].includes(mode) ? mode : "sidebar";
    const trainerId = localStorage.getItem("_id") || "default";
    localStorage.setItem(`dayEditToolsMode:${trainerId}`, nextMode);
    setDesktopToolsMode(nextMode);
  }, []);

  const updateFloatingToolPosition = useCallback((panelId, position) => {
    setFloatingToolPositions((prev) => {
      const next = { ...prev, [panelId]: position };
      localStorage.setItem(floatingToolsStorageKey, JSON.stringify(next));
      return next;
    });
  }, [floatingToolsStorageKey]);

  const resetFloatingToolPositions = useCallback(() => {
    const next = { ...DEFAULT_FLOATING_TOOL_POSITIONS };
    setFloatingToolPositions(next);
    localStorage.setItem(floatingToolsStorageKey, JSON.stringify(next));
  }, [floatingToolsStorageKey]);

  const toggleFloatingToolVisibility = useCallback((panelId) => {
    setFloatingToolVisibility((prev) => {
      const next = { ...prev, [panelId]: !prev[panelId] };
      const trainerId = localStorage.getItem("_id") || "default";
      localStorage.setItem(`dayEditFloatingVisibility:${trainerId}`, JSON.stringify(next));
      return next;
    });
  }, []);
  const [columnConfig, setColumnConfig] = useState(() => {
    try {
      const trainerId = localStorage.getItem("_id") || id || "default";
      const savedConfig = localStorage.getItem(`dayEditColumnConfig:${trainerId}`);
      const parsedConfig = savedConfig ? JSON.parse(savedConfig) : {};
      return parsedConfig?.__version === DAY_EDIT_COLUMN_CONFIG_VERSION
        ? normalizeDayEditColumnConfig(parsedConfig)
        : normalizeDayEditColumnConfig();
    } catch {
      return normalizeDayEditColumnConfig();
    }
  });
  const displayedCurrentDay = useMemo(() => {
    const list = Array.isArray(modifiedDay) ? modifiedDay : [];
    if (currentDay?._id) {
      const fromList = list.find((dayItem) => String(dayItem?._id || "") === String(currentDay._id));
      if (fromList) return fromList;
    }
    return list[indexDay] || currentDay;
  }, [modifiedDay, currentDay, indexDay]);
  const visibleExerciseColumns = useMemo(
    () => DAY_EDIT_COLUMNS.filter((column) => columnConfig[column.id]?.visible),
    [columnConfig]
  );
  const visibleCircuitColumns = useMemo(
    () => visibleExerciseColumns.filter((column) => ["name", "reps", "peso", "video"].includes(column.id)),
    [visibleExerciseColumns]
  );
  const modeButtonLabel = useCallback((label) => (
    desktopToolsMode === "simple" ? label.charAt(0).toUpperCase() : label
  ), [desktopToolsMode]);
  const desktopColumnSpan = 2 + visibleExerciseColumns.length + 1;
  const circuitColumnSpan = 1 + visibleCircuitColumns.length + 1;
  const isColumnVisible = useCallback((columnId) => Boolean(columnConfig[columnId]?.visible), [columnConfig]);
  const setColumnVisible = useCallback((columnId, visible) => {
    setColumnConfig((prev) => normalizeDayEditColumnConfig({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        visible,
      },
    }));
  }, []);
  const setColumnWidth = useCallback((columnId, width) => {
    setColumnConfig((prev) => normalizeDayEditColumnConfig({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        width,
      },
    }));
  }, []);
  const resetColumnConfig = useCallback(() => {
    setColumnConfig(normalizeDayEditColumnConfig());
  }, []);

  const getStudentPreviewDayKey = useCallback((dayItem, dayIndex) => {
    return String(dayItem?._id || `day-${dayIndex}`);
  }, []);

  const studentPreviewDays = useMemo(
    () => (Array.isArray(modifiedDay) ? modifiedDay : []),
    [modifiedDay]
  );

  const studentPreviewDay = useMemo(() => {
    if (!studentPreviewDays.length) return currentDay;
    return (
      studentPreviewDays.find((dayItem, dayIndex) => getStudentPreviewDayKey(dayItem, dayIndex) === studentPreviewDayId) ||
      currentDay ||
      studentPreviewDays[0]
    );
  }, [studentPreviewDays, studentPreviewDayId, currentDay, getStudentPreviewDayKey]);

  useEffect(() => {
    if (!showStudentPreviewDialog) return;
    const list = Array.isArray(modifiedDay) ? modifiedDay : [];
    const currentIndex = list.findIndex((dayItem) => String(dayItem?._id || "") === String(currentDay?._id || ""));
    const fallbackIndex = currentIndex >= 0 ? currentIndex : Math.max(0, indexDay || 0);
    const fallbackDay = list[fallbackIndex] || currentDay;
    setStudentPreviewDayId(fallbackDay ? getStudentPreviewDayKey(fallbackDay, fallbackIndex) : "");
    setStudentPreviewAuxSlide({});
  }, [showStudentPreviewDialog, modifiedDay, currentDay, indexDay, getStudentPreviewDayKey]);

  useEffect(() => {
    try {
      localStorage.setItem(
        columnConfigStorageKey,
        JSON.stringify({ __version: DAY_EDIT_COLUMN_CONFIG_VERSION, ...columnConfig })
      );
    } catch (error) {
      console.warn("No se pudo guardar la configuración de columnas", error);
    }
  }, [columnConfigStorageKey, columnConfig]);

const weeksForGrid = useMemo(() => {
   const weeks = Array.isArray(seeAllWeeks) ? seeAllWeeks : [];
   const maxDays = weeks.reduce((m, w) => Math.max(m, Array.isArray(w?.routine) ? w.routine.length : 0), 0);
   return {
     weeks,
     maxDays,
   };
 }, [seeAllWeeks]);

 const flattenDayByOrder = useCallback((day) => {
 const rows = [];
 if (!day || !Array.isArray(day.exercises)) return rows;
 const pickName = (n) => (typeof n === 'object' ? n?.name : n) || '';

  day.exercises.forEach((ex) => {
   if (ex?.type === 'exercise') {
     rows.push({ name: pickName(ex.name), sets: ex.sets ?? '', reps: ex.reps ?? '', peso: ex.peso ?? '' });
     return;
   }
   if (ex?.type === 'block' && Array.isArray(ex.exercises)) {
     ex.exercises.forEach((inEx) => {
       if (inEx?.type === 'exercise') {
         rows.push({ name: pickName(inEx.name), sets: inEx.sets ?? '', reps: inEx.reps ?? '', peso: inEx.peso ?? '' });
       } else if (Array.isArray(inEx?.circuit)) {
         inEx.circuit.forEach((ci) => {
           rows.push({ name: ci?.name || '', sets: '', reps: ci?.reps ?? '', peso: ci?.peso ?? '' });
         });
       }
     });
     return;
   }
   if (Array.isArray(ex?.circuit)) {
     ex.circuit.forEach((ci) => {
       rows.push({ name: ci?.name || '', sets: '', reps: ci?.reps ?? '', peso: ci?.peso ?? '' });
     });
   }
 });
 return rows;
 }, []);

 // Indice de la semana actual (modifiedDay) por indice de dia -> array ordenado de filas
 const currentWeekRowsByDay = useMemo(() => {
 const days = Array.isArray(modifiedDay) ? modifiedDay : [];
 const out = {};
 days.forEach((d, idx) => { out[idx] = flattenDayByOrder(d); });
 return out;
 }, [modifiedDay, flattenDayByOrder]);

 // Chequea si la semana del slide activo es comparable por indice/estructura
 const canCompareWeek = useMemo(() => {
 if (!weeksCount) return false;
 const w = seeAllWeeks?.[activeWeekIdx];
 const prevDays = Array.isArray(w?.routine) ? w.routine : [];
 const currDays = Array.isArray(modifiedDay) ? modifiedDay : [];
 if (prevDays.length !== currDays.length) return false;
 for (let i = 0; i < prevDays.length; i++) {
   const a = flattenDayByOrder(prevDays[i]).length;
   const b = (currentWeekRowsByDay[i] || []).length;
   if (a !== b) return false;
 }
 return true;
 }, [weeksCount, seeAllWeeks, activeWeekIdx, modifiedDay, flattenDayByOrder, currentWeekRowsByDay]);

 // Deltas: numerico seguro (vacio/string no numerico -> null)
 const toNum = (v) => {
 if (v === null || v === undefined) return null;
 const n = Number(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
 return Number.isFinite(n) ? n : null;
 };
 const deltaAbs = (curr, prev) => {
 const c = toNum(curr), p = toNum(prev);
 if (c === null || p === null) return null;
 return c - p;
 };


 const deltaPct = (curr, prev) => {
 const c = toNum(curr), p = toNum(prev);
 if (c === null || p === null || p === 0) return null;
 return ((c - p) / p) * 100;
 };

 const TrendIcon = ({ curr, prev }) => {
  const d = deltaAbs(curr, prev); // usa tu helper ya definido arriba
  if (d === null) return null;

  if (d > 0) return <TrendingUp size={14} className="text-success" title={`Subio (+${d})`} />;
  if (d < 0) return <TrendingDown size={14} className="text-danger" title={`Bajo (${d})`} />;
  return <Minus size={14} className="text-muted" title="Sin cambios" />;
};

 const weekHeaderText = useCallback((week, idx) => {
   const weekName = toText(week?.name) || `Semana ${idx + 1}`;
   const fecha = toText(week?.created_at_local?.fecha);
   const hora  = toText(week?.created_at_local?.hora);
   const created = [fecha !== "-" ? fecha : "", hora !== "-" ? `- ${hora}` : ""].filter(Boolean).join(" ").trim();
   return { weekName, created };
 }, []);

 const cellSummary = useCallback((day) => {
   if (!day) return { title: "-", sub: "Sin día" };
   const name = toText(day?.name);
   const exCount = Array.isArray(day?.exercises) ? day.exercises.length : 0;
   return { title: name, sub: `${exCount} ejercicio${exCount === 1 ? "" : "s"}` };
 }, []);

 // Navegacion horizontal
 const scrollWeeks = useCallback((dir) => {
   const node = weeksScrollerRef.current;
   if (!node) return;
   const delta = (colWidth + 16) * 2; // 2 columnas por "página"
   node.scrollBy({ left: dir * delta, behavior: "smooth" });
 }, [colWidth]);

 const flattenDayExercises = useCallback((day) => {
  const rows = [];
  if (!day || !Array.isArray(day.exercises)) return rows;
  const pickName = (n) => (typeof n === 'object' ? n?.name : n) || '';

  day.exercises.forEach((ex) => {
    if (ex?.type === 'exercise') {
      rows.push({ name: pickName(ex.name), sets: ex.sets ?? '', reps: ex.reps ?? '', peso: ex.peso ?? '' });
      return;
    }
    if (ex?.type === 'block' && Array.isArray(ex.exercises)) {
      ex.exercises.forEach((inEx) => {
        if (inEx?.type === 'exercise') {
          rows.push({ name: pickName(inEx.name), sets: inEx.sets ?? '', reps: inEx.reps ?? '', peso: inEx.peso ?? '' });
        } else if (Array.isArray(inEx?.circuit)) {
          inEx.circuit.forEach((ci) => {
            rows.push({ name: ci?.name || '', sets: '', reps: ci?.reps ?? '', peso: ci?.peso ?? '' });
          });
        }
      });
      return;
    }
    if (Array.isArray(ex?.circuit)) {
      ex.circuit.forEach((ci) => {
        rows.push({ name: ci?.name || '', sets: '', reps: ci?.reps ?? '', peso: ci?.peso ?? '' });
      });
    }
  });
  return rows;
}, []);

const normalizeName = (raw) => {
   const s = typeof raw === 'object' && raw !== null ? raw?.name : raw;
   return (s ?? '').toString().trim().toLowerCase();
 };

 // Construye indice: por dia (idx) => nombre normalizado => { sets, reps, peso }
 const currentWeekIndex = useMemo(() => {
   const days = Array.isArray(modifiedDay) ? modifiedDay : [];
   const byDay = {};
   days.forEach((day, dIdx) => {
     const map = {};
     if (Array.isArray(day?.exercises)) {
       day.exercises.forEach((ex) => {
         if (ex?.type === 'exercise') {
           const key = normalizeName(ex?.name);
           if (key) map[key] = { sets: ex?.sets, reps: ex?.reps, peso: ex?.peso };
           return;
         }
         if (ex?.type === 'block' && Array.isArray(ex?.exercises)) {
           ex.exercises.forEach((inEx) => {
             if (inEx?.type === 'exercise') {
               const key = normalizeName(inEx?.name);
               if (key) map[key] = { sets: inEx?.sets, reps: inEx?.reps, peso: inEx?.peso };
             } else if (Array.isArray(inEx?.circuit)) {
               inEx.circuit.forEach((ci) => {
                 const key = normalizeName(ci?.name);
                 if (key) map[key] = { sets: '', reps: ci?.reps, peso: ci?.peso };
               });
             }
           });
           return;
         }
         if (Array.isArray(ex?.circuit)) {
           ex.circuit.forEach((ci) => {
             const key = normalizeName(ci?.name);
             if (key) map[key] = { sets: '', reps: ci?.reps, peso: ci?.peso };
           });
         }
       });
     }
     byDay[dIdx] = map;
   });
   return byDay;
 }, [modifiedDay]);


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

const sanitizeBrokenText = (value) => {
  return String(value ?? "")
    .replace(/D\u00C3\u00ADa/g, "Día")
    .replace(/d\u00C3\u00ADas/g, "días")
    .replace(/d\u00C3\u00ADa/g, "día")
    .replace(/A\u00C3\u00B1adir/g, "Añadir")
    .replace(/a\u00C3\u00B1adir/g, "añadir")
    .replace(/M\u00C3\u00BAltiple/g, "Multiple")
    .replace(/m\u00C3\u00BAltiple/g, "multiple")
    .replace(/Est\u00C3\u00A1s/g, "Est\u00E1s");
};

const getDefaultRestValue = useCallback(() => {
  const value = String(defaultRestValue || "").trim();
  return value;
}, [defaultRestValue]);

const getDefaultSetsValue = useCallback(() => {
  const value = String(defaultSetsValue || "").trim();
  if (!value) return 1;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, [defaultSetsValue]);

const getDefaultRepsValue = useCallback(() => {
  const value = String(defaultRepsValue || "").trim();
  if (defaultRepsMode === "text") return value;
  if (defaultRepsMode === "multiple") {
    const parsed = Number(value);
    return [Number.isFinite(parsed) ? parsed : 1];
  }
  if (!value) return 1;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 1;
}, [defaultRepsMode, defaultRepsValue]);

const getDefaultPesoValue = useCallback(() => String(defaultPesoValue || "").trim(), [defaultPesoValue]);

const safeParseWeeks = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  if (typeof input === "string") {
    let txt = input.trim();
    if ((txt.startsWith('"') && txt.endsWith('"')) || (txt.startsWith("'") && txt.endsWith("'"))) {
      txt = txt.slice(1, -1).replace(/\\"/g, '"');
    }
    for (let i = 0; i < 2; i++) {
      try {
        const parsed = JSON.parse(txt);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.weeks)) return parsed.weeks;
        if (typeof parsed === "string") {
          txt = parsed;
          continue;
        }
        break;
      } catch {
        break;
      }
    }
  }
  return [];
};

useEffect(() => {
  if (dialogAllWeeks) {
    setActiveWeekIdx(weeksCount - 1); //  al abrir, va al final
  }
}, [dialogAllWeeks, weeksCount]);

useEffect(() => {
  if (!dialogAllWeeks) return;
  if (!comparableWeeks.length) {
    setSelectedCompareWeekId("");
    return;
  }
  setSelectedCompareWeekId((prev) => {
    const stillValid = comparableWeeks.some((w) => String(w?._id) === String(prev));
    return stillValid ? prev : String(comparableWeeks[0]?._id || "");
  });
}, [dialogAllWeeks, comparableWeeks]);

  useEffect(() => {
    if (weeksCount > 0 && activeWeekIdx >= weeksCount) {
      setActiveWeekIdx(weeksCount - 1);
    }
  }, [weeksCount, activeWeekIdx]);

  const nextWeek = useCallback(() => {
    setActiveWeekIdx((i) => Math.min(i + 1, weeksCount - 1));
  }, [weeksCount]);

  const prevWeek = useCallback(() => {
    setActiveWeekIdx((i) => Math.max(i - 1, 0));
  }, []);

  // Navegacion con flechas del teclado mientras el dialogo esta abierto
  useEffect(() => {
    if (!dialogAllWeeks) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') nextWeek();
      if (e.key === 'ArrowLeft')  prevWeek();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogAllWeeks, nextWeek, prevWeek]);

  const [tempColor, setTempColor] = useState();

  React.useEffect(() => {
  const raw = sessionStorage.getItem("WEEKS"); // string
  const parsed = safeParseWeeks(raw);          // array
  setSeeAllWeeks(parsed);
  // opcional: log cuando ya esta seteado
  // console.log("seeAllWeeks para dialogo:", parsed);
}, [statusCancel]); // si cambias semanas cuando cambia statusCancel

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
        title: 'Nombre de la semana',
        description: 'Además de ser el nombre, podés editarlo apretando el botón.',
        target: () => document.getElementById('nameWeek'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Días de la semana',
        description: 'Estos son los días que contiene la semana. Podés navegar entre ellos apretando en el día correspondiente.',
        target: () => document.getElementById('dias'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Agregar día',
        description: 'Este botón permite agregar un día.',
        target: () => document.getElementById('agregarDia'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Editar el nombre del día',
        description: 'Acá podés editar el nombre de cada día.',
        target: () => document.getElementById('editarDia'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Eliminar día',
        description: 'Podés eliminar un día. Esta acción es reversible, si apretas cancelar.',
        target: () => document.getElementById('eliminarDia'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
        {
        title: 'Añadir ejercicio',
        description: 'Podés agregar un ejercicio para luego completarlo.',
        target: () => document.getElementById('addEjercicio'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Añadir circuito',
        description: 'Podés agregar la estructura de un circuito, para luego completarlo.',
        target: () => document.getElementById('addCircuit'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Bloque de movilidad/activación',
        description: 'Ingresa al bloque de activación/movilidad de tu alumno. ',
        target: () => document.getElementById('movility'),
        placement: 'bottom',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Bloque de entrada en calor',
        description: 'Ingresa al bloque de entrada en calor de tu alumno. ',
        target: () => document.getElementById('warmup'),
        placement: 'bottom',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Finalizar' }
      }
    ]);
  }, []);



  useEffect(() => {
    if (modifiedDay[indexDay]) {
      setCurrentDay({ ...modifiedDay[indexDay] });
      setRenderInputSets(true);
      setRenderInputReps(true);
      return;
    }
    setCurrentDay(null);
  }, [modifiedDay, indexDay]);   

  const getActiveDayIndex = useCallback((days = modifiedDay) => {
    const list = Array.isArray(days) ? days : [];
    if (currentDay?._id) {
      const byId = list.findIndex((dayItem) => String(dayItem?._id || "") === String(currentDay._id));
      if (byId !== -1) return byId;
    }
    return Number.isInteger(indexDay) && indexDay >= 0 && indexDay < list.length ? indexDay : -1;
  }, [currentDay?._id, indexDay, modifiedDay]);
   


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

  // 1) clonamos el dia y la lista de ejercicios
  const updatedDays = [...day];
  const dayCopy = { ...updatedDays[indexDay] };
  let exercisesCopy = [...dayCopy.exercises];

  // 2) preparamos el nameObj en base ? las lineas limpias
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

    // 3) clonar y actualizar solo ese ejercicio
    const exCopy = { ...rawExercise, name: buildNameObj(rawExercise.name) };
    innerCopy[exIndex] = exCopy;
    blockCopy.exercises = innerCopy;
    exercisesCopy[blockIndex] = blockCopy;

  } else {
    // === ejercicio ? nivel raiz ===
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
  ex.name?.approximations.some((a) => a.reps || a.peso);


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

  // ... resto exactamente igual ...
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

  // 2) Clonamos el dia completo
  const updated = [...day];

  // 3) Dependiendo de exIndex escogemos el array correcto
  const targetArray = exIndex != null
    ? updated[indexDay].exercises[blockIndex].exercises   // dentro de un bloque
    : updated[indexDay].exercises;                        // al nivel raiz

  // 4) El indice concreto del ejercicio que editamos
  const idx = exIndex != null ? exIndex : blockIndex;
  const ex = targetArray[idx];

  // 5) Filtramos lineas vacias y construimos nameObj
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

  // 7) Volvemos ? escribir ese ejercicio en su sitio
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
   // 3) reseteo el indice de edicion en el ref
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


  /**  re-enumerar los ejercicios despues de arrastrar y soltar. **/
  const reorderExercises = (exercisesArray) => {
    return exercisesArray.map((ex, idx) => {
      return { ...ex, numberExercise: idx + 1 };
    });
  };

  /** Funcion que se llama cuando el drag termin?. Reordena la lista y actualiza el estado. */
  

  const editAndClose = () => {
    setWarmup(false);
    setMovilityVisible(false)
    setIsEditing(true)
  };

  const hideDialogWarmup = () => {
    // Cerrar con la X tiene que dejar el trabajo listo para guardar. Antes solo
    // cerraba: el dia no quedaba marcado como editado, el boton Guardar nunca
    // aparecia y lo cargado en el bloque se perdia sin ningun aviso.
    setIsEditing(true);
    setWarmup(false);
    if(allDays == modifiedDay){
      
    }
  };

  const propiedades = useMemo(
    () => [
      { label: "", className: "dayEditHeaderDrag" },
      { label: "#", className: "dayEditHeaderOrder" },
      ...visibleExerciseColumns.map((column) => ({
        label: column.label,
        className: `dayEditHeader-${column.id}`,
      })),
      { label: "#", className: "dayEditHeaderDelete" },
    ],
    [visibleExerciseColumns]
  );

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
  const options = Array.from({ length: 10 }, (_, idx) => {
    const totalSeconds = (idx + 1) * 30;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  });
  const overlayRef = useRef(null);

  const [val, setVal] = useState(() => formatForDisplay(value));

  useEffect(() => {
    setVal(formatForDisplay(value));
  }, [value]);

  function formatForDisplay(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) return digits;
    const mm = digits.slice(0,2);
    const ss = digits.slice(2,4);
    return `${mm}:${ss}`;
  }

  const formatAndEmit = raw => {
    const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 4);
    if (!digits) {
      setVal('');
      onChange('');
      return;
    }

    let mm = digits.slice(0, 2);
    let ss = digits.slice(2, 4);

    if (!mm) mm = '00';
    if (mm.length === 1) mm = `0${mm}`;
    if (!ss) ss = '00';
    if (ss.length === 1) ss = `${ss}0`;

    const safeSeconds = String(Math.min(59, parseInt(ss, 10) || 0)).padStart(2, '0');
    const formatted = `${mm}:${safeSeconds}`;
    setVal(formatted);
    onChange(formatted);
  };

  return (
    <div className="dayEditRestManual">
      <input
        type="text"
        value={val}
        maxLength={5}
        placeholder="MM:SS"
        className="form-control dayEditFieldInput dayEditRestManualInput text-center"
        onChange={(e) => setVal(formatForDisplay(e.target.value))}
        onBlur={() => formatAndEmit(val)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            formatAndEmit(val);
            overlayRef.current?.hide();
          }
        }}
      />

      <button
        type="button"
        className="dayEditRestManualToggle"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => overlayRef.current?.toggle(e)}
        aria-label="Seleccionar rest"
      >
        <ChevronDown size={15} />
      </button>

      <OverlayPanel ref={overlayRef} className="dayEditDarkOverlayPanel dayEditRestPresetOverlay">
        <div className="dayEditRestPresetGrid">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="dayEditRestPresetItem"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                formatAndEmit(option);
                overlayRef.current?.hide();
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </OverlayPanel>
    </div>
  );
}

function CircuitTimeInput({ value = "", onCommit, placeholder = "10", commitOnChange = false }) {
  const [draft, setDraft] = useState(String(value ?? ""));
  const [isFocused, setIsFocused] = useState(false);
  const draftRef = useRef(String(value ?? ""));

  useEffect(() => {
    if (!isFocused) {
      const nextValue = String(value ?? "");
      draftRef.current = nextValue;
      setDraft(nextValue);
    }
  }, [value, isFocused]);

  const commit = (rawValue) => {
    const nextValue = String(rawValue ?? "").trim();
    draftRef.current = nextValue;
    setDraft(nextValue);
    onCommit(nextValue);
  };

  return (
    <div className="dayEditCircuitTimeCombo">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="form-control form-control-sm dayEditCircuitTextInput dayEditCircuitTimeInput"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          const nextValue = e.target.value.replace(/[^\d]/g, "");
          draftRef.current = nextValue;
          setDraft(nextValue);
          if (commitOnChange) {
            onCommit(nextValue);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (!commitOnChange) {
            commit(draftRef.current);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draftRef.current);
            e.currentTarget.blur();
          }
        }}
      />
    </div>
  );
}

function CircuitSmallNumberInput({ value, onChange, min = 1, title }) {
  const [draft, setDraft] = useState(String(value ?? min));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(String(value ?? min));
    }
  }, [value, min, focused]);

  const commit = (rawValue) => {
    const parsed = parseInt(String(rawValue || "").trim(), 10);
    const nextValue = Math.max(min, Number.isFinite(parsed) ? parsed : min);
    setDraft(String(nextValue));
    onChange(nextValue);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      className="form-control form-control-sm text-center dayEditCircuitInlineNumberInput"
      value={draft}
      title={title}
      onFocus={() => setFocused(true)}
      onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
      onBlur={() => {
        setFocused(false);
        commit(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit(draft);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

function CircuitNotesTextarea({ value = "", onCommit, className = "" }) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = () => {
    if ((value ?? "") !== draft) {
      onCommit(draft);
    }
  };

  return (
    <textarea
      placeholder="Notas"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      className={`form-control dayEditCircuitNotesNative ${className || ""}`.trim()}
      rows={2}
    />
  );
}

function CircuitNotesInput({ value = "", onCommit, className = "" }) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const commit = () => {
    if ((value ?? "") !== draft) {
      onCommit(draft);
    }
  };

  return (
    <input
      className={className}
      placeholder="Notas"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

const normalizeCircuitKindValue = (rawValue) => {
  const cleanValue = String(rawValue ?? "").trim();
  if (!cleanValue) return "Libre";
  const matchedKind = CIRCUIT_KINDS.find((item) => {
    const label = String(item.label || "").toLowerCase();
    const value = String(item.value || "").toLowerCase();
    const current = cleanValue.toLowerCase();
    return current === label || current === value;
  });
  return matchedKind?.value || null;
};

const inferCircuitKind = (circuit = {}) => {
  const fromKind = normalizeCircuitKindValue(circuit?.circuitKind);
  const fromType = normalizeCircuitKindValue(circuit?.type);
  if (fromKind && fromKind !== "Libre") return fromKind;
  if (fromType && fromType !== "Libre") return fromType;
  return fromKind || "Libre";
};

const restOptions = Array.from({ length: 10 }, (_, i) => i + 1)
  .flatMap(m => [15,30,45].map(s => {
    const mm = String(m).padStart(2,'0');
    const ss = String(s).padStart(2,'0');
    return { label: `${mm}:${ss}`, value: `${mm}:${ss}` };
  }));

  /**
   * Filas etiqueta/control de la card de ejercicio en MOBILE.
   *
   * Antes este bloque estaba duplicado: una copia para el ejercicio suelto y
   * otra para el ejercicio dentro de un bloque. Las dos renderizaban los mismos
   * seis campos pero con anchos de columna arbitrarios y distintos entre si
   * (col-4 + col-7 = 11 columnas, col-5 + col-5 = 10), y cada una alineaba las
   * etiquetas a su manera (ms-2, me-5 d-block, text-center m-auto, text-start).
   * De ahi que el peso no coincidiera con el del alumno y que unas etiquetas
   * quedaran pegadas al texto y otras a la izquierda.
   *
   * Ahora hay UNA sola definicion y el layout lo resuelve CSS Grid, con la
   * columna de etiquetas de ancho fijo (--dd-label-col) para que todos los
   * controles arranquen en la misma vertical.
   *
   * index / blockIndex se pasan tal cual a customInputEditDay:
   *   - ejercicio suelto         -> (exercise, i)
   *   - ejercicio dentro bloque  -> (ex, j, i)
   */
  /**
   * Cabecera + campos de UN ejercicio dentro de un circuito, en MOBILE.
   *
   * Igual que con la card de ejercicio, esto estaba duplicado entre el circuito
   * suelto y el circuito dentro de un bloque, y en las dos copias Peso y Reps
   * usaban col-5 + col-5 (10 de 12 columnas), por lo que no quedaban alineados
   * entre si ni con el resto de la card. Ademas las etiquetas iban en minuscula
   * mientras que en la card de ejercicio van en mayuscula.
   *
   * Reusamos exactamente las mismas filas etiqueta/control
   * (.dayEditMobileFieldRow) para que circuitos y ejercicios se lean igual.
   *
   * customInputEditExerciseInCircuit(data, circuitIndex, exIndex, field, repsValue, blockIndex)
   */
  /**
   * Pie de la card de ejercicio en MOBILE.
   *
   * Antes eran tres col-4 con un Dropdown pesado a la izquierda y dos iconos
   * sueltos: los tres bloques competian por el mismo peso visual y las
   * acciones destructivas no se distinguian de las neutras.
   *
   * Ahora: a la izquierda el orden (que es un DATO, con su etiqueta como el
   * resto de los campos de la card) y a la derecha las ACCIONES agrupadas,
   * separadas por una linea que cierra la card.
   */
  const renderMobileExerciseFooter = ({
    orderValue, onOrderChange, videoKey, videoValue, onVideoChange, onDelete,
  }) => (
    <div className="dayEditMobileCardFooter">
      <div className="dayEditMobileCardFooterOrder">
        <span className="dayEditMobileFieldLabel">Orden</span>
        <Dropdown
          value={orderValue}
          options={options}
          onChange={(e) => onOrderChange(e.value)}
          placeholder="#"
          optionLabel="label"
          className="p-dropdown-group dayEditMobileOrderSelect"
        />
      </div>

      <div className="dayEditMobileCardFooterActions">
        {isColumnVisible('video') && (
          <>
            <button
              type="button"
              className={`dayEditMobileCardAction${videoValue ? ' hasValue' : ''}`}
              onClick={(e) => mobileVideoRefs.current[videoKey]?.toggle(e)}
              aria-label="Link de video"
              title={videoValue ? 'Editar link de video' : 'Agregar link de video'}
            >
              <YouTubeIcon />
            </button>
            <OverlayPanel
              ref={(el) => (mobileVideoRefs.current[videoKey] = el)}
              className="dayEditLightOverlayPanel"
            >
              <input
                className="form-control ellipsis-input text-center dayEditFieldInput"
                type="text"
                defaultValue={videoValue || ''}
                placeholder="Pega el link del video"
                onChange={(e) => onVideoChange(e.target.value)}
              />
            </OverlayPanel>
          </>
        )}

        <button
          type="button"
          className="dayEditMobileCardAction isDanger"
          onClick={onDelete}
          aria-label="delete-exercise"
          title="Eliminar ejercicio"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );

  const renderMobileCircuitItem = (item, circuitIndex, exIndex, blockIndex = null, onDelete = null) => {
    const input = (field) =>
      customInputEditExerciseInCircuit(item[field], circuitIndex, exIndex, field, item[field], blockIndex);

    const rows = [
      { key: 'peso', label: 'Peso' },
      { key: 'reps', label: 'Reps' },
    ].filter((row) => isColumnVisible(row.key));

    return (
      <div className="dayEditMobileCircuitItem" key={item.idRefresh || exIndex}>
        <div className="dayEditMobileCircuitItemHeader">
          <span className="dayEditMobileCircuitItemTitle">Ejercicio {exIndex + 1}</span>
          <div className="dayEditMobileCircuitItemActions">
            {isColumnVisible('video') && input('video')}
            {onDelete && (
              <IconButton aria-label="delete-circuit-exercise" onClick={onDelete}>
                <CancelIcon className="colorIconDeleteExercise" />
              </IconButton>
            )}
          </div>
        </div>

        {isColumnVisible('name') && (
          <div className="dayEditMobileCircuitItemName">{input('name')}</div>
        )}

        <div className="dayEditMobileFieldGrid">
          {rows.map((row) => (
            <div className="dayEditMobileFieldRow" data-field={row.key} key={row.key}>
              <span className="dayEditMobileFieldLabel">{row.label}</span>
              <div className="dayEditMobileFieldControl">{input(row.key)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMobileExerciseFields = (ex, index, blockIndex = null) => {
    const input = (field, value) => customInputEditDay(value, index, field, blockIndex);

    const rows = [
      { key: 'sets', label: 'Sets', node: () => input('sets', ex.sets) },
      { key: 'reps', label: 'Reps', node: () => input('reps', ex.reps) },
      { key: 'peso', label: 'Peso', node: () => input('peso', ex.peso) },
      // El campo del alumno trae su propia etiqueta con el tooltip de "solo lo
      // edita el alumno", por eso no lleva etiqueta de texto plano.
      { key: 'rpeRir', label: null, node: () => input('rpeRir', ex.athleteRpeRir ?? ex.rpeRir) },
      { key: 'rest', label: 'Rest', node: () => input('rest', ex.rest) },
      { key: 'notas', label: 'Notas', node: () => input('notas', ex.notas) },
    ];

    return (
      <div className="dayEditMobileFieldGrid">
        {rows.filter((row) => isColumnVisible(row.key) && !row.oculto).map((row) => (
          <div className="dayEditMobileFieldRow" data-field={row.key} key={row.key}>
            {row.label === null
              ? renderStudentOnlyFieldLabel('dayEditMobileFieldLabel')
              : <span className="dayEditMobileFieldLabel">{row.label}</span>}
            <div className="dayEditMobileFieldControl">{row.node()}</div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Que ejercicios del dia forman una superserie.
   *
   * IMPORTANTE: la marca NO es un campo aparte, esta en el propio
   * numberExercise. options.json define el orden como decimales:
   *   2    -> ejercicio 2 suelto
   *   2.1  -> "2-A"   2.2 -> "2-B"   2.3 -> "2-C" ...
   * Mi primera version pedia un campo supSuffix, que solo existe en datos
   * de prueba; con datos reales nunca agrupaba nada.
   *
   * Reusamos parseStudentPreviewSupersetTag, que es el parser que ya usa la
   * vista del alumno y entiende los dos formatos (2.1 y "2-A"). Asi el editor
   * y lo que ve el alumno agrupan igual y no se pueden desincronizar.
   *
   * Criterio (el mismo que groupStudentPreviewSupersets): ejercicios
   * CONSECUTIVOS con la misma base, y solo cuenta como superserie si hay 2 o
   * mas.
   *
   * Devolvemos un mapa por indice en vez de reagrupar la lista: el listado es
   * un Droppable con <Draggable index={i}> sobre la lista plana, y anidar los
   * miembros correria los indices y romperia el reordenamiento.
   */
  const supersetInfoByIndex = useMemo(() => {
    const list = Array.isArray(currentDay?.exercises) ? currentDay.exercises : [];
    const map = {};
    let i = 0;
    while (i < list.length) {
      const item = list[i];
      if (item?.type !== "exercise") { i += 1; continue; }

      const tag = parseStudentPreviewSupersetTag(item.numberExercise ?? item.number);
      if (!tag) { i += 1; continue; }

      let j = i;
      const sufijos = [];
      while (j < list.length) {
        const cur = list[j];
        if (cur?.type !== "exercise") break;
        const curTag = parseStudentPreviewSupersetTag(cur.numberExercise ?? cur.number);
        if (!curTag || curTag.base !== tag.base) break;
        sufijos.push(curTag.suffix || String.fromCharCode(65 + sufijos.length));
        j += 1;
      }

      const total = j - i;
      if (total > 1) {
        for (let k = i; k < j; k += 1) {
          map[k] = {
            esMiembro: true,
            esPrimero: k === i,
            esUltimo: k === j - 1,
            base: tag.base,
            // Sufijo propio de ESTE ejercicio dentro del grupo ("A", "B", ...).
            // En mobile las cards no se leen juntas como las filas de la tabla,
            // asi que cada una tiene que identificarse por si misma.
            sufijo: sufijos[k - i],
            orden: k - i + 1,
            total,
            indices: Array.from({ length: total }, (_, n) => i + n),
            sufijos,
          };
        }
      }
      i = Math.max(j, i + 1);
    }
    return map;
  }, [currentDay]);

  /**
   * Superseries: campos VINCULADOS.
   *
   * "= Series" y "= Reps" son interruptores, no acciones de una sola vez:
   *   - al activarlos, igualan el campo en todo el grupo (tomando el valor del
   *     primer ejercicio como referencia);
   *   - mientras siguen activos, editar ese campo en cualquier miembro lo
   *     replica en los demas;
   *   - al desactivarlos, cada ejercicio vuelve a su valor propio.
   *
   * El estado vive en memoria (no se guarda con la semana): es una ayuda de
   * edicion, no un dato de la planificacion.
   */
  // Campos que se pueden mantener en paridad dentro de una superserie.
  const SUPERSET_LINKABLE = ["sets", "reps", "peso", "rest"];

  /* "peso" queda OCULTO por ahora: igualar el peso no replica bien el valor.
     No se borra nada de la logica —sigue entera y alcanza con sacar el campo
     de esta lista para reactivarlo—, pero ademas se NEUTRALIZA: si no se
     apagara aca, un vinculo de peso guardado antes en localStorage seguiria
     igualando pesos con el boton ya invisible, sin forma de desactivarlo.
     isSupersetLinked es la unica puerta: la usan el render, el toggle y la
     propagacion, asi que apagarlo aca lo apaga en todos lados. */
  const SUPERSET_LINK_HIDDEN = ["peso"];
  const SUPERSET_LINK_VISIBLE = SUPERSET_LINKABLE.filter(
    (campo) => !SUPERSET_LINK_HIDDEN.includes(campo)
  );

  const supersetLinksStorageKey = `dayEditSupersetLinks:${week_id ?? "w"}`;

  const [supersetLinks, setSupersetLinks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`dayEditSupersetLinks:${week_id ?? "w"}`) || "{}");
    } catch {
      return {};
    }
  });

  // Se guarda por semana: es una preferencia de edicion del entrenador, no un
  // dato de la planificacion, asi que no viaja al backend con el dia.
  useEffect(() => {
    try {
      localStorage.setItem(supersetLinksStorageKey, JSON.stringify(supersetLinks));
    } catch {
      // Sin localStorage (modo privado) los vinculos funcionan igual, solo que
      // no sobreviven a un refresh.
    }
  }, [supersetLinksStorageKey, supersetLinks]);

  const supersetLinkKey = (base, campo) => `${currentDay?._id ?? "d"}|${base}|${campo}`;

  const isSupersetLinked = (indice, campo) => {
    const sup = supersetInfoByIndex[indice];
    if (!sup?.esMiembro) return false;
    if (SUPERSET_LINK_HIDDEN.includes(campo)) return false;
    return Boolean(supersetLinks[supersetLinkKey(sup.base, campo)]);
  };

  /** Copia el valor del primer ejercicio del grupo al resto. */
  const igualarEnSuperserie = (sup, campo) => {
    const lista = Array.isArray(currentDay?.exercises) ? currentDay.exercises : [];
    const referencia = lista[sup.indices[0]]?.[campo];
    if (referencia === undefined) return;
    sup.indices
      .filter((idx) => idx !== sup.indices[0])
      .forEach((idx) => changeModifiedData(idx, referencia, campo));
  };

  const SUPERSET_LINK_LABELS = {
    sets: "Series",
    reps: "Reps",
    peso: "Peso",
    rest: "Rest",
  };

  /** Botones de vinculo del grupo. Se generan de la lista para que agregar un
   *  campo vinculable sea tocar SUPERSET_LINKABLE y nada mas. */
  const renderSupersetTools = (indice) => (
    <span className="dayEditSupersetTools">
      {SUPERSET_LINK_VISIBLE.map((campo) => (
        <button
          key={campo}
          type="button"
          onClick={() => toggleSupersetLink(indice, campo)}
          aria-pressed={isSupersetLinked(indice, campo)}
          className={isSupersetLinked(indice, campo) ? "isLinked" : ""}
          title={`Vincular ${SUPERSET_LINK_LABELS[campo]} en todo el grupo`}
        >
          {`= ${SUPERSET_LINK_LABELS[campo]}`}
        </button>
      ))}
    </span>
  );

  const toggleSupersetLink = (indice, campo) => {
    const sup = supersetInfoByIndex[indice];
    if (!sup?.esMiembro) return;
    if (SUPERSET_LINK_HIDDEN.includes(campo)) return;
    const key = supersetLinkKey(sup.base, campo);
    const seActiva = !supersetLinks[key];

    setSupersetLinks((prev) => ({ ...prev, [key]: seActiva }));

    // Al activar, igualamos de entrada; despues el vinculo mantiene la paridad.
    if (seActiva) {
      igualarEnSuperserie(sup, campo);
      setIsEditing(true);
    }
  };

  const customInputEditDay = (data, index, field, blockIndex = null) => {

      const applyChange = (value) => {
        const targetField = field === "rpeRir" ? "athleteRpeRir" : field;
        if (blockIndex != null) {
          changeBlockExerciseData(blockIndex, index, targetField, value);
          return;
        }
        // Con el vinculo activo, editar series (o reps) en un miembro de la
        // superserie lo replica en todo el grupo. Sin vinculo, cada ejercicio
        // guarda su propio valor.
        const sup = supersetInfoByIndex[index];
        if (sup?.esMiembro && isSupersetLinked(index, targetField)) {
          sup.indices.forEach((idx) => changeModifiedData(idx, value, targetField));
          return;
        }
        changeModifiedData(index, value, targetField);
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
          <div className={`row justify-content-center text-center aa ${field == 'reps' ? 'mb-2 marginReps' : ''}`}>
            <div className={`input-number-container ${firstWidth < 992 ? 'col-8' : ''}`}>
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
          <div className={`row justify-content-center text-center aa ${field == 'reps' ? 'mt-4' : ''}`}>
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
                                className="styleSelectButton dayEditRepsModeSelect px-0"
                                options={[
                                  { label: 'Texto', value: 'text' },
                                  { label: 'Multiple', value: 'multiple' }
                                ]}
                              />
                            </div> 
                    
          </div>

          </>
        }
        </>
      );}
       else if (field === "video") {
  // clave unica por bloque+ejercicio o por ejercicio simple
  const refKey = blockIndex != null ? `b-${blockIndex}-e-${index}` : `s-${index}`;

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

      <OverlayPanel ref={(el) => (productRefsSimple.current[refKey] = el)} className="dayEditLightOverlayPanel">
        <input
          ref={(el) => (inputRefs.current[`${refKey}-${field}`] = el)}
          className="form-control ellipsis-input text-center dayEditFieldInput"
          type="text"
          defaultValue={data}
          onChange={(e) => {
            if (blockIndex != null) {
              // Y dentro de bloque: actualiza SOLO ese ejercicio
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
          className={`w-100 mt-2 pt-1 dayEditNotesInput`}
          autoResize
          defaultValue={data}
          onChange={e => applyChange(e.target.value)}
        />
      );
    } else if (field === "rest") {
      return (
        <RestInputDropdown
          value={data || ""}
          onChange={applyChange}
        />
      );
    } else if (field === "rpeRir") {
      const studentValue = data ?? "";
      return (
        <div className="row justify-content-center text-center">
          <input
            ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
            className={`form-control dayEditFieldInput ${firstWidth > 992 ? 'stylePesoInput' : 'stylePesoInputMobile'} text-center`}
            type="text"
            defaultValue={studentValue}
            onChange={(event) => applyChange(event.target.value)}
          />
        </div>
      );
    } else {
      return (
        <div className="row justify-content-center text-center">
        <input
          ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
          className={`form-control dayEditFieldInput ${firstWidth > 992 ? 'stylePesoInput' : 'stylePesoInputMobile'} text-center`}
          placeholder={field === "peso" ? "kg..." : ""}
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
        setIsMobileReorderMode(false);
      });
  };

const handleDeleteClick = (exercise) => {
  const nameString =
    typeof exercise?.name === "object"
      ? exercise?.name?.name
      : exercise?.name;

  setExerciseToDelete({
    scope: "root", //  NUEVO
    exercise_id: exercise.exercise_id,
    name: nameString,
  });
  if (confirmBeforeDelete) {
    setShowDeleteDialog(true);
  } else {
    acceptDeleteExercise(exercise.exercise_id);
  }
};

const handleDeleteExerciseInBlockClick = (blockIndex, exercise) => {
  const nameString =
    typeof exercise?.name === "object"
      ? exercise?.name?.name
      : exercise?.name;

  setExerciseToDelete({
    scope: "block", //  NUEVO
    blockIndex,
    exercise_id: exercise.exercise_id,
    name: nameString,
  });
  if (confirmBeforeDelete) {
    setShowDeleteDialog(true);
  } else {
    removeExerciseFromBlock(blockIndex, exercise.exercise_id);
    Notify.instantToast("Ejercicio eliminado con éxito");
  }
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
  if (!exerciseToDelete) return;

  if (exerciseToDelete.scope === "block") {
    removeExerciseFromBlock(exerciseToDelete.blockIndex, exerciseToDelete.exercise_id);
    Notify.instantToast("Ejercicio eliminado con éxito");
  } else {
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

  const AddNewExercise = (commandData = null) => {
    if (!Array.isArray(modifiedDay) || !modifiedDay[indexDay]) {
      Notify.instantToast("No hay día seleccionado.");
      return;
    }
    const updatedDays = [...modifiedDay];  
    const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;

    const newExercise = {
      exercise_id: new ObjectId().toString(),
      type: 'exercise',
      numberExercise: nextNumberExercise,
      name: commandData?.name || '',
      reps: commandData?.reps ?? getDefaultRepsValue(),
      sets: commandData?.sets ?? getDefaultSetsValue(),
      peso: commandData?.peso || getDefaultPesoValue(),
      rpeRir: '',
      rest: commandData?.rest || getDefaultRestValue(),
      video: '',
      notas: '',
    };

    updatedDays[indexDay].exercises.push(newExercise);
    updatedDays[indexDay].lastEdited = new Date().toISOString();
    setIsEditing(true);
    setDay(updatedDays);
    setAllDays(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Ejercicio creado con éxito!");
  };

const handleCancel = () => {
  setCurrentDay(null);
  setStatusCancel(idRefresh);
  setIsEditing(false);
};

  const confirmCancel = () => {
    setShowCancelDialog(true);
  };

   // ======== COPY / PASTE DIA ========
 const copyDayToClipboard = () => {
   const src = modifiedDay?.[indexDay] || day?.[indexDay];
   if (!src) {
     Notify.instantToast("No hay día seleccionado");
     return;
   }
   try {
     const json = JSON.stringify(sanitizeDayForPaste(src, indexDay + 1));
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
   const { exercise_id, athleteRpeRir, rpeRir, ...rest } = ex || {};
   return { ...rest, exercise_id: new ObjectId().toString() };
 };

 const cloneWarmupItem = (item) => {
   const { warmup_id, ...rest } = item || {};
   return { ...rest, warmup_id: new ObjectId().toString() };
 };

 const cloneMovilityItem = (item) => {
   const { movility_id, ...rest } = item || {};
   return { ...rest, movility_id: new ObjectId().toString() };
 };

 // Clona un objeto de circuito (raiz o dentro de bloque)
 const cloneCircuit = (ex) => {
   const { exercise_id, athleteRpeRir, rpeRir, circuit = [], ...rest } = ex || {};
   const newCircuit = Array.isArray(circuit)
     ? circuit.map(item => {
       const { athleteRpeRir: _omitAthleteRpeRir, rpeRir: _omitRpeRir, ...cleanItem } = item || {};
       return { ...cleanItem, idRefresh: RefreshFunction.generateUUID() };
     })
     : [];
   return { ...rest, exercise_id: new ObjectId().toString(), circuit: newCircuit };
 };

 // Decide como clonar un elemento (bloque / ejercicio / circuito)
 const cloneAnyExerciseOrStructure = (el) => {
   if (!el) return el;
   if (el.type === 'block') return cloneBlock(el);
   if (Array.isArray(el.circuit)) return cloneCircuit(el);
   return cloneSimpleExercise(el);
 };

 // Clona un bloque con todos sus ejercicios internos
const cloneBlock = (block) => {
  const { block_id, numberExercise, athleteRpeRir, rpeRir, exercises = [], ...rest } = block || {};
  const clonedInner = exercises.map(inner => cloneAnyExerciseOrStructure(inner));

  // Re-enumerar solo los hijos del bloque, no el bloque en si
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
  const {
    _id: _omit,
    exercises = [],
    warmup = [],
    movility = [],
    movilityName
  } = srcDay || {};
  const clonedExercises = exercises.map(el => cloneAnyExerciseOrStructure(el));
  const clonedWarmup = Array.isArray(warmup) ? warmup.map(cloneWarmupItem) : [];
  const clonedMovility = Array.isArray(movility) ? movility.map(cloneMovilityItem) : [];

  // Y No numerar bloques
  clonedExercises.forEach((it, idx) => {
    if (it?.type === 'block') {
      delete it.numberExercise;      // por si venia con numero
    } else if (!it?.numberExercise) {
      it.numberExercise = `${idx + 1}`;
    }
  });

  return {
    _id: new ObjectId().toString(),
    name: `Día ${nextIndexNumber}`,
    lastEdited: new Date().toISOString(),
    exercises: clonedExercises,
    warmup: clonedWarmup,
    movility: clonedMovility,
    movilityName: movilityName || undefined
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
 // ======== FIN COPY / PASTE DIA ========

const addNewDay = () => {
  const updatedDays = [...modifiedDay]; //  una sola fuente

  const nextDayIndex = updatedDays.length + 1;
  const newDay = {
    _id: new ObjectId().toString(),
    name: `Día ${nextDayIndex}`,
    lastEdited: new Date().toISOString(),
    exercises: [],
  };

  updatedDays.push(newDay);

  //  sincronizar todo
  setModifiedDay(updatedDays);
  setDay(updatedDays);
  setAllDays(updatedDays);

  //  ir al nuevo dia (evita indices colgados)
  setIndexDay(updatedDays.length - 1);
  setCurrentDay(newDay);

  setIsEditing(true);
  Notify.instantToast("Día creado con éxito");
};

const openReorderDaysDialog = () => {
  if (!Array.isArray(modifiedDay) || modifiedDay.length < 2) {
    Notify.instantToast("Necesitas al menos 2 días para reordenar.");
    return;
  }
  setDraftDaysOrder([...modifiedDay]);
  setShowReorderDaysDialog(true);
};

const closeReorderDaysDialog = () => {
  setShowReorderDaysDialog(false);
  setDraftDaysOrder([]);
};

const handleDayOrderDragEnd = (result) => {
  if (!result?.destination) return;
  const { source, destination } = result;
  if (source.index === destination.index) return;

  const updated = Array.from(draftDaysOrder);
  const [moved] = updated.splice(source.index, 1);
  updated.splice(destination.index, 0, moved);
  setDraftDaysOrder(updated);
};

const applyDayOrder = () => {
  if (!Array.isArray(draftDaysOrder) || !draftDaysOrder.length) {
    closeReorderDaysDialog();
    return;
  }

  const selectedDayId = currentDay?._id ? String(currentDay._id) : null;
  const updatedDays = [...draftDaysOrder];
  setModifiedDay(updatedDays);

  let nextIndex = 0;
  if (selectedDayId) {
    const found = updatedDays.findIndex((d) => String(d?._id) === selectedDayId);
    if (found !== -1) nextIndex = found;
  }

  setIndexDay(nextIndex);
  setCurrentDay(updatedDays[nextIndex] || null);
  setIsEditing(true);
  setShowReorderDaysDialog(false);
  setDraftDaysOrder([]);
  Notify.instantToast("Orden de días actualizado.");
};

const confirmDeleteDay = () => {
  const updatedDays = [...(Array.isArray(modifiedDay) ? modifiedDay : [])];
  if (updatedDays.length <= 1) {
    Notify.instantToast("Debe quedar al menos 1 día.");
    return;
  }

  let idx = -1;
  if (currentDay?._id) {
    idx = updatedDays.findIndex((d) => String(d?._id) === String(currentDay._id));
  }
  if (idx === -1 && Number.isInteger(indexDay) && indexDay >= 0 && indexDay < updatedDays.length) {
    idx = indexDay;
  }

  //  si no lo encuentra, NO borres nada (evita splice(-1,1))
  if (idx === -1) {
    console.warn("confirmDeleteDay: día no encontrado en modifiedDay", {
      currentDayId: currentDay?._id,
      modifiedDayIds: updatedDays.map((d) => d?._id),
    });
    Notify.instantToast("No se pudo eliminar: el día no está sincronizado.");
    return;
  }

  setIsEditing(true);
  updatedDays.splice(idx, 1);

  //  elegir un indice valido
  const newIndex = Math.min(idx, updatedDays.length - 1);

  //  sincronizar TODO (clave)
  setModifiedDay(updatedDays);
  setDay(updatedDays);
  setAllDays(updatedDays);

  setIndexDay(newIndex);
  setCurrentDay(updatedDays[newIndex]);
};

  const handleDeleteDayClick = () => {
    if (!canDeleteDay) {
      Notify.instantToast("Debe quedar al menos 1 día.");
      return;
    }
    if (!currentDay) {
      Notify.instantToast("No hay día seleccionado.");
      return;
    }
    setShowDeleteDayDialog(true);
  };

  const openEditNameDialog = (day) => {
    if (!day) {
      Notify.instantToast("No hay día seleccionado.");
      return;
    }
    setDayToEdit(day);
    setNewDayName(sanitizeBrokenText(day.name));
    setIsEditingName(true);
  };

  const saveNewDayName = () => {
    if (!dayToEdit?._id) {
      setIsEditingName(false);
      Notify.instantToast("No se pudo editar el nombre del día.");
      return;
    }
    setIsEditing(true);
    const updatedDays = [...allDays];
    const dayIndex = updatedDays.findIndex((d) => d._id === dayToEdit._id);
    if (dayIndex !== -1) {
      updatedDays[dayIndex].name = newDayName;
      setAllDays(updatedDays);
      setDay(updatedDays);
      setModifiedDay(updatedDays);
      setCurrentDay(updatedDays[dayIndex]);
    } else {
      Notify.instantToast("No se encontro el día a editar.");
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

function handleDeleteMainCircuitClick(circuitIndex, circuit) {
  setCircuitToDelete({
    blockIndex: null,
    circuitIndex,
    name: circuitSubtitle(circuit || {})
  });
  setShowDeleteCircuitDialog(true);
}

function confirmDeleteCircuitInBlock() {
  const { blockIndex, circuitIndex, name } = circuitToDelete || {};
  if (circuitIndex == null) {
    setShowDeleteCircuitDialog(false);
    setCircuitToDelete(null);
    return;
  }

  setIsEditing(true);
  const updated = [...day];

  if (blockIndex == null) {
    updated[indexDay].exercises.splice(circuitIndex, 1);
  } else {
    const block = updated[indexDay].exercises[blockIndex];
    block.exercises.splice(circuitIndex, 1);
  }

  updated[indexDay].lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
  setShowDeleteCircuitDialog(false);
  Notify.instantToast(`${name} eliminado con éxito`);
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
  // filtrar el bloque por indice
  updatedDays[indexDay].exercises = updatedDays[indexDay].exercises.filter(
    (_, i) => i !== blockToDelete.index
  );
  updatedDays[indexDay].lastEdited = new Date().toISOString();

  // sincronizar todos los estados
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setAllDays(updatedDays);

  Notify.instantToast(`Bloque "${blockToDelete.name}" eliminado con éxito`);

  // limpiar dialogo
  setShowDeleteBlockDialog(false);
  setBlockToDelete({ index: null, name: "" });
};

const AddNewCircuit = (blockIndex = null, kind = 'Libre') => {
  if (!Array.isArray(day) || !day[indexDay]) {
    Notify.instantToast("No hay día seleccionado.");
    return;
  }
  setIsEditing(true);
  const base = circuitDefaults(kind);
  const updated = [...day];
  const newCircuit = {
    exercise_id: new ObjectId().toString(),
    numberExercise: 0, // se setea abajo
    circuitKind: kind,
    type: '',          // sigue disponible para "Libre" (titulo)
    typeOfSets: '',
    notas: '',
    circuit: [{ name: "", reps: 1, peso: "0", rpeRir: "", video: "", idRefresh: RefreshFunction.generateUUID() }],
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
  const nameString =
    typeof exerciseName === "object"
      ? exerciseName?.name
      : exerciseName;

  setExerciseToDeleteInCircuit({
    blockIndex,
    circuitIndex,
    exerciseIndex,
    exerciseName: nameString || "este ejercicio",
  });
  setShowDeleteExerciseInCircuitDialog(true);
}

function confirmDeleteExerciseInCircuit() {
  const { blockIndex, circuitIndex, exerciseIndex } = exerciseToDeleteInCircuit || {};
  if (circuitIndex == null || exerciseIndex == null) return;

  const updated = [...day];

  if (blockIndex == null) {
    updated[indexDay].exercises[circuitIndex].circuit.splice(exerciseIndex, 1);
  } else {
    const block = updated[indexDay].exercises[blockIndex];
    block.exercises[circuitIndex].circuit.splice(exerciseIndex, 1);
  }

  updated[indexDay].lastEdited = new Date().toISOString();

  setIsEditing(true);
  setDay(updated);
  setModifiedDay(updated);
  setCurrentDay(updated[indexDay]);

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
  numberOptions = [],
  dragHandleProps = {}
}) => {
  const circuitKindOptions = useMemo(() => CIRCUIT_KINDS.map((item) => item.value), []);
  const kind = inferCircuitKind(circuit);
  const set = (k, v) => onField(k, v);
  const setFields = (values) => onField("__merge", values);
  const formatCircuitTime = (totalSeconds) => {
    const safeSeconds = Math.max(1, Number(totalSeconds) || 60);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    if (seconds === 0) return String(minutes);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const parseCircuitTime = (rawValue) => {
    const value = String(rawValue ?? '').trim().replace(',', '.');
    if (!value) return 60;

    const mmssMatch = value.match(/^(\d{1,2}):(\d{1,2})$/);
    if (mmssMatch) {
      const minutes = parseInt(mmssMatch[1], 10) || 0;
      const seconds = parseInt(mmssMatch[2], 10) || 0;
      return Math.max(1, (minutes * 60) + seconds);
    }

    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return Math.max(1, Math.round(numeric * 60));
    }

    return 60;
  };

  const commitFreeTimeText = (rawValue) => {
    const trimmed = String(rawValue ?? '').trim();
    if (!trimmed) {
      set('typeOfSets', '');
      return;
    }

    set('typeOfSets', trimmed);
  };

  const renderTimeInput = ({ value, onCommit, placeholder = '10', commitOnChange = false }) => (
    <CircuitTimeInput
      value={value}
      onCommit={onCommit}
      placeholder={placeholder}
      commitOnChange={commitOnChange}
    />
  );

  // ============= Inline editors (compactos) =============
  const DesktopInline = () => {
    switch (kind) {
      case 'AMRAP':
        return (
                    <div>
            <div>
            <span className="small fs07em text-muted">Mins</span>
            {renderTimeInput({
              value: formatCircuitTime(circuit.durationSec || toSec(12, 0)),
              onCommit: (rawValue) => set('durationSec', parseCircuitTime(rawValue))
            })}
          </div></div>
        )

      case 'EMOM':
      case 'E2MOM':
      case 'E3MOM': {
        // Mostramos "Total (min)" como en el mockup
        const interval =
          kind === 'EMOM' ? (circuit.intervalMin || 1) : (kind === 'E2MOM' ? 2 : 3);
        return (
          <div className="dayEditCircuitEmomInline">
            {kind === 'EMOM' && (
              <>
            <div className="dayEditCircuitInlinePair">
              <span className="dayEditCircuitInlineLabel">Intervalo</span>
                  <CircuitSmallNumberInput
                    value={interval}
                    onChange={(v) => set('intervalMin', v)}
                    min={1}
                    title="Intervalo (min)"
                  />
              </div>
              <span className="dayEditCircuitInlineSymbol">x</span>
              </>
            )}
            <div className="dayEditCircuitInlinePair">
              <span className="dayEditCircuitInlineLabel">Mins</span>
              {renderTimeInput({
                value: formatCircuitTime((Number(circuit.totalMinutes) || interval * (circuit.totalRounds || 1)) * 60),
                onCommit: (rawValue) => {
                  const totalSeconds = parseCircuitTime(rawValue);
                  const totalMinutes = totalSeconds / 60;
                  setFields({
                    totalMinutes,
                    totalRounds: Math.max(1, Math.round(totalMinutes / interval))
                  });
                }
              })}
            </div>
          </div>
        );
      }

      case 'Intermitentes':
        return (
          <div className="d-flex align-items-center gap-2 m-auto">
            <div className="m-auto">
              
            <span className="small fs07em text-muted">Work</span>
            <CircuitSmallNumberInput
              value={circuit.workSec || 30}
              onChange={(v) => set('workSec', v)}
              title="Trabajo (s)"
            />
            
            </div>
            <span className="mt-3">/</span>
            <div>
              <span className="small fs07em text-muted">Rest</span>
              <CircuitSmallNumberInput
                value={circuit.restSec || 30}
                onChange={(v) => set('restSec', v)}
                title="Descanso (s)"
              />
               </div>
            <span className="small text-muted mt-3">x</span>
            <div>
              <span className="small fs07em text-muted">Rounds</span>
              <CircuitSmallNumberInput
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
            {renderTimeInput({
              value: formatCircuitTime(circuit.timeCapSec || toSec(12, 0)),
              onCommit: (rawValue) => set('timeCapSec', parseCircuitTime(rawValue))
            })}
          </div></div>
        )

      case 'Tabata':
        return (
          <div className="d-flex align-items-center gap-2">
           <div>
            <span className="small text-muted fs07em">Work</span>
              <CircuitSmallNumberInput
                value={circuit.workSec ?? 20}
                onChange={(v) => set('workSec', v)}
                title="Trabajo (s)"
              />
            </div>
            <span className="mt-3">/</span>
            <div>
            <span className="small text-muted fs07em">Rest</span>
              <CircuitSmallNumberInput
                value={circuit.restSec ?? 10}
                onChange={(v) => set('restSec', v)}
                title="Descanso (s)"
              />
            </div>
            <span className="small text-muted mt-3">x</span>
            <div>
            <span className="small text-muted fs07em">Rounds</span>
              <CircuitSmallNumberInput
                value={circuit.totalRounds ?? 8}
                onChange={(v) => set('totalRounds', v)}
                title="Rondas"
              />
            </div>
          </div>
        );

      default: // Libre
        return (
          <div className="d-flex align-items-end gap-3 dayEditCircuitInlineFields">
            <div className="dayEditCircuitInlineField dayEditCircuitInlineFieldName">
              <span className="small text-muted fs07em">Nombre</span>
              <input
                className="form-control form-control-sm dayEditCircuitFreeTextInput"
                value={circuit.type || ''}
                placeholder="Nombre del circuito"
                onChange={(e) => set('type', e.target.value)}
              />
            </div>
            <div className="dayEditCircuitInlineField dayEditCircuitInlineFieldMeta">
              <span className="small text-muted fs07em">Mins / vueltas</span>
              {renderTimeInput({
                value: circuit.typeOfSets || '',
                onCommit: commitFreeTimeText,
                placeholder: '10',
                commitOnChange: true
              })}
            </div>
          </div>
        );
    }
  };

  const MobileInline = () => (
    <div className="dayEditCircuitMobileInline">
      <DesktopInline />
    </div>
  );

  // ============= Render =============
  return (
    <>
      {/* DESKTOP (>= md):  numero + select modo + "-" + inline + Notas ? la derecha */}
      <div className="d-none d-md-flex gap-3 dayEditCircuitHeaderEditor">
      
          <div className="dayEditCircuitDragHandle" {...dragHandleProps}>
            <IconButton
              size="small"
              className="dayEditCompactIconButton"
              aria-label="mover circuito"
            >
              <DragIndicatorIcon />
            </IconButton>
          </div>

          <div className="dayEditCircuitNumberField">
            <Dropdown
              value={numberValue}
              options={numberOptions}
              optionLabel="label"
              onChange={(e) => onNumberChange(e.value)}
              className="p-dropdown-group w-100 dayEditCircuitOrderDropdown"
            />
          </div>
         
        
        <div className="dayEditCircuitTypeField">
          <span className="small text-muted fs07em">Tipo de circuito</span>
          <Dropdown
            value={kind}
            options={circuitKindOptions}
            onChange={(e) => set('circuitKind', normalizeCircuitKindValue(e.value) || "Libre")}
            appendTo={document.body}
            className="dayEditCircuitControl dayEditCircuitTypeSelect"
            panelClassName="dayEditCircuitDropdownPanel p-dropdown-panel"
            placeholder="Tipo de circuito"
          />
        </div>


        <div className="dayEditCircuitDashGroup">
          <span className="dayEditCircuitHeaderDash">-</span>
          <DesktopInline />
        </div>

        <div className="ms-auto dayEditCircuitNotesField">
          <CircuitNotesInput
            className="form-control form-control-sm"
            value={circuit.notas || ''}
            onCommit={(value) => onField('notas', value)}
          />
        </div>
      </div>

      {/* MOBILE (< md): mismo orden, en bloques */}
      {/* MOBILE (< md): cabecera con el mismo lenguaje que el bloque —
          punto de acento, tipo de circuito y orden — y los parametros como
          filas etiqueta/control, igual que la card de ejercicio.

          Ojo: aca NO va el campo de notas. La pagina ya renderiza uno para
          circuit.notas mas abajo, con su etiqueta "Notas"; tener los dos
          mostraba el mismo texto duplicado en dos lugares. */}
      <div className="d-md-none dayEditMobileCircuitHead">
        <div className="dayEditMobileCircuitHeadTop">
          <span className="dayEditMobileCircuitDot" aria-hidden="true" />

          <div className="dayEditMobileCircuitKind">
            <Dropdown
              value={kind}
              options={circuitKindOptions}
              onChange={(e) => onField('circuitKind', normalizeCircuitKindValue(e.value) || "Libre")}
              appendTo={document.body}
              className="w-100 dayEditCircuitControl dayEditCircuitTypeSelect"
              panelClassName="dayEditCircuitDropdownPanel p-dropdown-panel"
              placeholder="Tipo de circuito"
            />
          </div>

          {showNumber && (
            <div className="dayEditMobileCircuitOrder">
              <Dropdown
                value={numberValue}
                options={numberOptions}
                optionLabel="label"
                onChange={(e) => onNumberChange(e.value)}
                className="p-dropdown-group dayEditMobileOrderSelect"
                appendTo={document.body}
              />
            </div>
          )}
        </div>

        <MobileInline />
      </div>
    </>
  );
};


const AddExerciseToCircuit = (circuitIndex, blockIndex = null) => {
  if (!Array.isArray(day) || !day[indexDay]) {
    Notify.instantToast("No hay día seleccionado.");
    return;
  }
  setIsEditing(true);
  const updated = [...day];
  const dayCopy = updated[indexDay];

  /* Arrancaba en 0: un ejercicio con cero repeticiones no es un punto de
     partida util, hay que corregirlo siempre a mano. */
  const newExercise = { name:"", reps:1, peso:"0", rpeRir:"", video:"", idRefresh:RefreshFunction.generateUUID() };

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
      // circuito ? nivel raiz
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

      <CircuitNotesTextarea
        value={data || ""}
        onCommit={(value) => onChange({ target: { value } })}
        className="textAreaResize"
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
  const activeIndex = getActiveDayIndex(updated);
  if (activeIndex === -1 || !updated[activeIndex]) return;

  const dayCopy = { ...updated[activeIndex] };
  const exs = [...dayCopy.exercises];
  const circuit = { ...exs[circuitIndex] };

  let next = circuit;

  if (field === 'circuitKind') {
    next = applyCircuitKindChange(circuit, value);
  } else if (field === "__merge" && value && typeof value === "object") {
    next = { ...circuit, ...value };
  } else {
    next = { ...circuit, [field]: value };
  }

  exs[circuitIndex] = next;
  updated[activeIndex] = { ...dayCopy, exercises: exs, lastEdited: new Date().toISOString() };

  setDay(updated);
  setModifiedDay(updated);
  setIndexDay(activeIndex);
  setCurrentDay(updated[activeIndex]);
};

const changeBlockCircuitData = (blockIndex, circuitIndex, field, value) => {
  setIsEditing(true);

  const updated = [...day];
  const activeIndex = getActiveDayIndex(updated);
  if (activeIndex === -1 || !updated[activeIndex]) return;

  const dayCopy = { ...updated[activeIndex] };
  const blocks = [...dayCopy.exercises];
  const block = { ...blocks[blockIndex] };
  const inner = [...block.exercises];
  const circuit = { ...inner[circuitIndex] };

  let next = circuit;

  if (field === 'circuitKind') {
    next = applyCircuitKindChange(circuit, value);
  } else if (field === "__merge" && value && typeof value === "object") {
    next = { ...circuit, ...value };
  } else {
    next = { ...circuit, [field]: value };
  }

  inner[circuitIndex] = next;
  block.exercises = inner;
  blocks[blockIndex] = block;

  updated[activeIndex] = { ...dayCopy, exercises: blocks, lastEdited: new Date().toISOString() };

  setDay(updated);
  setModifiedDay(updated);
  setIndexDay(activeIndex);
  setCurrentDay(updated[activeIndex]);
};

// === CAMPOS ESPECIFICOS POR MODO ===
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

// Limpia todos los campos especificos antes de aplicar defaults del nuevo modo
const stripKindSpecificFields = (obj = {}) => {
  const clone = { ...obj };
  KIND_FIELDS.forEach(k => { delete clone[k]; });
  return clone;
};

// Aplica cambio de modo: limpia campos + setea defaults del modo nuevo
const applyCircuitKindChange = (circuit = {}, nextKind = 'Libre') => {
  const normalizedKind = normalizeCircuitKindValue(nextKind) || 'Libre';
  const base = stripKindSpecificFields(circuit);
  return {
    ...base,
    type: normalizedKind === 'Libre' ? (base.type || '') : '',
    circuitKind: normalizedKind,
    ...(circuitDefaults(normalizedKind) || {})
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
        <OverlayPanel ref={el => productRefsCircuit.current[key] = el} className="dayEditLightOverlayPanel">
          <input
            ref={el => inputRefs.current[key] = el}
            className="form-control ellipsis-input text-center dayEditFieldInput"
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

  if (field === "rpeRir") {
    const studentValue = data ?? "";
    return (
      <div className="row justify-content-center text-center">
        <input
          ref={el => inputRefs.current[key] = el}
          className="form-control ellipsis-input text-center stylePesoInput dayEditFieldInput"
          type="text"
          defaultValue={studentValue}
          onChange={(event) => apply(event.target.value)}
        />
      </div>
    );
  }

  // peso, RPE/RIR u otros textos
  return (
    <div className="row justify-content-center text-center">
    <input
      ref={el => inputRefs.current[key] = el}
      className="form-control ellipsis-input text-center stylePesoInput dayEditFieldInput"
      type="text"
      placeholder={field === "peso" ? "kg..." : ""}
      defaultValue={data}
      onBlur={e => apply(e.target.value)}
    />
    </div>
  );
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
    case 'Por tiempo':    return { timeCapSec: toSec(18,0) };
    case 'Tabata':        return { workSec: 20, restSec: 10, totalRounds: 8 };
    default:              return {}; // Libre
  }
};

// Subtitulo UX (se muestra al usuario)
const circuitSubtitle = c => {
  const kind = c?.circuitKind || 'Libre';
  switch (kind) {
    case 'AMRAP':
      return `AMRAP - ${fmtMMSS(c.durationSec || 0)}`;
    case 'EMOM':
      return `EMOM - ${String(c.intervalMin || 1)}:00 x ${c.totalRounds || 0}`;
    case 'E2MOM':
      return `E2MOM - 2:00 x ${c.totalRounds || 0}`;
    case 'E3MOM':
      return `E3MOM - 3:00 x ${c.totalRounds || 0}`;
    case 'Intermitentes':
      return `Intermitentes - ${(c.workSec || 0)}:${String(c.restSec || 0).padStart(2, '0')} x ${c.totalRounds || 0}`;
    case 'Por tiempo':
      return `For time - CAP ${fmtMMSS(c.timeCapSec || 0)}`;
    case 'Tabata':
      return `Tabata - ${(c.workSec || 20)}:${String(c.restSec || 10).padStart(2, '0')} x ${c.totalRounds || 8}`;
    default:
      return `${c?.type?.trim() ? c.type : 'Libre'}${c?.typeOfSets ? ' - ' + c.typeOfSets : ''}`;
  }
};

const ensurePlainId = (value) => {
  if (value == null || value === '') return new ObjectId().toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.$oid) return String(value.$oid);
  if (typeof value?.toString === 'function') return value.toString();
  return String(value);
};

const ensureCircuitItems = (items = []) =>
  items.map((item) => ({
    ...item,
    idRefresh: item?.idRefresh || RefreshFunction.generateUUID()
  }));

const upgradeCircuitShape = (c) => {
  if (!c || typeof c !== 'object') return c;
  if (!Array.isArray(c?.circuit)) return c;
  const kind = inferCircuitKind(c);
  const typeIsLegacyKind = Boolean(normalizeCircuitKindValue(c?.type));
  return {
    ...(circuitDefaults(kind) || {}),
    ...c,
    circuitKind: kind,
    type: kind === 'Libre' ? (c.type || '') : (typeIsLegacyKind ? '' : (c.type || '')),
    exercise_id: ensurePlainId(c.exercise_id),
    circuit: ensureCircuitItems(c.circuit)
  };
};

const upgradeExerciseShape = (ex) => {
  if (!ex || typeof ex !== 'object') return ex;

  if (ex?.type === 'block') {
    return {
      ...ex,
      block_id: ensurePlainId(ex.block_id),
      exercises: (Array.isArray(ex.exercises) ? ex.exercises : []).map((inner) => upgradeExerciseShape(inner))
    };
  }

  if (Array.isArray(ex?.circuit)) {
    return upgradeCircuitShape(ex);
  }

  if (ex?.type === 'exercise') {
    return {
      ...ex,
      exercise_id: ensurePlainId(ex.exercise_id)
    };
  }

  return ex;
};

const upgradeWeekShape = (days) =>
  (days || []).map((d) => ({
    ...d,
    _id: ensurePlainId(d?._id),
    warmup: (Array.isArray(d?.warmup) ? d.warmup : []).map((w) => ({
      ...w,
      warmup_id: ensurePlainId(w?.warmup_id)
    })),
    movility: (Array.isArray(d?.movility) ? d.movility : []).map((m) => ({
      ...m,
      movility_id: ensurePlainId(m?.movility_id)
    })),
    exercises: (Array.isArray(d?.exercises) ? d.exercises : []).map((el) => upgradeExerciseShape(el))
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
  };

  const incrementAllReps = () => {
  // bump sabe subir reps segun su tipo
  const bump = repsVal => {
    // 1) Si es array (modo multiple), clonar y sumar 1 al ultimo
    if (Array.isArray(repsVal)) {
      const newArr = [...repsVal];
      const last = parseInt(newArr[newArr.length - 1], 10) || 0;
      newArr[newArr.length - 1] = last + 1;
      return newArr;
    }

    // 2) Si es string no numerica (modo texto), devolver tal cual
    if (typeof repsVal === 'string' && isNaN(Number(repsVal))) {
      return repsVal;
    }

    // 3) En cualquier otro caso (numero o string numerico), sumar 1
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

  // Tambien sincronizamos allDays
  const updatedAllDays = [...allDays];
  updatedAllDays[indexDay] = updatedDays[indexDay];
  setAllDays(updatedAllDays);

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
   // 1) Clone superficial del array de dias
   const updatedDays = [...day];
   const block = updatedDays[indexDay].exercises[blockIndex];

   // 2) Clonar el ejercicio ? modificar
   const oldEx = block.exercises[exIndex];
   const newEx = { ...oldEx };

   if (field === 'name') {
     // 3) Si el nombre venia como objeto (con aproximaciones/backoff), preservamos esas propiedades:
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

   // 6) Actualizamos el dia y el estado global
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

// Añade un ejercicio dentro de un bloque dado su indice en el array
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
    reps: getDefaultRepsValue(),
    sets: getDefaultSetsValue(),
    peso: getDefaultPesoValue(),
    rpeRir: '',
    rest: getDefaultRestValue(),
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
  if (!Array.isArray(modifiedDay) || !modifiedDay[indexDay]) {
    Notify.instantToast("No hay día seleccionado.");
    return;
  }
  // a Parte de modifiedDay, que si contiene las aproximaciones actuales
  const updatedDays = [...modifiedDay];

  // a Crea el bloque
  const newBlock = {
    type: 'block',
    block_id: new ObjectId().toString(),
    name: '',
    color: '#FF5733',
    exercises: []
  };
  updatedDays[indexDay].exercises.push(newBlock);

  // a Actualiza todos los estados, incluida la fuente "allDays"
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

const prevWeekIndex = useMemo(() => {
  // semana anterior inmediata ? la actual (ultima anterior del storage)
  const prev = Array.isArray(seeAllWeeks) && seeAllWeeks.length > 0
    ? seeAllWeeks[seeAllWeeks.length - 1]
    : null;

  const days = Array.isArray(prev?.routine) ? prev.routine : [];
  const byDay = {};

  days.forEach((day, dIdx) => {
    const map = {};
    const rows = flattenDayExercises(day);
    rows.forEach((r) => {
      const key = normalizeName(r.name);
      if (key) map[key] = { sets: r.sets, reps: r.reps, peso: r.peso };
    });
    byDay[dIdx] = map;
  });

  return byDay;
}, [seeAllWeeks, flattenDayExercises, normalizeName]);

const renderTrendIcon = (delta) => {
  if (delta == null) return null;
  if (delta > 0) return <TrendingUp size={14} className="ms-1" />;
  if (delta < 0) return <TrendingDown size={14} className="ms-1" />;
  return <Minus size={14} className="ms-1" />;
};

const getDeltaIfNumeric = (current, previous) => {
  const c = toNum(current);
  const p = toNum(previous);
  if (c === null || p === null) return null;
  return c - p;
};

const getMobileReorderTitle = (exercise) => {
  if (!exercise || typeof exercise !== "object") return "Sin nombre";
  if (exercise.type === "block") return exercise.name || "Bloque sin nombre";
  if (Array.isArray(exercise.circuit)) return circuitSubtitle(exercise);
  if (typeof exercise.name === "object") return exercise.name?.name || "Ejercicio sin nombre";
  return exercise.name || "Ejercicio sin nombre";
};

const getMobileReorderMeta = (exercise) => {
  if (!exercise || typeof exercise !== "object") return "";
  if (exercise.type === "block") {
    const count = Array.isArray(exercise.exercises) ? exercise.exercises.length : 0;
    return `${count} ejercicio${count === 1 ? "" : "s"}`;
  }
  if (Array.isArray(exercise.circuit)) {
    const count = Array.isArray(exercise.circuit) ? exercise.circuit.length : 0;
    return `Circuito - ${count} ejercicio${count === 1 ? "" : "s"}`;
  }
  return "Ejercicio";
};


const groupStudentPreviewSupersets = (items = [], { forBlock = false } = {}) => {
  const grouped = [];
  let index = 0;

  while (index < items.length) {
    const item = items[index];
    if (item?.type !== "exercise") {
      grouped.push(item);
      index += 1;
      continue;
    }

    const tag = parseStudentPreviewSupersetTag(item.numberExercise ?? item.number ?? item.numberCircuit);
    if (!tag) {
      grouped.push(item);
      index += 1;
      continue;
    }

    const superset = { type: "superset", baseNumber: tag.base, exercises: [] };
    while (index < items.length) {
      const current = items[index];
      if (current?.type !== "exercise") break;
      const currentTag = parseStudentPreviewSupersetTag(current.numberExercise ?? current.number ?? current.numberCircuit);
      if (!currentTag || currentTag.base !== tag.base) break;

      superset.exercises.push({
        ...current,
        supSuffix: currentTag.suffix || String.fromCharCode(65 + superset.exercises.length),
        ...(forBlock ? { _origIndexInBlock: index } : { _origIndex: index }),
      });
      index += 1;
    }

    grouped.push(superset.exercises.length < 2 ? (superset.exercises[0] ?? item) : superset);
  }

  return grouped;
};

const getStudentPreviewName = (exercise) => {
  if (!exercise || typeof exercise !== "object") return "Ejercicio sin nombre";
  if (typeof exercise.name === "object" && exercise.name !== null) {
    return sanitizeBrokenText(exercise.name?.name || "Ejercicio sin nombre");
  }
  return sanitizeBrokenText(exercise.name || "Ejercicio sin nombre");
};

const getStudentPreviewValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.filter((item) => item !== "" && item !== null && item !== undefined).join(" / ") || "-";
  return sanitizeBrokenText(value);
};

const getStudentPreviewCols = (weight) => {
  const isLong = String(weight ?? "").length > 7;
  return {
    setsCol: isLong ? "col-1" : "col-2",
    repsCol: "col-3",
    pesoCol: isLong ? "col-4" : "col-3",
    restCol: "col-3",
  };
};

const getStudentPreviewReadableTextColor = (backgroundColor) => {
  const hex = String(backgroundColor || "").trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#0f172a" : "#ffffff";
};

const renderStudentPreviewNumberIcon = (number) => {
  const parsedNumber = Number(number);
  const numberIconMap = {
    1: LooksOneIcon,
    2: LooksTwoIcon,
    3: Looks3Icon,
    4: Looks4Icon,
    5: Looks5Icon,
    6: Looks6Icon,
  };

  if (Number.isInteger(parsedNumber) && numberIconMap[parsedNumber]) {
    const IconComponent = numberIconMap[parsedNumber];
    return <IconComponent />;
  }

  return <span className="btn p-1 fontNumberE m-0 bg-light">{getStudentPreviewValue(number)}</span>;
};

const renderStudentPreviewMetricValue = (value) => {
  if (Array.isArray(value)) {
    return (
      <span className="textWeightCards border-1 d-block">
        {value.map((item, index) => (
          <React.Fragment key={index}>
            <span className="textWeightCards arrayBadge">{getStudentPreviewValue(item)}</span>
            {index < value.length - 1 && <span>-</span>}
          </React.Fragment>
        ))}
      </span>
    );
  }

  return <span className="textWeightCards border-1 d-block">{getStudentPreviewValue(value)}</span>;
};

const renderStudentPreviewMetric = (label, value, colClass, extraClass = "") => (
  <div className={`${colClass} p-0 ${extraClass} mt-4 pt-2 mb-2 d-flex flex-column text-center StyleLightBox`}>
    <div>
      <p className="fontStylesSpan">{label}</p>
    </div>
    <div>{renderStudentPreviewMetricValue(value)}</div>
  </div>
);

const renderStudentPreviewTimer = (value) => (
  <div className={`dayEditStudentPreviewTimer ${value ? "" : "dayEditStudentPreviewTimerEmpty"}`}>
    <span>{value ? getStudentPreviewValue(value) : "No especifica"}</span>
    <button type="button" disabled aria-label="Timer bloqueado">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 2.8v10.4L12.4 8 4 2.8z" />
      </svg>
    </button>
  </div>
);

const renderStudentPreviewCounter = (sets) => (
  <button type="button" className="contador dayEditStudentPreviewCounter" disabled>
    Contador de series <span>{Array.isArray(sets) ? getStudentPreviewValue(sets[0]) : "0"}</span>
  </button>
);

const renderStudentPreviewNotes = (notes, label = "Notas") => {
  if (!notes) return null;
  return (
    <>
      <span className="styleInputsNote-back text-center my-1">{label}</span>
      <div className="col-12 mb-2" style={{ whiteSpace: "pre-wrap" }}>
        <div className="row justify-content-center colorNote">
          <div className="col-10">
            <p className="pb-0 mb-0 text-dark">{sanitizeBrokenText(notes)}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const renderStudentPreviewExerciseExtras = (exercise) => {
  const backoffLabel =
    exercise?.name?.titleName && exercise.name.titleName.trim() !== ""
      ? exercise.name.titleName
      : "Back off";

  return (
    <>
      {exercise?.name?.approximations?.length > 0 && (
        <>
          <span className="styleInputsNote-back text-center mt-3">
            {sanitizeBrokenText(exercise.name.approxTitle ?? "Aproximaciones")}
          </span>
          <div className="col-12 mb-2">
            {exercise.name.approximations.map((approximation, index) => (
              <div className="row justify-content-around colorNote3 my-1" key={index}>
                <span className="fs08em text-start col-6">
                  <b>{index + 1}</b> aproximacion
                </span>
                <p className="pb-0 mb-0 fs08em col-5 text-dark">
                  {getStudentPreviewValue(approximation.reps)} reps / {getStudentPreviewValue(approximation.peso)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      {exercise?.name?.backoff?.length > 0 && (
        <>
          <span className="styleInputsNote-back text-center my-1">{sanitizeBrokenText(backoffLabel)}</span>
          <div className="col-12 mb-2">
            {exercise.name.backoff.map((line, index) => (
              <div className="row justify-content-around colorNote2 my-1" key={index}>
                <span className="fs08em text-start col-6">
                  <b>{index + 1}</b> back off
                </span>
                <p className="pb-0 mb-0 fs08em col-5 text-dark">
                  {getStudentPreviewValue(line.sets)}x{getStudentPreviewValue(line.reps)} / {getStudentPreviewValue(line.peso)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      {renderStudentPreviewNotes(exercise?.notas)}
    </>
  );
};

const renderStudentPreviewExercise = (exercise, key, fallbackNumber) => {
  const cols = getStudentPreviewCols(exercise?.peso);

  return (
    <div className="px-0 mb-3" key={key}>
      <div className="row justify-content-center border rounded-2 m-0 mb-3 ddp-card bg-light">
        <div className="col-12">
          <div className="row justify-content-center border-bottom">
            <div className="col-1 m-auto colorIndexPrimarys">
              {renderStudentPreviewNumberIcon(exercise?.numberExercise || fallbackNumber)}
            </div>
            <div className="col-9 m-auto">
              <p className="stylesNameExercise text-start mb-0 py-2 text-dark">
                {getStudentPreviewName(exercise)}
              </p>
            </div>
            <div className="col-2">
              <IconButton aria-label="editar bloqueado" disabled>
                <RectangleEllipsis size={20} />
              </IconButton>
            </div>
          </div>
        </div>

        {renderStudentPreviewMetric("Sets", exercise?.sets, cols.setsCol)}
        {renderStudentPreviewMetric("Reps", exercise?.reps, cols.repsCol, "mx-1")}
        {renderStudentPreviewMetric("Peso", exercise?.peso || "-", cols.pesoCol, "me-1")}
        {exercise?.rpeRir ? renderStudentPreviewMetric("Alumno", exercise.rpeRir, "col-3", "me-1") : null}
        <div className={`${cols.restCol} p-0 me-1 mt-4 mb-2 StyleLightBox`}>
          <div>
            <p className="fontStylesSpan mt-2">Descanso</p>
          </div>
          <div>{renderStudentPreviewTimer(exercise?.rest)}</div>
        </div>

        {renderStudentPreviewExerciseExtras(exercise)}

        <div className="row justify-content-between mt-3 mb-1">
          <div className="col-6">{renderStudentPreviewCounter(exercise?.sets)}</div>
          <IconButton aria-label="video bloqueado" disabled={!exercise?.video} className="col-2 pt-0">
            <YouTubeIcon className={exercise?.video ? "ytColorWhite" : "ytColor-disabled"} />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

const renderStudentPreviewCircuit = (circuit, key, fallbackNumber) => (
  <div className="col-12 p-0 mt-4 mb-2 ddp-circuit-card" key={key}>
    <div className="ddp-circuit-header d-flex flex-wrap align-items-center justify-content-between border rounded-2 px-3 py-2 mb-0 bg-white">
      <div>
        <div className="fw-semibold">{circuitSubtitle(circuit || {})}</div>
      </div>
      <button className="btn btn-sm btn-dark" disabled>Iniciar</button>
    </div>
    <table className="table border-0 mb-0 ddp-circuit-table">
      <thead>
        <tr>
          <th className="border-0 text-start tableDark">Nombre</th>
          <th className="border-0 tableDark">Reps</th>
          <th className="border-0 tableDark">Peso</th>
          <th className="border-0 tableDark">Video</th>
        </tr>
      </thead>
      <tbody>
        {(Array.isArray(circuit?.circuit) ? circuit.circuit : []).map((item, itemIndex) => (
          <tr key={item?.idRefresh || item?.exercise_id || itemIndex}>
            <td className="border-0 tableDark text-start">{getStudentPreviewName(item)}</td>
            <td className="border-0 tableDark px-0">{getStudentPreviewValue(item?.reps)}</td>
            <td className="border-0 tableDark">{getStudentPreviewValue(item?.peso)}</td>
            <td className="border-0 tableDark pt-0 pb-3">
              <IconButton aria-label="video bloqueado" disabled={!item?.video} className="p-0">
                <YouTubeIcon className={item?.video ? "ytColorWhite" : "ytColor-disabled"} />
              </IconButton>
            </td>
          </tr>
        ))}
        {circuit?.notas && (
          <tr>
            <td colSpan={4} className="border-0">
              <div className="rounded-2">
                <span className="text-start mb-2 pb-2 d-block">Notas / otros</span>
                <div className="colorNote py-2 mb-2 pb-2 rounded-1" style={{ whiteSpace: "pre-wrap" }}>
                  <p className="pb-0 mb-0">{sanitizeBrokenText(circuit.notas)}</p>
                </div>
              </div>
            </td>
          </tr>
        )}
        {!Array.isArray(circuit?.circuit) || circuit.circuit.length === 0 ? (
          <tr>
            <td colSpan={4} className="border-0 text-center text-muted py-3">
              Este circuito no tiene ejercicios cargados.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
);

const renderStudentPreviewSuperset = (superset, key) => (
  <div className="px-0 mb-3" key={key}>
    <div className="row justify-content-center border rounded-2 m-0 mb-3 ddp-card bg-light">
      <div className="col-12">
        <div className="row justify-content-center border-bottom">
          <div className="col-1 m-auto colorIndexPrimarys">
            {renderStudentPreviewNumberIcon(superset.baseNumber)}
          </div>
          <div className="col-9 m-auto">
            <p className="stylesNameExercise text-start mb-0 py-2 text-dark">
              Superserie <small className="ms-2">({superset.exercises.map((item) => item.supSuffix).join(" - ")})</small>
            </p>
          </div>
        </div>
      </div>

      {superset.exercises.map((exercise, index) => {
        const cols = getStudentPreviewCols(exercise?.peso);
        return (
          <div className="col-12 mb-2 mb-3 shadow-personalized" key={exercise?.exercise_id || index}>
            <div className="row justify-content-around rounded-2 p-2 align-items-center">
              <div className="col-2 text-center">
                <span className="badge text-light border bg-dark">{exercise.supSuffix}</span>
              </div>
              <div className="col-8 text-start">{getStudentPreviewName(exercise)}</div>
              <div className="col-2 text-center">
                <IconButton aria-label="editar bloqueado" disabled>
                  <RectangleEllipsis size={20} />
                </IconButton>
              </div>

              {renderStudentPreviewMetric("Sets", exercise?.sets, cols.setsCol)}
              {renderStudentPreviewMetric("Reps", exercise?.reps, cols.repsCol, "mx-1")}
              {renderStudentPreviewMetric("Peso", exercise?.peso || "-", cols.pesoCol, "me-1")}
              {exercise?.rpeRir ? renderStudentPreviewMetric("Alumno", exercise.rpeRir, "col-3", "me-1") : null}
              <div className={`${cols.restCol} p-0 me-1 mt-4 mb-2 StyleLightBox`}>
                <div>
                  <p className="fontStylesSpan mt-2">Descanso</p>
                </div>
                <div>{renderStudentPreviewTimer(exercise?.rest)}</div>
              </div>
            </div>
            {renderStudentPreviewExerciseExtras(exercise)}
            <div className="row justify-content-between align-items-center mt-2 px-2">
              <div className="col-auto">{renderStudentPreviewCounter(exercise?.sets)}</div>
              <div className="col-auto">
                <IconButton aria-label="video bloqueado" disabled={!exercise?.video}>
                  <YouTubeIcon className={exercise?.video ? "ytColor" : "ytColor-disabled"} />
                </IconButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const renderStudentPreviewBlock = (block, index) => (
  <div className="px-0 mb-3" key={block?.block_id || index}>
    <div className="row justify-content-center border rounded-2 m-0 mb-3 ddp-card bg-light">
      <div
        className="col-12 ddp-block-colored-header"
        style={{
          backgroundColor: block?.color || "#334155",
          color: getStudentPreviewReadableTextColor(block?.color || "#334155"),
          "--ddp-block-text-color": getStudentPreviewReadableTextColor(block?.color || "#334155"),
        }}
      >
        <div className="row justify-content-center border-bottom">
          <div className="col-1 m-auto colorIndexPrimarys">
            <span className="fontNumberE">•</span>
          </div>
          <div className="col-9 m-auto">
            <p className="stylesNameExercise text-start mb-0 py-2">
              {sanitizeBrokenText(block?.name || "Bloque sin nombre")}
            </p>
          </div>
        </div>
      </div>

      {groupStudentPreviewSupersets(Array.isArray(block?.exercises) ? block.exercises : [], { forBlock: true }).map((inner, innerIndex) => {
        if (inner?.type === "superset") return renderStudentPreviewSuperset(inner, `block-sup-${index}-${innerIndex}`);
        if (Array.isArray(inner?.circuit)) return renderStudentPreviewCircuit(inner, `block-circuit-${index}-${innerIndex}`, innerIndex + 1);
        return renderStudentPreviewExercise(inner, inner?.exercise_id || innerIndex, innerIndex + 1);
      })}
      {!Array.isArray(block?.exercises) || block.exercises.length === 0 ? (
        <div className="dayEditStudentPreviewEmpty">Este bloque no tiene ejercicios.</div>
      ) : null}
    </div>
  </div>
);

const renderStudentPreviewItem = (item, index) => {
  if (item?.type === "block") return renderStudentPreviewBlock(item, index);
  if (item?.type === "superset") return renderStudentPreviewSuperset(item, `superset-${index}`);
  if (Array.isArray(item?.circuit)) return renderStudentPreviewCircuit(item, item?.exercise_id || index, index + 1);
  return renderStudentPreviewExercise(item, item?.exercise_id || index, index + 1);
};

const renderStudentPreviewAuxList = (label, items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const sliderKey = label.includes("Activación") ? "movility" : "warmup";
  const activeIndex = Math.min(studentPreviewAuxSlide[sliderKey] || 0, items.length - 1);
  const moveAuxSlide = (direction) => {
    setStudentPreviewAuxSlide((prev) => {
      const current = Math.min(prev[sliderKey] || 0, items.length - 1);
      const next = (current + direction + items.length) % items.length;
      return { ...prev, [sliderKey]: next };
    });
  };

  return (
    <div className="dayEditStudentPreviewAuxSection">
      <div className="text-start mb-2 dayEditStudentPreviewAuxTitle">
        <span>{label}</span>
      </div>
      <div className="dayEditStudentPreviewSlider">
        {items.length > 1 && (
          <button
            type="button"
            className="dayEditStudentPreviewSliderNav dayEditStudentPreviewSliderPrev"
            onClick={() => moveAuxSlide(-1)}
            aria-label={`Anterior ${label}`}
          >
            {"<"}
          </button>
        )}
        <div className="dayEditStudentPreviewSliderTrack">
          {items.map((exercise, index) => (
            <div
              className="dayEditStudentPreviewSlide"
              key={exercise?.warmup_id || exercise?.movility_id || index}
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              <div className="text-center pt-1 pb-2">
                <div className="row justify-content-center backgroundCardsWarmMov shadow rounded-2 m-1 mb-3 ddp-card bg-light">
                  <div className={`col-12 ${label.includes("Activación") ? "colorMovility" : "colorWarmup"} py-2`}>
                    <div className="row justify-content-center">
                      <div className="col-1 m-auto text-dark">
                        <span className="ddp-warmmov-number">{exercise?.numberMovility || exercise?.numberWarmup || index + 1}</span>
                      </div>
                      <div className="col-8 m-auto text-start">
                        <p className="stylesNameExercise mb-0 text-dark">{getStudentPreviewName(exercise)}</p>
                      </div>
                      <div className="col-2">
                        <IconButton aria-label="video bloqueado" className="p-0" disabled={!exercise?.video}>
                          <YouTubeIcon className={exercise?.video ? "ytColor" : "ytColor-disabled"} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="row justify-content-center my-3">
                      {renderStudentPreviewMetric("Sets", exercise?.sets, "col-4", "dayEditStudentPreviewAuxMetric")}
                      {renderStudentPreviewMetric("Reps", exercise?.reps, "col-4", "dayEditStudentPreviewAuxMetric")}
                      {renderStudentPreviewMetric("Peso", exercise?.peso || "-", "col-4", "dayEditStudentPreviewAuxMetric")}
                    </div>
                  </div>
                  {renderStudentPreviewNotes(exercise?.notas, "Notas / otros")}
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <button
            type="button"
            className="dayEditStudentPreviewSliderNav dayEditStudentPreviewSliderNext"
            onClick={() => moveAuxSlide(1)}
            aria-label={`Siguiente ${label}`}
          >
            {">"}
          </button>
        )}
        {items.length > 1 && (
          <div className="dayEditStudentPreviewSliderDots" aria-hidden="true">
            {items.map((_, index) => (
              <span className={index === activeIndex ? "active" : ""} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const renderStudentOnlyFieldLabel = (className = "fs07em text-muted text-center m-auto") => (
  <span className={`${className} dayEditStudentOnlyFieldLabel`}>
    Alumno
    <Tooltip
      placement="top"
      arrow
      title="Este campo solo puede ser editado por el alumno."
      enterDelay={0}
      leaveDelay={0}
      enterTouchDelay={0}
    >
      <button
        type="button"
        className="dayEditStudentOnlyInfoBtn"
        aria-label="Información del campo Alumno"
      >
        <HelpOutlineIcon fontSize="inherit" />
      </button>
    </Tooltip>
  </span>
);


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
      <div className="p-1 dayEditMobileTable">
        {/* Las acciones secundarias del dia se movieron al menu "..." de la barra
            inferior fija. Antes eran 9 botones sueltos en el medio del contenido,
            con alturas (py-1 vs py-2) y alineaciones de icono distintas entre si. */}

        <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="exercises-mobile" type="MAIN">
          {(provided) => (
            <div
              className="div div-bordered p-0"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {isMobileReorderMode && (
                <div className="dayEditMobileReorderHint">
                  Mantene apretado el ejercicio que quieras mover y arrastralo a la posicion correcta.
                </div>
              )}
              {displayedCurrentDay?.exercises.map((exercise, i) => (
                <Draggable 
                  key={exercise.type === 'block' ? exercise.block_id : exercise.exercise_id}
                  draggableId={exercise.type === 'block' ? exercise.block_id : exercise.exercise_id}
                  index={i}
                  isDragDisabled={!isMobileReorderMode}
                >
                  {(providedDrag) => (
                    <div
                      className={[
                        "mb-4 shadowCards p-2 dayEditMobileExerciseCard",
                        isMobileReorderMode ? "dayEditMobileReorderCard" : "",
                        // Marcas de superserie: el CSS las usa para pegar las cards
                        // entre si y dibujar el marco del grupo.
                        supersetInfoByIndex[i]?.esMiembro ? "isSupersetMember" : "",
                        supersetInfoByIndex[i]?.esPrimero ? "isSupersetFirst" : "",
                        supersetInfoByIndex[i]?.esUltimo ? "isSupersetLast" : "",
                      ].filter(Boolean).join(" ")}
                      ref={providedDrag.innerRef}
                      {...providedDrag.draggableProps}
                    >
                      {isMobileReorderMode ? (
                        <div className="dayEditMobileReorderItem">
                          <button
                            type="button"
                            className="dayEditMobileReorderHandle"
                            {...providedDrag.dragHandleProps}
                            aria-label="Arrastrar para reordenar"
                          >
                            <DragIndicatorIcon />
                          </button>
                          <div className="dayEditMobileReorderNumber">{i + 1}</div>
                          <div className="dayEditMobileReorderInfo">
                            <div className="dayEditMobileReorderTitle">
                              {getMobileReorderTitle(exercise)}
                            </div>
                            <div className="dayEditMobileReorderMeta">
                              {getMobileReorderMeta(exercise)}
                            </div>
                          </div>
                        </div>
                      ) : (
                      <>
                      {/* Cabecera del grupo: solo la dibuja el primer miembro.
                          Las demas cards del grupo se pegan a esta por CSS. */}
                      {supersetInfoByIndex[i]?.esPrimero && (
                        <div className="dayEditMobileSupersetHeader">
                          <Zap size={14} aria-hidden="true" />
                          <span className="dayEditMobileSupersetTitle">Superserie</span>
                          <span className="dayEditMobileSupersetTag">
                            {supersetInfoByIndex[i].sufijos
                              .map((x) => `${supersetInfoByIndex[i].base}-${x}`)
                              .join(" + ")}
                          </span>
                          {renderSupersetTools(i)}
                        </div>
                      )}
                      {supersetInfoByIndex[i]?.esMiembro
                        && !supersetInfoByIndex[i]?.esPrimero && (
                        <div className="dayEditMobileSupersetContinues">
                          <Zap size={12} aria-hidden="true" />
                          <span className="dayEditMobileSupersetContinuesText">
                            {`Sigue la superserie ${supersetInfoByIndex[i].base}`}
                          </span>
                          <span className="dayEditMobileSupersetTag">
                            {`${supersetInfoByIndex[i].base}-${supersetInfoByIndex[i].sufijo}`}
                          </span>
                        </div>
                      )}
                      {/* --- BLOQUE --- */}
                      {exercise.type === 'block' ? (
                        <div
                          className="dayEditMobileBlock"
                          style={exercise.color ? { "--dd-this-block": exercise.color } : undefined}
                        >
                          {/* Cabecera del bloque */}
                        <div className="dayEditMobileBlockHeader">
                          {/* El color del bloque pasa a ser un ACENTO (punto + riel
                              lateral del cuerpo) en vez de pintar toda la cabecera:
                              un fondo solido de color arbitrario no funciona en los
                              dos temas y obligaba a forzar el texto a blanco. */}
                          <span className="dayEditMobileBlockDot" aria-hidden="true" />
                          <button
                            type="button"
                            className="dayEditMobileBlockName"
                            onClick={(e) => blockNameOverlayRef.current[`b-${exercise.block_id}`]?.toggle(e)}
                            aria-label="cambiar-nombre-bloque"
                          >
                            <span className="dayEditMobileBlockTitle">{exercise.name || "Bloque"}</span>
                            <EditIcon fontSize="small" />
                          </button>

                          <span className="dayEditMobileBlockCount">
                            {(exercise.exercises || []).length}
                          </span>

    <OverlayPanel
      ref={(el) => (blockNameOverlayRef.current[`b-${exercise.block_id}`] = el)}
      className="blockNameOverlayPanel dayEditDarkOverlayPanel"
    >
      <div className="blockNameOverlayBody">
        <div className="blockNameOverlayTitle">Nombre del bloque</div>

        <PrimeAutoComplete
          value={exercise.name}
          suggestions={blockNameSuggestions}
          dropdown
          placeholder="Escribi o elegí un nombre"
          className="w-100 blockNameAutoComplete"
          inputClassName="blockNameAutoCompleteInput"
          completeMethod={(e) => {
            const q = e.query.toLowerCase();
            setBlockNameSuggestions(
              BLOCK_NAME_OPTIONS.filter((opt) => opt.toLowerCase().includes(q))
            );
          }}
          onChange={(e) => changeBlockData(i, "name", e.value)}
        />
        <div className="blockNameOverlayHint">Sugerencias + nombre libre.</div>
      </div>
    </OverlayPanel>

                          <IconButton
                            className="dayEditMobileBlockDelete"
                            aria-label="eliminar-bloque"
                            onClick={() => handleDeleteBlockClick(i, exercise.name)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </div>

                        <div className="dayEditMobileBlockBody">
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
                                  renderMobileCircuitItem(item, j, k, i, () => handleDeleteExerciseInCircuit(i, j, k, item.name))
                                ))}
                              </div>

                              {/* Boton "Añadir ejercicio" y notas */}
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

                              {/* Numero de circuito + acciones */}
                              {/* Mismo pie que la card de ejercicio: el orden a la izquierda como
                                  dato, y las acciones agrupadas a la derecha. Antes era un boton rojo
                                  "Eliminar" a media pantalla, que pesaba mas que el contenido. */}
                              <div className="dayEditMobileCardFooter">
                                <div className="dayEditMobileCardFooterOrder">
                                  <span className="dayEditMobileFieldLabel">Orden</span>
                                  <Dropdown
                                    value={ex.numberExercise}
                                    options={options}
                                    onChange={(e) => changeBlockCircuitData(i, j, 'numberExercise', e.value)}
                                    placeholder="#"
                                    optionLabel="label"
                                    className="p-dropdown-group dayEditMobileOrderSelect"
                                  />
                                </div>
                                <div className="dayEditMobileCardFooterActions">
                                  <button
                                    type="button"
                                    className="dayEditMobileCardAction isDanger"
                                    onClick={() => handleDeleteCircuitInBlock(i, j, ex.type)}
                                    aria-label="Eliminar circuito"
                                    title="Eliminar circuito"
                                  >
                                    <DeleteIcon />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={ex.exercise_id} className="border rounded p-2 mb-2">
                              {/* Numero + Nombre + Botones */}
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span>{ex.numberExercise}.</span>
                                {isColumnVisible("name") && (
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
                                )}
                                
                              </div>
                              {/* Controles sets / reps / peso / rest */}
                              {renderMobileExerciseFields(ex, j, i)}
                              {renderMobileExerciseFooter({
                                orderValue: ex.numberExercise,
                                onOrderChange: (v) => changeBlockExerciseData(i, j, 'numberExercise', v),
                                videoKey: `block-mobile-${i}-${j}`,
                                videoValue: ex.video,
                                onVideoChange: (v) => changeBlockExerciseData(i, j, 'video', v),
                                onDelete: () => handleDeleteExerciseInBlockClick(i, ex),
                              })}
                            </div>
                          ))}
                        <div className="dayEditMobileBlockAdd">
                        <button
                          className="dayEditMobileBlockAddBtn"
                          onClick={() => addExerciseToBlock(i)}
                        >
                          <AddIcon /> Ejercicio
                        </button>

                        <button
                          className="dayEditMobileBlockAddBtn"
                          onClick={() => AddNewCircuit(i)}
                        >
                          <AddIcon /> Circuito
                        </button>
                      </div>
                        </div>
                      </div>
                      ) : exercise.type === 'exercise' ? (
                        /* --- EJERCICIO SUELTO --- */
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            {isColumnVisible("name") && (
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
                            )}
                              </div>
                          {/* Controles sets / reps / peso / rest */}
                          {renderMobileExerciseFields(exercise, i)}
                          {renderMobileExerciseFooter({
                            orderValue: exercise.numberExercise,
                            onOrderChange: (v) => changeModifiedData(i, v, 'numberExercise'),
                            videoKey: `root-mobile-${i}`,
                            videoValue: exercise.video,
                            onVideoChange: (v) => changeModifiedData(i, v, 'video'),
                            onDelete: () => handleDeleteClick(exercise),
                          })}
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
                                      renderMobileCircuitItem(item, i, j, null, () => handleDeleteExerciseInCircuit(null, i, j, item.name))
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
                                  
                                  {/* Mismo pie que la card de ejercicio: el orden a la izquierda como
                                      dato, y las acciones agrupadas a la derecha. Antes era un boton rojo
                                      "Eliminar" a media pantalla, que pesaba mas que el contenido. */}
                                  <div className="dayEditMobileCardFooter">
                                    <div className="dayEditMobileCardFooterOrder">
                                      <span className="dayEditMobileFieldLabel">Orden</span>
                                      <Dropdown
                                        value={exercise.numberExercise}
                                        options={options}
                                        onChange={(e) => changeModifiedData(i, e.value, 'numberExercise')}
                                        placeholder="#"
                                        optionLabel="label"
                                        className="p-dropdown-group dayEditMobileOrderSelect"
                                      />
                                    </div>
                                    <div className="dayEditMobileCardFooterActions">
                                      <button
                                        type="button"
                                        className="dayEditMobileCardAction isDanger"
                                        onClick={() => handleDeleteMainCircuitClick(i, exercise)}
                                        aria-label="Eliminar circuito"
                                        title="Eliminar circuito"
                                      >
                                        <DeleteIcon />
                                      </button>
                                    </div>
                                  </div>
                                </div> 
                            </>
                          )}
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

  const itemsTools = [
  {
    label: 'Sumar 1 serie',
    command: () => incrementAllSeries(),
    template: (item, opts) => (
      <div className="dial-item-tooltip-wrapper text-center">
        <button
          type="button"
          {...opts}
          className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
        >
          <UpgradeIcon className="fontBadgePlus" />
        </button>
        <span className="fs08em text-light d-block mt-1">
          Sumar 1 serie
        </span>
      </div>
    )
  },
  {
    label: 'Sumar 1 rep',
    command: () => incrementAllReps(),
    template: (item, opts) => (
      <div className="dial-item-tooltip-wrapper text-center">
        <button
          type="button"
          {...opts}
          className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
        >
          <UpgradeIcon className="fontBadgePlus" />
        </button>
        <span className="fs08em text-light d-block mt-1">
          Sumar 1 rep
        </span>
      </div>
    )
  },
  {
    label: 'Agregar bloque',
    command: () => AddBlock(),
    template: (item, opts) => (
      <div className="dial-item-tooltip-wrapper text-center">
        <button
          type="button"
          {...opts}
          className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
        >
          <AddIcon className="fontBadgePlus" />
        </button>
        <span className="fs08em text-light d-block mt-1">
          Agregar bloque
        </span>
      </div>
    )
  },
  {
    label: 'Ver semanas',
    command: () => setDialogAllWeeks(true),
    template: (item, opts) => (
      <div className="dial-item-tooltip-wrapper text-center">
        <button
          type="button"
          {...opts}
          className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
        >
          <Eye className="fontBadgePlus" />
        </button>
        <span className="fs08em text-light d-block mt-1">
          Ver semanas
        </span>
      </div>
    )
  }
];
 
const dayEditThemeVars = useMemo(() => {
  if (dayEditEditorTheme === "dark") {
    return {
      "--dayedit-page-bg": "var(--tom-shell-bg-deep, #050b14)",
      "--dayedit-main-bg": "var(--tom-shell-bg-deep, #050b14)",
      "--dayedit-main-text": "#f8fafc",
      "--dayedit-bg": "var(--tom-shell-bg, #08111f)",
      "--dayedit-surface": "var(--tom-shell-elevated, #0f1b2e)",
      "--dayedit-surface-alt": "var(--tom-shell-elevated-2, #14243a)",
      "--dayedit-surface-hover": "var(--tom-shell-hover, #1b2d46)",
      "--dayedit-border": "var(--tom-shell-border, #24344d)",
      "--dayedit-border-strong": "var(--tom-shell-border-strong, #345074)",
      "--dayedit-text": "#f8fafc",
      "--dayedit-text-muted": "var(--tom-shell-muted, #9fb0c7)",
      "--dayedit-text-soft": "var(--tom-shell-soft, #64748b)",
      "--dayedit-accent": "#38bdf8",
      "--dayedit-success": "#34d399"
    };
  }

  return {
    "--dayedit-page-bg": "#f3f6fb",
    "--dayedit-main-bg": "#f3f6fb",
    "--dayedit-main-text": "#07111f",
    "--dayedit-bg": "var(--tom-shell-bg, #08111f)",
    "--dayedit-surface": "var(--tom-shell-elevated, #0f1b2e)",
    "--dayedit-surface-alt": "var(--tom-shell-elevated-2, #14243a)",
    "--dayedit-surface-hover": "var(--tom-shell-hover, #1b2d46)",
    "--dayedit-border": "var(--tom-shell-border, #24344d)",
    "--dayedit-border-strong": "var(--tom-shell-border-strong, #345074)",
    "--dayedit-text": dayEditDarkTokens.colorText,
    "--dayedit-text-muted": dayEditDarkTokens.colorTextSecondary,
    "--dayedit-text-soft": dayEditDarkTokens.colorTextTertiary,
    "--dayedit-accent": "#0ea5e9",
    "--dayedit-success": dayEditDarkTokens.colorSuccess
  };
}, [dayEditEditorTheme]);

  // ddp-dark/ddp-light acompana al tema real. Antes ddp-dark estaba fijo, asi
  // que las reglas .ddp.ddp-light del CSS global nunca aplicaban y el modo
  // claro heredaba superficies oscuras.
  return (
    <div
      className={`container-fluid ddp ${dayEditEditorTheme === 'light' ? 'ddp-light' : 'ddp-dark'} dayEditDarkPage dayEditEditorTheme-${dayEditEditorTheme} dayEditDensity-${editorDensity} dayEditApproxTools-${approxBackoffVisibility}`}
      style={dayEditThemeVars}
    >
      {/**a
       * SIDEBAR: fijo ? la izquierda 
       */}
       <div className={`sidebarPro colorMainAll dayEditSidebarModern ${desktopToolsMode === "sidebar" ? "isSidebarMode" : ""} ${desktopToolsMode === "free" ? "isFreeMode" : ""} ${desktopToolsMode === "simple" ? "isSimpleMode" : ""}`}>
                 <div className="d-flex flex-column colorMainAll shadow-sm dayEditSidebarModernInner">
                 <div className="p-3 dayEditSidebarModernContent">
                   <h5 className="fw-bold text-center mb-4">TOM</h5>
                    {firstWidth > 992 && (
                      <div className="dayEditToolsModeControl">
                        <span>Modo</span>
                        <div role="group" aria-label="Modo de herramientas">
                          <button
                            type="button"
                            className={desktopToolsMode === "sidebar" ? "isActive" : ""}
                            onClick={() => changeDesktopToolsMode("sidebar")}
                          >
                            {modeButtonLabel("Barra")}
                          </button>
                          <button
                            type="button"
                            className={desktopToolsMode === "simple" ? "isActive" : ""}
                            onClick={() => changeDesktopToolsMode("simple")}
                          >
                            {modeButtonLabel("Simple")}
                          </button>
                          <button
                            type="button"
                            className={desktopToolsMode === "free" ? "isActive" : ""}
                            onClick={() => changeDesktopToolsMode("free")}
                          >
                            {modeButtonLabel("Libre")}
                          </button>
                        </div>
                        {desktopToolsMode === "free" && (
                          <div className="dayEditFreeModeControls">
                            <button type="button" onClick={() => setFloatingToolsLocked((value) => !value)}>
                              {floatingToolsLocked ? <Lock size={14} /> : <Unlock size={14} />}
                              {floatingToolsLocked ? "Desbloquear" : "Bloquear"}
                            </button>
                            <button type="button" onClick={resetFloatingToolPositions}>
                              <RotateCcw size={14} /> Restaurar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {desktopToolsMode !== "simple" && (
                    <>
                    <div id={'nameWeek'} className="bgItemsDropdown rounded row justify-content-center stylePointer dayEditSidebarWeek" onClick={openEditWeekNameDialog}>
                     <div className=' col-1'><EditIcon /></div>
                     <div className='text-center col-10'><strong >{weekName}</strong></div>
                   </div>

            
       
                    <div className="d-flex justify-content-between text-light bgItemsDropdown align-items-center dayEditSidebarDays">
                      <ConfigProvider theme={dayEditSegmentedTheme}>
                        <Segmented
                          id={'dias'}
                          className="w-100"
                          size="large"
                          vertical
                          options={allDays.map((day, index) => ({
                            label: sanitizeBrokenText(day.name),
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
                            const list = Array.isArray(modifiedDay) ? modifiedDay : [];
                            const selectedIndex = list.findIndex((d) => d?._id === value);
                            if (selectedIndex !== -1) {
                              setIndexDay(selectedIndex);
                              setCurrentDay(list[selectedIndex]);
                            }
                          }}
                        />
                      </ConfigProvider>
                    </div>        
                    </>
                    )}

                   

                  <div className="text-muted small dayEditSidebarDayActions">

                    <div id="agregarDia"  role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center" onClick={addNewDay} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (addNewDay)(e); } }} title="Agregar día">
                      <div className=' col-1'><AddIcon /></div>
                      <div className='text-center col-10'><strong >Agregar día</strong></div>
                    </div>

                     <div id="editarDia" role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center" onClick={() => openEditNameDialog(currentDay)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => openEditNameDialog(currentDay))(e); } }} title="Editar día">
                     <div className=' col-1'><EditIcon /></div>
                       <div className='text-center col-10'><strong >Editar {`${sanitizeBrokenText(currentDay && currentDay.name)}`}</strong></div>
                     </div>

                     <div
                      id="reordenarDias"
                      role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center"
                      onClick={openReorderDaysDialog} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (openReorderDaysDialog)(e); } }}
                      title="Reordenar días"
                    >
                      <div className=' col-1'><DragIndicatorIcon /></div>
                      <div className='text-center col-10'><strong>Reordenar días</strong></div>
                    </div>

                     <div
                       id="eliminarDia"
                       role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center"
                      onClick={handleDeleteDayClick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (handleDeleteDayClick)(e); } }}
                      title="Eliminar día"
                      style={{
                        opacity: canDeleteDay ? 1 : 0.5,
                        pointerEvents: canDeleteDay ? "auto" : "none",
                        cursor: canDeleteDay ? "pointer" : "not-allowed"
                      }}
                    >
                         <div className=' col-1'><DeleteIcon /></div>
                      <div className='text-center col-10'><strong >Eliminar {`${sanitizeBrokenText(currentDay && currentDay.name)}`}</strong></div>
                    </div>

                    <div
                      id="copiarDia"
                      role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center"
                      onClick={copyDayToClipboard} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (copyDayToClipboard)(e); } }}
                      title="Copiar día"
                    >
                      <div className=' col-1'><ContentCopyIcon /></div>
                      <div className='text-center col-10'><strong>Copiar día</strong></div>
                    </div>
                  
                    {/* Pegar dia */}
                    <div
                      id="pegarDia"
                      role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center"
                      onClick={pasteDayFromClipboard} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (pasteDayFromClipboard)(e); } }}
                      title="Pegar día"
                      style={{ opacity: hasDayClipboard ? 1 : 0.5, pointerEvents: hasDayClipboard ? 'auto' : 'none' }}
                    >
                      <div className=' col-1'><LibraryAddIcon /></div>
                      <div className='text-center col-10'><strong>Pegar día</strong></div>
                    </div>

                    <div
                      id="verComoAlumno"
                      role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center"
                      onClick={() => setShowStudentPreviewDialog(true)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (() => setShowStudentPreviewDialog(true))(e); } }}
                      title="Vista alumno"
                    >
                      <div className=' col-1'><Eye size={18} /></div>
                      <div className='text-center col-10'><strong>Vista alumno</strong></div>
                    </div>

                  </div>

                    <div className="text-muted small dayEditSidebarCreateActions">

                      <div id="addEjercicio" role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center" onClick={() => AddNewExercise()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); AddNewExercise(); } }} title="Añadir ejercicio">
                        <div className=' col-1 dayEditSidebarComboIcon'><AddIcon /><FitnessCenterIcon /></div>
                        <div className='text-center col-10'><strong >Añadir ejercicio</strong></div>
                      </div>

                      <div id="addCircuit" role="button" tabIndex={0} className="bgItemsDropdown stylePointer rounded row justify-content-center" onClick={() => AddNewCircuit()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); AddNewCircuit(); } }} title="Añadir circuito">
                        <div className=' col-1 dayEditSidebarComboIcon'><AddIcon /><AccountTreeIcon /></div>
                        <div className='text-center col-10'><strong >Añadir circuito</strong></div>
                      </div>


                    </div>

                   <div className="text-center dayEditSidebarHelp">
                              <button className="btn btn-outline-light btn-sm" onClick={() => setTourVisible(true)}>
                                <HelpCircle size={16} className="me-1" /> Ayuda
                              </button>
                            </div>
                          </div>
       
                 </div>
    </div>

      {firstWidth > 992 && desktopToolsMode === "free" && (
        <>
        <div className="dayEditFloatingToolsLayer" aria-label="Herramientas flotantes">
          <DraggableModeDock
            position={floatingToolPositions.dock}
            onPositionChange={(position) => updateFloatingToolPosition("dock", position)}
          >
            <button type="button" onClick={() => changeDesktopToolsMode("sidebar")}>
              <ToggleLeft size={15} /> Barra
            </button>
            <button type="button" onClick={() => setFloatingToolsLocked((value) => !value)}>
              {floatingToolsLocked ? <Lock size={15} /> : <Unlock size={15} />}
              {floatingToolsLocked ? "Desbloquear" : "Bloquear"}
            </button>
            <button type="button" onClick={resetFloatingToolPositions}>
              <RotateCcw size={15} /> Restaurar
            </button>
            <div className="dayEditFreeVisibilityWrap">
              <button type="button" onClick={() => setShowFloatingVisibilityMenu((value) => !value)}>
                <Eye size={15} /> Visibilidad
              </button>
              {showFloatingVisibilityMenu && (
                <div className="dayEditFreeVisibilityMenu">
                  {[
                    ["navigation", "Semana y días"],
                    ["dayActions", "Gestion de días"],
                    ["clipboard", "Acciones del día"],
                    ["content", "Agregar contenido"],
                  ].map(([panelId, label]) => (
                    <button type="button" key={panelId} onClick={() => toggleFloatingToolVisibility(panelId)}>
                      {floatingToolVisibility[panelId] ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DraggableModeDock>

          {floatingToolVisibility.navigation && (
          <FloatingToolPanel
            id="navigation"
            title="Semana y días"
            position={floatingToolPositions.navigation}
            locked={floatingToolsLocked}
            zIndex={activeFloatingPanel === "navigation" ? 2147483150 : 2147483100}
            onActivate={setActiveFloatingPanel}
            onPositionChange={updateFloatingToolPosition}
            className="dayEditFloatingNavigation"
          >
            <button type="button" className="dayEditFloatingWeek" onClick={openEditWeekNameDialog}>
              <EditIcon /> <span>{weekName}</span>
            </button>
            <ConfigProvider theme={dayEditSegmentedTheme}>
              <Segmented
                className="dayEditFloatingDays"
                vertical
                options={allDays.map((day, index) => ({
                  label: sanitizeBrokenText(day.name),
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
                value={currentDay?._id || ""}
                onChange={(value) => {
                  const list = Array.isArray(modifiedDay) ? modifiedDay : [];
                  const selectedIndex = list.findIndex((day) => day?._id === value);
                  if (selectedIndex !== -1) {
                    setIndexDay(selectedIndex);
                    setCurrentDay(list[selectedIndex]);
                  }
                }}
              />
            </ConfigProvider>
          </FloatingToolPanel>
          )}

          {floatingToolVisibility.dayActions && (
          <FloatingToolPanel
            id="dayActions"
            title="Gestion de días"
            position={floatingToolPositions.dayActions}
            locked={floatingToolsLocked}
            zIndex={activeFloatingPanel === "dayActions" ? 2147483150 : 2147483100}
            onActivate={setActiveFloatingPanel}
            onPositionChange={updateFloatingToolPosition}
          >
            <div className="dayEditFloatingActionGrid">
              <button type="button" onClick={addNewDay}><AddIcon />Agregar día</button>
              <button type="button" onClick={() => openEditNameDialog(currentDay)}><EditIcon />Editar día</button>
              <button type="button" onClick={handleDeleteDayClick} disabled={!canDeleteDay}><DeleteIcon />Eliminar día</button>
              <button type="button" onClick={openReorderDaysDialog}><DragIndicatorIcon />Reordenar</button>
            </div>
          </FloatingToolPanel>
          )}

          {floatingToolVisibility.clipboard && (
          <FloatingToolPanel
            id="clipboard"
            title="Acciones del día"
            position={floatingToolPositions.clipboard}
            locked={floatingToolsLocked}
            zIndex={activeFloatingPanel === "clipboard" ? 2147483150 : 2147483100}
            onActivate={setActiveFloatingPanel}
            onPositionChange={updateFloatingToolPosition}
          >
            <div className="dayEditFloatingActionGrid">
              <button type="button" onClick={copyDayToClipboard}><ContentCopyIcon />Copiar día</button>
              <button type="button" onClick={pasteDayFromClipboard} disabled={!hasDayClipboard}><LibraryAddIcon />Pegar día</button>
              <button type="button" onClick={() => setShowStudentPreviewDialog(true)}><Eye size={16} />Vista alumno</button>
            </div>
          </FloatingToolPanel>
          )}

          {floatingToolVisibility.content && (
          <FloatingToolPanel
            id="content"
            title="Agregar contenido"
            position={floatingToolPositions.content}
            locked={floatingToolsLocked}
            zIndex={activeFloatingPanel === "content" ? 2147483150 : 2147483100}
            onActivate={setActiveFloatingPanel}
            onPositionChange={updateFloatingToolPosition}
          >
            <div className="dayEditFloatingActionGrid">
              <button type="button" onClick={() => AddNewExercise()}><AddIcon />Añadir ejercicio</button>
              <button type="button" onClick={() => AddNewCircuit()}><AddIcon />Añadir circuito</button>
            </div>
          </FloatingToolPanel>
          )}
        </div>
        </>
      )}


       
      {firstWidth < 992 && <div id={'nameWeek'} className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3 stylePointer dayEditMobileWeekButton" onClick={openEditWeekNameDialog}>
        <div className=' col-1'><EditIcon /></div>
            <div className='text-center col-10'><strong >{weekName}</strong></div>
        </div>
        }

      <div className={`dayEditPageContent ${firstWidth < 992 ? 'dayEditPageContentMobile' : desktopToolsMode === "free" ? 'dayEditFreeModeContent' : desktopToolsMode === "simple" ? 'dayEditSimpleModeContent' : (collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen')}`}>
        <section className="totalHeight dayEditMainSection">
          <header className="dayEditTrainingHeader">
            <div className="dayEditTrainingEyebrow">
              <span className="dayEditTrainingGridIcon" aria-hidden="true" />
              <span>Editor de entrenamiento</span>
            </div>
            <h1 className="dayEditTrainingTitle">
              <span className="dayEditTrainingDayName">{sanitizeBrokenText(currentDay?.name || "Día")}</span>
              <span className="dayEditTrainingBlockName">Bloque principal</span>
            </h1>
          </header>

          {/* Ojo: `cond && 'clase'` renderiza la string "false" como clase cuando
              la condicion es falsa. Con ternario a string vacia no pasa. */}
          <div  className={`row dayEditTopBlocksRow ${firstWidth > 992 ? 'mb-3' : ''} justify-content-around align-middle align-center align-items-center`}>

            <div className=" col-lg-6   mt-3">
                  <div
                    id="movility"
                    className={`ps-3 bgItemsDropdown py-3 dayEditPreparationCard ${hasCurrentMovility ? "dayEditPreparationCardLoaded" : ""}`}
                    onClick={handleShowMovility}
                  >
                    <div className="dayEditPreparationHeader">
                      <div className="dayEditPreparationTitle">
                        <CircleIcon  className="me-2 badgeMovility" />
                        <span className="dayEditPreparationTitleText">
                          <span className="dayEditPreparationEyebrow">{sanitizeBrokenText(currentDay && currentDay.name)}</span>
                          <span className="me-1 stylesSpanTitles">Bloque de <strong>activación/movilidad</strong></span>
                        </span>
                      </div>
                      <span className={`dayEditPreparationStatus ${hasCurrentMovility ? "dayEditPreparationStatusLoaded" : ""}`}>
                        {hasCurrentMovility ? (
                          <>
                            <CheckCircleIcon fontSize="inherit" />
                            Cargado
                          </>
                        ) : (
                          <>
                            <PanoramaFishEyeIcon fontSize="inherit" />
                            Sin cargar
                          </>
                        )}
                      </span>
                    </div>
                    <span className="d-block stylesSpanBloqs">
                      {hasCurrentMovility ? (
                        <>
                          <span>{currentMovilityItemsCount} ejercicio{currentMovilityItemsCount === 1 ? "" : "s"} cargado{currentMovilityItemsCount === 1 ? "" : "s"}.</span>
                          <span className="dayEditPreparationSubline">Haz click para editar</span>
                        </>
                      ) : (
                        <>
                          <span>Todavia no hay activación/movilidad cargada</span>
                        </>
                      )}
                    </span>
                  </div>
               
              </div>

              <div className=" col-lg-6  mt-3">
                  <div
                    id="warmup"
                    className={`ps-3 bgItemsDropdown py-3 dayEditPreparationCard ${hasCurrentWarmup ? "dayEditPreparationCardLoaded" : ""}`}
                    onClick={handleShowWarmup}
                  >
                    <div className="dayEditPreparationHeader">
                      <div className="dayEditPreparationTitle">
                        <CircleIcon  className="me-2 badgeWarmup" />
                        <span className="dayEditPreparationTitleText">
                          <span className="dayEditPreparationEyebrow">{sanitizeBrokenText(currentDay && currentDay.name)}</span>
                          <span className="me-1 stylesSpanTitles">Bloque de <strong>entrada en calor</strong></span>
                        </span>
                      </div>
                      <span className={`dayEditPreparationStatus ${hasCurrentWarmup ? "dayEditPreparationStatusLoaded" : ""}`}>
                        {hasCurrentWarmup ? (
                          <>
                            <CheckCircleIcon fontSize="inherit" />
                            Cargado
                          </>
                        ) : (
                          <>
                            <PanoramaFishEyeIcon fontSize="inherit" />
                            Sin cargar
                          </>
                        )}
                      </span>
                    </div>
                    <span className="d-block stylesSpanBloqs">
                      {hasCurrentWarmup ? (
                        <>
                          <span>{currentWarmupItemsCount} ejercicio{currentWarmupItemsCount === 1 ? "" : "s"} cargado{currentWarmupItemsCount === 1 ? "" : "s"}.</span>
                          <span className="dayEditPreparationSubline">Haz click para editar</span>
                        </>
                      ) : (
                        <>
                          <span>Todavia no hay entrada en calor cargada</span>
                        </>
                      )}
                    </span>
                </div>
              </div>


          
              {firstWidth < 992 && 
              <>
              <div className={`col-10 col-sm-6 text-center mt-3`}>
                    
                    <ConfigProvider theme={dayEditSegmentedTheme}>
                      <Segmented
                          className="dayEditMobileDaySegmented"
                          options={allDays.map(day => {
                            const name = sanitizeBrokenText(day.name || '');
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
                          value={currentDay ? currentDay._id : ''}
                          onChange={(value) => {
                            const list = Array.isArray(modifiedDay) ? modifiedDay : [];
                            const selectedIndex = list.findIndex((d) => d?._id === value);
                            if (selectedIndex !== -1) {
                              setIndexDay(selectedIndex);
                              setCurrentDay(list[selectedIndex]);
                            }
                          }}
                      />
                    </ConfigProvider>

                    {/* Una sola hilera de iconos, sin titulo de seccion: la palabra
                        "Día" repetia lo que ya dice el cartel "Estás en: Día X" que
                        esta justo debajo. Al no haber texto visible, el nombre de
                        cada accion va en title (se ve al mantener apretado) y en
                        aria-label (lectores de pantalla). */}
                    <section className="dayEditMobileDayActions" aria-label="Acciones de día">
                      <button type="button" onClick={addNewDay} title="Crear día" aria-label="Crear día">
                        <AddIcon fontSize="small" />
                      </button>
                      <button type="button" onClick={() => openEditNameDialog(currentDay)} title="Editar día" aria-label="Editar día">
                        <EditIcon fontSize="small" />
                      </button>
                      <button type="button" onClick={openReorderDaysDialog} title="Reordenar días" aria-label="Reordenar días">
                        <DragIndicatorIcon fontSize="small" />
                      </button>
                      <button type="button" onClick={copyDayToClipboard} title="Copiar día" aria-label="Copiar día">
                        <ContentCopyIcon fontSize="small" />
                      </button>
                      <button type="button" onClick={pasteDayFromClipboard} disabled={!hasDayClipboard} title="Pegar día" aria-label="Pegar día">
                        <LibraryAddIcon fontSize="small" />
                      </button>
                      <button
                        type="button"
                        className="isDanger"
                        onClick={handleDeleteDayClick}
                        disabled={!canDeleteDay}
                        title="Eliminar día"
                        aria-label="Eliminar día"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </section>

                    <p className="text-center mb-4 colorNameAlumno rounded-2 mt-3 py-1 fs09em">
                        Estas en: <b>{sanitizeBrokenText(currentDay && currentDay.name)}</b>
                    </p>

                </div>
              </>
                }
          </div>

          {MOSTRAR_CREACION_POR_TEXTO && (
            <ExerciseCommandComposer onAddExercise={AddNewExercise} />
          )}

          {firstWidth > 992 && (
            <div className="dayEditDesktopActionRail">
              <div className="dayEditBulkActionBar">
                <button className="bulkAdjustTriggerBtn rounded-2 text-start" onClick={() => incrementAllSeries()} >
                  <Tooltip placement="top" arrow title={ "Sumaras una serie a todos los ejercicios." } enterDelay={0} leaveDelay={0}>
                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                      <AddIcon className="bulkAdjustHeaderIcon" />
                      <span>Sumar 1 serie</span>
                    </div>
                  </Tooltip>
                </button>

                <button className="bulkAdjustTriggerBtn rounded-2 text-start" onClick={() => incrementAllReps()} >
                  <Tooltip placement="top" arrow title={ "Sumaras una repetición a todos los ejercicios." } enterDelay={0} leaveDelay={0}>
                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                      <PlusOneOutlined className="bulkAdjustHeaderIcon" />
                      <span>Sumar 1 rep</span>
                    </div> 
                  </Tooltip>
                </button>

                <button className="bulkAdjustTriggerBtn rounded-2 text-start" onClick={AddBlock}>
                  <Tooltip placement="top" arrow title={ "En vez de agregar un ejercicio, primero agregas un bloque para luego crear los ejercicios que desees dentro de el. Tu alumno vera el bloque. Por ejemplo, podés agregar un bloque de fuerza y luego otro de auxiliares." } enterDelay={0} leaveDelay={0}>
                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                      <AddIcon className="bulkAdjustHeaderIcon" />
                      <span>Bloque de entrenamiento</span>
                    </div>
                  </Tooltip>
                </button>

                <button
                  className="bulkAdjustTriggerBtn rounded-2 text-start"
                  onClick={() => setDialogAllWeeks(true)}
                  type="button"
                >
                  <Tooltip placement="top" arrow title="Ver semanas anteriores." enterDelay={0} leaveDelay={0}>
                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                      <Eye className="bulkAdjustHeaderIcon" />
                      <span>Semanas anteriores</span>
                    </div>
                  </Tooltip>
                </button>

                <button
                  className="bulkAdjustTriggerBtn rounded-2 text-start"
                  onClick={() => setShowColumnConfigDialog(true)}
                  type="button"
                >
                  <Tooltip placement="top" arrow title="Elegir columnas y anchos." enterDelay={0} leaveDelay={0}>
                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                      <RectangleEllipsis className="bulkAdjustHeaderIcon" />
                      <span>Columnas</span>
                    </div>
                  </Tooltip>
                </button>

                <button
                  className="bulkAdjustTriggerBtn rounded-2 text-start"
                  onClick={() => setShowDayEditSettingsDialog(true)}
                  type="button"
                >
                  <Tooltip placement="top" arrow title="Ajustes de esta vista." enterDelay={0} leaveDelay={0}>
                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                      <SlidersHorizontal className="bulkAdjustHeaderIcon" />
                      <span>Ajustes</span>
                    </div>
                  </Tooltip>
                </button>
              </div>
            </div>
          )}

          <div className="row dayEditTableRow justify-content-center align-middle text-center mb-5 pb-5">
           
             
       
            {firstWidth > 992 ? (
              /** Tabla de escritorio con Drag&Drop **/
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="exercises-desktop" type="MAIN">
                  {(provided) => (
                    <div 
                      className="table-responsive col-12 px-0 altoTable dayEditTableShell dayEditDesktopTableShell"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <table
                        className={`table totalHeightTable align-middle fontTable text-center ddp-table dayEditDesktopTable ${
                          isEditing && "table-light"
                        }`}
                      >
                        <colgroup>
                          <col className="dayEditColDrag" />
                          <col className="dayEditColOrder" />
                          {visibleExerciseColumns.map((column) => (
                            <col
                              key={column.id}
                              className={column.className}
                              style={{ width: `${columnConfig[column.id]?.width || column.defaultWidth}px` }}
                            />
                          ))}
                          <col className="dayEditColDelete" />
                        </colgroup>
                        <thead>
                          <tr>
                            {/* CHANGES: Aqui usamos key={index} para evitar duplicados */}
                            {propiedades.map((propiedad, index) => (
                              <th
                                key={index}
                                className={`td-${index} fontThStyles ${propiedad.className}`}
                                scope="col"
                              >
                                {propiedad.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
           
                        <tbody>
                          {displayedCurrentDay && displayedCurrentDay.exercises.map((exercise, i) => (
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
  {/* El acento vivia solo en el div interno; el riel lo necesita en la celda. */}
  <td
    colSpan={desktopColumnSpan}
    className="p-0 border-0 dayEditTrainingBlockCell"
    style={{ '--block-accent': exercise.color || '#2563eb' }}
  >
    <div
      className="rounded-3 dayEditTrainingBlockShell"
      style={{
        '--block-accent': exercise.color || '#2563eb'
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between dayEditTrainingBlockHeader"
      >
        <div className="d-flex align-items-center gap-2">
          <span {...providedDrag.dragHandleProps}>
            <IconButton size="small" className="dayEditTrainingBlockDrag">
              <DragIndicatorIcon />
            </IconButton>
          </span>

          <span className="dayEditTrainingBlockLabel">Bloque</span>

          <button
            type="button"
            className="btn btn-sm blockNameEditButton dayEditTrainingBlockNameBtn"
            onClick={(e) => blockNameOverlayRef.current[`b-web-${exercise.block_id}`]?.toggle(e)}
          >
            <EditIcon fontSize="inherit" />
            <span>{exercise.name || "Nombre del bloque"}</span>
          </button>
          <OverlayPanel
            ref={(el) => (blockNameOverlayRef.current[`b-web-${exercise.block_id}`] = el)}
            className="blockNameOverlayPanel dayEditDarkOverlayPanel"
          >
            <div className="blockNameOverlayBody">
              <div className="blockNameOverlayTitle">Nombre del bloque</div>
              <PrimeAutoComplete
                value={exercise.name}
                suggestions={blockNameSuggestions}
                dropdown
                placeholder="Escribi o elegí un nombre"
                className="w-100 blockNameAutoComplete"
                inputClassName="blockNameAutoCompleteInput"
                completeMethod={(e) => {
                  const q = e.query.toLowerCase();
                  setBlockNameSuggestions(
                    BLOCK_NAME_OPTIONS.filter((opt) =>
                      opt.toLowerCase().includes(q)
                    )
                  );
                }}
                onChange={(e) => changeBlockData(i, 'name', e.value)}
              />
              <div className="blockNameOverlayHint">Sugerencias + nombre libre.</div>
            </div>
          </OverlayPanel>
        </div>

        <div className="d-flex align-items-center dayEditTrainingBlockActions">
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
            className="dayEditTrainingBlockDelete"
            onClick={() => handleDeleteBlockClick(i, exercise.name)}
            title="Eliminar bloque"
          >
            <CancelIcon />
          </IconButton>
        </div>
      </div>

    </div>
  </td>
</tr>

<tr
  className="dayEditBlockColumnHeaderRow"
  style={{ '--block-accent': exercise.color || '#2563eb' }}
>
  <td colSpan={2}>#</td>
  {visibleExerciseColumns.map((column) => (
    <td key={column.id} className={column.id === "name" ? "text-start" : ""}>
      {column.label}
    </td>
  ))}
  <td>#</td>
</tr>

                             
                              <React.Fragment   
                              >
                                {exercise.exercises.map((ex, j) => {
                                    // EJERCICIOS SUELTOS
                                    if (ex.type === 'exercise') {
                                      const blockExerciseNotesKey = `block-${exercise.block_id}-${ex.exercise_id || j}`;
                                      return (
                                      <React.Fragment key={ex.exercise_id}>
                                      <tr 
                                      className={`text-danger shadow dayEditBlockExerciseRow ${isNotesOpenFor(ex.notas, blockExerciseNotesKey) ? "hasOpenNotes" : ""}`}
                                      style={{ '--block-accent': exercise.color || '#2563eb' }}
                                        
                                          >

                                        <td
                                          colSpan={2}
                                          className="dayEditBlockOrderCell"
                                          style={{ '--block-accent': exercise.color || '#2563eb' }}
                                        >
                                          <div className="dayEditBlockExerciseNumberStack">
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
                                              className="p-dropdown-group w-100 dayEditBlockOrderDropdown"
                                            />
                                            <div className="dayEditBlockExerciseStateDots" aria-label="Estado de aproximaciones y back off">
                                              <Tooltip title={hasApproximation(ex) ? "Tiene aproximaciones" : "No tiene aproximaciones"} enterDelay={0} leaveDelay={0}>
                                                <span className={`dayEditBlockExerciseStateDot ${hasApproximation(ex) ? "is-loaded" : ""}`} />
                                              </Tooltip>
                                              <Tooltip title={hasBackoff(ex) ? "Tiene back off" : "No tiene back off"} enterDelay={0} leaveDelay={0}>
                                                <span className={`dayEditBlockExerciseStateDot ${hasBackoff(ex) ? "is-loaded" : ""}`} />
                                              </Tooltip>
                                            </div>
                                          </div>
                                        </td>
                                        {isColumnVisible("name") && (
                                        <td className="dayEditBlockExerciseNameColumn">
                                        <div className="dayEditBlockExerciseNameCell">
                                                          <AutoComplete
                                                                defaultValue={typeof ex.name === 'object' ? ex.name.name : ex.name}
                                                                onChange={(name, video) => {
                                                                  // Usa la funcion especifica para ejercicios de bloque
                                                                  changeBlockExerciseData(i, j, 'name', name);
                                                                  changeBlockExerciseData(i, j, 'video', video);
                                                                }}
                                                              />
                                                          <div className="dayEditBlockExerciseHoverTools">
                                                            <button className="btn colorAproximations py-0 m-0"
                                                                    onClick={e => handleOpenApprox(e, i, j)}>
                                                              <AddIcon className="iconsAproximations" /> <span>Aproximaciones</span>
                                                            </button>
                                                            <button
                                                              className="btn colorBackOff py-0 ps-1 m-0 text-start"
                                                              onClick={(e) => handleOpenBackoffOverlay(e, i, j)}
                                                            >
                                                              <AddIcon className="iconsAproximations" /> <span>Back off</span>
                                                            </button>
                                                          </div>
                                                        </div>
                                                        </td>
                                                        )}
                                                        {isColumnVisible("sets") && (
                                                        <td className="dayEditMetricCell dayEditMetricCellSets">
                                                        <div className="dayEditMetricControl">
                                                        {customInputEditDay(ex.sets, j, "sets", i)}
                                                        </div>
                                                        </td>
                                                        )}
                                                        {isColumnVisible("reps") && (
                                                        <td className="dayEditMetricCell dayEditMetricCellReps">
                                                          <div className="dayEditMetricControl marginRepsNew">
                                                          {customInputEditDay(ex.reps, j, "reps", i)}
                                                          </div>
                                                        </td>
                                                        )}
                                                        {isColumnVisible("peso") && (
                                                        <td className="dayEditPesoCompactTd">
                                                          {customInputEditDay(ex.peso, j, "peso", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rpeRir") && (
                                                        <td className="dayEditStudentCompactTd">
                                                          {customInputEditDay(ex.athleteRpeRir ?? ex.rpeRir, j, "rpeRir", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rest") && (
                                                        <td className="dayEditRestCompactCell">
                                                          <span className="dayEditRestCompactLabel">Rest</span>
                                                          {customInputEditDay(ex.rest, j, "rest", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("video") && (
                                                        <td className="dayEditVideoCompactTd">
                                                          {customInputEditDay(ex.video, j, "video", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("notas") && (
                                                        <td className="dayEditNotesHoverTd">
                                                          <div className={`dayEditNotesHoverCell ${ex.notas ? "has-notes" : ""} ${isNotesOpenFor(ex.notas, blockExerciseNotesKey) ? "is-open" : ""}`}>
                                                            <button
                                                              type="button"
                                                              className="dayEditNotesHoverTrigger"
                                                              aria-label="Ver o editar notas"
                                                              onClick={(event) => {
                                                                event.stopPropagation();
                                                                setOpenExerciseNotesKey((current) => current === blockExerciseNotesKey ? null : blockExerciseNotesKey);
                                                              }}
                                                            >
                                                              <MessageSquare size={15} />
                                                            </button>
                                                          </div>
                                                        </td>
                                                        )}
                                                        <td className="dayEditDeleteCompactTd">
                                                          <IconButton
                                                              onClick={() => handleDeleteExerciseInBlockClick(i, ex)}
                                                            >
                                                              <CancelIcon className="colorIconDeleteExercise" />
                                                            </IconButton>
                                                        </td>
                                                      </tr>
                                                      {isNotesOpenFor(ex.notas, blockExerciseNotesKey) && (
                                                        <tr
                                                          className="dayEditInlineNotesRow dayEditBlockInlineNotesRow"
                                                          style={{ '--block-accent': exercise.color || '#2563eb' }}
                                                        >
                                                          <td colSpan={desktopColumnSpan} className="dayEditInlineNotesCell">
                                                            <span className="dayEditInlineNotesTitle">Notas</span>
                                                            {customInputEditDay(ex.notas, j, "notas", i)}
                                                          </td>
                                                        </tr>
                                                      )}
                                                      </React.Fragment>
                                )}
                                if (ex.type !== 'block' && ex.type !== 'exercise') {

                                  return (
                                    <React.Fragment key={ex.exercise_id}>
                                      <tr>
                                        <td
                                          colSpan={desktopColumnSpan}
                                          className="p-0 border-0 dayEditBlockCircuitCell"
                                          style={{ '--block-accent': exercise.color || '#2563eb' }}
                                        >
                                          <table className="table text-center align-middle dayEditCircuitNestedTable">
                                            <colgroup>
                                              <col className="dayEditCircuitColIndex" />
                                              {visibleCircuitColumns.map((column) => (
                                                <col
                                                  key={column.id}
                                                  className={DAY_EDIT_CIRCUIT_COLUMN_CLASS[column.id]}
                                                  style={{ width: `${columnConfig[column.id]?.width || column.defaultWidth}px` }}
                                                />
                                              ))}
                                              <col className="dayEditCircuitColDelete" />
                                            </colgroup>
                                            <thead>
                                              <tr>
                                                <td colSpan={Math.max(1, circuitColumnSpan - 1)} className="text-start">
                                                  <CircuitHeaderEditor
                                                    circuit={ex}
                                                    onField={(field, value) => changeBlockCircuitData(i, j, field, value)}
                                                    showNumber
                                                    numberValue={ex.numberExercise}
                                                    numberOptions={options}
                                                    onNumberChange={(v) => changeBlockCircuitData(i, j, 'numberExercise', v)}
                                                  />
                                                </td>
                                                <td className="dayEditCircuitDeleteCell">
                                                  <IconButton onClick={() => handleDeleteCircuitInBlock(i, j, circuitSubtitle(ex))}>
                                                    <CancelIcon className="colorIconDeleteExercise" />
                                                  </IconButton>
                                                </td>
                                              </tr>
                                              <tr>
                                                <th>#</th>
                                                {visibleCircuitColumns.map((column) => (
                                                  <th key={column.id}>{column.label}</th>
                                                ))}
                                                <th></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {ex.circuit.map((ce, k) => (
                                                <tr key={ce.idRefresh}>
                                                  <td className="dayEditCircuitIndexCell">
                                                    <span>{k + 1}</span>
                                                  </td>
                                                  {isColumnVisible("name") && (
                                                  <td className="text-start">
                                                    {customInputEditExerciseInCircuit(ce.name, j, k, 'name', ce.name, i)}
                                                  </td>
                                                  )}
                                                  {isColumnVisible("reps") && (
                                                  <td className="text-center">
                                                    {customInputEditExerciseInCircuit(ce.reps, j, k, 'reps', ce.reps, i)}
                                                  </td>
                                                  )}
                                                  {isColumnVisible("peso") && (
                                                  <td className="text-center">
                                                    {customInputEditExerciseInCircuit(ce.peso, j, k, 'peso', ce.peso, i)}
                                                  </td>
                                                  )}
                                                  {isColumnVisible("video") && (
                                                  <td className="text-center">
                                                    {customInputEditExerciseInCircuit(ce.video, j, k, 'video', ce.video, i)}
                                                  </td>
                                                  )}
                                                  <td className="dayEditCircuitDeleteCell">
                                                    <IconButton onClick={() => handleDeleteExerciseInCircuit(i, j, k, ce.name)}>
                                                      <CancelIcon className="colorIconDeleteExercise" />
                                                    </IconButton>
                                                  </td>
                                                </tr>
                                              ))}
                                              <tr>
                                                <td colSpan={circuitColumnSpan} className="text-center py-4">
                                                  <button
                                                    className="btn circuitAddExerciseBtn"
                                                    onClick={() => AddExerciseToCircuit(j, i)}
                                                  >
                                                    <AddIcon /> Añadir ejercicio al circuito
                                                  </button>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  );
                                }


                              })}
                               
                              </React.Fragment>

                                      {/* Fila para añadir ejercicio al bloque */}
                                      <tr>
                                        <td
                                          colSpan={desktopColumnSpan}
                                          className="text-center rounded-bottom-3 dayEditTrainingBlockFooter"
                                          style={{ '--block-accent': exercise.color || '#2563eb' }}
                                        >
                                          <button
                                            className="btn dayEditTrainingBlockAddBtn mx-2"
                                            onClick={() => addExerciseToBlock(i)}
                                          >
                                            <AddIcon /> Añadir ejercicio al bloque
                                          </button>

                                          <button
                                            className="btn dayEditTrainingBlockAddBtn mx-2"
                                            onClick={() => AddNewCircuit(i)}
                                          >
                                            <AddIcon /> Añadir circuito al bloque
                                          </button>

                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment>
                                                  {/* Cabecera del grupo, la dibuja el primer miembro. En una tabla no se
                                                      pueden envolver filas en un contenedor, asi que el grupo se arma con
                                                      una fila de titulo mas bordes laterales en cada miembro. */}
                                                  {supersetInfoByIndex[i]?.esPrimero && (
                                                    <tr className="dayEditSupersetHeaderRow">
                                                      <td colSpan={desktopColumnSpan}>
                                                        <span className="dayEditSupersetHeaderInner">
                                                          <Zap size={13} aria-hidden="true" />
                                                          Superserie
                                                          <em>{supersetInfoByIndex[i].sufijos.map((x) => `${supersetInfoByIndex[i].base}-${x}`).join(" + ")}</em>
                                                          {renderSupersetTools(i)}
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  )}
                                                  <tr 
                                                    ref={providedDrag.innerRef}
                                                    {...providedDrag.draggableProps}
                                                    className={[
                                                      "GeneralTrExercises",
                                                      exercise.type === "exercise" ? "dayEditNormalExerciseRow" : "dayEditRootCircuitRow",
                                                      supersetInfoByIndex[i]?.esMiembro ? "isSupersetMember" : "",
                                                      supersetInfoByIndex[i]?.esPrimero ? "isSupersetFirst" : "",
                                                      supersetInfoByIndex[i]?.esUltimo ? "isSupersetLast" : "",
                                                      // Con las notas abiertas la fila no dibuja su borde
                                                      // inferior: las notas son parte de ESTE ejercicio y la
                                                      // linea solo separa un ejercicio del siguiente.
                                                      exercise.type === "exercise"
                                                        && isNotesOpenFor(exercise.notas, exercise.exercise_id)
                                                        ? "hasOpenNotes" : "",
                                                    ].filter(Boolean).join(" ")}
                                                  >
                                                    {exercise.type === "exercise" && (
                                                    <td className="dayEditCellDrag">
                                                      <div className="d-flex justify-content-center">
                                                        <IconButton
                                                          {...providedDrag.dragHandleProps}
                                                          size="small"
                                                          className="dayEditCompactIconButton"
                                                        >
                                                          <DragIndicatorIcon />
                                                        </IconButton>
                                                      </div>
                                                    </td>
                                                    )}
                                                    {exercise.type === "exercise" && (
                                                    <td className="dayEditCellOrder">
                                                      <div className="dayEditExerciseNumberStack">
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
                                                          placeholder="Seleccionar número"
                                                          optionLabel="label"
                                                          className="p-dropdown-group w-100 dayEditOrderDropdown"
                                                        />
                                                        <div className="dayEditExerciseStateDots" aria-label="Estado de aproximaciones y back off">
                                                          <Tooltip title={hasApproximation(exercise) ? "Tiene aproximaciones" : "No tiene aproximaciones"} enterDelay={0} leaveDelay={0}>
                                                            <span className={`dayEditExerciseStateDot ${hasApproximation(exercise) ? "is-loaded" : ""}`} />
                                                          </Tooltip>
                                                          <Tooltip title={hasBackoff(exercise) ? "Tiene back off" : "No tiene back off"} enterDelay={0} leaveDelay={0}>
                                                            <span className={`dayEditExerciseStateDot ${hasBackoff(exercise) ? "is-loaded" : ""}`} />
                                                          </Tooltip>
                                                        </div>
                                                      </div>
                                                    </td>
                                                    )}
                                                    {exercise.type === "exercise" ? (
                                                      <>
                                                        {isColumnVisible("name") && (
                                                        <td className="dayEditExerciseNameColumn">
                                                        <div className="dayEditExerciseNameCell">
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
                                                          <div className="dayEditExerciseHoverTools">
                                                            <button className="btn colorAproximations py-0 m-0"
                                                                      onClick={e => handleOpenApprox(e, i)}>
                                                              <AddIcon className="iconsAproximations" /> <span>Aproximaciones</span>
                                                            </button>
                                                            <button
                                                              className="btn colorBackOff py-0 ps-1 m-0 text-start"
                                                              onClick={(e) => handleOpenBackoffOverlay(e, i)}
                                                            >
                                                              <AddIcon className="iconsAproximations" /> <span>Back off</span>
                                                            </button>
                                                          </div>
                                                        </div>
                                                        </td>
                                                        )}
                                                        {isColumnVisible("sets") && (
                                                        <td className="dayEditMetricCell dayEditMetricCellSets">
                                                          <div className="dayEditMetricControl">
                                                            {customInputEditDay(exercise.sets, i, "sets")}
                                                          </div>
                                                        </td>
                                                        )}
                                                        {isColumnVisible("reps") && (
                                                        <td className="dayEditMetricCell dayEditMetricCellReps">
                                                          <div className="dayEditMetricControl marginRepsNew">
                                                            {customInputEditDay(
                                                              exercise.reps,
                                                              i,
                                                              "reps"
                                                            )}
                                                          </div>
                                                        </td>
                                                        )}
                                                        {isColumnVisible("peso") && (
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.peso,
                                                            i,
                                                            "peso"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rpeRir") && (
                                                        <td className="dayEditStudentCompactTd">
                                                          {customInputEditDay(
                                                            exercise.athleteRpeRir ?? exercise.rpeRir,
                                                            i,
                                                            "rpeRir"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rest") && (
                                                        <td className="dayEditRestCompactCell">
                                                          <span className="dayEditRestCompactLabel">Rest</span>
                                                          {customInputEditDay(
                                                            exercise.rest,
                                                            i,
                                                            "rest"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("video") && (
                                                        <td className="dayEditVideoCompactTd">
                                                          {customInputEditDay(
                                                            exercise.video,
                                                            i,
                                                            "video"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("notas") && (
                                                        <td className="dayEditNotesHoverTd">
                                                          <div className={`dayEditNotesHoverCell ${exercise.notas ? "has-notes" : ""} ${isNotesOpenFor(exercise.notas, exercise.exercise_id) ? "is-open" : ""}`}>
                                                            <button
                                                              type="button"
                                                              className="dayEditNotesHoverTrigger"
                                                              aria-label="Ver o editar notas"
                                                              onClick={(event) => {
                                                                event.stopPropagation();
                                                                setOpenExerciseNotesKey((current) => current === exercise.exercise_id ? null : exercise.exercise_id);
                                                              }}
                                                            >
                                                              <MessageSquare size={15} />
                                                            </button>
                                                          </div>
                                                        </td>
                                                        )}
                                                        <td className="dayEditDeleteCompactTd">
                                                          <div className="row justify-content-center">
                                                            <IconButton
                                                              aria-label="delete-exercise"
                                                              className="col-12"
                                                              onClick={() => handleDeleteClick(exercise)}
                                                            >
                                                              <CancelIcon className="colorIconDeleteExercise" />
                                                            </IconButton>
                                                          </div>
                                                        </td>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <td colSpan={desktopColumnSpan} className="dayEditRootCircuitCell">
                                                          <table className="table text-center align-middle dayEditCircuitNestedTable">
                                                            <colgroup>
                                                              <col className="dayEditCircuitColIndex" />
                                                              {visibleCircuitColumns.map((column) => (
                                                                <col
                                                                  key={column.id}
                                                                  className={DAY_EDIT_CIRCUIT_COLUMN_CLASS[column.id]}
                                                                  style={{ width: `${columnConfig[column.id]?.width || column.defaultWidth}px` }}
                                                                />
                                                              ))}
                                                              <col className="dayEditCircuitColDelete" />
                                                            </colgroup>
                                                            <thead>
                                                              <tr>

                                                                <td colSpan={Math.max(1, circuitColumnSpan - 1)} className="text-start">
                                                               <CircuitHeaderEditor
                                                                  circuit={exercise}
                                                                  onField={(field, value) => changeCircuitData(i, field, value)}
                                                                  numberValue={exercise.numberExercise}
                                                                  numberOptions={options}
                                                                  onNumberChange={(v) => changeCircuitData(i, 'numberExercise', v)}
                                                                  dragHandleProps={providedDrag.dragHandleProps}
                                                                />
                                                                </td>
                                                                <td className="dayEditCircuitDeleteCell">
                                                                  <IconButton
                                                                    aria-label="delete"
                                                                    onClick={() => handleDeleteMainCircuitClick(i, exercise)}

                                                                  >
                                                                    <CancelIcon className="colorIconDeleteExercise" />
                                                                  </IconButton>
                                                                </td>
                                                              </tr>

                                                              <tr >
                                                                <th>#</th>
                                                                {visibleCircuitColumns.map((column) => (
                                                                  <th key={column.id}>{column.label}</th>
                                                                ))}
                                                                <th></th>
                                                              </tr>
                                                            </thead>
                                                            <tbody>
                                                              {exercise.circuit.map((circuitExercise, j) => (
                                                                <tr key={circuitExercise.idRefresh}>
                                                                  <td className="dayEditCircuitIndexCell">
                                                                    <span>{j + 1}</span>
                                                                  </td>
                                                                  {isColumnVisible("name") && (
                                                                  <td className="text-start" >
                                                                    {customInputEditExerciseInCircuit(circuitExercise.name, i, j, 'name')}
                                                                  </td>
                                                                  )}
                                                                  {isColumnVisible("reps") && (
                                                                  <td className="text-center td-3" >
                                                                    <div className="marginRepsNew">
                                                                    {customInputEditExerciseInCircuit(circuitExercise.reps, i, j, 'reps')}
                                                                    </div>
                                                                  </td>
                                                                  )}
                                                                  {isColumnVisible("peso") && (
                                                                  <td className="text-center" >
                                                                    {customInputEditExerciseInCircuit(circuitExercise.peso, i, j, 'peso')}
                                                                  </td>
                                                                  )}
                                                                  {isColumnVisible("video") && (
                                                                  <td className="text-center">
                                                                    {customInputEditExerciseInCircuit(circuitExercise.video, i, j, 'video')}
                                                                  </td>
                                                                  )}
                                                                  <td className="dayEditCircuitDeleteCell">
                                                                    <IconButton
                                                                      aria-label="delete-circuit-exercise"
                                                                      className="col-12"
                                                                      onClick={() => handleDeleteExerciseInCircuit(null, i, j, circuitExercise.name)}
                                                                    >
                                                                      <CancelIcon className="colorIconDeleteExercise" />
                                                                    </IconButton>
                                                                  </td>
                                                                </tr>
                                                              ))}
                                                              <tr>
                                                                <td colSpan={circuitColumnSpan} className="dayEditCircuitAddExerciseCell">
                                                                  <button
                                                                    aria-label="video"
                                                                    className="btn circuitAddExerciseBtn"
                                                                    onClick={() => AddExerciseToCircuit(i)}
                                                                  >
                                                                    <AddIcon />
                                                                    <span className=" me-1">Añadir ejercicio al circuito</span>
                                                                  </button>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          
                                                          </table>
                                                        </td>
                                                      </>
                                                    )}
                                                  </tr>
                                                  {exercise.type === "exercise" && isNotesOpenFor(exercise.notas, exercise.exercise_id) && (
                                                    <tr className="dayEditInlineNotesRow">
                                                      {/* Una sola celda a TODO el ancho: antes eran tres tds (dos vacios
                                                          a los costados) y el campo quedaba corto y descentrado. */}
                                                      <td colSpan={desktopColumnSpan} className="dayEditInlineNotesCell">
                                                        <span className="dayEditInlineNotesTitle">Notas</span>
                                                        {customInputEditDay(exercise.notas, i, "notas")}
                                                      </td>
                                                    </tr>
                                                  )}
                                    </React.Fragment>
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
            <div className="floating-button-mobile">
              <div className="unsavedChangesCard">
                <div className="unsavedChangesCopy">
                  <div className="unsavedChangesTitleRow">
                    <span className="unsavedChangesIndicator" />
                    <span className="unsavedChangesTitle">Cambios sin guardar</span>
                  </div>
                  <span className="unsavedChangesSubtitle">
                    Hay ediciones pendientes en este dia.
                  </span>
                </div>
                <div className="unsavedChangesActions">
                  <button
                    className="unsavedChangesBtn unsavedChangesBtnSecondary"
                    onClick={() => confirmCancel()}
                  >
                    <X size={16} />
                    <span>Cancelar</span>
                  </button>
                  <button
                    className="unsavedChangesBtn unsavedChangesBtnPrimary"
                    onClick={() => applyChanges()}
                  >
                    <Save size={16} />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {firstWidth < 992 && (
            <>
            <nav className="fixed-bottom dayEditMobileBar footerColor" aria-label="Acciones del día">
              {/* Las dos acciones frecuentes quedan al alcance del pulgar; el resto
                  vive en el menu "..." para no llenar la pantalla de botones. */}
              <button
                type="button"
                onClick={() => AddNewExercise()}
                className="dayEditMobileBarBtn"
              >
                <Dumbbell size={21} />
                <span className="dayEditMobileBarLabel">Ejercicio</span>
              </button>

              <button
                type="button"
                onClick={() => AddNewCircuit()}
                className="dayEditMobileBarBtn"
              >
                <Repeat size={21} />
                <span className="dayEditMobileBarLabel">Circuito</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMobileActionsMenu(true)}
                className={`dayEditMobileBarBtn${showMobileActionsMenu ? ' is-active' : ''}`}
                aria-haspopup="dialog"
                aria-expanded={showMobileActionsMenu}
              >
                <MoreHorizontal size={21} />
                <span className="dayEditMobileBarLabel">Mas</span>
              </button>
            </nav>

            {/* Menu "Mas": SOLO contenido y vista.
                Las acciones del dia (crear / editar / reordenar / copiar / pegar /
                eliminar) viven en la hilera de iconos que esta arriba del cartel
                "Estás en: Día X"; tenerlas tambien aca era dos caminos para lo
                mismo. Estas si van con etiqueta: son menos frecuentes y menos
                obvias de reconocer por el icono solo. */}
            {showMobileActionsMenu && (
              <div
                className="dayEditMobileSheetBackdrop"
                role="presentation"
                onClick={() => setShowMobileActionsMenu(false)}
              >
                <div
                  className="dayEditMobileSheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Más acciones"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="dayEditMobileSheetHeader">
                    <strong>Más acciones</strong>
                    <button
                      type="button"
                      onClick={() => setShowMobileActionsMenu(false)}
                      aria-label="Cerrar"
                    >
                      <CloseIcon size={18} />
                    </button>
                  </div>

                  {(() => {
                    // Cerramos el menu al disparar la accion: si no, tapa el
                    // resultado de lo que acaba de hacer el entrenador.
                    const run = (fn) => () => { setShowMobileActionsMenu(false); fn(); };
                    const groups = [
                      {
                        title: 'Contenido',
                        items: [
                          { icon: <BadgePlus size={17} />, label: 'Agregar bloque', onClick: run(AddBlock) },
                          { icon: <LibraryAddIcon fontSize="small" />, label: 'Sumar 1 serie a todos', onClick: run(incrementAllSeries) },
                          { icon: <PlusOneOutlined fontSize="small" />, label: 'Sumar 1 rep a todos', onClick: run(incrementAllReps) },
                          {
                            icon: <Move size={17} />,
                            label: isMobileReorderMode ? 'Listo de reordenar' : 'Reordenar ejercicios',
                            onClick: run(() => setIsMobileReorderMode((prev) => !prev)),
                            active: isMobileReorderMode,
                          },
                        ],
                      },
                      {
                        title: 'Vista',
                        items: [
                          { icon: <Eye size={17} />, label: 'Vista alumno', onClick: run(() => setShowStudentPreviewDialog(true)) },
                          { icon: <RotateCcw size={17} />, label: 'Semanas anteriores', onClick: run(() => setDialogAllWeeks(true)) },
                          /* "Columnas" no esta: en el telefono la tabla no
                             muestra columnas configurables, asi que el dialogo
                             no cambiaba nada de lo que se ve. */
                        ],
                      },
                      {
                        /* Los ajustes del editor -series y reps por defecto,
                           densidad, confirmaciones- solo se podian abrir desde
                           la barra de escritorio y en el telefono no habia
                           ninguna forma de llegar. */
                        title: 'Preferencias',
                        items: [
                          { icon: <SlidersHorizontal size={17} />, label: 'Ajustes del editor', onClick: run(() => setShowDayEditSettingsDialog(true)) },
                        ],
                      },
                    ];

                    return groups.map((group) => (
                      <div className="dayEditMobileSheetGroup" key={group.title}>
                        <span className="dayEditMobileSheetGroupTitle">{group.title}</span>
                        {group.items.map((item) => (
                          <button
                            type="button"
                            key={item.label}
                            className={`dayEditMobileSheetItem${item.active ? ' isActive' : ''}`}
                            onClick={item.onClick}
                            disabled={item.disabled}
                          >
                            <span className="dayEditMobileSheetItemIcon">{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
            </>
          )}



          {/* Ajustamos estilos de dialog para que se desplacen segun collapsed */}
          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><Eye size={18} /></span>
                <div>
                  <strong>Ver como alumno</strong>
                  <span>Vista previa del día</span>
                </div>
              </div>
            }
            className={`coachModalDialog dayEditStudentPreviewDialog dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showStudentPreviewDialog}
            style={{ width: firstWidth > 992 ? "440px" : "94vw" }}
            modal
            draggable={false}
            resizable={false}
            onHide={() => setShowStudentPreviewDialog(false)}
          >
            <div className="dayEditStudentPreviewIntro">
              Asi lo ve tu alumno. Esto te puede servir para guiarlo, o para entender alguna pregunta que te haga.
            </div>
            {studentPreviewDays.length > 1 && (
              <label className="dayEditStudentPreviewDayPicker">
                <span>Día a previsualizar</span>
                <select
                  value={studentPreviewDayId}
                  onChange={(event) => {
                    setStudentPreviewDayId(event.target.value);
                    setStudentPreviewAuxSlide({});
                  }}
                >
                  {studentPreviewDays.map((dayItem, dayIndex) => (
                    <option key={getStudentPreviewDayKey(dayItem, dayIndex)} value={getStudentPreviewDayKey(dayItem, dayIndex)}>
                      {sanitizeBrokenText(dayItem?.name || `Día ${dayIndex + 1}`)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className={`dayEditStudentPreviewPhone ddp ${dayEditEditorTheme === "dark" ? "ddp-dark" : "ddp-light"}`}>
              <div className="dayEditStudentPreviewDayTitle">
                {sanitizeBrokenText(studentPreviewDay?.name || "Día sin nombre")}
              </div>
              {renderStudentPreviewAuxList("Activación / movilidad", studentPreviewDay?.movility)}
              {renderStudentPreviewAuxList("Entrada en calor", studentPreviewDay?.warmup)}
              <h2 className="p-2 mb-0 text-start">Rutina del día</h2>
              <div className="dayEditStudentPreviewList">
                {groupStudentPreviewSupersets(Array.isArray(studentPreviewDay?.exercises) ? studentPreviewDay.exercises : []).map((item, index) =>
                  renderStudentPreviewItem(item, index)
                )}
                {!Array.isArray(studentPreviewDay?.exercises) || studentPreviewDay.exercises.length === 0 ? (
                  <div className="dayEditStudentPreviewEmpty">Este día no tiene ejercicios cargados.</div>
                ) : null}
              </div>
            </div>
          </Dialog>

          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><SlidersHorizontal size={18} /></span>
                <div>
                  <strong>Columnas del planificador</strong>
                  <span>Elegí que ver y el ancho de cada una</span>
                </div>
              </div>
            }
            className={`coachModalDialog dayEditColumnDialog dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showColumnConfigDialog}
            style={{ width: firstWidth > 992 ? "520px" : "92vw" }}
            modal
            onHide={() => setShowColumnConfigDialog(false)}
          >
            <div className="dayEditColumnConfigIntro">
              Elegi que columnas usar y ajusta el ancho de la tabla de escritorio.
            </div>
            <div className="dayEditColumnConfigList">
              {DAY_EDIT_COLUMNS.map((column) => {
                const current = columnConfig[column.id] || DAY_EDIT_COLUMN_DEFAULTS[column.id];
                return (
                  <div className="dayEditColumnConfigRow" key={column.id}>
                    <label className="dayEditColumnToggle">
                      <input
                        type="checkbox"
                        checked={Boolean(current.visible)}
                        onChange={(event) => setColumnVisible(column.id, event.target.checked)}
                      />
                      <span>{column.label}</span>
                    </label>
                    <div className="dayEditColumnWidthControl">
                      <input
                        type="range"
                        min={column.minWidth}
                        max={column.maxWidth}
                        step="4"
                        value={current.width}
                        disabled={!current.visible}
                        onChange={(event) => setColumnWidth(column.id, event.target.value)}
                      />
                      <input
                        type="number"
                        min={column.minWidth}
                        max={column.maxWidth}
                        value={current.width}
                        disabled={!current.visible}
                        onChange={(event) => setColumnWidth(column.id, event.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="dayEditColumnDialogActions">
              <button
                type="button"
                className="coachDialogBtn coachDialogBtnSecondary"
                onClick={resetColumnConfig}
              >
                Restablecer
              </button>
              <button
                type="button"
                className="coachDialogBtn coachDialogBtnPrimary"
                onClick={() => setShowColumnConfigDialog(false)}
              >
                Listo
              </button>
            </div>
          </Dialog>

          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><Settings size={18} /></span>
                <div>
                  <strong>Ajustes del editor</strong>
                  <span>Personaliza tu experiencia de trabajo</span>
                </div>
              </div>
            }
            className={`coachModalDialog dayEditSettingsDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showDayEditSettingsDialog}
            style={{ width: firstWidth > 992 ? "680px" : "94vw" }}
            modal
            onHide={() => setShowDayEditSettingsDialog(false)}
          >
            <div className="dayEditSettingsIntro">
              <strong>Estos ajustes son para personalizar tu experiencia.</strong>
              <span>Los cambios estructurales se verán reflejados en nuevas creaciones, no en las existentes.</span>
            </div>
            <div className="dayEditSettingsList">
              <section className="dayEditSettingsSection">
                <div className="dayEditSettingsSectionHead">
                  <span>Visualización</span>
                  <strong>Como querés ver el editor</strong>
                </div>
                <div className="dayEditSettingsRow">
                  <div>
                    <strong>Notas de ejercicios</strong>
                    <span>Elegi si los campos de notas aparecen visibles por defecto. "Con texto" abre solo las que ya tienen algo escrito.</span>
                  </div>
                  <div className="dayEditSettingsSegmented dayEditSettingsSegmentedThree" role="group" aria-label="Visualización de notas">
                    <button type="button" className={notesVisibility === "closed" ? "is-active" : ""} onClick={() => setNotesVisibility("closed")}>
                      Cerradas
                    </button>
                    <button type="button" className={notesVisibility === "with-content" ? "is-active" : ""} onClick={() => setNotesVisibility("with-content")}>
                      Con texto
                    </button>
                    <button type="button" className={notesVisibility === "open" ? "is-active" : ""} onClick={() => setNotesVisibility("open")}>
                      Abiertas
                    </button>
                  </div>
                </div>
                <div className="dayEditSettingsRow">
                  <div>
                    <strong>Aproximaciones y back off</strong>
                    <span>Define si esas herramientas se ven al pasar el mouse, siempre o nunca.</span>
                  </div>
                  <div className="dayEditSettingsSegmented dayEditSettingsSegmentedThree" role="group" aria-label="Visualización de aproximaciones y back off">
                    <button type="button" className={approxBackoffVisibility === "hover" ? "is-active" : ""} onClick={() => setApproxBackoffVisibility("hover")}>
                      Hover
                    </button>
                    <button type="button" className={approxBackoffVisibility === "always" ? "is-active" : ""} onClick={() => setApproxBackoffVisibility("always")}>
                      Siempre
                    </button>
                    <button type="button" className={approxBackoffVisibility === "hidden" ? "is-active" : ""} onClick={() => setApproxBackoffVisibility("hidden")}>
                      Oculto
                    </button>
                  </div>
                </div>
                <div className="dayEditSettingsRow">
                  <div>
                    <strong>Densidad visual</strong>
                    <span>Compacto muestra más ejercicios en pantalla. Cómodo agrega más aire.</span>
                  </div>
                  <div className="dayEditSettingsSegmented" role="group" aria-label="Densidad visual">
                    <button type="button" className={editorDensity === "compact" ? "is-active" : ""} onClick={() => setEditorDensity("compact")}>
                      Compacto
                    </button>
                    <button type="button" className={editorDensity === "comfortable" ? "is-active" : ""} onClick={() => setEditorDensity("comfortable")}>
                      Comodo
                    </button>
                  </div>
                </div>
              </section>

              <section className="dayEditSettingsSection">
                <div className="dayEditSettingsSectionHead">
                  <span>Nuevas creaciones</span>
                  <strong>Valores por defecto</strong>
                </div>
                <div className="dayEditSettingsGrid">
                  <label className="dayEditSettingsField">
                    <span>Series</span>
                    <input type="text" value={defaultSetsValue} onChange={(event) => setDefaultSetsValue(event.target.value)} placeholder="1" />
                  </label>
                  <label className="dayEditSettingsField">
                    <span>Reps</span>
                    <input type="text" value={defaultRepsValue} onChange={(event) => setDefaultRepsValue(event.target.value)} placeholder="1" />
                  </label>
                  <label className="dayEditSettingsField">
                    <span>Peso</span>
                    <input type="text" value={defaultPesoValue} onChange={(event) => setDefaultPesoValue(event.target.value)} placeholder="Vacío" />
                  </label>
                  <div className="dayEditSettingsField">
                    <span>Rest</span>
                    <div className="dayEditDefaultRestControl dayEditRestCompactCell">
                      <RestInputDropdown value={defaultRestValue} onChange={setDefaultRestValue} />
                      <button type="button" onClick={() => setDefaultRestValue("")}>Limpiar</button>
                    </div>
                  </div>
                </div>
                <div className="dayEditSettingsRow">
                  <div>
                    <strong>Modo reps por defecto</strong>
                    <span>Define como nace el campo reps en ejercicios nuevos.</span>
                  </div>
                  <div className="dayEditSettingsSegmented dayEditSettingsSegmentedThree" role="group" aria-label="Modo reps por defecto">
                    <button type="button" className={defaultRepsMode === "numeric" ? "is-active" : ""} onClick={() => setDefaultRepsMode("numeric")}>
                      Numero
                    </button>
                    <button type="button" className={defaultRepsMode === "text" ? "is-active" : ""} onClick={() => setDefaultRepsMode("text")}>
                      Texto
                    </button>
                    <button type="button" className={defaultRepsMode === "multiple" ? "is-active" : ""} onClick={() => setDefaultRepsMode("multiple")}>
                      Multiple
                    </button>
                  </div>
                </div>
              </section>

              <section className="dayEditSettingsSection">
                <div className="dayEditSettingsSectionHead">
                  <span>Seguridad</span>
                  <strong>Acciones sensibles</strong>
                </div>
                <div className="dayEditSettingsRow">
                  <div>
                    <strong>Confirmar antes de eliminar</strong>
                    <span>Si lo desactivas, borrar ejercicios será inmediato.</span>
                  </div>
                  <div className="dayEditSettingsSegmented" role="group" aria-label="Confirmar antes de eliminar">
                    <button type="button" className={confirmBeforeDelete ? "is-active" : ""} onClick={() => setConfirmBeforeDelete(true)}>
                      Si
                    </button>
                    <button type="button" className={!confirmBeforeDelete ? "is-active" : ""} onClick={() => setConfirmBeforeDelete(false)}>
                      No
                    </button>
                  </div>
                </div>
              </section>
            </div>
            <div className="dayEditColumnDialogActions">
              <button
                type="button"
                className="coachDialogBtn coachDialogBtnPrimary"
                onClick={() => setShowDayEditSettingsDialog(false)}
              >
                Listo
              </button>
            </div>
          </Dialog>

          <ConfirmDialog
            visible={showDeleteDayDialog}
            onHide={() => setShowDeleteDayDialog(false)}
            message="Querés eliminar este día? Podés cancelar después y revertir esta acción."
            header="Eliminar día"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Si"
            rejectLabel="No"
            accept={() => {
              confirmDeleteDay();
              setShowDeleteDayDialog(false);
            }}
            className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            reject={() => setShowDeleteDayDialog(false)}
          />

          <ConfirmDialog
            visible={showCancelDialog}
            onHide={() => setShowCancelDialog(false)}
            message="Estás seguro de que deseas cancelar los cambios? Se perderan todos los cambios no guardados."
            header="Confirmación"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Si"
            rejectLabel="No"
            accept={() => handleCancel()}
            reject={() => setShowCancelDialog(false)}
            className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon coachDialogHeaderIconDanger"><Trash2 size={18} /></span>
                <div>
                  <strong>Eliminar ejercicio</strong>
                  <span>Esta acción no se puede deshacer</span>
                </div>
              </div>
            }
            className={`coachModalDialog dialogDeleteExercise dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showDeleteDialog}
            style={{
              width: `${firstWidth > 992 ? "50vw" : "80vw"}`
            }}
            footer={
              <div className="row justify-content-center ">
                <div className="col-lg-12 me-3">
                  <button
                    className="coachDialogBtn coachDialogBtnSecondary"
                    onClick={handleDeleteCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    className="coachDialogBtn coachDialogBtnDanger"
                    onClick={handleDeleteConfirm}
                  >
                    Si, eliminar
                  </button>
                </div>
              </div>
            }
            onHide={handleDeleteCancel}
          >
            <p className="p-4 mb-0 coachDialogMessage">
              Cuidado, estas por eliminar <b>"{exerciseToDelete?.name}"</b>. Queres continuar?
            </p>
          </Dialog>

<Dialog
    className={`coachModalDialog dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
    header={
      <div className="coachDialogHeader">
        <span className="coachDialogHeaderIcon"><TrendingUp size={18} /></span>
        <div>
          <strong>Semanas anteriores</strong>
          <span>Compara el progreso contra la semana actual</span>
        </div>
      </div>
    }
    visible={dialogAllWeeks}
    style={{ width: "min(1200px, 96vw)" }}
    onHide={() => setDialogAllWeeks(false)}
    draggable={false}
    resizable={false}
  >
    <div className="small text-muted mb-2">
      La comparacion siempre toma como referencia la semana actual.
    </div>

    <div className="d-flex align-items-center gap-2 overflow-auto pb-2 mb-3" style={{ whiteSpace: "nowrap" }}>
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        disabled
        title="Semana actual"
      >
        {currentWeekDisplayName} <span className="badge text-bg-light ms-2">Semana actual</span>
      </button>

      {compareWeeksWithMeta.map((weekItem, idx) => {
        const weekId = String(weekItem?._id || "");
        const isComparable = weekItem?.__isComparable !== false;
        const isSelected = isComparable && String(selectedCompareWeekId) === weekId;
        const dateLabel = getCompareWeekDateLabel(weekItem);
        return (
          <button
            key={weekId || `compare-week-${idx}`}
            type="button"
            className={`btn btn-sm text-start ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => {
              if (!isComparable) return;
              setSelectedCompareWeekId(weekId);
            }}
            aria-disabled={!isComparable}
            title={
              isComparable
                ? ""
                : "No se puede comparar debido a que tiene ejercicios diferentes."
            }
            style={
              isComparable
                ? undefined
                : {
                    opacity: 0.7,
                    cursor: "not-allowed",
                    borderStyle: "dashed",
                    borderColor: "#dc3545"
                  }
            }
          >
            <div className="d-flex align-items-center justify-content-between gap-2">
              <span className="fw-semibold">
                {toText(weekItem?.name) || `Semana ${idx + 1}`}
              </span>
              {!isComparable ? (
                <span className="badge text-bg-danger">No comparable</span>
              ) : null}
            </div>
            {dateLabel ? (
              <div className={isSelected ? "small text-white-50" : "small text-muted"}>
                {dateLabel}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>

    <ExerciseComparisonChart
      currentWeek={currentWeekForComparison}
      previousWeek={selectedCompareWeek}
      isDark={dayEditEditorTheme === "dark"}
    />
  </Dialog>
          <Dialog
            className={`coachModalDialog coachRoutineAuxDialog dayEditAuxRoutineDialog dayEditEditorTheme-${dayEditEditorTheme} col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><Flame size={18} /></span>
                <div>
                  <strong>Bloque de entrada en calor</strong>
                  <span>{sanitizeBrokenText(currentDay && currentDay.name)}</span>
                </div>
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
              editorTheme={dayEditEditorTheme}
            notesVisibility={notesVisibility}
            />
          </Dialog>

          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><Pencil size={18} /></span>
                <div>
                  <strong>Editar nombre del día</strong>
                  <span>Elegí como se va a llamar este día</span>
                </div>
              </div>
            }
            visible={isEditingName}
            className={`coachModalDialog dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            style={{
              ...(firstWidth > 992 ? { width: "35vw" } : { width: "75vw" })
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
                <button
                  className="coachDialogBtn coachDialogBtnSecondary mx-2 mt-2"
                  onClick={() => setIsEditingName(false)}
                >
                  Cancelar
                </button>
                <button className="coachDialogBtn coachDialogBtnPrimary mx-2 mt-2" onClick={saveNewDayName}>
                  Confirmar
                </button>
              </div>
            </div>
          </Dialog>

          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><Pencil size={18} /></span>
                <div>
                  <strong>Editar nombre de la semana</strong>
                  <span>Elegí como se va a llamar esta semana</span>
                </div>
              </div>
            }
            visible={isEditingWeekName}
            className={`coachModalDialog dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            style={{
              ...(firstWidth > 992 ? { width: "35vw" } : { width: "75vw" })
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
                  className="coachDialogBtn coachDialogBtnSecondary mx-2 mt-2"
                  onClick={closeEditWeekNameDialog}
                >
                  Cancelar
                </button>
                <button className="coachDialogBtn coachDialogBtnPrimary mx-2 mt-2" onClick={saveNewWeekName}>
                  Confirmar
                </button>
              </div>
            </div>
          </Dialog>

          <Dialog
            header={
              <div className="coachDialogHeader">
                <span className="coachDialogHeaderIcon"><ArrowUpDown size={18} /></span>
                <div>
                  <strong>Reordenar días</strong>
                  <span>Arrastra para cambiar el orden</span>
                </div>
              </div>
            }
            visible={showReorderDaysDialog}
            className={`coachModalDialog dayEditUtilityDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            style={{
              ...(firstWidth > 992 ? { width: "35vw" } : { width: "85vw" })
            }}
            onHide={closeReorderDaysDialog}
          >
            <p className="small mb-3 coachDialogMessage">Arrastra cada día para cambiar el orden de la semana.</p>

            <DragDropContext onDragEnd={handleDayOrderDragEnd}>
              <Droppable droppableId="reorder-days-list">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="list-group"
                  >
                    {(draftDaysOrder || []).map((d, idx) => (
                      <Draggable
                        key={`reorder-day-${String(d?._id || idx)}`}
                        draggableId={`reorder-day-${String(d?._id || idx)}`}
                        index={idx}
                      >
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`list-group-item d-flex align-items-center justify-content-between ${snapshot.isDragging ? "bg-light" : ""}`}
                          >
                            <div className="d-flex align-items-center">
                              <span
                                {...dragProvided.dragHandleProps}
                                className="me-2 stylePointer"
                                aria-label="drag-day"
                              >
                                <DragIndicatorIcon fontSize="small" />
                              </span>
                              <span>{sanitizeBrokenText(d?.name || `Día ${idx + 1}`)}</span>
                            </div>
                            {/* "Posicion N" en vez de un numero suelto: aclara que el badge
                                indica el orden en la semana, no el nombre del dia. */}
                            <span className="badge bg-secondary dayEditReorderPositionBadge">Posicion {idx + 1}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="text-end mt-3">
              <button
                className="coachDialogBtn coachDialogBtnSecondary mx-2"
                onClick={closeReorderDaysDialog}
              >
                Cancelar
              </button>
              <button
                className="coachDialogBtn coachDialogBtnPrimary mx-2"
                onClick={applyDayOrder}
              >
                Aplicar
              </button>
            </div>
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
                            />)}

<Dialog
  className={`coachModalDialog coachRoutineAuxDialog dayEditAuxRoutineDialog dayEditEditorTheme-${dayEditEditorTheme} col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}
  blockScroll={window.innerWidth > 600 ? false : true}
  header={
    <div className="coachDialogHeader">
      <span className="coachDialogHeaderIcon"><Move size={18} /></span>
      <div>
        <strong>Bloque de activación / movilidad</strong>
        <span>{sanitizeBrokenText(currentDay && currentDay.name)}</span>
      </div>
    </div>
  }
  visible={movilityVisible}
  modal={false}
  onHide={() => { setIsEditing(true); setMovilityVisible(false); }}
>
          <ModalCreateMovility
            week={modifiedDay}
            week_id={week_id}
            day_id={currentDay && currentDay._id}
            editAndClose={editAndClose}
            editorTheme={dayEditEditorTheme}
            notesVisibility={notesVisibility}
          />
        </Dialog>

      <OverlayPanel ref={backoffOverlayRef} className={`dayEditDarkOverlayPanel dayEditEditorTheme-${dayEditEditorTheme} ${firstWidth > 992 ? 'w-25' : 'w-75'}`}>
        {/* Mismo lenguaje que el resto del editor: encabezado, filas numeradas
            en tarjeta y los botones de siempre. Antes eran controles sueltos de
            Bootstrap y quedaba como una pantalla de otra epoca. */}
        <div className="dayEditSeriesOverlay">
          <div className="dayEditSeriesOverlayHead">
            <strong>Back off</strong>
            <span>Series de descarga después del trabajo principal.</span>
          </div>

          <label className="dayEditSeriesOverlayCheck" htmlFor="customTitleCheckbox">
            <input
              type="checkbox"
              id="customTitleCheckbox"
              checked={useCustomTitle}
              onChange={(e) => setUseCustomTitle(e.target.checked)}
            />
            <span>No es un back off. Personalizar el nombre de la sección.</span>
          </label>

          {useCustomTitle && (
            <div className="dayEditSeriesOverlayField">
              <label htmlFor="backoffTitleInput">Título personalizado</label>
              <input
                id="backoffTitleInput"
                type="text"
                className="dayEditSeriesOverlayInput"
                value={backoffTitleName}
                onChange={(e) => setBackoffTitleName(e.target.value)}
                placeholder="Ingresa el nombre"
              />
            </div>
          )}

          <div className="dayEditSeriesOverlayList">
            {backoffData.map((line, idx) => (
              <div key={idx} className="dayEditSeriesOverlayRow">
                <span className="dayEditSeriesOverlayRowNum">{idx + 1}</span>

                {["sets", "reps", "peso"].map((f) => (
                  <div key={f} className="dayEditSeriesOverlayField">
                    <label htmlFor={`backoff-${idx}-${f}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                    <input
                      id={`backoff-${idx}-${f}`}
                      type={f === "peso" || f === "reps" ? "text" : "number"}
                      className="dayEditSeriesOverlayInput"
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

                <button
                  type="button"
                  className="dayEditSeriesOverlayRemove"
                  aria-label={`Quitar el back off ${idx + 1}`}
                  onClick={() => removeBackoffLine(idx)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="dayEditSeriesOverlayAdd"
            onClick={() => setBackoffData([...backoffData, { sets: "", reps: "", peso: "" }])}
          >
            <Plus size={15} />
            <span>Añadir otro back off</span>
          </button>

          <div className="dayEditSeriesOverlayActions">
            <button
              type="button"
              className="coachDialogBtn coachDialogBtnSecondary"
              onClick={() => backoffOverlayRef.current.hide()}
            >
              Cerrar
            </button>
            <button type="button" className="coachDialogBtn coachDialogBtnPrimary" onClick={handleSaveBackoff}>
              Seguir editando
            </button>
          </div>
        </div>
      </OverlayPanel>

    <OverlayPanel ref={approxOverlayRef} className={`dayEditDarkOverlayPanel dayEditEditorTheme-${dayEditEditorTheme} ${ firstWidth > 992 ? 'w-25' : 'w-75' }`}>
      <div className="dayEditSeriesOverlay">
        <div className="dayEditSeriesOverlayHead">
          <strong>Aproximaciones</strong>
          <span>Series de entrada antes del trabajo principal.</span>
        </div>

        <div className="dayEditSeriesOverlayList">
          {approxData.map((line, idx) => (
            <div key={idx} className="dayEditSeriesOverlayRow">
              <span className="dayEditSeriesOverlayRowNum">{idx + 1}</span>

              <div className="dayEditSeriesOverlayField">
                <label htmlFor={`approx-${idx}-reps`}>Reps</label>
                <input
                  id={`approx-${idx}-reps`}
                  type="text"
                  className="dayEditSeriesOverlayInput"
                  value={line.reps}
                  onChange={(e) => {
                    const arr = [...approxData];
                    arr[idx].reps = e.target.value;
                    setApproxData(arr);
                    saveApproxInternally(arr);
                  }}
                />
              </div>

              <div className="dayEditSeriesOverlayField">
                <label htmlFor={`approx-${idx}-peso`}>Peso</label>
                <input
                  id={`approx-${idx}-peso`}
                  type="text"
                  className="dayEditSeriesOverlayInput"
                  value={line.peso}
                  onChange={(e) => {
                    const arr = [...approxData];
                    arr[idx].peso = e.target.value;
                    setApproxData(arr);
                    saveApproxInternally(arr);
                  }}
                />
              </div>

              <button
                type="button"
                className="dayEditSeriesOverlayRemove"
                aria-label={`Quitar la aproximación ${idx + 1}`}
                onClick={() => removeApproxLine(idx)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="dayEditSeriesOverlayAdd"
          onClick={() => setApproxData([...approxData, { reps: "", peso: "" }])}
        >
          <Plus size={15} />
          <span>Añadir otra aproximación</span>
        </button>

        <div className="dayEditSeriesOverlayActions">
          <button
            type="button"
            className="coachDialogBtn coachDialogBtnSecondary"
            onClick={() => approxOverlayRef.current.hide()}
          >
            Cerrar
          </button>
          <button type="button" className="coachDialogBtn coachDialogBtnPrimary" onClick={handleSaveApprox}>
            Seguir editando
          </button>
        </div>
      </div>
    </OverlayPanel>

    <ConfirmDialog
      visible={showDeleteCircuitDialog}
      onHide={() => setShowDeleteCircuitDialog(false)}
      message={`Estás seguro de que deseas eliminar el circuito "${circuitToDelete?.name}"?`}
      header="Eliminar circuito"
      icon="pi pi-exclamation-triangle"
      acceptLabel="Si"
      rejectLabel="No"
      accept={confirmDeleteCircuitInBlock}
      reject={() => setShowDeleteCircuitDialog(false)}
      className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
    />

      <ConfirmDialog
          visible={showDeleteExerciseInCircuitDialog}
          onHide={() => setShowDeleteExerciseInCircuitDialog(false)}
          message={`Estás seguro de que deseas eliminar el ejercicio "${exerciseToDeleteInCircuit?.exerciseName}"?`}
          header="Eliminar ejercicio"
          icon="pi pi-exclamation-triangle"
          acceptLabel="Si"
          rejectLabel="No"
          accept={confirmDeleteExerciseInCircuit}
          reject={() => setShowDeleteExerciseInCircuitDialog(false)}
          className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
        />

        <ConfirmDialog
          visible={showDeleteBlockDialog}
          onHide={() => setShowDeleteBlockDialog(false)}
          message={`Estás seguro de que deseas eliminar el bloque "${blockToDelete.name}"?`}
          header="Eliminar bloque"
          icon="pi pi-exclamation-triangle"
          acceptLabel="Si"
          rejectLabel="No"
          accept={confirmDeleteBlock}
          reject={() => setShowDeleteBlockDialog(false)}
          className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${dayEditEditorTheme} ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
        />

        </section>
      </div>
    </div>
  );
}

export default DayEditDetailsPage;
