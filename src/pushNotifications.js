// src/pushNotifications.js

// Funcion auxiliar para convertir la clave VAPID de URL-safe Base64 a Uint8Array
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Funcion para suscribir al usuario a notificaciones push
export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error("No se encontro el Service Worker registrado.");
        return;
      }
      // REEMPLAZA 'TU_CLAVE_PUBLICA_VAPID' POR TU CLAVE PUBLICA (en formato URL-safe Base64)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BAkoeYGPjfM34YiwIG_EAXYhKAweaFX1Xh0hAU1hHhEvryswLlMcDgAf9HrVUquQkm33cgZgOvi1QENlA5tP8oU')
      });
      console.log("Suscripcion exitosa:", subscription);
      // Aqui debes enviar la suscripcion a tu backend para guardarla
      return subscription;
    } catch (error) {
      console.error("Error al suscribirse a las notificaciones push:", error);
    }
  } else {
    console.warn("Push Notifications no estan soportadas en este navegador.");
  }
}



