import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

const RefreshQuote = ({
  onClick,
  disabled,
  small = false,
}: {
  onClick?: () => void
  disabled?: boolean
  small?: boolean
}) => {
  return (
    <Button
      size="sm"
      className={cn(
        'gap-2 text-legend rounded-xl disabled:pointer-events-auto disabled:cursor-not-allowed',
        small ? 'h-[34px] px-2 rounded-xl' : ''
      )}
      variant="outline"
      onClick={onClick}
      disabled={disabled}
    >
      <RefreshCw size={16} />
      {!small && 'Refresh'}
    </Button>
  )
}

export default RefreshQuote
