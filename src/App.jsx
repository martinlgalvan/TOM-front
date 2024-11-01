
import {useState, useEffect} from 'react'

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

import DatabaseExercises from './pages/coach/DatabaseExercises.jsx'

import * as authService from "./services/auth.services.js"
import { Routes, Route, Link, useNavigate, Navigate} from 'react-router-dom'

import AddColorToUser from './components/Users/AddColorToUser.jsx'
import { useColor } from './components/Context/ColorContext.jsx';
import { Sidebar } from 'primereact/sidebar';
import Spinner from 'react-bootstrap/Spinner';
import Logo from './assets/img/TOM.png'
import { registerServiceWorker } from './serviceWorkerRegistration.js';
import { Checkbox, FormControlLabel } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';

function RoutePrivate( {isAutenticate, children}){
    return (
        <>
            {isAutenticate? children : <Navigate to="/login" />}
        </>
    )
}



function App(){
    const navigate = useNavigate()
    const id = localStorage.getItem('_id')
    const [user, setUser] = useState()
    const { color } = useColor();
    const { textColor } = useColor();
    const [numberUsers, setNumberUsers] = useState()
    const [status, setStatus] = useState()

    const [localColor, setLocalColor] = useState(color)
    const [localTextColor, setLocalTextColor] = useState(textColor)
    const [menuSidebar, setMenuSidebar] = useState(null);


    const [isAutenticated, setIsAutenticated] = useState(null)

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [showInstallPopup, setShowInstallPopup] = useState(false);

    useEffect(() => {
        registerServiceWorker();
      }, []);


      useEffect(() => {
        const isCheckboxChecked = localStorage.getItem('noShowPopup') ;
        if ( isAutenticated) {
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if(isCheckboxChecked ===  'false'){
                setShowInstallPopup(true); // Muestra el popup de instalación
            }
            setShowInstallButton(true); // Muestra el botón solo si es necesario

          });
        }
      
        return () => window.removeEventListener('beforeinstallprompt', () => {});
      }, [isAutenticated]);


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

                    <div className='col-3  text-light'>
                        <IconButton aria-label="download" >
                        <DownloadIcon className='text-light'/>
                        </IconButton>
                    </div>
                    <div className='col-9 m-auto '>
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
            autoClose: false, // Evita que el popup se cierre automáticamente
            position: "bottom-center"
          }
        );
      };


    useEffect(() => {
        if (showInstallPopup) {
            showInstallToast();
        }
    }, [showInstallPopup]);



        useEffect(() => {
            //window.google.translate.disableAutoTranslation();
            const token = localStorage.getItem('token')
            if(token){
                setIsAutenticated(true)
                registerServiceWorker()
                
            } else{
                setIsAutenticated(false)
            }
        }, [user, status])

     
        function onLogin(user, token){
            setUser(user)
            setIsAutenticated(true)
            localStorage.setItem('token', token)
            localStorage.setItem('role', user.role)
            localStorage.setItem('_id', user._id)
            localStorage.setItem('name', user.name)
            localStorage.setItem('noShowPopup', 'false')

            localStorage.setItem('email', user.email)
            localStorage.setItem('entrenador_id', user.entrenador_id)
            localStorage.setItem('logo', user.logo)

            if(user.color == undefined){
                localStorage.setItem('color', '#1a1a1a')
            } else{
                localStorage.setItem('color', user.color)
            }

            if(user.color == undefined){
                localStorage.setItem('textColor', false)
            } else{
                localStorage.setItem('textColor', user.textColor)

            }
            navigate(`/`)
        }


        
    
        function onLogout(){
            
            setIsAutenticated(false)
            localStorage.clear();
            authService.logout()
            setMenuSidebar(false)
            navigate('/')
        }

        if(isAutenticated === null ){
            return (
                <div className="loading-container">
                  <img src={Logo} alt="TOM" className="TOM" />
                  <Spinner animation="border" role="status" className="spinner">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                </div>
              );
        }
    
        function isAdmin(){
            const admin = localStorage.getItem('role')
            if(admin == 'admin'){
                return true
            }else{
                return false
            }
        }

    const handleMenuSidebarOpen = () => {
    setMenuSidebar(true);
  };


  const handleMenuSidebarHide = () => {
    setMenuSidebar(false);
  };

          
    return (

        <>

        <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${textColor == 'false' || !textColor ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }} >
            
            <div className="container-fluid ">
                <a className="navbar-brand " href="/">TOM</a>
                <button className="navbar-toggler " type="button"  onClick={handleMenuSidebarOpen}>
                    <span className="navbar-toggler-icon "></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end  " id="navbarNav">
                    <ul className="navbar-nav text-center ">
                    
                        <li className="nav-item ">
                            <Link className='nav-link ' to="/">Inicio</Link>
                        </li>
                        <li className="nav-item">
                        {isAdmin() && <><Link className='nav-link' to={`/users/${id}`}>Lista de alumnos</Link></>}
                        </li>
                        <li className="nav-item">
                        {isAdmin() && <><Link className='nav-link' to={`/planificator/${id}`}>Planificador</Link></>}
                        </li>
                        <li className="nav-item">
                            {isAdmin() && <><Link className='nav-link' to={`/novedades/`}>Novedades</Link></>}
                        </li>
                        <li className="nav-item">
                            {isAdmin() && <><Link className='nav-link' to={`/personalize/`}>Personalizar</Link></>}
                        </li>
                        <li className="nav-item">
                        {isAutenticated && !isAdmin() && <><Link className='nav-link' to={`/perfil/${id}`}>Perfil</Link></>}
                        </li>
                        <li className="nav-item">
                        {isAutenticated && !isAdmin() && <><Link className='nav-link' to={`/routine/${id}`}>Ver rutina</Link></>}
                        </li>
                        <li className="nav-item">
                        {!isAutenticated && <><Link className='nav-link' to={"/login"}>Iniciar sesión</Link> </>}
                        </li>
                        <li className="nav-item">
                        {isAutenticated && <><Link className='nav-link' onClick={onLogout}>Cerrar sesión</Link> </>}
                        </li>
                        {isAutenticated && showInstallButton && (
                        <li className="nav-item ms-5 aaa" onClick={handleInstallClick}>
                            <Link className='nav-link ' >                         <IconButton
                            aria-label="video"
                            className="p-0"
                            onClick={handleInstallClick}
                        >
                            <DownloadIcon className="me-1" />
                            
                        </IconButton>Descargar TOM</Link>
                        </li> )}
                    </ul>
                </div>
                
            </div>
        </nav>

            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
                
                <Route path="/users/:id/" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <UsersListPage/>
                    </RoutePrivate>}
                />
                    
                <Route path="/exercises/:id" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <DatabaseExercises/>
                    </RoutePrivate>}
                />

                <Route path="/user/routine/:id/:username" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <UserRoutineEditPage/>
                    </RoutePrivate>}
                />

                <Route path="/routine/user/:id/week/:week_id/day/:day_id/:username" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <DayEditDetailsPage/>
                    </RoutePrivate>}
                />

                <Route path="/personalize" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <UserPersonalize/>
                    </RoutePrivate>}
                />

                <Route path="/novedades" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <Novedades/>
                    </RoutePrivate>}
                />

                <Route path="/perfil/:id" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <Profile/>
                    </RoutePrivate>}
                />

                

                <Route path="/routine/:id" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <UserRoutinePage/>
                    </RoutePrivate>}
                />

                <Route path="/routine/:id/day/:day_id/:week_id/:index" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <DayDetailsPage/>
                    </RoutePrivate>}
                />


                <Route path="/planificator/:id" element={
                    <RoutePrivate isAutenticate={isAutenticated}>
                        <RandomizerPage/>
                    </RoutePrivate>}
                />

                <Route path="*" element={<div><h1>404</h1><p>Esta pagina no se encuentra disponible.</p></div>}/>
            </Routes>

        <Sidebar visible={menuSidebar} onHide={handleMenuSidebarHide} blockScroll={true} className="" position="right">

            <ul className="list-group  list-group-flush ulDecoration ">

                <li className="list-group-item ">
                            <Link className='nav-link ' to="/" onClick={() => setMenuSidebar(false)}>Inicio</Link>
                        </li>

                        {isAdmin() && 
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/users/${id}`} onClick={() => setMenuSidebar(false)}>Lista de alumnos</Link>
                        </li>
                        }

                        {isAdmin() && 
                        <li className="list-group-item">
                           <Link className='nav-link' to={`/novedades/`} onClick={() => setMenuSidebar(false)}>Novedades</Link>
                        </li>
                        }
                        
                        {isAdmin() && 
                        <li className="list-group-item">
                           <Link className='nav-link' to={`/personalize/`} onClick={() => setMenuSidebar(false)}>Personalizar</Link>
                        </li>
                        }

                        {isAutenticated && !isAdmin() &&
                            <li className="list-group-item">
                                <Link className='nav-link' to={`/perfil/${id}`} onClick={() => setMenuSidebar(false)}>Perfil</Link>
                            </li>
                        }


                        {isAutenticated && !isAdmin() &&
                        <li className="list-group-item">
                            <Link className='nav-link' to={`/routine/${id}`} onClick={() => setMenuSidebar(false)}>Ver rutina</Link>
                        </li>
                        }
                        
                        {!isAutenticated &&
                        <li className="list-group-item">
                            <Link className='nav-link' to={"/login"} onClick={() => setMenuSidebar(false)}>Iniciar sesión</Link>
                        </li>
                        }
                       
                        {isAutenticated &&
                        <li className="list-group-item">
                            <Link className='nav-link' onClick={onLogout} >Cerrar sesión</Link>
                        </li> 
                        }
                        {isAutenticated && showInstallButton && (
                        <li className="nav-item aaa mt-3" onClick={handleInstallClick}>
                            <Link className='nav-link ' >                         <IconButton
                            aria-label="video"
                            className="text-light"
                            onClick={handleInstallClick}
                        >
                            <DownloadIcon className="me-1" />
                            
                        </IconButton>Descargar TOM</Link>
                        </li> )}
            </ul>
        
        </Sidebar>

        <footer className={`container-fluid ${textColor == 'false' || !textColor ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }} >
            <div className="row">
                <ul className="text-center ">
                    <li className="mt-4">TOM</li>
                    <li className="mt-4">Contacto</li>
                    <li className="mt-4"><a target="_blank" href="#" className=""><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                        </svg></a>
                    </li>
                </ul>

                <p className=" text-center mt-3 ">&copy; 2022 | TOM </p>
            </div>
        </footer>
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
    )
}

export default App