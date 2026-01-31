import { test, expect } from './fixtures'

test('Project Management Journey', async ({ page }) => {
  const DUMMY_PROJECT_NAME = 'My E2E Story'
  await test.step('Initial home page is empty', async () => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Working Title' })).toBeVisible()

    await expect(page.getByText('No projects yet')).toBeVisible()
  })

  await test.step('Create a new project', async () => {
    await page.getByRole('button', { name: /New Project/i }).click()
    await page.getByLabel(/Project Name/i).fill(DUMMY_PROJECT_NAME)
    await page.getByRole('button', { name: /Create Project/i }).click()

    await expect(page.getByText('Start Your Story')).toBeVisible()
    await expect(page).toHaveURL(/\/project/)
  })

  await test.step('Verify project appears on home page', async () => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Working Title' })).toBeVisible()
    await expect(page.getByText('Start Your Story')).not.toBeVisible()

    const projectCard = page.getByRole('link', { name: DUMMY_PROJECT_NAME })

    await expect(projectCard).toBeVisible()
  })

  await test.step('Navigate back into the project', async () => {
    await page.getByRole('link', { name: DUMMY_PROJECT_NAME }).click()

    await expect(page.getByText('Start Your Story')).toBeVisible()
    await expect(page.getByText('Project Context')).toBeVisible()
    await expect(page).toHaveURL(/\/project/)
  })
})
