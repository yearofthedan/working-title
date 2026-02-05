import type { Meta, StoryObj } from '@storybook/vue3'
import { expect } from 'storybook/test'

import { defineComponent, h } from 'vue'
import AppErrorBoundary from './AppErrorBoundary.vue'
import { createLoggerBinding } from '@/composables/useLogger'

const ThrowingComponent = defineComponent({
  setup() {
    throw new Error('Planned storybook error')
  },
  render: () => h('div', 'This will never render'),
})

const meta = {
  component: AppErrorBoundary,
} satisfies Meta<typeof AppErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

const runSmokeTest: Story['play'] = async ({ canvas, step }) => {
  await step('Verify error state renders', async () => {
    await expect(canvas.getByText(/Application Error/i)).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Refresh Page/i })).toBeVisible()
  })

  await step('Verify technical details', async () => {
    const details = canvas.getByText(/Technical details/i)
    await expect(details).toBeVisible()
  })
}

const [loggerKey, loggerContext] = createLoggerBinding()

export const Default: Story = {
  render: (args) => ({
    components: { AppErrorBoundary, ThrowingComponent },
    setup() {
      return { args }
    },
    provide: {
      [loggerKey]: {
        ...loggerContext,
        fatal: () => undefined,
      },
    },
    template: `
      <AppErrorBoundary v-bind="args">
        <ThrowingComponent />
      </AppErrorBoundary>
    `,
  }),
  play: runSmokeTest,
}

export const HealthyState: Story = {
  render: (args) => ({
    components: { AppErrorBoundary },
    setup() {
      return { args }
    },
    template: `
      <AppErrorBoundary v-bind="args">
        <div style="padding: 2rem; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;">
          Everything is fine. No boundary triggered.
        </div>
      </AppErrorBoundary>
    `,
  }),
}
