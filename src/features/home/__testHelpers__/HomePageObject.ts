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
    return this.page.getByRole('link', { name: 'New Project' })
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
