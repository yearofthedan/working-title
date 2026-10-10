import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
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
