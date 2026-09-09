import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './UserRoutineEditPage.css';

//.............................. SERVICES ..............................//
import * as WeekService from '../../services/week.services.js';
import * as ParService from '../../services/par.services.js';
import * as UserServices from '../../services/users.services.js';
import * as BlockService from '../../services/blocks.services.js';


//.............................. HELPERS ..............................//
import * as NotifyHelper from './../../helpers/notify.js';
import * as RefreshFunction from './../../helpers/generateUUID.js';

//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { Tour } from 'antd';
import { Dialog } from 'primereact/dialog';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ObjectId from 'bson-objectid';
// >>> Agregados para el editor de comentarios:
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { SpeedDial } from 'primereact/speeddial';

//.............................. COMPONENTES ..............................//
import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';
import LogoChico from '../../components/LogoChico.jsx';
import BloquesForm from './../../components/BloquesForm.jsx';
import RoutineWeeksBlockSelect from '../../components/RoutineWeeksBlockSelect.jsx';

//.............................. ICONOS LUCIDE ..............................//
import {
  HelpCircle,
  Info,
  CalendarPlus,
  Repeat,
  ClipboardCopy,
  Eye,
  EyeOff,
  MessageSquare,
  Copy,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Video,
  Pencil,
  UserPen,
  Plus,
  FileText,
  MessageSquareText,
  Settings
} from 'lucide-react';

//.............................. ICONOS MUI ..............................//
import IconButton from "@mui/material/IconButton";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Edit } from 'lucide-react';
import { NotepadText } from 'lucide-react';
import { FilePlus } from 'lucide-react';
import { SquarePlus } from 'lucide-react';
import { CopyPlus } from 'lucide-react';
import { Files } from 'lucide-react';
import { ToggleRight } from 'lucide-react';
import { ToggleLeft } from 'lucide-react';

const COMMENTS_PREVIEW_LIMIT = 65;
const ROUTINE_WEEKS_SETTINGS_KEY = `routineWeeksSettings:${localStorage.getItem("_id") || "global"}`;
const DEFAULT_ROUTINE_WEEKS_SETTINGS = {
  order: "newest",
  pageSize: 8,
  density: "comfortable",
};

const getCommentsPreview = (value) => {
  const text = String(value || "").trim();
  if (!text) return "No hay comentarios";
  if (text.length <= COMMENTS_PREVIEW_LIMIT) return text;
  return `${text.slice(0, COMMENTS_PREVIEW_LIMIT).trimEnd()}...`;
};

const hasLongComments = (value) => String(value || "").trim().length > COMMENTS_PREVIEW_LIMIT;

function UserRoutineEditPage({ editorTheme = 'light' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { username } = useParams();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [weekPendingDelete, setWeekPendingDelete] = useState(null);

  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState([]);
  const [weekNumber, setWeekNumber] = useState(0);
  const [weekClipboardLocalStorage, setWeekClipboardLocalStorage] = useState();
  const [collapsed, setCollapsed] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [tourVisible, setTourVisible] = useState(false);
  const [firstWidth, setFirstWidth] = useState();
  const [weeklySummary, setWeeklySummary] = useState({
    selection1: "",
    selection2: "",
    selection3: "",
    selection4: "",
    selection5: "",
    comments: "",
    lastSaved: ""
  });

  // visibilidad de cada SpeedDial (controlado)
  const [isResumenDialVisible, setIsResumenDialVisible] = useState(false);
  const [isWeeksDialVisible, setIsWeeksDialVisible] = useState(false);
  const [isToolsDialVisible, setIsToolsDialVisible] = useState(false);

  // se usa solo para el blur del contenido
  const isSpeedDialOpen = isResumenDialVisible || isWeeksDialVisible || isToolsDialVisible;

   useEffect(() => {
    if (!isSpeedDialOpen) return;

    const handleClickOutside = (event) => {
      // Si el click fue dentro de algun SpeedDial (boton o items), no hacemos nada.
      //
      // El dock mobile TIENE que estar en esta lista. Este listener corre en fase
      // de CAPTURA sobre document, o sea antes que el onClick del boton: si no se
      // exime, cierra el menu, React desmonta el boton y el click termina llegando
      // a un elemento que ya no esta en el DOM. Resultado: en mobile ninguna opcion
      // del dock hacia nada (ni "Nueva semana", ni "Cargar correcciones", etc.),
      // sin error ni request. El dock fue un rediseno posterior y quedo afuera de
      // esta exencion, escrita para el SpeedDial viejo.
      if (
        event.target.closest('.p-speeddial') ||        // contenedor de PrimeReact
        event.target.closest('.bottom-dial') ||        // wrapper que usas en el navbar
        event.target.closest('.week-mobile-actionbar') // dock mobile: botones + menus
      ) {
        return;
      }

      // Cerrar todos los SpeedDial
      setIsResumenDialVisible(false);
      setIsWeeksDialVisible(false);
      setIsToolsDialVisible(false);
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isSpeedDialOpen]);

  const [showDriveLinkDialog, setShowDriveLinkDialog] = useState(false);
  const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState();
  const [profile, setProfile] = useState(true);
  const [showCorrectionsDialog, setShowCorrectionsDialog] = useState(false);
  const [correctionsText, setCorrectionsText] = useState("");

  const [showCommentsDialog, setShowCommentsDialog] = useState(false); // (resumen semanal: visor)

  const [blocks, setBlocks] = useState([]);
  const [trainer_id] = useState(localStorage.getItem("_id"));
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockDialogWeek, setBlockDialogWeek] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [showManageBlocksDialog, setShowManageBlocksDialog] = useState(false);
  const [blockPendingEdit, setBlockPendingEdit] = useState(null);

  const [weekDate, setWeekDate] = useState(() => {
    return localStorage.getItem("weekDate") || "";
  });

  const [useDate, setUseDate] = useState(() => {
    const saved = localStorage.getItem("useDate");
    return saved === "true";
  });

  const [showModeDialog, setShowModeDialog] = useState(false);
  const [routineWeeksSettings, setRoutineWeeksSettings] = useState(() => {
    try {
      return {
        ...DEFAULT_ROUTINE_WEEKS_SETTINGS,
        ...(JSON.parse(localStorage.getItem(ROUTINE_WEEKS_SETTINGS_KEY)) || {}),
      };
    } catch {
      return DEFAULT_ROUTINE_WEEKS_SETTINGS;
    }
  });

  const [isEditable, setIsEditable] = useState(() => {
    const saved = localStorage.getItem("isEditable");
    return saved === "true";
  });

  // ====== Comentarios por semana (editor) ======
  // Estado y opciones del editor de comentarios para cada semana (MessageSquare)
  const [showWeekCommentsDialog, setShowWeekCommentsDialog] = useState(false);
  const [commentsWeekId, setCommentsWeekId] = useState(null);
  const [commentsTitle, setCommentsTitle] = useState("Comentarios semanales");
  const [commentsDescription, setCommentsDescription] = useState("");
  const [commentsMode, setCommentsMode] = useState("free"); // "free" | "days"
  const [commentsDaysMeta, setCommentsDaysMeta] = useState([]); // [{_id,label}]
  const [commentsByDay, setCommentsByDay] = useState({}); // { [dayId]: text }
  // ====== /Comentarios por semana ======

  // ====== Estado acordeon para MOBILE ======
  const [expanded, setExpanded] = useState(() => new Set());
  const toggleExpanded = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resolveWeekBlock = React.useCallback((week, availableBlocks = blocks) => {
   if (!week) return week;

   const blockId = week.block?._id?.toString() || week.block_id?.toString() || null;
   if (!blockId) {
     return week.block || week.block_id ? { ...week, block: null, block_id: null } : week;
   }

   const resolvedBlock =
     availableBlocks.find((block) => String(block._id) === String(blockId)) ||
     (week.block ? { ...week.block, _id: String(blockId) } : null);

   return {
     ...week,
     block: resolvedBlock,
     block_id: String(blockId)
   };
  }, [blocks]);

  const loadBlocks = React.useCallback(async () => {
    if (!trainer_id) {
      setBlocks([]);
      return;
    }

    try {
      const raw = await BlockService.getBlocks(trainer_id);
      const normalized = Array.isArray(raw)
        ? raw.map((block) => ({ ...block, _id: block._id.toString() }))
        : [];
      setBlocks(normalized);
    } catch (error) {
      console.error("Error cargando bloques", error);
      setBlocks([]);
    }
  }, [trainer_id]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  useEffect(() => {
    setTourSteps([
      { title: 'Switch de semana',
        description: 'Este switch permite que crees las semanas de manera numérica ( semana 1, semana 2, etc..) o, la creación de semanas a partir de la fecha actual.',
        target: () => document.getElementById('switchWeek'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Resumen semanal',
        description: 'Estos datos son rellenados por el alumno. La idea es que los llene semana a semana para poder trabajar con más información.',
        target: () => document.getElementById('resumen'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Devolución',
        description: 'Este botón sirve para poder cargar la corrección al alumno. El la vera cuando entre a la sección de "Ver Rutina"',
        target: () => document.getElementById('correcciones'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Drive',
        description: 'Cuando el usuario suba su link de drive, podrás ingresar a su carpeta. La idea es manejar los videos mediante este sistema, para que tengas todo centralizado.',
        target: () => document.getElementById('drive'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Crear semana de 0',
        description: 'Este botón crea una semana de 0, ideal para comenzar un nuevo bloque.',
        target: () => document.getElementById('week0'),
        placement: 'top',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Continuar con la rutina',
        description: 'Este botón crea una copia de la última semana. Ideal para continuar el bloque de entrenamiento.',
        target: () => document.getElementById('continueWeek'),
        placement: 'top',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Pegar rutina del portapapeles',
        description: 'Botón para pegar una rutina, previamente copiada. Puede ser una rutina, tanto de otro alumno, como del que se encuentra.',
        target: () => document.getElementById('paste'),
        placement: 'top',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: '!Finalizar!' } }
    ]);
  }, [username]);

  useEffect(() => {
    setLoading(true);
    setFirstWidth(window.innerWidth);
    NotifyHelper.notifyA("Cargando semanas...");

    WeekService.findRoutineByUserId(id)
      .then(data => {
        sessionStorage.setItem('WEEKS', JSON.stringify(data))
        const normalized = data.map(w => {
          const visibleMs = w?.visible_at ? Date.parse(w.visible_at) : null;
          const createdMs = w?.created_at ? Date.parse(w.created_at) : null;

          // Por defecto, usamos created_at
          let effectiveMs = typeof createdMs === 'number' ? createdMs : 0;
          let effectiveLabel = 'Creado';

          // Si visible_at existe y es mas reciente, gana
          if (typeof visibleMs === 'number' && visibleMs > effectiveMs) {
            effectiveMs = visibleMs;
            effectiveLabel = 'Visible';
          }

          const effectiveIso = effectiveMs ? new Date(effectiveMs).toISOString() : null;

          return resolveWeekBlock({
            ...w,
            // Normalizaciones previas
            block_id: w.block_id ? w.block_id.toString() : null,
            block: w.block?._id
              ? { ...w.block, _id: w.block._id.toString() }
              : null,
            visibility: w.visibility || 'visible',

            // --- Campos derivados para la UI ---
            effectiveDate: effectiveIso,      // fecha que manda (visible o creada)
            effectiveLabel,                   // 'Visible' | 'Creado'

            created_at: effectiveIso || w.created_at || null,
            created_label: effectiveLabel
          });
        })
        .sort((a, b) => {
          const aT = a.effectiveDate ? Date.parse(a.effectiveDate) : 0;
          const bT = b.effectiveDate ? Date.parse(b.effectiveDate) : 0;
          return bT - aT;
        });

        setRoutine(normalized);
        setWeekNumber(normalized.length + 1);
        setLoading(false);
        NotifyHelper.updateToast();
      });
    // resolveWeekBlock NO va en las dependencias: es un useCallback atado a
    // `blocks`, asi que cambia de identidad cuando los bloques terminan de
    // cargar y volvia a disparar todo el efecto. Eso pedia las semanas de nuevo
    // y mostraba un segundo "Listo!". El efecto de abajo ya re-resuelve los
    // bloques cuando llegan, asi que aca no hace falta.
  }, [status, id]);

  useEffect(() => {
    if (!blocks.length) return;

    setRoutine((prev) => prev.map((week) => resolveWeekBlock(week)));
    setBlockDialogWeek((prev) => (prev ? resolveWeekBlock(prev) : prev));
  }, [blocks, resolveWeekBlock]);

  useEffect(() => {
    UserServices.getProfileById(id)
      .then((data) => {
        setProfile(data);
        setWeeklySummary(data.resumen_semanal || {
          selection1: "",
          selection2: "",
          selection3: "",
          selection4: "",
          selection5: "",
          comments: "",
          lastSaved: ""
        });
      })
      .catch((error) => {
        console.error("Error al obtener el perfil del usuario:", error);
      });
  }, [id]);

 const buildOptions = (currentBlock) => {
 const base = [
   { name: "Agregar bloque", _id: "add-new-block" },
   { name: "Sin bloque", _id: null },
 ];
 const extra = currentBlock && !blocks.find((b) => b._id === currentBlock._id)
   ? [currentBlock]
   : [];
 return [...base, ...blocks, ...extra];
 };

 // === ACTUALIZADO: tambien refresca el bloque mostrado dentro del dialogo
  const handleAssignBlock = async (routineId, block) => {
   try {
      await WeekService.assignBlockToRoutine(routineId, block || null);
      const selectedBlock = block?._id ? { ...block, _id: String(block._id) } : null;

      // actualizar lista de semanas
      setRoutine(prev =>
        prev.map(r => r._id === routineId
          ? { ...r, block: selectedBlock, block_id: selectedBlock?._id || null }
          : r
        )
      );

      // **refrescar el bloque visible dentro del dialogo abierto**
      setBlockDialogWeek(prev =>
        prev && prev._id === routineId
          ? { ...prev, block: selectedBlock, block_id: selectedBlock?._id || null }
          : prev
      );

     NotifyHelper.instantToast("Bloque asignado con éxito");
   } catch (err) {
     console.error("Error actualizando bloque", err);
     NotifyHelper.instantToast("Error al guardar el bloque");
     throw err;
   }
 };

 const handleBlockDropdownChange = async (weekId, value) => {
   if (value === "add-new-block") {
     setBlockPendingEdit(null);
     setShowManageBlocksDialog(true);
     return;
   }
   const selected = blocks.find(b => b._id === value) || null;
   setSelectedBlockId(value);

   // adelantar el cambio en el propio dialogo para feedback inmediato
   setBlockDialogWeek(prev =>
     prev && prev._id === weekId
       ? { ...prev, block: selected || null, block_id: selected?._id || null }
       : prev
   );

   return handleAssignBlock(weekId, selected);
 };

 const handleEditBlockFromSelect = (block) => {
   if (!block?._id) return;
   setBlockPendingEdit(block);
   setShowManageBlocksDialog(true);
 };

  const copyRoutine = (data) => {
    setWeekClipboardLocalStorage(data);
  };

  useEffect(() => {
    setWeekClipboardLocalStorage(localStorage.getItem('userWeek'));
  }, [copyRoutine]);

  const handleToggleUseDate = () => {
    const newValue = !useDate;
    setUseDate(newValue);
    localStorage.setItem("useDate", newValue.toString());
  };

  const updateRoutineWeeksSetting = (key, value) => {
    setRoutineWeeksSettings((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(ROUTINE_WEEKS_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const visibleRoutine = useMemo(() => {
    const list = Array.isArray(routine) ? [...routine] : [];
    return routineWeeksSettings.order === "oldest" ? list.reverse() : list;
  }, [routine, routineWeeksSettings.order]);

  function createWeek() {
    setLoading(true);

    let name;
    if (useDate) {
      const currentDate = new Date().toLocaleDateString();
      localStorage.setItem("weekDate", currentDate);
      setWeekDate(currentDate);
      name = `Semana del ${currentDate}`;
    } else {
      name = `Semana ${weekNumber}`;
    }

    // Enviamos visibility por defecto al crear
    WeekService.createWeek({ name, visibility: 'visible' }, id)
      .then(() => setStatus(RefreshFunction.generateUUID()));
  }

  function createWeekCopyLastWeek() {
    setLoading(true);
    WeekService.createClonWeek(id, { fecha: useDate ? 'isDate' : 'noDate' })
      .then(() => {
        setStatus(RefreshFunction.generateUUID());
      });
  }

  // ================== NORMALIZACION Y DEDUP ==================
  const isPlainExercise = (ex) => ex && ex.type === 'exercise';
  const isBlock = (ex) => ex && ex.type === 'block';
  const isCircuit = (ex) => ex && ex.type !== 'exercise' && ex.type !== 'block' && Array.isArray(ex.circuit);

  const stripAthleteExerciseFields = (exercise) => {
    if (!exercise || typeof exercise !== 'object') return exercise;

    const { athleteRpeRir, rpeRir, ...rest } = exercise;
    const clean = { ...rest };

    if (Array.isArray(clean.exercises)) {
      clean.exercises = clean.exercises.map(stripAthleteExerciseFields);
    }

    if (Array.isArray(clean.circuit)) {
      clean.circuit = clean.circuit.map(stripAthleteExerciseFields);
    }

    return clean;
  };

  const stripAthleteWeekFields = (week) => {
    if (!week || typeof week !== 'object') return week;

    const cleanWeek = { ...week };
    const days = Array.isArray(cleanWeek.routine)
      ? cleanWeek.routine
      : Array.isArray(cleanWeek.routine?.days)
        ? cleanWeek.routine.days
        : Array.isArray(cleanWeek.days)
          ? cleanWeek.days
          : null;

    const cleanDays = days?.map((day) => ({
      ...day,
      exercises: Array.isArray(day?.exercises)
        ? day.exercises.map(stripAthleteExerciseFields)
        : day?.exercises
    }));

    if (Array.isArray(cleanWeek.routine)) {
      cleanWeek.routine = cleanDays;
    } else if (cleanWeek.routine?.days && Array.isArray(cleanDays)) {
      cleanWeek.routine = { ...cleanWeek.routine, days: cleanDays };
    } else if (Array.isArray(cleanWeek.days)) {
      cleanWeek.days = cleanDays;
    }

    return cleanWeek;
  };

  const cloneWithNewIdIfMissing = (obj, field) => {
    const id = obj?.[field];
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return { ...obj, [field]: new ObjectId().toString() };
    }
    return obj;
  };

  const normalizeDay = (day) => {
    // nuevo _id de dia para evitar colisiones
    const normalizedDay = {
      ...day,
      _id: new ObjectId().toString()
    };

    const seenIds = new Set();
    const visualDupes = []; // para warning: (name, numberExercise, supSuffix)

    const normalizedExercises = [];

    for (const el of (day.exercises || [])) {
      // BLOQUE
      if (isBlock(el)) {
        const newBlockId = new ObjectId().toString();
        const normalizedBlock = {
          ...el,
          block_id: newBlockId,
          // normalizamos ejercicios internos
          exercises: (el.exercises || []).map(inner => {
            if (isPlainExercise(inner)) {
              // cada exercise interno debe tener exercise_id unico
              let e = cloneWithNewIdIfMissing(inner, 'exercise_id');
              // si su id ya existe en este dia, generamos uno nuevo
              if (seenIds.has(e.exercise_id)) {
                e = { ...e, exercise_id: new ObjectId().toString() };
              }
              seenIds.add(e.exercise_id);
              return e;
            }
            if (isCircuit(inner)) {
              // los circuitos no usan exercise_id propio; solo aseguramos idRefresh en items
              const c = { ...inner };
              c.circuit = (inner.circuit || []).map(item => ({
                ...item,
                idRefresh: item?.idRefresh || RefreshFunction.generateUUID()
              }));
              return c;
            }
            // fallback
            return inner;
          })
        };
        normalizedExercises.push(normalizedBlock);
        continue;
      }

      // CIRCUITO (raiz)
      if (isCircuit(el)) {
        const c = { ...el };
        c.exercise_id = el.exercise_id || new ObjectId().toString(); // a veces lo tienen
        if (seenIds.has(c.exercise_id)) {
          c.exercise_id = new ObjectId().toString();
        }
        seenIds.add(c.exercise_id);
        c.circuit = (el.circuit || []).map(item => ({
          ...item,
          idRefresh: item?.idRefresh || RefreshFunction.generateUUID()
        }));
        normalizedExercises.push(c);
        continue;
      }

      // EJERCICIO SUELTO
      if (isPlainExercise(el)) {
        let e = cloneWithNewIdIfMissing(el, 'exercise_id');
        if (seenIds.has(e.exercise_id)) {
          // mismo ID => regenero para evitar colision
          e = { ...e, exercise_id: new ObjectId().toString() };
        }
        seenIds.add(e.exercise_id);

        // registro "dupe visual" (no borro, solo advierto)
        const k = [String(e.name || '').trim(), String(e.numberExercise ?? ''), String(e.supSuffix || '')].join('|');
        const already = visualDupes.find(v => v.key === k);
        if (!already) {
          visualDupes.push({ key: k, count: 1, sample: e });
        } else {
          already.count += 1;
        }

        normalizedExercises.push(e);
        continue;
      }

      // fallback: si llega algo raro, lo empujo tal cual
      normalizedExercises.push(el);
    }

    // Senales de "posibles duplicados visuales"
    const visualWarnings = visualDupes.filter(v => v.count > 1);

    return {
      day: { ...normalizedDay, exercises: normalizedExercises },
      warnings: {
        dupesById: 0, // ya solventado regenerando; si quisieras contarlos, podes aumentar aqui
        dupesVisual: visualWarnings
      }
    };
  };


  const openConfirmDelete = (w) => {
  setWeekPendingDelete(w);
  setConfirmDeleteOpen(true);
};

const confirmDeleteWeek = async () => {
  if (!weekPendingDelete) return;
  try {
    await WeekService.deleteWeek(weekPendingDelete._id);
    setConfirmDeleteOpen(false);
    setWeekPendingDelete(null);
    setStatus(RefreshFunction.generateUUID());
    NotifyHelper.instantToast('Semana eliminada.');
  } catch (e) {
    console.error(e);
    NotifyHelper.instantToast('No se pudo eliminar. Verifica la API.');
  }
};

const cancelDeleteWeek = () => {
  setConfirmDeleteOpen(false);
  setWeekPendingDelete(null);
};

  const normalizeWeekForPaste = (rawWeek) => {
    if (!rawWeek || typeof rawWeek !== 'object') return { week: rawWeek, warnings: [] };

    // clonar superficial
    const cloned = stripAthleteWeekFields(rawWeek);
    // nuevo _id de semana (si existiese)
    if ('_id' in cloned) {
      cloned._id = new ObjectId().toString();
    }

    const warnings = [];
    const days = Array.isArray(cloned.routine) ? cloned.routine : cloned.routine?.days || cloned.days || [];

    const normalizedDays = [];
    for (const d of (days || [])) {
      const { day, warnings: w } = normalizeDay(d);

      // normalizar warmup/movility IDs para evitar choques
      day.warmup = (d.warmup || []).map(wu => ({
        ...wu,
        warmup_id: wu?.warmup_id ? String(wu.warmup_id) : new ObjectId().toString()
      }));
      day.movility = (d.movility || []).map(mv => ({
        ...mv,
        movility_id: mv?.movility_id ? String(mv.movility_id) : new ObjectId().toString()
      }));

      normalizedDays.push(day);

      if (w.dupesVisual?.length) {
        warnings.push({
          dayName: d.name || '(Día sin nombre)',
          type: 'visual-duplicates',
          items: w.dupesVisual.map(v => ({
            key: v.key,
            count: v.count,
            example: {
              name: v.sample?.name,
              numberExercise: v.sample?.numberExercise,
              supSuffix: v.sample?.supSuffix
            }
          }))
        });
      }
    }

    // Acomodar la forma final segun tu API:
    const finalWeek = {
      ...cloned,
      routine: normalizedDays
    };

    return { week: finalWeek, warnings };
  };
  // ================== /NORMALIZACION Y DEDUP ==================

  const loadFromLocalStorage = () => {
  try {
    const storedWeek = localStorage.getItem('userWeek');

    if (!storedWeek) {
      alert('No hay datos en localStorage!');
      return;
    }

    const parsedData = JSON.parse(storedWeek);
      // 1) normalizamos + dedup por ID + regeneramos IDs
      const { week, warnings } = normalizeWeekForPaste(parsedData);

      // 2) avisos UX: posibles duplicados "visuales"
      if (warnings.length) {
        // Un toast corto y log extenso a consola para debug
        NotifyHelper.instantToast('Atención: se detectaron ejercicios con mismo número/nombre (posibles superseries duplicadas). Revisa el día pegado.');
        console.warn('Posibles duplicados visuales al pegar semana:', warnings);
      }

      setLoading(true);
      ParService.createPARroutine(week, id)
        .then(() => {
          setLoading(false);
          setStatus(RefreshFunction.generateUUID());
          NotifyHelper.updateToast();
        })
        .catch(err => {
          setLoading(false);
          console.error('Error al crear rutina pegada:', err);
          NotifyHelper.instantToast('Error al pegar la semana');
        });

    } catch (err) {
      console.error('Error al cargar desde localStorage: ', err);
      NotifyHelper.instantToast('Contenido inválido en portapapeles');
    }
  };

  const getBadgeStyle = (value) => {
    if (!value) return 'bg-secondary';
    const val = value.toLowerCase();
    if (val.includes('muy bien')) return 'bg-success';
    if (val.includes('bien')) return 'bg-success-subtle text-dark';
    if (val.includes('regular')) return 'bg-warning text-dark';
    if (val.includes('mal')) return 'bg-danger';
    return 'bg-secondary';
  };

  const handleCorrectionsSave = () => {
    const now = new Date().toISOString();

    const {
      _id,
      id: ignoredId,
      user_id,
      ...safeProfile
    } = profile;

    const updatedProfile = {
      ...safeProfile,
      devolucion: correctionsText,
      devolucionFecha: now
    };

    UserServices.editProfile(id, updatedProfile)
      .then(() => {
        NotifyHelper.instantToast('Devolución actualizada con éxito!');
        setProfile(prev => ({
          ...prev,
          devolucion: correctionsText,
          devolucionFecha: now
        }));
        setShowCorrectionsDialog(false);
      })
      .catch((err) => {
        console.error("Código de error:", err.status);
        console.error("Detalle del error:", err.data);
        NotifyHelper.instantToast('Error al guardar la devolución');
      });
  };

  // ======= Helpers acciones y edicion =======

  // === ACTUALIZADO: construyo la ruta igual que en la web
  const makeWeekViewPath = (w) => {
    const firstDayId =
      w?.routine?.[0]?._id ||
      w?.days?.[0]?._id ||
      w?.routine?.days?.[0]?._id;
    if (firstDayId) {
      return `/routine/user/${id}/week/${w._id}/day/${firstDayId}/${username}`;
    }
    // fallback si no hay dias
    return `/weeks/${w._id}`;
  };

  const handleViewWeek = (w) => {
    try {
      navigate(makeWeekViewPath(w));
    } catch {
      NotifyHelper.instantToast('Ajusta la ruta de detalle de semana.');
    }
  };

  // ====== LOGICA: abrir editor de comentarios (MessageSquare) ======
  const handleOpenWeekComments = (w) => {
    setCommentsWeekId(w._id);
    setCommentsTitle(w.comments?.title || "Comentarios semanales");
    setCommentsDescription(w.comments?.description || "");

    const initialMode = w.comments?.mode === "days" ? "days" : "free";
    setCommentsMode(initialMode);

    // meta de dias segun la semana
    const daysMeta = (w.routine || []).map((d, idx) => ({
      _id: String(d._id),
      label: d?.name || d?.title || `Día ${idx + 1}`,
    }));
    setCommentsDaysMeta(daysMeta);

    // valores por dia (acepta array u objeto)
    let initialByDay = {};
    const fromServer =
      w.comments?.days ||
      w.comments?.daysMap ||
      (w.comments?.days && typeof w.comments.days === "object"
        ? w.comments.days
        : null);

    if (fromServer && typeof fromServer === "object") {
      if (Array.isArray(fromServer)) {
        fromServer.forEach((it) => {
          if (it && it.dayId != null) {
            initialByDay[String(it.dayId)] = String(it.text ?? "");
          }
        });
      } else {
        initialByDay = Object.keys(fromServer).reduce((acc, k) => {
          acc[String(k)] = String(fromServer[k] ?? "");
          return acc;
        }, {});
      }
    }
    setCommentsByDay(initialByDay);

    setShowWeekCommentsDialog(true);
  };

function FabMenu({ id, items, position = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("click", close, true);
    return () => document.removeEventListener("click", close, true);
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className={`fab-wrap fab-${position}`}
      style={{ position: "fixed", bottom: 20, zIndex: 2200, [position]: 16 }}
    >
      {open && (
        <div className="fab-menu shadow">
          {items.map(({ label, icon, onClick }, i) => (
            <button
              key={i}
              type="button"
              className="fab-item"
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
            >
              <span className="me-2">+</span>
              {icon}
              <span className="ms-2">{label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="fab-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="acciones rapidas"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

  // Construye payload compatible con back
  const buildCommentsPayload = () => {
    const base = { title: commentsTitle?.trim() || "Comentarios semanales" };

    if (commentsMode === "days") {
      const daysArr = commentsDaysMeta.map((d) => ({
        dayId: String(d._id),
        label: d.label,
        text: String(commentsByDay[d._id] || "").trim(),
      }));

      const daysMap = commentsDaysMeta.reduce((acc, d) => {
        acc[String(d._id)] = String(commentsByDay[d._id] || "").trim();
        return acc;
      }, {});

      return {
        comments: { ...base, mode: "days", days: daysArr, daysMap },
      };
    }

    return {
      comments: { ...base, mode: "free", description: commentsDescription || "" },
    };
  };

      const itemsResumenAndDevolution = [
        {
              label: 'Resumen semanal',
              command: () => setShowWeeklySummaryModal(true),
              template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      {/* Boton / icono principal */}
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <NotepadText size={45} />
                      </button>

                      {/* "Tooltip" siempre visible */}
                      <span className="tooltip-right">
                        Resumen semanal
                      </span>
                    </div>
                  )
                },{
                label: 'Cargar correcciones',
                command: () => setShowCorrectionsDialog(true),
                template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      {/* Boton / icono principal */}
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <FilePlus size={45} />
                      </button>

                      {/* "Tooltip" siempre visible */}
                      <span className="tooltip-right">
                        Cargar correcciones
                      </span>
                    </div>
                  )
                },
                {
                label: 'Ver videos subidos',
                command: () => setShowDriveLinkDialog(true),
                template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      {/* Boton / icono principal */}
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <Video size={45} />
                      </button>

                      {/* "Tooltip" siempre visible */}
                      <span className="tooltip-right">
                        Ver videos subidos
                      </span>
                    </div>
                  )
                }

              ];

              const itemsWeeks = [
        {
              label: 'Nueva semana',
              command: () => createWeek(),
              template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      {/* Boton / icono principal */}
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <SquarePlus size={45} />
                      </button>

                      {/* "Tooltip" siempre visible */}
                      <span className="tooltip-right">
                        Nueva semana
                      </span>
                    </div>
                  )
                },{
                label: 'Seguir semana',
                command: () => createWeekCopyLastWeek(),
                template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      {/* Boton / icono principal */}
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <CopyPlus size={45} />
                      </button>

                      {/* "Tooltip" siempre visible */}
                      <span className="tooltip-right">
                        Seguir semana
                      </span>
                    </div>
                  )
                },
                {
                label: 'Pegar semana',
                command: () => loadFromLocalStorage(),
                template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      {/* Boton / icono principal */}
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <Files size={45} />
                      </button>

                      {/* "Tooltip" siempre visible */}
                      <span className="tooltip-right">
                        Pegar semana
                      </span>
                    </div>
                  )
                }

              ];

              const itemsHerramientas = [
              {
                  label: 'Modo fecha',
                  command: () => setShowModeDialog(true),
                  template: (item, opts) => (
                    <div className="dial-item-tooltip-wrapper">
                      <button
                        type="button"
                        {...opts}
                        className="styleItemsDial styleDial rounded-5 d-flex align-items-center justify-content-center"
                      >
                        <ToggleLeft size={45} />
                      </button>
                      <span className="tooltip-left">
                        Modo fecha / numerico
                      </span>
                    </div>
                  )
                }
              ];

  // Guardar comentarios
  const handleSaveWeekComments = async () => {
    try {
      const payload = buildCommentsPayload();
      await WeekService.updateWeekProperties(commentsWeekId, payload);

      // update optimista de la lista
      setRoutine((prev) =>
        prev.map((w) =>
          w._id === commentsWeekId ? { ...w, comments: payload.comments } : w
        )
      );

      setShowWeekCommentsDialog(false);
      NotifyHelper.instantToast("Comentarios guardados con éxito");
    } catch (err) {
      console.error("Error guardando comentarios", err);
      NotifyHelper.instantToast("Error al guardar los comentarios");
    }
  };
  // ====== /LOGICA comentar ======

  const handleCommentWeek = (w) => {
    // abrir editor con la semana seleccionada
    handleOpenWeekComments(w);
  };

  const handleCopyWeek = (w) => {
    try {
      localStorage.setItem('userWeek', JSON.stringify(stripAthleteWeekFields(w)));
      NotifyHelper.instantToast('Semana copiada al portapapeles local.');
    } catch {
      NotifyHelper.instantToast('No se pudo copiar la semana.');
    }
  };

  const handleDeleteWeek = async (w) => {
    try {
      await WeekService.deleteWeek(w._id);
      setStatus(RefreshFunction.generateUUID());
      NotifyHelper.instantToast('Semana eliminada.');
    } catch (e) {
      console.error(e);
      NotifyHelper.instantToast('No se pudo eliminar. Verifica la API.');
    }
  };

const handleEditBlock = (w) => {
   const resolvedWeek = resolveWeekBlock(w);
   const blockId = resolvedWeek.block_id?.toString() || resolvedWeek.block?._id?.toString() || null;
   setBlockDialogWeek(resolvedWeek);
   setSelectedBlockId(blockId);
   setShowBlockDialog(true);
 };

  // ======= Formateo fechas seguro =======
  const fmt = (dateLike) => {
    if (!dateLike) return '-';
    if (typeof dateLike === 'object' && !(dateLike instanceof Date)) {
      if ('fecha' in dateLike) return `${dateLike.fecha || '-'} ${dateLike.hora || ''}`.trim();
      return '-';
    }
    const ms =
      typeof dateLike === 'string' ? Date.parse(dateLike)
      : dateLike instanceof Date ? dateLike.getTime()
      : Number(dateLike);
    if (!ms || Number.isNaN(ms)) return '-';
    try { return new Date(ms).toLocaleString(); } catch { return '-'; }
  };

  const formatTrainerCreatedDate = (week) => (
    fmt(week?.created_at_local || week?.created_local || week?.created_at || week?.effectiveDate)
  );

  const formatAthleteDate = (week) => (
    fmt(week?.updated_user_at || week?.athlete_updated_at || week?.user_updated_at || week?.updatedUserAt)
  );

  const handleToggleVisibilityMobile = async (week) => {
    const currentVisibility = week?.visibility || 'visible';
    const nextVisibility = currentVisibility === 'hidden' ? 'visible' : 'hidden';

    try {
      await WeekService.updateWeekProperties(week._id, { visibility: nextVisibility });

      setRoutine((prev) => {
        const nowIso = new Date().toISOString();
        return prev.map((item) => {
          if (item._id !== week._id) return item;
          return {
            ...item,
            visibility: nextVisibility,
            visible_at: nextVisibility === 'visible' ? nowIso : null,
            effectiveDate: nextVisibility === 'visible' ? nowIso : item.effectiveDate,
            created_label: nextVisibility === 'visible' ? 'Visible' : item.created_label
          };
        });
      });

      NotifyHelper.instantToast(
        nextVisibility === 'hidden'
          ? 'Semana ocultada para el alumno.'
          : 'Semana visible para el alumno.'
      );
    } catch (error) {
      console.error('Error al cambiar visibilidad de semana:', error);
      NotifyHelper.instantToast('No se pudo cambiar la visibilidad.');
    }
  };

  // ======= Estilos y componente para las "tarjetas" =======
  const tileBase = {
    width: '100%',
    borderRadius: 16,
    padding: '14px 12px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,.12)',
    transition: 'transform .12s ease, box-shadow .12s ease',
    cursor: 'pointer',
    userSelect: 'none'
  };
  const tileDisabled = {
    opacity: .55,
    cursor: 'not-allowed',
    filter: 'grayscale(20%)'
  };
  const iconWrap = {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'rgba(255,255,255,.2)',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 8
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, lineHeight: 1.1, textAlign: 'center' };

  const ActionTile = ({ gradient, icon, label, onClick, disabled, id }) => (
    <button
      id={id}
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className="border-0 p-0 bg-transparent routine-modern-action-button"
      style={{ width: '100%' }}
    >
      <div
        style={{
          ...tileBase,
          ...(disabled ? tileDisabled : {}),
          background: gradient
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,.18)')}
        onMouseLeave={(e) => !disabled && (e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.12)')}
      >
        <div style={iconWrap}>{icon}</div>
        <span style={labelStyle}>{label}</span>
      </div>
    </button>
  );

  const leftDialItems = [
  {
    label: 'Resumen semanal',
    command: () => setShowWeeklySummaryModal(true),
    template: (item, opts) => (
      <button {...opts} title={item.label}><svg width="18" height="18"><path d="M3 4h12M3 8h12M3 12h8" stroke="currentColor" strokeWidth="2" fill="none"/></svg></button>
    )
  },
  {
    label: 'Cargar comentarios',
    command: () => {
      const latest = routine?.[0];
      if (latest) handleOpenWeekComments(latest);
      else NotifyHelper.instantToast('No hay semanas para comentar.');
    },
    template: (item, opts) => (
      <button {...opts} title={item.label}><svg width="18" height="18"><path d="M21 15v4l-4-4H7a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10z" stroke="currentColor" strokeWidth="2" fill="none"/></svg></button>
    )
  }
];

// FAB Derecho: Videos + Correcciones
const rightDialItems = [
  {
    label: 'Ver videos',
    command: () => {
      if (profile?.drive_link) window.open(profile.drive_link, '_blank', 'noopener,noreferrer');
      else setShowDriveLinkDialog(true);
    },
    template: (item, opts) => (
      <button {...opts} title={item.label}><svg width="18" height="18"><path d="M3 5h11v10H3zM14 8l5-3v8l-5-3" stroke="currentColor" strokeWidth="2" fill="none"/></svg></button>
    )
  },
  {
    label: 'Cargar correcciones',
    command: () => {
      setCorrectionsText(profile?.devolucion || '');
      setShowCorrectionsDialog(true);
    },
    template: (item, opts) => (
      <button {...opts} title={item.label}><svg width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none"/></svg></button>
    )
  }
];

  return (
    <>
      <div className={`sidebarPro colorMainAll routineSidebarModern routineWeeksTheme-${editorTheme}`}>
        <div className="d-flex flex-column colorMainAll shadow-sm routineSidebarModernInner">

          {/* El nombre del alumno se movio a la barra de arriba, al lado del
              boton de tema. Tenerlo tambien aca era decir dos veces lo mismo y
              empujaba el resumen semanal hacia abajo. */}

          {weeklySummary && (
            <div  className="px-2">
              <h6 className="text-light ms-2">Resumen semanal</h6>
              <ul id='resumen' className="list-group small mb-2">
                <li className="list-group-item py-1 bgItemsDropdownUl d-flex justify-content-between">
                  Alimentacion <span className={`badge ${getBadgeStyle(weeklySummary.selection1)}`}>{weeklySummary.selection1 || '-'}</span>
                </li>
                <li className="list-group-item py-1 bgItemsDropdownUl d-flex justify-content-between">
                  NEAT <span className={`badge ${getBadgeStyle(weeklySummary.selection2)}`}>{weeklySummary.selection2 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Sensaciones <span className={`badge ${getBadgeStyle(weeklySummary.selection3)}`}>{weeklySummary.selection3 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Sueno <span className={`badge ${getBadgeStyle(weeklySummary.selection4)}`}>{weeklySummary.selection4 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Estres <span className={`badge ${getBadgeStyle(weeklySummary.selection5)}`}>{weeklySummary.selection5 || '-'}</span>
                </li>
                <li className="list-group-item bgItemsDropdownUl py-1 d-flex justify-content-between">
                  Peso (Kg) <span className={`badge ${getBadgeStyle(weeklySummary.selection5)}`}>{weeklySummary.pesoCorporal || '-'}</span>
                </li>
              </ul>

              {weeklySummary.lastSaved && (
                <p className='routineSidebarLastUpdate text-light text-center mb-2'>
                  Ultima actualizacion: {new Date(weeklySummary.lastSaved).toLocaleDateString()}
                </p>
              )}

              <div id="comments" className="position-relative">
                <label className="text-light small ms-2" htmlFor="">Comentarios</label>
                <p className="weekly-summary-comments-preview small mx-2 rounded p-2 text-light bgItemsDropdown mb-2">
                  {getCommentsPreview(weeklySummary.comments)}
                </p>
                {hasLongComments(weeklySummary.comments) && (
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm mx-2 mb-2 routineSidebarFullComments"
                    onClick={() => setShowCommentsDialog(true)}
                  >
                    Ver comentarios completos
                  </button>
                )}
              </div>

              <div id='correcciones' className="d-grid mt-2">
                <button className="btn btn-outline-light btn-sm" onClick={() => {
                  setCorrectionsText(profile.devolucion || "");
                  setShowCorrectionsDialog(true);
                }}>
                  Cargar correcciones
                </button>
              </div>
              <div id='drive' className="d-grid mt-2">
                {profile.drive_link ? (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={profile.drive_link}
                    className="btn btn-outline-light btn-sm"
                  >
                    <AddToDriveIcon /> Ver videos subidos
                  </a>
                ) : (
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setShowDriveLinkDialog(true)}
                  >
                    <AddToDriveIcon /> Ver videos subidos
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="routineSidebarBottomActions">
            <button type="button" onClick={() => setTourVisible(true)}>
              <HelpCircle size={15} /> Ayuda
            </button>
          </div>
        </div>
      </div>

      <section className={`container-fluid totalHeight routineWeeksPage routineWeeksTheme-${editorTheme}`}>
        <div className={isSpeedDialOpen ? 'blur-main' : ''}>
        <article className={`row justify-content-center routineWeeksContent ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>

          {firstWidth >= 991 && (
            <div className="routineWeeksTop">
              <div className="routineWeeksHeading">
                <h1>Semanas de {username || 'alumno'}</h1>
                <p>Organiza la planificación, los bloques y el seguimiento semanal.</p>
              </div>

              <div className="row justify-content-end routineWeeksActions">
              <div className="col-3">
                <ActionTile
                  id="routineWeeksSettings"
                  gradient="linear-gradient(180deg, #1F3A5F 0%, #10233D 100%)"
                  icon={<Settings size={18} />}
                  label="Ajustes"
                  onClick={() => setShowModeDialog(true)}
                />
              </div>
              <div className="col-3">
                <ActionTile
                  id="week0"
                  gradient="linear-gradient(180deg, #5AA7FF 0%, #2D7BFF 100%)"
                  icon={<CalendarPlus size={18} />}
                  label="Nueva semana"
                  onClick={createWeek}
                />
              </div>
              <div className="col-3">
                <ActionTile
                  id="continueWeek"
                  gradient="linear-gradient(180deg, #FF8A3C 0%, #FF5C2B 100%)"
                  icon={<Repeat size={18} />}
                  label="Seguir semana"
                  onClick={createWeekCopyLastWeek}
                  disabled={routine.length === 0}
                />
              </div>
              <div className="col-3">
                <ActionTile
                  id="paste"
                  gradient="linear-gradient(180deg, #A46BFF 0%, #7B3BFF 100%)"
                  icon={<ClipboardCopy size={18} />}
                  label="Pegar semana"
                  onClick={loadFromLocalStorage}
                />
              </div>
              </div>
            </div>
          )}

          

          {/* ====== LISTA: EN DESKTOP queda TU TABLA ORIGINAL ====== */}
          {firstWidth >= 991 ? (
            <div className='col-12'>
              <div className='row justify-content-center'>
                <PrimeReactTable_Routines
                  id={id}
                  username={username}
                  routine={visibleRoutine}
                  setRoutine={setRoutine}
                  copyRoutine={copyRoutine}
                  editorTheme={editorTheme}
                  rowsPerPage={routineWeeksSettings.pageSize}
                  density={routineWeeksSettings.density}
                  blocks={blocks}
                  onBlocksRefresh={loadBlocks}
                />
              </div>
            </div>
          ) : (
            // ====== EN MOBILE: CARDS + ACORDEON ======
            <div className='col-12'>
              <div className='row justify-content-center g-3 routineWeeksMobileList'>
                {visibleRoutine.map((w) => {
                  const resolvedWeek = resolveWeekBlock(w);
                  const isOpen = expanded.has(w._id);
                  const isHidden = (w?.visibility || 'visible') === 'hidden';

                  const blockColor = resolvedWeek?.block?.color || resolvedWeek?.block?.colorHex || '#6c757d';
                  const blockName = resolvedWeek?.block?.name || 'Sin bloque';

                  const trainerDateLabel = formatTrainerCreatedDate(w);
                  const athleteDateLabel = formatAthleteDate(w);

                  // === ACTUALIZADO: path igual que la web
                  const viewPath = makeWeekViewPath(w);

                  return (
                    <div key={w._id} className="col-12">
                      <div className="week-mobile-card">
                        <div className="week-mobile-head">
                          <div className="week-mobile-head-top">
                            <div
                              className="week-mobile-head-main"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleExpanded(w._id)}
                            >
                              <div className="week-mobile-title">{w.name || 'Semana'}</div>
                              <div className="week-mobile-meta">
                                <span>{trainerDateLabel}</span>
                              </div>
                            </div>

                            <div className="week-mobile-status-wrap">
                              <span className={`week-mobile-visibility ${isHidden ? 'is-hidden' : 'is-visible'}`}>
                                {isHidden ? 'Oculta' : 'Visible'}
                              </span>
                            </div>
                          </div>

                          <div className="week-mobile-head-actions">
                            <button
                              type="button"
                              className={`week-mobile-icon-btn ${isHidden ? 'is-hidden' : 'is-visible'}`}
                              title={isHidden ? 'Mostrar semana al alumno' : 'Ocultar semana al alumno'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisibilityMobile(w);
                              }}
                            >
                              {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                              <span className="week-mobile-eye-status">
                                {isHidden ? 'No visible' : 'Visible'}
                              </span>
                            </button>
                            <Link
                              className="week-mobile-icon-btn"
                              to={viewPath}
                              onClick={(e) => e.stopPropagation()}
                              title="Entrar a la semana"
                            >
                              <Edit size={16} />
                              <span className="week-mobile-eye-status">Editar</span>
                            </Link>
                            <button
                              type="button"
                              className={`week-mobile-icon-btn ${isOpen ? 'is-open' : ''}`}
                              onClick={() => toggleExpanded(w._id)}
                              title={isOpen ? 'Contraer' : 'Expandir'}
                            >
                              {isOpen ? <ChevronUp size={18} color={isOpen ? '#fff' : undefined} /> : <ChevronDown size={18} />}
                              <span className="week-mobile-eye-status">Ver mas</span>
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="week-mobile-body">
                            <div className="week-mobile-dates">
                              <div className="week-mobile-date-card">
                                <span className="week-mobile-date-label">
                                  <Pencil size={12} className="me-1" /> Ultima edicion del entrenador
                                </span>
                                <div className="week-mobile-date-value">{trainerDateLabel}</div>
                              </div>
                              <div className="week-mobile-date-card">
                                <span className="week-mobile-date-label">
                                  <UserPen size={12} className="me-1" /> Ultima edicion del alumno
                                </span>
                                <div className="week-mobile-date-value">{athleteDateLabel}</div>
                              </div>
                            </div>

                            <div className="week-mobile-action-row">
                              <button
                                type="button"
                                className="week-mobile-action-btn"
                                onClick={() => handleCommentWeek(w)}
                              >
                                <MessageSquare size={16} />
                                <span>Comentar</span>
                              </button>
                              <button
                                type="button"
                                className="week-mobile-action-btn"
                                onClick={() => handleCopyWeek(w)}
                              >
                                <Copy size={16} />
                                <span>Copiar</span>
                              </button>
                              <button
                                type="button"
                                className="week-mobile-action-btn is-danger"
                                onClick={() => openConfirmDelete(w)}
                              >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="week-mobile-foot">
                          <div className="week-mobile-block-wrap">
                            <span className="week-mobile-block-caption">Bloque</span>
                            <div
                              className="week-mobile-block-pill"
                              title={blockName}
                              style={
                                editorTheme === 'dark'
                                  ? {
                                      backgroundColor: `color-mix(in srgb, ${blockColor} 20%, #111827)`,
                                      borderColor: `color-mix(in srgb, ${blockColor} 55%, transparent)`,
                                      color: `color-mix(in srgb, ${blockColor} 55%, #ffffff)`
                                    }
                                  : {
                                      backgroundColor: `color-mix(in srgb, ${blockColor} 14%, white)`,
                                      borderColor: `color-mix(in srgb, ${blockColor} 45%, white)`,
                                      color: `color-mix(in srgb, ${blockColor} 65%, #1e2a3a)`
                                    }
                              }
                            >
                              {blockName}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="week-mobile-edit-block"
                            onClick={() => handleEditBlock(resolvedWeek)}
                            title="Editar bloque"
                          >
                            <Pencil size={14} className="me-1" /> Editar bloque
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {routine.length === 0 && (
                  /* Estado vacio CON accion. Antes era solo esta frase suelta
                     arriba de un bloque que ocupaba casi toda la pantalla, y el
                     unico camino para crear estaba en el dock de abajo, lejos de
                     donde uno mira. */
                  <div className="week-mobile-empty">
                    <SquarePlus size={30} className="week-mobile-empty-icon" />
                    <p className="week-mobile-empty-title">Todavia no hay semanas</p>
                    <p className="week-mobile-empty-text">
                      Crea la primera semana para empezar a planificar.
                    </p>
                    <button
                      type="button"
                      className="week-mobile-empty-cta"
                      onClick={() => createWeek()}
                    >
                      Crear primera semana
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
</div>
{firstWidth < 991 && (

  <nav className="navbar footerColor fixed-bottom altoNavbb week-mobile-actionbar">


          {/* Columna izquierda */}
        <div className="week-mobile-actionbar-slot">
          {isResumenDialVisible && (
            <div className="week-mobile-dock-menu is-left">
              <button type="button" onClick={() => { setShowDriveLinkDialog(true); setIsResumenDialVisible(false); }}>
                <Video size={16} />
                <span>Ver videos subidos</span>
              </button>
              {/* Hay que cargar profile.devolucion ANTES de abrir, igual que los
                  caminos de desktop. Sin esto el dialogo mostraba el estado
                  inicial ("") aunque el alumno ya tuviera correcciones cargadas,
                  y al guardar se pisaba lo anterior sin ningun aviso. */}
              <button type="button" onClick={() => { setCorrectionsText(profile?.devolucion || ''); setShowCorrectionsDialog(true); setIsResumenDialVisible(false); }}>
                <FilePlus size={16} />
                <span>Cargar correcciones</span>
              </button>
              <button type="button" onClick={() => { setShowWeeklySummaryModal(true); setIsResumenDialVisible(false); }}>
                <NotepadText size={16} />
                <span>Resumen semanal</span>
              </button>
            </div>
          )}
          <button
            type="button"
            className={`week-mobile-dock-btn ${isResumenDialVisible ? 'is-active' : ''}`}
            onClick={() => {
              setIsResumenDialVisible((visible) => !visible);
              setIsWeeksDialVisible(false);
              setIsToolsDialVisible(false);
            }}
            aria-label="Herramientas del alumno"
            aria-expanded={isResumenDialVisible}
          >
            {isResumenDialVisible ? <X size={22} /> : <UserPen size={20} />}
            <span className="week-mobile-dock-label">Alumno</span>
          </button>
</div>

          {/* Columna centro */}
<div className="week-mobile-actionbar-slot">
          {isWeeksDialVisible && (
            <div className="week-mobile-dock-menu is-center">
              <button type="button" onClick={() => { createWeek(); setIsWeeksDialVisible(false); }}>
                <SquarePlus size={16} />
                <span>Nueva semana</span>
              </button>
              <button type="button" onClick={() => { createWeekCopyLastWeek(); setIsWeeksDialVisible(false); }}>
                <CopyPlus size={16} />
                <span>Seguir semana</span>
              </button>
              <button type="button" onClick={() => { loadFromLocalStorage(); setIsWeeksDialVisible(false); }}>
                <Files size={16} />
                <span>Pegar semana</span>
              </button>
            </div>
          )}
          <button
            type="button"
            className={`week-mobile-dock-btn week-mobile-dock-main ${isWeeksDialVisible ? 'is-active' : ''}`}
            onClick={() => {
              setIsWeeksDialVisible((visible) => !visible);
              setIsResumenDialVisible(false);
              setIsToolsDialVisible(false);
            }}
            aria-label="Acciones de semanas"
            aria-expanded={isWeeksDialVisible}
          >
            {isWeeksDialVisible ? <X size={22} /> : <Plus size={24} />}
            <span className="week-mobile-dock-label">Semanas</span>
          </button>
</div>

          {/* Columna derecha */}
<div className="week-mobile-actionbar-slot">
          {isToolsDialVisible && (
            <div className="week-mobile-dock-menu is-right">
              <button type="button" onClick={() => { setShowModeDialog(true); setIsToolsDialVisible(false); }}>
                <ToggleLeft size={16} />
                <span>Modo fecha / numérico</span>
              </button>
            </div>
          )}
          <button
            type="button"
            className={`week-mobile-dock-btn ${isToolsDialVisible ? 'is-active' : ''}`}
            onClick={() => {
              setIsToolsDialVisible((visible) => !visible);
              setIsResumenDialVisible(false);
              setIsWeeksDialVisible(false);
            }}
            aria-label="Herramientas"
            aria-expanded={isToolsDialVisible}
          >
            {isToolsDialVisible ? <X size={22} /> : <Pencil size={20} />}
            {/* Decia "Ajustes", pero lo que abre son herramientas de la vista,
                no preferencias guardadas. */}
            <span className="week-mobile-dock-label">Herramientas</span>
          </button>
</div>

     
      </nav>

)}


        {tourVisible && (
          <Tour
            open={tourVisible}
            steps={tourSteps}
            onClose={() => setTourVisible(false)}
            onFinish={() => setTourVisible(false)}
            scrollIntoViewOptions={true}
          />
        )}

        {/* === ACTUALIZADO: modal con diseno como en la imagen === */}
        <Dialog
          header={
            <div className="routineWeeksDialogHeader">
              <span className="routineWeeksDialogHeaderIcon"><NotepadText size={18} /></span>
              <div>
                <strong>Resumen semanal</strong>
                <span>
                  {weeklySummary.lastSaved
                    ? `Última actualización: ${new Date(weeklySummary.lastSaved).toLocaleString()}`
                    : 'Sin actualizaciones todavia'}
                </span>
              </div>
            </div>
          }
          visible={showWeeklySummaryModal}
          className={`routineWeeksDialog routineWeeksTheme-${editorTheme}`}
          style={{ width: firstWidth > 900 ? '480px' : '94vw' }}
          onHide={() => setShowWeeklySummaryModal(false)}
          footer={
            <div className="routineWeeksDialogActions">
              <button
                type="button"
                className="routineWeeksDialogButton routineWeeksDialogButtonSecondary"
                onClick={() => {
                  setCorrectionsText(profile.devolucion || "");
                  setShowCorrectionsDialog(true);
                }}
              >
                Cargar correcciones
              </button>
              <button
                type="button"
                className="routineWeeksDialogButton routineWeeksDialogButtonPrimary"
                onClick={() => setShowWeeklySummaryModal(false)}
              >
                Cerrar
              </button>
            </div>
          }
          draggable={true}
        >
          <div className="routineWeeksSummaryList">
            {[
              ['Alimentación', weeklySummary.selection1],
              ['NEAT', weeklySummary.selection2],
              ['Sensaciones', weeklySummary.selection3],
              ['Descanso / Sueno', weeklySummary.selection4],
              ['Estres', weeklySummary.selection5],
              ['Peso', weeklySummary.pesoCorporal || '-'],
            ].map(([label, value], i) => (
              <div key={i} className="routineWeeksSummaryRow">
                <span>{label}</span>
                <span className={`badge ${typeof value === 'string' ? getBadgeStyle(value) : 'bg-secondary'}`}>
                  {value || '-'}
                </span>
              </div>
            ))}
          </div>

          <div className="routineWeeksFieldGroup">
            <label>Comentarios</label>
            <div className="weekly-summary-full-comments-text">
              {getCommentsPreview(weeklySummary.comments)}
            </div>
            {hasLongComments(weeklySummary.comments) && (
              <button
                type="button"
                className="routineWeeksDialogButton routineWeeksDialogButtonSecondary mt-2"
                onClick={() => setShowCommentsDialog(true)}
              >
                Ver comentarios completos
              </button>
            )}
          </div>
        </Dialog>

        <Dialog
          header="Correcciones / Devolución"
          visible={showCorrectionsDialog}
          className={`routineWeeksDialog routineWeeksFeedbackDialog routineWeeksTheme-${editorTheme}`}
          onHide={() => setShowCorrectionsDialog(false)}
          style={{ width: firstWidth > 900 ? '40%' : '90%' }}
        >
          <div className="routineWeeksDialogIntro">
            <MessageSquareText size={18} />
            <div>
              <strong>Mensaje para el alumno</strong>
              <span>Escribi correcciones, devoluciones o indicaciones generales.</span>
            </div>
          </div>
          <div className="routineWeeksFieldGroup">
            <label htmlFor="routine-corrections-text">Correcciones</label>
            <textarea 
              id="routine-corrections-text"
              className="form-control" 
              rows="5" 
              value={correctionsText} 
              onChange={(e) => setCorrectionsText(e.target.value)}
              placeholder="Ingrese las correcciones o devolución..."
            />
          </div>
          <div className="routineWeeksDialogActions">
            <button className="routineWeeksDialogButton routineWeeksDialogButtonSecondary" onClick={() => setShowCorrectionsDialog(false)}>
              Cancelar
            </button>
            <button className="routineWeeksDialogButton routineWeeksDialogButtonPrimary" onClick={handleCorrectionsSave}>
              Guardar
            </button>
          </div>
        </Dialog>

        <Dialog
          header="Sin link de Drive"
          visible={showDriveLinkDialog}
          onHide={() => setShowDriveLinkDialog(false)}
          className={`col-10 col-lg-4 routineWeeksDialog routineWeeksDriveDialog routineWeeksTheme-${editorTheme}`}
        >
          <div className="routineWeeksEmptyState">
            <div className="routineWeeksEmptyIcon">
              <AddToDriveIcon fontSize="small" />
            </div>
            <strong>No hay link cargado</strong>
            <p>Pedile a tu alumno que suba el link de su Drive para poder ver sus videos desde acá.</p>
          </div>
          <div className="routineWeeksDialogActions">
            <button className="routineWeeksDialogButton routineWeeksDialogButtonPrimary" onClick={() => setShowDriveLinkDialog(false)}>
              Cerrar
            </button>
          </div>
        </Dialog>

        <Dialog
          header="Comentarios completos"
          visible={showCommentsDialog}
          className={`routineWeeksDialog routineWeeksCommentsDialog routineWeeksTheme-${editorTheme}`}
          style={{ width: firstWidth > 900 ? '60vw' : '94vw', maxWidth: '800px' }}
          onHide={() => setShowCommentsDialog(false)}
          draggable
        >
          <div className="routineWeeksDialogIntro">
            <FileText size={18} />
            <div>
              <strong>Comentarios semanales</strong>
              <span>{weeklySummary.comments ? `${weeklySummary.comments.length} caracteres cargados` : 'Sin comentarios cargados'}</span>
            </div>
          </div>
          <div className="routineWeeksCommentsCard">
            <div className="routineWeeksCommentsCardHeader">
              <span>Contenido</span>
            </div>
            <div className="weekly-summary-comments-dialog-text">
              {weeklySummary.comments || 'No hay comentarios'}
            </div>
          </div>
          <div className="routineWeeksDialogActions">
            <button className="routineWeeksDialogButton routineWeeksDialogButtonPrimary" onClick={() => setShowCommentsDialog(false)}>
              Cerrar
            </button>
          </div>
        </Dialog>

        {/* ====== Editor de comentarios por semana (rediseno de preview) ====== */}
        <Dialog
          header={
            <div className="routineWeeksDialogHeader">
              <span className="routineWeeksDialogHeaderIcon"><MessageSquare size={18} /></span>
              <div>
                <strong>Comentarios de la semana</strong>
                <span>Dejale a tu alumno una devolución general o día por día</span>
              </div>
            </div>
          }
          visible={showWeekCommentsDialog}
          className={`col-11 routineWeeksDialog routineWeeksWeekCommentsDialog routineWeeksTheme-${editorTheme}`}
          appendTo={document.body}
          baseZIndex={2100}
          onHide={() => setShowWeekCommentsDialog(false)}
          footer={
            <div className="routineWeeksDialogActions">
              <button
                type="button"
                className="routineWeeksDialogButton routineWeeksDialogButtonSecondary"
                onClick={() => setShowWeekCommentsDialog(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="routineWeeksDialogButton routineWeeksDialogButtonPrimary"
                onClick={handleSaveWeekComments}
              >
                Guardar
              </button>
            </div>
          }
          draggable
        >
          <div className="routineWeeksFieldGroup mb-3">
            <label htmlFor="comments-title">Título</label>
            <InputText
              id="comments-title"
              value={commentsTitle}
              onChange={(e) => setCommentsTitle(e.target.value)}
              className="w-100"
              placeholder="Comentarios semanales"
            />
          </div>

          <div className="routineWeeksFieldGroup mb-3">
            <label htmlFor="comments-mode">Modo</label>
            <div className="routineWeeksSegmentedControl" id="comments-mode">
              <button
                type="button"
                className={commentsMode === "free" ? "is-active" : ""}
                onClick={() => setCommentsMode("free")}
              >
                Libre
              </button>
              <button
                type="button"
                className={commentsMode === "days" ? "is-active" : ""}
                onClick={() => setCommentsMode("days")}
              >
                Por dia
              </button>
            </div>
          </div>

          {commentsMode === "free" ? (
            <div className="routineWeeksFieldGroup">
              <label htmlFor="comments-body">Comentarios</label>
              <InputTextarea
                id="comments-body"
                value={commentsDescription}
                onChange={(e) => setCommentsDescription(e.target.value)}
                className="w-100"
                rows={5}
                placeholder="Escribi aquí los comentarios para tu alumno..."
              />
            </div>
          ) : (
            <div className="routineWeeksFieldGroup">
              <label>Comentarios por día</label>
              {commentsDaysMeta.length ? (
                <div className="routineWeeksDayCommentsList">
                  {commentsDaysMeta.map((d) => (
                    <div key={d._id} className="routineWeeksDayCommentRow">
                      <span className="routineWeeksDayCommentLabel">{d.label}</span>
                      <InputTextarea
                        value={commentsByDay[d._id] || ""}
                        onChange={(e) =>
                          setCommentsByDay((prev) => ({
                            ...prev,
                            [d._id]: e.target.value,
                          }))
                        }
                        className="w-100"
                        rows={1}
                        autoResize
                        placeholder={`Comentario para ${d.label}...`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="routineWeeksEmptyState">
                  <span className="routineWeeksEmptyIcon"><Info size={18} /></span>
                  <strong>Sin días cargados</strong>
                  <p>Esta semana no tiene días cargados todavia.</p>
                </div>
              )}
            </div>
          )}
        </Dialog>
       
       
<Dialog
  header="Ajustes de semanas"
  visible={showModeDialog}
  className={`routineWeeksDialog routineWeeksTheme-${editorTheme}`}
  onHide={() => setShowModeDialog(false)}
  style={{ width: firstWidth > 900 ? '640px' : '92%' }}
>
  <div className="routineWeeksSettingsDialog">
    <div className="routineWeeksSettingsIntro">
      <strong>Personaliza esta sección.</strong>
      <span>Estos ajustes cambian como trabajas con las semanas de este alumno.</span>
    </div>

    <div className="routineWeeksSettingsSection">
      <div>
        <h6>Creación de semanas</h6>
        <p>Elegí si las nuevas semanas nacen con nombre numérico o basado en fecha.</p>
      </div>

      <div id="switchWeek" className="routineWeeksSettingRow">
        <div className="routineWeeksSettingText">
          <span>{useDate ? 'Modo fecha' : 'Modo numérico'}</span>
          <small>
            {useDate
              ? 'Ejemplo: Semana - 01/01/2025'
              : 'Ejemplo: Semana 1, Semana 2...'}
          </small>
        </div>

        <button
          type="button"
          className={`routineWeeksPrettySwitch ${useDate ? 'is-on' : ''}`}
          onClick={handleToggleUseDate}
          role="switch"
          aria-checked={useDate}
          aria-label="Alternar modo de creación de semanas"
        >
          <span />
        </button>
      </div>
    </div>

    <div className="routineWeeksSettingsSection">
      <div>
        <h6>Orden de semanas</h6>
        <p>Define como se ordena visualmente esta lista. No modifica el orden real guardado.</p>
      </div>

      <div className="routineWeeksSegmentedControl" role="group" aria-label="Orden de semanas">
        {[
          { label: 'Recientes primero', value: 'newest' },
          { label: 'Antiguas primero', value: 'oldest' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            className={routineWeeksSettings.order === option.value ? 'is-active' : ''}
            onClick={() => updateRoutineWeeksSetting('order', option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    <div className="routineWeeksSettingsSection">
      <div>
        <h6>Semanas por página</h6>
        <p>Elegí cuantas semanas querés ver antes de paginar.</p>
      </div>

      <div className="routineWeeksSegmentedControl routineWeeksSegmentedControlGrid" role="group" aria-label="Semanas por página">
        {[
          { label: '8', value: 8 },
          { label: '12', value: 12 },
          { label: '20', value: 20 },
          { label: 'Todas', value: 999 },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            className={routineWeeksSettings.pageSize === option.value ? 'is-active' : ''}
            onClick={() => updateRoutineWeeksSetting('pageSize', option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    <div className="routineWeeksSettingsSection">
      <div>
        <h6>Densidad visual</h6>
        <p>Compacto muestra más semanas en pantalla. Cómodo deja más aire entre filas.</p>
      </div>

      <div className="routineWeeksSegmentedControl" role="group" aria-label="Densidad visual">
        {[
          { label: 'Compacto', value: 'compact' },
          { label: 'Cómodo', value: 'comfortable' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            className={routineWeeksSettings.density === option.value ? 'is-active' : ''}
            onClick={() => updateRoutineWeeksSetting('density', option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  </div>

  <div className="routineWeeksSettingsFooter">
    <button type="button" className="routineWeeksSaveSettingsButton" onClick={() => setShowModeDialog(false)}>
      Guardar
    </button>
  </div>
</Dialog>



<Dialog
  header="Asignar bloque a la semana"
  visible={showBlockDialog}
  appendTo={document.body}
  className={`coachRoutineAuxDialog routineWeeksDialog routineWeeksBlockAssignDialog routineWeeksTheme-${editorTheme}`}
  style={{ width: '90vw', maxWidth: 520 }}
  onHide={() => setShowBlockDialog(false)}
>
  {blockDialogWeek && (
    <div className="routineWeeksBlockAssign">
      <div className="routineWeeksBlockAssignCurrent">
        <span className="routineWeeksBlockAssignEyebrow">Semana seleccionada</span>
        <strong>{blockDialogWeek.name}</strong>
        {(() => {
          const currentBlock = blockDialogWeek.block || null;
          const bg = currentBlock?.color || '#94a3b8';
          const isDark = editorTheme === 'dark';
          return (
            <div className="routineWeeksBlockAssignPillRow">
              <span>Bloque actual</span>
              <div
                className="routineWeeksBlockAssignPill"
                style={
                  isDark
                    ? {
                        backgroundColor: `color-mix(in srgb, ${bg} 20%, #111827)`,
                        borderColor: `color-mix(in srgb, ${bg} 55%, transparent)`,
                        color: `color-mix(in srgb, ${bg} 55%, #ffffff)`,
                      }
                    : {
                        backgroundColor: `color-mix(in srgb, ${bg} 14%, white)`,
                        borderColor: `color-mix(in srgb, ${bg} 45%, white)`,
                        color: `color-mix(in srgb, ${bg} 65%, #1e2a3a)`,
                      }
                }
              >
                {currentBlock?.name || 'Sin bloque'}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="routineWeeksBlockAssignPicker">
        <span className="routineWeeksBlockAssignEyebrow">Asignar bloque</span>
        <RoutineWeeksBlockSelect
          value={selectedBlockId || ""}
          options={buildOptions(blockDialogWeek.block)}
          theme={editorTheme}
          label="Seleccionar bloque"
          currentBlock={blockDialogWeek.block || null}
          className="routineWeeksDialogBlockSelect"
          mode="panel"
          onEditBlock={handleEditBlockFromSelect}
          onChange={(nextValue) =>
            handleBlockDropdownChange(blockDialogWeek._id, nextValue)
          }
        />
        <small>Al elegir un bloque, se asigna automaticamente a esta semana.</small>
      </div>

      <div className="routineWeeksBlockAssignActions">
        <button
          type="button"
          className="routineWeeksDialogButton routineWeeksDialogButtonSecondary"
          onClick={() => {
            setBlockPendingEdit(null);
            setShowManageBlocksDialog(true);
          }}
        >
          Agregar bloque
        </button>
        <button
          type="button"
          className="routineWeeksDialogButton routineWeeksDialogButtonPrimary"
          onClick={() => setShowBlockDialog(false)}
        >
          Cerrar
        </button>
      </div>
    </div>
  )}
</Dialog>

<Dialog
  header={blockPendingEdit ? "Editar bloque" : "Crear bloque"}
  visible={showManageBlocksDialog}
  appendTo={document.body}
  className={`coachRoutineAuxDialog routineWeeksDialog routineWeeksTheme-${editorTheme} blocksManagerFormDialog`}
  style={{ width: '90vw', maxWidth: 420 }}
  onHide={() => {
    setShowManageBlocksDialog(false);
    setBlockPendingEdit(null);
    loadBlocks();
  }}
>
  <BloquesForm
    id={trainer_id}
    editorTheme={editorTheme}
    isEditMode={!!blockPendingEdit}
    initialData={blockPendingEdit || {}}
    onSaved={async () => {
      setShowManageBlocksDialog(false);
      setBlockPendingEdit(null);
      await loadBlocks();
    }}
    onCancel={() => {
      setShowManageBlocksDialog(false);
      setBlockPendingEdit(null);
    }}
  />
</Dialog>

<Dialog
  header="Confirmar eliminación"
  visible={confirmDeleteOpen}
  appendTo={document.body}
  className={`routineWeeksDialog routineWeeksTheme-${editorTheme}`}
  baseZIndex={2100}
  style={{ width: '90vw', maxWidth: 420 }}
  onHide={cancelDeleteWeek}
  footer={
    <div className="routineWeeksDialogActions">
      <button type="button" className="routineWeeksDialogButton routineWeeksDialogButtonSecondary" onClick={cancelDeleteWeek}>
        Cancelar
      </button>
      <button type="button" className="routineWeeksDialogButton routineWeeksDialogButtonDanger" onClick={confirmDeleteWeek}>
        Eliminar
      </button>
    </div>
  }
>
  <p className="mb-0">
    {weekPendingDelete
      ? <>Querés eliminar la <strong>{weekPendingDelete.name || 'semana'}</strong>? Esta acción no se puede deshacer.</>
      : 'Querés eliminar esta semana?'}
  </p>
</Dialog>

      </section>
    </>
  );
}

export default UserRoutineEditPage;

