import type { Meta, StoryObj } from '@storybook/vue3'
import CanvasStep from '@/features/writing-project/project-canvas/canvas-step/CanvasStep.vue'
import { expect } from 'storybook/test'

const meta = {
  component: CanvasStep,
  tags: ['autodocs'],
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
  play: async ({ canvas, step, userEvent }) => {
    const editorContainer = await canvas.findByPlaceholderText('Enter content...')

    await step('Node becomes editable after click', async () => {
      await userEvent.click(editorContainer)
      const editor = await canvas.findByRole('textbox')
      await expect(editor).toBeInTheDocument()
    })

    await step('Can type into a node', async () => {
      const editor = await canvas.findByRole('textbox')
      await userEvent.clear(editor)
      await userEvent.type(editor, 'This is updated content from the play function.')
      await expect(editor).toHaveTextContent('This is updated content from the play function.')
    })
  },
}
