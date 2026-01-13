/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import path from 'node:path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@specs': path.resolve(__dirname, './src/specs'),
    },
  },
  build: {
    rollupOptions: {
      external: ['web-worker'],
    },
  },
  optimizeDeps: {
    exclude: ['web-worker'],
  },
})
