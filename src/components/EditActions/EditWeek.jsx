import { useState, useEffect } from 'react';

import * as WeekService from '../../services/week.services.js';
import * as Notify from '../../helpers/notify.js'

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';



function EditWeek({ visible, onHide, week_id, defaultName }) {

  const [name, setName] = useState("")
  const [color, setColor] = useState(localStorage.getItem('color'))
  const [textColor, setColorButton] = useState(localStorage.getItem('textColor'))

  function changeName(e){
      setName(e.target.value)
  }

  function onSubmit(e){
    e.preventDefault()
    Notify.notifyA("Editando semana...")

    WeekService.editWeek(week_id, {name})
      .then(() => {
        onHide('edit')
      })
    }

  const handleCancel = () => {
    onHide();
  };

  return (

    <Dialog visible={visible} onHide={handleCancel} header={`Editar ${defaultName}`}>
      <div className='row justify-content-center'>

      <form onSubmit={onSubmit} >

          <input onChange={changeName} className="form-control " type="text" name="name" id="name" defaultValue={defaultName} placeholder="Nombre"/>

      </form>

        <div className='col-12 text-center mt-4'>
          <button className="btn buttonCancelDialog me-2" onClick={handleCancel}>Cancelar</button>
          <button className={`btn ${textColor == 'false' ? "bbb" : "blackColor"} ms-2`} style={{ "backgroundColor": `${color}` }} onClick={onSubmit}>Editar</button>
        </div>

      </div>
    </Dialog>
    
  );
  }
export default EditWeek