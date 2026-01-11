# Code Style

## Vue Component Style Guide

### Naming Conventions

- Vue components should be named in `PascalCase` (e.g., `MyComponent.vue`).
- Component files should match the component name.

### Component Structure and Organization

- **Order of Sections**: The `<template>`, `<script setup>`, and `<style>` sections should appear in that order within a `.vue` file.
- **Composition API**: Use `<script setup>` for all components.

### Template Conventions

- Use `kebab-case` for custom component and prop names in templates.
- Keep templates concise; move complex logic to computed properties, methods, or composables.
