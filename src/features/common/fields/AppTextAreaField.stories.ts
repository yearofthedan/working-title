import type { Meta, StoryObj } from '@storybook/vue3'
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
    rows: { control: 'number', description: 'Number of visible text lines.' },
    disabled: { control: 'boolean', description: 'Disables the textarea field.' },
    readonly: { control: 'boolean', description: 'Makes the textarea field read-only.' },
  },
  args: {
    modelValue: '',
    label: undefined,
    hint: undefined,
    error: undefined,
    required: false,
    placeholder: 'Enter content...',
    id: undefined,
    rows: 4,
    disabled: false,
    readonly: false,
  },
} satisfies Meta<typeof AppTextAreaField>

export default meta

type Story = StoryObj<typeof AppTextAreaField>

export const Default: Story = {
  args: {
    modelValue: 'Initial long text content...',
  },
}

export const WithLabel: Story = {
  args: {
    ...Default.args,
    label: 'Story Summary',
  },
}

export const WithPlaceholder: Story = {
  args: {
    ...Default.args,
    modelValue: '',
    label: 'With Placeholder',
    placeholder: 'Describe your world here...',
  },
}

export const WithHint: Story = {
  args: {
    ...Default.args,
    label: 'With Hint',
    hint: 'Enter at least 3 sentences.',
  },
}

export const WithError: Story = {
  args: {
    ...Default.args,
    label: 'Description',
    error: 'Description is too short.',
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

export const CustomRows: Story = {
  args: {
    ...Default.args,
    label: 'Large Area',
    rows: 10,
    modelValue: 'This field has more rows for longer content.',
  },
}
