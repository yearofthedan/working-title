import { createApp } from 'vue'
import './styles/main.css'
import App from '@/App.vue'
import { router } from './router/routes'
import { useDark } from '@vueuse/core'
import { i18n, registerTemplateMessages } from './i18n'
import { snowflakeLocales } from '@/features/process-templates/snowflake/locales'

// Register Snowflake template strings
registerTemplateMessages('snowflake', 'en', snowflakeLocales.en)

useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

createApp(App).use(i18n).use(router).mount('#app')
