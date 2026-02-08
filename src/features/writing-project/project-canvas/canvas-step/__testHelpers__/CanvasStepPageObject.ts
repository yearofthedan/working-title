import { BasePageObject } from '@/features/__testHelpers__/BasePageObject'
import strings from '@/locales/en.json'

export class CanvasStepPageObject extends BasePageObject {
  get expandButton() {
    return this.host.getByRole('button', {
      name: strings.writingProject.canvas.actions.openInPanel,
    })
  }

  get textbox() {
    return this.host.getByRole('textbox')
  }

  async clickToEdit() {
    await this.textbox.click({ force: true })
    return this.textbox
  }

  async hover() {
    await this.host.hover({ force: true })
  }

  async clickExpand() {
    await this.hover()
    await this.expandButton.click()
  }

  actionButton(name: string | RegExp) {
    return this.host.getByRole('button', { name })
  }
}
