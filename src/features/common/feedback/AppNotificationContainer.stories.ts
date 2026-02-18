import type { Meta, StoryObj } from '@storybook/vue3'
import { provide } from 'vue'
import { provideNotifications, type AppNotification } from './useNotifications'
import AppNotificationContainer from './AppNotificationContainer.vue'

type InferredDecorators = Meta<typeof AppNotificationContainer>['decorators']
type Decorator = InferredDecorators extends (infer T)[] ? T : never

interface CustomWindow extends Window {
  notificationActions?: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (msg: string) => void
  }
}

declare const window: CustomWindow

const withNotifications = (
  story: () => unknown,
  { parameters }: { parameters: { initialNotifications?: AppNotification[] } }
) => {
  return {
    components: { story, AppNotificationContainer },
    setup() {
      const store = provideNotifications(provide)[1]

      if (parameters?.initialNotifications) {
        parameters.initialNotifications.forEach((n) => {
          store.notify(n)
        })
      }

      return { store }
    },
    template: `
      <div>
        <story />
        <AppNotificationContainer />
      </div>
    `,
  }
}

const meta: Meta<typeof AppNotificationContainer> = {
  component: AppNotificationContainer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withNotifications as unknown as Decorator],
}

export default meta
type Story = StoryObj<typeof AppNotificationContainer>

export const Interactive: Story = {
  render: () => ({
    setup() {
      return {
        actions: window.notificationActions,
      }
    },
    template: `
      <div class="p-8 flex flex-col gap-4 max-w-xs">
        <button @click="actions?.success('Project saved successfully!')" class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer">Trigger Success</button>
        <button @click="actions?.error('Failed to save project.')" class="px-4 py-2 bg-red-600 text-white rounded cursor-pointer">Trigger Error</button>
        <button @click="actions?.warning('Session expiring soon.')" class="px-4 py-2 bg-amber-600 text-white rounded cursor-pointer">Trigger Warning</button>
      </div>
    `,
  }),
  decorators: [
    (story, context) => {
      const decorated = withNotifications(story as () => unknown, context as never)
      const originalSetup = decorated.setup
      decorated.setup = () => {
        const setupResult = originalSetup()
        const store = setupResult.store
        window.notificationActions = {
          success: (msg: string) => store.success(msg),
          error: (msg: string) => store.error(msg),
          warning: (msg: string) => store.warning(msg),
        }
        return setupResult
      }
      return decorated
    },
  ],
}

export const Success: Story = {
  parameters: {
    initialNotifications: [{ type: 'success', message: 'Project saved successfully!' }],
  },
}

export const Error: Story = {
  parameters: {
    initialNotifications: [{ type: 'error', message: 'Failed to save project. Please try again.' }],
  },
}

export const LongMessage: Story = {
  parameters: {
    initialNotifications: [
      {
        type: 'error',
        message:
          "This is a very long error message that should demonstrate how the notification card handles large amounts of text. It might even exceed the maximum height we set for the scrollable area if we keep typing more and more words into this message. Let's see how it looks when it starts to scroll!",
      },
    ],
  },
}

export const Multiple: Story = {
  parameters: {
    initialNotifications: [
      { type: 'success', message: 'Operation successful' },
      { type: 'warning', message: 'Something looks fishy' },
      { type: 'error', message: 'Connection lost' },
    ],
  },
}
