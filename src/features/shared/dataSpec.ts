/**
 * DATA STORAGE SPECIFICATION
 * Represents the persisted state of a story project.
 */

export interface NodeContent {
  /**
   * The primary narrative content. Expects HTML or Markdown strings from the editor.
   */
  text: string
  assets?: StoryAsset[]
  metadata?: Record<string, unknown>
}

export interface StoryProjectNode {
  id: string
  stepId: string
  content: NodeContent
}

export interface StoryAsset {
  id: string
  type: 'image' | 'link' | 'file'
  url: string
  caption?: string
}

export interface StoryProjectEdge {
  id: string
  source: string
  target: string
}

export interface StoryProject {
  schemaVersion: string
  projectId: string
  templateId: string
  templateVersion: string
  meta: {
    name: string
    created: string
    lastModified: string
  }
  nodes: StoryProjectNode[]
  edges: StoryProjectEdge[]
}
