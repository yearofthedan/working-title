import { BasePageObject, type Locatable } from '@/features/__testHelpers__/BasePageObject'

export class AppConfirmationDialogPageObject extends BasePageObject {
  constructor(page: Locatable) {
    super(page)
  }
  get confirmButton() {
    return this.host.getByRole('button', { name: 'Confirm' })
  }

  get cancelButton() {
    return this.host.getByRole('button', { name: 'Cancel' })
  }

  get dialog() {
    return this.host.getByRole('dialog')
  }

  get closedDialog() {
    return this.host.getByRole('dialog', { includeHidden: true })
  }
}
