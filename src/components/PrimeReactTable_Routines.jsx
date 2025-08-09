import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as RoutineService from "../services/week.services.js";
import * as BlockService from "../services/blocks.services.js";
import * as NotifyHelper from "../helpers/notify.js";
import * as RefreshFunction from "../helpers/generateUUID.js";

import DeleteWeek from "./DeleteActions/DeleteWeek.jsx";
import BlocksListPage from "./BlocksListPage.jsx";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from 'primereact/dialog';

import IconButton from "@mui/material/IconButton";
import { SquarePen, CircleX, Copy } from 'lucide-react';
import AddIcon from '@mui/icons-material/Add';

export default function PrimeReactTable_Routines({ id, username, routine, setRoutine, copyRoutine }) {
  const [copyWeekStorage, setCopyWeekStorage] = useState();
  const [showDeleteWeekDialog, setShowDeleteWeekDialog] = useState();
  const [weekName, setWeekName] = useState("");
  const [week_id, setWeek_id] = useState("");
  const [firstWidth, setFirstWidth] = useState(window.innerWidth);
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [trainer_id, setTrainer_id] = useState(localStorage.getItem("_id"));
  const [selectedProduct, setSelectedProduct] = useState(null);

useEffect(() => {
  BlockService.getBlocks(trainer_id)
    .then(raw => {
      // Normalizamos _id a string para usarlos como optionValue
      const normalized = raw.map(b => ({
        ...b,
        _id: b._id.toString()
      }));
      setBlocks(normalized);
    });
}, [id]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.id = 'dynamic-block-colors';

    let css = '';
    blocks.forEach(block => {
      if (block.color) {
        const className = `bg-${block.color.replace('#', '')}`;
        const textColor = getContrastYIQ(block.color);
        css += `.${className} { background-color: ${block.color} !important; color: ${textColor} !important; }\n`;
      }
    });

    styleTag.innerHTML = css;
    const existing = document.getElementById('dynamic-block-colors');
    if (existing) existing.remove();
    document.head.appendChild(styleTag);

    return () => {
      const cleanup = document.getElementById('dynamic-block-colors');
      if (cleanup) cleanup.remove();
    };
  }, [blocks.map(b => b._id).join(',')]);

    const buildOptions = (currentBlock) => {
    const base = [
      { name: 'Añadir/editar bloques', _id: 'add-new-block' },
      { name: 'Sin bloque',       _id: null },
    ];
    // Si el bloque actual no está aún en `blocks`, lo incluimos para que Dropdown
    // pueda emparejar el value con alguna opción.
    const extra = currentBlock && !blocks.find(b => b._id === currentBlock._id)
      ? [currentBlock]
      : [];
    return [...base, ...blocks, ...extra];
  };

  const handleAssignBlock = async (routineId, block) => {
  try {
    const payload = block === null ? { block: null } : block;
    await RoutineService.assignBlockToRoutine(routineId, payload);

    setRoutine(prev =>
      prev.map(r =>
        r._id === routineId
          ? { ...r, block: blocks.find(b => b._id === block?._id) || null }
          : r
      )
    );

    NotifyHelper.instantToast('Bloque asignado con éxito');
  } catch (err) {
    console.error('Error actualizando bloque', err);
    NotifyHelper.instantToast('Error al guardar el bloque');
  }
};

    const blockDropdownTemplate = (rowData) => {
    // Normalizamos primero el ID de bloque
    const blockId = rowData.block_id?.toString()
      || rowData.block?._id?.toString();
    // Buscamos siempre primero en nuestro array `blocks`
    const fromList = blocks.find(b => b._id === blockId);
    // Si no está (aún no cargado), caemos a rowData.block
    const currentBlock = fromList
      || (rowData.block ? { ...rowData.block, _id: blockId } : null);

    // Generamos las opciones para este Dropdown, incluyendo el bloque si hiciera falta
    const options = buildOptions(currentBlock);

    const backgroundColor = currentBlock?.color || '#ffffff';
    const textColor = getContrastYIQ(backgroundColor);

    return (
      <Dropdown
        value={currentBlock?._id || null}
        options={options}
        dataKey="_id"                     // clave única para emparejar correctamente
        optionLabel="name"
        optionValue="_id"
        placeholder="Seleccionar bloque"
        onChange={e => handleBlockDropdownChange(rowData._id, e.value)}
        style={{ width: '100%', backgroundColor }}
        className={`ms-1 borderDropdown rounded-3 ${
          textColor === 'white'
            ? 'colorDropdownBlocks'
            : 'colorDropdownBlocks2'
        }`}
        itemTemplate={itemTemplate}
      />
    );
  };

  const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return 'black';
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? 'black' : 'white';
  };

    const goToPage = (routine, day,) => {
      navigate(`/routine/user/${id}/week/${routine}/day/${day}/${username}`)
    };

  const actionsTemplate = (routine) => (
    <div className="row text-start">
        <IconButton aria-label="edit" className="btn col-4  " onClick={() => goToPage(routine._id,routine.routine[0]._id)}>
          <SquarePen className=" text-dark text-end" />
        </IconButton>
      <IconButton aria-label="copy" onClick={() => saveToLocalStorage(routine)} className="btn col-4 ">
        <Copy className=" text-dark" />
      </IconButton>
      <IconButton aria-label="delete" onClick={() => deleteWeek(routine._id, routine.name)} className="btn col-4 ">
        <CircleX className=" text-danger" />
      </IconButton>
    </div>
  );

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
    setRoutine((prevRoutine) => prevRoutine.filter(week => week._id !== week_id));
  };

  const hideDialog = () => {
    setShowDeleteWeekDialog(false);
  };

  const handleBlockDropdownChange = (weekId, value) => {
    if (value === 'add-new-block') {
      setShowBlockDialog(true);
      return;
    }
    const selectedBlock = blocks.find(block => block._id === value) || null;
    handleAssignBlock(weekId, selectedBlock);
  };

  const linksTemplate = (routine, e) => {
    if (id && e.field === "name") {
      return (
        <div className="text-start ms-3 ">
        <Link className="LinkDays my-1 text-start" to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}>
          <b>{routine.name}</b>
        </Link>
        <span className="d-block fontSizeWeeks">Haz click para entrar</span>
        </div>
      );
    }
   
  };

  const itemTemplate = (option) => {
    if (option._id === 'add-new-block') {
      return (
        <span className="d-flex align-items-center">
          <AddIcon fontSize="small" className="me-2" />
          {option.name}
        </span>
      );
    }
    return option.name;
  };

const modificationTemplate = (rowData) => {
  // Formatea ISO o, si no existe, usa created_at.fecha y hora
  const fmtEntrenador = () => {
    if (rowData.updated_at) {
      return new Date(rowData.updated_at).toLocaleString();
    }
    const fecha = rowData.created_at?.fecha || '—';
    const hora  = rowData.created_at?.hora  || '';
    return `${fecha} ${hora}`.trim();
  };

  // Para el alumno, mostramos updated_user_at o guión si no hay
  const fmtAlumno = () =>
    rowData.updated_user_at
      ? new Date(rowData.updated_user_at).toLocaleString()
      : '—';

  return (
    <div className="text-start">
      <div className="stylesDate mb-2 d-block">
        <strong className="small">Entrenador:</strong>
        <span className="ms-1 badgeFechas">{fmtEntrenador()}</span>
      </div>
      <div className="stylesDate d-block">
        <strong className="small">Alumno:</strong>
        <span className="ms-4 badgeFechas2">{fmtAlumno()}</span>
      </div>
    </div>
  );
};

  return (
    <div className="row text-center justify-content-center">
      <div className="col-12 col-xxl-10">
        <DataTable
          className="usersListTable"
          paginator
          rows={8}
          value={routine}
          emptyMessage=" "
          scrollable={false}
          selectionMode="single" selection={selectedProduct}
          onSelectionChange={(routine) => navigate(`/routine/user/${id}/week/${routine.value._id}/day/${routine.value.routine[0]._id}/${username}`)}
        >
          {firstWidth > 568 && <Column body={blockDropdownTemplate} style={{ width: '15%' }}  field="block" header="Bloque" />}
          <Column body={linksTemplate} field="name" header="Nombre" style={{ width: '40%' }}  />
          {firstWidth > 768 && (
            <Column 
              body={modificationTemplate} 
              header="Últ. vez modificado" 
              style={{ width: '30%' }} 
            />
          )}
          <Column  body={actionsTemplate} field="acciones" style={{ width: '15%' }}  header="Acciones"   />
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
        style={{ width: '50vw' }}
        onHide={() => setShowBlockDialog(false)}
      >
        <BlocksListPage id={trainer_id} />
      </Dialog>
    </div>
  );
}
