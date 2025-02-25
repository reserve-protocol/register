import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader, RefreshCw } from 'lucide-react'

const RefreshQuote = ({
  onClick,
  loading,
  disabled,
  small = false,
}: {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  small?: boolean
}) => {
  if (loading) {
    return (
      <Button
        size="sm"
        className="h-[34px] px-2 rounded-xl cursor-not-allowed hover:bg-inherit"
        variant="outline"
      >
        <Loader size={16} className="animate-spin-slow" />
      </Button>
    )
  }

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
