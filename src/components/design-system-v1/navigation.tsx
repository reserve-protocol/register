import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useId,
} from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import {
  NavigationIndicator,
  type NavigationIndicatorDescriptor,
} from './navigation-indicator'
import { v1Typography } from './typography'
import { EntityIdentity } from '@/components/entity-identity/entity-identity'
import { Link } from './link'
import { Menu, MenuContent, MenuItemSlot, MenuTrigger } from './menu'
import { cn } from '@/lib/utils'

type NavigationDestinationBase = {
  id: string
  label: string
  href: string
  icon?: ReactNode
  indicator?: NavigationIndicatorDescriptor
  meta?: ReactNode
  unavailable?: boolean
}

export type NavigationDestination = NavigationDestinationBase &
  (
    | { external?: false; externalAnnouncement?: never }
    | { external: true; externalAnnouncement: ReactNode }
  )

export interface NavigationGroup {
  id: string
  label: string
  destinations: NavigationDestination[]
}

export const navigationDestinationDrawerRowRecipe = `min-h-12 gap-3 rounded-full px-4 py-3 ${v1Typography.label} ring-1 ring-inset`

export const productNavigationDrawerRowRecipe =
  navigationDestinationDrawerRowRecipe

export const navigationDestinationPopupRowRecipe =
  'gap-3 rounded-full p-3 text-sm font-medium leading-4 ring-1 ring-inset'

interface NavigationLinkProps extends Omit<
  ComponentPropsWithoutRef<'a'>,
  'children' | 'href'
> {
  currentId?: string
  destination: NavigationDestination
  presentation:
    | 'global'
    | 'global-menu'
    | 'global-drawer'
    | 'product-rail'
    | 'product-menu'
    | 'product-drawer'
  showProductChevron?: boolean
  showProductLabel?: boolean
}

const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  (
    {
      currentId,
      destination,
      presentation,
      showProductChevron = true,
      showProductLabel = true,
      className: rootClassName,
      ...rootProps
    },
    ref
  ) => {
    const isCurrent = destination.id === currentId
    const isGlobalDrawer = presentation === 'global-drawer'
    const isGlobalMenu = presentation === 'global-menu' || isGlobalDrawer
    const isProductRail = presentation === 'product-rail'
    const isProductMenu =
      presentation === 'product-menu' || presentation === 'product-drawer'
    const isProductDrawer = presentation === 'product-drawer'
    const isDrawer = isGlobalDrawer || isProductDrawer
    const isOutlinedDestinationRow = isDrawer || presentation === 'global-menu'
    const isMenu = isGlobalMenu || isProductMenu
    const hasProductMeta = Boolean(destination.indicator || destination.meta)
    const className = cn(
      'group relative flex min-w-0 items-center text-foreground transition-colors duration-120 focus-visible:outline-none',
      roles.focus.visibleInset,
      presentation === 'global' &&
        'h-10 shrink-0 gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium',
      presentation === 'global' &&
        !destination.unavailable &&
        roles.interaction.subtleHover,
      presentation === 'global-menu' && navigationDestinationPopupRowRecipe,
      isGlobalDrawer && navigationDestinationDrawerRowRecipe,
      isOutlinedDestinationRow &&
        (isCurrent ? 'ring-primary/30' : 'ring-border'),
      isGlobalMenu && !destination.unavailable && roles.interaction.subtleHover,
      isProductMenu &&
        !isProductDrawer &&
        `min-h-11 gap-2 rounded-full p-3 ${v1Typography.label}`,
      isProductDrawer && productNavigationDrawerRowRecipe,
      isProductMenu &&
        !destination.unavailable &&
        `${roles.interaction.subtleHover} ${roles.interaction.subtleFocus}`,
      isProductRail && 'h-10 gap-1.5 rounded-full px-0',
      isCurrent &&
        presentation === 'global' &&
        `${roles.surface.selected} text-primary`,
      isCurrent && isMenu && `${roles.surface.selected} text-primary`,
      isCurrent && isProductRail && 'text-primary',
      destination.unavailable && 'text-muted-foreground',
      rootClassName
    )

    const content = (
      <>
        {isProductRail && (
          <span
            aria-hidden="true"
            data-slot="product-navigation-row-surface"
            className={cn(
              'pointer-events-none absolute inset-0 rounded-full transition-colors duration-120',
              showProductLabel &&
                !isCurrent &&
                !destination.unavailable &&
                'group-hover:bg-foreground/5 group-focus-visible:bg-foreground/5',
              showProductLabel && isCurrent && 'bg-accent/40'
            )}
          />
        )}
        {destination.icon && (
          <span
            aria-hidden="true"
            data-slot={
              isProductRail ? 'product-navigation-icon-slot' : undefined
            }
            className={cn(
              'relative flex shrink-0 items-center justify-center [&>svg]:relative [&>svg]:z-10 [&>svg]:size-4',
              presentation === 'global' && 'size-4',
              isProductMenu && 'size-6',
              presentation === 'global-menu' && 'size-5',
              isGlobalDrawer && 'size-6',
              isProductRail && 'size-10'
            )}
          >
            {isProductRail && (
              <span
                data-slot="product-navigation-icon-surface"
                className={cn(
                  'pointer-events-none absolute rounded-full transition-[inset] duration-180 motion-reduce:transition-none',
                  showProductLabel ? 'inset-0.5' : 'inset-0'
                )}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-full transition-colors duration-120',
                    !isCurrent &&
                      !destination.unavailable &&
                      'group-hover:bg-foreground/5 group-focus-visible:bg-foreground/5',
                    isCurrent && roles.surface.selected
                  )}
                />
              </span>
            )}
            {destination.icon}
          </span>
        )}
        {isProductRail && !showProductLabel && destination.indicator && (
          <NavigationIndicator
            {...destination.indicator}
            announce={false}
            aria-hidden="true"
            className="absolute top-1/2 left-8 z-20 -translate-y-1/2"
            size="compact"
          />
        )}
        <span
          className={cn(
            'relative z-10 min-w-0',
            isProductRail && !showProductLabel && 'sr-only',
            presentation === 'product-rail' && v1Typography.label
          )}
        >
          <span className={cn('block', isProductRail && 'truncate')}>
            {destination.label}
          </span>
        </span>
        {isProductRail && !showProductLabel && destination.indicator && (
          <span className="sr-only">, {destination.indicator.label}</span>
        )}
        {(isProductMenu || (isProductRail && showProductLabel)) &&
          hasProductMeta && (
            <span
              className={cn(
                'relative z-10 ml-auto flex shrink-0 items-center gap-1',
                isProductRail && 'mr-3'
              )}
              data-slot="product-navigation-meta"
            >
              <span className="sr-only">, </span>
              {destination.indicator && (
                <NavigationIndicator {...destination.indicator} />
              )}
              {destination.meta}
            </span>
          )}
        {isMenu &&
          (!isProductMenu || showProductChevron) &&
          !destination.external &&
          !destination.unavailable && (
            <span
              aria-hidden="true"
              className={cn(
                'flex shrink-0 items-center justify-center text-muted-foreground',
                !hasProductMeta && 'ml-auto',
                isDrawer ? 'size-6' : 'size-4'
              )}
              data-slot="product-navigation-trailing-slot"
            >
              <ChevronRight className="size-4" strokeWidth={1.5} />
            </span>
          )}
      </>
    )

    if (destination.unavailable) {
      return (
        <span
          {...rootProps}
          aria-disabled="true"
          className={className}
          data-navigation-id={destination.id}
        >
          {content}
        </span>
      )
    }

    const linkProps = {
      href: destination.href,
      'aria-current': isCurrent ? ('page' as const) : undefined,
      className,
      'data-navigation-id': destination.id,
      treatment: 'standalone' as const,
      ...rootProps,
    }

    if (destination.external) {
      return (
        <Link
          ref={ref}
          {...linkProps}
          external
          externalAnnouncement={destination.externalAnnouncement}
          externalIcon={
            <span
              aria-hidden="true"
              className={cn(
                'ml-auto flex shrink-0 items-center justify-center text-muted-foreground',
                isDrawer ? 'size-6' : 'size-4'
              )}
            >
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </span>
          }
        >
          {content}
        </Link>
      )
    }

    return (
      <Link ref={ref} {...linkProps}>
        {content}
      </Link>
    )
  }
)

NavigationLink.displayName = 'NavigationLink'

export interface GlobalNavigationItemProps extends Omit<
  ComponentPropsWithoutRef<'a'>,
  'children' | 'href'
> {
  currentId?: string
  destination: NavigationDestination
  presentation?: 'bar' | 'menu' | 'drawer'
}

export const GlobalNavigationItem = forwardRef<
  HTMLAnchorElement,
  GlobalNavigationItemProps
>(({ currentId, destination, presentation = 'bar', ...rootProps }, ref) => (
  <NavigationLink
    ref={ref}
    currentId={currentId}
    destination={destination}
    presentation={
      presentation === 'bar'
        ? 'global'
        : presentation === 'drawer'
          ? 'global-drawer'
          : 'global-menu'
    }
    {...rootProps}
  />
))

GlobalNavigationItem.displayName = 'GlobalNavigationItem'

export interface ProductNavigationItemProps extends Omit<
  ComponentPropsWithoutRef<'a'>,
  'children' | 'href'
> {
  currentId?: string
  destination: NavigationDestination
  expanded?: boolean
  presentation?: 'rail' | 'menu' | 'drawer'
  showDestinationChevron?: boolean
}

export const ProductNavigationItem = forwardRef<
  HTMLAnchorElement,
  ProductNavigationItemProps
>(
  (
    {
      currentId,
      destination,
      expanded = false,
      presentation = 'rail',
      showDestinationChevron = true,
      ...rootProps
    },
    ref
  ) => (
    <NavigationLink
      ref={ref}
      currentId={currentId}
      destination={destination}
      presentation={
        presentation === 'rail'
          ? 'product-rail'
          : presentation === 'drawer'
            ? 'product-drawer'
            : 'product-menu'
      }
      showProductChevron={showDestinationChevron}
      showProductLabel={presentation !== 'rail' || expanded}
      {...rootProps}
    />
  )
)

ProductNavigationItem.displayName = 'ProductNavigationItem'

export interface GlobalNavigationProps {
  actions?: ReactNode
  brand: ReactNode
  currentId?: string
  destinations: NavigationDestination[]
  label: string
  onOverflowOpenChange?: (open: boolean) => void
  overflowAriaLabel: string
  overflowDestinations?: NavigationDestination[]
  overflowLabel: string
  overflowOpen?: boolean
}

export const GlobalNavigation = ({
  actions,
  brand,
  currentId,
  destinations,
  label,
  onOverflowOpenChange,
  overflowAriaLabel,
  overflowDestinations = [],
  overflowLabel,
  overflowOpen = false,
}: GlobalNavigationProps) => {
  return (
    <header
      className="relative border-b border-border bg-card"
      data-testid="global-navigation"
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-4">
        <div className="flex shrink-0 items-center">{brand}</div>
        <nav aria-label={label} className="flex min-w-0 items-center gap-0.5">
          {destinations.map((destination) => (
            <GlobalNavigationItem
              key={destination.id}
              currentId={currentId}
              destination={destination}
            />
          ))}
          {overflowDestinations.length > 0 && (
            <Menu open={overflowOpen} onOpenChange={onOverflowOpenChange}>
              <MenuTrigger asChild>
                <button
                  type="button"
                  data-testid="global-navigation-overflow-trigger"
                  className={cn(
                    `flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-120 focus-visible:outline-none ${roles.interaction.subtleHover}`,
                    roles.focus.visibleInset,
                    overflowOpen && `${roles.surface.selected} text-primary`
                  )}
                >
                  {overflowLabel}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'size-4 transition-transform duration-180 motion-reduce:transition-none',
                      overflowOpen && 'rotate-180'
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              </MenuTrigger>
              <MenuContent
                align="start"
                aria-label={overflowAriaLabel}
                data-testid="global-navigation-overflow"
                className="max-h-[var(--radix-dropdown-menu-content-available-height)] w-64 space-y-1 overflow-y-auto overscroll-contain"
              >
                {overflowDestinations.map((destination) => (
                  <MenuItemSlot key={destination.id}>
                    <GlobalNavigationItem
                      currentId={currentId}
                      destination={destination}
                      presentation="menu"
                    />
                  </MenuItemSlot>
                ))}
              </MenuContent>
            </Menu>
          )}
        </nav>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export interface GlobalNavigationMenuProps {
  brand: ReactNode
  currentId?: string
  groups: NavigationGroup[]
  label: string
  trailing?: ReactNode
}

export const GlobalNavigationMenu = ({
  brand,
  currentId,
  groups,
  label,
  trailing,
}: GlobalNavigationMenuProps) => {
  const idPrefix = useId()

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-card"
      data-testid="global-navigation-menu"
    >
      <header className="relative flex h-14 shrink-0 items-center gap-4 bg-card px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
        <div className="flex min-h-10 items-center">{brand}</div>
        {trailing && (
          <div className="ml-auto flex items-center gap-2">{trailing}</div>
        )}
      </header>
      <nav
        aria-label={label}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2"
      >
        {groups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`${idPrefix}-${group.id}-navigation-group`}
          >
            <h3
              id={`${idPrefix}-${group.id}-navigation-group`}
              className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.destinations.map((destination) => (
                <GlobalNavigationItem
                  key={destination.id}
                  currentId={currentId}
                  destination={destination}
                  presentation="drawer"
                />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </div>
  )
}

export interface ProductNavigationProps {
  currentId?: string
  destinations: NavigationDestination[]
  expanded?: boolean
  identity: ReactNode
  label: string
  onDestinationSelect?: (destination: NavigationDestination) => void
  overflowFade?: boolean
  presentation?: 'rail' | 'menu' | 'drawer'
  showDestinationChevron?: boolean
  supplementary?: ReactNode
}

export interface ProductNavigationIdentityProps {
  expanded?: boolean
  mark: ReactNode
  name: ReactNode
  presentation?: 'rail' | 'menu'
  supporting?: ReactNode
}

export interface ProductNavigationIdentityTriggerProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'name'
> {
  expanded?: boolean
  label: string
  mark: ReactNode
  name: ReactNode
  open?: boolean
  presentation?: 'rail' | 'menu'
}

export interface ProductNavigationMobileIdentityTriggerProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'children'
> {
  label: string
  mark: ReactNode
  open?: boolean
}

export const ProductNavigationMobileIdentityTrigger = forwardRef<
  HTMLButtonElement,
  ProductNavigationMobileIdentityTriggerProps
>(
  (
    { label, mark, open = false, className, type = 'button', ...buttonProps },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      aria-expanded={open}
      aria-label={label}
      className={cn(
        'group relative flex h-12 w-auto shrink-0 items-center gap-0.5 rounded-full bg-card/90 p-2 text-foreground shadow-lg backdrop-blur-sm transition-transform duration-120 motion-safe:active:scale-[0.98] focus-visible:outline-none',
        roles.focus.visibleInset,
        className
      )}
      {...buttonProps}
    >
      <span className="flex size-8 items-center justify-center">{mark}</span>
      <span
        aria-hidden="true"
        data-slot="product-switcher-cue"
        className={cn(
          'flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-120 group-hover:bg-foreground/5 group-hover:text-foreground group-focus-visible:bg-foreground/5 group-focus-visible:text-foreground',
          open && 'bg-foreground/5 text-foreground'
        )}
      >
        <ChevronsUpDown className="size-4" strokeWidth={1.5} />
      </span>
    </button>
  )
)

ProductNavigationMobileIdentityTrigger.displayName =
  'ProductNavigationMobileIdentityTrigger'

export const ProductNavigationIdentityTrigger = forwardRef<
  HTMLButtonElement,
  ProductNavigationIdentityTriggerProps
>(
  (
    {
      expanded = false,
      label,
      mark,
      name,
      open = false,
      presentation = 'rail',
      className,
      type = 'button',
      ...buttonProps
    },
    ref
  ) => {
    const showsLabel = presentation === 'menu' || expanded

    return (
      <button
        ref={ref}
        type={type}
        aria-expanded={open}
        aria-label={label}
        className={cn(
          'group relative flex min-w-0 items-center text-left text-foreground transition-colors duration-120 focus-visible:outline-none',
          roles.focus.visibleInset,
          roles.interaction.subtleHover,
          roles.interaction.subtleFocus,
          presentation === 'rail' &&
            'h-10 w-full gap-1.5 overflow-hidden rounded-full ring-1 ring-inset ring-border',
          presentation === 'menu' &&
            `min-h-11 w-full gap-2 rounded-full p-3 ${v1Typography.label}`,
          open && 'bg-foreground/5',
          className
        )}
        {...buttonProps}
      >
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center',
            presentation === 'rail' ? 'size-10' : 'size-6'
          )}
          data-testid="product-navigation-identity-mark"
        >
          {mark}
        </span>
        {showsLabel ? (
          <>
            <span className={cn('min-w-0 truncate', v1Typography.label)}>
              {name}
            </span>
            <span
              aria-hidden="true"
              data-slot="product-switcher-chevron-slot"
              className={cn(
                'ml-auto flex size-6 shrink-0 items-center justify-center text-muted-foreground',
                presentation === 'rail' && 'mr-3'
              )}
            >
              <ChevronDown
                data-slot="product-switcher-chevron"
                className={cn(
                  'size-4 transition-transform duration-180 motion-reduce:transition-none',
                  open && 'rotate-180'
                )}
                strokeWidth={1.5}
              />
            </span>
          </>
        ) : (
          <span className="sr-only">{name}</span>
        )}
      </button>
    )
  }
)

ProductNavigationIdentityTrigger.displayName =
  'ProductNavigationIdentityTrigger'

export const ProductNavigationIdentity = ({
  expanded = false,
  mark,
  name,
  presentation = 'rail',
  supporting,
}: ProductNavigationIdentityProps) => {
  const identityMark = (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        presentation === 'rail' ? 'size-10' : 'size-6'
      )}
      data-testid="product-navigation-identity-mark"
    >
      {mark}
    </span>
  )

  if (presentation === 'menu') {
    return (
      <EntityIdentity
        density="compact"
        mark={identityMark}
        name={name}
        supporting={supporting}
      />
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {identityMark}
      {expanded ? (
        <span className="min-w-0">
          <span className={`block truncate ${v1Typography.label}`}>{name}</span>
          {supporting && (
            <span className="block truncate text-xs font-light leading-5 text-muted-foreground">
              {supporting}
            </span>
          )}
        </span>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </div>
  )
}

export const ProductNavigation = ({
  currentId,
  destinations,
  expanded = false,
  identity,
  label,
  onDestinationSelect,
  overflowFade = false,
  presentation = 'rail',
  showDestinationChevron = true,
  supplementary,
}: ProductNavigationProps) => {
  if (presentation === 'menu' || presentation === 'drawer') {
    const isDrawer = presentation === 'drawer'

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          isDrawer
            ? 'flex min-h-0 flex-1 flex-col bg-card'
            : 'rounded-lg border border-border bg-popover shadow-lg',
          !isDrawer && (overflowFade ? 'px-2 pt-2 pb-0' : 'p-2')
        )}
        data-presentation={presentation}
        data-testid="product-navigation-shell"
      >
        <div
          className={cn(!isDrawer && 'border-b border-border')}
          data-slot="product-navigation-identity"
        >
          {identity}
        </div>
        <nav
          aria-label={label}
          className={cn(isDrawer && 'min-h-0 flex-1')}
          data-presentation={presentation}
          data-testid="product-navigation"
        >
          <div
            className={cn(
              'overflow-y-auto overscroll-contain',
              isDrawer ? 'pt-4' : 'pt-2',
              isDrawer ? 'space-y-1' : 'space-y-0.5',
              isDrawer ? 'h-full min-h-0' : 'max-h-72',
              overflowFade && 'pb-8'
            )}
            data-slot="product-navigation-menu-items"
          >
            {destinations.map((destination) => (
              <ProductNavigationItem
                key={destination.id}
                currentId={currentId}
                destination={destination}
                onClick={
                  destination.unavailable
                    ? undefined
                    : () => onDestinationSelect?.(destination)
                }
                presentation={isDrawer ? 'drawer' : 'menu'}
                showDestinationChevron={showDestinationChevron}
              />
            ))}
          </div>
        </nav>
        {overflowFade && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-popover"
            data-slot="product-navigation-overflow-fade"
          />
        )}
        {supplementary && (
          <div
            className={cn(
              isDrawer ? 'mt-4' : 'mt-2 border-t border-border px-4 py-3'
            )}
            data-slot="product-navigation-supplementary"
          >
            {supplementary}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav
      aria-label={label}
      data-presentation="rail"
      data-testid="product-navigation"
      data-expanded={expanded || undefined}
      className={cn(
        'relative flex h-full shrink-0 flex-col overflow-hidden bg-card transition-[width] duration-180 motion-reduce:transition-none',
        overflowFade ? 'px-4 pt-4 pb-0' : 'p-4',
        expanded ? 'w-64' : 'w-[72px]'
      )}
    >
      <div className="flex h-10 min-w-10 shrink-0 items-center overflow-hidden">
        {identity}
      </div>
      <div
        className="mt-4 h-px shrink-0 bg-border"
        data-slot="product-navigation-divider"
      />
      <div
        className={cn(
          'min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pt-4',
          overflowFade && 'pb-8'
        )}
        data-slot="product-navigation-rail-items"
      >
        {destinations.map((destination) => (
          <ProductNavigationItem
            key={destination.id}
            currentId={currentId}
            destination={destination}
            expanded={expanded}
            showDestinationChevron={showDestinationChevron}
            onClick={
              destination.unavailable
                ? undefined
                : () => onDestinationSelect?.(destination)
            }
          />
        ))}
      </div>
      {overflowFade && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card"
          data-slot="product-navigation-overflow-fade"
        />
      )}
    </nav>
  )
}
