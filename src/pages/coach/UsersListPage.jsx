import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

//.............................. SERVICES ..............................//
import * as UsersService from "../../services/users.services.js";

//.............................. HELPERS ..............................//
import * as Notify from "../../helpers/notify.js";

//.............................. BIBLIOTECAS EXTERNAS ..............................//
import { Tour } from "antd";
import { ProgressBar } from "primereact/progressbar";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";

//.............................. COMPONENTES ..............................//
import LogoChico from "../../components/LogoChico.jsx";
import PrimeReactTable from "../../components/PrimeReactTable.jsx";
import SportsCalendarManager from "../../components/SportsCalendarManager.jsx";
import GeneralSettingsDialog from "../../components/Settings/GeneralSettingsDialog.jsx";

//.............................. ICONOS MUI ..............................//
import Logo from "../../components/Logo.jsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

//.............................. LUCIDE ..............................//
import { Megaphone, Plus, Pencil, Trash2, HelpCircle, Calendar1, Eye, Settings } from "lucide-react";
import { MessageSquare, Link as LinkIcon, Circle, CircleDot } from "lucide-react";

function UsersListPage({ editorTheme = "light" }) {
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
  const [firstWidth, setFirstWidth] = useState(() => window.innerWidth);

  // ---------- Anuncios
  const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);
  const [showSportsCalendarDialog, setShowSportsCalendarDialog] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
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
    { label: "Anuncio unico", value: "once" },
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
      setAnnouncements(sorted);
    } catch (err) {
      Notify.instantToast("Error al obtener anuncios");
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  /* El selector de destinatarios se arma con los alumnos que la pantalla ya
     tiene cargados. Antes abrir el dialogo volvia a traer la lista entera
     -17kb- para quedarse solo con el nombre y el id de cada uno. */
  useEffect(() => {
    setUsersList(users.map((u) => ({ label: u.name, value: u._id })));
  }, [users]);

  useEffect(() => {
    if (showAnnouncementsDialog) {
      fetchAnnouncements();
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
        nextButtonProps: { children: "!Finalizar! " },
      },
    ]);
  }, []);

useEffect(() => {
  setFirstWidth(window.innerWidth);

  Notify.notifyA("Cargando usuarios...");
  UsersService.findWithLastWeek(id).then((data) => {
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

  const isMobileLayout = firstWidth < 982;

  return (
    <>
      {/* ----- Sidebar existente (sin cambios funcionales) ----- */}
      <div className="sidebarPro colorMainAll usersListSidebarModern">
        <div
          className="d-flex flex-column colorMainAll shadow-sm usersListSidebarModernInner"
          style={{ width: collapsed ? "85px" : "220px", height: "100vh" }}
        >
          <div className="usersListSidebarModernTop">

            {/* NOMBRE */}
            <div id={"username"} className="usersListSidebarIdentity">
              <span className="usersListSidebarAvatar">
                {(localStorage.getItem("name") || "U").trim().charAt(0).toUpperCase()}
              </span>
              {!collapsed && (
                <div className="usersListSidebarIdentityText">
                  <strong>{localStorage.getItem("name")}</strong>
                  <span>Plan {plan}</span>
                </div>
              )}
            </div>

            {/* PROGRESO */}
            <div id={"alumnos"} className="usersListSidebarCapacity">
              <div>
                <span>Alumnos</span>
                <strong>{totalUsers}/{planLimit}</strong>
              </div>
              <ProgressBar value={progress} showValue={false} />
            </div>

            {/* ANUNCIOS */}
            <div id={"anuncios"} className="usersListSidebarPrimaryAction">
              <button type="button" onClick={() => setShowAnnouncementsDialog(true)}>
                <Megaphone size={13} />
                Administrar anuncios
              </button>
            </div>
            <div className="usersListSidebarSecondaryAction">
              <button
                type="button"
                onClick={() => setShowSportsCalendarDialog(true)}
              >
                <Calendar1 size={13} />
                Calendario deportivo
              </button>
            </div>
          </div>

          <div className="usersListSidebarModernLogo">
            <LogoChico />
          </div>

          {/* AYUDA */}
          <div className="usersListSidebarModernHelp">
            <button type="button" onClick={() => setShowGeneralSettings(true)}>
              <Settings size={15} /> {!collapsed && "Configuración"}
            </button>
            <button type="button" onClick={() => setTourVisible(true)}>
              <HelpCircle size={15} /> {!collapsed && "Ayuda"}
            </button>
          </div>
        </div>
      </div>

      {/* ====== CONTENIDO ====== */}
      <section className={`container-fluid totalHeight usersListPageModern usersListTheme-${editorTheme}`}>
        <article
          id={"tabla"}
          className={`row justify-content-center usersListPageContent ${isMobileLayout ? "usersListPageContentMobile" : (collapsed ? "marginSidebarClosed" : " marginSidebarOpen")}`}
        >
          <div className="col-12 col-sm-11 usersListPageHeading">
            <h1>Lista de alumnos</h1>
            <p>Gestiona y seguí el progreso de tus alumnos</p>
          </div>

          {/* CARD + TABLA */}
          <div className="col-12 col-sm-11 usersListModernColumn">
            <div className="bg-white border rounded-4 overflow-hidden usersListModernCard">
              <PrimeReactTable id={id} users={users} refresh={refresh} collapsed={collapsed} editorTheme={editorTheme} />
            </div>
          </div>
        </article>

        {isMobileLayout && (
          <nav className={`usersListMobileBottomNav usersListTheme-${editorTheme}`} aria-label="Acciones de lista de alumnos">
            <button type="button" onClick={() => setShowAnnouncementsDialog(true)}>
              <Megaphone size={18} />
              <span>Anuncios</span>
            </button>
            <button type="button" onClick={() => setShowSportsCalendarDialog(true)}>
              <Calendar1 size={18} />
              <span>Calendario</span>
            </button>
          </nav>
        )}

        <ConfirmDialog className={`usersListConfirmDialog usersListTheme-${editorTheme}`} />

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
      <div className="usersListDialogHeader">
        <span className="usersListDialogHeaderIcon"><Megaphone size={18} /></span>
        <div>
          <strong>Administrar anuncios</strong>
          <span>{(announcements?.length ?? 0)} anuncios totales</span>
        </div>
      </div>

      <button
        className="usersListDialogButton usersListDialogButtonPrimary d-inline-flex align-items-center"
        onClick={openNewForm}
      >
        <Plus size={16} className="me-2" />
        Nuevo anuncio
      </button>
    </div>
  }
  visible={showAnnouncementsDialog}
  onHide={() => setShowAnnouncementsDialog(false)}
  className={`col-10 col-sm-9 col-lg-8 col-xl-6 usersListDialog usersListAnnouncementsDialog usersListTheme-${editorTheme}`}
>
  {loadingAnnouncements ? (
    <p className="ms-1 my-3 text-muted">Cargando...</p>
  ) : announcements.length === 0 ? (
    <p className="ms-1 my-3 text-muted">No hay anuncios creados aun.</p>
  ) : (
    <div className="usersListAnnouncementList">
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
          <div key={a._id} className="usersListAnnouncementCard">
            <div className="usersListAnnouncementCardHead">
              <div>
                <strong>{a.title}</strong>
                <p>{a.message}</p>
              </div>

              <div className="usersListAnnouncementCardActions">
                <button
                  aria-label="Editar"
                  onClick={() => openEditForm(a)}
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="is-danger"
                  aria-label="Eliminar"
                  onClick={() => confirmDeleteAnnouncement(a._id)}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="usersListAnnouncementCardFoot">
              <div className="usersListAnnouncementCardMeta">
                <span>
                  <Eye size={14} />
                  Visto por {vc} {vc === 1 ? "usuario" : "usuarios"}
                </span>

                {fecha && (
                  <span>
                    <Calendar1 size={14} />
                    {fecha}
                  </span>
                )}
              </div>

              <button
                className="usersListAnnouncementCardViews"
                onClick={() => fetchViewsForAnnouncement(a._id)}
              >
                Ver quien lo vio
              </button>
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
  className={`col-10 col-sm-9 col-lg-8 col-xl-6 usersListDialog usersListAnnouncementFormDialog usersListTheme-${editorTheme}`}
  header={
    <div className="usersListDialogHeader">
      <span className="usersListDialogHeaderIcon"><MessageSquare size={18} /></span>
      <div>
        <strong>{editMode ? "Editar anuncio" : "Nuevo anuncio"}</strong>
        <span>Modifique los detalles del anuncio</span>
      </div>
    </div>
  }
  footer={
    <div className="usersListDialogActions">
      <div className="form-check form-switch me-auto">
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
          Este anuncio sera programado
        </label>
      </div>

      <button
        type="button"
        className="usersListDialogButton usersListDialogButtonSecondary"
        onClick={() => setFormVisible(false)}
      >
        Cancelar
      </button>
      <button
        type="button"
        className="usersListDialogButton usersListDialogButtonPrimary"
        onClick={handleSubmit}
      >
        {editMode ? "Actualizar anuncio" : "Crear anuncio"}
      </button>
    </div>
  }
>
  {/* -------- Formulario -------- */}
  <div className="p-fluid">
    <div className="usersListFieldGroup">
      <label>Título del anuncio *</label>
      <InputText
        placeholder="Ingrese el título del anuncio"
        value={announcementForm.title}
        onChange={(e) =>
          setAnnouncementForm({ ...announcementForm, title: e.target.value })
        }
      />
    </div>

    <div className="usersListFieldGroup">
      <label>Descripción *</label>
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
    <div className="usersListFieldGroup">
      <label>Links</label>
      <div>
        <button
          type="button"
          onClick={() =>
            setAnnouncementForm({
              ...announcementForm,
              link_urls: [...(announcementForm.link_urls || []), ""],
            })
          }
          className="usersListDialogButton usersListDialogButtonSecondary d-inline-flex align-items-center"
        >
          <LinkIcon size={16} className="me-2" />
          Agregar link
        </button>
      </div>

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
                placeholder="https://..."
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
    <div className="usersListFieldGroup">
      <label>Tipo de anuncio</label>

      {(() => {
        const isLocked = editMode && isModeLocked();
        const sel = announcementForm.mode;
        const Card = ({ value, title, subtitle }) => (
          <div
            role="button"
            tabIndex={0}
            className={
              "usersListAnnouncementTypeCard" +
              (sel === value ? " is-selected" : "") +
              (isLocked ? " is-locked" : "")
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
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>
            <div className="usersListAnnouncementTypeRadio">
              {sel === value ? <CircleDot size={18} /> : <Circle size={18} />}
            </div>
          </div>
        );

        return (
          <>
            <Card
              value="once"
              title="Anuncio unico"
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
      <div className="usersListFieldGroup">
        <label>Fecha de envio</label>
        <p className="text-muted small mb-0">
          Por ejemplo, si selecciona el 17/05, solo ese dia se mostrara el
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
      <div className="usersListFieldGroup">
        <label>Día de la semana</label>
        <p className="text-muted small mb-0">
          Por ejemplo, si selecciona el viernes, todos los viernes se mostrara
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
      <div className="usersListFieldGroup">
        <label>Día del mes</label>
        <p className="text-muted small mb-0">
          Por ejemplo, si selecciona el 1, todos los meses en el dia 1 se
          mostrara este anuncio.
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

    {/* Categoria / Destinatarios */}
    <div className="usersListFieldGroup">
      <label>Categoría</label>
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

    <div className="usersListFieldGroup">
      <label>Destinatarios</label>
      <MultiSelect
        value={announcementForm.target_users}
        options={usersList}
        optionLabel="label"
        optionValue="value"
        onChange={(e) =>
          setAnnouncementForm({ ...announcementForm, target_users: e.value })
        }
        placeholder="Seleccionar destinatarios"
        filter
        className="w-100"
      />
    </div>
  </div>
</Dialog>

{/* ---- Dialogo de vistas ---- */}
<Dialog
  header={
    <div className="usersListDialogHeader">
      <span className="usersListDialogHeaderIcon"><Eye size={18} /></span>
      <div>
        <strong>Alumnos que vieron</strong>
        <span>{Array.isArray(viewsDialogData) ? viewsDialogData.length : 0} alumno(s)</span>
      </div>
    </div>
  }
  visible={showViewsDialog}
  onHide={() => setShowViewsDialog(false)}
  className={`col-10 col-sm-9 col-lg-6 col-xl-5 usersListDialog usersListViewsDialog usersListTheme-${editorTheme}`}
>
  {Array.isArray(viewsDialogData) && viewsDialogData.length === 0 ? (
    <p className="text-muted mb-0">Aun nadie ha visto este anuncio.</p>
  ) : (
    <div className="usersListViewsList">
      {Array.isArray(viewsDialogData) &&
        viewsDialogData.map((user) => (
          <div key={user._id} className="usersListViewsItem">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        ))}
    </div>
  )}
</Dialog>

      <ConfirmDialog
        visible={!!announcementToDelete}
        onHide={() => setAnnouncementToDelete(null)}
        className={`usersListConfirmDialog usersListTheme-${editorTheme}`}
        message="?Estás seguro que deseas eliminar este anuncio?"
        header="Confirmar eliminación"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Si, eliminar"
        rejectLabel="Cancelar"
        accept={handleConfirmDelete}
        reject={() => setAnnouncementToDelete(null)}
      />

      <SportsCalendarManager
        visible={showSportsCalendarDialog}
        onHide={() => setShowSportsCalendarDialog(false)}
        coachId={id}
        users={users}
        editorTheme={editorTheme}
      />
      <GeneralSettingsDialog
        visible={showGeneralSettings}
        onHide={() => setShowGeneralSettings(false)}
        trainerId={id}
        editorTheme={editorTheme}
      />
    </>
  );
}

export default UsersListPage;
