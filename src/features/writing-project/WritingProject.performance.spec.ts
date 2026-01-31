import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { render } from '@/__testHelpers__/renderer'
import WritingProject from '@/features/writing-project/WritingProject.vue'
import { fullSampleData } from '@/features/demo/project-data'
import { template } from '@/features/process-templates/snowflake/template'

const TEST_LOADTIME_THRESHOLDS = {
  sidebar: 1000,
  canvas: 7000,
}

describe('WritingProject Performance', () => {
  it('renders sidebar immediately and canvas eventually', async () => {
    const startTime = performance.now()

    render(WritingProject, {
      props: {
        project: {
          data: fullSampleData,
          template,
        }
      },
    })

    const sidebar = page.getByText('Project Context')
    await expect.element(sidebar).toBeVisible()

    const sidebarTime = performance.now() - startTime
    expect(sidebarTime).toBeLessThan(TEST_LOADTIME_THRESHOLDS.sidebar)

    const loader = page.getByText('Loading project...')
    await expect.element(loader).toBeVisible()

    await expect
      .poll(() => page.getByText('Loading project...').query() === null, {
        timeout: 10000,
      })
      .toBeTruthy()

    const totalTime = performance.now() - startTime
    expect(totalTime).toBeLessThan(TEST_LOADTIME_THRESHOLDS.canvas)
  })
})
