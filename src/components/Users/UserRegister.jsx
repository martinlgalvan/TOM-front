import React, { useEffect, useState } from 'react';
import * as UsersService from '../../services/users.services.js';
import * as Notify from './../../helpers/notify.js';
import * as ChangePropertyService from '../../services/changePropertys.services.js';
import { Dialog } from 'primereact/dialog';

// MUI
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

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
      setError("No se proporciono un ID valido para crear el alumno.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
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
        setError(err.message || 'Ocurrio un error al crear el alumno.');
      });
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <Dialog
      header="Crear Alumno"
      visible={dialogg}
      className="col-11 col-lg-4 colorPrimaryDialog"
      modal
      closable
      onHide={onClose}
    >
      <div className="card-body">
        <p className="text-muted fs09em mb-1 ms-3">Esta es la forma de dar de alta a un alumno.</p>
        <p className="text-muted fs08em mb-3 ms-4">Antes de crearlo, te pedimos que guardes los datos, asi se lo envias a tu alumno.</p>

        <form onSubmit={onSubmit} noValidate>
          {error && (
            <div className="alert alert-danger text-center p-0" role="alert">
              <p className="p-2 m-0">{error}</p>
            </div>
          )}

          <ul className="list-group list-group-flush">

            {/* Nombre */}
            <li className="list-group-item">
              <label htmlFor="name" className="form-label">Nombre *</label>
              <div className="input-group">
                <span className="input-group-text colorBackGround border-end-0">
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </span>
                <input
                  type="text"
                  className={`form-control border-start-0  ${touched.name && !name ? 'is-invalid' : ''}`}
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  required
                />
              </div>
            </li>

            {/* Email */}
            <li className="list-group-item">
              <label htmlFor="email" className="form-label">Correo electronico *</label>
              <div className="input-group">
                <span className="input-group-text colorBackGround border-end-0">
                  <MailOutlineOutlinedIcon fontSize="small" />
                </span>
                <input
                  type="email"
                  className={`form-control border-start-0  ${touched.email && !email ? 'is-invalid' : ''}`}
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  required
                />
              </div>
            </li>

            {/* Password */}
            <li className="list-group-item">
              <label className="form-label">Contrasena *</label>
              <div className="input-group">
                <span className="input-group-text colorBackGround border-end-0">
                  <LockOutlinedIcon fontSize="small" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  className={`form-control border-start-0  ${touched.password && !password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  required
                />
                <IconButton onClick={togglePasswordVisibility} edge="end" className="ms-1">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
            </li>

            {/* Confirm Password */}
            <li className="list-group-item">
              <label className="form-label">Confirmar contrasena *</label>
              <div className="input-group">
                <span className="input-group-text colorBackGround border-end-0">
                  <LockOutlinedIcon fontSize="small" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  className={`form-control border-start-0  ${touched.confirmPassword && !confirmPassword ? 'is-invalid' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  required
                />
                <IconButton onClick={togglePasswordVisibility} edge="end" className="ms-1">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
            </li>

            {/* NUEVO SELECT (MUI) */}
            <li className="list-group-item">
              <label className="form-label d-block">Categoria *</label>

              <div className="input-group">
                <span className="input-group-text colorBackGround border-end-0">
                  <CategoryOutlinedIcon fontSize="small" />
                </span>

                <div className="flex-grow-1">
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, category: true }))}
                    error={touched.category && !category}
                    placeholder="Seleccione una categoria"
                    size="small"
                  >
                    {nivelOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              </div>

              {touched.category && !category && (
                <small className="text-danger">Debe seleccionar una categoria.</small>
              )}
            </li>

            {/* Boton */}
            <li className="list-group-item">
              <button type="submit" className="btn colorMainAll text-light w-100">
                Crear Usuario
              </button>
            </li>
          </ul>
        </form>
      </div>
    </Dialog>
  );
}
