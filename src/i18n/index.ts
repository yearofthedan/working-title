import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
  },
  missingWarn: 'dev',
  fallbackWarn: 'dev',
})

/**
 * Registers template-specific i18n messages.
 * These are merged into the 'template' namespace.
 */
export function registerTemplateMessages(
  _templateId: string,
  locale: string,
  messages: Record<string, unknown>
) {
  i18n.global.mergeLocaleMessage(locale, messages)
}
