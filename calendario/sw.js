self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        await self.registration.unregister();
        const clientsList = await self.clients.matchAll({ type: 'window' });
        for (const client of clientsList) {
          client.navigate(client.url);
        }
      } catch (e) {}
    })()
  );
});
