import { BasePageObject } from '@/features/__testHelpers__/BasePageObject'

export class ProjectSidebarPageObject extends BasePageObject {
  get projectNameHeading() {
    return this.host.getByRole('heading', { level: 1 })
  }

  get fields() {
    return this.host.getByRole('textbox')
  }

  fieldByLabel(label: string) {
    return this.host.getByRole('textbox', { name: label })
  }
}
