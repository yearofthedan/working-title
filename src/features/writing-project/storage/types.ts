/**
 * DATA STORAGE SPECIFICATION
 * Represents the persisted state of a story project.
 */

export interface StepContent {
  /**
   * The primary narrative content. Expects HTML or Markdown strings from the editor.
   */
  text: string
  assets?: AssetData[]
  metadata?: Record<string, unknown>
}

export interface Step {
  id: string
  stepId: string
  content: StepContent
}

export interface AssetData {
  id: string
  type: 'image' | 'link' | 'file'
  url: string
  caption?: string
}

export interface Connection {
  id: string
  source: string
  target: string
}

export interface ProjectData {
  schemaVersion: string
  projectId: string
  templateId: string
  templateVersion: string
  meta: {
    name: string
    created: string
    lastModified: string
  }
  steps: Step[]
  connections: Connection[]
}
