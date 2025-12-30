/**
 * NARRATIVE TEMPLATE SPECIFICATION (v1.0)
 * * This file defines the schema for any process template (Snowflake, Hero's Journey, etc.)
 * that runs on the Narrative Engine.
 */

export interface NarrativeTemplate {
  /** Unique identifier for the template (e.g., 'snowflake-v1') */
  id: string
  /** Semantic versioning for the logic (e.g., '1.0.0') */
  version: string
  /** i18n key for the display name */
  nameText: string
  /** i18n key for the description */
  descriptionText: string

  /** * The entry points for the template.
   * These are the actions available when the graph is empty.
   */
  rootActions: RootAction[]

  /**
   * The dictionary of all possible steps in this process.
   * Keys should be unique IDs (e.g., 'step-storyline').
   */
  steps: Record<string, StepDefinition>

  /**
   * Optional layout configuration for canvas visualization.
   * Defines how steps are grouped into horizontal tracks.
   */
  layout?: TemplateLayout
}

export interface TemplateLayout {
  /**
   * Defines all horizontal tracks for the canvas.
   * Each track is laid out independently and positioned side-by-side (left to right).
   * Key is a track name, value is an array of root step IDs for that track.
   * Child nodes inherit their track from their parent via graph connectivity.
   *
   * Example:
   *   tracks: {
   *     main: ['step-summary'],
   *     characters: ['step-char-summary', 'step-minor-char'],
   *   }
   */
  tracks?: Record<string, string[]>
}

export interface RootAction {
  labelText: string
  trigger: 'append'
  targetType: string // Must match a key in the 'steps' record
}

export interface StepDefinition {
  id: string
  /** High-level grouping for UI styling (e.g., 'structure', 'character') */
  category: StepCategory

  /**
   * The writing stage this step belongs to (1-based).
   * Steps with the same stage appear at the same vertical level in the canvas.
   * Lower stages = earlier in the writing process.
   */
  stage: number

  /** i18n key for the node title */
  labelText: string
  /** i18n key for the sidebar help text */
  instructionText: string

  /** Configuration for the node's editor area */
  content: StepContent

  /** * Optional quality control rules.
   * These do not block saving, but show warnings in the UI.
   */
  validations?: ValidationRule[]

  /** * The available operations a user can perform from this node.
   * Defines the 'out-bound' edges.
   */
  actions: StepAction[]
}

export type StepCategory = 'structure' | 'character' | 'context' | 'drafting' | string

export interface StepContent {
  /** Determines which editor component to render */
  contentType: 'globalText' | 'richText'
  /** i18n key for the empty state text */
  placeholderText: string
}

export interface ValidationRule {
  /** The logic check to run */
  rule: 'has_connection'
  /** The specific type of node looked for */
  targetType: string
  /** How loud the alert should be */
  severity: 'warning' | 'error'
  /** i18n key for the alert message */
  messageText: string
}

export interface StepAction {
  /** i18n key for the button label */
  labelText: string

  /** * The mechanism of the action:
   * - 'append': Adds a new child node (One-to-Many).
   * - 'advance': Moves this node to the next stage (One-to-One).
   * - 'connect': Draws a line to an existing node.
   */
  trigger: 'append' | 'advance' | 'connect'

  /** The ID of the step definition to create or link to */
  targetType: string

  /** Metadata for UI behavior or constraints */
  meta?: {
    /** If true, this link is structural/mandatory */
    required?: boolean
    /** Any other custom flags for the engine */
    [key: string]: unknown
  }
}
