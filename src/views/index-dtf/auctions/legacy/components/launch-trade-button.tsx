import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import { AssetTrade } from '../atoms'

const LaunchTradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button className={cn('sm:py-6 gap-1', className)} disabled={true}>
        <Trans>DEPRECATED</Trans>
      </Button>
    </div>
  )
}

export default LaunchTradeButton
