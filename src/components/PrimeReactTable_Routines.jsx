import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as RoutineService from "../services/week.services.js";
import * as BlockService from "../services/blocks.services.js";
import * as NotifyHelper from "../helpers/notify.js";

import DeleteWeek from "./DeleteActions/DeleteWeek.jsx";
import BloquesForm from "./BloquesForm.jsx";
import RoutineWeeksBlockSelect from "./RoutineWeeksBlockSelect.jsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { CircleX, Copy, Info, MessageSquarePlus, MessageSquareText, Eye, EyeOff, Trash2, X, Layers } from "lucide-react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function PrimeReactTable_Routines({
  id,
  username,
  routine,
  setRoutine,
  copyRoutine,
  editorTheme = "light",
  rowsPerPage = 8,
  density = "comfortable",
  blocks: externalBlocks,
  onBlocksRefresh,
}) {
  const [copyWeekStorage, setCopyWeekStorage] = useState();
  const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState();
  const [weekName, setWeekName] = useState("");
  const [week_id, setWeek_id] = useState("");
  const [firstWidth, setFirstWidth] = useState(window.innerWidth);
  const [localBlocks, setLocalBlocks] = useState([]);
  const navigate = useNavigate();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockPendingEdit, setBlockPendingEdit] = useState(null);
  const [trainer_id] = useState(localStorage.getItem("_id"));

  // === Acciones masivas ===
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState("");
  const [showBulkBlockChangeDialog, setShowBulkBlockChangeDialog] = useState(false);
  const [bulkBlockChangePending, setBulkBlockChangePending] = useState(null);
  const [bulkBlockChangeConfirmText, setBulkBlockChangeConfirmText] = useState("");

  // === Comentarios ===
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [commentsWeekId, setCommentsWeekId] = useState(null);
  const [commentsTitle, setCommentsTitle] = useState("Comentarios semanales");
  const [commentsDescription, setCommentsDescription] = useState("");
  const [commentsMode, setCommentsMode] = useState("free"); // "free" | "days"
  const [commentsDaysMeta, setCommentsDaysMeta] = useState([]); // [{_id,label}]
  const [commentsByDay, setCommentsByDay] = useState({}); // { [dayId]: text }

  const loadBlocks = useCallback(async () => {
    if (!trainer_id) {
      setLocalBlocks([]);
      return;
    }

    try {
      const raw = await BlockService.getBlocks(trainer_id);
      const normalized = Array.isArray(raw)
        ? raw.map((block) => ({
            ...block,
            _id: block._id.toString(),
          }))
        : [];
      setLocalBlocks(normalized);
    } catch (error) {
      console.error("Error cargando bloques", error);
      setLocalBlocks([]);
    }
  }, [trainer_id]);

  useEffect(() => {
    if (!externalBlocks) {
      loadBlocks();
    }
  }, [externalBlocks, loadBlocks]);

  const blocks = Array.isArray(externalBlocks) ? externalBlocks : localBlocks;
  /* Identidad de la lista de bloques: cambia al crear, borrar, renombrar o
     recolorear uno. La usan el calculo de colores y la key de la tabla. */
  const blocksSignature = blocks.map((b) => `${b._id}:${b.name}:${b.color}`).join(",");
  const refreshBlocks = onBlocksRefresh || loadBlocks;

  // Si la rutina cambia (ej: se elimino/actualizo una semana por otra via),
  // sacamos de la seleccion cualquier semana que ya no exista.
  useEffect(() => {
    setSelectedWeeks((prev) => {
      if (!prev.length) return prev;
      const ids = new Set((routine || []).map((w) => w._id));
      const next = prev.filter((w) => ids.has(w._id));
      return next.length === prev.length ? prev : next;
    });
  }, [routine]);

  // estilos: colores de bloque + hover de celdas navegables
  useEffect(() => {
    // colores bloque
    const styleTag = document.createElement("style");
    styleTag.id = "dynamic-block-colors";

    let css = "";
    blocks.forEach((block) => {
      if (block.color) {
        const className = `bg-${block.color.replace("#", "")}`;
        const textColor = getContrastYIQ(block.color);
        css += `.${className} { background-color: ${block.color} !important; color: ${textColor} !important; }\n`;
      }
    });
    styleTag.innerHTML = css;
    const existing = document.getElementById("dynamic-block-colors");
    if (existing) existing.remove();
    document.head.appendChild(styleTag);

    return () => {
      const cleanup = document.getElementById("dynamic-block-colors");
      if (cleanup) cleanup.remove();
    };
  }, [blocksSignature]);

  useEffect(() => {
    // hover de celdas navegables
    const hover = document.createElement("style");
    hover.id = "nav-hover-styles";
    hover.innerHTML = `
      .p-datatable td.hover-nav { cursor: pointer; }
      .p-datatable td.hover-nav:hover { background-color: rgba(0,0,0,0.06); }
    `;
    const existing = document.getElementById("nav-hover-styles");
    if (existing) existing.remove();
    document.head.appendChild(hover);
    return () => {
      const cleanup = document.getElementById("nav-hover-styles");
      if (cleanup) cleanup.remove();
    };
  }, []);

  const buildOptions = (currentBlock) => {
    const base = [
      { name: "Agregar bloque", _id: "add-new-block" },
      { name: "Sin bloque", _id: null },
    ];
    const extra =
      currentBlock && !blocks.find((b) => b._id === currentBlock._id)
        ? [currentBlock]
        : [];
    return [...base, ...blocks, ...extra];
  };

  // Celda con el selector de bloques
  const blockDropdownTemplate = (rowData) => {
    const blockId =
      rowData.block_id?.toString() || rowData.block?._id?.toString();
    const fromList = blocks.find((b) => b._id === blockId);
    const currentBlock =
      fromList || (rowData.block ? { ...rowData.block, _id: blockId } : null);

    const options = buildOptions(currentBlock);

    const backgroundColor =
      currentBlock?.color || (editorTheme === "dark" ? "#111827" : "#ffffff");
    const textColor = currentBlock?.color
      ? getContrastYIQ(currentBlock.color)
      : editorTheme === "dark"
        ? "white"
        : "black";

    // El dropdown no ocupa 100% para dejar margenes clicables que sigan navegando
    return (
      <div className="routineWeeksBlockCell">
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "inline-block", width: "calc(100% - 12px)" }}
        >
          <RoutineWeeksBlockSelect
            value={currentBlock?._id || ""}
            label={`Bloque de ${rowData.name || "semana"}`}
            theme={editorTheme}
            currentBlock={currentBlock}
            options={options}
            style={{
              "--routine-block-bg": backgroundColor,
              "--routine-block-fg": textColor,
            }}
            onChange={(nextValue) =>
              handleBlockDropdownChange(rowData._id, nextValue)
            }
            onEditBlock={(block) => {
              if (!block?._id) return;
              setBlockPendingEdit(block);
              setShowBlockDialog(true);
            }}
          />
        </div>
      </div>
    );
  };

  const handleAssignBlock = async (routineId, block) => {
    try {
      await RoutineService.assignBlockToRoutine(routineId, block || null);
      const selectedBlock = block?._id ? { ...block, _id: String(block._id) } : null;

      setRoutine((prev) =>
        prev.map((r) =>
          r._id === routineId
            ? {
                ...r,
                block: selectedBlock,
                block_id: selectedBlock?._id || null,
              }
            : r
        )
      );

      NotifyHelper.instantToast("Bloque asignado con exito");
    } catch (err) {
      console.error("Error actualizando bloque", err);
      NotifyHelper.instantToast("Error al guardar el bloque");
      throw err;
    }
  };

  // Toggle visibilidad: si pasa a 'visible', seteamos visible_at; si pasa a 'hidden', lo ponemos en null
  const handleToggleVisibility = async (weekId, current) => {
    const next = current === "hidden" ? "visible" : "hidden";
    try {
      await RoutineService.updateWeekProperties(weekId, { visibility: next });

      // update optimista del estado local (visible_at)
      setRoutine((prev) =>
        prev.map((w) =>
          w._id === weekId
            ? {
                ...w,
                visibility: next,
                visible_at:
                  next === "visible" ? new Date().toISOString() : null,
              }
            : w
        )
      );

      NotifyHelper.instantToast(
        next === "hidden"
          ? "Semana ocultada para el alumno"
          : "Semana visible para el alumno"
      );
    } catch (err) {
      console.error("Error actualizando visibility", err);
      NotifyHelper.instantToast("Error al cambiar la visibilidad");
    }
  };

  // === Acciones masivas ===
  const clearSelection = () => setSelectedWeeks([]);

  const handleBulkVisibility = async (nextVisibility) => {
    if (!selectedWeeks.length || bulkBusy) return;
    const ids = selectedWeeks.map((w) => w._id);
    setBulkBusy(true);
    try {
      await RoutineService.bulkUpdateWeeks(id, ids, { visibility: nextVisibility });
      const idSet = new Set(ids);
      setRoutine((prev) =>
        prev.map((w) =>
          idSet.has(w._id)
            ? {
                ...w,
                visibility: nextVisibility,
                visible_at: nextVisibility === "visible" ? new Date().toISOString() : null,
              }
            : w
        )
      );
      NotifyHelper.instantToast(
        nextVisibility === "hidden"
          ? `${ids.length} semana(s) ocultadas para el alumno`
          : `${ids.length} semana(s) visibles para el alumno`
      );
      clearSelection();
    } catch (err) {
      console.error("Error actualizando visibility masiva", err);
      NotifyHelper.instantToast("Error al cambiar la visibilidad de las semanas seleccionadas");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkBlockChange = (blockValue) => {
    if (!selectedWeeks.length || bulkBusy) return;
    if (blockValue === "add-new-block") {
      setBlockPendingEdit(null);
      setShowBlockDialog(true);
      return;
    }
    // Mostrar diálogo de confirmación en lugar de aplicar directamente
    const selectedBlock = blocks.find((block) => block._id === blockValue) || null;
    setBulkBlockChangePending(selectedBlock);
    setBulkBlockChangeConfirmText("");
    setShowBulkBlockChangeDialog(true);
  };

  const handleBulkBlockChangeConfirm = async () => {
    if (!bulkBlockChangePending || bulkBlockChangeConfirmText !== "CONFIRMAR CAMBIO") return;
    const ids = selectedWeeks.map((w) => w._id);
    setBulkBusy(true);
    try {
      await RoutineService.bulkUpdateWeeks(id, ids, {
        block: bulkBlockChangePending,
        block_id: bulkBlockChangePending?._id || null,
      });
      const idSet = new Set(ids);
      setRoutine((prev) =>
        prev.map((w) =>
          idSet.has(w._id)
            ? { ...w, block: bulkBlockChangePending, block_id: bulkBlockChangePending?._id || null }
            : w
        )
      );
      NotifyHelper.instantToast(`Bloque actualizado en ${ids.length} semana(s)`);
      clearSelection();
      setShowBulkBlockChangeDialog(false);
      setBulkBlockChangePending(null);
    } catch (err) {
      console.error("Error actualizando bloque masivo", err);
      NotifyHelper.instantToast("Error al cambiar el bloque de las semanas seleccionadas");
    } finally {
      setBulkBusy(false);
    }
  };

  const cantidadSemanas = selectedWeeks.length;
  const palabraSemanas = cantidadSemanas === 1 ? "semana" : "semanas";
  const fraseDeConfirmacion = `ELIMINAR ${cantidadSemanas} ${palabraSemanas.toUpperCase()}`;

  const handleBulkDeleteConfirm = async () => {
    if (!selectedWeeks.length || bulkBusy) return;
    const ids = selectedWeeks.map((w) => w._id);
    setBulkBusy(true);
    try {
      await RoutineService.bulkDeleteWeeks(id, ids);
      const idSet = new Set(ids);
      setRoutine((prev) => prev.filter((w) => !idSet.has(w._id)));
      NotifyHelper.instantToast(`${ids.length} semana(s) eliminadas`);
      clearSelection();
      setShowBulkDeleteDialog(false);
    } catch (err) {
      console.error("Error eliminando semanas masivamente", err);
      NotifyHelper.instantToast("Error al eliminar las semanas seleccionadas");
    } finally {
      setBulkBusy(false);
    }
  };

  const getVisibilityTooltip = (isHidden) =>
    isHidden
      ? "Al apretar este boton, volveras a mostrar esta semana al alumno. Tambien, le aparecera la fecha de cuando hiciste visible la rutina, no cuando la creaste. Tambien, respetara el orden que vos ves en las semanas. Asi tal cual, las vera tu alumno."
      : "Al apretar este boton, tu alumno no vera la rutina cargada. Sin embargo, podras trabajar libremente sobre ella.";

  const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return "black";
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? "black" : "white";
  };

  const goToPage = (routineId, dayId) => {
    navigate(`/routine/user/${id}/week/${routineId}/day/${dayId}/${username}`);
  };

  // === Abrir dialogo de comentarios ===
  const handleOpenComments = (row) => {
    setCommentsWeekId(row._id);
    setCommentsTitle(row.comments?.title || "Comentarios semanales");
    setCommentsDescription(row.comments?.description || "");

    // modo
    const initialMode = row.comments?.mode === "days" ? "days" : "free";
    setCommentsMode(initialMode);

    // meta de dias (label por dia)
    const daysMeta = (row.routine || []).map((d, idx) => ({
      _id: String(d._id),
      label: d?.name || d?.title || `Dia ${idx + 1}`,
    }));
    setCommentsDaysMeta(daysMeta);

    // valores por dia (si vienen del server)
    let initialByDay = {};
    // admite array (nuevo), objeto plano (viejo) y daysMap (compatible)
    const fromServer =
      row.comments?.days ||
      row.comments?.daysMap ||
      (row.comments?.days && typeof row.comments.days === "object"
        ? row.comments.days
        : null);

    if (fromServer && typeof fromServer === "object") {
      if (Array.isArray(fromServer)) {
        fromServer.forEach((it) => {
          if (it && it.dayId != null) {
            initialByDay[String(it.dayId)] = String(it.text ?? "");
          }
        });
      } else {
        initialByDay = Object.keys(fromServer).reduce((acc, k) => {
          acc[String(k)] = String(fromServer[k] ?? "");
          return acc;
        }, {});
      }
    }
    setCommentsByDay(initialByDay);

    setShowCommentsDialog(true);
  };

  // --- Helper: construir payload compatible (array + objeto)
  const buildCommentsPayload = () => {
    const base = {
      title: commentsTitle?.trim() || "Comentarios semanales",
    };

    if (commentsMode === "days") {
      // Array de objetos [{dayId,label,text}]
      const daysArr = commentsDaysMeta.map((d) => ({
        dayId: String(d._id),
        label: d.label,
        text: String(commentsByDay[d._id] || "").trim(),
      }));

      // Objeto { [dayId]: text }
      const daysMap = commentsDaysMeta.reduce((acc, d) => {
        acc[String(d._id)] = String(commentsByDay[d._id] || "").trim();
        return acc;
      }, {});

      return {
        comments: {
          ...base,
          mode: "days",
          days: daysArr,
          daysMap, // compatibilidad con back/lectores que esperen objeto
        },
      };
    }

    // Modo libre
    return {
      comments: {
        ...base,
        mode: "free",
        description: commentsDescription || "",
      },
    };
  };

  // === Guardar comentarios ===
  const handleSaveComments = async () => {
    try {
      const payload = buildCommentsPayload();
      await RoutineService.updateWeekProperties(commentsWeekId, payload);

      // update optimista (asignamos comments explicitamente)
      setRoutine((prev) =>
        prev.map((w) =>
          w._id === commentsWeekId ? { ...w, comments: payload.comments } : w
        )
      );

      setShowCommentsDialog(false);
      NotifyHelper.instantToast("Comentarios guardados con exito");
    } catch (err) {
      console.error("Error guardando comentarios", err);
      NotifyHelper.instantToast("Error al guardar los comentarios");
    }
  };

  const actionsTemplate = (row) => {
    const currentVis = row.visibility || "visible";
    const isHidden = currentVis === "hidden";

    return (
      <div className="routineWeeksRowActions" onClick={(e) => e.stopPropagation()}>
        {/* Visibilidad */}
        <div>
          <Tooltip title={getVisibilityTooltip(isHidden)} arrow placement="top">
            <IconButton
              aria-label="toggle-visibility"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(row._id, currentVis);
              }}
              size="small"
            >
              {isHidden ? (
                <VisibilityOffIcon className="text-danger" />
              ) : (
                <VisibilityIcon className="text-success" />
              )}
            </IconButton>
          </Tooltip>
        </div>

        {/* Agregar comentarios */}
        <div>
          <Tooltip
            arrow
            placement="top"
            title={
              <div style={{ maxWidth: 260, lineHeight: 1.2 }}>
                <strong>Agregar comentarios</strong>
                <div className="mt-1">
                  Esta seccion permite agregar comentarios sobre la semana. Podes
                  usar modo libre o por dia. Tu alumno lo vera antes de entrar a
                  la semana.
                </div>
              </div>
            }
          >
            <IconButton
              aria-label="add-comments"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenComments(row);
              }}
              size="small"
            >
              <MessageSquareText  fill={row.comments ? '#0e5e39ff' : ''} color="white" strokeWidth={2} />
            </IconButton>
          </Tooltip>
        </div>

        {/* Copiar */}
        <div>
          <IconButton
            aria-label="copy"
            onClick={(e) => {
              e.stopPropagation();
              saveToLocalStorage(row);
            }}
          >
            <Copy className="text-dark" />
          </IconButton>
        </div>

        {/* Eliminar */}
        <div>
          <IconButton
            aria-label="delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteWeek(row._id, row.name);
            }}
          >
            <CircleX className="text-danger" />
          </IconButton>
        </div>
      </div>
    );
  };

  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem("userWeek", JSON.stringify(data));
      setCopyWeekStorage(JSON.stringify(data));
      copyRoutine(data);
      NotifyHelper.instantToast("Copiado con exito!");
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
    setRoutine((prevRoutine) =>
      prevRoutine.filter((week) => week._id !== week_id)
    );
  };

  const hideDialog = () => {
    setShowDeleteWeekDialog(false);
  };

  const handleBlockDropdownChange = async (weekId, value) => {
    if (value === "add-new-block") {
      setBlockPendingEdit(null);
      setShowBlockDialog(true);
      return;
    }
    const selectedBlock = blocks.find((block) => block._id === value) || null;
    return handleAssignBlock(weekId, selectedBlock);
  };

  // Nombre (celda navegable)
  const linksTemplate = (row, e) => {
    if (id && e.field === "name") {
      return (
        <div className="routineWeeksNameCell">
          <Link
            className="LinkDays routineWeeksNameLink"
            to={`/routine/user/${id}/week/${row._id}/day/${row.routine[0]._id}/${username}`}
            onClick={(e) => e.stopPropagation()}
          >
            <b>{row.name}</b>
          </Link>
          <span>Haz click para entrar</span>
        </div>
      );
    }
  };

  // Ult. vez modificado + visible desde
  const modificationTemplate = (rowData) => {
    const fmtEntrenador = () => {
      const fecha = rowData.created_at?.fecha || "-";
      const hora = rowData.created_at?.hora || "";
      return `${fecha} ${hora}`.trim();
    };
    const fmtAlumno = () =>
      rowData.updated_user_at
        ? new Date(rowData.updated_user_at).toLocaleString()
        : "-";

    return (
      <div className="routineWeeksDates">
        <div>
          <strong>Entrenador</strong>
          <span>{fmtEntrenador()}</span>
        </div>
        <div>
          <strong>Alumno</strong>
          <span>{fmtAlumno()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`routineWeeksTableWrap routineWeeksTheme-${editorTheme} routineWeeksDensity-${density}`}>
      {selectedWeeks.length > 0 && (
        <div className="routineWeeksBulkToolbar" onClick={(e) => e.stopPropagation()}>
          <span className="routineWeeksBulkToolbarCount">
            {selectedWeeks.length} semana{selectedWeeks.length === 1 ? "" : "s"} seleccionada{selectedWeeks.length === 1 ? "" : "s"}
          </span>

          <div className="routineWeeksBulkToolbarActions">
            <button
              type="button"
              className="routineWeeksBulkToolbarButton"
              disabled={bulkBusy}
              onClick={() => handleBulkVisibility("visible")}
            >
              <Eye size={15} />
              Mostrar
            </button>
            <button
              type="button"
              className="routineWeeksBulkToolbarButton"
              disabled={bulkBusy}
              onClick={() => handleBulkVisibility("hidden")}
            >
              <EyeOff size={15} />
              Ocultar
            </button>

            <RoutineWeeksBlockSelect
              value=""
              label="Cambiar bloque de las semanas seleccionadas"
              theme={editorTheme}
              options={buildOptions(null)}
              className="routineWeeksBulkToolbarBlockSelect"
              onChange={handleBulkBlockChange}
              onEditBlock={(block) => {
                if (!block?._id) return;
                setBlockPendingEdit(block);
                setShowBlockDialog(true);
              }}
            />

            <button
              type="button"
              className="routineWeeksBulkToolbarButton is-danger"
              disabled={bulkBusy}
              onClick={() => {
                setBulkDeleteConfirmText("");
                setShowBulkDeleteDialog(true);
              }}
            >
              <Trash2 size={15} />
              Eliminar
            </button>
          </div>

          <button
            type="button"
            className="routineWeeksBulkToolbarClose"
            aria-label="Cancelar seleccion"
            onClick={clearSelection}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div>
        <DataTable
          /* DataTable no redibuja sus celdas cuando lo unico que cambio esta en
             el closure del template -es el caso del selector de bloque, que se
             arma con la lista de bloques-. Sin esta key, un bloque recien creado
             no aparecia en el desplegable hasta recargar la pagina. La lista solo
             cambia al crear, renombrar o borrar un bloque, no al navegar. */
          key={`semanas-${blocksSignature}`}
          className="usersListTable routineWeeksModernTable"
          paginator
          rows={rowsPerPage}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} semanas"
          value={routine}
          emptyMessage=" "
          scrollable={false}
          onRowClick={(e) => {
            const target = e.originalEvent.target;
            if (target.closest("a")) return;
            const cell = target.closest("td");
            if (!cell || !cell.classList.contains("js-nav-cell")) return;
            const row = e.data;
            goToPage(row._id, row.routine[0]._id);
          }}
          dataKey="_id"
          selection={selectedWeeks}
          onSelectionChange={(e) => setSelectedWeeks(e.value)}
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} style={{ width: "3rem" }} />

          {firstWidth > 568 && (
            <Column
              body={blockDropdownTemplate}
              style={{ width: "15%" }}
              field="block"
              header="Bloque"
              bodyClassName="js-nav-cell hover-nav"
            />
          )}

          <Column
            body={linksTemplate}
            field="name"
            header="Nombre"
            bodyClassName="js-nav-cell hover-nav"
            style={{ width: firstWidth > 568 ? "35%" : "40%" }}
          />

          {firstWidth > 768 && (
            <Column
              body={modificationTemplate}
              header="Ult. vez modificado"
              bodyClassName="js-nav-cell hover-nav"
              style={{ width: "30%" }}
            />
          )}

          <Column
            body={actionsTemplate}
            field="acciones"
            header="Acciones"
            style={{ width: "20%" }}
          />
        </DataTable>
      </div>

      <DeleteWeek
        visible={showDeleteWeekDialog}
        onDelete={deleteWeekConfirm}
        onHide={hideDialog}
        week_id={week_id}
        name={weekName}
        editorTheme={editorTheme}
      />

      <Dialog
        visible={showBulkDeleteDialog}
        onHide={() => (bulkBusy ? null : setShowBulkDeleteDialog(false))}
        header={
          <div className="routineWeeksDialogHeader">
            <span className="routineWeeksDialogHeaderIcon"><Trash2 size={18} /></span>
            <div>
              <strong>Eliminar semanas seleccionadas</strong>
              <span>Esta accion no se puede deshacer</span>
            </div>
          </div>
        }
        className={`routineWeeksDialog routineWeeksTheme-${editorTheme}`}
        style={{ width: "90vw", maxWidth: 420 }}
        footer={
          <div className="routineWeeksDialogActions">
            <button
              type="button"
              className="routineWeeksDialogButton routineWeeksDialogButtonSecondary"
              disabled={bulkBusy}
              onClick={() => setShowBulkDeleteDialog(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="routineWeeksDialogButton routineWeeksDialogButtonDanger"
              disabled={bulkBusy || bulkDeleteConfirmText !== fraseDeConfirmacion}
              onClick={handleBulkDeleteConfirm}
            >
              {`Eliminar ${cantidadSemanas} ${palabraSemanas}`}
            </button>
          </div>
        }
      >
        <p className="mb-2">
          Estás a punto de eliminar <b>{selectedWeeks.length}</b> semana{selectedWeeks.length === 1 ? "" : "s"}. Esta acción no se puede deshacer.
        </p>
        <p className="mb-2 text-muted fs-sm">
          Escribe <b>"{fraseDeConfirmacion}"</b> para confirmar:
        </p>
        <input
          type="text"
          className="form-control"
          value={bulkDeleteConfirmText}
          onChange={(e) => setBulkDeleteConfirmText(e.target.value.toUpperCase())}
          placeholder={fraseDeConfirmacion}
          autoFocus
        />
      </Dialog>

      <Dialog
        visible={showBulkBlockChangeDialog}
        onHide={() => (bulkBusy ? null : setShowBulkBlockChangeDialog(false))}
        header={
          <div className="routineWeeksDialogHeader">
            <span className="routineWeeksDialogHeaderIcon"><Layers size={18} /></span>
            <div>
              <strong>Cambiar bloque de semanas</strong>
              <span>Cambio masivo de {selectedWeeks.length} semana{selectedWeeks.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        }
        className={`routineWeeksDialog routineWeeksTheme-${editorTheme}`}
        style={{ width: "90vw", maxWidth: 420 }}
        footer={
          <div className="routineWeeksDialogActions">
            <button
              type="button"
              className="routineWeeksDialogButton routineWeeksDialogButtonSecondary"
              disabled={bulkBusy}
              onClick={() => setShowBulkBlockChangeDialog(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="routineWeeksDialogButton routineWeeksDialogButtonPrimary"
              disabled={bulkBusy || bulkBlockChangeConfirmText !== "CONFIRMAR CAMBIO"}
              onClick={handleBulkBlockChangeConfirm}
            >
              Confirmar cambio
            </button>
          </div>
        }
      >
        <p className="mb-2">
          Vas a cambiar el bloque de <b>{selectedWeeks.length}</b> semana{selectedWeeks.length === 1 ? "" : "s"} a <b>{bulkBlockChangePending?.name || "Sin bloque"}</b>.
        </p>
        <p className="mb-2 text-muted fs-sm">
          Escribe <b>"CONFIRMAR CAMBIO"</b> para continuar:
        </p>
        <input
          type="text"
          className="form-control"
          value={bulkBlockChangeConfirmText}
          onChange={(e) => setBulkBlockChangeConfirmText(e.target.value.toUpperCase())}
          placeholder="CONFIRMAR CAMBIO"
          autoFocus
        />
      </Dialog>

      <Dialog
        header={blockPendingEdit ? "Editar bloque" : "Crear bloque"}
        visible={showBlockDialog}
        appendTo={document.body}
        className={`coachRoutineAuxDialog routineWeeksDialog routineWeeksTheme-${editorTheme} blocksManagerFormDialog`}
        style={{ width: "90vw", maxWidth: 420 }}
        onHide={() => {
          setShowBlockDialog(false);
          setBlockPendingEdit(null);
          refreshBlocks();
        }}
      >
        <BloquesForm
          id={trainer_id}
          editorTheme={editorTheme}
          isEditMode={!!blockPendingEdit}
          initialData={blockPendingEdit || {}}
          onSaved={async () => {
            setShowBlockDialog(false);
            setBlockPendingEdit(null);
            await refreshBlocks();
          }}
          onCancel={() => {
            setShowBlockDialog(false);
            setBlockPendingEdit(null);
          }}
        />
      </Dialog>

      {/* Dialogo de comentarios (rediseno de preview, ver UserRoutineEditPage.jsx) */}
      <Dialog
        header={
          <div className="routineWeeksDialogHeader">
            <span className="routineWeeksDialogHeaderIcon"><MessageSquareText size={18} /></span>
            <div>
              <strong>Comentarios de la semana</strong>
              <span>Dejale a tu alumno una devolucion general o dia por dia</span>
            </div>
          </div>
        }
        visible={showCommentsDialog}
        style={{ width: "760px", maxWidth: "95vw" }}
        className={`routineWeeksDialog routineWeeksWeekCommentsDialog routineWeeksTheme-${editorTheme}`}
        onHide={() => setShowCommentsDialog(false)}
        footer={
          <div className="routineWeeksDialogActions">
            <button
              type="button"
              className="routineWeeksDialogButton routineWeeksDialogButtonSecondary"
              onClick={() => setShowCommentsDialog(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="routineWeeksDialogButton routineWeeksDialogButtonPrimary"
              onClick={handleSaveComments}
            >
              Guardar
            </button>
          </div>
        }
      >
        <div className="routineWeeksFieldGroup mb-3">
          <label htmlFor="comments-title">Titulo</label>
          <InputText
            id="comments-title"
            value={commentsTitle}
            onChange={(e) => setCommentsTitle(e.target.value)}
            className="w-100"
            placeholder="Comentarios semanales"
          />
        </div>

        <div className="routineWeeksFieldGroup mb-3">
          <label htmlFor="comments-mode">Modo</label>
          <div className="routineWeeksSegmentedControl" id="comments-mode">
            <button
              type="button"
              className={commentsMode === "free" ? "is-active" : ""}
              onClick={() => setCommentsMode("free")}
            >
              Libre
            </button>
            <button
              type="button"
              className={commentsMode === "days" ? "is-active" : ""}
              onClick={() => setCommentsMode("days")}
            >
              Por dia
            </button>
          </div>
        </div>

        {commentsMode === "free" ? (
          <div className="routineWeeksFieldGroup">
            <label htmlFor="comments-body">Comentarios</label>
            <InputTextarea
              id="comments-body"
              value={commentsDescription}
              onChange={(e) => setCommentsDescription(e.target.value)}
              className="w-100"
              rows={5}
              autoResize
              placeholder="Escribi aqui los comentarios para tu alumno..."
            />
          </div>
        ) : (
          <div className="routineWeeksFieldGroup">
            <label>Comentarios por dia</label>
            {commentsDaysMeta.length ? (
              <div className="routineWeeksDayCommentsList">
                {commentsDaysMeta.map((d) => (
                  <div key={d._id} className="routineWeeksDayCommentRow">
                    <span className="routineWeeksDayCommentLabel">{d.label}</span>
                    <InputTextarea
                      value={commentsByDay[d._id] || ""}
                      onChange={(e) =>
                        setCommentsByDay((prev) => ({
                          ...prev,
                          [d._id]: e.target.value,
                        }))
                      }
                      className="w-100"
                      rows={1}
                      autoResize
                      placeholder={`Comentario para ${d.label}...`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="routineWeeksEmptyState">
                <span className="routineWeeksEmptyIcon"><Info size={18} /></span>
                <strong>Sin dias cargados</strong>
                <p>Esta semana no tiene dias cargados todavia.</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function getContrastYIQ(hexcolor) {
  if (!hexcolor) return "black";
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "black" : "white";
}
