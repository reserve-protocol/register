import { Trans } from '@lingui/macro'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import CopyValue from '@/components/ui/copy-value'
import GoTo from '@/components/ui/go-to'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import TokenLogo from 'components/icons/TokenLogo'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom } from 'state/atoms'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import {
  CollateralDetail,
  rTokenCollateralDetailedAtom,
} from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { PROTOCOL_DOCS } from '@/utils/constants'

interface DetailedCollateralWithMeta extends CollateralDetail {
  website?: string
  description: string
  addresses: { label: string; address: string }[]
}

const backingTypeAtom = atom('total')
const backingDetailAtom = atom((get) => {
  const collaterals = get(rTokenCollateralDetailedAtom)
  const metadata = get(collateralsMetadataAtom)
  const chainId = get(chainIdAtom)

  if (!collaterals) {
    return null
  }

  return collaterals.map((c) => {
    const meta = metadata?.[c.symbol.toLowerCase().replace('-vault', '')]
    // TODO: Define multitoken case
    const token = meta?.underlying?.[0]
    const addresses = [{ label: 'Collateral', address: c.address }]

    if (token && token.addresses[chainId]) {
      addresses.push({ label: 'Token', address: token.addresses[chainId] })
    }

    return {
      ...c,
      website: token?.website,
      description: meta?.description ?? '',
      addresses,
    }
  }) as DetailedCollateralWithMeta[]
})

const CollateralDetails = ({
  collateral,
}: {
  collateral: DetailedCollateralWithMeta
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [expanded, setExpanded] = useState(false)
  const backingType = useAtomValue(backingTypeAtom)

  return (
    <div
      className={cn(
        'font-semibold relative items-center border-b last:border-b-0',
        expanded ? 'border-input' : 'border-border'
      )}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr_1fr] cursor-pointer hover:sm:bg-muted p-3 sm:p-4"
      >
        <div className="flex items-center">
          <TokenLogo symbol={collateral.symbol} />
          <span className="ml-2 text-primary">
            {collateral.distribution.toFixed(2)}%
          </span>
          <span className="ml-2">{collateral.displayName}</span>
        </div>
        <div>
          <span className="font-semibold sm:hidden">Yield: </span>
          <span>{collateral.yield.toFixed(2)}%</span>
        </div>

        <div className="flex flex-wrap">
          <span className="mr-1 font-semibold sm:hidden">Value:</span>
          {!!collateral.valueTarget && !!collateral.valueSingleTarget && (
            <span className="mr-2 whitespace-nowrap">
              {formatCurrency(
                backingType === 'total'
                  ? collateral.valueTarget
                  : collateral.valueSingleTarget
              )}{' '}
              {collateral.targetUnit}
            </span>
          )}
          <span
            className={
              collateral.valueTarget ? 'text-legend font-normal text-sm' : ''
            }
          >
            {!!collateral.valueTarget && '('}$
            {formatCurrency(
              backingType === 'total'
                ? collateral.valueUsd
                : collateral.valueSingleUsd
            )}
            {!!collateral.valueTarget && ')'}
          </span>
        </div>

        <div className="text-right absolute sm:relative top-[68px] sm:top-0 right-5 sm:right-0 flex items-center justify-end">
          <ChevronDown size={16} />
        </div>
      </div>
      {!!expanded && (
        <div className="mt-3 font-normal px-3 sm:px-4 pb-3 sm:pb-4">
          <p>{collateral.description}</p>
          <div className="mt-3 flex items-center flex-wrap">
            <Button
              className="mr-3"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                window.open(`${PROTOCOL_DOCS}introduction/`, '_blank')
              }}
            >
              <div className="flex items-center">
                <HiperlinkIcon />
                <span className="ml-2">Docs</span>
              </div>
            </Button>
            {!!collateral.website && (
              <Button
                className="mr-3 border-2"
                size="sm"
                variant="outline"
                onClick={() => window.open(collateral.website, '_blank')}
              >
                <div className="flex items-center">
                  <HiperlinkIcon />
                  <span className="ml-2">Website</span>
                </div>
              </Button>
            )}
            <div className="hidden sm:block w-px h-6 bg-border mr-3" />
            <div className="flex items-center basis-full sm:basis-auto mt-3 sm:mt-0">
              <span className="mr-2 text-legend">
                {shortenAddress(collateral.address)}
              </span>
              <CopyValue mr={1} ml="auto" value={collateral.address} />
              <GoTo
                style={{ position: 'relative', top: '2px' }}
                href={getExplorerLink(
                  collateral.address,
                  chainId,
                  ExplorerDataType.TOKEN
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CollateralList = () => {
  const collaterals = useAtomValue(backingDetailAtom)

  const sortedCollaterals = useMemo(() => {
    return collaterals?.sort((a, b) => b.distribution - a.distribution)
  }, [collaterals])

  if (!sortedCollaterals) {
    return (
      <div className="px-4 mb-3">
        <Skeleton count={3} height={66} />
      </div>
    )
  }

  return (
    <div>
      {sortedCollaterals?.map((collateral) => (
        <CollateralDetails key={collateral.address} collateral={collateral} />
      ))}
    </div>
  )
}

const Header = () => {
  const [backingType, setBackingType] = useAtom(backingTypeAtom)
  const rToken = useRToken()

  const backingOptions = useMemo(
    () => [
      { key: 'total', label: 'Total backing' },
      { key: 'unit', label: `1 ${rToken?.symbol}` },
    ],
    [rToken]
  )

  return (
    <div className="flex items-center p-3 sm:p-4 border-b border-border flex-wrap">
      <CollaterizationIcon width={20} height={20} />
      <span className="ml-2 mr-auto text-xl ">
        <Trans>Collateral Exposure</Trans>
      </span>
      <TabMenu
        mt={[2, 0]}
        active={backingType}
        items={backingOptions}
        small
        background="border"
        onMenuChange={setBackingType}
      />
    </div>
  )
}

const CollateralExposure = () => {
  return (
    <div className="h-fit bg-card w-full rounded-2xl overflow-hidden">
      <Header />
      <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr] py-2.5 px-4 text-legend text-sm">
        <span>Token</span>
        <span>Yield</span>
        <span>Value</span>
        <span className="text-right">Detail</span>
      </div>
      <CollateralList />
    </div>
  )
}

export default CollateralExposure
