import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import ProjectListItem from './ProjectListItem.vue'
import { buildProviders } from '@/__testHelpers__/builders'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { createNotificationsBinding } from '@/features/common/feedback/useNotifications'
import {
  buildProjectMetadata,
  buildProjectStore,
} from '@/features/project-storage/__testHelpers__/builders'
import { ProjectStorage } from '@/features/project-storage/ProjectStorage'

describe('ProjectListItem', () => {
  it.scoped({ globalMocks: ['logging', 'storage'] })

  const renderComponent = (
    project = buildProjectMetadata(),
    projectStorage: ProjectStorage
  ) => {
    const [notifKey, notifStore] = createNotificationsBinding()
    const store = buildProjectStore({ storage: projectStorage })
    render(ProjectListItem, {
      props: { project },
      global: buildGlobals({
        provide: buildProviders({
          [PROJECT_STORE_KEY]: store,
          [notifKey as symbol]: notifStore,
        }),
      }),
    })

    return { notifStore, store }
  }

  it('renders project name', async ({ projectStorage }) => {
    const project = buildProjectMetadata({ name: 'Test Project' })
    await projectStorage.seedProjectMetadata(project)

    renderComponent(project, projectStorage.instance)

    await expect.element(page.getByRole('link', { name: 'Test Project' })).toBeVisible()
  })

  it('renders template badge', async ({ projectStorage }) => {
    const project = buildProjectMetadata({ templateId: 'snowflake-method-v1' })
    await projectStorage.seedProjectMetadata(project)

    renderComponent(project, projectStorage.instance)
    await expect.element(page.getByText(/template: snowflake/i)).toBeVisible()
  })

  it('renders file path when provided', async ({ projectStorage }) => {
    const project = buildProjectMetadata({ filePath: '/path/to/project.json' })
    await projectStorage.seedProjectMetadata(project)

    renderComponent(project, projectStorage.instance)

    await expect.element(page.getByText('/path/to/project.json')).toBeVisible()
  })

  it('does not render file path when not provided', async ({ projectStorage }) => {
    const project = buildProjectMetadata({ filePath: undefined })
    await projectStorage.seedProjectMetadata(project)

    renderComponent(project, projectStorage.instance)

    const pathElement = page.getByText('/path/to/project.json')
    await expect.element(pathElement).not.toBeInTheDocument()
  })

  it('shows confirmation dialog when delete button is clicked', async ({ projectStorage }) => {
    const project = buildProjectMetadata({ name: 'Delete Me' })
    await projectStorage.seedProjectMetadata(project)

    renderComponent(project, projectStorage.instance)

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    await expect.element(page.getByRole('heading', { name: /delete project\?/i })).toBeVisible()
    await expect
      .element(page.getByText(/are you sure you want to remove "Delete Me" from your list\?/i))
      .toBeVisible()
  })

  it('calls delete when deletion is confirmed', async ({ projectStorage }) => {
    const project = buildProjectMetadata({ id: '123' })
    await projectStorage.seedProjectMetadata(project)

    renderComponent(project, projectStorage.instance)

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    const confirmBtn = page.getByRole('dialog').getByRole('button', { name: 'Delete' })
    await confirmBtn.click()

    await vi.waitFor(() => {
      expect(vi.mocked(projectStorage.instance.delete)).toHaveBeenCalledWith('123')
    })
  })

  it('shows success notification when deletion is successful', async ({ projectStorage }) => {
    const project = buildProjectMetadata()
    await projectStorage.seedProjectMetadata(project)
    const { notifStore } = renderComponent(project, projectStorage.instance)

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    const confirmBtn = page.getByRole('dialog').getByRole('button', { name: 'Delete' })
    await confirmBtn.click()

    await vi.waitUntil(() =>
      notifStore.notifications.value.some((n) => n.message === 'Project deleted successfully')
    )

    expect(notifStore.notifications.value).toContainEqual(
      expect.objectContaining({
        type: 'success',
        message: 'Project deleted successfully',
      })
    )
  })

  it('shows error notification when deletion fails', async ({ projectStorage }) => {
    const project = buildProjectMetadata()
    await projectStorage.seedProjectMetadata(project)

    vi.mocked(projectStorage.instance.delete).mockRejectedValue(new Error('Storage failure'))

    const { notifStore } = renderComponent(project, projectStorage.instance)

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    const confirmBtn = page.getByRole('dialog').getByRole('button', { name: 'Delete' })
    await confirmBtn.click()

    await vi.waitUntil(() =>
      notifStore.notifications.value.some((n) => n.message === 'Failed to delete project')
    )

    expect(notifStore.notifications.value).toContainEqual(
      expect.objectContaining({
        type: 'error',
        message: 'Failed to delete project',
      })
    )
  })
})
