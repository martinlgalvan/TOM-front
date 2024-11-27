import React, { useState, useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";

const CountdownTimer = ({ initialTime }) => {
  const normalizeTimeInput = (input) => {
    if (typeof input !== "string") input = input.toString().trim();

    if (input.includes(":")) {
      // Si ya está en formato mm:ss
      const [minutes, seconds] = input.split(":").map(Number);
      return `${String(minutes || 0).padStart(2, "0")}:${String(seconds || 0).padStart(2, "0")}`;
    }

    const match = input.match(/\d+/g); // Extraer números
    if (!match) return "00:00";

    const minutes = parseInt(match[0], 10); // El primer número es minutos
    const seconds = match.length > 1 ? parseInt(match[1], 10) : 0; // Segundo número opcional es segundos

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

  // Estado inicial: tiempo normalizado o sin especificar
  const [time, setTime] = useState(() => {
    if (!initialTime || initialTime === 0) return null; // Caso especial para 0 o tiempo no especificado
    const normalizedTime = normalizeTimeInput(initialTime);
    return timeStringToSeconds(normalizedTime);
  });

  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false); // Bandera para detectar si el tiempo terminó

  useEffect(() => {
    if (!isRunning || time === null || time <= 0) {
      if (time === 0 && isRunning) {
        setHasFinished(true); // Marca que el tiempo ha finalizado
      }
      return;
    }

    const timerId = setInterval(() => {
      setTime((prevTime) => Math.max(prevTime - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, time]);

  const toggleTimer = () => {
    if (time > 0) setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHasFinished(false); // Resetea la bandera
    if (!initialTime || initialTime === 0) {
      setTime(null); // Caso especial para 0
    } else {
      const normalizedTime = normalizeTimeInput(initialTime);
      setTime(timeStringToSeconds(normalizedTime));
    }
  };

  const renderMessage = () => {
    if (time === null) {
      return <p className="text-warning font-weight-bold">No se especificó tiempo de descanso</p>;
    }
    if (hasFinished) {
      return <p className="text-danger font-weight-bold">¡Entrená!</p>;
    }
    return <p className="fontCronometer m-0">{secondsToTimeString(time)}</p>;
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
            disabled={time === 0 && hasFinished} // Deshabilita si el tiempo ha terminado
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
