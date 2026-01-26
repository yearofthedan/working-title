import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { definitionsContext } from './useDefinitionsContext'
import {
  buildProcessTemplate,
  buildStepDefinition,
} from '@/features/process-templates/__testHelpers__/builders'

describe('useDefinitionsContext', () => {
  const template = ref(
    buildProcessTemplate({
      stepDefinitions: [
        buildStepDefinition({
          id: 'def1',
          labelText: 'label.def1',
          editorConfig: { format: 'plain', placeholderText: 'placeholder.def1' },
          instructionText: 'instruction.def1',
          category: 'structure',
          stage: 1,
        }),
      ],
    })
  )

  const strings = ref({
    label: { def1: 'Localized Label' },
    placeholder: { def1: 'Localized Placeholder' },
    instruction: { def1: 'Localized Instruction' },
  })

  it('provides decorated step definitions from template', () => {
    const context = definitionsContext(template, strings)
    const def = context.getStepDef('def1')
    expect(def).toBeDefined()
    expect(def?.category).toBe('structure')
    expect(def?.label).toBe('Localized Label')
    expect(def?.placeholder).toBe('Localized Placeholder')
    expect(def?.instruction).toBe('Localized Instruction')
  })

  it('falls back to stepId if label string is missing', () => {
    const context = definitionsContext(template, ref({}))
    const def = context.getStepDef('def1')
    expect(def?.label).toBe('label.def1')
  })
})
