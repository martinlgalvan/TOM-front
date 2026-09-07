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

import NotFound404 from './pages/NotFound404.jsx'
import ParDetailsPage from './pages/coach/ParDetailsPage.jsx'
import UserAnnouncementsPage from './components/UserAnnouncementsPage.jsx'
import PaymentsManagerPage from './pages/coach/PaymentsManagerPage.jsx'
import TomMeetPage from './pages/competitions/TomMeetPage.jsx'
import NutritionAdminPage from './pages/coach/NutritionAdminPage.jsx'
import { canAccessCompetitions, canAccessNutrition } from './helpers/nutritionAccess.js'
import { applyStoredGeneralSettings } from './helpers/generalSettings.js'

import { AlignJustify, ChevronLeft, LogOut, User } from 'lucide-react';

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
  const hasNutritionAccess = canAccessNutrition({
    id: user?._id || id,
    email: user?.email || localStorage.getItem('email'),
    role: user?.role || currentRole,
  });
  const hasCompetitionsAccess = canAccessCompetitions({
    id: user?._id || id,
    role: user?.role || currentRole,
  });
  const { color } = useColor();

  useEffect(() => {
    applyStoredGeneralSettings(user?._id || id);
  }, [id, user?._id]);

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
  const [dayEditEditorTheme, setDayEditEditorTheme] = useState(() => {
    return localStorage.getItem('dayEditEditorTheme') === 'dark' ? 'dark' : 'light';
  });

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
      // Mismo valor que la superficie de .ddp-dark (rgb(5,11,20)). Antes era
      // #041324, un azul mas claro, y se veia como un marco de otro tono en los
      // bordes donde la seccion no llegaba a cubrir el body.
      document.body.style.backgroundColor = '#050b14';
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

  const toggleDayEditEditorTheme = () => {
    setDayEditEditorTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dayEditEditorTheme', next);
      window.dispatchEvent(new CustomEvent('dayEditEditorThemeChange', { detail: next }));
      return next;
    });
  };

  // El tema tambien puede cambiar fuera de esta ventana: otra pestania del sitio
  // o la aplicacion instalada comparten el mismo localStorage. Sin escuchar ese
  // cambio, la barra se quedaba con el tema viejo mientras el editor abria con el
  // nuevo, y cada pantalla mostraba un tema distinto.
  useEffect(() => {
    const sincronizarTemaExterno = (evento) => {
      // key null es un localStorage.clear() en otra pestania: tambien hay que releer.
      if (evento.key && evento.key !== 'dayEditEditorTheme') return;
      setDayEditEditorTheme(localStorage.getItem('dayEditEditorTheme') === 'dark' ? 'dark' : 'light');
    };

    window.addEventListener('storage', sincronizarTemaExterno);
    return () => window.removeEventListener('storage', sincronizarTemaExterno);
  }, []);

  useEffect(() => {
    // El alumno tambien recibe el atributo. Antes era solo para admin, asi que
    // ninguna de las reglas de tema llegaba a su pantalla: las barras se veian
    // oscuras y el contenido quedaba claro. El nombre del atributo se mantiene
    // porque ya hay reglas escritas contra el.
    if (isAutenticated) {
      document.documentElement.dataset.tomAdminTheme = dayEditEditorTheme;
    } else {
      delete document.documentElement.dataset.tomAdminTheme;
    }
  }, [dayEditEditorTheme, isAutenticated, location.pathname]);

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
    // El fondo del alumno lo decide la MISMA preferencia que usa el entrenador,
    // para no tener dos interruptores de tema conviviendo.
    applyMobileDarkMode(dayEditEditorTheme === 'dark');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldEnableMobileDarkUI, dayEditEditorTheme]);

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
  /* Sin location.pathname: los anuncios son del usuario, no de la ruta. Con la
     ruta en las dependencias se volvian a pedir en cada pantalla que abria el
     alumno. El dialogo se sigue mostrando segun la ruta en el efecto de abajo. */
}, [isAutenticated, id, currentRole]);

const handleDismissAnnouncement = async () => {
  const currentAnnouncement = pendingAnnouncements[currentAnnouncementIndex];
  if (!currentAnnouncement) {
    setShowAnnouncementDialog(false);
    return;
  }

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

  function isJwtExpired(token) {
    if (!token) return true;

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return true;

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
      const payload = JSON.parse(window.atob(padded));

      if (!payload?.exp) return true;
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  function persistSession(userData, token) {
    if (!userData || !token) return;

    setUser(userData);
    setIsAutenticated(true);

    localStorage.setItem('token', token);
    /* Marca de que en este dispositivo hubo sesion alguna vez. Sin esto, la app
       intenta restaurar sesion en cada primera visita y se come un 401. */
    localStorage.setItem('tom-session-seen', '1');
    localStorage.setItem('role', userData.role);
    localStorage.setItem('_id', userData._id);
    localStorage.setItem('name', userData.name);

    if (userData.drive !== undefined) localStorage.setItem('drive', userData.drive);
    else localStorage.removeItem('drive');

    if (userData.email !== undefined) localStorage.setItem('email', userData.email);
    else localStorage.removeItem('email');

    if (userData.entrenador_id !== undefined) localStorage.setItem('entrenador_id', userData.entrenador_id);
    else localStorage.removeItem('entrenador_id');

    if (userData.logo !== undefined) localStorage.setItem('logo', userData.logo);
    else localStorage.removeItem('logo');

    localStorage.setItem('color', userData.color || '#1a1a1a');
    localStorage.setItem('textColor', userData.textColor || false);

    if (userData.role !== 'admin') {
      const paidState = userData?.payment_info?.isPaid;
      if (paidState === null || paidState === undefined) {
        localStorage.removeItem('state');
      } else {
        localStorage.setItem('state', String(paidState));
      }
    }

    registerServiceWorker();
  }

  // Auth init
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token && !isJwtExpired(token)) {
        if (!isMounted) return;
        /* Sesiones abiertas antes de que existiera la marca: se les pone ahora,
           para que al vencer el token puedan restaurarse igual. */
        localStorage.setItem('tom-session-seen', '1');
        setIsAutenticated(true);
        registerServiceWorker();
        setIsLoading(false);
        return;
      }

      /* Sin rastro de sesion previa no hay cookie que canjear: pedir el refresh
         es un viaje perdido y deja un 401 rojo en consola en cada visita. */
      if (!localStorage.getItem('tom-session-seen')) {
        if (isMounted) {
          setIsAutenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const session = await authService.refreshSession();
        if (!isMounted) return;

        if (session?.token && session?.user) {
          persistSession(session.user, session.token);
        } else {
          setIsAutenticated(false);
        }
      } catch (error) {
        console.error('No se pudo restaurar la sesión', error);
        if (isMounted) {
          setIsAutenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
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
      toast.info('Tu sesión expiro. Volvé a iniciar sesión.', {
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
    const baseTitle = "TOM - Planificación digital";
    if (inUserContext && currentUsername && !excludedForTitle) {
      document.title = `TOM - ${currentUsername}`;
    } else {
      document.title = baseTitle;
    }
  }, [inUserContext, currentUsername, excludedForTitle]);

  async function onLogin(user, token) {
    persistSession(user, token);
    localStorage.setItem('noShowPopup', 'false');
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
          header="Sesión"
          visible={openDialogLogout}
          onHide={() => setOpenDialogLogout(false)}
        >
          <div className="row justify-content-center">
            <div className="p-field">
              <p>Estás seguro que deseas cerrar sesión?</p>
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
      <nav className={`navbar navbar-expand-lg colorMainAll text-light fixed-top tomTopNav ${location.pathname === '/' ? 'tomTopNavHome' : ''}`}>
        <div className="container-fluid tomTopNavInner">
          <div className="tomTopNavStart">
            {isAutenticated ? (
              <Link className="tomTopNavAccount" to="/" aria-label="Ir al inicio">
                <span className="tomTopNavAvatar"><User size={13} /></span>
                <span>{localStorage.getItem('name') || 'Usuario'}</span>
              </Link>
            ) : (
              <Link className="tomTopNavAccount" to="/">TOM</Link>
            )}

            {isAutenticated && (
              <button
                type="button"
                className={`tomTopNavEditorThemeBtn is-${dayEditEditorTheme}`}
                onClick={toggleDayEditEditorTheme}
                aria-label={dayEditEditorTheme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {dayEditEditorTheme === 'dark' ? <LightModeIcon fontSize="inherit" /> : <DarkModeIcon fontSize="inherit" />}
                <span>{dayEditEditorTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>
            )}

            {/* "Atras" queda solo del lado del entrenador, que navega mucho entre
                alumno, semanas y dias. En la vista del alumno ocupaba lugar en una
                barra angosta y el gesto del telefono ya cubre volver. */}
            {isAutenticated && isAdmin() && location.pathname !== '/' && (
              <button type="button" onClick={() => navigate(-1)} className="tomTopNavBack">
                <ChevronLeft size={15} />
                <span>Atrás</span>
              </button>
            )}
          </div>

          {/* El sol + switch del alumno se fue: ahora usa la misma pastilla
              "Modo claro / Modo oscuro" que el entrenador, arriba en esta misma
              barra, para que haya un solo control y un solo estado de tema. */}

          <button className="navbar-toggler text-light tomTopNavToggle" type="button" onClick={handleMenuSidebarOpen}>
            <AlignJustify />
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav text-center">
              <li className="nav-item">
                <Link className={`nav-link text-light ${location.pathname === `/` && 'active'}`} to="/">Inicio</Link>
              </li>

              {hasCompetitionsAccess && (
                <li className="nav-item">
                  <Link className={`nav-link text-light ${location.pathname === `/competencias` && 'active'}`} to="/competencias">
                    Competencias
                  </Link>
                </li>
              )}

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

              {hasNutritionAccess && (
                <li className="nav-item">
                  <Link className={`nav-link text-light ${location.pathname === `/nutricion` && 'active'}`} to={`/nutricion`}>
                    Nutricion
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
                <li className="nav-item m-auto">
                  <button className="nav-link btn btn-link tomTopNavLogout" onClick={onLogout}>
                    <LogOut size={14} />
                    <span>Cerrar sesión</span>
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
        className={`${isCoachDayEditRoute ? `appMainCoachDayEdit dayEditAppTheme-${dayEditEditorTheme}` : ""} ${isAutenticated && isAdmin() ? `appAdminTheme-${dayEditEditorTheme}` : ""}`.trim()}
        style={location.pathname !== `/` ? {
          marginTop: "0",
          minHeight: "calc(100vh - 96px)",
          boxSizing: "border-box",
          paddingTop: isCoachDayEditRoute ? "50px" : "70px",
          paddingRight: isCoachDayEditRoute ? "0" : "0.4rem",
          paddingBottom: isCoachDayEditRoute ? "0" : "0.4rem",
          paddingLeft: isCoachDayEditRoute ? "0" : "0.4rem",
          backgroundColor: isCoachDayEditRoute
            ? (dayEditEditorTheme === 'dark' ? "var(--tom-shell-bg-deep, #050b14)" : "#f3f6fb")
            : (isAutenticated && isAdmin() && dayEditEditorTheme === 'dark' ? "var(--tom-shell-bg-deep, #050b14)" : "transparent"),
          overflowX: "hidden"
        } : { padding: "0" }}
      >
        <Routes>
          <Route path="/" element={<HomePage editorTheme={dayEditEditorTheme} />} />
          <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
          <Route path="/qr-login" element={<QrLogin onLogin={onLogin} />} />
          <Route
            path="/competencias"
            element={
              <RoutePrivate isAutenticate={isAutenticated}>
                {hasCompetitionsAccess ? <TomMeetPage /> : <Navigate to="/" replace />}
              </RoutePrivate>
            }
          />

          <Route
            path="/users/:id/"
            element={
              <RoutePrivate isAutenticate={isAutenticated}>
                <UsersListPage editorTheme={dayEditEditorTheme} />
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
                <UserRoutineEditPage editorTheme={dayEditEditorTheme} />
              </RoutePrivate>
            }
          />

          <Route
            path="/routine/user/:id/week/:week_id/day/:day_id/:username"
            element={
              <RoutePrivate isAutenticate={isAutenticated}>
                {/* El editor tenia su propia copia del tema y se desincronizaba
                    de la barra. El tema lo decide App y baja como prop, igual
                    que en las demas pantallas. */}
                <DayEditDetailsPage editorTheme={dayEditEditorTheme} />
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
                <PaymentsManagerPage editorTheme={dayEditEditorTheme} />
              </RoutePrivate>
            }
          />

          <Route
            path="/nutricion"
            element={
              <RoutePrivate isAutenticate={isAutenticated}>
                {hasNutritionAccess ? <NutritionAdminPage /> : <Navigate to="/" replace />}
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

          {hasCompetitionsAccess && (
            <li className="list-group-item">
              <Link className='nav-link' to="/competencias" onClick={() => setMenuSidebar(false)}>
                Competencias
              </Link>
            </li>
          )}

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

          {hasNutritionAccess && (
            <li className="list-group-item">
              <Link className='nav-link' to={`/nutricion`} onClick={() => setMenuSidebar(false)}>
                Nutricion
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

      <footer className={`container-fluid colorMainAll ${isAutenticated && isAdmin() ? `appAdminFooterTheme-${dayEditEditorTheme}` : ""}`}>
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
            <p>Estás seguro que deseas cerrar sesión?</p>
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
        onHide={handleDismissAnnouncement}
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

