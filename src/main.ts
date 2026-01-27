import { createApp } from 'vue'
import './styles/main.css'
import App from '@/App.vue'
import { router } from './router/routes'
import { useDark } from '@vueuse/core'
import { i18n } from './i18n'

useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

createApp(App).use(i18n).use(router).mount('#app')
