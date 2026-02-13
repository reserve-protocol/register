import AlertIcon from 'components/icons/AlertIcon'
import { useAtomValue } from 'jotai'
import { isRTokenMintEnabled } from 'state/geolocation/atoms'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

const DisabledByGeolocationMessage = ({ className }: Props) => {
  const isEnabled = useAtomValue(isRTokenMintEnabled)

  if (isEnabled.loading || isEnabled.value) {
    return null
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <AlertIcon />
      <span className="text-warning">This feature is not available</span>
    </div>
  )
}

export default DisabledByGeolocationMessage
