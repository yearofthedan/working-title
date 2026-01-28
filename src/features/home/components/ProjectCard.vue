<template>
  <RouterLink
    :to="{ name: RouteNames.Project, params: { id: project.id } }"
    class="group w-64 h-64 bg-paper border border-edge rounded-sm flex flex-col p-6 transition-all hover:border-ink/20 hover:bg-ink/2 shadow-sm hover:shadow-md"
  >
    <div class="flex-1 flex flex-col justify-center items-center text-center gap-2">
      <span class="block text-lg font-medium text-ink line-clamp-2 leading-tight">{{
        project.name
      }}</span>
      <span class="text-xs text-ink/40 uppercase tracking-wider">{{ project.templateId }}</span>
    </div>
    <div class="pt-4 border-t border-edge/50 text-center">
      <p class="text-[10px] text-ink/30 uppercase tracking-tighter">
        {{ t('app.home.projectList.updatedAt') }}: {{ formatDate(project.updatedAt) }}
      </p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames } from '@/router/routes'
import type { ProjectMetadata } from '@/features/writing-project/storage/types'
import { formatDate } from '@/utils/dates'

defineProps<{
  project: ProjectMetadata
}>()

const { t } = useI18n()
</script>
