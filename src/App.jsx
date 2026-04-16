import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import React, { useState, useEffect, useMemo } from 'react'

import * as UserService from './services/users.services.js'
import * as authService from "./services/auth.services.js"

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

import BibliotecExercises from './pages/coach/BibliotecExercises.jsx'
import QrLogin from './pages/login/QrLogin.jsx'

import DownloadIcon from '@mui/icons-material/Download';
import IconButton from "@mui/material/IconButton";
import { Checkbox, FormControlLabel } from '@mui/material';
import Switch from '@mui/material/Switch';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useColor } from './components/Context/ColorContext.jsx';
import { Sidebar } from 'primereact/sidebar';
import Spinner from 'react-bootstrap/Spinner';
import { registerServiceWorker } from './serviceWorkerRegistration.js';
import { ToastContainer, toast } from 'react-toastify';
import { Dialog } from "primereact/dialog";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotFound404 from './pages/NotFound404.jsx'
import ParDetailsPage from './pages/coach/ParDetailsPage.jsx'
import UserAnnouncementsPage from './components/UserAnnouncementsPage.jsx'
import PaymentsManagerPage from './pages/coach/PaymentsManagerPage.jsx'

import { AlignJustify, User } from 'lucide-react';

function RoutePrivate({ isAutenticate, children }) {
  return (
    <>
      {isAutenticate ? children : <Navigate to="/login" />}
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation();
  const isCoachDayEditRoute =
    location.pathname.includes("/routine/user/") &&
    location.pathname.includes("/week/") &&
    location.pathname.includes("/day/");

  const id = localStorage.getItem('_id')
  const currentRole = localStorage.getItem('role')

  const [user, setUser] = useState()
  const { color } = useColor();

  const [menuSidebar, setMenuSidebar] = useState(null);
  const [isAutenticated, setIsAutenticated] = useState(null)
  const [isLoading, setIsLoading] = useState(true);

  // --- PWA install ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  // --- Logout dialog ---
  const [openDialogLogout, setOpenDialogLogout] = useState(false);

  // --- Announcements ---
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  // =========================================================
  //  NUEVO: Mobile + Dark mode (solo NO-admin + mobile)
  // =========================================================
  const MOBILE_BREAKPOINT_PX = 991; // bootstrap lg-1 aprox (navbar colapsa < 992)

  const getInitialMobileDarkMode = () => {
    return localStorage.getItem('mobileDarkMode') === 'true';
  };

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
  });

  const [mobileDarkMode, setMobileDarkMode] = useState(getInitialMobileDarkMode);

  function isAdmin() {
    const admin = localStorage.getItem('role')
    return admin === 'admin'
  }

  const shouldEnableMobileDarkUI = useMemo(() => {
    return Boolean(isAutenticated) && !isAdmin() && isMobile;
  }, [isAutenticated, isMobile, location.pathname]); // pathname para re-evaluar al navegar (rol/auth en LS)

  const applyMobileDarkMode = (enabled) => {
    // Guardar preferencia
    localStorage.setItem('mobileDarkMode', enabled ? 'true' : 'false');

    // Marca global para CSS / otros componentes
    document.documentElement.dataset.theme = enabled ? 'dark' : 'light';
    document.body.classList.toggle('mobile-dark-mode', enabled);

    // Ajustes minimos de estilo global (sin tocar tu CSS)
    // Nota: solo aplicamos estilos si corresponde (NO-admin + mobile)
    if (enabled) {
      document.body.style.backgroundColor = '#041324';
      document.body.style.color = '#e6e6e6';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }

    // Evento global para que otros componentes puedan escuchar cambios
    window.dispatchEvent(new Event('mobileDarkModeChange'));
  };

  const toggleMobileDarkMode = () => {
    const next = !mobileDarkMode;
    setMobileDarkMode(next);
  };

  // Detectar mobile por resize / media query
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);

    const onChange = (e) => setIsMobile(e.matches);
    // compat: addEventListener newer, addListener older
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);

    setIsMobile(mql.matches);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
  if (
    !isLoadingAnnouncements &&
    pendingAnnouncements.length > 0 &&
    location.pathname !== '/anuncios'
  ) {
    setShowAnnouncementDialog(true);
  }
}, [pendingAnnouncements, isLoadingAnnouncements, location.pathname]);

  // Aplicar modo oscuro solo cuando corresponda (NO-admin + mobile).
  // Si deja de corresponder (pasa ? desktop o admin), lo desactivamos visualmente.
  useEffect(() => {
    if (!shouldEnableMobileDarkUI) {
      // Limpieza visual (sin borrar preferencia)
      document.documentElement.dataset.theme = 'light';
      document.body.classList.remove('mobile-dark-mode');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      return;
    }
    applyMobileDarkMode(mobileDarkMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldEnableMobileDarkUI, mobileDarkMode]);

  // =========================================================

  // ---- Helpers de ruta ----
  const normalizePath = (p) => (p || '/').replace(/\/+$/,''); // sin barra final

  const hasUserContext = (pathname) => {
    const p = normalizePath(pathname);
    return /^\/user\/routine\/[^/]+\/[^/]+$/i.test(p)
      || /^\/routine\/user\/[^/]+\/week\/[^/]+\/day\/[^/]+\/[^/]+$/i.test(p);
  };

  const getUsernameFromUrl = (pathname) => {
    if (!hasUserContext(pathname)) return null;
    const last = normalizePath(pathname).split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : null;
  };

  const isExcludedForUserTitle = (pathname) => {
    const p = normalizePath(pathname);
    if (p.startsWith(`/usuarios/${id}`)) return true;
    if (p === '/personalize') return true;
    if (p.startsWith('/exercises')) return true;
    if (p.startsWith(`/planificator/${id}`)) return true;
    return false;
  };

  const currentUsername = getUsernameFromUrl(location.pathname);
  const inUserContext = hasUserContext(location.pathname);
  const excludedForTitle = isExcludedForUserTitle(location.pathname);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Listener PWA correctamente limpiado
  useEffect(() => {
    if (!isAutenticated) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const isCheckboxChecked = localStorage.getItem('noShowPopup') ?? 'false';
      if (isCheckboxChecked === 'false') {
        setShowInstallPopup(true);
      }
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [isAutenticated]);

 useEffect(() => {
  let isMounted = true;

  const fetchAnnouncements = async () => {
    if (!isAutenticated || !id || currentRole === 'admin') {
      if (!isMounted) return;
      setPendingAnnouncements([]);
      setCurrentAnnouncementIndex(0);
      setShowAnnouncementDialog(false);
      return;
    }

    // Evita reabrir popup cuando el usuario ya esta en la pantalla de anuncios
    if (location.pathname === '/anuncios') {
      if (!isMounted) return;
      setShowAnnouncementDialog(false);
      return;
    }

    try {
      setIsLoadingAnnouncements(true);

      // El backend ya resuelve visibilidad y estado de lectura.
      const pending = await UserService.getUnreadAnnouncements(id);

      if (!isMounted) return;

      setPendingAnnouncements(Array.isArray(pending) ? pending : []);
      setCurrentAnnouncementIndex(0);
      setShowAnnouncementDialog((pending?.length || 0) > 0);
    } catch (err) {
      console.error('Error buscando anuncios:', err);

      if (!isMounted) return;
      setPendingAnnouncements([]);
      setCurrentAnnouncementIndex(0);
      setShowAnnouncementDialog(false);
    } finally {
      if (isMounted) setIsLoadingAnnouncements(false);
    }
  };

  fetchAnnouncements();

  return () => {
    isMounted = false;
  };
}, [isAutenticated, id, currentRole, location.pathname]);

const handleDismissAnnouncement = async () => {
  const currentAnnouncement = pendingAnnouncements[currentAnnouncementIndex];
  if (!currentAnnouncement) return;

  try {
    await UserService.markAnnouncementRead(currentAnnouncement._id, id);

    const updatedAnnouncements = pendingAnnouncements.filter(
      (_, index) => index !== currentAnnouncementIndex
    );

    setPendingAnnouncements(updatedAnnouncements);

    if (updatedAnnouncements.length === 0) {
      setCurrentAnnouncementIndex(0);
      setShowAnnouncementDialog(false);
      return;
    }

    const nextIndex =
      currentAnnouncementIndex >= updatedAnnouncements.length
        ? updatedAnnouncements.length - 1
        : currentAnnouncementIndex;

    setCurrentAnnouncementIndex(nextIndex);
  } catch (err) {
    console.error('Error marcando anuncio como leido:', err);
    toast.error('No se pudo actualizar el anuncio. Intenta nuevamente.');
  }
};

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setShowInstallPopup(false);
    }
  };

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    localStorage.setItem('noShowPopup', isChecked.toString());
    setShowInstallPopup(!isChecked);
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
        autoClose: false,
        position: "bottom-center"
      }
    );
  };

  useEffect(() => {
    if (showInstallPopup) showInstallToast();
  }, [showInstallPopup]);

  // Auth init
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAutenticated(true)
      registerServiceWorker()
    } else {
      setIsAutenticated(false)
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      if (!localStorage.getItem('token')) return;

      setOpenDialogLogout(false);
      setMenuSidebar(false);
      setIsAutenticated(false);

      document.documentElement.dataset.theme = 'light';
      document.body.classList.remove('mobile-dark-mode');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';

      localStorage.clear();
      toast.info('Tu sesion expiro. Volve a iniciar sesion.', {
        position: 'bottom-center',
        autoClose: 2500,
        hideProgressBar: true,
      });
      navigate('/login');
    };

    window.addEventListener('tom-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('tom-auth-expired', handleAuthExpired);
  }, [navigate]);

  // ---- Title dinamico (solo en contexto de usuario y no excluido) ----
  useEffect(() => {
    const baseTitle = "TOM - Planificacion digital";
    if (inUserContext && currentUsername && !excludedForTitle) {
      document.title = `TOM - ${currentUsername}`;
    } else {
      document.title = baseTitle;
    }
  }, [inUserContext, currentUsername, excludedForTitle]);

  async function onLogin(user, token) {
    setUser(user);
    setIsAutenticated(true);

    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('_id', user._id);
    localStorage.setItem('name', user.name);

    localStorage.setItem('noShowPopup', 'false');
    if (user.drive != undefined) localStorage.setItem('drive', user.drive);

    localStorage.setItem('email', user.email);
    localStorage.setItem('entrenador_id', user.entrenador_id);
    localStorage.setItem('logo', user.logo);
    localStorage.setItem('color', user.color || '#1a1a1a');
    localStorage.setItem('textColor', user.textColor || false);

    if (user.role !== 'admin') {
      const paidState = user?.payment_info?.isPaid;
      if (paidState === null || paidState === undefined) {
        localStorage.removeItem('state');
      } else {
        localStorage.setItem('state', String(paidState));
      }
    }

    // Si NO es admin, dejamos la preferencia de darkmode tal cual estaba en localStorage
    // (si queres que al login siempre arranque en light en mobile, aca podrias setearlo)
    navigate(`/`);
  }

  function onLogout() {
    setOpenDialogLogout(false)
    setIsAutenticated(false)

    // Limpieza visual de tema
    document.documentElement.dataset.theme = 'light';
    document.body.classList.remove('mobile-dark-mode');
    document.body.style.backgroundColor = '';
    document.body.style.color = '';

    localStorage.clear();
    authService.logout()
    setMenuSidebar(false)
    navigate('/')
  }

  const handleMenuSidebarOpen = () => setMenuSidebar(true);
  const handleMenuSidebarHide = () => setMenuSidebar(false);

  // Layout de carga
  if (isLoading) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <nav className={`navbar navbar-expand-lg navbar-dark fixed-top `}
            style={{ backgroundColor: "#041324" }}>
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">TOM</Link>
              <button className="navbar-toggler text-light " type="button" onClick={handleMenuSidebarOpen}>
                <AlignJustify />
              </button>
              <div className="collapse navbar-collapse justify-content-end" id="navbarNav" />
            </div>
          </nav>

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

          <footer className="footer empty-footer" style={{ height: "150px", backgroundColor: "#041324" }} />
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
          header="Sesion"
          visible={openDialogLogout}
          onHide={() => setOpenDialogLogout(false)}
        >
          <div className="row justify-content-center">
            <div className="p-field">
              <p>Estas seguro que deseas cerrar sesion?</p>
            </div>
            <div className="p-field text-end">
              <button className="btn btn-danger mx-2 mt-2" onClick={onLogout}>
                Cerrar sesion
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
      <nav className={`navbar navbar-expand-lg colorMainAll text-light fixed-top `}>
        <div className="container-fluid">
          {(((isAdmin() && (location.pathname == '/' || location.pathname == `/users/${id}`)) || !isAdmin())) ?
            <a className="navbar-brand text-light btn btn-outline-light border me-2 ms-3 font1Em " href={`/`}>TOM</a> :
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline-light border me-2 ms-3"
            >
              <User className="me-2" /> {inUserContext && currentUsername ? currentUsername : 'Atras'}
            </button>
          }

          {isAdmin() && location.pathname != '/' && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline-light border "
            >
              <ArrowBackIcon className="me-2" /> Atras
            </button>
          )}

          {/* NUEVO: Switch darkmode (solo NO-admin + mobile) al lado del hamburguesa */}
          {shouldEnableMobileDarkUI && (
            <div className="d-flex align-items-center ms-2">
              <IconButton
                aria-label="toggle dark mode"
                onClick={toggleMobileDarkMode}
                className="text-light"
                size="small"
              >
                {mobileDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>

              <Switch
                checked={mobileDarkMode}
                onChange={toggleMobileDarkMode}
                inputProps={{ 'aria-label': 'mobile dark mode switch' }}
              />
            </div>
          )}

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
                  <Link className={`nav-link text-light ${location.pathname === `/personalize/` && 'active'}`} to={`/personalize/`}>
                    Planes
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
                  <Link className={`nav-link text-light ${location.pathname === `/anuncios` && 'active'}`} to={`/anuncios`}>
                    Ver anuncios
                  </Link>
                </li>
              )}

              {!isAutenticated && (
                <li className="nav-item">
                  <Link className={`nav-link text-light ${location.pathname === `/login` && 'active'}`} to={"/login"}>
                    Iniciar sesion
                  </Link>
                </li>
              )}

              {isAutenticated && (
                <li className="nav-item m-auto ">
                  <button className="nav-link text-light btn btn-link p-0" onClick={onLogout}>
                    Cerrar sesion
                  </button>
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

      <main
        className={isCoachDayEditRoute ? "appMainCoachDayEdit" : ""}
        style={location.pathname !== `/` ? {
          marginTop: "0",
          minHeight: "calc(100vh - 96px)",
          boxSizing: "border-box",
          paddingTop: "70px",
          paddingRight: isCoachDayEditRoute ? "0" : "0.4rem",
          paddingBottom: isCoachDayEditRoute ? "0" : "0.4rem",
          paddingLeft: isCoachDayEditRoute ? "0" : "0.4rem",
          backgroundColor: isCoachDayEditRoute ? "#ffffff" : "transparent",
          overflowX: "hidden"
        } : { padding: "0" }}
      >
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
                Gestion de alumnos
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
                Planes
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
              <Link className={`nav-link ${location.pathname === `/anuncios` && 'active'}`} to={`/anuncios`} onClick={() => setMenuSidebar(false)}>
                Ver anuncios
              </Link>
            </li>
          )}

          {!isAutenticated && (
            <li className="list-group-item">
              <Link className='nav-link' to={"/login"} onClick={() => setMenuSidebar(false)}>
                Iniciar sesion
              </Link>
            </li>
          )}

          {isAutenticated && (
            <li className="list-group-item">
              <button className='nav-link btn btn-link p-0' onClick={onLogout}>
                Cerrar sesion
              </button>
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
        header="Sesion"
        visible={openDialogLogout}
        onHide={() => setOpenDialogLogout(false)}
      >
        <div className="row justify-content-center">
          <div className="p-field">
            <p>Estas seguro que deseas cerrar sesion?</p>
          </div>
          <div className="p-field text-end">
            <button className="btn btn-danger mx-2 mt-2" onClick={onLogout}>
              Cerrar sesion
            </button>
            <button className="btn btn-secondary mx-2 mt-2" onClick={() => setOpenDialogLogout(false)}>
              Cancelar
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        header={pendingAnnouncements[currentAnnouncementIndex]?.title}
        visible={showAnnouncementDialog}
        onHide={() => setShowAnnouncementDialog(false)}
        className='col-10 col-lg-6 text-light '
        footer={
          <button
            className='btn btn-primary mt-3'
            onClick={handleDismissAnnouncement}
            autoFocus
          >
            Entendido
          </button>
        }
      >
        <p className='text-dark' style={{ whiteSpace: 'pre-line' }}>
          {pendingAnnouncements[currentAnnouncementIndex]?.message}
        </p>

        {(pendingAnnouncements[currentAnnouncementIndex]?.link_urls?.length || 0) > 0 && (
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

