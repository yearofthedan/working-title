import { reactive, toRefs } from 'vue'

export interface DetailPanelState {
  isOpen: boolean
  activeStepId: string | null
}

const state = reactive<DetailPanelState>({
  isOpen: false,
  activeStepId: null,
})

export function useDetailPanel() {
  const openPanel = (stepId: string) => {
    state.activeStepId = stepId
    state.isOpen = true
  }

  const closePanel = () => {
    state.isOpen = false
    state.activeStepId = null
  }

  return {
    ...toRefs(state),
    openPanel,
    closePanel,
  }
}
