import type { Meta, StoryObj } from '@storybook/vue3'
import CanvasStep from '@/features/writing-project/canvas/step/CanvasStep.vue'

const meta = {
  component: CanvasStep,
  argTypes: {
    id: { control: 'text' },
    definition: { control: 'object' },
    content: { control: 'object' },
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: false }, // Disabling for now as Tiptap content can vary
        ],
      },
    },
  },
} satisfies Meta<typeof CanvasStep>

export default meta
type Story = StoryObj<typeof CanvasStep>

export const Default: Story = {
  args: {
    id: '1',
    definition: {
      label: 'Rich Text Node',
      placeholder: 'Enter content...',
      hint: 'This is a hint for the writer',
      category: 'structure',
    },
    content: {
      text: '<p>This is a <strong>Node</strong>.</p>',
    },
  },
}
