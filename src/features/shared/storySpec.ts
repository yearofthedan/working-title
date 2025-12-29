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
