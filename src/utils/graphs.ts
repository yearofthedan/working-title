interface PartitionedResults<T extends Node> {
  groups: [string, T[]][]
  orphans: T[]
}

interface Node {
  id: string
}

const buildAdjacencyMap = <T extends Node>(
  nodes: T[],
  connections: { source: string; target: string }[]
): Map<string, T[]> => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adjacencyMap = new Map<string, T[]>()

  for (const connection of connections) {
    const targetNode = nodeMap.get(connection.target)

    if (targetNode) {
      const children = adjacencyMap.get(connection.source) ?? []
      children.push(targetNode)
      adjacencyMap.set(connection.source, children)
    }
  }

  return adjacencyMap
}

export const partitionNodesByRoot = <T extends Node>(
  nodes: T[],
  connections: { source: string; target: string }[],
  rootDefinitions: { id: string; root: T }[]
): PartitionedResults<T> => {
  const unclaimedNodes = new Map<string, T>(nodes.map((n) => [n.id, n]))
  const allRootIds = new Set(rootDefinitions.map((d) => d.root.id))

  const adjacencyMap = buildAdjacencyMap(nodes, connections)
  const groups = rootDefinitions.map<[string, T[]]>(({ root, id }) => {
    if (!unclaimedNodes.has(root.id)) return [id, []]

    const groupNodes: T[] = []
    const queue: T[] = [root]
    unclaimedNodes.delete(root.id)

    while (queue.length > 0) {
      const current = queue.shift()!
      groupNodes.push(current)

      const children = adjacencyMap.get(current.id) ?? []
      for (const child of children) {
        // Stop if node is missing or if it marks the start of another root
        if (unclaimedNodes.has(child.id) && !allRootIds.has(child.id)) {
          unclaimedNodes.delete(child.id)
          queue.push(child)
        }
      }
    }
    return [id, groupNodes]
  })

  return {
    groups,
    orphans: Array.from(unclaimedNodes.values()),
  }
}
