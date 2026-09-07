// BlocksListPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as BlockService from '../services/blocks.services.js'
import { Dialog } from 'primereact/dialog'
import BloquesForm from './BloquesForm.jsx'
import AddIcon from '@mui/icons-material/Add'

function BlocksListPage(props) {
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState([])
  const [editData, setEditData] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [firstWidth, setFirstWidth] = useState()

  // Soportar que props.id sea string o { id: string }
  const projectId = typeof props.id === 'string' ? props.id : props.id?.id
  const editorTheme = props.editorTheme || 'light'
  const initialEditBlock = props.initialEditBlock || null

  useEffect(() => {
    setFirstWidth(window.innerWidth)
    if (!projectId) return
    BlockService.getBlocks(projectId).then(setBlocks)
  }, [projectId])

  useEffect(() => {
    if (!initialEditBlock?._id) return
    setEditData(initialEditBlock)
    setShowForm(true)
  }, [initialEditBlock?._id])

  const handleEdit = (block) => {
    setEditData(block)
    setShowForm(true)
  }

  const handleAddNew = () => {
    // 🔧 FIX: limpiar editData antes de abrir para entrar en modo "crear"
    setEditData(null)
    setShowForm(true)
  }

  const refreshAndClose = async () => {
    setShowForm(false)
    setEditData(null)
    if (projectId) {
      const data = await BlockService.getBlocks(projectId)
      setBlocks(data)
    }
  }

  const handleOnHide = () => {
    setShowForm(false)
    setEditData(null)
  }

  return (
    <div className={`blocksManager blocksManager-${editorTheme}`}>
      <span className="styleInputsSpan ms-1 ps-1">Bloques de entrenamiento</span>

      <div className="blocksManagerListWrap">
        <div className="blocksManagerGrid">
          {blocks.map((block) => {
            const accentColor = block.color || '#9aa0a6'
            return (
              <div key={block._id} className="blocksManagerItem">
                <button
                  onClick={() => handleEdit(block)}
                  className="w-100 p-0 border-0 bg-transparent text-start"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="blocksManagerCard shadow-sm border rounded-4">
                    <div
                      style={{
                        height: 10,
                        backgroundColor: accentColor,
                        borderTopLeftRadius: '0.75rem',
                        borderTopRightRadius: '0.75rem',
                      }}
                    />
                    <div className="p-3">
                      <strong>{block.name}</strong>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="blocksManagerFooter">
        <button
          className="blocksManagerAddButton"
          onClick={handleAddNew}
          type="button"
        >
          <AddIcon className="me-2" />
          <span>Agregar bloque</span>
        </button>
      </div>

      <Dialog
        header={`${editData ? 'Editar bloque' : 'Crear bloque'}`}
        visible={showForm}
        style={{ width: `${firstWidth > 992 ? '25vw' : '75vw'}` }}
        className={`routineWeeksDialog routineWeeksTheme-${editorTheme} blocksManagerFormDialog`}
        onHide={handleOnHide}
      >
        <BloquesForm
          id={projectId}
          editorTheme={editorTheme}
          isEditMode={!!editData}          // 🔧 Enviar booleano
          initialData={editData || {}}     // 🔧 Evitar undefined
          onSaved={refreshAndClose}        // 🔧 Refresca y cierra modal
          onCancel={handleOnHide}          // 🔧 Cancelar = cerrar modal
        />
      </Dialog>
    </div>
  )
}

export default BlocksListPage
