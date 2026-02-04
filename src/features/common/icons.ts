import IPhPlus from '~icons/ph/plus'
import IPhUploadSimple from '~icons/ph/upload-simple'
import IPhPlay from '~icons/ph/play'
import IPhX from '~icons/ph/x'
import IPhWarning from '~icons/ph/warning'

export const icons = {
  add: IPhPlus,
  open: IPhUploadSimple,
  play: IPhPlay,
  delete: IPhX,
  warning: IPhWarning,
} as const

export type IconKey = keyof typeof icons
