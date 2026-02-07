import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from 'storybook/test'
import BrowserSupportWarning from '@/features/common/error-handling/BrowserSupportWarning.vue'
import * as browserUtils from '@/utils/browsers'

const meta: Meta<typeof BrowserSupportWarning> = {
  component: BrowserSupportWarning,
  decorators: [
    () => ({
      template: `
        <div class="min-h-50 bg-paper">
          <story />
          <div class="p-8 text-center text-ink/40">
            Page content would follow below the warning...
          </div>
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof BrowserSupportWarning>

export default meta

type Story = StoryObj<typeof BrowserSupportWarning>

export const Unsupported: Story = {
  beforeEach: () => {
    browserUtils.browserSupport.supportsFilePicker = fn().mockReturnValue(false)
  },
}

export const Supported: Story = {
  beforeEach: () => {
    browserUtils.browserSupport.supportsFilePicker = fn().mockReturnValue(true)
  },
}
