import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import * as WeekService from "../../services/week.services.js";
import Logo from "../../components/Logo.jsx";

import ReactPlayer from 'react-player';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';

import EditExercise from '../../components/EditExercise.jsx';

import * as _ from "lodash";

//QUE PUEDA SER PERSONALIZABLE PARA CADA ENTRENADOR

//Crear botón que permita actualizar y luego de confirmar??? (thomas)

//Confirmación al escribir de eliminación de usuario

function DayDetailsPage() {
    const { id } = useParams();
    const { day_id } = useParams();
    const { week_id } = useParams();
    const { index } = useParams();

    const [day, setDay] = useState([])                                  // Carga del array principal de ejercicios
    const [modifiedDay, setModifiedDay] = useState([])                  // Array donde se copia la nueva rutina
    const [warmupDay, setWarmupDay] = useState([]);
    const [status, setStatus] = useState()

    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))

    const [editExerciseMobile, setEditExerciseMobile] = useState(false);        // Modal para canvas de edit exercises
    const [dayName, setDayName] = useState(false);        // Modal para canvas de edit exercises

    const [completeExercise, setCompleteExercise] = useState()                  // Futuro uso para editar la semana

    function handleEditMobileExercise(elementsExercise){
        setCompleteExercise(elementsExercise)
        setEditExerciseMobile(true)
    }

    useEffect(() => {
        WeekService.findRoutineByUserId(id).then((data) => {
            let indexDay = data[index].routine.findIndex((dia) => dia._id === day_id);
            let exercise = data[index].routine[indexDay].exercises;
            let warmup = data[index].routine[indexDay].warmup;

            setDayName(data[index].routine[indexDay])

            setWarmupDay(warmup);
            setDay(exercise);
            setModifiedDay(exercise);
                
        });
    }, [status]);

    const playerOptions = {
        playerVars: {
          controls: 1, // Oculta los controles de YouTube
          disablekb: 1, // Desactiva el control de teclado
          modestbranding: 1, // Oculta el logotipo de YouTube
          showinfo: 1, // Oculta la información del video
          rel: 1, // No muestra videos relacionados al final
        }}

    const [visible, setVisible] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    
    const handleButtonClick = (object) => {
        setSelectedObject(object);
        setVisible(true);
      };

      const [indexOfExercise, setIndexOfExercise] = useState()
    
      function handleEditMobileExercise(elementsExercise, index){
        setIndexOfExercise(index)
        setCompleteExercise(elementsExercise)
        setEditExerciseMobile(true)
    }

    const refresh = (refresh) => setStatus(refresh)

    
    function handleShowEditCircuit(id, type, typeOfSets, circuit,notas, numberExercise){

        //setShowEditCircuit(true)
        setExercise_id(id)
        setNotasExercise(notas)
        /*setTypeOfSets(typeOfSets)
        setNumberExercise(numberExercise)
        setCircuit(circuit)*/
        setType(type)
        setNotasExercise(notas)

    }    

    function handleEditMobileExercise(elementsExercise, index){
        setIndexOfExercise(index)
        setCompleteExercise(elementsExercise)
        setEditExerciseMobile(true)
    }
   

    return (
        <section className="container-fluid">
            <Logo />

            <div className="row justify-content-center text-center m-0 px-0 my-5">
                <div className="col-12 col-md-10">
                    <h2 className="text-center mb-4">{dayName.name}</h2>
                    <div className="table align-middle">
                        <table className="table table-bordered align-items">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Ejercicio</th>
                                    <th scope="col">#</th>
                                    <th scope="col">#</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warmupDay != null ? (
                                    warmupDay.map((exercise) => (
                                        <tr key={exercise.warmup_id}>
                                            <td>{exercise.numberWarmup}</td>
                                            <td>
                                                <span>{exercise.name}{" "}</span>
                                                <span>
                                                    {exercise.sets} x{" "}
                                                    {exercise.reps} 
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    label="Show OverlayPanel"
                                                    onClick={() => handleButtonClick(exercise)}
                                                    className="btn"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-camera-video"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"
                                                        />
                                                    </svg>
                                                </button></td>
                                            <td>
                                            <button className="backgroundPencil" disabled onClick={() => 
                                                
                                                    
                                                handleEditMobileExercise(element, index)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                </svg>
                                                </button> 
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>
                                            No hay entrada en calor para este
                                            día
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center altoResponsive text-center m-0 p-0">
                <div className="col-12 col-md-10">
                    <div className="table align-middle">
                        <table className="table table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Ejercicio</th>
                                    <th scope="col">#</th>
                                    <th scope="col">#</th>
                                </tr>
                            </thead>

                            <tbody className="">


                                {day.map((element, index) => (
                                    
                                    <tr key={element.exercise_id}>
                                        {element.type == 'exercise' ? 
                                        <>
                                            <th>{element.numberExercise}</th>
                                            <td>
                                                <span className="d-block">
                                                    {element.name}{" "}
                                                </span>
                                                <span className="d-block">{element.sets} <span className="textCreated"> sets x </span>{element.reps} <span className="textCreated"> reps </span>  </span>
                                                <span className="d-block">{element.peso} </span>
                                                <span>{element.rest} de descanso</span>
                                            
                                            </td>
                                            <td>
                                                <button
                                                    label="Show OverlayPanel"
                                                    onClick={() => handleButtonClick(element)}
                                                    className="btn"
                                                    disabled={element.video == ''}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-camera-video"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td>
                                                <button className="backgroundPencil" onClick={() => element.type != 'exercise' ? 
                                                handleShowEditCircuit(
                                                    element.exercise_id, 
                                                    element.type, 
                                                    element.typeOfSets, 
                                                    element.circuit, 
                                                    element.notas, 
                                                    element.numberExercise) : 
                                                    
                                                handleEditMobileExercise(element, index)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                </svg>
                                                </button>  
                                            </td>
                                        </> : 



                                        <>
                                        <th>{element.numberExercise}</th>
                                        <td colSpan={3}>
                                            <table className='table align-middle m-0'>
                                                <thead>
                                                    <tr>
                                                        <th >{element.type} x {element.typeOfSets}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {element.circuit.map(exercise =>
                                                    <tr key={exercise.idRefresh}>

                                                        <td>
                                                            <div className="row justify-content-center">
                                                                <div className="col-9">
                                                                    <span className="d-block">{exercise.name}</span>
                                                                    <span className="d-block">{exercise.sets} 
                                                                        <span className="textCreated"> sets x </span>{exercise.reps} <span className="textCreated"> reps </span>  
                                                                    </span>
                                                                    <span className="d-block">{exercise.peso} </span>
                                                                </div>
                                                                <div className="col-3">
                                                                    <button
                                                                        label="Show OverlayPanel"
                                                                        onClick={() => handleButtonClick(element)}
                                                                        className="btn"
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            fill="currentColor"
                                                                            className="bi bi-camera-video"
                                                                            viewBox="0 0 16 16"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"
                                                                            />
                                                                        </svg>
                                                                    </button>  

                                                                    <button  >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-check-square" viewBox="0 0 16 16">
                                                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                                                        </svg>
                                                                    </button>  
                                                                                                                                        
                                                                </div>
                                                            </div>
                                                        </td>

                                                    </tr>)}
                                                </tbody>
                                            </table>
                                        </td>
                                        
                                        </>}
                                    </tr>                                     
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-center">
                <Link
                    className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} text-center my-5`}
                    style={{ "backgroundColor": `${color}` }}
                    to={`/routine/${id}`}
                >
                    Volver atrás
                </Link>
            </div>

            <div className="row justify-content-center">
                <Sidebar
                    visible={visible}
                    onHide={() => setVisible(false)}
                    position="bottom"
                    className="h-75"
                    >
                    {selectedObject && (
                        <div className="row justify-content-center">
                        <h3 className="text-center border-top border-bottom py-2 mb-2">{selectedObject.name}</h3>
                        <div className="col-12 col-md-6 text-center mt-5">
                        <ReactPlayer
                            url={selectedObject.video}
                            controls={true}
                            width="100%"
                            height="450px"
                            config={playerOptions}
                        />
                        </div>

                        </div>
                    )}
                </Sidebar>
            </div>  

            <Sidebar visible={editExerciseMobile} position="right" onHide={() => {setEditExerciseMobile(false)}}>
                    <EditExercise  completeExercise={modifiedDay} week_id={week_id} day_id={day_id} indexOfExercise={indexOfExercise} refreshEdit={refresh} isAthlete={true}/>
                </Sidebar>
        </section>
    );
}

export default DayDetailsPage;
