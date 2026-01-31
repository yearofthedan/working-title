<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames } from '@/router/routes'
import ProjectNameDialog from './components/ProjectNameDialog.vue'
import HomeActionCard from './components/HomeActionCard.vue'
import ProjectListItem from './components/ProjectListItem.vue'
import BrowserSupportWarning from '../common/BrowserSupportWarning.vue'
import { useProjectStore } from '../project-storage/context'
import { computed, ref } from 'vue'

const router = useRouter()
const { t } = useI18n()
const { projects, openProject, openState, createProject } = useProjectStore()
const isNameDialogOpen = ref(false)

async function handleNewProject(name: string) {
  const metadata = await createProject(name, 'snowflake-method-v1')
  router.push({ name: RouteNames.Project, params: { id: metadata.id } })
  isNameDialogOpen.value = false
}

async function handleOpenFile() {
  const metadata = await openProject()
  router.push({ name: RouteNames.Project, params: { id: metadata.id } })
}

const primaryActions = computed(() => [
  {
    id: 'new',
    title: t('app.home.newProject.title'),
    description: t('app.home.newProject.description'),
    icon: '+',
    handler: () => (isNameDialogOpen.value = true),
  },
  {
    id: 'open',
    title: t('app.home.openFile.title'),
    description: t('app.home.openFile.description'),
    icon: '↑',
    loading: openState.value.status === 'loading',
    handler: handleOpenFile,
  },
  {
    id: 'demo',
    title: t('app.home.demo.title'),
    description: t('app.home.demo.description'),
    icon: '›',
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
            <template #icon>{{ action.icon }}</template>
          </HomeActionCard>
        </div>
      </section>

      <section v-if="projects.length > 0" class="flex flex-col gap-4">
        <h2 class="text-xs uppercase tracking-[0.2em] text-ink/40 font-semibold px-2">
          {{ t('app.home.projectList.title') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProjectListItem v-for="project in projects" :key="project.id" :project="project" />
        </div>
      </section>

      <div v-else class="text-center py-20 text-ink/40 italic">
        {{ t('app.home.projectList.empty') }}
      </div>
    </main>

    <ProjectNameDialog v-model="isNameDialogOpen" @create="handleNewProject" />
  </div>
</template>

<style scoped></style>
