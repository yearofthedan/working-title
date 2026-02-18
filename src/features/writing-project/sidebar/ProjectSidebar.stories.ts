import type { Meta, StoryObj } from '@storybook/vue3'
import ProjectSidebar from './ProjectSidebar.vue'
import { provide, ref, computed } from 'vue'
import { ACTIVE_PROJECT_CONTEXT_KEY } from '@/features/writing-project/composables/useActiveProjectContext'
import type { AsyncStatus } from '@/features/common/composables/useAsyncState'

interface SidebarStoryArgs {
  saveStatus: AsyncStatus
  saveError: Error | null
}

const meta: Meta<SidebarStoryArgs> = {
  component: ProjectSidebar,
  decorators: [
    (story, context) => ({
      components: { story },
      setup() {
        const args = context.args
        const saveStatus = ref(args.saveStatus || 'success')
        const saveError = ref(args.saveError || null)

        provide(ACTIVE_PROJECT_CONTEXT_KEY, {
          projectName: ref('My Great Novel'),
          steps: ref([]),
          connections: ref([]),
          contentMap: ref(new Map()),
          getContent: () => undefined,
          getStep: () => undefined,
          updateContent: () => {},
          addStep: () => '',
          addConnection: () => {},
          saveStatus: computed(() => saveStatus.value),
          saveError: computed(() => saveError.value),
          lastSaved: ref(null),
        })
        return {}
      },
      template: '<div class="w-75 h-screen border-l border-edge"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<SidebarStoryArgs>

export const Default: Story = {
  args: {
    saveStatus: 'success',
    saveError: null,
  },
}

export const Saving: Story = {
  args: {
    saveStatus: 'loading',
    saveError: null,
  },
}

export const ErrorState: Story = {
  name: 'Error',
  args: {
    saveStatus: 'error',
    saveError: new Error('Failed to save to local storage'),
  },
}
