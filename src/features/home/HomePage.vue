<template>
  <div class="min-h-screen bg-paper flex-y-center p-6 transition-colors duration-300">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-serif tracking-tight text-ink mb-2 italic">{{ t('app.name') }}</h1>
      <p class="text-[10px] text-ink/40 uppercase tracking-[0.3em]">{{ t('app.home.subtitle') }}</p>
    </header>

    <main class="flex flex-col items-center gap-8 w-full max-w-4xl">
      <!-- Empty State -->
      <div v-if="projects.length === 0" class="text-ink/60 italic mb-8">
        {{ t('app.home.projectList.empty') }}
      </div>

      <div class="flex flex-wrap justify-center gap-8">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />

        <!-- Demo Link -->
        <RouterLink
          :to="{ name: RouteNames.Demo }"
          class="group w-64 h-64 bg-paper border border-edge rounded-sm flex-y-center gap-4 transition-all hover:border-ink/20 hover:bg-ink/2 shadow-sm hover:shadow-md"
          aria-labelledby="label-demo"
        >
          <span
            class="w-12 h-12 flex-center rounded-full bg-ink/5 group-hover:bg-ink/10 transition-colors text-2xl text-ink/60 font-serif"
            aria-hidden="true"
          >
            ›
          </span>
          <div id="label-demo" class="text-center px-4">
            <span class="block text-lg font-medium text-ink">{{ t('app.home.demo.title') }}</span>
            <p class="text-xs text-ink/40">{{ t('app.home.demo.description') }}</p>
          </div>
        </RouterLink>

        <!-- New Project Action -->
        <button
          class="group w-64 h-64 bg-paper border border-edge rounded-sm flex-y-center gap-4 transition-all hover:border-ink/20 hover:bg-ink/2 shadow-sm hover:shadow-md cursor-pointer"
          aria-labelledby="label-new"
          @click="handleNewProject"
        >
          <span
            class="w-12 h-12 flex-center rounded-full bg-ink/5 group-hover:bg-ink/10 transition-colors text-xl text-ink/60 font-light"
            aria-hidden="true"
          >
            +
          </span>
          <div id="label-new" class="text-center px-4">
            <span class="block text-lg font-medium text-ink">{{
              t('app.home.newProject.title')
            }}</span>
            <p class="text-xs text-ink/40">{{ t('app.home.newProject.description') }}</p>
          </div>
        </button>
      </div>
    </main>

    <footer class="mt-16 opacity-30">
      <div class="w-8 h-px bg-ink mx-auto"></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames } from '@/router/routes'
import { projectStorage } from '@/features/writing-project/storage/ProjectStorage'
import type { ProjectMetadata } from '@/features/writing-project/storage/types'
import { createNewProject } from '@/features/writing-project/domain/projectFactory'
import { loadTemplate } from '@/features/process-templates/templateRegistry'
import ProjectCard from './components/ProjectCard.vue'

const { t } = useI18n()
const router = useRouter()

const projects = ref<ProjectMetadata[]>([])

onMounted(async () => {
  projects.value = await projectStorage.listProjects()
})

const handleNewProject = async () => {
  const existing = await projectStorage.loadCurrent()
  if (!existing) {
    const { template: snowflake } = await loadTemplate('snowflake-method-v1')
    const newProject = createNewProject(snowflake)
    await projectStorage.save(newProject)
  }
  router.push({ name: RouteNames.Project })
}
</script>

<style scoped></style>
