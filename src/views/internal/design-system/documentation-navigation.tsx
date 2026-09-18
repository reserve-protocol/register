import { useEffect, useRef } from 'react'
import { useLingui } from '@lingui/react/macro'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'
import {
  DOCUMENTATION_NAVIGATION,
  translateDocumentationText,
  type DocumentationNavigationGroup,
  type DocumentationNavigationItem,
} from './documentation-presentation'
import { useDocumentationSection } from './documentation-section-observer'

const getRouteParts = (route: string) => {
  const [pathAndSearch, hash = ''] = route.split('#')
  return {
    hash,
    pathname: pathAndSearch.split('?')[0],
  }
}

const containsPathname = (
  item: DocumentationNavigationItem,
  pathname: string
): boolean =>
  getRouteParts(item.route).pathname === pathname ||
  (item.items ?? []).some((child) => containsPathname(child, pathname))

const DocumentationNavigation = ({
  onNavigate,
  touchTargets = false,
}: {
  onNavigate?: () => void
  touchTargets?: boolean
}) => {
  const { t } = useLingui()
  const { pathname } = useLocation()
  const { activeSectionId, activeSectionPath } = useDocumentationSection()
  const navigationRef = useRef<HTMLDivElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement>(null)
  const isPointerInside = useRef(false)
  const navigationGroups: readonly DocumentationNavigationGroup[] =
    DOCUMENTATION_NAVIGATION

  const isItemCurrent = (item: DocumentationNavigationItem) => {
    const route = getRouteParts(item.route)
    if (route.pathname !== pathname) return false
    if (route.hash) return activeSectionId === route.hash
    return !activeSectionId
  }

  const isGroupActive = (group: DocumentationNavigationGroup) => {
    const routePathname = getRouteParts(group.route).pathname
    return group.id === 'start'
      ? pathname === routePathname
      : pathname === routePathname ||
          pathname.startsWith(`${routePathname}/`) ||
          containsPathname(group, pathname)
  }

  useEffect(() => {
    const navigation = navigationRef.current
    const activeLink = activeLinkRef.current
    if (
      !navigation ||
      !activeLink ||
      isPointerInside.current ||
      navigation.contains(document.activeElement)
    )
      return

    activeLink.scrollIntoView({ block: 'nearest' })
  }, [activeSectionId, pathname])

  const renderItems = (
    items: readonly DocumentationNavigationItem[],
    groupActive: boolean,
    depth: 1 | 2
  ) => (
    <div className={cn(depth === 1 ? 'space-y-px' : 'space-y-0')}>
      {items.map((item) => {
        const isCurrent = isItemCurrent(item)
        const isActive =
          groupActive && (isCurrent || activeSectionPath.includes(item.id))

        return (
          <div key={item.id}>
            <Link
              ref={isCurrent ? activeLinkRef : undefined}
              aria-current={isCurrent ? 'location' : undefined}
              data-active={isActive ? 'true' : undefined}
              data-testid={
                item.id === 'contexts'
                  ? 'design-system-nav-screens'
                  : item.id === 'status'
                    ? 'design-system-nav-status'
                    : undefined
              }
              to={item.route}
              onClick={onNavigate}
              className={cn(
                'relative flex min-w-0 items-center gap-2 py-0.5 leading-5 text-muted-foreground before:absolute before:-inset-y-0.5 before:inset-x-0 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                depth === 1
                  ? 'pl-3 pr-1 text-xs font-medium'
                  : 'pl-6 pr-1 text-xs',
                touchTargets && 'min-h-11',
                isActive && 'font-medium text-foreground',
                isCurrent && 'font-medium text-primary'
              )}
            >
              <span className="min-w-0 flex-1 truncate">
                {translateDocumentationText(item.label, t)}
              </span>
              {item.activityLabel ? (
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {translateDocumentationText(item.activityLabel, t)}
                </span>
              ) : null}
              {item.legacy ? (
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t`Legacy`}
                </span>
              ) : null}
            </Link>
            {item.items?.length
              ? renderItems(item.items, groupActive, 2)
              : null}
          </div>
        )
      })}
    </div>
  )

  return (
    <nav aria-label={t`Design system documentation`} className="h-full min-h-0">
      <div
        ref={navigationRef}
        data-testid="documentation-navigation-scroll"
        className="h-full min-h-0 space-y-2.5 overflow-y-auto overscroll-contain pr-1"
        onPointerEnter={() => {
          isPointerInside.current = true
        }}
        onPointerLeave={() => {
          isPointerInside.current = false
          if (!navigationRef.current?.contains(document.activeElement))
            activeLinkRef.current?.scrollIntoView({ block: 'nearest' })
        }}
      >
        {navigationGroups.map((group) => {
          const isActive = isGroupActive(group)
          const isCurrent = isItemCurrent(group)
          return (
            <div key={group.id}>
              <Link
                ref={isCurrent ? activeLinkRef : undefined}
                data-testid={`design-system-nav-${group.id}`}
                data-active={isActive ? 'true' : undefined}
                aria-current={isCurrent ? 'page' : undefined}
                to={group.route}
                onClick={onNavigate}
                className={cn(
                  'relative flex items-center py-1 text-sm font-medium text-foreground before:absolute before:-inset-y-0.5 before:inset-x-0 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  touchTargets && 'min-h-11',
                  isActive && 'font-semibold',
                  isCurrent && 'text-primary'
                )}
              >
                {translateDocumentationText(group.label, t)}
              </Link>
              {group.items?.length
                ? renderItems(group.items, isActive, 1)
                : null}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export default DocumentationNavigation
