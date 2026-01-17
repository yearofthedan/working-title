import './src/styles/main.css'
import { afterEach } from 'vitest'
import { cleanup } from 'vitest-browser-vue'
afterEach(() => {
  cleanup()
})
