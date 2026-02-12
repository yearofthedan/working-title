import { BasePageObject, type Locatable } from '@/features/__testHelpers__/BasePageObject'
import { WritingProjectPageObject } from '@/features/writing-project/__testHelpers__/WritingProjectPageObject'

export class HomePageObject extends BasePageObject {
  constructor(page: Locatable) {
    super(page)
  }

  get header() {
    return this.host.getByRole('heading', { name: 'Working Title' })
  }

  get viewDemoButton() {
    return this.host.getByRole('link', { name: 'View Demo' })
  }

  get newProjectButton() {
    return this.host.getByRole('button', { name: /new project/i })
  }

  get openFileButton() {
    return this.host.getByRole('button', { name: /open file/i })
  }

  get openDirectoryButton() {
    return this.host.getByRole('button', { name: /open project folder/i })
  }

  get emptyState() {
    return this.host.getByText('No projects yet')
  }

  projectItem(name: string) {
    return this.host.getByRole('link', { name })
  }

  async navToNewProject() {
    await this.newProjectButton.click()
    return new WritingProjectPageObject(this.host)
  }

  async navToDemo() {
    await this.viewDemoButton.click()
    return new WritingProjectPageObject(this.host)
  }
}
