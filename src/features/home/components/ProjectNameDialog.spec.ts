import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { page } from 'vitest/browser'
import { render } from '@/../src/__testHelpers__/renderer'
import ProjectNameDialog from './ProjectNameDialog.vue'
import { nextTick } from 'vue'

describe('ProjectNameDialog', () => {
  const renderOpenModel = () => {
    const result = render(ProjectNameDialog, {
      props: {
        modelValue: false,
      },
    })
    result.rerender({ modelValue: true })
    return result
  }

  it('renders correctly', async () => {
    renderOpenModel()

    const dialog = page.getByRole('dialog')
    await expect.element(dialog).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Create Project' })).toBeVisible()
    await expect.element(page.getByRole('textbox')).toBeVisible()
  })

  it('emits cancel when cancel button is clicked', async () => {
    const { emitted } = renderOpenModel()

    const cancelButton = page.getByRole('button', { name: 'Cancel' })
    await cancelButton.click()

    expect(emitted()).toHaveProperty('update:modelValue')
    expect(emitted()['update:modelValue']?.[0]).toEqual([false])
  })

  it('emits create with name when create button is clicked', async () => {
    const { emitted } = renderOpenModel()

    const input = page.getByRole('textbox')
    await input.fill('My New Project')

    const createButton = page.getByRole('button', { name: 'Create Project' })
    await createButton.click()

    expect(emitted()).toHaveProperty('create')
    expect(emitted().create?.[0]).toEqual(['My New Project'])
  })

  it('does not emit create if name is empty', async () => {
    const { emitted } = renderOpenModel()

    const createButton = page.getByRole('button', { name: 'Create Project' })
    await expect.element(createButton).toBeDisabled()

    expect(emitted()).not.toHaveProperty('create')
  })

  it('clears name when dialog is closed and reopened', async () => {
    const { rerender } = renderOpenModel()

    const input = page.getByRole('textbox')
    await input.fill('Temp Name')
    await expect.element(input).toHaveValue('Temp Name')

    rerender({ modelValue: false })
    await nextTick()
    rerender({ modelValue: true })

    await expect.element(input).toHaveValue('')
  })
})
