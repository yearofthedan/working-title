import type { Meta, StoryObj } from '@storybook/vue3'
import SnowflakeCanvas from '@/features/writing-project/WritingProject.vue'
import { template } from '@/features/process-templates/snowflake/template'
import { fullSampleData } from '@/features/demo/project-data'

const meta = {
  component: SnowflakeCanvas,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div style="width: 100vw; height: 100vh;"><story /></div>',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    a11y: {},
  },
} satisfies Meta<typeof SnowflakeCanvas>

export default meta
type Story = StoryObj<typeof SnowflakeCanvas>

export const Default: Story = {
  args: {
    project: {
      data: fullSampleData,
      template: template,
    },
  },
}
