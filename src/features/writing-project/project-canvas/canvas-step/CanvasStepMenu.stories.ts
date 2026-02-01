import type { Meta, StoryObj } from '@storybook/vue3'
import CanvasStepMenu from './CanvasStepMenu.vue'

const meta: Meta<typeof CanvasStepMenu> = {
  component: CanvasStepMenu,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof CanvasStepMenu>

export const Default: Story = {
  args: {
    label: 'Append Step',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Action',
    disabled: true,
  },
}
