import { useEffect, useState, useRef } from 'react';
import {Link, useParams} from 'react-router-dom';

import * as ExercisesService from '../../services/exercises.services.js';
import * as WeekService from '../../services/week.services.js'; 
import * as DatabaseExercises from '../../services/jsonExercises.services.js'
import Options from './../../assets/json/options.json';
import * as DatabaseUtils from './../../utils/variables.js'

import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';
import { Sidebar } from 'primereact/sidebar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Dialog } from 'primereact/dialog';
import { ToastContainer, toast } from 'react-toastify';

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

    const [status, setStatus] = useState(1)
    const [loading, setLoading] = useState(null)
    const [firstLoading, setFirstLoading] = useState(true)

    const [options, setOptions] = useState()
    const [numberToast, setNumberToast] = useState(0)
    const TOASTID = "LOADER_ID"

    const [warmup, setWarmup] = useState()

    const [circuit, setCircuit] = useState([])
    const [day, setDay] = useState([])


    const [exercise_id, setExercise_id] = useState()
    const [nameExercise, setNameModal] = useState()
    const [user_id, setUserId] = useState("")

    const [show, setShow] = useState(false)
    const [showEditExercise, setShowEditExercise] = useState(false)
    const [showEditCircuit, setShowEditCircuit] = useState(false)
    const [showCreateWarmup, setShowCreateWarmup] = useState(false)

    const [CanvasFormulas, setCanvasFormulas] = useState(false);
    const [boolFocus, setBoolFocus] = useState(2)
    
    const [inputEnFoco, setInputEnFoco] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const inputRefs = useRef([]);

    const [notas, setNotasExercise] = useState()
    const [numberExercise, setNumberExercise] = useState()

    //Variables para cambiar individualmente los ejercicios
    const [newName, setNewName] = useState()
    const [newSet, setNewSet] = useState(null)
    const [newRep, setNewRep] = useState()
    const [newPeso, setNewPeso] = useState()
    const [newVideo, setNewVideo] = useState()
    const [newNotas, setNewNotas] = useState()
    const [newNumberExercise, setNewNumberExercise] = useState()

    const [typeOfSets, setTypeOfSets] = useState("")
    const [type, setType] = useState("")

    const [visibleCircuit, setVisibleCircuit] = useState(false);
    const [visibleExercises, setVisibleExercises] = useState(false);
    const [visibleEdit, setVisibleEdit] = useState(false);


    function generateUUID() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    
    let idRefresh = generateUUID()

    const [databaseUser, setDatabaseUser] = useState()

    useEffect(() => {
        setDatabaseUser(localStorage.getItem('DATABASE_USER'))
        if(DatabaseUtils.DATABASE_EXERCISES != null){
          DatabaseExercises.findExercises(DatabaseUtils.USER_ID).then((data) => setDatabaseUser(data))
        } 

    }, []);
    
    const [ind, setInd] = useState()
    const refreshEdit = () => {
        setDay([])


        //setDay([...data.exercise.routine[ind].exercises])
    }

    const refresh = (refresh) => {
        setStatus(refresh)
    }

    //useEffect(() => {setStatus(3),[refresh]})

    const [secondLoad, setSecondLoad] = useState()

    useEffect(() => {

        setLoading(true)
        setNumberToast(true)

        WeekService.findByWeekId(week_id)
            .then(data => {
                //Encuentro el index del día, y luego seteo el día con el que corresponde.
                let indexDay = data[0].routine.findIndex(dia => dia._id === day_id)
                let day = data[0].routine[indexDay].exercises
                let circuit = day.filter(circuito => circuito.type != 'exercise')

                setInd(indexDay)
                //setCosa(indexDay)

                setCircuit(circuit)
                setDay(day)
                setUserId(data[0].user_id)
                setLoading(false)
                setInputEnFoco(null)
                setConfirm(null)
                setOptions(Options)
                setFirstLoading(false)
                setTimeout(() => {setBoolFocus(1)},1500)

                localStorage.setItem('LEN', day.length)

               
            })
}, [status, firstLoading])

useEffect(() => {
    let strItem = localStorage.getItem('LEN')
    let parsedItem = parseInt(strItem)
    setSecondLoad(parsedItem)
    console.log(parsedItem)
}, [loading])



    const closeDialog = (close) => {
        setVisibleExercises(close)
    }

    // EDIT EXERCISES

    function changeNameEdit(e){ setNewName(e.target.value)}

    function changePesoEdit(e){ setNewPeso(e.target.value)}

    function changeNotasEdit(e){ setNewNotas(e.target.value)}

    function changeVideoEdit(e){ setNewVideo(e.target.value)}

    //Modal Edit Exercise

    const [completeExercise, setCompleteExercise] = useState()

    function handleEditMobileExercise(elementsExercise){
        setCompleteExercise(elementsExercise)
        setVisibleEdit(true)
    }

    function handleShowCreateMobility(){ setShowCreateWarmup(true) }

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
        setShowEditExercise(false)
        setShowCreateWarmup(false)
        setShowEditCircuit(false)
        setStatus(idRefresh)

    } 

    const closeModal = () => {
        setShow(false);
        setShowEditExercise(false)
        setShowCreateWarmup(false)
        setShowEditCircuit(false)
        setStatus(idRefresh)
        
    } 

    const deleteExercise = (event,id,name) => {

        if(name == null || name == undefined){
            name = "Sin nombre"
        }

    //Dialog delete exercise
        confirmDialog({
            trigger: event.currentTarget,
            message: `¡Cuidado! Estás por eliminar "${name}". ¿Estás seguro?`,
            icon: 'pi pi-exclamation-triangle',
            header:`Eliminar ${name}`,
            accept: () => acceptDeleteExercise(id),
            reject,
            acceptLabel:"Sí, eliminar",
            acceptClassName: "p-button-danger",
            rejectLabel: "No",
            rejectClassName: "closeDialog",
            blockScroll: true,
            dismissableMask: true,

        });
    };

    const reject = () => {};
    
    
    function acceptDeleteExercise(id) {
        setLoading(true)
        setNumberToast(2)
        ExercisesService.deleteExercise(week_id, day_id, id)
            .then(() => {
                setStatus(idRefresh)
            })
  
    };

    const notifyA = (message) => {

        if(message == null || message == undefined){
            message = "Sin nombre"
        }

        toast.loading(message, {
            position: "bottom-center",
            toastId: TOASTID, 
            autoClose: false, 
            hideProgressBar: true,
            pauseOnFocusLoss: false,
            limit: 1 })};

    const updateToast = () => 

        toast.update(
            TOASTID, { 
            render: "Listo!", 
            type: toast.TYPE.SUCCESS, 
            autoClose: 1000, 
            isLoading: false,
            pauseOnFocusLoss: false,
            hideProgressBar: true,
            limit: 1,
            className: 'rotateY animated'}
            );

    const showLoadingToast = () => {
        if(loading == true){
            notifyA(numberToast == 1 || numberToast == true ? "Cargando" : "Eliminando ejercicio...")
        }else{
            updateToast()
        }
    }    

    const editExercise = (exercise_id, name, StrSets, StrReps, peso, video, notas, numberExercise) => {

        let parsedValue = numberExercise
        let valueExercise = parseInt(parsedValue)
        let sets = parseInt(StrSets)
        let reps = parseInt(StrReps)

        if(name == null || name == "" || name == undefined){ name = " " }

        if(peso == null || peso == "" || peso == undefined){ peso = " " }
        
        if(video == null || video == "" || video == undefined){ video = " " }

        if(notas == null || notas == "" || notas == undefined){ notas = " "} 

        ExercisesService.editExercise(week_id, day_id, exercise_id, {type: 'exercise', name, sets, reps, peso, video, notas, numberExercise, valueExercise})
            .then(() => {setStatus(idRefresh)} )
            
    }

    const handleInputFocus = (index) => { setInputEnFoco(index); setConfirm(true)};

    const handleCloseDialog = () => {setVisibleCircuit(false), setVisibleExercises(false), setVisibleEdit(false)}
  
    //Cuando se aprete fuera del div al que le puse el ref, se pierde el foco del input
    
    const divRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) { if(divRef.current && !divRef.current.contains(event.target)) { setInputEnFoco(null); } }

        const handleDocumentClick = (event) => handleClickOutside(event);
        document.addEventListener('mousedown', handleDocumentClick);

        return () => { document.removeEventListener('mousedown', handleDocumentClick); };
    }, []);

    const handleInputChangeSet = (newValue) => setNewSet(newValue);
    const handleInputChangeRep = (newValue) => setNewRep(newValue);

    //<button className="btn BlackBGtextWhite col-12" onClick={() => setCanvasFormulas(true)}>Formulas</button>
    
    const [anchoPagina, setAnchoPagina] = useState(window.innerWidth);

    useEffect(() => {
      const actualizarAnchoPagina = () => setAnchoPagina(window.innerWidth);
  
      // Actualizar el ancho de la página cuando se monte el componente
      actualizarAnchoPagina();
  
      // Actualizar el ancho de la página cuando se redimensione la ventana
      window.onresize = actualizarAnchoPagina;

      // Limpiar el event handler cuando se desmonte el componente
      return () => { window.onresize = null; };
    }, []);

    const numberOfSkeletons = 5

    return (

        <section className='container-fluid'>
            <Logo />

            <div className='row justify-content-center'>

                    <button className='btn BlackBGtextWhite col-6 col-lg-2 my-2 mx-1' label="Show" icon="pi pi-external-link" onClick={() => setVisibleExercises(true)} >Añadir Ejercicio</button>

                    <button className='btn BlackBGtextWhite col-6 col-lg-2 my-2 mx-1' label="Show" icon="pi pi-external-link" onClick={() => setVisibleCircuit(true)} >Añadir Circuito</button>
                </div>

                <div className="row justify-content-center">

                <div className='row justify-content-center'>
                    <Dialog className='col-12 col-md-10 col-xxl-5' contentClassName={'colorDialog'} headerClassName={'colorDialog'}  header="Header" visible={visibleCircuit} modal={false} onHide={() => setVisibleCircuit(false)}>
                        <AddCircuit databaseExercises={databaseUser} handleCloseDialog={handleCloseDialog} closeDialog={closeDialog} refresh={refresh}/>
                    </Dialog>
                    <Dialog className='col-12 col-md-10 col-xxl-5' contentClassName={'colorDialog'} headerClassName={'colorDialog'} header="Header" visible={visibleExercises} modal={false} onHide={() => setVisibleExercises(false)}>
                        <AddExercise databaseExercises={databaseUser} handleCloseDialog={handleCloseDialog} refresh={refresh}/>
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
                            {showLoadingToast()}
                            {firstLoading == true || day.length == 0 ? Array.from({ length: firstLoading == true && secondLoad == numberExercises ? numberExercises : secondLoad }).map((_, index) => (
                                <SkeletonExercises key={index} />
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
                                                                            <th className='TableResponsiveDayEditDetailsPage mx-2' scope='col' >Peso</th>
                                                                        </tr>
                                                                        </thead>
                                                                    <tbody>
                                                                        {exercise.circuit.map(element =>
                                                                        <tr key={element.idRefresh}>

                                                                            <td>{element.name}</td>
                                                                            <td>{element.reps}</td>
                                                                            <td className='TableResponsiveDayEditDetailsPage'>{element.peso}</td>
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
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-trash3" viewBox="0 0 16 16">
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

                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                </svg>
                                            </button>
                                        </> 
                                        :  
                                        
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
                                                newNumberExercise == undefined ? exercise.numberExercise : newNumberExercise)} className='btn buttonsEdit p-3'>

                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className=" bi bi-pencil-square " viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                </svg>
                                            </button>
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

                <ModalCreateWarmup showCreateWarmup={showCreateWarmup} handleClose={handleClose} closeModal={closeModal} week_id={week_id} day_id={day_id} warmup={warmup}/>
               
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

                <ConfirmDialog />

                <Sidebar visible={CanvasFormulas} position="right" onHide={() => setCanvasFormulas(false)}>
                    <Formulas />
                </Sidebar>
        </section>
    )
}

export default DayEditDetailsPage