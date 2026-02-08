import IPhPlus from '~icons/ph/plus'
import IPhUploadSimple from '~icons/ph/upload-simple'
import IPhPlay from '~icons/ph/play'
import IPhX from '~icons/ph/x'
import IPhWarning from '~icons/ph/warning'
import IPhCheckCircle from '~icons/ph/check-circle'
import IPhWarningCircle from '~icons/ph/warning-circle'
import IPhArrowSquareRight from '~icons/ph/arrow-square-right'

export const icons = {
  add: IPhPlus,
  open: IPhUploadSimple,
  play: IPhPlay,
  delete: IPhX,
  close: IPhX,
  warning: IPhWarning,
  success: IPhCheckCircle,
  error: IPhWarningCircle,
  expand: IPhArrowSquareRight,
} as const

export type IconKey = keyof typeof icons
