import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

//.............................. SERVICES ..............................//

import * as ParService from "../services/par.services.js";


//.............................. HELPERS ..............................//

import * as NotifyHelper from "../helpers/notify.js";
import * as RefreshFunction from "../helpers/generateUUID.js";


//.............................. COMPONENTES ..............................//

import DeleteWeek from "./DeleteActions/DeleteWeek.jsx";


//.............................. BIBLIOTECAS EXTERNAS ..............................//

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";


//.............................. ICONOS MUI ..............................//

import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";


export default function PrimeReactTable_Routines({ id, username, routine, setRoutine, copyRoutine }) {

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
                    <IconButton aria-label="delete" className="btn p-2 my-1">
                        <EditIcon className="text-dark " />
                    </IconButton>
                </Link>
                <IconButton
                    aria-label="video"
                    onClick={() => saveToLocalStorage(routine)}
                    className={`btn p-2 my-1`}
                >
                    <ContentCopyIcon className="text-dark " />
                </IconButton>

                <IconButton
                    aria-label="delete"
                    onClick={() => deleteWeek(routine._id, routine.name)}
                    className={`btn p-2 my-1`}
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
                    className="LinkDays p-2 my-1 w-100 "
                    to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}
                >
                    {routine.name}
                </Link>
            );
        } else if (id && e.field == "date") {
            return (
                <Link
                    className="LinkDays p-2 my-1 w-100 "
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
                    className="LinkDays p-2 my-1 w-100 "
                    to={`/routine/user/${id}/week/${routine._id}/day/${
                        routine.routine[0]._id
                    }/${username}`}
                >
                    {routine.routine.length}
                </Link>
            );
        } else if (id && e.field == "acciones") {
            return (
                <h2>ACCIONN</h2>
            );
        }
    };

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

    const deleteWeek = (week_id, name) => {
        setWeekName(name);
        setWeek_id(week_id);
        setShowDeleteWeekDialog(true);
    };
    
    const deleteWeekConfirm = () => {
        setRoutine((prevRoutine) => prevRoutine.filter(week => week._id !== week_id));
    };

    const hideDialog = (load) => { setShowDeleteWeekDialog(false);}


    return (
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10 mb-5">
                <DataTable
                    className="usersListTable m-auto pt-0"
                    emptyMessage={routine ? ' ' : ' '}
                    paginator
                    rows={8}
                    value={routine}
                >
                    <Column body={linksTemplate} field="name" header="Nombre" />
                    {firstWidth > 568 && <Column body={linksTemplate} field="date" header="Fecha" />}
                    {firstWidth > 568 && <Column body={linksTemplate} field="days" header="Días" />}
                    <Column body={actionsTemplate} field="acciones" header="Acciones" />
                </DataTable>

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
