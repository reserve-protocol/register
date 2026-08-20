import {
  v1SemanticRecipes,
  type V1SurfaceRole,
} from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import * as React from 'react'

const SEPARATOR_WIDTH = 2

interface LogoStackFramesProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  artworkSize: number
  children: React.ReactNode
  frameRadius: number | string
  overlap: number
  surface: V1SurfaceRole
}

/**
 * Shared stack geometry: artwork keeps its requested size while the
 * surface-colored separator sits outside it. The root compensates for that
 * separator so the first artwork—not its invisible border—owns the visual axis.
 */
export const LogoStackFrames = React.forwardRef<
  HTMLSpanElement,
  LogoStackFramesProps
>(
  (
    {
      artworkSize,
      children,
      className,
      frameRadius,
      overlap,
      style,
      surface,
      ...props
    },
    ref
  ) => {
    const items = React.Children.toArray(children)
    const overlapAmount = Math.round(artworkSize / 2) + overlap

    return (
      <span
        ref={ref}
        className={cn('inline-flex min-w-max items-center', className)}
        style={{ marginInlineStart: -SEPARATOR_WIDTH, ...style }}
        {...props}
      >
        {items.map((item, index) => (
          <span
            key={index}
            data-slot="logo-stack-frame"
            className={cn(
              'relative inline-flex shrink-0 border-2',
              v1SemanticRecipes.surfaceSeparation[surface]
            )}
            style={{
              borderRadius: frameRadius,
              marginInlineStart: index === 0 ? 0 : -overlapAmount,
              zIndex: items.length - index,
            }}
          >
            <span
              data-slot="logo-stack-artwork"
              className="inline-flex shrink-0 items-center justify-center"
              style={{ width: artworkSize, height: artworkSize }}
            >
              {item}
            </span>
          </span>
        ))}
      </span>
    )
  }
)

LogoStackFrames.displayName = 'LogoStackFrames'

export { SEPARATOR_WIDTH }
