import { Trans } from '@lingui/macro'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Zap as ZapIcon } from 'lucide-react'

const ZapToggle = ({
  zapEnabled,
  setZapEnabled,
}: {
  zapEnabled: boolean
  setZapEnabled: (value: boolean) => void
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 mt-2 sm:mt-0',
        zapEnabled ? 'mb-1 sm:mb-2' : 'mb-1 sm:mb-4 border rounded-xl'
      )}
    >
      <div className="flex items-center">
        <ZapIcon size={18} />
        <span className="ml-2">
          <Trans>Turn on Zaps to mint using 1 asset</Trans>
        </span>
      </div>

      <Switch checked={zapEnabled} onCheckedChange={setZapEnabled} />
    </div>
  )
}

export default ZapToggle
