import type { Meta, StoryObj } from '@storybook/vue3'
import HomePage from './HomePage.vue'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import {
  buildInMemoryProjectStore,
  buildProjectMetadata,
} from '@/features/project-storage/__testHelpers__/builders'
import { fn } from 'storybook/test'
import { ref } from 'vue'

const meta: Meta<typeof HomePage> = {
  title: 'Features/Home/HomePage',
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
        [PROJECT_STORE_KEY as symbol]: buildInMemoryProjectStore(),
      },
    }),
  ],
}

export const WithProjects: Story = {
  decorators: [
    () => ({
      template: '<story />',
      provide: {
        [PROJECT_STORE_KEY as symbol]: buildInMemoryProjectStore({
          initialProjects: [
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
          ],
        }),
      },
    }),
  ],
}

export const Loading: Story = {
  decorators: [
    () => ({
      template: '<story />',
      provide: {
        [PROJECT_STORE_KEY as symbol]: {
          ...buildInMemoryProjectStore(),
          projects: ref([]),
          openState: ref({ status: 'loading' }),
          openProject: fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000))
            return { id: 'new-id' }
          }),
        },
      },
    }),
  ],
}
