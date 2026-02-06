import type { Meta, StoryObj } from '@storybook/vue3'
import AppLoadingOverlay from './AppLoadingOverlay.vue'

const meta = {
  component: AppLoadingOverlay,
  tags: ['autodocs'],
  argTypes: {
    isLoading: { control: 'boolean', description: 'Controls the visibility of the overlay.' },
    message: { control: 'text', description: 'Custom loading message.' },
  },
  args: {
    isLoading: true,
    message: undefined,
  },
} satisfies Meta<typeof AppLoadingOverlay>

export default meta

type Story = StoryObj<typeof AppLoadingOverlay>

export const Default: Story = {
  args: {
    isLoading: true,
  },
  render: (args) => ({
    components: { AppLoadingOverlay },
    setup() {
      return { args }
    },
    template: `
      <div class="relative h-64 border border-outline-dim bg-paper p-4">
        <p>This is content that will be covered by the loader.</p>
        <AppLoadingOverlay v-bind="args" />
      </div>
    `,
  }),
}

export const WithMessage: Story = {
  args: {
    ...Default.args,
    message: 'Saving changes...',
  },
  render: Default.render,
}

export const NotLoading: Story = {
  args: {
    isLoading: false,
  },
  render: Default.render,
}
