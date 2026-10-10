import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    // The docs are written by hand to their own standards, not reflowed.
    ignorePatterns: ['**/*.md'],
    singleQuote: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
  staged: {
    '*': 'vp check --fix',
  },
});
