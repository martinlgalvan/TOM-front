import React, { useState, useEffect } from "react";

import * as UsersService from "../services/users.services.js";
import * as WeekService from "../services/week.services.js";
import * as NotifyHelper from "../helpers/notify.js";
import * as RefreshFunction from "../helpers/generateUUID.js";
import * as ParService from "../services/par.services.js";
import DeleteUserDialog from "./DeleteActions/DeleteUserDialog.jsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";

import IconButton from "@mui/material/IconButton";
import PersonIcon from "@mui/icons-material/Person";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteWeek from "./DeleteActions/DeleteWeek.jsx";

export default function PrimeReactTable_Routines({ id, username, routine, setRoutine, copyRoutine }) {
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [nameUser, setNameUser] = useState([]);
    const [id_user, setId_user] = useState([]);
    const [profileData, setProfileData] = useState();
    const [days, setDays] = useState([]);

    const [widthPage, setWidthPage] = useState();
    let idRefresh = RefreshFunction.generateUUID();
    const [copyWeekStorage, setCopyWeekStorage] = useState();

    const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState(); //Dialog Delete
    const [weekName, setWeekName] = useState(""); //Dialog Delete
    const [week_id, setWeek_id] = useState(""); //Dialog Delete
    const [firstWidth, setFirstWidth] = useState();

    useEffect(() => {
        setFirstWidth(window.innerWidth);
    }, []);

    const actionsTemplate = (routine, e) => {

        return (
            <div>
                <Link
                    className={`LinkDays  `}
                    to={`/routine/user/${id}/week/${routine._id}/day/${
                        routine.routine[0]._id
                    }/${username}`}
                >
                    <IconButton aria-label="delete" className="btn p-3">
                        <EditIcon className="text-dark " />
                    </IconButton>
                </Link>
                <IconButton
                    aria-label="video"
                    onClick={() => saveToLocalStorage(routine)}
                    className={`btn p-3`}
                >
                    <ContentCopyIcon className="text-dark " />
                </IconButton>

                <IconButton
                    aria-label="delete"
                    onClick={() => deleteWeek(routine._id, routine.name)}
                    className={`btn p-3`}
                >
                    <CancelIcon className="colorIconYoutube " />
                </IconButton>
            </div>
        );
    };

    const linksTemplate = (routine, e) => {
        if (id && e.field == "name") {
            return (
                <Link
                    className="LinkDays p-3 w-100 "
                    to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}
                >
                    {routine.name}
                </Link>
            );
        } else if (id && e.field == "date") {
            return (
                <Link
                    className="LinkDays p-3 w-100 "
                    to={`/routine/user/${id}/week/${routine._id}/day/${
                        routine.routine[0]._id
                    }/${username}`}
                >
                    {routine.created_at.fecha} - {routine.created_at.hora}
                </Link>
            );
        } else if (id && e.field == "days") {
            return (
                <Link
                    className="LinkDays p-3 w-100 "
                    to={`/routine/user/${id}/week/${routine._id}/day/${
                        routine.routine[0]._id
                    }/${username}`}
                >
                    {routine.routine.length}
                </Link>
            );
        }
    };

    // COPY LOGIC --------------------------------------------- //

    const saveToLocalStorage = (data) => {

        try {
            localStorage.setItem("userWeek", JSON.stringify(data));
            setCopyWeekStorage(JSON.stringify(data));
            copyRoutine(data)
            NotifyHelper.instantToast("Copiado con éxito!");
        } catch (err) {
            console.error("Error al guardar en localStorage: ", err);
        }
    };

    const loadFromLocalStorage = () => {
        try {
            if (copyWeekStorage) {
                const parsedData = JSON.parse(copyWeekStorage);
                console.log(parsedData);
                ParService.createPARroutine(parsedData, id).then((data) => {
                    setLoading(idRefresh);
                    setStatus(idRefresh);
                    NotifyHelper.updateToast();
                });
            } else {
                alert("No hay datos en localStorage!");
            }
        } catch (err) {
            console.error("Error al cargar desde localStorage: ", err);
        }
    };

    // DELETE ACTIONS ------------------------------------- //

    const deleteWeek = (week_id, name) => {
        setWeekName(name);
        setWeek_id(week_id);
        setShowDeleteWeekDialog(true);
    };
    
    const deleteWeekConfirm = () => {
        setRoutine((prevRoutine) => prevRoutine.filter(week => week._id !== week_id));
    };

    const hideDialog = (load) => {
        console.log(load)
        
        setShowDeleteWeekDialog(false);
   
    };



    

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10 mb-5">
                <DataTable
                    className="usersListTable m-auto pt-0"
                    paginator
                    rows={10}
                    value={routine}
                >
                    <Column body={linksTemplate} field="name" header="Nombre" />
                    {firstWidth > 568 && <Column body={linksTemplate} field="date" header="Fecha" />}
                    {firstWidth > 568 && <Column body={linksTemplate} field="days" header="Días" />}
                    <Column body={actionsTemplate} header="Acciones" />
                </DataTable>

                <ToastContainer />
            </div>

            <DeleteWeek
                visible={showDeleteWeekDialog}
                onDelete={deleteWeekConfirm}
                onHide={hideDialog}
                week_id={week_id}
                name={weekName}
            />
        </div>
    );
}
