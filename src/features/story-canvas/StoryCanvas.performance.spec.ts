import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import StoryCanvas from '@/features/story-canvas/StoryCanvas.vue'
import { fullSampleData } from '@/features/demo/project-data'
import { template } from '@features/process-templates/snowflake/template'
import { strings } from '@features/process-templates/snowflake/strings'

const TEST_LOADTIME_THRESHOLDS = {
  sidebar: 1000,
  canvas: 7000,
}

describe('StoryCanvas Performance', () => {
  it('renders sidebar immediately and canvas eventually', async () => {
    const startTime = performance.now()

    render(StoryCanvas, {
      props: {
        data: fullSampleData,
        template,
        strings,
      },
    })

    const sidebar = page.getByText('Project Context')
    await expect.element(sidebar).toBeVisible()

    const sidebarTime = performance.now() - startTime
    expect(sidebarTime).toBeLessThan(TEST_LOADTIME_THRESHOLDS.sidebar)

    const loader = page.getByText('Loading canvas...')
    await expect.element(loader).toBeVisible()

    await expect
      .poll(() => page.getByText('Loading canvas...').query() === null, {
        timeout: 10000,
      })
      .toBeTruthy()

    const totalTime = performance.now() - startTime
    expect(totalTime).toBeLessThan(TEST_LOADTIME_THRESHOLDS.canvas)
  })
})
