import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent } from 'vue'
import AppErrorBoundary from './AppErrorBoundary.vue'

const ThrowingComponent = defineComponent({
  setup() {
    throw new Error('I caused a crash')
  },
  template: '<div>Should not render</div>',
})

const meta = {
  component: AppErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppErrorBoundary>

export default meta

type Story = StoryObj<typeof AppErrorBoundary>

export const Default: Story = {
  render: (args) => ({
    components: { AppErrorBoundary },
    setup() {
      return { args }
    },
    template: `
      <AppErrorBoundary v-bind="args">
        <div class="p-8 bg-paper-sunken border border-dashed border-outline-dim">
          <h2 class="text-lg font-bold">Normal Application Content</h2>
          <p class="mt-2">This content is protected by the error boundary.</p>
        </div>
      </AppErrorBoundary>
    `,
  }),
}

export const Crashing: Story = {
  render: (args) => ({
    components: { AppErrorBoundary, ThrowingComponent },
    setup() {
      return { args }
    },
    template: `
      <AppErrorBoundary v-bind="args">
        <ThrowingComponent />
      </AppErrorBoundary>
    `,
  }),
}
