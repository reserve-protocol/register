import { Button } from '@/components/ui/button'
import { Trans } from '@lingui/react/macro'
import { Undo } from 'lucide-react'
import { ReactNode } from 'react'

export const ChangeSection = ({
  title,
  icon,
  children,
}: {
  title: ReactNode
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-sm font-medium ml-4">
      {icon}
      {title}
    </div>
    {children}
  </div>
)

export const RevertButton = ({
  onClick,
  size = 'sm',
  label = <Trans>Revert</Trans>,
}: {
  onClick: () => void
  size?: 'sm' | 'icon-rounded'
  label?: ReactNode
}) => (
  <Button variant="outline" className="text-xs" size={size} onClick={onClick}>
    <Undo size={14} className={size === 'sm' ? 'mr-1' : ''} />
    {size === 'sm' && label}
  </Button>
)