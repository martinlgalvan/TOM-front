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
import SwapVertIcon from '@mui/icons-material/SwapVert';

export default function PrimeReactTable({ user_id, id, users, refresh }) {

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
    const [first, setFirst] = useState(localStorage.getItem('userCurrentPage'));
    const [dialogg, setDialogg] = useState(false);

    // Ordenamiento
    const [sortNameAsc, setSortNameAsc] = useState(true);
    const [sortEmailAsc, setSortEmailAsc] = useState(true);

    useEffect(() => {
        const filtered = users
            .filter(user =>
                user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase())
            )
            .sort((a, b) => {
                // Ordenar por _id descendente → último creado primero
                return b._id.localeCompare(a._id);
            });
    
        setFilteredUsers(filtered);
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

    const actionsTemplate = (user) => (
        <div className="d-flex justify-content-center">
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

    const linksTemplate = (user, e) => {
        if (e.field === 'email') {
            return (
                <Link to={`/user/routine/${user._id}/${user.name}`}>
                    {user.email}
                </Link>
            );
        } else {
            return (
                <Link className='classNameStart' to={`/user/routine/${user._id}/${user.name}`}>
                    {user.name}
                </Link>
            );
        }
    };

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
        const sorted = [...filteredUsers].sort((a, b) =>
            sortNameAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
        setFilteredUsers(sorted);
        setSortNameAsc(!sortNameAsc);
    };

    const sortByEmail = () => {
        const sorted = [...filteredUsers].sort((a, b) =>
            sortEmailAsc ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
        );
        setFilteredUsers(sorted);
        setSortEmailAsc(!sortEmailAsc);
    };

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
                                    className={`btn pi pi-sort-alpha-${sortEmailAsc ? 'down' : 'up'} clickable`} 
                                    onClick={sortByName}
                                    style={{ cursor: 'pointer' }}
                                    title="Ordenar por nombre"
                                ><SwapVertIcon /></button>
                            </div>
                       
                        }
                        className='columnName'
                    />

                    {widthPage > 600 && 
                        <Column 
                            body={linksTemplate}
                            field="email"
                            header={
                                <div className="d-flex align-items-center justify-content-center">
                                    <span className='me-2'>Email</span>
                                    <button
                                        className={`btn pi pi-sort-alpha-${sortEmailAsc ? 'down' : 'up'} clickable`} 
                                        onClick={sortByEmail}
                                        style={{ cursor: 'pointer' }}
                                        title="Ordenar por email"
                                    ><SwapVertIcon /></button>
                                </div>
                            }
                            className='columnEmail'
                        />
                    }

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
            </div>
        </div>
    );
}
