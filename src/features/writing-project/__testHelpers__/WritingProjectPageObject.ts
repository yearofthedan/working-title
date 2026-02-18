import appMessages from '@/i18n/en.json'
import { BasePageObject, type Locatable } from '@/features/__testHelpers__/BasePageObject'
import { ProjectSidebarPageObject } from '../sidebar/__testHelpers__/ProjectSidebarPageObject'
import { CanvasPageObject } from '../canvas/__testHelpers__/ProjectCanvasPageObject'
import { DetailPanelPageObject } from '../step-panel/__testHelpers__/DetailPanelPageObject'

const writingProjectMessages = appMessages.writingProject

export class WritingProjectPageObject extends BasePageObject {
  constructor(page: Locatable) {
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
