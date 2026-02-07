import { buildProcessTemplate } from '@/features/process-templates/__testHelpers__/builders'
import {
  buildProjectStore,
  buildProjectData,
} from '@/features/project-storage/__testHelpers__/builders'
import {
  ACTIVE_PROJECT_CONTEXT_KEY,
  activeProjectContext,
} from '@/features/writing-project/composables/useActiveProjectContext'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
} from '@/features/writing-project/composables/useDefinitionsContext'

import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { ref } from 'vue'
import { createNotificationsBinding } from '@/composables/useNotifications'
import { createLoggerBinding } from '@/composables/useLogger'

type Providers = Record<string, unknown | symbol>

export const buildProviders = (overrides: Partial<Providers> = {}): Providers => {
  const store = buildProjectStore()

  const [notificationKey, notificationsContext] = createNotificationsBinding()
  const [loggerKey, loggerContext] = createLoggerBinding()

  return {
    [PROJECT_STORE_KEY]: store,
    [ACTIVE_PROJECT_CONTEXT_KEY]: activeProjectContext(ref(buildProjectData()), store),
    [DEFINITIONS_CONTEXT_KEY]: definitionsContext(ref(buildProcessTemplate())),
    [notificationKey]: notificationsContext,
    [loggerKey]: loggerContext,
    ...overrides,
  }
}
