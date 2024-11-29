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
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

  return (
    <div>
      {renderMessage()}
      <div className="row justify-content-center">
        <div className="col-5 p-0">
          <IconButton
            className="p-1"
            onClick={toggleTimer}
            aria-label={isRunning ? "Pausar" : "Iniciar"}
            disabled={timeLeft === 0 && hasFinished}
          >
            {isRunning ? <PauseIcon className="fontIcons" /> : <PlayArrowIcon className="fontIcons" />}
          </IconButton>
        </div>
        <div className="col-5 p-0">
          <IconButton className="p-1" onClick={resetTimer} aria-label="Reiniciar">
            <ReplayIcon className="fontIcons" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
