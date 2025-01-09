import React, { useState, useEffect, useRef } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";

const CountdownTimer = ({ initialTime }) => {
  const normalizeTimeInput = (input) => {
    if (typeof input !== "string") input = input.toString().trim();

    if (input.includes(":")) {
      const [minutes, seconds] = input.split(":").map(Number);
      return `${String(minutes || 0).padStart(2, "0")}:${String(seconds || 0).padStart(2, "0")}`;
    }

    const match = input.match(/\d+/g);
    if (!match) return "00:00";

    const minutes = parseInt(match[0], 10);
    const seconds = match.length > 1 ? parseInt(match[1], 10) : 0;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const timeStringToSeconds = (timeString) => {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + (seconds || 0);
  };

  const secondsToTimeString = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return  <div className="fonnt  mb-2">
              <span className="quadre p-2">{String(minutes).padStart(2, "0")}</span>
              <span className="text-dark spanPuntitos">:</span>
              <span className="quadre p-2">{String(seconds).padStart(2, "0")}</span>
            </div>
  };

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!initialTime || initialTime === 0) return null;
    const normalizedTime = normalizeTimeInput(initialTime);
    return timeStringToSeconds(normalizedTime);
  });

  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const startTimestampRef = useRef(null); // Referencia a la marca de tiempo inicial
  const pauseTimestampRef = useRef(null); // Marca de tiempo en la última pausa
  const remainingTimeRef = useRef(timeLeft); // Tiempo restante

  useEffect(() => {
    let animationFrameId;

    const updateTimer = () => {
      if (isRunning) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestampRef.current) / 1000);
        const updatedTimeLeft = Math.max(remainingTimeRef.current - elapsed, 0);
        setTimeLeft(updatedTimeLeft);

        if (updatedTimeLeft === 0) {
          setIsRunning(false);
          setHasFinished(true);
          playBeep();
        } else {
          animationFrameId = requestAnimationFrame(updateTimer); // Actualización más fluida
        }
      }
    };

    if (isRunning) {
      startTimestampRef.current = Date.now();
      animationFrameId = requestAnimationFrame(updateTimer);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning]);

  const toggleTimer = () => {
    if (timeLeft > 0) {
      if (isRunning) {
        // Pausar
        setIsRunning(false);
        pauseTimestampRef.current = Date.now();
        const elapsed = Math.floor((pauseTimestampRef.current - startTimestampRef.current) / 1000);
        remainingTimeRef.current -= elapsed;
      } else {
        // Reanudar
        setIsRunning(true);
        startTimestampRef.current = Date.now();
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHasFinished(false);
    startTimestampRef.current = null;
    pauseTimestampRef.current = null;

    if (!initialTime || initialTime === 0) {
      setTimeLeft(null);
      remainingTimeRef.current = null;
    } else {
      const normalizedTime = normalizeTimeInput(initialTime);
      const initialSeconds = timeStringToSeconds(normalizedTime);
      setTimeLeft(initialSeconds);
      remainingTimeRef.current = initialSeconds;
    }
  };

  const renderMessage = () => {
    if (timeLeft === null) {
      return <p className="text-warning font-weight-bold">No se especificó tiempo de descanso</p>;
    }
    if (hasFinished) {
      return <p className="text-danger font-weight-bold">¡Entrená!</p>;
    }
    return <p className="fontCronometer m-0">{secondsToTimeString(timeLeft)}</p>;
  };


  function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const beepDuration = 0.2; // Duración de cada beep en segundos
    const pauseBetweenBeeps = 0.1; // Pausa breve entre beep y beep
    const pairsCount = 3; // Cantidad de pares de beep (beep beep, beep beep, beep beep)

    let startTime = audioCtx.currentTime;

    for (let i = 0; i < pairsCount; i++) {
      // Repite dos beeps seguidos (beep beep)
      for (let j = 0; j < 2; j++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(750, startTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Inicio del beep
        oscillator.start(startTime);
        // Fin del beep
        oscillator.stop(startTime + beepDuration);

        // Subida y bajada de volumen en beepDuration
        gainNode.gain.setValueAtTime(1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + beepDuration
        );

        // El siguiente beep comienza después del beepDuration + pausa
        startTime += beepDuration + pauseBetweenBeeps;
      }

      // Después de los dos beeps (beep beep), un silencio un poco más largo
      startTime += 0.4; // Ajusta si quieres mayor separación entre cada pareja
    }
  }

  return (
    <div className="circular">
      <div>

      <div className="d-flex flex-column justify-content-center text-center ">

        <div className="col-12 text-center  mb-2">
        {renderMessage()}
        </div>
        <div className="col-12 text-center align-items-center ">
      
            <IconButton
              className="border   mx-1 "
              onClick={toggleTimer}
              aria-label={isRunning ? "Pausar" : "Iniciar"}
              disabled={timeLeft === 0 && hasFinished}
            >
              {isRunning ? <PauseIcon className="text-dark" /> : <PlayArrowIcon className="text-dark" />}
            </IconButton>
            
            <IconButton className="border   mx-1 " onClick={resetTimer} aria-label="Reiniciar">
              <ReplayIcon className="text-dark" />
            </IconButton>
                  
        </div>
      </div>
              
      </div>
    </div>
  );
};

export default CountdownTimer;
