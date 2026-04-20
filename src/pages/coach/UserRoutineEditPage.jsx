import React, { useEffect, useState } from 'react';
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
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ObjectId from 'bson-objectid';
import { Dropdown } from 'primereact/dropdown';
// >>> Agregados para el editor de comentarios:
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { SpeedDial } from 'primereact/speeddial';

//.............................. COMPONENTES ..............................//
import PrimeReactTable_Routines from '../../components/PrimeReactTable_Routines.jsx';
import LogoChico from '../../components/LogoChico.jsx';
import BloquesForm from './../../components/BloquesForm.jsx';
import BlocksListPage from './../../components/BlocksListPage.jsx';

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
  MessageSquareText
} from 'lucide-react';

//.............................. ICONOS MUI ..............................//
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';
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

function UserRoutineEditPage() {
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
      // Si el click fue dentro de algun SpeedDial (boton o items), no hacemos nada
      if (
        event.target.closest('.p-speeddial') ||   // contenedor de PrimeReact
        event.target.closest('.bottom-dial')      // wrapper que usas en el navbar
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

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showDriveLinkDialog, setShowDriveLinkDialog] = useState(false);
  const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState();
  const [profile, setProfile] = useState(true);
  const [showCorrectionsDialog, setShowCorrectionsDialog] = useState(false);
  const [correctionsText, setCorrectionsText] = useState("");

  const [showBlockForm, setShowBlockForm] = useState(false);
  
  const [showCommentsDialog, setShowCommentsDialog] = useState(false); // (resumen semanal: visor)

  const [blocks, setBlocks] = useState([]);
  const [trainer_id] = useState(localStorage.getItem("_id"));
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockDialogWeek, setBlockDialogWeek] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [showManageBlocksDialog, setShowManageBlocksDialog] = useState(false);

  const [weekDate, setWeekDate] = useState(() => {
    return localStorage.getItem("weekDate") || "";
  });

  const [useDate, setUseDate] = useState(() => {
    const saved = localStorage.getItem("useDate");
    return saved === "true";
  });

  const [showModeDialog, setShowModeDialog] = useState(false);

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
  const modeOptions = [
    { label: "Modo libre", value: "free" },
    { label: "Modo dias", value: "days" },
  ];
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
  

  useEffect(() => {
    BlockService.getBlocks(trainer_id).then((raw) => {
      const normalized = raw.map((b) => ({ ...b, _id: b._id.toString() }));
      setBlocks(normalized);
    });
  }, [trainer_id]);

  useEffect(() => {
    setTourSteps([
      { title: 'Switch de semana',
        description: 'Este switch permite que crees las semanas de manera numerica ( semana 1, semana 2, etc..) o, la creacion de semanas a partir de la fecha actual.',
        target: () => document.getElementById('switchWeek'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Resumen semanal',
        description: 'Estos datos son rellenados por el alumno. La idea es que los llene semana a semana para poder trabajar con mas informacion.',
        target: () => document.getElementById('resumen'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Devolucion',
        description: 'Este boton sirve para poder cargar la correccion al alumno. El la vera cuando entre a la seccion de "Ver Rutina"',
        target: () => document.getElementById('correcciones'),
        placement: 'right',
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Drive',
        description: 'Cuando el usuario suba su link de drive, podras ingresar a su carpeta. La idea es manejar los videos mediante este sistema, para que tengas todo centralizado.',
        target: () => document.getElementById('drive'),
        placement: 'right',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Crear semana de 0',
        description: 'Este boton crea una semana de 0, ideal para comenzar un nuevo bloque.',
        target: () => document.getElementById('week0'),
        placement: 'top',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Continuar con la rutina',
        description: 'Este boton crea una copia de la ultima semana. Ideal para continuar el bloque de entrenamiento.',
        target: () => document.getElementById('continueWeek'),
        placement: 'top',
        prevButtonProps: { children: '<< Anterior' },
        nextButtonProps: { children: 'Siguiente >>' } },
      { title: 'Pegar rutina del portapapeles',
        description: 'Boton para pegar una rutina, previamente copiada. Puede ser una rutina, tanto de otro alumno, como del que se encuentra.',
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

          return {
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
          };
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
  }, [status, id]);

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

  const getContrastYIQ = (hexcolor) => {
 if (!hexcolor) return "black";
 const h = hexcolor.replace("#", "");
 const r = parseInt(h.substr(0, 2), 16);
 const g = parseInt(h.substr(2, 2), 16);
 const b = parseInt(h.substr(4, 2), 16);
 const yiq = (r * 299 + g * 587 + b * 114) / 1000;
 return yiq >= 150 ? "black" : "white";
 };

 const buildOptions = (currentBlock) => {
 const base = [
   { name: "Anadir/editar bloques", _id: "add-new-block" },
   { name: "Sin bloque", _id: null },
 ];
 const extra = currentBlock && !blocks.find((b) => b._id === currentBlock._id)
   ? [currentBlock]
   : [];
 return [...base, ...blocks, ...extra];
 };

 const itemTemplate = (option) =>
 option._id === "add-new-block"
   ? (<span className="d-flex align-items-center"><span className="me-2">ï¼‹</span>{option.name}</span>)
   : option.name;

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

     NotifyHelper.instantToast("Bloque asignado con exito");
   } catch (err) {
     console.error("Error actualizando bloque", err);
     NotifyHelper.instantToast("Error al guardar el bloque");
   }
 };

 const handleBlockDropdownChange = (weekId, value) => {
   if (value === "add-new-block") {
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

   handleAssignBlock(weekId, selected);
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
    const cloned = { ...rawWeek };
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
          dayName: d.name || '(Dia sin nombre)',
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
        NotifyHelper.instantToast('Atencion: se detectaron ejercicios con mismo numero/nombre (posibles superseries duplicadas). Revisa el dia pegado.');
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
      NotifyHelper.instantToast('Contenido invalido en portapapeles');
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
        NotifyHelper.instantToast('Devolucion actualizada con exito!');
        setProfile(prev => ({
          ...prev,
          devolucion: correctionsText,
          devolucionFecha: now
        }));
        setShowCorrectionsDialog(false);
      })
      .catch((err) => {
        console.error("Codigo de error:", err.status);
        console.error("Detalle del error:", err.data);
        NotifyHelper.instantToast('Error al guardar la devolucion');
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
      label: d?.name || d?.title || `Dia ${idx + 1}`,
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
      NotifyHelper.instantToast("Comentarios guardados con exito");
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
      localStorage.setItem('userWeek', JSON.stringify(w));
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
   const blockId = w.block_id?.toString() || w.block?._id?.toString() || null;
   setBlockDialogWeek(w);
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
      className="border-0 p-0 bg-transparent"
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
      <div className='sidebarPro colorMainAll'>
        <div className="d-flex flex-column  colorMainAll  shadow-sm" style={{ width: '220px', height: '100vh', paddingTop: '50px' }}>

          <div className="p-3">
            <div id={'switchWeek'} className="d-flex justify-content-between text-light bgItemsDropdown align-items-center 3">
              <span className="text-light mx-2 small d-flex align-items-center">
                {useDate ? "Modo fecha" : "Modo numerico"}
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id="switch-mode-tooltip">
                      Es el nombre que se le pondra a las semanas. En modo fecha: "Semana - xx/xx/xxxx". En modo numerico: "Semana x"
                    </Tooltip>
                  }
                >
                  <Info size={14} className="ms-2" style={{ cursor: 'pointer' }} />
                </OverlayTrigger>
              </span>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" checked={useDate} onChange={handleToggleUseDate} />
              </div>
            </div>

          </div>

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
                <p className='text-light small text-center mb-2'>
                  Ultima actualizacion: {new Date(weeklySummary.lastSaved).toLocaleDateString()}
                </p>
              )}

              <div id="comments" className="position-relative">
                <label className="text-light small ms-2" htmlFor="">Comentarios</label>
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 200, hide: 150 }}
                  overlay={
                    <Tooltip
                      id="full-comment-tooltip"
                      style={{
                        backgroundColor: '#fff',
                        color: '#212529',
                        maxWidth: '300px',
                        whiteSpace: 'normal',
                        border: '1px solid rgba(0,0,0,0.2)',
                        padding: '0.5rem',
                      }}
                    >
                      {weeklySummary.comments || 'No hay comentarios'}
                      <span className='d-block bg-primary mt-3'>Presiona para ver</span>
                    </Tooltip>
                  }
                >
                  <p
                    className="small mx-2 rounded p-2 text-light bgItemsDropdown"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowCommentsDialog(true)}
                  >
                    {weeklySummary.comments?.split(' ').length > 15
                      ? weeklySummary.comments.split(' ').slice(0, 15).join(' ') + '...'
                      : weeklySummary.comments || 'No hay comentarios'}
                  </p>
                </OverlayTrigger>
              </div>

              <div id='correcciones' className="d-grid mt-2">
                <button className="btn btn-outline-light btn-sm" onClick={() => {
                  setCorrectionsText(profile.devolucion || "");
                  setShowCorrectionsDialog(true);
                }}>
                  Cargar correciones
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

          <div className="p-3 mb-3 text-center">
            <button className="btn btn-outline-light btn-sm" onClick={() => setTourVisible(true)}>
              <HelpCircle size={16} className="me-1" /> Ayuda
            </button>
          </div>
        </div>
      </div>

      <section className='container-fluid totalHeight'>
        <div className={isSpeedDialOpen ? 'blur-main' : ''}>
        <article className={`row justify-content-center ${collapsed ? 'marginSidebarClosed' : 'marginSidebarOpen'}`}>

          {/* === TUS BOTONES ORIGINALES (se mantienen) -> Rehechos como "tarjetas" (look de la 1Âª imagen) === */}
          {firstWidth > 983 && (
            <div className="row justify-content-center mb-3 mt-2" style={{ maxWidth: 980 }}>
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
                  label="Pegar rutina"
                  onClick={loadFromLocalStorage}
                />
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
                  routine={routine}
                  setRoutine={setRoutine}
                  copyRoutine={copyRoutine}
                />
              </div>
            </div>
          ) : (
            // ====== EN MOBILE: CARDS + ACORDEON ======
            <div className='col-12'>
              <div className='row justify-content-center g-3'>
                {routine.map((w) => {
                  const isOpen = expanded.has(w._id);
                  const isHidden = (w?.visibility || 'visible') === 'hidden';

                  const blockColor = w?.block?.color || w?.block?.colorHex || '#6c757d';
                  const blockName = w?.block?.name || 'Sin bloque';

                  const trainerDateLabel = formatTrainerCreatedDate(w);
                  const athleteDateLabel = formatAthleteDate(w);

                  // === ACTUALIZADO: path igual que la web
                  const viewPath = makeWeekViewPath(w);

                  return (
                    <div key={w._id} className="col-12">
                      <div className="week-mobile-card">
                        <div className="week-mobile-head">
                          <div
                            className="week-mobile-head-main"
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleExpanded(w._id)}
                          >
                            <div className="week-mobile-title">{w.name || 'Semana'}</div>
                            <div className="week-mobile-meta">
                              <span>{trainerDateLabel}</span>
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
                            </button>
                            <Link
                              className="week-mobile-icon-btn"
                              to={viewPath}
                              onClick={(e) => e.stopPropagation()}
                              title="Entrar a la semana"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              type="button"
                              className={`week-mobile-icon-btn ${isOpen ? 'is-open' : ''}`}
                              onClick={() => toggleExpanded(w._id)}
                              title={isOpen ? 'Contraer' : 'Expandir'}
                            >
                              {isOpen ? <ChevronUp size={18} color={isOpen ? '#fff' : undefined} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="week-mobile-body">
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

                            <div className="week-mobile-dates">
                              <div className="week-mobile-date-card">
                                <span className="week-mobile-date-label">
                                  <Pencil size={12} className="me-1" /> Entrenador
                                </span>
                                <div className="week-mobile-date-value">{trainerDateLabel}</div>
                              </div>
                              <div className="week-mobile-date-card">
                                <span className="week-mobile-date-label">
                                  <UserPen size={12} className="me-1" /> Alumno
                                </span>
                                <div className="week-mobile-date-value">{athleteDateLabel}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="week-mobile-foot">
                          <div className="week-mobile-block-wrap">
                            <span className="week-mobile-block-caption">Bloque</span>
                            <div
                              className="week-mobile-block-pill"
                              title={blockName}
                              style={{
                                backgroundColor: blockColor,
                                color: getContrastYIQ(blockColor)
                              }}
                            >
                              {blockName}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="week-mobile-edit-block"
                            onClick={() => handleEditBlock(w)}
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
                  <div className="text-center text-muted py-4">No hay semanas creadas todavia.</div>
                )}
              </div>
            </div>
          )}
        </article>
</div>
{firstWidth < 991 && (

  <nav className="navbar footerColor fixed-bottom altoNavbb">


          {/* Columna izquierda */}
        <div className="col-3 d-flex  justify-content-center altoNavbb2 ">
  <SpeedDial
    visible={isResumenDialVisible}
    onVisibleChange={(visible) => {
      setIsResumenDialVisible(visible);
      if (visible) {
        setIsWeeksDialVisible(false);
        setIsToolsDialVisible(false);
      }
    }}
    showIcon={<UserPen size={20} />}
    hideIcon={<X />}
    model={itemsResumenAndDevolution}
    direction="up"
    mask
    className="bottom-dial"
    buttonClassName="rounded-5 styleDial "
  />
</div>

          {/* Columna centro */}
<div className="col-3 d-flex justify-content-center altoNavbb2">
  <SpeedDial
    visible={isWeeksDialVisible}
    onVisibleChange={(visible) => {
      setIsWeeksDialVisible(visible);
      if (visible) {
        setIsResumenDialVisible(false);
        setIsToolsDialVisible(false);
      }
    }}
    mask
    model={itemsWeeks}
    direction="up"
    className="bottom-dial"
    buttonClassName="rounded-5 styleDial "
  />
</div>

          {/* Columna derecha */}
<div className="col-3 d-flex justify-content-center altoNavbb2">
  <SpeedDial
    visible={isToolsDialVisible}
    onVisibleChange={(visible) => {
      setIsToolsDialVisible(visible);
      if (visible) {
        setIsResumenDialVisible(false);
        setIsWeeksDialVisible(false);
      }
    }}
    mask
    showIcon={<Pencil size={20} />}
    hideIcon={<X />}
    model={itemsHerramientas}
    direction="up"
    className="bottom-dial"
    buttonClassName="rounded-5 styleDial"
  />
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
          header="Resumen Semanal"
          visible={showWeeklySummaryModal}
          style={{ width: '80vw', maxWidth: 520 }}
          onHide={() => setShowWeeklySummaryModal(false)}
          draggable={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* cajita celeste con ultima actualizacion */}
            <div
              style={{
                background: '#e9f2ff',
                border: '1px solid #d6e4ff',
                color: '#2b5bbd',
                borderRadius: 10,
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: 12, opacity: .85, marginBottom: 4 }}>
                Ultima actualizacion
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {weeklySummary.lastSaved ? new Date(weeklySummary.lastSaved).toLocaleString() : '-'}
              </div>
            </div>

            {/* filas con badge a la derecha */}
            {[
              ['Alimentacion:', weeklySummary.selection1],
              ['NEAT:', weeklySummary.selection2],
              ['Sensaciones:', weeklySummary.selection3],
              ['Descanso / Sueno:', weeklySummary.selection4],
              ['Estres:', weeklySummary.selection5],
              ['Peso:', weeklySummary.pesoCorporal || '-'],
              ['Comentarios:', weeklySummary.comments || '-'],
            ].map(([label, value], i) => (
              <div key={i} className="d-flex justify-content-between align-items-center">
                <div>{label}</div>
                <span
                  className={`badge ${typeof value === 'string' ? getBadgeStyle(value) : 'bg-secondary'}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 10,
                    minWidth: 60,
                    textAlign: 'center'
                  }}
                >
                  {value || '-'}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center align-bottom my-3">
            <button 
              className="btn btn-outline-light"
              onClick={() => {
                setCorrectionsText(profile.devolucion || "");
                setShowCorrectionsDialog(true);
              }}
            >
              Cargar correcciones/devoluciones
            </button>
          </div>

          <div className="row justify-content-center mt-2">
            <button
              className="btn"
              style={{
                background: '#0b132b',
                color: '#fff',
                width: '90%',
                borderRadius: 12
              }}
              onClick={() => setShowWeeklySummaryModal(false)}
            >
              Cerrar
            </button>
          </div>
        </Dialog>

        <Dialog
          header="Correcciones / Devolucion"
          visible={showCorrectionsDialog}
          onHide={() => setShowCorrectionsDialog(false)}
          style={{ width: firstWidth > 900 ? '40%' : '90%' }}
        >
          <div className="mb-3">
            <textarea 
              className="form-control" 
              rows="5" 
              value={correctionsText} 
              onChange={(e) => setCorrectionsText(e.target.value)}
              placeholder="Ingrese las correcciones o devolucion..."
            />
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary me-2" onClick={() => setShowCorrectionsDialog(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleCorrectionsSave}>
              Guardar
            </button>
          </div>
        </Dialog>

        <Dialog
          header="Sin link de Drive"
          visible={showDriveLinkDialog}
          onHide={() => setShowDriveLinkDialog(false)}
          className='col-10 col-lg-4'
        >
          <p className='text-dark'>Pedile a tu alumno que suba el link de su drive para poder verlo</p>
          <div className="text-center mt-3">
            <Button label="Cerrar" onClick={() => setShowDriveLinkDialog(false)} />
          </div>
        </Dialog>

        <Dialog
          header="Perfil del Alumno"
          visible={showProfileDialog}
          style={{ width: '30vw' }}
          onHide={() => setShowProfileDialog(false)}
          draggable={true}
        >
          {profile && (
            <div className="text-muted small">
              <div className="d-flex justify-content-between bgItemsDropdown"><span className='ms-2'>Edad</span><strong className='me-2'>{profile.edad || '-'} anos</strong></div>
              <div className="d-flex justify-content-between bgItemsDropdown"><span className='ms-2'>Peso</span><strong className='me-2'>{profile.peso || '-'} kg</strong></div>
              <div className="d-flex justify-content-between bgItemsDropdown"><span className='ms-2'>Altura</span><strong className='me-2'>{profile.altura || '-'} cm</strong></div>
            </div>
          )}
          <div className="text-center mt-3">
            <Button label="Cerrar" onClick={() => setShowProfileDialog(false)} />
          </div>
        </Dialog>

        <Dialog
          header="Comentarios completos"
          visible={showCommentsDialog}
          style={{ width: '60vw', maxWidth: '800px' }}
          onHide={() => setShowCommentsDialog(false)}
          draggable
        >
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {weeklySummary.comments || 'No hay comentarios'}
          </div>
          <div className="text-center mt-3">
            <Button label="Cerrar" onClick={() => setShowCommentsDialog(false)} />
          </div>
        </Dialog>

        {/* ====== NUEVO: Editor de comentarios por semana (MessageSquare) ====== */}
        <Dialog
          header="Comentarios de la semana"
          visible={showWeekCommentsDialog}
          className='col-11'
          appendTo={document.body} 
          baseZIndex={2100}
          onHide={() => setShowWeekCommentsDialog(false)}
          footer={
            <div className="d-flex gap-2 justify-content-end">
              <Button
                label="Cancelar"
                className="p-button-text"
                onClick={() => setShowWeekCommentsDialog(false)}
              />
              <Button label="Guardar" onClick={handleSaveWeekComments} />
            </div>
          }
          draggable
        >
          {/* Titulo + modo */}
          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-md">
              <label htmlFor="comments-title" className="form-label d-block mb-2">
                Titulo
              </label>
              <InputText
                id="comments-title"
                value={commentsTitle}
                onChange={(e) => setCommentsTitle(e.target.value)}
                className="w-100 text-dark"
                placeholder="Comentarios semanales"
              />
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="comments-mode" className="form-label d-block mb-2">
                Modo
              </label>
              <Dropdown
                id="comments-mode"
                value={commentsMode}
                options={modeOptions}
                optionLabel="label"
                optionValue="value"
                className="w-100"
                onChange={(e) => setCommentsMode(e.value)}
              />
            </div>
          </div>

          {/* Contenido */}
          {commentsMode === "free" ? (
            <div>
              <label htmlFor="comments-body" className="form-label d-block mb-2">
                Comentarios
              </label>
              <InputTextarea
                id="comments-body"
                value={commentsDescription}
                onChange={(e) => setCommentsDescription(e.target.value)}
                className="w-100 text-dark"
                rows={5}
                placeholder="Escribi aqui los comentarios para tu alumno..."
              />
            </div>
          ) : (
            <div className="d-grid gap-1">
              {commentsDaysMeta.length ? (
                commentsDaysMeta.map((d) => (
                  <div key={d._id} className="shadow-1">
                    <div className="mb-2 fw-semibold">{d.label}</div>
                    <InputTextarea
                      value={commentsByDay[d._id] || ""}
                      onChange={(e) =>
                        setCommentsByDay((prev) => ({
                          ...prev,
                          [d._id]: e.target.value,
                        }))
                      }
                      className="w-100 text-dark"
                      rows={1}
                      autoResize
                      placeholder={`Comentario para ${d.label}...`}
                    />
                  </div>
                ))
              ) : (
                <div className="text-muted">
                  Esta semana no tiene dias cargados todavia.
                </div>
              )}
            </div>
          )}
        </Dialog>
       
       
       <Dialog
  header="Modo de creacion de semanas"
  visible={showModeDialog}
  onHide={() => setShowModeDialog(false)}
  style={{ width: firstWidth > 900 ? '40%' : '90%' }}
>
  <p className="mb-3">
    Aca podes elegir si queres nombrar las semanas por numero
    (<strong>Semana 1, Semana 2...</strong>) o por fecha
    (<strong>Semana del 01/01/2025</strong>).
  </p>

  <div className="d-flex align-items-center justify-content-between bgItemsDropdown p-3 rounded">
    <span className="text-light me-2">
      {useDate ? 'Modo fecha' : 'Modo numerico'}
    </span>
    <div className="form-check form-switch mb-0">
      <input
        className="form-check-input"
        type="checkbox"
        checked={useDate}
        onChange={handleToggleUseDate}
      />
    </div>
  </div>

  <div className="text-end mt-3">
    <Button label="Cerrar" onClick={() => setShowModeDialog(false)} />
  </div>
</Dialog>



<Dialog
  header="Asignar bloque a la semana"
  visible={showBlockDialog}
  style={{ width: '90vw', maxWidth: 520 }}
  onHide={() => setShowBlockDialog(false)}
>
  {blockDialogWeek && (
    <div className="d-flex flex-column gap-3">
      <div>
        <div className="mb-2">Semana: <strong>{blockDialogWeek.name}</strong></div>
        {(() => {
          const currentBlock = blockDialogWeek.block || null;
          const bg = currentBlock?.color || '#6c757d';
          const fg = getContrastYIQ(bg);
          return (
            <div className="px-2 py-1 rounded-pill small" style={{ backgroundColor: bg, color: fg, display: 'inline-block' }}>
              {currentBlock?.name || 'Sin bloque'}
            </div>
          );
        })()}
      </div>

      <Dropdown
        value={selectedBlockId || null}
        options={buildOptions(blockDialogWeek.block)}
        dataKey="_id"
        optionLabel="name"
        optionValue="_id"
        className="w-100"
        placeholder="Seleccionar bloque"
        onChange={(e) => handleBlockDropdownChange(blockDialogWeek._id, e.value)}
        itemTemplate={itemTemplate}
      />

      <div className="d-flex justify-content-between">
        <button className="btn btn-outline-secondary" onClick={() => setShowManageBlocksDialog(true)}>
          Gestionar bloques...
        </button>
        <div className="d-flex gap-2">
          <Button label="Cerrar" className="p-button-text" onClick={() => setShowBlockDialog(false)} />
        </div>
      </div>
    </div>
  )}
</Dialog>

<Dialog
  header="Gestion de bloques"
  visible={showManageBlocksDialog}
  style={{ width: '90vw', maxWidth: 900 }}
  onHide={() => {
    setShowManageBlocksDialog(false);
    // refrescamos lista de bloques por si el usuario creo/edito colores/nombres
    BlockService.getBlocks(trainer_id).then((raw) => {
      const normalized = raw.map((b) => ({ ...b, _id: b._id.toString() }));
      setBlocks(normalized);
    });
  }}
>
  <BlocksListPage id={trainer_id} />
</Dialog>

<Dialog
  header="Confirmar eliminacion"
  visible={confirmDeleteOpen}
  appendTo={document.body}
  baseZIndex={2100}
  style={{ width: '90vw', maxWidth: 420 }}
  onHide={cancelDeleteWeek}
>
  <div className="mb-3">
    {weekPendingDelete
      ? <>Queres eliminar la <strong>{weekPendingDelete.name || 'semana'}</strong>? Esta accion no se puede deshacer.</>
      : 'Queres eliminar esta semana?'}
  </div>

  <div className="d-flex justify-content-end gap-2">
    <Button label="Cancelar" className="btn btn-outline-dark" onClick={cancelDeleteWeek} />
    <Button label="Eliminar" className="btn btn-danger" onClick={confirmDeleteWeek} />
  </div>
</Dialog>

      </section>
    </>
  );
}

export default UserRoutineEditPage;
