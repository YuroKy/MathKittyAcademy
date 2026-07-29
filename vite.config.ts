import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { configDefaults, defineConfig } from 'vitest/config'

const deploymentBase = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base: deploymentBase,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
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
        globPatterns: ['**/*.{js,css,html,png,webp,svg,woff2}'],
        globIgnores: ['social/**', '**/*.map'],
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
  test: {
    exclude: [...configDefaults.exclude, '**/e2e-pwa/**'],
  },
})
