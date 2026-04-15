// PaymentsManagerPage.js (PARTE 1: LOGICA SOLA)
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
   Box, Chip, IconButton, Typography, Button, Tooltip, Stack, Paper, Avatar
 } from '@mui/material';
import { Edit, Save, Cancel, FilterList, SortByAlpha, RestartAlt,
 AccessTime, PeopleAlt, EventAvailable, TrendingUp,
 FitnessCenter, SportsSoccer, SportsBasketball, SportsGolf, MusicNote,
 SportsMma, SportsKabaddi, StarBorder, FavoriteBorder, ChevronLeft, ChevronRight,
 HighlightOff, CheckCircleOutline, Autorenew, HelpOutline, Paid, Lock, LockOpen, Password
} from '@mui/icons-material';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import MuiDialog from '@mui/material/Dialog';
import { addLocale, locale as setPrimeLocale } from 'primereact/api';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';


import * as UsersService from './../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import { useNavigate, useParams } from 'react-router-dom';

// Services Finance (con auth-token)
import {
  getFinanceLedger,
  createFinanceExpense,
  createFinanceCashflow,
  createFinanceExtraSale,
 getOwnerId as getOwnerIdService,
 updateFinanceItem,
 deleteFinanceItem,
} from './../../services/finance.services.js';

// ================== Constantes/UI data ==================
const DUE_DAY = 10;
const MODE_STORAGE_KEY = 'payments_days_mode';
const GATE_SESSION_KEY = 'payments_gate_ok';

const expenseCategoryOptions = [
  'Proveedor', 'Alquiler', 'Servicios', 'Impuestos', 'Insumos', 'Mantenimiento', 'Otro'
].map(c => ({ label: c, value: c }));

const modeOptions = [
  { label: 'm. fijo', value: 'fijo' },
  { label: 'm. ind.', value: 'individual' },
];

const paidOptions = [
  { label: 'Activo', value: true },
  { label: 'Inactivo - Bloquear acceso', value: 'bloquear' },
  { label: 'Inactivo - Permitir acceso', value: 'permitir' },
];

const methodOptions = ['Transferencia', 'Efectivo', 'Otro'].map(m => ({ label: m, value: m }));
const goalOptions = [
  'Salud', 'Estetica', 'Powerlifting', 'BJJ', 'MMA',
  'Basquet', 'Futbol', 'Boxeo', 'Danza', 'Bodybuilding', 'Golf'
].map(g => ({ label: g, value: g }));

const nutricionOptions = [
  { label: 'Si', value: true },
  { label: 'No', value: false }
];

const planOptions = [
  { label: 'Mensual', value: 'Mensual' },
  { label: 'Trimestral', value: 'Trimestral' },
  { label: 'Semestral', value: 'Semestral' },
  { label: 'Anual', value: 'Anual' }
];

// ================== Utils ==================
const monthsByPlan = (plan) => {
  switch (plan) {
    case 'Mensual': return 1;
    case 'Trimestral': return 3;
    case 'Semestral': return 6;
    case 'Anual': return 12;
    default: return 1;
  }
};
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const clampDueDay = (y, m) => {
  const lastDay = new Date(y, m + 1, 0).getDate();
  return Math.min(DUE_DAY, lastDay);
};

const nextRenewalDateFixed = (payment_date, plan) => {
  if (!payment_date) return null;
  const months = monthsByPlan(plan || 'Mensual');
  const base = new Date(payment_date);
  const y = base.getFullYear();
  const m = base.getMonth() + months;
  const day = clampDueDay(y, m);
  return new Date(y, m, day);
};

const nextRenewalDateIndividual = (payment_date, plan) => {
  if (!payment_date) return null;
  const months = monthsByPlan(plan || 'Mensual');
  const base = new Date(payment_date);
  const y = base.getFullYear();
  const m = base.getMonth() + months;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const day = Math.min(base.getDate(), lastDay);
  return new Date(y, m, day);
};

const inferTheoreticalDue = (selectedMonth, plan = 'Mensual') => {
  if (!selectedMonth) return null;
  const months = monthsByPlan(plan);
  const y = selectedMonth.getFullYear();
  const m = selectedMonth.getMonth() + months;
  const day = clampDueDay(y, m);
  return new Date(y, m, day);
};

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  const MS = 1000 * 60 * 60 * 24;
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((d1.getTime() - d2.getTime()) / MS);
};

const currencyARS = (val) => {
  const n = Number(val);
  if (isNaN(n)) return '-';
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
};

const currencyUSD = (val) => {
  const n = Number(val);
  if (isNaN(n)) return '-';
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const initials = (name = '') => {
  const parts = String(name).trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase() || '?';
};

const formatRemainingVsToday = (daysVsToday) => {
  if (daysVsToday === null || daysVsToday === undefined) return null;
  if (daysVsToday === 0) return 'Vence hoy';
  if (daysVsToday < 0) return `Vencido hace ${Math.abs(daysVsToday)} dias`;
  return `Restan ${daysVsToday} dias`;
};

const daysBadge = (days, status) => {
  if (days === null || days === undefined) return { text: '-', color: 'text.secondary' };
  if (days === 0) return { text: 'Hoy', color: status === 'vencida' ? 'error.main' : 'warning.main' };
  if (days < 0) return { text: `${Math.abs(days)} dias venc.`, color: 'error.main' };
  if (status === 'por_vencer') return { text: `${days} dias`, color: 'warning.main' };
  return { text: `${days} dias`, color: 'success.main' };
};

const sanitizeMonthly = (data) => ({
  isPaid: data?.isPaid ?? null,
  payment_method: data?.payment_method || '',
  payment_date: data?.payment_date ? new Date(data.payment_date).toISOString() : null,
  payment_amount: Number(data?.payment_amount) || 0,
});

const nameStripeColor = (isPaid) => {
  if (isPaid === true) return 'success.main';
  if (isPaid === 'bloquear') return 'error.main';
  if (isPaid === 'permitir') return 'warning.main';
  return 'text.disabled';
};


// ================== Componente (logica) ==================
export default function PaymentsManagerPage() {
  const { id } = useParams(); // gymId
  const navigate = useNavigate();
// Desglose de ingresos/gastos/ventas
const [breakdownOpen, setBreakdownOpen] = useState(false);

  // PrimeReact locale
  useEffect(() => {
    addLocale('es', {
      firstDayOfWeek: 1,
      dayNames: ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'],
      dayNamesShort: ['dom','lun','mar','mie','jue','vie','sab'],
      dayNamesMin: ['D','L','M','X','J','V','S'],
      monthNames: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
      monthNamesShort: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
      today: 'Hoy',
      clear: 'Limpiar'
    });
    setPrimeLocale('es');
  }, []);

  // Mes actual/control
  const now = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const currentMonthEnd   = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 0), [now]);
  const [selectedMonth, setSelectedMonth] = useState(() => currentMonthStart);
  const selectedMonthKey = useMemo(() => monthKey(selectedMonth), [selectedMonth]);
  const atCurrentMonth   = useMemo(() => selectedMonthKey === monthKey(currentMonthStart), [selectedMonthKey, currentMonthStart]);
  const today = new Date();
  const goalIconMap = {
  Salud: <FavoriteBorder fontSize="small" />,
  Estetica: <StarBorder fontSize="small" />,
  Powerlifting: <FitnessCenter fontSize="small" />,
  BJJ: <SportsKabaddi fontSize="small" />,
  MMA: <SportsMma fontSize="small" />,
  Basquet: <SportsBasketball fontSize="small" />,
  Futbol: <SportsSoccer fontSize="small" />,
  Boxeo: <SportsMma fontSize="small" />,
  Danza: <MusicNote fontSize="small" />,
  Bodybuilding: <FitnessCenter fontSize="small" />,
  Golf: <SportsGolf fontSize="small" />,
};

// ---------- Colores por objetivo ----------
const goalsColors = {
  Salud: 'success',
  Estetica: 'info',
  Powerlifting: 'warning',
  BJJ: 'primary',
  MMA: 'secondary',
  Basquet: 'error',
  Futbol: 'success',
  Boxeo: 'warning',
  Danza: 'info',
  Bodybuilding: 'secondary',
  Golf: 'success'
};

// Que item estoy editando por cada tipo
const [editing, setEditing] = useState({
  expenseId: null,
  cashflowId: null,
  extraSaleId: null,
});

  const goMonth = (delta) => {
    setSelectedMonth(prev => {
      const candidate = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      return candidate > currentMonthStart ? currentMonthStart : candidate;
    });
    setEditedRows({});
  };

  // Modo de calculo
  const [daysMode, setDaysMode] = useState(() => {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      return (saved === 'fijo' || saved === 'individual') ? saved : 'fijo';
    } catch { return 'fijo'; }
  });
  useEffect(() => { try { localStorage.setItem(MODE_STORAGE_KEY, daysMode); } catch {} }, [daysMode]);

  // Filtros/sort
  const [filters, setFilters] = useState({
    text: { name: '' },
    selects: { goal: null, isPaid: null, nutricion: null, plan: null }
  });
  const [sortField, setSortField] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Dolar blue (mantengo tu logica)
  const [blueRate, setBlueRate] = useState(null);
  const [blueUpdated, setBlueUpdated] = useState(null);
  const [blueError, setBlueError] = useState(null);
  const [widgetInjected, setWidgetInjected] = useState(false);

  const fetchBlueRate = useCallback(async () => {
    try {
      setBlueError(null);
      const r1 = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const j1 = await r1.json();
      const sell = Number(j1?.blue?.value_sell || j1?.blue?.value_avg);
      if (!sell || Number.isNaN(sell)) throw new Error('Bluelytics invalido');
      setBlueRate(sell);
      setBlueUpdated(new Date());
      return;
    } catch {
      try {
        const r2 = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales');
        const j2 = await r2.json();
        const blue = (j2 || []).find(x => (x?.casa?.nombre || '').toLowerCase().includes('blue'));
        const ventaStr = blue?.casa?.venta || '';
        const venta = Number(ventaStr.replace('.', '').replace(',', '.'));
        if (!venta || Number.isNaN(venta)) throw new Error('Dolarsi invalido');
        setBlueRate(venta);
        setBlueUpdated(new Date());
      } catch {
        setBlueError('No se pudo obtener la cotizacion automaticamente');
      }
    }
  }, []);
  useEffect(() => { fetchBlueRate(); }, [fetchBlueRate]);
  useEffect(() => {
    if (!blueError || widgetInjected) return;
    const container = document.getElementById('vdb-widget');
    if (!container) return;
    container.innerHTML = '';
    const a = document.createElement('a');
    a.href = 'https://www.valordolarblue.com.ar/';
    a.className = 'valordolarblue-widget';
    a.setAttribute('data-width', '280');
    a.title = 'Precio Dolar Blue';
    a.innerHTML = '<b>Dolar Blue</b>';
    container.appendChild(a);
    if (!document.getElementById('valordolarblue-widget')) {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.id = 'valordolarblue-widget';
      s.async = true;
      s.src = '//www.valordolarblue.com.ar/static/js/widget.min.js?2.0';
      document.body.appendChild(s);
    }
    setWidgetInjected(true);
  }, [blueError, widgetInjected]);

  // ======== Datos base (usuarios) ========
  const [usersRaw, setUsersRaw] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState({});

  useEffect(() => {
    UsersService.find(id).then(data => {
      const withInfo = data.map(u => ({ ...u, _paymentInfo: u.payment_info || {} }));
      setUsersRaw(withInfo);
    });
  }, [id]);

  const rowsForMonth = useMemo(() => {
    return usersRaw.map(u => {
      const info = u._paymentInfo || {};
      const months = info.months || {};
      const rec = months[selectedMonthKey];

      const globalGoal = info.payment_goal || '';
      const globalNutri = (typeof info.nutricion === 'boolean') ? info.nutricion : null;
      const globalPlan = info.plan || 'Mensual';

      if (rec) {
        return {
          ...u,
          isPaid: rec.isPaid ?? null,
          payment_method: rec.payment_method || '',
          payment_date: rec.payment_date ? new Date(rec.payment_date) : '',
          payment_amount: (rec.payment_amount ?? '').toString(),
          payment_goal: globalGoal,
          nutricion: globalNutri,
          plan: globalPlan,
        };
      }

      const isCurrentMonth = selectedMonthKey === monthKey(currentMonthStart);
      if (isCurrentMonth) {
        return {
          ...u,
          isPaid: info.isPaid ?? null,
          payment_method: info.payment_method || '',
          payment_date: info.payment_date ? new Date(info.payment_date) : '',
          payment_amount: (info.payment_amount ?? '').toString(),
          payment_goal: globalGoal,
          nutricion: globalNutri,
          plan: globalPlan,
        };
      }

      const prev = new Date(selectedMonth);
      prev.setMonth(prev.getMonth() - 1);
      const prevKey = monthKey(prev);
      const prevRec = months[prevKey];

      return {
        ...u,
        isPaid: null,
        payment_method: '',
        payment_date: '',
        payment_amount: (prevRec?.payment_amount ?? info.payment_amount ?? '').toString(),
        payment_goal: globalGoal,
        nutricion: globalNutri,
        plan: globalPlan,
      };
    });
  }, [usersRaw, selectedMonthKey, currentMonthStart, selectedMonth]);

  const visibleRows = useMemo(() => {
    return rowsForMonth.map(r => editedRows[r._id] ? { ...r, ...editedRows[r._id] } : r);
  }, [rowsForMonth, editedRows]);

  const handleEditChange = useCallback((rowId, field, value) => {
    setEditedRows(prev => {
      const base = prev[rowId] || visibleRows.find(r => r._id === rowId) || {};
      return { ...prev, [rowId]: { ...base, [field]: value } };
    });
  }, [visibleRows]);

  const handleSaveAll = useCallback(async () => {
    try {
      const ops = Object.entries(editedRows).map(async ([userId, data]) => {
        const user = usersRaw.find(u => String(u._id) === String(userId));
        const prevInfo = user?._paymentInfo || {};
        const prevMonths = prevInfo.months || {};

        const monthPayload = sanitizeMonthly(data);
        const months = { ...prevMonths, [selectedMonthKey]: monthPayload };

        const newGlobals = {
          payment_goal: (data?.payment_goal ?? prevInfo.payment_goal) || '',
          nutricion: (typeof data?.nutricion === 'boolean') ? data.nutricion
                    : (typeof prevInfo.nutricion === 'boolean' ? prevInfo.nutricion : null),
          plan: (data?.plan ?? prevInfo.plan) || 'Mensual',
        };

        const nowKey = monthKey(currentMonthStart);
        const monthlyMirror = (selectedMonthKey === nowKey)
          ? {
              isPaid: monthPayload.isPaid ?? null,
              payment_method: monthPayload.payment_method || '',
              payment_date: monthPayload.payment_date || null,
              payment_amount: Number(monthPayload.payment_amount) || 0,
            }
          : {
              isPaid: prevInfo.isPaid ?? null,
              payment_method: prevInfo.payment_method || '',
              payment_date: prevInfo.payment_date || null,
              payment_amount: Number(prevInfo.payment_amount) || 0,
            };

        const newPaymentInfo = {
          ...prevInfo,
          months,
          ...newGlobals,
          ...monthlyMirror,
        };

        await UsersService.updatePaymentInfo(userId, newPaymentInfo);
      });

      await Promise.all(ops);
      Notify.instantToast('Cambios guardados correctamente');
      setEditMode(false);
      setEditedRows({});

      const fresh = await UsersService.find(id);
      setUsersRaw(fresh.map(u => ({ ...u, _paymentInfo: u.payment_info || {} })));
    } catch {
      Notify.instantToast('Error al guardar');
    }
  }, [editedRows, usersRaw, selectedMonthKey, currentMonthStart, id]);

  const onEditExpense = (item) => {
  setEditing(prev => ({ ...prev, expenseId: item._id }));
  setExpenseForm({
    categoria: item.categoria || 'Proveedor',
    nombre: item.nombre || '',
    monto: String(item.monto ?? ''),
    descripcion: item.descripcion || ''
  });
  setExpenseOpen(true);
};

const onDeleteExpense = async (item) => {
  if (!ownerId) return Notify.instantToast('No hay ownerId (:id)');
  try {
    await deleteFinanceItem(item._id, ownerId);
    await loadLedger();
    Notify.instantToast('Gasto eliminado');
  } catch {
    Notify.instantToast('Error al eliminar gasto');
  }
};

const cancelEditExpense = () => {
  setEditing(prev => ({ ...prev, expenseId: null }));
  setExpenseForm({ categoria: 'Proveedor', nombre: '', monto: '', descripcion: '' });
};

// ---------- CASHFLOW: editar/eliminar ----------
const onEditCashflow = (item) => {
  setEditing(prev => ({ ...prev, cashflowId: item._id }));
  setCashflowForm({
    tipo: item.tipo || 'INGRESO',
    concepto: item.concepto || '',
    monto: String(item.monto ?? ''),
    descripcion: item.descripcion || ''
  });
  setCashflowOpen(true);
};

const onDeleteCashflow = async (item) => {
  if (!ownerId) return Notify.instantToast('No hay ownerId (:id)');
  try {
    await deleteFinanceItem(item._id, ownerId);
    await loadLedger();
    Notify.instantToast('Movimiento eliminado');
  } catch {
    Notify.instantToast('Error al eliminar movimiento');
  }
};

const cancelEditCashflow = () => {
  setEditing(prev => ({ ...prev, cashflowId: null }));
  setCashflowForm({ tipo: 'INGRESO', concepto: '', monto: '', descripcion: '' });
};

// ---------- EXTRA SALE: editar/eliminar ----------
const onEditExtraSale = (item) => {
  setEditing(prev => ({ ...prev, extraSaleId: item._id }));
  setExtraSaleForm({
    nombre: item.nombre || '',
    monto: String(item.monto ?? '')
  });
  setExtraSaleOpen(true);
};

const onDeleteExtraSale = async (item) => {
  if (!ownerId) return Notify.instantToast('No hay ownerId (:id)');
  try {
    await deleteFinanceItem(item._id, ownerId);
    await loadLedger();
    Notify.instantToast('Venta eliminada');
  } catch {
    Notify.instantToast('Error al eliminar venta');
  }
};

const cancelEditExtraSale = () => {
  setEditing(prev => ({ ...prev, extraSaleId: null }));
  setExtraSaleForm({ nombre: '', monto: '' });
};

  const persistSingleRenew = useCallback(async (userId, payload) => {
    const user = usersRaw.find(u => String(u._id) === String(userId));
    const prevInfo = user?._paymentInfo || {};
    const prevMonths = prevInfo.months || {};

    const monthPayload = sanitizeMonthly({ ...payload, isPaid: true });
    const months = { ...prevMonths, [selectedMonthKey]: monthPayload };

    const newGlobals = {
      payment_goal: prevInfo.payment_goal || '',
      nutricion: (typeof prevInfo.nutricion === 'boolean') ? prevInfo.nutricion : null,
      plan: prevInfo.plan || 'Mensual',
    };

    const nowKey = monthKey(currentMonthStart);
    const monthlyMirror = (selectedMonthKey === nowKey)
      ? {
          isPaid: true,
          payment_method: monthPayload.payment_method || '',
          payment_date: monthPayload.payment_date || null,
          payment_amount: Number(monthPayload.payment_amount) || 0,
        }
      : {
          isPaid: prevInfo.isPaid ?? null,
          payment_method: prevInfo.payment_method || '',
          payment_date: prevInfo.payment_date || null,
          payment_amount: Number(prevInfo.payment_amount) || 0,
        };

    const newPaymentInfo = {
      ...prevInfo,
      months,
      ...newGlobals,
      ...monthlyMirror,
    };

    await UsersService.updatePaymentInfo(userId, newPaymentInfo);
  }, [usersRaw, selectedMonthKey, currentMonthStart]);

  // =================== Seguridad (Gate) ===================
const ownerId = id; // viene de useParams()
  const gateSessionKey = useMemo(() => `${GATE_SESSION_KEY}_${ownerId || 'default'}`, [ownerId]);
  const [gateEnabled, setGateEnabled] = useState(false);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateAskOpen, setGateAskOpen] = useState(false);
  const [gatePasswordInput, setGatePasswordInput] = useState('');
  const [setPwdOpen, setSetPwdOpen] = useState(false);
  const [newPwdInput, setNewPwdInput] = useState('');
  const [currentOwnerPaymentInfo, setCurrentOwnerPaymentInfo] = useState(null);

  const loadOwnerSecurity = useCallback(async () => {
    if (!ownerId) return;
    try {
      const owner = await UsersService.findUserById(ownerId);
      const sec = owner?.payment_info?.security || null;
      setCurrentOwnerPaymentInfo(owner?.payment_info || null);

      const enabled = Boolean(sec?.enabled) && typeof sec?.password === 'string' && sec.password.length > 0;
      setGateEnabled(enabled);
      const ok = sessionStorage.getItem(gateSessionKey) === '1';
      setGateUnlocked(enabled ? ok : true);
      setGateAskOpen(enabled && !ok);
    } catch {
      setCurrentOwnerPaymentInfo(null);
      setGateEnabled(false);
      setGateUnlocked(true);
      setGateAskOpen(false);
    }
  }, [ownerId, gateSessionKey]);

  useEffect(() => { loadOwnerSecurity(); }, [loadOwnerSecurity]);

  const tryUnlockGate = useCallback(() => {
    const savedPwd = currentOwnerPaymentInfo?.security?.password || null;
    if (!gateEnabled) {
      setGateUnlocked(true);
      setGateAskOpen(false);
      return;
    }
    if (!savedPwd) {
      Notify.instantToast('No hay contrasena configurada');
      return;
    }
    if (gatePasswordInput === savedPwd) {
      sessionStorage.setItem(gateSessionKey, '1');
      setGateUnlocked(true);
      setGateAskOpen(false);
      setGatePasswordInput('');
      Notify.instantToast('Acceso concedido');
    } else {
      Notify.instantToast('Contrasena incorrecta');
    }
  }, [gateEnabled, gatePasswordInput, currentOwnerPaymentInfo, gateSessionKey]);

const saveNewGatePassword = useCallback(async () => {
    if (!ownerId) {
      Notify.instantToast('No se encontro ownerId en localStorage');
      return;
    }
    try {
      let prevInfo = currentOwnerPaymentInfo;
      if (!prevInfo) {
        const owner = await UsersService.findUserById(ownerId);
        prevInfo = owner?.payment_info || {};
      }
      const nextInfo = {
        ...prevInfo,
        security: {
          enabled: Boolean(newPwdInput && newPwdInput.length > 0),
          password: newPwdInput || ''
        }
      };
      await UsersService.updatePaymentInfo(ownerId, nextInfo);
      await loadOwnerSecurity();
      setNewPwdInput('');
      setSetPwdOpen(false);
      Notify.instantToast('Contrasena actualizada');
    } catch {
      Notify.instantToast('Error al actualizar la contrasena');
    }
  }, [ownerId, newPwdInput, currentOwnerPaymentInfo, loadOwnerSecurity]);

  const clearGateForThisTab = useCallback(() => {
    sessionStorage.removeItem(gateSessionKey);
    setGateUnlocked(false);
    if (gateEnabled) setGateAskOpen(true);
  }, [gateEnabled, gateSessionKey]);

  const exitProtectedPayments = useCallback(() => {
    setGateAskOpen(false);
    navigate(ownerId ? `/users/${ownerId}` : '/', { replace: true });
  }, [navigate, ownerId]);

  // =================== Ledger (via services) ===================
  const [ledger, setLedger] = useState({ expenses: [], cashflows: [], extraSales: [] });
  const [ledgerLoading, setLedgerLoading] = useState(false);

    // Sumatoria de pagos visibles (alumnos)
  const totalPaymentsARS = useMemo(
    () => visibleRows.reduce((acc, r) => {
      const v = parseFloat(r.payment_amount);
      return !isNaN(v) ? acc + v : acc;
    }, 0),
    [visibleRows]
  );

  const loadLedger = useCallback(async () => {
    if (!ownerId) return;
    setLedgerLoading(true);
    try {
      const data = await getFinanceLedger({ ownerId });
      setLedger({
        expenses: Array.isArray(data?.expenses) ? data.expenses : [],
        cashflows: Array.isArray(data?.cashflows) ? data.cashflows : [],
        extraSales: Array.isArray(data?.extraSales) ? data.extraSales : [],
      });
    } catch {
      Notify.instantToast('No se pudo cargar el flujo de caja');
    } finally {
      setLedgerLoading(false);
    }
  }, [ownerId]);
  useEffect(() => { loadLedger(); }, [loadLedger]);

const ledgerTotals = useMemo(() => {
  const ingresosCF = ledger.cashflows
    .filter(x => (x?.tipo || x?.cashflow_tipo) === 'INGRESO')
    .reduce((a, x) => a + (Number(x.monto) || 0), 0);

  const retirosCF = ledger.cashflows
    .filter(x => (x?.tipo || x?.cashflow_tipo) === 'RETIRO')
    .reduce((a, x) => a + (Number(x.monto) || 0), 0);

  const gastos = ledger.expenses.reduce((a, x) => a + (Number(x.monto) || 0), 0);

  // 👇 sumamos ventas adicionales como ingreso
  const ventasAdic = ledger.extraSales.reduce((a, x) => a + (Number(x.monto) || 0), 0);

  const ingresosTotales = (totalPaymentsARS || 0) + ingresosCF + ventasAdic;
  const saldo = ingresosTotales - retirosCF - gastos;

  return { ingresos: ingresosCF + ventasAdic, retiros: retirosCF, gastos, saldo };
}, [ledger, totalPaymentsARS]);

const enrichedRows = useMemo(() => {
  return visibleRows.map(r => {
    const plan = r.plan || 'Mensual';
    const dueFixedFromPayment = nextRenewalDateFixed(r.payment_date, plan);
    const dueIndivFromPayment = nextRenewalDateIndividual(r.payment_date, plan);
    const dueTheo = inferTheoreticalDue(selectedMonth, plan);
    const due = (daysMode === 'fijo') ? (dueFixedFromPayment || dueTheo) : (dueIndivFromPayment || dueTheo);
    const daysVsToday = due ? daysBetween(due, today) : null;
    let cuotaStatus = null;
    if (due) {
      if (daysVsToday < 0) cuotaStatus = 'vencida';
      else if (daysVsToday <= 7) cuotaStatus = 'por_vencer';
      else cuotaStatus = 'al_dia';
    }
    const daysRemaining = due ? daysBetween(due, today) : null;
    const origin = r.payment_date ? new Date(r.payment_date) : null;
    const cycleLength =
      (origin && ((daysMode === 'fijo' && dueFixedFromPayment) || (daysMode === 'individual' && dueIndivFromPayment)))
        ? daysBetween((daysMode === 'fijo' ? dueFixedFromPayment : dueIndivFromPayment), origin)
        : null;

    return { 
      ...r,
      _dueDate: due,
      _daysRemaining: daysRemaining,
      _daysVsToday: daysVsToday,
      _cycleLength: cycleLength,
      _cuotaStatus: cuotaStatus
    };
  });
}, [visibleRows, selectedMonth, today, daysMode]);


const breakdown = useMemo(() => {
  // Alumnos: contamos aquellos con isPaid===true en el mes seleccionado
  const alumnosPagos = enrichedRows.filter(r => r.isPaid === true);
  const alumnosCount = alumnosPagos.length;
  const alumnosTotal = alumnosPagos.reduce((acc, r) => acc + (Number(r.payment_amount) || 0), 0);

  // Gastos
  const gastosCount = ledger.expenses.length;
  const gastosTotal = ledger.expenses.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);

  // Cashflow: Ingresos / Retiros
  const cfIngresos = ledger.cashflows.filter(x => (x?.tipo || x?.cashflow_tipo) === 'INGRESO');
  const cfRetiros  = ledger.cashflows.filter(x => (x?.tipo || x?.cashflow_tipo) === 'RETIRO');

  const cfInCount  = cfIngresos.length;
  const cfInTotal  = cfIngresos.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);

  const cfOutCount = cfRetiros.length;
  const cfOutTotal = cfRetiros.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);

  // Ventas adicionales
  const ventasCount = ledger.extraSales.length;
  const ventasTotal = ledger.extraSales.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);

  // Neto de desglose (mismo criterio que ledgerTotals pero mostrandolo aca)
  const neto = (alumnosTotal + cfInTotal + ventasTotal) - (cfOutTotal + gastosTotal);

  return {
    alumnos: { count: alumnosCount, total: alumnosTotal },
    gastos:  { count: gastosCount,  total: gastosTotal  },
    cfIn:    { count: cfInCount,    total: cfInTotal    },
    cfOut:   { count: cfOutCount,   total: cfOutTotal   },
    ventas:  { count: ventasCount,  total: ventasTotal  },
    neto
  };
}, [enrichedRows, ledger]);



  // Dialogos (estado)
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [cashflowOpen, setCashflowOpen] = useState(false);
  const [extraSaleOpen, setExtraSaleOpen] = useState(false);

  // Formularios
  const [expenseForm, setExpenseForm] = useState({ categoria: 'Proveedor', nombre: '', monto: '', descripcion: '' });
  const [cashflowForm, setCashflowForm] = useState({ tipo: 'INGRESO', concepto: '', monto: '', descripcion: '' });
  const [extraSaleForm, setExtraSaleForm] = useState({ nombre: '', monto: '' });

  const submitExpense = useCallback(async () => {
  if (!ownerId) return Notify.instantToast('No hay ownerId (:id)');
  if (!expenseForm.nombre || !expenseForm.monto) return Notify.instantToast('Completa nombre y monto');

  const payload = {
    categoria: expenseForm.categoria,
    nombre: expenseForm.nombre,
    monto: Number(expenseForm.monto),
    descripcion: expenseForm.descripcion || ''
  };

  try {
  if (editing.expenseId) {
    // EDITAR gasto → mantener el dialogo abierto
    await updateFinanceItem(editing.expenseId, payload, ownerId);
    Notify.instantToast('Gasto actualizado');
    // salgo del modo edicion y dejo el formulario "en blanco" para cargar otro si quiere
    cancelEditExpense();
  } else {
    // CREAR gasto → mantener el dialogo abierto
    await createFinanceExpense(payload, ownerId);
    Notify.instantToast('Gasto registrado');
    // limpio el form para otro alta
    setExpenseForm({ categoria: 'Proveedor', nombre: '', monto: '', descripcion: '' });
  }
  // NO cierro el dialog
  await loadLedger(); // refresco la tabla dentro del dialogo
} catch (e) {
  console.error('[submitExpense]', e);
  Notify.instantToast('Error al guardar gasto');
}
}, [ownerId, expenseForm, editing.expenseId, loadLedger]);

// CREAR/EDITAR Cashflow
const submitCashflow = useCallback(async () => {
  if (!ownerId) return Notify.instantToast('No hay ownerId (:id)');
  if (!cashflowForm.concepto || !cashflowForm.monto) return Notify.instantToast('Completa concepto y monto');

  const payload = {
    tipo: cashflowForm.tipo,
    concepto: cashflowForm.concepto,
    monto: Number(cashflowForm.monto),
    descripcion: cashflowForm.descripcion || ''
  };

  try {
  if (editing.cashflowId) {
    await updateFinanceItem(editing.cashflowId, payload, ownerId);
    Notify.instantToast('Movimiento actualizado');
    cancelEditCashflow(); // deja limpio para otro alta
  } else {
    await createFinanceCashflow(payload, ownerId);
    Notify.instantToast('Movimiento registrado');
    setCashflowForm({ tipo: 'INGRESO', concepto: '', monto: '', descripcion: '' });
  }
  // Mantengo abierto el dialogo y refresco
  await loadLedger();
} catch {
  Notify.instantToast('Error al guardar movimiento');
}

}, [ownerId, cashflowForm, editing.cashflowId, loadLedger]);

// CREAR/EDITAR Venta adicional
const submitExtraSale = useCallback(async () => {
  if (!ownerId) return Notify.instantToast('No hay ownerId (:id)');
  if (!extraSaleForm.nombre || !extraSaleForm.monto) return Notify.instantToast('Completa nombre y monto');

  const payload = {
    nombre: extraSaleForm.nombre,
    monto: Number(extraSaleForm.monto)
  };

  try {
  if (editing.extraSaleId) {
    await updateFinanceItem(editing.extraSaleId, payload, ownerId);
    Notify.instantToast('Venta actualizada');
    cancelEditExtraSale();
  } else {
    await createFinanceExtraSale(payload, ownerId);
    Notify.instantToast('Venta registrada');
    setExtraSaleForm({ nombre: '', monto: '' });
  }
  // Mantengo abierto, refresco
  await loadLedger();
} catch {
  Notify.instantToast('Error al guardar venta');
}

}, [ownerId, extraSaleForm, editing.extraSaleId, loadLedger]);

const openBreakdown = () => setBreakdownOpen(true);
const closeBreakdown = () => setBreakdownOpen(false);





  const filteredRows = useMemo(() => {
    let result = [...enrichedRows];
    const { name } = filters.text;
    const { goal, isPaid, nutricion, plan } = filters.selects;

    if (name) result = result.filter(r => r.name?.toLowerCase?.().includes(name.toLowerCase()));
    if (nutricion !== null) result = result.filter(r => r.nutricion === nutricion);
    if (plan !== null) result = result.filter(r => r.plan === plan);
    if (goal !== null) result = result.filter(r => r.payment_goal === goal);
    if (isPaid !== null) result = result.filter(r => r.isPaid === isPaid);

    if (sortField) {
      result.sort((a, b) => {
        const x = a[sortField];
        const y = b[sortField];
        if (sortField === 'payment_amount') {
          const nx = Number(x) || 0, ny = Number(y) || 0;
          return sortAsc ? nx - ny : ny - nx;
        }
        if (sortField === 'payment_date') {
          const dx = x ? new Date(x).getTime() : 0;
          const dy = y ? new Date(y).getTime() : 0;
          return sortAsc ? dx - dy : dy - dx;
        }
        if (sortField === 'name') {
          return sortAsc
            ? String(x).localeCompare(String(y))
            : String(y).localeCompare(String(x));
        }
        return sortAsc
          ? String(x).localeCompare(String(y))
          : String(y).localeCompare(String(x));
      });
    }
    return result;
  }, [enrichedRows, filters, sortField, sortAsc]);



  // KPIs (neto Regla B)
  const kpis = useMemo(() => {
    const activos = enrichedRows.filter(r => r.isPaid === true).length;
    const porVencer = enrichedRows.filter(r => r._cuotaStatus === 'por_vencer').length;
    const vencidos = enrichedRows.filter(r => r._cuotaStatus === 'vencida').length;

    const ingresosNeto = (totalPaymentsARS || 0)
      + (ledgerTotals.ingresos || 0)
      - (ledgerTotals.retiros || 0)
      - (ledgerTotals.gastos || 0);

    return { activos, porVencer, vencidos, ingresosTotales: ingresosNeto };
  }, [enrichedRows, totalPaymentsARS, ledgerTotals]);

  // Renovar mes
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewRowId, setRenewRowId] = useState(null);
  const [renewMonto, setRenewMonto] = useState('');
  const [renewFecha, setRenewFecha] = useState(new Date());
  const [renewMetodo, setRenewMetodo] = useState('Transferencia');

  const openRenew = (row) => {
    setRenewRowId(row._id);
    setRenewMonto((row.payment_amount ?? '').toString());
    const todayLocal = new Date();
    const initDate = todayLocal > currentMonthEnd ? currentMonthEnd : todayLocal;
    setRenewFecha(initDate);
    setRenewMetodo(row.payment_method || 'Transferencia');
    setRenewOpen(true);
  };

  const confirmRenew = async () => {
    if (!renewRowId) return;
    handleEditChange(renewRowId, 'payment_amount', renewMonto);
    handleEditChange(renewRowId, 'payment_date', renewFecha);
    handleEditChange(renewRowId, 'payment_method', renewMetodo);
    handleEditChange(renewRowId, 'isPaid', true);
    setRenewOpen(false);

    try {
      await persistSingleRenew(renewRowId, {
        payment_amount: renewMonto,
        payment_date: renewFecha,
        payment_method: renewMetodo,
        isPaid: true,
      });
      const fresh = await UsersService.find(id);
      setUsersRaw(fresh.map(u => ({ ...u, _paymentInfo: u.payment_info || {} })));
      setEditedRows(prev => {
        const next = { ...prev };
        delete next[renewRowId];
        return next;
      });
      Notify.instantToast('Renovacion guardada');
    } catch {
      Notify.instantToast('Error al guardar la renovacion');
    }
  };

  // Ventanas de 12 meses
  const monthsWindow = useMemo(() => {
    const arr = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - i, 1);
      arr.push(d);
    }
    return arr;
  }, [currentMonthStart]);
  const monthShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // Chips activos
  const activeFilterChips = [];
  if (filters.text.name) activeFilterChips.push({ label: `Nombre: ${filters.text.name}` });
  if (filters.selects.isPaid !== null) {
    const label = paidOptions.find(opt => opt.value === filters.selects.isPaid)?.label || 'Estado';
    activeFilterChips.push({ label });
  }
  if (filters.selects.goal !== null) activeFilterChips.push({ label: `Objetivo: ${filters.selects.goal}` });
  if (filters.selects.nutricion !== null) activeFilterChips.push({ label: `Nutricion: ${filters.selects.nutricion ? 'Si' : 'No'}` });
  if (filters.selects.plan !== null) activeFilterChips.push({ label: `Plan: ${filters.selects.plan}` });



return (
  <Box className='p-3' style={{ minHeight: '100vh' }}>
    {/* ====== GATE DE SEGURIDAD ====== */}
    <MuiDialog
      open={gateAskOpen}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        exitProtectedPayments();
      }}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          },
        },
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
          },
        },
      }}
    >
      <Box p={3}>
        <Stack spacing={2} alignItems="stretch">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Lock />
            <Typography variant="h6">Acceso protegido</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Ingresa la contrasena para gestionar pagos.
          </Typography>
          <InputText
            value={gatePasswordInput}
            onChange={e => setGatePasswordInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') tryUnlockGate();
            }}
            placeholder="Contrasena"
            type="password"
            className="p-inputtext-sm w-full"
          />
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button variant="outlined" onClick={exitProtectedPayments}>Salir</Button>
            <Button variant="contained" onClick={tryUnlockGate} startIcon={<LockOpen />}>Entrar</Button>
          </Stack>
        </Stack>
      </Box>
    </MuiDialog>

    {/* ====== DIALOG: PONER/CAMBIAR CONTRASENA ====== */}
    <MuiDialog open={setPwdOpen} onClose={() => setSetPwdOpen(false)} fullWidth maxWidth="xs">
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Password />
            <Typography variant="h6">Poner contrasena</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Introducí la contraseña para ingresar a esta información.
          </Typography>
          <InputText
            value={newPwdInput}
            onChange={e => setNewPwdInput(e.target.value)}
            placeholder="Nueva contrasena"
            type="password"
            className="p-inputtext-sm w-full"
          />
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button variant="text" onClick={() => setSetPwdOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={saveNewGatePassword} startIcon={<Save />}>Guardar</Button>
          </Stack>
        </Stack>
      </Box>
    </MuiDialog>

    {/* ====== KPIs ====== */}
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} className='mb-3'>
      <Paper className='p-2 flex-grow-1' elevation={3} sx={{ borderLeft: 4, borderColor: 'success.main' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0}>
            <Typography variant='caption'>Miembros Activos</Typography>
            <Typography variant='h6' sx={{ color: 'success.main' }}>{kpis.activos}</Typography>
          </Stack>
          <PeopleAlt fontSize="small" sx={{ color: 'success.main' }} />
        </Stack>
      </Paper>

      <Paper className='p-2 flex-grow-1' elevation={3} sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0}>
            <Typography variant='caption'>Por Vencer (≤7 dias)</Typography>
            <Typography variant='h6' sx={{ color: 'warning.main' }}>{kpis.porVencer}</Typography>
          </Stack>
          <AccessTime fontSize="small" sx={{ color: 'warning.main' }} />
        </Stack>
      </Paper>

      <Paper className='p-2 flex-grow-1' elevation={3} sx={{ borderLeft: 4, borderColor: 'error.main' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0}>
            <Typography variant='caption'>Vencidos</Typography>
            <Typography variant='h6' sx={{ color: 'error.main' }}>{kpis.vencidos}</Typography>
          </Stack>
          <EventAvailable fontSize="small" sx={{ color: 'error.main' }} />
        </Stack>
      </Paper>

      {/* Ingresos ARS (Neto Regla B) */}
      <Paper className='p-2 flex-grow-1' elevation={5} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0}>
            <Typography variant='caption'>Ingresos Totales (Neto)</Typography>
            <Typography variant='h6'>{currencyARS(kpis.ingresosTotales)}</Typography>
            <Box mt={1}>
              <Button size="small" variant="outlined" onClick={() => setBreakdownOpen(true)}>
                Ver desglose
              </Button>
            </Box>
          </Stack>
          <TrendingUp fontSize="small" />
        </Stack>
      </Paper>

      {/* Ingresos USD (Blue) */}
      <Paper className='p-2 flex-grow-1' elevation={5} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0}>
            <div>
              <Typography variant='caption'>Ingresos en USD (Dolar blue)</Typography>
              <Tooltip title={`Estimacion con dolar blue (venta). 1 USD = ${blueRate || '-'} ARS`}>
                <HelpOutline fontSize="inherit" className='ms-2' />
              </Tooltip>
            </div>
            <Typography variant='h6'>
              {blueRate ? currencyUSD(kpis.ingresosTotales / blueRate) : '-'}
            </Typography>
          </Stack>
          <Paid fontSize="small" />
        </Stack>
        {blueError && (<Box id="vdb-widget" sx={{ mt: 1 }} />)}
      </Paper>
    </Stack>

    {/* ====== Selector de meses ====== */}
    <Paper className='p-2 mb-3' elevation={1} sx={{ borderLeft: 4, borderColor: 'info.main' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography variant='caption' sx={{ fontWeight: 600 }}>Meses (ultimos 12)</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowX: 'auto', py: 0.5 }}>
          {monthsWindow.map((d) => {
            const isSel = monthKey(d) === selectedMonthKey;
            return (
              <Paper
                key={monthKey(d)}
                elevation={isSel ? 2 : 0}
                onClick={() => { setSelectedMonth(d); setEditedRows({}); }}
                sx={{
                  px: 1.25, py: 0.75, mr: 1, cursor: 'pointer',
                  borderLeft: 3,
                  borderColor: isSel ? 'info.main' : 'divider',
                  bgcolor: isSel ? 'action.selected' : 'background.paper',
                  minWidth: 78, textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                  {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][d.getMonth()]} {String(d.getFullYear()).slice(-2)}
                </Typography>
              </Paper>
            );
          })}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={() => goMonth(-1)} size="small"><ChevronLeft fontSize="small" /></IconButton>
          <Typography variant='body2' sx={{ minWidth: 120, textAlign: 'center' }}>
            {(() => {
              const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
              return `${months[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
            })()}
          </Typography>
          <IconButton onClick={() => goMonth(1)} size="small" disabled={atCurrentMonth}><ChevronRight fontSize="small" /></IconButton>
        </Stack>
      </Stack>
    </Paper>

    {/* ====== Titulo + Acciones ====== */}
    <Box className='mb-2' sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <Typography variant='subtitle1' sx={{ whiteSpace: 'nowrap' }}>
        Lista de alumnos ({filteredRows.length})
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: 'nowrap' }}>
        {/* Botones globales */}
        <Button size="small" variant='outlined' onClick={() => setExpenseOpen(true)}>Gasto</Button>
        <Button size="small" variant='outlined' onClick={() => { setCashflowOpen(true); loadLedger(); }}>Flujo de caja</Button>
        <Button size="small" variant='outlined' onClick={() => setExtraSaleOpen(true)}>Venta adicional</Button>

        {/* Seguridad */}
        <Button
          size="small"
          variant='outlined'
          color={gateEnabled ? 'warning' : 'primary'}
          startIcon={<Password />}
          onClick={() => setSetPwdOpen(true)}
        >
          Poner contrasena
        </Button>
        {gateEnabled && (
          <Button size="small" variant='text' color='error' onClick={clearGateForThisTab} startIcon={<Lock />}>
            Bloquear pestana
          </Button>
        )}

        {/* Editar/Guardar */}
        {!editMode ? (
          <Button size="small" variant='outlined' onClick={() => setEditMode(true)} startIcon={<Edit fontSize="small" />}>
            Editar tabla
          </Button>
        ) : (
          <>
            <Button size="small" variant='contained' color='success' onClick={handleSaveAll} startIcon={<Save fontSize="small" />}>
              Guardar
            </Button>
            <Button size="small" variant='outlined' color='error' onClick={() => { setEditMode(false); setEditedRows({}); }} startIcon={<Cancel fontSize="small" />}>
              Cancelar
            </Button>
          </>
        )}
      </Stack>
    </Box>

    {/* ====== Filtros ====== */}
    <Paper className='p-2 mb-3' elevation={0} variant="outlined" style={{ fontSize: '0.9rem' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <Box sx={{ flex: 1, minWidth: 220 }} className="d-flex align-items-center gap-2 px-1">
            <FilterList fontSize="small" />
            <InputText
              value={filters.text.name}
              onChange={(e)=>setFilters(prev=>({...prev, text:{...prev.text, name:e.target.value}}))}
              placeholder="Buscar por nombre"
              className='w-100'
            />
          </Box>

          <Dropdown
            value={filters.selects.isPaid}
            options={[{ label: 'Todos los estados', value: null }, ...paidOptions]}
            onChange={(e) => setFilters(prev=>({...prev,selects:{...prev.selects,isPaid:e.value}}))}
            placeholder="Todos los estados"
            className="px-1"
            optionLabel="label"
            optionValue="value"
          />
          <Dropdown
            value={filters.selects.goal}
            options={[{ label: 'Todos los objetivos', value: null }, ...goalOptions]}
            onChange={(e) => setFilters(prev=>({...prev,selects:{...prev.selects,goal:e.value}}))}
            placeholder="Todos los objetivos"
            className="px-1"
            optionLabel="label"
            optionValue="value"
          />
          <Dropdown
            value={filters.selects.plan}
            options={[{ label: 'Todos los planes', value: null }, ...planOptions]}
            onChange={(e) => setFilters(prev=>({...prev,selects:{...prev.selects,plan:e.value}}))}
            placeholder="Todos los planes"
            className="px-1"
            optionLabel="label"
            optionValue="value"
          />
          <Dropdown
            value={filters.selects.nutricion}
            options={[{ label: 'Nutricion', value: null }, ...nutricionOptions]}
            onChange={(e) => setFilters(prev=>({...prev,selects:{...prev.selects,nutricion:e.value}}))}
            placeholder="Nutricion"
            className="px-1"
            optionLabel="label"
            optionValue="value"
          />
        </Stack>

        <Button
          size='small'
          variant='outlined'
          startIcon={<RestartAlt fontSize="small" />}
          onClick={() => setFilters({text:{name:''}, selects:{goal:null,isPaid:null,nutricion:null,plan:null}})}
        >
          Limpiar
        </Button>
      </Stack>
    </Paper>

    {/* ====== Chips filtros activos ====== */}
    <Box className='mb-2 d-flex flex-wrap gap-2' style={{ fontSize: '0.85rem' }}>
      {activeFilterChips.map((chip, index) => (
        <Chip key={index} label={chip.label} color='info' variant='outlined' size="small" />
      ))}
    </Box>

    {/* ====== Tabla ====== */}
    <div className="table-responsive small">
      <table className='table table-sm align-middle table-hover text-center' style={{ fontSize: '0.85rem' }}>
        <thead className='table-light'>
          <tr>
            <th style={{ width: '22%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                Miembro
                <IconButton size="small" onClick={() => { setSortField('name'); setSortAsc(a=>!a); }}>
                  <SortByAlpha fontSize="small" />
                </IconButton>
              </Box>
            </th>
            <th style={{ width: '10%' }}>Estado</th>
            <th style={{ width: '10%' }}>Metodo</th>
            <th style={{ width: '20%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                Pago
              </Box>
            </th>
            <th style={{ width: '10%' }}>Objetivo</th>
            <th style={{ width: '8%' }}>Nutricion</th>
            <th style={{ width: '8%' }}>Plan</th>
            <th style={{ width: '12%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>Dias</span>
                <Dropdown
                  value={daysMode}
                  options={modeOptions}
                  onChange={(e)=> setDaysMode(e.value)}
                  optionLabel="label"
                  optionValue="value"
                  className="px-1"
                />
                <Tooltip title={
                  daysMode === 'fijo'
                    ? 'Modo fijo: vencimiento el dia 10; respeta plan (1/3/6/12 meses).'
                    : 'Modo individual: vencimiento el mismo dia del pago; respeta el plan (1/3/6/12).'
                }>
                  <HelpOutline fontSize="inherit" />
                </Tooltip>
              </Box>
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map(row => {
            const isEditing = editMode;
            const dInfo = daysBadge(row._daysRemaining, row._cuotaStatus);
            return (
              <tr
                key={row._id}
                className='text-center'
                style={{
                  background:
                    row._cuotaStatus === 'vencida' ? 'rgba(255,0,0,0.04)'
                      : row._cuotaStatus === 'por_vencer' ? 'rgba(255,165,0,0.06)'
                        : undefined
                }}
              >
                {/* Miembro */}
                <td className='text-start'>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start" sx={{ pl: 1 }}>
                    <Box sx={{ width: 6, height: 36, borderRadius: 3, bgcolor: nameStripeColor(row.isPaid), flex: '0 0 auto' }} />
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{initials(row.name)}</Avatar>
                    <Typography variant='body2'>{row.name}</Typography>
                  </Stack>
                </td>

                {/* Estado */}
                <td>
                  {isEditing ? (
                    <Dropdown
                      className='w-100'
                      value={row.isPaid}
                      options={paidOptions}
                      onChange={(e) => handleEditChange(row._id, 'isPaid', e.value)}
                      placeholder="Estado"
                      optionLabel="label"
                      optionValue="value"
                    />
                  ) : (
                    row.isPaid === null || row.isPaid === undefined || row.isPaid === '' ? (
                      <span className="text-muted">-</span>
                    ) : (
                      <Chip
                        label={row.isPaid === true ? 'Activo' : row.isPaid === 'permitir' ? 'Inactivo' : 'Suspendido'}
                        color={row.isPaid === true ? 'success' : row.isPaid === 'permitir' ? 'warning' : 'error'}
                        size='small'
                      />
                    )
                  )}
                </td>

                {/* Metodo */}
                <td>
                  {isEditing ? (
                    <Dropdown
                      className='w-100'
                      value={row.payment_method}
                      options={methodOptions}
                      onChange={(e) => handleEditChange(row._id, 'payment_method', e.value)}
                      placeholder="Metodo"
                      optionLabel="label"
                      optionValue="value"
                    />
                  ) : (
                    row.payment_method || '-'
                  )}
                </td>

                {/* Pago */}
                <td>
                  {isEditing ? (
                    <Stack spacing={0.5} alignItems="center">
                      <InputText
                        className='form-control text-center'
                        value={row.payment_amount}
                        onChange={(e) => {
                          const cleanedValue = e.target.value.replace(/[^0-9.]/g, '');
                          handleEditChange(row._id, 'payment_amount', cleanedValue);
                        }}
                      />
                      <Calendar
                        className='w-100 text-center'
                        value={row.payment_date || null}
                        onChange={(e) => handleEditChange(row._id, 'payment_date', e.value)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        maxDate={currentMonthEnd}
                        locale="es"
                      />
                    </Stack>
                  ) : (
                    <Tooltip
                      title={
                        [
                          `Monto: ${currencyARS(row.payment_amount)}`,
                          row.payment_date ? `Fecha: ${new Date(row.payment_date).toLocaleDateString()}` : null,
                          row._dueDate ? `Vence (${daysMode === 'fijo' ? 'fijo' : 'ind.'}): ${row._dueDate.toLocaleDateString()}` : null,
                          formatRemainingVsToday(row._daysVsToday)
                        ].filter(Boolean).join(' • ')
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openRenew(row)}
                          startIcon={<Autorenew fontSize="small" />}
                        >
                          Renovar
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                </td>

                {/* Objetivo */}
                <td>
                  {isEditing ? (
                    <Dropdown
                      className='w-100'
                      value={row.payment_goal}
                      options={goalOptions}
                      onChange={(e) => handleEditChange(row._id, 'payment_goal', e.value)}
                      placeholder="Objetivo"
                      optionLabel="label"
                      optionValue="value"
                    />
                  ) : (
                    row.payment_goal
                      ? <Chip label={row.payment_goal} icon={goalIconMap[row.payment_goal]} color={goalsColors[row.payment_goal] || 'default'} size='small' />
                      : <span className="text-muted">-</span>
                  )}
                </td>

                {/* Nutricion */}
                <td>
                  {isEditing ? (
                    <Dropdown
                      className='w-100'
                      value={row.nutricion}
                      options={nutricionOptions}
                      onChange={(e) => handleEditChange(row._id, 'nutricion', e.value)}
                      placeholder="Nutricion"
                      optionLabel="label"
                      optionValue="value"
                    />
                  ) : (
                    row.nutricion === null || row.nutricion === undefined
                      ? <span className="text-muted">-</span>
                      : (
                        <Tooltip title={row.nutricion ? 'Si' : 'No'}>
                          {row.nutricion ? <CheckCircleOutline color="success" fontSize="small" /> : <HighlightOff color="error" fontSize="small" />}
                        </Tooltip>
                      )
                  )}
                </td>

                {/* Plan */}
                <td>
                  {isEditing ? (
                    <Dropdown
                      className='w-100'
                      value={row.plan || 'Mensual'}
                      options={planOptions}
                      onChange={(e) => handleEditChange(row._id, 'plan', e.value)}
                      placeholder="Plan"
                      optionLabel="label"
                      optionValue="value"
                    />
                  ) : (
                    <Chip label={row.plan || 'Mensual'} color='primary' size='small' />
                  )}
                </td>

                {/* Dias */}
                <td>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: dInfo.color }}>
                    {dInfo.text}
                  </Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* ====== Dialog: Renovar mes ====== */}
    <Dialog
      header="Renovar mes"
      visible={renewOpen}
      onHide={() => setRenewOpen(false)}
      style={{ width: '38rem', maxWidth: '95vw' }}
    >
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Monto</label>
          <InputText
            className="form-control"
            value={renewMonto}
            onChange={(e) => setRenewMonto(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Fecha</label>
          <Calendar
            value={renewFecha || new Date()}
            onChange={(e) => setRenewFecha(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            maxDate={currentMonthEnd}
            className="w-100 text-dark"
            locale="es"
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Metodo de pago</label>
          <Dropdown
            value={renewMetodo}
            options={methodOptions}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setRenewMetodo(e.value)}
            className="w-100 p-dropdown-group"
            placeholder="Metodo"
          />
        </div>
        <div className="col-12 text-end mt-2 mt-4">
          <Button className="me-2" variant="outlined" onClick={() => setRenewOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmRenew}>Confirmar</Button>
        </div>
      </div>
    </Dialog>

    {/* ====== Dialog: Registrar/Editar gasto ====== */}
    <Dialog
      header={editing.expenseId ? "Editar gasto" : "Registrar gasto"}
      visible={expenseOpen}
      onHide={() => { setExpenseOpen(false); cancelEditExpense(); }}
      style={{ width: '38rem', maxWidth: '95vw' }}
    >
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Categoria</label>
          <Dropdown
            value={expenseForm.categoria}
            options={expenseCategoryOptions}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setExpenseForm(f => ({ ...f, categoria: e.value }))}
            className="w-100"
            placeholder="Categoria"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Nombre</label>
          <InputText
            className="form-control"
            value={expenseForm.nombre}
            onChange={(e) => setExpenseForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Proveedor, Alquiler, Servicios..."
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Monto</label>
          <InputText
            className="form-control"
            value={expenseForm.monto}
            onChange={(e) => setExpenseForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9.]/g, '') }))}
            placeholder="0"
          />
        </div>
        <div className="col-12">
          <label className="form-label">Descripcion</label>
          <InputText
            className="form-control"
            value={expenseForm.descripcion}
            onChange={(e) => setExpenseForm(f => ({ ...f, descripcion: e.target.value }))}
            placeholder="Opcional"
          />
        </div>

        <div className="col-12 d-flex justify-content-between mt-2">
          {editing.expenseId ? (
            <Button variant="outlined" color="warning" onClick={cancelEditExpense}>Cancelar edicion</Button>
          ) : <span />}
          <div>
            <Button className="me-2" variant="outlined" onClick={() => { setExpenseOpen(false); cancelEditExpense(); }}>Cerrar</Button>
            <Button variant="contained" onClick={submitExpense}>
              {editing.expenseId ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Historial de gastos */}
      <Box mt={3}>
        <Typography variant='subtitle2' gutterBottom>Gastos recientes</Typography>
        <div className="table-responsive">
          <table className='table table-sm align-middle'>
            <thead className='table-light'>
              <tr>
                <th>Fecha</th>
                <th>Categoria</th>
                <th>Nombre</th>
                <th className='text-end'>Monto</th>
                <th className='text-center' style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ledger.expenses.slice().reverse().slice(0, 50).map((it) => (
                <tr key={it._id}>
                  <td>{it.fecha ? new Date(it.fecha).toLocaleString() : '-'}</td>
                  <td>{it.categoria || '-'}</td>
                  <td>{it.nombre || '-'}</td>
                  <td className='text-end'>{currencyARS(it.monto)}</td>
                  <td className='text-center'>
                    <IconButton size="small" onClick={() => onEditExpense(it)} title="Editar">
                      <Edit fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteExpense(it)} title="Eliminar">
                      <HighlightOff fontSize="inherit" />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {ledger.expenses.length === 0 && (
                <tr><td colSpan={5} className='text-center text-muted'>Sin gastos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Box>
    </Dialog>

    {/* ====== Dialog: Flujo de caja ====== */}
    <Dialog
      header={editing.cashflowId ? "Editar movimiento" : "Flujo de caja"}
      visible={cashflowOpen}
      onHide={() => { setCashflowOpen(false); cancelEditCashflow(); }}
      style={{ width: '52rem', maxWidth: '98vw' }}
    >
      {/* (Quitado el bloque de KPIs/Totales que antes estaba aca) */}

      {/* Form crear/editar */}
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-3">
          <label className="form-label">Tipo</label>
          <Dropdown
            value={cashflowForm.tipo}
            options={[{ label: 'Ingreso', value: 'INGRESO' }, { label: 'Retiro', value: 'RETIRO' }]}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setCashflowForm(f => ({ ...f, tipo: e.value }))}
            className="w-100"
          />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Concepto</label>
          <InputText
            className="form-control"
            value={cashflowForm.concepto}
            onChange={(e) => setCashflowForm(f => ({ ...f, concepto: e.target.value }))}
            placeholder="Ajuste caja, etc."
          />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Monto</label>
          <InputText
            className="form-control"
            value={cashflowForm.monto}
            onChange={(e) => setCashflowForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9.]/g, '') }))}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-2 text-end">
          <Button variant="contained" onClick={submitCashflow}>
            {editing.cashflowId ? 'Actualizar' : 'Agregar'}
          </Button>
        </div>
        <div className="col-12">
          <label className="form-label">Descripcion</label>
          <InputText
            className="form-control"
            value={cashflowForm.descripcion}
            onChange={(e) => setCashflowForm(f => ({ ...f, descripcion: e.target.value }))}
            placeholder="Opcional"
          />
        </div>
        {editing.cashflowId && (
          <div className="col-12 d-flex justify-content-end">
            <Button variant="outlined" color="warning" onClick={cancelEditCashflow}>Cancelar edicion</Button>
          </div>
        )}
      </div>

      {/* Listado movimientos */}
      <Box mt={3}>
        <Typography variant='subtitle2' gutterBottom>Movimientos recientes</Typography>
        <div className="table-responsive">
          <table className='table table-sm align-middle'>
            <thead className='table-light'>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th className='text-end'>Monto</th>
                <th className='text-center' style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ledger.cashflows.slice().reverse().slice(0, 50).map((m) => (
                <tr key={m._id}>
                  <td>{m.fecha ? new Date(m.fecha).toLocaleString() : '-'}</td>
                  <td>
                    <Chip
                      label={m.tipo === 'INGRESO' ? 'Ingreso' : 'Retiro'}
                      color={m.tipo === 'INGRESO' ? 'success' : 'warning'}
                      size="small"
                    />
                  </td>
                  <td>{m.concepto || '-'}</td>
                  <td className='text-end'>{currencyARS(m.monto)}</td>
                  <td className='text-center'>
                    <IconButton size="small" onClick={() => onEditCashflow(m)} title="Editar">
                      <Edit fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteCashflow(m)} title="Eliminar">
                      <HighlightOff fontSize="inherit" />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {ledger.cashflows.length === 0 && (
                <tr><td colSpan={5} className='text-center text-muted'>Sin movimientos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Box>
    </Dialog>

    {/* ====== Dialog: Venta adicional ====== */}
    <Dialog
      header="Venta adicional"
      visible={extraSaleOpen}
      onHide={() => setExtraSaleOpen(false)}
      style={{ width: '32rem', maxWidth: '95vw' }}
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Nombre</label>
          <InputText
            className="form-control"
            value={extraSaleForm.nombre}
            onChange={(e) => setExtraSaleForm(f => ({ ...f, nombre: e.target.value })) }
            placeholder="Bebida, Indumentaria, etc."
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Monto</label>
          <InputText
            className="form-control"
            value={extraSaleForm.monto}
            onChange={(e) => setExtraSaleForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9.]/g, '') })) }
            placeholder="0"
          />
        </div>
        <div className="col-12 text-end mt-2">
          <Button variant="contained" onClick={submitExtraSale}>Registrar</Button>
        </div>
      </div>
    </Dialog>

    {/* ====== Dialog: Desglose ====== */}
<Dialog
  header="Desglose de ingresos y egresos"
  visible={breakdownOpen}
  onHide={() => setBreakdownOpen(false)}
  style={{ width: '64rem', maxWidth: '96vw' }}
>
  {/* Cards responsive, estilo KPI */}
  <Stack spacing={2}>
    {/* Fila 1 */}
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {/* Alumnos (cuotas pagas) */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
              <PeopleAlt fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Alumnos (cuotas pagas)
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                {currencyARS(breakdown.alumnos.total)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {breakdown.alumnos.count}
          </Typography>
        </Stack>
      </Paper>

      {/* Ingresos (cashflow) */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'success.light' }}>
              <Paid fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ingresos (cashflow)
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                {currencyARS(breakdown.cfIn.total)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {breakdown.cfIn.count}
          </Typography>
        </Stack>
      </Paper>

      {/* Ventas adicionales */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.light' }}>
              <ShoppingCartIcon  fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ventas adicionales
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                {currencyARS(breakdown.ventas.total)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {breakdown.ventas.count}
          </Typography>
        </Stack>
      </Paper>
    </Stack>

    {/* Fila 2 */}
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {/* Retiros (cashflow) */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'warning.light' }}>
              <ShoppingCartIcon  fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Retiros (cashflow)
              </Typography>
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
                -{currencyARS(breakdown.cfOut.total)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {breakdown.cfOut.count}
          </Typography>
        </Stack>
      </Paper>

      {/* Gastos */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'error.light' }}>
              <RemoveCircleOutlineIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Gastos
              </Typography>
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
                -{currencyARS(breakdown.gastos.total)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {breakdown.gastos.count}
          </Typography>
        </Stack>
      </Paper>

      {/* Ingresos Netos (tile destacado) */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          flex: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.dark',
                color: 'primary.contrastText'
              }}
            >
              <Paid fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Ingresos Netos
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {currencyARS(breakdown.neto)}
              </Typography>
            </Box>
          </Stack>

          {/* Boton a la derecha (estilo "pill") */}
          <Button
            size="small"
            variant="contained"
            color="inherit"
            onClick={() => setBreakdownOpen(false)}
            startIcon={<VisibilityIcon fontSize="small" />}
            sx={{
              color: 'primary.main',
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
              borderRadius: 999
            }}
          >
            Cerrar
          </Button>
        </Stack>
      </Paper>
    </Stack>
  </Stack>
</Dialog>

  </Box>
);


}
