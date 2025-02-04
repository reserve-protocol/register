import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

const RefreshQuote = ({
  onClick,
  disabled,
}: {
  onClick?: () => void
  disabled?: boolean
}) => {
  return (
    <Button
      className="gap-2 text-legend rounded-xl"
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
    >
      <RefreshCw size={16} />
      Refresh
    </Button>
  )
}

export default RefreshQuote
