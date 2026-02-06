import { describe, expect, beforeEach, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import HomePage from './HomePage.vue'
import { HomePageObject } from './__testHelpers__/HomePageObject'
import {
  buildInMemoryProjectStore,
  buildProjectMetadata,
} from '@/features/project-storage/__testHelpers__/builders'
import { buildProviders } from '@/__testHelpers__/builders'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { createNotificationsBinding } from '@/composables/useNotifications'
import { buildMockProjectStorage } from '../project-storage/__testHelpers__/mocks'

describe('HomePage', () => {
  it.scoped({ globalMocks: ['logging'] })
  const renderComponent = (store = buildInMemoryProjectStore()) => {
    const [notifKey, notifStore] = createNotificationsBinding()

    render(HomePage, {
      global: buildGlobals({
        provide: buildProviders({
          [PROJECT_STORE_KEY]: store,
          [notifKey as symbol]: notifStore,
        }),
      }),
    })
    const po = new HomePageObject(page)

    return { po, store, notifStore }
  }

  beforeEach(async () => {
    window.history.pushState(null, '', '/')
  })

  it('shows empty state when no projects exist', async () => {
    renderComponent()
    const po = new HomePageObject(page)

    await expect.element(po.emptyState).toBeVisible()
  })

  it('displays project cards when projects exist', async () => {
    const store = buildInMemoryProjectStore({
      initialProjects: [buildProjectMetadata({ name: 'My Masterpiece' })],
    })

    const { po } = renderComponent(store)

    await expect.element(po.projectItem('My Masterpiece')).toBeVisible()
  })

  it('can create a new project via the dialog and navigates to it', async () => {
    const { po, store } = renderComponent()

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

  it('navigates to an existing project when clicked', async () => {
    const metadata = buildProjectMetadata({ id: 'existing-id', name: 'Existing Project' })
    const store = buildInMemoryProjectStore({
      initialProjects: [metadata],
    })

    const { po } = renderComponent(store)

    await po.projectItem('Existing Project').click()

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain(`/project/${metadata.id}`)
    })
  })

  it('shows loading state during "Open File" flow', async () => {
    const store = buildInMemoryProjectStore({ treatAsReal: true, delay: 1000 })

    const { po } = renderComponent(store)

    await po.openFileButton.click()

    await expect.element(page.getByRole('status', { name: 'loading' })).toBeVisible()
  })

  it('navigates to the demo page', async () => {
    const { po } = renderComponent()

    await po.viewDemoButton.click()

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain('demo')
    })
  })

  it('shows error notification when project listing fails', async () => {
    const storage = buildMockProjectStorage()
    vi.mocked(storage.listProjects).mockRejectedValue(new Error('Storage failure'))

    const store = buildInMemoryProjectStore({ storage })

    const { notifStore } = renderComponent(store)

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

  it('shows error notification when project creation fails', async () => {
    const storage = buildMockProjectStorage()
    vi.mocked(storage.save).mockRejectedValue(new Error('Storage failure'))

    const store = buildInMemoryProjectStore({ storage })

    const { notifStore, po } = renderComponent(store)

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

  it('shows error notification when project opening fails', async () => {
    const storage = buildMockProjectStorage()
    vi.mocked(storage.save).mockRejectedValue(new Error('Storage failure'))

    const store = buildInMemoryProjectStore({ storage })

    const { notifStore, po } = renderComponent(store)

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
