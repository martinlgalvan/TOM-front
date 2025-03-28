import React, { useState, useEffect, useRef } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

// Importa la función de suscripción
import { subscribeUserToPush } from "./../pushNotifications";

const CountdownTimer = ({ initialTime }) => {
  // (Tu lógica existente para detectar iOS, Safari, etc.)
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = isiOS && ("standalone" in window.navigator) && window.navigator.standalone;

  // Funciones para formatear y convertir tiempo...
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

  // Inicialización del tiempo y estados
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
  const audioContextRef = useRef(null);

  const handleStart = () => {
    if (isSafari && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    }
    startTimestampRef.current = Date.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    remainingTimeRef.current = timeLeft;
  };

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


  

  // Mostrar diálogo para solicitar permiso de notificaciones si es posible:
  // En iOS, solo si la app está instalada (standalone)
 /*useEffect(() => {
    if (
      (( !isiOS ) || (isiOS && isStandalone)) &&
      "Notification" in window &&
      Notification.permission === "default" &&
      !localStorage.getItem("notificationRequested")
    ) {
      setShowDialog(true);
    }
  }, [isiOS, isStandalone]);*/

 /* const requestNotificationPermission = () => {

    setShowDialog(false);
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        localStorage.setItem("notificationRequested", "true");
        subscribeUserToPush().then((subscription) => {
          if (subscription) {
            fetch('https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/save-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription, userId: "TU_USER_ID_OPCIONAL" })
            })
            .then(response => {
              return response.json();
            })
              .then(data => console.log("Suscripción guardada en el backend:", data))
              .catch(err => console.error("Error enviando la suscripción al backend:", err));
          }
        });
      }
    });
  };*/
  

  const triggerAlarm = async () => {
    playBeep();

    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    /*if (!isiOS && "Notification" in window && Notification.permission === "granted") {
      new Notification("⏳ ¡Tiempo terminado!", {
        body: "Tu descanso ha finalizado, es hora de continuar con el entrenamiento.",
        icon: "/icon.png"
      });
    } else if (isiOS && isStandalone) {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          reg.showNotification("⏳ ¡Tiempo terminado!", {
            body: "Tu descanso ha finalizado, es hora de continuar con el entrenamiento.",
            icon: "/icon.png"
          });
        } else {
          alert("⏳ ¡Tiempo terminado! Tu descanso ha finalizado, es hora de continuar con el entrenamiento.");
        }
      } else {
        alert("⏳ ¡Tiempo terminado! Tu descanso ha finalizado, es hora de continuar con el entrenamiento.");
      }
    } else {
      alert("⏳ ¡Tiempo terminado! Tu descanso ha finalizado, es hora de continuar con el entrenamiento.");
    }*/
  };

  const playBeep = () => {
    let audioCtx;
    if (isSafari && audioContextRef.current) {
      audioCtx = audioContextRef.current;
    } else {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
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
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + beepDuration);
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
      <IconButton onClick={() => { isRunning ? handlePause() : handleStart(); }}>
        {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <IconButton onClick={handleReset}>
        <ReplayIcon />
      </IconButton>

      {/*<Dialog
        header="Activar Notificaciones"
        visible={showDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowDialog(false)}
      >
        <p>
          ¿Quieres activar las notificaciones para que la alarma funcione incluso con el celular bloqueado?
        </p>
        <Button label="Activar" onClick={requestNotificationPermission} />
      </Dialog>*/}
    </div>
  );
};

export default CountdownTimer;
