import { useEffect, useState, useRef, useCallback } from "react";
import { Fragment } from 'react';

import { Link, useParams } from "react-router-dom";
import { ToastContainer } from './../../helpers/notify.js';

import * as WeekService from "../../services/week.services.js";

import Logo from "../../components/Logo.jsx";
import EditExercise from '../../components/EditExercise.jsx';
import Contador from "../../helpers/Contador.jsx";
import Floating from "../../helpers/Floating.jsx";


import ReactPlayer from 'react-player';
import * as _ from "lodash";

import { Carousel } from 'primereact/carousel';
import { Sidebar } from 'primereact/sidebar';
import { Segmented } from 'antd';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

import YouTubeIcon from '@mui/icons-material/YouTube';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PercentIcon from '@mui/icons-material/Percent';
import PercentageCalculator from "../../components/PercentageCalculator.jsx";




//QUE PUEDA SER PERSONALIZABLE PARA CADA ENTRENADOR

//Crear botón que permita actualizar y luego de confirmar??? (thomas)

//Confirmación al escribir de eliminación de usuario

function DayDetailsPage() {
    const { id, week_id, index } = useParams();
    const op = useRef(null);

    const [day_id, setDay_id] = useState()                                  // Carga del array principal de ejercicios
    const [allDays, setAllDays] = useState([]) 
    const [modifiedDay, setModifiedDay] = useState([])                  // Array donde se copia la nueva rutina
    const [nameWeek, setNameWeek] = useState();
    const [status, setStatus] = useState()

    const lastDay = parseInt(localStorage.getItem("LastDay"));

    const [currentDay, setCurrentDay] = useState(null);


    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))

    const [editExerciseMobile, setEditExerciseMobile] = useState(false);        // Modal para canvas de edit exercises


    const [completeExercise, setCompleteExercise] = useState()                  // Futuro uso para editar la semana
    const [showCalculator, setShowCalculator] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Crear refs para las cards
    const cardRefs = useRef([]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
      };



      // Función para alternar la visibilidad de la calculadora
      const toggleCalculator = () => {
        setShowCalculator(!showCalculator);
      };

    useEffect(() => {
        WeekService.findRoutineByUserId(id).then((data) => {

            console.log(data[index].routine[0].exercises)

            setAllDays(data[index].routine)
            setNameWeek(data[index].name)
            if (!lastDay || isNaN(lastDay) || lastDay >= data[index].routine.length) {
                setCurrentDay(0);
                setModifiedDay(data[index].routine[0].exercises)
                setDay_id(data[index].routine[0]._id)
            } else{
                setCurrentDay(lastDay);
                setDay_id(data[index].routine[lastDay]._id)
                setModifiedDay(data[index].routine[lastDay].exercises)

            }

                
        });
    }, [status]);




    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, {
            threshold: 0.1,
        });
    
        // Solo observa cuando ref existe
        cardRefs.current.forEach(ref => {
            if (ref) {
                observer.observe(ref);
            }
        });
    
        return () => {
            cardRefs.current.forEach(ref => {
                if (ref) {
                    observer.unobserve(ref);
                }
            });
        };
    }, [modifiedDay, currentDay]);


    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };

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
        console.log(object)
        setSelectedObject(object);
        setVisible(true);
      };

      const [indexOfExercise, setIndexOfExercise] = useState()
    
    const refresh = (refresh) => {
        setStatus(false)
    }

    
    const hideDialogEditExercises = () => {
        setEditExerciseMobile(false)
    }
    
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
   


  const responsiveOptions = [
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
];



const productTemplate = useCallback((exercise) => {
    return (
        <div className="border-1 surface-border border-round m-2  mb-0 text-center py-3 ">
            <div>
                <span>{exercise.numberWarmup}</span>
                <h4 className="">{exercise.name}</h4>
                <p className="">{exercise.sets} series x {exercise.reps} repeticiones</p>
                <p>{exercise.peso}</p>
                <p>{exercise.rest}</p>
                    {exercise.notas  && 
                    <div>
                                        
                        <p className="titleObservaciones">Observaciones</p>
                        <p className="paraphObservaciones">{exercise.notas}</p>
                    </div>}

                <div className="">
                    <IconButton aria-label="video" className="p-0 " disabled={exercise.video == null || exercise.video == ''}  onClick={() => handleButtonClick(exercise)} >
                        <YouTubeIcon  className={exercise.video != null || exercise.video != '' ? 'ytColor-disabled' : ' ytColor'} />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}, []);

// Nueva función handleDayChange
const handleDayChange = (value) => {
    console.log(value)
    const actualDay = allDays.find(item => item.name === value);
    const index = allDays.findIndex(item => item._id === actualDay._id);

    setModifiedDay(actualDay.exercises);
    localStorage.setItem("LastDay", index);
    localStorage.setItem("LastDayName", actualDay.name);

    setCurrentDay(index);
    setDay_id(allDays[index]._id);
};


    return (

        <>
        <div className="container-fluid p-0">
        <Logo />

        </div>


        <section className="container-fluid">
         
            <h2 className="my-5 text-center">{nameWeek}</h2>

            <div className="text-center">
                <Segmented
                    options={allDays.map((dia) => (dia.name))}
                    className="stylesSegmented"
                    defaultValue={localStorage.getItem('LastDayName') == undefined  ? 'Día 1' : localStorage.getItem('LastDayName') }
                    onChange={handleDayChange}
                />
            </div>
            {currentDay !== null && 
            <div className="row justify-content-center align-items-center text-center m-0 px-0 my-5">
    
                    <h2 className="text-center mb-4">{allDays[currentDay].name}</h2>
                    {allDays[currentDay].warmup != null ? 
                    

                        <div className="card ">
                            <h3 className="mt-3">Entrada en calor</h3>
                            <Carousel className="mx-0" value={allDays[currentDay].warmup}  numVisible={1} numScroll={1} responsiveOptions={responsiveOptions} itemTemplate={productTemplate} />
                        </div> : 
                        
                        <p>No hay entrada en calor para este día.</p>
                    }
                      
                        

            <div className="row justify-content-center text-center">
                <h2 className="mt-4">Rutina del día</h2>

                                {allDays[currentDay].exercises.map((element, index) => {
                                    const animationClass = index % 3 === 0
                                    ? 'from-left'
                                    : index % 3 === 1
                                    ? 'from-center'
                                    : 'from-right';

                                    


                                    return(
                                    <Fragment key={element.exercise_id}>
                                    
                                    {element.type == 'exercise' ?
                                    
                                    (<Card 
                                        key={element.exercise_id}
                                        ref={(el) => (cardRefs.current[index] = el)}  // Referencia de cada card
                                        className={`my-3 cardShadow titleCard box ${animationClass}`} 
                                    >
                                        <CardHeader 
                                        avatar={
                                            
                                            <Avatar aria-label="recipe" className="avatarSize avatarColor">
                                                
                                            {element.numberExercise}
                                            </Avatar>
                                        }
                                        action={
                                            <Avatar aria-label="recipe" className="avatarSize bg-dark me-1 mt-1 p-1">
                                            <Contador className={'p-2'}  max={element.sets} />
                                            </Avatar>
                                        }
                                        title={element.name}
                                        />

                                        <CardContent className="p-0">

                                        
                                    <div className="card border-0">
                                        <table className="table border-0">
                                            <thead >
                                            <tr className="border-0">
                                                <th className="border-0">Series</th>
                                                <th className="border-0">Reps</th>
                                                <th className="border-0">Peso</th>
                                                <th className="border-0">Descanso</th>
                                            </tr>
                                            </thead>
                                            <tbody className="border-0">
                                            <tr className="border-0">
                                                <td className="border-0">{element.sets}</td>
                                                <td className="border-0">{element.reps}</td>
                                                <td className="border-0">{element.peso}</td>
                                                <td className="border-0">{element.rest}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        </div>
                                        {element.notas  && <div >
                                            
                                            <p className="titleObservaciones">Observaciones</p>
                                            <p className="paraphObservaciones">{element.notas}</p>
                                        </div>}
                                        </CardContent>
                                        <CardActions  className="p-0 row justify-content-between" >
                                            <IconButton aria-label="video" className="p-0 col-3 mb-2" disabled={element.video == null || element.video == ''}  onClick={() => handleButtonClick(element)} >
                                                <YouTubeIcon  className={element.video == null || element.video == "" ? 'ytColor-disabled' : ' ytColor'} />
                                            </IconButton>
                                            <IconButton aria-label="video" className="p-0 col-3 mb-2" onClick={() => element.type != 'exercise' ? 
                                            handleShowEditCircuit(
                                                element.exercise_id, 
                                                element.type, 
                                                element.typeOfSets, 
                                                element.circuit, 
                                                element.notas, 
                                                element.numberExercise) : 
                                                
                                            handleEditMobileExercise(element, index)}  >
                                            <EditNoteIcon className="editStyle  p-0"  />

                                            </IconButton>

                                        </CardActions>

                                    </Card> )
                                    :

       
                                     // Referencia de cada card
                                     
                                    (<Card 
                                        key={`circuit-${element.exercise_id}-${index}`}
                                    ref={(el) => (cardRefs.current[index] = el)}
                                    className={`my-3 cardShadow titleCard box ${animationClass}`} > {/*Card actions*/ }
                                    <CardHeader className="me-4 ps-1"
                                    avatar={
                                        
                                        <Avatar aria-label="recipe" className="avatarSize avatarColor">
                                            
                                        {element.numberExercise}
                                        </Avatar>
                                    }

                                    title={element.type}
                                    />

                                    <CardContent className="p-0">

                                    
                                <div className="card border-0">

                                    <p className="border-0"><b>{element.typeOfSets} series</b></p>

                                    <table className="table border-0">
                                        <thead >
                                        <tr className="border-0">
                                            <th className="border-0">Nombre</th>
                                            <th className="border-0">Reps</th>
                                            <th className="border-0">Peso</th>
                                            
                                        </tr>
                                        </thead>

                                        {element.circuit.map((circuit) => (
                                        <tbody key={circuit.idRefresh} className="border-0">
                                            <tr className="border-0">
                                                <td className="border-0">{circuit.name}</td>
                                                <td className="border-0">{circuit.reps}</td>
                                                <td className="border-0">{circuit.peso}</td>
                                            
                                            </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                    </div>
                                    {element.notas  && <div >
                                        
                                        <p className="titleObservaciones">Observaciones</p>
                                        <p className="paraphObservaciones">{element.notas}</p>
                                    </div>}
                                    </CardContent>
                                    <CardActions  className="p-0 row justify-content-center" >
                                        <IconButton aria-label="video" className="p-0 col-3 mb-2" disabled={element.video == null || element.video == ''}  onClick={() => handleButtonClick(element)} >
                                            <YouTubeIcon  className={element.video != null || element.video != '' ? 'ytColor-disabled' : ' ytColor'} />
                                        </IconButton>

                                    </CardActions>

                                    </Card>)

                                    }
                                    </Fragment>
                             
                            )})}

            </div> 
            </div> 
          
            }


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

            
            <div className={`navbar-transition ${showCalculator ? 'Edit-float-button-active' : 'Edit-float-button'}  ${showCalculator ? 'editActive' : 'btn-primary'}`}>
                <IconButton onClick={toggleCalculator}>
                <PercentIcon className={`${showCalculator ? 'text-light' : 'btn-primary'}`} />
                </IconButton>
            </div>

            <Dialog 
            header="Calculadora de Porcentaje"
            visible={showCalculator} 
            style={{ width: '80vw' }} 
            onHide={toggleCalculator}
            draggable={true} // Hacer que el modal sea movible
        >
            <PercentageCalculator />
        </Dialog>

            <Sidebar visible={editExerciseMobile} position="right" onHide={() => hideDialogEditExercises()}>
                <EditExercise  completeExercise={modifiedDay} week_id={week_id} day_id={day_id} indexOfExercise={indexOfExercise} onHide={hideDialogEditExercises} refreshEdit={refresh} isAthlete={true}/>
            </Sidebar>
            <Floating link={`/routine/${id}`}  />
        </section>

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

export default DayDetailsPage;
