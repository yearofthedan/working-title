import { test, expect } from '@playwright/test'

test.describe('App Smoke Test', () => {
  test('should load the home page and navigate to a new project', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Working Title/)
    await expect(page.locator('h1')).toContainText('Working Title')

    const newProjectButton = page.getByRole('button', { name: /New Project/i })
    await expect(newProjectButton).toBeVisible()

    await test.step('Navigate to new project', async () => {
      await Promise.all([page.waitForURL(/\/project/), newProjectButton.click()])
      await expect(page).toHaveTitle(/Writing Project/)
    })

    const sidebar = page.getByRole('complementary')
    await expect(sidebar).toBeVisible()

    const canvas = page.getByText('Start Your Story')
    await expect(canvas).toBeVisible()
  })

  test('should load the home page and navigate to the demo', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Working Title/)
    await expect(page.locator('h1')).toContainText('Working Title')

    const demoLink = page.getByRole('link', { name: /Demo/i })
    await expect(demoLink).toBeVisible()

    await test.step('Navigate to the demo project', async () => {
      await Promise.all([page.waitForURL(/\/demo$/), demoLink.click()])
      await expect(page).toHaveTitle(/Demo/)
    })

    const sidebar = page.getByRole('complementary')
    await expect(sidebar).toBeVisible()

    // Verify project loaded by checking sidebar content (loads immediately, no layout wait needed)
    const genreField = page.getByRole('textbox', { name: /Genre/i })
    await expect(genreField).toBeVisible()
    await expect(genreField).toHaveValue('Dystopian / Political Fiction')
  })
})
