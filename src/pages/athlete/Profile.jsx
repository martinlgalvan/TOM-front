import { useEffect, useState } from 'react';
import {Link, useParams} from 'react-router-dom';
import { Dialog } from 'primereact/dialog';

import Logo from '../../components/Logo.jsx'
import AddUserProfile from '../../components/AddUserProfile.jsx';

import { ToastContainer, toast } from 'react-toastify';

function Profile(){
    const {id} = useParams()
    const username = localStorage.getItem('name')

    const [visible, setVisible] = useState(false)

    const openDialog = () => {
        setVisible(true);
    };

    const closeDialog = () => {
        setVisible(false);
    };



    return (
        
        <section className='container-fluid'>

            <Logo />

            <div className='row justify-content-center'>

            <h2 className='text-center'>Bienvenido a tu perfil {username}!</h2>
            <p className='text-center my-4'>A continuación, podés editar tus sensaciones de la última semana. <b>Presioná</b> los días de la semana que entrenás e indicá tus sensaciones. Esta información le servirá a tu entrenador para mejorar la calidad de tu entrenamiento.</p>
            <p className='text-center my-4'>Simplemente actualizalo cada semana, tu entrenador sabrá la última vez que actualizaste esto.</p>
            <p className='text-center my-4'>¿No sabes que significa DOMS, NEAT, y demás? Presioná el botón de preguntas frecuentes.</p>
            <button onClick={openDialog} className='btn BlackBGtextWhite col-6 mb-4'>Preguntas frecuentes</button>

            <div>
                <AddUserProfile user_id={id} />
            </div>
              
            </div>

            <Dialog header={`Preguntas Frecuentes`} visible={visible} style={{ width: '90vw' }} modal onHide={closeDialog}>
            <div>
                <div>
                    <h3>¿Qué es la fatiga?</h3>
                    <p>Es la sensación de cansancio, determinada por la disminución del rendimiento deportivo.</p>
                </div>
                <div>
                    <h3>¿Qué es el NEAT?</h3>
                    <p>El NEAT, por sus siglas en inglés, significa non-exercise activity thermogenesis (termogénesis producida por actividad fuera del ejercicio) y se refiere al gasto energético que resulta de todas las acciones, más o menos rutinarias, que no se consideran deportivas, pero que requieren un esfuerzo físico.</p>
                </div>
                <div>
                    <h3>¿Qué son los DOMS?</h3>
                    <p>Los DOMS, o "Agujetas", es la aparición de un tipo de molestia muscular que empieza aproximadamente a las 24 horas después de la realización de un ejercicio.</p>
                </div>
                <div>
                    <h3>¿Qué es el estrés?</h3>
                    <p>El estrés es un sentimiento de tensión física o emocional. Puede provenir de cualquier situación o pensamiento que lo haga sentir a uno frustrado, furioso o nervioso. El estrés es la reacción de su cuerpo a un desafío o demanda. Cada persona tiene un umbral distinto de estrés, por ello, dependiendo la situación por la que se atraviese, lo considerará algo más grave o leve.</p>
                </div>
                <div>
                    <h3>¿Qué es la "alimentación"?</h3>
                    <p>Por alimentación, se refiere a la calidad de alimento que se ingiere, brindando la energía necesaria para entrenar, y ayudar a cumplir los objetivos tanto estéticos como competitivos.</p>
                </div>
            </div>
            </Dialog>

            <ToastContainer
                    position="bottom-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />

        </section>
        
    )
}

export default Profile