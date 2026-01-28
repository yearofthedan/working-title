export default {
  '*': (stagedFiles) => [`./do lint ${stagedFiles.join(' ')}`, './do build', './do e2e'],
  'src/**/*.{js,ts,tsx,vue}': (stagedFiles) => [
    `./do test related --passWithNoTests ${stagedFiles.join(' ')}`,
  ],
}
