import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface WizardShellProps {
  children: ReactNode
  onBack?: () => void
  badge?: ReactNode
}

const WizardShell = ({ children, onBack, badge }: WizardShellProps) => {
  return (
    <div className="bg-secondary rounded-3xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
          </Button>
        ) : (
          <div />
        )}
        {badge && <div>{badge}</div>}
      </div>
      {children}
    </div>
  )
}

export default WizardShell
