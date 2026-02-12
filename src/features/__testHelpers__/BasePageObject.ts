import type { BrowserPage, Locator } from 'vitest/browser'

export type Locatable = BrowserPage | Locator
/**
 * Base Page Object providing shared locator logic.
 */
export abstract class BasePageObject {
  /**
   * The root host for this component (Page or Locator).
   */
  public readonly host: Locator

  constructor(host: Locatable) {
    // Both BrowserPage and Locator share the same API, but 'Locator' is the
    // common denominator for component-level testing.
    this.host = host as unknown as Locator
  }
}
