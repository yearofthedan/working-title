// Union of all possible paths in the object
type Path<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? K | `${K}.${Path<T[K]>}` : K }[keyof T &
      string]
  : never

/**
 * Resolves a value from a nested object tree using a path string.
 * Returns the resolved value if it's a string, otherwise returns the path itself.
 */
export const getValueAtPath = <T extends object, P extends Path<T> & string>(
  obj: T,
  path: P
): string => {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)

  return typeof value === 'string' ? value : path
}
