// BloquesForm.jsx
import { useState, useEffect } from 'react'
import * as BlockService from '../services/blocks.services.js'

function BloquesForm({ isEditMode, initialData = {}, onSaved, onCancel, id, editorTheme = 'light' }) {
  // Paleta clara: buen contraste con texto negro
  const PALETTE = [
    '#4ab8fdff', '#fd2f40ff', '#47e29fff', '#ffb01cff', '#9471f1ff',
    '#27c7e7ff', '#ff8521ff', '#99da29ff', '#ff338fff', '#9471f1ff',
  ]

  const DEFAULT_FORM = { name: '', color: PALETTE[0] }

  const [form, setForm] = useState(DEFAULT_FORM)

  // - FIX: sincronizar modo/valores cada vez que cambian props
  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        name: initialData.name || '',
        color: initialData.color || PALETTE[0],
      })
    } else {
      setForm(DEFAULT_FORM) // reset al entrar a "crear"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, initialData])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name) return
    try {
      if (isEditMode) {
        await BlockService.updateBlock(initialData._id, form)
      } else {
        await BlockService.createBlock(id, form)
      }
      onSaved && onSaved() // - refresca lista y cierra modal
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    try {
      await BlockService.deleteBlock(initialData._id)
      onSaved && onSaved() // - refresca lista y cierra modal
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className={`blocksForm blocksForm-${editorTheme}`}>
      <div className="blocksFormField">
        <label>Nombre</label>
        <input
          value={form.name}
          placeholder="Ej: Resistencia, Velocidad..."
          onChange={(e) => handleChange('name', e.target.value)}
          className="form-control blocksFormInput"
        />
      </div>

      <div className="blocksFormField">
        <label>Color</label>
        <div className="blocksFormPalette">
          {/* La key lleva la posicion porque el color no alcanza: la paleta
              repite #9471f1ff y React avisaba por la clave duplicada. */}
          {PALETTE.map((hex, posicion) => {
            const selected = form.color === hex
            return (
              <button
                key={`${hex}-${posicion}`}
                type='button'
                aria-label={`Elegir color ${hex}`}
                onClick={() => handleChange('color', hex)}
                className={`blocksFormSwatch ${selected ? 'is-selected' : ''}`}
                style={{ '--blocks-form-swatch': hex }}
              />
            )
          })}
        </div>
      </div>

      <div className='blocksFormActions'>
        {isEditMode ? (
          <button className="blocksFormButton blocksFormButtonDanger" onClick={handleDelete}>
            Eliminar
          </button>
        ) : (
          <button
            className="blocksFormButton blocksFormButtonGhost"
            type="button"
            onClick={onCancel}            // - FIX: cerrar modal (no navegar)
          >
            Cancelar
          </button>
        )}

        <button
          className="blocksFormButton blocksFormButtonPrimary"
          onClick={handleSubmit}
          disabled={!form.name}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

export default BloquesForm
