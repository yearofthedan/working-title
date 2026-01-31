import { computed, type Ref } from 'vue'
import type { Step, Connection } from '@/features/project-storage/types'
import type {
  ProcessTemplate,
  StepCategory,
  StepDefinition,
  TrackDefinition,
} from '@/features/process-templates/processTemplate'
import { partitionNodesByRoot } from '@/utils/graphs'
import type { ActionDefinition } from '../../composables/useStepActions'
import { useDefinitionsContext } from '../../composables/useDefinitionsContext'
import { useProjectContent } from '../../composables/useActiveProjectContext'
import type { BasicCanvasNode, CanvasViewModel, EnrichedCanvasNode, Track } from '../types'

const toBasicCanvasNode = (
  step: Step,
  stepDefinition?: StepDefinition,
  sortOrder: number = 0
): BasicCanvasNode => {
  return {
    id: step.id,
    stepId: step.stepId,
    stage: stepDefinition?.stage,
    category: stepDefinition?.category as StepCategory,
    sortOrder,
  }
}

const findRootDefinitions = (
  nodes: BasicCanvasNode[],
  trackDefinitions: TrackDefinition[]
): { id: string; root: BasicCanvasNode }[] => {
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

const organizeIntoTracks = (
  nodes: BasicCanvasNode[],
  connections: Connection[],
  template: ProcessTemplate
): Track[] => {
  const trackConfigs = template.ui?.tracks ?? []
  const stepOrder = template.stepDefinitions.map((d) => d.id)

  const rootDefinitions = findRootDefinitions(nodes, trackConfigs)
  const { groups, orphans } = partitionNodesByRoot(nodes, connections, rootDefinitions)

  const sortByStepOrder = (a: BasicCanvasNode, b: BasicCanvasNode) =>
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

  return finalTracks
}

export function useCanvasViewModel(
  canvasSteps: Ref<Step[]>,
  connections: Ref<Connection[]>,
  template: Ref<ProcessTemplate>,
  getAvailableActions: (id: string) => ActionDefinition[]
): Ref<CanvasViewModel> {
  const definitions = useDefinitionsContext()
  const { getContent } = useProjectContent()

  return computed(() => {
    const stepDefinitionMap = new Map(template.value.stepDefinitions.map((s) => [s.id, s]))
    const stepOrder = template.value.stepDefinitions.map((d) => d.id)

    const visibleSteps = canvasSteps.value.filter((s) => {
      const def = stepDefinitionMap.get(s.stepId)
      return def?.ui.visibility.includes('canvas')
    })

    const basicNodes = visibleSteps.map((s) =>
      toBasicCanvasNode(s, stepDefinitionMap.get(s.stepId), stepOrder.indexOf(s.stepId))
    )

    const tracks = organizeIntoTracks(basicNodes, connections.value, template.value)

    const nodeMap = new Map<string, EnrichedCanvasNode>()
    basicNodes.forEach((node) => {
      const stepDef = definitions.getStepDef(node.stepId)
      const stepContent = getContent(node.id)

      nodeMap.set(node.id, {
        id: node.id,
        stepId: node.stepId,
        //todo review these. Are they being used? are we duplicating a pattern?
        label: stepDef?.labelText ?? '',
        placeholder: stepDef?.editorConfig.placeholderText ?? '',
        instruction: stepDef?.instructionText ?? '',
        content: stepContent?.content.text ?? '',
        category: node.category,
        stage: node.stage,
        actions: getAvailableActions(node.id),
        editorFormat: stepDef?.editorConfig.format === 'plain' ? 'plain' : 'rich',
      })
    })

    const nodeIds = new Set(basicNodes.map((n) => n.id))
    const validEdges = connections.value
      .filter((c) => nodeIds.has(c.source) && nodeIds.has(c.target))
      .map((c) => ({
        id: c.id,
        source: c.source,
        target: c.target,
      }))

    return {
      tracks,
      edges: validEdges,
      nodeMap,
    }
  })
}
