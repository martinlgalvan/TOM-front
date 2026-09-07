import React, { useState, useEffect, useMemo } from "react";

import * as UserServices from "./../services/users.services.js";
import * as Notify from "./../helpers/notify.js";
import * as QRServices from "./../services/loginWithQR.js";
import UserRegister from "../components/Users/UserRegister.jsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Link } from "react-router-dom";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Tooltip from "@mui/material/Tooltip"; // ✅ MUI Tooltip

import dayjs from "dayjs";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { UserRound, Pencil, Trash2, QrCode, ArrowUpDown, Plus, Search, CircleX, KeyRound, RefreshCw, Copy, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

import OpenersPlanEditor from "./OpenersPlanEditor.jsx";
import {
  createEmptyOpenersPlan,
  normalizeOpenersPlan,
  normalizeOpenersPlans
} from "../helpers/openersPlanner.js";

export default function PrimeReactTable({ id, users, refresh, collapsed, editorTheme = "light" /* , usersLoading = false */ }) {
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
  // Alumno cuyo menu de acciones esta abierto (solo en mobile).
  const [moreActionsUser, setMoreActionsUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const isInputValid = inputValue === "ELIMINAR";
  const [first, setFirst] = useState(parseInt(localStorage.getItem("userCurrentPage") || "0", 10));
  const [dialogg, setDialogg] = useState(false);

  // bandera de carga local cuando hacemos refresh desde la tabla
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Preferencias de orden/busqueda
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

  // ---- Cambiar contrasena del alumno ----
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const MIN_PASSWORD_LENGTH = 6;

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

  const categoryPaletteDark = {
    "Alumno casual": { bar: "#22c55e", pillBg: "#166534", pillText: "#dcfce7", pillBorder: "#22c55e" },
    "Alumno dedicado": { bar: "#3b82f6", pillBg: "#1d4ed8", pillText: "#dbeafe", pillBorder: "#60a5fa" },
    "Atleta iniciante": { bar: "#f59e0b", pillBg: "#92400e", pillText: "#fef3c7", pillBorder: "#fbbf24" },
    "Atleta avanzado": { bar: "#ef4444", pillBg: "#991b1b", pillText: "#fee2e2", pillBorder: "#f87171" },
    default: { bar: "#94a3b8", pillBg: "#334155", pillText: "#f1f5f9", pillBorder: "#64748b" },
  };

  const categoryClassByLabel = {
    "Alumno casual": "casual",
    "Alumno dedicado": "dedicado",
    "Atleta iniciante": "iniciante",
    "Atleta avanzado": "avanzado",
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
        openers_plans: normalizeOpenersPlans(
          profileData?.openers_plans || profileData?.openersPlans || []
        ),
      });
    }
  }, [profileData]);

  const getEditedOpenersPlans = React.useCallback(() => {
    return normalizeOpenersPlans(editedProfile?.openers_plans || editedProfile?.openersPlans || []);
  }, [editedProfile]);

  const setEditedOpenersPlans = React.useCallback((plans) => {
    setEditedProfile((prev) => ({
      ...prev,
      openers_plans: normalizeOpenersPlans(plans)
    }));
  }, []);

  const addOpenersPlan = React.useCallback(() => {
    const now = new Date().toISOString();
    setEditedOpenersPlans([
      createEmptyOpenersPlan({ created_at: now, updated_at: now }),
      ...getEditedOpenersPlans()
    ]);
  }, [getEditedOpenersPlans, setEditedOpenersPlans]);

  const updateOpenersPlan = React.useCallback(
    (planId, nextPlan) => {
      const next = getEditedOpenersPlans().map((plan) =>
        plan.id === planId
          ? normalizeOpenersPlan({
              ...nextPlan,
              id: planId,
              created_at: plan.created_at,
              updated_at: new Date().toISOString(),
            })
          : plan
      );
      setEditedOpenersPlans(next);
    },
    [getEditedOpenersPlans, setEditedOpenersPlans]
  );

  const removeOpenersPlan = React.useCallback(
    (planId) => {
      const next = getEditedOpenersPlans().filter((plan) => plan.id !== planId);
      setEditedOpenersPlans(next);
    },
    [getEditedOpenersPlans, setEditedOpenersPlans]
  );

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
        Notify.instantToast("Perfil cargado con exito!");
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
    // Una sola request: el backend guarda el perfil y la categoria juntos.
    UserServices.editProfile(selectedProfileId, updatedProfile)
      .then(() => {
        Notify.instantToast("Perfil actualizado con exito!");
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
    const initial = String(user.name || "?").trim().charAt(0).toUpperCase();
    return (
      <div className="usersListModernNameCell">
        <span
          className="usersListModernStatusBar"
          style={{ background: pal.bar }}
        />
        <span className="usersListModernAvatar" aria-hidden="true">{initial}</span>
        <Link
          to={`/user/routine/${user._id}/${user.name}`}
          onClick={() => {
            localStorage.setItem("actualUsername", user.name);
          }}
          className="stylesNameUserList usersListModernNameLink"
        >
          {user.name}
        </Link>
      </div>
    );
  };

  const categoryPill = (user) => {
    const palette = editorTheme === "dark" ? categoryPaletteDark : categoryPalette;
    const pal = palette[user.category] || palette.default;
    const label = user.category || "Sin categoria";
    return (
      <div className="usersListModernCategoryCell">
        <button
          type="button"
          className={`usersListModernCategoryPill usersListCategoryPill-${categoryClassByLabel[label] || "none"}`}
          onClick={() => openProfileDialog(user)}
          style={{ background: pal.pillBg, color: pal.pillText, borderColor: pal.pillBorder }}
          title="Ver perfil y categoria"
        >
          {label}
        </button>
      </div>
    );
  };

  // ---------- Cambiar contrasena ----------

  // Alfabeto sin caracteres ambiguos (0/O, 1/l/I): el entrenador le dicta o le
  // escribe esta clave al alumno, asi que la legibilidad importa mas que
  // exprimir el ultimo bit de entropia.
  const PASSWORD_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const generatePassword = (length = 12) => {
    const alphabet = PASSWORD_ALPHABET;
    // crypto.getRandomValues en vez de Math.random: es una credencial real.
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += alphabet[randomValues[i] % alphabet.length];
    }
    return out;
  };

  const openPasswordDialog = (user) => {
    setPasswordUser(user);
    setNewPassword("");
    setShowPassword(false);
    setRevokeSessions(true);
    setPasswordError(null);
    setPasswordCopied(false);
    setPasswordDialogVisible(true);
  };

  const closePasswordDialog = () => {
    if (passwordSaving) return;
    setPasswordDialogVisible(false);
    // No dejamos la contrasena colgada en memoria/estado despues de cerrar.
    setNewPassword("");
    setPasswordUser(null);
    setPasswordError(null);
    setPasswordCopied(false);
  };

  const handleGeneratePassword = () => {
    setNewPassword(generatePassword());
    setShowPassword(true);
    setPasswordError(null);
    setPasswordCopied(false);
  };

  const handleCopyPassword = async () => {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      Notify.instantToast("No se pudo copiar. Copiala manualmente.");
    }
  };

  const handleSavePassword = async () => {
    if (!passwordUser?._id) return;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    try {
      const result = await UserServices.changeStudentPassword(
        passwordUser._id,
        newPassword,
        revokeSessions
      );

      Notify.instantToast(
        result?.sessionsRevoked
          ? `Contrasena actualizada. ${passwordUser.name} debera volver a iniciar sesion.`
          : "Contrasena actualizada."
      );

      // Cierre directo: closePasswordDialog corta si passwordSaving sigue true.
      setPasswordDialogVisible(false);
      setNewPassword("");
      setPasswordUser(null);
      setPasswordCopied(false);
    } catch (err) {
      setPasswordError(err?.message || "No se pudo cambiar la contrasena");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Ancho a partir del cual se muestran los iconos sueltos. Por debajo, los
  // cinco quedaban en 24x24 con 2px de separacion —muy por debajo del minimo
  // tactil de 44— y "Eliminar" caia pegado al borde de la pantalla.
  const usaMenuDeAcciones = widthPage <= 992;

  const accionesDelAlumno = (user) => [
    { clave: 'perfil', etiqueta: 'Perfil', Icono: UserRound, onSelect: () => openProfileDialog(user) },
    { clave: 'rutina', etiqueta: 'Editar rutina', Icono: Pencil, to: `/user/routine/${user._id}/${user.name}` },
    { clave: 'pass', etiqueta: 'Cambiar contrasena', Icono: KeyRound, onSelect: () => openPasswordDialog(user) },
    { clave: 'qr', etiqueta: 'QR de acceso', Icono: QrCode, onSelect: () => showQrDialog(user) },
    { clave: 'baja', etiqueta: 'Eliminar', Icono: Trash2, peligro: true, onSelect: () => showDialogDelete(user._id, user.name) },
  ];

  const actionsTemplate = (user) =>
    usaMenuDeAcciones ? (
      <div className="usersListModernActions">
        <button
          type="button"
          className="usersListActionsMore"
          title="Acciones"
          aria-label={`Acciones de ${user.name}`}
          onClick={() => setMoreActionsUser(user)}
        >
          <MoreHorizontal size={20} strokeWidth={2} />
        </button>
      </div>
    ) : (
    <div className="usersListModernActions">
      <button className="btn p-1" title="Perfil" onClick={() => openProfileDialog(user)}>
        <UserRound size={18} className="text-secondary" strokeWidth={1.75} />
      </button>

      <Link className="LinkDays" to={`/user/routine/${user._id}/${user.name}`} onClick={() => localStorage.setItem("actualUsername", user.name)}>
        <button className="btn p-1" title="Editar rutina">
          <Pencil size={18} className="text-secondary" strokeWidth={1.75} />
        </button>
      </Link>

      <button className="btn p-1" title="Cambiar contrasena" onClick={() => openPasswordDialog(user)}>
        <KeyRound size={18} className="text-secondary" strokeWidth={1.75} />
      </button>

      <button className="btn p-1" title="QR de acceso" onClick={() => showQrDialog(user)}>
        <QrCode size={18} className="text-secondary" strokeWidth={1.75} />
      </button>

      <button className="btn p-1" title="Eliminar" onClick={() => showDialogDelete(user._id, user.name)}>
        <Trash2 size={18} className="text-danger" strokeWidth={1.75} />
      </button>
    </div>
  );

  /* Hoja de acciones para mobile: filas grandes y etiquetadas, con Eliminar
     separado del resto para que no se toque por error. */
  const dialogoDeAcciones = (
    <Dialog
      header={moreActionsUser ? moreActionsUser.name : ""}
      visible={Boolean(moreActionsUser)}
      onHide={() => setMoreActionsUser(null)}
      dismissableMask
      className="usersListActionsSheet"
      style={{ width: "92%", maxWidth: "420px" }}
    >
      <div className="usersListActionsSheetBody">
        {moreActionsUser && accionesDelAlumno(moreActionsUser).map(({ clave, etiqueta, Icono, onSelect, to, peligro }) =>
          to ? (
            <Link
              key={clave}
              to={to}
              className={`usersListActionsSheetItem${peligro ? " isDanger" : ""}`}
              onClick={() => {
                localStorage.setItem("actualUsername", moreActionsUser.name);
                setMoreActionsUser(null);
              }}
            >
              <Icono size={19} strokeWidth={1.75} />
              <span>{etiqueta}</span>
            </Link>
          ) : (
            <button
              key={clave}
              type="button"
              className={`usersListActionsSheetItem${peligro ? " isDanger" : ""}`}
              onClick={() => { setMoreActionsUser(null); onSelect(); }}
            >
              <Icono size={19} strokeWidth={1.75} />
              <span>{etiqueta}</span>
            </button>
          )
        )}
      </div>
    </Dialog>
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
          Notify.instantToast("Ocurrio un error al eliminar el usuario.");
        });
    }
  };

  const handleCancel = () => {
    setInputValue("");
    hideDialog();
  };

  // ---------- Semaforo de frescura ----------
  const freshnessPalette = {
    good: { // 0-5 dias
      cellBg: "#ECFDF3", cellBorder: "#A6F4C5", text: "#027A48",
      badgeBg: "#D1FADF", badgeText: "#026C3E", badgeBorder: "#ABEFC6",
      icon: "#12B76A"
    },
    warn: { // 6 dias
      cellBg: "#FFFAEB", cellBorder: "#FEDF89", text: "#B54708",
      badgeBg: "#FEEFC6", badgeText: "#B54708", badgeBorder: "#FCD34D",
      icon: "#F59E0B"
    },
    bad: { // ≥7 dias
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

  const freshnessPaletteDark = {
    good: {
      cellBg: "#14532d", cellBorder: "#22c55e", text: "#dcfce7",
      badgeBg: "#166534", badgeText: "#dcfce7", badgeBorder: "#4ade80",
      icon: "#4ade80"
    },
    warn: {
      cellBg: "#78350f", cellBorder: "#f59e0b", text: "#fef3c7",
      badgeBg: "#92400e", badgeText: "#fef3c7", badgeBorder: "#fbbf24",
      icon: "#fbbf24"
    },
    bad: {
      cellBg: "#7f1d1d", cellBorder: "#ef4444", text: "#fee2e2",
      badgeBg: "#991b1b", badgeText: "#fee2e2", badgeBorder: "#f87171",
      icon: "#f87171"
    },
    none: {
      cellBg: "#1e293b", cellBorder: "#64748b", text: "#f1f5f9",
      badgeBg: "#334155", badgeText: "#f1f5f9", badgeBorder: "#64748b",
      icon: "#9fb0c7"
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
    const palette = editorTheme === "dark" ? freshnessPaletteDark : freshnessPalette;
    if (d == null) return { level: "none", days: null, iso: null, ui: palette.none };

    if (d <= 5) return { level: "good", days: d, iso, ui: palette.good };
    if (d === 6) return { level: "warn", days: d, iso, ui: palette.warn };
    return { level: "bad", days: d, iso, ui: palette.bad };
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
    <div className="usersListModernToolbar">
      <div className="usersListModernSearch">
        <Search size={15} aria-hidden="true" />
        <span>
          <InputText value={searchText} onChange={onSearchChange} placeholder="Buscar alumno..." aria-label="Buscar alumno" />
        </span>
      </div>

      <div>
        <button id={"crearAlumno"} className="usersListModernCreate" onClick={() => setDialogg(true)}>
          <Plus size={16} className="me-2" />
          Crear alumno
        </button>
      </div>
    </div>
  );

  const rows = 10;
  const tableLoading = isRefreshing || users == null /* || usersLoading */;

  const emptyContent = tableLoading ? (
    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ height: 670 }}>
      <ProgressSpinner style={{ width: "40px", height: "40px" }} strokeWidth="6" />
      <span className="mt-2">Cargando...</span>
    </div>
  ) : (
    <div style={{ height: 670 }} />
  );

  // ===== Celda "Ult. vez editado" (solo fecha + icono + tooltip MUI con delay) =====
  const lastEditedCell = (row) => {
    const f = getFreshness(row);

    const Icon =
      f.level === "good" ? CheckCircle2 :
      f.level === "warn" ? AlertTriangle :
      f.level === "bad"  ? AlertOctagon :
                           Info;

    const dateStr = f.iso
      ? new Date(f.iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "-";

    const ageStr = f.days == null ? "" : (f.days === 0 ? "hoy" : `hace ${f.days} dia${f.days > 1 ? "s" : ""}`);
    const tooltip = f.iso ? `Ultima edicion: ${dateStr} • ${ageStr}` : "Sin planificacion registrada";

    return (
      <Tooltip title={tooltip} arrow placement="top" enterDelay={200} enterNextDelay={200}>
        <div
          className={`d-flex align-items-center justify-content-between usersListModernFreshness usersListFreshness-${f.level}`}
          style={{
            width: "100%",
            background: f.ui.cellBg,
            border: `1px solid ${f.ui.cellBorder}`,
            borderRadius: 12,
            padding: "6px 10px",
            minHeight: 36
            // ❌ sin cursor: "help" para evitar el icono de "?"
          }}
        >
          <Icon size={16} color={f.ui.icon} strokeWidth={2} />
          <span
            className="usersListModernFreshnessBadge"
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
            {/* Sin fecha mostraba solo un guion dentro de una pildora gris y
                se leia como un cargador que quedo colgado. */}
            {f.iso ? dateStr : "Sin cargar"}
          </span>
        </div>
      </Tooltip>
    );
  };

  return (
    <div className={`row justify-content-around usersListTheme-${editorTheme}`}>
      <div className="col-12 m-0">
        <DataTable
          header={tableHeader}
          value={filteredUsers}
          className="usersListTable2 usersListModernTable"
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          stripedRows
          showGridlines={false}
          sortMode="single"
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} alumnos"
          loading={tableLoading}
          scrollable
          scrollHeight="670px"
          emptyMessage={emptyContent}
        >
          <Column
            field="name"
            body={(row) => nameWithBar(row)}
            header={
              <div className="usersListModernSortableHeader">
                <span className="fw-semibold">Nombre</span>
                <button onClick={sortByName} title="Ordenar por nombre">
                  <ArrowUpDown size={12} />
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
                <div className="usersListModernSortableHeader">
                  <span className="fw-semibold">Email</span>
                  <button onClick={sortByEmail} title="Ordenar por email">
                    <ArrowUpDown size={12} />
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
                <div className="usersListModernSortableHeader">
                  <span>Categoria</span>
                  <button onClick={sortByCategory} title={`Categoria prioritaria: ${headerCategory}. Click para cambiar`}>
                    <ArrowUpDown size={12} />
                  </button>
                </div>
              }
              style={{ width: "180px" }}
            />
          )}

          {/* NUEVO: columna "Ult. vez editado" (lee del backend) */}
          {widthPage > 600 && (
            <Column
              field="lastEdited"
              header={
                <div className="usersListModernSortableHeader">
                  <span className="fw-semibold">Ult. vez editado</span>
                  <button onClick={sortByLastEdited} title="Ordenar por ultima edicion">
                    <ArrowUpDown size={12} />
                  </button>
                </div>
              }
              body={lastEditedCell}
              style={{ width: "155px" }}
            />
          )}

          <Column field="actions" header="Acciones" body={actionsTemplate} style={{ width: "165px" }} />
        </DataTable>
      </div>

      {/* ---- Crear alumno ---- */}
      <UserRegister
        dialogg={dialogg}
        refresh={refresh}
        parentId={id}
        onClose={() => setDialogg(false)}
        editorTheme={editorTheme}
      />

      {/* ---- Eliminar usuario (confirmacion simple) ---- */}
      <dialog id="deleteUserModal" className={`usersListNativeDialog usersListTheme-${editorTheme}`} style={{ padding: 0, border: "none", borderRadius: 12, maxWidth: 520, width: "90%" }}>
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

      {/* ---- Cambiar contrasena del alumno ---- */}
      <Dialog
        header={
          <div className="usersListDialogHeader">
            <span className="usersListDialogHeaderIcon"><KeyRound size={18} /></span>
            <div>
              <strong>Cambiar contrasena</strong>
              <span>{passwordUser?.name || ""}</span>
            </div>
          </div>
        }
        visible={passwordDialogVisible}
        onHide={closePasswordDialog}
        style={{ width: widthPage > 900 ? "460px" : "92%" }}
        className={`usersListDialog usersListPasswordDialog usersListTheme-${editorTheme}`}
        footer={
          <div className="usersListDialogActions">
            <button
              type="button"
              className="usersListDialogButton usersListDialogButtonSecondary"
              onClick={closePasswordDialog}
              disabled={passwordSaving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="usersListDialogButton usersListDialogButtonPrimary"
              onClick={handleSavePassword}
              disabled={passwordSaving || newPassword.length < MIN_PASSWORD_LENGTH}
            >
              {passwordSaving ? "Guardando..." : "Guardar contrasena"}
            </button>
          </div>
        }
      >
        <p className="usersListPasswordIntro">
          Defini la nueva contrasena de <b>{passwordUser?.name}</b>. Vas a tener que pasarsela vos:
          por seguridad no se puede volver a ver despues de guardarla.
        </p>

        <div className="usersListFieldGroup">
          <label htmlFor="new-student-password">Nueva contrasena</label>
          <div className="usersListPasswordRow">
            <InputText
              id="new-student-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              autoComplete="new-password"
              placeholder={`Minimo ${MIN_PASSWORD_LENGTH} caracteres`}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
                setPasswordCopied(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPassword.length >= MIN_PASSWORD_LENGTH && !passwordSaving) {
                  handleSavePassword();
                }
              }}
            />
            <button
              type="button"
              className="usersListPasswordIconButton"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              type="button"
              className="usersListPasswordIconButton"
              onClick={handleCopyPassword}
              disabled={!newPassword}
              title="Copiar contrasena"
              aria-label="Copiar contrasena"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="usersListPasswordHelpers">
            <button type="button" className="usersListPasswordGenerate" onClick={handleGeneratePassword}>
              <RefreshCw size={14} />
              Generar una segura
            </button>
            {passwordCopied && <span className="usersListPasswordCopied">Copiada</span>}
          </div>
        </div>

        <label className="usersListPasswordCheckbox">
          <input
            type="checkbox"
            checked={revokeSessions}
            onChange={(e) => setRevokeSessions(e.target.checked)}
          />
          <span>
            Cerrar las sesiones activas del alumno
            <small>Si esta abierta la app en su celular, se le va a pedir iniciar sesion de nuevo.</small>
          </span>
        </label>

        {passwordError && <p className="usersListPasswordError">{passwordError}</p>}
      </Dialog>

      {dialogoDeAcciones}

      {/* ---- QR ---- */}
      <Dialog
        header={
          <div className="usersListDialogHeader">
            <span className="usersListDialogHeaderIcon"><QrCode size={18} /></span>
            <div>
              <strong>Codigo QR</strong>
              <span>{currentQrUser?.name || ""}</span>
            </div>
          </div>
        }
        visible={qrDialogVisible}
        onHide={() => setQrDialogVisible(false)}
        style={{ width: widthPage > 900 ? "360px" : "90%" }}
        className={`usersListDialog usersListQrDialog usersListTheme-${editorTheme}`}
      >
        <div className="text-center">
          {loading && <p className="text-muted mb-0">Generando QR...</p>}
          {error && <p style={{ color: "#b42318" }}>{error}</p>}
          {qrImage && (
            <div>
              <p className="usersListQrHint">
                Este es el codigo QR para que <b>{currentQrUser?.name}</b> inicie sesion.
              </p>
              <div className="usersListQrCard">
                <img src={qrImage} alt="Codigo QR" width={180} height={180} />
              </div>
              <a
                href={qrImage}
                download={`QR-${currentQrUser?.name || "usuario"}.png`}
                className="usersListDialogButton usersListDialogButtonPrimary w-100 mt-3"
              >
                Descargar QR
              </a>
            </div>
          )}
        </div>
      </Dialog>

      <Dialog
        className={`col-11 col-lg-5 usersListDialog usersListProfileDialog usersListTheme-${editorTheme} ${collapsed ? 'marginSidebarClosed' : ' marginSidebarOpen'}`}
        visible={profileDialogVisible}
        onHide={() => setProfileDialogVisible(false)}
        header={
          <div className="usersListDialogHeader">
            <span className="usersListDialogHeaderIcon"><AccountCircleOutlinedIcon fontSize="small" /></span>
            <div>
              <strong>Perfil</strong>
              <span>{selectedProfileName || ''}</span>
            </div>
          </div>
        }
        footer={
          <div className="usersListDialogActions">
            <button
              type="button"
              className="usersListDialogButton usersListDialogButtonSecondary"
              onClick={() => setProfileDialogVisible(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="usersListDialogButton usersListDialogButtonPrimary"
              onClick={handleProfileSave}
            >
              Guardar
            </button>
          </div>
        }
      >
        {profileData !== undefined && (
          <div>
            <div className="usersListFieldGroup">
              <label><PersonOutlineOutlinedIcon fontSize="inherit" className="me-1" />Altura (cm)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingresa tu altura"
                value={editedProfile.altura}
                onChange={(e) => setEditedProfile({ ...editedProfile, altura: e.target.value })}
              />
            </div>

            <div className="usersListFieldGroup">
              <label><PersonOutlineOutlinedIcon fontSize="inherit" className="me-1" />Edad</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ingresa tu edad"
                value={editedProfile.edad}
                onChange={(e) => setEditedProfile({ ...editedProfile, edad: e.target.value })}
              />
            </div>

            <div className="usersListFieldGroup">
              <label><ShieldOutlinedIcon fontSize="inherit" className="me-1" />Bloquear</label>
              <Dropdown
                value={editedProfile.isEditable}
                options={isEditableOptions}
                onChange={(e) => setEditedProfile({ ...editedProfile, isEditable: e.value })}
                className="w-100"
              />
            </div>

            <div className="usersListFieldGroup">
              <label><LocalOfferOutlinedIcon fontSize="inherit" className="me-1" />Categoria</label>
              <Dropdown
                value={editedProfile.category}
                options={nivelOptions}
                onChange={(e) => setEditedProfile({ ...editedProfile, category: e.value })}
                className="w-100"
              />
            </div>

            {/* CTA: Agregar evento */}
            <div className="usersListFieldGroup">
              <label><CalendarMonthIcon fontSize="inherit" className="me-1" />Eventos en el calendario</label>

              <button
                type="button"
                className="usersListDialogButton usersListDialogButtonSecondary w-100"
                onClick={() => {
                  const newEvents = editedProfile.events ? [...editedProfile.events] : []
                  newEvents.push({ date: '', name: '' })
                  setEditedProfile({ ...editedProfile, events: newEvents })
                }}
              >
                <CalendarMonthIcon fontSize="small" className="me-2" />
                Agregar evento al calendario
              </button>

              {editedProfile.events?.length > 0 && (
                <div className="usersListProfileEventList">
                  {editedProfile.events.map((event, index) => (
                    <div key={index} className="usersListProfileEventRow">
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
                              size: 'small',
                              fullWidth: true,
                              sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px' } },
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre del evento"
                        value={event.name}
                        onChange={(e) => {
                          const newEvents = [...editedProfile.events]
                          newEvents[index].name = e.target.value
                          setEditedProfile({ ...editedProfile, events: newEvents })
                        }}
                      />

                      <button
                        type="button"
                        aria-label="Eliminar evento"
                        onClick={() => {
                          const newEvents = [...editedProfile.events]
                          newEvents.splice(index, 1)
                          setEditedProfile({ ...editedProfile, events: newEvents })
                        }}
                      >
                        <CircleX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="usersListFieldGroup">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <label className="mb-0"><CalendarMonthIcon fontSize="inherit" className="me-1" />Calendario deportivo</label>
                <button type="button" className="usersListDialogButton usersListDialogButtonSecondary" onClick={addOpenersPlan}>
                  Nuevo plan
                </button>
              </div>

              {getEditedOpenersPlans().length === 0 ? (
                <div className="usersListProfileEmptyPlans">
                  Sin planes cargados para este alumno.
                </div>
              ) : (
                <Accordion multiple activeIndex={[0]}>
                  {getEditedOpenersPlans().map((plan) => {
                    const headerName = String(plan?.meetName || "").trim() || "Plan sin nombre";
                    const headerDate = plan?.meetDate
                      ? new Date(plan.meetDate).toLocaleDateString()
                      : "Sin fecha";
                    return (
                      <AccordionTab
                        key={plan.id}
                        header={
                          <div className="d-flex justify-content-between align-items-center w-100 pe-2">
                            <span>{headerName}</span>
                            <small className="text-muted">{headerDate}</small>
                          </div>
                        }
                      >
                        <OpenersPlanEditor
                          value={plan}
                          onChange={(nextPlan) => updateOpenersPlan(plan.id, nextPlan)}
                          title="Plan del alumno"
                        />
                        <div className="d-flex justify-content-end mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeOpenersPlan(plan.id)}
                          >
                            Eliminar plan
                          </button>
                        </div>
                      </AccordionTab>
                    );
                  })}
                </Accordion>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
