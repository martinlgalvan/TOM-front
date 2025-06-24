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
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { SelectButton } from 'primereact/selectbutton';

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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';


import { SquarePen, CircleX, Copy, HelpCircle } from 'lucide-react';

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
    const [firstWidth, setFirstWidth] = useState(); 
    
    const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
    const [usersList, setUsersList] = useState([]); // Lista completa de usuarios para MultiSelect

    const [formVisible, setFormVisible] = useState(false);
    const [showLinkField, setShowLinkField] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [mode, setMode] = useState(null); // 'once' o 'repeat'
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    _id: null,
    title: '',
    message: '',
    link_urls: [], // ← CAMBIO A ARRAY
    mode: 'once',
    show_at_date: null,
    repeat_day: null,
    day_of_month: null,
    target_categories: [],
    target_users: []
  });

  const [viewCounts, setViewCounts] = useState({});
  const [viewsMap, setViewsMap] = useState({}); // { anuncioId: [usuarios] }
  const [expandedViewId, setExpandedViewId] = useState(null); // el anuncio cuyo detalle se muestra

  const [showViewsDialog, setShowViewsDialog] = useState(false);
  const [viewsDialogData, setViewsDialogData] = useState();

  
  const DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  const CATEGORIES = ["Alumno casual", "Alumno dedicado", "Atleta iniciante", "Atleta avanzado"];
  const MODE_OPTIONS = [
    { label: 'Anuncio único', value: 'once' },
    { label: 'Programar días', value: 'repeat' },
    { label: 'Cada X del mes', value: 'monthly' }
  ];

  const fetchViewCounts = async () => {
  try {
    const counts = await UsersService.getAnnouncementViewCounts(id);
    setViewCounts(counts);
  } catch (err) {
    Notify.instantToast("Error al obtener conteo de vistas");
  }
};

useEffect(() => {
  if (showAnnouncementsDialog) {
    fetchAnnouncements();
    fetchUsers();
    fetchViewCounts(); // ← esto carga los conteos rápidos
  }
}, [showAnnouncementsDialog]);

const fetchViewsForAnnouncement = async (announcementId, title) => {
  console.log(announcementId, title)
  try {
    const views = await UsersService.getAnnouncementViewsWithNames(announcementId);
    setViewsMap(prev => ({ ...prev, [announcementId]: views })); // Si querés seguir guardando
    setViewsDialogData(views.viewers);
    setShowViewsDialog(true);
    console.log(views)
  } catch (err) {
    console.error("Error al obtener vistas del anuncio:", err);
    Notify.instantToast("Error al obtener vistas del anuncio");
  }
};

const fetchAnnouncements = async () => {
  setLoadingAnnouncements(true);
  try {
    const res = await UsersService.getAnnouncementsByCreator(id);
    const sorted = res.sort((a, b) => {
      const dateA = a.show_at_date || new Date(0);
      const dateB = b.show_at_date || new Date(0);
      return new Date(dateB) - new Date(dateA);
    });
    setAnnouncements(sorted);
  } catch (err) {
    console.error("Error en fetchAnnouncements:", err);
    Notify.instantToast("Error al obtener anuncios");
  } finally {
    setLoadingAnnouncements(false);
  }
};


    const fetchUsers = async () => {
    try {
      const users = await UsersService.find(id);
      setUsersList(users.map(u => ({ label: u.name, value: u._id })));
    } catch (err) {
      Notify.instantToast("Error al obtener usuarios");
    }
  };


  useEffect(() => {
      setFirstWidth(window.innerWidth);

        if (showAnnouncementsDialog) {
      fetchAnnouncements();
      fetchUsers();
    }
  }, [showAnnouncementsDialog]);

  const deleteAnnouncement = async (announcementId) => {
    try {
      await UsersService.deleteAnnouncement(announcementId);
      Notify.instantToast("Anuncio eliminado");
      fetchAnnouncements();
    } catch (err) {
      Notify.instantToast("Error al eliminar anuncio");
    }
  };

const openEditForm = async (ann) => {
  setAnnouncementForm({
    ...ann,
    link_urls: ann.link_urls || []
  });
  setEditMode(true);
  setFormVisible(true);

  if (!viewsMap[ann._id]) {
    const views = await UsersService.getAnnouncementViewsWithNames(ann._id);
    setViewsMap(prev => ({ ...prev, [ann._id]: views }));
  }
};

const openNewForm = () => {
  setAnnouncementForm({
    _id: null,
    title: '',
    message: '',
    link_url: '',
    mode: 'once',
    show_at_date: null,
    repeat_day: null,
    day_of_month: null,
    target_categories: [],
    target_users: []
  });
  setEditMode(false);
  setFormVisible(true);
  setShowLinkField(false);
};

const handleSubmit = async () => {
  const payload = { ...announcementForm, creator_id: id };

  // Solo aplicar validación de fecha en modo 'once' si es creación (no edición)
  if (
    !editMode &&
    payload.mode === "once" &&
    payload.show_at_date
  ) {
    const showDate = new Date(payload.show_at_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ← Importante: ajustar `today` al inicio del día

    if (showDate < today) {
      Notify.instantToast("La fecha seleccionada no puede ser anterior a hoy.");
      return;
    }
  }

  console.log("Payload enviado al editar:", payload);

  try {
    if (editMode) {
      // Eliminar campos no válidos para edición
      const {
        _id,
        created_at,
        read_by,
        link_url, // campo no usado
        ...cleanedPayload
      } = payload;

      await UsersService.editAnnouncement(_id, cleanedPayload);
      Notify.instantToast("Anuncio actualizado");
    } else {
      await UsersService.createAnnouncement(payload);
      Notify.instantToast("Anuncio creado");
    }
    setFormVisible(false);
    fetchAnnouncements();
  } catch (err) {
    Notify.instantToast("Error al guardar anuncio");
  }
};



const confirmDeleteAnnouncement = (announcementId) => {
    setAnnouncementToDelete(announcementId);
};

const handleConfirmDelete = async () => {
    try {
        await UsersService.deleteAnnouncement(announcementToDelete);
        Notify.instantToast("Anuncio eliminado");
        setAnnouncementToDelete(null);
        fetchAnnouncements();
    } catch (err) {
        Notify.instantToast("Error al eliminar anuncio");
    }
};


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

    const isPastDate = () => {
      if (!announcementForm) return false;

      if (announcementForm.mode === "once" && announcementForm.show_at_date) {
        return new Date(announcementForm.show_at_date) < new Date();
      }

      const today = new Date();
      if (announcementForm.mode === "repeat" && announcementForm.repeat_day) {
        // Día de la semana pasado hoy
        const daysMap = {
          Lunes: 1,
          Martes: 2,
          Miercoles: 3,
          Jueves: 4,
          Viernes: 5,
          Sabado: 6,
          Domingo: 0,
        };
        return daysMap[announcementForm.repeat_day] < today.getDay();
      }

      if (announcementForm.mode === "monthly" && announcementForm.day_of_month) {
        return announcementForm.day_of_month < today.getDate();
      }

      return false;
    };

    const isModeLocked = () => {
      return !!(announcementForm.show_at_date || announcementForm.repeat_day || announcementForm.day_of_month);
    };

    return (
        <>
    
       <div className='sidebarPro colorMainAll'>
          <div className="d-flex flex-column justify-content-between colorMainAll shadow-sm" style={{ width: collapsed ? '85px' : '220px', height: '100vh' }}>
            <div className="p-3">
              <h5 className="fw-bold text-center mb-4">TOM</h5>


              {/* NOMBRE */}
              <div className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3">
                <div className='col-1'><PersonIcon /></div>
                {!collapsed && (
                  <div className='text-center text-light col-10'>
                    <strong>{localStorage.getItem("name")}</strong>
                  </div>
                )}
              </div>

              {/* PLAN */}
              <div className="text-light small bgItemsDropdown rounded mx-2 mb-3 p-2 text-center">
                <span className="d-block">Plan</span>
                <strong>{plan}</strong>
              </div>

              {/* PROGRESO */}
              <div className="bgItemsDropdown text-light rounded mx-2 mb-4 p-2 text-center small">
                <span>({totalUsers}/{planLimit} alumnos)</span>
                <ProgressBar
                  value={progress}
                  showValue={false}
                  className="mx-2 mt-1"
                  style={{ height: "20px", borderRadius: "10px" }}
                />
              </div>
            <div className=" text-light rounded text-center small">
              <button
                  label="Administrar anuncios"
                  icon="pi pi-bullhorn"
                  className="btn btn-warning my-1 text-center"
                  onClick={() => setShowAnnouncementsDialog(true)}
                >Administrar anuncios </button>
                </div>
            </div>
            {/* LOGO */}
            <div className="d-grid ">
              <LogoChico />
            </div>

            {/* AYUDA */}
            <div className="p-3 text-center ">
              <button className="btn btn-outline-light btn-sm" onClick={() => setTourVisible(true)}>
                <HelpCircle size={16} className="me-1" /> {!collapsed && "Ayuda"}
              </button>
            </div>
          </div>
        </div>
        
        <section   className="container-fluid totalHeight">

            <article id={'tabla'} className={`row justify-content-center text-center ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}>

              {firstWidth < 982 && 
              <div className="text-center mb-3">
                <button
                    label="Administrar anuncios"
                    icon="pi pi-bullhorn"
                    className="btn btn-warning my-1 text-center"
                    onClick={() => setShowAnnouncementsDialog(true)}
                  >Administrar anuncios </button>
                  </div>
            
              }

                <PrimeReactTable id={id} users={users}  refresh={refresh} collapsed={collapsed} />
                
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

        <Dialog
        header="Administrar anuncios"
        visible={showAnnouncementsDialog}
        onHide={() => setShowAnnouncementsDialog(false)}
        className="col-10 col-sm-9 col-lg-8 col-xl-6"
      >
        <button  icon="pi pi-plus" className="btn btn-primary mb-3" onClick={openNewForm}>Nuevo anuncio</button>

        {loadingAnnouncements ? (
          <p className="ms-1 my-3">Cargando...</p>
        ) : announcements.length === 0 ? (
          <p className="ms-1 my-3">No hay anuncios creados aún.</p>
        ) : (
          <ul className="list-group">
            {announcements.map((a) => (
              <li key={a._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{a.title}</strong>
                    <p className="mb-0">{a.message}</p>
                  </div>
                  <div>
                    <IconButton onClick={() => openEditForm(a)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => confirmDeleteAnnouncement(a._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>

                {/* FOOTER RESUMEN DE VISTAS */}
                <div className="mt-2 border-top pt-2 d-flex justify-content-between align-items-center small text-muted">
                    <span>
                      Visto por {viewCounts[a._id] ?? 0} usuario(s)
                    </span>
                    <Button
                      className="p-button-text p-button-sm"
                      icon="pi pi-eye"
                      label="Ver quién lo vio"
                      onClick={() => fetchViewsForAnnouncement(a._id, a.title)}
                    />
                </div>

                {/* LISTADO EXPANDIDO */}
                {expandedViewId === a._id && viewsMap[a._id] && (
                  <div className="mt-2 ps-2">
                    <ul className="list-group">
                     {expandedViewId === a._id && Array.isArray(viewsMap[a._id]) && (
                        <div className="mt-2 ps-2">
                          <ul className="list-group">
                            {viewsMap[a._id].map((user) => (
                              <li key={user._id} className="list-group-item py-1 px-2">
                                <strong>{user.name}</strong> — <span className="text-muted small">{user.email}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            
          </ul>
        )}
      </Dialog>

      <Dialog
        header={editMode ? "Editar anuncio" : "Nuevo anuncio"}
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        className="col-10 col-sm-9 col-lg-8 col-xl-6 "
      >
        <div className="p-fluid text-dark">
          <div className="mb-3 ">
            <label className="styleInputsSpan text-light">Nombre</label>
            <InputText value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="styleInputsSpan text-light">Mensaje</label>
            <InputTextarea rows={3} value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} />
          </div>
          <div className="mb-3">
          <label className="styleInputsSpan d-block text-light">Links</label>

          {announcementForm.link_urls?.length > 0 && (
            <ul className="list-group mb-2">
              {announcementForm.link_urls.map((link, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <InputText
                    className="flex-grow-1 me-2"
                    value={link}
                    onChange={(e) => {
                      const updated = [...announcementForm.link_urls];
                      updated[index] = e.target.value;
                      setAnnouncementForm({ ...announcementForm, link_urls: updated });
                    }}
                  />
                  <IconButton
                    className="bg-danger"
                    onClick={() => {
                      const updated = [...announcementForm.link_urls];
                      updated.splice(index, 1);
                      setAnnouncementForm({ ...announcementForm, link_urls: updated });
                    }}
                  >
                    <DeleteIcon className="text-light" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}

        <button
          icon="pi pi-link"
          onClick={() => setAnnouncementForm({
            ...announcementForm,
            link_urls: [...(announcementForm.link_urls || []), '']
          })}
          className="btn btn-primary text-center mt-2"
        >Agregar link</button>
      </div>

          <div className="mb-3">
          <label className="styleInputsSpan text-light">Modo</label>
            <SelectButton
              value={announcementForm.mode}
              options={MODE_OPTIONS}
              onChange={(e) => {
                const updatedForm = {
                  ...announcementForm,
                  mode: e.value,
                  show_at_date: null,
                  repeat_day: null,
                  day_of_month: null
                };
                setAnnouncementForm(updatedForm);
              }}
              disabled={editMode && isModeLocked()}
            />
            {editMode && isModeLocked() && (
              <small className="text-danger d-block mt-1">
                No se puede modificar el modo una vez definido.
              </small>
            )}
        </div>

          {announcementForm.mode === 'once' && (
            <div className="mb-3">
              <label className="styleInputsSpan text-light">Anuncio único</label>
              <p className="styleInputsParaph text-light">Por ejemplo, si selecciona el 17/05, unicamente esa fecha, se mostrará el anuncio.</p>
              <Calendar
                value={announcementForm.show_at_date ? new Date(announcementForm.show_at_date) : null}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, show_at_date: e.value })
                }
                showIcon
                disabled={editMode && isModeLocked()}
                minDate={new Date()}
              />
            </div>
          )}

          {announcementForm.mode === 'repeat' && (
            <div className="mb-3">
              <label className="styleInputsSpanLarge text-light">Una vez por semana</label>
              <p className="styleInputsParaph text-light">Por ejemplo, si selecciona el viernes, todos los viernes, se mostrará este anuncio.</p>
              {editMode && announcementForm.repeat_day && <span className="styleInputsParaph text-danger">Por motivos de consistencia, no se puede editar una vez creado.</span>}
              <Dropdown
                value={announcementForm.repeat_day}
                options={DAYS}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, repeat_day: e.value })
                }
                placeholder="Seleccionar día"
                disabled={editMode && isModeLocked()}
              />
            </div>
          )}

          {announcementForm.mode === 'monthly' && (
            <div className="mb-3">
              <label className="styleInputsSpan text-light">Día del mes</label>
              <p className="styleInputsParaph text-light">Por ejemplo, si selecciona el 1, todos los 1 de todos los meses, se mostrará este mensaje.</p>
              <Dropdown
                value={announcementForm.day_of_month}
                options={Array.from({ length: 31 }, (_, i) => ({
                  label: `${i + 1}`,
                  value: i + 1
                }))}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    day_of_month: e.value
                  })
                }
                placeholder="Seleccionar día"
                disabled={editMode && isModeLocked()}
              />
            </div>
          )}
          <div className="row justify-content-center">
            <div className="col-6">
              <label className="styleInputsSpan text-light">Categorías</label>
              <MultiSelect value={announcementForm.target_categories} options={CATEGORIES} onChange={(e) => setAnnouncementForm({ ...announcementForm, target_categories: e.value })} placeholder="Seleccionar categorías" />
            </div>

            <div className="col-6">
              <label className="styleInputsParaph text-light">Usuarios específicos</label>
              <MultiSelect value={announcementForm.target_users} options={usersList} onChange={(e) => setAnnouncementForm({ ...announcementForm, target_users: e.value })} placeholder="Seleccionar usuarios" filter />
            </div>

          </div>

          <div className="mt-4 text-end text-light">
            <Button label={editMode ? "Actualizar" : "Crear"} icon="pi pi-check" onClick={handleSubmit} autoFocus />
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Alumnos que vieron:`}
        visible={showViewsDialog}
        onHide={() => setShowViewsDialog(false)}
        className="col-10 col-sm-9 col-lg-6 col-xl-5"
      >
        {Array.isArray(viewsDialogData) && viewsDialogData.length === 0 ? (
          <p>Aún nadie ha visto este anuncio.</p>
        ) : (
          <ul className="list-group">
            {Array.isArray(viewsDialogData) &&
              viewsDialogData.map((user) => (
                <li key={user._id} className="list-group-item py-1 px-2">
                  <strong>{user.name}</strong> — <span className="text-muted small">{user.email}</span>
                </li>
              ))}
          </ul>
        )}
      </Dialog>

      <ConfirmDialog
        visible={!!announcementToDelete}
        onHide={() => setAnnouncementToDelete(null)}
        message="¿Estás seguro que deseas eliminar este anuncio?"
        header="Confirmar eliminación"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Sí, eliminar"
        rejectLabel="Cancelar"
        accept={handleConfirmDelete}
        reject={() => setAnnouncementToDelete(null)}
    />

    </>
    );
}

export default UsersListPage;
