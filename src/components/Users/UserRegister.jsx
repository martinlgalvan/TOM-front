import { useEffect, useState } from 'react';
import * as UsersService from '../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import { useParams } from 'react-router-dom';
import { useColor } from '../Context/ColorContext.jsx';
import { Dialog } from 'primereact/dialog';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';


function RegisterPage({ refresh }) {
    const { id } = useParams();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [logo, setLogo] = useState("");
    const [password, setPassword] = useState();
    const [error, setError] = useState();
    const [color, setColor] = useState();
    const [textColor, setTextColor] = useState();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setColor(localStorage.getItem('color'));
        setTextColor(localStorage.getItem('textColor'));
        console.log(localStorage.getItem('textColor'));
    }, []);

    function generateUUID() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    let idRefresh = generateUUID();

    function changeName(e) {
        setName(e.target.value);
    }

    function changeEmail(e) {
        setEmail(e.target.value);
    }

    function changePassword(e) {
        setPassword(e.target.value);
    }

    useEffect(() => {
        UsersService.findUserById(id)
            .then(data => {
                setLogo(data.logo);
                console.log(data);
            });
    }, [id]);

    function onSubmit(e) {
        e.preventDefault();
        Notify.notifyA("Agregando nuevo usuario...");
        UsersService.createAlumno(id, { name, email, password, logo, color, textColor })
            .then((data) => {
                refresh(idRefresh);
                setVisible(false); // Cerrar el modal después de crear el usuario
            })
            .catch(err => {
                setError(err.message);
            });
    }

    return (
        <div className='row justify-content-center'>
            <button className='col-10 col-lg-3 py-2 border card-shadow m-4' onClick={() => setVisible(true)}>
                <div className='py-3'>
                <IconButton aria-label="add" className="" >
                    <AddIcon />
                </IconButton>
                <p className=''>Crear nuevo alumno</p>
                </div>
            </button>
         
            <div  className='row justify-content-center'>

            <Dialog header="Crear alumno" visible={visible} className='col-10 col-lg-6' modal onHide={() => setVisible(false)}>
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        {error &&
                            <div className="alert alert-danger text-center p-0" role="alert">
                                <p className='p-2 m-0'>{error}</p>
                            </div>
                        }
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <label htmlFor="name" className="form-label">Nombre</label>
                                <input type="text" className="form-control my-1 rounded-0" id="name" name="name" onChange={changeName} />
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" className="form-control my-1 rounded-0" id="email" name="email" onChange={changeEmail} />
                            </li>
                            <li className="list-group-item">
                                <label htmlFor="passw" className="form-label">Password</label>
                                <input type="password" className="form-control my-1 rounded-0" id="passw" name="passw" onChange={changePassword} />
                            </li>
                            <li className="list-group-item">
                                <button className={`btn my-1 ${textColor == 'false' || !textColor ? "bbb" : "blackColor"} w-100`} style={{ backgroundColor: `${color}` }}>Crear usuario</button>
                            </li>
                        </ul>
                    </form>
                </div>
            </Dialog>
                            
            </div>
        </div>
    );
}

export default RegisterPage;
