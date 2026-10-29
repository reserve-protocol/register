import type { ReactNode } from 'react'
import type { Decorator } from '@storybook/react-vite'

import { cn } from '@/lib/utils'

export const StorySurface = ({
  children,
  className,
  fullHeight = true,
  desktopMinWidth = false,
}: {
  children: ReactNode
  className?: string
  fullHeight?: boolean
  desktopMinWidth?: boolean
}) => (
  <div
    className={cn(
      'w-full bg-muted/40 p-0 dark:bg-muted/20 sm:p-6',
      fullHeight && 'min-h-screen',
      desktopMinWidth && 'overflow-x-auto'
    )}
    data-story-surface="neutral"
  >
    <div
      className={cn(
        'mx-auto w-full max-w-[1400px]',
        desktopMinWidth && 'min-w-[72rem]',
        className
      )}
      data-story-content
    >
      {children}
    </div>
  </div>
)

export const CenteredStorySurface = ({
  children,
  fullHeight = true,
}: {
  children: ReactNode
  fullHeight?: boolean
}) => (
  <div
    data-story-surface="centered"
    className={cn(
      'w-full bg-muted/40 p-4 dark:bg-muted/20 sm:p-6',
      fullHeight && 'flex min-h-screen items-center justify-center'
    )}
  >
    <div className="w-full">{children}</div>
  </div>
)

export const centeredStoryDecorator: Decorator = (Story, context) => (
  <CenteredStorySurface fullHeight={context.viewMode !== 'docs'}>
    <Story />
  </CenteredStorySurface>
)
