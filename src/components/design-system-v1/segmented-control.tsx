import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

import { cn } from '@/lib/utils'
import { segmentedControlPresentationRecipe } from './segmented-control-presentation'

export type SegmentedControlPresentation = 'text-only' | 'contained'
export type SegmentedControlSize = 'compact' | 'default'
export type SegmentedControlWidth = 'intrinsic' | 'full'

interface SegmentedControlContextValue {
  presentation: SegmentedControlPresentation
  size: SegmentedControlSize
  width: SegmentedControlWidth
}

const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  presentation: 'contained',
  size: 'default',
  width: 'intrinsic',
})

export interface SegmentedControlProps extends Omit<
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
> {
  presentation: SegmentedControlPresentation
  value: string
  onValueChange: (value: string) => void
  size?: SegmentedControlSize
  width?: SegmentedControlWidth
}

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
      value,
      width = 'intrinsic',
      ...props
    },
    ref
  ) => {
    const recipe = segmentedControlPresentationRecipe[presentation]
    const layout = recipe.layout[width === 'intrinsic' ? 'content' : 'full']

    return (
      <SegmentedControlContext.Provider value={{ presentation, size, width }}>
        <ToggleGroupPrimitive.Root
          ref={ref}
          type="single"
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue) onValueChange(nextValue)
          }}
          data-presentation={presentation}
          data-size={size}
          data-width={width}
          className={cn(recipe[size].track, layout.track, className)}
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
  const { presentation, size, width } = useContext(SegmentedControlContext)
  const recipe = segmentedControlPresentationRecipe[presentation]
  const layout = recipe.layout[width === 'intrinsic' ? 'content' : 'full']

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(recipe[size].item, layout.item, recipe.state, className)}
      {...props}
    />
  )
})

SegmentedControlItem.displayName = 'SegmentedControlItem'
