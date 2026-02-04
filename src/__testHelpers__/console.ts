export const overideCommonConsoleNoise = () => {
  const silentPatterns = [
    'decodeEntities option is passed',
    '<Suspense> is an experimental feature and its API will likely change.',
  ]

  const originalConsole = { ...console }

  const handler = {
    get(target: Console, prop: keyof Console) {
      const originalMethod = target[prop]

      if (typeof originalMethod === 'function') {
        return (...args: unknown[]) => {
          const message = args[0]
          const isNoise =
            typeof message === 'string' && silentPatterns.some((p) => message.includes(p))

          if (!isNoise) Reflect.apply(originalMethod, target, args)
        }
      }
      return originalMethod
    },
  }

  window.console = new Proxy(originalConsole, handler) as Console
}
