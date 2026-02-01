import type { Meta, StoryObj } from '@storybook/vue3'
import ProjectListItem from './ProjectListItem.vue'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { fn } from 'storybook/test'

const meta: Meta<typeof ProjectListItem> = {
  component: ProjectListItem,
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="max-w-md"><story /></div>',
      provide: {
        [PROJECT_STORE_KEY as symbol]: {
          deleteProject: fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }),
          deleteState: { value: { status: 'idle' } },
        },
      },
    }),
  ],
}

export default meta
type Story = StoryObj<typeof ProjectListItem>

export const Default: Story = {
  args: {
    project: {
      id: '1',
      name: 'My Great Novel',
      templateId: 'snowflake-method-v1',
      createdAt: '2026-01-01T12:00:00Z',
      updatedAt: '2026-01-31T15:00:00Z',
    },
  },
}

export const WithFilePath: Story = {
  args: {
    project: {
      id: '2',
      name: 'Project with Path',
      templateId: 'snowflake-method-v1',
      createdAt: '2026-01-01T12:00:00Z',
      updatedAt: '2026-01-31T15:00:00Z',
      filePath: '/users/author/documents/my-novel.json',
    },
  },
}

export const LongName: Story = {
  args: {
    project: {
      id: '3',
      name: 'A Very Long Project Name That Should Definitely Truncate At Some Point Because It Is Just Too Long For A Grid Item',
      templateId: 'snowflake-method-v1',
      createdAt: '2026-01-01T12:00:00Z',
      updatedAt: '2026-01-31T15:00:00Z',
      filePath:
        '/very/long/path/to/a/file/that/should/also/be/truncated/eventually/manuscript.json',
    },
  },
}

export const OtherTemplate: Story = {
  args: {
    project: {
      id: '4',
      name: 'Experimental Plot',
      templateId: 'experimental-v2',
      createdAt: '2026-01-01T12:00:00Z',
      updatedAt: '2026-01-31T15:00:00Z',
    },
  },
}
