import type { Meta, StoryObj } from '@storybook/vue3'
import { expect } from 'storybook/test'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'

const meta: Meta<typeof AppLoadingOverlay> = {
  component: AppLoadingOverlay,
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Whether the loading overlay is visible',
      table: { type: { summary: 'boolean' } },
    },
    message: {
      control: 'text',
      description: 'Visible loading message displayed below the spinner',
      table: { type: { summary: 'string' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for screen readers (falls back to message or "Loading...")',
      table: { type: { summary: 'string' } },
    },
  },
  args: {
    isLoading: true,
    message: undefined,
    ariaLabel: undefined,
  },
  decorators: [
    () => ({
      template: `
        <div class="relative h-96 border border-edge">
          <div class="p-4 text-sm text-ink/60">
            Content behind the overlay...
          </div>
          <story />
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof AppLoadingOverlay>

export default meta

type Story = StoryObj<typeof AppLoadingOverlay>

export const Default: Story = {
  args: {
    isLoading: true,
  },
  play: async ({ canvas, step }) => {
    await step('has proper ARIA attributes', async () => {
      const status = canvas.getByRole('status')
      await expect(status).toHaveAttribute('aria-live', 'polite')
      await expect(status).toHaveAttribute('aria-atomic', 'true')
      await expect(status).toHaveAttribute('aria-label', 'Loading...')
    })

    await step('spinner is hidden from screen readers', async () => {
      const spinner = canvas.getByRole('status').querySelector('[aria-hidden="true"]')
      await expect(spinner).toBeInTheDocument()
    })
  },
}

export const WithMessage: Story = {
  args: {
    isLoading: true,
    message: 'Loading project...',
  },
  play: async ({ canvas, step }) => {
    await step('displays the message', async () => {
      const status = canvas.getByRole('status')
      await expect(status).toHaveTextContent('Loading project...')
    })

    await step('uses message as aria-label fallback', async () => {
      const status = canvas.getByRole('status')
      await expect(status).toHaveAttribute('aria-label', 'Loading project...')
    })
  },
}

export const WithCustomAriaLabel: Story = {
  args: {
    isLoading: true,
    message: 'Please wait...',
    ariaLabel: 'Story canvas is loading',
  },
  play: async ({ canvas, step }) => {
    await step('uses custom aria-label', async () => {
      const status = canvas.getByRole('status')
      await expect(status).toHaveAttribute('aria-label', 'Story canvas is loading')
    })

    await step('still displays visual message', async () => {
      const status = canvas.getByRole('status')
      await expect(status).toHaveTextContent('Please wait...')
    })
  },
}

export const NotLoading: Story = {
  args: {
    isLoading: false,
    message: 'This should not appear',
  },
  play: async ({ canvas, step }) => {
    await step('does not render when not loading', async () => {
      const statuses = canvas.queryAllByRole('status')
      await expect(statuses).toHaveLength(0)
    })
  },
}
