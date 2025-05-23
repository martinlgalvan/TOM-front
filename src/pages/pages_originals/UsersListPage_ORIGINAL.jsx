import React, {useState, useEffect, useRef} from 'react'
import {Link, useParams, useNavigate} from 'react-router-dom'

import * as UsersService from '../../services/users.services.js';
import * as Notify from '../../helpers/notify.js'
import * as RefreshFunction from '../../helpers/generateUUID.js'
import * as UserService from '../../services/users.services.js';

import UserRegister from '../../components/Users/UserRegister.jsx';
import Logo from '../../components/Logo.jsx'
import DeleteUserDialog from '../../components/DeleteActions/DeleteUserDialog.jsx';

import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';
import { ToastContainer } from '../../helpers/notify.js';
import { animated, useTransition } from '@react-spring/web';
import { Dialog } from 'primereact/dialog';
import { SelectButton } from 'primereact/selectbutton';

import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import PrimeReactTable from '../../components/PrimeReactTable.jsx';

function UsersListPage() {

    const {id} = useParams()
    const {numberUsers} = useParams()
    //En app esta guardado el array entero.
    //Acá, agarro los usuarios
    const data = sessionStorage.getItem('U4S3R')
    let parsed = JSON.parse(data)

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState(0);
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false);
    const [days, setDays] = useState("")

    const [profileData, setProfileData] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const [name, setName] = useState()          // Variable para la eliminación
    const [user_id, setUser_id] = useState()    // ----------------------------*


    let idRefresh = RefreshFunction.generateUUID()

    
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
    
    useEffect(() => {
        Notify.notifyA("Cargando usuarios...")
           
            UsersService.find(id)
                .then(data => {
                    setUsers(data)
                    // Y a pesar de no utilizar el del storage, se actualiza.
                    let jsonDATA = JSON.stringify(data);
                    sessionStorage.setItem('U4S3R', jsonDATA)
                    Notify.updateToast()
                })
       

    }, [status]) 

    useEffect(() => {
        if (profileData && profileData.details) {
            const days = Object.keys(profileData.details);
            if (days.length > 0) {
                setSelectedDay(days[0]);
            }
        }
    }, [profileData]);

    const refresh = () => {
        Notify.notifyA("Cargando usuarios...")
        setStatus(RefreshFunction.generateUUID())
    };
    
    const [showDialog, setShowDialog] = useState()

    const showDialogDelete = (_id, name) => {
        setName(name)
        setUser_id(_id)
        setShowDialog(true);
      };
      
      const hideDialog = (load) => {
        load != null ? setStatus(idRefresh) : null
        setShowDialog(false);
      };

    //Función de búsqueda
    const searcher = (e) => setSearch(e.target.value)   
    
    const results = !search ? users : users.filter((dato)=> dato.name.toLowerCase().includes(search.toLocaleLowerCase()))

    const transitions = useTransition(results, {
        from: { opacity: 0, scale: 0.9,},
        enter: { opacity: 1, scale: 1, },
        leave: { opacity: 0, scale: 0.9},
        config: { tension: 350, friction: 20 },
        delay: 200,
        keys: item => item._id,
      });




    return (
        <section className='container-fluid'>

            <Logo />
            <h2 className='text-center mb-5 col-12'>¡Bienvenido/a {localStorage.getItem('name')}!</h2>

            <article className='row justify-content-center text-center '>

                <div className='col-6 mb-3'>
                    <p>Bienvenido al administrador de tus alumnos. Acá podrás crear el usuario a tus alumnos para que puedan ingresar a su planificación.</p>
                </div>
                
                <div className='mb-4 '>
                    <UserRegister refresh={refresh} />
                </div>

                <div className='col-11 text-center mb-5'>

                <PrimeReactTable name={name} user_id={user_id} id={id} />

                    <div className='row justify-content-center'>
                        <div className='col-10'>
                            <table className="table table-bordered text-center align-middle">
                                <thead className='table-light'>
                                    
                                    <tr className="">
                                        <th colSpan={3}>
                                            <div className="input-group mb-3">
                                                <input
                                                    aria-label="Buscar" 
                                                    aria-describedby="addon-buscar"
                                                    value={search}
                                                    onChange={searcher}
                                                    type="text"
                                                    placeholder="Buscar"
                                                    className="col-5 form-control rounded-0"
                                                />  
                                                <span className="input-group-text border-0 bg-light" id="addon-buscar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                                    </svg>
                                                </span>                                      
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th scope="col">Nombre</th>
                                        <th scope="col" className='responsiveEmail'>Email</th>
                                        <th scope="col">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {transitions((styles, {_id, name, email }) => (
                                        <animated.tr key={_id} style={styles}>
                            
                                                <td className='text-center'><Link className={`btn LinkDays ClassBGHover w-100`} to={`/user/routine/${_id}/${name}`}>{name}</Link></td>
                                                <td className='text-center responsiveEmail'><Link className={`btn LinkDays ClassBGHover w-100`} to={`/user/routine/${_id}/${name}`}>{email}</Link></td>
                                                <td className='text-center'>

                                                    <IconButton
                                                        aria-label="video"
                                                        className=""
                                                        onClick={() => openDialog(_id, name) }
                                                        >
                                                        <PersonIcon />
                                                    </IconButton>
                                               
                                                    <IconButton
                                                        aria-label="video"
                                                        className=""
                                                        onClick={() => showDialogDelete(_id,name) }
                                                        >
                                                        <CancelIcon className='colorIconYoutube' />
                                                    </IconButton>
                                                    
                                                </td>
                                            </animated.tr>
                                        
                                    ))}
                                   
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </article>
            <ConfirmDialog />
            <ToastContainer
                    position="bottom-center"
                    autoClose={200}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    />
        </section>
    )
}

export default UsersListPage