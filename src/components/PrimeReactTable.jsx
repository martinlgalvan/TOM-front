import React, { useState, useEffect } from 'react';

import * as UsersService from './../services/users.services.js';
import * as Notify from './../helpers/notify.js';
import * as QRServices from './../services/loginWithQR.js';
import DeleteUserDialog from './../components/DeleteActions/DeleteUserDialog.jsx';
import UserRegister from "../components/Users/UserRegister.jsx";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Link } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function PrimeReactTable({  user_id, id, users, refresh }) {

    const [searchText, setSearchText] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    const [qrDialogVisible, setQrDialogVisible] = useState(false);
    const [currentQrUser, setCurrentQrUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [qrImage, setQrImage] = useState(null);

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [nameUser, setNameUser] = useState([]);
    const [id_user, setId_user] = useState([]);

    const [profileData, setProfileData] = useState();
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState();
    const [widthPage, setWidthPage] = useState(window.innerWidth);

    const [inputValue, setInputValue] = useState('');
    const isInputValid = inputValue === 'ELIMINAR';

    // Para abrir/cerrar el formulario de crear alumno
    const [dialogg, setDialogg] = useState(false);

    useEffect(() => {
        // Filtramos los usuarios cada vez que cambian o cambia el texto de búsqueda.
        setFilteredUsers(
            users.filter(user =>
                user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, users]);

    useEffect(() => {
        function handleResize() {
            setWidthPage(window.innerWidth);
        }
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

    const onSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const openDialogProfile = (id, name) => {
        setNameUser(name);
        UsersService.getProfileById(id)
            .then((data) => {
                setProfileData(data);
                setDays(Object.keys(data.details || {}));
                Notify.instantToast('Perfil cargado con éxito!');
                // Podrías setear algo para mostrar un Dialog con la info, 
                // pero en el ejemplo no se hace.
            })
            .catch(() => {
                setProfileData(null);
            });
    };

    const showDialogDelete = (_id, name) => {
        setNameUser(name);
        setId_user(_id);
        setShowDialog(true);
    };

    const hideDialog = () => {
        setShowDialog(false);
    };

    const actionsTemplate = (user) => {
        return (
            <div className="d-flex justify-content-center">
                {/* Botón Editar/ir a rutina */}
                <Link className="LinkDays iconButtons" to={`/user/routine/${user._id}/${user.name}`}>
                    <IconButton aria-label="edit" className="btn p-1 my-2">
                        <EditIcon className="text-dark" />
                    </IconButton>
                </Link>

                {/* Perfil 
                <IconButton
                    aria-label="profile"
                    onClick={() => openDialogProfile(user._id, user.name)}
                    className="btn p-1 my-2"
                >
                    <PersonIcon className="text-dark" />
                </IconButton>/*/}

                {/* Eliminar */}
                <IconButton
                    aria-label="delete"
                    onClick={() => showDialogDelete(user._id, user.name)}
                    className="btn p-1 my-2"
                >
                    <CancelIcon className="colorIconYoutube" />
                </IconButton>

                {/* Generar QR */}
                <IconButton
                    aria-label="qr"
                    onClick={() => showQrDialog(user)}
                    className="btn p-1 my-2"
                >
                    <QrCode2Icon className="text-dark" />
                </IconButton>
            </div>
        );
    };

    const linksTemplate = (user, e) => {
        if (e.field === 'email') {
            return (
                <Link 
                  className='' 
                  to={`/user/routine/${user._id}/${user.name}`}
                >
                  {user.email}
                </Link>
            );
        } else {
            return (
                <Link 
                  className='classNameStart' 
                  to={`/user/routine/${user._id}/${user.name}`}
                >
                  {user.name}
                </Link>
            );
        }
    };

    // Confirmación y proceso de DELETE
    const handleAccept = () => {
        if (isInputValid) {
            Notify.notifyA('Eliminando usuario...');
            UsersService.deleteUser(id_user)
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

    // QR
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

    return (
        <div className='row justify-content-around '>
            {/* Campo de búsqueda */}
            <div className='col-6 col-lg-4 text-center m-0 pt-2'>
                <div className="p-inputgroup mb-4">
                    <InputText 
                        value={searchText}
                        onChange={onSearchChange}
                        placeholder="Buscar usuarios..." 
                    />
                </div>
            </div>

            {/* Botón "Crear alumno" + componente de registro */}
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

                {/* Aquí integras el formulario de alta */}
                <UserRegister 
                  dialogg={dialogg} 
                  refresh={refresh} 
                  parentId={id} 
                  onClose={() => setDialogg(false)} 
                />
            </div>

            {/* Tabla de usuarios */}
            <div className='col-12 col-sm-10 m-0 mb-5 fontUserList'>
                <DataTable 
                  emptyMessage="Cargando usuarios..." 
                  className='usersListTable alignDatatable pt-0' 
                  paginator 
                  rows={10} 
                  value={filteredUsers}
                >
                    <Column body={linksTemplate} field="name" header="Nombre" />
                    {widthPage > 600 && 
                      <Column body={linksTemplate} field="email" header="Email"/>}
                    <Column body={actionsTemplate} header="Acciones" />
                </DataTable>

                {/* Diálogo de confirmación para ELIMINAR usuario */}
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

                {/* Diálogo con el QR */}
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
            </div>
        </div>
    );
}
