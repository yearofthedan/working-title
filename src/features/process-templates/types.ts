export type i18nKey = string

interface BaseAction {
  /** Unique id for the action */
  id: string
  trigger: unknown
  /** i18n key for the action label */
  labelText: i18nKey
  /** Type (eg. step) that this acts against */
  targetType: string
}

export interface RootAction extends BaseAction {
  id: `root-action-${string}`
  /** Adds a new child node (One-to-Many) */
  trigger: 'append'
}

export interface StepAction extends BaseAction {
  id: `step-action-${string}`
  /** * The mechanism of the action:
   * - 'append': Adds a new child node (One-to-Many).
   * - 'advance': Moves this node to the next stage (One-to-One).
   */
  trigger: 'append' | 'advance'
  targetType: string
}
