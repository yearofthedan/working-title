import { StoryPageObject } from '@/features/story/__testHelpers__/StoryPageObject'
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
    return new StoryPageObject(this.page)
  }

  async navToDemo() {
    await this.viewDemoButton.click()
    return new StoryPageObject(this.page)
  }
}
