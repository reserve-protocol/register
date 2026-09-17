import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
}: {
  onNavigate?: () => void
}) => {
  const { t } = useLingui()
  const { pathname } = useLocation()
  const { activeSectionId, activeSectionPath } = useDocumentationSection()
  const [expandedItems, setExpandedItems] = useState<
    Readonly<Record<string, boolean>>
  >({})
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

  const activeGroup = navigationGroups.find(isGroupActive)
  const activeGroupPathname = activeGroup
    ? getRouteParts(activeGroup.route).pathname
    : undefined

  const toggleExpanded = (key: string, isExpanded: boolean) =>
    setExpandedItems((current) => ({ ...current, [key]: !isExpanded }))

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

  return (
    <nav
      aria-label={t`Design system documentation`}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      <div className="shrink-0 space-y-1">
        {navigationGroups.map((group) => {
          const isActive = isGroupActive(group)
          return (
            <Link
              key={group.id}
              data-testid={`design-system-nav-${group.id}`}
              aria-current={
                isActive && !activeSectionId ? 'location' : undefined
              }
              to={group.route}
              onClick={onNavigate}
              className={cn(
                'flex min-h-11 items-center px-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-8',
                isActive ? 'bg-muted text-primary' : 'hover:bg-muted'
              )}
            >
              {translateDocumentationText(group.label, t)}
            </Link>
          )
        })}
      </div>

      {activeGroup?.items && activeGroupPathname && (
        <div
          ref={navigationRef}
          data-testid="documentation-current-subnavigation"
          className="min-h-0 flex-1 overflow-y-auto border-t border-border pt-3"
          onPointerEnter={() => {
            isPointerInside.current = true
          }}
          onPointerLeave={() => {
            isPointerInside.current = false
            if (!navigationRef.current?.contains(document.activeElement))
              activeLinkRef.current?.scrollIntoView({ block: 'nearest' })
          }}
        >
          <div className="border-l border-border pl-2">
            {activeGroup.items.map((item) => {
              const isCurrent = isItemCurrent(item)
              const hasChildren = Boolean(item.items?.length)
              const expandedItemKey = `${activeGroupPathname}:${item.id}`
              const isExpanded =
                hasChildren &&
                (expandedItems[expandedItemKey] ??
                  (activeGroupPathname === pathname &&
                    activeSectionPath.includes(item.id)))

              return (
                <div key={item.id}>
                  <div className="flex items-center">
                    <Link
                      ref={isCurrent ? activeLinkRef : undefined}
                      aria-current={isCurrent ? 'location' : undefined}
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
                        'flex min-h-11 min-w-0 flex-1 items-center gap-2 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-8',
                        isCurrent && 'text-foreground'
                      )}
                    >
                      <span className="truncate">
                        {translateDocumentationText(item.label, t)}
                      </span>
                      {item.legacy && (
                        <span className="ml-auto shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t`Legacy lab`}
                        </span>
                      )}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        data-testid={`documentation-nav-group-${item.id}-toggle`}
                        aria-label={translateDocumentationText(item.label, t)}
                        aria-expanded={isExpanded}
                        onClick={() =>
                          toggleExpanded(expandedItemKey, isExpanded)
                        }
                        className="flex size-11 shrink-0 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-8"
                      >
                        <ChevronDown
                          className={cn(
                            'size-4 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {isExpanded && item.items && (
                    <div className="ml-2 border-l border-border pl-2">
                      {item.items.map((child) => {
                        const isChildCurrent = isItemCurrent(child)
                        return (
                          <Link
                            ref={isChildCurrent ? activeLinkRef : undefined}
                            key={child.id}
                            aria-current={
                              isChildCurrent ? 'location' : undefined
                            }
                            to={child.route}
                            onClick={onNavigate}
                            className={cn(
                              'flex min-h-11 items-center px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-8',
                              isChildCurrent && 'bg-muted/60 text-foreground'
                            )}
                          >
                            {translateDocumentationText(child.label, t)}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default DocumentationNavigation
