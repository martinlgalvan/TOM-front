import React, { useState, useEffect } from "react";
import Logo from "../../components/Logo.jsx";
import AddColorToUser from "../../components/Users/AddColorToUser.jsx";
import { ProgressBar } from "primereact/progressbar"; // Barra de progreso
import * as UsersService from "../../services/users.services.js";

const PLAN_LIMITS = [
    { name: "Gratuito", props: { limit: 5, price: "Gratuito"}},
    { name: "Basico", props: { limit: 20, price: 20000}},
    { name: "Profesional", props: { limit: 55, price: 30000}},
    { name: "Elite", props: { limit: 95, price: 36000}},
    { name: "Empresarial", props: { limit: 140, price: 43500}},
    { name: "Personalizado", props: { limit: 500, price: "Personalizado"}},
];

function UsersListPage() {
    const [id, setId] = useState(localStorage.getItem('_id'));
    const [users, setUsers] = useState([]);
    const [plan, setPlan] = useState("");
    const [planLimit, setPlanLimit] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simula obtener datos del usuario actual
        UsersService.findUserById(id).then((data) => {
            setPlan(data.plan || "Gratuito");
    
            // Busca el plan correspondiente en PLAN_LIMITS
            const selectedPlan = PLAN_LIMITS.find((plan) => plan.name === data.plan) || PLAN_LIMITS.find((plan) => plan.name === "Gratuito");
            setPlanLimit(selectedPlan.props.limit); // Establece el límite del plan
        });
    
        // Obtener lista de usuarios del usuario actual
        UsersService.find(id).then((data) => {
            setUsers(data);
            setTotalUsers(data.length);
        });
    }, [id]);

    useEffect(() => {
        if (planLimit > 0) {
            setProgress((totalUsers / planLimit) * 100);
        }
    }, [totalUsers, planLimit]);

    return (
        <>
            <div className="container-fluid p-0">
                <Logo />
            </div>

            <section className="container-fluid">
                <article className="row justify-content-center mt-4">
                    <div className="col-10 col-lg-6 mb-4 text-center">
                        {/* Información del plan y barra de progreso */}
                        <h5>
                            Plan Actual: {plan} ({totalUsers}/{planLimit} alumnos)
                        </h5>
                        <ProgressBar
                            value={progress}
                            showValue={false}
                            style={{ height: "20px", borderRadius: "10px" }}
                        />
                        {progress >= 100 && (
                            <p style={{ color: "#f44336", marginTop: "10px" }}>
                                ¡Has alcanzado el límite de alumnos de tu plan!
                            </p>
                        )}
                    </div>

                    <div className="col-10  mb-4 text-center">

                        <p>Para mantener tu plan activo, aboná del 1 al 10 de cada mes.</p>
                        <p>Datos bancarios</p>
                        <p>Alias: martinlgalvan.uala</p>
                        <p>CVU: 0000007900204282114220</p>
                        <p>Enviá el comprobante acá</p>
                        <a href="https://wa.me/message/6PSH46QCW4OTP1" target="_blank" class="whatsapp-btn">WhatsApp</a>

                    </div>

         
                </article>

                {/* Cards con planes */}
                    <article className="row justify-content-center my-5">
                    <h3 className="text-center mb-4">Nuestros Planes</h3>
                    {PLAN_LIMITS.map(({ name, props: { limit, price } }, index) => (
                        <div key={index} className="col-12 col-md-4  mb-4">
                            <div
                                className="card"
                                style={{
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                    borderRadius: "10px",
                                }}
                            >
                                <div className="card-body text-center">
                                    <h5 className="card-title">{name}</h5>
                                    <p className="card-text">
                                        Hasta <strong>{limit}</strong> alumnos
                                    </p>
                                    <p className="card-text">
                                        Precio:{" "}
                                        <strong>
                                            {price === "Gratuito" || price === "Personalizado"
                                                ? price
                                                : `$${price}`}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </article>

                <div className="row justify-content-center">



                    <div className="col-10 text-center my-5">
                        <h2>Más personalización pronto...</h2>
                    </div>

                </div>
            </section>
        </>
    );
}

export default UsersListPage;
