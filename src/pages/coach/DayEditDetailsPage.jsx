import { useEffect, useState, useRef } from 'react';
import {Link, useParams} from 'react-router-dom';

import * as ExercisesService from '../../services/exercises.services.js';
import * as WeekService from '../../services/week.services.js'; 
import * as DatabaseExercises from '../../services/jsonExercises.services.js'
import Options from './../../assets/json/options.json';
import * as DatabaseUtils from '../../helpers/variables.js'
import * as Notify from './../../helpers/notify.js'
import * as RefreshFunction from './../../helpers/generateUUID.js'

import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';
import { Sidebar } from 'primereact/sidebar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Dialog } from 'primereact/dialog';
import { ToastContainer } from './../../helpers/notify.js';

import Logo from '../../components/Logo.jsx'
import AddExercise from '../../components/AddExercise.jsx'
import ModalConfirmDeleteExercise from '../../components/Bootstrap/ModalConfirmDeleteExercise.jsx';
import ModalCreateWarmup from '../../components/Bootstrap/ModalCreateWarmup.jsx';
import Formulas from '../../components/Formulas.jsx';
import ModalEditCircuit from '../../components/Bootstrap/ModalEdit/ModalEditCircuit.jsx';
import AddCircuit from '../../components/AddCircuit.jsx';
import CustomInputNumber from '../../components/CustomInputNumber.jsx';
import EditExercise from '../../components/EditExercise.jsx';
import SkeletonExercises from '../../components/Skeleton/SkeletonExercises.jsx';
import Warmup from '../../components/Bootstrap/ModalCreateWarmup.jsx';
import WarmupExercises from '../../components/WarmupExercises.jsx';




// CORREGIR PROBLEMA DEL LENGTH, PASO PORQUE ELIMINE QUE SE CREE AUTOMATICAMENTE UN EXERCISES, PARA QUE LUEGO PUEDA CREAR UN INDEX DEL CAMPO ROUTINE.EXERCISES.EXERCISE_ID
function DayEditDetailsPage(){
    const {week_id} = useParams()
    const {day_id} = useParams()
    const {id} = useParams()
    const {username} = useParams()
    const {numberExercises} = useParams()
    const [firstOpen, setFirstOpen] = useState(true)

    const [status, setStatus] = useState(1)                             // Manejo de renderizado
    const [loading, setLoading] = useState(null)                        // Manejo de renderizado
    const [firstLoading, setFirstLoading] = useState(true)              // Manejo de skeleton
    const [secondLoad, setSecondLoad] = useState()                      // Manejo de skeleton


    const [options, setOptions] = useState()                            // Carga de datos para el select
    const [numberToast, setNumberToast] = useState(0)                   // Manejo del notify


    const [circuit, setCircuit] = useState([])                          // Carga del circuit al modal
    const [day, setDay] = useState([])                                  // Carga del array principal de ejercicios
    const [modifiedDay, setModifiedDay] = useState([])                  // Array donde se copia la nueva rutina


    const [exercise_id, setExercise_id] = useState()                    // Carga edit para el edit y delete de ejercicios
    const [nameExercise, setNameModal] = useState()                     // Carga para el delete 
    const [user_id, setUserId] = useState("")                           // ID del usuario en cuestión

    const [show, setShow] = useState(false)                             // Modal para eliminar ejercicios
    const [showEditCircuit, setShowEditCircuit] = useState(false)       // Modal para editar los circuitos

    const [editExerciseMobile, setEditExerciseMobile] = useState(false);        // Modal para canvas de formulas
    const [warmup, setWarmup] = useState(false);        // Modal para canvas de formulas
    
    const [inputEnFoco, setInputEnFoco] = useState(null);               // Manejo de la edición rápida
    const [confirm, setConfirm] = useState(null);                       // Ver bien para que la usé

    const inputRefs = useRef([]);                                       // Manejo de la edición rápida

    const [notas, setNotasExercise] = useState()                        // Carga de variables para editar el circuito en su modal
    const [numberExercise, setNumberExercise] = useState()              //
    const [typeOfSets, setTypeOfSets] = useState("")                    //
    const [type, setType] = useState("")                                //-------------------*

    const [newName, setNewName] = useState()                            //Variables para cambiar individualmente los ejercicios
    const [newSet, setNewSet] = useState(null)                          //
    const [newRep, setNewRep] = useState()                              //
    const [newPeso, setNewPeso] = useState()                            //
    const [newVideo, setNewVideo] = useState()                          //
    const [newNotas, setNewNotas] = useState()                          //
    const [newNumberExercise, setNewNumberExercise] = useState()        //-------------------*



    const [visibleCircuit, setVisibleCircuit] = useState(false);        //Variables para las modales de primeReact
    const [visibleExercises, setVisibleExercises] = useState(false);    //
    const [visibleEdit, setVisibleEdit] = useState(false);              //-------------------*

    const [csv, setCsv] = useState(false);              //  Papaparse, json to  csv

    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))
    
    let idRefresh = RefreshFunction.generateUUID()

    const [databaseUser, setDatabaseUser] = useState()

    useEffect(() => {
        setDatabaseUser(localStorage.getItem('DATABASE_USER'))

        if(DatabaseUtils.DATABASE_EXERCISES != null){
          DatabaseExercises.findExercises(DatabaseUtils.USER_ID).then((data) => setDatabaseUser(data))
        } 

    }, []);
    

    const refresh = (refresh) => setStatus(refresh)

    useEffect(() => {

        setLoading(true)
        setNumberToast(true)
        Notify.notifyA("Cargando")

        WeekService.findByWeekId(week_id)
            .then(data => {
 
                let indexDay = data[0].routine.findIndex(dia => dia._id === day_id) // De la base de datos, selecciono el día correspondiente
                let day = data[0].routine[indexDay].exercises                       // Cargo únicamente los ejercicios
                let circuit = day != null ? day.filter(circuito => circuito.type != 'exercise') : null  // Cargo únicamente los ejercicios del circuito

                let warmup  =  data[0].routine[indexDay].warmup
                

                //setCosa(indexDay)
                setFirstOpen(false)                     // variable que detecta la primera vez que se renderiza el componente
                setCircuit(circuit)                     // establece los ejercicios del circuito para renderizarlo luego a la hora de editar
                setDay(day)   
                setModifiedDay(day)                           // array de objetos inicial, son los ejercicios
                setUserId(data[0].user_id)              // userId para volver a la página anterior
                setLoading(false)                       // load principal
                setInputEnFoco(null)                    // input para la edición rápida
                setConfirm(null)                        // no sé todavía, averiguar por qué lo use
                setOptions(Options)                     // array de options para el select
                setFirstLoading(false)                  // firstload para cargar el skeleton
                setEditExerciseMobile(false)
                Notify.updateToast()
                //localStorage.setItem('LEN', day.length) // carga en localstorage el largo del array principal, para luego al editar o eliminar cargar el skeleton correctamente 

            })
}, [status, firstLoading])


const refreshEdit = (le) => {
    setLoading(true)
    setStatus(idRefresh)
    setEditExerciseMobile(false)
    setWarmup(false)
}




useEffect(() => {
    let strItem    = localStorage.getItem('LEN')
    let parsedItem = parseInt(strItem)
    setSecondLoad(parsedItem)

}, [loading])



    const closeDialog = (close) => setVisibleExercises(close)

    // EDIT EXERCISES

    const changeNameEdit = (index, e) => {
        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].name = e.target.value;
        setModifiedDay(updatedModifiedDay);

      };
      
      const changePesoEdit = (index, e) => {
        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].peso = e.target.value;
        setModifiedDay(updatedModifiedDay);

      };

      const changeSetEdit = (index, newValue) => {

        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].sets = newValue;
        setModifiedDay(updatedModifiedDay);

      };
      
      const changeRepEdit = (index, newValue) => {
        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].reps = newValue;
        setModifiedDay(updatedModifiedDay);
      };

      const changeRestEdit = (index, e) => {

        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].rest = e.target.value;
        setModifiedDay(updatedModifiedDay);
      };
      
      const changeVideoEdit = (index, e) => {

        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].video = e.target.value;
        setModifiedDay(updatedModifiedDay);
      };
      
      const changeNotasEdit = (index, e) => {
        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].notas = e.target.value;
        setModifiedDay(updatedModifiedDay);
      };

      const changeNumberExercise = (index, e) => {

        const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].numberExercise = e.target.value;
        setModifiedDay(updatedModifiedDay);
      };
      
      // Resto de funciones de cambio...

      const applyChanges = () => {

        setDay(modifiedDay);        // Gracias a esto se ven los cambios reflejados en pantalla.
        ExercisesService.editExercise(week_id, day_id, modifiedDay)
            .then((data) => {setStatus(idRefresh)} )
        
      };

    //Modal Edit Exercise

    const [completeExercise, setCompleteExercise] = useState()
    const [indexOfExercise, setIndexOfExercise] = useState()

    function handleEditMobileExercise(elementsExercise, index){
        setIndexOfExercise(index)
        setCompleteExercise(elementsExercise)
        setEditExerciseMobile(true)
    }
   
    const handleShowWarmup = () => setWarmup(true)

    function handleShowEditCircuit(id, type, typeOfSets, circuit,notas, numberExercise){

        setShowEditCircuit(true)
        setExercise_id(id)
        setNotasExercise(notas)
        setTypeOfSets(typeOfSets)
        setNumberExercise(numberExercise)
        setCircuit(circuit)
        setType(type)
        setNotasExercise(notas)

    }    

    const handleClose = () => {
        setShow(false);
        setShowEditCircuit(false)
        setStatus(idRefresh)

    } 

    const closeModal = () => {
        setShow(false);
        setShowEditCircuit(false)
        
    } 

    const deleteExercise = (event,id,name) => {

        name == null || name == undefined ? name = "Sin nombre" : name = name


        confirmDialog({
            trigger:            event.currentTarget,
            message:            `¡Cuidado! Estás por eliminar "${name}". ¿Estás seguro?`,
            icon:               'pi pi-exclamation-triangle',
            header:             `Eliminar ${name}`,
            accept:             () => acceptDeleteExercise(id),
            acceptLabel:        "Sí, eliminar",
            acceptClassName:    "p-button-danger",
            rejectLabel:        "No",
            rejectClassName:    "closeDialog",
            blockScroll:        true,
            dismissableMask:    true,

        });
    };

    
  const sidebarStyles = {
    height: '90%', // Establece la altura al 100% de la pantalla
    zIndex: 1000, // Asegura que el Sidebar esté por encima del contenido principal
  };
    
    function acceptDeleteExercise(id) {
        setLoading(true)

        ExercisesService.deleteExercise(week_id, day_id, id)
            .then(() => setStatus(idRefresh))
    };

    const handleInputFocus = (index) => { setInputEnFoco(index); setConfirm(true)};

    const handleCloseDialog = () => {setVisibleCircuit(false), setVisibleExercises(false), setVisibleEdit(false)}
  


    const handleInputChangeSet = (newValue,e ) => console.log(newValue, e);
    const handleInputChangeRep = (newValue) => setNewRep(newValue);

    //<button className="btn BlackBGtextWhite col-12" onClick={() => setEditExerciseMobile(true)}>Formulas</button>

    //                            {firstLoading == true || day.length == 0 ? Array.from({ length: firstLoading == true && secondLoad == numberExercises ? numberExercises : secondLoad }).map((_, index) => (
        //<SkeletonExercises ancho={anchoPagina} key={index} />
        //)) : 
    
    const [anchoPagina, setAnchoPagina] = useState(window.innerWidth);



    return (

        <section className='container-fluid'>
            <Logo />

            <div className='row justify-content-center'>
                    <button className={`btn ${textColor ? "bbb" : "text-light"} col-6 col-lg-2 my-2 mx-1`} style={{ "backgroundColor": `black` }} label="Show" icon="pi pi-external-link" onClick={() => setVisibleExercises(modifiedDay)} >Añadir Ejercicio</button>

                    <button className={`btn ${textColor ? "bbb" : "text-light"} col-6 col-lg-2 my-2 mx-1`} style={{ "backgroundColor": `black` }} label="Show" icon="pi pi-external-link" onClick={() => setVisibleCircuit(true)} >Añadir Circuito</button>
                </div>

                <div className="row justify-content-center">

                <div className='row justify-content-center'>
                    <Dialog 
                        className='col-12 col-md-10 col-xxl-5' 
                        contentClassName={'colorDialog'} 
                        headerClassName={'colorDialog'}  
                        header="Header" 
                        visible={visibleCircuit} 
                        modal={false} 
                        onHide={() => setVisibleCircuit(false)}
                        blockScroll={window.innerWidth > 600 ? false : true}>
                        <AddCircuit 
                            databaseExercises={databaseUser} 
                            handleCloseDialog={handleCloseDialog} 
                            closeDialog={closeDialog} 
                            refresh={refresh}/>
                    </Dialog>
                    <Dialog 
                        className='col-12 col-md-10 col-xxl-5' 
                        contentClassName={'colorDialog'} 
                        headerClassName={'colorDialog'} 
                        header="Header" 
                        visible={visibleExercises} 
                        modal={false} 
                        onHide={() => setVisibleExercises(false)}
                        blockScroll={window.innerWidth > 600 ? false : true}>
                        <AddExercise 
                            databaseExercises={databaseUser}
                            handleCloseDialog={handleCloseDialog} 
                            refresh={refresh}/>
                    </Dialog>
                </div>

            </div>


            <article  className='row justify-content-center'>

           
            <button onClick={handleShowWarmup} className='btn border buttonColor col-9 col-md-5 my-5'>Administrar bloque de entrada en calor</button>
            <div className='row justify-content-center'>
                {warmup.length > 0 && <div className='col-11 col-xxl-10'>
                    <WarmupExercises /> 

                </div>}

            </div>
                <div className={`row justify-content-center align-items-center text-center mt-5 px-0 ${inputEnFoco !== null ? 'colorDisabled' : null}`}>

                    


                    <div className={`table-responsive col-11 col-xxl-10 m-0 p-0 pt-3 `}>
                        <table className="table align-middle table-bordered ">
                            <thead>

                                <tr>
                                    <th className='TableResponsiveDayEditDetailsPage tdNumber' scope="col">#</th>
                                    <th scope="col" className='tdName'>Ejercicio</th>
                                    <th scope="col" className='tdSets'>Series</th>
                                    <th scope="col" className='tdReps'>Reps</th>
                                    <th scope="col" className='tdReps'>Rest</th>
                                    <th className='TableResponsiveDayEditDetailsPage tdPeso' scope="col">Peso</th>
                                    <th className='TableResponsiveDayEditDetailsPage tdVideo' scope="col">Video</th>
                                    <th className='TableResponsiveDayEditDetailsPage tdNotas' scope="col">Notas</th>
                                    <th scope="col" className='tdActions'>Acciones</th>
                                </tr> 
                            </thead>
                            <tbody>
                            

                            <TransitionGroup component={null} className="todo-list">
                                { day.map((exercise, index) =>
                                <CSSTransition
                                key={exercise.exercise_id}
                                timeout={day.length == 0 ? 0 : 400}
                                classNames="item"
                                >                               
                                    <tr key={exercise.exercise_id} className={`oo`}>
                                        <th className='TableResponsiveDayEditDetailsPage' >
                                        {exercise.type != 'exercise' ? <span>{exercise.numberExercise}</span> :
                                         <select  
                                            onFocus={exercise.type != 'exercise' ? null : () => handleInputFocus(index)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                            defaultValue={exercise.numberExercise} 
                                            onChange={(e) => {changeNumberExercise(index, e)}}
                                            >
                                            {options.map(option =>
                                            <optgroup 
                                                key={option.value} 
                                                label={option.name} >

                                                    <option value={option.value} > {option.name} </option>
                                                    {option.extras.map(element => <option key={element.name} >{element.name}</option> )}

                                            </optgroup>
                                            )}
                                        </select>}

                                        </th>
                                        {exercise.type != 'exercise' ? <td colSpan={anchoPagina > 992 ? 5 : 3} >
                                                                <table className='table align-middle'>
                                                                    <thead>
                                                                        <tr>
                                                                            <th colSpan={anchoPagina > 992 ? 5 : 3}>{exercise.type} x {exercise.typeOfSets}</th>
                                                                        </tr>
                                                                        <tr>

                                                                            <th scope='col' className='mx-2'>Ejercicio</th>
                                                                            <th className='mx-2' scope='col' >Reps</th>
                                                                            <th className='TableResponsiveDayEditDetailsPage mx-2' scope='col'>Peso</th>
                                                                            <th className='TableResponsiveDayEditDetailsPage tdNotasCircuit' scope='col'>Video</th>
                                                                        </tr>
                                                                        </thead>
                                                                    <tbody>
                                                                        {exercise.circuit.map(element =>
                                                                        <tr key={element.idRefresh}>

                                                                            <td>{element.name}</td>
                                                                            <td>{element.reps}</td>
                                                                            <td className='TableResponsiveDayEditDetailsPage'>{element.peso}</td>
                                                                            <td className='TableResponsiveDayEditDetailsPage tdNotasCircuit'>{element.video}</td>
                                                                        </tr>)}
                                                                    </tbody>
                                                                </table> 
                                                            </td>: 
                                    <td className='tdName'>
                                        <input 
                                        className='form-control border-0' 
                                        type="text" 
                                        defaultValue={exercise.name} 
                                        
                                        onChange={(e) => changeNameEdit(index, e)}
                                        onFocus={() => handleInputFocus(index)}
                                        autoComplete='off'
                                        />
                                    </td>}

                                    {exercise.sets === undefined ? null :
                                    <td className='tdSets c' >
                                        <CustomInputNumber 
                                            initialValue={inputEnFoco !== null && inputEnFoco == index && confirm != true ? newSet : exercise.sets}
                                            onChange={(e) => changeSetEdit(index, e)}
                                            onValueChange={() => handleInputFocus(index)}
                                            onFocus={() => handleInputFocus(index)}

                                            
                                            className="" 
                                            />
  
                                    </td>} 
                                    {exercise.reps === undefined ? null  : 
                                    <td className='tdReps'>
                                            <CustomInputNumber 
                                            initialValue={inputEnFoco !== null && inputEnFoco === index && !confirm ? newRep : exercise.reps}
                                            onChange={(e) => changeRepEdit(index, e)}
                                            onValueChange={() => handleInputFocus(index)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                            isTextMode={inputEnFoco !== null && inputEnFoco === index && !confirm}

                                            />
                                    </td>
                                    }

                                        {exercise.rest === undefined ? null :
                        
                                        <td className='tdReps'>
                                            <input 
                                                className='form-control border-0' 
                                                type="text" 
                                                defaultValue={exercise.rest}
                                                onChange={(e) => changeRestEdit(index, e)}
                                                onFocus={() => handleInputFocus(index)}
                                                
                                            />
                                        </td>}
                                    

                                    {exercise.peso === undefined ? null :

                                        <td className='TableResponsiveDayEditDetailsPage tdPeso'>
                                            
                                            <input 
                                            className='form-control border-0' 
                                            type="text" 
                                            defaultValue={exercise.peso}
                                            onChange={(e) => changePesoEdit(index, e)}
                                            onFocus={() => handleInputFocus(index)}
                                            
                                            />
                                            
                                        
                                        </td> 
                                    }
                                    
                                    {exercise.video === undefined ? null : 
                                    
                                        <td className='TableResponsiveDayEditDetailsPage tdVideo' >
                                            
                                            <input 
                                            className='form-control border-0' 
                                            type="text" 
                                            defaultValue={exercise.video}
                                            onChange={(e) => changeVideoEdit(index, e)}
                                            onFocus={() => handleInputFocus(index)}
                                            />
                                        
                                        </td>
                                    }

                                    <td className='TableResponsiveDayEditDetailsPage tdNotas'>
                                        
                                        <textarea 
                                        className='form-control border-0' 
                                        type="text" 
                                        defaultValue={exercise.notas}
                                        onChange={(e) => changeNotasEdit(index, e)}
                                        onClick={
                                            exercise.type != 'exercise' ? () => handleShowEditCircuit(
                                            exercise.exercise_id, 
                                            exercise.type, 
                                            exercise.typeOfSets, 
                                            exercise.circuit, 
                                            exercise.notas, 
                                            exercise.numberExercise) : null}
                                        onFocus={exercise.type != 'exercise' ? null : () => handleInputFocus(index)}
                                        ref={(input) => (inputRefs.current[index] = input)}
                                        />

                                    </td> 
                                    
                                    <td className='tdActions'>

                                        <>
                                       
                                            <button onClick={(e) => deleteExercise(e,exercise.exercise_id,exercise.name)} className='btn buttonsEdit'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className=" bi bi-trash3" viewBox="0 0 16 16">
                                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                </svg>
                                            </button>
                                            <button 
                                            className='btn buttonsEdit'
                                            onClick={() => exercise.type != 'exercise' ? 
                                                handleShowEditCircuit(
                                                    exercise.exercise_id, 
                                                    exercise.type, 
                                                    exercise.typeOfSets, 
                                                    exercise.circuit, 
                                                    exercise.notas, 
                                                    exercise.numberExercise) : 
                                                    
                                                handleEditMobileExercise(exercise, index)}>

                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                </svg>
                                            </button>
                                        </> 

                                    </td>
                                </tr>
                                
                                    </CSSTransition>
                                )}
                                </TransitionGroup>
                                

                            </tbody>
                            
                        
                            
                        </table>
                        {inputEnFoco == null ? null :
                        <>
                            <button className='btn btn-secondary mb-2 me-2' onClick={() => setInputEnFoco(null)}>
                            Cancelar edición
                        </button>
                            <button className={`btn ${textColor ? "bbb" : "text-light"} mb-2 ms-2`} style={{ "backgroundColor": `black` }} onClick={applyChanges} >
                                Aplicar cambios
                            </button>
                        </>
                        }
                        
                    </div>
                    </div>

                    <Link to={`/user/routine/${id}/${username}`} className={`btn ${textColor ? "bbb" : "text-light"} text-center mt-5 mb-3 col-4`} style={{ "backgroundColor": `black` }} >Volver atrás</Link>
                </article>

               

                <Dialog 
                    className='col-12 col-md-10 col-xxl-5' 
                    contentClassName={'colorDialog'} 
                    headerClassName={'colorDialog'} 
                    header="Header" 
                    visible={visibleEdit} 
                    modal={false} 
                    onHide={() => setVisibleEdit(false)}>

                </Dialog>

                <ModalConfirmDeleteExercise show={show} handleClose={handleClose} closeModal={closeModal} week_id={week_id} day_id={day_id} exercise_id={exercise_id} name={nameExercise}/>

                <ModalEditCircuit showEditCircuit={showEditCircuit} handleClose={handleClose} closeModal={closeModal} refresh={refresh} week_id={week_id} day_id={day_id} exercise_id={exercise_id} circuitExercises={circuit} type={type} typeOfSets={typeOfSets} notasCircuit={notas} numberExercise={numberExercise}/>

               
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
                
                <ConfirmDialog />

                <Sidebar visible={editExerciseMobile} position="right" onHide={() => {setEditExerciseMobile(false)}}>
                    <EditExercise  completeExercise={modifiedDay} week_id={week_id} day_id={day_id} indexOfExercise={indexOfExercise} refresh={refresh} refreshEdit={refreshEdit} isAthlete={false}/>
                </Sidebar>
                    <Dialog 
                        className='col-12 col-md-10' 
                        contentClassName={'colorDialog'} 
                        headerClassName={'colorDialog'}  
                        header="Header" 
                        visible={warmup} 
                        modal={false} 
                        onHide={() => setWarmup(false)}
                        blockScroll={window.innerWidth > 600 ? false : true}>

                        <ModalCreateWarmup  completeExercise={modifiedDay} week_id={week_id} day_id={day_id} indexOfExercise={indexOfExercise} refreshEdit={refreshEdit}/>
                    </Dialog>

        </section>
    )
}

export default DayEditDetailsPage