import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";


//.............................. SERVICES ..............................//

import * as UsersService from "../../services/users.services.js";



//.............................. HELPERS ..............................//

import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";



//.............................. BIBLIOTECAS EXTERNAS ..............................//

import { Tour } from 'antd'; // Importamos el componente Tour
import { ProgressBar } from "primereact/progressbar";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';


//.............................. COMPONENTES ..............................//

import LogoChico from "../../components/LogoChico.jsx";
import DeleteUserDialog from "../../components/DeleteActions/DeleteUserDialog.jsx";
import PrimeReactTable from "../../components/PrimeReactTable.jsx";


//.............................. ICONOS MUI ..............................//

import IconButton from "@mui/material/IconButton";
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import BarChartIcon from '@mui/icons-material/BarChart';
import Logo from "../../components/Logo.jsx";



function UsersListPage() {

    const { id } = useParams();

    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState(0);
    const [isPlanPaid, setIsPlanPaid] = useState(true);
    const [plan, setPlan] = useState(""); // Plan actual
    const [planLimit, setPlanLimit] = useState(0); // Límite del plan
    const [totalUsers, setTotalUsers] = useState(0); // Total de usuarios
    const [progress, setProgress] = useState(0); // Progreso en porcentaje
    const [collapsed, setCollapsed] = useState(false); // Maneja si el sidebar está colapsado o no
    const [tourSteps, setTourSteps] = useState([]);
    const [tourVisible, setTourVisible] = useState(false);
    const [showDialog, setShowDialog] = useState();

    let idRefresh = RefreshFunction.generateUUID();

    const PLAN_LIMITS = {
        Gratuito: 5,
        Basico: 20,
        Profesional: 55,
        Elite: 95,
        Empresarial: 140,
        Personalizado: 500, // Asume más de 121 usuarios
    };


    useEffect(() => {
      setTourSteps([
          {
              title: `Hola ${localStorage.getItem("name")}!`,
              description: 'Actualmente te encontras en esta cuenta.',
              target: () => document.getElementById('username'),
              placement: 'right',
              nextButtonProps: { children: 'Siguiente »' }
          },
          {
              title: 'Nombre del plan',
              description: 'Este es el plan que te corresponde debido a tu cantidad de alumnos.',
              target: () => document.getElementById('plan'),
              placement: 'right',
              prevButtonProps: { children: '« Anterior' },
              nextButtonProps: { children: 'Siguiente »' }
          },
          {
              title: 'Cantidad de alumnos.',
              description: 'Número de alumnos que tenés actualmente.',
              target: () => document.getElementById('alumnos'),
              placement: 'right',
              prevButtonProps: { children: '« Anterior' },
              nextButtonProps: { children: 'Siguiente »' }
          },
          {
              title: 'Cracion de alumnos',
              description: 'Este botón te permitira crear el usuario para tu alumno.',
              target: () => document.getElementById('crearAlumno'),
              placement: 'right',
              prevButtonProps: { children: '« Anterior' },
              nextButtonProps: { children: 'Siguiente »' }
          }
      ]);
  }, []);
      
    useEffect(() => {
        Notify.notifyA("Cargando usuarios...");

        UsersService.find(id).then((data) => {
            setUsers(data);
            setTotalUsers(data.length)
            let jsonDATA = JSON.stringify(data);
            sessionStorage.setItem("U4S3R", jsonDATA);
            Notify.updateToast();
        });
    }, [status]);

    useEffect(() => {
        UsersService.findUserById(id).then((data) => {
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

    const refresh = () => {
        setStatus(prev => prev + 1);  // Incrementa el estado para forzar el useEffect de actualización
    };

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
    
        <div className="sidebarPro">
        <Sidebar 
          collapsed={collapsed}
          collapsedWidth={'85px'}
          width="200px"
          backgroundColor="colorMain"
          rootStyles={{
            color: 'white',
            border: 'none'
          }}
        >
          <Menu>

          <MenuItem
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              className="mt-3"
              icon={<ViewHeadlineIcon/> }
              style={{ height: 'auto', whiteSpace: 'normal' }}
            > 
              <span>Ocultar barra</span>
            </MenuItem>

            <MenuItem
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              className="mt-3"
              icon={<ViewHeadlineIcon/> }
              style={{ height: 'auto', whiteSpace: 'normal' }}
            > 
              <span>Ocultar barra</span>
            </MenuItem>

            <MenuItem id={'username'} icon={collapsed ? <PersonIcon /> : ''} disabled={collapsed ? false : true} className="mt-3 "> 
              <div className="bg-light rounded-2 text-center">
                <p className="m-0">Bienvenido <strong className="d-block">{localStorage.getItem("name")}</strong></p>
              </div>
            </MenuItem>



            <MenuItem id={'plan'} icon={collapsed ? <CardMembershipIcon />: ''} disabled={collapsed ? false : true}  className="mt-3 "> 
              <div className="bg-light rounded-2 text-center py-2">
                <p className="m-0">Plan <strong className="d-block">{plan}</strong></p>
              </div>
            </MenuItem>
            
            
            <MenuItem id={'alumnos'} icon={collapsed ? <BarChartIcon />: ''} disabled={collapsed ? false : true} className="mt-4 " >
                <div className="bg-light rounded-2 text-center py-2">
                    <p className="m-0">  ({totalUsers}/{planLimit} alumnos)
                        <span className="d-block">  <ProgressBar
                                        value={progress}
                                        showValue={false}
                                        className="mx-3"
                                        style={{ height: "20px", borderRadius: "10px" }}
                                    /></span>
                    </p>
                </div>              
            </MenuItem>

            <MenuItem disabled className="margenLogoUserListPage ">
              <LogoChico />

            </MenuItem>



            <MenuItem className="mt-3 text-center botonHelp"  onClick={() => setTourVisible(true)}>
              <IconButton className="p-2 bg-light ">
                <HelpOutlineIcon className="text-dark" /> 
              </IconButton>
              <span className="ms-2">Ayuda</span>
            </MenuItem>

          </Menu>
        </Sidebar>
      </div>
        
        <section   className="container-fluid totalHeight">

            <article id={'tabla'} className={`row justify-content-center text-center ${collapsed ? 'marginSidebarOpen' : 'marginSidebarClosed'}`}>

                <PrimeReactTable id={id} users={users}  refresh={refresh} />
                
            </article>

            <ConfirmDialog />

            <DeleteUserDialog
                showDialog={showDialog}
                hideDialog={hideDialog}
                load={id}
            />

                {/* TOUR */}
                {tourVisible && (
                  <Tour
                    open={tourVisible}
                    steps={tourSteps}
                    onClose={(currentStep) => {
                      setTourVisible(false);
                    }}
                    onFinish={(currentStep) => {
                      setTourVisible(false);
                    }}
                    scrollIntoViewOptions={true}
                  />
                )}

        </section>
    </>
    );
}

export default UsersListPage;
