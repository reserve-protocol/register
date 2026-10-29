import { v1Typography } from '@/components/design-system-v1/typography'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

interface DrawerOverlayProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
> {
  placement?: 'viewport' | 'contained-bottom'
}

export const DrawerOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, placement = 'viewport', ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-testid="canonical-drawer-overlay"
    className={cn(
      'inset-0 z-50 bg-black/50 ease-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-240 data-[state=open]:duration-240 motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none',
      placement === 'viewport' ? 'fixed' : 'absolute',
      className
    )}
    {...props}
  />
))

DrawerOverlay.displayName = 'DrawerOverlay'

export interface DrawerContentProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  dismissible?: boolean
  overlayClassName?: string
  placement?: 'viewport' | 'contained-bottom'
  portalContainer?: HTMLElement | null
}

export const DrawerContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(
  (
    {
      children,
      className,
      dismissible = true,
      overlayClassName,
      placement = 'viewport',
      onEscapeKeyDown,
      onInteractOutside,
      onPointerDownOutside,
      portalContainer,
      ...props
    },
    ref
  ) => (
    <DialogPrimitive.Portal container={portalContainer}>
      <DrawerOverlay className={overlayClassName} placement={placement} />
      <DialogPrimitive.Content
        ref={ref}
        data-testid="canonical-drawer-content"
        className={cn(
          'z-50 flex w-full flex-col overflow-hidden bg-card p-2 shadow-lg outline-none ease-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:ease-in data-[state=closed]:duration-240 data-[state=open]:duration-240 motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none',
          'inset-x-0 bottom-0 data-[state=closed]:slide-out-to-bottom-[100%] data-[state=open]:slide-in-from-bottom-[100%]',
          placement === 'viewport'
            ? 'fixed max-h-[calc(100dvh-0.5rem)] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[min(640px,calc(100vh-2rem))] sm:w-[calc(100%-2rem)] sm:max-w-[432px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:pb-2 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95'
            : 'absolute max-h-[calc(100%-0.5rem)] pb-2',
          className
        )}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event)
          if (!dismissible) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event)
          if (!dismissible) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event)
          if (!dismissible) event.preventDefault()
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
)

DrawerContent.displayName = 'DrawerContent'

export interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
}

export const DrawerHeader = ({
  action,
  children,
  className,
  ...props
}: DrawerHeaderProps) => (
  <div
    className={cn('flex shrink-0 items-start gap-4 px-4 pb-2 pt-4', className)}
    {...props}
  >
    <div className="min-w-0 flex-1">{children}</div>
    {action}
  </div>
)

export const DrawerBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto', className)} {...props} />
)

export const DrawerFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('shrink-0 px-4 pb-4 pt-3', className)} {...props} />
)

export const DrawerTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-2xl font-light leading-8', className)}
    {...props}
  />
))

DrawerTitle.displayName = 'DrawerTitle'

export const DrawerDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(`mt-1 ${v1Typography.body} text-muted-foreground`, className)}
    {...props}
  />
))

DrawerDescription.displayName = 'DrawerDescription'
