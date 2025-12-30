export interface StoryProjectNode {
  id: string
  stepId: string
  content: {
    text: string
  }
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
