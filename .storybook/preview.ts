import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3'
import '../src/styles/main.css'
import { useDark } from '@vueuse/core'
import { i18n } from '../src/i18n'

setup((app) => {
  app.use(i18n)
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
