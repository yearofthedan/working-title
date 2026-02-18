import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { page } from 'vitest/browser'
import { composeStories } from '@storybook/vue3'
import * as stories from './EmptyCanvas.stories'
import { render } from '@/__testHelpers__/renderer'
import snowflakeStrings from '@/features/process-templates/snowflake/locales/en.json'
import { buildProjectData } from '../../project-storage/__testHelpers__/builders'

const { EmptyProject } = composeStories(stories)

describe('EmptyCanvas', () => {
  it('clicking the action button triggers the addStep mutation', async () => {
    const projectData = buildProjectData({ steps: [] })
    render(EmptyProject({ projectData }))

    const button = page.getByRole('button', {
      name: snowflakeStrings.template.root.actions.create_summary,
    })

    await button.click()

    expect(projectData.steps).toHaveLength(1)
    expect(projectData.steps[0]?.stepId).toBe('step-summary')
  })
})
