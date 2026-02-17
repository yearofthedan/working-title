# ADR 006: i18n Architecture for Domain-Specific Templates

## Status

Accepted

## Context

The application needs to support internationalization (i18n) for both general UI elements ("App Strings") and methodology-specific content ("Template Strings").

App Strings are static and global. Template Strings are dynamic and tied to specific process templates (e.g., Snowflake). As the number of templates grows, loading all strings for all templates at startup would lead to unnecessary bundle size bloat. Furthermore, templates are domain-specific features and should remain isolated from the core application locales.

## Decision

We have implemented a two-tier i18n system using `vue-i18n` with the following architectural choices:

1.  **Flat `template.*` Namespace**: Instead of nesting template strings under a template ID (e.g., `template.snowflake.step.label`), we use a flat `template.*` namespace. This simplifies key resolution in shared components that render template-driven content.
2.  **Lazy Loading via `TemplateRegistry`**: Template-specific locale files are loaded dynamically. When a project is opened, the `WritingProjectPage` uses the `TemplateRegistry` to load the required template definition and its associated locale messages.
3.  **On-Demand Registration**: Template messages are registered with the global i18n instance only when the project view is initialized, rather than at application startup.
4.  **Integrated Test Helpers**: Our testing framework (`createTestI18n`) is configured to automatically merge template strings into the locale during test setup, ensuring that tests for template-driven components have access to the necessary translations without manual mock overhead.

## Consequences

### Pros

- **Optimized Bundle Size**: Users only download the translations for the methodology they are actually using.
- **Feature Isolation**: Template-specific strings live within the template's feature directory, maintaining clean separation.
- **Simplified Consumption**: Components don't need to know which template is active to find a key; they just look under the `template.*` namespace.
- **Type Safety**: Core app strings are fully typed via `MessageSchema`.

### Cons/Risks

- **Global Namespace Collision**: Since we use a flat `template.*` namespace, different templates must avoid conflicting keys if they were ever to be loaded simultaneously (though currently only one template is active at a time).
- **Asynchronous Loading**: UI must handle the brief period where template strings are being loaded (managed via the existing `AppLoadingOverlay`).

## Alternatives Considered

- **Eager Loading**: Loading all template strings at startup. Rejected due to scalability/performance concerns.
- **Scoped Namespaces**: Using `template.{templateId}.*`. Rejected because it makes shared UI components (like the Sidebar or Canvas) more complex, as they would need to dynamically construct translation keys based on the active template ID.

## Future Considerations

- **Multi-language Support**: The infrastructure is ready for additional languages (e.g., `es.json`), but currently only `en.json` is implemented.
- **Template Marketplace**: This architecture supports a future where templates might be downloaded from external sources, as each template carries its own translations.
