import type { StorybookConfig } from '@storybook/vue3-vite'
import Icons from 'unplugin-icons/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-vitest', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: {
        plugin: 'vue-component-meta',
        tsconfig: 'tsconfig.app.json',
      },
    },
  },
  async viteFinal(config) {
    config.plugins?.push(
      Icons({
        compiler: 'vue3',
        autoInstall: true,
      })
    )
    return config
  },
}
export default config
