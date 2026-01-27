import type { ProcessTemplate } from './processTemplate'

export interface TemplateModule {
  template: ProcessTemplate
}

export const loadTemplate = async (templateId: string): Promise<TemplateModule> => {
  if (templateId === 'snowflake-method-v1') {
    return import('./snowflake/template')
  }
  throw new Error(`Unknown template: ${templateId}`)
}

export const loadTemplateLocales = async (
  templateId: string
): Promise<Record<string, Record<string, unknown>>> => {
  if (templateId === 'snowflake-method-v1') {
    const module = await import('./snowflake/locales')
    // Each template export follows its own naming convention currently (e.g., snowflakeLocales)
    // We should ideally standardize this in the future.
    return module.snowflakeLocales as Record<string, Record<string, unknown>>
  }
  throw new Error(`Unknown template: ${templateId}`)
}
