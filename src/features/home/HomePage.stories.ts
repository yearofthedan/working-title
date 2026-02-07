import type { Meta, StoryObj } from '@storybook/vue3'
import HomePage from './HomePage.vue'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import {
  buildProjectStore,
  buildProjectMetadata,
  buildInMemoryIndexedDBProvider,
} from '@/features/project-storage/__testHelpers__/builders'
import { ProjectStorage } from '../project-storage/ProjectStorage'

const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<story />',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof HomePage>

export const Empty: Story = {
  decorators: [
    () => ({
      template: '<story />',
      provide: {
        [PROJECT_STORE_KEY as symbol]: buildProjectStore(),
      },
    }),
  ],
}

export const WithProjects: Story = {
  decorators: [
    () => ({
      template: '<story />',
      provide: {
        [PROJECT_STORE_KEY as symbol]: buildProjectStore({
          storage: new ProjectStorage(
            buildInMemoryIndexedDBProvider([
              buildProjectMetadata({
                id: '1',
                name: 'My Masterpiece',
                updatedAt: '2026-01-31T15:00:00Z',
              }),
              buildProjectMetadata({
                id: '2',
                name: 'Epic Fantasy',
                updatedAt: '2026-02-01T10:00:00Z',
                filePath: '/users/author/novels/epic.json',
              }),
            ])
          ),
        }),
      },
    }),
  ],
}
