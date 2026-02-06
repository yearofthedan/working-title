import { describe, expect, it } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import { page } from 'vitest/browser'
import AppTextField from './AppTextField.vue'

describe('AppTextField', () => {
  it('renders with an initial value and allows typing', async () => {
    render(AppTextField, {
      props: {
        modelValue: 'Initial text',
      },
    })

    const input = page.getByRole('textbox')
    await expect.element(input).toHaveValue('Initial text')

    await input.fill('New input value')
    await expect.element(input).toHaveValue('New input value')
  })

  it('displays a label and associates it with the input', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'User Name',
      },
    })

    const input = page.getByRole('textbox', { name: 'User Name' })
    await expect.element(input).toBeVisible()
  })

  it('displays placeholder text', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        placeholder: 'Enter your name',
      },
    })

    const input = page.getByPlaceholder('Enter your name')
    await expect.element(input).toBeVisible()
  })

  it('displays a hint', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Field',
        hint: 'Some helpful text',
      },
    })

    const input = page.getByRole('textbox', { name: 'Field' })
    await expect.element(input).toHaveAccessibleDescription('Some helpful text')
  })

  it('displays an error message and marks the field as invalid', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Field',
        error: 'Required field',
      },
    })

    const input = page.getByRole('textbox', { name: 'Field' })
    await expect.element(input).toBeInvalid()
    await expect.element(input).toHaveAccessibleDescription('Required field')
  })

  it('combines hint and error in the accessible description', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Field',
        hint: 'Optional info.',
        error: 'Critical error.',
      },
    })

    const input = page.getByRole('textbox', { name: 'Field' })
    await expect.element(input).toHaveAccessibleDescription('Optional info. Critical error.')
  })

  it('handles the required attribute', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Required Field',
        required: true,
      },
    })

    const input = page.getByRole('textbox', { name: 'Required Field' })
    await expect.element(input).toHaveAttribute('aria-required', 'true')
  })

  it('handles the disabled state', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Disabled Field',
        disabled: true,
      },
    })

    const input = page.getByRole('textbox', { name: 'Disabled Field' })
    await expect.element(input).toBeDisabled()
  })

  it('handles the readonly state', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Readonly Field',
        readonly: true,
      },
    })

    const input = page.getByRole('textbox', { name: 'Readonly Field' })
    await expect.element(input).toHaveAttribute('readonly')
  })

  it('supports numeric input types', async () => {
    render(AppTextField, {
      props: {
        modelValue: '',
        label: 'Age',
        type: 'number',
      },
    })

    const input = page.getByRole('spinbutton', { name: 'Age' })
    await expect.element(input).toHaveAttribute('type', 'number')

    await input.fill('25')
    await expect.element(input).toHaveValue(25)
  })

  it('emits update:modelValue on input', async () => {
    const { emitted } = render(AppTextField, {
      props: {
        modelValue: '',
      },
    })

    const input = page.getByRole('textbox')
    await input.fill('test')

    expect(emitted()['update:modelValue']).toBeTruthy()
    expect(emitted()['update:modelValue']![0]).toEqual(['test'])
  })
})
