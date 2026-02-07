import type { Meta, StoryObj } from '@storybook/vue3'
import AppTextField from './AppTextField.vue'

const meta = {
  component: AppTextField,
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
}

export const WithHint: Story = {
  args: {
    ...Default.args,
    label: 'With Hint',
    hint: 'Explain the story in detail.',
  },
}

export const WithError: Story = {
  args: {
    ...Default.args,
    label: 'Email',
    error: 'Invalid email address.',
  },
}

export const WithErrorAndHint: Story = {
  args: {
    label: 'Email',
    hint: 'Use work email.',
    error: 'Invalid format.',
  },
}

export const Required: Story = {
  args: {
    ...Default.args,
    label: 'Required Field',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: 'Disabled Field',
    disabled: true,
  },
}

export const Readonly: Story = {
  args: {
    ...Default.args,
    label: 'Readonly Field',
    readonly: true,
  },
}

export const NumberType: Story = {
  args: {
    ...Default.args,
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age',
  },
}
