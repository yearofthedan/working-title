import type { Meta, StoryObj, StoryContext } from '@storybook/vue3'
import { expect } from 'storybook/test'
import AppTextAreaField from './AppTextAreaField.vue'

const meta = {
  component: AppTextAreaField,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'The v-model bound value of the textarea.',
      table: { type: { summary: 'string' } },
    },
    label: { control: 'text', description: 'Label for the textarea field.' },
    hint: { control: 'text', description: 'Hint text displayed below the textarea.' },
    error: { control: 'text', description: 'Error message displayed below the textarea.' },
    required: { control: 'boolean', description: 'Indicates if the field is required.' },
    placeholder: { control: 'text', description: 'Placeholder text for the textarea.' },
    id: { control: 'text', description: 'Custom ID for the textarea field.' },
    'aria-label': { control: 'text', description: 'ARIA label for accessibility.' },
    rows: { control: 'number', description: 'Number of visible rows.' },
    cols: { control: 'number', description: 'Number of visible columns.' },
    disabled: { control: 'boolean', description: 'Disables the textarea field.' },
    readonly: { control: 'boolean', description: 'Makes the textarea field read-only.' },
  },
  args: {
    modelValue: '',
    label: undefined,
    hint: undefined,
    error: undefined,
    required: false,
    placeholder: 'Enter multiple lines of text...',
    id: undefined,
    'aria-label': undefined,
    rows: 4,
    cols: 50,
    disabled: false,
    readonly: false,
  },
} satisfies Meta<typeof AppTextAreaField>

export default meta

type Story = StoryObj<typeof AppTextAreaField> & {
  play?: (context: StoryContext<Story['args']>) => Promise<void> | void
}

export const Default: Story = {
  args: {
    modelValue: 'Some initial text...',
  },
  play: async ({ canvas, step, userEvent }) => {
    const textarea = canvas.getByRole<HTMLTextAreaElement>('textbox')

    await step('shows initial value', async () => {
      await expect(textarea).toHaveValue('Some initial text...')
    })

    await step('can type into textarea', async () => {
      await userEvent.clear(textarea)
      await userEvent.type(textarea, 'New textarea content.')
      await expect(textarea).toHaveValue('New textarea content.')
    })
  },
}

export const WithLabel: Story = {
  args: {
    ...Default.args,
    label: 'Story Description',
  },
}

export const WithPlaceholder: Story = {
  args: {
    ...Default.args,
    modelValue: '',
    label: 'With Placeholder',
    placeholder: 'Write your thoughts here...',
  },
  play: async ({ canvas, step }) => {
    const textarea = canvas.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'With Placeholder',
    })

    await step('displays placeholder text', async () => {
      await expect(textarea).toHaveAttribute('placeholder', 'Write your thoughts here...')
    })
  },
}

export const WithHint: Story = {
  args: {
    ...Default.args,
    label: 'With Hint',
    hint: 'Explain the story in detail.',
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'With Hint' })

    await step('shows a hint', async () => {
      await expect(input).toHaveAccessibleDescription('Explain the story in detail.')
    })
  },
}

export const WithError: Story = {
  args: {
    ...Default.args,
    label: 'With Error',
    error: 'Invalid email address.',
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'With Error' })

    await step('shows an error message and invalid state', async () => {
      await expect(input).toBeInvalid()
      await expect(input).toHaveAccessibleDescription('Invalid email address.')
    })
  },
}

export const WithErrorAndHint: Story = {
  args: {
    label: 'Email',
    hint: 'Use work email.',
    error: 'Invalid format.',
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' })

    await step('handles both hint and error together', async () => {
      await expect(input).toHaveAccessibleDescription('Use work email. Invalid format.')
    })
  },
}

export const Required: Story = {
  args: {
    ...Default.args,
    label: 'Required Field',
    required: true,
  },
  play: async ({ canvas, step }) => {
    const textarea = canvas.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Required Field',
    })

    await step('has required attribute', async () => {
      await expect(textarea).toHaveAttribute('aria-required', 'true')
    })
  },
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: 'Disabled Textarea',
    disabled: true,
  },
  play: async ({ canvas, step }) => {
    const textarea = canvas.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Disabled Textarea',
    })

    await step('is disabled', async () => {
      await expect(textarea).toBeDisabled()
    })
  },
}

export const Readonly: Story = {
  args: {
    ...Default.args,
    label: 'Readonly Textarea',
    readonly: true,
  },
  play: async ({ canvas, step }) => {
    const textarea = canvas.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Readonly Textarea',
    })

    await step('is readonly', async () => {
      await expect(textarea).toHaveAttribute('readonly')
    })
  },
}
