// PaymentsManagerPage.js
// - Globales: payment_goal, nutricion, plan (iguales en todos los meses)
// - Mes máximo: mes actual (no permite meses futuros)
// - Día de vencimiento fijo = 10 (para cálculos y texto)
// - Columna "Pago": en vista muestra botón "Renovar mes"; en modo Editar muestra Monto + Fecha (PrimeReact Calendar)
// - KPIs: Activos (verde), Por vencer (naranja), Vencidos (rojo), Ingresos, Ingresos en USD (Blue)
// - Selector de Mes estilo KPI (últimos 12 meses, clickeables)
// - Compacto, responsive
// - ✅ Cambios visibles al editar SIN guardar (merge de editedRows en la UI)
// - ✅ Acciones como barra a la derecha del título
// - ✅ Tooltip en "Renovar mes" con monto (y fecha si existe)
// - ✅ Nombres con línea de color por estado (estilo KPI)
// - ✅ "Días" = (próximo vencimiento - fecha de pago); el color del estado mira HOY
// - ✅ Confirmar en "Renovar mes" guarda en backend y pone estado Activo
// - ✅ Ingresos en USD (Blue) con cotización en vivo + botón refrescar; fallback al widget

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Chip, IconButton, Typography, Button, Tooltip, Stack, Paper, Avatar
} from '@mui/material';
import {
  Edit, Save, Cancel, FilterList, SortByAlpha, RestartAlt, GetApp,
  AccessTime, PeopleAlt, EventAvailable, TrendingUp,
  FitnessCenter, SportsSoccer, SportsBasketball, SportsGolf, MusicNote,
  SportsMma, SportsKabaddi, StarBorder, FavoriteBorder, ChevronLeft, ChevronRight,
  HighlightOff, CheckCircleOutline, Autorenew, HelpOutline, Paid, Refresh
} from '@mui/icons-material';

import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { addLocale, locale as setPrimeLocale } from 'primereact/api';

import * as UsersService from './../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import { useParams } from 'react-router-dom';

// ---------- Constantes ----------
const DUE_DAY = 10;
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

const goalsColors = {
  Salud: 'success', Estetica: 'info', Powerlifting: 'warning', BJJ: 'primary',
  MMA: 'secondary', Basquet: 'error', Futbol: 'success', Boxeo: 'warning', Danza: 'info'
};

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

const nutricionOptions = [
  { label: 'Sí', value: true },
  { label: 'No', value: false }
];

const planOptions = [
  { label: 'Mensual', value: 'Mensual' },
  { label: 'Trimestral', value: 'Trimestral' },
  { label: 'Semestral', value: 'Semestral' },
  { label: 'Anual', value: 'Anual' }
];

// ---------- Utils ----------
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

const nextRenewalDate = (payment_date, plan) => {
  if (!payment_date) return null;
  const months = monthsByPlan(plan || 'Mensual');
  const base = new Date(payment_date);
  const y = base.getFullYear();
  const m = base.getMonth() + months;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const day = Math.min(DUE_DAY, lastDay);
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

const daysBadge = (days, status) => {
  if (days === null || days === undefined) return { text: '-', color: 'text.secondary' };
  if (days < 0) return { text: `${Math.abs(days)} días venc.`, color: 'error.main' };
  if (status === 'por_vencer') return { text: `${days} días`, color: 'warning.main' };
  return { text: `${days} días`, color: 'success.main' };
};

// Solo los campos MENSUALES en months["YYYY-MM"]
const sanitizeMonthly = (data) => ({
  isPaid: data?.isPaid ?? null,
  payment_method: data?.payment_method || '',
  payment_date: data?.payment_date ? new Date(data.payment_date).toISOString() : null,
  payment_amount: Number(data?.payment_amount) || 0,
});

// Color de la línea del nombre según estado
const nameStripeColor = (isPaid) => {
  if (isPaid === true) return 'success.main';
  if (isPaid === 'bloquear') return 'error.main';
  if (isPaid === 'permitir') return 'warning.main';
  return 'text.disabled';
};


// ---------- Componente ----------
export default function PaymentsManagerPage() {
  const { id } = useParams(); // gymId

  const [usersRaw, setUsersRaw] = useState([]); // {...user, _paymentInfo}
  const [editMode, setEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState({});

  // Locale ES para PrimeReact Calendar
  useEffect(() => {
    addLocale('es', {
      firstDayOfWeek: 1,
      dayNames: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
      dayNamesShort: ['dom','lun','mar','mié','jue','vie','sáb'],
      dayNamesMin: ['D','L','M','X','J','V','S'],
      monthNames: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
      monthNamesShort: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
      today: 'Hoy',
      clear: 'Limpiar'
    });
    setPrimeLocale('es');
  }, []);

  // Mes seleccionado: NO futuro
  const now = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const currentMonthEnd = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 0), [now]);

  const [selectedMonth, setSelectedMonth] = useState(() => currentMonthStart);
  const selectedMonthKey = useMemo(() => monthKey(selectedMonth), [selectedMonth]);
  const atCurrentMonth = useMemo(() => selectedMonthKey === monthKey(currentMonthStart), [selectedMonthKey, currentMonthStart]);

  const [filters, setFilters] = useState({
    text: { name: '' },
    selects: { goal: null, isPaid: null, nutricion: null, plan: null }
  });
  const [sortField, setSortField] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // ---- Cotización Dólar Blue (venta) ----
  const [blueRate, setBlueRate] = useState(null);
  const [blueUpdated, setBlueUpdated] = useState(null);
  const [blueError, setBlueError] = useState(null);
  const [widgetInjected, setWidgetInjected] = useState(false);

  const fetchBlueRate = useCallback(async () => {
    try {
      setBlueError(null);
      // 1) Bluelytics
      const r1 = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const j1 = await r1.json();
      const sell = Number(j1?.blue?.value_sell || j1?.blue?.value_avg);
      if (!sell || Number.isNaN(sell)) throw new Error('Bluelytics inválido');
      setBlueRate(sell);
      setBlueUpdated(new Date());
      return;
    } catch (e1) {
      // 2) Dolarsi como backup
      try {
        const r2 = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales');
        const j2 = await r2.json();
        const blue = (j2 || []).find(x => (x?.casa?.nombre || '').toLowerCase().includes('blue'));
        const ventaStr = blue?.casa?.venta || '';
        const venta = Number(ventaStr.replace('.', '').replace(',', '.'));
        if (!venta || Number.isNaN(venta)) throw new Error('Dolarsi inválido');
        setBlueRate(venta);
        setBlueUpdated(new Date());
        return;
      } catch (e2) {
        setBlueError('No se pudo obtener la cotización automáticamente');
      }
    }
  }, []);

  useEffect(() => { fetchBlueRate(); }, [fetchBlueRate]);

  // Fallback: si hay error, inserto el widget visual
  useEffect(() => {
    if (!blueError || widgetInjected) return;
    // contenedor
    const container = document.getElementById('vdb-widget');
    if (!container) return;
    container.innerHTML = '';
    const a = document.createElement('a');
    a.href = 'https://www.valordolarblue.com.ar/';
    a.className = 'valordolarblue-widget';
    a.setAttribute('data-width', '280');
    a.title = 'Precio Dólar Blue';
    a.innerHTML = '<b>Dólar Blue</b>';
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

  // ---- Carga base (tu API) ----
  useEffect(() => {
    UsersService.find(id).then(data => {
      const withInfo = data.map(u => ({ ...u, _paymentInfo: u.payment_info || {} }));
      setUsersRaw(withInfo);
    });
  }, [id]);

  // ---- Filas del mes seleccionado ----
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

  // ---- MERGE de ediciones en la UI ----
  const visibleRows = useMemo(() => {
    return rowsForMonth.map(r => editedRows[r._id] ? { ...r, ...editedRows[r._id] } : r);
  }, [rowsForMonth, editedRows]);

  // ---- Editar ----
  const handleEditChange = useCallback((rowId, field, value) => {
    setEditedRows(prev => {
      const base = prev[rowId] || visibleRows.find(r => r._id === rowId) || {};
      return { ...prev, [rowId]: { ...base, [field]: value } };
    });
  }, [visibleRows]);

  // ---- Guardar TODOS ----
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

  // ---- Guardar RENOVACIÓN de una sola fila ----
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

  // ---- Enriquecimiento + filtros/sort ----
  const today = useMemo(() => new Date(), []);
  const enrichedRows = useMemo(() => {
    return visibleRows.map(r => {
      const next = nextRenewalDate(r.payment_date, r.plan || 'Mensual');
      const daysFromToday = next ? daysBetween(next, today) : null;   // para estado visual
      const origin = r.payment_date ? new Date(r.payment_date) : null;
      const daysFromPayment = next && origin ? daysBetween(next, origin) : null; // para "Días"
      let cuotaStatus = null;
      if (next) {
        if (daysFromToday < 0) cuotaStatus = 'vencida';
        else if (daysFromToday <= 7) cuotaStatus = 'por_vencer';
        else cuotaStatus = 'al_dia';
      }
      return { ...r, _nextRenewal: next, _daysLeft: daysFromPayment, _cuotaStatus: cuotaStatus };
    });
  }, [visibleRows, today]);

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

  const totalAmountAll = useMemo(
    () => visibleRows.reduce((acc, r) => {
      const v = parseFloat(r.payment_amount);
      return !isNaN(v) ? acc + v : acc;
    }, 0),
    [visibleRows]
  );

  const kpis = useMemo(() => {
    const activos = enrichedRows.filter(r => r.isPaid === true).length;
    const porVencer = enrichedRows.filter(r => r._cuotaStatus === 'por_vencer').length;
    const vencidos = enrichedRows.filter(r => r._cuotaStatus === 'vencida').length;
    return { activos, porVencer, vencidos, ingresosTotales: totalAmountAll };
  }, [enrichedRows, totalAmountAll]);

  

  // ---- UI helpers ----
  const activeFilterChips = [];
  if (filters.text.name) activeFilterChips.push({ label: `Nombre: ${filters.text.name}` });
  if (filters.selects.isPaid !== null) {
    const label = paidOptions.find(opt => opt.value === filters.selects.isPaid)?.label || 'Estado';
    activeFilterChips.push({ label });
  }
  if (filters.selects.goal !== null) activeFilterChips.push({ label: `Objetivo: ${filters.selects.goal}` });
  if (filters.selects.nutricion !== null) activeFilterChips.push({ label: `Nutrición: ${filters.selects.nutricion ? 'Sí' : 'No'}` });
  if (filters.selects.plan !== null) activeFilterChips.push({ label: `Plan: ${filters.selects.plan}` });

  const monthLabel = useMemo(() => {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${months[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
  }, [selectedMonth]);

  const goMonth = (delta) => {
    setSelectedMonth(prev => {
      const candidate = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      return candidate > currentMonthStart ? currentMonthStart : candidate;
    });
    setEditedRows({});
  };

  // ---- Diálogo "Renovar mes" ----
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

    // 1) Actualizo UI al instante
    handleEditChange(renewRowId, 'payment_amount', renewMonto);
    handleEditChange(renewRowId, 'payment_date', renewFecha);
    handleEditChange(renewRowId, 'payment_method', renewMetodo);
    handleEditChange(renewRowId, 'isPaid', true);
    setRenewOpen(false);

    // 2) Persiste en backend SOLO esta fila
    try {
      await persistSingleRenew(renewRowId, {
        payment_amount: renewMonto,
        payment_date: renewFecha,
        payment_method: renewMetodo,
        isPaid: true,
      });
      // 3) Refresco datos desde servidor y limpio edición de esa fila
      const fresh = await UsersService.find(id);
      setUsersRaw(fresh.map(u => ({ ...u, _paymentInfo: u.payment_info || {} })));
      setEditedRows(prev => {
        const next = { ...prev };
        delete next[renewRowId];
        return next;
      });
      Notify.instantToast('Renovación guardada');
    } catch (e) {
      Notify.instantToast('Error al guardar la renovación');
    }
  };

  // ---- Meses estilo KPI (últimos 12) ----
  const monthsWindow = useMemo(() => {
    const arr = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - i, 1);
      arr.push(d);
    }
    return arr;
  }, [currentMonthStart]);

  const monthShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // ---------- Render ----------
  return (
    <Box className='p-3' style={{ minHeight: '100vh' }}>
      {/* KPIs */}
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
              <Typography variant='caption'>Por Vencer (≤7 días)</Typography>
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

        {/* Ingresos ARS */}
        <Paper className='p-2 flex-grow-1' elevation={5} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0}>
              <Typography variant='caption'>Ingresos Totales</Typography>
              <Typography variant='h6'>{currencyARS(kpis.ingresosTotales)}</Typography>
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
              <Tooltip title={`Esta estimación se realiza con el dolar blue (venta). Actualmente, 1 dolar = $${blueRate} pesos argentinos. El valor del dolar blue se actualiza en tiempo real.`}>
                    <HelpOutline fontSize="inherit" className='ms-2' />
                  </Tooltip>
                  </div>
                         <Typography variant='h6'>
                      {blueRate ? currencyUSD(kpis.ingresosTotales / blueRate) : '—'}
                    </Typography>
  
            </Stack>
            <Paid fontSize="small" />
          </Stack>
          {/* Fallback visual del widget si la API falló */}
          {blueError && (
            <Box id="vdb-widget" sx={{ mt: 1 }} />
          )}
        </Paper>
      </Stack>

      {/* Selector de meses estilo KPI */}
      <Paper className='p-2 mb-3' elevation={1} sx={{ borderLeft: 4, borderColor: 'info.main' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography variant='caption' sx={{ fontWeight: 600 }}>Meses (últimos 12)</Typography>
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
                    {monthShort[d.getMonth()]} {String(d.getFullYear()).slice(-2)}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => goMonth(-1)} size="small"><ChevronLeft fontSize="small" /></IconButton>
            <Typography variant='body2' sx={{ minWidth: 120, textAlign: 'center' }}>{monthLabel}</Typography>
            <IconButton onClick={() => goMonth(1)} size="small" disabled={atCurrentMonth}><ChevronRight fontSize="small" /></IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Título + Acciones */}
      <Box className='mb-2' sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Typography variant='subtitle1' sx={{ whiteSpace: 'nowrap' }}>
          Lista de alumnos ({filteredRows.length})
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: 'nowrap' }}>
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

      {/* Filtros */}
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
              options={[{ label: 'Nutrición', value: null }, ...nutricionOptions]}
              onChange={(e) => setFilters(prev=>({...prev,selects:{...prev.selects,nutricion:e.value}}))}
              placeholder="Nutrición"
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

      {/* Chips filtros activos */}
      <Box className='mb-2 d-flex flex-wrap gap-2' style={{ fontSize: '0.85rem' }}>
        {activeFilterChips.map((chip, index) => (
          <Chip key={index} label={chip.label} color='info' variant='outlined' size="small" />
        ))}
      </Box>

      {/* Tabla */}
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
              <th style={{ width: '10%' }}>Método</th>

              <th style={{ width: '20%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  Pago
                </Box>
              </th>

              <th style={{ width: '10%' }}>Objetivo</th>
              <th style={{ width: '8%' }}>Nutrición</th>
              <th style={{ width: '8%' }}>Plan</th>
              <th style={{ width: '12%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                  Días
                  <Tooltip title={`Fecha límite: todos los ${DUE_DAY} de todos los meses`}>
                    <HelpOutline fontSize="inherit" />
                  </Tooltip>
                </Box>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map(row => {
              const isEditing = editMode;
              const dInfo = daysBadge(row._daysLeft, row._cuotaStatus);

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
                  {/* Miembro con línea de color estilo KPI */}
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

                  {/* Método */}
                  <td>
                    {isEditing ? (
                      <Dropdown
                        className='w-100'
                        value={row.payment_method}
                        options={methodOptions}
                        onChange={(e) => handleEditChange(row._id, 'payment_method', e.value)}
                        placeholder="Método"
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
                          `Monto: ${currencyARS(row.payment_amount)}`
                          + (row.payment_date ? ` • Fecha: ${new Date(row.payment_date).toLocaleDateString()}` : '')
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

                  {/* Nutrición */}
                  <td>
                    {isEditing ? (
                      <Dropdown
                        className='w-100'
                        value={row.nutricion}
                        options={nutricionOptions}
                        onChange={(e) => handleEditChange(row._id, 'nutricion', e.value)}
                        placeholder="Nutrición"
                        optionLabel="label"
                        optionValue="value"
                      />
                    ) : (
                      row.nutricion === null || row.nutricion === undefined
                        ? <span className="text-muted">-</span>
                        : (
                          <Tooltip title={row.nutricion ? 'Sí' : 'No'}>
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

                  {/* Días (desde fecha de pago) */}
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

      {/* Dialog: Renovar mes */}
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
            <label className="form-label">Método de pago</label>
            <Dropdown
              value={renewMetodo}
              options={methodOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => setRenewMetodo(e.value)}
              className="w-100 p-dropdown-group"
              placeholder="Método"
            />
          </div>
          <div className="col-12 text-end mt-2 mt-4">
            <Button className="me-2" variant="outlined" onClick={() => setRenewOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={confirmRenew}>Confirmar</Button>
          </div>
        </div>
      </Dialog>
    </Box>
  );
}
