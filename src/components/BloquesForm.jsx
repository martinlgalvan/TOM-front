// BloquesForm.jsx
import { useState, useEffect } from 'react'
import * as BlockService from '../services/blocks.services.js'

function BloquesForm({ isEditMode, initialData = {}, onSaved, onCancel, id }) {
  // Paleta clara: buen contraste con texto negro
  const PALETTE = [
    '#4ab8fdff', '#fd2f40ff', '#47e29fff', '#ffb01cff', '#9471f1ff',
    '#27c7e7ff', '#ff8521ff', '#99da29ff', '#ff338fff', `#9471f1ff`,
  ]

  const DEFAULT_FORM = { name: '', color: PALETTE[0] }

  const [form, setForm] = useState(DEFAULT_FORM)

  // 🔧 FIX: sincronizar modo/valores cada vez que cambian props
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
      onSaved && onSaved() // 🔧 refresca lista y cierra modal
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    try {
      await BlockService.deleteBlock(initialData._id)
      onSaved && onSaved() // 🔧 refresca lista y cierra modal
    } catch (e) {
      console.error(e)
    }
  }

  const inputStyle = { borderRadius: 12, padding: '10px 12px' }
  const colorGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 48px)',
    gap: 12,
  }
  const swatchStyle = (hex, selected) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    background: hex,
    border: 'none',
    cursor: 'pointer',
    boxShadow: selected
      ? '0 0 0 3px #fff, 0 0 0 6px #3b82f6'
      : '0 0 0 1px rgba(0,0,0,0.08)',
  })

  return (
    <div className="row justify-content-center">
      <div className="mb-3">
        <label className="form-label fw-semibold">Nombre</label>
        <input
          value={form.name}
          placeholder="Ej: Resistencia, Velocidad..."
          onChange={(e) => handleChange('name', e.target.value)}
          className="form-control text-dark"
          style={inputStyle}
        />
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold">Color</label>
        <div style={colorGridStyle} className="mt-1">
          {PALETTE.map((hex) => {
            const selected = form.color === hex
            return (
              <button
                key={hex}
                type="button"
                aria-label={`Elegir color ${hex}`}
                onClick={() => handleChange('color', hex)}
                style={swatchStyle(hex, selected)}
              />
            )
          })}
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-4">
        {isEditMode ? (
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            Eliminar
          </button>
        ) : (
          <button
            className="btn btn-link text-muted px-0"
            type="button"
            onClick={onCancel}            // 🔧 FIX: cerrar modal (no navegar)
          >
            Cancelar
          </button>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!form.name}
          style={{ minWidth: 140, borderRadius: 12, opacity: !form.name ? 0.6 : 1 }}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

export default BloquesForm
