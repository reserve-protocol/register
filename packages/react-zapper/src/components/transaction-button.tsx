import React from 'react'
import { Button } from './ui/button'
import { cn } from '../utils/cn'
import { Loader } from 'lucide-react'

interface TransactionButtonProps {
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
}

/**
 * Simple transaction button component
 */
export function TransactionButton({
  children,
  disabled = false,
  loading = false,
  onClick,
  className,
  variant = 'default',
  size = 'lg',
}: TransactionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(
        'w-full',
        loading && 'cursor-not-allowed opacity-75',
        className
      )}
    >
      {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}

export function TransactionButtonContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="space-y-2">{children}</div>
}

export default TransactionButton
