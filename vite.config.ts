import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const deploymentBase = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base: deploymentBase,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['murka-anime-avatar-v2.png', 'murka-anime-maskable-v2.png'],
      manifest: {
        name: 'Math Kitty Academy',
        short_name: 'Math Kitty',
        description: 'Затишна математична академія для підготовки до НМТ.',
        lang: 'uk',
        start_url: deploymentBase,
        scope: deploymentBase,
        display: 'standalone',
        background_color: '#fff8fb',
        theme_color: '#ec6f9e',
        icons: [
          {
            src: 'murka-anime-avatar-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'murka-anime-maskable-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: process.env.VITE_E2E !== 'true',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
