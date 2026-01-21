import type { BrowserPage } from 'vitest/browser'

export class WritingProjectPageObject {
  private page: BrowserPage

  constructor(page: BrowserPage) {
    this.page = page
  }

  get sidebarHeader() {
    return this.page.getByRole('heading', { name: 'Project Context' })
  }
}
