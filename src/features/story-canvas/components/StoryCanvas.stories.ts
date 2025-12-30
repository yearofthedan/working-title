import type { Meta, StoryObj } from '@storybook/vue3'
import StoryCanvas from '@features/story-canvas/components/StoryCanvas.vue'
import { expect } from 'storybook/test'
import { strings } from '@/features/snowflake/strings'
import type { NarrativeTemplate } from '@/features/shared/storySpec'

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

const inlineTemplate: NarrativeTemplate = {
  id: 'storybook-test-template',
  version: '1.0.0',
  nameText: 'storybook.template.name',
  descriptionText: 'storybook.template.description',
  rootActions: [],
  steps: {
    'step-initial-idea': {
      id: 'step-initial-idea',
      stage: 1,
      category: 'structure',
      labelText: 'Initial Idea',
      instructionText: 'Write your initial idea here.',
      content: {
        contentType: 'richText',
        placeholderText: "What's your big idea?",
      },
      actions: [],
    },
    'step-character-development': {
      id: 'step-character-development',
      stage: 2,
      category: 'structure',
      labelText: 'Character Development',
      instructionText: 'Develop your characters.',
      content: {
        contentType: 'richText',
        placeholderText: 'Who are your characters?',
      },
      actions: [],
    },
    'step-plot-outline': {
      id: 'step-plot-outline',
      stage: 2,
      category: 'structure',
      labelText: 'Plot Outline',
      instructionText: 'Outline your plot.',
      content: {
        contentType: 'richText',
        placeholderText: 'What happens in your story?',
      },
      actions: [],
    },
  },
}

export const Default: Story = {
  args: {
    data: {
      schemaVersion: '1.0.0',
      projectId: 'proj_1984_orwell',
      templateId: 'snowflake-method-v1',
      templateVersion: '1.0.0',
      meta: {
        name: '1984',
        created: '1948-06-08T10:00:00Z',
        lastModified: '1949-06-08T14:30:00Z',
      },
      nodes: [
        {
          id: '1',
          stepId: 'step-initial-idea',
          content: {
            text: '<p>This is the <strong>initial idea</strong> for the story.</p>',
          },
        },
        {
          id: '2',
          stepId: 'step-character-development',
          content: {
            text: '<p>Details about the main characters and their arcs.</p>',
          },
        },
        {
          id: '3',
          stepId: 'step-plot-outline',
          content: {
            text: '<p>The main plot points and story progression.</p>',
          },
        },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
      ],
    },
    template: inlineTemplate,
    strings: strings,
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
