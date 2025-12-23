import type { Meta, StoryObj } from '@storybook/vue3'
import StoryCanvas from '@features/story-canvas/components/StoryCanvas.vue'
import { expect } from 'storybook/test'

const meta = {
  component: StoryCanvas,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div style="width: 100vw; height: 100vh;"><story /></div>',
    }),
  ],
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: false }, // Disabling for now as Tiptap content can vary
        ],
      },
    },
  },
} satisfies Meta<typeof StoryCanvas>

export default meta
type Story = StoryObj<typeof StoryCanvas>

export const Default: Story = {
  args: {
    nodes: [
      {
        id: '1',
        type: 'richText',
        position: { x: 250, y: 50 },
        data: {
          label: 'Initial Idea',
          content: '<p>This is the <strong>initial idea</strong> for the story.</p>',
        },
      },
      {
        id: '2',
        type: 'richText',
        position: { x: 100, y: 200 },
        data: {
          label: 'Character Development',
          content: '<p>Details about the main characters and their arcs.</p>',
        },
      },
      {
        id: '3',
        type: 'richText',
        position: { x: 400, y: 200 },
        data: {
          label: 'Plot Outline',
          content: '<p>The main plot points and story progression.</p>',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
    ],
  },
  play: async ({ canvas, step, userEvent }) => {
    const editors = await canvas.findAllByRole('textbox')

    if (editors.length > 0) {
      const editor = editors[0]!
      await step('Interact with first node', async () => {
        await userEvent.clear(editor)
        await userEvent.type(editor, 'Updated content in Canvas Storybook.')
      })

      await step('Verify update', async () => {
        await expect(editor).toHaveTextContent('Updated content in Canvas Storybook.')
      })
    }
  },
}
