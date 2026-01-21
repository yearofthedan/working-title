import { computed, inject, provide, type Ref, type InjectionKey } from 'vue'
import type { ProcessTemplate, StepDefinition } from '@/features/process-templates/processTemplate'
import { getValueAtPath } from '@/utils/objects'

/**
 * A step definition decorated with localized strings.
 */
export interface DecoratedStepDefinition extends StepDefinition {
  label: string
  placeholder: string
  instruction: string
}

/**
 * Definitions operations - read-only access to template schema
 */
export interface DefinitionsContext {
  /**
   * Retrieves a specific decorated step definition by its ID.
   */
  getStepDef: (stepId: string) => DecoratedStepDefinition | undefined
}

export const DEFINITIONS_CONTEXT_KEY: InjectionKey<DefinitionsContext> =
  Symbol('definitionsContext')

export function definitionsContext(
  template: Ref<ProcessTemplate>,
  strings: Ref<Record<string, unknown>>
) {
  const definitionMap = computed(() => {
    const map = new Map<string, DecoratedStepDefinition>()

    template.value.stepDefinitions.forEach((def) => {
      map.set(def.id, {
        ...def,
        label: getValueAtPath(strings.value, def.labelText) || def.id,
        placeholder: getValueAtPath(strings.value, def.editorConfig.placeholderText) || '',
        instruction: getValueAtPath(strings.value, def.instructionText) || '',
      })
    })

    return map
  })

  const getStepDef = (stepId: string): DecoratedStepDefinition | undefined => {
    return definitionMap.value.get(stepId)
  }

  const context: DefinitionsContext = {
    getStepDef,
  }

  return context
}

export function provideDefinitionsContext(
  template: Ref<ProcessTemplate>,
  strings: Ref<Record<string, unknown>>
) {
  provide(DEFINITIONS_CONTEXT_KEY, definitionsContext(template, strings))
}

export function useDefinitionsContext(): DefinitionsContext {
  const context = inject(DEFINITIONS_CONTEXT_KEY)

  if (!context) {
    throw new Error('useDefinitionsContext must be used within provideDefinitionsContext')
  }

  return context
}
