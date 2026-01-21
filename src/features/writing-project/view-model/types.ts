import type { Step, Connection } from '@/features/writing-project/domain/types'

export interface ViewModel {
  canvasSteps: Step[]
  sidebarSteps: Step[]
  connections: Connection[]
}
