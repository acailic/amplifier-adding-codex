import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Developer Birth Chart',
        short_name: 'DevBirthChart',
        description: 'Discover your developer personality through GitHub analysis',
        theme_color: '#8b5cf6',
        background_color: '#0f0f23',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ],
        splash_pages: [
          {
            src: 'splash-640x1136.png',
            sizes: '640x1136',
            type: 'image/png'
          },
          {
            src: 'splash-750x1334.png',
            sizes: '750x1334',
            type: 'image/png'
          },
          {
            src: 'splash-828x1792.png',
            sizes: '828x1792',
            type: 'image/png'
          },
          {
            src: 'splash-1125x2436.png',
            sizes: '1125x2436',
            type: 'image/png'
          },
          {
            src: 'splash-1242x2208.png',
            sizes: '1242x2208',
            type: 'image/png'
          },
          {
            src: 'splash-1242x2688.png',
            sizes: '1242x2688',
            type: 'image/png'
          },
          {
            src: 'splash-1536x2048.png',
            sizes: '1536x2048',
            type: 'image/png'
          },
          {
            src: 'splash-1668x2224.png',
            sizes: '1668x2224',
            type: 'image/png'
          },
          {
            src: 'splash-1668x2388.png',
            sizes: '1668x2388',
            type: 'image/png'
          },
          {
            src: 'splash-2048x2732.png',
            sizes: '2048x2732',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?version=1`
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@stores': resolve(__dirname, './src/stores'),
      '@assets': resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'd3'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})