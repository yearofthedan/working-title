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


const sampleData = {
  "schemaVersion": "1.0.0",
  "projectId": "proj_1984_orwell",
  "templateId": "snowflake-method-v1",
  "templateVersion": "1.0.0",
  "meta": {
    "name": "1984",
    "created": "1948-06-08T10:00:00Z",
    "lastModified": "1949-06-08T14:30:00Z"
  },
  "nodes": [
    {
      "id": "node_meta_1",
      "stepId": "step-genre",
      "content": {
        "text": "Dystopian / Social Sci-Fi"
      }
    },
    {
      "id": "node_meta_2",
      "stepId": "step-target-audience",
      "content": {
        "text": "Adult"
      }
    },
    {
      "id": "node_0_theme",
      "stepId": "step-theme",
      "content": {
        "text": "Totalitarianism destroys objective truth and individual identity."
      }
    },
    {
      "id": "node_1_root",
      "stepId": "step-summary",
      "content": {
        "text": "A low-ranking official in a surveillance state tries to rebel by falling in love, but is systematically broken."
      }
    },
    {
      "id": "node_2_storyline",
      "stepId": "step-storyline",
      "content": {
        "text": "<p>Winston Smith lives in Airstrip One, working for the Ministry of Truth rewriting history. He secretly hates the Party and begins a forbidden diary. He meets Julia, and they start an illicit affair, believing they can find private happiness. They are entrapped by O'Brien, a member of the Inner Party posing as a rebel. Winston is tortured in Room 101 until he betrays Julia. Ultimately, he is released, broken, and realizes he loves Big Brother.</p>"
      }
    },
    {
      "id": "node_3_char_winston",
      "stepId": "step-char-summary",
      "content": {
        "text": "<p><strong>Name:</strong> Winston Smith<br><strong>Goal:</strong> To remember the past and stay human.<br><strong>Conflict:</strong> The Party controls reality and watches everything.<br><strong>Epiphany:</strong> He cannot win; fear is stronger than love.</p>"
      }
    },
    {
      "id": "node_4_synopsis_diary",
      "stepId": "step-plot-synopsis",
      "content": {
        "text": "<p>Winston returns to his apartment during his lunch break. He finds a blind spot in the telescreen's view. Trembling, he opens the book he bought at Mr. Charrington's shop and writes 'DOWN WITH BIG BROTHER', committing Thoughtcrime.</p>"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1_root",
      "target": "node_2_storyline"
    },
    {
      "id": "edge_2",
      "source": "node_2_storyline",
      "target": "node_3_char_winston"
    },
    {
      "id": "edge_3",
      "source": "node_2_storyline",
      "target": "node_4_synopsis_diary"
    },
    {
      "id": "edge_4",
      "source": "node_3_char_winston",
      "target": "node_4_synopsis_diary"
    }
  ]
}