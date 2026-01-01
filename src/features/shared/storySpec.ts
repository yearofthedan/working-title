/**
 * NARRATIVE TEMPLATE SPECIFICATION (v1.0)
 * * This file defines the schema for any process template (Snowflake, Hero's Journey, etc.)
 * that runs on the Narrative Engine.
 */

export interface NarrativeTemplate {
  /** Unique identifier for the template (e.g., 'snowflake-v1') */
  id: string
  /** Template version */
  version: string
  /** i18n key for the display name */
  nameText: string
  /** i18n key for the description */
  descriptionText: string

  /**
   * The entry points for the template. These are the actions available when the project is empty.
   */
  rootActions: RootAction[]

  /**
   * The list of all possible steps in this process.
   */
  steps: StepDefinition[]

  ui?: {
    /** Map of track IDs to ordered step IDs for spatial organization (e.g. columns). */
    tracks?: Record<string, string[]>
    /** Layer offset per track. Nodes in a track have this added to their stage. */
    trackOffsets?: Record<string, number>
  }
}

export interface RootAction {
  labelText: string
  trigger: 'append'
  targetType: string // Must match a key in the 'steps' record
}

export interface StepDefinition {
  id: string
  category: StepCategory

  /**
   * Logical sequence in the process.
   * Use for progress tracking or conditional unlocking.
   */
  stage?: number

  /** i18n key for the node title */
  labelText: string
  /** i18n key for the sidebar help text */
  instructionText: string

  /**
   * If true, this node is created automatically when a new project starts.
   */
  isInitial?: boolean

  content: StepContent

  /** * UI-specific hints for this step.
   */
  ui: {
    /** * Defines which interface areas should render this node.
     * Use a list to allow a node to appear in multiple places simultaneously.
     * Common values: 'canvas', 'sidebar', 'panel'.
     */
    visibility: ('canvas' | 'sidebar')[]
  }

  validations?: ValidationRule[]
  actions: StepAction[]
}

export type StepCategory = 'structure' | 'character' | 'context' | 'drafting' | string

export interface StepContent {
  /** Determines which editor component to render */
  format: 'plain' | 'rich'
  /** i18n key for the empty state text */
  placeholderText: string
}

export interface ValidationRule {
  rule: 'has_connection'
  /** The specific type of node looked for */
  targetType: string
  severity: 'warning' | 'error'
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
  }
}
