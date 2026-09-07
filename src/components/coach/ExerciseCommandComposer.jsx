import React, { useEffect, useRef, useState } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import { EXERCISE_COMMAND_EXAMPLES, parseExerciseCommand } from '../../helpers/exerciseCommandParser.js';

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function ExerciseCommandComposer({ onAddExercise }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const parse = () => {
    const nextResult = parseExerciseCommand(text);
    setResult(nextResult);
    setSpeechError('');
    return nextResult;
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      setSpeechError('Este navegador no ofrece dictado directo. Podés escribir el comando o usar el dictado del teclado.');
      return;
    }

    recognitionRef.current?.stop();
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((item) => item[0]?.transcript || '').join(' ');
      setText(transcript);
      if (event.results[event.results.length - 1]?.isFinal) setResult(parseExerciseCommand(transcript));
    };
    recognition.onerror = (event) => {
      setSpeechError(event.error === 'not-allowed'
        ? 'El navegador bloqueó el micrófono. Habilitalo para usar el dictado.'
        : 'No se pudo transcribir el audio. Podés continuar escribiendo.');
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setSpeechError('');
    setResult(null);
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const addExercise = () => {
    const nextResult = result?.ok ? result : parse();
    if (!nextResult?.ok) return;
    onAddExercise(nextResult.data);
    setText('');
    setResult(null);
    setIsOpen(false);
  };

  return (
    <section className="exerciseCommandComposer" aria-label="Crear ejercicio por texto o voz">
      <button
        type="button"
        className="exerciseCommandTrigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <AddIcon fontSize="small" />
        <span>Crear por texto o voz</span>
      </button>

      {isOpen && (
        <div className="exerciseCommandPanel">
          <div className="exerciseCommandHeader">
            <div>
              <strong>Crear ejercicio simple</strong>
              <span>Usa reglas fijas: escribí o dictá nombre, series, reps, peso y descanso.</span>
            </div>
            <button type="button" className="exerciseCommandHelp" onClick={() => setResult({ help: true })} aria-label="Ver ejemplos">
              <HelpOutlineIcon fontSize="small" />
            </button>
          </div>

          <textarea
            value={text}
            onChange={(event) => { setText(event.target.value); setResult(null); }}
            placeholder="Ejemplo: sentadilla al cajón, 3 series por 4 repeticiones, 200 kg y 3 minutos de descanso"
            aria-label="Instrucción para crear ejercicio"
            rows={3}
          />

          <div className="exerciseCommandControls">
            <button type="button" onClick={isListening ? stopListening : startListening} className={isListening ? 'isListening' : ''}>
              {isListening ? <StopIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              {isListening ? 'Detener' : 'Dictar'}
            </button>
            <button type="button" onClick={parse} disabled={!text.trim()}>Revisar</button>
          </div>

          {speechError && <p className="exerciseCommandError" role="alert">{speechError}</p>}

          {result?.help && (
            <div className="exerciseCommandHelpBox">
              <strong>Cómo escribirlo o decirlo</strong>
              <p>Usá el nombre, las series, las repeticiones y, si querés, el peso y el descanso. No hace falta una frase exacta.</p>
              <ul>{EXERCISE_COMMAND_EXAMPLES.map((example) => <li key={example}>{example}</li>)}</ul>
            </div>
          )}

          {result && !result.help && (
            <div className={`exerciseCommandPreview ${result.ok ? 'isValid' : 'isInvalid'}`}>
              {result.ok ? (
                <>
                  <strong>Vista previa</strong>
                  <span>{result.data.name} · {result.data.sets} series × {result.data.reps} reps</span>
                  <span>{result.data.peso || 'Peso sin definir'} · descanso {result.data.rest || 'sin definir'}</span>
                  <button type="button" onClick={addExercise}><AddIcon fontSize="small" />Agregar al día</button>
                </>
              ) : (
                <>
                  <strong>Falta completar</strong>
                  <ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
