export function parseUserDateInput(value: string): Date | null {
  if (!value || typeof value !== "string") {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function getNextOccasionDate(
  occasionDate: Date,
  recurring: boolean,
  now = new Date()
): Date {
  const original = new Date(occasionDate)

  if (!recurring) {
    return original
  }

  const today = startOfDay(now)
  const next = new Date(
    today.getFullYear(),
    original.getMonth(),
    original.getDate(),
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    original.getMilliseconds()
  )

  if (startOfDay(next) < today) {
    next.setFullYear(next.getFullYear() + 1)
  }

  return next
}
