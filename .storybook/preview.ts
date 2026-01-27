import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3'
import '../src/styles/main.css'
import { useDark } from '@vueuse/core'
import { createTestI18n } from '@/i18n/__testHelpers__/i18n-utils'
import en from '@/locales/en.json'
import snowflakeEn from '@/features/process-templates/snowflake/locales/en.json'

setup((app) => {
  app.use(
    createTestI18n({
      en: {
        ...en,
        ...snowflakeEn,
      },
    })
  )
})

useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo',
    },
  },
}

export default preview
