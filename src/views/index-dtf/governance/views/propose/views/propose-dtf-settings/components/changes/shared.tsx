import { Button } from '@/components/ui/button'
import { Undo } from 'lucide-react'

export const ChangeSection = ({ 
  title, 
  icon, 
  children 
}: { 
  title: string
  icon: React.ReactNode
  children: React.ReactNode 
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-sm font-medium">
      {icon}
      {title}
    </div>
    {children}
  </div>
)

export const RevertButton = ({ 
  onClick, 
  size = 'sm',
  label = 'Revert'
}: { 
  onClick: () => void
  size?: 'sm' | 'icon-rounded'
  label?: string
}) => (
  <Button
    variant="outline"
    size={size}
    onClick={onClick}
  >
    <Undo size={size === 'icon-rounded' ? 14 : 14} className={size === 'sm' ? 'mr-1' : ''} />
    {size === 'sm' && label}
  </Button>
)