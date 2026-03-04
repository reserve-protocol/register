import { Trans } from '@lingui/macro'
import { isWrappingAtom } from './atoms'
import { useAtom } from 'jotai'
import { cn } from '@/lib/utils'

const WrapTypeToggle = () => {
  const [wrapping, setWrapping] = useAtom(isWrappingAtom)

  return (
    <div
      className="flex items-center mx-6 cursor-pointer rounded-xl overflow-hidden p-1 border border-secondary flex-none mb-6"
    >
      <div
        className={cn(
          'flex-grow text-center rounded-lg p-1',
          wrapping ? 'bg-secondary' : ''
        )}
        onClick={() => setWrapping(true)}
      >
        <Trans>Wrap collaterals</Trans>
      </div>
      <div
        className={cn(
          'flex-grow text-center rounded-lg p-1',
          !wrapping ? 'bg-secondary' : ''
        )}
        onClick={() => setWrapping(false)}
      >
        <Trans>Unwrap collaterals</Trans>
      </div>
    </div>
  )
}

export default WrapTypeToggle
