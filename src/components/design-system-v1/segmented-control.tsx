import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

import { cn } from '@/lib/utils'
import {
  compactTextOnlySegmentedControlRecipe,
  segmentedControlPresentationRecipe,
} from './segmented-control-presentation'

export type SegmentedControlPresentation = 'text-only' | 'contained'
export type SegmentedControlSize = 'compact' | 'default'
export type SegmentedControlWidth = 'intrinsic' | 'full'
export type SegmentedControlTextOnlyDensity = 'compact'

interface SegmentedControlContextValue {
  presentation: SegmentedControlPresentation
  size: SegmentedControlSize
  textOnlyDensity?: SegmentedControlTextOnlyDensity
  width: SegmentedControlWidth
}

const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  presentation: 'contained',
  size: 'default',
  textOnlyDensity: undefined,
  width: 'intrinsic',
})

type SegmentedControlBaseProps = Omit<
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
> & {
  value: string
  onValueChange: (value: string) => void
  size?: SegmentedControlSize
  width?: SegmentedControlWidth
}

export type SegmentedControlProps = SegmentedControlBaseProps &
  (
    | {
        presentation: 'text-only'
        textOnlyDensity?: SegmentedControlTextOnlyDensity
      }
    | { presentation: 'contained'; textOnlyDensity?: never }
  )

export const SegmentedControl = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Root>,
  SegmentedControlProps
>(
  (
    {
      children,
      className,
      onValueChange,
      presentation,
      size = 'default',
      textOnlyDensity,
      value,
      width = 'intrinsic',
      ...props
    },
    ref
  ) => {
    const recipe = segmentedControlPresentationRecipe[presentation]
    const layout = recipe.layout[width === 'intrinsic' ? 'content' : 'full']
    const resolvedTextOnlyDensity =
      presentation === 'text-only' ? textOnlyDensity : undefined
    const densityRecipe = resolvedTextOnlyDensity
      ? compactTextOnlySegmentedControlRecipe[size]
      : undefined

    return (
      <SegmentedControlContext.Provider
        value={{
          presentation,
          size,
          textOnlyDensity: resolvedTextOnlyDensity,
          width,
        }}
      >
        <ToggleGroupPrimitive.Root
          ref={ref}
          type="single"
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue) onValueChange(nextValue)
          }}
          data-presentation={presentation}
          data-size={size}
          data-text-only-density={resolvedTextOnlyDensity}
          data-width={width}
          className={cn(
            recipe[size].track,
            densityRecipe?.track,
            layout.track,
            className
          )}
          {...props}
        >
          {children}
        </ToggleGroupPrimitive.Root>
      </SegmentedControlContext.Provider>
    )
  }
)

SegmentedControl.displayName = 'SegmentedControl'

export const SegmentedControlItem = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { presentation, size, textOnlyDensity, width } = useContext(
    SegmentedControlContext
  )
  const recipe = segmentedControlPresentationRecipe[presentation]
  const layout = recipe.layout[width === 'intrinsic' ? 'content' : 'full']
  const densityRecipe = textOnlyDensity
    ? compactTextOnlySegmentedControlRecipe[size]
    : undefined

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        recipe[size].item,
        densityRecipe?.item,
        layout.item,
        recipe.state,
        className
      )}
      {...props}
    />
  )
})

SegmentedControlItem.displayName = 'SegmentedControlItem'
