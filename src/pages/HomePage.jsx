import { useEffect, useRef } from 'react';

import Logo from '../components/Logo.jsx';
const name = localStorage.getItem('name');
import { IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import SettingsIcon from '@mui/icons-material/Settings';
import MessageIcon from '@mui/icons-material/Message';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkIcon from '@mui/icons-material/Work';

function HomePage() {
  // Crear refs únicos para cada card
  const leftRef1 = useRef(null);
  const leftRef2 = useRef(null);
  const rightRef1 = useRef(null);
  const rightRef2 = useRef(null);
  const centerRef1 = useRef(null);
  const centerRef2 = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view'); // Remover la clase cuando el elemento sale de la vista
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
  
    // Observando cada ref individualmente
    if (leftRef1.current) observer.observe(leftRef1.current);
    if (leftRef2.current) observer.observe(leftRef2.current);
    if (rightRef1.current) observer.observe(rightRef1.current);
    if (rightRef2.current) observer.observe(rightRef2.current);
    if (centerRef1.current) observer.observe(centerRef1.current);
    if (centerRef2.current) observer.observe(centerRef2.current);
  
    return () => {
      if (leftRef1.current) observer.unobserve(leftRef1.current);
      if (leftRef2.current) observer.unobserve(leftRef2.current);
      if (rightRef1.current) observer.unobserve(rightRef1.current);
      if (rightRef2.current) observer.unobserve(rightRef2.current);
      if (centerRef1.current) observer.unobserve(centerRef1.current);
      if (centerRef2.current) observer.unobserve(centerRef2.current);
    };
  }, []);

  return (
    <>  
      <div className='container-fluid mb-4 p-0'>
        <Logo />
      </div>

      <main className="container-fluid">
        <div className="row justify-content-center colorFondo transition-rigth-to-medium">
          <h2 className="my-4 col-12 text-center tipografia-titulos">¿QUE BRINDA NUESTRO SOFTWARE?</h2>
          <p className="mt-4 mb-5 col-10 col-lg-6 text-center">
            Acá vas a encontrar todas las herramientas para <b>gestionar la planificación de tus alumnos.</b> Nuestro software está en continuo desarrollo, codo a codo junto a los entrenadores que la utilizan (podés ser uno), ya que nuestro objetivo es tu <b>comodidad</b>, un software hecho 100% para los entrenadores, para que planificar sea una tarea mucho más <b>sencilla</b>. No nos interesa que cobrés cuotas, ni que gestiones turnos, <b>nos interesa que el trabajo que hagas, sea lo más cómodo y profesional posible.</b>
          </p>
        </div>

        <h2 className="text-center my-5 tipografia-titulos">CARACTERÍSTICAS</h2>

        <div className="row justify-content-center">
          <div ref={leftRef1} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-left">
            <div className="card-body text-center">
              <IconButton>
                <GroupIcon className='fs-1 color-icons' />
              </IconButton>
              <h3 className="card-title tipografia-subtitulos">Gestión de alumnos</h3>
              <p className="card-text">Contá con un panel de alumnos, donde podés agregar, buscar o eliminar alumnos de forma sencilla.</p>
            </div>
          </div>

          <div ref={centerRef1} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-center">
            <div className="card-body text-center">
              <IconButton>
                <LaptopChromebookIcon className='fs-1 color-icons' />
              </IconButton>
              <h3 className="card-title tipografia-subtitulos">Planificación</h3>
              <p className="card-text">Gestioná la planificación de cada alumno, donde podés agregar semanas, e ir guardando el progreso de cada uno.</p>
            </div>
          </div>

          <div ref={rightRef1} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-right">
            <div className="card-body text-center">
              <IconButton>
                <SettingsIcon className='fs-1 color-icons' />
              </IconButton>
              <h3 className="card-title tipografia-subtitulos">Versatilidad</h3>
              <p className="card-text">Crea semanas, días, rutinas, tanto como quieras, teniendo la posibilidad de agregar: <b className='d-block'>Entrada en calor - Ejercicios - Circuitos - Super series</b></p>
            </div>
          </div>

          <div ref={leftRef2} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-left">
            <div className="card-body text-center">
              <IconButton>
                <MessageIcon className='fs-1 color-icons' />
              </IconButton>
              <h3 className="card-title tipografia-subtitulos">Comunicación con tus alumnos</h3>
              <p className="card-text">Tus alumnos te van a poder comentar sus sensaciones, tanto semanales, como en cada ejercicio.</p>
            </div>
          </div>

          <div ref={centerRef2} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-center">
            <div className="card-body text-center">
              <IconButton>
                <MenuBookIcon className='fs-1 color-icons' />
              </IconButton>
              <h3 className="card-title tipografia-subtitulos">Biblioteca de ejercicios</h3>
              <p className="card-text">Accedé a nuestra biblioteca de ejercicios, con subdivisiones en los básicos, y grupo musculares. También podrás cargar la tuya propia.</p>
            </div>
          </div>

          <div ref={rightRef2} className="card col-10 col-sm-4 col-xl-3 p-2 m-4 shadow box from-right">
            <div className="card-body text-center">
              <IconButton>
                <WorkIcon className='fs-1 color-icons' />
              </IconButton>
              <h3 className="card-title tipografia-subtitulos">Profesionalismo</h3>
              <p className="card-text">Es tu carta de presentación. Llevá tus servicios a otro nivel, y brindales a tus alumnos un software para que tengan la planificación en su celular.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default HomePage;
