import React, { useState, useEffect, useMemo } from "react";

import * as UserServices from "./../services/users.services.js";
import * as Notify from "./../helpers/notify.js";
import * as ChangePropertyService from "./../services/changePropertys.services.js";
import * as QRServices from "./../services/loginWithQR.js";
import UserRegister from "../components/Users/UserRegister.jsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { Link } from "react-router-dom";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Tooltip from "@mui/material/Tooltip"; // ✅ MUI Tooltip

import dayjs from "dayjs";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { UserRound, Pencil, Trash2, QrCode, ArrowUpDown, Plus, Search } from "lucide-react";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

export default function PrimeReactTable({ id, users, refresh, collapsed /* , usersLoading = false */ }) {
  const [qrDialogVisible, setQrDialogVisible] = useState(false);
  const [currentQrUser, setCurrentQrUser] = useState(null);
  const [loading, setLoading] = useState(false); // QR loading
  const [error, setError] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nameUser, setNameUser] = useState([]);
  const [id_user, setId_user] = useState([]);
  const [profileData, setProfileData] = useState(undefined);
  const [widthPage, setWidthPage] = useState(window.innerWidth);
  const [inputValue, setInputValue] = useState("");
  const isInputValid = inputValue === "ELIMINAR";
  const [first, setFirst] = useState(parseInt(localStorage.getItem("userCurrentPage") || "0", 10));
  const [dialogg, setDialogg] = useState(false);

  // bandera de carga local cuando hacemos refresh desde la tabla
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Preferencias de orden/búsqueda
  let initSearchText = "";
  let initSortField = null;           // 'name' | 'email' | 'category' | 'lastEdited' | null
  let initSortOrder = "asc";          // 'asc' | 'desc'
  let initCategoryFilterIndex = 0;
  try {
    const st = localStorage.getItem("prTableSearchText");
    const sf = localStorage.getItem("prTableSortField");
    const so = localStorage.getItem("prTableSortOrder");
    const cfi = localStorage.getItem("prTableCategoryFilterIndex");
    if (st) initSearchText = st;
    if (sf) initSortField = sf;
    if (so) initSortOrder = so;
    if (cfi !== null && !isNaN(parseInt(cfi, 10))) initCategoryFilterIndex = parseInt(cfi, 10);
  } catch {}

  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedProfileName, setSelectedProfileName] = useState("");
  const [editedProfile, setEditedProfile] = useState({});

  const isEditableOptions = [
    { label: "Si", value: "true" },
    { label: "No", value: "false" },
  ];
  const nivelOptions = [
    { label: "Alumno casual", value: "Alumno casual" },
    { label: "Alumno dedicado", value: "Alumno dedicado" },
    { label: "Atleta iniciante", value: "Atleta iniciante" },
    { label: "Atleta avanzado", value: "Atleta avanzado" },
  ];

  const [searchText, setSearchText] = useState(initSearchText);
  const [sortField, setSortField] = useState(initSortField);
  const [sortOrder, setSortOrder] = useState(initSortOrder);
  const [categoryFilterIndex, setCategoryFilterIndex] = useState(initCategoryFilterIndex);

  const categoryOrder = useMemo(
    () => ["Alumno casual", "Alumno dedicado", "Atleta iniciante", "Atleta avanzado"],
    []
  );

  const categoryPalette = {
    "Alumno casual": { bar: "#53b900", pillBg: "#ECFDF3", pillText: "#027A48", pillBorder: "#A6F4C5" },
    "Alumno dedicado": { bar: "#006eff", pillBg: "#EFF8FF", pillText: "#175CD3", pillBorder: "#B2DDFF" },
    "Atleta iniciante": { bar: "#ca7900", pillBg: "#FFFAEB", pillText: "#B54708", pillBorder: "#FEDF89" },
    "Atleta avanzado": { bar: "#a30000", pillBg: "#FEE2E2", pillText: "#B42318", pillBorder: "#FECDD3" },
    default: { bar: "#929191", pillBg: "#F2F4F7", pillText: "#475467", pillBorder: "#E4E7EC" },
  };

  // --------- Filtro + Orden local
  useEffect(() => {
    let filtered = (users || []).filter(
      (user) =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    if (sortField === "category" || !sortField) {
      filtered.sort((a, b) => {
        const aPrio = a.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        const bPrio = b.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        if (aPrio !== bPrio) return aPrio - bPrio;
        return a.name.localeCompare(b.name);
      });
    }

    if (sortField === "name" || sortField === "email") {
      filtered.sort((a, b) => {
        const aPrio = a.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        const bPrio = b.category === categoryOrder[categoryFilterIndex] ? 0 : 1;
        if (aPrio !== bPrio) return aPrio - bPrio;

        const aVal = (a[sortField] || "").toLowerCase();
        const bVal = (b[sortField] || "").toLowerCase();
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    if (sortField === "lastEdited") {
      filtered.sort((a, b) => {
        const at = Date.parse(getFreshness(a).iso || 0);
        const bt = Date.parse(getFreshness(b).iso || 0);
        const cmp = sortOrder === "asc" ? at - bt : bt - at;
        return cmp !== 0 ? cmp : a.name.localeCompare(b.name);
      });
    }

    setFilteredUsers(filtered);
  }, [searchText, users, sortField, sortOrder, categoryFilterIndex, categoryOrder]);

  useEffect(() => {
    const handleResize = () => setWidthPage(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (profileData !== undefined) {
      setEditedProfile({
        name: profileData?.name || "",
        email: profileData?.email || "",
        altura: profileData?.altura || "",
        edad: profileData?.edad || "",
        modalidad: profileData?.modalidad || "",
        category: profileData?.category || null,
        isEditable: profileData?.isEditable ? "true" : "false",
        events: profileData?.events || null,
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (isRefreshing && Array.isArray(users)) {
      setIsRefreshing(false);
    }
  }, [users, isRefreshing]);

  const onSearchChange = (event) => {
    setSearchText(event.target.value);
    try {
      localStorage.setItem("prTableSearchText", event.target.value);
    } catch {}
  };

  const showDialogDelete = (_id, name) => {
    setNameUser(name);
    setId_user(_id);
    const modal = document.getElementById("deleteUserModal");
    if (modal) modal.showModal?.();
  };

  const hideDialog = () => {
    const modal = document.getElementById("deleteUserModal");
    if (modal) modal.close?.();
  };

  const openProfileDialog = (user) => {
    UserServices.getProfileById(user._id)
      .then((data) => {
        setProfileData(data || {});
        setSelectedProfileId(user._id);
        setSelectedProfileName(user.name);
        setProfileDialogVisible(true);
        Notify.instantToast("Perfil cargado con éxito!");
      })
      .catch(async () => {
        setProfileData({});
        const data = await UserServices.find(user._id);
        setEditedProfile((prev) => ({ ...prev, category: data.category }));
        setSelectedProfileId(user._id);
        setSelectedProfileName(user.name);
        setProfileDialogVisible(true);
      });
  };

  const handleProfileSave = () => {
    const updatedProfile = { ...editedProfile, isEditable: editedProfile.isEditable === "true" };
    setIsRefreshing(true);
    UserServices.editProfile(selectedProfileId, updatedProfile)
      .then(() => ChangePropertyService.changeProperty(selectedProfileId, updatedProfile.category))
      .then(() => {
        Notify.instantToast("Perfil actualizado con éxito!");
        setProfileDialogVisible(false);
        refresh();
      })
      .catch(() => {
        setIsRefreshing(false);
        Notify.instantToast("Error al actualizar el perfil.");
      });
  };

  const nameWithBar = (user) => {
    const pal = categoryPalette[user.category] || categoryPalette.default;
    return (
      <div className="d-flex align-items-center">
        <span
          className="my-1 text-strong"
          style={{
            width: 4,
            height: 33,
            borderRadius: 2,
            background: pal.bar,
            display: "inline-block",
            marginRight: 12,
          }}
        />
        <Link
          to={`/user/routine/${user._id}/${user.name}`}
          onClick={() => {
            localStorage.setItem("actualUsername", user.name);
          }}
          className="stylesNameUserList"
        >
          {user.name}
        </Link>
      </div>
    );
  };

  const categoryPill = (user) => {
    const pal = categoryPalette[user.category] || categoryPalette.default;
    const label = user.category || "Sin categoría";
    return (
      <div
        onClick={() => openProfileDialog(user)}
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 999,
          fontSize: "0.85rem",
          lineHeight: 1,
          background: pal.pillBg,
          color: pal.pillText,
          border: `1px solid ${pal.pillBorder}`,
          minWidth: 120,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        {label}
      </div>
    );
  };

  const actionsTemplate = (user) => (
    <div className="d-flex justify-content-center align-items-center" style={{ gap: 10 }}>
      <button className="btn p-1" title="Perfil" onClick={() => openProfileDialog(user)}>
        <UserRound size={18} className="text-secondary" strokeWidth={1.75} />
      </button>

      <Link className="LinkDays" to={`/user/routine/${user._id}/${user.name}`} onClick={() => localStorage.setItem("actualUsername", user.name)}>
        <button className="btn p-1" title="Editar rutina">
          <Pencil size={18} className="text-secondary" strokeWidth={1.75} />
        </button>
      </Link>

      <button className="btn p-1" title="Eliminar" onClick={() => showDialogDelete(user._id, user.name)}>
        <Trash2 size={18} className="text-danger" strokeWidth={1.75} />
      </button>

      <button className="btn p-1" title="QR de acceso" onClick={() => showQrDialog(user)}>
        <QrCode size={18} className="text-secondary" strokeWidth={1.75} />
      </button>
    </div>
  );

  const handleAccept = () => {
    if (isInputValid) {
      Notify.notifyA("Eliminando usuario...");
      setIsRefreshing(true);
      UserServices.deleteUser(id_user)
        .then(() => {
          refresh();
          hideDialog();
        })
        .catch(() => {
          setIsRefreshing(false);
          Notify.instantToast("Ocurrió un error al eliminar el usuario.");
        });
    }
  };

  const handleCancel = () => {
    setInputValue("");
    hideDialog();
  };

  // ---------- Semáforo de frescura ----------
  const freshnessPalette = {
    good: { // 0–5 días
      cellBg: "#ECFDF3", cellBorder: "#A6F4C5", text: "#027A48",
      badgeBg: "#D1FADF", badgeText: "#026C3E", badgeBorder: "#ABEFC6",
      icon: "#12B76A"
    },
    warn: { // 6 días
      cellBg: "#FFFAEB", cellBorder: "#FEDF89", text: "#B54708",
      badgeBg: "#FEEFC6", badgeText: "#B54708", badgeBorder: "#FCD34D",
      icon: "#F59E0B"
    },
    bad: { // ≥7 días
      cellBg: "#FEE2E2", cellBorder: "#FECDD3", text: "#B42318",
      badgeBg: "#FECACA", badgeText: "#991B1B", badgeBorder: "#FCA5A5",
      icon: "#EF4444"
    },
    none: { // sin datos
      cellBg: "#F2F4F7", cellBorder: "#E4E7EC", text: "#475467",
      badgeBg: "#E4E7EC", badgeText: "#475467", badgeBorder: "#D0D5DD",
      icon: "#9CA3AF"
    }
  };

  function daysSince(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startThat  = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.max(0, Math.floor((startToday - startThat) / 86400000));
  }

  function getFreshness(row) {
    const iso = row.last_week_updated_at || row.last_week_created_at;
    const d = daysSince(iso);
    if (d == null) return { level: "none", days: null, iso: null, ui: freshnessPalette.none };

    if (d <= 5) return { level: "good", days: d, iso, ui: freshnessPalette.good };
    if (d === 6) return { level: "warn", days: d, iso, ui: freshnessPalette.warn };
    return { level: "bad", days: d, iso, ui: freshnessPalette.bad };
  }

  const showQrDialog = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const response = await QRServices.generateQR(user._id);
      setQrImage(response.qrImage);
      setCurrentQrUser(user);
      setQrDialogVisible(true);
    } catch {
      setError("Error al generar el QR. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    try {
      localStorage.setItem("userCurrentPage", String(event.first));
    } catch {}
  };

  const sortByName = () => {
    const newOrder = sortField === "name" && sortOrder === "asc" ? "desc" : "asc";
    setSortField("name");
    setSortOrder(newOrder);
    try {
      localStorage.setItem("prTableSortField", "name");
      localStorage.setItem("prTableSortOrder", newOrder);
    } catch {}
  };

  const sortByEmail = () => {
    const newOrder = sortField === "email" && sortOrder === "asc" ? "desc" : "asc";
    setSortField("email");
    setSortOrder(newOrder);
    try {
      localStorage.setItem("prTableSortField", "email");
      localStorage.setItem("prTableSortOrder", newOrder);
    } catch {}
  };

  const sortByCategory = () => {
    const newIndex = (categoryFilterIndex + 1) % categoryOrder.length;
    setCategoryFilterIndex(newIndex);
    setSortField("category");
    setSortOrder("asc");
    try {
      localStorage.setItem("prTableCategoryFilterIndex", String(newIndex));
      localStorage.setItem("prTableSortField", "category");
      localStorage.setItem("prTableSortOrder", "asc");
    } catch {}
  };

  const sortByLastEdited = () => {
    const newOrder = sortField === "lastEdited" && sortOrder === "asc" ? "desc" : "asc";
    setSortField("lastEdited");
    setSortOrder(newOrder);
    try {
      localStorage.setItem("prTableSortField", "lastEdited");
      localStorage.setItem("prTableSortOrder", newOrder);
    } catch {}
  };

  const headerCategory = categoryOrder[categoryFilterIndex];

  const tableHeader = (
    <div className="d-flex  align-items-center p-3">
      <Search size={18} className="me-3" />
      <span className="p-input-icon-left text-start" style={{ maxWidth: 400 }}>
        <InputText value={searchText} onChange={onSearchChange} placeholder="Buscar alumno..." className=" rounded-pill" />
      </span>

      <button id={"crearAlumno"} className="btn btn-dark rounded-3 ms-auto " onClick={() => setDialogg(true)}>
        <Plus size={18} className="me-2" />
        Crear alumno
      </button>
    </div>
  );

  const rows = 10;
  const total = filteredUsers.length;
  const from = total === 0 ? 0 : first + 1;
  const to = Math.min(first + rows, total);
  const report = `Mostrando ${from} a ${to} de ${total} usuarios`;

  const tableLoading = isRefreshing || users == null /* || usersLoading */;

  const emptyContent = tableLoading ? (
    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ height: 670 }}>
      <ProgressSpinner style={{ width: "40px", height: "40px" }} strokeWidth="6" />
      <span className="mt-2">Cargando...</span>
    </div>
  ) : (
    <div style={{ height: 670 }} />
  );

  // ===== Celda "Últ. vez editado" (solo fecha + icono + tooltip MUI con delay) =====
  const lastEditedCell = (row) => {
    const f = getFreshness(row);

    const Icon =
      f.level === "good" ? CheckCircle2 :
      f.level === "warn" ? AlertTriangle :
      f.level === "bad"  ? AlertOctagon :
                           Info;

    const dateStr = f.iso
      ? new Date(f.iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "—";

    const ageStr = f.days == null ? "" : (f.days === 0 ? "hoy" : `hace ${f.days} día${f.days > 1 ? "s" : ""}`);
    const tooltip = f.iso ? `Última edición: ${dateStr} • ${ageStr}` : "Sin planificación registrada";

    return (
      <Tooltip title={tooltip} arrow placement="top" enterDelay={200} enterNextDelay={200}>
        <div
          className="d-flex align-items-center justify-content-between"
          style={{
            width: "100%",
            background: f.ui.cellBg,
            border: `1px solid ${f.ui.cellBorder}`,
            borderRadius: 12,
            padding: "6px 10px",
            minHeight: 36
            // ❌ sin cursor: "help" para evitar el ícono de "?"
          }}
        >
          <Icon size={16} color={f.ui.icon} strokeWidth={2} />
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 999,
              background: f.ui.badgeBg,
              color: f.ui.badgeText,
              border: `1px solid ${f.ui.badgeBorder}`,
              fontSize: "0.75rem",
              lineHeight: 1
            }}
          >
            {dateStr}
          </span>
        </div>
      </Tooltip>
    );
  };

  return (
    <div className="row justify-content-around">
      <div className="col-12 m-0">
        <DataTable
          header={tableHeader}
          value={filteredUsers}
          className="usersListTable2"
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          stripedRows
          showGridlines={false}
          sortMode="single"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          paginatorLeft={<span className="ms-2 ">{report}</span>}
          loading={tableLoading}
          scrollable
          scrollHeight="670px"
          emptyMessage={emptyContent}
        >
          <Column
            field="name"
            body={(row) => nameWithBar(row)}
            header={
              <div className="d-flex align-items-center justify-content-start">
                <span className="fw-semibold">Nombre</span>
                <button className="btn" onClick={sortByName} style={{ background: "none", border: "none" }} title="Ordenar por nombre">
                  <ArrowUpDown size={16} />
                </button>
              </div>
            }
          />

          {widthPage > 600 && (
            <Column
              field="email"
              body={(row) => (
                <Link
                  to={`/user/routine/${row._id}/${row.name}`}
                  onClick={() => localStorage.setItem("actualUsername", row.name)}
                  className="text-decoration-none"
                >
                  {row.email}
                </Link>
              )}
              header={
                <div className="d-flex align-items-center justify-content-start">
                  <span className="fw-semibold">Email</span>
                  <button className="btn" onClick={sortByEmail} style={{ background: "none", border: "none" }} title="Ordenar por email">
                    <ArrowUpDown size={16} />
                  </button>
                </div>
              }
            />
          )}

          {widthPage > 600 && (
            <Column
              field="category"
              body={(row) => categoryPill(row)}
              header={
                <div className="d-flex align-items-center justify-content-start">
                  <span className="fw-semibold me-2">Categoría</span>
                  <button className="btn p-0" onClick={sortByCategory} style={{ background: "none", border: "none" }} title="Cambiar categoría prioritaria">
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "#F2F4F7",
                        color: "#475467",
                        fontSize: "0.8rem",
                      }}
                    >
                      {headerCategory}
                    </span>
                  </button>
                </div>
              }
              style={{ width: "220px" }}
            />
          )}

          {/* NUEVO: columna "Últ. vez editado" (lee del backend) */}
          {widthPage > 600 && (
            <Column
              field="lastEdited"
              header={
                <div className="d-flex align-items-center justify-content-start">
                  <span className="fw-semibold">Últ. vez editado</span>
                  <button className="btn" onClick={sortByLastEdited} style={{ background: "none", border: "none" }} title="Ordenar por última edición">
                    <ArrowUpDown size={16} />
                  </button>
                </div>
              }
              body={lastEditedCell}
              style={{ width: "190px" }}
            />
          )}

          <Column field="actions" header="Acciones" body={actionsTemplate} style={{ width: "160px" }} />
        </DataTable>
      </div>

      {/* ---- Crear alumno ---- */}
      <UserRegister dialogg={dialogg} refresh={refresh} parentId={id} onClose={() => setDialogg(false)} />

      {/* ---- Eliminar usuario (confirmación simple) ---- */}
      <dialog id="deleteUserModal" style={{ padding: 0, border: "none", borderRadius: 12, maxWidth: 520, width: "90%" }}>
        <div className="p-4">
          <h6 className="mb-3">{nameUser}</h6>
          <p className="mb-2">
            Por favor, escriba <b>"ELIMINAR"</b> si desea eliminar permanentemente el usuario <b>{nameUser}</b>
          </p>
          <input
            type="text"
            className="form-control mb-3"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <div className="text-end">
            <button className="btn btn-outline-secondary me-2" onClick={handleCancel}>
              Cancelar
            </button>
            <button className={`btn ${isInputValid ? "btn-danger" : "btn-secondary"}`} disabled={!isInputValid} onClick={handleAccept}>
              Eliminar
            </button>
          </div>
        </div>
      </dialog>

      {/* ---- QR ---- */}
      <Dialog
        header={`Código QR - ${currentQrUser?.name || ""}`}
        visible={qrDialogVisible}
        onHide={() => setQrDialogVisible(false)}
        style={{ width: widthPage > 900 ? "30%" : "90%" }}
      >
        <div className="text-center">
          {loading && <p>Generando QR...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {qrImage && (
            <div>
              <p className="text-light">
                Este es el código QR para que <b>{currentQrUser?.name}</b> inicie sesión.
              </p>
              <img src={qrImage} alt="Código QR" style={{ width: "200px", height: "200px" }} />
              <div className="mt-3">
                <a href={qrImage} download={`QR-${currentQrUser?.name || "usuario"}.png`} style={{ textDecoration: "none" }}>
                  <button aria-label="download" className="btn btn-primary p-2">
                    Descargar QR
                  </button>
                </a>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <Dialog
        className={`col-11 col-lg-5  ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
        visible={profileDialogVisible}
        onHide={() => setProfileDialogVisible(false)}
        closable={false}
        contentClassName="p-0"
        header={
          <div className="d-flex align-items-start justify-content-between w-100 p-3 pb-2 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <AccountCircleOutlinedIcon />
              </div>
              <div className="ms-3">
                <h5 className="m-0 fw-bold">Perfil</h5>
                <small className="text-muted">{selectedProfileName || ''}</small>
              </div>
            </div>

            <button
              className="btn btn-link text-muted p-0 fs-4 lh-1"
              aria-label="Cerrar"
              onClick={() => setProfileDialogVisible(false)}
            >
              ×
            </button>
          </div>
        }
      >
        <div className="px-3 py-3">
          {profileData !== undefined && (
            <div className="mx-auto" style={{ maxWidth: 520 }}>
              {/* ALTURA */}
              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <span className="me-2">#</span> Altura (cm)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingresa tu altura"
                  value={editedProfile.altura}
                  onChange={(e) => setEditedProfile({ ...editedProfile, altura: e.target.value })}
                  style={{ borderRadius: 12, height: 44 }}
                />
              </div>

              {/* EDAD */}
              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <PersonOutlineOutlinedIcon className="me-2" /> Edad
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ingresa tu edad"
                  value={editedProfile.edad}
                  onChange={(e) => setEditedProfile({ ...editedProfile, edad: e.target.value })}
                  style={{ borderRadius: 12, height: 44 }}
                />
              </div>

              {/* BLOQUEAR */}
              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <ShieldOutlinedIcon className="me-2" /> Bloquear
                </label>
                <div className="border rounded-4 p-1">
                  <Dropdown
                    value={editedProfile.isEditable}
                    options={isEditableOptions}
                    onChange={(e) => setEditedProfile({ ...editedProfile, isEditable: e.value })}
                    className="w-100 border-0"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>

              {/* CATEGORÍA */}
              <div className="mb-3">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <LocalOfferOutlinedIcon className="me-2" /> Categoría
                </label>
                <div className="border rounded-4 p-1">
                  <Dropdown
                    value={editedProfile.category}
                    options={nivelOptions}
                    onChange={(e) => setEditedProfile({ ...editedProfile, category: e.value })}
                    className="w-100 border-0"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>

              {/* CTA: Agregar evento */}
              <div className="mb-3">
                <button
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={() => {
                    const newEvents = editedProfile.events ? [...editedProfile.events] : []
                    newEvents.push({ date: '', name: '' })
                    setEditedProfile({ ...editedProfile, events: newEvents })
                  }}
                  style={{
                    background: '#e9f1ff',
                    color: '#1e5eff',
                    border: '1px solid #cfe0ff',
                    borderRadius: 12,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  <CalendarMonthIcon className="me-2" />
                  Agregar evento al calendario
                </button>
              </div>

              {/* LISTA DE EVENTOS */}
              {editedProfile.events &&
                editedProfile.events.map((event, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <span className="me-2 text-primary">
                      <CalendarMonthIcon />
                    </span>

                    <div className="flex-grow-1">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={event.date ? dayjs(event.date) : null}
                          onChange={(newDate) => {
                            const newEvents = [...editedProfile.events]
                            newEvents[index].date = newDate ? newDate.toISOString() : ''
                            setEditedProfile({ ...editedProfile, events: newEvents })
                          }}
                          slotProps={{
                            textField: {
                              variant: 'outlined',
                              className: 'form-control',
                              size: 'small',
                              fullWidth: true,
                              sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    <input
                      type="text"
                      className="form-control ms-2"
                      placeholder="Nombre del evento"
                      value={event.name}
                      onChange={(e) => {
                        const newEvents = [...editedProfile.events]
                        newEvents[index].name = e.target.value
                        setEditedProfile({ ...editedProfile, events: newEvents })
                      }}
                      style={{ borderRadius: 8 }}
                    />

                    <button
                      className="btn btn-link text-muted ms-2"
                      onClick={() => {
                        const newEvents = [...editedProfile.events]
                        newEvents.splice(index, 1)
                        setEditedProfile({ ...editedProfile, events: newEvents })
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

              {/* FOOTER */}
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-link text-muted px-3" onClick={() => setProfileDialogVisible(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleProfileSave}
                  style={{ borderRadius: 12, minWidth: 140 }}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
