import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface Props {
  onClose(): void
  width?: string
  children?: React.ReactNode
  className?: string
}

const Sidebar = ({ onClose, width = '600px', children, className }: Props) =>
  createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed left-0 top-0 z-[100000] opacity-50 w-screen h-full bg-black/50"
      />
      {/* Sidebar panel */}
      <div
        className={cn(
          'flex flex-col z-[100001] absolute right-0 top-0 h-full overflow-hidden',
          'max-w-[100vw] md:max-w-[840px]',
          'w-full md:w-[var(--sidebar-width)]',
          'bg-background border-l border-border shadow-[-32px_0px_64px_rgba(0,0,0,0.15)]',
          className
        )}
        style={{ '--sidebar-width': width } as React.CSSProperties}
      >
        {children}
      </div>
    </>,
    document.body
  )

export default Sidebar
