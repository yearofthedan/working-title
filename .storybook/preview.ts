import type { Preview } from '@storybook/vue3-vite'
import '../src/tailwind.css' // ← ADD THIS

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
