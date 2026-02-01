<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconKey } from './icons'

const props = defineProps<{
  name: IconKey
}>()

const iconComponent = computed(() => icons[props.name])
</script>

<template>
  <component :is="iconComponent" v-bind="$attrs" aria-hidden="true" />
</template>
