<template>
  <RouterLink
    :to="{ name: RouteNames.Project, params: { id: project.id } }"
    :aria-labelledby="`project-name-${project.id}`"
    class="relative flex items-center justify-between p-4 bg-paper border border-edge rounded-sm hover:border-ink/20 hover:bg-ink/2 transition-all group focus-visible:ring-2 focus-visible:ring-ink/20 outline-hidden"
  >
    <div class="flex-y">
      <span
        :id="`project-name-${project.id}`"
        class="text-lg font-medium text-ink group-hover:italic transition-all"
      >
        {{ project.name }}
      </span>
      <time :datetime="project.updatedAt" class="text-[10px] text-ink/40 uppercase tracking-wider">
        {{ formatDate(project.updatedAt) }}
      </time>
    </div>
    <span aria-hidden="true" class="text-ink/20 group-hover:text-ink/60 transition-colors">
      →
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/router/routes'
import type { ProjectMetadata } from '@/features/project-storage/types'
import { formatDate } from '@/utils/dates'

defineProps<{
  project: ProjectMetadata
}>()
</script>
