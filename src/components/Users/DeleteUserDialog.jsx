import { useState } from 'react';

import * as UserService from './../../services/users.services'

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const DeleteUserDialog = ({ visible, onHide, user_id, name }) => {
  const [inputValue, setInputValue] = useState('');
  const isInputValid = inputValue === 'ELIMINAR';

  const handleAccept = () => {
    if (isInputValid) {

      UserService.deleteUser(user_id)
            .then(() => {
                onHide("delete");
            })
   
    }
  };

  const handleCancel = () => {
    setInputValue('');
    onHide();
  };

  return (
    <Dialog visible={visible} onHide={handleCancel} header={`Eliminar ${name}`}>
      <div className='row justify-content-center'>
        <div className='col-10 col-sm-6 mb-3'>
          <label htmlFor="inputDelete" className='text-center mb-4'>Por favor, escriba <b>"ELIMINAR"</b> si desea eliminar permanentemente el usuario.</label>
          <input
            id='inputDelete'
            type="text"
            className='form-control'
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </div>
        <div className='col-12 text-center'>
        <Button label="Cancelar" className="p-button-secondary m-3" onClick={handleCancel} />
          <Button
            label="Eliminar"
            className={isInputValid ? 'p-button-danger m-3' : 'p-button-secondary m-3'}
            disabled={!isInputValid}
            onClick={handleAccept}
          />

        </div>
      </div>
    </Dialog>
  );
};

export default DeleteUserDialog