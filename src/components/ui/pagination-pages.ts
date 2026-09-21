export type PaginationPage = number | 'start-ellipsis' | 'end-ellipsis'

export const getPaginationPages = (
  pageCount: number,
  currentPage: number,
  maxItems: 5 | 7 = 7
): PaginationPage[] => {
  if (pageCount <= maxItems) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const edgePageCount = maxItems - 2
  const edgeThreshold = Math.floor(maxItems / 2)

  if (currentPage <= edgeThreshold + 1) {
    return [
      ...Array.from({ length: edgePageCount }, (_, index) => index + 1),
      'end-ellipsis',
      pageCount,
    ]
  }

  if (currentPage >= pageCount - edgeThreshold) {
    return [
      1,
      'start-ellipsis',
      ...Array.from(
        { length: edgePageCount },
        (_, index) => pageCount - edgePageCount + index + 1
      ),
    ]
  }

  const siblingCount = (maxItems - 5) / 2

  return [
    1,
    'start-ellipsis',
    ...Array.from(
      { length: siblingCount * 2 + 1 },
      (_, index) => currentPage - siblingCount + index
    ),
    'end-ellipsis',
    pageCount,
  ]
}
