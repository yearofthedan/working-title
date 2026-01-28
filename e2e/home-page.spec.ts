import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      const DB_NAME = 'working-title-db'
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to delete database'))
        request.onblocked = () => resolve()
      })
    })
    await page.goto('/')
  })

  test('displays empty state when no projects exist', async ({ page }) => {
    await expect(page.getByText('No projects yet')).toBeVisible()
  })

  test('displays project card with metadata after creation', async ({ page }) => {
    await page.getByRole('button', { name: /New Project/i }).click()
    await page.goto('/')

    const projectCard = page.getByRole('link', { name: /Untitled Story/i })
    await expect(projectCard).toBeVisible()
    await expect(projectCard.getByText('snowflake-method-v1')).toBeVisible()
    await expect(projectCard.getByText(/Updated: .+/i)).toBeVisible()
  })

  test('navigates to project when clicking project card', async ({ page }) => {
    await page.getByRole('button', { name: /New Project/i }).click()
    await page.goto('/')

    await page.getByRole('link', { name: /Untitled Story/i }).click()

    // Verify navigation back to project view
    await expect(page).toHaveURL(/\/project/)
  })
})
