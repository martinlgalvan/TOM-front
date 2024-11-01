import React, { useState, useEffect } from 'react';

import * as UsersService from './../services/users.services.js';
import * as Notify from './../helpers/notify.js';
import DeleteUserDialog from './../components/DeleteActions/DeleteUserDialog.jsx';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { SelectButton } from 'primereact/selectbutton';
import { InputText } from 'primereact/inputtext';
import {  toast } from 'react-toastify';
import { Link } from 'react-router-dom';


import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';


export default function PrimeReactTable({ name, user_id, id, users, refresh }) {

    const [searchText, setSearchText] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [visible, setVisible] = useState(false);

    const [filteredUsers, setFilteredUsers] = useState([]);

    const [nameUser, setNameUser] = useState([]);
    const [id_user, setId_user] = useState([]);
    const [profileData, setProfileData] = useState();
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState();

    const [widthPage, setWidthPage] = useState();

    const [inputValue, setInputValue] = useState('');
    const isInputValid = inputValue === 'ELIMINAR';

    useEffect(() => {
        // Filtramos los usuarios cada vez que cambian
        setFilteredUsers(
            users.filter(user =>
                user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, users]);
    useEffect(() => {
        setWidthPage(window.innerWidth)

    }, [window.innerWidth]);

    useEffect(() => {
        if (profileData && profileData.details) {
            const days = Object.keys(profileData.details);
            if (days.length > 0) {
                setSelectedDay(days[0]);
            }
        }
    }, [profileData]);

    const onSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const openDialog = (id, name) => {
        setNameUser(name);


        UsersService.getProfileById(id)
            .then((data) => {
                const filteredDetails = filterInvalidDays(data.details);
                setProfileData({ ...data, details: filteredDetails });
                setDays(Object.keys(filteredDetails).map(day => ({ label: day, value: day })));
                setVisible(true);
                Notify.instantToast('Perfil cargado con éxito!');
            })
            .catch((data) => {
                setProfileData(null);
                setVisible(true);
            });
    };

    const closeDialog = () => {
        setVisible(false);
    };

    const showDialogDelete = (_id, name) => {
        setNameUser(name);
        setId_user(_id);
        setShowDialog(true);
    };



    const hideDialog = (load) => {
        setShowDialog(false);
        setDialogEditWeek(false)
    };

    const actionsTemplate = (user) => {
        
        return <div className=''>


            <Link className={`LinkDays iconButtons `} to={`/user/routine/${user._id}/${user.name}`}>
                <IconButton
                    aria-label="delete"
                    className='btn p-1 my-2 '
                >   
                    <EditIcon className='text-dark ' />
            </IconButton>
            </Link>

            <IconButton
                aria-label="video"
                onClick={() => openDialog(user._id, user.name)}
                className='btn p-1 my-2'
            >
                <PersonIcon className='text-dark ' />
            </IconButton>

            <IconButton
                aria-label="delete"
                onClick={() => showDialogDelete(user._id, user.name)}
                className='btn p-1 my-2'
            >
                <CancelIcon className='colorIconYoutube ' />
            </IconButton>


        </div>;
    };

    const linksTemplate = (user,e) => {
        if(e.field == 'email'){
            return <Link className='LinkDays p-3 w-100 ClassBGHover text-start' to={`/user/routine/${user._id}/${user.name}`}>{user.email}</Link>;
        } else{
            return <Link className='LinkDays p-3 w-100 ClassBGHover text-start' to={`/user/routine/${user._id}/${user.name}`}>{user.name}</Link>;

        }
    };

    const filterInvalidDays = (details) => {
        return Object.entries(details).reduce((acc, [day, values]) => {
            const validValues = Object.values(values).filter(value => value !== undefined && value !== null && value !== 0);
            if (validValues.length > 0) {
                acc[day] = values;
            }
            return acc;
        }, {});
    };

    const calculateNumericAverage = (details, field) => {
        const validValues = Object.values(details)
            .map(day => day[field])
            .filter(value => value !== undefined && value !== null && value !== 0);

        if (validValues.length === 0) return 'N/A';

        const total = validValues.reduce((sum, value) => sum + value, 0);
        return (total / validValues.length).toFixed(2);
    };

    const calculateCategoricalAverage = (details, field) => {
        const options = [
            { label: 'Muy bajo', value: 1 },
            { label: 'Bajo', value: 2 },
            { label: 'Moderado', value: 3 },
            { label: 'Alto', value: 4 },
            { label: 'Muy alto', value: 5 }
        ];
        const validValues = Object.values(details)
            .map(day => day[field])
            .filter(value => value !== undefined && value !== null && value !== 0);

        if (validValues.length === 0) return 'N/A';

        const total = validValues.reduce((sum, value) => sum + value, 0);
        const average = total / validValues.length;
        const closestOption = options.reduce((prev, curr) => Math.abs(curr.value - average) < Math.abs(prev.value - average) ? curr : prev);
        return closestOption.label;
    };

    const getLabel = (value) => {
        const options = [
            { label: 'Muy bajo', value: 1 },
            { label: 'Bajo', value: 2 },
            { label: 'Moderado', value: 3 },
            { label: 'Alto', value: 4 },
            { label: 'Muy alto', value: 5 }
        ];
        const option = options.find(option => option.value === value);
        return option ? option.label : 'Desconocido';
    };

    const renderProfileData = () => {
        if (!profileData) {
            return (
                <div className='row justify-content-center'>
                    <div className='col-10 col-lg-4'>
                        <div className=' text-center'>
                            <p>No hay datos disponibles.</p>
                            <p>Estos datos pueden ayudarte a la hora de planificar, por lo tanto, podés pedirle a tus alumnos que lo completen al finalizar su semana de entrenamiento.</p>
                        </div>
                        <div className=' text-center m-3'>
                            <p>Los datos que se analizan, son: <strong>fatiga, horas de sueño, DOMS, NEAT, estrés, nutrición</strong></p>
                            <p>También, pueden añadir datos como su peso corporal, y un resumen semanal sobre como fue su semana.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="row justify-content-center text-center">
                <div className='my-4'>
                    <p>{name} editó esto por última vez el</p>
                    <p>{profileData.last_edit.fecha} - {profileData.last_edit.hora}</p>
                </div>
                <div className="col-10">
                    <p className='text-center'><strong className='d-block'>Peso Corporal</strong> {profileData.bodyWeight} kg</p>
                </div>
                <div className="col-10 col-lg-6">
                    <div className='row justify-content-center'>
                        <div className='col-10 col-lg-6 text-center'>
                            <h5 className='mb-4'>Promedio semanal</h5>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td><strong>Fatiga</strong></td>
                                        <td>{calculateNumericAverage(profileData.details, 'fatigueLevel')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Horas de Sueño</strong></td>
                                        <td>{calculateNumericAverage(profileData.details, 'sleepHours')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>DOMS</strong></td>
                                        <td>{calculateNumericAverage(profileData.details, 'domsLevel')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>NEAT</strong></td>
                                        <td>{calculateCategoricalAverage(profileData.details, 'neatLevel')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Estrés</strong></td>
                                        <td>{calculateCategoricalAverage(profileData.details, 'stressLevel')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Nutrición</strong></td>
                                        <td>{calculateCategoricalAverage(profileData.details, 'nutrition')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
                <div className="col-10 col-lg-6 ">
                    <h5>Detalles por día</h5>
                    <SelectButton value={selectedDay} options={days} onChange={(e) => setSelectedDay(e.value)} />
                    {selectedDay && profileData.details[selectedDay] && (
                        <table className="table table-bordered mt-4">
                            <tbody>
                                <tr>
                                    <td><strong>Fatiga</strong></td>
                                    <td>{profileData.details[selectedDay].fatigueLevel}</td>
                                </tr>
                                <tr>
                                    <td><strong>Horas de Sueño</strong></td>
                                    <td>{profileData.details[selectedDay].sleepHours}</td>
                                </tr>
                                <tr>
                                    <td><strong>DOMS</strong></td>
                                    <td>{profileData.details[selectedDay].domsLevel}</td>
                                </tr>
                                <tr>
                                    <td><strong>NEAT</strong></td>
                                    <td>{getLabel(profileData.details[selectedDay].neatLevel)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Estrés</strong></td>
                                    <td>{getLabel(profileData.details[selectedDay].stressLevel)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Nutrición</strong></td>
                                    <td>{getLabel(profileData.details[selectedDay].nutrition)}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
                <div className='col-10 col-lg-6'>
                            <h5 className='mb-4'>Resumen Semanal</h5>
                            <p>{profileData.weeklySummary}</p>
                        </div>
            </div>
        );
    };



// DELETE USERS //
  
    const handleAccept = () => {
      if (isInputValid) {
        Notify.notifyA('Eliminando usuario...')
        UsersService.deleteUser(id_user)
              .then(() => {
                refresh();
                hideDialog();
              })
     
      }
    };

    const handleCancel = () => {
        setInputValue('');
        hideDialog();
      };
    










    return (
        <div className='row justify-content-center '>
            <div className='col-12 col-lg-4 text-center m-0'>

                <div className="p-inputgroup mb-4">
                    <InputText 
                        value={searchText}
                        onChange={onSearchChange}
                        placeholder="Buscar usuarios..." 
                    />
                </div>
            </div>
            <div className='col-12 col-sm-10 m-0 mb-5 fontUsersList'>
                
                <DataTable emptyMessage="Cargando usuarios..." className='usersListTable alignDatatable  pt-0' paginator rows={10} value={filteredUsers} >
                    <Column body={linksTemplate} field="name" header="Nombre" />
                    {widthPage > 600 ? <Column body={linksTemplate} field="email" header="Email"/> : null}
                    <Column body={actionsTemplate} header="Acciones" />
                </DataTable>

         

                <Dialog header={`${nameUser}`} visible={visible} onHide={() => closeDialog()} className={`${widthPage > 900 ? 'col-8' : 'col-10'}`} >
                    {renderProfileData()}
                </Dialog>

                <Dialog header={`${nameUser}`} visible={showDialog} onHide={() => hideDialog()} style={{ width: `${widthPage > 900 ? 'w-50' : 'w-100'}` }} >
                <div className='row justify-content-center'>
                    <div className='col-10 col-sm-6 mb-3'>
                    <label htmlFor="inputDelete" className='text-center mb-4'>Por favor, escriba <b>"ELIMINAR"</b> si desea eliminar permanentemente el usuario <b>{nameUser}</b></label>
                    <input
                        id='inputDelete'
                        type="text"
                        className='form-control'
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                    />
                    </div>
                    <div className='col-12 text-center'>
                    <button className="btn btn-sseccon m-3" onClick={handleCancel} >Cancelar</button>
                    <button className={isInputValid ? 'btn btn-danger m-3' : 'btn btn-secondary m-3'} disabled={!isInputValid} onClick={handleAccept}>Eliminar</button>

                    </div>
                </div>
                </Dialog>



            </div>
        </div>
    );
}
