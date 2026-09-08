import { ROUTES } from '@/utils/constants'

// `/<chain>/index-dtf/<token>/overview`, with or without a trailing slash.
// Anything after the overview segment is a different page.
export const isIndexDtfOverviewPathname = (pathname: string): boolean => {
  const [chain, section, token, subpage, ...rest] = pathname
    .split('/')
    .filter(Boolean)

  return (
    !!chain &&
    section === 'index-dtf' &&
    !!token &&
    subpage?.toLowerCase() === ROUTES.OVERVIEW &&
    rest.length === 0
  )
}
