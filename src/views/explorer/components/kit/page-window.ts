export type PageSlot = number | 'gap'

// Pages are 1-based here; the table's page index is 0-based.
export const getPageWindow = (current: number, total: number): PageSlot[] => {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = new Set(
    [1, 2, current - 1, current, current + 1, total].filter(
      (page) => page >= 1 && page <= total
    )
  )
  if (current <= 3) pages.add(3)

  const slots: PageSlot[] = []
  let previous = 0
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (page - previous > 1) slots.push('gap')
    slots.push(page)
    previous = page
  }
  return slots
}

export const getPageRange = (
  pageIndex: number,
  pageSize: number,
  total: number
) => ({
  from: total === 0 ? 0 : pageIndex * pageSize + 1,
  to: Math.min((pageIndex + 1) * pageSize, total),
})
