import { createApp } from 'vue'
import './styles/main.css'
import App from '@/App.vue'
import { router } from './router/routes'
import { useDark } from '@vueuse/core'
import { i18n } from './i18n'
import { provideLogger } from '@/features/common/useLogger'
import { provideNotifications } from '@/features/common/feedback/useNotifications'
import { setupGlobalErrorHandling } from './config/globalErrors'

useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

const app = createApp(App)

provideLogger(app.provide)
setupGlobalErrorHandling(app)
provideNotifications(app.provide)

app.use(i18n).use(router)
app.mount('#app')
