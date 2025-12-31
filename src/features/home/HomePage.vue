<template>
  <div class="min-h-screen bg-paper flex-stack-center p-6 transition-colors duration-300">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-serif tracking-tight text-ink mb-2 italic">Working Title</h1>
      <p class="text-[10px] text-ink/40 uppercase tracking-[0.3em]">Manuscript Environment</p>
    </header>

    <main class="flex flex-wrap justify-center gap-8 w-full max-w-4xl">
      <!-- Demo Link -->
      <RouterLink
        :to="{ name: RouteNames.Demo }"
        class="group w-64 h-64 bg-paper border border-edge rounded-sm flex-stack-center gap-4 transition-all hover:border-ink/20 hover:bg-ink/2 shadow-sm hover:shadow-md"
        aria-labelledby="label-demo"
      >
        <span
          class="w-12 h-12 flex-center rounded-full bg-ink/5 group-hover:bg-ink/10 transition-colors text-2xl text-ink/60 font-serif"
          aria-hidden="true"
        >
          ›
        </span>
        <div id="label-demo" class="text-center px-4">
          <span class="block text-lg font-medium text-ink">View Demo</span>
          <p class="text-xs text-ink/40">Explore the snowflake method</p>
        </div>
      </RouterLink>

      <!-- New Project Link -->
      <RouterLink
        :to="{ name: RouteNames.Demo }"
        class="group w-64 h-64 bg-paper border border-edge rounded-sm flex-stack-center gap-4 transition-all hover:border-ink/20 hover:bg-ink/2 shadow-sm hover:shadow-md"
        aria-labelledby="label-new"
      >
        <span
          class="w-12 h-12 flex-center rounded-full bg-ink/5 group-hover:bg-ink/10 transition-colors text-xl text-ink/60 font-light"
          aria-hidden="true"
        >
          +
        </span>
        <div id="label-new" class="text-center px-4">
          <span class="block text-lg font-medium text-ink">New Project</span>
          <p class="text-xs text-ink/40">Start from a template</p>
        </div>
      </RouterLink>
    </main>

    <footer class="mt-16 opacity-30">
      <div class="w-8 h-px bg-ink mx-auto"></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/router/routes'
</script>

<style scoped>
/* No extra CSS needed, relying on Tailwind and Theme variables */
</style>
