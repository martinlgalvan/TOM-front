import Logo from '../components/Logo.jsx';
const name = localStorage.getItem('name')
import { Fieldset } from 'primereact/fieldset';
// to do chequear semántica, ortografía, agregar videos explicativos con edición

function HomePage() {
  return (

<main className="container-fluid">
    
    <Logo />
    
    <div className="row justify-content-center colorFondo">

        <h2 className="my-4 col-12 text-center">¿Que hace nuestra aplicación?</h2>
        <p className="mt-4 mb-5 col-10 col-lg-6 text-center">Digitaliza la planificación del entrenamiento. Tené a todos tus alumnos en un mismo sitio, actualizando su planificación con todas las herramientas necesarias para hacer el trabajo lo más ameno posible. ¿También tenés alumnos online? Te brindamos una base de datos llena de videos explicativos sobre todos los ejercicios básicos del entrenamiento, ¡Con la posibilidad de que subas los tuyos!</p>
    
    </div>

    <h2 className="text-center my-5">Características</h2>

    <div className="card-group">
        <div className="card border-white">
            <div className="card-body text-center">
                
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-bookmark-check text-center mb-2" viewBox="0 0 16 16">
                    <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                </svg>

                <h3 className="card-title">Sencilla y rápida</h3>
                <p className="card-text">Simplificá tu trabajo. Contá con todas las herramientas necesarias para la planificación. Además, contás con una amplia variedad de videos explicativos de ejercicios.</p>
            </div>
        </div>

        <div className="card border-white">
            <div className="card-body text-center">

                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"  className="bi bi-calendar-minus text-center mb-2" viewBox="0 0 16 16">
                    <path d="M5.5 9.5A.5.5 0 0 1 6 9h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>

                <h3 className="card-title">Organización</h3>
                <p className="card-text">Contás con un panel de control de tus alumnos, para ver a todos tus alumnos de la manera más sencilla posible.</p>
            </div>
        </div>

        <div className="card border-white">
            <div className="card-body text-center">

                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-person-circle text-center mb-2" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>

                <h3 className="card-title">Profesionalismo</h3>
                <p className="card-text">Es tu carta de presentación. Llevá tus servicios a otro nivel, y brindales a tus alumnos una aplicación para que tengan la planificación en su celular.</p>
            </div>
        </div>
    </div>

</main>


  )
}


export default HomePage