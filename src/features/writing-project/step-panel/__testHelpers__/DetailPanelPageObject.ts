import { BasePageObject } from '@/features/__testHelpers__/BasePageObject'
import appMessages from '@/i18n/en.json'

export class DetailPanelPageObject extends BasePageObject {
  get title() {
    return this.host.getByRole('heading', { level: 2 })
  }

  get contentArea() {
    return this.host.getByRole('region', {
      name: appMessages.writingProject.detailPanel.contentArea,
    })
  }

  get textbox() {
    return this.contentArea.getByRole('textbox')
  }

  get closeButton() {
    return this.host.getByRole('button', { name: appMessages.common.actions.close })
  }
}
