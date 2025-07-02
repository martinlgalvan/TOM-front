import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import SettingsIcon from '@mui/icons-material/Settings';
import MessageIcon from '@mui/icons-material/Message';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkIcon from '@mui/icons-material/Work';
import LaptopIcon from '@mui/icons-material/Laptop';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import trainerImg from './../assets/img/entrenador.png'
import alumnoImg from './../assets/img/alumno.jpg'

function HomePage() {
  // Estado para el tipo de usuario
  const [userType, setUserType] = useState(null);
  const [isLoged, setIsLoged] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate()

  // Crear refs únicos para cada card
  const leftRef1 = useRef(null);
  const leftRef2 = useRef(null);
  const rightRef1 = useRef(null);
  const rightRef2 = useRef(null);
  const centerRef1 = useRef(null);
  const centerRef2 = useRef(null);



  useEffect(() => {
    if(localStorage.getItem('role') === 'common'){
      setIsLoged(true)
      setUsername(localStorage.getItem('name'))
    }
  }, [userType]); // Se ejecutará solo cuando `userType` cambie

  
  // Efecto para configurar el IntersectionObserver solo si el usuario es "entrenador"
  useEffect(() => {
    if (userType === 'entrenador') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
            } else {
              entry.target.classList.remove('in-view');
            }
          });
        },
        { threshold: 0.1 }
      );

      // Observando cada ref individualmente
      if (leftRef1.current) observer.observe(leftRef1.current);
      if (leftRef2.current) observer.observe(leftRef2.current);
      if (rightRef1.current) observer.observe(rightRef1.current);
      if (rightRef2.current) observer.observe(rightRef2.current);
      if (centerRef1.current) observer.observe(centerRef1.current);
      if (centerRef2.current) observer.observe(centerRef2.current);

      // Limpiar el observador al desmontar o cambiar de vista
      return () => {
        if (leftRef1.current) observer.unobserve(leftRef1.current);
        if (leftRef2.current) observer.unobserve(leftRef2.current);
        if (rightRef1.current) observer.unobserve(rightRef1.current);
        if (rightRef2.current) observer.unobserve(rightRef2.current);
        if (centerRef1.current) observer.unobserve(centerRef1.current);
        if (centerRef2.current) observer.unobserve(centerRef2.current);
      };
    }
  }, [userType]); // Se ejecutará solo cuando `userType` cambie

  // Función para manejar la selección de tipo de usuario
  const handleUserType = (type) => {
    if(type === 'atleta'){
      if(localStorage.getItem('token')){
        if(localStorage.getItem('role') === 'common'){
          navigate(`/routine/${localStorage.getItem('_id')}`)
          setIsLoged(true)
        } else if(localStorage.getItem('role') === 'admin')
          navigate(`/users/${localStorage.getItem('_id')}`)
      } else{
        navigate('/login')
      }

    } else{
      setUserType(type);
      console.log(type)
    }
  };


  return (
    <>
      <div className='container-fluid mb-4 p-0'>
        <Logo  isHomePage={true} />
      </div>

      <div>
        
      </div>

  
      <main className="container-fluid">
      {!userType ? (
        
        <div className='row justify-content-center text-center'>

                   <div className='col-10 col-lg-5 mt-5 mb-5'>

        <div class="blog-slider bounce-in-right" >
            <div class="flex-blog">

              <div class="blog-slider__img row">
                <IconButton className='text-center' onClick={() => handleUserType('atleta')}>
                  <FitnessCenterIcon className='fs-1 text-light d-block' />
                </IconButton>
              </div>
              <div class="blog-slider__content">
                <div class="blog-slider__title">{isLoged ? `Bienvenido ${username}` : 'Iniciar sesión'}</div>
                <div class="blog-slider__text">{isLoged ? 'Entrá ' : 'Inicia sesión'} y observá la planificación que tu entrenador armó. </div>
                <button  class="blog-slider__button" onClick={() => handleUserType('atleta')}>{isLoged ? 'Ver rutina' : 'Iniciar sesión'}</button>
              </div>
          </div>
        </div>

        </div>

        
          <div className='col-10 col-lg-5  mt-5'>

            <div class="blog-slider bounce-in-left" >

                <div class="flex-blog">

                  <div class="blog-slider__img  row">
                    <IconButton className='text-center' onClick={() => handleUserType('entrenador')}>
                      <LaptopIcon className='fs-1 text-light d-block' />
                    </IconButton>
                  </div>
                  <div class="blog-slider__content ">
                    <div class="blog-slider__title">¿Sos entrenador?</div>
                    <div class="blog-slider__text">Ingresá y mirá las caracteristicas de nuestro software. </div>
                    <button  class="blog-slider__button" onClick={() => handleUserType('entrenador')}>Ver</button>
                  </div>
              </div>
            </div>

          </div>

 

        </div>

      ) : userType === 'entrenador' ? (
        <div>


            <div className="row justify-content-center colorFondo transition-rigth-to-medium">
              <h2 className="my-4 col-12 text-center tipografia-titulos">¿QUE BRINDA NUESTRO SOFTWARE?</h2>
              <p className="mt-4 mb-5 col-10 col-lg-6 text-center">
                Acá vas a encontrar todas las herramientas para <b>gestionar la planificación de tus alumnos.</b> Nuestro software está en continuo desarrollo, codo a codo junto a los entrenadores que la utilizan (podés ser uno), ya que nuestro objetivo es tu <b>comodidad</b>, un software hecho 100% para los entrenadores, para que planificar sea una tarea mucho más <b>sencilla</b>. No nos interesa hacer un software y que cobrés cuotas, o que gestiones turnos, <b>nos interesa que el trabajo que hagas, sea lo más cómodo y profesional posible.</b>
              </p>
            </div>

            <h2 className="text-center my-5 tipografia-titulos">CARACTERÍSTICAS</h2>

            <div className="row justify-content-center">
              <div ref={leftRef1} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-left">
                <div className="card-body text-center">
                  <IconButton>
                    <GroupIcon className='fs-1 colorMainAllText' />
                  </IconButton>
                  <h3 className="card-title tipografia-subtitulos">Gestión de alumnos</h3>
                  <p className="card-text">Contá con un panel de alumnos, donde podés agregar, buscar o eliminar alumnos de forma sencilla.</p>
                </div>
              </div>

              <div ref={centerRef1} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-center">
                <div className="card-body text-center">
                  <IconButton>
                    <LaptopChromebookIcon className='fs-1 colorMainAllText' />
                  </IconButton>
                  <h3 className="card-title tipografia-subtitulos">Planificación</h3>
                  <p className="card-text">Gestioná la planificación de cada alumno, donde podés agregar semanas, e ir guardando el progreso de cada uno.</p>
                </div>
              </div>

              <div ref={rightRef1} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-right">
                <div className="card-body text-center">
                  <IconButton>
                    <SettingsIcon className='fs-1 colorMainAllText' />
                  </IconButton>
                  <h3 className="card-title tipografia-subtitulos">Versatilidad</h3>
                  <p className="card-text">Crea semanas, días, rutinas, tanto como quieras, teniendo la posibilidad de agregar: <b className='d-block'>Entrada en calor - Ejercicios - Circuitos - Super series</b></p>
                </div>
              </div>

              <div ref={leftRef2} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-left">
                <div className="card-body text-center">
                  <IconButton>
                    <MessageIcon className='fs-1 colorMainAllText' />
                  </IconButton>
                  <h3 className="card-title tipografia-subtitulos">Comunicación con tus alumnos</h3>
                  <p className="card-text">Tus alumnos te van a poder comentar sus sensaciones, tanto semanales, como en cada ejercicio.</p>
                </div>
              </div>

              <div ref={centerRef2} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-center">
                <div className="card-body text-center">
                  <IconButton>
                    <MenuBookIcon className='fs-1 colorMainAllText' />
                  </IconButton>
                  <h3 className="card-title tipografia-subtitulos">Biblioteca de ejercicios</h3>
                  <p className="card-text">Accedé a nuestra biblioteca de ejercicios, con subdivisiones en los básicos, y grupo musculares. También podrás cargar la tuya propia.</p>
                </div>
              </div>

              <div ref={rightRef2} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-right">
                <div className="card-body text-center">
                  <IconButton>
                    <WorkIcon className='fs-1 colorMainAllText' />
                  </IconButton>
                  <h3 className="card-title tipografia-subtitulos">Profesionalismo</h3>
                  <p className="card-text">Es tu carta de presentación. Llevá tus servicios a otro nivel, y brindales a tus alumnos un software para que tengan la planificación en su celular.</p>
                </div>
              </div>
            </div>
         
        </div>
      ) : (
        <h2 className="text-center my-5"></h2>
      )}
       </main>
    </>
  );
}

export default HomePage;
