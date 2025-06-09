import React, { useEffect, useState } from 'react';
import * as UsersService from '../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import * as ChangePropertyService from '../../services/changePropertys.services.js';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
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
    const [category, setCategory] = useState("");

    const [touched, setTouched] = useState({});

    const nivelOptions = [
        { label: 'Alumno casual', value: 'Alumno casual' },
        { label: 'Alumno dedicado', value: 'Alumno dedicado' },
        { label: 'Atleta iniciante', value: 'Atleta iniciante' },
        { label: 'Atleta avanzado', value: 'Atleta avanzado' }
    ];

    useEffect(() => {
        setColor(localStorage.getItem('color'));
        setTextColor(localStorage.getItem('textColor'));
    }, []);

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

        if (!name || !email || !password || !confirmPassword || !category) {
            setTouched({ name: true, email: true, password: true, confirmPassword: true, category: true });
            setError("Por favor complete todos los campos obligatorios.");
            return;
        }

        if (!parentId) {
            setError("No se proporcionó un ID válido para crear el alumno.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        Notify.notifyA('Creando alumno...');

        UsersService.createAlumno(parentId, {
            name,
            email,
            password,
            logo
        })
        .then((newUser) => {
            return ChangePropertyService.changeProperty(newUser._id, category);
        })
        .then(() => {
            Notify.updateToast();
            refresh();
            onClose();
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
                <form onSubmit={onSubmit} noValidate>
                    {error && (
                        <div className="alert alert-danger text-center p-0" role="alert">
                            <p className='p-2 m-0'>{error}</p>
                        </div>
                    )}
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <label htmlFor="name" className="form-label">Nombre*</label>
                            <input 
                                type="text"
                                className={`form-control my-1 rounded-0 ${touched.name && !name ? 'is-invalid' : ''}`}
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setTouched(prev => ({...prev, name: true}))}
                                required
                            />
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="email" className="form-label">Email*</label>
                            <input 
                                type="email"
                                className={`form-control my-1 rounded-0 ${touched.email && !email ? 'is-invalid' : ''}`}
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setTouched(prev => ({...prev, email: true}))}
                                required
                            />
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="password" className="form-label">Contraseña*</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control my-1 rounded-0 ${touched.password && !password ? 'is-invalid' : ''}`}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setTouched(prev => ({...prev, password: true}))}
                                    required
                                />
                                <IconButton onClick={togglePasswordVisibility}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña*</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control my-1 rounded-0 ${touched.confirmPassword && !confirmPassword ? 'is-invalid' : ''}`}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => setTouched(prev => ({...prev, confirmPassword: true}))}
                                    required
                                />
                                <IconButton onClick={togglePasswordVisibility}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <label htmlFor="category" className="form-label d-block">Categoría*</label>
                            <Dropdown
                                id="category"
                                name="category"
                                value={category}
                                options={nivelOptions}
                                onChange={(e) => setCategory(e.value)}
                                placeholder="Seleccione una categoría"
                                className={touched.category && !category ? 'p-invalid' : ''}
                                onBlur={() => setTouched(prev => ({...prev, category: true}))}
                                required
                            />
                            {touched.category && !category && (
                                <small className="text-danger">Debe seleccionar una categoría.</small>
                            )}
                        </li>
                        <li className="list-group-item">
                            <button type="submit" className="btn colorMainAll text-light my-1 w-100">
                                Crear usuario
                            </button>
                        </li>
                    </ul>
                </form>
            </div>
        </Dialog>
    );
}
