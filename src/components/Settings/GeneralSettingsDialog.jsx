import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Check, Type } from 'lucide-react';
import {
  applyFontSize,
  getGeneralSettings,
  saveGeneralSettings,
} from '../../helpers/generalSettings.js';

const FONT_OPTIONS = [
  { value: 'small', label: 'Pequena', sample: 'Aa', description: 'Mas contenido en pantalla' },
  { value: 'normal', label: 'Normal', sample: 'Aa', description: 'Equilibrada y comoda' },
  { value: 'large', label: 'Grande', sample: 'Aa', description: 'Mayor legibilidad' },
];

export default function GeneralSettingsDialog({ visible, onHide, trainerId, editorTheme = 'light' }) {
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    if (!visible) return;
    setFontSize(getGeneralSettings(trainerId).fontSize);
  }, [trainerId, visible]);

  const selectFontSize = (value) => {
    setFontSize(value);
    applyFontSize(value);
  };

  const closeWithoutSaving = () => {
    applyFontSize(getGeneralSettings(trainerId).fontSize);
    onHide();
  };

  const save = () => {
    saveGeneralSettings(trainerId, { fontSize });
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={closeWithoutSaving}
      header="Configuración general"
      className={`generalSettingsDialog generalSettingsDialog-${editorTheme}`}
      draggable={false}
    >
      <div className="generalSettingsSection">
        <div className="generalSettingsTitle">
          <span><Type size={17} /></span>
          <div>
            <h3>Tipografia</h3>
            <p>Elegí el tamaño de texto que te resulte más cómodo.</p>
          </div>
        </div>

        <div className="generalSettingsFontOptions" role="radiogroup" aria-label="Tamaño de tipografia">
          {FONT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={fontSize === option.value}
              className={fontSize === option.value ? 'isSelected' : ''}
              onClick={() => selectFontSize(option.value)}
            >
              <span className={`generalSettingsSample is-${option.value}`}>{option.sample}</span>
              <span className="generalSettingsOptionCopy">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
              <span className="generalSettingsCheck">{fontSize === option.value ? <Check size={14} /> : null}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="generalSettingsActions">
        <button type="button" className="generalSettingsCancel" onClick={closeWithoutSaving}>Cancelar</button>
        <button type="button" className="generalSettingsSave" onClick={save}>Guardar cambios</button>
      </div>
    </Dialog>
  );
}
