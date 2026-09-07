import React from 'react';

import * as WeekService from './../../services/week.services.js';
import * as Notify from './../../helpers/notify.js'

import { Dialog } from 'primereact/dialog';
import { Trash2 } from 'lucide-react';



function DeleteWeek({ visible, onHide, week_id, name, onDelete, editorTheme = 'light' }) {

  const handleAccept = () => {
    Notify.notifyA("Eliminando semana...")

      WeekService.deleteWeek(week_id)
        .then(() => {
          onDelete()
          onHide('delete')
          Notify.updateToast()

        })

  };

  const handleCancel = () => {
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={
        <div className="routineWeeksDialogHeader">
          <span className="routineWeeksDialogHeaderIcon"><Trash2 size={18} /></span>
          <div>
            <strong>Eliminar semana</strong>
            <span>Esta acción no se puede deshacer</span>
          </div>
        </div>
      }
      className={`routineWeeksDialog routineWeeksTheme-${editorTheme}`}
      style={{ width: '90vw', maxWidth: 420 }}
      footer={
        <div className="routineWeeksDialogActions">
          <button type="button" className="routineWeeksDialogButton routineWeeksDialogButtonSecondary" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="button" className="routineWeeksDialogButton routineWeeksDialogButtonDanger" onClick={handleAccept}>
            Eliminar
          </button>
        </div>
      }
    >
      <p className="mb-0">?Estás seguro de eliminar <b>"{name}"</b>?</p>
    </Dialog>
  );
  }
export default DeleteWeek
