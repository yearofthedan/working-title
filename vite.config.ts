import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'working-title',
        short_name: 'working-title',
        description: 'Plan and draft a novel.',
        // Matches the theme-color meta in index.html.
        theme_color: '#fbfaf7',
        background_color: '#fbfaf7',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // The default precaches js, css and html only; the fonts must open offline too.
        globPatterns: ['**/*.{js,css,html,woff2}'],
      },
    }),
  ],
  fmt: {
    ignorePatterns: ['**/*.md'],
    singleQuote: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['**/*.test.ts'],
  },
  staged: {
    '*': 'vp check --fix',
  },
});
