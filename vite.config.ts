import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults, defineConfig } from 'vite-plus';

const themeColor = '#fbfaf7';

export default defineConfig({
  plugins: [
    {
      name: 'theme-color',
      transformIndexHtml: () => [
        { tag: 'meta', attrs: { name: 'theme-color', content: themeColor }, injectTo: 'head' },
      ],
    },
    VitePWA({
      // shortcut: a new build takes over open tabs without asking, which can lose unsaved input
      // (https://vite-pwa-org.netlify.app/guide/auto-update); prompt instead once the writer can type.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'working-title',
        short_name: 'working-title',
        description: 'Plan and draft a novel.',
        theme_color: themeColor,
        background_color: themeColor,
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
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
    // .spec.ts too, so a colocated spec runs rather than falling between the two runners.
    include: ['**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
  staged: {
    '*': 'vp check --fix',
  },
});
