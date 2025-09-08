import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as RoutineService from "../services/week.services.js";
import * as BlockService from "../services/blocks.services.js";
import * as NotifyHelper from "../helpers/notify.js";

import DeleteWeek from "./DeleteActions/DeleteWeek.jsx";
import BlocksListPage from "./BlocksListPage.jsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { CircleX, Copy, MessageSquarePlus, MessageSquareText } from "lucide-react";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function PrimeReactTable_Routines({
  id,
  username,
  routine,
  setRoutine,
  copyRoutine,
}) {
  const [copyWeekStorage, setCopyWeekStorage] = useState();
  const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState();
  const [weekName, setWeekName] = useState("");
  const [week_id, setWeek_id] = useState("");
  const [firstWidth, setFirstWidth] = useState(window.innerWidth);
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [trainer_id] = useState(localStorage.getItem("_id"));

  // === Comentarios ===
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [commentsWeekId, setCommentsWeekId] = useState(null);
  const [commentsTitle, setCommentsTitle] = useState("Comentarios semanales");
  const [commentsDescription, setCommentsDescription] = useState("");
  const [commentsMode, setCommentsMode] = useState("free"); // "free" | "days"
  const [commentsDaysMeta, setCommentsDaysMeta] = useState([]); // [{_id,label}]
  const [commentsByDay, setCommentsByDay] = useState({}); // { [dayId]: text }

  const modeOptions = [
    { label: "Modo libre", value: "free" },
    { label: "Modo días", value: "days" },
  ];

  useEffect(() => {
    BlockService.getBlocks(trainer_id).then((raw) => {
      const normalized = raw.map((b) => ({
        ...b,
        _id: b._id.toString(),
      }));
      setBlocks(normalized);
    });
  }, [trainer_id]);

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
  }, [blocks.map((b) => b._id).join(",")]);

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
      { name: "Añadir/editar bloques", _id: "add-new-block" },
      { name: "Sin bloque", _id: null },
    ];
    const extra =
      currentBlock && !blocks.find((b) => b._id === currentBlock._id)
        ? [currentBlock]
        : [];
    return [...base, ...blocks, ...extra];
  };

  // Celda con el Dropdown de bloques
  const blockDropdownTemplate = (rowData) => {
    const blockId =
      rowData.block_id?.toString() || rowData.block?._id?.toString();
    const fromList = blocks.find((b) => b._id === blockId);
    const currentBlock =
      fromList || (rowData.block ? { ...rowData.block, _id: blockId } : null);

    const options = buildOptions(currentBlock);

    const backgroundColor = currentBlock?.color || "#ffffff";
    const textColor = getContrastYIQ(backgroundColor);

    // El dropdown no ocupa 100% para dejar márgenes clicables que sigan navegando
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "inline-block", width: "calc(100% - 12px)" }}
        >
          <Dropdown
            value={currentBlock?._id || null}
            options={options}
            dataKey="_id"
            optionLabel="name"
            optionValue="_id"
            placeholder="Seleccionar bloque"
            onChange={(e) => handleBlockDropdownChange(rowData._id, e.value)}
            style={{ width: "100%", backgroundColor }}
            className={`ms-1 borderDropdown rounded-3 ${
              textColor === "white"
                ? "colorDropdownBlocks"
                : "colorDropdownBlocks2"
            }`}
            itemTemplate={itemTemplate}
          />
        </div>
      </div>
    );
  };

  const handleAssignBlock = async (routineId, block) => {
    try {
      const payload = block === null ? { block: null } : block;
      await RoutineService.assignBlockToRoutine(routineId, payload);

      setRoutine((prev) =>
        prev.map((r) =>
          r._id === routineId
            ? {
                ...r,
                block: blocks.find((b) => b._id === block?._id) || null,
                block_id: block?._id || null,
              }
            : r
        )
      );

      NotifyHelper.instantToast("Bloque asignado con éxito");
    } catch (err) {
      console.error("Error actualizando bloque", err);
      NotifyHelper.instantToast("Error al guardar el bloque");
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

  const getVisibilityTooltip = (isHidden) =>
    isHidden
      ? "Al apretar este botón, volverás a mostrar esta semana al alumno. También, le aparecerá la fecha de cuando hiciste visible la rutina, no cuando la creaste. También, respetará el orden que vos ves en las semanas. Así tal cual, las verá tu alumno."
      : "Al apretar este botón, tu alumno no verá la rutina cargada. Sin embargo, podrás trabajar libremente sobre ella.";

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

  // === Abrir diálogo de comentarios ===
  const handleOpenComments = (row) => {
    setCommentsWeekId(row._id);
    setCommentsTitle(row.comments?.title || "Comentarios semanales");
    setCommentsDescription(row.comments?.description || "");

    // modo
    const initialMode = row.comments?.mode === "days" ? "days" : "free";
    setCommentsMode(initialMode);

    // meta de días (label por día)
    const daysMeta = (row.routine || []).map((d, idx) => ({
      _id: String(d._id),
      label: d?.name || d?.title || `Día ${idx + 1}`,
    }));
    setCommentsDaysMeta(daysMeta);

    // valores por día (si vienen del server)
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

      // update optimista (asignamos comments explícitamente)
      setRoutine((prev) =>
        prev.map((w) =>
          w._id === commentsWeekId ? { ...w, comments: payload.comments } : w
        )
      );

      setShowCommentsDialog(false);
      NotifyHelper.instantToast("Comentarios guardados con éxito");
    } catch (err) {
      console.error("Error guardando comentarios", err);
      NotifyHelper.instantToast("Error al guardar los comentarios");
    }
  };

  const actionsTemplate = (row) => {
    const currentVis = row.visibility || "visible";
    const isHidden = currentVis === "hidden";

    return (
      <div className="row text-start" onClick={(e) => e.stopPropagation()}>
        {/* Visibilidad */}
        <div className="col-10 col-lg-3 d-flex">
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
        <div className="col-10 col-lg-3 d-flex">
          <Tooltip
            arrow
            placement="top"
            title={
              <div style={{ maxWidth: 260, lineHeight: 1.2 }}>
                <strong>Agregar comentarios</strong>
                <div className="mt-1">
                  Esta sección permite agregar comentarios sobre la semana. Podés
                  usar modo libre o por día. Tu alumno lo verá antes de entrar a
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
        <div className="col-10 col-lg-3 d-flex">
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
        <div className="col-10 col-lg-3 d-flex">
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
      NotifyHelper.instantToast("Copiado con éxito!");
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

  const handleBlockDropdownChange = (weekId, value) => {
    if (value === "add-new-block") {
      setShowBlockDialog(true);
      return;
    }
    const selectedBlock = blocks.find((block) => block._id === value) || null;
    handleAssignBlock(weekId, selectedBlock);
  };

  // Nombre (celda navegable)
  const linksTemplate = (row, e) => {
    if (id && e.field === "name") {
      return (
        <div className="text-start ms-3">
          <Link
            className="LinkDays my-1 text-start"
            to={`/routine/user/${id}/week/${row._id}/day/${row.routine[0]._id}/${username}`}
            onClick={(e) => e.stopPropagation()}
          >
            <b>{row.name}</b>
          </Link>
          <span className="d-block fontSizeWeeks">Haz click para entrar</span>
        </div>
      );
    }
  };

  const itemTemplate = (option) => {
    if (option._id === "add-new-block") {
      return (
        <span className="d-flex align-items-center">
          <AddIcon fontSize="small" className="me-2" />
          {option.name}
        </span>
      );
    }
    return option.name;
  };

  // Últ. vez modificado + visible desde
  const modificationTemplate = (rowData) => {
    const fmtEntrenador = () => {
      const fecha = rowData.created_at?.fecha || "—";
      const hora = rowData.created_at?.hora || "";
      return `${fecha} ${hora}`.trim();
    };
    const fmtAlumno = () =>
      rowData.updated_user_at
        ? new Date(rowData.updated_user_at).toLocaleString()
        : "—";

    return (
      <div className="text-start">
        <div className="stylesDate mb-2 d-block">
          <strong className="small">Entrenador:</strong>
          <span className="ms-1 badgeFechas">{fmtEntrenador()}</span>
        </div>
        <div className="stylesDate d-block mb-2">
          <strong className="small">Alumno:</strong>
          <span className="ms-4 badgeFechas2">{fmtAlumno()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="row text-center justify-content-center">
      <div className="col-12 col-xxl-11">
        <DataTable
          className="usersListTable"
          paginator
          rows={8}
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
        >
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
              header="Últ. vez modificado"
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
      />

      <Dialog
        header="Gestión de bloques"
        visible={showBlockDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowBlockDialog(false)}
      >
        <BlocksListPage id={trainer_id} />
      </Dialog>

      {/* Diálogo de comentarios */}
      <Dialog
        header="Comentarios de la semana"
        visible={showCommentsDialog}
        style={{ width: "760px", maxWidth: "95vw" }}
        onHide={() => setShowCommentsDialog(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button
              label="Cancelar"
              className="p-button-text"
              onClick={() => setShowCommentsDialog(false)}
            />
            <Button label="Guardar" onClick={handleSaveComments} />
          </div>
        }
      >
        {/* Título + Modo (select al lado) */}
        <div className="row g-3 align-items-end mb-3">
          <div className="col-12 col-md">
            <label htmlFor="comments-title" className="form-label d-block mb-2">
              Título
            </label>
            <InputText
              id="comments-title"
              value={commentsTitle}
              onChange={(e) => setCommentsTitle(e.target.value)}
              className="w-100 text-dark"
              placeholder="Comentarios semanales"
            />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="comments-mode" className="form-label d-block mb-2">
              Modo
            </label>
            <Dropdown
              id="comments-mode"
              value={commentsMode}
              options={modeOptions}
              optionLabel="label"
              optionValue="value"
              className="w-100"
              onChange={(e) => setCommentsMode(e.value)}
            />
          </div>
        </div>

        {/* Contenido según modo */}
        {commentsMode === "free" ? (
          <div>
            <label htmlFor="comments-body" className="form-label d-block mb-2">
              Comentarios
            </label>
            <InputTextarea
              id="comments-body"
              value={commentsDescription}
              onChange={(e) => setCommentsDescription(e.target.value)}
              className="w-100 text-dark"
              rows={5}
              autoResize
              placeholder="Escribí aquí los comentarios para tu alumno…"
            />
          </div>
        ) : (
          <div className="d-grid gap-1">
            {commentsDaysMeta.length ? (
              commentsDaysMeta.map((d) => (
                <div key={d._id} className="shadow-1">
                  <div className="mb-2 fw-semibold">{d.label}</div>
                  <InputTextarea
                    value={commentsByDay[d._id] || ""}
                    onChange={(e) =>
                      setCommentsByDay((prev) => ({
                        ...prev,
                        [d._id]: e.target.value,
                      }))
                    }
                    className="w-100 text-dark"
                    rows={1}
                    autoResize
                    placeholder={`Comentario para ${d.label}…`}
                  />
                </div>
              ))
            ) : (
              <div className="text-muted">
                Esta semana no tiene días cargados todavía.
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
