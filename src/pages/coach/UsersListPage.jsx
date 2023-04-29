import {useState, useEffect} from 'react'
import {Link, useParams, useNavigate} from 'react-router-dom'

import * as UsersService from '../../services/users.services.js';
import * as ObjectId from 'bson-objectid';

import UserRegister from '../../components/Users/UserRegister.jsx';
import Logo from '../../components/Logo'

import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';

function UsersListPage() {

    const {id} = useParams()
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState(0);
    const navigate = useNavigate()
    let objectId = new ObjectId()
    let refreshId = objectId.toHexString();
  
    useEffect(() => {
        UsersService.find(id)
        .then(data => {
            setUsers(data)
            
        })
        .catch(res =>{
            navigate("/")
        })
    }, [status]) 


    const refresh = (refresh) => {
        setStatus(refresh);
    }


    const reject = () => {};
    
    function acceptDeleteUser(id) {

        UsersService.deleteUser(id)
        setStatus(id)
  
    };
    
    //Notify popup
    const deleteUser = (event,id,name) => {
        confirmDialog({
            trigger: event.currentTarget,
            message: `¡Cuidado! Estás por eliminar ${name}. ¿Estás seguro?`,
            icon: 'pi pi-exclamation-triangle',
            header:`Eliminar ${name}`,
            accept: () => acceptDeleteUser(id),
            reject,
            acceptLabel:"Sí, eliminar",
            acceptClassName: "p-button-danger",
            rejectLabel: "No",
            rejectClassName: "closeDialog",
            blockScroll: true,
            dismissableMask: true,
        });
        setStatus(id)
    };

    //Función de búsqueda
    const searcher = (e) => {
        setSearch(e.target.value)   
    }  

    const results = !search ? users : users.filter((dato)=> dato.name.toLowerCase().includes(search.toLocaleLowerCase()))

    return (
        <section className='container-fluid'>

            <Logo />
            <h2 className='text-center mb-4 col-12'>Buscá un alumno.</h2>
            <div className='row justify-content-center mb-5 mt-2'>

                <div className='col-5'>
                    <input value={search} onChange={searcher} type="text" placeholder='Buscar' className='col-5 form-control rounded-0'/>
                </div>

            </div>

            <article className='row justify-content-center'>

                <div className='col-10 col-lg-3 text-center mb-5'>
                    <UserRegister refresh={refresh} />
                </div>

                <div className='col-12 col-lg-8 text-center mb-5'>

                    <div className='row justify-content-center'>
                        <div className='col-10'>
                            <table className="table table-bordered text-center align-middle">
                                <thead className='table-light'>
                                    <tr>
                                        <th scope="col">Nombre</th>
                                        <th scope="col" className='responsiveEmail'>Email</th>
                                        <th scope="col">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TransitionGroup component={null} className="todo-list">
                                    {results.map(({_id, name, email}) =>
                                    
                                        <CSSTransition
                                        key={_id}
                                        timeout={500}
                                        classNames="item"
                                        >
                                            <tr key={_id}>
                                                <td className='text-center'>{name}</td>
                                                <td className='text-center responsiveEmail'>{email}</td>
                                                <td className='text-center'>

                                                    <Link className="btn" to={`/user/routine/${_id}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="bi bi-eye" viewBox="0 0 16 16">
                                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                                        </svg>
                                                    </Link>

                                                    <button onClick={(event) => deleteUser(event,_id,name) } className='btn'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-trash3" viewBox="0 0 16 16">
                                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                        </svg>
                                                    </button>
                                                    
                                                </td>
                                            </tr>
                                        </CSSTransition>
                                    )}
                                    </TransitionGroup>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </article>
            <ConfirmDialog />
        </section>
    )
}

export default UsersListPage