<template>
  <div class="relative group">
    <RouterLink
      :to="{ name: RouteNames.Project, params: { id: project.id } }"
      :aria-labelledby="`project-name-${project.id}`"
      class="flex flex-col gap-2 p-4 bg-paper border border-edge rounded-sm hover:border-ink/20 hover:bg-ink/2 transition-all focus-visible:ring-2 focus-visible:ring-ink/20 outline-hidden h-full"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-y min-w-0">
          <span
            :id="`project-name-${project.id}`"
            class="text-lg font-medium text-ink group-hover:italic transition-all truncate"
          >
            {{ project.name }}
          </span>

          <div class="flex flex-wrap gap-x-3 gap-y-1 items-center mt-0.5">
            <time
              :datetime="project.updatedAt"
              class="text-[10px] text-ink/40 uppercase tracking-wider whitespace-nowrap"
            >
              {{ formatDate(project.updatedAt) }}
            </time>

            <span
              v-if="templateName"
              class="text-[10px] bg-ink/5 text-ink/60 px-1.5 py-0.5 rounded-full uppercase tracking-tighter"
            >
              {{ t('app.home.projectList.item.templateBadge', { name: templateName }) }}
            </span>
          </div>
        </div>

        <button
          type="button"
          class="p-2 text-ink/20 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          :title="t('app.home.projectList.item.delete')"
          @click.prevent="showDeleteConfirm = true"
        >
          <AppIcon name="delete" class="text-lg" />
        </button>
      </div>

      <div v-if="project.filePath" class="mt-auto pt-2 border-t border-edge/30">
        <span class="text-[10px] text-ink/40 font-mono truncate block" :title="project.filePath">
          {{ project.filePath }}
        </span>
      </div>
    </RouterLink>

    <AppConfirmationDialog
      v-model="showDeleteConfirm"
      :title="t('app.home.projectList.item.deleteConfirmTitle')"
      :message="t('app.home.projectList.item.deleteConfirmMessage', { name: project.name })"
      :confirm-label="t('common.actions.delete')"
      is-dangerous
      :is-loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames } from '@/router/routes'
import type { ProjectMetadata } from '@/features/project-storage/types'
import { formatDate } from '@/utils/dates'
import { useProjectStore } from '@/features/project-storage/context'
import AppConfirmationDialog from '@/features/common/AppConfirmationDialog.vue'
import AppIcon from '@/features/common/AppIcon.vue'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps<{
  project: ProjectMetadata
}>()

const { t } = useI18n()
const { success, error: notifyError } = useNotifications()
const { delete: projectDelete } = useProjectStore()

const showDeleteConfirm = ref(false)
const isDeleting = computed(() => projectDelete.state.value.status === 'loading')

const templateName = computed(() => {
  // Simple mapping for now, could be expanded to use registry if needed
  if (props.project.templateId === 'snowflake-method-v1') {
    return 'Snowflake'
  }
  return props.project.templateId
})

async function handleDelete() {
  await projectDelete.execute(props.project.id)
}

projectDelete.onSuccess(() => {
  showDeleteConfirm.value = false
  success(t('app.home.projectList.item.deleteSuccess'))
})

projectDelete.onError((e) => {
  console.error('Failed to delete project:', e)
  notifyError(t('app.home.projectList.item.deleteError'))
})
</script>
