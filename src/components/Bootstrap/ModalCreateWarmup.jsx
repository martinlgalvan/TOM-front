import { useState, useEffect, useRef } from "react";

import * as WeekService from "../../services/week.services.js";
import * as WarmupServices from "../../services/warmup.services.js";
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

function ModalCreateWarmup({ isPAR, editAndClose, user_id, week, week_id, day_id }) {
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

  // Nuevo estado para las opciones agrupadas, siguiendo la lógica de DayEditDetailsPage
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
    if (week) {
      const indexWarmup = week.findIndex((day) => day._id === day_id);
      setIndexWarmupA(indexWarmup);
      const dayData = week[indexWarmup];
      const warmupDayName = dayData?.name || "";
      setWarmupName(warmupDayName);
      setModifiedWarmup(week); // Array de objetos inicial (los ejercicios)
      setWarmup(week);
    } else {
      console.warn("La semana o la rutina no están disponibles");
    }
  }, [week, day_id, statusCancel]);

  useEffect(() => {

    setFirstWidth(window.innerWidth);
  }, []);

  // Función genérica para manejar los cambios en los inputs
  const handleInputChange = (index, value, field) => {
    setIsEditing(true);
    const updatedWarmup = [...warmup];
    updatedWarmup[indexWarmupA].warmup[index] = {
      ...updatedWarmup[indexWarmupA].warmup[index],
      [field]: value,
    };
    setModifiedWarmup(updatedWarmup);
  };

  const applyChanges = () => {
    console.log(week_id, modifiedWarmup)
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
         // Lógica para PAR en caso de ser necesario
       } */
  };

  // Función para renderizar los inputs, adaptada según el campo
  const customInputEditWarmup = (data, index, field) => {
    if (field === "numberWarmup") {
      // Usamos el Dropdown de primereact con las opciones agrupadas
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
          onChange={(e) => handleInputChange(index, e, field)}
        />
      );
    } else if (field === "sets" || field === "reps") {
      return (
        <CustomInputNumber
          initialValue={data}
          ref={(el) =>
            (inputRefs.current[index] = { ...inputRefs.current[index], [field]: el })
          }
          onChange={(value) => handleInputChange(index, value, field)}
          isRep={field === "reps"}
          className={`margin-custom`}
        />
      );
    } else if (field === "notas") {
      return (
        <div className="row">
          <InputTextarea
            ref={(el) => (inputRefs.current[`${index}-${field}`] = el)}
            className={`textAreaResize ${firstWidth < 600 && "col-11"}`}
            autoResize
            defaultValue={data}
            onChange={(e) => handleInputChange(index, e.target.value, field)}
          />
        </div>
      );
    } else if (field === "video") {
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
          <OverlayPanel ref={(el) => (productRefs.current[index] = el)}>
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

  // Función para agregar un nuevo ejercicio de warmup
  const addNewWarmupExercise = () => {
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
  };

  // Función para generar un UUID
  const generateUUID = () => {
    let d = new Date().getTime();
    let uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  };

  // Función para confirmar eliminación
  const deleteWarmup = (event, index, name) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas eliminar el warmup "${name}"?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: () => acceptDeleteWarmup(index),
    });
  };

  const acceptDeleteWarmup = (index) => {
    Notify.instantToast(); // Notificar al eliminar
    setIsEditing(true);
    const updatedWarmup = [...modifiedWarmup];
    const warmupToEdit = updatedWarmup[indexWarmupA];
    if (warmupToEdit && warmupToEdit.warmup) {
      warmupToEdit.warmup = warmupToEdit.warmup.filter((_, i) => i !== index);
    }
    inputRefs.current = inputRefs.current.filter((_, i) => i !== index);
    setModifiedWarmup(updatedWarmup);
  };

  const confirmCancel = () => {
    setShowCancelDialog(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    editAndClose();
  };

  const tableMobile = () => {
    return (
      <div className="table-responsiveCss">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Peso</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Rest</th>
              <th>Video</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {modifiedWarmup[indexWarmupA] &&
              modifiedWarmup[indexWarmupA].warmup &&
              modifiedWarmup[indexWarmupA].warmup.map((exercise, i) => (
                <tr className="shadowCards" key={exercise.warmup_id}>
                  <td data-th="Nombre" className="text-center">
                    <AutoComplete
                      defaultValue={exercise.name}
                      onChange={(e) => handleInputChange(i, e, "name")}
                    />
                  </td>
                  <td data-th="Peso" className="text-center">
                    {customInputEditWarmup(exercise.peso, i, "peso")}
                  </td>
                  <td data-th="Sets" className="text-center">
                    {customInputEditWarmup(exercise.sets, i, "sets")}
                  </td>
                  <td data-th="Reps" className="text-center">
                    {customInputEditWarmup(exercise.reps, i, "reps")}
                  </td>
                  <td data-th="Rest" className="text-center">
                    {customInputEditWarmup(exercise.rest, i, "rest")}
                  </td>
                  <td data-th="Video" className="text-center">
                    {customInputEditWarmup(exercise.video, i, "video")}
                  </td>
                  <td data-th="Notas" className="text-center">
                    {customInputEditWarmup(exercise.notas, i, "notas")}
                  </td>
                  <td className="notStyle">
                    <div className="row justify-content-center">
                      <div className="col-6">
                        <Dropdown
                          value={exercise.numberWarmup}
                          options={groupedOptions}
                          onChange={(e) =>
                            handleInputChange(i, e.target.value, "numberWarmup")
                          }
                          placeholder="Select an item"
                          optionLabel="label"
                          className="p-dropdown-group w-100"
                        />
                      </div>
                      <div className="col-6">
                        <IconButton
                          aria-label="video"
                          className="styleButtonsEdit rounded-0"
                          onClick={() => deleteWarmup(i, exercise.name)}
                        >
                          <CancelIcon className="bbbbb" />
                        </IconButton>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <section className="row justify-content-center ">
        <article className="col-10">
          <h2 className="text-center my-3">Entrada en calor - {warmupName}</h2>
          <div className="text-center mb-3">
            <IconButton
              aria-label="video"
              className="bgColor rounded-2 text-light me-2"
              onClick={() => addNewWarmupExercise()}
            >
              <AddIcon className="" />
              <span className="font-icons me-1">Añadir ejercicio</span>
            </IconButton>
          </div>
        </article>
      </section>

      {firstWidth > 993 && modifiedWarmup && modifiedWarmup.length > 0 ? (
        <article className="table-responsive-xxl border-bottom text-center altoTable ">
          <table className="table table-hover align-middle text-center pb-5">
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
              {modifiedWarmup[indexWarmupA].warmup &&
                modifiedWarmup[indexWarmupA].warmup.map((item, index) => (
                  <tr key={item.warmup_id}>
                    <td>{customInputEditWarmup(item.numberWarmup, index, "numberWarmup")}</td>
                    <td>{customInputEditWarmup(item.name, index, "name")}</td>
                    <td>{customInputEditWarmup(item.sets, index, "sets")}</td>
                    <td >
                      {customInputEditWarmup(item.reps, index, "reps")}
                    </td>
                    <td>{customInputEditWarmup(item.peso, index, "peso")}</td>
                    <td>{customInputEditWarmup(item.video, index, "video")}</td>
                    <td>{customInputEditWarmup(item.notas, index, "notas")}</td>
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
                ))}
            </tbody>
          </table>
        </article>
      ) : (
        tableMobile()
      )}

      {/*isEditing && !isPAR && (
                    <div className="floating-button-mobile index-up">
                      <button
                        className="px-5 btn colorCancel py-2 my-5"
                        onClick={() => applyChanges()}
                      >
                        Guardar
                      </button>
                      <button
                        className="px-5 btn colorRed  py-2 my-5"
                        onClick={() => confirmCancel()}
                      >
                        Cancelar
                      </button>
                  </div>

      )*/}

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
        message="¿Estás seguro de que deseas cancelar los cambios? Se perderán todos los cambios no guardados."
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Sí"
        rejectLabel="No"
        accept={() => handleCancel()}
        reject={() => setShowCancelDialog(false)}
      />
    </>
  );
}

export default ModalCreateWarmup;
