import { vi, describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { page, userEvent } from 'vitest/browser'
import { render } from '@/__testHelpers__/renderer'
import AppConfirmationDialog, { type ComponentProps } from './AppConfirmationDialog.vue'
import { AppConfirmationDialogPageObject } from './__testHelpers__/AppConfirmationDialogPageObject'

describe('AppConfirmationDialog', () => {
  const buildProps = (overrides: Partial<ComponentProps> = {}): ComponentProps => ({
    modelValue: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to do this?',
    isDangerous: false,
    ...overrides,
  })

  const renderComponent = (props: ComponentProps = buildProps()) => {
    const result = render(AppConfirmationDialog, {
      props,
    })
    return { po: new AppConfirmationDialogPageObject(page), ...result }
  }

  it('renders correctly when open', async () => {
    const { po } = renderComponent(buildProps({ modelValue: true }))

    await expect.element(po.dialog).toBeVisible()
    await expect.element(page.getByText('Confirm Action')).toBeVisible()
    await expect.element(page.getByText('Are you sure you want to do this?')).toBeVisible()
  })

  it('is hidden when modelValue is false', async () => {
    const { po } = renderComponent(buildProps({ modelValue: false }))

    await expect.element(po.closedDialog).not.toBeVisible()
  })

  it('emits confirm event when confirm button is clicked', async () => {
    const { emitted, po } = renderComponent(buildProps())

    await po.confirmButton.click()

    expect(emitted()).toHaveProperty('confirm')
  })

  it('displays custom confirm label', async () => {
    const { po } = renderComponent(
      buildProps({
        confirmLabel: 'Yes, Delete',
      })
    )

    await expect.element(po.dialog.getByRole('button', { name: 'Yes, Delete' })).toBeVisible()
  })

  it('emits close when cancel button is clicked', async () => {
    const { emitted, po } = renderComponent(buildProps())

    await po.cancelButton.click()

    expect(emitted()).toHaveProperty('close')
    expect(emitted()['update:modelValue']?.[0]).toEqual([false])
  })

  it('autfocuses on the confirm button for non dangerous actions', async () => {
    const { po } = renderComponent(buildProps({ isDangerous: false }))

    await expect.element(po.confirmButton).toHaveFocus()
  })

  it('autofocuses on the cancel button for dangerous actions', async () => {
    const { po } = renderComponent(buildProps({ isDangerous: true }))

    await expect.element(po.cancelButton).toHaveFocus()
  })

  it('emits close when esc key is pressed', async () => {
    const { emitted, po } = renderComponent(buildProps())

    await expect.element(po.dialog).toBeVisible()
    await expect.element(po.confirmButton).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await expect.element(po.closedDialog).not.toBeVisible()

    await vi.waitFor(() => {
      expect(emitted()['update:modelValue']?.[0]).toEqual([false])
    })
  })

  it('displays custom cancel label', async () => {
    const { po } = renderComponent(
      buildProps({
        cancelLabel: 'No, Keep it',
      })
    )

    await expect.element(po.dialog.getByRole('button', { name: 'No, Keep it' })).toBeVisible()
  })

  it('disables buttons and shows spinner when isLoading is true', async () => {
    const { po } = renderComponent(
      buildProps({
        isLoading: true,
      })
    )

    await expect.element(po.cancelButton).toBeDisabled()
    await expect.element(po.confirmButton).toBeDisabled()

    const spinner = page.getByRole('status')
    await expect.element(spinner).toBeVisible()
  })
})
