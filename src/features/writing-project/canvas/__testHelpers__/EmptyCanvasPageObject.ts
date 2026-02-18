import { BasePageObject } from '@/features/__testHelpers__/BasePageObject'
import appMessages from '@/i18n/en.json'

export class EmptyCanvasPageObject extends BasePageObject {
  get title() {
    return this.host.getByText(appMessages.app.canvas.emptyState.title)
  }

  actionButton(name: string | RegExp) {
    return this.host.getByRole('button', { name })
  }
}
