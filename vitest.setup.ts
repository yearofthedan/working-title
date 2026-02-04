import './src/styles/main.css'
import { afterEach } from 'vitest'
import { cleanup } from 'vitest-browser-vue'
import { overideCommonConsoleNoise } from '@/__testHelpers__/console'
afterEach(() => {
  cleanup()
})
overideCommonConsoleNoise()
