import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import * as DatabaseExercises from "../../services/jsonExercises.services.js";

import DataBaseExercises from "../../components/DatabaseCreateExercise.jsx";
import Logo from "../../components/Logo";
import ModalEditDatabase from "../../components/Bootstrap/ModalEdit/ModalEditDatabase.jsx";

import { CSSTransition, TransitionGroup } from "react-transition-group";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ToastContainer, toast } from "react-toastify";

function UsersListPage() {
    const { id } = useParams();
    const [exercises, setExercises] = useState([]);
    const [name, setName] = useState([]);
    const [exercise_id, setExercise_id] = useState()
    const [video, setVideo] = useState()
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(0);
    const [loading, setLoading] = useState(false);
    const [numberToast, setNumberToast] = useState(0);
    const [showEdit, setShowEdit] = useState(false);
    const TOASTID = "LOADER_ID";

    const navigate = useNavigate();

    function generateUUID() {
        let d = new Date().getTime();
        let uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                let r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
            }
        );
        return uuid;
    }

    let idRefresh = generateUUID();

    useEffect(() => {
        setLoading(true);

        DatabaseExercises.findExercises(id).then((data) => {
            console.log(data);
            console.log(id);
            setExercises(data);
            setLoading(false);
        });
    }, [status]);

    const refresh = (refresh) => {
        setStatus(refresh);
    };

    const reject = () => {};

    function acceptDeleteUser(id) {
        setLoading(1);
        DatabaseExercises.deleteExercise(id).then(() => {
            setStatus(idRefresh);
        });
    }

    //Notify popup
    const deleteExercise = (event, id, name) => {
        confirmDialog({
            trigger: event.currentTarget,
            message: `¡Cuidado! Estás por eliminar ${name}. ¿Estás seguro?`,
            icon: () => <div id="loading"></div>,
            header: `Eliminar ${name}`,
            accept: () => acceptDeleteUser(id),
            reject,
            acceptLabel: "Sí, eliminar",
            acceptClassName: "p-button-danger",
            rejectLabel: "No",
            rejectClassName: "closeDialog",
            blockScroll: true,
            dismissableMask: true,
        });
    };

    //Función de búsqueda
    const searcher = (e) => {
        setSearch(e.target.value);
    };

    const results = !search
        ? exercises
        : exercises.filter((dato) =>
              dato.name.toLowerCase().includes(search.toLocaleLowerCase())
          );

    const notifyA = (message) => {
        toast.loading(message, {
            position: "bottom-center",
            toastId: TOASTID,
            autoClose: false,
            hideProgressBar: true,
            pauseOnFocusLoss: false,
            limit: 1,
        });
    };

    const updateToast = () =>
        toast.update(TOASTID, {
            render: "Carga completa",
            isLoading: false,
            type: toast.TYPE.SUCCESS,
            hideProgressBar: true,
            autoClose: 1000,
            limit: 1,
            className: "rotateY animated",
        });

    const showLoadingToast = () => {
        if (loading == true) {
            notifyA(numberToast == 1 ? "Eliminando usuario..." : "Cargando...");
        } else {
            updateToast();
        }
    };

  const actionConfirm = () => {
    setShowEdit(false)
  } 

  const handleShow = (id,name,video) => {
    setExercise_id(id)
    setName(name)
    setVideo(video)
    setShowEdit(true)
  } 

  const handleClose = () => {
    setShowEdit(false)
    setNumberToast(false)
    setStatus(idRefresh)
  } 

    return (
        <section className="container-fluid">
            <Logo />

            <article className="row justify-content-center mb-5">

                <div className="col-9">
                    <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">    
                            <tr>
                                <th scope="col">Nombre</th>
                                <th scope="col" className="">Video</th>
                                <th scope="col">Acciones</th>
                            </tr>
                            <DataBaseExercises refresh={refresh} />
                            <tr className="">
                              <th colSpan={3}>
                                <input
                                value={search}
                                onChange={searcher}
                                type="text"
                                placeholder="Buscar"
                                className="col-5 form-control rounded-0"/>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {showLoadingToast()}
                            <TransitionGroup
                                component={null}
                                className="todo-list"
                            >
                                {results.map(({ _id, name, video }) => (
                                    <CSSTransition
                                        key={_id}
                                        timeout={500}
                                        classNames="item">
                                        <tr key={_id}>
                                            <td className="text-center"> {name} </td>
                                            <td className="text-center"> {video} </td>
                                            <td className="text-center">
                                                <button onClick={() => handleShow( _id, name, video )} className="btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-pencil-square" viewBox="0 0 16 16">
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    </CSSTransition>
                                ))}
                            </TransitionGroup>
                        </tbody>
                    </table>
                </div>
            </article>
            <ConfirmDialog />
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

    <ModalEditDatabase showEdit={showEdit} handleClose={handleClose} actionConfirm={actionConfirm} exercise_id={exercise_id} nameExercise={name} videoExercise={video}/>

        </section>

        
    );
}

export default UsersListPage;
