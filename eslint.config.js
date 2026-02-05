import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'

const globals = {
  browser: {
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    console: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    fetch: 'readonly',
    HTMLDialogElement: 'readonly',
  },
  node: {
    process: 'readonly',
    __dirname: 'readonly',
    module: 'readonly',
    URL: 'readonly',
  },
  vue: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
}

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: {
        ...globals.vue,
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/__testHelpers__/**/*.ts'],
    rules: {
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
      'vue/one-component-per-file': 'off',
    },
  },
  eslintConfigPrettier,
])
