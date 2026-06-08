import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
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

import {
  User,
  CalendarPlus,
  Repeat,
  ClipboardCopy,
  HelpCircle,
  ToggleLeft,
  Plus,
  X,
  SquarePlus,
  Info,
  Badge,
  Save,
  Eye,
  BadgePlus,
  InfoIcon,
  RectangleEllipsis,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown
} from 'lucide-react';
import { Add, PlusOneOutlined } from "@mui/icons-material";
import { Ban } from "lucide-react";

const dayEditTokenTheme = {
  algorithm: antdTheme.darkAlgorithm
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

const DAY_EDIT_COLUMN_CONFIG_VERSION = 13;

const DAY_EDIT_COLUMNS = [
  { id: "name", label: "Nombre", defaultVisible: true, defaultWidth: 200, minWidth: 170, maxWidth: 420, className: "dayEditColName" },
  { id: "sets", label: "Series", defaultVisible: true, defaultWidth: 82, minWidth: 72, maxWidth: 160, className: "dayEditColSets" },
  { id: "reps", label: "Reps", defaultVisible: true, defaultWidth: 58, minWidth: 54, maxWidth: 180, className: "dayEditColReps" },
  { id: "peso", label: "Peso", defaultVisible: true, defaultWidth: 72, minWidth: 64, maxWidth: 180, className: "dayEditColPeso" },
  { id: "rpeRir", label: "Alumno", defaultVisible: true, defaultWidth: 82, minWidth: 76, maxWidth: 180, className: "dayEditColRpeRir" },
  { id: "rest", label: "Rest", defaultVisible: true, defaultWidth: 80, minWidth: 72, maxWidth: 150, className: "dayEditColRest" },
  { id: "video", label: "Video", defaultVisible: true, defaultWidth: 48, minWidth: 42, maxWidth: 100, className: "dayEditColVideo" },
  { id: "notas", label: "Notas", defaultVisible: true, defaultWidth: 112, minWidth: 92, maxWidth: 320, className: "dayEditColNotes" },
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
  const [modifiedDay, setModifiedDay] = useState([]);
  // Fuente unica de verdad para evitar desincronizaciones entre day/allDays/modifiedDay.
  const day = modifiedDay;
  const setDay = setModifiedDay;
  const [warmup, setWarmup] = useState(false); 
  const [firstWidth, setFirstWidth] = useState(); 
  const [visibleEdit, setVisibleEdit] = useState(false); 
  const [visible, setVisible] = useState(false);

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
  const [showColumnConfigDialog, setShowColumnConfigDialog] = useState(false);
  const [showStudentPreviewDialog, setShowStudentPreviewDialog] = useState(false);
  const [studentPreviewDayId, setStudentPreviewDayId] = useState("");
  const [studentPreviewAuxSlide, setStudentPreviewAuxSlide] = useState({});
  const [showDesktopMoreActions, setShowDesktopMoreActions] = useState(false);
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
      console.warn("No se pudo guardar la configuracion de columnas", error);
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
   if (!day) return { title: "-", sub: "Sin dia" };
   const name = toText(day?.name);
   const exCount = Array.isArray(day?.exercises) ? day.exercises.length : 0;
   return { title: name, sub: `${exCount} ejercicio${exCount === 1 ? "" : "s"}` };
 }, []);

 // Navegacion horizontal
 const scrollWeeks = useCallback((dir) => {
   const node = weeksScrollerRef.current;
   if (!node) return;
   const delta = (colWidth + 16) * 2; // 2 columnas por "pagina"
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
  'Bloque de recuperacion',
  'Bloque de pliometria'
];
// Estado para manejar las sugerencias del Autocomplete
const [blockNameSuggestions, setBlockNameSuggestions] = useState(BLOCK_NAME_OPTIONS);

const sanitizeBrokenText = (value) => {
  return String(value ?? "")
    .replace(/D\u00C3\u00ADa/g, "Dia")
    .replace(/d\u00C3\u00ADas/g, "dias")
    .replace(/d\u00C3\u00ADa/g, "dia")
    .replace(/A\u00C3\u00B1adir/g, "Anadir")
    .replace(/a\u00C3\u00B1adir/g, "anadir")
    .replace(/M\u00C3\u00BAltiple/g, "Multiple")
    .replace(/m\u00C3\u00BAltiple/g, "multiple")
    .replace(/Est\u00C3\u00A1s/g, "Estas");
};

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
        description: 'Ademas de ser el nombre, podes editarlo apretando el boton.',
        target: () => document.getElementById('nameWeek'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Dias de la semana',
        description: 'Estos son los dias que contiene la semana. Podes navegar entre ellos apretando en el dia correspondiente.',
        target: () => document.getElementById('dias'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Agregar dia',
        description: 'Este boton permite agregar un dia.',
        target: () => document.getElementById('agregarDia'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Editar el nombre del dia',
        description: 'Aca podes editar el nombre de cada dia.',
        target: () => document.getElementById('editarDia'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Eliminar dia',
        description: 'Podes eliminar un dia. Esta accion es reversible, si apretas cancelar.',
        target: () => document.getElementById('eliminarDia'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
        {
        title: 'Anadir ejercicio',
        description: 'Podes agregar un ejercicio para luego completarlo.',
        target: () => document.getElementById('addEjercicio'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Anadir circuito',
        description: 'Podes agregar la estructura de un circuito, para luego completarlo.',
        target: () => document.getElementById('addCircuit'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' }
      },
      {
        title: 'Bloque de movilidad/activacion',
        description: 'Ingresa al bloque de activacion/movilidad de tu alumno. ',
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

  const confirmDelete = () => {
    setVisible(false);
  };

  const hideDialogWarmup = () => {
    setWarmup(false);
    if(allDays == modifiedDay){
      
    }
  };

  const propiedades = useMemo(
    () => ["", "#", ...visibleExerciseColumns.map((column) => column.label), "#"],
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
  const options = Array.from({ length: 20 }, (_, idx) => {
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
      className="form-control form-control-sm text-center"
      style={{ width: 64 }}
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
          <Tooltip
            placement="top"
            arrow
            title={studentValue ? `${studentValue} - Este campo solo puede ser llenado por el alumno.` : "Este campo solo puede ser llenado por el alumno."}
            enterDelay={0}
            leaveDelay={0}
          >
            <span className="dayEditReadOnlyStudentFieldWrap">
              <input
                ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
                className={`form-control dayEditFieldInput dayEditReadOnlyStudentField ${firstWidth > 992 ? 'stylePesoInput' : 'stylePesoInputMobile'} text-center`}
                type="text"
                defaultValue={studentValue}
                disabled
              />
            </span>
          </Tooltip>
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
        Notify.instantToast("Rutina guardada con exito!");
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
  setShowDeleteDialog(true);
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
    Notify.instantToast("Ejercicio eliminado con exito");
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
    Notify.instantToast("Ejercicio eliminado con exito");
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

  const AddNewExercise = () => {
    if (!Array.isArray(modifiedDay) || !modifiedDay[indexDay]) {
      Notify.instantToast("No hay dia seleccionado.");
      return;
    }
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
      rpeRir: '',
      rest: '',
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
    Notify.instantToast("Ejercicio creado con exito!");
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
     Notify.instantToast("No hay dia seleccionado");
     return;
   }
   try {
     const json = JSON.stringify(src);
     localStorage.setItem("copiedDay", json);
     setDayClipboard(json);
     Notify.instantToast("Dia copiado con exito!");
   } catch (e) {
     console.error("Error al copiar dia:", e);
     Notify.instantToast("Error al copiar el dia");
   }
 };

 // Clona un ejercicio simple (suelto)
 const cloneSimpleExercise = (ex) => {
   const { exercise_id, ...rest } = ex || {};
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
   const { exercise_id, circuit = [], ...rest } = ex || {};
   const newCircuit = Array.isArray(circuit)
     ? circuit.map(item => ({ ...item, idRefresh: RefreshFunction.generateUUID() }))
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
  const { block_id, numberExercise, exercises = [], ...rest } = block || {};
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
    name: `Dia ${nextIndexNumber}`,
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
     Notify.instantToast("No hay un dia copiado");
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
     Notify.instantToast("Dia pegado con exito!");
   } catch (e) {
     console.error("Error al pegar dia:", e);
     Notify.instantToast("Contenido copiado invalido");
   }
 };
 // ======== FIN COPY / PASTE DIA ========

const addNewDay = () => {
  const updatedDays = [...modifiedDay]; //  una sola fuente

  const nextDayIndex = updatedDays.length + 1;
  const newDay = {
    _id: new ObjectId().toString(),
    name: `Dia ${nextDayIndex}`,
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
  Notify.instantToast("Dia creado con exito");
};

const openReorderDaysDialog = () => {
  if (!Array.isArray(modifiedDay) || modifiedDay.length < 2) {
    Notify.instantToast("Necesitas al menos 2 dias para reordenar.");
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
  Notify.instantToast("Orden de dias actualizado.");
};

const confirmDeleteDay = () => {
  const updatedDays = [...(Array.isArray(modifiedDay) ? modifiedDay : [])];
  if (updatedDays.length <= 1) {
    Notify.instantToast("Debe quedar al menos 1 dia.");
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
    console.warn("confirmDeleteDay: dia no encontrado en modifiedDay", {
      currentDayId: currentDay?._id,
      modifiedDayIds: updatedDays.map((d) => d?._id),
    });
    Notify.instantToast("No se pudo eliminar: el dia no esta sincronizado.");
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
      Notify.instantToast("Debe quedar al menos 1 dia.");
      return;
    }
    if (!currentDay) {
      Notify.instantToast("No hay dia seleccionado.");
      return;
    }
    setShowDeleteDayDialog(true);
  };

  const openEditNameDialog = (day) => {
    if (!day) {
      Notify.instantToast("No hay dia seleccionado.");
      return;
    }
    setDayToEdit(day);
    setNewDayName(sanitizeBrokenText(day.name));
    setIsEditingName(true);
  };

  const saveNewDayName = () => {
    if (!dayToEdit?._id) {
      setIsEditingName(false);
      Notify.instantToast("No se pudo editar el nombre del dia.");
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
      Notify.instantToast("No se encontro el dia a editar.");
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
  Notify.instantToast(`${name} eliminado con exito`);
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

  Notify.instantToast(`Bloque "${blockToDelete.name}" eliminado con exito`);

  // limpiar dialogo
  setShowDeleteBlockDialog(false);
  setBlockToDelete({ index: null, name: "" });
};

const AddNewCircuit = (blockIndex = null, kind = 'Libre') => {
  if (!Array.isArray(day) || !day[indexDay]) {
    Notify.instantToast("No hay dia seleccionado.");
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
  Notify.instantToast(kind === 'Libre' ? "Circuito (Libre) anadido" : `Circuito ${kind} anadido`);
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

  Notify.instantToast(`${exerciseToDeleteInCircuit.exerciseName} eliminado con exito`);
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
                className="form-control form-control-sm"
                value={circuit.type || ''}
                placeholder="Nombre del circuito"
                onChange={(e) => set('type', e.target.value)}
                style={{ width: 200 }}
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
      
          <div className="dayEditCircuitNumberField">
            <Dropdown
              value={numberValue}
              options={numberOptions}
              optionLabel="label"
              onChange={(e) => onNumberChange(e.value)}
              className="p-dropdown-group w-100"
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
          <input
            className="form-control form-control-sm"
            placeholder="Notas"
            value={circuit.notas || ''}
            onChange={(e) => onField('notas', e.target.value)}
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

    {/*  ANTES: dropdown de ejercicios del circuito
        AHORA: dropdown de KIND del circuito */}
    <div style={{ minWidth: 200 }}>
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
  </div>

  <MobileInline />

  <div className="mt-2">
    <InputTextarea
      autoResize
      placeholder="Notas"
      value={circuit.notas || ''}
      onChange={(e) => onField('notas', e.target.value)}
      className="w-100"
    />
  </div>
</div>
    </>
  );
};


const AddExerciseToCircuit = (circuitIndex, blockIndex = null) => {
  if (!Array.isArray(day) || !day[indexDay]) {
    Notify.instantToast("No hay dia seleccionado.");
    return;
  }
  setIsEditing(true);
  const updated = [...day];
  const dayCopy = updated[indexDay];

  const newExercise = { name:"", reps:0, peso:"0", rpeRir:"", video:"", idRefresh:RefreshFunction.generateUUID() };

  if (blockIndex == null) {
    dayCopy.exercises[circuitIndex].circuit.push(newExercise);
  } else {
    const block = dayCopy.exercises[blockIndex];
    block.exercises[circuitIndex].circuit.push(newExercise);
  }

  dayCopy.lastEdited = new Date().toISOString();
  setDay(updated);
  setModifiedDay(updated);
  Notify.instantToast("Ejercicio anadido al circuito!");
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
        <Tooltip
          placement="top"
          arrow
          title={studentValue ? `${studentValue} - Este campo solo puede ser llenado por el alumno.` : "Este campo solo puede ser llenado por el alumno."}
          enterDelay={0}
          leaveDelay={0}
        >
          <span className="dayEditReadOnlyStudentFieldWrap">
            <input
              ref={el => inputRefs.current[key] = el}
              className="form-control ellipsis-input text-center stylePesoInput dayEditFieldInput dayEditReadOnlyStudentField"
              type="text"
              defaultValue={studentValue}
              disabled
            />
          </span>
        </Tooltip>
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
        Notify.instantToast("Nombre editado con exito!");
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

// Anade un ejercicio dentro de un bloque dado su indice en el array
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
    rpeRir: '',
    rest: '',
    video: '',
    notas: '',
  };
  block.exercises.push(newEx);
  updatedDays[indexDay].lastEdited = new Date().toISOString();
  setDay(updatedDays);
  setModifiedDay(updatedDays);
  setCurrentDay(updatedDays[indexDay]);
  Notify.instantToast("Ejercicio anadido al bloque");
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
  Notify.instantToast("Bloque eliminado con exito");
};

const AddBlock = () => {
  if (!Array.isArray(modifiedDay) || !modifiedDay[indexDay]) {
    Notify.instantToast("No hay dia seleccionado.");
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

  Notify.instantToast("Bloque creado con exito");
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
  const sliderKey = label.includes("Activacion") ? "movility" : "warmup";
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
                  <div className={`col-12 ${label.includes("Activacion") ? "colorMovility" : "colorWarmup"} py-2`}>
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
        aria-label="Informacion del campo Alumno"
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
        {currentDay && (
       <div className="row justify-content-center text-center mb-2 p-0">


         <div className="col-5  mt-3">
           {/* --- AGREGAMOS BOTON DE BLOQUE --- */}
           <button className="btn stylesHerramientasButtons py-1 mb-2 fs08em px-2 w-100" onClick={AddBlock}>
             <AddIcon /> 
             Agregar bloque
           </button>
         </div>

        <div className="col-5  mt-3">
          <button
            className="btn stylesHerramientasButtons py-1 mb-2 fs08em px-1 w-100"
            onClick={() => setDialogAllWeeks(true)}
          >
            <Eye /> Ver semanas
          </button>
         </div>

        <div className="col-5 mt-2">
          <button
            className="btn stylesHerramientasButtons w-100 py-2 px-2 fs08em d-flex align-items-center justify-content-center gap-1"
            onClick={() => setShowColumnConfigDialog(true)}
          >
            <RectangleEllipsis size={18} /> Columnas
          </button>
        </div>

         <div className="col-5 mt-2 ">
           <button
             className="btn stylesHerramientasButtons w-100 py-2 px-2 fs08em d-flex align-items-center justify-content-center gap-1"
             onClick={incrementAllSeries}
           >
             <LibraryAddIcon fontSize="small" /> Sumar 1 serie
           </button>
         </div>

         <div className="col-5 mt-2">
           <button
             className="btn stylesHerramientasButtons w-100 py-2 px-2 fs08em d-flex align-items-center justify-content-center gap-1"
             onClick={incrementAllReps}
           >
             <PlusOneOutlined fontSize="small" /> Sumar 1 rep
           </button>
         </div>

         <div className="col-5 mt-2">
          <button
            className="btn stylesHerramientasButtons w-100 py-1 px-1 fs08em"
            onClick={copyDayToClipboard}
          >
            <ContentCopyIcon /> Copiar dia
          </button>
        </div>

        <div className="col-5 mt-2">
          <button
            className="btn stylesHerramientasButtons w-100 py-1 px-1 fs08em"
            onClick={pasteDayFromClipboard}
            style={{
              opacity: hasDayClipboard ? 1 : 0.5,
              pointerEvents: hasDayClipboard ? 'auto' : 'none'
            }}
          >
            <LibraryAddIcon /> Pegar dia
          </button>
        </div>

        <div className="col-5 mt-2">
          <button
            className={`btn stylesHerramientasButtons w-100 py-1 px-1 fs08em ${isMobileReorderMode ? "dayEditMobileReorderActiveBtn" : ""}`}
            onClick={() => setIsMobileReorderMode((prev) => !prev)}
          >
            <DragIndicatorIcon /> {isMobileReorderMode ? "Listo" : "Reordenar"}
          </button>
        </div>

        <div className="col-10 mt-2 pt-2">
          <button
            className="btn stylesHerramientasButtons w-100 py-2 px-2 fs08em d-flex align-items-center justify-content-center gap-1"
            onClick={() => setShowStudentPreviewDialog(true)}
          >
            <Eye size={18} /> Ver como alumno
          </button>
        </div>


       </div>
     )}

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
                      className={`mb-4 shadowCards p-2 ${isMobileReorderMode ? "dayEditMobileReorderCard" : ""}`}
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
                      {/* --- BLOQUE --- */}
                      {exercise.type === 'block' ? (
                        <>
                          {/* Cabecera del bloque */}
<div
  className="d-flex justify-content-between align-items-center mb-2 p-2"
  style={{ backgroundColor: exercise.color }}
>
  {/* IZQ: texto centrado */}
  <div className="d-flex align-items-center justify-content-center flex-grow-1 gap-2">
    <span className="text-light fw-semibold text-truncate" style={{ maxWidth: 180 }}>
      {exercise.name || "Bloque"}
    </span>

    {/* BOTON UNICO (centrado) para cambiar nombre */}
    <IconButton
      onClick={(e) => blockNameOverlayRef.current[`b-${exercise.block_id}`]?.toggle(e)}
      className="text-light blockNameTriggerLight"
      aria-label="cambiar-nombre-bloque"
    >
      <EditIcon fontSize="small" />
    </IconButton>

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
          placeholder="Escribi o elegi un nombre"
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
  </div>

  {/* DER: borrar bloque */}
  <IconButton onClick={() => handleDeleteBlockClick(i, exercise.name)}>
    <CancelIcon className="text-light" />
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
                                        {isColumnVisible("video") && (
                                        <div className="col-4">
                                          {customInputEditExerciseInCircuit(
                                            item.video, j, k, 'video', item.video, i
                                          )}
                                        </div>
                                        )}
                                        <div className="col-4 text-end">
                                          <IconButton
                                            onClick={() => handleDeleteExerciseInCircuit(i, j, k, item.name)}
                                          >
                                            <CancelIcon className="colorIconDeleteExercise" />
                                          </IconButton>
                                        </div>
                                      </div>
                                    </div>
                                    {isColumnVisible("name") && (
                                    <div className="col-11 mb-2">
                                      {customInputEditExerciseInCircuit(
                                        item.name, j, k, 'name', item.name, i
                                      )}
                                    </div>
                                    )}
                                    {isColumnVisible("peso") && (
                                    <div className="col-5 text-start">
                                      <span className="styleInputsSpan">Peso</span>
                                      <div className="largoInput">
                                        {customInputEditExerciseInCircuit(
                                          item.peso, j, k, 'peso', item.peso, i
                                        )}
                                      </div>
                                    </div>
                                    )}
                                    {isColumnVisible("reps") && (
                                    <div className="col-5 text-start">
                                      <span className="styleInputsSpan">Reps</span>
                                      <div className="largoInput">
                                        {customInputEditExerciseInCircuit(
                                          item.reps, j, k, 'reps', item.reps, i
                                        )}
                                      </div>
                                    </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Boton "Anadir ejercicio" y notas */}
                              <div className="row justify-content-center my-4">
                                <div className="col-8 my-3">
                                  <IconButton
                                    className="bgColor rounded-2 text-light text-center"
                                    onClick={() => AddExerciseToCircuit(j, i)}
                                  >
                                    <AddIcon />
                                    <span className="font-icons">Anadir ejercicio</span>
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
                              <div className="notStyle">
                                <div className="row justify-content-center">
                                  <div className="col-4 ms-4">
                                    <Dropdown
                                      value={ex.numberExercise}
                                      options={options}
                                      onChange={e =>
                                        changeBlockCircuitData(i, j, 'numberExercise', e.target.value)
                                      }
                                      placeholder="Seleccionar numero"
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
                              <div className="row justify-content-center text-center g-3 dayEditMobileFieldGrid">
                               
                                  {isColumnVisible("sets") && (
                                  <div className="col-4 ">
                                    <span className="fs07em text-muted ms-2">Sets</span>
                                    {customInputEditDay(ex.sets, j, 'sets', i)}
                                  </div>
                                  )}
                               
                                {isColumnVisible("reps") && (
                                <div className={`col-7`}>
                                  <span className="fs07em text-muted me-5 d-block ">Reps</span>
                                    {customInputEditDay(ex.reps, j, 'reps', i)}
                                 
                                </div>
                                )}
                                {isColumnVisible("peso") && (
                                <div className="col-5 ">
                                  <span className="fs07em text-muted text-center m-auto">Peso</span>
                                  <div>{customInputEditDay(ex.peso, j, 'peso', i)}</div>
                                </div>
                                )}
                                {isColumnVisible("rpeRir") && (
                                <div className="col-5 ">
                                  {renderStudentOnlyFieldLabel()}
                                  <div>{customInputEditDay(ex.athleteRpeRir, j, 'rpeRir', i)}</div>
                                </div>
                                )}
                                {isColumnVisible("rest") && (
                                <div className="col-5 ">
                                  <span className="fs07em text-muted ms-2">Rest</span>
                                  {customInputEditDay(ex.rest, j, 'rest', i)}
                                </div>
                                )}

                                  {isColumnVisible("notas") && (
                                  <div className="col-11 ">
                                  <span className="fs07em text-muted text-center m-auto">Notas</span>
                                  <div>{customInputEditDay(ex.notas, j, 'notas', i)}</div>
                                </div>
                                  )}

                              </div>
                              <div className="row align-items-center justify-content-between text-center mt-2">
                                <div className="col-4">
                                  <Dropdown
                                    value={ex.numberExercise}
                                    options={options}
                                    onChange={(e) => changeBlockExerciseData(i, j, 'numberExercise', e.value)}
                                    placeholder="#"
                                    optionLabel="label"
                                    className="p-dropdown-group w-100"
                                  />
                                </div>
                                <div className="col-4">
                                  {isColumnVisible("video") && (
                                  <IconButton onClick={(e) => mobileVideoRefs.current[`block-mobile-${i}-${j}`]?.toggle(e)}>
                                    <YouTubeIcon />
                                  </IconButton>
                                  )}
                                </div>
                                {isColumnVisible("video") && (
                                <OverlayPanel
                                  ref={(el) => (mobileVideoRefs.current[`block-mobile-${i}-${j}`] = el)}
                                  className="dayEditLightOverlayPanel"
                                >
                                  <input
                                    className="form-control ellipsis-input text-center dayEditFieldInput"
                                    type="text"
                                    defaultValue={ex.video || ""}
                                    placeholder="Pegá el link del video"
                                    onChange={(e) => changeBlockExerciseData(i, j, 'video', e.target.value)}
                                  />
                                </OverlayPanel>
                                )}

                                <div className="col-4 text-end">
                                  <IconButton
                                    onClick={() => handleDeleteExerciseInBlockClick(i, ex)}
                                    aria-label="delete-exercise-in-block"
                                  >
                                    <DeleteIcon className="text-danger" />
                                  </IconButton>
                                </div>
                              </div>
                            </div>
                          ))}
                     <div className="d-flex flex-column gap-2">
                        <button
                          className="btn btn-outline-dark w-100"
                          onClick={() => addExerciseToBlock(i)}
                        >
                          <AddIcon /> Anadir ejercicio al bloque
                        </button>

                        <button
                          className="btn btn-outline-dark w-100"
                          onClick={() => AddNewCircuit(i)}
                        >
                          <AddIcon /> Anadir circuito al bloque
                        </button>
                      </div>
                        </>
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
                          <div className="row justify-content-center text-center g-3 dayEditMobileFieldGrid">
                              {isColumnVisible("sets") && (
                              <div className="col-5 mb-2 ms-3">
                                <span className="fs07em text-muted text-start ">Sets</span>
                                {customInputEditDay(exercise.sets, i, 'sets')}
                              </div>
                              )}
                            
                            {isColumnVisible("reps") && (
                            <div className={`col-6 mb-2`}>
                              <span className="fs07em text-muted text-start ">Reps</span>
                              {customInputEditDay(exercise.reps, i, 'reps')}
                            </div>
                            )}
                            {isColumnVisible("peso") && (
                            <div className="col-5">
                              <span className="fs07em text-muted text-start ">Peso</span>
                              {customInputEditDay(exercise.peso, i, 'peso')}
                            </div>
                            )}
                            {isColumnVisible("rpeRir") && (
                            <div className="col-5">
                              {renderStudentOnlyFieldLabel("fs07em text-muted text-start")}
                              {customInputEditDay(exercise.athleteRpeRir, i, 'rpeRir')}
                            </div>
                            )}
                            {isColumnVisible("rest") && (
                            <div className="col-5">
                              <span className="fs07em text-muted text-start ">Rest</span>
                              {customInputEditDay(exercise.rest, i, 'rest')}
                            </div>
                            )}
                     
                            {isColumnVisible("notas") && (
                            <div className="col-11 text-center mt-2">
                              <span className="fs07em text-muted text-center ">Notas</span>
                              {customInputEditDay(exercise.notas, i, 'notas')}
                            </div>
                            )}
                          </div>
                          <div className="row align-items-center justify-content-between text-center mt-2">
                            <div className="col-4">
                              <Dropdown
                                value={exercise.numberExercise}
                                options={options}
                                onChange={(e) => changeModifiedData(i, e.value, 'numberExercise')}
                                placeholder="#"
                                optionLabel="label"
                                className="p-dropdown-group w-100"
                              />
                            </div>
                            <div className="col-4">
                              {isColumnVisible("video") && (
                              <IconButton onClick={(e) => mobileVideoRefs.current[`root-mobile-${i}`]?.toggle(e)}>
                                <YouTubeIcon />
                              </IconButton>
                              )}
                            </div>
                            {isColumnVisible("video") && (
                            <OverlayPanel
                              ref={(el) => (mobileVideoRefs.current[`root-mobile-${i}`] = el)}
                              className="dayEditLightOverlayPanel"
                            >
                              <input
                                className="form-control ellipsis-input text-center dayEditFieldInput"
                                type="text"
                                defaultValue={exercise.video || ""}
                                placeholder="Pega el link del video"
                                onChange={(e) => changeModifiedData(i, e.target.value, 'video')}
                              />
                            </OverlayPanel>
                            )}

                            <div className="col-4 text-end">
                              <IconButton
                                onClick={() => handleDeleteClick(exercise)}
                                aria-label="delete-exercise"
                              >
                                <DeleteIcon className="text-danger" />
                              </IconButton>
                            </div>
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
                                            {isColumnVisible("video") && (
                                            <div className="col-4">{customInputEditExerciseInCircuit(item.video, i, j, 'video')}   </div>
                                            )}
                                            <div className="col-4">
                                              <span className="text-end ">
                                                <IconButton
                                                  aria-label="delete-circuit-exercise"
                                                  className=" text-light "
                                                  onClick={() => handleDeleteExerciseInCircuit(null, i, j, item.name)}
                                                >
                                                  <CancelIcon className="colorIconDeleteExercise" />
                                                </IconButton>
                                              </span>
                                            </div>
                                          

                                                                                        
                                      
                                        </div>
                                        </div>
                                        {isColumnVisible("name") && (
                                        <div className="col-11  mb-2">
                                          
                                          {customInputEditExerciseInCircuit(item.name, i, j, 'name')}
                                        </div>
                                        )}
                                        {isColumnVisible("peso") && (
                                        <div className="col-5 text-start ">
                                        <span className="styleInputsSpan">Peso</span>
                                          <div className="largoInput">
                                          {customInputEditExerciseInCircuit(item.peso, i, j, 'peso')}
                                          </div>
                                        </div>
                                        )}
                                        {isColumnVisible("reps") && (
                                        <div className="col-5 text-start">
                                          <span className="styleInputsSpan">Reps</span>
                                          <div className="largoInput">
                                            {customInputEditExerciseInCircuit(item.reps, i, j, 'reps')}
                                          </div>
                                        </div>
                                        )}
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
                                        <span className="font-icons ">Anadir ejercicio</span>
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
                                            onClick={() => handleDeleteMainCircuitClick(i, exercise)}
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
 

  return (
    <div
      className="container-fluid ddp ddp-dark dayEditDarkPage"
      style={{
        "--dayedit-bg": "#041324",
        "--dayedit-surface": "#12263f",
        "--dayedit-surface-alt": "#17304d",
        "--dayedit-surface-hover": "#1d3b5d",
        "--dayedit-border": "#254566",
        "--dayedit-border-strong": "#31577e",
        "--dayedit-text": dayEditDarkTokens.colorText,
        "--dayedit-text-muted": dayEditDarkTokens.colorTextSecondary,
        "--dayedit-text-soft": dayEditDarkTokens.colorTextTertiary,
        "--dayedit-accent": "#5ea3ff",
        "--dayedit-success": dayEditDarkTokens.colorSuccess
      }}
    >
      {/**a
       * SIDEBAR: fijo ? la izquierda 
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

                   

                  <div className="text-muted small">

                    <div id="agregarDia"  className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={addNewDay}>
                      <div className=' col-1'><AddIcon /></div>
                      <div className='text-center col-10'><strong >Agregar dia</strong></div>
                    </div>

                     <div id="editarDia" className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => openEditNameDialog(currentDay)}>
                     <div className=' col-1'><EditIcon /></div>
                       <div className='text-center col-10'><strong >Editar {`${sanitizeBrokenText(currentDay && currentDay.name)}`}</strong></div>
                     </div>

                     <div
                      id="reordenarDias"
                      className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={openReorderDaysDialog}
                    >
                      <div className=' col-1'><DragIndicatorIcon /></div>
                      <div className='text-center col-10'><strong>Reordenar dias</strong></div>
                    </div>

                     <div
                       id="eliminarDia"
                       className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={handleDeleteDayClick}
                      style={{
                        opacity: canDeleteDay ? 1 : 0.5,
                        pointerEvents: canDeleteDay ? "auto" : "none",
                        cursor: canDeleteDay ? "pointer" : "not-allowed"
                      }}
                    >
                      <span></span>
                         <div className=' col-1'><DeleteIcon /></div>
                      <div className='text-center col-10'><strong >Eliminar {`${sanitizeBrokenText(currentDay && currentDay.name)}`}</strong></div>
                    </div>

                    <div
                      id="copiarDia"
                      className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={copyDayToClipboard}
                    >
                      <div className=' col-1'><ContentCopyIcon /></div>
                      <div className='text-center col-10'><strong>Copiar dia</strong></div>
                    </div>
                  
                    {/* Pegar dia */}
                    <div
                      id="pegarDia"
                      className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={pasteDayFromClipboard}
                      style={{ opacity: hasDayClipboard ? 1 : 0.5, pointerEvents: hasDayClipboard ? 'auto' : 'none' }}
                    >
                      <div className=' col-1'><LibraryAddIcon /></div>
                      <div className='text-center col-10'><strong>Pegar dia</strong></div>
                    </div>

                    <div
                      id="verComoAlumno"
                      className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3"
                      onClick={() => setShowStudentPreviewDialog(true)}
                    >
                      <div className=' col-1'><Eye size={18} /></div>
                      <div className='text-center col-10'><strong>Ver como alumno</strong></div>
                    </div>

                  </div>

                    <div className="text-muted small mt-5">

                      <div id="addEjercicio"  className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => AddNewExercise()}>
                        <div className=' col-1'><AddIcon  className="me-2" /></div>
                        <div className='text-center col-10'><strong >Anadir ejercicio</strong></div>
                      </div>

                      <div id="addCircuit" className="bgItemsDropdown stylePointer rounded mx-2 row justify-content-center mb-3" onClick={() => AddNewCircuit()} >
                        <div className=' col-1'><AddIcon /></div>
                        <div className='text-center col-10'><strong >Anadir circuito</strong></div>
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

      <div className={`dayEditPageContent ${firstWidth < 992 ? 'dayEditPageContentMobile' : (collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen')}`}>
        <section className="totalHeight dayEditMainSection">
          <div  className={`row dayEditTopBlocksRow ${firstWidth > 992 && 'mb-3'} justify-content-around align-middle align-center align-items-center`}>

            <div className=" col-lg-6   mt-3">
                  <div
                    id="movility"
                    className={`ps-3 bgItemsDropdown py-3 dayEditPreparationCard ${hasCurrentMovility ? "dayEditPreparationCardLoaded" : ""}`}
                    onClick={handleShowMovility}
                  >
                    <div className="dayEditPreparationHeader">
                      <div className="dayEditPreparationTitle">
                        <CircleIcon  className="me-2 badgeMovility" />
                        <span className=" me-1 stylesSpanTitles">Bloque de <strong>activacion/movilidad</strong> <span className="small">- {sanitizeBrokenText(currentDay && currentDay.name)} </span> </span>
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
                          <span>Todavia no hay activacion/movilidad cargada</span>
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
                        <span className=" me-1 stylesSpanTitles">Bloque de <strong>entrada en calor</strong> <span className="small">- {sanitizeBrokenText(currentDay && currentDay.name)} </span></span>
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

                    <p className="text-center mb-4 colorNameAlumno rounded-2 mt-3 py-1 fs09em">
                        Estas en: <b>{sanitizeBrokenText(currentDay && currentDay.name)}</b>
                    </p>

                </div>
                <div className={`col-12 col-sm-6 ${firstWidth > 550 ? 'text-start mb-4' : 'text-center mb-4'}`}>
                    <IconButton
                            aria-label="video"
                            className="stylesbuttonCrearDia rounded-2 me-2"
                            onClick={addNewDay}
                        >
                            <AddIcon className="" />
                            <span className="font-icons me-1">Crear dia</span>
                        </IconButton>

                        <IconButton
                            aria-label="video"
                            className="stylesbuttonEditarDia rounded-2 text-light me-2"
                            onClick={() => openEditNameDialog(currentDay)}
                            
                        >
                            <EditIcon className="" />
                        </IconButton>
                        <IconButton
                            aria-label="reorder-days"
                            className="stylesbuttonEditarDia rounded-2 text-light me-2"
                            onClick={openReorderDaysDialog}
                        >
                            <DragIndicatorIcon className="" />
                        </IconButton>
                        <IconButton
                            aria-label="video"
                            className="stylesbuttonEliminarDia rounded-2 text-light "
                            onClick={handleDeleteDayClick}
                            disabled={!canDeleteDay}
                        >
                            <DeleteIcon className="" />
                        </IconButton>

              </div>
              </>
                }
          </div>

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
                        <thead className=" ">
                          <tr className=" ">
                            <th className="px-0 mx-0 pt-0 bg-transparent" colSpan={desktopColumnSpan}>
                              <div className="dayEditBulkActionBar">
                                <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn justify-content-center">
                                  Acciones:
                                </div>
                              <button className="bulkAdjustTriggerBtn rounded-2 text-start" onClick={() => incrementAllSeries()} >
                                <Tooltip placement="top" arrow title={ "Sumaras una serie a todos los ejercicios." } enterDelay={0} leaveDelay={0}>
                                  <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                                    <LibraryAddIcon className="bulkAdjustHeaderIcon" />
                                    <span>Sumar 1 serie</span>
                                  </div>
                                </Tooltip>
                              </button>

                              <button className="bulkAdjustTriggerBtn rounded-2 text-start" onClick={() => incrementAllReps()} >
                                <Tooltip placement="top" arrow title={ "Sumaras una repeticion a todos los ejercicios." } enterDelay={0} leaveDelay={0}>
                                  <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                                    <PlusOneOutlined className="bulkAdjustHeaderIcon" />
                                    <span>Sumar 1 rep</span>
                                  </div> 
                                </Tooltip>
                              </button>

                                <button className="bulkAdjustTriggerBtn rounded-2 text-start" onClick={AddBlock}>
                                  <Tooltip placement="top" arrow title={ "En vez de agregar un ejercicio, primero agregas un bloque para luego crear los ejercicios que desees dentro de el. Tu alumno vera el bloque. Por ejemplo, podes agregar un bloque de fuerza y luego otro de auxiliares." } enterDelay={0} leaveDelay={0}>
                                    <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                                      <AddIcon className="bulkAdjustHeaderIcon" />
                                      <span>Agregar bloque de entrenamiento</span>
                                    </div>
                                  </Tooltip>
                                </button>

                                <div className="dayEditMoreActionsWrap">
                                  <button
                                    className="bulkAdjustTriggerBtn rounded-2 text-start"
                                    onClick={() => setShowDesktopMoreActions((prev) => !prev)}
                                    type="button"
                                  >
                                    <Tooltip placement="top" arrow title="Ver acciones secundarias." enterDelay={0} leaveDelay={0}>
                                      <div className="btn px-2 py-1 style1Item bulkAdjustHeaderBtn">
                                        <RectangleEllipsis className="bulkAdjustHeaderIcon" />
                                        <span>Mas acciones</span>
                                      </div>
                                    </Tooltip>
                                  </button>
                                  {showDesktopMoreActions && (
                                    <div className="dayEditMoreActionsMenu">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDialogAllWeeks(true);
                                          setShowDesktopMoreActions(false);
                                        }}
                                      >
                                        <Eye size={16} />
                                        <span>Ver semanas anteriores</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowColumnConfigDialog(true);
                                          setShowDesktopMoreActions(false);
                                        }}
                                      >
                                        <RectangleEllipsis size={16} />
                                        <span>Columnas</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </th>
                            
                          </tr>
                        </thead>

                        <thead>
                          <tr>
                            {/* CHANGES: Aqui usamos key={index} para evitar duplicados */}
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
  <td colSpan={desktopColumnSpan} className="p-0 border-0">
    <div
      className="rounded-3"
      style={{
        overflow: 'hidden',
        border: '1px solid rgba(15, 23, 42, 0.42)',
        boxShadow: 'none'
      }}
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

          <button
            type="button"
            className="btn btn-sm blockNameEditButton text-white"
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
                placeholder="Escribi o elegi un nombre"
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
      <div className="px-0 py-2 small text-muted dayEditBlockColumns">
        <div
          className="dayEditBlockColumnsGrid fw-semibold"
          style={{
            gridTemplateColumns: `106px ${visibleExerciseColumns
              .map((column) => `${columnConfig[column.id]?.width || column.defaultWidth}px`)
              .join(" ")} 46px`
          }}
        >
          <div>#</div>
          {visibleExerciseColumns.map((column) => (
            <div key={column.id} className={column.id === "name" || column.id === "notas" ? "text-start" : ""}>
              {column.label}
            </div>
          ))}
          <div></div>
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

                                        <td
                                          colSpan={2}
                                          className="dayEditBlockOrderCell"
                                          style={{ backgroundColor: exercise.type == 'block' ? exercise.color : exercise.color , transition: 'background-color 0.2s' }}
                                        >
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
                                        </td>
                                        {isColumnVisible("name") && (
                                        <td>
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
                                                                  // Usa la funcion especifica para ejercicios de bloque
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
                                                        )}
                                                        {isColumnVisible("sets") && (
                                                        <td>
                                                        {customInputEditDay(ex.sets, j, "sets", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("reps") && (
                                                        <td>
                                                          {customInputEditDay(ex.reps, j, "reps", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("peso") && (
                                                        <td>
                                                          {customInputEditDay(ex.peso, j, "peso", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rpeRir") && (
                                                        <td>
                                                          {customInputEditDay(ex.athleteRpeRir, j, "rpeRir", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rest") && (
                                                        <td>
                                                          {customInputEditDay(ex.rest, j, "rest", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("video") && (
                                                        <td>
                                                          {customInputEditDay(ex.video, j, "video", i)}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("notas") && (
                                                        <td>
                                                          {customInputEditDay(ex.notas, j, "notas", i)}
                                                        </td>
                                                        )}
                                                        <td>
                                                          <IconButton
                                                              onClick={() => handleDeleteExerciseInBlockClick(i, ex)}
                                                            >
                                                              <CancelIcon className="colorIconDeleteExercise" />
                                                            </IconButton>
                                                        </td>
                                                      </tr>
                                )}
                                if (ex.type !== 'block' && ex.type !== 'exercise') {

                                  return (
                                    <React.Fragment key={ex.exercise_id}>
                                      <tr>
                                        <td colSpan={desktopColumnSpan} className="p-0 border-0">
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
                                                    <AddIcon /> Anadir ejercicio al circuito
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

                                      {/* Fila para anadir ejercicio al bloque */}
                                      <tr>
                                        <td colSpan={desktopColumnSpan} className="text-center rounded-bottom-3" style={{ backgroundColor: exercise.type == 'block' ? exercise.color : exercise.color , transition: 'background-color 0.2s' }}>
                                          <button
                                            className="btn btn-light mx-3"
                                            onClick={() => addExerciseToBlock(i)}
                                          >
                                            <AddIcon /> Anadir ejercicio al bloque
                                          </button>

                                          <button
                                            className="btn btn-light  mx-3"
                                            onClick={() => AddNewCircuit(i)}
                                          >
                                            <AddIcon /> Anadir circuito al bloque
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
                                                    <td className="dayEditCellOrder">
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
                                                        className="p-dropdown-group w-100 dayEditOrderDropdown"
                                                      />
                                                    </td>
                                                    {exercise.type === "exercise" ? (
                                                      <>
                                                        {isColumnVisible("name") && (
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
                                                        )}
                                                        {isColumnVisible("sets") && (
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.sets,
                                                            i,
                                                            "sets"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("reps") && (
                                                        <td>
                                                          <div className="marginRepsNew">
                                                          {customInputEditDay(
                                                            exercise.reps,
                                                            i,
                                                            "reps"
                                                          )}</div>
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
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.athleteRpeRir,
                                                            i,
                                                            "rpeRir"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("rest") && (
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.rest,
                                                            i,
                                                            "rest"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("video") && (
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.video,
                                                            i,
                                                            "video"
                                                          )}
                                                        </td>
                                                        )}
                                                        {isColumnVisible("notas") && (
                                                        <td>
                                                          {customInputEditDay(
                                                            exercise.notas,
                                                            i,
                                                            "notas"
                                                          )}
                                                        </td>
                                                        )}
                                                        <td>
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
                                                        <td colSpan={desktopColumnSpan - 2}>
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
                                                                <td colSpan={circuitColumnSpan}>
                                                                  <button
                                                                    aria-label="video"
                                                                    className="btn circuitAddExerciseBtn my-4"
                                                                    onClick={() => AddExerciseToCircuit(i)}
                                                                  >
                                                                    <AddIcon />
                                                                    <span className=" me-1">Anadir ejercicio al circuito</span>
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
            <nav className="fixed-bottom footerColor d-flex justify-content-around  pt-0 pb-2">


              {/* -------- BOTON: Anadir circuito -------- */}
              <div className="row justify-content-center text-center">

                <button
                  type="button"
                  onClick={() => AddNewCircuit()}
                  className="styleItemsDial text-center d-block styleDial rounded-5 d-flex align-items-center justify-content-center"
                  
                >
                  <Plus size={28} className="d-block" />
                </button>
                <span className=" fs08em d-block text-light ">
                  Anadir circuito
                </span>
              </div>

              {/* -------- BOTON: Anadir ejercicio -------- */}
              <div className="row justify-content-center text-center">
                <button
                  type="button"
                  onClick={() => AddNewExercise()}
                  className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                  
                >
                  <Plus size={28} />
                </button>
                <span className="fs08em text-light">
                  Anadir ejercicio
                </span>
              </div>

            </nav>
          )}



          {/* Ajustamos estilos de dialog para que se desplacen segun collapsed */}
          <Dialog
            header="Ver como alumno"
            className={`coachModalDialog dayEditStudentPreviewDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showStudentPreviewDialog}
            style={{ width: firstWidth > 991 ? "440px" : "94vw" }}
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
                <span>Dia a previsualizar</span>
                <select
                  value={studentPreviewDayId}
                  onChange={(event) => {
                    setStudentPreviewDayId(event.target.value);
                    setStudentPreviewAuxSlide({});
                  }}
                >
                  {studentPreviewDays.map((dayItem, dayIndex) => (
                    <option key={getStudentPreviewDayKey(dayItem, dayIndex)} value={getStudentPreviewDayKey(dayItem, dayIndex)}>
                      {sanitizeBrokenText(dayItem?.name || `Dia ${dayIndex + 1}`)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="dayEditStudentPreviewPhone ddp ddp-light">
              <div className="dayEditStudentPreviewDayTitle">
                {sanitizeBrokenText(studentPreviewDay?.name || "Dia sin nombre")}
              </div>
              {renderStudentPreviewAuxList("Activacion / movilidad", studentPreviewDay?.movility)}
              {renderStudentPreviewAuxList("Entrada en calor", studentPreviewDay?.warmup)}
              <h2 className="p-2 mb-0 text-start">Rutina del dia</h2>
              <div className="dayEditStudentPreviewList">
                {groupStudentPreviewSupersets(Array.isArray(studentPreviewDay?.exercises) ? studentPreviewDay.exercises : []).map((item, index) =>
                  renderStudentPreviewItem(item, index)
                )}
                {!Array.isArray(studentPreviewDay?.exercises) || studentPreviewDay.exercises.length === 0 ? (
                  <div className="dayEditStudentPreviewEmpty">Este dia no tiene ejercicios cargados.</div>
                ) : null}
              </div>
            </div>
          </Dialog>

          <Dialog
            header="Columnas del planificador"
            className={`coachModalDialog dayEditColumnDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showColumnConfigDialog}
            style={{ width: firstWidth > 991 ? "520px" : "92vw" }}
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

          <ConfirmDialog
            visible={showDeleteDayDialog}
            onHide={() => setShowDeleteDayDialog(false)}
            message="Queres eliminar este dia? Podes cancelar despues y revertir esta accion."
            header="Eliminar dia"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Si"
            rejectLabel="No"
            accept={() => {
              confirmDeleteDay();
              setShowDeleteDayDialog(false);
            }}
            className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            reject={() => setShowDeleteDayDialog(false)}
          />

          <ConfirmDialog
            visible={showCancelDialog}
            onHide={() => setShowCancelDialog(false)}
            message="Estas seguro de que deseas cancelar los cambios? Se perderan todos los cambios no guardados."
            header="Confirmacion"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Si"
            rejectLabel="No"
            accept={() => handleCancel()}
            reject={() => setShowCancelDialog(false)}
            className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          <ConfirmDialog
            visible={visible}
            onHide={() => setVisible(false)}
            message="Estas seguro de que deseas eliminar este elementoa"
            header="Confirmacion"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Eliminar"
            acceptClassName="p-button-danger"
            rejectLabel="Cancelar"
            accept={confirmDelete}
            reject={() => setVisible(false)}
            className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
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
          className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
          />

          <Dialog
            header={`${exerciseToDelete?.name || ""}`}
            className={`coachModalDialog dialogDeleteExercise ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            visible={showDeleteDialog}
            style={{
              width: `${firstWidth > 991 ? "50vw" : "80vw"}`
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
    className={`coachModalDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
    header="Semanas anteriores"
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
    />
  </Dialog>
          <Dialog
            className={`coachModalDialog coachRoutineAuxDialog col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
            header={
              <div className="d-flex align-items-start justify-content-between">
                <div><span className="fs-5">Bloque de entrada en calor</span> - <span className="fs-5">{sanitizeBrokenText(currentDay && currentDay.name)}</span></div>
                
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
            header="Editar nombre del dia"
            visible={isEditingName}
            className={`coachModalDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
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
            header="Editar nombre de la semana"
            visible={isEditingWeekName}
            className={`coachModalDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
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
            header="Reordenar dias"
            visible={showReorderDaysDialog}
            className={`coachModalDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
            style={{
              ...(firstWidth > 968 ? { width: "35vw" } : { width: "85vw" })
            }}
            onHide={closeReorderDaysDialog}
          >
            <p className="small mb-3 coachDialogMessage">Arrastra cada dia para cambiar el orden de la semana.</p>

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
                              <span>{sanitizeBrokenText(d?.name || `Dia ${idx + 1}`)}</span>
                            </div>
                            <span className="badge bg-secondary">{idx + 1}</span>
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
  className={`coachModalDialog coachRoutineAuxDialog col-12 col-md-10 h-75 ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}
  blockScroll={window.innerWidth > 600 ? false : true}
  /* Header custom para replicar el diseno (titulo izq + X der) */
  header={
    <div className="d-flex align-items-start justify-content-between">
      <div><span className="fs-5">Bloque de activacion / movilidad</span> - <span className="fs-5">{sanitizeBrokenText(currentDay && currentDay.name)}</span></div>
      
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

      <OverlayPanel ref={backoffOverlayRef} className={`dayEditDarkOverlayPanel ${firstWidth > 992 ? 'w-25' : 'w-75'}`}>
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
              No es un back off. Personaliza el nombre de la seccion.
            </label>
          </div>

          {/* SI ESTA TILDADO, MOSTRAMOS EL INPUT */}
          {useCustomTitle && (
            <div className="mb-3">
              <label htmlFor="backoffTitleInput" className="form-label fontSizeNotBack ">Titulo personalizado</label>
              <input
                id="backoffTitleInput"
                type="text"
                className="form-control dayEditFieldInput"
                value={backoffTitleName}
                onChange={(e) => setBackoffTitleName(e.target.value)}
                placeholder="Ingresa el nombre"
              />
            </div>
          )}

          {/* AQUI TU MAP DE backoffData (igual que antes) */}
          {backoffData.map((line, idx) => (
            <div key={idx} className="row mb-2 align-items-end">
              {["sets", "reps", "peso"].map((f) => (
                <div key={f} className="col-3 px-0">
                  <label className={'fs07em'}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input
                    type={f === "peso" || f === "reps" ? "text" : "number"}
                    className="form-control styleInputBackOffs text-center dayEditFieldInput"
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

          {/* Botones de anadir linea, cerrar y guardar */}
          <div className="text-center mb-3">
            <button
              className="btn btn-outline-dark fs09em py-0 px-2"
              onClick={() => setBackoffData([...backoffData, { sets: "", reps: "", peso: "" }])}
            >
              Anadir otro back off
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

    <OverlayPanel ref={approxOverlayRef} className={`dayEditDarkOverlayPanel ${ firstWidth > 992 ? 'w-25' : 'w-75' }`}>
      <div className="">

        {/* Cada linea con su numero de aproximacion */}
        { approxData.map((line, idx) => (
          <div key={idx} className="mb-2">
            <div className="small text-muted fs07em mb-0 dayEditApproxLineLabel">
              {`${idx+1} aproximacion`}
            </div>
            <div className="row g-1 align-items-end">
              <div className="col-5">
                <label className="form-label  fs07em mb-0">Reps</label>
                <input type="text" className="form-control text-center styleInputBackOffs dayEditFieldInput"
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
                <input type="text" className="form-control text-center styleInputBackOffs dayEditFieldInput"
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

        {/* Boton anadir linea */}
        <div className="text-center mb-3">
          <button className="btn btn-outline-dark py-0 px-2 fs09em"
                  onClick={() => setApproxData([...approxData, { reps:"", peso:"" }])}>
            Anadir otra aproximacion
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
      message={`Estas seguro de que deseas eliminar el circuito "${circuitToDelete?.name}"?`}
      header="Eliminar circuito"
      icon="pi pi-exclamation-triangle"
      acceptLabel="Si"
      rejectLabel="No"
      accept={confirmDeleteCircuitInBlock}
      reject={() => setShowDeleteCircuitDialog(false)}
      className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
    />

      <ConfirmDialog
          visible={showDeleteExerciseInCircuitDialog}
          onHide={() => setShowDeleteExerciseInCircuitDialog(false)}
          message={`Estas seguro de que deseas eliminar el ejercicio "${exerciseToDeleteInCircuit?.exerciseName}"?`}
          header="Eliminar ejercicio"
          icon="pi pi-exclamation-triangle"
          acceptLabel="Si"
          rejectLabel="No"
          accept={confirmDeleteExerciseInCircuit}
          reject={() => setShowDeleteExerciseInCircuitDialog(false)}
          className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
        />

        <ConfirmDialog
          visible={showDeleteBlockDialog}
          onHide={() => setShowDeleteBlockDialog(false)}
          message={`Estas seguro de que deseas eliminar el bloque "${blockToDelete.name}"?`}
          header="Eliminar bloque"
          icon="pi pi-exclamation-triangle"
          acceptLabel="Si"
          rejectLabel="No"
          accept={confirmDeleteBlock}
          reject={() => setShowDeleteBlockDialog(false)}
          className={`coachConfirmDialog ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}
        />

        </section>
      </div>
    </div>
  );
}

export default DayEditDetailsPage;



