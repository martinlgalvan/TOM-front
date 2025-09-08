import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

//.............................. SERVICES ..............................//
import * as UsersService from "../../services/users.services.js";

//.............................. HELPERS ..............................//
import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";

//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { Tour } from "antd";
import { ProgressBar } from "primereact/progressbar";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";

//.............................. COMPONENTES ..............................//
import LogoChico from "../../components/LogoChico.jsx";
import DeleteUserDialog from "../../components/DeleteActions/DeleteUserDialog.jsx";
import PrimeReactTable from "../../components/PrimeReactTable.jsx";

//.............................. ICONOS MUI ..............................//
import PersonIcon from "@mui/icons-material/Person";
import Logo from "../../components/Logo.jsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

//.............................. LUCIDE ..............................//
import { Megaphone, Plus, Pencil, Trash2,HelpCircle ,Calendar1, Eye } from "lucide-react";
import { MessageSquare, Link as LinkIcon, Circle, CircleDot } from "lucide-react";

function UsersListPage() {
  const { id } = useParams();

  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(0);
  const [isPlanPaid, setIsPlanPaid] = useState(true);
  const [plan, setPlan] = useState("");
  const [planLimit, setPlanLimit] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [progress, setProgress] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [tourVisible, setTourVisible] = useState(false);
  const [showDialog, setShowDialog] = useState();
  const [firstWidth, setFirstWidth] = useState();

  // ---------- Anuncios
  const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [usersList, setUsersList] = useState([]);

  const [formVisible, setFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    _id: null,
    title: "",
    message: "",
    link_urls: [],
    mode: "once",
    show_at_date: null,
    repeat_day: null,
    day_of_month: null,
    target_categories: [],
    target_users: [],
  });
  const [viewCounts, setViewCounts] = useState({});
  const [viewsMap, setViewsMap] = useState({});
  const [expandedViewId, setExpandedViewId] = useState(null);
  const [showViewsDialog, setShowViewsDialog] = useState(false);
  const [viewsDialogData, setViewsDialogData] = useState();

  const DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  const CATEGORIES = ["Alumno casual", "Alumno dedicado", "Atleta iniciante", "Atleta avanzado"];
  const MODE_OPTIONS = [
    { label: "Anuncio único", value: "once" },
    { label: "Programar días", value: "repeat" },
    { label: "Cada X del mes", value: "monthly" },
  ];

  const PLAN_LIMITS = {
    Gratuito: 5,
    Basico: 20,
    Profesional: 55,
    Elite: 95,
    Empresarial: 140,
    Personalizado: 500,
  };

  // ---------- Anuncios (fetchers)
  const fetchViewCounts = async () => {
    try {
      const counts = await UsersService.getAnnouncementViewCounts(id);
      setViewCounts(counts);
    } catch (err) {
      Notify.instantToast("Error al obtener conteo de vistas");
    }
  };

  const fetchViewsForAnnouncement = async (announcementId) => {
    try {
      const views = await UsersService.getAnnouncementViewsWithNames(announcementId);
      setViewsDialogData(views.viewers);
      setShowViewsDialog(true);
    } catch (err) {
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
          console.log(sorted)
      setAnnouncements(sorted);
    } catch (err) {
      Notify.instantToast("Error al obtener anuncios");
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await UsersService.find(id);
      setUsersList(users.map((u) => ({ label: u.name, value: u._id })));

    } catch (err) {
      Notify.instantToast("Error al obtener usuarios");
    }
  };

  useEffect(() => {
    if (showAnnouncementsDialog) {
      fetchAnnouncements();
      fetchUsers();
      fetchViewCounts();
    }
  }, [showAnnouncementsDialog]);

  // ---------- Tour + cuenta/plan
  useEffect(() => {
    setTourSteps([
      {
        title: `Hola ${localStorage.getItem("name")}!`,
        description: "Actualmente te encontras en esta cuenta.",
        target: () => document.getElementById("username"),
        placement: "right",
        nextButtonProps: { children: "Siguiente »" },
      },
      {
        title: "Nombre del plan",
        description: "Este es el plan que te corresponde debido a tu cantidad de alumnos.",
        target: () => document.getElementById("plan"),
        placement: "right",
        prevButtonProps: { children: "« Anterior" },
        nextButtonProps: { children: "Siguiente »" },
      },
      {
        title: "Cantidad de alumnos.",
        description: "Número de alumnos que tenés actualmente.",
        target: () => document.getElementById("alumnos"),
        placement: "right",
        prevButtonProps: { children: "« Anterior" },
        nextButtonProps: { children: "Siguiente »" },
      },
      {
        title: "Administración de anuncios",
        description: "Botón para administrar anuncios. Estos son mensajes generales para tus alumnos.",
        target: () => document.getElementById("anuncios"),
        placement: "right",
        prevButtonProps: { children: "« Anterior" },
        nextButtonProps: { children: "Siguiente »" },
      },
      {
        title: "Creación de alumnos",
        description: "Este botón te permitira crear el usuario para tu alumno.",
        target: () => document.getElementById("crearAlumno"),
        placement: "right",
        prevButtonProps: { children: "« Anterior" },
        nextButtonProps: { children: "¡Finalizar! " },
      },
    ]);
  }, []);

useEffect(() => {
  setFirstWidth(window.innerWidth);

  Notify.notifyA("Cargando usuarios...");
  UsersService.findWithLastWeek(id).then((data) => {
    console.log(data)
    setUsers(data); // cada user ahora puede traer last_week_created_at / last_week_updated_at
    setTotalUsers(data.length);
    sessionStorage.setItem("U4S3R", JSON.stringify(data));
    Notify.updateToast();
  }).catch(() => {
    Notify.instantToast("Error al obtener usuarios");
  });
}, [status, id]);


  useEffect(() => {
    UsersService.findUserById(id).then((data) => {
      setIsPlanPaid(data.isPlanPaid);
      const limit = PLAN_LIMITS[data.plan] || PLAN_LIMITS.Gratuito;
      setPlanLimit(limit);
      setPlan(data.plan);
    });
  }, [status]);

  useEffect(() => {
    if (planLimit > 0) {
      setProgress((totalUsers / planLimit) * 100);
    }
  }, [totalUsers, planLimit]);

  const refresh = () => setStatus((prev) => prev + 1);
  const hideDialog = (load) => {
    if (load != null) setStatus(RefreshFunction.generateUUID());
    setShowDialog(false);
  };

  if (isPlanPaid === false) {
    return (
      <div className="container-fluid p-0 mb-5">
        <Logo />
        <div className="row justify-content-center text-center mt-5">
          <div className="col-9">
            <h2>Hola {localStorage.getItem("name")}!</h2>
            <p>
              Tu plan no esta pago. Por favor, comunicate con el administrador para abonar y recuperar el acceso a tus
              alumnos.
            </p>
            <a href="https://wa.me/message/6PSH46QCW4OTP1" target="_blank" rel="noreferrer" className="whatsapp-btn">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isModeLocked = () => !!(announcementForm.show_at_date || announcementForm.repeat_day || announcementForm.day_of_month);

  const openEditForm = async (ann) => {
    setAnnouncementForm({ ...ann, link_urls: ann.link_urls || [] });
    setEditMode(true);
    setFormVisible(true);
  };

  const openNewForm = () => {
    setAnnouncementForm({
      _id: null,
      title: "",
      message: "",
      link_url: "",
      mode: "once",
      show_at_date: null,
      repeat_day: null,
      day_of_month: null,
      target_categories: [],
      target_users: [],
    });
    setEditMode(false);
    setFormVisible(true);
  };

  const handleSubmit = async () => {
    const payload = { ...announcementForm, creator_id: id };

    if (!editMode && payload.mode === "once" && payload.show_at_date) {
      const showDate = new Date(payload.show_at_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (showDate < today) {
        Notify.instantToast("La fecha seleccionada no puede ser anterior a hoy.");
        return;
      }
    }

    try {
      if (editMode) {
        const { _id, created_at, read_by, link_url, ...cleanedPayload } = payload;
        await UsersService.editAnnouncement(_id, cleanedPayload);
        Notify.instantToast("Anuncio actualizado");
      } else {
        await UsersService.createAnnouncement(payload);
        Notify.instantToast("Anuncio creado");
      }
      setFormVisible(false);
      fetchAnnouncements();
    } catch {
      Notify.instantToast("Error al guardar anuncio");
    }
  };

  const confirmDeleteAnnouncement = (announcementId) => setAnnouncementToDelete(announcementId);
  const handleConfirmDelete = async () => {
    try {
      await UsersService.deleteAnnouncement(announcementToDelete);
      Notify.instantToast("Anuncio eliminado");
      setAnnouncementToDelete(null);
      fetchAnnouncements();
    } catch {
      Notify.instantToast("Error al eliminar anuncio");
    }
  };

  return (
    <>
      {/* ----- Sidebar existente (sin cambios funcionales) ----- */}
      <div className="sidebarPro colorMainAll">
        <div
          className="d-flex flex-column justify-content-between colorMainAll shadow-sm"
          style={{ width: collapsed ? "85px" : "220px", height: "100vh" }}
        >
          <div className="p-3">
            <h5 className="fw-bold text-center mb-4">TOM</h5>

            {/* NOMBRE */}
            <div id={"username"} className="bgItemsDropdown rounded mx-2 row justify-content-center mb-3">
              <div className="col-1">
                <PersonIcon />
              </div>
              {!collapsed && (
                <div className="text-center text-light col-10">
                  <strong>{localStorage.getItem("name")}</strong>
                </div>
              )}
            </div>

            {/* PLAN */}
            <div id={"plan"} className="text-light small bgItemsDropdown rounded mx-2 mb-3 p-2 text-center">
              <span className="d-block">Plan</span>
              <strong>{plan}</strong>
            </div>

            {/* PROGRESO */}
            <div id={"alumnos"} className="bgItemsDropdown text-light rounded mx-2 mb-4 p-2 text-center small">
              <span>
                ({totalUsers}/{planLimit} alumnos)
              </span>
              <ProgressBar value={progress} showValue={false} className="mx-2 mt-1" style={{ height: "20px", borderRadius: "10px" }} />
            </div>

            {/* ANUNCIOS */}
            <div id={"anuncios"} className=" text-light rounded text-center small">
              <button className="btn btn-warning my-1 text-center" onClick={() => setShowAnnouncementsDialog(true)}>
                Administrar anuncios
              </button>
            </div>
          </div>

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

      {/* ====== CONTENIDO ====== */}
      <section className="container-fluid totalHeight">
        <article id={"tabla"} className={`row justify-content-center ${collapsed ? "marginSidebarClosed" : " marginSidebarOpen"}`}>
          {/* Top actions en mobile */}
          {firstWidth < 982 && (
            <div className="text-center mb-3">
              <button className="btn btn-warning my-1 text-center" onClick={() => setShowAnnouncementsDialog(true)}>
                Administrar anuncios{" "}
              </button>
            </div>
          )}

          {/* CARD + TABLA */}
          <div className="col-12 col-sm-11">
            <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
              <PrimeReactTable id={id} users={users} refresh={refresh} collapsed={collapsed} />
            </div>
          </div>
        </article>

        <ConfirmDialog />

        <DeleteUserDialog showDialog={showDialog} hideDialog={hideDialog} load={id} />

        {/* TOUR */}
        {tourVisible && (
          <Tour
            open={tourVisible}
            steps={tourSteps}
            onClose={() => setTourVisible(false)}
            onFinish={() => setTourVisible(false)}
            scrollIntoViewOptions={true}
          />
        )}
      </section>

     <Dialog
  header={
    <div className="d-flex justify-content-between align-items-center w-100">
      <div className="d-flex align-items-center">
        <span
          className="bg-light rounded-2 d-inline-flex align-items-center justify-content-center me-3"
          style={{ width: 32, height: 32 }}
        >
          <Megaphone size={18} />
        </span>
        <div>
          <div className="fw-semibold">Administrar anuncios</div>
          <small className="text-muted">
            {(announcements?.length ?? 0)} anuncios totales
          </small>
        </div>
      </div>

      <button className="btn btn-primary btn-sm d-inline-flex align-items-center me-3"
        onClick={openNewForm}
      >
        <Plus size={16} className="me-2" />
        Nuevo anuncio
      </button>
    </div>
  }
  visible={showAnnouncementsDialog}
  onHide={() => setShowAnnouncementsDialog(false)}
  className="col-10 col-sm-9 col-lg-8 col-xl-6"
>
  {loadingAnnouncements ? (
    <p className="ms-1 my-3 text-muted">Cargando...</p>
  ) : announcements.length === 0 ? (
    <p className="ms-1 my-3 text-muted">No hay anuncios creados aún.</p>
  ) : (
    <div>
      {announcements.map((a) => {
        const vc = viewCounts[a._id] ?? 0;
        const dateIso = a.created_at || a.createdAt; // fallback por si viene en camelCase
        const fecha =
          dateIso
            ? new Date(dateIso)
                .toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(/\./g, "") // algunos locales agregan punto al mes abreviado
            : "";

        return (
          <div
            key={a._id}
            className="bg-light rounded-3 p-3 mb-3 border"
            style={{ borderColor: "#e9ecef" }}
          >
            {/* Fila superior: título + acciones */}
            <div className="d-flex justify-content-between align-items-start">
              <div className="pe-3">
                <div className="fw-semibold">{a.title}</div>
                <div className="text-muted mb-0">{a.message}</div>
              </div>

              <div className="d-flex align-items-center">
                <button
                  className="btn btn-link p-1 text-secondary me-2"
                  aria-label="Editar"
                  onClick={() => openEditForm(a)}
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  className="btn btn-link p-1 text-secondary"
                  aria-label="Eliminar"
                  onClick={() => confirmDeleteAnnouncement(a._id)}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Fila inferior: métricas + link */}
            <div className="mt-2 border-top pt-2 d-flex justify-content-between align-items-center small">
              <div className="text-muted d-flex align-items-center">
                <span className="me-3 d-inline-flex align-items-center">
                  <Eye size={14} className="me-1" />
                  Visto por {vc} {vc === 1 ? "usuario" : "usuarios"}
                </span>

                {fecha && (
                  <span className="d-inline-flex align-items-center">
                    <Calendar1 size={14} className="me-1" />
                    {fecha}
                  </span>
                )}
              </div>
              <div>
                <button
                  className="btn btn-primary py-1 px-2 small"
                  onClick={() => fetchViewsForAnnouncement(a._id)}
                >
                  
                  Ver quién lo vio
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  )}
</Dialog>


<Dialog
  visible={formVisible}
  onHide={() => setFormVisible(false)}
  className="col-10 col-sm-9 col-lg-8 col-xl-6"
  header={
    <div className="d-flex align-items-start justify-content-between w-100">
      <div className="d-flex align-items-start">
        <span
          className="bg-light rounded-2 d-inline-flex align-items-center justify-content-center me-3"
          style={{ width: 32, height: 32 }}
        >
          <MessageSquare size={18} />
        </span>
        <div>
          <div className="fw-semibold">{editMode ? "Editar anuncio" : "Nuevo anuncio"}</div>
          <small className="text-muted">Modifique los detalles del anuncio</small>
        </div>
      </div>
    </div>
  }
>
  {/* -------- Formulario -------- */}
  <div className="p-fluid text-dark">
    {/* Título */}
    <div className="mb-3">
      <label className="form-label fw-semibold">Título del anuncio *</label>
      <InputText
        placeholder="Ingrese el título del anuncio"
        value={announcementForm.title}
        onChange={(e) =>
          setAnnouncementForm({ ...announcementForm, title: e.target.value })
        }
      />
    </div>

    {/* Descripción */}
    <div className="mb-3">
      <label className="form-label fw-semibold">Descripción *</label>
      <InputTextarea
        rows={3}
        placeholder="Escriba el contenido del anuncio..."
        value={announcementForm.message}
        onChange={(e) =>
          setAnnouncementForm({ ...announcementForm, message: e.target.value })
        }
      />
    </div>

    {/* Links */}
    <div className="mb-4">
      <button
        type="button"
        onClick={() =>
          setAnnouncementForm({
            ...announcementForm,
            link_urls: [...(announcementForm.link_urls || []), ""],
          })
        }
        className="btn btn-primary btn-sm d-inline-flex align-items-center"
      >
        <LinkIcon size={16} className="me-2" />
        Agregar link
      </button>

      {announcementForm.link_urls?.length > 0 && (
        <ul className="list-group mt-2">
          {announcementForm.link_urls.map((link, index) => (
            <li
              key={index}
              className="list-group-item d-flex align-items-center"
            >
              <InputText
                className="flex-grow-1 me-2"
                value={link}
                placeholder="https://…"
                onChange={(e) => {
                  const updated = [...announcementForm.link_urls];
                  updated[index] = e.target.value;
                  setAnnouncementForm({
                    ...announcementForm,
                    link_urls: updated,
                  });
                }}
              />
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  const updated = [...announcementForm.link_urls];
                  updated.splice(index, 1);
                  setAnnouncementForm({ ...announcementForm, link_urls: updated });
                }}
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Tipo de anuncio (tarjetas radiales) */}
    <div className="mb-3">
      <label className="form-label fw-semibold mb-2">Tipo de anuncio</label>

      {(() => {
        const isLocked = editMode && isModeLocked();
        const sel = announcementForm.mode;
        const Card = ({ value, title, subtitle }) => (
          <div
            role="button"
            tabIndex={0}
            className={
              "d-flex justify-content-between align-items-center rounded-3 p-3 mb-2 " +
              (sel === value ? "border border-primary shadow-sm" : "border") +
              (isLocked ? " opacity-75" : "")
            }
            onClick={() =>
              !isLocked &&
              setAnnouncementForm({
                ...announcementForm,
                mode: value,
                show_at_date: null,
                repeat_day: null,
                day_of_month: null,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                !isLocked &&
                  setAnnouncementForm({
                    ...announcementForm,
                    mode: value,
                    show_at_date: null,
                    repeat_day: null,
                    day_of_month: null,
                  });
              }
            }}
          >
            <div>
              <div className="fw-semibold">{title}</div>
              <small className="text-muted">{subtitle}</small>
            </div>
            <div className="ms-3 text-primary">
              {sel === value ? <CircleDot size={18} /> : <Circle size={18} />}
            </div>
          </div>
        );

        return (
          <>
            <Card
              value="once"
              title="Anuncio único"
              subtitle="Enviar inmediatamente"
            />
            <Card
              value="repeat"
              title="Programar días"
              subtitle="Repetir cada X días"
            />
            <Card
              value="monthly"
              title="Cada X del mes"
              subtitle="Repetir mensualmente"
            />
            {isLocked && (
              <small className="text-danger d-block mt-1">
                No se puede modificar el modo una vez definido.
              </small>
            )}
          </>
        );
      })()}
    </div>

    {/* Campos condicionales por modo */}
    {announcementForm.mode === "once" && (
      <div className="mb-3">
        <label className="form-label fw-semibold">Fecha de envío</label>
        <p className="text-muted small mb-2">
          Por ejemplo, si selecciona el 17/05, solo ese día se mostrará el
          anuncio.
        </p>
        <Calendar
          value={
            announcementForm.show_at_date
              ? new Date(announcementForm.show_at_date)
              : null
          }
          onChange={(e) =>
            setAnnouncementForm({ ...announcementForm, show_at_date: e.value })
          }
          showIcon
          disabled={editMode && isModeLocked()}
          minDate={new Date()}
        />
      </div>
    )}

    {announcementForm.mode === "repeat" && (
      <div className="mb-3">
        <label className="form-label fw-semibold">Día de la semana</label>
        <p className="text-muted small mb-2">
          Por ejemplo, si selecciona el viernes, todos los viernes se mostrará
          este anuncio.
        </p>
        <Dropdown
          value={announcementForm.repeat_day}
          options={DAYS}
          onChange={(e) =>
            setAnnouncementForm({ ...announcementForm, repeat_day: e.value })
          }
          placeholder="Seleccionar día"
          disabled={editMode && isModeLocked()}
          className="w-100"
        />
      </div>
    )}

    {announcementForm.mode === "monthly" && (
      <div className="mb-3">
        <label className="form-label fw-semibold">Día del mes</label>
        <p className="text-muted small mb-2">
          Por ejemplo, si selecciona el 1, todos los meses en el día 1 se
          mostrará este anuncio.
        </p>
        <Dropdown
          value={announcementForm.day_of_month}
          options={Array.from({ length: 31 }, (_, i) => ({
            label: `${i + 1}`,
            value: i + 1,
          }))}
          onChange={(e) =>
            setAnnouncementForm({ ...announcementForm, day_of_month: e.value })
          }
          placeholder="Seleccionar día"
          disabled={editMode && isModeLocked()}
          className="w-100"
        />
      </div>
    )}

    {/* Categoría / Destinatarios */}
    <div className="mb-3">
      <label className="form-label fw-semibold">Categoría </label>
      <MultiSelect
        value={announcementForm.target_categories}
        options={CATEGORIES}
        onChange={(e) =>
            setAnnouncementForm({ ...announcementForm, target_categories: e.value })
        }
        placeholder="Seleccionar categoría"
        className="w-100"
      />
    </div>

    <div className="mb-3">
      <label className="form-label fw-semibold">Destinatarios </label>
      <MultiSelect
        value={announcementForm.target_users}
        options={usersList}
        onChange={(e) =>
          setAnnouncementForm({ ...announcementForm, target_users: e.value })
        }
        placeholder="Seleccionar destinatarios"
        filter
        className="w-100"
      />
    </div>

    {/* Pie: switch informativo + botón acción */}
    <div className="d-flex align-items-center justify-content-between mt-4">
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="scheduledSwitch"
          checked={announcementForm.mode !== "once"}
          readOnly
          disabled
        />
        <label className="form-check-label ms-1" htmlFor="scheduledSwitch">
          Este anuncio será programado
        </label>
      </div>

      <Button
        label={editMode ? "Actualizar anuncio" : "Crear anuncio"}
        onClick={handleSubmit}
        className="p-button-primary"
        autoFocus
      />
    </div>
  </div>
</Dialog>

{/* ---- Diálogo de vistas (sin cambios funcionales, estilos limpios) ---- */}
<Dialog
  header={`Alumnos que vieron:`}
  visible={showViewsDialog}
  onHide={() => setShowViewsDialog(false)}
  className="col-10 col-sm-9 col-lg-6 col-xl-5"
>
  {Array.isArray(viewsDialogData) && viewsDialogData.length === 0 ? (
    <p className="text-muted mb-0">Aún nadie ha visto este anuncio.</p>
  ) : (
    <ul className="list-group">
      {Array.isArray(viewsDialogData) &&
        viewsDialogData.map((user) => (
          <li key={user._id} className="list-group-item py-2 px-3">
            <strong>{user.name}</strong>{" "}
            <span className="text-muted small ms-1">— {user.email}</span>
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
