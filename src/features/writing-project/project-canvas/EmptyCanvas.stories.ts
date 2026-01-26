import { toRef, defineComponent } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import EmptyCanvas from './EmptyCanvas.vue'
import { expect, userEvent, within } from 'storybook/test'
import { template } from '@/features/process-templates/snowflake/template'
import { strings } from '@/features/process-templates/snowflake/strings'
import { buildProjectData, buildStep } from '../storage/__testHelpers__/builders'
import { provideDefinitionsContext } from '@/features/writing-project/domain/useDefinitionsContext'
import { provideProjectContext } from '@/features/writing-project/domain/useProjectContext'
import type { ProjectData } from '@/features/writing-project/storage/types'

const EmptyCanvasWrapper = defineComponent({
  components: { EmptyCanvas },
  props: {
    projectData: {
      type: Object as () => ProjectData,
      required: true,
    },
  },
  setup(props) {
    provideProjectContext(toRef(() => props.projectData))
    provideDefinitionsContext(
      toRef(() => template),
      toRef(() => strings)
    )
  },
  template: '<EmptyCanvas />',
})

const meta = {
  component: EmptyCanvasWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof EmptyCanvasWrapper>

export default meta
type Story = StoryObj<typeof EmptyCanvasWrapper>

export const EmptyProject: Story = {
  args: {
    projectData: buildProjectData({ steps: [] }),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Shows the start message', async () => {
      await expect(canvas.getByText(/Start Your Story/i)).toBeInTheDocument()
    })

    await step('Shows the Create Summary action button', async () => {
      const button = await canvas.findByRole('button', { name: /Create One Sentence Summary/i })
      await expect(button).toBeInTheDocument()
    })

    await step('Button is clickable', async () => {
      const button = canvas.getByRole('button', { name: /Create One Sentence Summary/i })
      await userEvent.click(button)
    })
  },
}

export const SummaryExists: Story = {
  args: {
    projectData: buildProjectData({
      steps: [
        buildStep({ id: 'step-1', stepId: 'step-summary', content: { text: 'My story summary' } }),
      ],
    }),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Shows fallback message when no actions available', async () => {
      await expect(canvas.getByText(/All canvas steps have been added/i)).toBeInTheDocument()
    })

    await step('Does not show action buttons', async () => {
      const buttons = canvas.queryAllByRole('button')
      await expect(buttons).toHaveLength(0)
    })
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Still shows Create Summary button (sidebar steps dont affect canvas)', async () => {
      const button = await canvas.findByRole('button', { name: /Create One Sentence Summary/i })
      await expect(button).toBeInTheDocument()
    })
  },
}
