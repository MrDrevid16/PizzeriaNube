// service-worker.js

self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
  });
  
  self.addEventListener('fetch', (event) => {
    console.log('Fetch event interceptado:', event.request.url);
  });