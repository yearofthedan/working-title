<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isDev = import.meta.env.DEV
const router = useRouter()
const isNavigating = ref(false)

router.beforeEach(() => {
  isNavigating.value = true
})
router.afterEach(() => {
  isNavigating.value = false
})
</script>

<template>
  <div v-if="isDev" class="fixed top-0 left-0 z-10000 w-full">
    <header
      class="flex h-7 items-center justify-between bg-zinc-950 px-3 font-mono text-[10px] text-zinc-400 border-b border-zinc-800"
    >
      <span :class="isNavigating ? 'text-orange-400' : 'text-emerald-500'">
        {{ isNavigating ? 'NAVIGATING...' : 'READY' }}
      </span>

      <div class="flex items-center gap-4">
        <progress
          v-if="isNavigating"
          class="h-1 w-32 appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-zinc-800 [&::-webkit-progress-value]:bg-orange-500"
        />
        <span class="opacity-30">DEV_SESSION</span>
      </div>
    </header>
  </div>
</template>
