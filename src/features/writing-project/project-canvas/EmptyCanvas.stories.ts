import { toRef } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EmptyCanvas from './EmptyCanvas.vue'
import { expect } from 'storybook/test'
import { template } from '@/features/process-templates/snowflake/template'
import { buildProjectData, buildStep } from '../storage/__testHelpers__/builders'
import { provideDefinitionsContext } from '@/features/writing-project/domain/useDefinitionsContext'
import { provideProjectContext } from '@/features/writing-project/domain/useProjectContext'
import snowflakeStrings from '@/features/process-templates/snowflake/locales/en.json'
import appStrings from '@/locales/en.json'
import { useI18n } from 'vue-i18n'
import type { ProjectData } from '../storage/types'

type StoryArgs = {
  projectData: ProjectData
}

const meta: Meta<StoryArgs> = {
  component: EmptyCanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => ({
    components: { EmptyCanvas },
    setup() {
      provideProjectContext(toRef(() => args.projectData))
      provideDefinitionsContext(toRef(() => template))
      const { mergeLocaleMessage } = useI18n()
      mergeLocaleMessage('en', snowflakeStrings)

      return { args }
    },
    template: '<EmptyCanvas />',
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const EmptyProject: Story = {
  args: {
    projectData: buildProjectData({
      steps: [],
    }),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(appStrings.app.canvas.emptyState.title)).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', {
        name: snowflakeStrings.template.root.actions.create_summary,
      })
    ).toBeInTheDocument()
  },
}

export const OnlySidebarSteps: Story = {
  args: {
    projectData: buildProjectData({
      steps: [
        buildStep({ id: 'step-1', stepId: 'step-genre', content: { text: 'Fantasy' } }),
        buildStep({ id: 'step-2', stepId: 'step-theme', content: { text: 'Good vs Evil' } }),
      ],
    }),
  },
  play: async ({ canvas, step }) => {
    await step('Still shows Create Summary button (sidebar steps dont affect canvas)', async () => {
      await expect(canvas.getByText(appStrings.app.canvas.emptyState.title)).toBeInTheDocument()
      await expect(
        canvas.getByRole('button', {
          name: snowflakeStrings.template.root.actions.create_summary,
        })
      ).toBeInTheDocument()
    })
  },
}
