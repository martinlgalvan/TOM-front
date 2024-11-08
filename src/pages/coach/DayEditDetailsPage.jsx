import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import * as ExercisesService from "../../services/exercises.services.js";
import * as WeekService from "../../services/week.services.js";
import * as DatabaseExercises from "../../services/jsonExercises.services.js";
import * as PARService from '../../services/par.services.js';
import * as DatabaseUtils from "../../helpers/variables.js";
import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";
import Options from "../../assets/json/options.json";
import Exercises from "../../assets/json/NEW_EXERCISES.json";


import Logo from "../../components/Logo.jsx";
import AddExercise from "../../components/AddExercise.jsx";
import ModalConfirmDeleteExercise from "../../components/Bootstrap/ModalConfirmDeleteExercise.jsx";
import ModalCreateWarmup from "../../components/Bootstrap/ModalCreateWarmup.jsx";
import Formulas from "../../components/Formulas.jsx";
import ModalEditCircuit from "../../components/Bootstrap/ModalEdit/ModalEditCircuit.jsx";
import AddCircuit from "../../components/AddCircuit.jsx";
import CustomInputNumber from "../../components/CustomInputNumber.jsx";
import EditExercise from "../../components/EditExercise.jsx";
import Warmup from "../../components/Bootstrap/ModalCreateWarmup.jsx";
import Floating from "../../helpers/Floating.jsx";

import { motion } from "framer-motion";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Sidebar } from "primereact/sidebar";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Dialog } from "primereact/dialog";

import { OverlayPanel } from "primereact/overlaypanel";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { animated, useTransition } from "@react-spring/web";
import { Segmented } from "antd";
import SaveIcon from '@mui/icons-material/Save';


import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import AutoComplete from "../../components/Autocomplete.jsx";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from "@mui/icons-material/Cancel";

import ObjectId from 'bson-objectid';
import { update } from "lodash";

// CORREGIR PROBLEMA DEL LENGTH, PASO PORQUE ELIMINE QUE SE CREE AUTOMATICAMENTE UN EXERCISES, PARA QUE LUEGO PUEDA CREAR UN INDEX DEL CAMPO ROUTINE.EXERCISES.EXERCISE_ID
function DayEditDetailsPage() {
    const { week_id } = useParams();
    const { day_id } = useParams();
    const { id } = useParams();
    const { username } = useParams();

    const [routine, setRoutine] = useState();
    const [databaseUser, setDatabaseUser] = useState();
    const [weekName, setWeekName] = useState();
    const [dayName, setDayName] = useState();
    const [color, setColor] = useState(localStorage.getItem("color"));
    const [textColor, setColorButton] = useState(localStorage.getItem("textColor"));
    const [status, setStatus] = useState(1); // Manejo de renderizado
    const [statusCancel, setStatusCancel] = useState(1); // Manejo de renderizado
    const [loading, setLoading] = useState(null); // Manejo de renderizado

    const [isEditingWeekName, setIsEditingWeekName] = useState(false);
    const [newWeekName, setNewWeekName] = useState(weekName);

    const [options, setOptions] = useState(); // Carga de datos para el select

    const [circuit, setCircuit] = useState([]); // Carga del circuit al modal
    const [exercisesDatabase, setExercisesDatabase] = useState([]); // Carga del array principal de ejercicios
    const [day, setDay] = useState([]);

    const [modifiedDay, setModifiedDay] = useState([]); // Array donde se copia la nueva rutina
    const [exerciseId, setExe] = useState([]);

    const [show, setShow] = useState(false); // Modal para eliminar ejercicios
    const [showEditCircuit, setShowEditCircuit] = useState(false); // Modal para editar los circuitos

    const [editExerciseMobile, setEditExerciseMobile] = useState(false); // Modal para canvas de formulas
    const [warmup, setWarmup] = useState(false); // Modal para canvas de formulas
    const [firstWidth, setFirstWidth] = useState(); //Variables para las modales de primeReact

    const [visibleCircuit, setVisibleCircuit] = useState(false); //Variables para las modales de primeReact
    const [visibleExercises, setVisibleExercises] = useState(false); //
    const [visibleEdit, setVisibleEdit] = useState(false); //-------------------*

    const [visible, setVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const op = useRef(null);
    let idRefresh = RefreshFunction.generateUUID();

    const [allDays, setAllDays] = useState([]);
    const [indexDay, setIndexDay] = useState(0);
    const [currentDay, setCurrentDay] = useState(null);

    const [originalDay, setOriginalDay] = useState([]); // Almacena los datos originales
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const [showDeleteDayDialog, setShowDeleteDayDialog] = useState(false); // Estado para mostrar o no el popup

    const [isEditingName, setIsEditingName] = useState(false); // Controla si se está editando el nombre
    const [newDayName, setNewDayName] = useState(""); // Almacena el nuevo nombre temporalmente
    const [dayToEdit, setDayToEdit] = useState(null); // Almacena el día actual que está siendo editado

    const [editMode, setEditMode] = useState(false); // Estado para el "Modo Edición"
    const overlayNotesRefs = useRef([]); // Referencias para los overlay panels de las notas

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);


    useEffect(() => {
        const local = localStorage.getItem("DATABASE_USER");

        if (local != null) {
            setExercisesDatabase(databaseUser);
        } else {
            setExercisesDatabase(Exercises);

        }
    }, []);

    useEffect(() => {
        setDatabaseUser(localStorage.getItem("DATABASE_USER"));
        if (DatabaseUtils.DATABASE_EXERCISES != null) {
            DatabaseExercises.findExercises(DatabaseUtils.USER_ID).then(
                (data) => setDatabaseUser(data)
            );
        }
    }, []);


    useEffect(() => {
        setLoading(true);
        Notify.notifyA("Cargando");

        WeekService.findByWeekId(week_id).then((data) => {
            setRoutine(data[0]); // Guardar toda la estructura
            setWeekName(data[0].name)
            setModifiedDay(data[0].routine)
            setAllDays(data[0].routine);
            setDay(data[0].routine);
            setOriginalDay(data[0].routine[0]); // Almacena el estado original
            setCurrentDay(data[0].routine[0]);
            Notify.updateToast();

       
        });
    }, [statusCancel]);

        
    useEffect(() => {

        setCurrentDay(null)


    }, [statusCancel]);


    useEffect(() => {
        setFirstWidth(window.innerWidth);

        const groupedOptions = Options.reduce((acc, group) => {
            acc.push({
                label: group.label,
                value: group.value,
                disabled: null,
            });
            acc.push(...group.items);
            return acc;
        }, []);

        setOptions(groupedOptions);
    }, []);

    const refresh = (refresh) => setStatus(refresh);

    const refreshEdit = (le) => {
        setLoading(true);
        setStatus(idRefresh);
        setEditExerciseMobile(false);
        setWarmup(false);
    };

    const editAndClose = () => {
    const handleButtonClick = (rowData) => {
        setSelectedRow(rowData);
        setVisible(true);
    };

    const confirmDelete = () => {

        setVisible(false);
    };
    //Modal Edit Exercise

    const [completeExercise, setCompleteExercise] = useState();
    const [completeCircuit, setCompleteCircuit] = useState();
    const [indexOfExercise, setIndexOfExercise] = useState();
    const [indexOfCircuit, setIndexOfCircuit] = useState();
    const [isEditing, setIsEditing] = useState(false);

    const handleClose = () => {
        setShow(false);
        setShowEditCircuit(false);
        setStatus(idRefresh);
    };

    const hideDialogWarmup = () => {
        setWarmup(false)
    };

    const closeModal = () => {
        setShow(false);
        setShowEditCircuit(false);
    };


    const productRefs = useRef([]);

    const propiedades = [
        "#",
        "Nombre",
        "Series",
        "Reps",
        "Peso",
        "Rest",
        "Video",
        "Notas",
        "Acciones",
    ];

    // ------------  EDIT FUNCTIONS

    function handleEditMobileExercise(elementsExercise, index) {
        setIndexOfExercise(index);
        setCompleteExercise(elementsExercise);
        setEditExerciseMobile(true);
    }

    



    const customInputEditDay = (data, index, field) => {
        if (field === "sets" || field === "reps") {
            return (
                <CustomInputNumber
                    ref={(el) => (inputRefs.current[`${index}-${field}`] = el)} // Asigna una referencia única para cada campo
                    initialValue={data}
                    onChange={(e) => changeModifiedData(index, e, field)} // Utiliza el valor correcto de `e.target.value`
                    isRep={field === "reps"}
                    className={`mt-5`}
                />
            );
        } else if (field === "video") {
            return (
                <>
                    <IconButton
                        aria-label="video"
                        className="w-100"
                        onClick={(e) => {
                            productRefs.current[index].toggle(e);
                        }}
                    >
                        <YouTubeIcon className="colorIconYoutube" />
                    </IconButton>
                    <OverlayPanel ref={(el) => (productRefs.current[index] = el)}>
                        <input
                            ref={(el) => (inputRefs.current[`${index}-${field}`] = el)} // Asigna una referencia única
                            className="form-control ellipsis-input text-center"
                            type="text"
                            defaultValue={data}
                            onChange={(e) => changeModifiedData(index, e.target.value, field)} // Asegúrate de capturar `e.target.value`
                        />
                    </OverlayPanel>
                </>
            );
        } else if (field === "notas") {
            return (
                <div className="row">

                    <InputTextarea
                        ref={(el) => (inputRefs.current[`${index}-${field}`] = el)} // Asigna una referencia única
                        className={`textAreaResize ${firstWidth < 600 && 'col-11'}`}
                        autoResize
                        defaultValue={data}
                        onChange={(e) => changeModifiedData(index, e.target.value, field)} // Asegúrate de capturar `e.target.value`
                    />
                                        
                </div>
            );
        } else {
            return (
                <input
                    ref={(el) => (inputRefs.current[`${index}-${field}`] = el)} // Asigna una referencia única
                    className={`form-control ${firstWidth ? "border" : "border-0"} ellipsis-input text-center`}
                    placeholder={ field == 'rest' ? `2'...` : "kg..."}
                    type="text"
                    defaultValue={data}
                    onChange={(e) => changeModifiedData(index, e.target.value, field)} // Asegúrate de capturar `e.target.value`
                />
            );
        }
    };
    
    

    const changeModifiedData = (index, value, field) => {
        setIsEditing(true);
        const updatedDays = [...day];
    
        // Actualizar el ejercicio modificado
        updatedDays[indexDay].exercises[index] = {
            ...updatedDays[indexDay].exercises[index],
            [field]: value,
        };
    
        // Actualizar el campo `lastEdited` con la fecha actual
        updatedDays[indexDay].lastEdited = new Date().toISOString();
    
        setModifiedDay(updatedDays);
    };
    
    
    
    const applyChanges = () => {

        WeekService.editWeek(week_id, modifiedDay)
            .then((data) => {
                Notify.instantToast("Rutina guardada con éxito!")
                setStatus(idRefresh);
                setIsEditing(false);
              
            });
    };

    // --------------------- DELETE ACTIONS



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


        ExercisesService.deleteExercise(week_id, day_id, id)
            .then(() => {
                // Actualizar el estado day eliminando el ejercicio por id
                const updatedExercises = day.filter(
                    (exercise) => exercise.exercise_id !== id
                );
                setModifiedDay(updatedExercises);
                setStatus(idRefresh); // Opcional, si es necesario
                setLoading(false);
                setIsEditing(false);
                Notify.instantToast('Ejercicio eliminado con éxito')

            })
            .catch((error) => {
                Notify.instantToast('Error')
                
            });
    }

    const handleShowWarmup = () => {
        setWarmup(true);
        setIsEditing(false)
    }

    const tableRef = useRef(null);



    const AddNewExercise = () => {


        // Crear una copia del estado actual de 'day'
        const updatedDays = [...day];
    
        // Calcular el número del siguiente ejercicio en la secuencia
        const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;
    
        // Crear un nuevo ejercicio con el número correspondiente
        const newExercise = {
            exercise_id: new ObjectId().toString(),
            type: 'exercise',
            numberExercise: nextNumberExercise, // Asignar el número correcto
            name: '',
            reps: 1,
            sets: 1,
            peso: '',
            rest: '',
            video: '',
            notas: '',
        };
    
        // Agregar el nuevo ejercicio al día actual
        updatedDays[indexDay].exercises.push(newExercise);
    
        // Actualizar los estados
        setDay(updatedDays);
        setModifiedDay(updatedDays);
        setCurrentDay(updatedDays[indexDay]);
        Notify.instantToast("Ejercicio creado con éxito!")
    

    };

    
    

const handleCancel = () => {

    setCurrentDay[null]
    setRoutine[null]
    setModifiedDay(null)
    setDay(null)
    setStatusCancel(idRefresh)
    setIsEditing(false)
};

const confirmCancel = () => {
    setShowCancelDialog(true);
};

const addNewDay = () => {
    const updatedDays = [...allDays];

    const nextDayIndex = updatedDays.length + 1;

    const newDay = {
        _id: new ObjectId().toString(),
        name: `Día ${nextDayIndex}`,
        lastEdited: new Date().toISOString(), // Agregar la fecha de creación o última edición
        exercises: [
            {
                exercise_id: new ObjectId().toString(),
                type: 'exercise',
                numberExercise: 1,
                name: '',
                reps: 1,
                sets: 1,
                peso: '',
                rest: '',
                video: '',
                notas: '',
            },
        ],
    };

    updatedDays.push(newDay);
    setAllDays(updatedDays);
    setDay(updatedDays);
    setModifiedDay(updatedDays);

    Notify.instantToast("Día creado con éxito")

};



const confirmDeleteDay = () => {
    setIsEditing(true)
    if (!currentDay) return;

    const updatedDays = [...allDays];
    const dayIndex = updatedDays.findIndex(day => day._id === currentDay._id);

    updatedDays.splice(dayIndex, 1);

    if (updatedDays.length === 0) {
        setAllDays([]);
        setCurrentDay(null);
        setIndexDay(0);
        return;
    }

    const newDayIndex = dayIndex === 0 ? 0 : dayIndex - 1;
    setAllDays(updatedDays);
    setCurrentDay(updatedDays[newDayIndex]);
    setIndexDay(newDayIndex);
    setModifiedDay(updatedDays)
};


const handleDeleteDayClick = () => {
    setShowDeleteDayDialog(true);  // Mostrar el popup de confirmación
};


const openEditNameDialog = (day) => {
    setDayToEdit(day); // Guardamos el día que queremos editar
    setNewDayName(day.name); // Inicializamos el campo con el nombre actual del día
    setIsEditingName(true); // Mostramos el popup
};

// Función para guardar el nuevo nombre del día
const saveNewDayName = () => {
    setIsEditing(true)
    const updatedDays = [...allDays];
    const dayIndex = updatedDays.findIndex((d) => d._id === dayToEdit._id);
    if (dayIndex !== -1) {
        updatedDays[dayIndex].name = newDayName; // Actualizamos el nombre del día
        setAllDays(updatedDays); // Actualizamos el estado global de los días
        setModifiedDay(updatedDays)
    }
    setIsEditingName(false); // Cerramos el popup
};












const AddNewCircuit = () => {
    // Crear una copia del estado actual de 'day'
    const updatedDays = [...day];

    // Calcular el número del siguiente circuito en la secuencia
    const nextNumberExercise = updatedDays[indexDay].exercises.length + 1;

    // Crear un nuevo circuito con el número correspondiente
    const newCircuit = {
        name: '',
        typeOfSets: '',
        notas: '',
        circuit: [
            {
                name: "",
                reps: 1,
                peso: "0",
                video: "",
                idRefresh: RefreshFunction.generateUUID(),
            },
        ],
        numberExercise: nextNumberExercise, // Asignar el número correcto
        exercise_id: new ObjectId().toString(), // Generar un nuevo ID único
    };

    // Agregar el nuevo circuito al día actual
    updatedDays[indexDay].exercises.push(newCircuit);

    // Actualizar los estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    
    Notify.instantToast("Circuito añadido con éxito!")
};




const AddExerciseToCircuit = (circuitIndex) => {
    const updatedDays = [...day];

    // Crear un nuevo ejercicio
    const newExercise = {
        name: "",
        reps: 0,
        peso: "0",
        video: "",
        idRefresh: RefreshFunction.generateUUID(),
    };

    // Agregar el nuevo ejercicio al circuito
    updatedDays[indexDay].exercises[circuitIndex].circuit.push(newExercise);

    // Actualizar los estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    setCurrentDay(updatedDays[indexDay]);
    Notify.instantToast("Ejercicio añadido con éxito!")
};


const customInputEditCircuit = (data, circuitIndex, field) => {


     if (field === "reps"){
                <CustomInputNumber
                    ref={(el) => inputRefs.current[`${circuitIndex}-${field}`] = el}
                    initialValue={data}
                    onChange={() => changeCircuitData(circuitIndex, field)}
                    isRep={field === "reps" ? true : false}
                    className={`mt-5`}
                />
    } else if(field === "notas") {
        return(
            <div className="row">

         
        <InputTextarea
        ref={(el) => inputRefs.current[`${circuitIndex}-${field}`] = el}
        className={`textAreaResize ${firstWidth < 600 && 'col-11'}`}
        autoResize
        defaultValue={data}
        onChange={() => changeCircuitData(circuitIndex, field)} // Asegúrate de capturar `e.target.value`
    />
       </div>)

    } else{ 
    return (
        <input
            ref={(el) => inputRefs.current[`${circuitIndex}-${field}`] = el}  // Asigna referencia única para el circuito
            placeholder={ field == 'type' ? `Amrap / emom ...` : " 3 / 10' ..."}
            className="form-control ellipsis-input text-center"
            type="text"
            defaultValue={data}  // Al ser no controlado, usar defaultValue
            onChange={() => changeCircuitData(circuitIndex, field)}  // Actualiza el valor al perder el foco
        />
    )}
};


const changeCircuitData = (circuitIndex, field) => {
    setIsEditing(true); // Activar el estado de edición

    // Obtener el valor desde la referencia
    const value = inputRefs.current[`${circuitIndex}-${field}`].value;

    // Crear una copia profunda del circuito
    const updatedDays = [...day];
    const updatedCircuit = {
        ...updatedDays[indexDay].exercises[circuitIndex],
        [field]: value,  // Actualizar el campo correspondiente (name, typeOfSets, etc.)
    };

    // Actualizar el circuito en el día actual
    updatedDays[indexDay].exercises[circuitIndex] = updatedCircuit;
    updatedDays[indexDay].lastEdited = new Date().toISOString();

    // Actualizar los estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
};


const customInputEditExerciseInCircuit = (data, circuitIndex, exerciseIndex, field) => {
    
    if(field === "video") {
        return (
        <>
        <IconButton
            aria-label="video"
            className="w-100"
            onClick={(e) => {
                productRefs.current[exerciseIndex].toggle(e);
            }}
        >
            <YouTubeIcon className="colorIconYoutube" />
        </IconButton>
        <OverlayPanel
            ref={(el) => (productRefs.current[exerciseIndex] = el)}
        >
            <input
                ref={(el) => inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el}
                className="form-control ellipsis-input text-center"
                type="text"
                defaultValue={data}
                onChange={() => changeExerciseInCircuit(circuitIndex, exerciseIndex, field)}
            />
        </OverlayPanel>
    </>) 
    } else if(field === "reps"){
        return (
        <CustomInputNumber
                    ref={(el) => inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el}
                    initialValue={data}
                    onChange={(e) => changeExerciseInCircuit(circuitIndex, exerciseIndex, field, e)}
                    isRep={field === "reps" ? true : false}
                    className={`mt-5`}
                />)
        } else if(field == 'name'){
            return(
                <AutoComplete
                    defaultValue={data}
                    onChange={(e) => changeExerciseInCircuit(circuitIndex, exerciseIndex, field, e)}
                />
            )

        } else { 
        return (
        <input
            ref={(el) => inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`] = el} // Asignar referencia única por campo
            className="form-control ellipsis-input text-center"
            type="text"
            defaultValue={data} // Al ser no controlado, usamos defaultValue
            onChange={() => changeExerciseInCircuit(circuitIndex, exerciseIndex, field)} // Al perder el foco, actualiza los datos
        />
    );
}
};

const changeExerciseInCircuit = (circuitIndex, exerciseIndex, field, repsValue) => {
    setIsEditing(true); // Activar el estado de edición al cambiar datos
    const updatedDays = [...day];


    let value = ''

    if(field != 'name'){
        value = inputRefs.current[`${circuitIndex}-${exerciseIndex}-${field}`].value;
    }
    


    // Crear una copia profunda del ejercicio dentro del circuito
    const updatedCircuitExercise = {
        ...updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex],
        [field]: field == 'reps' || field == 'name' ? repsValue : value, // Actualizar el campo correspondiente
    };

    // Actualizar el ejercicio dentro del circuito
    updatedDays[indexDay].exercises[circuitIndex].circuit[exerciseIndex] = updatedCircuitExercise;

    // Actualizar los estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
};



const deleteCircuit = (name, circuitIndex) => {
    setIsEditing(true);  // Muestra que estamos editando
    const updatedDays = [...day];

    // Elimina el circuito del día actual
    updatedDays[indexDay].exercises.splice(circuitIndex, 1);

    // Actualizar estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
    Notify.instantToast(`${name} Eliminado con éxito`)
};


const deleteExerciseFromCircuit = (circuitIndex, exerciseIndex) => {
    const updatedDays = [...day];

    // Elimina el ejercicio del circuito
    updatedDays[indexDay].exercises[circuitIndex].circuit.splice(exerciseIndex, 1);

    // Actualizar estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
};

const deleteExerciseFromArray = (exerciseIndex) => {
    setIsEditing(true);  // Muestra que estamos editando
    const updatedDays = [...day];

    // Elimina el ejercicio del día actual
    updatedDays[indexDay].exercises.splice(exerciseIndex, 1);

    // Actualizar estados
    setDay(updatedDays);
    setModifiedDay(updatedDays);
};


const inputRefs = useRef([]);












const tableMobile = () => {
    return (
        <div className="table-responsiveCss">
            
            <div className="row justify-content-center text-center mb-3">
                <div className="col-6">
                    <IconButton
                        aria-label="video"
                        className="bgColor rounded-2 text-light "
                        onClick={() => AddNewExercise()}
                    >
                        <AddIcon className="" />
                        <span className="font-icons me-1">Añadir ejercicio</span>
                    </IconButton>
                </div>
                <div className="col-6">
                    <IconButton
                        aria-label="video"
                        className="bgColor rounded-2 text-light "
                        onClick={() => AddNewCircuit()}
                    >
                        <AddIcon className="" />
                        <span className="font-icons me-1">Añadir circuito</span>
                    </IconButton>

                </div>

            </div>



            <table  className="table table-bordered">

                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Peso</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        {editMode && <th>Rest</th>}
                        <th>Notas</th>
                        {editMode && <th>Video</th>}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentDay && currentDay.exercises.map((exercise, i) => (
                        <tr className="shadowCards" key={exercise.exercise_id}>
                            {exercise.type === 'exercise' ? (
                                <>
                                    <td data-th="Nombre" className="text-center">
                                        {editMode ? 
                                            <AutoComplete
                                            defaultValue={exercise.name}
                                            onChange={(e) => changeModifiedData(i, e, 'name')}/> 
                                            : 
                                            <span className="">{exercise.name == '' ? 'Nombre': exercise.name}</span>}
                                    </td>
                                    <td data-th="Peso" className="text-center">{customInputEditDay(exercise.peso, i, 'peso')}</td>
                                    <td data-th="Sets" className="text-center">{customInputEditDay(exercise.sets, i, 'sets')}</td>
                                    <td data-th="Reps" className="text-center">{customInputEditDay(exercise.reps, i, 'reps')}</td>
                                    {editMode && <td data-th="Rest" className="text-center">{customInputEditDay(exercise.rest, i, 'rest')}</td>}
                                    {editMode && <td data-th="Video" className="text-center">{customInputEditDay(exercise.video, i, 'video')}</td>}
                                    {editMode && <td data-th="Notas" className="text-center">{customInputEditDay(exercise.notas, i, 'notas')}</td>}
                                    {editMode && <td className="notStyle" >
                                        <div className="row justify-content-center mt-2">
                                            <div className="col-6">
                                                <Dropdown
                                                    value={exercise.numberExercise}
                                                    options={options}
                                                    onChange={(e) => changeModifiedData(i, e.target.value, 'numberExercise')}
                                                    placeholder="Select an item"
                                                    optionLabel="label"
                                                    className="p-dropdown-group w-100"
                                                />
                                            </div>
                                            <div className="col-6">
                                                <IconButton
                                                    aria-label="video"
                                                    className="styleButtonsEdit rounded-0"
                                                    onClick={() => deleteExerciseFromArray(i)}  // Usamos la nueva función
                                                >
                                                    <CancelIcon className="bbbbb" />
                                                </IconButton>

                                            </div>
                                        </div>
                                    </td>}
                                </>
                            ) : (
                                <>
                                    {editMode ? 
                                    <>
                                        <td className="text-center" data-th={"Nombre"}>{customInputEditCircuit(exercise.type, i, 'type')}</td>
                                        <td className="text-center" data-th={"Series"}>{customInputEditCircuit(exercise.typeOfSets, i, 'typeOfSets')}</td>
                                        <td className="notStyle">

                                            {exercise.circuit.map((item, j) => (
                                                <div key={item.idRefresh} className="row justify-content-center text-center">
                                                    <div className="mt-4 ">

                                                        <b className="mt-4 mb-2">Ejercicio {j + 1}</b>                                                  
                                                        <span className="text-end ps-5 ">
                                                        <IconButton
                                                            aria-label="video"
                                                            className=" text-light "
                                                            onClick={() => {
                                                                setIsEditing(true)
                                                                const updatedDays = [...day];
                                                                updatedDays[indexDay].exercises[i].circuit.splice(j, 1);  // Elimina el ejercicio del circuito
                                                                setDay(updatedDays);  // Actualiza el estado del día
                                                                setModifiedDay(updatedDays);  // Actualiza la rutina modificada
                                                            }}
                                                        >
                                                            <CancelIcon className="colorIconDeleteExercise" />
                                                        </IconButton>
                                                    </span>
                                                                                                            
                                                    </div>
                                                    <span className="col-11 my-1 mb-2">{customInputEditExerciseInCircuit(item.name, i, j, 'name')}</span>
                                                    <span className="col-6 my-1">{customInputEditExerciseInCircuit(item.reps, i, j, 'reps')}</span>
                                                    <span className="col-5 my-1">{customInputEditExerciseInCircuit(item.peso, i, j, 'peso')}</span>

                                                </div>
                                            ))}
                                           
                                        
                                        </td>
                                        <td className="text-center my-4" data-th={"Notas"}>{customInputEditCircuit(exercise.notas, i, 'notas')}</td>
                                    </> :
                                    <>
                                        <td className="text-center" data-th={"Nombre"}>{exercise.type == '' ? 'Nombre' : exercise.type}</td>
                                        <td className="text-center" data-th={"Series"}>{exercise.typeOfSets == '' ? 'Nombre' : exercise.typeOfSets}</td>
                                        <td className="notStyle">
                                            <div className="row justify-content-center" >
                                                    <b className="col-5 my-3">Ejercicio</b>
                                                    <b className="col-3 my-3">Reps</b>
                                                    <b className="col-3 my-3">Peso</b>
                                            {exercise.circuit.map((item) => (
                                                <div key={item.idRefresh} className="row justify-content-center">
                                                    <span className="col-5 my-1">{item.name == '' ? 'Nombre' : item.name}</span>
                                                    <span className="col-3 my-1">{item.reps == '' ? 'Nombre' : item.reps}</span>
                                                    <span className="col-3 my-1">{item.peso == '' ? 'Nombre' : item.peso}</span>
                                                </div>
                                            ))}
                                            </div>
                                        
                                        </td>
                                        <td className="text-center my-4 me-3" data-th={"Notas"}>{exercise.notas == '' ? 'Nombre' : exercise.notas}</td>
                                    </>
                                    }

                                    {editMode && 
                                    
                                    <td className="notStyle">
                                        <div className="row justify-content-center mt-2">
                                            <div className="col-6">
                                                <Dropdown
                                                    value={exercise.numberExercise}
                                                    options={options}
                                                    onChange={(e) => changeModifiedData(i, e.target.value, 'numberExercise')}
                                                    placeholder="Seleccioanr numero"
                                                    optionLabel="label"
                                                    className="p-dropdown-group w-100"
                                                />
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    aria-label="video"
                                                    className="btn btn-danger rounded-2"
                                                    onClick={() => deleteCircuit(exercise.name, i)}  // Usamos la nueva función para eliminar circuitos
                                                >
                                                    Eliminar circuito
                                                </button>

                                            </div>
                                        </div>
                                        <div>
                                                <IconButton
                                                    aria-label="video"
                                                    className="bgColor rounded-2 text-light my-4"
                                                    onClick={() => AddExerciseToCircuit(i)}
                                                >
                                                    <AddIcon className="" />
                                                    <span className="font-icons me-1">Añadir Ejercicio al Circuito</span>
                                                </IconButton>

                                        </div>
                                    </td>}

                                </>
                            )}
                        </tr>
                    ))}

                </tbody>

            </table>
            <div className="row justify-content-center text-center mb-3">
                <div className="col-6">
                    <IconButton
                        aria-label="video"
                        className="bgColor rounded-2 text-light "
                        onClick={() => AddNewExercise()}
                    >
                        <AddIcon className="" />
                        <span className="font-icons me-1">Añadir ejercicio</span>
                    </IconButton>
                </div>
                <div className="col-6">
                    <IconButton
                        aria-label="video"
                        className="bgColor rounded-2 text-light "
                        onClick={() => AddNewCircuit()}
                    >
                        <AddIcon className="" />
                        <span className="font-icons me-1">Añadir circuito</span>
                    </IconButton>

                </div>
            </div>
        </div>
    );
};













const openEditWeekNameDialog = () => {
        setNewWeekName(weekName); // Inicializa el campo con el nombre actual de la semana
        setIsEditingWeekName(true);

};

// Función para cerrar el diálogo sin aplicar cambios
const closeEditWeekNameDialog = () => {
    setIsEditingWeekName(false);
};

// Función para guardar el nuevo nombre de la semana
const saveNewWeekName = () => {

  
        WeekService.editNameWeek(routine._id, {name: newWeekName})
            .then(() =>{
                setStatus(idRefresh)
                setWeekName(newWeekName)
                setIsEditingWeekName(false);
                Notify.instantToast("Nombre editado con éxito!")
            })



};




    return (
        <>
        
        <div className="container-fluid p-0 mb-4">
            <Logo />
        </div>
        
        
        <section className="container-fluid">
            
            <div className="row justify-content-center">
                <div className="col-12 col-lg-6 text-center">
                    <p className="fs-5">
                        Planificación de {username} - <b>{weekName}</b>
                        <IconButton
                            aria-label="edit-week-name"
                            onClick={openEditWeekNameDialog}  // Abre el diálogo para editar el nombre
                            className="ms-2"
                        >
                            <EditIcon />
                        </IconButton>
                    </p>

                    <div>
                        <b>Última edición: </b>
                        {currentDay && currentDay.lastEdited != null
                            ? new Date(currentDay.lastEdited).toLocaleString()
                            : <span>Editá para ver los cambios!</span>
                        }
                    </div>
                </div>
            </div>

            
            <div className="row justify-content-center mb-4">
                <div className="col-12 mt-4 mb-2 text-center">
                    <button
                        onClick={handleShowWarmup}
                        className="btn border buttonColor p-3 shadowCards"
                    >
                        Administrar bloque de entrada en calor - <b>{currentDay && currentDay.name}</b>
                    </button>
                </div>
            </div>

            <div className="row justify-content-center text-center mb-4 mt-3">
                <h3>{currentDay && currentDay.name}</h3>

            </div>

            <div className="row justify-content-center align-middle text-center">
                <div className={`col-10 col-sm-6 ${firstWidth > 550 ? 'text-end mb-4' : 'text-center mb-4'}`}>
                    <>
                        <Segmented
                            options={allDays.map((day) => ({
                                label: day.name,    // Muestra el nombre del día
                                value: day._id      // Usa el ID como valor interno
                            }))}
                            className="stylesSegmented"
                            value={currentDay ? currentDay._id : ''}  // Asegura que se seleccione el día basado en el ID
                            onChange={(value) => {
                                // Buscar el día actual basado en el ID seleccionado
                                const selectedDay = allDays.find(day => day._id === value);

                                if (selectedDay) {
                                    // Actualizar el estado con el día seleccionado
                                    setIndexDay(allDays.findIndex(day => day._id === selectedDay._id));
                                    setCurrentDay(selectedDay);
                                }
                            }}
                        />

                        
                    </>
                    </div>
                    <div className={`col-9 col-sm-6 ${firstWidth > 550 ? 'text-start mb-4' : 'text-center mb-4'}`}>
                    <IconButton
                            aria-label="video"
                            className="bg-primary rounded-2 text-light me-2"
                            onClick={addNewDay}
                        >
                            <AddIcon className="" />
                            <span className="font-icons me-1">Crear día</span>
                        </IconButton>

                        <IconButton
                            aria-label="video"
                            className="bg-secondary rounded-2 text-light me-2"
                            onClick={() => openEditNameDialog(currentDay)}
                            
                        >
                            <EditIcon className="" />
                        </IconButton>
                        <IconButton
                            aria-label="video"
                            className="bg-danger rounded-2 text-light "
                            onClick={handleDeleteDayClick}
                        >
                            <DeleteIcon className="" />
                        </IconButton>

                </div>
            </div>

            <div  className="row justify-content-center mb-5 ">
 
                {firstWidth > 992 ? <div className={`table-responsive col-11 col-lg-11 col-xl-10 col-xxl-9 altoTable`}>
                        <table
                            
                            className={`table table-hover pb-5 mb-5 align-middle fontTable text-center ${
                                isEditing && "table-light"
                            } `}
                        >
                            <thead>
                                <tr>
                                    <td colSpan={9} >
                                        <div className="row justify-content-between align-items-center py-2">


                                            <div className="text-end">
                                                <IconButton
                                                    aria-label="video"
                                                    className="bgColor rounded-2 text-light me-2"
                                                    onClick={() => AddNewExercise()}
                                                >
                                                    <AddIcon className="" />
                                                    <span className="font-icons me-1">Añadir ejercicio</span>
                                                </IconButton>

                                                <IconButton
                                                    aria-label="video"
                                                    className="bgColor rounded-2 text-light me-2"
                                                    onClick={() => AddNewCircuit()}
                                                >
                                                    <AddIcon className="" />
                                                    <span className="font-icons me-1">Añadir circuito</span>
                                                </IconButton>

                                            </div>

                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    {propiedades.map((propiedad, index) => (
                                        <th
                                            key={propiedad}
                                            className={`td-${index}`}
                                            scope="col"
                                        >
                                            {propiedad == "Acciones"
                                                ? "#"
                                                : propiedad}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>

                                {currentDay && currentDay.exercises.map((exercise, i) => (
                                    <tr key={exercise.exercise_id}>
                                        <td className="td-0">
                                            <Dropdown
                                                value={exercise.numberExercise}
                                                options={options}
                                                onChange={(e) => {
                                                    changeModifiedData(
                                                        i,
                                                        e.target.value,
                                                        "numberExercise"
                                                    );
                                                }}
                                                placeholder="Seleccionar numero"
                                                optionLabel="label"
                                                className="p-dropdown-group w-100"
                                            />
                                        </td>
                                        {exercise.type === "exercise" ? (
                                            <>
                                                <td className="td-1">
                                                    <AutoComplete
                                                        defaultValue={
                                                            exercise.name
                                                        }
                                                        onChange={(e) => changeModifiedData(i, e, 'name')}
                                                    />
                                                </td>
                                                <td className="td-2">
                                                    {customInputEditDay(
                                                        exercise.sets,
                                                        i,
                                                        "sets"
                                                    )}
                                                </td>
                                                <td className="td-3 marginReps">
                                                    {customInputEditDay(
                                                        exercise.reps,
                                                        i,
                                                        "reps"
                                                    )}
                                                </td>
                                                <td className="td-4">
                                                    {customInputEditDay(
                                                        exercise.peso,
                                                        i,
                                                        "peso"
                                                    )}
                                                </td>
                                                <td className="td-5">
                                                    {customInputEditDay(
                                                        exercise.rest,
                                                        i,
                                                        "rest"
                                                    )}
                                                </td>
                                                <td className="td-6">
                                                    {customInputEditDay(
                                                        exercise.video,
                                                        i,
                                                        "video"
                                                    )}
                                                </td>
                                                <td className="td-7">
                                                    {customInputEditDay(
                                                        exercise.notas,
                                                        i,
                                                        "notas"
                                                    )}
                                                </td>
                                                <td className="td-8">
                                                    <div className="row justify-content-center">
                                                        <IconButton
                                                            aria-label="video"
                                                            className="col-12"
                                                            onClick={() => deleteExerciseFromArray(i)}  // Llama a la función centralizada
                                                        >
                                                            <CancelIcon className="colorIconDeleteExercise" />
                                                        </IconButton>
                                                        {firstWidth < 700 && (
                                                            <IconButton
                                                                aria-label="edit"
                                                                className="col-12"
                                                                onClick={() =>
                                                                    handleEditMobileExercise(exercise, i)
                                                                }
                                                            >
                                                                <EditIcon className="colorPencil" />
                                                            </IconButton>
                                                        )}
                                                    </div>
                                                </td>


                                            </>
                                        ) : (
                                            <>
                                                <td colSpan="8">
                                                    <table className="table text-center">
                                                        <thead>
                                                            <tr>
                                                                <th colSpan={2}>Nombre</th>
                                                                <th >Sets/mins</th>
                                                                <th >Notas</th>
                                                                <th >Acciones</th>
                                                            </tr>
                                                            <tr>
                                                                <td  colSpan={2}>{customInputEditCircuit(exercise.type, i, 'type')}</td>
                                                                <td >{customInputEditCircuit(exercise.typeOfSets, i, 'typeOfSets')}</td>
                                                                <td >{customInputEditCircuit(exercise.notas, i, 'notas')}</td>

                                                                <td>
                                                                    <IconButton
                                                                        aria-label="video"
                                                                        className="text-center"
                                                                        onClick={() => deleteCircuit(exercise.name, i)}  // Llama a la función para eliminar el circuito
                                                                    >
                                                                        <CancelIcon className="colorIconDeleteExercise" />
                                                                    </IconButton>
                                                                </td>

                                                            </tr>
                                                            <tr>
                                                                
                                                            </tr>
                                                            <tr colSpan={7}>
                                                                <th>Nombre</th>
                                                                <th>Reps</th>
                                                                <th>Peso</th>
                                                                <th>Video</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {exercise.circuit.map((circuitExercise, j) => (
                                                                <tr key={circuitExercise.idRefresh}>
                                                                    <td>{customInputEditExerciseInCircuit(circuitExercise.name, i, j, 'name')}</td>
                                                                    <td>{customInputEditExerciseInCircuit(circuitExercise.reps, i, j, 'reps')}</td>
                                                                    <td>{customInputEditExerciseInCircuit(circuitExercise.peso, i, j, 'peso')}</td>
                                                                    <td>{customInputEditExerciseInCircuit(circuitExercise.video, i, j, 'video')}</td>
                                                                    <td>
                                                                        <IconButton
                                                                            aria-label="video"
                                                                            className="col-12"
                                                                            onClick={() => {
                                                                                setIsEditing(true)
                                                                                const updatedDays = [...day];
                                                                                updatedDays[indexDay].exercises[i].circuit.splice(j, 1);  // Elimina el ejercicio del circuito
                                                                                setDay(updatedDays);  // Actualiza el estado del día
                                                                                setModifiedDay(updatedDays);  // Actualiza la rutina modificada
                                                                            }}
                                                                        >
                                                                            <CancelIcon className="colorIconDeleteExercise" />
                                                                        </IconButton>
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                            <tr>
                                                                <td colSpan="5">
                                                                    <IconButton
                                                                        aria-label="video"
                                                                        className="bgColor rounded-2 text-light my-4"
                                                                        onClick={() => AddExerciseToCircuit(i)}
                                                                    >
                                                                        <AddIcon className="" />
                                                                        <span className="font-icons me-1">Añadir Ejercicio al Circuito</span>
                                                                    </IconButton>
                                                                </td>
                                                            </tr>
                                                        </tbody>

                                                    </table>
                                                </td>

                                            </>
                                        )}
                                    </tr>
                                ))}

                            </tbody>
                            <tbody>
                            <tr>
                                                            <td colSpan={9} >
                                                                <div className="row justify-content-between align-items-center py-2">


                                                                    <div className="text-end">
                                                                        <IconButton
                                                                            aria-label="video"
                                                                            className="bgColor rounded-2 text-light me-2"
                                                                            onClick={() => AddNewExercise()}
                                                                        >
                                                                            <AddIcon className="" />
                                                                            <span className="font-icons me-1">Añadir ejercicio</span>
                                                                        </IconButton>

                                                                        <IconButton
                                                                            aria-label="video"
                                                                            className="bgColor rounded-2 text-light me-2"
                                                                            onClick={() => AddNewCircuit()}
                                                                        >
                                                                            <AddIcon className="" />
                                                                            <span className="font-icons me-1">Añadir circuito</span>
                                                                        </IconButton>

                                                                    </div>

                                                                </div>
                                                            </td>
                                                        </tr>
                            </tbody>
                        </table>
                    </div>: tableMobile()}
            </div>



            {isEditing && (
                <div className="floating-button index-up">
                    <button
                        className="btn colorRed p-4 my-3 fs-5"
                        onClick={() => applyChanges()}
                   
                    >
                        Guardar
                    </button>
                    <button
                        className="btn colorCancel p-4 my-3 fs-5"
                        onClick={() => confirmCancel()}
                  
                    >
                        Cancelar
                    </button>

                </div>
            )}



            <ConfirmDialog
                visible={showDeleteDayDialog} // Mostrar el popup si el estado es verdadero
                onHide={() => setShowDeleteDayDialog(false)} // Cerrar el popup si se cancela
                message="¿Querés eliminar este día? Podes cancelar después y revertir esta acción."
                header="Eliminar día"
                icon="pi pi-exclamation-triangle"
                acceptLabel="Sí"
                rejectLabel="No"
                accept={() => {
                    confirmDeleteDay(); // Eliminar el día si el usuario acepta
                    setShowDeleteDayDialog(false); // Cerrar el popup
                }}
                reject={() => setShowDeleteDayDialog(false)} // Cerrar el popup si se cancela
            />


            <ConfirmDialog
                visible={showCancelDialog}
                onHide={() => setShowCancelDialog(false)}
                message="¿Estás seguro de que deseas cancelar los cambios? Se perderán todos los cambios no guardados."
                header="Confirmación"
                icon="pi pi-exclamation-triangle"
                acceptLabel="Sí"
                rejectLabel="No"
                accept={() => handleCancel()}
                reject={() => setShowCancelDialog(false)}
            />


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

            {!isEditing && (
                <Floating link={`/user/routine/${id}/${username}`} />
            )}

            


            {firstWidth < 993 && 
                <div  className={`navbar-transition ${isEditing ? 'save-float-button-active' : 'save-float-button'}  ${isEditing ? 'saveActive' : 'btn-success'}`} >
                <IconButton                     
                    
                    onClick={() => setIsEditing(true)}>
                    <SaveIcon className={`${isEditing ? 'text-light' : 'btn-success'} `} />
                </IconButton>
            </div>}

            {firstWidth < 993 && 
                <div  className={`navbar-transition ${isEditing ? 'Edit-float-button-active' : 'Edit-float-button'}  ${editMode ? 'editActive' : 'btn-primary'}`} >
                <IconButton                     
                    
                    onClick={() => setEditMode(!editMode)}>
                    <EditIcon className={`${editMode ? 'text-light' : 'btn-primary'} `} />
                </IconButton>
            </div>}
            

            <Dialog
                className="col-12 col-md-10 col-xxl-5"
                contentClassName={"colorDialog"}
                headerClassName={"colorDialog"}
                header="Header"
                visible={visibleEdit}
                modal={false}
                onHide={() => setVisibleEdit(false)}
            ></Dialog>

            {completeCircuit && (
                <ModalEditCircuit
                    showEditCircuit={showEditCircuit}
                    handleClose={handleClose}
                    closeModal={closeModal}
                    refresh={refresh}
                    week_id={week_id}
                    day_id={day_id}
                    circuit={completeCircuit}
                />
            )}


            <ConfirmDialog />

            <Sidebar
                visible={editExerciseMobile}
                position="right"
                onHide={() => {
                    setEditExerciseMobile(false);
                }}
            >
                <EditExercise
                    completeExercise={day}
                    week_id={week_id}
                    day_id={day_id}
                    indexOfExercise={indexOfExercise}
                    refresh={refresh}
                    refreshEdit={refreshEdit}
                    isAthlete={false}
                />
            </Sidebar>

            <Dialog
                header={`${exerciseToDelete?.name || ""}`}
                className="dialogDeleteExercise"
                visible={showDeleteDialog}
                style={{ width: `${firstWidth > 991 ? "50vw" : "80vw"}` }}
                footer={
                    <div className="row justify-content-center ">
                        <div className="col-lg-12 me-3">
                            <button
                                className="btn btn-outlined-secondary"
                                onClick={handleDeleteCancel}
                            >
                                No
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteConfirm}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                }
                onHide={handleDeleteCancel}
            >
                <p className="p-4">
                    ¡Cuidado! Estás por eliminar{" "}
                    <b>"{exerciseToDelete?.name}"</b>. ¿Estás seguro?
                </p>
            </Dialog>

            <Dialog
                className="col-12 col-md-10 h-75"
                contentClassName={"colorDialog"}
                headerClassName={"colorDialog"}
                header="Entrada en calor"
                visible={warmup}
                scrollable={"true"}
                modal={false}
                onHide={() => hideDialogWarmup()}
                blockScroll={window.innerWidth > 600 ? false : true}
            >
                <ModalCreateWarmup
                    week={modifiedDay}
                    week_id={week_id}
                    day_id={currentDay && currentDay._id}
                    indexOfExercise={indexOfExercise}
                    editAndClose={editAndClose}
                />
            </Dialog>


            <Dialog
                header="Editar Nombre del Día"
                visible={isEditingName}
                style={ firstWidth > 968 ? { width: "35vw" } : { width: "75vw" } }
                onHide={() => setIsEditingName(false)} // Cerrar el popup si se cancela
            >
                <div className="p-fluid">
                    <div className="p-field">
                        <input
                            type="text"
                            id="dayName"
                            className="form-control my-3"
                            value={newDayName}
                            onChange={(e) => setNewDayName(e.target.value)} // Actualiza el nombre temporalmente
                        />
                    </div>
                    <div className="p-field text-end">
                        <button className="btn btn-primary mx-2 mt-2" onClick={saveNewDayName}>
                            Confirmar
                        </button>
                        <button
                            className="btn btn-secondary mx-2 mt-2"
                            onClick={() => setIsEditingName(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Dialog>
            


                <Dialog
                    header="Editar Nombre de la Semana"
                    visible={isEditingWeekName}  // Muestra el diálogo si está activo
                    style={firstWidth > 968 ? { width: "35vw" } : { width: "75vw" }}
                    onHide={closeEditWeekNameDialog}  // Cierra el diálogo
                >
                    <div className="p-fluid">
                        <div className="p-field">
                            <input
                                type="text"
                                id="weekName"
                                className="form-control my-3"
                                value={newWeekName}
                                onChange={(e) => setNewWeekName(e.target.value)}  // Actualiza el valor temporal del nombre
                            />
                        </div>
                        <div className="p-field text-end">
                            <button className="btn btn-primary mx-2 mt-2" onClick={saveNewWeekName}>
                                Confirmar
                            </button>
                            <button
                                className="btn btn-secondary mx-2 mt-2"
                                onClick={closeEditWeekNameDialog}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Dialog>

        </section>
    </>
    );
}

export default DayEditDetailsPage;
