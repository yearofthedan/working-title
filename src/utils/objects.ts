// Helper to resolve nested keys like "step.summary.label"

// Union of all possible paths in the object
type Path<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? K | `${K}.${Path<T[K]>}` : K }[keyof T &
      string]
  : never

// Specific type at a path from the object
type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : unknown
  : P extends keyof T
    ? T[P]
    : unknown

/**
 * Resolves a value from a nested object tree using a path string (or returns the path itself if not found)
 */
export const getValueAtPath = <T extends object, P extends Path<T> & string>(
  obj: T,
  path: P
): PathValue<T, P> => {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
  return (value ?? path) as PathValue<T, P>
}
