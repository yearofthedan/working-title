import type { Meta, StoryObj } from '@storybook/vue3'
import StepPanel from './StepPanel.vue'
import { provideActiveProjectContext } from '../composables/useActiveProjectContext'
import { provideDefinitionsContext } from '../composables/useDefinitionsContext'
import { useDetailPanel } from './useDetailPanel'
import { ref, onMounted } from 'vue'
import { buildProjectData } from '@/features/project-storage/__testHelpers__/builders'
import {
  buildProcessTemplate,
  buildStepDefinition,
} from '@/features/process-templates/__testHelpers__/builders'

const meta: Meta<typeof StepPanel> = {
  component: StepPanel,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof StepPanel>

const template = buildProcessTemplate({
  stepDefinitions: [
    buildStepDefinition({
      id: 'step-1',
      labelText: 'template.step.summary.label',
    }),
  ],
})

const projectData = buildProjectData({
  steps: [
    {
      id: 'node-1',
      stepId: 'step-1',
      content: { text: '<p>This is some <strong>rich text</strong> content.</p>' },
    },
  ],
})

export const Default: Story = {
  render: () => ({
    components: { StepPanel },
    setup() {
      provideDefinitionsContext(ref(template))
      provideActiveProjectContext(ref(projectData))
      const { openPanel } = useDetailPanel()

      // Open panel immediately for the story
      onMounted(() => {
        openPanel('node-1')
      })

      return {}
    },
    template: `
      <div class="h-screen w-full bg-slate-100 relative overflow-hidden">
        <div class="p-8">Click a node to open (simulated by onMounted)</div>
        <StepPanel />
      </div>
    `,
  }),
}
