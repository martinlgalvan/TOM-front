import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import React, { useState, useEffect } from 'react'

import * as UserService from './services/users.services.js'
import * as RefreshUUID from './helpers/generateUUID.js'

import HomePage from "./pages/HomePage.jsx"
import LoginPage from "./pages/login/LoginPage.jsx"

import UserRoutinePage from "./pages/athlete/UserRoutinePage.jsx"
import DayDetailsPage from "./pages/athlete/DayDetailsPage.jsx"

import UsersListPage from "./pages/coach/UsersListPage.jsx"
import UserRoutineEditPage from "./pages/coach/UserRoutineEditPage.jsx"
import DayEditDetailsPage from "./pages/coach/DayEditDetailsPage.jsx"
import UserPersonalize from "./pages/coach/UserPersonalize.jsx"
import Profile from "./pages/athlete/Profile.jsx"
import Novedades from './pages/coach/Novedades.jsx'
import RandomizerPage from "./pages/coach/Randomizer.jsx"
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from "@mui/material/IconButton";

import BibliotecExercises from './pages/coach/BibliotecExercises.jsx'
import QrLogin from './pages/login/QrLogin.jsx'

import * as authService from "./services/auth.services.js"

import AddColorToUser from './components/Users/AddColorToUser.jsx'
import { useColor } from './components/Context/ColorContext.jsx';
import { Sidebar } from 'primereact/sidebar';
import Spinner from 'react-bootstrap/Spinner';
import Logo from './assets/img/TOM.png'
import { registerServiceWorker } from './serviceWorkerRegistration.js';
import { Checkbox, FormControlLabel } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';

import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PercentIcon from '@mui/icons-material/Percent';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import NotFound404 from './pages/NotFound404.jsx'
import ParDetailsPage from './pages/coach/ParDetailsPage.jsx'
import UserAnnouncementsPage from './components/UserAnnouncementsPage.jsx'
import PaymentsManagerPage from './pages/coach/PaymentsManagerPage.jsx'

import {
  AlignJustify
} from 'lucide-react';



function RoutePrivate({ isAutenticate, children }) {
    return (
        <>
            {isAutenticate ? children : <Navigate to="/login" />}
        </>
    )
}

function App() {
    const navigate = useNavigate()
    const id = localStorage.getItem('_id')
    const [user, setUser] = useState()
    const { color } = useColor();
    const { textColor } = useColor();
    const [status, setStatus] = useState()

    const [menuSidebar, setMenuSidebar] = useState(null);
    const [isAutenticated, setIsAutenticated] = useState(null)

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [showInstallPopup, setShowInstallPopup] = useState(false);

    const [openDialogLogout, setOpenDialogLogout] = useState(false);

    const location = useLocation(); // Obtén la ubicación actual
    const [isLoading, setIsLoading] = useState(true);

    const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
    const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

    useEffect(() => {
        registerServiceWorker();
    }, []);

    useEffect(() => {
        // Cada vez que cambie la ruta, por ahora no hacemos nada extra
    }, [location]);

    useEffect(() => {
        if (isAutenticated) {
            const isCheckboxChecked = localStorage.getItem('noShowPopup');
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                if (isCheckboxChecked === 'false') {
                    setShowInstallPopup(true); // Muestra el popup de instalación
                }
                setShowInstallButton(true); // Muestra el botón
            });
        }
        return () => window.removeEventListener('beforeinstallprompt', () => { });
    }, [isAutenticated]);

useEffect(() => {
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('_id');

    // Si no es admin y está autenticado
    if (role !== 'admin' && id && isAutenticated) {
        UserService.getUnreadAnnouncements(id)
            .then(res => {
                if (res && res.length > 0) {
                    setPendingAnnouncements(res);
                    setCurrentAnnouncement(res[0]);
                    setCurrentAnnouncementIndex(0);
                    setShowAnnouncementDialog(true);
                }
            })
            .catch(err => console.error("Error buscando anuncios:", err));
    }
}, [location.pathname, isAutenticated]);

const handleDismissAnnouncement = async () => {
    const current = pendingAnnouncements[currentAnnouncementIndex];
    if (current) {
        await UserService.markAnnouncementRead(current._id, id);
        const nextIndex = currentAnnouncementIndex + 1;
        if (nextIndex < pendingAnnouncements.length) {
            setCurrentAnnouncementIndex(nextIndex);
        } else {
            setShowAnnouncementDialog(false);
        }
    }
};

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
                            <IconButton aria-label="download" >
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
                autoClose: false, // Evita que se cierre automáticamente
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
        const token = localStorage.getItem('token')
        if (token) {
            setIsAutenticated(true)
            registerServiceWorker()
        } else {
            setIsAutenticated(false)
        }

        setIsLoading(false);
    }, [user, status]);


async function onLogin(user, token) {
    setUser(user);
    setIsAutenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('_id', user._id);
    localStorage.setItem('name', user.name);
    localStorage.setItem('noShowPopup', 'false');
    if (user.drive != undefined) {
        localStorage.setItem('drive', user.drive);
    }

    localStorage.setItem('email', user.email);
    localStorage.setItem('entrenador_id', user.entrenador_id);
    localStorage.setItem('logo', user.logo);
    localStorage.setItem('color', user.color || '#1a1a1a');
    localStorage.setItem('textColor', user.textColor || false);

    if(user.role != "admin"){

            try {
        const res = await UserService.getUnreadAnnouncements(user._id);
        
            setPendingAnnouncements(res);
            setCurrentAnnouncementIndex(0);
            setShowAnnouncementDialog(true);
            console.log()
    } catch (err) {
        console.error("Error obteniendo anuncios en login:", err);
    }

    }

    navigate(`/`);
}

    function onLogout() {
        setOpenDialogLogout(false)
        setIsAutenticated(false)
        localStorage.clear();
        authService.logout()
        setMenuSidebar(false)
        navigate('/')
    }

    function isAdmin() {
        const admin = localStorage.getItem('role')
        return admin === 'admin'
    }

    const handleMenuSidebarOpen = () => {
        setMenuSidebar(true);
    };

    const handleMenuSidebarHide = () => {
        setMenuSidebar(false);
    };

    // Si la autenticación aún no se ha determinado, mostramos un layout de carga con navbar y footer vacíos.
    if (isLoading) {
        return (
            <>
                <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                    {/* Navbar vacío */}
                    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top `}
                style={{ backgroundColor: color }}>
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">TOM</a>
                <button className="navbar-toggler text-light " type="button" onClick={handleMenuSidebarOpen}>
                        <AlignJustify />
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        
                    </div>
                </div>
            </nav>
                    {/* Contenedor central que ocupa el espacio restante */}
                    <main style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Spinner animation="grow" variant="dark" role="status" >
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </main>
                    {/* Footer vacío */}
                    <footer className="footer empty-footer" style={{ height: "150px", backgroundColor: "#fff" }}>
                    </footer>
                </div>
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
            </>
        )
    }

    return (
        <>
            {/* NAVBAR FIJA */}
            <nav className={`navbar navbar-expand-lg colorMainAll text-light fixed-top `}
                >
                <div className="container-fluid">
                    <a className="navbar-brand text-light" href="/">TOM</a>
                    <button className="navbar-toggler text-light " type="button" onClick={handleMenuSidebarOpen}>
                        <AlignJustify />
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul className="navbar-nav text-center">
                            <li className="nav-item">
                                <Link className={`nav-link text-light ${location.pathname === `/` && 'active'}`} to="/">Inicio</Link>
                            </li>
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/users/${id}` && 'active'}`} to={`/users/${id}`}>
                                        Lista de alumnos
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/usuarios/${id}` && 'active'}`} to={`/usuarios/${id}`}>
                                        Gestion de alumnos
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/planificator/${id}` && 'active'}`} to={`/planificator/${id}`}>
                                        Planificador
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/novedades/` && 'active'}`} to={`/novedades/`}>
                                        Novedades
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/personalize/` && 'active'}`} to={`/personalize/`}>
                                        Perfil
                                    </Link>
                                </li>
                            )}
                            {isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/exercises/` && 'active'}`} to={`/exercises/`}>
                                        Biblioteca
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && !isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/perfil/${id}` && 'active'}`} to={`/perfil/${id}`}>
                                        Perfil
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && !isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/routine/${id}` && 'active'}`} to={`/routine/${id}`}>
                                        Ver rutina
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && !isAdmin() && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/anuncios/${id}` && 'active'}`} to={`/anuncios/`}>
                                        Ver anuncios
                                    </Link>
                                </li>
                            )}
                            {!isAutenticated && (
                                <li className="nav-item">
                                    <Link className={`nav-link text-light ${location.pathname === `/login` && 'active'}`} to={"/login"}>
                                        Iniciar sesión
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && (
                                <li className="nav-item">
                                    <Link className="nav-link text-light" onClick={onLogout}>
                                        Cerrar sesión
                                    </Link>
                                </li>
                            )}
                            {isAutenticated && showInstallButton && (
                                <li className="nav-item ms-5 aaa" onClick={handleInstallClick}>
                                    <Link className='nav-link text-light'>
                                        <IconButton aria-label="download" className="p-0" onClick={handleInstallClick}>
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

            <main style={location.pathname !== `/` && 'stylesMain' ? {
                marginTop: "70px",
                minHeight: "calc(100vh - 70px - 150px)",
                padding: "1rem"
            } : { padding: "0" }}>
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
                                <RandomizerPage />
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

                    <Route
                        path="/anuncios"
                        element={
                            <RoutePrivate isAutenticate={isAutenticated}>
                                <UserAnnouncementsPage />
                            </RoutePrivate>
                        }
                    />

                    <Route
                        path="/usuarios/:id"
                        element={
                            <RoutePrivate isAutenticate={isAutenticated}>
                                <PaymentsManagerPage />
                            </RoutePrivate>
                        }
                    />
                    <Route path="*" element={<NotFound404 />} />
                </Routes>
            </main>

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
                            <Link className='nav-link' to={`/usuarios/${id}`} onClick={() => setMenuSidebar(false)}>
                                Gestión de aluimnos
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
                            <Link className='nav-link' to={`/planificator/${id}`} onClick={() => setMenuSidebar(false)}>
                                Planificador
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
                    {isAutenticated && !isAdmin() && (
                         <li className="list-group-item">
                            <Link className={`nav-link ${location.pathname === `/anuncios/${id}` && 'active'}`} to={`/anuncios/`} onClick={() => setMenuSidebar(false)}>
                                Ver anuncios
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
                    {isAutenticated && showInstallButton && (
                        <li className="nav-item aaa mt-3" onClick={handleInstallClick}>
                            <Link className='nav-link'>
                                <IconButton aria-label="descargar" className="text-light" onClick={handleInstallClick}>
                                    <DownloadIcon className="me-1" />
                                </IconButton>
                                Descargar TOM
                            </Link>
                        </li>
                    )}
                </ul>
            </Sidebar>

            <footer className={`container-fluid colorMainAll`}>
                <div className={`row marginSidebarClosed`}>
                    <ul className="text-center">
                        <li className="text-light py-2">TOM</li>
                    </ul>
                    <p className='m-0 text-light text-center py-2'>
                        &copy; 2022 | TOM
                    </p>
                </div>
            </footer>

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

            {pendingAnnouncements.length > 0 && pendingAnnouncements[currentAnnouncementIndex] && (
                <div className='row justify-content-center'>

                    <Dialog
                    header={pendingAnnouncements[currentAnnouncementIndex].title}
                    visible={showAnnouncementDialog}
                    onHide={handleDismissAnnouncement}
                    className='col-10 col-lg-6'
                    footer={
                        <button
                        className='btn btn-primary mt-3'
                        onClick={handleDismissAnnouncement}
                        autoFocus
                        >Entendido</button>
                    }
                    >
                    {/* Texto con saltos de línea */}
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {pendingAnnouncements[currentAnnouncementIndex].message}
                    </p>

                    {/* Links como botones */}
                    {pendingAnnouncements[currentAnnouncementIndex].link_urls?.length > 0 && (
                        <div className="mt-3 d-flex flex-column gap-2">
                        {pendingAnnouncements[currentAnnouncementIndex].link_urls.map((link, idx, arr) => (
                            <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary"
                            >
                            {arr.length === 1 ? "Ver link" : `Ver link ${idx + 1}`}
                            </a>
                        ))}
                        </div>
                    )}
                    </Dialog>
                
                </div>

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
