import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { page, userEvent } from 'vitest/browser'
import StoryCanvas from './StoryCanvas.vue'
import { template } from '@/features/process-templates/snowflake/template'
import { strings } from '@/features/process-templates/snowflake/strings'
import { ref } from 'vue'
import { buildProjectData, buildStep } from '@/specs/__testHelpers__/builders'

describe('StoryCanvas Integration', () => {
  it('updates project data when node content changes', async () => {
    const data = ref(
      buildProjectData({
        steps: [
          buildStep({
            id: '1',
            stepId: 'step-summary',
            content: { text: '<p>Initial content</p>' },
          }),
        ],
      })
    )
    render(StoryCanvas, {
      props: {
        data: data.value,
        template,
        strings,
      },
      attrs: {
        style: 'height: 100vh; width: 100vw;',
      },
    })

    const richTextNode = page.getByText('Initial content')

    await expect.element(richTextNode).toBeVisible()
    await richTextNode.click()
    await richTextNode.fill('Updated via integration')
    await userEvent.tab()

    await vi.waitFor(() =>
      expect(data.value.steps[0]!.content.text).toContain('Updated via integration')
    )
  })
})
