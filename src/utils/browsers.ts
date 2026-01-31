export const supportsFilePicker = (): boolean => {
  return (
    typeof window.showSaveFilePicker === 'function' &&
    typeof window.showOpenFilePicker === 'function'
  )
}
