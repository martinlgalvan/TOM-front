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
  // Detectar navegador y dispositivo
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Determinar si la app está en modo standalone (para iOS y otros navegadores)
  const [isStandaloneState, setIsStandaloneState] = useState(false);
  useEffect(() => {
    let standalone = false;
    if (isiOS) {
      standalone = ("standalone" in window.navigator) && window.navigator.standalone;
    } else if (window.matchMedia) {
      standalone = window.matchMedia("(display-mode: standalone)").matches;
    }
    setIsStandaloneState(standalone);
  }, [isiOS]);

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
  const [notificationStatus, setNotificationStatus] = useState(Notification.permission);
  const [debugInfo, setDebugInfo] = useState({
    localStorageNotification: localStorage.getItem("notificationRequested") || "not set"
  });
  const [dialogShown, setDialogShown] = useState(false);

  const startTimestampRef = useRef(null);
  const remainingTimeRef = useRef(initialSeconds);
  const audioContextRef = useRef(null);

  // Actualiza periódicamente el estado de los permisos y localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationStatus(Notification.permission);
      setDebugInfo({
        localStorageNotification: localStorage.getItem("notificationRequested") || "not set"
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Condición para mostrar el diálogo (si el permiso es "default" y no se ha solicitado)
  useEffect(() => {
    if (
      !dialogShown &&
      (( !isiOS ) || (isiOS && isStandaloneState)) &&
      "Notification" in window &&
      Notification.permission === "default" &&
      !localStorage.getItem("notificationRequested")
    ) {
      setShowDialog(true);
      setDialogShown(true);
    }
  }, [isiOS, isStandaloneState, dialogShown]);

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

  const clearLocalStorage = () => {
    localStorage.removeItem("notificationRequested");
    setDebugInfo({ localStorageNotification: "not set" });
    setDialogShown(false); // Permite volver a mostrar el diálogo
  };

  const requestNotificationPermission = () => {
    setShowDialog(false);
    console.log("Solicitando permisos de notificación...");
    Notification.requestPermission().then((permission) => {
      setNotificationStatus(permission);
      console.log("Permiso:", permission);
      if (permission === "granted") {
        localStorage.setItem("notificationRequested", "true");
        subscribeUserToPush().then((subscription) => {
          if (subscription) {
            console.log("Enviando suscripción al backend...", subscription);
            fetch('https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/save-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription, userId: "TU_USER_ID_OPCIONAL" })
            })
              .then(response => response.json())
              .then(data => console.log("Suscripción guardada en el backend:", data))
              .catch(err => console.error("Error enviando la suscripción al backend:", err));
          }
        });
      }
    });
  };

  const triggerAlarm = async () => {
    playBeep();
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    if (!isiOS && "Notification" in window && Notification.permission === "granted") {
      new Notification("⏳ ¡Tiempo terminado!", {
        body: "Tu descanso ha finalizado, es hora de continuar con el entrenamiento.",
        icon: "/icon.png"
      });
    } else if (isiOS && isStandaloneState) {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          reg.showNotification("⏳ ¡Tiempo terminado!", {
            body: "Tu descanso ha finalizado, es hora de continuar con el entrenamiento.",
            icon: "/icon.png"
          });
        } else {
          console.log("No se encontró Service Worker registrado.");
        }
      } else {
        console.log("Service Worker no soportado.");
      }
    } else {
      console.log("Notificaciones no disponibles o permisos denegados.");
    }
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

      <Dialog
        header="Activar Notificaciones"
        visible={showDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowDialog(false)}
      >
        <p>
          ¿Quieres activar las notificaciones para que la alarma funcione incluso con el celular bloqueado?
        </p>
        <Button label="Activar" onClick={requestNotificationPermission} />
      </Dialog>

      {/* Panel de Debug Permanente */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          background: "rgba(255,255,0,0.9)",
          color: "#000",
          zIndex: 9999,
          padding: "8px",
          fontSize: "12px",
          maxWidth: "100%",
          overflowX: "auto"
        }}
      >
        <div><strong>Debug Info</strong></div>
        <div>Permisos: {notificationStatus}</div>
        <div>localStorage esta?: {debugInfo.localStorageNotification}</div>
        <div>Standalone: {isStandaloneState ? "Yes" : "No"}</div>
        <Button label="Clear localStorage" onClick={clearLocalStorage} />
        <Button label="Re-request Permission" onClick={requestNotificationPermission} />
      </div>
    </div>
  );
};

export default CountdownTimer;
