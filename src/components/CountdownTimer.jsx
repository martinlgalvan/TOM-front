import React, { useState, useEffect, useRef } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const CountdownTimer = ({ initialTime }) => {
  const normalizeTimeInput = (input) => {
    if (typeof input !== "string") input = input.toString().trim();
    if (input.includes(":")) {
      const [minutes, seconds] = input.split(":").map(Number);
      return `${String(minutes || 0).padStart(2, "0")}:${String(
        seconds || 0
      ).padStart(2, "0")}`;
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

  // Inicializa el tiempo en segundos y actualiza la ref remainingTimeRef
  const initialSeconds =
    !initialTime || initialTime === 0
      ? null
      : timeStringToSeconds(normalizeTimeInput(initialTime));

  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const startTimestampRef = useRef(null);
  const remainingTimeRef = useRef(initialSeconds);

  // Iniciar el temporizador
  const handleStart = () => {
    startTimestampRef.current = Date.now();
    setIsRunning(true);
  };

  // Pausar el temporizador y actualizar remainingTimeRef
  const handlePause = () => {
    setIsRunning(false);
    remainingTimeRef.current = timeLeft;
  };

  // Reiniciar el temporizador
  const handleReset = () => {
    const newTime = timeStringToSeconds(normalizeTimeInput(initialTime));
    setTimeLeft(newTime);
    remainingTimeRef.current = newTime;
    setHasFinished(false);
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestampRef.current) / 1000);
        const updatedTime = Math.max(remainingTimeRef.current - elapsed, 0);
        setTimeLeft(updatedTime);

        if (updatedTime === 0) {
          clearInterval(interval);
          setIsRunning(false);
          setHasFinished(true);
          triggerAlarm();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default" &&
      !localStorage.getItem("notificationRequested")
    ) {
      setShowDialog(true);
    }
  }, []);

  const requestNotificationPermission = () => {
    setShowDialog(false);
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        localStorage.setItem("notificationRequested", "true");
      }
    });
  };

  const triggerAlarm = () => {
    playBeep();

    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏳ ¡Tiempo terminado!", {
        body: "Tu descanso ha finalizado, es hora de continuar con el entrenamiento.",
        icon: "/icon.png"
      });
    }
  };

  const playBeep = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const beepDuration = 0.2;
    const pauseBetweenBeeps = 0.1;
    const pairsCount = 3;
    let startTime = audioCtx.currentTime;

    for (let i = 0; i < pairsCount; i++) {
      for (let j = 0; j < 2; j++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(750, startTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + beepDuration);
        gainNode.gain.setValueAtTime(1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + beepDuration
        );
        startTime += beepDuration + pauseBetweenBeeps;
      }
      startTime += 0.4;
    }
  };

  const formatTimeDisplay = (totalSeconds) => {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return (
      <div className="fonnt mb-2">
        <span className="quadre p-2">{minutes}</span>
        <span className="text-dark spanPuntitos">:</span>
        <span className="quadre p-2">{seconds}</span>
      </div>
    );
  };

  return (
    <div>
      {timeLeft !== null ? formatTimeDisplay(timeLeft) : "--:--"}
      <IconButton
        onClick={() => {
          if (isRunning) {
            handlePause();
          } else {
            handleStart();
          }
        }}
      >
        {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <IconButton onClick={handleReset}>
        <ReplayIcon />
      </IconButton>

      <Dialog
        header="Activar Notificaciones"
        visible={showDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowDialog(false)}
      >
        <p>
          ¿Quieres activar las notificaciones para que la alarma funcione
          incluso con el celular bloqueado?
        </p>
        <Button label="Activar" onClick={requestNotificationPermission} />
      </Dialog>
    </div>
  );
};

export default CountdownTimer;
