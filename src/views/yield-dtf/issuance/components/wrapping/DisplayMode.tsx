import { Trans } from '@lingui/macro'
import { useAtom } from 'jotai'

import useRToken from 'hooks/useRToken'
import { pluginsDisplayModeAtom } from './atoms'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  className?: string
}

const DisplayMode = ({ className }: Props) => {
  const rToken = useRToken()
  const [displayMode, setDisplayMode] = useAtom(pluginsDisplayModeAtom)

  return (
    <div className={`flex items-center mx-6 ${className ?? ''}`}>
      <span className="text-legend text-sm">
        <Trans>Display only {rToken?.symbol} related collaterals</Trans>
      </span>
      <div className="ml-auto">
        <label>
          <Checkbox
            checked={displayMode}
            onCheckedChange={() => setDisplayMode(!displayMode)}
          />
        </label>
      </div>
    </div>
  )
}

export default DisplayMode
