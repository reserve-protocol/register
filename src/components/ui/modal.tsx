import { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './dialog'
import { cn } from '@/lib/utils'

// Legacy theme-ui spacing to Tailwind mapping
// theme-ui: [0, 4, 8, 16, 24, 32, 40, 48, 80, 256]
const spacingMap: Record<number, string> = {
  0: '0',
  1: '1', // 4px
  2: '2', // 8px
  3: '4', // 16px
  4: '6', // 24px
  5: '8', // 32px
}

export interface ModalProps {
  title?: string
  children?: ReactNode
  onClose?(): void
  width?: string | number
  closeOnClickAway?: boolean
  hideCloseButton?: boolean
  titleProps?: { className?: string; ml?: number | string }
  style?: React.CSSProperties
  sx?: Record<string, unknown> // Ignored, for compatibility
  className?: string
  // Legacy theme-ui props
  p?: number | string
  px?: number | string
  py?: number | string
}

/**
 * Modal component - wrapper around shadcn Dialog
 * Maintains backward compatibility with old Modal API
 */
const Modal = ({
  title,
  children,
  onClose,
  width = '420px',
  closeOnClickAway = false,
  hideCloseButton = false,
  titleProps,
  style,
  className,
  p,
  px,
  py,
}: ModalProps) => {
  // Convert width to maxWidth class or style
  const widthValue = typeof width === 'number' ? `${width}px` : width

  // Build padding classes from legacy props
  const paddingClasses: string[] = []
  if (p !== undefined) {
    const numP = typeof p === 'string' ? parseInt(p) : p
    const twP = spacingMap[numP] ?? numP
    paddingClasses.push(`p-${twP}`)
  } else {
    // Default padding if not specified
    paddingClasses.push('p-6')
  }
  if (px !== undefined) {
    const numPx = typeof px === 'string' ? parseInt(px) : px
    const twPx = spacingMap[numPx] ?? numPx
    paddingClasses.push(`px-${twPx}`)
  }
  if (py !== undefined) {
    const numPy = typeof py === 'string' ? parseInt(py) : py
    const twPy = spacingMap[numPy] ?? numPy
    paddingClasses.push(`py-${twPy}`)
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose()
        }
      }}
    >
      <DialogContent
        className={cn(paddingClasses.join(' '), className)}
        style={{ maxWidth: widthValue, ...style }}
        showClose={!hideCloseButton && !!onClose}
        onInteractOutside={(e) => {
          if (!closeOnClickAway) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!onClose) {
            e.preventDefault()
          }
        }}
      >
        {title && (
          <DialogTitle
            className={cn(
              'text-xl font-bold',
              titleProps?.ml && `ml-${titleProps.ml}`,
              titleProps?.className
            )}
          >
            {title}
          </DialogTitle>
        )}
        {/* Hidden description for accessibility */}
        <DialogDescription className="sr-only">
          {title || 'Modal dialog'}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
