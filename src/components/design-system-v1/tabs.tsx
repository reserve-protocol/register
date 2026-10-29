import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

import { cn } from '@/lib/utils'
import { tabPresentationRecipe } from './tab-presentation'

export type TabsSize = 'compact' | 'default'
export type TabsWidth = 'intrinsic' | 'full'

interface TabsContextValue {
  size: TabsSize
  width: TabsWidth
}

const TabsContext = createContext<TabsContextValue>({
  size: 'default',
  width: 'intrinsic',
})

export const Tabs = TabsPrimitive.Root

export interface TabsListProps extends ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> {
  size?: TabsSize
  width?: TabsWidth
}

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(
  (
    { children, className, size = 'default', width = 'intrinsic', ...props },
    ref
  ) => {
    const layout =
      tabPresentationRecipe.layout[width === 'intrinsic' ? 'content' : 'full']

    return (
      <TabsContext.Provider value={{ size, width }}>
        <TabsPrimitive.List
          ref={ref}
          data-presentation="contained"
          data-size={size}
          data-width={width}
          className={cn(
            tabPresentationRecipe[size].list,
            layout.track,
            className
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </TabsContext.Provider>
    )
  }
)

TabsList.displayName = 'TabsList'

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { size, width } = useContext(TabsContext)
  const layout =
    tabPresentationRecipe.layout[width === 'intrinsic' ? 'content' : 'full']

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabPresentationRecipe[size].item,
        layout.item,
        tabPresentationRecipe.state,
        className
      )}
      {...props}
    />
  )
})

TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      className
    )}
    {...props}
  />
))

TabsContent.displayName = 'TabsContent'
