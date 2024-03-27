import { useEffect, useState} from 'react'
import * as UsersService from '../../services/users.services.js'
import * as Notify from './../../helpers/notify.js'

import {useParams} from 'react-router-dom'
import { useColor } from '../Context/ColorContext.jsx'


function RegisterPage({refresh}){

    const {id} = useParams()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [logo, setLogo] = useState("")
    const [password, setPassword] = useState()
    const [error, setError] = useState()
    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))



    
    function generateUUID() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    let idRefresh = generateUUID()
    
    function changeName(e){
        setName(e.target.value)
    }

    function changeEmail(e){
        setEmail(e.target.value)
    }

    function changePassword(e){
        setPassword(e.target.value)
    }
    
    useEffect(()=>{
        UsersService.findUserById(id)
            .then(data => setLogo(data.logo))
    },[name])

    function onSubmit(e){
        e.preventDefault()
        Notify.notifyA("Agregando nuevo usuario...")
        UsersService.createAlumno(id, {name, email, password,logo})
            .then((data) => {
                refresh(idRefresh)
            })
            .catch(err =>{
                setError(err.message)
            })
    }

    return (
        <div className='row justify-content-center'>
            <div className="card col-12 col-lg-10 rounded-0">
                <div className="card-body">
                    <h2 className='card-title'>Crear alumno</h2>
                        <form onSubmit={onSubmit}>
                                {error && 
                            <div className="alert alert-danger text-center p-0" role="alert">
                                <p className='p-2 m-0'>{error}</p>
                            </div>
                            }
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    <label htmlFor="name" className="form-label">Nombre</label>
                                    <input type="text" className="form-control my-1 rounded-0" id="name" name="name"  onChange={changeName}/>
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
                                    <button className={`btn my-1 ${!textColor ? "bbb" : "text-light"} w-100`} style={{ "backgroundColor": `black` }}>Crear usuario</button>
                                </li>

                            </ul>
                        </form>
                </div>
            </div>
        </div>
               

    )
}

export default RegisterPage