import type { Meta, StoryObj } from '@storybook/vue3'
import RichTextNode from '@features/story-canvas/components/RichTextNode.vue'
import { expect } from 'storybook/test'

const meta: Meta<typeof RichTextNode> = {
  component: RichTextNode,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object' },
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
}

export default meta
type Story = StoryObj<typeof RichTextNode>

export const Default: Story = {
  args: {
    data: {
      label: 'Rich Text Node',
      content: '<p>This is a <strong>Rich Text Node</strong>.</p>',
    },
  },
  play: async ({ canvas, step, userEvent }) => {
    const editor = await canvas.findByRole('textbox')

    await step('Can type into a node', async () => {
      await userEvent.click(editor)
      await userEvent.clear(editor)
      await userEvent.type(editor, 'This is updated content from the play function.')
      await expect(editor).toHaveTextContent('This is updated content from the play function.')
    })
  },
}
