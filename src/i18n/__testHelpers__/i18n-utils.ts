import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import { snowflakeLocales } from '@/features/process-templates/snowflake/locales'

/**
 * Creates a configured i18n instance for testing.
 * Silent by default to avoid polluting test output.
 */
export function createTestI18n(messages?: Record<string, unknown>) {
  // If messages has an 'en' key, use that as the basis for merging, otherwise use messages itself
  const enOverrides = messages?.en ? (messages.en as Record<string, unknown>) : (messages ?? {})

  const mergedMessages = {
    ...en,
    ...snowflakeLocales.en, // Merge template messages
    ...enOverrides, // Allow test-specific overrides
  }

  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    missingWarn: false,
    fallbackWarn: false,
    messages: { en: mergedMessages },
  })
}
