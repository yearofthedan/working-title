import { test as base } from '@playwright/test'

export const test = base.extend<{ mockFilePicker: void, cleanDB: void }>({
  cleanDB: [
    async ({ page }, use) => {
      await page.goto('/')
      await page.evaluate(() => indexedDB.deleteDatabase('working-title-db'))
      await use()
    },
    { auto: true },
  ],
  mockFilePicker: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        class MockFileHandle {
          kind = 'file'
          name: string

          constructor(name = 'mock-save-file.json') {
            this.name = name
          }

          createWritable = async () => ({
            write: async () => {},
            close: async () => {},
          })
          async queryPermission() {
            return 'granted'
          }

          async requestPermission() {
            return 'granted'
          }

          async getFile() {
            const mockProjectData = {
              projectId: 'mock-id',
              steps: [],
              connections: [],
              schemaVersion: '1.0.0',
              templateId: 'snowflake-method-v1',
              meta: {
                name: 'Mock Project',
                lastModified: new Date().toISOString(),
                created: new Date().toISOString(),
              },
            }
            const content = this.name === 'project.wt' ? JSON.stringify(mockProjectData) : '{}'
            return new File([content], this.name, {
              type: 'application/json',
            })
          }
        }

        class MockDirectoryHandle {
          kind = 'directory'
          name = 'mock-project.narrative'

          async getDirectoryHandle() {
            return new MockDirectoryHandle()
          }

          async getFileHandle(name: string) {
            return new MockFileHandle(name)
          }

          async *values() {
            yield new MockFileHandle('project.wt')
          }

          async queryPermission() {
            return 'granted'
          }

          async requestPermission() {
            return 'granted'
          }
        }

        // @ts-expect-error todo fix typing
        window.showSaveFilePicker = async () => {
          return new MockFileHandle()
        }
        // @ts-expect-error todo fix typing
        window.showOpenFilePicker = async () => {
          return [new MockFileHandle()]
        }
        // @ts-expect-error todo fix typing
        window.showDirectoryPicker = async () => {
          return new MockDirectoryHandle()
        }
      })

      await use()
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
