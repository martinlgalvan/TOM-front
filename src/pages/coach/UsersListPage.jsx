import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import * as UsersService from "../../services/users.services.js";
import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";
import * as UserService from "../../services/users.services.js";

import UserRegister from "../../components/Users/UserRegister.jsx";
import Logo from "../../components/Logo.jsx";
import DeleteUserDialog from "../../components/DeleteActions/DeleteUserDialog.jsx";
import { ProgressBar } from "primereact/progressbar";

import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import PrimeReactTable from "../../components/PrimeReactTable.jsx";

function UsersListPage() {
    const { id } = useParams();

    const data = sessionStorage.getItem("U4S3R");

    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState(0);

    const [profileData, setProfileData] = useState(null);
    const [isPlanPaid, setIsPlanPaid] = useState(true);


    const [plan, setPlan] = useState(""); // Plan actual
    const [planLimit, setPlanLimit] = useState(0); // Límite del plan
    const [totalUsers, setTotalUsers] = useState(0); // Total de usuarios
    const [progress, setProgress] = useState(0); // Progreso en porcentaje

    const [selectedDay, setSelectedDay] = useState(null);

    const [name, setName] = useState(); // Variable para la eliminación
    const [user_id, setUser_id] = useState(); // ----------------------------*

    const PLAN_LIMITS = {
        Gratuito: 5,
        Basico: 20,
        Profesional: 55,
        Elite: 95,
        Empresarial: 140,
        Personalizado: 500, // Asume más de 121 usuarios
    };

    
    let idRefresh = RefreshFunction.generateUUID();
      
    useEffect(() => {
        Notify.notifyA("Cargando usuarios...");

        UsersService.find(id).then((data) => {
            setUsers(data);
            setTotalUsers(data.length)
            // Y a pesar de no utilizar el del storage, se actualiza.
            let jsonDATA = JSON.stringify(data);
            sessionStorage.setItem("U4S3R", jsonDATA);
            Notify.updateToast();
        });
    }, [status]);

    useEffect(() => {
        UsersService.findUserById(id).then((data) => {
           console.log(data)
           setIsPlanPaid(data.isPlanPaid)
           const limit = PLAN_LIMITS[data.plan] || PLAN_LIMITS.Gratuito
           setPlanLimit(limit)
           setPlan(data.plan)
        });
    }, [status]);

    useEffect(() => {
        // Actualizar el progreso
        if (planLimit > 0) {
            setProgress((totalUsers / planLimit) * 100);
        }
    }, [totalUsers, planLimit]);

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


    if(isPlanPaid === false ){
        return (
            <div className="container-fluid p-0 mb-5">
              <Logo />
                <div className="row justify-content-center text-center mt-5">
                    <div className="col-9">

                        <h2>Hola {localStorage.getItem("name")}!</h2>
                        <p>Tu plan no esta pago. Por favor, comunicate con el administrador para abonar y recuperar el acceso a tus alumnos.</p>

                        <a href="https://wa.me/message/6PSH46QCW4OTP1" target="_blank" class="whatsapp-btn">WhatsApp</a>


                    </div>
                </div>
            </div>
          );
    }

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

                            {/* Barra de progreso */}
                            <div className="col-10 col-lg-9  mb-4">
                                <h3>
                                    Plan Actual: {plan}
                                </h3>
                                <p> ({totalUsers}/{planLimit} alumnos)</p>
                                <div className="row justify-content-center">
                                    <div className="col-10 col-lg-6">
                                        <ProgressBar
                                        value={progress}
                                        showValue={false}
                                        style={{ height: "20px", borderRadius: "10px" }}
                                    />
                                    {progress >= 100 && (
                                        <p style={{ color: "#f44336", marginTop: "10px" }}>
                                            ¡Has alcanzado el límite de usuarios de tu plan! 
                                            <span className="d-block">Para poder crear más usuarios deberás actualizar tu plan.</span>
                                        </p>
                                    )}
                                    </div>

                                    <p className="text-danger mt-3">Recordá abonar antes del 10 para continuar utilizando la aplicación.</p>
                                    <p className="text-danger">Si ya abonaste, ignorá este mensaje.</p>
                                     
                                </div>

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
