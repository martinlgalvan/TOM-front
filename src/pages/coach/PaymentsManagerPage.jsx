// PaymentsManagerPage.js - Versión responsive y con mejoras visuales en sidebar y encabezado

import React, { useEffect, useState } from 'react';
import {
  Box, Chip, IconButton, Typography, Button, Divider, useMediaQuery, Checkbox
} from '@mui/material';
import {
  Edit, Save, Cancel, FilterList
} from '@mui/icons-material';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Sidebar, Menu, MenuItem, useProSidebar } from 'react-pro-sidebar';
import * as UsersService from './../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import { useParams } from 'react-router-dom';
import Logo from "../../components/Logo.jsx";
import LogoChico from "../../components/LogoChico.jsx";

const paidOptions = [
  { label: 'Activo', value: true },
  { label: 'Inactivo - Bloquear acceso', value: 'bloquear' },
  { label: 'Inactivo - Permitir acceso', value: 'permitir' },
];

const methodOptions = ['Transferencia', 'Efectivo', 'Otro'].map(m => ({ label: m, value: m }));

const goalOptions = [
  'Salud', 'Estetica', 'Powerlifting', 'BJJ', 'MMA',
  'Basquet', 'Futbol', 'Boxeo', 'Danza'
].map(g => ({ label: g, value: g }));

const goalsColors = {
  Salud: 'success', Estetica: 'info', Powerlifting: 'warning', BJJ: 'primary',
  MMA: 'secondary', Basquet: 'error', Futbol: 'success', Boxeo: 'warning', Danza: 'info'
};

export default function PaymentsManagerPage() {
  const { id } = useParams();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [rows, setRows] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState();
  const [filters, setFilters] = useState({
    text: { name: '' },
    selects: {
      goal: null,
      method: null,
      isPaid: null
    }
  });
  const [sortField, setSortField] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    
    UsersService.find(id).then(data => {
      const formatted = data.map(user => ({
        ...user,
        isPaid: user.payment_info?.isPaid ?? false,
        payment_method: user.payment_info?.payment_method ?? '',
        payment_date: user.payment_info?.payment_date ? new Date(user.payment_info.payment_date) : '',
        payment_amount: user.payment_info?.payment_amount ?? '',
        payment_goal: user.payment_info?.payment_goal ?? ''
      }));
      setRows(formatted);
    });
  }, [id]);

  const handleEditChange = (id, field, value) => {
    setEditedRows(prev => {
      const base = prev[id] || rows.find(r => r._id === id);
      return {
        ...prev,
        [id]: { ...base, [field]: value }
      };
    });
  };

const handleSaveAll = async () => {
    try {
      await Promise.all(Object.entries(editedRows).map(([id, data]) => {
        const payload = {
          isPaid: data.isPaid,
          payment_method: data.payment_method,
          payment_date: data.payment_date ? new Date(data.payment_date).toISOString() : '',
          payment_amount: parseFloat(data.payment_amount),
          payment_goal: data.payment_goal,
        };
        return UsersService.updatePaymentInfo(id, payload);
      }));
      Notify.instantToast('Cambios guardados correctamente');
      setEditMode(false);
      setEditedRows({});
      // Refrescar los datos para reflejar los cambios guardados
      UsersService.find(id).then(data => {
        const formatted = data.map(user => ({
          ...user,
          isPaid: user.payment_info?.isPaid === false ? 'bloquear' : user.payment_info?.isPaid ?? 'bloquear',
          payment_method: user.payment_info?.payment_method ?? '',
          payment_date: user.payment_info?.payment_date ? new Date(user.payment_info.payment_date) : '',
          payment_amount: user.payment_info?.payment_amount ?? '',
          payment_goal: user.payment_info?.payment_goal ?? ''
        }));
        setRows(formatted);
      });
    } catch (err) {
      Notify.instantToast('Error al guardar');
    }
  };

  const handleSelectFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      selects: {
        ...prev.selects,
        [field]: prev.selects[field] === value ? null : value
      }
    }));
  };

  const handleTextFilter = (e) => {
    setFilters(prev => ({
      ...prev,
      text: {
        ...prev.text,
        name: e.target.value
      }
    }));
  };

  const filteredRows = () => {
    let result = [...rows];
    const { name } = filters.text;
    const { goal, method, isPaid } = filters.selects;
    if (name) result = result.filter(r => r.name.toLowerCase().includes(name.toLowerCase()));
    if (goal !== null) result = result.sort((a, b) => (a.payment_goal === goal ? -1 : b.payment_goal === goal ? 1 : 0));
    if (method !== null) result = result.sort((a, b) => (a.payment_method === method ? -1 : b.payment_method === method ? 1 : 0));
    if (isPaid !== null) result = result.sort((a, b) => (a.isPaid === isPaid ? -1 : b.isPaid === isPaid ? 1 : 0));
    if (sortField) {
      result.sort((a, b) => {
        const x = a[sortField];
        const y = b[sortField];
        return sortAsc ? String(x).localeCompare(String(y)) : String(y).localeCompare(String(x));
      });
    }
    return result;
  };

    const activeFilterChips = [];
  if (filters.text.name) activeFilterChips.push({ label: `Nombre: ${filters.text.name}` });
  if (filters.selects.isPaid !== null) {
    const label = paidOptions.find(opt => opt.value === filters.selects.isPaid)?.label || 'Estado';
    activeFilterChips.push({ label });
  }
  if (filters.selects.method !== null) {
    activeFilterChips.push({ label: `Método: ${filters.selects.method}` });
  }
  if (filters.selects.goal !== null) {
    activeFilterChips.push({ label: `Objetivo: ${filters.selects.goal}` });
  }



  return (
    
    <Box className={`d-flex flex-column flex-md-row ${sidebarCollapsed && 'marginSidebarOpen'}`} style={{ minHeight: '100vh' }}>
  {/* SIDEBAR IZQUIERDO */}
  {sidebarCollapsed ? (
    <div className='sidebarProPayment colorMainAll'>
      <div className="d-flex flex-column justify-content-between colorMainAll shadow-sm" style={{ width: '220px', height: '100vh' }}>
        <div className="p-3">
          <h5 className="fw-bold text-center mb-4">TOM</h5>

          <div className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3">
            <div className='text-center col-12'><strong>Gestión de alumnos</strong></div>
          </div>

          <div className="mb-3">
            <p className="text-light small mb-1">Filtrar por nombre</p>
            <InputText value={filters.text.name} onChange={handleTextFilter} className='w-100' />
          </div>

          <div className="mb-3">
            <p className="text-light small mb-1">Estado</p>
            {paidOptions.map(opt => (
              <div key={opt.value} className="form-check text-light small">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
                  checked={filters.selects.isPaid === opt.value}
                  onChange={() => handleSelectFilter('isPaid', opt.value)}
                />
                <label className="form-check-label">{opt.label}</label>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <p className="text-light small mb-1">Método</p>
            {methodOptions.map(opt => (
              <div key={opt.value} className="form-check text-light small">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
                  checked={filters.selects.method === opt.value}
                  onChange={() => handleSelectFilter('method', opt.value)}
                />
                <label className="form-check-label">{opt.label}</label>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <p className="text-light small mb-1">Objetivo</p>
            {goalOptions.map(opt => (
              <div key={opt.value} className="form-check text-light small">
                <input
                  type="checkbox"
                  className="form-check-input me-1"
                  checked={filters.selects.goal === opt.value}
                  onChange={() => handleSelectFilter('goal', opt.value)}
                />
                <label className="form-check-label">{opt.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 text-center">
          <div className="small text-light mb-2">
            <strong>TOM</strong><br />Planificación digital
          </div>
        </div>
      </div>
    </div>
  ) : null}

      <Box className='flex-grow-1 p-3'>

        <Box className='d-flex justify-content-between align-items-center flex-wrap mb-3'>
          <Typography variant='h6'></Typography>
          <Box>
            {!editMode && <Button variant='outlined' onClick={() => {setEditMode(true), setSidebarCollapsed(false)}} startIcon={<Edit />}>Editar</Button>}
            {editMode && (
              <>
                <Button variant='contained' color='success' onClick={handleSaveAll} startIcon={<Save />} className='ms-2'>Guardar</Button>
                <Button variant='outlined' color='error' onClick={() => {setEditMode(false), setSidebarCollapsed(true)}} startIcon={<Cancel />} className='ms-2'>Cancelar</Button>
              </>
            )}
            <Button
              variant="outlined"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              startIcon={<FilterList />}
              className='ms-3'
            >
              {sidebarCollapsed ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
          </Box>
        </Box>

                <Box className='mb-3 d-flex flex-wrap gap-2'>
          {activeFilterChips.map((chip, index) => (
            <Chip key={index} label={chip.label} color='info' variant='outlined' />
          ))}
        </Box>

        <div className="table-responsive">
          <table className='table align-middle table-bordered text-center'>
            <thead className='table-light'>
              <tr>
                <th style={{ width: '15%' }}>Nombre</th>
                <th style={{ width: '0%' }}>Estado</th>
                <th style={{ width: '4%' }}>Método</th>
                <th style={{ width: '14%' }}>Fecha</th>
                <th style={{ width: '10%' }}>Monto</th>
                <th style={{ width: '12%' }}>Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows().map(row => {
                const isEditing = editMode;
                const edited = editedRows[row._id] || row;
                return (
                  <tr className='text-center' key={row._id}>
                    <td style={{ width: '15%' }}>{row.name}</td>
                    <td style={{ width: '0%' }}>{isEditing ? (
  <Dropdown className='w-100' value={edited.isPaid} options={paidOptions} onChange={(e) => handleEditChange(row._id, 'isPaid', e.value)} />
) : (
  <Chip
    label={row.isPaid === true ? 'Activo' : row.isPaid === 'permitir' ? 'Inactivo - Permitir acceso' : 'Inactivo - Bloquear acceso '}
    color={row.isPaid === true ? 'success' : row.isPaid === 'permitir' ? 'warning' : row.isPaid === 'bloquear' ? 'error' : 'default'}
  />
)}</td>
                    <td style={{ width: '4%' }}>{isEditing ? <Dropdown className='w-100' value={edited.payment_method} options={methodOptions} onChange={(e) => handleEditChange(row._id, 'payment_method', e.value)} /> : row.payment_method}</td>
                    <td style={{ width: '13%' }}>{isEditing ? <Calendar className='w-100 text-center' value={edited.payment_date} onChange={(e) => handleEditChange(row._id, 'payment_date', e.value)} dateFormat="yy-mm-dd" showIcon /> : (row.payment_date ? new Date(row.payment_date).toLocaleDateString() : '')}</td>
                    <td style={{ widt: '12%' }}>{isEditing ? (
  <div className="input-group">
    <span className="input-group-text">$</span>
    <InputText className='form-control text-center' value={edited.payment_amount} onChange={(e) => handleEditChange(row._id, 'payment_amount', e.target.value)} />
  </div>
) : `$${row.payment_amount}`}</td>
                    <td style={{ width: '15%' }}>{isEditing ? <Dropdown className='w-100' value={edited.payment_goal} options={goalOptions} onChange={(e) => handleEditChange(row._id, 'payment_goal', e.value)} /> : <Chip label={row.payment_goal} color={goalsColors[row.payment_goal] || 'default'} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </Box>
  );
}
