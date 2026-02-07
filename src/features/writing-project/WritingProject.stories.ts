import type { Meta, StoryObj } from '@storybook/vue3'
import WritingProject from '@/features/writing-project/WritingProject.vue'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'

const meta = {
  component: WritingProject,
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
} satisfies Meta<typeof WritingProject>

export default meta
type Story = StoryObj<typeof WritingProject>

const inlineTemplate: ProcessTemplate = {
  id: 'storybook-test-template',
  version: '1.0.0',
  nameText: 'storybook.template.name',
  descriptionText: 'storybook.template.description',
  rootActions: [],
  stepDefinitions: [
    {
      id: 'step-initial-idea',
      stage: 1,
      category: 'structure',
      labelText: 'Initial Idea',
      instructionText: 'Write your initial idea here.',
      editorConfig: {
        format: 'rich',
        placeholderText: "What's your big idea?",
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
    {
      id: 'step-character-development',
      stage: 2,
      category: 'structure',
      labelText: 'Character Development',
      instructionText: 'Develop your characters.',
      editorConfig: {
        format: 'rich',
        placeholderText: 'Who are your characters?',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
    {
      id: 'step-plot-outline',
      stage: 2,
      category: 'structure',
      labelText: 'Plot Outline',
      instructionText: 'Outline your plot.',
      editorConfig: {
        format: 'rich',
        placeholderText: 'What happens in your story?',
      },
      ui: {
        visibility: ['canvas'],
      },
      actions: [],
    },
  ],
  ui: {
    tracks: [
      { id: 'main', rootStepIds: ['step-initial-idea'] },
      { id: 'characters', rootStepIds: ['step-character-development'], layerOffset: 1 },
    ],
  },
}

const steps = [
  {
    id: '1',
    stepId: 'step-initial-idea',
    content: {
      text: 'This is the initial idea for the story.',
    },
  },
  {
    id: '2',
    stepId: 'step-character-development',
    content: {
      text: 'Details about the main characters and their arcs.',
    },
  },
  {
    id: '3',
    stepId: 'step-plot-outline',
    content: {
      text: 'The main plot points and story progression.',
    },
  },
]

export const Default: Story = {
  args: {
    project: {
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
        steps: steps,
        connections: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e1-3', source: '1', target: '3' },
        ],
      },
      template: inlineTemplate,
    },
  },
}

export const Empty: Story = {
  args: {
    project: {
      data: {
        schemaVersion: '1.0.0',
        projectId: 'proj_empty',
        templateId: 'snowflake-method-v1',
        templateVersion: '1.0.0',
        meta: {
          name: 'Empty Project',
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
        steps: [],
        connections: [],
      },
      template: inlineTemplate,
    },
  },
}
