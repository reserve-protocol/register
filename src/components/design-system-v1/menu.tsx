import * as MenuPrimitive from '@radix-ui/react-dropdown-menu'
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react'

import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { popupItemGeometry, popupItemTypography } from './popup-item-geometry'

export const Menu = MenuPrimitive.Root

export const MenuTrigger = forwardRef<
  ElementRef<typeof MenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenuPrimitive.Trigger
    ref={ref}
    className={cn('group', className)}
    {...props}
  />
))

MenuTrigger.displayName = 'MenuTrigger'

export const MenuContent = forwardRef<
  ElementRef<typeof MenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(({ children, className, sideOffset = 8, ...props }, ref) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={8}
      className={cn(
        'z-50 min-w-44 max-w-[min(320px,var(--radix-dropdown-menu-content-available-width))] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none',
        popupItemGeometry.popupInset,
        className
      )}
      {...props}
    >
      {children}
    </MenuPrimitive.Content>
  </MenuPrimitive.Portal>
))

MenuContent.displayName = 'MenuContent'

export type MenuItemTone = 'default' | 'destructive'

export interface MenuItemProps extends ComponentPropsWithoutRef<
  typeof MenuPrimitive.Item
> {
  leadingIcon?: ReactNode
  tone?: MenuItemTone
  trailingVisual?: ReactNode
}

export const MenuItem = forwardRef<
  ElementRef<typeof MenuPrimitive.Item>,
  MenuItemProps
>(
  (
    {
      children,
      className,
      leadingIcon,
      tone = 'default',
      trailingVisual,
      ...props
    },
    ref
  ) => (
    <MenuPrimitive.Item
      ref={ref}
      data-tone={tone}
      className={cn(menuItemClassName(tone), className)}
      {...props}
    >
      <MenuItemContent
        leadingIcon={leadingIcon}
        trailingVisual={trailingVisual}
      >
        {children}
      </MenuItemContent>
    </MenuPrimitive.Item>
  )
)

MenuItem.displayName = 'MenuItem'

export const MenuItemSlot = forwardRef<
  ElementRef<typeof MenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Item>
>(({ children, ...props }, ref) => (
  <MenuPrimitive.Item ref={ref} {...props} asChild>
    {children}
  </MenuPrimitive.Item>
))

MenuItemSlot.displayName = 'MenuItemSlot'

export interface MenuLinkItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  leadingIcon?: ReactNode
  trailingVisual?: ReactNode
}

export const MenuLinkItem = forwardRef<HTMLAnchorElement, MenuLinkItemProps>(
  ({ children, className, leadingIcon, trailingVisual, ...props }, ref) => (
    <MenuPrimitive.Item asChild>
      <a
        ref={ref}
        className={cn(menuItemClassName('default'), className)}
        {...props}
      >
        <MenuItemContent
          leadingIcon={leadingIcon}
          trailingVisual={trailingVisual}
        >
          {children}
        </MenuItemContent>
      </a>
    </MenuPrimitive.Item>
  )
)

MenuLinkItem.displayName = 'MenuLinkItem'

export const MenuSeparator = forwardRef<
  ElementRef<typeof MenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-2 my-1 h-px bg-border', className)}
    {...props}
  />
))

MenuSeparator.displayName = 'MenuSeparator'

const menuItemClassName = (tone: MenuItemTone) =>
  cn(
    'relative flex w-full cursor-default select-none items-center gap-2 rounded outline-none transition-colors duration-120 data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
    popupItemGeometry.itemInset,
    popupItemTypography.singleLine,
    roles.interaction.subtleFocus,
    roles.interaction.subtleHighlight,
    tone === 'destructive' ? 'text-destructive' : 'text-foreground'
  )

const MenuItemContent = ({
  children,
  leadingIcon,
  trailingVisual,
}: {
  children: ReactNode
  leadingIcon?: ReactNode
  trailingVisual?: ReactNode
}) => (
  <>
    {leadingIcon ? (
      <span
        aria-hidden="true"
        data-slot="menu-leading-visual"
        className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-4"
      >
        {leadingIcon}
      </span>
    ) : null}
    <span className="min-w-0 flex-1 truncate">{children}</span>
    {trailingVisual ? (
      <span
        aria-hidden="true"
        data-slot="menu-trailing-visual"
        className="ml-auto flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4"
      >
        {trailingVisual}
      </span>
    ) : null}
  </>
)
