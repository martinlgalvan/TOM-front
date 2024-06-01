import { useEffect, useState, useRef } from 'react';
import {Link, useParams} from 'react-router-dom';

import * as ExercisesService from '../../services/exercises.services.js';
import * as WeekService from '../../services/week.services.js'; 
import * as DatabaseExercises from '../../services/jsonExercises.services.js'
import * as DatabaseUtils from '../../helpers/variables.js'
import * as Notify from '../../helpers/notify.js'
import * as RefreshFunction from '../../helpers/generateUUID.js'
import Options from '../../assets/json/options.json';


import CancelIcon from '@mui/icons-material/Cancel';
import Logo from '../../components/Logo.jsx'
import AddExercise from '../../components/AddExercise.jsx'
import ModalConfirmDeleteExercise from '../../components/Bootstrap/ModalConfirmDeleteExercise.jsx';
import ModalCreateWarmup from '../../components/Bootstrap/ModalCreateWarmup.jsx';
import Formulas from '../../components/Formulas.jsx';
import ModalEditCircuit from '../../components/Bootstrap/ModalEdit/ModalEditCircuit.jsx';
import AddCircuit from '../../components/AddCircuit.jsx';
import CustomInputNumber from '../../components/CustomInputNumber.jsx';
import EditExercise from '../../components/EditExercise.jsx';
import Warmup from '../../components/Bootstrap/ModalCreateWarmup.jsx';
import Floating from '../../helpers/Floating.jsx';

import { motion } from 'framer-motion';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Sidebar } from 'primereact/sidebar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Dialog } from 'primereact/dialog';
import { ToastContainer } from '../../helpers/notify.js';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from 'primereact/dropdown';
import { animated, useTransition } from '@react-spring/web';

import IconButton from '@mui/material/IconButton';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EditIcon from '@mui/icons-material/Edit';

// CORREGIR PROBLEMA DEL LENGTH, PASO PORQUE ELIMINE QUE SE CREE AUTOMATICAMENTE UN EXERCISES, PARA QUE LUEGO PUEDA CREAR UN INDEX DEL CAMPO ROUTINE.EXERCISES.EXERCISE_ID
function DayEditDetailsPage(){
    const {week_id} = useParams()
    const {day_id} = useParams()
    const {id} = useParams()
    const {username} = useParams()

    const [databaseUser, setDatabaseUser] = useState()
    const [weekName, setWeekName] = useState()
    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))
    const [status, setStatus] = useState(1)                             // Manejo de renderizado
    const [loading, setLoading] = useState(null)                        // Manejo de renderizado

    const [options, setOptions] = useState()                            // Carga de datos para el select

    const [circuit, setCircuit] = useState([])                          // Carga del circuit al modal
    const [exercises, setExercises] = useState([])                                  // Carga del array principal de ejercicios
    const [day, setDay] = useState([]) 

    const [modifiedDay, setModifiedDay] = useState([])                  // Array donde se copia la nueva rutina
    const [exerciseId, setExe] = useState([]) 

    const [show, setShow] = useState(false)                             // Modal para eliminar ejercicios
    const [showEditCircuit, setShowEditCircuit] = useState(false)       // Modal para editar los circuitos

    const [editExerciseMobile, setEditExerciseMobile] = useState(false);        // Modal para canvas de formulas
    const [warmup, setWarmup] = useState(false);        // Modal para canvas de formulas
    const [firstWidth, setFirstWidth] = useState();        //Variables para las modales de primeReact



    const [visibleCircuit, setVisibleCircuit] = useState(false);        //Variables para las modales de primeReact
    const [visibleExercises, setVisibleExercises] = useState(false);    //
    const [visibleEdit, setVisibleEdit] = useState(false);              //-------------------*

    const [visible, setVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const op = useRef(null);
    let idRefresh = RefreshFunction.generateUUID()



    useEffect(() => {
        setDatabaseUser(localStorage.getItem('DATABASE_USER'))
        if(DatabaseUtils.DATABASE_EXERCISES != null){
          DatabaseExercises.findExercises(DatabaseUtils.USER_ID).then((data) => setDatabaseUser(data))
        } 
    }, []);


    useEffect(() => {


        setLoading(true)
        Notify.notifyA("Cargando")
    

        WeekService.findByWeekId(week_id)
            .then(data => {
                setWeekName(data[0].name)
                let indexDay = data[0].routine.findIndex(dia => dia._id === day_id) // De la base de datos, selecciono el día correspondiente
                let day = data[0].routine[indexDay].exercises                       // Cargo únicamente los ejercicios
                let onlyExercises = day != null ? day.filter(circuito => circuito.type == 'exercise') : null                     // Cargo únicamente los ejercicios

                let circuit = day != null ? day.filter(circuito => circuito.type != 'exercise') : null  // Cargo únicamente los ejercicios del circuito

                let warmup  =  data[0].routine[indexDay].warmup
                
                console.log(circuit)
                setCircuit(circuit)                     // establece los ejercicios del circuito para renderizarlo luego a la hora de editar
                setDay(day)   
                setExercises(onlyExercises)
                console.log(day)
                setModifiedDay(day)                           // array de objetos inicial, son los ejercicios
                setLoading(false)                       // load principal

                try {
                    Notify.updateToast();
                } catch (error) {
                    console.error("Error actualizando notificación:", error);
                }


            })
}, [status])

    useEffect(() => {
        setFirstWidth(window.innerWidth)
        
    const groupedOptions = Options.reduce((acc, group) => {
        acc.push({ label: group.label, value: group.value, disabled: null });
        acc.push(...group.items);
        return acc;
    }, [])

    setOptions(groupedOptions)

    }, [])


const refresh = (refresh) => setStatus(refresh)


const refreshEdit = (le) => {
    setLoading(true)
    setStatus(idRefresh)
    setEditExerciseMobile(false)
    setWarmup(false)
}


const handleButtonClick = (rowData) => {
    setSelectedRow(rowData);
    setVisible(true);
};

const confirmDelete = () => {
    console.log("eliminado!");
    setVisible(false);

};
    //Modal Edit Exercise

    const [completeExercise, setCompleteExercise] = useState()
    const [completeCircuit, setCompleteCircuit] = useState()
    const [indexOfExercise, setIndexOfExercise] = useState()
    const [indexOfCircuit, setIndexOfCircuit] = useState()
    const [isEditing, setIsEditing] = useState(false)


    const handleClose = () => {
        setShow(false);
        setShowEditCircuit(false)
        setStatus(idRefresh)

    } 

    const closeModal = () => {
        setShow(false);
        setShowEditCircuit(false)
        
    } 

    const closeDialog = (close) => setVisibleExercises(close)


    const handleCloseDialog = () => {setVisibleCircuit(false), setVisibleExercises(false), setVisibleEdit(false)}

    const productRefs = useRef([]);



    const propiedades = ['#', 'Nombre', 'Series', 'Reps', 'Peso', 'Rest', 'Video', 'Notas', 'Acciones'];
    

    // --------------------- EDIT CIRCUIT FUNCTIONS

    function handleShowEditCircuit(circuit, index,  id){
        setIndexOfCircuit(index)
        setCompleteCircuit(circuit)
        setShowEditCircuit(true)

    }    








    

    // ------------  EDIT FUNCTIONS

    function handleEditMobileExercise(elementsExercise, index){
        setIndexOfExercise(index)
        setCompleteExercise(elementsExercise)
        setEditExerciseMobile(true)
    }

    const changeModifiedData = (index, value, field, aa) => {
        console.log(index, value, field, aa)
        setIsEditing(true)
        const updatedExercises = [...modifiedDay];
        updatedExercises[index] = { ...updatedExercises[index], [field]: value };
        setModifiedDay(updatedExercises);
        console.log(index, value, field, aa)
    };

    const customInputEditDay = (data, index, field) =>{



        if(field === 'sets' || field === 'reps'){
            return <CustomInputNumber initialValue={data}
            onChange={(e) => changeModifiedData(index, e, field)}
            isRep={field === 'reps' ? true : false}
            onValueChange={() => handleInputFocus(index)}
            value={data} 
            className={`mt-5`}/>
        } else if (field  === 'video') {
            return <>
           <IconButton
            aria-label="video"
            className="w-100"
            onClick={(e) => {
              productRefs.current[index].toggle(e);
            }}
            >
            <YouTubeIcon className='colorIconYoutube' />
            </IconButton>
            <OverlayPanel ref={(el) => (productRefs.current[index] = el)}>
                <input
                className='form-control ellipsis-input text-center'
                type="text"
                defaultValue={data}
                onChange={(e) => changeModifiedData(index, e.target.value, field)}
                />
            </OverlayPanel>
                </>
        } else if(field === 'notas'){        
            return <InputTextarea className='textAreaResize' autoResize value={data == null ? "" : data} onChange={(e) => changeModifiedData(index, e.target.value, field)} />
  
        } else{
            return <input 
            className={`form-control ${firstWidth ? 'border' : 'border-0'} ellipsis-input text-center`} 
            type="text" 
            defaultValue={data}
            onChange={(e) => changeModifiedData(index, e.target.value, field)}
            
        />
        }

    }

    const applyChanges = () => {

        ExercisesService.editExercise(week_id, day_id, modifiedDay)
            .then((data) => {
                setStatus(idRefresh)
                setIsEditing(false)
            } )
        
      };



    // --------------------- DELETE ACTIONS

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

    const handleDeleteClick = (exercise) => {
        setExerciseToDelete(exercise);
        setShowDeleteDialog(true);
    };
    
    const handleDeleteConfirm = () => {
        if (exerciseToDelete) {
            acceptDeleteExercise(exerciseToDelete.exercise_id);
        }
        setShowDeleteDialog(false);
        setExerciseToDelete(null);
    };
    

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setExerciseToDelete(null);
    };

    const deleteExercise = (event, id, name) => {
        name = name || "Sin nombre";
        handleDeleteClick({ exercise_id: id, name });
    };

    function acceptDeleteExercise(id) {
        Notify.notifyA("Cargando");

        ExercisesService.deleteExercise(week_id, day_id, id)
        .then(() => {
            // Actualizar el estado modifiedDay eliminando el ejercicio por id
            const updatedExercises = modifiedDay.filter(exercise => exercise.exercise_id !== id);
            setModifiedDay(updatedExercises);
            setStatus(idRefresh); // Opcional, si es necesario
            setLoading(false)
            setIsEditing(false)

            Notify.updateToast()
        })       
        .catch(error => {
            console.error("Error aplicando cambios:", error);
            Notify.notifyA("Error aplicando cambios");
        });
    };

    const transitions = useTransition(modifiedDay, {
        from: { opacity: 0, scale: 0.9,},
        enter: { opacity: 1, scale: 1, },
        leave: { opacity: 0, scale: 0.9},
        config: { tension: 350, friction: 20 },
        delay: 200,
        keys: item => item.exercise_id,
      });

    const tableMobile = () => {

        return <div className="table-responsiveCss">
                    <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Peso</th>
                                    <th>Sets</th>
                                    <th>Reps</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                            {transitions((styles, exercise, i) => (
                            <animated.tr key={exercise.exercise_id} style={styles}>
                                
                                    {exercise.type == 'exercise' ?
                                        <>                                    

                                            <td data-th="Nombre">{customInputEditDay(exercise.name, i, 'name')}</td>
                                            <td data-th="Peso">{customInputEditDay(exercise.peso, i, 'peso')}</td>
                                            <td data-th="Sets">{customInputEditDay(exercise.sets, i, 'sets')}</td>
                                            <td data-th="Reps">{customInputEditDay(exercise.reps, i, 'reps')}</td>
                                            <td className='notStyle'>
                                                <div className='row justify-content-center mt-2'>
                                                    <div className='col-6'>
                                                        <Dropdown 
                                                        value={exercise.numberExercise} 
                                                        options={options} 
                                                        onChange={(e) => {changeModifiedData(i,e.target.value, 'numberExercise')}}
                                                        placeholder="Select an item"
                                                        optionLabel="label"
                                                        className="p-dropdown-group w-100"
                                                    />
                                                    </div>
                                                    <div className='col-6'>
                                                        <IconButton aria-label="video" className=" styleButtonsEdit  me-5 rounded-0" onClick={(e) => deleteExercise(e, exercise.exercise_id, exercise.name)}>
                                                                    <CancelIcon className='bbbbb' />
                                                                </IconButton>
                                                                <IconButton aria-label="edit" className=" btn btn-outline-light me-3 rounded-0" onClick={() => handleEditMobileExercise(exercise, i)}>
                                                                    <EditIcon className='colorPencil text-end'  />
                                                        </IconButton>
                                                    </div>
                                                        
                                                </div>
                                            </td> 
                                        </>
                                    
                                : <>
                                            <td data-th={"Nombre"} className=''>{exercise.type}</td>
                                            <td data-th={"Series"} className=''>{exercise.typeOfSets}</td>
                                            <td className='notStyle'>{exercise.circuit.map(item => 
                                                <div className='row justify-content-around' key={item.idRefresh}>
                                                <span className='col-6'>{item.name}</span><span className='col-3'>{item.reps}</span><span className='col-3' >{item.peso}</span>
                                                </div>)}
                                            </td>

                                            <td className='notStyle'>
                                                <div className='row justify-content-center mt-2'>
                                                    <div className='col-6'>
                                                        <Dropdown 
                                                        value={exercise.numberExercise} 
                                                        options={options} 
                                                        onChange={(e) => {changeModifiedData(i,e.target.value, 'numberExercise')}}
                                                        placeholder="Select an item"
                                                        optionLabel="label"
                                                        className="p-dropdown-group w-100"
                                                    />
                                                    </div>
                                                    <div className='col-6'>
                                                        <IconButton aria-label="video" className=" styleButtonsEdit  me-5 rounded-0" onClick={(e) => deleteExercise(e, exercise.exercise_id, exercise.name)}>
                                                                    <CancelIcon className='bbbbb' />
                                                                </IconButton>
                                                                <IconButton aria-label="edit" className=" btn btn-outline-light me-3 rounded-0" onClick={() => handleShowEditCircuit(exercise, i)}>
                                                                    <EditIcon className='colorPencil text-end'  />
                                                        </IconButton>
                                                    </div>
                                                        
                                                </div>
                                            </td> 
                                            </>}
                                        </animated.tr>
                             
                              ))}
                                
                            </tbody>
                     </table>
                        
                </div>
                            

    }


    const handleShowWarmup = () => setWarmup(true)

    return (

        <section className='container-fluid'>
            <Logo />

            <div className='row justify-content-center'>
                <div className='col-10 col-lg-6 text-center'>

                    <p className='fs-5'>Planificación de {username} - <b>{weekName}</b></p>

                </div>
            </div>

            <div className='row justify-content-center mb-5'>
                    <button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} col-6 col-lg-2 my-2 mx-1`} style={{ "backgroundColor": `${color}` }} label="Show" icon="pi pi-external-link" onClick={() => setVisibleExercises(modifiedDay)}>Añadir Ejercicio</button>

                    <button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} col-6 col-lg-2 my-2 mx-1`} style={{ "backgroundColor": `${color}` }} label="Show" icon="pi pi-external-link" onClick={() => setVisibleCircuit(true)}>Añadir Circuito</button>

                    
                <div className='col-12 mt-4 text-center'>

<button onClick={handleShowWarmup} className='btn border buttonColor '>Administrar bloque de entrada en calor</button>

</div>

                </div>


                <div className='row justify-content-center'>
                    {warmup.length > 0 && <div className='col-11 col-xxl-10'>
                        <WarmupExercises /> 

                    </div>}
                </div>

                    <div className='row justify-content-center'>
                        <Dialog 
                            className='col-12 col-md-10 col-xl-5' 
                            contentClassName={'colorDialog'} 
                            headerClassName={'colorDialog'}  
                            header="Crear circuito" 
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
                            className='col-12 col-md-10 col-xl-5' 
                            contentClassName={'colorDialog'} 
                            headerClassName={'colorDialog'} 
                            header="Crear ejercicio" 
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

                

            <div className='row justify-content-center'>

                {firstWidth > 992 ? <div className={`table-responsive col-11 col-lg-11`}>
                    <table className={`table table-hover align-middle fontTable text-center ${isEditing && 'table-light'} `}>
                        <thead>
                        <tr>
                            {propiedades.map((propiedad, index) => (
                            <th key={propiedad} className={`td-${index}`} scope="col">{propiedad == 'Acciones' ? '#' : propiedad}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {modifiedDay.map((exercise, i) => (
                            <tr key={exercise.exercise_id}>
                                    <td className='td-0'>
                                        <Dropdown 
                                                value={exercise.numberExercise} 
                                                options={options} 
                                                onChange={(e) => {changeModifiedData(i, e.target.value, 'numberExercise')}}
                                                placeholder="Select an item"
                                                optionLabel="label"
                                                className="p-dropdown-group w-100"
                                            />
                                    </td>
                                    {exercise.type === 'exercise' ? (
                                        <>
                                            <td className='td-1'>{customInputEditDay(exercise.name, i,'name')}</td>
                                            <td className='td-2'>{customInputEditDay(exercise.sets, i, 'sets')}</td>
                                            <td className='td-3'>{customInputEditDay(exercise.reps, i, 'reps')}</td>
                                            <td className='td-4'>{customInputEditDay(exercise.peso, i, 'peso')}</td>
                                            <td className='td-5'>{customInputEditDay(exercise.rest, i, 'rest')}</td>
                                            <td className='td-6'>{customInputEditDay(exercise.video, i, 'video')}</td>
                                            <td className='td-7'>{customInputEditDay(exercise.notas, i, 'notas')}</td>
                                            <td className='td-8'>
                                                <div className='row justify-content-center'>
                                                    <IconButton aria-label="video" className="col-12" onClick={(e) => deleteExercise(e, exercise.exercise_id, exercise.name)}>
                                                        <CancelIcon className='colorIconDeleteExercise' />
                                                    </IconButton>
                                                    {firstWidth < 700 && (
                                                        <IconButton aria-label="edit" className="col-12">
                                                            <EditIcon className='colorPencil' onClick={() => handleEditMobileExercise(exercise, i)} />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>

                                

                                            <td colSpan="7" className='td-3'>
                                                <table className="table text-center">
                                                    <thead className='text-center'>
                                                        <tr  >
                                                        <th colSpan={8} className='td-1'>Nombre: {exercise.type}</th>
                                                        </tr>
                                                        <tr className='text-center'>
                                                        <th  colSpan={8} className='td-1'>Series: {exercise.typeOfSets}</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Nombre</th>
                                                            <th>Reps</th>
                                                            <th>Peso</th>
                                                            <th>Video</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>



                                                        {exercise.circuit.map((circuitExercise, j) => (
                                                            <tr key={circuitExercise.idRefresh}>
                                                                <td>{circuitExercise.name}</td>
                                                                <td>{circuitExercise.reps}</td>
                                                                <td>{circuitExercise.peso}</td>
                                                                <td>{circuitExercise.video}</td>
                                                            </tr>
                                                        ))}
                                </tbody>
                            </table>
                        </td>
                        <td className='td-8'>
                            <div className='row justify-content-center'>
                                <IconButton aria-label="video" className="col-10 my-1" onClick={(e) => deleteExercise(e, exercise.exercise_id, exercise.name)}>
                                    <CancelIcon className='colorIconDeleteExercise' />
                                </IconButton>

                                <IconButton aria-label="edit" className="col-8 my-1 colorIcon"  onClick={() => handleShowEditCircuit(exercise, i)}>
                                        <EditIcon className='colorPencil'  />
                                </IconButton>

                            </div>
                        </td>
                    </>
                )}
            </tr>
        ))}
    </tbody>
                    </table>
                
                </div> : tableMobile()}
          
            </div>

            {isEditing && (
                 <div className="floating-button">
                 <button className="btn colorRed p-4 my-3 fs-5"  onClick={() => applyChanges()} >Guardar</button>
                 <button className="btn colorCancel p-4 my-3 fs-5" onClick={() => setIsEditing(false)}>Cancelar</button>
             </div>
            )}

            <ConfirmDialog
            visible={visible}
            onHide={() => setVisible(false)}
            message="¿Estás seguro de que deseas eliminar este elemento?"
            header="Confirmación"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Eliminar"
            acceptClassName="p-button-danger"
            rejectLabel="Cancelar"
            accept={confirmDelete}
            reject={() => setVisible(false)}
        />

                {!isEditing && <Floating link={`/user/routine/${id}/${username}`} />}

                <Dialog 
                    className='col-12 col-md-10 col-xxl-5' 
                    contentClassName={'colorDialog'} 
                    headerClassName={'colorDialog'} 
                    header="Header" 
                    visible={visibleEdit} 
                    modal={false} 
                    onHide={() => setVisibleEdit(false)}>

                </Dialog>

      

                {completeCircuit && <ModalEditCircuit showEditCircuit={showEditCircuit} handleClose={handleClose} closeModal={closeModal} refresh={refresh} week_id={week_id} day_id={day_id} circuit={completeCircuit} />}

               
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
                    header={`${exerciseToDelete?.name || ''}`}
                    className='dialogDeleteExercise'
                    visible={showDeleteDialog}
                    style={{  width: `${firstWidth > 991 ? '50vw' : '80vw'}` }}
                    footer={
                        <div className='row justify-content-center '>
                            <div className='col-lg-12 me-3'>

                                <button className="btn btn-outlined-secondary" onClick={handleDeleteCancel}>No</button>
                                <button className="btn btn-danger" onClick={handleDeleteConfirm}>Sí, eliminar</button>
                                                            
                            </div>
                        </div>
                    }
                    onHide={handleDeleteCancel}
                >
                    <p className='p-4'>¡Cuidado! Estás por eliminar <b>"{exerciseToDelete?.name}"</b>. ¿Estás seguro?</p>
                </Dialog>

                    <Dialog 
                        className='col-12 col-md-10' 
                        contentClassName={'colorDialog'} 
                        headerClassName={'colorDialog'}  
                        header="Header" 
                        visible={warmup} 
                        scrollable={"true"}
                        modal={false} 
                        onHide={() => setWarmup(false)}
                        blockScroll={window.innerWidth > 600 ? false : true}>

                        <ModalCreateWarmup  completeExercise={modifiedDay} week_id={week_id} day_id={day_id} indexOfExercise={indexOfExercise} refreshEdit={refreshEdit}/>
                    </Dialog>

        </section>
    )
}

export default DayEditDetailsPage