// src/serviceWorkerRegistration.js

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js") // Esta ruta busca en public/
        .then((registration) => {

          // Verifica si hay una actualización disponible
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  window.location.reload();
                } else {
                }
              }
            };
          };
        })
        .catch((error) => {
          console.log("Error al registrar el Service Worker:", error);
        });
    });
  }
}
