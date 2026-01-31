import type { Meta, StoryObj } from '@storybook/vue3'
import SaveStatusIndicator from './SaveStatusIndicator.vue'

const meta: Meta<typeof SaveStatusIndicator> = {
  title: 'Features/WritingProject/SaveStatusIndicator',
  component: SaveStatusIndicator,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'error'],
    },
  },
}

export default meta
type Story = StoryObj<typeof SaveStatusIndicator>

export const Saved: Story = {
  args: {
    status: 'success',
  },
}

export const Saving: Story = {
  args: {
    status: 'loading',
  },
}

export const ErrorSaving: Story = {
  args: {
    status: 'error',
    error: new Error('Failed to write to disk'),
  },
}

export const Idle: Story = {
  args: {
    status: 'idle',
  },
}
