import { describe, expect, beforeEach, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import HomePage from './HomePage.vue'
import { HomePageObject } from './__testHelpers__/HomePageObject'
import {
  buildProjectStore,
  buildProjectMetadata,
} from '@/features/project-storage/__testHelpers__/builders'
import { buildProviders } from '@/__testHelpers__/builders'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { createNotificationsBinding } from '@/composables/useNotifications'
import type { ProjectStorage } from '../project-storage/ProjectStorage'

describe('HomePage', () => {
  it.scoped({ globalMocks: ['logging', 'storage'] })
  const renderComponent = (storage: ProjectStorage) => {
    const [notifKey, notifStore] = createNotificationsBinding()
    const store = buildProjectStore({ storage })
    render(HomePage, {
      global: buildGlobals({
        provide: buildProviders({
          [PROJECT_STORE_KEY]: store,
          [notifKey as symbol]: notifStore,
        }),
      }),
    })
    const po = new HomePageObject(page)

    return { po, notifStore, store }
  }

  beforeEach(async () => {
    window.history.pushState(null, '', '/')
  })

  it('shows empty state when no projects exist', async ({ projectStorage }) => {
    const { po } = renderComponent(projectStorage.instance)

    await expect.element(po.emptyState).toBeVisible()
  })

  it('displays project cards when projects exist', async ({ projectStorage }) => {
    await projectStorage.seedProjectMetadata(buildProjectMetadata({ name: 'My Masterpiece' }))

    const { po } = renderComponent(projectStorage.instance)

    await expect.element(po.projectItem('My Masterpiece')).toBeVisible()
  })

  it('can create a new project via the dialog and navigates to it', async ({ projectStorage }) => {
    const { po, store } = renderComponent(projectStorage.instance)

    await po.newProjectButton.click()

    await page.getByLabelText(/project name/i).fill('My New Novel')
    await page.getByRole('button', { name: /create/i }).click()

    await vi.waitFor(() => {
      expect(store.list.projects.value).toHaveLength(1)
    })

    const newProject = store.list.projects.value[0]!
    expect(newProject.name).toBe('My New Novel')

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain(`/project/${newProject?.id}`)
    })
  })

  it('navigates to an existing project when clicked', async ({ projectStorage }) => {
    await projectStorage.seedProjectMetadata(
      buildProjectMetadata({ id: 'existing-id', name: 'Existing Project' })
    )
    const { po } = renderComponent(projectStorage.instance)

    await po.projectItem('Existing Project').click()

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain(`/project/existing-id`)
    })
  })

  it('shows loading state during "Open File" flow', async ({ projectStorage }) => {
    const { po } = renderComponent(projectStorage.instance)

    await po.openFileButton.click()

    await expect.element(page.getByRole('status', { name: 'loading' })).toBeVisible()
  })

  it('navigates to the demo page', async ({ projectStorage }) => {
    const { po } = renderComponent(projectStorage.instance)

    await po.viewDemoButton.click()

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain('demo')
    })
  })

  it('shows error notification when project listing fails', async ({ projectStorage }) => {
    vi.mocked(projectStorage.instance.listProjects).mockRejectedValue(new Error('Storage failure'))

    const { notifStore } = renderComponent(projectStorage.instance)

    await vi.waitUntil(() =>
      notifStore.notifications.value.some((n) => n.message === 'Failed to load projects')
    )

    expect(notifStore.notifications.value).toContainEqual(
      expect.objectContaining({
        type: 'error',
        message: 'Failed to load projects',
      })
    )
  })

  it('shows error notification when project creation fails', async ({ projectStorage }) => {
    vi.mocked(projectStorage.instance.save).mockRejectedValue(new Error('Storage failure'))

    const { notifStore, po } = renderComponent(projectStorage.instance)

    await po.newProjectButton.click()
    await page.getByLabelText(/project name/i).fill('My New Novel')
    await page.getByRole('button', { name: /create/i }).click()

    await vi.waitUntil(() =>
      notifStore.notifications.value.some((n) => n.message === 'Failed to create project')
    )

    expect(notifStore.notifications.value).toContainEqual(
      expect.objectContaining({
        type: 'error',
        message: 'Failed to create project',
      })
    )
  })

  it('shows error notification when project opening fails', async ({ projectStorage }) => {
    vi.mocked(projectStorage.instance.save).mockRejectedValue(new Error('Storage failure'))

    const { notifStore, po } = renderComponent(projectStorage.instance)

    await po.openFileButton.click()
    await vi.waitUntil(() =>
      notifStore.notifications.value.some((n) => n.message === 'Failed to open project')
    )

    expect(notifStore.notifications.value).toContainEqual(
      expect.objectContaining({
        type: 'error',
        message: 'Failed to open project',
      })
    )
  })
})
