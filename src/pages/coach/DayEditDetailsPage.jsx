import { useEffect, useState, useRef } from 'react';
import {Link, useParams} from 'react-router-dom';

import * as ExercisesService from '../../services/exercises.services.js';
import * as WeekService from '../../services/week.services.js'; 

import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';
import { Sidebar } from 'primereact/sidebar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Dialog } from 'primereact/dialog';
import { ToastContainer, toast } from 'react-toastify';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';

import Logo from '../../components/Logo.jsx'
import AddExercise from '../../components/AddExercise.jsx'
import ModalConfirmDeleteExercise from '../../components/Bootstrap/ModalConfirmDeleteExercise.jsx';
import ModalEditExercise from '../../components/Bootstrap/ModalEdit/ModalEditExercise.jsx';
import ModalCreateWarmup from '../../components/Bootstrap/ModalCreateWarmup.jsx';
import Formulas from '../../components/Formulas.jsx';
import ModalEditCircuit from '../../components/Bootstrap/ModalEdit/ModalEditCircuit.jsx';
import AddCircuit from '../../components/AddCircuit.jsx';


function DayEditDetailsPage(){
    const {week_id} = useParams()
    const {day_id} = useParams()
    const [status, setStatus] = useState(1)
    const [loading, setLoading] = useState(false)
    const [numberToast, setNumberToast] = useState(0)
    const TOASTID = "LOADER_ID"
    const toastPop = useRef(null);

    const [warmup, setWarmup] = useState()
    const [exercises, setExercises] = useState([])
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
    const [visibleCircuit, setVisibleCircuit] = useState(false);
    const [visibleExercises, setVisibleExercises] = useState(false);

    const [name, setNameExercise] = useState()
    const [sets, setSetsExercise] = useState()
    const [reps, setRepsExercise] = useState()
    const [peso, setPesoExercise] = useState()
    const [video, setVideoExercise] = useState()
    const [notas, setNotasExercise] = useState()
    const [numberExercise, setNumberExercise] = useState()
    const [valueExercise, setValueExercise] = useState()

    const [typeOfSets, setTypeOfSets] = useState("")
    const [type, setType] = useState("")

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

    const refresh = (refresh) => {
        setStatus(refresh)
    }

    const closeDialog = (close) => {
        setVisibleExercises(close)
    }

    useEffect(() => {
            setLoading(true)
            setNumberToast(true)
            WeekService.findByWeekId(week_id)
                .then(data => {
                    //Encuentro el index del día, y luego seteo el día con el que corresponde.
                    let indexDay = data[0].routine.findIndex(dia => dia._id === day_id)
                    let day = data[0].routine[indexDay].exercises
                    let exercises = day.filter(exercise => exercise.type == 'exercise')
                    let circuit = day.filter(circuito => circuito.type != 'exercise')
                    console.log(circuit)

                    setExercises(exercises)
                    setCircuit(circuit)
                    setDay(day)
                    setUserId(data[0].user_id)
                    setLoading(false)

                })
    }, [status])


    // EDIT EXERCISES

    function changeNameEdit(e){
        setNameExercise(e.target.value)
    }

    function changePesoEdit(e){
        setPesoExercise(e.target.value)
    }

    function changeVideoEdit(e){
        setVideoExercise(e.target.value)
    }

    function changeSetsEdit(e){
        setSetsExercise(e.target.value)
    }

    function changeRepsEdit(e){
        setRepsExercise(e.target.value)
    }
    const [clicks, setClicks] = useState(0)


        setTimeout(() => {
    function editExercise(exercise_id, name, sets, reps, peso, video, notas, numberExercise, parsedValue){

        setLoading(true)
        setNumberToast(1)
        let valueExercise = parseInt(parsedValue)
        parsedValue = numberExercise 
        notas == undefined ? "" : notas
        
        console.log(sets)

            ExercisesService.editExercise(week_id, day_id, exercise_id, {type: 'exercise', name, sets, reps, peso, video, notas, numberExercise, valueExercise}) 
                .then(() => {
                setStatus(idRefresh) // Este id refresh es el que activa el aceptado
            })
        


    }}, 4000)

    //Modal Edit Exercise
    function handleShowEditExercise(id, name, sets, reps,peso, video, notas){

        setShowEditExercise(true)
        setNameExercise(name)
        setExercise_id(id)
        setSetsExercise(sets)
        setRepsExercise(reps)
        setPesoExercise(peso)
        setVideoExercise(video)
        setNotasExercise(notas)

    }

    function handleShowCreateMobility(){
        setShowCreateWarmup(true)
    }

    function handleShowEditAmrap(id, type, typeOfSets, circuit, numberExercise){

        setShowEditCircuit(true)
        setExercise_id(id)
        setNotasExercise(notas)
        setTypeOfSets(typeOfSets)
        setNumberExercise(numberExercise)
        setCircuit(circuit)
        setType(type)

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
        
    } 

    const deleteExercise = (event,id,name) => {
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

    const options = [
        {value:1, name: 1, extras: [{value: 1, name: "1-A"},{value: 1, name: "1-B"},{value: 1, name: "1-C"},{value: 1, name: "1-D"},{value: 1, name: "1-F"}]},
        {value:2, name: 2, extras: [{value: 2, name: "2-A"},{value: 2, name: "2-B"},{value: 2, name: "2-C"},{value: 2, name: "2-D"},{value: 2, name: "2-F"}]},
        {value:3, name: 3, extras: [{value: 3, name: "3-A"},{value: 3, name: "3-B"},{value: 3, name: "3-C"},{value: 3, name: "3-D"},{value: 3, name: "3-F"}]},
        {value:4, name: 4, extras: [{value: 4, name: "4-A"},{value: 4, name: "4-B"},{value: 4, name: "4-C"},{value: 4, name: "4-D"},{value: 4, name: "4-F"}]},
        {value:5, name: 5, extras: [{value: 5, name: "5-A"},{value: 5, name: "5-B"},{value: 5, name: "5-C"},{value: 5, name: "5-D"},{value: 5, name: "5-F"}]},
        {value:6, name: 6, extras: [{value: 6, name: "6-A"},{value: 6, name: "6-B"},{value: 6, name: "6-C"},{value: 6, name: "6-D"},{value: 6, name: "6-F"}]},
        {value:7, name: 7, extras: [{value: 7, name: "7-A"},{value: 7, name: "7-B"},{value: 7, name: "7-C"},{value: 7, name: "7-D"},{value: 7, name: "7-F"}]},
        {value:8, name: 8, extras: [{value: 8, name: "8-A"},{value: 8, name: "8-B"},{value: 8, name: "8-C"},{value: 8, name: "8-D"},{value: 8, name: "8-F"}]},
        {value:9, name: 9, extras: [{value: 9, name: "9-A"},{value: 9, name: "9-B"},{value: 9, name: "9-C"},{value: 9, name: "9-D"},{value: 9, name: "9-F"}]},
        {value:10, name: 10, extras: [{value: 10, name: "10-A"},{value: 10, name: "10-B"},{value: 10, name: "10-C"},{value: 10, name: "10-D"},{value: 10, name: "10-F"}]},
        {value:11, name: 11, extras: [{value: 11, name: "11-A"},{value: 11, name: "11-B"},{value: 11, name: "11-C"},{value: 11, name: "11-D"},{value: 11, name: "11-F"}]},
        {value:12, name: 12, extras: [{value: 12, name: "12-A"},{value: 12, name: "12-B"},{value: 12, name: "12-C"},{value: 12, name: "12-D"},{value: 12, name: "12-F"}]},
        {value:13, name: 13, extras: [{value: 13, name: "13-A"},{value: 13, name: "13-B"},{value: 13, name: "13-C"},{value: 13, name: "13-D"},{value: 13, name: "13-F"}]},
        {value:14, name: 14, extras: [{value: 14, name: "14-A"},{value: 14, name: "14-B"},{value: 14, name: "14-C"},{value: 14, name: "14-D"},{value: 14, name: "14-F"}]},
        {value:15, name: 15, extras: [{value: 15, name: "15-A"},{value: 15, name: "15-B"},{value: 15, name: "15-C"},{value: 15, name: "15-D"},{value: 15, name: "15-F"}]}
    ]


        const notifyA = (message) => {
            toast.loading(message, {
                position: "bottom-center",
                toastId: TOASTID, 
                autoClose: false, 
                hideProgressBar: true,
                pauseOnFocusLoss: false,
                limit: 1 })};

        const updateToast = () => 
            toast.update(TOASTID, { 
                render: "Listo!", 
                type: toast.TYPE.SUCCESS, 
                autoClose: 1000, 
                isLoading: false,
                hideProgressBar: true,
                limit: 1,
                className: 'rotateY animated'});

        const showLoadingToast = () => {
            if(loading == true){
                notifyA(numberToast == 1 || numberToast == true ? "Cargando" : "Eliminando ejercicio...")
            }else{
                updateToast()
            }
        }    

        const aa = () => {
            toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
        };

        const ee = () => {
            toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        };

        const confirm1 = (event) => {
            confirmPopup({
                target: event.currentTarget,
                message: 'Are you sure you want to proceed?',
                icon: 'pi pi-exclamation-triangle',
                aa,
                ee
            });
        };

    //<button className="btn BlackBGtextWhite col-12" onClick={() => setCanvasFormulas(true)}>Formulas</button>
    return (

        <section className='container-fluid'>
            <Logo />

            <div className='row justify-content-center'>

                <button className='btn BlackBGtextWhite col-6 col-lg-2 my-2 mx-1' label="Show" icon="pi pi-external-link" onClick={() => setVisibleExercises(true)} >Añadir Ejercicio</button>

                <button className='btn BlackBGtextWhite col-6 col-lg-2 my-2 mx-1' label="Show" icon="pi pi-external-link" onClick={() => setVisibleCircuit(true)} >Añadir Circuito</button>
            </div>

            <div className="row justify-content-center">



                <div className='row justify-content-center'>
                    <Dialog className='col-12 col-lg-5' contentClassName={'colorDialog'} headerClassName={'colorDialog'}  header="Header" visible={visibleCircuit} modal={false} onHide={() => setVisibleCircuit(false)}>
                        <AddCircuit closeDialog={closeDialog} refresh={refresh}/>
                    </Dialog>
                    <Dialog className='col-12 col-lg-5' contentClassName={'colorDialog'} headerClassName={'colorDialog'} header="Header" visible={visibleExercises} modal={false} onHide={() => setVisibleExercises(false)}>
                        <AddExercise refresh={refresh}/>
                    </Dialog>

                </div>

                </div>


            <article className='col-12 justify-content-center'>

                


                <div className='row justify-content-center align-items-center text-center mt-5'>

                    
                    <button onClick={handleShowCreateMobility} className='btn border buttonColor col-9 col-md-5 mb-5'>Administrar bloque de entrada en calor</button>
                    {clicks}

                    <div className="table-responsive col-10">
                        <table className="table align-middle table-bordered caption-top">
                        <caption>Ejercicios</caption>
                            <thead>
                                <tr>
                                    <th className='TableResponsiveDayEditDetailsPage' scope="col">#</th>
                                    <th scope="col">Ejercicio</th>
                                    <th scope="col">Series</th>
                                    <th scope="col">Reps</th>
                                    <th className='TableResponsiveDayEditDetailsPage' scope="col">Peso</th>
                                    <th className='TableResponsiveDayEditDetailsPage' scope="col">Video</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {showLoadingToast()}
                                <TransitionGroup component={null} className="todo-list">
                                {day.map(({exercise_id,name, sets, reps, peso, video, notas, numberExercise,type, typeOfSets, circuit}) =>
                                <CSSTransition
                                key={exercise_id}
                                timeout={500}
                                classNames="item"
                                >
                                    <tr key={exercise_id}>
                                        <th className='TableResponsiveDayEditDetailsPage' scope="row">
                                        {type != 'exercise' ? <span>{numberExercise}</span> : <select  defaultValue={numberExercise} onChange={(e) =>{ editExercise(exercise_id, name, sets, reps, peso, video, e.target.value, e.target.value)}}>
                                            {options.map(option =>
                                            <optgroup key={option.value} label={option.name} >
                                                <option value={option.value}>{option.name}</option>

                                                {option.extras.map(element => 

                                                    <option key={element.name} >{element.name}</option>

                                                )}

                                            </optgroup>
                                            )}
                                            </select>}
                                        </th>
                                        {type != 'exercise' ? <td colSpan={window.screen.width > 600 ? 5 : 3} >
                                                                <table className='table align-middle'>
                                                                    <thead>
                                                                        <tr>
                                                                            <th colSpan={3}>{type} x {typeOfSets}</th>
                                                                        </tr>
                                                                        <tr>

                                                                            <th scope='col' className='mx-2'>Ejercicio</th>
                                                                            <th className='TableResponsiveDayEditDetailsPage mx-2' scope='col' >Reps</th>
                                                                            <th className='TableResponsiveDayEditDetailsPage mx-2' scope='col' >Peso</th>
                                                                        </tr>
                                                                        </thead>
                                                                    <tbody>
                                                                        {circuit.map(element =>
                                                                        <tr key={element.name}>

                                                                            <td >{element.name}</td>
                                                                            <td className='TableResponsiveDayEditDetailsPage'>{element.reps}</td>
                                                                            <td className='TableResponsiveDayEditDetailsPage'>{element.peso}</td>
                                                                        </tr>)}
                                                                    </tbody>
                                                                </table> 
                                                            </td> : 
                                    <td>
                                        <input 
                                        id='name' 
                                        className='form-control border-0' 
                                        type="text" 
                                        defaultValue={name} 
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                editExercise(exercise_id, event.target.value || null, sets, reps, peso, video, notas, numberExercise, valueExercise)
                                            }}} 
                                            onChange={changeNameEdit}/>
                                    </td>}
                                    {sets === undefined ? null :
                                    <td >
                                        <Toast ref={toastPop} />
                                        <ConfirmPopup />
                                        <InputNumber 
                                            value={sets} 
                                            onClick={confirm1}
                                            onValueChange={(e) => editExercise(exercise_id, name, e.value, reps, peso, video, notas, numberExercise, valueExercise)} 
                                            showButtons 
                                            buttonLayout={window.screen.width > 600 ? "horizontal" : "vertical"} 
                                            size={1} 
                                            min={1} 
                                            decrementButtonClassName="ButtonsInputNumber" 
                                            incrementButtonClassName="ButtonsInputNumber" 
                                            incrementButtonIcon="pi pi-plus" 
                                            decrementButtonIcon="pi pi-minus"
                                            className="WidthInputsWhenIsMobile" 
                                        />     
                                    </td>} 
                                    {reps === undefined ? null  : 
                                        <td>
                                            
                                            <InputNumber 
                                                    value={reps} 
                                                    onValueChange={(e) => editExercise(exercise_id, name, sets, e.value, peso, video, notas, numberExercise, valueExercise)} 
                                                    showButtons 
                                                    buttonLayout={window.screen.width > 600 ? "horizontal" : "vertical"} 
                                                    size={1} 
                                                    min={1} 
                                                    decrementButtonClassName="ButtonsInputNumber" 
                                                    incrementButtonClassName="ButtonsInputNumber" 
                                                    incrementButtonIcon="pi pi-plus" 
                                                    decrementButtonIcon="pi pi-minus"
                                                    className="WidthInputsWhenIsMobile" 
                                                />
                                        </td> 
                                    }
                                        
                                    {peso === undefined ? null :

                                        <td className='TableResponsiveDayEditDetailsPage'>
                                            
                                            <input 
                                            className='form-control border-0' 
                                            type="text" 
                                            defaultValue={peso}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter') {
                                                    editExercise(exercise_id, name, sets, reps, event.target.value, video, notas, numberExercise, valueExercise)
                                                }}}  
                                            onChange={changePesoEdit}/>
                                        
                                        </td> 
                                    }
                                    
                                    {video === undefined ? null : 
                                    
                                        <td className='TableResponsiveDayEditDetailsPage' >
                                            
                                            <input 
                                            className='form-control border-0' 
                                            type="text" 
                                            defaultValue={video}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter') {
                                                    editExercise(exercise_id, name, sets, reps, peso, event.target.value, notas, numberExercise, valueExercise)
                                                }}}  
                                            onChange={changeVideoEdit}/>
                                        
                                        </td>
                                    }
                                    <td>
                                        <button onClick={(e) => deleteExercise(e,exercise_id,name)} className='btn'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-trash3" viewBox="0 0 16 16">
                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                            </svg>
                                        </button>
                                        <button onClick={() => type != 'exercise' ? handleShowEditAmrap(exercise_id, type, typeOfSets, circuit,  numberExercise) : handleShowEditExercise(exercise_id, name, sets, reps, peso, video, notas, numberExercise, valueExercise)} className='btn'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                                    </CSSTransition>
                                )}
                                </TransitionGroup>

                            </tbody>
                            
                        </table>
                    </div>
                    </div>
                </article>

                <div className='d-flex justify-content-center'>
                    <Link className="btn BlackBGtextWhite text-center my-5" to={`/user/routine/${user_id}`}>Volver atrás</Link>
                </div>


                <ModalConfirmDeleteExercise show={show} handleClose={handleClose} closeModal={closeModal} week_id={week_id} day_id={day_id} exercise_id={exercise_id} name={nameExercise}/>
                <ModalEditExercise showEditExercise={showEditExercise} handleClose={handleClose} closeModal={closeModal}  week_id={week_id} day_id={day_id} exercise_id={exercise_id} nameModal={name} setsModal={sets} repsModal={reps} pesoModal={peso} videoModal={video} notasModal={notas}/>

                <ModalEditCircuit showEditCircuit={showEditCircuit} handleClose={handleClose} closeModal={closeModal} week_id={week_id} day_id={day_id} exercise_id={exercise_id} circuitExercises={circuit} type={type} typeOfSets={typeOfSets} numberExercise={numberExercise}/>

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