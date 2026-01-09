/**
 * PROCESS TEMPLATE SPECIFICATION (v0.1)
 * * This file defines the schema for any process template (Snowflake, Hero's Journey, etc.)
 * that runs on the Narrative Engine.
 */
type i18nKey = string

export interface ProcessTemplate {
  /** Unique identifier for the template (e.g., 'snowflake-v1') */
  id: string
  /** Template version */
  version: string
  /** i18n key for the display name */
  nameText: i18nKey
  /** i18n key for the description */
  descriptionText: i18nKey

  /**
   * The entry points for the template. These are the actions available when the project is empty.
   */
  rootActions: RootAction[]

  /**
   * The list of all possible steps in this process.
   */
  stepDefinitions: StepDefinition[]

  ui?: {
    /** Ordered list of tracks from left to right */
    tracks?: TrackDefinition[]
  }
}
export interface TrackDefinition {
  /** Unique ID for the track category (e.g., 'main', 'characters') */
  id: string
  /** The step types that act as roots for this track */
  rootStepIds: string[]
  /** Vertical offset for this track's layers */
  layerOffset?: number
  /** Optional: Display name for the track header in the UI */
  labelText?: i18nKey
}

export interface RootAction {
  labelText: i18nKey
  trigger: 'append'
  targetStepId: string // Must match the id of a step in the 'steps' record
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
  labelText: i18nKey
  /** i18n key for the sidebar help text */
  instructionText: i18nKey

  /**
   * If true, this node is created automatically when a new project starts.
   */
  isInitial?: boolean

  editorConfig: EditorConfig

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

export interface EditorConfig {
  /** Determines which editor component to render */
  format: 'plain' | 'rich'
  /** i18n key for the empty state text */
  placeholderText: i18nKey
}

export interface ValidationRule {
  rule: 'has_connection'
  /** The specific type of node looked for */
  targetType: string
  severity: 'warning' | 'error'
  messageText: i18nKey
}

export interface StepAction {
  /** i18n key for the button label */
  labelText: i18nKey

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
