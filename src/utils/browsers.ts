export const supportsFilePicker = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.showSaveFilePicker === 'function' &&
    typeof window.showOpenFilePicker === 'function'
  )
}

export const browserSupport = {
  supportsFilePicker,
}
