import { ROUTES } from '@/utils/constants'

// `/<chain>/index-dtf/<token>/overview`, with or without a trailing slash.
export const isIndexDtfOverviewPathname = (pathname: string): boolean => {
  const [, , section, , subpage] = pathname.split('/')

  return section === 'index-dtf' && subpage?.toLowerCase() === ROUTES.OVERVIEW
}
