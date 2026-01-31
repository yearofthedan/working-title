import type { Meta, StoryObj } from '@storybook/vue3'
import AppConfirmationDialog from './AppConfirmationDialog.vue'
import { fn } from 'storybook/test'

const meta: Meta<typeof AppConfirmationDialog> = {
  title: 'Features/Common/AppConfirmationDialog',
  component: AppConfirmationDialog,
  tags: ['autodocs'],
  args: {
    modelValue: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to perform this action?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDangerous: false,
    isLoading: false,
    onConfirm: fn(),
    onCancel: fn(),
    'onUpdate:modelValue': fn(),
  },
}

export default meta
type Story = StoryObj<typeof AppConfirmationDialog>

export const Default: Story = {}

export const Dangerous: Story = {
  args: {
    title: 'Remove Item',
    message: 'This will remove the item from your list. You can re-import it later if needed.',
    confirmLabel: 'Remove',
    isDangerous: true,
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}
