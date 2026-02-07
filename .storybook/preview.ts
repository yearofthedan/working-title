import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3'
import { createRouter, createMemoryHistory } from 'vue-router'
import '../src/styles/main.css'
import { useDark } from '@vueuse/core'
import { createTestI18n } from '@/i18n/__testHelpers__/i18n-utils'
import en from '@/locales/en.json'
import snowflakeEn from '@/features/process-templates/snowflake/locales/en.json'
import { RouteNames } from '@/router/routes'
import {
  ACTIVE_PROJECT_CONTEXT_KEY,
  activeProjectContext,
} from '@/features/writing-project/composables/useActiveProjectContext'
import {
  buildProjectStore,
  buildProjectData,
} from '@/features/project-storage/__testHelpers__/builders'
import { buildProcessTemplate } from '@/features/process-templates/__testHelpers__/builders'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
} from '@/features/writing-project/composables/useDefinitionsContext'
import { ref } from 'vue'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { provideLogger } from '@/composables/useLogger'
import { provideNotifications } from '@/composables/useNotifications'
import { FallbackFileStorageProvider } from '@/infra/files/FallbackFileStorageProvider'

setup((app) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: RouteNames.Home, component: { render: () => null } },
      { path: '/demo', name: RouteNames.Demo, component: { render: () => null } },
      { path: '/project/:id?', name: RouteNames.Project, component: { render: () => null } },
    ],
  })

  app.use(router)
  app.use(
    createTestI18n({
      en: {
        ...en,
        ...snowflakeEn,
      },
    })
  )

  provideLogger(app.provide)
  provideNotifications(app.provide)
  const store = buildProjectStore({
    fileStorage: new FallbackFileStorageProvider(),
  })
  app.provide(PROJECT_STORE_KEY, store)
  app.provide(ACTIVE_PROJECT_CONTEXT_KEY, activeProjectContext(ref(buildProjectData()), store))
  app.provide(DEFINITIONS_CONTEXT_KEY, definitionsContext(ref(buildProcessTemplate())))
})

useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'error',
    },
  },
}

export default preview
