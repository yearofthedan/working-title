export default {
  '*': (stagedFiles) => [`sh ./do lint ${stagedFiles.join(' ')}`, 'sh ./do build', 'sh ./do e2e'],
  'src/**/*.{js,ts,tsx,vue}': (stagedFiles) => [
    `sh ./do test related --passWithNoTests ${stagedFiles.join(' ')}`,
  ],
}
