<template>
  <div
    class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-background"
  >
    <div class="mb-4 text-edge">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mx-auto"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    </div>
    <h3 class="text-xl font-bold mb-2 text-ink">No Canvas Steps</h3>
    <p class="max-w-md text-ink-muted">
      Your project doesn't have any steps visible on the canvas yet. Add steps from the sidebar or
      check step visibility settings.
    </p>
  </div>
</template>
