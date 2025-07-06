import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as BlockService from '../services/blocks.services.js'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import BloquesForm from './BloquesForm.jsx'

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';

function BlocksListPage(id) {
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState([])
  const [editData, setEditData] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [firstWidth, setFirstWidth] = useState();
  const [showBlockForm, setShowBlockForm] = useState();

  useEffect(() => {

    setFirstWidth(window.innerWidth);
    BlockService.getBlocks(id.id).then((data) => {
      setBlocks(data)
    })
  }, [id.id])

  const handleEdit = (block) => {
    setEditData(block)
    setShowForm(true)
  }

  const handleSave = () => {
    setShowForm(false)
    setEditData(null)

    BlockService.getBlocks(id.id).then(setBlocks)
  }

  const handleOnHide = () => {
    setShowForm(false)
    setEditData(null)

  }


  const getContrastYIQ = (hexcolor) => {
    if (!hexcolor || typeof hexcolor !== 'string') return 'black';
  
    hexcolor = hexcolor.replace('#', '');
  
    if (hexcolor.length !== 6) {
      // Color inválido, devolvemos negro como fallback
      return 'black';
    }
  
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
  
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
    return yiq >= 150 ? 'black' : 'white'; // 🔥 Cambié el umbral a 150, que es más correcto visualmente
  };


  return (
    <div className="">
      <span className='styleInputsSpan ms-5 ps-1'>Bloques de entrenamiento</span>
      <div className="row justify-content-center text-center">
        {blocks.map((block) => {
          const backgroundColor = block.color || '#eeeeee';
          const textColor = getContrastYIQ(backgroundColor);
        
          return (
            <button
              key={block._id}
              className="rounded shadow col-3 m-2 py-2 "
              style={{
                backgroundColor
              }}
              onClick={() => handleEdit(block)}
            >
              <p className='m-auto align-center align-middle align-self'>
                <strong 
                  style={{
                  color: textColor
                }}>
                  {block.name}</strong>
              </p>
            </button>
          );
        })}

        <button
          className="btn btn-outline-light col-8 mx-5 mt-4 text-center rounded shadow"
          onClick={() => setShowForm(true)}
        >
          <AddIcon /> <span>Añadir bloque</span>
        </button>
      </div>

      <Dialog header={`${editData ? 'Editar bloque' : 'Crear bloque'}`} visible={showForm} style={{ width: `${firstWidth > 992 ? '25vw' : '75vw'}` }} onHide={() => handleOnHide(false)}>

            <BloquesForm
              id={id.id}
              isEditMode={editData}
              initialData={editData}
              onSaved={handleSave}
            />

      </Dialog>
    </div>
  )
}

export default BlocksListPage
