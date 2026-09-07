// ModalCreateMovility.jsx
import { MessageSquare } from 'lucide-react';
import { Fragment, useState, useEffect, useRef } from "react";

import * as WeekService from "../../services/week.services.js";
import * as Notify from "../../helpers/notify.js";
import * as RefreshFunction from "../../helpers/generateUUID.js";
import * as PARService from "../../services/par.services.js";

import CustomInputNumber from "../CustomInputNumber.jsx";
import AutoComplete from "../Autocomplete.jsx";

import { InputTextarea } from "primereact/inputtextarea";
import { OverlayPanel } from "primereact/overlaypanel";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import YouTubeIcon from "@mui/icons-material/YouTube";
import AddIcon from "@mui/icons-material/Add";

import options from "../../assets/json/options.json";

function ModalCreateMovility({ editAndClose, week, week_id, day_id, editorTheme = "light" , notesVisibility = "closed" }) {
  // Estado para el bloque de activacion
  // Misma logica de notas que en los ejercicios: el ajuste del editor decide
  // el estado inicial ('closed' | 'with-content' | 'open') y el entrenador
  // puede abrir o cerrar cada una con el boton de la celda.
  const [openNotesKey, setOpenNotesKey] = useState(null);
  const isNotesOpenFor = (notas, key) => {
    if (openNotesKey === key) return true;
    if (notesVisibility === "open") return true;
    if (notesVisibility === "with-content") return Boolean(String(notas ?? "").trim());
    return false;
  };

  const [movility, setMovility] = useState([]); // Copia local de la semana (con el bloque de activacion)
  const [movilityName, setMovilityName] = useState(""); // Nombre del bloque de activacion
  const [indexMovilityA, setIndexMovilityA] = useState(0); // Indice del dia en la semana en el que se crea el bloque
  const [modifiedMovility, setModifiedMovility] = useState([]); // Array donde se mantienen los cambios
  const inputRefs = useRef([]); // Para inputs no controlados
  const [groupedOptions, setGroupedOptions] = useState([]); // Opciones agrupadas a partir del JSON
  const productRefs = useRef([]); // Para manejar los OverlayPanel de video

  const [isEditing, setIsEditing] = useState(false);
  const [firstWidth, setFirstWidth] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  let idRefresh = RefreshFunction.generateUUID();

  // Agrupar las opciones provenientes del JSON (mismo comportamiento que en DayEditDetailsPage)
  useEffect(() => {
    const computedOptions = options.reduce((acc, group) => {
      acc.push({
        label: group.label,
        value: group.value,
        disabled: null,
      });
      acc.push(...group.items);
      return acc;
    }, []);
    setGroupedOptions(computedOptions);
  }, []);

  // Inicializar el bloque de activacion segun la semana y el dia
  useEffect(() => {
    if (Array.isArray(week)) {
      const index = week.findIndex((day) => String(day?._id) === String(day_id));
      const safeIndex = index >= 0 ? index : (week.length > 0 ? 0 : -1);
      setIndexMovilityA(safeIndex);
      const dayData = safeIndex >= 0 ? week[safeIndex] : null;
      // Si existe una propiedad "movilityName" en el dia se utiliza, sino se usa el nombre del dia o se asigna "Bloque de Activacion" por defecto.
      const name = dayData?.movilityName || dayData?.name || "Bloque de Activacion";
      setMovilityName(name);
      setModifiedMovility(week); // Guardamos la copia completa para trabajar sobre ella
      setMovility(week);
    } else {
      console.warn("La semana no esta disponible");
    }
  }, [week, day_id]);

  useEffect(() => {
    setFirstWidth(window.innerWidth);
  }, []);

  const hasValidMovilityDay =
    Number.isInteger(indexMovilityA) &&
    indexMovilityA >= 0 &&
    indexMovilityA < modifiedMovility.length;

  // Actualiza un valor de un ejercicio dentro del bloque de activacion
  const handleInputChange = (index, value, field) => {
    if (!hasValidMovilityDay) return;
    setIsEditing(true);
    const updatedMovility = [...modifiedMovility];
    // Se asume que en el objeto del dia se guarda un array "movility" con los ejercicios del bloque.
    updatedMovility[indexMovilityA].movility = updatedMovility[indexMovilityA].movility || [];
    if (!updatedMovility[indexMovilityA].movility[index]) return;
    updatedMovility[indexMovilityA].movility[index] = {
      ...updatedMovility[indexMovilityA].movility[index],
      [field]: value,
    };
    setModifiedMovility(updatedMovility);
    setMovility(updatedMovility);
  };

  // Funcion para aplicar y guardar los cambios
  const applyChanges = () => {
    if (!hasValidMovilityDay) {
      Notify.instantToast("No hay dia seleccionado para editar movilidad.");
      return;
    }
    const updatedMovility = [...modifiedMovility];
    // Actualizamos el nombre del bloque de activacion en el objeto del dia
    updatedMovility[indexMovilityA].movilityName = movilityName;
    WeekService.editWeek(week_id, updatedMovility)
      .then(() => {
        setMovility(updatedMovility);
        setIsEditing(false);
        editAndClose();
        Notify.instantToast("Guardado con exito");
      })
      .catch((error) => {
        console.error("Error al guardar cambios:", error);
      });
  };

  // Funcion para renderizar inputs segun el campo; se comporta de forma similar al del warmup
  const customInputEditMovility = (data, index, field) => {
    if (field === "numberMovility") {
      return (
        <Dropdown
          value={data || ""}
          options={groupedOptions}
          onChange={(e) => handleInputChange(index, e.target.value, field)}
          placeholder="Select an item"
          optionLabel="label"
          className="p-dropdown-group w-100"
        />
      );
    } else if (field === "name") {
      return (
        <AutoComplete
          defaultValue={data}
          ref={(el) =>
            (inputRefs.current[index] = { ...inputRefs.current[index], [field]: el })
          }
          onChange={(nombre, video) => {
            handleInputChange(index, nombre, field);
            /* Solo cuando viene de la biblioteca: al escribir a mano el segundo
               argumento es undefined y no hay que borrar un video ya cargado. */
            if (video !== undefined) handleInputChange(index, video, 'video');
          }}
        />
      );
    } else if (field === "sets" || field === "reps") {
      return (
        <div style={{ position: 'relative' }}>
          <CustomInputNumber
            initialValue={data}
            ref={(el) =>
              (inputRefs.current[index] = { ...inputRefs.current[index], [field]: el })
            }
            isNotNeedProp={true}
            onChange={(value) => handleInputChange(index, value, field)}
            isRep={field === "reps"}
            /* Estos bloques no usan series piramidales: solo texto/numerico. */
            allowMultiple={false}
            className="mt-5"
          />
        </div>
      );
    } else if (field === 'notas') {
      return (
        
          <InputTextarea
            ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
            className={'w-100'}
            autoResize
            defaultValue={data}
            onChange={(e) => handleInputChange(index, e.target.value, field)}
          />
        
      );
    } else if (field === 'video') {
      return (
        <>
          <IconButton
            aria-label="video"
            className="w-100"
            onClick={(e) => {
              productRefs.current[index].toggle(e);
            }}
          >
            <YouTubeIcon className="colorIconYoutube" />
          </IconButton>
          <OverlayPanel ref={(el) => (productRefs.current[index] = el)} className="dayEditLightOverlayPanel">
            <input
              ref={(el) =>
                (inputRefs.current[index] = { ...inputRefs.current[index], [field]: el })
              }
              className="form-control ellipsis-input text-center"
              type="text"
              defaultValue={data}
              onChange={(e) => handleInputChange(index, e.target.value, field)}
            />
          </OverlayPanel>
        </>
      );
    } else {
      return (
        <input
          ref={(el) =>
            (inputRefs.current[index] = { ...inputRefs.current[index], [field]: el })
          }
          className="form-control text-center"
          type="text"
          defaultValue={data}
          onChange={(e) => handleInputChange(index, e.target.value, field)}
        />
      );
    }
  };

  // Funcion para agregar un nuevo ejercicio al bloque de activacion
  const addNewMovilityExercise = () => {
    if (!hasValidMovilityDay) {
      Notify.instantToast("No hay dia seleccionado para agregar movilidad.");
      return;
    }
    setIsEditing(true);
    const updatedMovility = [...modifiedMovility];
    if (!updatedMovility[indexMovilityA].movility) {
      updatedMovility[indexMovilityA].movility = [];
    }
    const nextNumberExercise = updatedMovility[indexMovilityA].movility.length + 1;
    const newExercise = {
      movility_id: generateUUID(),
      numberMovility: nextNumberExercise,
      name: "",
      sets: 1,
      reps: 1,
      peso: "",
      video: "",
      notas: "",
    };
    updatedMovility[indexMovilityA].movility.push(newExercise);
    inputRefs.current.push({});
    setModifiedMovility(updatedMovility);
    setMovility(updatedMovility);
  };

  // Funcion para generar un UUID
  const generateUUID = () => {
    let d = new Date().getTime();
    let uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  };

  // Funcion para confirmar la eliminacion de un ejercicio
  const deleteMovility = (event, index, name) => {
    confirmDialog({
      className: `coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${editorTheme}`,
      message: "Estas seguro de que deseas eliminar este ejercicio?",
      header: "Confirmacion",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Si, eliminar",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: () => acceptDeleteMovility(index),
    });
  };

  const acceptDeleteMovility = (index) => {
    if (!hasValidMovilityDay) return;
    Notify.instantToast();
    setIsEditing(true);
    const updatedMovility = [...modifiedMovility];
    const blockToEdit = updatedMovility[indexMovilityA];
    if (blockToEdit && blockToEdit.movility) {
      blockToEdit.movility = blockToEdit.movility.filter((_, i) => i !== index);
    }
    inputRefs.current = inputRefs.current.filter((_, i) => i !== index);
    setModifiedMovility(updatedMovility);
    setMovility(updatedMovility);
  };

  const confirmCancel = () => {
    setShowCancelDialog(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    editAndClose();
  };

  return (
    <div className={`coachRoutineAuxEditor coachRoutineAuxEditor-${editorTheme}`}>
      <section className="coachRoutineAuxToolbar">
        <article>
          <div className="text-start">
            <IconButton
              aria-label="Añadir ejercicio"
              className="coachRoutineAuxAddBtn"
              onClick={addNewMovilityExercise}
            >
              <AddIcon />
              <span className="font-icons me-1">Añadir ejercicio</span>
            </IconButton>
          </div>
        </article>
      </section>

      {modifiedMovility && modifiedMovility.length > 0 && (
        <article className="table-responsive coachRoutineAuxTableShell text-center altoTable ">
          <table className="table table-hover align-middle text-center pb-5 coachRoutineAuxTable">
            <colgroup>
              <col className="coachRoutineAuxColNumber" />
              <col className="coachRoutineAuxColName" />
              <col className="coachRoutineAuxColMetric" />
              <col className="coachRoutineAuxColMetric" />
              <col className="coachRoutineAuxColPeso" />
              <col className="coachRoutineAuxColIcon" />
              <col className="coachRoutineAuxColNotes" />
              <col className="coachRoutineAuxColAction" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Ejercicio</th>
                <th>Series</th>
                <th>Reps</th>
                <th>Peso</th>
                <th>Video</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modifiedMovility[indexMovilityA]?.movility &&
                modifiedMovility[indexMovilityA].movility.map((item, index) => (
                  <Fragment key={item.movility_id || index}>
                    {/* La fila se marca cuando tiene las notas abiertas: asi el CSS
                        le saca el borde inferior. Las notas son parte de ESTE
                        ejercicio; la linea solo separa un ejercicio del siguiente. */}
                    <tr className={`coachRoutineAuxExerciseRow ${isNotesOpenFor(item.notas, item.movility_id || index) ? "hasOpenNotes" : ""}`}>
                    <td>
                      {customInputEditMovility(
                        item.numberMovility,
                        index,
                        "numberMovility"
                      )}
                    </td>
                    <td>
                      {customInputEditMovility(item.name, index, "name")}
                    </td>
                    <td>
                      {customInputEditMovility(item.sets, index, "sets")}
                    </td>
                    <td>
                      <div className="marginRepsNew">{customInputEditMovility(item.reps, index, "reps")}</div>
                    </td>
                    <td>
                      {customInputEditMovility(item.peso, index, "peso")}
                    </td>
                    <td>
                      {customInputEditMovility(item.video, index, "video")}
                    </td>
                    <td className="coachRoutineAuxNotesCell">
                      <div className={`coachRoutineAuxNotesWrap ${String(item.notas ?? "").trim() ? "has-notes" : ""} ${isNotesOpenFor(item.notas, item.movility_id || index) ? "is-open" : ""}`}>
                        <button
                          type="button"
                          className="coachRoutineAuxNotesTrigger"
                          aria-label="Ver o editar notas"
                          title="Notas"
                          onClick={(event) => {
                            event.stopPropagation();
                            const k = item.movility_id || index;
                            setOpenNotesKey((cur) => (cur === k ? null : k));
                          }}
                        >
                          <MessageSquare size={15} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <IconButton
                        aria-label="video"
                        className="styleButtonsEdit rounded-0"
                        onClick={(e) => deleteMovility(e, index, item.name)}
                      >
                        <CancelIcon className="bbbbb" />
                      </IconButton>
                    </td>
                  </tr>
                  {/* Las notas se abren en su PROPIA fila debajo, igual que en los
                      ejercicios. Antes iban al lado del boton, dentro de la celda,
                      lo que apretaba la columna y no coincidia con el resto. */}
                  {isNotesOpenFor(item.notas, item.movility_id || index) && (
                    <tr className="coachRoutineAuxNotesRow" key={`notas-${item.movility_id || index}`}>
                      {/* UNA sola celda a todo el ancho. Antes eran tres —dos
                          vacias a los costados— y el campo arrancaba corrido a la
                          derecha en vez de empezar por la izquierda. */}
                      <td colSpan={8} className="coachRoutineAuxNotesRowCell">
                        <span className="coachRoutineAuxNotesRowTitle">Notas</span>
                        {customInputEditMovility(item.notas, index, "notas")}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </article>
      )}

      {isEditing && (
        <div className="floating-button-mobile-warmup index-up">
          <button className="btn colorCancel p-4 my-3" onClick={editAndClose}>
            Continuar editando
          </button>
        </div>
      )}

      <ConfirmDialog
        visible={showCancelDialog}
        onHide={() => setShowCancelDialog(false)}
        message="Estas seguro de que deseas cancelar los cambios? Se perderan todos los cambios no guardados."
        header="Confirmacion"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Si"
        rejectLabel="No"
        accept={handleCancel}
        reject={() => setShowCancelDialog(false)}
        className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${editorTheme}`}
      />

      <ConfirmDialog className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${editorTheme}`} />
    </div>
  );
}

export default ModalCreateMovility;


