import type { Meta, StoryObj } from '@storybook/vue3'
import SnowflakeCanvas from '@features/story-canvas/components/StoryCanvas.vue'
import { template } from '@/features/snowflake/template'
import { strings } from '@/features/snowflake/strings'
import { fullSampleData } from '@/features/snowflake/data-stub'

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
    projectData: fullSampleData,
    template: template,
    strings: strings,
  },
}
