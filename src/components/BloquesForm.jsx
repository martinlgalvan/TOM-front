// BloquesForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import * as BlockService from '../services/blocks.services.js'

function BloquesForm({ isEditMode, initialData = {}, onSaved, id }) {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    color: '#ffc107'
  })

  useEffect(() => {
    if (isEditMode && initialData) {
      setForm(initialData)
    }
  }, [isEditMode, initialData])

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async () => {
    if (isEditMode) {
      await BlockService.updateBlock(initialData._id, form)
        .then((data) => {
          onSaved()
        })
    } else {
      await BlockService.createBlock(id, form)
        .then((data) => {
          onSaved()
        })
    }
  }

    const handleDelete = async () => {

        await BlockService.deleteBlock(initialData._id)
          .then(data => {
          })

    }
      

  return (
    <div className="row justify-content-start ">
      <div className=' mb-3'>
        <label  class="form-label">Nombre</label>
        <InputText value={isEditMode && form.name} onChange={(e) => handleChange('name', e.target.value)} class="form-control" />
      </div>

      <div className='text-start '>
        <label className=' '>Color</label>
        <input type="color" class="form-control form-control-color" value={isEditMode && form.color} onChange={(e) => handleChange('color', e.target.value)} />
      </div>

      <div className='row justify-content-center mt-4'>
        <div className='col-4'><button className='btn btn-danger'  onClick={handleDelete} >Eliminar</button></div>
        <div className='col-4'><button className='btn BlackBGtextWhite'  onClick={handleSubmit} >Guardar</button></div>
      </div>

    </div>
  )
}

export default BloquesForm;
