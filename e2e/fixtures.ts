import { test as base } from '@playwright/test'

export const test = base.extend<{ mockFilePicker: void }>({
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
          name = 'mock-save-file.json'

          async createWritable() {
            return {
              write: async () => {},
              close: async () => {},
            }
          }
        }

        window.showSaveFilePicker = async () => {
          return new MockFileHandle()
        }
        window.showOpenFilePicker = async () => {
          return new MockFileHandle()
        }
      })

      await use()
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
