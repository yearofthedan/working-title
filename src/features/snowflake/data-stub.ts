import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export const nodes = ref<Node[]>([
  {
    id: '1',
    type: 'richText',
    position: { x: 250, y: 50 },
    data: {
      label: 'Initial Idea',
      content: '<p>This is the <strong>initial idea</strong> for the story.</p>',
    },
  },
  {
    id: '2',
    type: 'richText',
    position: { x: 100, y: 200 },
    data: {
      label: 'Character Development',
      content: '<p>Details about the main characters and their arcs.</p>',
    },
  },
  {
    id: '3',
    type: 'richText',
    position: { x: 400, y: 200 },
    data: { label: 'Plot Outline', content: '<p>The main plot points and story progression.</p>' },
  },
])

export const edges = ref<Edge[]>([
  { id: 'e1-2', source: '1', target: '2', type: 'default' },
  { id: 'e1-3', source: '1', target: '3', type: 'default' },
])
