// public/service-worker.js

// Instalar y precachear recursos básicos (opcional)
self.addEventListener('install', (event) => {
  // Puedes abrir un cache, precargar recursos, etc.
  console.log("Service Worker instalado");
});

// Activar y limpiar caches antiguos (opcional)
self.addEventListener('activate', (event) => {
  console.log("Service Worker activado");
});

// Estrategia de fetch (ejemplo simple, puede mejorarse según tus necesidades)
self.addEventListener('fetch', (event) => {
  // Aquí podrías implementar cache-first o network-first según el recurso
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notificación';
  const options = {
    body: data.body || 'Tienes una nueva notificación.',
    icon: data.icon || '/icon.png',
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejo del clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
