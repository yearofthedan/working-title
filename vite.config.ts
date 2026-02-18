/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      defaultClass: 'iconify',
      scale: 1,
      defaultStyle: 'vertical-align: middle;',
    }),
  ],
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
        './src/features/writing-project/WritingProject.vue',
        './src/features/demo/DemoPage.vue',
      ],
    },
  },
  cacheDir: './.vite',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {},
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@iconify/vue',
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
