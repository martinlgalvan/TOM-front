import {useState, useEffect} from 'react'
import {Link, useParams, useNavigate} from 'react-router-dom'

import * as UsersService from '../../services/users.services.js';
import * as Notify from './../../helpers/notify.js'
import * as RefreshFunction from './../../helpers/generateUUID.js'

import UserRegister from '../../components/Users/UserRegister.jsx';
import Logo from '../../components/Logo'
import DeleteUserDialog from '../../components/DeleteActions/DeleteUserDialog.jsx';
import SkeletonUsers from '../../components/Skeleton/SkeletonUsers.jsx';

import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';
import { ToastContainer } from './../../helpers/notify.js';


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

    const [name, setName] = useState()          // Variable para la eliminación
    const [user_id, setUser_id] = useState()    // ----------------------------*
    const [firstLoad, setFirstLoad] = useState()    

    const navigate = useNavigate()

    let idRefresh = RefreshFunction.generateUUID()
    
    useEffect(() => {
        Notify.notifyA("Cargando usuarios...")
           
            UsersService.find(id)
                .then(data => {
                    setFirstLoad(true)
                    //Si se actualiza, se guarda los de la base de datos y se empieza a usar estos
                    setUsers(data)
                    // Y a pesar de no utilizar el del storage, se actualiza.
                    let jsonDATA = JSON.stringify(data);
                    sessionStorage.setItem('U4S3R', jsonDATA)
                    Notify.updateToast()
                })
       

    }, [status]) 

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

    return (
        <section className='container-fluid'>

            <Logo />
            <h2 className='text-center mb-5 col-12'>¡Bienvenido {localStorage.getItem('name')}!</h2>

            <article className='row justify-content-center'>

                <div className='col-10 col-md-5 col-xl-4 text-center mb-5'>
                    <UserRegister refresh={refresh} />
                </div>

                <div className='col-12 col-md-7 col-xl-8 text-center mb-5'>

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
                                    {loading == true ? Array.from({ length: numberUsers }).map((_, index) => (
                                        <SkeletonUsers key={index} />
                                    )) : 
                                    <TransitionGroup component={null} className="todo-list">
                                    {results != null && results.map(({_id, name, email}) =>
                                    
                                        <CSSTransition
                                        key={_id}
                                        timeout={500}
                                        classNames="item"
                                        >
                                            <tr key={_id}>
                                                <td className='text-center'><Link className="btn LinkDays ClassBGHover w-100" to={`/user/routine/${_id}/`}>{name} </Link></td>
                                                <td className='text-center responsiveEmail'><Link className="btn LinkDays ClassBGHover w-100" to={`/user/routine/${_id}`}>{email}</Link></td>
                                                <td className='text-center'>

                                                    

                                                    <button onClick={() => showDialogDelete(_id,name) } className='btn'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-trash3" viewBox="0 0 16 16">
                                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                        </svg>
                                                    </button>
                                                    
                                                </td>
                                            </tr>
                                        </CSSTransition>
                                    )}
                                    </TransitionGroup>}
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

            <DeleteUserDialog visible={showDialog} onHide={hideDialog} user_id={user_id} name={name} />
        </section>
    )
}

export default UsersListPage