import { computed, type Ref } from 'vue'
import type { ProjectData, Step, Connection } from '@/specs/projectDataSpec'
import type {
  ProcessTemplate,
  StepCategory,
  StepDefinition,
  TrackDefinition,
} from '@/features/process-templates/processTemplate'
import type { SidebarNode } from '../types'
import { partitionNodesByRoot } from '@/utils/graphs'

export interface CanvasNode {
  id: string
  stepId: string
  stage?: number
  category: StepCategory
  sortOrder: number
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
}

export interface GraphViewModel {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  tracks?: TrackDefinition[]
  trackOffsets?: Record<string, number>
  sortingConfig: {
    stepOrder: string[]
  }
}

export type Track = {
  id: string
  offset: number
  nodes: CanvasNode[]
}

export interface TracksViewModel {
  tracks: Track[]
  edges: CanvasEdge[]
  sortingConfig: {
    stepOrder: string[]
  }
}

export interface ViewModel {
  tracks: TracksViewModel
  sidebar: {
    nodes: SidebarNode[]
  }
}

const mapToSidebar = (
  steps: Step[],
  stepDefinitionMap: Map<string, StepDefinition>
): ViewModel['sidebar'] => {
  return {
    nodes: steps
      .map((step) => {
        const stepDfn = stepDefinitionMap.get(step.stepId)
        if (!stepDfn) {
          return undefined
        }
        return {
          id: step.id,
          stepId: step.stepId,
        }
      })
      .filter((node) => !!node) as SidebarNode[],
  }
}

const toCanvasNode = (
  step: Step,
  stepDefinition?: StepDefinition,
  sortOrder: number = 0
): CanvasNode => {
  const stage = stepDefinition?.stage

  return {
    id: step.id,
    stepId: step.stepId,
    stage,
    category: stepDefinition?.category as StepCategory,
    sortOrder,
  }
}

const connectsRealNodes =
  (stepIds: Set<string>) =>
  (connection: Connection): boolean => {
    return stepIds.has(connection.source) && stepIds.has(connection.target)
  }

const findRootDefinitions = (
  nodes: CanvasNode[],
  trackDefinitions: TrackDefinition[]
): { id: string; root: CanvasNode }[] => {
  const stepToTrackMap = new Map<string, string>()

  trackDefinitions.forEach((track) => {
    track.rootStepIds.forEach((stepId) => {
      stepToTrackMap.set(stepId, track.id)
    })
  })

  return nodes
    .filter((node) => stepToTrackMap.has(node.stepId))
    .map((node) => ({
      id: stepToTrackMap.get(node.stepId)!,
      root: node,
    }))
}

const mapToTracks = (
  steps: Step[],
  connections: Connection[],
  stepDefinitionMap: Map<string, StepDefinition>,
  template: ProcessTemplate
): TracksViewModel => {
  const stepOrder = template.stepDefinitions.map((d) => d.id)
  const trackConfigs = template.ui?.tracks ?? []

  const allNodes = steps.map((s) =>
    toCanvasNode(s, stepDefinitionMap.get(s.stepId), stepOrder.indexOf(s.stepId))
  )

  const rootDefinitions = findRootDefinitions(allNodes, trackConfigs)
  const { groups, orphans } = partitionNodesByRoot(allNodes, connections, rootDefinitions)

  const sortByStepOrder = (a: CanvasNode, b: CanvasNode) =>
    stepOrder.indexOf(a.stepId) - stepOrder.indexOf(b.stepId)

  const mappedTracks = groups.map(([trackId, nodes], index) => {
    const config = trackConfigs.find((t) => t.id === trackId)
    return {
      id: `${trackId}-${index}`,
      offset: config?.layerOffset ?? 0,
      nodes: nodes.sort(sortByStepOrder),
    }
  })

  const finalTracks = mappedTracks.sort((a, b) => {
    const aIndex = trackConfigs.findIndex((t) => a.id.startsWith(t.id))
    const bIndex = trackConfigs.findIndex((t) => b.id.startsWith(t.id))
    return aIndex - bIndex
  })

  if (orphans.length > 0) {
    finalTracks.push({
      id: '__orphans',
      offset: 0,
      nodes: orphans.sort(sortByStepOrder),
    })
  }

  return {
    tracks: finalTracks,
    edges: connections.map((c) => ({
      id: c.id,
      source: c.source,
      target: c.target,
    })),
    sortingConfig: { stepOrder },
  }
}

const mapProjectToViewModel = (projectData: ProjectData, template: ProcessTemplate): ViewModel => {
  const stepDefinitionMap = new Map(template.stepDefinitions.map((s) => [s.id, s]))
  const validSteps = projectData.steps.filter((s) => stepDefinitionMap.has(s.stepId))
  const canvasSteps = validSteps.filter((s) =>
    stepDefinitionMap.get(s.stepId)?.ui.visibility.includes('canvas')
  )

  const tracks = mapToTracks(
    canvasSteps,
    projectData.connections.filter(connectsRealNodes(new Set(canvasSteps.map((s) => s.id)))),
    stepDefinitionMap,
    template
  )

  const sidebarSteps = validSteps.filter((s) =>
    stepDefinitionMap.get(s.stepId)?.ui?.visibility?.includes('sidebar')
  )
  const sidebar = mapToSidebar(sidebarSteps, stepDefinitionMap)

  return { sidebar, tracks }
}

export function useProjectViewModel(projectData: Ref<ProjectData>, template: Ref<ProcessTemplate>) {
  const viewModel = computed<ViewModel>(() => {
    return mapProjectToViewModel(projectData.value, template.value)
  })

  return { viewModel }
}
