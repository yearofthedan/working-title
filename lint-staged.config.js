export default {
  '*': (stagedFiles) => [`sh ./do lint ${stagedFiles.join(' ')}`, 'sh ./do build'],
  'src/**/*.{js,ts,tsx,vue}': (stagedFiles) => [`sh ./do test ${stagedFiles.join(' ')}`],
}
