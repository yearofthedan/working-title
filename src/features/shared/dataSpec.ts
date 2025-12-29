export interface StoryCanvasNode {
  id: string
  stepId: string
  content: {
    text: string
  }
}

export interface StoryCanvasEdge {
  id: string
  source: string
  target: string
}

export interface StoryCanvasProject {
  schemaVersion: string
  projectId: string
  templateId: string
  templateVersion: string
  meta: {
    name: string
    created: string
    lastModified: string
  }
  nodes: StoryCanvasNode[]
  edges: StoryCanvasEdge[]
}
