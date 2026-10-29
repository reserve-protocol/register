import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type ActionGroupDirection = 'horizontal' | 'vertical'

export const actionGroupRecipe: Record<ActionGroupDirection, string> = {
  horizontal: 'flex items-center gap-2',
  vertical: 'flex w-full flex-col gap-2 [&>*]:w-full',
}

export interface ActionGroupProps extends HTMLAttributes<HTMLDivElement> {
  direction?: ActionGroupDirection
}

export const ActionGroup = ({
  className,
  direction = 'horizontal',
  ...props
}: ActionGroupProps) => (
  <div
    data-testid="canonical-action-group"
    data-direction={direction}
    className={cn(actionGroupRecipe[direction], className)}
    {...props}
  />
)
