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
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 5173,
    },
    warmup: {
      clientFiles: [
        './src/features/story-canvas/StoryCanvasVueFlow.vue',
        './src/features/story-canvas/StoryCanvas.vue',
        './src/features/demo/DemoPage.vue',
        './src/features/story/StoryPage.vue',
      ],
    },
  },
  cacheDir: './.vite',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@specs': path.resolve(__dirname, './src/specs'),
    },
  },
  build: {
    rollupOptions: {},
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vue-flow/core',
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      '@vue-flow/background',
      '@vue-flow/controls',
      '@vue-flow/minimap',
      '@vueuse/core',
      'elkjs/lib/elk.bundled.js',
    ],
  },
})
