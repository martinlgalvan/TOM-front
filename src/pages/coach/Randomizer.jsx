import { useState, useEffect, useRef  } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import * as PARService from "../../services/par.services.js";
import * as UsersService from '../../services/users.services.js';
import * as WeekService from '../../services/week.services.js';
import * as RandomizerColumns from "../../services/randomizerColumn.services.js";
import Logo from './../../components/Logo.jsx'

import * as GenerateObjectId from './../../helpers/generateUUID.js'
import * as NotifyHelper from './../../helpers/notify.js'

import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Dialog } from 'primereact/dialog';
import { ToastContainer, toast } from "react-toastify";
import { InputSwitch } from "primereact/inputswitch";
import { Tooltip } from 'primereact/tooltip';
import ActionAreaCard from "../../components/MUI/ActionAreaCard.jsx";
import CellsPage from "../../components/Randomizer/CellsPage.jsx";

import { Dropdown } from 'primereact/dropdown';


function Randomizer() {
    const user_id = localStorage.getItem("_id")

    const [loading, setLoading] = useState()

    const [users, setUsers] = useState()
    const [actualUser, setActualUser] = useState()
    
    const [columns, setColumns] = useState()
    const [localColumns, setLocalColumns] = useState()
    const [columnState, setColumnState] = useState({});
    const [administerColumn, setAdministerColumn] = useState(false);
    const [adminExercise, setAdminExercise] = useState(false);

    const [name, setName] = useState()
    const [exercise, setExercise] = useState()
    const [video, setVideo] = useState()
    
    const [idExercise, setIdExercise] = useState()
    const [nameExercise, setNameExercise] = useState()
    const [videoExercise, setVideoExercise] = useState()

    const [seeAddExercise, setSeeAddExercise] = useState()

    const [createName, setCreateName] = useState()
    const [columnId, setColumnId] = useState()
    const [indexColumn, setIndexColumn] = useState()

    const [inputValue, setInputValue] = useState('');
    const isInputValid = inputValue === 'ELIMINAR';

    const [PAR, setPAR] = useState();
    const [indexDropdownPAR, setIndexDropdownPAR] = useState(false);
    const [administerAdminPAR, setAministerAdminPAR] = useState(false);
    const [parId, setParId] = useState()
    const [routine, setRoutine] = useState()
    const [notRandom, setNotRandom] = useState(false);


    const [color, setColor] = useState(localStorage.getItem('color'))
    const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))
    
    // USERS USE EFFECT

    useEffect(() => {
        NotifyHelper.notifyA("Cargando usuarios...")
           
            UsersService.find(user_id)
                .then(data => {
                    setUsers(data)
                    NotifyHelper.updateToast()
                })
       

    }, []) 

    //COLUMNS USE EFFECT

    useEffect(() => {

        NotifyHelper.notifyA("Cargando...")
        RandomizerColumns.getColumns(user_id)
            .then(data => {
                setColumns(data)
                setLocalColumns(data)
                NotifyHelper.updateToast()
                setLoading(false)
            })
}, [loading])

// PAR USE EFFECT

useEffect(() => {
    PARService.getPAR(user_id)
      .then(data => { 
        setPAR(data)
      })
  
  }, [loading]);

// ------------------------ FUNCTIONS CREATE COLUMN --------------------------- \\

function changeCreateName(e){
    setCreateName(e.target.value)
}

function changeNameExercise(e){
    
    setName(e.target.value)
}

function changeVideoExercise(e){
    setVideo(e.target.value)
}

// ------------------------ FUNCTIONS ADMIN COLUMNS --------------------------- \\


const showAdminColumns = (data) => {
    setColumnId(data._id)
    let indexDay = localColumns.findIndex(column => column._id === data._id)
    setIndexColumn(indexDay)
    setAdministerColumn(true)
    setExercise(data)

}

const createColumn = (name) => {

    setLoading(true)
    RandomizerColumns.createColumn({name}, user_id)
        .then(() => {
            
        })

}

const deleteColumn = (id) => {
    setLoading(true)
    RandomizerColumns.deleteColumn(id)
        .then(() => {
            setAdministerColumn(false)

        })
  
  }


// --------------------------- FUNCTIONS ADMIN EXERCISES IN COLUMN --------------------------- \\



const showAdminExerciseInColumn = (id, name, video) => {

    setAdminExercise(true)
    setIdExercise(id)
    setName(name)
    setVideo(video)

}



const editExerciseInColumn = (column_id, exercise_id, name, video) => {

    setLoading(true)
    RandomizerColumns.editExerciseInColumn(column_id, exercise_id, {name,video})
        .then(() => {
            setAdminExercise(false)
        })

}

const deleteExerciseInColumn = (column_id, exercise_id) => {
    setLoading(true)
    RandomizerColumns.deleteExerciseInColumn(column_id, exercise_id)
        .then(() => {
            setAdminExercise(false)
        })

}


const AddExerciseInColumn = ( ) => {

    setLoading(true)
    RandomizerColumns.createExerciseInColumn(columnId, {name, video})
    .then((data) => {

        const updatedColumns = columns.map(column => {

            if (column._id === columnId) {
                // Agregar el nuevo ejercicio a la columna específica
                return {
                    ...column,
                    exercises: [...column.exercises, data] // Suponiendo que 'data' es el nuevo ejercicio creado
                };
            }
            return column;
        });
        
    })
};


const showAdminPAR = (index, data) => {
    setParId(data._id)

    /*let indexDay = localColumns.findIndex(column => column._id === data._id)
    setIndexColumn(indexDay)*/
    setRoutine(data)
    setAministerAdminPAR(true)
}


const FindSameName = () => {

    const updatedRoutine = routine.routine.map(routineItem => {
    
     const updatedExercises = routineItem.exercises.map(routineExercise => {

        columns.forEach(columnItem => {

            if (routineExercise.mainName === columnItem.name) { 

              routineExercise.name = columnItem.exercises[Math.floor(Math.random() * columnItem.exercises.length)].name;
            }

    
        });
        return routineExercise;
      }); 

      routineItem.exercises = updatedExercises;
      
      return routineItem;
    });

    const newRoutine = {
        name: "Semana PAR",
        routine: updatedRoutine,
    };


    setNotRandom(true)
    setRoutine(newRoutine);

  };

  const handleDropdownChange = (selectedOption) => {

    setActualUser(selectedOption)
  };



  function createWeek(){
    setLoading(true)
    PARService.createPARroutine(routine, actualUser._id)
            .then((data) => {
                NotifyHelper.updateToast('PAR creado con éxito')
            })
    }

function deletePAR(id){
        setLoading(true)
    
        PARService.deletePAR(id)
            .then((data) => {
                NotifyHelper.updateToast('PAR eliminado con éxito')
                setAministerAdminPAR(false)
            }
        )}



const [routineData, setRoutineData] = useState(null);

const handleRoutineUpdate = (routine) => {
    setRoutineData(routine);
  };











  
   
    return (
    <>
        <section className="container-fluid">

            <Logo />
            <article className="row justify-content-center">

                <div className="col-10 col-lg-8 text-center">

                    <h2>PAR</h2>

                    <p>Bienvenido/a al <b>Planificador Automático de rutinas</b></p>
                    <p>Este sistema te permite armar tus protocolos de entrenamiento. ¿Que es eso? Básicamente revolucionar tu manera de planificar.</p>
                    <p>En primer lugar, te vamos a permitir la total libertad de <b>todo</b>. Para darte una ayuda, el flujo de creación es el siguiente:</p>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><b>1 .</b> Creación de columnas</li>
                            <li class="list-group-item"><b>2 .</b> Añadir ejercicios a las columnas</li>
                            <li class="list-group-item"><b>3 .</b> Armar tu protocolo de entrenamiento</li>
                        </ul>

                </div>

                <div className="text-center my-5">

                    <CellsPage onUpdateRoutine={handleRoutineUpdate} />

                </div>

                {routineData  && <article className="col-10">
                    <table className="table table-bordered altoListPAR text-center">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Reps</th>
                        <th scope="col">Sets</th>
                        <th scope="col">Peso</th>
                        <th scope="col">Rest</th>
                        <th scope="col">Video</th>
                        <th scope="col">Notas</th>
                        </tr>
                    </thead>

                    
                        {routineData && routineData.routine.map((week, dayIndex) => (
                            <>
                            <tbody>

                                <tr className="border-0">
                                    <td className="border-0"></td>
                                </tr>
                                
                                <tr>
                                    <td colSpan={8}>{week.name}</td>
                                </tr>

                                <tr className="border-0">
                                    <td className="border-0"></td>
                                </tr>
                            </tbody>
                            <tbody> 

                                        {week.exercises.map((exercises) =>
                                                <>
                                                <tr>
                                                    <th scope="row">{exercises.numberExercise}</th>
                                                    <td>{notRandom ? exercises.name : exercises.mainName}</td>
                                                    <td>{exercises.sets}</td>
                                                    <td>{exercises.reps}</td>
                                                    <td>{exercises.peso}</td>
                                                    <td>{exercises.rest}</td>
                                                    <td>{exercises.video}</td>
                                                    <td>{exercises.notas}</td>
                                                </tr>
                                                </>
                                            )}
                                        
                            </tbody>
    
                                    </>

                                        ))} 

                        
                                        </table>
                    </article>}




                <div className="col-5 text-center my-5">

                    <h3 className="mb-4">Agregar una columna</h3>

                    <div className='row justify-content-center border-0'>

                        <div className="input-group col-10 mb-2">

                            <label htmlFor="name" className="visually-hidden ">Nombre de la columna</label>
                            <input type="text" className="form-control " id="name" name="name"  onChange={changeCreateName}  placeholder="Nombre" />
                            <button onClick={() => createColumn(createName)} className={`btn ${textColor == 'false' ? "bbb" : "blackColor"}`} style={{ "backgroundColor": `${color}` }} type="button" id="button-addon2">Agregar</button>

                        </div>

                    </div>

                </div>






                {columns && 
                
                <div className='row justify-content-center mb-3'>

                    <TransitionGroup component={null} className="todo-list">
                            {columns.map((elemento, index) =>
                            <CSSTransition
                            key={elemento._id}
                            timeout={500}
                            classNames="item"
                            >
                                <div className={'col-10 col-sm-4 col-lg-3 py-2'}  onClick={() => showAdminColumns(elemento)}>
                                    <ActionAreaCard className={"py-5"} title={elemento.name} body={"ejemplo de body"} id={elemento._id}  />
                                </div>

                            </CSSTransition>
                            )}
                            </TransitionGroup>                                  
                </div>}
                                            
                {PAR && 
                
                <div className='row justify-content-center mb-3'>

                <h2 className="text-center mt-2">Protocolos</h2>

                    <TransitionGroup component={null} className="todo-list">
                            {PAR.map((elemento, index) =>
                            <CSSTransition
                            key={elemento._id}
                            timeout={500}
                            classNames="item"
                            >
                                <div className={'col-5 col-lg-3 py-2'} onClick={() => showAdminPAR(index, elemento)}>
                                    <ActionAreaCard className={"py-5"} title={elemento.name} body={"ejemplo de body"} id={elemento._id}  />
                                </div>

                            </CSSTransition>
                            )}
                            </TransitionGroup>

                </div>}






















                {exercise  && 
                    <Dialog 
                        header={`Administrar columna "${exercise.name}"`} 
                        headerClassName={"text-start"}
                        exercise={exercise} 
                        visible={administerColumn} 
                        style={{ width: '75vw' }} 
                        onHide={() => setAdministerColumn(false)
                    }>

                    <section className="container-fluid">
                        <article className="row justify-content-center">

                            <div className="col-10 mb-3">
                                <div className="mb-3">
                                    <label>Nombre</label>
                                    <input type="Nombre" className="form-control" onChange={changeNameExercise}  />
                                </div>
                                <div className="mb-3">
                                    <label>Link video</label>
                                    <input type="Link del video" className="form-control" onChange={changeVideoExercise}/>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} onClick={() => AddExerciseInColumn(exercise._id)}>Añadir ejercicio</button>
                            </div>
                            
                            <div className="table-responsive">

                                <table className="table border  text-center">
                                        <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Nombre</th>
                                            <th scope="col">Video</th>
                                            <th scope="col">Acciones</th>
                                        </tr>
                                        </thead>
                                        
                                        <tbody>
                                            {columns && columns[indexColumn] && columns[indexColumn].exercises.map((exercise, index) => 
                                                <tr>
                                                    <td>{index + 1}</td>   
                                                    <td>{exercise.name}</td> 
                                                    <td>{exercise.video}</td> 
                                                    <td>
                                                        <button className="btn ClassBGHover" onClick={() => showAdminExerciseInColumn(exercise._id, exercise.name, exercise.video)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                                    )} 
                                        </tbody>
                                    
                                    </table>
                            </div>

                            <button className="btn btn-danger text-center  col-4" onClick={() => deleteColumn(exercise._id)}>Eliminar columna</button>

                        </article>

                

                    </section>
                    


                </Dialog>}











                {columns && <Dialog header="Admninistrar ejercicio" className="text-center" visible={adminExercise} style={{ width: '25vw' }} onHide={() => setAdminExercise(false)}>
                    <div className="row justify-content-center">
                        <div className="mb-3">
                            <label>Nombre</label>
                            <input type="Nombre" className="form-control" onChange={changeNameExercise} defaultValue={name}  />
                        </div>
                        <div className="mb-3">
                            <label>Link video</label>
                            <input type="Link del video" className="form-control" onChange={changeVideoExercise} defaultValue={video}/>
                        </div>

                    </div>

                    <div  className="row justify-content-center">
                        <button type="submit" className={`btn btn-primary mb-3 ${textColor == 'false' ? "bbb" : "blackColor"} mx-1 col-6`} style={{ "backgroundColor": `${color}` }} disabled={loading} onClick={() => editExerciseInColumn(columnId, idExercise, name, video)}>Editar ejercicio</button>

                        <button type="submit" className={`btn btn-danger ${textColor == 'false' ? "bbb" : "blackColor"} mx-1 col-6`} style={{ "backgroundColor": `${color}` }} disabled={loading} onClick={() => deleteExerciseInColumn(columnId, idExercise)}>Eliminar ejercicio</button>
                    </div>

                    
                </Dialog>}






                {routine && <Dialog header="Admninistrar PAR" className="text-center"  visible={administerAdminPAR} style={{ width: '75vw' }} onHide={() => setAministerAdminPAR(false)}>
                        <table className="table table-bordered altoListPAR">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Reps</th>
                        <th scope="col">Sets</th>
                        <th scope="col">Rest</th>
                        <th scope="col">Video</th>
                        <th scope="col">Notas</th>
                        </tr>
                    </thead>

                    
                        {routine.routine.map((week, dayIndex) => (
                            <>
                            <tbody>

                                <tr className="border-0">
                                    <td className="border-0"></td>
                                </tr>
                                
                                <tr>
                                    <td colSpan={7}>{week.name}</td>
                                </tr>

                                <tr className="border-0">
                                    <td className="border-0"></td>
                                </tr>
                            </tbody>
                            <tbody> 

                                        {week.exercises.map((exercises) =>
                                                <>
                                                <tr>
                                                    <th scope="row">{exercises.numberExercise}</th>
                                                    <td>{notRandom ? exercises.name : exercises.mainName}</td>
                                                    <td>{exercises.sets}</td>
                                                    <td>{exercises.reps}</td>
                                                    <td>{exercises.rest}</td>
                                                    <td>{exercises.video}</td>
                                                    <td>{exercises.notas}</td>
                                                </tr>
                                                </>
                                            )}
                                        
                            </tbody>
    
                                    </>

                                        ))} 

                                        <tbody>
                                            <tr className="border-0">
                                                <td className="border-0"></td>
                                            </tr>
                                            <tr>
                                                    <td 
                                                        colSpan={1}
                                                        className="">
                                                        <Dropdown
                                                        value={actualUser}
                                                        options={users}
                                                        optionLabel="name"
                                                        placeholder="Seleccioná un alumno"
                                                        onChange={(e) => handleDropdownChange(e.value)}
                                                        className="w-100 dropDown"
                                                        filter
                                                        scrollHeight={"360px"}
                                                        filterPlaceholder={"ss"}
                                                        emptyFilterMessage={"No se encontró ningun alumno"}
                                                        emptyMessage={"No se encontró ningun alumno"}
                                                        />
                                                    </td>
                                                    <td colSpan={3}><button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} w-100`} style={{ "backgroundColor": `${color}` }} onClick={() => FindSameName()}>Generar semana</button></td>
                                                    <td colSpan={3}><button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} w-100`} style={{ "backgroundColor": `${color}` }} onClick={() => createWeek()}>Designar semana</button></td>
                                            </tr>
                                        </tbody>
                        
                                        </table>

                                        <div>
                                            <button className="btn btn-danger" onClick={() => deletePAR(parId)}>Eliminar</button>
                                        </div>
                                      

                                        
                </Dialog>}
                
            </article>










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
        </section>

    </>
        
    );
}

export default Randomizer;
