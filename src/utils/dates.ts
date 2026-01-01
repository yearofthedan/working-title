export const formatDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return 'Unknown date'

  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export const now = (): string => {
  return new Date().toISOString()
}
