import type { Meta, StoryObj } from '@storybook/vue3'
import NodeActionButton from './NodeActionButton.vue'

const meta: Meta<typeof NodeActionButton> = {
  title: 'Features/StoryCanvas/Nodes/NodeActionButton',
  component: NodeActionButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof NodeActionButton>

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
