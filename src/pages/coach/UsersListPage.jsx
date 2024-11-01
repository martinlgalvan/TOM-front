import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import * as UsersService from "../../services/users.services.js";
import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";
import * as UserService from "../../services/users.services.js";

import UserRegister from "../../components/Users/UserRegister.jsx";
import Logo from "../../components/Logo.jsx";
import DeleteUserDialog from "../../components/DeleteActions/DeleteUserDialog.jsx";


import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import PrimeReactTable from "../../components/PrimeReactTable.jsx";

function UsersListPage() {
    const { id } = useParams();

    const data = sessionStorage.getItem("U4S3R");

    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState(0);

    const [profileData, setProfileData] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const [name, setName] = useState(); // Variable para la eliminación
    const [user_id, setUser_id] = useState(); // ----------------------------*
    
    let idRefresh = RefreshFunction.generateUUID();
      
    useEffect(() => {
        Notify.notifyA("Cargando usuarios...");

        UsersService.find(id).then((data) => {
            setUsers(data);
            // Y a pesar de no utilizar el del storage, se actualiza.
            let jsonDATA = JSON.stringify(data);
            sessionStorage.setItem("U4S3R", jsonDATA);
            Notify.updateToast();
        });
    }, [status]);

    useEffect(() => {
        if (profileData && profileData.details) {
            const days = Object.keys(profileData.details);
            if (days.length > 0) {
                setSelectedDay(days[0]);
            }
        }
    }, [profileData]);

    const refresh = () => {
        setStatus(prev => prev + 1);  // Incrementa el estado para forzar el useEffect de actualización
    };

    const [showDialog, setShowDialog] = useState();


    const hideDialog = (load) => {
        load != null ? setStatus(idRefresh) : null;
        setShowDialog(false);
    };


    return (
        <>
        <div className="container-fluid p-0 mb-5">
            <Logo />
        </div>       
        
        <section className="container-fluid">

            <h2 className="text-center mb-5">
                ¡Bienvenido/a {localStorage.getItem("name")}!
            </h2>

            <article className="row justify-content-center text-center ">
                <div className="col-10 col-lg-6 mb-3">
                    <p>
                        Bienvenido al administrador de tus alumnos. Acá podrás
                        crear el usuario a tus alumnos para que puedan ingresar
                        a su planificación.
                    </p>
                </div>

                <div className="mb-4 ">
                    <UserRegister refresh={refresh} />
                </div>

                <div className="row justify-content-center">
                    <PrimeReactTable name={name} user_id={user_id} id={id} users={users}  refresh={refresh} />
                </div>
            </article>

            <ConfirmDialog />

            <DeleteUserDialog
                showDialog={showDialog}
                hideDialog={hideDialog}
                load={id}
            />
        </section>
    </>
    );
}

export default UsersListPage;
