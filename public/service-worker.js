// public/service-worker.js

self.addEventListener('install', (event) => {
    
  });
  
  self.addEventListener('activate', (event) => {
    
  });
  
  self.addEventListener('fetch', (event) => {
    
  });
  

  // Escuchar el evento "push" para mostrar la notificación
self.addEventListener('push', (event) => {
  // Si el push trae datos, los extraemos como JSON; si no, usamos valores por defecto.
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notificación';
  const options = {
    body: data.body || 'Tienes una nueva notificación.',
    icon: data.icon || '/icon.png', // Asegúrate de que la ruta sea correcta
    data: {
      // URL a la que se dirigirá el usuario al hacer clic en la notificación.
      url: data.url || '/'
    }
    // Puedes agregar más opciones como vibración, acciones, etc.
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Escuchar el evento "notificationclick" para gestionar el clic sobre la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación

  event.waitUntil(
    // Busca ventanas abiertas y enfoca la que corresponda o abre una nueva.
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
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