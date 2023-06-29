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


function DayEditDetailsPage(){
    const {week_id} = useParams()
    const {day_id} = useParams()
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


    const [exercise_id, setExercise_id] = useState()                    // Carga edit para el edit y delete de ejercicios
    const [nameExercise, setNameModal] = useState()                     // Carga para el delete 
    const [user_id, setUserId] = useState("")                           // ID del usuario en cuestión

    const [show, setShow] = useState(false)                             // Modal para eliminar ejercicios
    const [showEditCircuit, setShowEditCircuit] = useState(false)       // Modal para editar los circuitos
    const [showCreateWarmup, setShowCreateWarmup] = useState(false)     // Modal para crear la entrada en calor

    const [CanvasFormulas, setCanvasFormulas] = useState(false);        // Modal para canvas de formulas
    
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


    
    let idRefresh = RefreshFunction.generateUUID()

    const [databaseUser, setDatabaseUser] = useState()

    useEffect(() => {
        setDatabaseUser(localStorage.getItem('DATABASE_USER'))

        if(DatabaseUtils.DATABASE_EXERCISES != null){
          DatabaseExercises.findExercises(DatabaseUtils.USER_ID).then((data) => setDatabaseUser(data))
        } 

    }, []);
    
    const refreshEdit = () => {
        setDay([])
        setVisibleEdit(false)
    }

    const refresh = (refresh) => setStatus(refresh)

    useEffect(() => {

        setLoading(true)
        setNumberToast(true)
        Notify.notifyA("Cargando")

        WeekService.findByWeekId(week_id)
            .then(data => {
 
                let indexDay = data[0].routine.findIndex(dia => dia._id === day_id) // De la base de datos, selecciono el día correspondiente
                let day = data[0].routine[indexDay].exercises                       // Cargo únicamente los ejercicios
                let circuit = day.filter(circuito => circuito.type != 'exercise')   // Cargo únicamente los ejercicios del circuito

                //setCosa(indexDay)
                setFirstOpen(false)                     // variable que detecta la primera vez que se renderiza el componente
                setCircuit(circuit)                     // establece los ejercicios del circuito para renderizarlo luego a la hora de editar
                setDay(day)                             // array de objetos inicial, son los ejercicios
                setUserId(data[0].user_id)              // userId para volver a la página anterior
                setLoading(false)                       // load principal
                setInputEnFoco(null)                    // input para la edición rápida
                setConfirm(null)                        // no sé todavía, averiguar por qué lo use
                setOptions(Options)                     // array de options para el select
                setFirstLoading(false)                  // firstload para cargar el skeleton
                Notify.updateToast()
                localStorage.setItem('LEN', day.length) // carga en localstorage el largo del array principal, para luego al editar o eliminar cargar el skeleton correctamente 

               
            })
}, [status, firstLoading])

useEffect(() => {
    let strItem    = localStorage.getItem('LEN')
    let parsedItem = parseInt(strItem)
    setSecondLoad(parsedItem)

}, [loading])



    const closeDialog = (close) => setVisibleExercises(close)

    // EDIT EXERCISES

    const changeNameEdit = (e) => setNewName(e.target.value)
    const changePesoEdit = (e) => setNewPeso(e.target.value)
    const changeNotasEdit = (e) => setNewNotas(e.target.value)
    const changeVideoEdit = (e) => setNewVideo(e.target.value)

    //Modal Edit Exercise

    const [completeExercise, setCompleteExercise] = useState()

    function handleEditMobileExercise(elementsExercise){
        setCompleteExercise(elementsExercise)
        setVisibleEdit(true)
    }

    const handleShowCreateMobility = () => setShowCreateWarmup(true)

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
        setShowCreateWarmup(false)
        setShowEditCircuit(false)
        setStatus(idRefresh)

    } 

    const closeModal = () => {
        setShow(false);
        setShowCreateWarmup(false)
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

    
    
    function acceptDeleteExercise(id) {
        setLoading(true)

        ExercisesService.deleteExercise(week_id, day_id, id)
            .then(() => setStatus(idRefresh))
    };

    const editExercise = (exercise_id, name, StrSets, StrReps, peso, video, notas, numberExercise) => {

        let parsedValue   = numberExercise
        let valueExercise = parseInt(parsedValue)
        let sets          = parseInt(StrSets)
        let reps          = parseInt(StrReps)

        name == null || name == "" || name == undefined ? name = " " : name = name

        peso == null || peso == "" || peso == undefined ? peso = " " : peso = peso
        
        video == null || video == "" || video == undefined ? video = " ": video = video 

        notas == null || notas == "" || notas == undefined ? notas = " ": notas = notas

        ExercisesService.editExercise(week_id, day_id, exercise_id, {type: 'exercise', name, sets, reps, peso, video, notas, numberExercise, valueExercise})
            .then(() => {setStatus(idRefresh)} )
            
    }

    const handleInputFocus = (index) => { setInputEnFoco(index); setConfirm(true)};

    const handleCloseDialog = () => {setVisibleCircuit(false), setVisibleExercises(false), setVisibleEdit(false)}
  
    //Cuando se aprete fuera del div al que le puse el ref, se pierde el foco del input
    
    const divRef = useRef();

    useEffect(() => {
    
        function handleClickOutside(event) { 
            if(divRef.current && !divRef.current.contains(event.target)){ 
                setInputEnFoco(null); 
            } 
        }

        const handleDocumentClick = (event) => handleClickOutside(event);
        document.addEventListener('mousedown', handleDocumentClick);

        return () => { document.removeEventListener('mousedown', handleDocumentClick); };
    }, []);

    const handleInputChangeSet = (newValue) => setNewSet(newValue);
    const handleInputChangeRep = (newValue) => setNewRep(newValue);

    //<button className="btn BlackBGtextWhite col-12" onClick={() => setCanvasFormulas(true)}>Formulas</button>
    
    const [anchoPagina, setAnchoPagina] = useState(window.innerWidth);

    return (

        <section className='container-fluid'>
            <Logo />

            <div className='row justify-content-center'>
                    <button className='btn BlackBGtextWhite col-6 col-lg-2 my-2 mx-1' label="Show" icon="pi pi-external-link" onClick={() => setVisibleExercises(true)} >Añadir Ejercicio</button>

                    <button className='btn BlackBGtextWhite col-6 col-lg-2 my-2 mx-1' label="Show" icon="pi pi-external-link" onClick={() => setVisibleCircuit(true)} >Añadir Circuito</button>
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

            <button onClick={handleShowCreateMobility} className='btn border buttonColor col-9 col-md-5 my-5'>Administrar bloque de entrada en calor</button>
                <div ref={divRef} className={`row justify-content-center align-items-center text-center mt-5 px-0 ${inputEnFoco !== null ? 'colorDisabled' : null}`}>


                    <div className={`table-responsive col-11 col-xxl-10 m-0 p-0 pt-3 `}>
                        <table className="table align-middle table-bordered ">
                            <thead>

                                <tr>
                                    <th className='TableResponsiveDayEditDetailsPage tdNumber' scope="col">#</th>
                                    <th scope="col" className='tdName'>Ejercicio</th>
                                    <th scope="col" className='tdSets'>Series</th>
                                    <th scope="col" className='tdReps'>Reps</th>
                                    <th className='TableResponsiveDayEditDetailsPage tdPeso' scope="col">Peso</th>
                                    <th className='TableResponsiveDayEditDetailsPage tdVideo' scope="col">Video</th>
                                    <th className='TableResponsiveDayEditDetailsPage tdNotas' scope="col">Notas</th>
                                    <th scope="col" className='tdActions'>Acciones</th>
                                </tr> 
                            </thead>
                            <tbody>
                            
                            {firstLoading == true || day.length == 0 ? Array.from({ length: firstLoading == true && secondLoad == numberExercises ? numberExercises : secondLoad }).map((_, index) => (
                                <SkeletonExercises ancho={anchoPagina} key={index} />
                            )) : 
                            <TransitionGroup component={null} className="todo-list">
                                {day.map((exercise, index) =>
                                <CSSTransition
                                key={exercise.exercise_id}
                                timeout={day.length == 0 ? 0 : 400}
                                classNames="item"
                                >                               
                                    <tr key={exercise.exercise_id} className={`oo ${inputEnFoco !== null && inputEnFoco !== index ? 'ww' : null}`}>
                                        <th className='TableResponsiveDayEditDetailsPage' >
                                        {exercise.type != 'exercise' ? <span>{exercise.numberExercise}</span> :
                                         <select  
                                            defaultValue={exercise.numberExercise} 
                                            onChange={(e) => { 
                                                editExercise(
                                                    exercise.exercise_id, 
                                                    exercise.name, 
                                                    exercise.sets, 
                                                    exercise.reps, 
                                                    exercise.peso, 
                                                    exercise.video, 
                                                    exercise.notas, 
                                                    e.target.value)}}
                                            disabled={inputEnFoco !== null && inputEnFoco !== index}>
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
                                        onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            editExercise(
                                                exercise.exercise_id, 
                                                e.target.value || null, 
                                                exercise.sets, 
                                                exercise.reps, 
                                                exercise.peso, 
                                                exercise.video, 
                                                exercise.notas, 
                                                exercise.numberExercise)
                                            }}} 
                                        onChange={changeNameEdit}
                                        onFocus={() => handleInputFocus(index)}
                                        ref={(input) => (inputRefs.current[index] = input)}
                                        disabled={inputEnFoco !== null && inputEnFoco !== index}
                                        autoComplete='off'
                                        />
                                    </td>}

                                    {exercise.sets === undefined ? null :
                                    <td className='tdSets c' >
                                        <CustomInputNumber 
                                            initialValue={inputEnFoco !== null && inputEnFoco == index && confirm != true ? newSet : exercise.sets}
                                            onChange={(newValue) => handleInputChangeSet(newValue)}
                                            onValueChange={() => handleInputFocus(index)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                            disabled={inputEnFoco !== null && inputEnFoco !== index}
                                            className="" 
                                            />
  
                                    </td>} 
                                    {exercise.reps === undefined ? null  : 
                                    <td className='tdReps'>
                                            
                                            <CustomInputNumber 
                                            initialValue={inputEnFoco !== null && inputEnFoco == index && confirm != true ? newRep : exercise.reps}
                                            onChange={(newValue) => handleInputChangeRep(newValue)}
                                            onValueChange={() => handleInputFocus(index)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                            disabled={inputEnFoco !== null && inputEnFoco !== index}
                                            className="" 
                                            />
                                        </td> 
                                    }
                                        
                                    {exercise.peso === undefined ? null :

                                        <td className='TableResponsiveDayEditDetailsPage tdPeso'>
                                            
                                            <input 
                                            className='form-control border-0' 
                                            type="text" 
                                            defaultValue={exercise.peso}
                                            onChange={changePesoEdit}
                                            onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                editExercise(
                                                    exercise.exercise_id, 
                                                    exercise.name, 
                                                    exercise.sets, 
                                                    exercise.reps, 
                                                    e.target.value || null,
                                                    exercise.video, 
                                                    exercise.notas, 
                                                    exercise.numberExercise)
                                                }}} 
                                            onFocus={() => handleInputFocus(index)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                            disabled={inputEnFoco !== null && inputEnFoco !== index}
                                            />
                                            
                                        
                                        </td> 
                                    }
                                    
                                    {exercise.video === undefined ? null : 
                                    
                                        <td className='TableResponsiveDayEditDetailsPage tdVideo' >
                                            
                                            <input 
                                            className='form-control border-0' 
                                            type="text" 
                                            defaultValue={exercise.video}
                                            onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                editExercise(
                                                    exercise.exercise_id, 
                                                    exercise.name, 
                                                    exercise.sets, 
                                                    exercise.reps, 
                                                    exercise.peso, 
                                                    e.target.value || null, 
                                                    exercise.notas, 
                                                    exercise.numberExercise)
                                                }}} 
                                            onChange={changeVideoEdit}
                                            onFocus={() => handleInputFocus(index)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                            disabled={inputEnFoco !== null && inputEnFoco !== index}
                                            />
                                        
                                        </td>
                                    }

                                    <td className='TableResponsiveDayEditDetailsPage tdNotas'>
                                        
                                        <textarea 
                                        className='form-control border-0' 
                                        type="text" 
                                        defaultValue={exercise.notas}
                                        onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            editExercise(
                                                exercise.exercise_id, 
                                                exercise.name, 
                                                exercise.sets, 
                                                exercise.reps, 
                                                exercise.peso, 
                                                exercise.video, 
                                                e.target.value || null, 
                                                exercise.numberExercise)
                                            }}} 
                                        onChange={changeNotasEdit}
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
                                        disabled={inputEnFoco !== null && inputEnFoco !== index}
                                        />

                                    </td> 
                                    
                                    <td className='tdActions'>
                                        {inputEnFoco == null ? 
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
                                                    
                                                handleEditMobileExercise(exercise)}>

                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                </svg>
                                            </button>
                                        </> 
                                        :  
                                        <>
                                            <button className='btn buttonsEdit' onClick={() => setInputEnFoco(null)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </button>

                                            <button 
                                            disabled={inputEnFoco !== null && inputEnFoco !== index} 
                                            onClick={(e) => editExercise(
                                                exercise.exercise_id, 
                                                newName == undefined ? exercise.name : newName, 
                                                newSet == undefined ? exercise.sets : newSet, 
                                                newRep == undefined ? exercise.reps : newRep, 
                                                newPeso == undefined ? exercise.peso : newPeso, 
                                                newVideo == undefined ? exercise.video : newVideo, 
                                                newNotas == undefined ? exercise.notas : newNotas, 
                                                newNumberExercise == undefined ? exercise.numberExercise : newNumberExercise)} 
                                            className='btn buttonsEdit'>

                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-check-square" viewBox="0 0 16 16">
                                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                    <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                                </svg>
                                            </button>
                                        </>
                                           }
                                    </td>
                                </tr>
                                    </CSSTransition>
                                )}
                                </TransitionGroup>}

                            </tbody>
                        
                            
                        </table>
                    </div>
                    </div>
                </article>

                <div className='d-flex justify-content-center'>
                    <Link className="btn BlackBGtextWhite text-center my-5" to={`/user/routine/${user_id}`}>Volver atrás</Link>
                </div>

                <Dialog 
                    className='col-12 col-md-10 col-xxl-5' 
                    contentClassName={'colorDialog'} 
                    headerClassName={'colorDialog'} 
                    header="Header" 
                    visible={visibleEdit} 
                    modal={false} 
                    onHide={() => setVisibleEdit(false)}>
                    <EditExercise  completeExercise={completeExercise} functionEdit={editExercise} refreshEdit={refreshEdit}/>
                </Dialog>

                <ModalConfirmDeleteExercise show={show} handleClose={handleClose} closeModal={closeModal} week_id={week_id} day_id={day_id} exercise_id={exercise_id} name={nameExercise}/>

                <ModalEditCircuit showEditCircuit={showEditCircuit} handleClose={handleClose} closeModal={closeModal} refresh={refresh} week_id={week_id} day_id={day_id} exercise_id={exercise_id} circuitExercises={circuit} type={type} typeOfSets={typeOfSets} notasCircuit={notas} numberExercise={numberExercise}/>

                <ModalCreateWarmup showCreateWarmup={showCreateWarmup} handleClose={handleClose} closeModal={closeModal} week_id={week_id} day_id={day_id}/>
               
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

                <Sidebar visible={CanvasFormulas} position="right" onHide={() => setCanvasFormulas(false)}>
                    <Formulas />
                </Sidebar>
        </section>
    )
}

export default DayEditDetailsPage