# Vue Component Patterns

Quick reference for established component approaches.

For comprehensive component rules, see [Code Style Rules](../../rules-code/code-style.md).

## At a Glance

- **Structure**: `<template>`, `<script setup>`, `<style>` order.
- **Naming**: `PascalCase` for files and component names.
- **Props**: Use interface-based `defineProps`.
- **Emits**: Use `defineEmits` for custom events.
- **Logic**: Move complex logic to computed properties or composables.
- **Size**: Aim for components under 100 lines.

## Example

Refer to `src/features/common/fields/AppTextField.vue` for a clean implementation of a base component.
