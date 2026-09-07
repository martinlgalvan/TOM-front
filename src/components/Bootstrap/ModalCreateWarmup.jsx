import { MessageSquare } from 'lucide-react';
import { Fragment, useState, useEffect, useRef } from "react";

import * as WeekService from "../../services/week.services.js";
import * as Notify from "./../../helpers/notify.js";
import * as RefreshFunction from "./../../helpers/generateUUID.js";
import * as PARService from "../../services/par.services.js";

import CustomInputNumber from "../../components/CustomInputNumber.jsx";
import AutoComplete from "../../components/Autocomplete.jsx";

import { InputTextarea } from "primereact/inputtextarea";
import { OverlayPanel } from "primereact/overlaypanel";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import YouTubeIcon from "@mui/icons-material/YouTube";
import AddIcon from "@mui/icons-material/Add";

import options from "../../assets/json/options.json"; // Archivo JSON original

function ModalCreateWarmup({ isPAR, editAndClose, user_id, week, week_id, day_id, editorTheme = "light" , notesVisibility = "closed" }) {
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

  const [warmup, setWarmup] = useState([]);
  const [warmupName, setWarmupName] = useState([]);
  const [indexWarmupA, setIndexWarmupA] = useState(0);
  const [modifiedWarmup, setModifiedWarmup] = useState([]); // Array donde se copia la nueva rutina
  const inputRefs = useRef([]); // Para inputs no controlados
  const [filteredExercises, setFilteredExercises] = useState(null);
  const [exercisesDatabase, setExercisesDatabase] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [dataWeek, setDataweek] = useState(false); // Estado para el "Modo Edición"
  const [statusCancel, setStatusCancel] = useState(1); // Manejo de renderizado

  const [color, setColor] = useState(localStorage.getItem("color"));
  const [textColor, setColorButton] = useState(localStorage.getItem("textColor"));

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [firstWidth, setFirstWidth] = useState(); // Variables para las modales de PrimeReact

  // Nuevo estado para las opciones agrupadas, siguiendo la logica de DayEditDetailsPage
  const [groupedOptions, setGroupedOptions] = useState([]);

  let idRefresh = RefreshFunction.generateUUID();

  const productRefs = useRef([]); // Refs para manejar los videos de YouTube

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

  useEffect(() => {
    setExercisesDatabase(JSON.parse(localStorage.getItem("DATABASE_USER")) || []);
    if (Array.isArray(week)) {
      const indexWarmup = week.findIndex((day) => String(day?._id) === String(day_id));
      const safeIndex = indexWarmup >= 0 ? indexWarmup : (week.length > 0 ? 0 : -1);
      setIndexWarmupA(safeIndex);
      const dayData = safeIndex >= 0 ? week[safeIndex] : null;
      const warmupDayName = dayData?.name || "";
      setWarmupName(warmupDayName);
      setModifiedWarmup(week); // Array de objetos inicial (los ejercicios)
      setWarmup(week);
    } else {
      console.log("La semana o la rutina no están disponibles");
    }
  }, [week, day_id, statusCancel]);

  useEffect(() => {

    setFirstWidth(window.innerWidth);
  }, []);

  const hasValidWarmupDay =
    Number.isInteger(indexWarmupA) &&
    indexWarmupA >= 0 &&
    indexWarmupA < modifiedWarmup.length;

  // Funcion generica para manejar los cambios en los inputs
  const handleInputChange = (index, value, field) => {
    if (!hasValidWarmupDay) return;
    setIsEditing(true);
    const updatedWarmup = [...modifiedWarmup];
    updatedWarmup[indexWarmupA].warmup = updatedWarmup[indexWarmupA].warmup || [];
    if (!updatedWarmup[indexWarmupA].warmup[index]) return;
    updatedWarmup[indexWarmupA].warmup[index] = {
      ...updatedWarmup[indexWarmupA].warmup[index],
      [field]: value,
    };
    setModifiedWarmup(updatedWarmup);
    setWarmup(updatedWarmup);
  };

  const applyChanges = () => {
      if (!hasValidWarmupDay) {
        Notify.instantToast("No hay día seleccionado para editar warmup.");
        return;
      }
      WeekService.editWeek(week_id, modifiedWarmup)
        .then(() => {
          setWarmup(modifiedWarmup);
          setIsEditing(false);
          editAndClose();
          Notify.instantToast("Guardado con éxito");
        })
        .catch((error) => {
          console.error("Error al guardar cambios:", error);
        });
   
    /* else {
         // Logica para PAR en caso de ser necesario
       } */
  };

  // Funcion para renderizar los inputs, adaptada segun el campo
  const customInputEditWarmup = (data, index, field) => {
    if (field === "numberWarmup") {
      // Usamos el Dropdown de primereact con las opciones agrupadas
      return (
        <Dropdown
          value={data || ""}
          options={groupedOptions}
          onChange={(e) => handleInputChange(index, e.target.value, field)}
          placeholder="Seleccionar"
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
            /* Igual que en movilidad: undefined significa que lo estan tipeando
               a mano, no que el ejercicio se quedo sin video. */
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
            className={'margin-custom'}
          /> 
        </div>
      );
    } else if (field === "notas") {
      return (
        <div className='row'>
          <InputTextarea
            ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
            className={'w-100'}
            autoResize
            defaultValue={data}
            onChange={(e) => handleInputChange(index, e.target.value, field)}
          />
        </div>
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

  // Funcion para agregar un nuevo ejercicio de warmup
  const addNewWarmupExercise = () => {
    if (!hasValidWarmupDay) {
      Notify.instantToast("No hay día seleccionado para agregar warmup.");
      return;
    }
    setIsEditing(true);
    const updatedWarmup = [...modifiedWarmup];
    if (!updatedWarmup[indexWarmupA].warmup) {
      updatedWarmup[indexWarmupA].warmup = [];
    }
    const nextNumberExercise = updatedWarmup[indexWarmupA].warmup.length + 1;
    const newExercise = {
      warmup_id: generateUUID(),
      numberWarmup: nextNumberExercise,
      name: "",
      sets: 1,
      reps: 1,
      peso: "",
      video: "",
      notas: "",
    };
    updatedWarmup[indexWarmupA].warmup.push(newExercise);
    inputRefs.current.push({});
    setModifiedWarmup(updatedWarmup);
    setWarmup(updatedWarmup);
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

  // Funcion para confirmar eliminacion
  const deleteWarmup = (event, index, name) => {
    confirmDialog({
      className: `coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${editorTheme}`,
      message: "Estás seguro de que deseas eliminar este ejercicio?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Si, eliminar",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: () => acceptDeleteWarmup(index),
    });
  };

  const acceptDeleteWarmup = (index) => {
    if (!hasValidWarmupDay) return;
    Notify.instantToast(); // Notificar al eliminar
    setIsEditing(true);
    const updatedWarmup = [...modifiedWarmup];
    const warmupToEdit = updatedWarmup[indexWarmupA];
    if (warmupToEdit && warmupToEdit.warmup) {
      warmupToEdit.warmup = warmupToEdit.warmup.filter((_, i) => i !== index);
    }
    inputRefs.current = inputRefs.current.filter((_, i) => i !== index);
    setModifiedWarmup(updatedWarmup);
    setWarmup(updatedWarmup);
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
          <div>
            <IconButton
              aria-label="Añadir ejercicio"
              className="coachRoutineAuxAddBtn"
              onClick={() => addNewWarmupExercise()}
            >
              <AddIcon className="" />
              <span className="font-icons me-1">Añadir ejercicio</span>
            </IconButton>
          </div>
        </article>
      </section>

      

      {modifiedWarmup && modifiedWarmup.length > 0 && (
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
              {modifiedWarmup[indexWarmupA]?.warmup &&
                modifiedWarmup[indexWarmupA].warmup.map((item, index) => (
                  <Fragment key={item.warmup_id || index}>
                    {/* La fila se marca cuando tiene las notas abiertas: asi el CSS
                        le saca el borde inferior. Las notas son parte de ESTE
                        ejercicio; la linea solo separa un ejercicio del siguiente. */}
                    <tr className={`coachRoutineAuxExerciseRow ${isNotesOpenFor(item.notas, item.warmup_id || index) ? "hasOpenNotes" : ""}`}>
                    <td>{customInputEditWarmup(item.numberWarmup, index, "numberWarmup")}</td>
                    <td>{customInputEditWarmup(item.name, index, "name")}</td>
                    <td>{customInputEditWarmup(item.sets, index, "sets")}</td>
                    <td >
                      <div className="marginRepsNew">
                        {customInputEditWarmup(item.reps, index, "reps")}
                      </div>
                    </td>
                    <td>{customInputEditWarmup(item.peso, index, "peso")}</td>
                    <td>{customInputEditWarmup(item.video, index, "video")}</td>
                    <td className="coachRoutineAuxNotesCell">
                      <div className={`coachRoutineAuxNotesWrap ${String(item.notas ?? "").trim() ? "has-notes" : ""} ${isNotesOpenFor(item.notas, item.warmup_id || index) ? "is-open" : ""}`}>
                        <button
                          type="button"
                          className="coachRoutineAuxNotesTrigger"
                          aria-label="Ver o editar notas"
                          title="Notas"
                          onClick={(event) => {
                            event.stopPropagation();
                            const k = item.warmup_id || index;
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
                        onClick={(e) => deleteWarmup(e, index, item.name)}
                      >
                        <CancelIcon className="bbbbb" />
                      </IconButton>
                    </td>
                  </tr>
                  {/* Las notas se abren en su PROPIA fila debajo, igual que en los
                      ejercicios. Antes iban al lado del boton, dentro de la celda,
                      lo que apretaba la columna y no coincidia con el resto. */}
                  {isNotesOpenFor(item.notas, item.warmup_id || index) && (
                    <tr className="coachRoutineAuxNotesRow" key={`notas-${item.warmup_id || index}`}>
                      {/* UNA sola celda a todo el ancho. Antes eran tres —dos
                          vacias a los costados— y el campo arrancaba corrido a la
                          derecha en vez de empezar por la izquierda. */}
                      <td colSpan={8} className="coachRoutineAuxNotesRowCell">
                        <span className="coachRoutineAuxNotesRowTitle">Notas</span>
                        {customInputEditWarmup(item.notas, index, "notas")}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </article>
      )}


      {isEditing  && (
        <div className="floating-button-mobile-warmup index-up">
          <button className="btn colorCancel p-4 my-3" onClick={() => editAndClose()}>
            Continuar editando
          </button>
        </div>
      )}

      <ConfirmDialog
        visible={showCancelDialog}
        onHide={() => setShowCancelDialog(false)}
        message="Estás seguro de que deseas cancelar los cambios? Se perderan todos los cambios no guardados."
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Si"
        rejectLabel="No"
        accept={() => handleCancel()}
        reject={() => setShowCancelDialog(false)}
        className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${editorTheme}`}
      />

      <ConfirmDialog className={`coachConfirmDialog dayEditUtilityConfirmDialog dayEditEditorTheme-${editorTheme}`} />
    </div>
  );
}

export default ModalCreateWarmup;


