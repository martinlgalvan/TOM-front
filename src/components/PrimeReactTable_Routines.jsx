import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [trainer_id, setTrainer_id] = useState(localStorage.getItem("_id"));

  useEffect(() => {
    BlockService.getBlocks(trainer_id).then(setBlocks);
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
    const backgroundColor = rowData?.block?.color || '#ffffff';
    const textColor = getContrastYIQ(backgroundColor);
    return (
      <Dropdown
        value={rowData.block?._id || null}
        className={`ms-1 borderDropdown rounded-3 ${textColor === 'white' ? 'colorDropdownBlocks' : 'colorDropdownBlocks2'}`}
        options={extendedBlockOptions}
        onChange={(e) => handleBlockDropdownChange(rowData._id, e.value)}
        optionLabel="name"
        optionValue="_id"
        dataKey="_id"
        itemTemplate={itemTemplate}
        placeholder="Seleccionar bloque"
        style={{
          width: '100%',
          backgroundColor: backgroundColor
        }}
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

  const actionsTemplate = (routine) => (
    <div>
      <Link className="LinkDays" to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}>
        <IconButton aria-label="edit" className="btn p-2 my-1">
          <SquarePen className="ms-1 text-dark" />
        </IconButton>
      </Link>
      <IconButton aria-label="copy" onClick={() => saveToLocalStorage(routine)} className="btn p-2 my-1">
        <Copy className="ms-1 text-dark" />
      </IconButton>
      <IconButton aria-label="delete" onClick={() => deleteWeek(routine._id, routine.name)} className="btn p-2 my-1">
        <CircleX className="ms-1 text-danger" />
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

  const extendedBlockOptions = [
    { name: 'Añadir/editar bloques', _id: 'add-new-block' },
    { name: 'Sin bloque', _id: null },
    ...blocks
  ];

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
        <Link className="LinkDays p-2 my-1 w-100" to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}>
          <b>{routine.name}</b>
        </Link>
      );
    } else if (id && e.field === "date") {
      return (
        <Link className="LinkDays p-2 my-1 w-100 text-center" to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}>
          <span className=" stylesDate text-center">{routine.created_at.fecha}</span>
        </Link>
      );
    } else if (id && e.field === "days") {
      return (
        <Link className="LinkDays p-2 my-1 w-100" to={`/routine/user/${id}/week/${routine._id}/day/${routine.routine[0]._id}/${username}`}>
          <span className="styleBadgeDays">{routine.routine.length}</span>
        </Link>
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

  return (
    <div className="row justify-content-center">
      <div className="col-12 mb-5">
        <DataTable
          className="usersListTable"
          paginator
          rows={8}
          value={routine}
          emptyMessage=" "
          scrollable={false}
        >
          {firstWidth > 568 && <Column body={blockDropdownTemplate} field="block" header="Bloque" />}
          <Column body={linksTemplate} field="name" header="Nombre" />
          {firstWidth > 568 && <Column body={linksTemplate} field="date" header="Fecha" />}
          {firstWidth > 568 && <Column body={linksTemplate} field="days" header="Días" />}
          <Column body={actionsTemplate} field="acciones" header="Acciones" />
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
