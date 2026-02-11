import { Trans } from '@lingui/macro'
import GoTo from '@/components/ui/go-to'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { chainIdAtom, collateralYieldAtom } from 'state/atoms'
import { CollateralPlugin } from 'types'
import { formatPercentage, parseDuration } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Collateral } from '../atoms'
import { collateralDisplay } from 'utils/constants'

interface PluginItemProps {
  data: CollateralPlugin | Collateral
  selected?: boolean
  onCheck(address: string): void
  className?: string
}

const PluginInfo = ({ data }: { data: CollateralPlugin }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <>
      <Separator className="mt-2" />
      <div className="flex items-center ml-0 mt-3 text-xs">
        <div className="mr-4">
          <span className="text-legend">
            <Trans>Collateral token</Trans>
          </span>
          <a
            href={getExplorerLink(
              data.underlyingAddress || data.erc20,
              chainId,
              ExplorerDataType.TOKEN
            )}
            target="_blank"
            rel="noreferrer"
            className="block hover:underline"
          >
            {data.collateralToken || data.underlyingToken || data.symbol}
          </a>
        </div>
        <div className="mr-4">
          <span className="text-legend">
            <Trans>Decimals</Trans>
          </span>
          <span className="block">{data.decimals}</span>
        </div>
        <div className="mr-4">
          <span className="text-legend">
            <Trans>Default delay</Trans>
          </span>
          <span className="block">
            {parseDuration(+data.delayUntilDefault)}
          </span>
        </div>
        <div>
          <span className="text-legend">
            <Trans>Version</Trans>
          </span>
          <span className="block">{data.version}</span>
        </div>
      </div>
    </>
  )
}

/**
 * View: Deploy -> Basket setup -> CollateralModal
 * Display collateral plugin item
 */
const PluginItem = ({ data, onCheck, selected, className }: PluginItemProps) => {
  const [isVisible, setVisible] = useState(false)
  const chainId = useAtomValue(chainIdAtom)
  const collateralYields = useAtomValue(collateralYieldAtom)
  const symbol = (data.symbol || (data as any).underlyingToken).replace(
    '-VAULT',
    ''
  )
  const displayName = collateralDisplay[symbol.toLowerCase()] ?? symbol

  return (
    <div className={className}>
      <div className="flex items-center">
        <TokenLogo width={24} symbol={data.symbol} />
        <div className="ml-3">
          <div className="flex items-center">
            <span>{displayName}</span>
            <GoTo
              className="ml-1"
              href={getExplorerLink(
                data.address,
                chainId,
                ExplorerDataType.ADDRESS
              )}
            />
          </div>

          <span className="text-xs block text-legend">
            <Trans>Target:</Trans> {data.targetName} | <Trans>Est. APY:</Trans>{' '}
            {formatPercentage(
              collateralYields[chainId]?.[symbol.toLowerCase()] || 0
            )}
          </span>
        </div>
        <div className="mx-auto" />
        <label className="flex items-center">
          <Checkbox
            className="cursor-pointer"
            defaultChecked={!!selected}
            onCheckedChange={() => {
              onCheck(data.address)
            }}
          />
        </label>
        <Button
          variant="none"
          size="icon"
          className="cursor-pointer -ml-1"
          onClick={() => setVisible(!isVisible)}
        >
          {isVisible ? (
            <ChevronUp color="#999999" />
          ) : (
            <ChevronDown color="#999999" />
          )}
        </Button>
      </div>
      {isVisible && <PluginInfo data={data as CollateralPlugin} />}
    </div>
  )
}

export default PluginItem
