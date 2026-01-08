import { createApp } from 'vue'
import './styles/main.css'
import App from '@/App.vue'
import { router } from './router/routes'
import { useDark } from '@vueuse/core'

useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

createApp(App).use(router).mount('#app')
