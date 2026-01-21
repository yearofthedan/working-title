import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import App from '@/App.vue'
import { router } from '@/router/routes'
import { HomePageObject } from '../features/home/__testHelpers__/HomePageObject'

describe('routing', () => {
  const renderComponent = async () => {
    render(App, {
      global: {
        plugins: [router],
      },
    })
    await router.push('/')
    await router.isReady()

    return new HomePageObject(page)
  }

  it('loads the home page', async () => {
    const home = await renderComponent()

    await expect.element(home.header).toBeVisible()
    await expect.element(home.viewDemoButton).toBeVisible()
    await expect.element(home.newProjectButton).toBeVisible()
  })

  it('navigates to demo page when clicking View Demo', async () => {
    const home = await renderComponent()

    await expect.element(home.viewDemoButton).toBeVisible()
    const demoPage = await home.navToDemo()
    await expect.element(demoPage.sidebarHeader).toBeVisible()

    expect(router.currentRoute.value.name).toBe('demo')
  })

  it('navigates to project page when clicking New Project', async () => {
    const home = await renderComponent()

    await expect.element(home.viewDemoButton).toBeVisible()
    const demoPage = await home.navToNewProject()
    await expect.element(demoPage.sidebarHeader).toBeVisible()

    expect(router.currentRoute.value.name).toBe('project')
  })
})
