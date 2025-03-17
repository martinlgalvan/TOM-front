import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import * as UserService from './services/users.services.js';
import * as RefreshUUID from './helpers/generateUUID.js';

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/login/LoginPage.jsx";

import UserRoutinePage from "./pages/athlete/UserRoutinePage.jsx";
import DayDetailsPage from "./pages/athlete/DayDetailsPage.jsx";

import UsersListPage from "./pages/coach/UsersListPage.jsx";
import UserRoutineEditPage from "./pages/coach/UserRoutineEditPage.jsx";
import DayEditDetailsPage from "./pages/coach/DayEditDetailsPage.jsx";
import UserPersonalize from "./pages/coach/UserPersonalize.jsx";
import Profile from "./pages/athlete/Profile.jsx";
import Novedades from './pages/coach/Novedades.jsx';
import RandomizerPage from "./pages/coach/Randomizer.jsx";
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from "@mui/material/IconButton";

import BibliotecExercises from './pages/coach/BibliotecExercises.jsx';
import QrLogin from './pages/login/QrLogin.jsx';

import * as authService from "./services/auth.services.js";

import AddColorToUser from './components/Users/AddColorToUser.jsx';
import { useColor } from './components/Context/ColorContext.jsx';
import { Sidebar } from 'primereact/sidebar';
import Spinner from 'react-bootstrap/Spinner';
import Logo from './assets/img/TOM.png';
import { registerServiceWorker } from './serviceWorkerRegistration.js';
import { Checkbox, FormControlLabel } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog } from "primereact/dialog";

import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PercentIcon from '@mui/icons-material/Percent';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import NotFound404 from './pages/NotFound404.jsx';
import ParDetailsPage from './pages/coach/ParDetailsPage.jsx';

function RoutePrivate({ isAutenticate, children }) {
    return (
        <>
            {isAutenticate ? children : <Navigate to="/login" />}
        </>
    );
}

function App() {
    const navigate = useNavigate();
    const id = localStorage.getItem('_id');
    const [user, setUser] = useState();
    const { color } = useColor();
    const { textColor } = useColor();
    const [status, setStatus] = useState();

    const [menuSidebar, setMenuSidebar] = useState(null);
    const [isAutenticated, setIsAutenticated] = useState(null);

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [showInstallPopup, setShowInstallPopup] = useState(false);

    // Estado para mostrar el mensaje de instalación en iOS
    const [showIOSInstallMessage, setShowIOSInstallMessage] = useState(false);

    const [openDialogLogout, setOpenDialogLogout] = useState(false);

    const location = useLocation();

    // Detectar iOS mediante el userAgent
    const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    // Detecta si la app ya está instalada (modo standalone)
    const isInStandaloneMode = () => ('standalone' in window.navigator) && window.navigator.standalone;

    useEffect(() => {
        registerServiceWorker();
    }, []);

    useEffect(() => {
        // Cada vez que cambie la ruta, por ahora no hacemos nada extra
    }, [location]);

    // Para dispositivos que NO son iOS se escucha el evento beforeinstallprompt
    useEffect(() => {
        if (isAutenticated && !isIOS) {
            const isCheckboxChecked = localStorage.getItem('noShowPopup');
            const beforeInstallPromptHandler = (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                if (isCheckboxChecked === 'false') {
                    setShowInstallPopup(true); // Muestra el popup de instalación
                }
                setShowInstallButton(true); // Muestra el botón
            };
            window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
            return () => window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
        }
    }, [isAutenticated, isIOS]);

    // Para iOS: si no está en modo standalone, mostramos un mensaje con instrucciones
    useEffect(() => {
        if (isIOS && !isInStandaloneMode()) {
            setShowIOSInstallMessage(true);
        }
    }, [isIOS]);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            setDeferredPrompt(null);
            setShowInstallPopup(false); // Oculta el popup
        }
    };

    const handleCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        localStorage.setItem('noShowPopup', isChecked.toString());
        setShowInstallPopup(!isChecked); // Ocultar popup si está marcado
    };

    const showInstallToast = () => {
        toast.info(
            <div className='row justify-content-center text-center '>
                <div className='col-10'>
                    <button className='row justify-content-center bg-primary rounded-3 ' onClick={handleInstallClick}>
                        <div className='col-3 text-light'>
                            <IconButton aria-label="download">
                                <DownloadIcon className='text-light' />
                            </IconButton>
                        </div>
                        <div className='col-9 m-auto'>
                            <p className='m-0 text-light '>Descargar TOM</p>
                        </div>
                    </button>
                </div>
                <div>
                    <FormControlLabel
                        className='text-center'
                        control={<Checkbox onChange={handleCheckboxChange} />}
                        label="No volver a mostrar"
                    />
                </div>
            </div>,
            {
                autoClose: false,
                position: "bottom-center"
            }
        );
    };

    useEffect(() => {
        if (showInstallPopup) {
            showInstallToast();
        }
    }, [showInstallPopup]);

    // Al arrancar, verificamos si hay token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAutenticated(true);
            registerServiceWorker();
        } else {
            setIsAutenticated(false);
        }
    }, [user, status]);

    function onLogin(user, token) {
        setUser(user);
        setIsAutenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('_id', user._id);
        localStorage.setItem('name', user.name);
        localStorage.setItem('noShowPopup', 'false');

        localStorage.setItem('email', user.email);
        localStorage.setItem('entrenador_id', user.entrenador_id);
        localStorage.setItem('logo', user.logo);

        if (user.color === undefined) {
            localStorage.setItem('color', '#1a1a1a');
        } else {
            localStorage.setItem('color', user.color);
        }

        if (user.color === undefined) {
            localStorage.setItem('textColor', false);
        } else {
            localStorage.setItem('textColor', user.textColor);
        }
        navigate(`/`);
    }

    function onLogout() {
        setOpenDialogLogout(false);
        setIsAutenticated(false);
        localStorage.clear();
        authService.logout();
        setMenuSidebar(false);
        navigate('/');
    }

    function isAdmin() {
        const admin = localStorage.getItem('role');
        return admin === 'admin';
    }

    const handleMenuSidebarOpen = () => {
        setMenuSidebar(true);
    };

    const handleMenuSidebarHide = () => {
        setMenuSidebar(false);
    };

    return (
        <>
            {/* NAVBAR FIJA */}
            <nav
                className={`navbar navbar-expand-lg navbar-dark fixed-top ${textColor === 'false' || !textColor ? "bbb" : "blackColor"}`}
                style={{ backgroundColor: color }}
            >
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">TOM</a>
                    <button className="navbar-toggler" type="button" onClick={handleMenuSidebarOpen}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul className="navbar-nav text-center">
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${location.pathname === `/` && 'active'}`}
                                    to="/"
                                >
                                    Inicio
                                </Link>
                            </li>
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/users/${id}` && 'active'}`}
                                        to={`/users/${id}`}
                                    >
                                        Lista de alumnos
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                              <li className="nav-item">
                                <Link 
                                  className={`nav-link ${location.pathname === `/novedades/` && 'active'}`} 
                                  to={`/novedades/`}
                                >
                                  Novedades
                                </Link>
                              </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/novedades/` && 'active'}`}
                                        to={`/novedades/`}
                                    >
                                        Novedades
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/personalize/` && 'active'}`}
                                        to={`/personalize/`}
                                    >
                                        Perfil
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/exercises/` && 'active'}`}
                                        to={`/exercises/`}
                                    >
                                        Biblioteca
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && !isAdmin() && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/perfil/${id}` && 'active'}`}
                                        to={`/perfil/${id}`}
                                    >
                                        Perfil
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && !isAdmin() && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/routine/${id}` && 'active'}`}
                                        to={`/routine/${id}`}
                                    >
                                        Ver rutina
                                    </Link>
                                </li>
                            )}
                            {!isAutenticated && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${location.pathname === `/login` && 'active'}`}
                                        to={"/login"}
                                    >
                                        Iniciar sesión
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && (
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        onClick={onLogout}
                                    >
                                        Cerrar sesión
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && showInstallButton && !isIOS && (
                                <li className="nav-item ms-5 aaa" onClick={handleInstallClick}>
                                    <Link className='nav-link'>
                                        <IconButton
                                            aria-label="download"
                                            className="p-0"
                                            onClick={handleInstallClick}
                                        >
                                            <DownloadIcon className="me-1" />
                                        </IconButton>
                                        Descargar TOM
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            <main
                style={
                    location.pathname !== `/` && 'stylesMain'
                        ? {
                            marginTop: "70px",
                            minHeight: "calc(100vh - 70px - 150px)",
                            padding: "1rem"
                        }
                        : { padding: "0" }
                }
            >
                {isAutenticated === null ? (
                    <div
                        className="d-flex flex-column align-items-center justify-content-center"
                        style={{ minHeight: "100%" }}
                    >
                        <img src={Logo} alt="TOM" className="TOM" />
                        <Spinner animation="border" role="status" className="spinner mt-3">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
                        <Route path="/qr-login" element={<QrLogin onLogin={onLogin} />} />
                        <Route
                            path="/users/:id/"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <UsersListPage />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/exercises/"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <BibliotecExercises />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/user/routine/:id/:username"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <UserRoutineEditPage />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/routine/user/:id/week/:week_id/day/:day_id/:username"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <DayEditDetailsPage />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/personalize"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <UserPersonalize />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/novedades"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <Novedades />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/perfil/:id"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <Profile />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/routine/:id"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <UserRoutinePage />
                                </RoutePrivate>
                            }
                        />
                        <Route
                            path="/routine/:id/day/:day_id/:week_id/:index"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <DayDetailsPage />
                                </RoutePrivate>
                            }
                        />
                        <Route 
                          path="/planificator/:id" 
                          element={
                            <RoutePrivate isAutenticate={isAutenticated}>
                                <RandomizerPage/>
                            </RoutePrivate>
                          }
                        />
                        <Route
                            path="/par/:id"
                            element={
                                <RoutePrivate isAutenticate={isAutenticated}>
                                    <ParDetailsPage />
                                </RoutePrivate>
                            }
                        />
                        <Route path="*" element={<NotFound404 />} />
                    </Routes>
                )}
            </main>

            {/* SIDEBAR */}
            <Sidebar
                visible={menuSidebar}
                onHide={handleMenuSidebarHide}
                blockScroll={true}
                position="right"
            >
                <ul className="list-group list-group-flush ulDecoration">
                    <li className="list-group-item">
                        <Link className='nav-link' to="/" onClick={() => setMenuSidebar(false)}>
                            Inicio
                        </Link>
                    </li>
                    {isAdmin() && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/users/${id}`} onClick={() => setMenuSidebar(false)}>
                                Lista de alumnos
                            </Link>
                        </li>
                    )}
                    {isAdmin() && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/novedades/`} onClick={() => setMenuSidebar(false)}>
                                Novedades
                            </Link>
                        </li>
                    )}
                    {isAdmin() && (
                      <li className="list-group-item">
                        <Link className='nav-link' to={`/personalize/`} onClick={() => setMenuSidebar(false)}>
                            Perfil
                        </Link>
                      </li>
                    )}
                    {isAdmin() && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/personalize/`} onClick={() => setMenuSidebar(false)}>
                                Perfil
                            </Link>
                        </li>
                    )}
                    {isAdmin() && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/exercises/`} onClick={() => setMenuSidebar(false)}>
                                Biblioteca
                            </Link>
                        </li>
                    )}
                    {isAutenticated && !isAdmin() && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/perfil/${id}`} onClick={() => setMenuSidebar(false)}>
                                Perfil
                            </Link>
                        </li>
                    )}
                    {isAutenticated && !isAdmin() && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/routine/${id}`} onClick={() => setMenuSidebar(false)}>
                                Ver rutina
                            </Link>
                        </li>
                    )}
                    {!isAutenticated && (
                        <li className="list-group-item">
                            <Link className='nav-link' to={"/login"} onClick={() => setMenuSidebar(false)}>
                                Iniciar sesión
                            </Link>
                        </li>
                    )}
                    {isAutenticated && (
                        <li className="list-group-item">
                            <Link className='nav-link' onClick={onLogout}>
                                Cerrar sesión
                            </Link>
                        </li>
                    )}
                    {isAutenticated && showInstallButton && !isIOS && (
                        <li className="nav-item aaa mt-3" onClick={handleInstallClick}>
                            <Link className='nav-link'>
                                <IconButton
                                    aria-label="descargar"
                                    className="text-light"
                                    onClick={handleInstallClick}
                                >
                                    <DownloadIcon className="me-1" />
                                </IconButton>
                                Descargar TOM
                            </Link>
                        </li>
                    )}
                </ul>
            </Sidebar>

            {/* FOOTER */}
            <footer className={`container-fluid colorFooter`}>
                <div className={`row marginSidebarClosed`}>
                    <ul className="text-center">
                        <li className="text-light py-2">TOM</li>
                    </ul>
                    <p className='m-0 text-light text-center py-2'>
                        &copy; 2022 | TOM
                    </p>
                </div>
            </footer>

            {/* DIÁLOGO DE LOGOUT */}
            <Dialog
                header="Sesión"
                visible={openDialogLogout}
                onHide={() => setOpenDialogLogout(false)}
            >
                <div className="row justify-content-center">
                    <div className="p-field">
                        <p>¿Estás seguro que deseas cerrar sesión?</p>
                    </div>
                    <div className="p-field text-end">
                        <button className="btn btn-danger mx-2 mt-2" onClick={onLogout}>
                            Cerrar sesión
                        </button>
                        <button className="btn btn-secondary mx-2 mt-2" onClick={() => setOpenDialogLogout(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* DIÁLOGO PERSONALIZADO PARA INSTALAR EN iOS */}
            {isIOS && (
                <Dialog
                    header="Instalar Aplicación"
                    visible={showIOSInstallMessage}
                    style={{ width: "50vw" }}
                    onHide={() => setShowIOSInstallMessage(false)}
                >
                    <p>
                        Para instalar esta aplicación, presiona el botón Compartir de Safari y selecciona "Agregar a pantalla de inicio / Agregar a inicio".
                    </p>
                    <Button label="Cerrar" onClick={() => setShowIOSInstallMessage(false)} />
                </Dialog>
            )}

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
        </>
    );
}

export default App;
