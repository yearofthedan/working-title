import { computed, inject, provide, type Ref, type InjectionKey } from 'vue'
import type { ProcessTemplate, StepDefinition } from '@/features/process-templates/processTemplate'

/**
 * Definitions operations - read-only access to template schema
 */
export interface DefinitionsContext {
  /**
   * Retrieves a specific decorated step definition by its ID.
   */
  getStepDef: (stepId: string) => StepDefinition | undefined

  /**
   * The underlying template.
   */
  template: Ref<ProcessTemplate>
}

export const DEFINITIONS_CONTEXT_KEY: InjectionKey<DefinitionsContext> =
  Symbol('definitionsContext')

export function definitionsContext(template: Ref<ProcessTemplate>): DefinitionsContext {
  const definitionMap = computed(() => {
    const map = new Map<string, StepDefinition>()
    template.value.stepDefinitions.forEach((def) => {
      map.set(def.id, def)
    })

    return map
  })

  const getStepDef = (stepId: string): StepDefinition | undefined => {
    return definitionMap.value.get(stepId)
  }

  const context: DefinitionsContext = {
    getStepDef,
    template,
  }

  return context
}

export function provideDefinitionsContext(template: Ref<ProcessTemplate>) {
  provide(DEFINITIONS_CONTEXT_KEY, definitionsContext(template))
}

export function useDefinitionsContext(): DefinitionsContext {
  const context = inject(DEFINITIONS_CONTEXT_KEY)

  if (!context) {
    throw new Error('useDefinitionsContext must be used within provideDefinitionsContext')
  }

  return context
}
