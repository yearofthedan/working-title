import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { ref } from 'vue'
import { buildGlobals, runWithComponent } from '@/__testHelpers__/renderer'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
  useDefinitionsContext,
} from './useDefinitionsContext'
import {
  buildProcessTemplate,
  buildStepDefinition,
} from '@/features/process-templates/__testHelpers__/builders'
import { buildProviders } from '@/__testHelpers__/builders'

describe('useDefinitionsContext', () => {
  const template = buildProcessTemplate({
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

  it('supports looking up a step by id', () => {
    const result = runWithComponent(() => useDefinitionsContext(), {
      global: buildGlobals({
        provide: buildProviders({
          [DEFINITIONS_CONTEXT_KEY]: definitionsContext(ref(template)),
        }),
      }),
    })

    const def = result.getStepDef('def1')

    expect(def).toBeDefined()
    expect(def?.category).toBe('structure')
    expect(def?.labelText).toBe('label.def1')
  })

  it('returns undefined if no step exists', () => {
    const result = runWithComponent(() => useDefinitionsContext(), {
      global: buildGlobals({
        provide: {
          [DEFINITIONS_CONTEXT_KEY]: definitionsContext(ref(template)),
        },
      }),
    })

    const def = result.getStepDef('unknown')

    expect(def).toBeUndefined()
  })
})
