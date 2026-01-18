import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, h, ref } from 'vue'
import RichTextNode from '@/features/story-canvas/RichTextNode.vue'
import { expect } from 'storybook/test'
import { createCanvasNode } from '@/features/story-canvas/composables/__testHelpers__/builders'
import { provideContentContext } from '@/features/story-canvas/composables/useContentContext'
import type { ProjectData } from '@/specs/projectDataSpec'
import { buildProjectData } from '@/specs/__testHelpers__/builders'

const meta = {
  component: RichTextNode,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object' },
  },
  decorators: [
    (story, context) => {
      const nodeData = context.args.data

      return defineComponent({
        setup() {
          const projectData = ref<ProjectData>(
            buildProjectData({
              meta: { name: 'Story', created: '', lastModified: '' },
              steps: [
                {
                  id: nodeData.id,
                  stepId: nodeData.stepId,
                  content: { text: '<p>This is a <strong>Node</strong>.</p>' },
                },
              ],
              connections: [],
            })
          )

          provideContentContext(projectData, () => {})

          return () => h(story())
        },
      })
    },
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
} satisfies Meta<typeof RichTextNode>

export default meta
type Story = StoryObj<typeof RichTextNode>

export const Default: Story = {
  args: {
    data: createCanvasNode({
      category: 'structure',
      label: 'Rich Text Node',
    }),
  },
  play: async ({ canvas, step, userEvent }) => {
    const contentEl = await canvas.findByText(/This is a/i)

    await step('Node becomes editable after click', async () => {
      await userEvent.click(contentEl)
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
