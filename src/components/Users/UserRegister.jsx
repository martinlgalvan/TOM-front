import React, { useEffect, useState } from 'react';
import * as UsersService from '../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import { Dialog } from 'primereact/dialog';

import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function UserRegister({ refresh, dialogg, parentId, onClose }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [logo, setLogo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [color, setColor] = useState("");
    const [textColor, setTextColor] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setColor(localStorage.getItem('color'));
        setTextColor(localStorage.getItem('textColor'));
    }, []);

    // Carga logo o lo que necesites desde el "dueño" (parentId)
    useEffect(() => {
        if (parentId) {
            UsersService.findUserById(parentId)
                .then(data => {
                    if (data && data.logo) {
                        setLogo(data.logo);
                    }
                })
                .catch(err => console.log(err));
        }
    }, [parentId]);

    function onSubmit(e) {
        e.preventDefault();
        setError(null);

        if (!parentId) {
            setError("No se proporcionó un ID válido para crear el alumno.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        Notify.notifyA('Creando alumno...');

        UsersService.createAlumno(parentId, {
            name,
            email,
            password,
            logo,
            color,
            textColor
        })
        .then(() => {
            Notify.updateToast();
            refresh(); 
            onClose();  // Cierra el diálogo al terminar
        })
        .catch(err => {
            setError(err.message || 'Ocurrió un error al crear el alumno.');
        });
    }

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }

    return (
        <Dialog
            header="Crear alumno"
            visible={dialogg}
            className='col-10 col-lg-6'
            modal
            onHide={onClose}
        >
            <div className="card-body">
                <form onSubmit={onSubmit}>
                    {error && (
                        <div className="alert alert-danger text-center p-0" role="alert">
                            <p className='p-2 m-0'>{error}</p>
                        </div>
                    )}
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <label htmlFor="name" className="form-label">Nombre</label>
                            <input 
                                type="text" 
                                className="form-control my-1 rounded-0" 
                                id="name" 
                                name="name" 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input 
                                type="email" 
                                className="form-control my-1 rounded-0" 
                                id="email" 
                                name="email" 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control my-1 rounded-0"
                                    id="password"
                                    name="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <IconButton onClick={togglePasswordVisibility}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control my-1 rounded-0"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <IconButton onClick={togglePasswordVisibility}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <button
                                className="btn my-1 w-100"
                                style={{
                                    backgroundColor: color || '#000',
                                    color: textColor === 'true' ? '#000' : '#fff'
                                }}
                            >
                                Crear usuario
                            </button>
                        </li>
                    </ul>
                </form>
            </div>
        </Dialog>
    );
}
