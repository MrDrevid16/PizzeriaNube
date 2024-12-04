import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Esto asegura que el service worker se registre automáticamente
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(.*)\/.*\.(js|css|html|png|jpg|jpeg|gif|svg|ico)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400, // Cache durante un día
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Pizzería Saborretti',
        short_name: 'Saborretti',
        description: 'Aplicación web para pedidos de pizza',
        theme_color: '#ff5733',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
