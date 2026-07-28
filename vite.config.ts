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
      includeAssets: ['mascot-icon.svg'],
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
            src: 'mascot-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'mascot-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
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
