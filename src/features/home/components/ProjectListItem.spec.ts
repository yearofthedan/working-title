import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import ProjectListItem from './ProjectListItem.vue'
import { buildProviders } from '@/__testHelpers__/builders'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { createNotificationsBinding } from '@/composables/useNotifications'
import {
  buildProjectMetadata,
  buildInMemoryProjectStore,
} from '@/features/project-storage/__testHelpers__/builders'
import { createProjectStore } from '@/features/project-storage/store'
import { ProjectStorage } from '@/features/project-storage/ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'

describe('ProjectListItem', () => {
  it.scoped({ globalMocks: ['logging'] })

  const renderComponent = (
    project = buildProjectMetadata(),
    store = buildInMemoryProjectStore({ initialProjects: [project] })
  ) => {
    const [notifKey, notifStore] = createNotificationsBinding()

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

  it('renders project name', async () => {
    renderComponent(buildProjectMetadata({ name: 'Test Project' }))
    await expect.element(page.getByRole('link', { name: 'Test Project' })).toBeVisible()
  })

  it('renders template badge', async () => {
    renderComponent(buildProjectMetadata({ templateId: 'snowflake-method-v1' }))
    await expect.element(page.getByText(/template: snowflake/i)).toBeVisible()
  })

  it('renders file path when provided', async () => {
    renderComponent(buildProjectMetadata({ filePath: '/path/to/project.json' }))
    await expect.element(page.getByText('/path/to/project.json')).toBeVisible()
  })

  it('does not render file path when not provided', async () => {
    renderComponent(buildProjectMetadata({ filePath: undefined }))
    const pathElement = page.getByText('/path/to/project.json')
    await expect.element(pathElement).not.toBeInTheDocument()
  })

  it('shows confirmation dialog when delete button is clicked', async () => {
    const project = buildProjectMetadata({ name: 'Delete Me' })
    renderComponent(project)

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    await expect.element(page.getByRole('heading', { name: /delete project\?/i })).toBeVisible()
    await expect
      .element(page.getByText(/are you sure you want to remove "Delete Me" from your list\?/i))
      .toBeVisible()
  })

  it('calls deleteProject when deletion is confirmed', async () => {
    const project = buildProjectMetadata({ id: '123' })
    const store = buildInMemoryProjectStore({ initialProjects: [project] })
    const deleteSpy = vi.spyOn(store, 'deleteProject')

    renderComponent(project, store)

    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    const confirmBtn = page.getByRole('dialog').getByRole('button', { name: 'Delete' })
    await confirmBtn.click()

    await vi.waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('123')
    })
  })

  it('shows success notification when deletion is successful', async () => {
    const project = buildProjectMetadata({ id: '123' })
    const { notifStore } = renderComponent(project)

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

  it('shows error notification when deletion fails', async () => {
    const project = buildProjectMetadata({ id: '123' })
    const storage = new ProjectStorage(
      new InMemoryIndexedDBProvider() as unknown as ProjectStorage['provider']
    )
    const store = createProjectStore(storage, new InMemoryStorageProvider())

    vi.spyOn(storage, 'delete').mockRejectedValue(new Error('Storage failure'))

    const { notifStore } = renderComponent(project, store)

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
