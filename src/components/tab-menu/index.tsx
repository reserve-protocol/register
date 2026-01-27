import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Item {
  key: string | number
  label: string
  icon?: JSX.Element
}

interface Props {
  items: Item[]
  onMenuChange(key: string): void
  active: string | number
  small?: boolean
  collapse?: boolean
  className?: string
  ml?: string
  mt?: number | number[]
  background?: string
}

const MenuItem = ({
  item,
  onClick,
  isActive,
  collapse,
  small,
}: {
  item: Item
  onClick(key: string | number): void
  isActive: boolean
  collapse: boolean
  small: boolean
}) => {
  return (
    <div
      role="button"
      className={cn(
        'flex items-center justify-center cursor-pointer select-none rounded-md ml-0.5 first:ml-0',
        small ? 'p-1.5 text-xs font-medium' : 'px-2 py-1.5 text-sm',
        collapse && 'w-10 md:w-auto',
        'hover:bg-muted',
        isActive && 'bg-card text-primary font-medium'
      )}
      onClick={() => onClick(item.key)}
    >
      {item.icon}
      <span
        className={cn(
          item.icon && 'ml-1.5',
          collapse && 'hidden md:block'
        )}
      >
        {item.label}
      </span>
    </div>
  )
}

const TabMenu = ({
  items,
  onMenuChange,
  small = false,
  collapse = false,
  active,
  className,
  ml,
  mt,
  background,
}: Props) => {
  const handleSelect = useCallback(
    (key: string) => {
      onMenuChange(key)
    },
    [onMenuChange]
  )

  return (
    <div
      className={cn(
        'flex items-center w-fit p-0.5 rounded-lg bg-muted text-legend',
        small ? 'text-xs font-medium' : 'text-sm',
        className
      )}
    >
      {items.map((item) => (
        <MenuItem
          item={item}
          onClick={handleSelect}
          isActive={item.key === active}
          key={item.key}
          collapse={collapse}
          small={small}
        />
      ))}
    </div>
  )
}

export default React.memo(TabMenu)
