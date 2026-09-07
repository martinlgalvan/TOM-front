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

const HOME_STATS = [
  { target: 65, prefix: '+', label: 'Entrenadores' },
  { target: 2000, prefix: '+', label: 'Alumnos' },
  { target: 30000, prefix: '+', label: 'Rutinas creadas' },
  { target: 3, suffix: ' años', label: 'En el mercado' },
];

// Cuenta de 0 al valor final cuando el numero entra en pantalla.
function StatCounter({ target, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          const duration = 1100;
          const start = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="homeInfoStatValue">
      {prefix}{value.toLocaleString('es-AR')}{suffix}
    </span>
  );
}

function HomePage({ editorTheme = 'light' }) {
  // Estado para el tipo de usuario
  const [userType, setUserType] = useState(null);
  const [isLoged, setIsLoged] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate()
  const isDark = editorTheme === 'dark';
  const rootRef = useRef(null);

  useEffect(() => {
    if(localStorage.getItem('role') === 'common'){
      setIsLoged(true)
      setUsername(localStorage.getItem('name'))
    }
  }, [userType]); // Se ejecutara solo cuando `userType` cambie

  // Animacion de entrada al scrollear: cualquier elemento con la clase
  // "reveal" se desvanece hacia adentro la primera vez que entra en pantalla.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = Array.from(root.querySelectorAll('.reveal'));
    if (elements.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [userType]); // Se vuelve a ejecutar cuando cambia la vista (nuevos elementos montados)

  // Funcion para manejar la seleccion de tipo de usuario
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
    }
  };


  return (
    <div ref={rootRef} className={`homeInfoPage homeInfoPage-${isDark ? 'dark' : 'light'}`}>
      <div className='container-fluid p-0 homeInfoHero'>
        <Logo isHomePage={true} editorTheme={editorTheme} />
      </div>

      <section className="homeInfoStats" aria-label="TOM en números">
        <div className="homeInfoStatsGrid">
          {HOME_STATS.map((stat) => (
            <div className="homeInfoStatItem" key={stat.label}>
              <StatCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              <span className="homeInfoStatLabel">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="container-fluid homeInfoMain">
      {!userType ? (

        <div className='row justify-content-center text-center homeInfoChoiceGrid'>

          <div className='col-11 col-md-10 col-lg-5'>

            <div
              className="homeInfoChoiceCard homeInfoChoiceCard-athlete reveal"
              role="button"
              tabIndex={0}
              onClick={() => handleUserType('atleta')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUserType('atleta')}
            >
              <div className="homeInfoChoiceIconWrap">
                <IconButton className='homeInfoChoiceIconButton' onClick={(e) => { e.stopPropagation(); handleUserType('atleta'); }} aria-label="Ingresar como alumno">
                  <FitnessCenterIcon className='homeInfoChoiceIcon' />
                </IconButton>
              </div>
              <div className="homeInfoChoiceContent">
                <span className="homeInfoChoiceEyebrow">Alumno</span>
                <h2>{isLoged ? `Bienvenido ${username}` : 'Iniciar sesión'}</h2>
                <p>{isLoged ? 'Entra ' : 'Inicia sesión'} y observa la planificacion que tu entrenador armo.</p>
                <button className="homeInfoButton" onClick={(e) => { e.stopPropagation(); handleUserType('atleta'); }}>{isLoged ? 'Ver rutina' : 'Iniciar sesión'}</button>
              </div>
            </div>

          </div>

          <div className='col-11 col-md-10 col-lg-5'>
            <div
              className="homeInfoChoiceCard homeInfoChoiceCard-coach reveal"
              role="button"
              tabIndex={0}
              onClick={() => handleUserType('entrenador')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUserType('entrenador')}
            >
              <div className="homeInfoChoiceIconWrap">
                <IconButton className='homeInfoChoiceIconButton' onClick={(e) => { e.stopPropagation(); handleUserType('entrenador'); }} aria-label="Ver información para entrenadores">
                  <LaptopIcon className='homeInfoChoiceIcon' />
                </IconButton>
              </div>
              <div className="homeInfoChoiceContent">
                <span className="homeInfoChoiceEyebrow">Entrenador</span>
                <h2>Sos entrenador?</h2>
                <p>Ingresa y mira las caracteristicas de nuestro software.</p>
                <button className="homeInfoButton" onClick={(e) => { e.stopPropagation(); handleUserType('entrenador'); }}>Ver</button>
              </div>
            </div>
          </div>

        </div>

      ) : userType === 'entrenador' ? (
        <div className="homeInfoTrainer">

            <section className="homeInfoTrainerIntro reveal">
              <span className="homeInfoSectionEyebrow">Software para entrenadores</span>
              <h2>¿QUE BRINDA NUESTRO SOFTWARE?</h2>
              <p>
                Aca vas a encontrar todas las herramientas para <b>gestionar la planificación de tus alumnos.</b> Nuestro software está en continuo desarrollo, codo a codo junto a los entrenadores que la utilizan (podés ser uno), ya que nuestro objetivo es tu <b>comodidad</b>, un software hecho 100% para los entrenadores, para que planificar sea una tarea mucho más <b>sencilla</b>. No nos interesa hacer un software y que cobres cuotas, o que gestiones turnos, <b>nos interesa que el trabajo que hagas, sea lo más cómodo y profesional posible.</b>
              </p>
            </section>

            <section className="homeInfoSteps">
              <div className="homeInfoFeaturesHeader reveal">
                <span className="homeInfoSectionEyebrow">Como funciona</span>
                <h2>EMPEZA EN 3 PASOS</h2>
              </div>

              <div className="row justify-content-center homeInfoStepsGrid">
                <div className="col-11 col-md-10 col-lg-4 homeInfoStepCol">
                  <div className="homeInfoStepCard reveal">
                    <span className="homeInfoStepNumber">01</span>
                    <h3>Carga tu equipo</h3>
                    <p>Suma a tus alumnos a la plataforma y organiza tu panel de trabajo.</p>
                  </div>
                </div>

                <div className="col-11 col-md-10 col-lg-4 homeInfoStepCol">
                  <div className="homeInfoStepCard reveal">
                    <span className="homeInfoStepNumber">02</span>
                    <h3>Diseña la planificación</h3>
                    <p>Arma semanas, días, ejercicios, circuitos y super series a tu medida.</p>
                  </div>
                </div>

                <div className="col-11 col-md-10 col-lg-4 homeInfoStepCol">
                  <div className="homeInfoStepCard reveal">
                    <span className="homeInfoStepNumber">03</span>
                    <h3>Hace seguimiento</h3>
                    <p>Tu alumno accede desde el celular, ve su rutina y te comenta como se sintio.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="homeInfoFeatures">
              <div className="homeInfoFeaturesHeader reveal">
                <span className="homeInfoSectionEyebrow">Caracteristicas</span>
                <h2>CARACTERISTICAS</h2>
              </div>

              <div className="row justify-content-center homeInfoFeatureGrid">
                <div className="col-11 col-sm-6 col-xl-4 homeInfoFeatureCol">
                  <div className="homeInfoFeatureCard reveal">
                    <div className="homeInfoFeatureIcon"><GroupIcon /></div>
                    <h3>Gestion de alumnos</h3>
                    <p>Conta con un panel de alumnos, donde podés agregar, buscar o eliminar alumnos de forma sencilla.</p>
                  </div>
                </div>

                <div className="col-11 col-sm-6 col-xl-4 homeInfoFeatureCol">
                  <div className="homeInfoFeatureCard reveal">
                    <div className="homeInfoFeatureIcon"><LaptopChromebookIcon /></div>
                    <h3>Planificación</h3>
                    <p>Gestiona la planificación de cada alumno, donde podés agregar semanas, e ir guardando el progreso de cada uno.</p>
                  </div>
                </div>

                <div className="col-11 col-sm-6 col-xl-4 homeInfoFeatureCol">
                  <div className="homeInfoFeatureCard reveal">
                    <div className="homeInfoFeatureIcon"><SettingsIcon /></div>
                    <h3>Versatilidad</h3>
                    <p>Crea semanas, días, rutinas, tanto como quieras, teniendo la posibilidad de agregar: <b>Entrada en calor - Ejercicios - Circuitos - Super series</b></p>
                  </div>
                </div>

                <div className="col-11 col-sm-6 col-xl-4 homeInfoFeatureCol">
                  <div className="homeInfoFeatureCard reveal">
                    <div className="homeInfoFeatureIcon"><MessageIcon /></div>
                    <h3>Comunicación con tus alumnos</h3>
                    <p>Tus alumnos te van a poder comentar sus sensaciones, tanto semanales, como en cada ejercicio.</p>
                  </div>
                </div>

                <div className="col-11 col-sm-6 col-xl-4 homeInfoFeatureCol">
                  <div className="homeInfoFeatureCard reveal">
                    <div className="homeInfoFeatureIcon"><MenuBookIcon /></div>
                    <h3>Biblioteca de ejercicios</h3>
                    <p>Accede a nuestra biblioteca de ejercicios, con subdivisiones en los básicos, y grupo musculares. También podrás cargar la tuya propia.</p>
                  </div>
                </div>

                <div className="col-11 col-sm-6 col-xl-4 homeInfoFeatureCol">
                  <div className="homeInfoFeatureCard reveal">
                    <div className="homeInfoFeatureIcon"><WorkIcon /></div>
                    <h3>Profesionalismo</h3>
                    <p>Es tu carta de presentación. Lleva tus servicios a otro nivel, y brindales a tus alumnos un software para que tengan la planificación en su celular.</p>
                  </div>
                </div>
              </div>
            </section>

        </div>
      ) : (
        <h2 className="text-center my-5"></h2>
      )}
       </main>
    </div>
  );
}

export default HomePage;
