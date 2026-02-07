<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames } from '@/router/routes'
import ProjectNameDialog from './components/ProjectNameDialog.vue'
import HomeActionCard from './components/HomeActionCard.vue'
import ProjectListItem from './components/ProjectListItem.vue'
import BrowserSupportWarning from '../common/error-handling/BrowserSupportWarning.vue'
import { useProjectStore } from '../project-storage/context'
import { computed, ref } from 'vue'
import AppIcon from '../common/AppIcon.vue'
import type { IconKey } from '../common/icons'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { t } = useI18n()
const { error: notifyError } = useNotifications()
const { list, create, open } = useProjectStore()

const isNameDialogOpen = ref(false)

create.onSuccess((metadata) => {
  router.push({ name: RouteNames.Project, params: { id: metadata.id } })
  isNameDialogOpen.value = false
})

create.onError(() => {
  notifyError(t('app.home.createProject.error'))
})

open.onSuccess((metadata) => {
  router.push({ name: RouteNames.Project, params: { id: metadata.id } })
})

open.onError(() => {
  notifyError(t('app.home.openFile.error'))
})

list.onError(() => {
  notifyError(t('app.home.loadProjects.error'))
})

async function handleNewProject(name: string) {
  await create.execute(name, 'snowflake-method-v1')
}

async function handleOpenFile() {
  await open.execute()
}

interface PrimaryAction {
  id: string
  title: string
  description: string
  icon: IconKey
  handler?: () => void
  to?: (typeof RouteNames)[keyof typeof RouteNames]
  loading?: boolean
}

const primaryActions = computed<PrimaryAction[]>(() => [
  {
    id: 'new',
    title: t('app.home.newProject.title'),
    description: t('app.home.newProject.description'),
    icon: 'add',
    handler: () => (isNameDialogOpen.value = true),
  },
  {
    id: 'open',
    title: t('app.home.openFile.title'),
    description: t('app.home.openFile.description'),
    icon: 'open',
    loading: open.state.value.status === 'loading',
    handler: handleOpenFile,
  },
  {
    id: 'demo',
    title: t('app.home.demo.title'),
    description: t('app.home.demo.description'),
    icon: 'play',
    to: RouteNames.Demo,
  },
])
</script>
<template>
  <div class="min-h-screen bg-paper flex flex-col items-center pb-6">
    <BrowserSupportWarning />

    <header class="my-12 text-center">
      <h1 class="text-4xl font-serif tracking-tight text-ink mb-2 italic">{{ t('app.name') }}</h1>
      <p class="text-[10px] text-ink/40 uppercase tracking-[0.3em]">{{ t('app.home.subtitle') }}</p>
    </header>
    <main class="w-full max-w-4xl flex flex-col gap-12">
      <section>
        <div class="flex flex-wrap justify-center gap-6">
          <HomeActionCard
            v-for="action in primaryActions"
            :key="action.id"
            v-bind="action"
            @click="action.handler?.()"
          >
            <template #icon>
              <AppIcon :name="action.icon" class="text-2xl text-ink" />
            </template>
          </HomeActionCard>
        </div>
      </section>

      <section v-if="list.projects.value.length > 0" class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-[0.2em] text-ink/40 font-semibold px-2">
          {{ t('app.home.projectList.title') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProjectListItem v-for="project in list.projects.value" :key="project.id" :project="project" />
        </div>
      </section>

      <div v-else class="text-center py-20 text-ink/40 italic">
        {{ t('app.home.projectList.empty') }}
      </div>
    </main>

    <ProjectNameDialog
      v-model="isNameDialogOpen"
      :loading="create.state.value.status === 'loading'"
      @create="handleNewProject"
    />
  </div>
</template>

<style scoped></style>
