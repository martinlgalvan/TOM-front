import Logo from '../../components/Logo.jsx'


function Novedades() {

    return (
        <>
        
        <div className='container-fluid p-0 mb-4'>
            <Logo />
        </div>
        
        <section className='container-fluid'>

            <article className='row justify-content-center'>
                <div className='col-10 col-lg-6 text-center'>

                <h2>Versión actual: 2.3.5</h2>

                </div>

                <div className='row justify-content-center text-start mt-4'>
                    <div className='col-11 col-lg-6'>

                    
                    <p>logs. 29/10/2024</p>
                    <ul className='list-group list-group-flush'>
                        <li className='list-group-item'><b>Arreglo.</b> Ahora los alumnos no notarán más inconsistencias a la hora de editar su planificación</li>
                        <li className='list-group-item'><b>Arreglo.</b> Ya no habrá inconsistencias en la creación de días - entrada en calor</li>
                        <li className='list-group-item'><b>Arreglo.</b> Ahora se guarda correctamente el nombre de la semana al editarse.</li>
                        
                    </ul>
                </div>
                </div>

                <div className='row justify-content-center text-start mt-4'>
                    <div className='col-11 col-lg-6'>

                    
                    <p>logs. 24/10/2024</p>
                    <ul className='list-group list-group-flush'>
                        <li className='list-group-item'><b>Cambios visuales en las **listas de usuarios**</b></li>
                        <li className='list-group-item'><b>Cambio visuales y estructurales en las **semanas**.</b>
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'><b>UX. Se agregó **tiempo de edición**.</b> Ahora podrás ver la última vez que actualizaste la rutina! (No la última vez que se guardó, cuidado con esto). Con respecto a estó, se optó mostrar la última vez que se realizo un cambio, y no la última vez que se guardó, para que los entrenadores sepan si actualizarón esa planificación, sin importar si se guardó o no. Consideramos esto la mejor opción desde el punto de vista de la usabilidad.</li>
                                <li className='list-group-item'><b>Creación, edición, y eliminación</b> de los días ahora se encuentran juntos.</li>
                                <li className='list-group-item'><b>Edición del nombre de la semana.</b> Ahora se encuentra dentro de la semana.</li>
                                <li className='list-group-item'><b>Gestión de días.</b> Ahora se encuentra en la misma pantalla. Ya no tendrás que salir para ingresar a los días de la semana, permitiendo mayor versatilidad a la hora de planificar.</li>
                                <li className='list-group-item'><b>Edición única.</b> Se optimizó la edición, permitiendo editar todo lo que el usuario quiera, con una única confirmación al final, permitiendo mejorar el rendimiento y usabilidad.</li>
                                <li className='list-group-item'><b>UX.</b> Se agregarón ventanas de confirmación, haciendo más dificil equivocarse al apretar un botón.</li>
                                <li className='list-group-item'><b>Circuitos.</b> Mejorá en la creación de circuitos. Ahora se podrá realizar todo en la misma pantalla, sin necesidad de abrir ventanas adicionales.
                                    <ul>
                                        <li>Se solucionaron varios errores que afectaban el funcionamiento correcto a la hora de planificar.</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li className='list-group-item'><b>Entrada en calor</b>
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'><b>Cambio visual y estructural.</b> Se habilitó la edición unica, para seguir con la misma logica.</li>
                            </ul>
                        </li>
                        <li  className='list-group-item'><b>Sección atletas/alumnos</b>
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'><b>Animaciones</b></li>
                                <li className='list-group-item'><b>Calculadora de porcentaje.</b> Se habilitó un widget para los alumnos, para tener a mano una calculadora de porcentaje, facilitandole una herramienta más. ( Aún quedan muchos widgets más por agregar! )</li>
                            </ul>
                        </li>
                        <li className='list-group-item'><b>Modo edición</b>
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'><b>UX-Logica.</b> Se habilito el modo edicion para celular! Ahora podrás editar de manera rápida las series,repeticiones y el peso. Pero en caso de que necesites actualizar cualquier otro campo, basta con apretar el widget en pantalla de edición y ver todos los campos en cada ejercicio!</li>
                                <li className='list-group-item'><b>UX-Logica.</b> Se habilito el modo edición para el circuito. Estos, unicamente se podrán editar con el modo activo.</li>
                            </ul>
                        </li>
                        <li className='list-group-item'><b>Nuevo widget para guardar</b>
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'><b>UX.</b> Ahora tendrás el widget para habilitar los botones de guardar y cancelar. Sigue mantiendo la misma logica, únicamente que ahora, tendrás esa herramienta.</li>
                            </ul>
                        </li>
                        <li className='list-group-item'><b>Nueva biblioteca de ejercicios</b>
                            <ul className='list-group list-group-flush'>
                                <li className='list-group-item'><b>UX.</b> Nueva biblioteca habilitada! Ahora tendrás los ejercicios divididos por los básicos, y grupos musculares, facilitando la busqueda de estos.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                </div>
            </article>
            
        </section>
    </>
    )
}

export default Novedades