import { useEffect, useState, useRef } from 'react';
import {Link, useParams} from 'react-router-dom';

import * as ExercisesService from '../../services/exercises.services.js';
import * as WeekService from '../../services/week.services.js'; 
import * as DatabaseExercises from '../../services/jsonExercises.services.js'
import Options from '../../assets/json/options.json';
import * as DatabaseUtils from '../../helpers/variables.js'
import * as Notify from '../../helpers/notify.js'
import * as RefreshFunction from '../../helpers/generateUUID.js'

import { ConfirmDialog, confirmDialog  } from 'primereact/confirmdialog';
import { Sidebar } from 'primereact/sidebar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Dialog } from 'primereact/dialog';
import { ToastContainer } from '../../helpers/notify.js';

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

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { SelectButton } from 'primereact/selectbutton';
import { InputSwitch } from 'primereact/inputswitch';

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
                console.log(day)
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

    const changeNameEdit = (e) => {
        console.log(e.rowIndex, e.value, e.props.value[e.rowIndex], e.props.editingMeta[e.rowIndex].fields[0])
        //console.log(primeraPropiedad)
        /*const updatedModifiedDay = [...modifiedDay];
        updatedModifiedDay[index].name = e.target.value;
        setModifiedDay(updatedModifiedDay);*/

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
        console.log(modifiedDay)
        /*setDay(modifiedDay);        // Gracias a esto se ven los cambios reflejados en pantalla.
        ExercisesService.editExercise(week_id, day_id, modifiedDay)
            .then((data) => {setStatus(idRefresh)} )*/
        
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


    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(day);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'day');
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });

                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };



    const [products, setProducts] = useState(null);

    const columns = [
        { field: 'numberExercise', header: '#' },
        { field: 'name', header: 'Name' },
        { field: 'sets', header: 'Sets' },
        { field: 'reps', header: 'Reps' },
        { field: 'peso', header: 'Peso' },
        { field: 'rest', header: 'Rest' },
        { field: 'video', header: 'Video' },
        { field: 'notas', header: 'Notas' },
    ];


    const isPositiveInteger = (val) => {
        let str = String(val);

        str = str.trim();

        if (!str) {
            return false;
        }

        str = str.replace(/^0+/, '') || '0';
        let n = Math.floor(Number(str));

        return n !== Infinity && String(n) === str && n >= 0;
    };


    const onCellEditComplete = (e) => {


        let { rowData, newValue, rowIndex, field, originalEvent: event } = e;


        if (newValue !== null && newValue !== undefined) {
            switch (field) {
                case 'sets':
                case 'reps':
                    if (isPositiveInteger(newValue)) {
                        rowData[field] = newValue;
                        const updatedModifiedDay = [...modifiedDay];
                        updatedModifiedDay[rowIndex].field = newValue;
                        setModifiedDay(updatedModifiedDay);
                
                    } else {
                        event.preventDefault();
                    }
                    break;
    
                default:
                    if (newValue.trim().length > 0) {
                        rowData[field] = newValue;
                        const updatedModifiedDay = [...modifiedDay];
                        updatedModifiedDay[rowIndex].field = newValue;
                        setModifiedDay(updatedModifiedDay);
                
                    } else {
                        event.preventDefault();
                    }
                    break;
            }
        } else {
            // Hacer algo si el valor es nulo, por ejemplo, mostrar un mensaje de error
            event.preventDefault();
        }
    };



    const cellEditor = (options) => {
       if (!isNaN(options.value)) return numberEditor(options);
       return textEditor(options);
    };



    const textEditor = (options) => {
        console.log(options)
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />;
    };


    const [rowIsTextMode, setRowIsTextMode] = useState();


    const handleSelectChange = (e,rowIndex) => {
        console.log(e, rowIndex)
        setRowIsTextMode(e.value)

        //setModifiedDay([...modifiedDay]); // Actualizar el estado para reflejar el cambio
    };

    const numberEditor = (options) => {
     

        console.log(options)
            
                if(rowIsTextMode != 'text') {
                    return <>
                        <InputNumber value={options.value} showButtons buttonLayout="horizontal" onValueChange={(e) => options.editorCallback(e.value)}  onKeyDown={(e) => e.stopPropagation()} /> 
                        
                        <SelectButton className='styleSelectButton' value={rowIsTextMode == 'text' ? true : false} onChange={(e) => handleSelectChange(e, options.rowIndex)} options={[
                        { label: 'Text', value: 'text' },
                        ]} /> 
                    </>
                } else{  
                    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />}

           } 


            

    const setsTemplate = (rowData) => {

        return <InputNumber value={rowData.sets} showButtons buttonLayout="horizontal"  />;
    };

    const hasNonNumber = !/^\d+$/.test(String());



    const repsTemplate = (rowData) => {

        return <>
        {!isNaN(rowData.reps)  ? <InputNumber value={rowData.reps} showButtons buttonLayout="horizontal"  /> : <p>{rowData.reps}</p>}
 
        </>;
    };




    
    return (

        <section className='container-fluid'>
            <Logo />

            <div className='row justify-content-center'>
                    <button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} col-6 col-lg-2 my-2 mx-1`} style={{ "backgroundColor": `${color}` }} label="Show" icon="pi pi-external-link" onClick={() => setVisibleExercises(modifiedDay)} >Añadir Ejercicio</button>

                    <button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} col-6 col-lg-2 my-2 mx-1`} style={{ "backgroundColor": `${color}` }} label="Show" icon="pi pi-external-link" onClick={() => setVisibleCircuit(true)} >Añadir Circuito</button>
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
                <div className="card p-fluid">






                    <DataTable value={day} editMode="cell" tableStyle={{ minWidth: '50rem' }}>
                        {columns.map(({ field, header }) => {
                            return <Column key={field} field={field} header={header} style={{ width: '25%' }} body={field === 'sets'  ? setsTemplate : field  ===  'reps' ?  repsTemplate  : null } editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} />;
                        })}
                    </DataTable>
                </div>
                <div>
                    <button onClick={applyChanges}>VER</button>
                </div>








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