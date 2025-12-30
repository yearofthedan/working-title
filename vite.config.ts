/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/features/shared'),
      '@common': path.resolve(__dirname, './src/common'),
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
