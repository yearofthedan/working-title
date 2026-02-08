import type { BrowserPage } from 'vitest/browser'
import appMessages from '@/locales/en.json'
import { BasePageObject } from '@/features/__testHelpers__/BasePageObject'
import { ProjectSidebarPageObject } from '../project-sidebar/__testHelpers__/ProjectSidebarPageObject'
import { CanvasPageObject } from '../project-canvas/__testHelpers__/ProjectCanvasPageObject'
import { DetailPanelPageObject } from '../step-panel/__testHelpers__/DetailPanelPageObject'

const writingProjectMessages = appMessages.writingProject

export class WritingProjectPageObject extends BasePageObject {
  constructor(page: BrowserPage) {
    super(page)
  }

  get sidebar() {
    const locator = this.host.getByRole('complementary', {
      name: writingProjectMessages.sidebar.contextTitle,
    })
    return new ProjectSidebarPageObject(locator)
  }

  get canvas() {
    return new CanvasPageObject(this.host)
  }

  get detailPanel() {
    // Filter out the sidebar to find the detail panel
    const locator = this.host
      .getByRole('complementary')
      .filter({ hasNotText: writingProjectMessages.sidebar.contextTitle })
    return new DetailPanelPageObject(locator)
  }
}
