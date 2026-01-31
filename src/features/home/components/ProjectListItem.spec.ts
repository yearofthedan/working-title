import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { ref } from 'vue'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import ProjectListItem from './ProjectListItem.vue'
import { buildProviders } from '@/__testHelpers__/builders'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import type { ProjectStore } from '@/features/project-storage/store'
import type { ProjectMetadata } from '@/features/project-storage/types'

describe('ProjectListItem', () => {
  const defaultProject: ProjectMetadata = {
    id: '1',
    name: 'Test Project',
    templateId: 'snowflake-method-v1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const renderComponent = (project = defaultProject, store = {}) => {
    render(ProjectListItem, {
      props: { project },
      global: buildGlobals({
        provide: buildProviders({
          [PROJECT_STORE_KEY]: {
            deleteProject: async () => {},
            deleteState: ref({ status: 'idle' }),
            ...store,
          } as unknown as ProjectStore,
        }),
      }),
    })
  }

  it('renders project name', async () => {
    renderComponent()
    await expect.element(page.getByRole('link', { name: 'Test Project' })).toBeVisible()
  })

  it('renders template badge', async () => {
    renderComponent()
    await expect.element(page.getByText(/template: snowflake/i)).toBeVisible()
  })

  it('renders file path when provided', async () => {
    renderComponent({
      ...defaultProject,
      filePath: '/path/to/project.json',
    })
    await expect.element(page.getByText('/path/to/project.json')).toBeVisible()
  })

  it('does not render file path when not provided', async () => {
    renderComponent()
    const pathElement = page.getByText('/path/to/project.json')
    await expect.element(pathElement).not.toBeInTheDocument()
  })

  it('shows confirmation dialog when delete button is clicked', async () => {
    renderComponent()

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    await expect.element(page.getByRole('heading', { name: /delete project\?/i })).toBeVisible()
    await expect
      .element(page.getByText(/are you sure you want to remove "Test Project" from your list\?/i))
      .toBeVisible()
  })
})
