import { describe, it, expect, vi, beforeEach } from 'vitest'
import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import HomePage from './HomePage.vue'
import { HomePageObject } from './__testHelpers__/HomePageObject'
import { buildInMemoryProjectStore } from '@/features/project-storage/__testHelpers__/builders'
import { buildProviders } from '@/__testHelpers__/builders'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'

describe('HomePage', () => {
  const renderComponent = (store = buildInMemoryProjectStore()) => {
    render(HomePage, {
      global: buildGlobals({
        provide: buildProviders({
          [PROJECT_STORE_KEY]: store,
        }),
      }),
    })
    const po = new HomePageObject(page)

    return { po, store }
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
    const store = buildInMemoryProjectStore()
    await store.createProject('My Masterpiece', 'snowflake-method-v1')

    const { po } = renderComponent(store)

    await expect.element(po.projectItem('My Masterpiece')).toBeVisible()
  })

  it('can create a new project via the dialog and navigates to it', async () => {
    const { po, store } = renderComponent()

    await po.newProjectButton.click()

    await page.getByLabelText(/project name/i).fill('My New Novel')
    await page.getByRole('button', { name: /create/i }).click()

    const newProject = store.projects.value.find((p) => p.name === 'My New Novel')
    expect(newProject).toBeDefined()

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain(`/project/${newProject?.id}`)
    })
  })

  it('navigates to an existing project when clicked', async () => {
    const store = buildInMemoryProjectStore()
    const metadata = await store.createProject('Existing Project', 'snowflake-method-v1')

    const { po } = renderComponent(store)

    await po.projectItem('Existing Project').click()

    await vi.waitFor(() => {
      expect(window.location.pathname).toContain(`/project/${metadata.id}`)
    })
  })

  it('shows loading state during "Open File" flow', async () => {
    const store = buildInMemoryProjectStore({ treatAsReal: true, delay: 100 })

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
})
