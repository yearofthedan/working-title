import type { Meta, StoryObj } from '@storybook/vue3'
import { expect } from 'storybook/test'
import AppTextField from './AppTextField.vue'

const meta = {
  component: AppTextField,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'The v-model bound value of the input.',
      table: { type: { summary: 'string' } },
    },
    label: { control: 'text', description: 'Label for the input field.' },
    hint: { control: 'text', description: 'Hint text displayed below the input.' },
    error: { control: 'text', description: 'Error message displayed below the input.' },
    required: { control: 'boolean', description: 'Indicates if the field is required.' },
    placeholder: { control: 'text', description: 'Placeholder text for the input.' },
    id: { control: 'text', description: 'Custom ID for the input field.' },
    'aria-label': { control: 'text', description: 'ARIA label for accessibility.' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'url'],
      description: 'HTML input type attribute.',
    },
    disabled: { control: 'boolean', description: 'Disables the input field.' },
    readonly: { control: 'boolean', description: 'Makes the input field read-only.' },
  },
  args: {
    modelValue: '',
    label: undefined,
    hint: undefined,
    error: undefined,
    required: false,
    placeholder: 'Enter text...',
    id: undefined,
    'aria-label': undefined,
    type: 'text',
    disabled: false,
    readonly: false,
  },
} satisfies Meta<typeof AppTextField>

export default meta

type Story = StoryObj<typeof AppTextField>

export const Default: Story = {
  args: {
    modelValue: 'Initial text',
  },
  play: async ({ canvas, step, userEvent }) => {
    const input = canvas.getByRole<HTMLInputElement>('textbox')

    await step('shows initial value', async () => {
      await expect(input).toHaveValue('Initial text')
    })

    await step('can type into input', async () => {
      await userEvent.clear(input)
      await userEvent.type(input, 'New input value')
      await expect(input).toHaveValue('New input value')
    })
  },
}

export const WithLabel: Story = {
  args: {
    ...Default.args,
    label: 'Target Audience',
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
    const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'With Placeholder' })

    await step('displays placeholder text', async () => {
      await expect(input).toHaveAttribute('placeholder', 'Write your thoughts here...')
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
    label: 'Email',
    error: 'Invalid email address.',
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' })

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
    const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Required Field' })

    await step('has required attribute', async () => {
      await expect(input).toHaveAttribute('aria-required', 'true')
    })
  },
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: 'Disabled Field',
    disabled: true,
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Disabled Field' })

    await step('is disabled', async () => {
      await expect(input).toBeDisabled()
    })
  },
}

export const Readonly: Story = {
  args: {
    ...Default.args,
    label: 'Readonly Field',
    readonly: true,
  },
  play: async ({ canvas, step }) => {
    const input = canvas.getByRole<HTMLInputElement>('textbox', { name: 'Readonly Field' })

    await step('is readonly', async () => {
      await expect(input).toHaveAttribute('readonly')
    })
  },
}

export const NumberType: Story = {
  args: {
    ...Default.args,
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age',
  },
  play: async ({ canvas, step, userEvent }) => {
    const input = canvas.getByRole<HTMLInputElement>('spinbutton', { name: 'Age' })

    await step('Verify input type and interaction', async () => {
      await expect(input).toHaveAttribute('type', 'number')
      await userEvent.type(input, '30')
      await expect(input).toHaveValue(30)
    })
  },
}
