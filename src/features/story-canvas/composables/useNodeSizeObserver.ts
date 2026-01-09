import { ref } from 'vue'

export function useNodeSizeObserver() {
  const dimensions = ref(new Map<string, { w: number; h: number }>())

  const observer = new ResizeObserver((entries) => {
    let changed = false
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      const id = el.dataset.id

      if (id) {
        dimensions.value.set(id, { w: el.offsetWidth, h: el.offsetHeight })
        changed = true
      }
    }
    if (changed) dimensions.value = new Map(dimensions.value)
  })

  const registerNode = (id: string, el: HTMLElement | null) => {
    if (!el) {
      dimensions.value.delete(id)
      return
    }
    el.dataset.id = id
    observer.observe(el)
  }

  return { dimensions, registerNode }
}
