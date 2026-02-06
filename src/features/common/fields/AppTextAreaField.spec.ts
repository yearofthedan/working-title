import { describe, expect, it } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import { page } from 'vitest/browser'
import AppTextAreaField from './AppTextAreaField.vue'

describe('AppTextAreaField', () => {
  it('renders with an initial value and allows typing', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: 'Initial text',
      },
    })

    const textarea = page.getByRole('textbox')
    await expect.element(textarea).toHaveValue('Initial text')

    await textarea.fill('New input value')
    await expect.element(textarea).toHaveValue('New input value')
  })

  it('displays a label and associates it with the textarea', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        label: 'Summary',
      },
    })

    const textarea = page.getByRole('textbox', { name: 'Summary' })
    await expect.element(textarea).toBeVisible()
  })

  it('displays placeholder text', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        placeholder: 'Describe your world',
      },
    })

    const textarea = page.getByPlaceholder('Describe your world')
    await expect.element(textarea).toBeVisible()
  })

  it('displays a hint', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        label: 'Field',
        hint: 'Detailed info',
      },
    })

    const textarea = page.getByRole('textbox', { name: 'Field' })
    await expect.element(textarea).toHaveAccessibleDescription('Detailed info')
  })

  it('displays an error message and marks the field as invalid', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        label: 'Field',
        error: 'Too short',
      },
    })

    const textarea = page.getByRole('textbox', { name: 'Field' })
    await expect.element(textarea).toBeInvalid()
    await expect.element(textarea).toHaveAccessibleDescription('Too short')
  })

  it('handles the required attribute', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        label: 'Required Field',
        required: true,
      },
    })

    const textarea = page.getByRole('textbox', { name: 'Required Field' })
    await expect.element(textarea).toHaveAttribute('aria-required', 'true')
  })

  it('handles the disabled state', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        label: 'Disabled Field',
        disabled: true,
      },
    })

    const textarea = page.getByRole('textbox', { name: 'Disabled Field' })
    await expect.element(textarea).toBeDisabled()
  })

  it('handles the readonly state', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        label: 'Readonly Field',
        readonly: true,
      },
    })

    const textarea = page.getByRole('textbox', { name: 'Readonly Field' })
    await expect.element(textarea).toHaveAttribute('readonly')
  })

  it('supports custom rows', async () => {
    render(AppTextAreaField, {
      props: {
        modelValue: '',
        rows: 10,
      },
    })

    const textarea = page.getByRole('textbox')
    await expect.element(textarea).toHaveAttribute('rows', '10')
  })

  it('emits update:modelValue on input', async () => {
    const { emitted } = render(AppTextAreaField, {
      props: {
        modelValue: '',
      },
    })

    const textarea = page.getByRole('textbox')
    await textarea.fill('test content')

    expect(emitted()['update:modelValue']).toBeTruthy()
    expect(emitted()['update:modelValue']![0]).toEqual(['test content'])
  })
})
