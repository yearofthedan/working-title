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
  buildInMemoryProjectStore,
  buildProjectData,
} from '@/features/project-storage/__testHelpers__/builders'
import { buildProcessTemplate } from '@/features/process-templates/__testHelpers__/builders'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
} from '@/features/writing-project/composables/useDefinitionsContext'
import { ref } from 'vue'
import { PROJECT_STORE_KEY } from '@/features/project-storage/context'
import { Icon } from '@iconify/vue'
import { provideLogger } from '@/composables/useLogger'
import { provideNotifications } from '@/composables/useNotifications'

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

  // Register icon components for Storybook
  app.component('IPhPlus', Icon)
  app.component('IPhUploadSimple', Icon)
  app.component('IPhPlay', Icon)
  app.component('IPhX', Icon)
  app.component('IPhWarning', Icon)

  provideLogger(app.provide)
  provideNotifications(app.provide)
  const store = buildInMemoryProjectStore()
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
      test: 'todo',
    },
  },
}

export default preview
