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

import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SwapVertIcon from '@mui/icons-material/SwapVert';

export default function PrimeReactTable({ user_id, id, users, refresh }) {

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

    // Orden alfabético por name/email
    if (sortField === 'name' || sortField === 'email') {
      filtered.sort((a, b) => {
        const aVal = (a[sortField] || '').toString();
        const bVal = (b[sortField] || '').toString();
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    // Orden por categoría si corresponde
    if (!sortField || sortField === 'category') {
      filtered.sort((a, b) => {
        const aPrio = a.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        const bPrio = b.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        return aPrio - bPrio;
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
        category: profileData.category || '',
        isEditable: profileData.isEditable ? 'true' : 'false'
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (profileDialogVisible && selectedProfileId) {
      setProfileLoading(true);
      setProfileError(null);
      UserServices.getProfileById(selectedProfileId)
        .then((data) => {
          setProfileData(data);
          setProfileError(null);
          Notify.instantToast('Perfil cargado con éxito!');
        })
        .catch(() => {
          setProfileData({});
          setProfileError('No se pudo cargar el perfil');
        })
        .finally(() => {
          setProfileLoading(false);
        });
    }
  }, [profileDialogVisible, selectedProfileId]);

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
    setSelectedProfileId(user._id);
    setSelectedProfileName(user.name);
    setProfileDialogVisible(true);
  };

  const handleProfileSave = () => {
    const updatedProfile = {
      ...editedProfile,
      isEditable: editedProfile.isEditable === 'true'
    };
    UserServices.editProfile(selectedProfileId, updatedProfile)
      .then(() => {
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

  // Función para asignar estilos a la categoría (versión "chica")
  const getCategoryStyle = (category) => {
    let backgroundColor;
    switch (category) {
      case 'Alumno casual':
        backgroundColor = '#C8E6C9';
        break;
      case 'Alumno dedicado':
        backgroundColor = '#BBDEFB';
        break;
      case 'Atleta iniciante':
        backgroundColor = '#FFECB3';
        break;
      case 'Atleta avanzado':
        backgroundColor = '#FFCDD2';
        break;
      default:
        backgroundColor = '#f5f5f5';
    }
    return { backgroundColor, borderRadius: '8px', padding: '2px 4px', fontSize: '0.8rem' };
  };

  const linksTemplate = (user, e) => {
    if (e.field === 'email') {
      return (
        <Link to={`/user/routine/${user._id}/${user.name}`}>
          {user.email}
        </Link>
      );
    } else if (e.field === 'category') {
      return (
        <div 
          onClick={() => openProfileDialog(user)}
          style={{ cursor: 'pointer', ...getCategoryStyle(user.category) }}
        >
          {user.category || '-'}
        </div>
      );
    } else {
      return (
        <Link className='classNameStart' to={`/user/routine/${user._id}/${user.name}`}>
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
      <Link className="LinkDays iconButtons" to={`/user/routine/${user._id}/${user.name}`}>
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
          className="boxData marginBoxRegister" 
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
          emptyMessage="Cargando usuarios..." 
          className='usersListTable alignDatatable pt-0' 
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

<Column 
  body={linksTemplate}
  field="category"
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
          color: headerCategoryStyle.color || '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '2px 6px',
          fontSize: '0.8rem'
        }}
      >
        {headerCategory}
      </button>
    </div>
  }
  className='columnEmail'
/>

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
              <button className="btn btn-sseccon m-3" onClick={handleCancel}>
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
                <p>Este es el código QR para que <b>{currentQrUser?.name}</b> inicie sesión.</p>
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
          style={{ width: widthPage > 900 ? '40%' : '90%' }}
        >
          <div className="text-center">
            {profileLoading && <p>Cargando perfil...</p>}
            {!profileLoading && profileData !== undefined && (
              <div className='row justify-content-center'>
                {Object.keys(profileData).length === 0 && (
                  <p>Por favor, pedile a tu alumno que llene los campos.</p>
                )}

                <div className="mb-3 col-6 mx-3">
                  <label>Altura</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={editedProfile.altura}
                    onChange={(e) => setEditedProfile({ ...editedProfile, altura: e.target.value })}
                  />
                </div>
                <div className="mb-3 col-6 mx-3">
                  <label>Edad</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={editedProfile.edad}
                    onChange={(e) => setEditedProfile({ ...editedProfile, edad: e.target.value })}
                  />
                </div>
                <div className="mb-3 col-6 mx-3">
                  <label className='d-block'>Modalidad</label>
                  <Dropdown 
                    className='w-100'
                    value={editedProfile.modalidad}
                    options={modalidadOptions}
                    onChange={(e) => setEditedProfile({ ...editedProfile, modalidad: e.value })}
                    placeholder="Seleccione modalidad"
                  />
                </div>
                {/* Campo para seleccionar la categoría */}
                <div className="mb-3 col-6 mx-3">
                  <label className='d-block'>Categoría</label>
                  <Dropdown 
                    className='w-100'
                    value={editedProfile.category}
                    options={nivelOptions}
                    onChange={(e) => setEditedProfile({ ...editedProfile, category: e.value })}
                    placeholder="Seleccione una categoría"
                  />
                </div>
                <div className="mb-3 col-6 mx-3">
                  <label className='d-block'>Bloquear edición de alumno</label>
                  <Dropdown 
                    className='w-100'
                    value={editedProfile.isEditable}
                    options={isEditableOptions}
                    onChange={(e) => setEditedProfile({ ...editedProfile, isEditable: e.value })}
                    placeholder="Seleccione opción"
                  />
                </div>
                <div className="d-flex justify-content-around">
                  <button className="btn btn-secondary" onClick={() => setProfileDialogVisible(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={handleProfileSave}>
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


