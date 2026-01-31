import { WritingProjectPageObject } from '@/features/writing-project/__testHelpers__/WritingProjectPageObject'
import type { BrowserPage } from 'vitest/browser'

export class HomePageObject {
  private page: BrowserPage

  constructor(page: BrowserPage) {
    this.page = page
  }

  get header() {
    return this.page.getByRole('heading', { name: 'Working Title' })
  }

  get viewDemoButton() {
    return this.page.getByRole('link', { name: 'View Demo' })
  }

  get newProjectButton() {
    return this.page.getByRole('button', { name: /new project/i })
  }

  get openFileButton() {
    return this.page.getByRole('button', { name: /open file/i })
  }

  get emptyState() {
    return this.page.getByText('No projects yet')
  }

  projectItem(name: string) {
    return this.page.getByRole('link', { name })
  }

  async navToNewProject() {
    await this.newProjectButton.click()
    return new WritingProjectPageObject(this.page)
  }

  async navToDemo() {
    await this.viewDemoButton.click()
    return new WritingProjectPageObject(this.page)
  }
}
