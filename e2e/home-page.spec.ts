import { test, expect } from './fixtures'
import strings from '@/i18n/en.json' with { type: 'json' }

test('Project Management Journey', async ({ page }) => {
  const DUMMY_PROJECT_NAME = 'My E2E Story'
  await test.step('Initial home page is empty', async () => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Working Title' })).toBeVisible()

    await expect(page.getByText(strings.app.home.projectList.empty)).toBeVisible()
  })

  await test.step('Create a new project', async () => {
    await page.getByRole('button', { name: /New Project/i }).click()
    await page.getByLabel(strings.app.home.newProject.dialog.nameLabel).fill(DUMMY_PROJECT_NAME)
    await page.getByRole('button', { name: strings.app.home.newProject.dialog.create }).click()

    await expect(page.getByText(strings.app.canvas.emptyState.title)).toBeVisible()
    await expect(page).toHaveURL(/\/project/)
  })

  await test.step('Verify project appears on home page', async () => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Working Title' })).toBeVisible()
    await expect(page.getByText(strings.app.canvas.emptyState.title)).not.toBeVisible()

    const projectCard = page.getByRole('link', { name: DUMMY_PROJECT_NAME })

    await expect(projectCard).toBeVisible()
  })

  await test.step('Navigate back into the project', async () => {
    await page.getByRole('link', { name: DUMMY_PROJECT_NAME }).click()

    await expect(page.getByText(strings.app.canvas.emptyState.title)).toBeVisible()
    await expect(page.getByText('Project Context')).toBeVisible()
    await expect(page).toHaveURL(/\/project/)
  })

  await test.step('Delete project from home page', async () => {
    await page.goto('/')
    const projectCard = page.getByRole('link', { name: DUMMY_PROJECT_NAME })
    await expect(projectCard).toBeVisible()

    await projectCard.hover()
    const deleteBtn = page.getByRole('button', { name: /delete project/i })
    await deleteBtn.click()

    const confirmBtn = page.getByRole('dialog').getByRole('button', { name: 'Delete' })
    await confirmBtn.click()

    await expect(page.getByRole('status')).toContainText('Project deleted successfully')
    await expect(projectCard).not.toBeVisible()
    await expect(page.getByText('No projects yet')).toBeVisible()
  })
})

test('Directory-based Storage Flow', async ({ page }) => {
  await page.goto('/')

  await test.step('Open project folder', async () => {
    const openFolderBtn = page.getByRole('button', { name: /Open Project Folder/i })
    await expect(openFolderBtn).toBeVisible()

    await openFolderBtn.click()

    await expect(page).toHaveURL(/\/project/, { timeout: 10000 })

    await expect(page.getByText('Start Your Story')).toBeVisible()
  })

  await test.step('Project appears in history after opening', async () => {
    await page.goto('/')

    // The mock directory name is 'mock-project.narrative' in fixtures.ts
    // but the project name inside project.wt is 'Mock Project'
    const projectList = page.locator('main')
    await expect(projectList.getByRole('link', { name: 'Mock Project' })).toBeVisible()
  })
})
