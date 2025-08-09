import React, { useState, useEffect, useMemo } from 'react';

import * as UserServices from './../services/users.services.js';
import * as Notify from './../helpers/notify.js';
import * as ChangePropertyService from './../services/changePropertys.services.js';
import * as QRServices from './../services/loginWithQR.js';
import DeleteUserDialog from './../components/DeleteActions/DeleteUserDialog.jsx';
import UserRegister from "../components/Users/UserRegister.jsx";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Link } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs from 'dayjs';

import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
export default function PrimeReactTable({ user_id, id, users, refresh, collapsed }) {

  const [showDialog, setShowDialog] = useState(false);
  const [qrDialogVisible, setQrDialogVisible] = useState(false);
  const [currentQrUser, setCurrentQrUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nameUser, setNameUser] = useState([]);
  const [id_user, setId_user] = useState([]);
  const [profileData, setProfileData] = useState(undefined);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState();
  const [widthPage, setWidthPage] = useState(window.innerWidth);
  const [inputValue, setInputValue] = useState('');
  const isInputValid = inputValue === 'ELIMINAR';
  const [first, setFirst] = useState(localStorage.getItem('userCurrentPage'));
  const [dialogg, setDialogg] = useState(false);


  let initSearchText = '';
  let initSortField = null;
  let initSortOrder = 'asc';
  let initCategoryFilterIndex = 0;
  try {
    const st = localStorage.getItem('prTableSearchText');
    const sf = localStorage.getItem('prTableSortField');
    const so = localStorage.getItem('prTableSortOrder');
    const cfi = localStorage.getItem('prTableCategoryFilterIndex');
    if (st) initSearchText = st;
    if (sf) initSortField = sf;
    if (so) initSortOrder = so;
    if (cfi !== null && !isNaN(parseInt(cfi, 10))) initCategoryFilterIndex = parseInt(cfi, 10);
  } catch (err) {
    console.warn('Error leyendo preferencias de orden en localStorage', err);
  }

  // Estados para el perfil
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedProfileName, setSelectedProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});

  // Opciones para Dropdown
  const modalidadOptions = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Online', value: 'online' },
    { label: 'Semi-presencial', value: 'semi-presencial' }
  ];
  const isEditableOptions = [
    { label: 'Si', value: 'true' },
    { label: 'No', value: 'false' }
  ];
  const nivelOptions = [
    { label: 'Alumno casual', value: 'Alumno casual' },
    { label: 'Alumno dedicado', value: 'Alumno dedicado' },
    { label: 'Atleta iniciante', value: 'Atleta iniciante' },
    { label: 'Atleta avanzado', value: 'Atleta avanzado' }
  ];
  
  const [searchText, setSearchText] = useState(initSearchText);
  const [sortField, setSortField] = useState(initSortField);
  const [sortOrder, setSortOrder] = useState(initSortOrder);
  const [categoryFilterIndex, setCategoryFilterIndex] = useState(initCategoryFilterIndex);

  const categoryOrder = useMemo(() => [
    "Alumno casual",
    "Alumno dedicado",
    "Atleta iniciante",
    "Atleta avanzado"
  ], []);


  useEffect(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    // Orden por categoría (si aplica)
    if (sortField === 'category' || !sortField) {
      filtered.sort((a, b) => {
        const aPrio = a.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        const bPrio = b.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
  
        if (aPrio !== bPrio) {
          return aPrio - bPrio;
        }
  
        // Si están en la misma categoría, ordenar por nombre (fallback)
        return a.name.localeCompare(b.name);
      });
    }
  
    // Si ordenamos por name/email, aplicar después de ordenar por categoría
    if (sortField === 'name' || sortField === 'email') {
      filtered.sort((a, b) => {
        // Primero por categoría
        const aPrio = a.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        const bPrio = b.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        if (aPrio !== bPrio) return aPrio - bPrio;
  
        // Luego por campo seleccionado
        const aVal = (a[sortField] || '').toLowerCase();
        const bVal = (b[sortField] || '').toLowerCase();
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
  
    setFilteredUsers(filtered);
  }, [searchText, users, sortField, sortOrder, categoryFilterIndex, categoryOrder]);


  useEffect(() => {
    const handleResize = () => setWidthPage(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (profileData && profileData.details) {
      const keysDays = Object.keys(profileData.details);
      if (keysDays.length > 0) {
        setSelectedDay(keysDays[0]);
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData !== undefined) {
      setEditedProfile({
        name: profileData.name || '',
        email: profileData.email || '',
        altura: profileData.altura || '',
        edad: profileData.edad || '',
        modalidad: profileData.modalidad || '',
        category: profileData.category || null,
        isEditable: profileData.isEditable ? 'true' : 'false',
        events: profileData.events || null
      });
    }
  }, [profileData]);

  const onSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const showDialogDelete = (_id, name) => {
    setNameUser(name);
    setId_user(_id);
    setShowDialog(true);
  };

  const hideDialog = () => {
    setShowDialog(false);
  };

  const openProfileDialog = (user) => {
    console.log(user)
    UserServices.getProfileById(user._id)
        .then((data) => {
          setProfileData(data);
          console.log(data)
          /*if(editedProfile.category == null ){
            UserServices.find(user._id)
            .then(data =>{
              console.log(data)
              setEditedProfile({ category: data.category })
      
            })
          }*/
          Notify.instantToast('Perfil cargado con éxito!');
        })
        .catch((data) => {
          setProfileData({})
          console.log(data)
          UserServices.find(user._id)
          .then(data =>{
            console.log(data)
            setEditedProfile({ ...editedProfile, category: data.category })
    
          })
        })
    



      setSelectedProfileId(user._id);
      setSelectedProfileName(user.name);
      setProfileDialogVisible(true);

  };

  const handleProfileSave = () => {
   
    const updatedProfile = {
      ...editedProfile,
      isEditable: editedProfile.isEditable === 'true'
    };
    console.log(selectedProfileId, updatedProfile)
    UserServices.editProfile(selectedProfileId, updatedProfile)
      .then((data) => {
        console.log(data, selectedProfileId)
        return ChangePropertyService.changeProperty(selectedProfileId, updatedProfile.category);
      })
      .then(() => {
        Notify.instantToast('Perfil actualizado con éxito!');
        setProfileDialogVisible(false);
        refresh();
      })
      .catch(() => {
        Notify.instantToast('Error al actualizar el perfil.');
      });
  };

  const formatCategory = (category) => {
  if (!category) return '-';

  let displayText = category;

  if (widthPage <= 600) {
    const parts = category.split(' ');
    displayText = parts.length > 1 ? parts[1] : parts[0];
  }

  // Capitalizar primera letra
  return displayText.charAt(0).toUpperCase() + displayText.slice(1);
};

  // Función para asignar estilos a la categoría (versión "chica")
  const getCategoryStyle = (category) => {
    let backgroundColor;
    switch (category) {
      case 'Alumno casual':
        backgroundColor = '#53b900';
        break;
      case 'Alumno dedicado':
        backgroundColor = '#006eff';
        break;
      case 'Atleta iniciante':
        backgroundColor = '#ca7900';
        break;
      case 'Atleta avanzado':
        backgroundColor = '#a30000';
        break;
      default:
        backgroundColor = '#929191';
    }
    return { backgroundColor, borderRadius: '8px', padding: '2px 4px', fontSize: '0.8rem' };
  };

  const linksTemplate = (user, e) => {
    if (e.field === 'email') {
      return (
        <Link to={`/user/routine/${user._id}/${user.name}`} onClick={() => {localStorage.setItem('actualUsername', user.name)}}>
          {user.email}
        </Link>
      );
    } else if (e.field === 'category') {
      return (
        <div 
        className={'p-2'}
          onClick={() => openProfileDialog(user)}
          style={{ cursor: 'pointer', ...getCategoryStyle(user.category), color:'white', width: widthPage > 600 ? '200px' : '74px'}}
        >
            {formatCategory(user.category)}
        </div>
      );
    } else {
      return (
        <Link className='classNameStart' to={`/user/routine/${user._id}/${user.name}`} onClick={() => {localStorage.setItem('actualUsername', user.name)}}>
          {user.name}
        </Link>
      );
    }
  };

  const actionsTemplate = (user) => (
    <div className="d-flex justify-content-center">
      <IconButton
        aria-label="profile"
        onClick={() => openProfileDialog(user)}
        className="btn p-1 my-2"
      >
        <PersonIcon className="text-dark" />
      </IconButton>
      <Link className="LinkDays iconButtons" to={`/user/routine/${user._id}/${user.name}`} onClick={() => {localStorage.setItem('actualUsername', user.name)}}>
        <IconButton aria-label="edit" className="btn p-1 my-2">
          <EditIcon className="text-dark" />
        </IconButton>
      </Link>
      <IconButton
        aria-label="delete"
        onClick={() => showDialogDelete(user._id, user.name)}
        className="btn p-1 my-2"
      >
        <CancelIcon className="colorIconYoutube" />
      </IconButton>
      <IconButton
        aria-label="qr"
        onClick={() => showQrDialog(user)}
        className="btn p-1 my-2"
      >
        <QrCode2Icon className="text-dark" />
      </IconButton>
    </div>
  );

  const handleAccept = () => {
    if (isInputValid) {
      Notify.notifyA('Eliminando usuario...');
      UserServices.deleteUser(id_user)
        .then(() => {
          refresh(); 
          hideDialog();
        })
        .catch((err) => {
          console.error(err);
          Notify.instantToast('Ocurrió un error al eliminar el usuario.');
        });
    }
  };

  const handleCancel = () => {
    setInputValue('');
    hideDialog();
  };

  const showQrDialog = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const response = await QRServices.generateQR(user._id);
      setQrImage(response.qrImage);
      setCurrentQrUser(user);
      setQrDialogVisible(true);
    } catch (err) {
      setError('Error al generar el QR. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    try {
      localStorage.setItem('userCurrentPage', event.first.toString());
    } catch (err) {
      console.error('Error al guardar en localStorage:', err);
    }
  };

  const sortByName = () => {
    const newOrder = sortField === 'name' && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField('name');
    setSortOrder(newOrder);
    try {
      localStorage.setItem('prTableSortField', 'name');
      localStorage.setItem('prTableSortOrder', newOrder);
    } catch (err) { console.warn('Error guardando orden', err); }
  };

  const sortByEmail = () => {
    const newOrder = sortField === 'email' && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField('email');
    setSortOrder(newOrder);
    try {
      localStorage.setItem('prTableSortField', 'email');
      localStorage.setItem('prTableSortOrder', newOrder);
    } catch (err) { console.warn('Error guardando orden', err); }
  };

  const sortByCategory = () => {
    const newIndex = (categoryFilterIndex + 1) % categoryOrder.length;
    setCategoryFilterIndex(newIndex);
    setSortField('category');
    setSortOrder('asc');
    try {
      localStorage.setItem('prTableCategoryFilterIndex', newIndex.toString());
      localStorage.setItem('prTableSortField', 'category');
      localStorage.setItem('prTableSortOrder', 'asc');
    } catch (err) { console.warn('Error guardando categoría', err); }
  };

  const headerCategory = categoryOrder[categoryFilterIndex];
  const headerCategoryStyle = getCategoryStyle(headerCategory);
  
  return (
    <div className='row justify-content-around '>
      <div className='col-6 col-lg-4 text-center m-0 pt-2'>
        <div className="p-inputgroup mb-4">
          <InputText 
            value={searchText}
            onChange={onSearchChange}
            placeholder="Buscar usuarios..." 
          />
        </div>
      </div>

      <div className="col-6 col-lg-4 text-center m-0 pt-2">
        <div 
          id={'crearAlumno'} 
          className="bgItemsDropdown" 
          onClick={() => setDialogg(true)}
          style={{ cursor: 'pointer' }}
        >
          <AddCircleIcon className="me-1 "/>
          <span>Crear alumno</span>
        </div>
        <UserRegister 
          dialogg={dialogg} 
          refresh={refresh} 
          parentId={id} 
          onClose={() => setDialogg(false)} 
        />
      </div>

      <div className='col-12 col-sm-10 m-0 mb-5 fontUserList'>
        <DataTable 
          emptyMessage=" " 
          className='usersListTable2 alignDatatable pt-0' 
          paginator 
          rows={10} 
          first={first}
          value={filteredUsers}
          onPage={onPageChange}
        >
          <Column 
            body={linksTemplate}
            field="name"
            header={
              <div className="d-flex align-items-center justify-content-center">
                <span className='me-2'>Nombre</span>
                <button
                  className="btn clickable"
                  onClick={sortByName}
                  style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                  title="Ordenar por nombre"
                >
                  <SwapVertIcon />
                </button>
              </div>
            }
            className='columnName'
          />

          {widthPage > 600 && (
            <Column 
              body={linksTemplate}
              field="email"
              header={
                <div className="d-flex align-items-center justify-content-center">
                  <span className='me-2'>Email</span>
                  <button
                    className="btn clickable"
                    onClick={sortByEmail}
                    style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                    title="Ordenar por email"
                  >
                    <SwapVertIcon />
                  </button>
                </div>
              }
              className='columnEmail'
            />
          )}

{widthPage > 600 && ( <Column 
  body={linksTemplate}
  field="category"
  style={{width:'200px'}}
  header={
    <div className="d-flex align-items-center justify-content-center">
      <span className='me-2'>Categoría</span>
      <button
        className="btn clickable"
        onClick={sortByCategory}
        title="Cambiar orden: la categoría seleccionada se mostrará primero"
        style={{
          cursor: 'pointer',
          backgroundColor: headerCategoryStyle.backgroundColor,
          color: headerCategoryStyle.color || 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '3px 6px',
          fontSize: '0.8rem'
        }}
      >
        {headerCategory}
      </button>
    </div>
  }
  className='columnEmail'
/>)}

          <Column body={actionsTemplate} header="Acciones" className='columnActions' />
        </DataTable>

        <Dialog 
          header={`${nameUser}`} 
          visible={showDialog} 
          onHide={() => hideDialog()} 
          style={{ width: widthPage > 900 ? '50%' : '90%' }}
        >
          <div className='row justify-content-center'>
            <div className='col-10 col-sm-6 mb-3'>
              <label htmlFor="inputDelete" className='text-center mb-4'>
                Por favor, escriba <b>"ELIMINAR"</b> si desea eliminar permanentemente el usuario <b>{nameUser}</b>
              </label>
              <input
                id='inputDelete'
                type="text"
                className='form-control'
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
            </div>
            <div className='col-12 text-center'>
              <button className="btn btn-outline-light m-3" onClick={handleCancel}>
                Cancelar
              </button>
              <button 
                className={isInputValid ? 'btn btn-danger m-3' : 'btn btn-secondary m-3'} 
                disabled={!isInputValid} 
                onClick={handleAccept}
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog>

        <Dialog
          header={`Código QR - ${currentQrUser?.name}`}
          visible={qrDialogVisible}
          onHide={() => setQrDialogVisible(false)}
          style={{ width: widthPage > 900 ? '30%' : '90%' }}
        >
          <div className="text-center">
            {loading && <p>Generando QR...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {qrImage && (
              <div>
                <p className='text-light'>Este es el código QR para que <b>{currentQrUser?.name}</b> inicie sesión.</p>
                <img
                  src={qrImage}
                  alt="Código QR"
                  style={{ width: '200px', height: '200px' }}
                />
                <div className="mt-3">
                  <a
                    href={qrImage}
                    download={`QR-${currentQrUser?.name || 'usuario'}.png`}
                    style={{ textDecoration: 'none' }}
                  >
                    <button
                      aria-label="download"
                      className="btn btn-primary p-2"
                    >
                      Descargar QR
                    </button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </Dialog>

        <Dialog
  header={`Perfil: ${selectedProfileName}`}
  visible={profileDialogVisible}
  onHide={() => setProfileDialogVisible(false)}
  className={`col-11 col-lg-10 col-xl-8 ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
>
  <div className="row justify-content-center">
    {profileLoading && <p>Cargando perfil...</p>}
    {!profileLoading && profileData !== undefined && (
      <div className="col-10 col-lg-12">
        {Object.keys(profileData).length === 0 && (
          <p>Por favor, pedile a tu alumno que llene los campos.</p>
        )}

        <div className="row">
          <div className="col-md-2 mb-3">
            <div className="input-group">
              <span className="input-group-text py-2 px-3">cm</span>
              <input
                type="text"
                className="form-control text-center"
                value={editedProfile.altura}
                onChange={(e) => setEditedProfile({ ...editedProfile, altura: e.target.value })}
              />
            </div>
          </div>

          <div className="col-md-2 mb-3">
            <div className="input-group">
              <span className="input-group-text p-2">Edad</span>
              <input
                type="number"
                className="form-control text-center"
                value={editedProfile.edad}
                onChange={(e) => setEditedProfile({ ...editedProfile, edad: e.target.value })}
              />
            </div>
          </div>


        <div className="col-md-3 mb-3">
          <div className="d-flex align-items-center border text-center rounded overflow-hidden">
            <span className="p-2 bg-light border-end text-dark">Bloquear edición</span>
            <Dropdown
              value={editedProfile.isEditable}
              options={isEditableOptions}
              onChange={(e) => setEditedProfile({ ...editedProfile, isEditable: e.value })}
              placeholder="Seleccione opción"
              className="flex-grow-1 border-0"
              style={{ border: 'none', boxShadow: 'none' }}
            />
          </div>
        </div>
        
        <div className="col-md-5 mb-3">
            <div className="d-flex align-items-center border rounded overflow-hidden">
              <span className="p-2 bg-light text-dark border-end">Categoría</span>
              <Dropdown
                value={editedProfile.category}
                options={nivelOptions}
                onChange={(e) => setEditedProfile({ ...editedProfile, category: e.value })}
                placeholder="Seleccione categoría"
                className="flex-grow-1 border-0"
                style={{ border: 'none', boxShadow: 'none' }}
              />
            </div>
          </div>
          
          <div className="col-12 mb-3 text-center">
            <button
              className="btn btn-primary "
              onClick={() => {
                const newEvents = editedProfile.events ? [...editedProfile.events] : [];
                newEvents.push({ date: '', name: '' });
                setEditedProfile({ ...editedProfile, events: newEvents });
              }}
            >
            <CalendarMonthIcon />
              Agregar evento al calendario
            </button>
        </div>

        {editedProfile.events && editedProfile.events.map((event, index) => (
                <div key={index} className="input-group mb-2">
                  <span className="input-group-text me-2"><CalendarMonthIcon /></span>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={event.date ? dayjs(event.date) : null}
                      onChange={(newDate) => {
                        const newEvents = [...editedProfile.events];
                        newEvents[index].date = newDate ? newDate.toISOString() : '';
                        setEditedProfile({ ...editedProfile, events: newEvents });
                      }}
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          className: 'form-control',
                          size: 'small',
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <input
                    type="text"
                    className="form-control ms-2"
                    placeholder="Nombre del evento"
                    value={event.name}
                    onChange={(e) => {
                      const newEvents = [...editedProfile.events];
                      newEvents[index].name = e.target.value;
                      setEditedProfile({ ...editedProfile, events: newEvents });
                    }}
                  />
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      const newEvents = [...editedProfile.events];
                      newEvents.splice(index, 1);
                      setEditedProfile({ ...editedProfile, events: newEvents });
                    }}
                  >
                    X
                  </button>
                </div>
                
              ))}
        </div>


        <div className="d-flex justify-content-around mt-4">
          <button className="btn btn-secondary px-4" onClick={() => setProfileDialogVisible(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary px-4" onClick={handleProfileSave}>
            Guardar
          </button>
        </div>
      </div>
    )}
  </div>
</Dialog>


      </div>
    </div>
  );
}


