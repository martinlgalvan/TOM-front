import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import * as WeekService from "../../services/week.services.js";
import Logo from "../../components/Logo.jsx";

import ReactPlayer from 'react-player';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';

import * as _ from "lodash";

//QUE PUEDA SER PERSONALIZABLE PARA CADA ENTRENADOR

//Crear botón que permita actualizar y luego de confirmar??? (thomas)

//Confirmación al escribir de eliminación de usuario

function DayDetailsPage() {
    const { id } = useParams();
    const { day_id } = useParams();
    const { index } = useParams();

    const [day, setDay] = useState([]);
    const [warmupDay, setWarmupDay] = useState([]);



    useEffect(() => {
        WeekService.findRoutineByUserId(id).then((data) => {
            let indexDay = data[index].routine.findIndex(
                (dia) => dia._id === day_id
            );
            let exercise = data[index].routine[indexDay].exercises;
            let warmup = data[index].routine[indexDay].warmup;

            console.log(exercise);
            setWarmupDay(warmup);
            setDay(exercise);
        });
    }, []);

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
    
    return (
        <section className="container-fluid">
            <Logo />

            <div className="row justify-content-center text-center m-0 px-0 my-5">
                <div className="col-12 col-md-10">
                    <h2 className="text-center mb-4">Entrada en calor</h2>
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
                                                    {exercise.reps} -{" "}
                                                    {exercise.peso}
                                                </span>
                                            </td>
                                            <td></td>
                                            <td></td>
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
                                {day.map((element) => (
                                    <tr key={element.exercise_id}>
                                        <th>{element.numberExercise}</th>
                                        <td>
                                            <span className="responsiveBlock">
                                                {element.name}{" "}
                                            </span>
                                            <span>
                                                {" "}
                                                {element.sets} x {element.reps}{" "}
                                                - {element.peso}
                                            </span>
                                        </td>
                                        <td>
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
                                        </td>
                                        <td>
                                            <button disabled={true}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-journal-text"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                                                    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
                                                    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
                                                </svg>
                                            </button>  
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-center">
                <Link
                    className="btn BlackBGtextWhite text-center my-5"
                    to={"/"}
                >
                    Volver al inicio
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
                        <h3 className="text-center border-top border-bottom py-2">{selectedObject.name}</h3>
                        <p>{selectedObject.notas}</p>
                        <div className="col-12 col-md-6 text-center">
                        <ReactPlayer
                            url={selectedObject.video}
                            controls={true}
                            width="100%"
                            height="400px"
                            config={playerOptions}
                        />
                        </div>

                        </div>
                    )}
                </Sidebar>
            </div>  
        </section>
    );
}

export default DayDetailsPage;
